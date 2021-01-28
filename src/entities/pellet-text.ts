import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { Point } from "../point";

export class PelletText implements Entity {
    type: EntityType;
    animationFrames: number;
    position: Point;

    constructor(
        private game: XQuest,
        public score: number
    ) {
        this.type = EntityType.PelletText;
        this.animationFrames = 0;
    }

    update() {
        this.animationFrames++;
        if (this.animationFrames == 10) {
            this.game.deleteEntity(this);
        }
    }

    draw() {
        if (this.game.playerPosition.x + 6 > this.game.width) {
            this.position = new Point(
                this.game.playerPosition.x - this.score.toString().length - 4,
                this.game.playerPosition.y
            );
        }
        else {
            this.position = new Point(
                this.game.playerPosition.x + 4,
                this.game.playerPosition.y
            );
        }

        let x = this.position.x + this.game.renderEngine.roadOffsetX;
        let y = this.position.y + this.game.renderEngine.roadOffsetY;
        this.game.renderEngine.drawColoredText(x, y, "+" + this.score, null, null);
    }

    unload() { }
}
