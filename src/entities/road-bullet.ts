import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { Point } from "../point";
import Utility from "../utility";

export class RoadBullet implements Entity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public position: Point
    ) {
        this.type = EntityType.Bullet;
    }

    update() {
        this.position.y--;

        if (this.position.y <= 1) {
            this.game.deleteEntity(this);
        }

        const y = this.game.height - this.position.y;
        this.game.map[y] = Utility.setCharAt(this.game.map[y], this.position.x, "=");
        this.game.map[y + 1] = Utility.setCharAt(this.game.map[y + 1], this.position.x, "=");
    }

    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "*");
    }

    unload() {

    }
}

