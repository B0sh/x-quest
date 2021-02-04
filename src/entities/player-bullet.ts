import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { SFX } from "../sfx";
import { Spaceship } from "./spaceship";
import { SpaceshipBullet } from "./spaceship-bullet";
import Utility from "../utility";
import { Carrier } from "./carrier";
import { DebugBox } from "./debug-box";

export class PlayerBullet implements ColliderEntity {
    type: EntityType;
    collider: boolean = true;

    constructor(
        private game: XQuest,
        public position: BoundingBox
    ) {
        this.type = EntityType.Bullet;
        this.position.height = 2;
    }

    update() {
        this.position.y--;

        if (this.position.y <= 0) {
            this.game.deleteEntity(this);
        }
    }
    
    collide(entity: Entity) {
        if (entity instanceof DebugBox || entity instanceof SpaceshipBullet || entity instanceof Spaceship) {
            this.game.deleteEntity(this);
        }
    }

    draw() {
        // for (let x = this.position.x; x < this.position.x + this.position.width; x++) {
        //     for (let y = this.position.y; y < this.position.y + this.position.height; y++) {
        //         this.game.renderEngine.renderObjectChar(x, y, "*");
        //     }
        // }

        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "^");
    }

    unload() {

    }
}

