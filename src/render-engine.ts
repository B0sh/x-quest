import { XQuest } from "./game";
import Utility from "./utility";

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

        this.renderUI();
        this.renderRoad();
        this.renderObjects();
        this.renderText();
    }

    drawCenteredText(y, text) {
        const x = Math.floor(this.game.options.width / 2 - text.length / 2);
        this.game.display.drawText(x, y, text);
    }

    drawColoredText(x: number, y: number, text: string, fg: string, bg: string) {
        for (let i = 0; i < text.length; i++) {
            this.game.display.draw(x + i, y, text[i], fg, bg);
        }
    }

    addZeroPadding(num: number | string, size: number, padding: string = '0') {
        let str: string = (num ?? "").toString();
        while (str.length < size) {
            str = padding + str;
        }
        return str;
    }

    renderUI() {
        const color = this.objectColors[(this.game.state.displayLevel - 1) % 9];

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
        this.drawColoredText(2, 2, this.addZeroPadding(this.game.state.stats?.Score, 6, "."), "#fff", null);

        this.game.display.drawText(16, 1, "High Score");
        this.game.display.drawText(16, 2, this.addZeroPadding(this.game.state.stats?.Score, 6, "."));

        for (let lives = 0; lives < this.game.state.lives; lives++) {
            this.game.display.draw(2 + lives, 4, "X", color, null);
        }

        this.drawColoredText(22, 4, "L=" + this.addZeroPadding(this.game.state.displayLevel, 2, "0"), "#f88", null);
    }

    renderRoad() {
        const color = this.roadColors[(this.game.state.displayLevel - 1) % 9];

        let y = 0;
        for (let line of this.game.map.slice().reverse()) {
            y ++;

            line = Utility.replaceAll('`', this.roadChar, line);
            line = Utility.replaceAll('%', this.endZoneChar, line);
            line = Utility.replaceAll('@', ' ', line);

            for (let x = 0; x < line.length; x++) {
                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }
    }

    renderObjects() {
        const color = this.objectColors[(this.game.state.displayLevel - 1) % 9];
        const powerUps = [ "P", "W", "M", "I", "D" ];

        let y = 0;
        for (let line of this.game.map.slice().reverse()) {
            y ++;
            for (let x = 0; x < line.length; x++) {
                if (powerUps.includes(line[x]))
                this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, line[x], color, null);
            }
        }

        for (let i = 0; i < this.game.Bullet.length ; i++ ) {
            this.game.display.draw(this.game.Bullet[i].x + this.roadOffsetX, this.game.Bullet[i].y + this.roadOffsetY, "^", color, null);
        }

        for (let i = 0 ; i < this.game.Spaceship.Bullet.length ; i++ ) {
            this.game.display.draw(this.game.Spaceship.Bullet[i].x + this.roadOffsetX, this.game.Spaceship.Bullet[i].y + this.roadOffsetY, "v", color, null);
        }

        this.game.display.draw(this.game.PlayerX + this.roadOffsetX, 19 + this.roadOffsetY, "X", color, null);

        if (this.game.Spaceship && this.game.Spaceship.exists) {
            this.game.display.draw(this.game.Spaceship.x,  + this.roadOffsetX  this.game.Spaceship.y + this.roadOffsetY, this.game.Spaceship.display[0], color, null);
            this.game.display.draw(this.game.Spaceship.x+1 + this.roadOffsetX, this.game.Spaceship.y + this.roadOffsetY, this.game.Spaceship.display[1], color, null);
            this.game.display.draw(this.game.Spaceship.x+2 + this.roadOffsetX, this.game.Spaceship.y + this.roadOffsetY, this.game.Spaceship.display[2], color, null);
        }
    }

    renderText() {

                // if (Text != false) {
                //     for (let i=0;i<Text.length;i++) {
                //         if (Text[i].y == y)
                //             Line = Text[i].text.substr(0,Game.LineSize);
                //     }
                // }
    }

    renderKillScreenArtifacts() {
        const toY = this.game.state.displayLevel - 59;
        const color = this.roadColors[this.game.state.displayLevel % 9];

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
        //     Text[Text.length] = {y: 11, text: "@Level@"+(63-Game.state.displayLevel)+"@" };
        //     // Text[10] = {y: 10, text: "" + dashTimer + "@@@@@@@@@@@@@@@@@@@@@"};
        //     Text[Text.length] = {y: 9, text: "@Press Space@" };
        //     Text[Text.length] = {y: 8, text: "@to continue@" };
        // }
    }
}