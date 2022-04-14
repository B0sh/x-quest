import { ColliderEntity, Entity, EntityType } from "./entity";
import { XQuest } from "../game";
import { SFX } from "../sfx";
import Utility from "../utility";
import { BoundingBox } from "../models/bounding-box";
import { CarrierShield } from "./carrier-shield";
import { Player } from "./player";
import { PlayerBullet } from "./player-bullet";
import { Spaceship } from "./spaceship";

export class Carrier implements ColliderEntity {
    type: EntityType;
    position: BoundingBox;
    movementDirection: number;
    linesActive: number;
    deathAnimation: number = 0;

    shields: CarrierShield[] = [];

    textSprite: string[] = [];
    // ░▒▓█
    // ╳
    text: string = 
"  _______,--------.___,-._@@@@@_.-'    " + '\n' + 
",'____,'   O  O  O    \\`-._`-'/'       " + '\n' + 
" `........---`````````---_   '-.._'-:  " + '\n' + 
"    `--_____,...   _____  \\``--.__\\__. " + '\n' + 
"            `._ `. \\____,  `.   \\'__/` " + '\n' + 
"               `-/______ `-  \\.   \\  ` " + '\n' + 
"                       `-.____./``\\.___" + '\n' + 
"                                   `--'";

    constructor (
        private game: XQuest
    ) {
        this.type = EntityType.Carrier;
        this.linesActive = 0;

        if (Utility.getRandomInt(0, 1) == 0) {
            this.movementDirection = 1;
            this.position = new BoundingBox(
                -38,
                1
            );
        }
        else {
            this.movementDirection = -1;
            this.position = new BoundingBox(
                this.game.width + 4,
                1
            );
        }

        this.createTextSprite();

        this.position.width = this.textSprite[0].length;
        this.position.height = this.textSprite.length;

        SFX.CarrierEngine.play();
    }

    spawnShields() {
        let positions: BoundingBox[], shield: CarrierShield;

        if (this.movementDirection == -1) {
            positions = [
                new BoundingBox(this.position.x + 7, this.position.y + 3, 5, 1),
                new BoundingBox(this.position.x + 18, this.position.y + 5, 6, 1),
                new BoundingBox(this.position.x + 26, this.position.y + 6, 4, 1)
            ];
        }
        else {
            positions = [
                new BoundingBox(this.position.x + this.position.width - 7 - 5, this.position.y + 3, 5, 1),
                new BoundingBox(this.position.x + this.position.width - 18 - 6, this.position.y + 5, 6, 1),
                new BoundingBox(this.position.x + this.position.width - 26 - 4, this.position.y + 6, 4, 1)
            ];
        }

        positions.forEach((position) => {
            shield = new CarrierShield(this.game, this, position);
            this.game.addEntity(shield);
            this.shields.push(shield);
        });
    }

    createTextSprite() {
        this.textSprite = this.text.split(/\r?\n/);
        if (this.movementDirection == 1) {
            this.textSprite.forEach((line, index) => {
                this.textSprite[index] = line.split('').reverse().join('');  
            });
        }
    }

    draw() {
        // for (let x = this.position.x; x < this.position.x + this.position.width; x++) {
        //     for (let y = this.position.y; y < this.position.y + this.position.height; y++) {
        //         this.game.renderEngine.renderObjectChar(x, y, "#");
        //     }
        // }
        
        let colors: string[] = ['#666', '#999', '#CCC', 'white'];
        let color: string;
        this.textSprite.forEach((line, index) => {
            const lineLength = line.length;
            line = line.replace(/^\s+/, '');
            const x = this.position.x + lineLength - line.length + this.game.renderEngine.roadOffsetX;
            const y = this.position.y + index + this.game.renderEngine.roadOffsetY; 
            line = line.replace(/\s+$/, '');

            if (this.deathAnimation > 0) {
                color = '#' + Math.floor(this.deathAnimation/3).toString().repeat(3);
            }
            else {
                color = colors[this.shields.length];
            }

            for (let i = 0; i < line.length; i++) {
                if (line[i] != '@') {
                    this.game.display.draw(x + i, y, line[i], color, null);
                }
            }
        });

        // let x, y;
        // for (let i = 0; i < 3; i++) {
        //     if (this.movementDirection == 1) {
        //         x = Utility.getRandomInt(-5, -2) + this.position.x + this.game.renderEngine.roadOffsetX;
        //     }
        //     else {
        //         x = Utility.getRandomInt(2, 5) + this.position.x +this.position.width + this.game.renderEngine.roadOffsetX;
        //     }
        //     y = Utility.getRandomInt(-5, -1) + this.position.y + this.game.renderEngine.roadOffsetY;

        //     this.game.display.draw(x, y, '*', 'white', null);
        // }
    }

    update() {
        this.linesActive++;
        if (this.deathAnimation > 0) {
            this.deathAnimation--;

            if (this.deathAnimation == 0) {
                this.game.deleteEntity(this);
                return;
            }
        }

        if (this.movementDirection == 1 && this.position.x > this.game.width) {
            this.game.deleteEntity(this);
            return;
        }

        if (this.movementDirection == -1 && this.position.x < 0 - this.position.width) {
            this.game.deleteEntity(this);
            return;
        }

        if (this.linesActive % 3 == 0) {
            this.position.x += this.movementDirection;
            this.shields.forEach((shield) => {
                shield.onCarrierMove(this.movementDirection);
            });
        }
    }

    unload() {
        SFX.CarrierEngine.stop();
    }

    unloadShield(shield: CarrierShield) {
        let index: number = this.shields.indexOf(shield);
        if (index > -1) {
            this.shields.splice(index, 1);
        }

        if (this.shields.length == 0) {
            this.deathAnimation = 20;
            SFX.CarrierDeath.play();
            SFX.CarrierEngine.stop();
            this.game.state.stats.ShipsDestroyed += 1;
        }
    }

    collide(entity: Entity) {
        if (entity instanceof PlayerBullet) {
            const char = this.getCharAt(entity.position.x, entity.position.y);
            if (char != ' ')
                this.game.deleteEntity(entity);
        }

        if (entity instanceof Spaceship) {
            const char = this.getCharAt(entity.position.x, entity.position.y);
            if (char != ' ')
                this.game.deleteEntity(entity);
        }
    }

    getCharAt(x: number, y: number) {
        x = x - this.position.x;
        y = y - this.position.y;
        if (this.textSprite[y])
            return this.textSprite[y][x];
        else
            return ' ';
    }
}