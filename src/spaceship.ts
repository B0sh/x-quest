import { Entity, EntityType } from "./entity";
import { XQuest } from "./game";
import { Point } from "./point";
import { SFX } from "./sfx";
import { SpaceshipBullet } from "./spaceship-bullet";
import Utility from "./utility";

export class Spaceship implements Entity {
    position: Point;
    type: EntityType;
    isWinking: boolean;
    movementDirection: number;
    linesActive: number;
    bullet: SpaceshipBullet;

    constructor (
        private game: XQuest
    ) {
        this.type = EntityType.Spaceship;
        this.isWinking = Utility.getRandomInt(1, 24) == 1;
        this.linesActive = 0;

        if (Utility.getRandomInt(0, 1) == 0) {
            this.movementDirection = 1;
            this.position = new Point(
                -2,
                Utility.getRandomInt(1, 4)
            );
        }
        else {
            this.movementDirection = -1;
            this.position = new Point(
                this.game.LineSize + 2,
                Utility.getRandomInt(1, 4)
            );
        }
    }

    draw() {
        if (this.isWinking) {
            this.game.renderEngine.renderObjectChar(this.position.x + 0, this.position.y, "^");
            this.game.renderEngine.renderObjectChar(this.position.x + 1, this.position.y, "_");
            this.game.renderEngine.renderObjectChar(this.position.x + 2, this.position.y, "~");
        }
        else {
            this.game.renderEngine.renderObjectChar(this.position.x + 0, this.position.y, "<");
            this.game.renderEngine.renderObjectChar(this.position.x + 1, this.position.y, "_");
            this.game.renderEngine.renderObjectChar(this.position.x + 2, this.position.y, ">");
        }
    }

    update() {
        this.linesActive++;

        const flyAway: boolean = this.linesActive > 160;
        const clampXLeft = 3;
        const clampXRight = this.game.LineSize - 5;

        if (this.linesActive % 30 == 0)
            this.position.y++;

        if (this.linesActive % 2 == 0) {
            if (flyAway == false &&
                ((this.position.x >= clampXRight && this.movementDirection == 1) || 
                (this.position.x <= clampXLeft && this.movementDirection == -1))) {
                this.movementDirection *= -1;
            }

            this.position.x += this.movementDirection;
        }

        if (!this.bullet && !flyAway && Utility.getRandomInt(1, 4) == 1) {
            this.fireBullet();
        }

        if (this.position.x == -3 || this.position.x == this.game.LineSize + 3) {
            this.game.deleteEntity(this);
        }
    }

    unload() {

    }

    unloadBullet(bullet: SpaceshipBullet) {
        this.bullet = null;
    }

    fireBullet() {
        const bullet = new SpaceshipBullet(this.game, this);
        this.game.addEntity(bullet);
        this.bullet = bullet;
        SFX.Shoot.play();
    }
}