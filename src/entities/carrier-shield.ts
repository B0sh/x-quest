import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { Spaceship } from "./spaceship";
import { Player } from "./player";
import { PlayerBullet } from "./player-bullet";
import { SFX } from "../sfx";
import { ScoreText } from "./score-text";
import { Carrier } from "./carrier";

export class CarrierShield implements ColliderEntity {
    type: EntityType;

    constructor(
        private game: XQuest,
        public carrier: Carrier,
        public position: BoundingBox
    ) {
        this.type = EntityType.CarrierShield;
    }

    update() {
    }

    onCarrierMove(dir: number) {
        this.position.x += dir;
    }

    collide(entity: Entity) {
        if (entity instanceof PlayerBullet) {
            SFX.Explosion.play();

            this.game.deleteEntity(this);

            this.carrier.unloadShield(this);

            if (this.carrier.shields.length == 0) {
                this.game.state.stats.Score += 40;
                const position: BoundingBox = new BoundingBox(this.position.x, this.position.y );
                const scoreText: ScoreText = new ScoreText(this.game, position, 40);
                this.game.addEntity(scoreText);
            }
        }
    }

    draw() {
        for (let i = 0; i < this.position.width; i++) {
            this.game.renderEngine.renderObjectChar(this.position.x + i, this.position.y, "_");
        }
    }

    unload() {
    }
}
