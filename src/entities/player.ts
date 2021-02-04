import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import Utility from "../utility";
import { ColliderEntity, Entity, EntityType } from "./entity";

export class Player implements ColliderEntity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public position: BoundingBox
    ) {
        this.type = EntityType.Player;
    }

    update() { }

    collide(entity: Entity) { }

    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "X");
    }

    unload() { }
}