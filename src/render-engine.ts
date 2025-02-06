import { Color, RNG } from "rot-js";
import { XQuest } from "./game";
import Utility from "./utility";

export interface OverlayText {
    x?: number;
    y: number;
    text: string;
    centered?: boolean;
    color?: string;
}

export class RenderEngine {
    roadColors: string[] = [ "#2196f3", "#40bfb5", "#40cf5f", "#D9D170", "#bf8e40", "#bf4040", "#bf408a", "#B4009E", "#ea4a3e" ];
    roadColorsAlt: any[] = [ ];
    objectColors: string[] = [ "#eeff25", "#bf404a", "#c5b84c", "#7F86E8", "#4071bf", "#40bfbf", "#40bf75", "#9ebf40", "#15b5c1" ];

    selectedPhrase: string;
    positivePhrases: string[] = [
        "Good Luck!", "Having fun yet?", "Have fun!", "Kill 'em", "You can do it!",
        "Run run run", "Don't die", "Stay on the road", "Stay positive", "I'm gonna do an internet!",
        "The time has come", "Your quest begins", "pow pow kachow", "pop click woosh", "Exhilaration",
        "You are an X", "You go on a quest", "Do well", "chicka chic pow", "Precision", "Craftsmanship", "pew pew"
    ];

    roadChar: string = String.fromCharCode(0x2502);
    endZoneChar: string = '.';

    roadOffsetX: number = 3;
    roadOffsetY: number = 5;
    restartAnimationSteps: number = 0;

    constructor(private game: XQuest) {
        const grey: any = [ 180, 180, 180 ];
        this.roadColors.forEach((c: string, index) => {
            const color = Color.fromString(c);
            this.roadColorsAlt[index] = Color.toHex(Color.multiply(color, grey));
        });
    }

    render() {
        this.game.display.clear();

        if (this.game.Active || this.game.Finished) {
            this.renderRoad();
            this.renderTextBehindObjects();
            this.renderObjects();
        }

        if (this.game.state.isKillScreen() || this.game.Crashed) {
            this.renderKillScreenArtifacts();
        }

        this.renderUI();
        this.renderText();
    }

    drawCenteredText(y: number, text: string, fg: string | null = null, bg: string | null = null) {
        const x = Math.floor(this.game.options.width / 2 - text?.length / 2);
        this.drawColoredText(x, y, text, fg, bg);
    }

    drawColoredText(x: number, y: number, text: string, fg: string | null, bg: string | null) {
        for (let i = 0; i < text.length; i++) {
            this.game.display.draw(x + i, y, text[i], fg, bg);
        }
    }

    renderObjectChar(x: number, y: number, char: string) {
        const color = this.objectColors[(this.game.state.level - 1) % 9];
        this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, char, color, null);
    }

    renderUI() {
        const roadColor = this.roadColors[((this.game.state.level ?? 1) - 1) % 9];
        const objectColor = this.objectColors[((this.game.state.level ?? 1) - 1) % 9];

        for (let y = 0; y < this.game.options.height; y++) {
            this.game.display.draw(0, y, "/", "#FFFFFF", null);
            this.game.display.draw(this.game.options.width - 1, y, "\\", "#FFFFFF", null);
        }

        this.drawCenteredText(0, 'X-Quest v' + XQuest.version, "#FFF");

        const score = this.game.state.stats?.Score;
        const currentRecord = this.game.state.highScore;
        this.drawColoredText(2, 1, "Score", null, null);
        this.drawColoredText(2, 2, Utility.padStart(score, 6, "."), "#fff", null);

        this.game.display.drawText(16, 1, "High Score");
        if (currentRecord > score)
            this.drawColoredText(16, 2, Utility.padStart(currentRecord, 6, "."), "#FFF", null);
        else
            this.drawColoredText(16, 2, Utility.padStart(score, 6, "."), "#FFF", null);

        for (let lives = 0; lives < this.game.state.lives; lives++) {
            this.game.display.draw(8 + lives, 4, "X", objectColor, null);
        }

        this.game.display.draw(22, 4, "/", null, null);
        this.game.display.draw(24, 4, this.game.state.power, objectColor, null);
        this.game.display.draw(26, 4, "/", null, null);

        this.drawColoredText(2, 4, "L=" + Utility.padStart(this.game.state.level, 2, "0"), roadColor, null);
    }

    renderRoad() {
        let color: string = this.roadColors[(this.game.state.level - 1) % 9];

        let y: number = 0;
        for (let line of this.game.map.slice().reverse()) {
            y++;

            line = Utility.replaceAll('`', this.roadChar, line);
            line = Utility.replaceAll('%', this.endZoneChar, line);
            line = Utility.replaceAll('@', ' ', line);

            for (let x = 0; x < line.length; x++) {
                if (x % 2 == 0 || line[x] == this.endZoneChar) {
                    color = this.roadColors[(this.game.state.level - 1) % 9];
                }
                else {
                    color = this.roadColorsAlt[(this.game.state.level - 1) % 9];
                }

                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }
    }

    renderObjects() {
        const color = this.objectColors[(this.game.state.level - 1) % 9];

        let y = 0;
        for (let line of this.game.map.slice().reverse()) {
            y ++;
            for (let x = 0; x < line.length; x++) {
                if (XQuest.powerUps.includes(line[x]))
                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }

        for (let entity of this.game.entities) {
            entity.draw();
        }

        let pX = this.game.playerPosition.x + this.roadOffsetX;
        let pY = this.game.playerPosition.y + this.roadOffsetY;
        this.game.display.draw(pX, pY, 'X', color, null);
        if (this.game.state.invincible > 0) {
            if (Math.floor((this.game.state.invincible - 1) / 5) % 2 == 1) {
                this.game.display.draw(pX + 2, pY, '/', color, null);
                this.game.display.draw(pX - 2, pY, '/', color, null);
            }
            else {
                this.game.display.draw(pX + 2, pY, '\\', color, null);
                this.game.display.draw(pX - 2, pY, '\\', color, null);
            }
        }
    }

    renderText() {
        const color = this.objectColors[(this.game.state.level - 1) % 9];

        if (this.game.Finished) {

            let percentDone: number = Math.min(1 - Math.floor((this.game.gameOverDelayUntil ?? 0) - performance.now()) / 4000, 1);
            let dashTimer: string = "-".repeat(percentDone * this.game.width);

            const overlayText: OverlayText[] = [
                { y: 13, centered: true, text: "Game Over" },
                { y: 15, centered: true, text: "X failed its quest.", color: 'white' },
                { x: 3, y: 16, text: Utility.padEnd(dashTimer, this.game.width, ' ') , color: 'white'},
            ];

            if (this.game.gameOverDelayUntil && this.game.gameOverDelayUntil < performance.now()) {
                overlayText.push({ y: 17, centered: true, text: "Press Space", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "to restart.", color: 'white' });
            }

            if (this.game.gameOverHighScore) {
                const rainbowColor = this.roadColors[Math.floor(performance.now() / 500) % 9];
                overlayText.push({ y: 21, centered: true, text: "High Score", color: rainbowColor });
                const score = this.game.state.stats.Score.toString();
                overlayText.push({ y: 22, centered: true, text: " " + score.padStart(8, ".") + " ", color: 'white' })
            }

            this.renderTextOverlay(overlayText);
            this.game.display.draw(5, 15, "X", color, null);
            return;
        }

        if (!this.game.state.loading && !this.game.Finished && !this.game.Active && !this.game.Crashed) {
            if (Math.floor(performance.now() / 1000) % 3 === 1 || Math.floor(performance.now() / 1000) % 3 === 2) {
                const overlayText: OverlayText[] = [
                    { centered: true, y: 15, text: "Press Space" },
                    { centered: true, y: 16, text: "to start." },
                ];

                this.renderTextOverlay(overlayText);
            }
            return;
        }

        if (this.game.Restarting) {
            this.restartAnimationSteps++;

            let lineCount: number = Math.floor(this.restartAnimationSteps / 8);
            let dashTimer: string = "-".repeat(lineCount);

            if (lineCount == this.game.width) {
                this.restartAnimationSteps = 0;
                this.game.restartLevel();
                return;
            }

            const overlayText: OverlayText[] = [
                { y: 15, centered: true, text: "X failed its quest.", color: 'white' },
                { x: 3, y: 16, text: Utility.padEnd(dashTimer, this.game.width, ' ') , color: 'white'},
                { y: 17, centered: true, text: "Please wait", color: 'white' },
                { y: 18, centered: true, text: "to respawn.", color: 'white' },
            ];

            this.renderTextOverlay(overlayText);
            this.game.display.draw(5, 15, "X", color, null);
        }

        if (this.game.Paused) {
            this.drawCenteredText(Math.floor(this.game.options.height/2) + 1, "-- PAUSED --", color, null);
        }

        if (this.game.state.levelLines < 51 && this.game.state.level == 1) {
            if (!this.selectedPhrase) {
                this.selectedPhrase = this.positivePhrases[Utility.getRandomInt(0, this.positivePhrases.length - 1)];
            }

            this.drawCenteredText(this.game.options.height - 1, this.selectedPhrase, color, null);
        }
        else {
            this.selectedPhrase = '';
        }

        let powerUpTextY = this.game.options.height - 1;
        if (this.game.state.invincible > 0) {
            const dashes: string = "-".repeat(Math.min(Math.ceil(this.game.state.invincible / 5), 10));
            this.drawColoredText(2, powerUpTextY, "Invincibilty    " + dashes, color, null);
            powerUpTextY--;
        }

        if (this.game.state.distortion > 0) {
            const dashes: string = "-".repeat(Math.min(Math.ceil((this.game.state.distortion) / 5), 10));
            this.drawColoredText(2, powerUpTextY, "Distortion      " + dashes, color, null);
            powerUpTextY--;
        }

        if (this.game.state.warp > 0) {
            const dashes: string = "-".repeat(Math.min(Math.ceil((this.game.state.warp) / 5), 10));
            this.drawColoredText(2, powerUpTextY, "Warp            " + dashes, color, null);
            powerUpTextY--;
        }

        if (this.game.state.multishot > 0 && powerUpTextY != this.game.options.height - 4) {
            const dashes: string = "-".repeat(Math.min(Math.ceil((this.game.state.multishot) / 5), 10));
            this.drawColoredText(2, powerUpTextY, "Multi-Shot      " + dashes, color, null);
            powerUpTextY--;
        }
 
    }

    renderTextBehindObjects() {
        if (this.game.state.levelLines >= this.game.board.getLevelLines(this.game.state.level) && !this.game.Restarting && !this.game.Finished) {
            let lineCount: number = Math.floor((this.game.state.levelLines - this.game.board.getLevelLines(this.game.state.level)) / 3);
            let dashTimer: string = "-".repeat(lineCount);

            if (lineCount == this.game.width) {
                this.game.nextLevel();
                return;
            }

            const overlayText: OverlayText[] = [
                { y: 14, centered: true, text: "", color: 'white' },
                { y: 15, centered: true, text: "Level " + this.game.state.level + " Clear", color: 'white' },
                { x: 3, y: 16, text: Utility.padEnd(dashTimer, this.game.width, ' ') , color: 'white'},
            ];

            if (this.game.state.level == 2) {
                overlayText.push({ y: 17, centered: true, text: "Look out for", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "R - Road Shot", color: 'white' });
            }
            else if (this.game.state.level == 5) {
                overlayText.push({ y: 17, centered: true, text: "Look out for", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "W - Warp", color: 'white' });
            }
            else if (this.game.state.level % 8 == 7) {
                overlayText.push({ y: 17, centered: true, text: "Look out for", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "Carrier Spaceship", color: 'white' });
            }
            else {
                overlayText.push({ y: 17, centered: true, text: "Press Space", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "to continue", color: 'white' });
            }
            this.game.renderEngine.renderTextOverlay(overlayText);
        }
    }

    renderTextOverlay(overlayText: OverlayText[]) {
        overlayText.forEach((text) => {
            let color: string;
            if (!text.color || text.color == "object") {
                color = this.objectColors[(this.game.state.level - 1) % 9];
            }
            else if (text.color == "road") {
                color = this.roadColors[(this.game.state.level - 1) % 9];
            }
            else {
                color = text.color;
            }

            if (text.centered) {
                this.drawCenteredText(text.y, text.text, color, null);
            }
            else {
                this.drawColoredText(text.x??0, text.y, text.text, color, null);
            }
        });
    }

    renderKillScreenArtifacts() {
        let toY: number;
        if (this.game.Crashed) {
            RNG.setSeed(Math.floor(this.game.frameCount / 20));
            toY = 30;
        } else {
            RNG.setSeed(Math.floor(this.game.state.lines / 4));
            toY = (this.game.state.level - 61.5) * 3
        }

        for (let y = 0; y < toY; y++)
        {
            for (let x = 0; x < this.game.options.width; x++)
            {
                const color = this.objectColors[RNG.getUniformInt(0, 8)];
                if (RNG.getUniformInt(0, 100) > 65)
                {
                    const char = String.fromCharCode(RNG.getUniformInt(20 , 255));
                    this.game.display.draw(x, y + this.roadOffsetY, char, color, null);
                }
                else 
                {
                    // this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, " ", color, null);
                }
            }
        }
    }
}