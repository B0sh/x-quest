import { Entity, EntityType } from "./entity";
import { XQuest } from "./game";
import { Point } from "./point";
import { Spaceship } from "./spaceship";

export class SpaceshipBullet implements Entity {
    type: EntityType;
    position: Point;

    constructor(
        private game: XQuest,
        public spaceship: Spaceship
    ) {
        this.type = EntityType.Bullet;
        this.position = new Point(spaceship.position.x + 1, spaceship.position.y)
    }

    update() {
        this.position.y++;

        if (this.position.y == this.game.GameHeight + 2) {
            this.game.deleteEntity(this);
        }

        if (this.position.equals(this.game.playerPosition) && this.game.state.invincible == 0) {
            this.game.deleteEntity(this);
            this.game.Over('Spaceship');
        }
    }

    draw() {
        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "v");
    }

    unload() {
        console.log("CALL UNLOAD BULLET")
        this.spaceship.unloadBullet(this);
    }
}
