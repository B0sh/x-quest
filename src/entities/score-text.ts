import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";

export class ScoreText implements Entity {
    type: EntityType;

    animationFrames: number;

    constructor(
        private game: XQuest,
        public position: BoundingBox,
        public score: number,
    ) {
        this.type = EntityType.ScoreText;
        this.animationFrames = 0;
    }

    update() {
        this.animationFrames++;
        if (this.animationFrames == 10) {
            this.game.deleteEntity(this);
        }
    }

    draw() {
        let x = this.position.x + this.game.renderEngine.roadOffsetX;
        let y = this.position.y + this.game.renderEngine.roadOffsetY;
        this.game.renderEngine.drawColoredText(x, y, "+" + this.score, null, null);
    }

    unload() { }
}
