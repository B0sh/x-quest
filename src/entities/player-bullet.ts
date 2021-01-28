import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { Point } from "../point";
import { SFX } from "../sfx";
import { Spaceship } from "./spaceship";
import { SpaceshipBullet } from "./spaceship-bullet";
import Utility from "../utility";
import { Carrier } from "./carrier";

export class PlayerBullet implements Entity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public position: Point
    ) {
        this.type = EntityType.Bullet;
    }

    update() {
        this.position.y--;

        if (this.position.y <= 0) {
            this.game.deleteEntity(this);
        }

        this.game.entities.forEach((entity) => {
            if (entity instanceof Spaceship) {
                if (entity.position.y == this.position.y &&
                    Utility.contains(this.position.x, entity.position.x, entity.position.x + 2)) {
                    this.game.deleteEntity(this);
                    entity.shot();
                    this.game.state.stats.Score += 10;
                    this.game.state.stats.ShipsDestroyed += 1;
                    SFX.Explosion.play();
                }
            }

            if (entity instanceof SpaceshipBullet) {
                if (entity.position.x == this.position.x &&
                    Utility.contains(this.position.y, entity.position.y - 1, entity.position.y + 1)) {
                    this.game.deleteEntity(this);
                    entity.shot();
                    this.game.state.stats.Score += 3;
                    this.game.state.stats.ShotsDestroyed += 1; 
                    SFX.Explosion.play();
                }
            }

            if (entity instanceof Carrier) {
                if (entity.position.x == this.position.x &&
                    Utility.contains(this.position.y, entity.position.y - 1, entity.position.y + 1)) {
                    this.game.deleteEntity(this);
                    entity.shot();
                    // SFX.Explosion.play();
                }
            }
        });
    }

    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "^");
    }

    unload() {

    }
}

