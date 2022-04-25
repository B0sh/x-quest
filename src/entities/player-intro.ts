import { RNG } from "rot-js";
import { XQuest } from "../game";
import { BoundingBox } from "../models/bounding-box";
import { Entity, EntityType } from "./entity";

export class PlayerIntro implements Entity {
    type: EntityType;
    position: BoundingBox

    constructor(
        private game: XQuest
    ) {
        this.type = EntityType.Player;
        this.position = new BoundingBox(RNG.getUniformInt(3, 26), 0, 1, 1)
    }

    update() {
        this.position.y ++;
    }

    draw() {
        if (this.position.y < 26) {
            const color = this.game.renderEngine.objectColors[(this.game.state.level - 1) % 9];
            this.game.renderEngine.drawColoredText(this.position.x, this.position.y, "X", color, null);
        }
    }

    unload() { }
}