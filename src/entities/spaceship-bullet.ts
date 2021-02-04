import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { Spaceship } from "./spaceship";
import { Player } from "./player";
import { PlayerBullet } from "./player-bullet";
import { SFX } from "../sfx";

export class SpaceshipBullet implements ColliderEntity {
    type: EntityType;
    isHit: boolean = false;
    animationFrames: number;

    constructor(
        private game: XQuest,
        public spaceship: Spaceship,
        public position: BoundingBox
    ) {
        this.type = EntityType.Bullet;
        this.animationFrames = 0;
        this.position.height = 1;
    }

    update() {
        if (this.isHit) {
            this.animationFrames++;
            if (this.animationFrames == 10) {
                this.game.deleteEntity(this);
            }
            return;
        }

        this.position.y++;

        if (this.position.y == this.game.height + 2) {
            this.game.deleteEntity(this);
        }

        // if (this.position.equals(this.game.playerPosition) && this.game.state.invincible == 0) {
        if (this.position.equals(this.game.playerPosition)) {
            this.game.deleteEntity(this);
            this.game.over('Spaceship');
        }
    }

    collide(entity: Entity) {
        if (this.isHit) 
            return;

        if (entity instanceof Spaceship) {
            this.game.deleteEntity(this);
        }

        if (entity instanceof PlayerBullet) {
            this.game.state.stats.Score += 3;
            this.game.state.stats.ShotsDestroyed += 1; 
            SFX.Explosion.play()
            this.isHit = true;
        }
    }

    draw() {
        if (this.isHit) {
            let x = this.position.x + this.game.renderEngine.roadOffsetX;
            let y = this.position.y + this.game.renderEngine.roadOffsetY;
            this.game.renderEngine.drawColoredText(x, y, "+3", null, null);
            return;
        }

        for (let x = this.position.x; x < this.position.x + this.position.width; x++) {
            for (let y = this.position.y; y < this.position.y + this.position.height; y++) {
                this.game.renderEngine.renderObjectChar(x, y, "*");
            }
        }

        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "v");


    }

    unload() {
        this.spaceship.unloadBullet(this);
    }
}
