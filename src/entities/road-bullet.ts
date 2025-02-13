import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import Utility from "../utility";

export class RoadBullet implements Entity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public position: BoundingBox
    ) {
        this.type = EntityType.Bullet;
        this.update();
    }

    update() {
        this.position.y--;

        if (this.position.y <= 1) {
            this.game.board.finishRoadBullet(this);
            this.game.deleteEntity(this);
        }

        const y = this.game.height - this.position.y;
        this.overwriteRoad(this.position.x, y);
        this.overwriteRoad(this.position.x, y + 1);
    }

    overwriteRoad(x: number, y: number) {
        const tile = this.game.map[y][x];
        if (!XQuest.powerUps.includes(tile)) {
            this.game.map[y] = Utility.setCharAt(this.game.map[y], x, "=");
        }
    }


    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "*");
    }

    unload() { }
}

