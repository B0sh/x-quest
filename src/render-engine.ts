import { XQuest } from "./game";
import Utility from "./utility";

export class RenderEngine {
    roadColors: string[] = [ "#2196f3", "#40bfb5", "#40bf6f", "#98bf40", "#bf8e40", "#bf4040", "#bf408a", "#6140bf", "#ea4a3e" ];
    objectColors: string[] = [ "#eeff25", "#bf404a", "#c5b84c", "#3a47b3", "#4071bf", "#40bfbf", "#40bf75", "#9ebf40", "#15b5c1" ];

    roadChar: string = '|';
    endZoneChar: string = '.';

    constructor(private game: XQuest) {
        
    }

    render() {
        if (this.game.state.isKillScreen()) {
            this.renderKillScreenArtifacts();
        }

        this.renderRoad();
        this.renderObjects();
        this.renderText();
    }

    renderRoad() {
        const color = this.roadColors[this.game.state.displayLevel % 9];

        for (let y = 20; y >= 0; y--) {
            let line = this.game.map[y];
            line = Utility.replaceAll('`', this.roadChar, line);
            line = Utility.replaceAll('%', this.endZoneChar, line);
            line = Utility.replaceAll('@', ' ', line);

            for (let x = 0; x < line.length; x++) {
                this.game.display.draw(x, y, line[x], color, null);
            }
        }
    }

    renderObjects() {
        const color = this.objectColors[this.game.state.displayLevel % 9];

        for (let i = 0; i < this.game.Bullet.length ; i++ ) {
            this.game.display.draw(this.game.Bullet[i].x, this.game.Bullet[i].y, "^", color, null);
        }

        for (let i = 0 ; i < this.game.Spaceship.Bullet.length ; i++ ) {
            this.game.display.draw(this.game.Spaceship.Bullet[i].x, this.game.Spaceship.Bullet[i].y, "v", color, null);
        }

        this.game.display.draw(this.game.PlayerX, 2, "X", color, null);

        if (this.game.Spaceship && this.game.Spaceship.exists) {
            this.game.display.draw(this.game.Spaceship.x,   this.game.Spaceship.y, this.game.Spaceship.display[0], color, null);
            this.game.display.draw(this.game.Spaceship.x+1, this.game.Spaceship.y, this.game.Spaceship.display[1], color, null);
            this.game.display.draw(this.game.Spaceship.x+2, this.game.Spaceship.y, this.game.Spaceship.display[2], color, null);
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