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

    roadChar: string = '|';
    endZoneChar: string = '.';

    roadOffsetX: number = 3;
    roadOffsetY: number = 5;

    constructor(private game: XQuest) {
        
    }

    render() {
        if (this.game.state.isKillScreen()) {
            this.renderKillScreenArtifacts();
        }

        if (this.game.Active) {
            this.renderRoad();
            this.renderObjects();
        }

        this.renderUI();
        this.renderText();
    }

    drawCenteredText(y: number, text: string, fg: string = null, bg: string = null) {
        const x = Math.floor(this.game.options.width / 2 - text.length / 2);
        this.drawColoredText(x, y, text, fg, bg);
    }

    drawColoredText(x: number, y: number, text: string, fg: string, bg: string) {
        for (let i = 0; i < text.length; i++) {
            this.game.display.draw(x + i, y, text[i], fg, bg);
        }
    }

    renderUI() {
        const roadColor = this.roadColors[(this.game.state.level - 1) % 9];
        const objectColor = this.objectColors[(this.game.state.level - 1) % 9];

        for (let y = 0; y < this.game.options.height; y++) {
            if (y == 0 || y == this.game.options.height - 1) {
                for (let x = 0; x < this.game.options.width; x++) {
                    // this.game.display.draw(x, y, "#", null, null);
                }
            }

            this.game.display.draw(0, y, "/", "#FFFFFF", null);
            this.game.display.draw(this.game.options.width - 1, y, "\\", "#FFFFFF", null);
        }

        this.drawCenteredText(0, 'X-Quest v' + this.game.version);

        this.drawColoredText(2, 1, "Score", "#ccf", null);
        this.drawColoredText(2, 2, Utility.padStart(this.game.state.stats?.Score, 6, "."), "#fff", null);

        this.game.display.drawText(16, 1, "High Score");
        this.game.display.drawText(16, 2, Utility.padStart(this.game.state.stats?.Score, 6, "."));

        for (let lives = 0; lives < this.game.state.lives; lives++) {
            this.game.display.draw(2 + lives, 4, "X", objectColor, null);
        }

        this.drawColoredText(22, 4, "L=" + Utility.padStart(this.game.state.level, 2, "0"), roadColor, null);
    }

    renderRoad() {
        const color = this.roadColors[(this.game.state.level - 1) % 9];

        let y = 0;
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
        const powerUps = [ "P", "W", "M", "I", "D" ];

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

        if (this.game.Paused) {
            this.drawCenteredText(Math.floor(this.game.options.height/2), "-- PAUSED --", color, null);
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
                color = text.color
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
        const toY = this.game.state.level - 59;
        const color = this.roadColors[this.game.state.level % 9];

        for (let y = 0; y <= toY; y++)
        {
            for (let x = 0; x <= 15; x++)
            {
                if (Utility.getRandomInt(0, 5) == 1)
                {
                    this.game.display.draw(x, y, String.fromCharCode(Utility.getRandomInt(20 , 255)), color, null);
                }
                else 
                {
                    this.game.display.draw(x, y, " ", color, null);
                }
            }
        }

        // if (Utility.getRandomInt(0, 2) == 1) {
        //     Text[Text.length] = {y: 12, text: "@COMPLETED:@" };
        //     Text[Text.length] = {y: 11, text: "@Level@"+(63-Game.state.level)+"@" };
        //     // Text[10] = {y: 10, text: "" + dashTimer + "@@@@@@@@@@@@@@@@@@@@@"};
        //     Text[Text.length] = {y: 9, text: "@Press Space@" };
        //     Text[Text.length] = {y: 8, text: "@to continue@" };
        // }
    }
}