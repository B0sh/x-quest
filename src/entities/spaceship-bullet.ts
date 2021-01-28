import { Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { Point } from "../point";
import { Spaceship } from "./spaceship";

export class SpaceshipBullet implements Entity {
    type: EntityType;
    position: Point;
    isHit: boolean;
    animationFrames: number;

    constructor(
        private game: XQuest,
        public spaceship: Spaceship
    ) {
        this.type = EntityType.Bullet;
        this.position = new Point(spaceship.position.x + 1, spaceship.position.y + 1)
        this.animationFrames = 0;
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

        if (this.position.equals(this.game.playerPosition) && this.game.state.invincible == 0) {
            this.game.deleteEntity(this);
            this.game.Over('Spaceship');
        }
    }

    draw() {
        if (this.isHit) {
            let x = this.position.x + this.game.renderEngine.roadOffsetX;
            let y = this.position.y + this.game.renderEngine.roadOffsetY;
            this.game.renderEngine.drawColoredText(x, y, "+3", null, null);
            return;
        }

        this.game.renderEngine.renderObjectChar(this.position.x, this.position.y, "v");
    }

    shot() {
        this.isHit = true;
    }

    unload() {
        this.spaceship.unloadBullet(this);
    }
}
