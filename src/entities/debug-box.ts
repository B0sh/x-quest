import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { SFX } from "../sfx";
import { SpaceshipBullet } from "./spaceship-bullet";
import Utility from "../utility";
import { PlayerBullet } from "./player-bullet";

export class DebugBox implements ColliderEntity {
    position: BoundingBox;
    type: EntityType;

    constructor (
        private game: XQuest
    ) {
        this.type = EntityType.Debug;
        this.position = new BoundingBox(
            0,
            2,
            24,
            2
        )
    }

    draw() {
        for (let x = this.position.x; x < this.position.x + this.position.width; x++) {
            for (let y = this.position.y; y < this.position.y + this.position.height; y++) {
                this.game.renderEngine.renderObjectChar(x, y, "#");
            }
        }
    }

    update() {

    }

    collide(entity: Entity) {
        if (entity instanceof PlayerBullet) {
            this.game.deleteEntity(this);
        }
    }

    unload() {

    }

}