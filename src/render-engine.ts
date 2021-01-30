import { RNG } from "rot-js";
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
    roadColors: string[] = [ "#2196f3", "#40bfb5", "#40bf6f", "#98bf40", "#bf8e40", "#bf4040", "#bf408a", "#6140bf", "#ea4a3e" ];
    objectColors: string[] = [ "#eeff25", "#bf404a", "#c5b84c", "#3a47b3", "#4071bf", "#40bfbf", "#40bf75", "#9ebf40", "#15b5c1" ];

    selectedPhrase: string;
    positivePhrases: string[] = [
        "Good Luck!", "Having fun yet?", "Have fun!", "Kill 'em", "You can do it!",
        "Run run run", "Don't die", "Stay on the road", "Stay positive", "I'm gonna do an internet!",
        "The time has come", "Your quest begins", "pow pow kachow", "pop click woosh", "Exhilaration",
        "You are an X", "You go on a quest", "Do well", "chicka chic pow", "Embody Luxury", "Precision", "Craftsmanship",
    ];

    roadChar: string = String.fromCharCode(0x2502);
    endZoneChar: string = '.';

    roadOffsetX: number = 3;
    roadOffsetY: number = 5;
    restartAnimationSteps: number = 0;

    constructor(private game: XQuest) {
        
    }

    render() {
        this.game.display.clear();

        if (this.game.Active || this.game.Finished) {
            this.renderRoad();
            this.renderTextBehindObjects();
            this.renderObjects();

            if (this.game.state.isKillScreen()) {
                this.renderKillScreenArtifacts();
            }
        }

        this.renderUI();
        this.renderText();
    }

    drawCenteredText(y: number, text: string, fg: string = null, bg: string = null) {
        const x = Math.floor(this.game.options.width / 2 - text?.length / 2);
        this.drawColoredText(x, y, text, fg, bg);
    }

    drawColoredText(x: number, y: number, text: string, fg: string, bg: string) {
        for (let i = 0; i < text.length; i++) {
            this.game.display.draw(x + i, y, text[i], fg, bg);
        }
    }

    renderUI() {
        const roadColor = this.roadColors[((this.game.state.level ?? 1) - 1) % 9];
        const objectColor = this.objectColors[((this.game.state.level ?? 1) - 1) % 9];

        for (let y = 0; y < this.game.options.height; y++) {
            this.game.display.draw(0, y, "/", "#FFFFFF", null);
            this.game.display.draw(this.game.options.width - 1, y, "\\", "#FFFFFF", null);
        }

        this.drawCenteredText(0, 'X-Quest v' + this.game.version);

        const score = this.game.state.stats?.Score;
        const currentRecord = this.game.state.currentHighScore();
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
        const color = this.roadColors[(this.game.state.level - 1) % 9];

        let y: number = 0;
        for (let line of this.game.map.slice().reverse()) {
            y++;

            line = Utility.replaceAll('`', this.roadChar, line);
            line = Utility.replaceAll('%', this.endZoneChar, line);
            line = Utility.replaceAll('@', ' ', line);

            for (let x = 0; x < line.length; x++) {
                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }
    }

    renderObjects() {
        const color = this.objectColors[(this.game.state.level - 1) % 9];
        const powerUps = [ "P", "W", "M", "I", "D", "R" ];

        let y = 0;
        for (let line of this.game.map.slice().reverse()) {
            y ++;
            for (let x = 0; x < line.length; x++) {
                if (powerUps.includes(line[x]))
                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }

        for (let entity of this.game.entities) {
            entity.draw();
        }

        this.game.display.draw(this.game.playerPosition.x + this.roadOffsetX, this.game.playerPosition.y + this.roadOffsetY, "X", color, null);
    }

    renderObjectChar(x: number, y: number, char: string) {
        const color = this.objectColors[(this.game.state.level - 1) % 9];
        this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, char, color, null);
    }

    renderText() {
        const color = this.objectColors[(this.game.state.level - 1) % 9];

        if (this.game.Finished) {
            const overlayText: OverlayText[] = [
                { centered: true, y:14, text:"Game Over" },
                { x: 2, y:15, text:"    Score: "+Utility.format(this.game.state.stats.Score)+"              " },
                { x: 2, y:16, text:"    Lines: "+Utility.format(this.game.state.stats.Lines)+"              " },
                { x: 2, y:17, text:"    Level: "+Utility.format(this.game.state.level)+"              " }
            ];
            this.renderTextOverlay(overlayText);
            return;
        }

        if (!this.game.Finished && !this.game.Active) {
            const overlayText: OverlayText[] = [
                { centered: true, y: 15, text: "Press Space" },
                { centered: true, y: 16, text: "to start." },
            ];
            this.renderTextOverlay(overlayText);
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
            this.drawCenteredText(Math.floor(this.game.options.height/2), "-- PAUSED --", color, null);
        }

        if (this.game.state.levelLines < 51 && this.game.state.level == 1) {
            if (!this.selectedPhrase) {
                this.selectedPhrase = this.positivePhrases[Utility.getRandomInt(0, this.positivePhrases.length - 1)];
            }

            this.drawCenteredText(this.game.options.height - 1, this.selectedPhrase, color, null);
        }
        else {
            this.selectedPhrase = null;
        }

        if (this.game.state.invincible > 0) {
            const dashes: string = "-".repeat(Math.ceil(this.game.state.invincible / 5));
            this.drawColoredText(2, this.game.options.height - 1, "Invincibilty    " + dashes, color, null);
        }

        if (this.game.state.distortion > 0) {
            const dashes: string = "-".repeat(Math.ceil((this.game.state.distortion) / 5));
            this.drawColoredText(2, this.game.options.height - 1, "Distortion      " + dashes, color, null);
        }

        if (this.game.state.warp > 0) {
            const dashes: string = "-".repeat(Math.ceil((this.game.state.warp) / 5));
            this.drawColoredText(2, this.game.options.height - 1, "Warp            " + dashes, color, null);
        }

        if (this.game.state.multishot > 0) {
            const dashes: string = "-".repeat(Math.ceil((this.game.state.multishot) / 5));
            this.drawColoredText(2, this.game.options.height - 1, "Multi-Shot      " + dashes, color, null);
        }
 
    }

    renderTextBehindObjects() {
        if (this.game.state.levelLines >= this.game.board.getLevelLines(this.game.state.level)) {
            let lineCount: number = Math.floor((this.game.state.levelLines - this.game.board.getLevelLines(this.game.state.level)) / 3);
            let dashTimer: string = "-".repeat(lineCount);

            if (lineCount == this.game.width) {
                this.game.nextLevel();
                return;
            }

            const overlayText: OverlayText[] = [
                { y: 14, centered: true, text: "COMPLETED", color: 'white' },
                { y: 15, centered: true, text: "Level " + this.game.state.level, color: 'white' },
                { x: 3, y: 16, text: Utility.padEnd(dashTimer, this.game.width, ' ') , color: 'white'},
            ];

            if (this.game.state.level == 3) {
                overlayText.push({ y: 17, centered: true, text: "Look out for", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "M - MultiShot", color: 'white' });
            }
            else if (this.game.state.level == 6) {
                overlayText.push({ y: 17, centered: true, text: "Look out for", color: 'white' });
                overlayText.push({ y: 18, centered: true, text: "W - Warp", color: 'white' });
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
        RNG.setSeed(Math.floor(this.game.state.stats.Lines / 4));

        const toY = (this.game.state.level - 61.5) * 3

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