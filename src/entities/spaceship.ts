import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { SFX } from "../sfx";
import { SpaceshipBullet } from "./spaceship-bullet";
import Utility from "../utility";
import { PlayerBullet } from "./player-bullet";
import { ScoreText } from "./score-text";

export class Spaceship implements ColliderEntity {
    position: BoundingBox;
    type: EntityType;
    isWinking: boolean;
    movementDirection: number;
    linesActive: number;
    bullets: SpaceshipBullet[] = [];

    constructor (
        private game: XQuest
    ) {
        this.type = EntityType.Spaceship;
        this.isWinking = Utility.getRandomInt(1, 36) == 1 && this.game.state.level > 4;
        this.linesActive = 0;

        if (Utility.getRandomInt(0, 1) == 0) {
            this.movementDirection = 1;
            this.position = new BoundingBox(-2, Utility.getRandomInt(1, 4), 3, 1);
        }
        else {
            this.movementDirection = -1;
            this.position = new BoundingBox(this.game.width + 2, Utility.getRandomInt(1, 4), 3, 1);
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
        const clampXRight = this.game.width - 5;
        const isTurning: boolean = ((this.position.x >= clampXRight && this.movementDirection == 1) || 
                (this.position.x <= clampXLeft && this.movementDirection == -1));
        const isInMiddle: boolean = (this.position.x <= clampXRight && this.position.x >= clampXLeft);

        if (this.linesActive % 30 == 0)
            this.position.y++;

        if (this.linesActive % 2 == 0) {
            if (!flyAway && isTurning) {
                this.movementDirection *= -1;
            }

            this.position.x += this.movementDirection;
        }

        if (this.bullets.length == 0 && !flyAway && isInMiddle && Utility.getRandomInt(1, 4) == 1) {
            this.fireBullet();
        }

        if (this.position.x == -3 || this.position.x == this.game.width + 3) {
            this.game.deleteEntity(this);
        }
    }

    collide(entity: Entity) {
        if (entity instanceof PlayerBullet) {
            this.game.state.stats.Score += 10;
            this.game.state.stats.ShipsDestroyed += 1;
            SFX.Explosion.play();
            const position: BoundingBox = new BoundingBox(this.position.x, this.position.y);
            const scoreText: ScoreText = new ScoreText(this.game, position, 10);
            this.game.addEntity(scoreText);
            this.game.deleteEntity(this);
        }
    }

    unload() {

    }

    unloadBullet(bullet: SpaceshipBullet) {
        let index: number = this.bullets.indexOf(bullet);
        if (index > -1) {
            this.bullets.splice(index, 1);
        }
    }

    fireBullet() {
        let position: BoundingBox, bullet: SpaceshipBullet;

        if (this.game.state.hasModifier('Matrix')) {
            position = new BoundingBox(this.position.x , this.position.y + 1);
            bullet = new SpaceshipBullet(this.game, this, position);
            this.game.addEntity(bullet);
            this.bullets.push(bullet);
            
            position = new BoundingBox(this.position.x + 1, this.position.y + 2);
            bullet = new SpaceshipBullet(this.game, this, position);
            this.game.addEntity(bullet);
            this.bullets.push(bullet);

            position = new BoundingBox(this.position.x + 2, this.position.y + 1);
            bullet = new SpaceshipBullet(this.game, this, position);
            this.game.addEntity(bullet);
            this.bullets.push(bullet);
        }
        else {
            position = new BoundingBox(this.position.x + 1, this.position.y + 1);
            bullet = new SpaceshipBullet(this.game, this, position);
            this.game.addEntity(bullet);
            this.bullets.push(bullet);
        }
        SFX.Shoot.play();
    }
}