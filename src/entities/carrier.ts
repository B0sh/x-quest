import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { Point } from "../point";
import { SFX } from "../sfx";
import Utility from "../utility";

export class Carrier implements Entity {
    position: Point;
    type: EntityType;
    isHit: boolean;
    movementDirection: number;
    linesActive: number;
    hitAnimationLines: number;

    textSprite: string[] = [
        '                    /~~~~~|',
        '               .__./\'\'\'\'\'\'|',
        '._____________/   |/^^^^^^^\\',
        '|             `==="\\_______/',
        '`.             .___/^^^^^^^^\\',
        '  `------------\'~~~\\________/',
        '                  `........\\',
        '                    `-------' 
    ];


    constructor (
        private game: XQuest
    ) {
        this.type = EntityType.Carrier;
        this.linesActive = 0;
        this.isHit = false;
        this.hitAnimationLines = 0;

        if (Utility.getRandomInt(0, 1) == 0) {
            this.movementDirection = 1;
            this.position = new Point(
                -30,
                8
            );
        }
        else {
            this.movementDirection = -1;
            this.position = new Point(
                this.game.width + 2,
                8
            );
        }
    }

    draw() {
        this.textSprite.forEach((line, index) => {
            const lineLength = line.length;
            line = line.trim();
            const x = this.position.x + lineLength - line.length;
            const y = this.position.y + index; 
            this.game.renderEngine.drawColoredText(x, y, line, 'white', null);
        });
    }

    update() {
        this.linesActive++;
        if (this.movementDirection == 1 && this.position.x > this.game.width) {
            this.game.deleteEntity(this);
            return;
        }

        if (this.movementDirection == -1 && this.position.x < -30) {
            this.game.deleteEntity(this);
            return;
        }

        if (this.linesActive % 2 == 0)
            this.position.x += this.movementDirection;
    }

    unload() {

    }

    shot() {
        // this.isHit = true;
    }
}