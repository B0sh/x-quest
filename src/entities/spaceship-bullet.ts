import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { Spaceship } from "./spaceship";
import { Player } from "./player";
import { PlayerBullet } from "./player-bullet";
import { SFX } from "../sfx";
import { ScoreText } from "./score-text";

export class SpaceshipBullet implements ColliderEntity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public spaceship: Spaceship,
        public position: BoundingBox
    ) {
        this.type = EntityType.Bullet;
        this.position.height = 1;
    }

    update() {
        this.position.y++;

        if (this.position.y == this.game.height + 2) {
            this.game.deleteEntity(this);
        }

        if (this.position.equals(this.game.playerPosition) && this.game.state.invincible == 0) {
            this.game.deleteEntity(this);
            this.game.over('Spaceship');
        }
    }

    collide(entity: Entity) {
        // if (entity instanceof Spaceship) {
        //     this.game.deleteEntity(this);
        // }

        if (entity instanceof PlayerBullet) {
            this.game.state.stats.Score += 3;
            this.game.state.stats.ShotsDestroyed += 1; 
            SFX.ExplosionBullet.play();
            const position: BoundingBox = new BoundingBox(this.position.x, this.position.y);
            const scoreText: ScoreText = new ScoreText(this.game, position, 3);
            this.game.addEntity(scoreText);
            this.game.deleteEntity(this);
        }

        if (entity instanceof SpaceshipBullet) {
            this.game.deleteEntity(this);
        }
    }

    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "v");
    }

    unload() {
        this.spaceship.unloadBullet(this);
    }
}
