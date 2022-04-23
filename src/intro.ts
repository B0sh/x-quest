import { XQuest } from "./game";
import { SFX } from "./sfx";
import introFrames from '../intro/out.json';
import xZoomFrames from '../intro/out-x.json';
import { Timer } from "./timer";
import { Carrier } from "./entities/carrier";
import { Entity } from "./entities/entity";
import { Spaceship } from "./entities/spaceship";
import { BoundingBox } from "./models/bounding-box";
import { RenderEngine } from "./render-engine";
import { RNG } from "rot-js";
import { PlayerIntro } from "./entities/player-intro";

// https://www.youtube.com/watch?v=99uWHUQ-dC0

export class IntroCutscene {
    renderEngine: RenderEngine;

    running: boolean = false;
    tStart: number = 0;
    timer: Timer;
    stages: {
        time: number;
        interval?: number;
        lagging?: number;
        update?: Function;
        loop?: Function;
    }[];
    stage: number = 0;
    frame: number = 0;
    renderX: boolean = false;
    showEndingText: boolean = false;
    frameX: number = 0;
    lagging: number = 0;
    killScreenFrame: number = 0;
    wallsFrame: number = 0;

    entities: Entity[] = []; 

    
    constructor(
        private game: XQuest
    ) {
        this.renderEngine = new RenderEngine(this.game);
        this.stages = [
            {
                time: 0,
                lagging: 3,
                interval: 60
            },
            {
                time: 400,
                lagging: 2,
                interval: 70,
                // update: (() => {
                //     this.entities.push(new PlayerIntro(this.game))
                // }).bind(this),

            },
            {
                time: 700,
                lagging: 1,
                interval: 80
            },
            {
                time: 1000,
                lagging: 0,
                interval: 90 
            },
            {
                time: 1500,
                interval: 100 
            },
            {
                time: 1500,
                interval: 110 
            },
            {
                time: 2500,
                interval: 180
            },
            {
                time: 11500,
                interval: 120
            },
            { 
                time: 22500,
                interval: 80,
                loop: (() => {
                    if (this.frame % 3 == 0) {
                        this.frame -= 3;
                    }
                }).bind(this)
            },
            { 
                time: 23300,
                interval: 60,
                loop: (() => {
                    if (this.frame % 6 == 0) {
                        this.frame -= 6;
                    }
                }).bind(this)
            },
            { 
                time: 24000,
                interval: 80,
                lagging: 1,
                update: (() => {
                    this.frame -= 5;
                }).bind(this)
            },
            { 
                time: 24400,
                interval: 80,
                lagging: 2,
                update: (() => {
                    this.frame -= 5;
                }).bind(this)
            },
            { 
                time: 24800,
                interval: 80,
                lagging: 3,
                update: (() => {
                    this.frame -= 5;
                }).bind(this)
            },

            {
                time: 27000,
                update: (() => {
                    this.entities.push(new Spaceship(this.game, {
                        movementDirection: 1,
                        position: new BoundingBox(-4, 6, 3, 1)
                    }))
                }).bind(this)
            },
            {
                time: 31500,
                update: (() => {
                    this.entities.push(new Spaceship(this.game, {
                        movementDirection: -1,
                        position: new BoundingBox(this.game.width + 1, 5, 3, 1)
                    }))
                }).bind(this)
            },
            {
                time: 37000,
                update: (() => {
                    this.entities.push(new Carrier(this.game, true));
                }).bind(this),
            },

            {
                time: 42000,
                update: (() => {
                    this.entities.push(new Spaceship(this.game, {
                        movementDirection: -1,
                        position: new BoundingBox(this.game.width + 1, 5, 3, 1)
                    }))
                }).bind(this)
            },
            {
                time: 46000,
                update: (() => {
                    this.entities.push(new Spaceship(this.game, {
                        movementDirection: 1,
                        position: new BoundingBox(-4, 8, 3, 1)
                    }))
                }).bind(this)
            },
            {
                time: 55000,
                update: (() => {
                    RNG.setSeed(55000);
                }).bind(this),
                loop: (() => {
                    if (RNG.getUniformInt(1, 8) == 1) {
                        this.entities.push(new PlayerIntro(this.game));
                    }
                }).bind(this)
            },
            {
                time: 56500,
                update: (() => {
                    RNG.setSeed(56500);
                }).bind(this),
                loop: (() => {
                    if (RNG.getUniformInt(1, 6) == 1) {
                        this.entities.push(new PlayerIntro(this.game));
                    }
                }).bind(this)
            },
            {
                time: 58000,
                lagging: 4,
                update: (() => {
                    RNG.setSeed(58000);
                }).bind(this),
                loop: (() => {
                    if (RNG.getUniformInt(1, 3) == 1) {
                        this.entities.push(new PlayerIntro(this.game));
                    }
                }).bind(this)
            },
            {
                time: 60000,
                lagging: 5,
                update: (() => {
                    RNG.setSeed(60000);
                }).bind(this),
                loop: (() => {
                    if (RNG.getUniformInt(1, 5) == 1) {
                        this.entities.push(new PlayerIntro(this.game));
                    }
                }).bind(this)
            },
            {
                time: 62000,
                lagging: 6,
                update: (() => {
                    RNG.setSeed(62000);
                }).bind(this),
                loop: (() => {
                    if (RNG.getUniformInt(1, 7) == 1) {
                        this.entities.push(new PlayerIntro(this.game));
                    }
                }).bind(this)
            },
            {
                time: 65000,
                lagging: 7,
                update: (() => {

                }).bind(this)
            },
            {
                time: 66000,
                lagging: 8,
                update: (() => {
                    this.frameX = 1;
                    this.renderX = true;
                }).bind(this),

                loop: (() => {
                    if (this.frameX < xZoomFrames.frames.length) {
                        this.frameX++;
                    }
                }).bind(this)

            },
            {
                time: 75550,
                lagging: 2,
                update: (() => {
                    this.showEndingText = true;
                }).bind(this),
                loop: (() => {
                    this.wallsFrame++;
                }).bind(this)
            },
            {
                time: 80000,
                interval: 200,
                loop: (() => {
                    this.killScreenFrame ++;
                }).bind(this)
            },
            {
                time: 81000,
                // File end
                update: (() => {
                    this.stop();
                })
            }
        ];
    }

    start() {
        if (this.running) {
            this.stop();
            return;
        }

        SFX.Intro.play();
        this.running = true;
        this.tStart = performance.now();

        this.timer = new Timer(this.update.bind(this), 80);
        this.timer.start();

        const stageOne = this.stages[0];
        this.stage = 0;
        this.frame = stageOne.lagging;
        this.lagging = stageOne.lagging;
        this.timer.interval = stageOne.interval;
        this.showEndingText = false;
        this.renderX = false;
        this.killScreenFrame = 0;
        this.wallsFrame = 0;
        this.entities = [];
    }

    stop() {
        SFX.Intro.stop();
        this.running = false;
        const t = performance.now() - this.tStart;
        console.log(t, this.frame)

        this.timer.stop();
    }

    setFrame(frame: number) {
        this.frame = frame;
        this.render();
    }

    last: number = 0;
    update() {
        const stage = this.stages[this.stage];
        if (stage.loop) {
            stage.loop();
        }

        const nextStage = this.stages[this.stage + 1];
        const t = performance.now() - this.tStart;
        if (nextStage && nextStage.time <= t) {
            console.log(nextStage);
            if (nextStage.interval) {
                this.timer.interval = nextStage.interval;
            }

            if (nextStage.update) {
                nextStage.update();
            }

            if (nextStage.lagging) {
                this.lagging = nextStage.lagging;
            }

            this.stage += 1;
        }

        this.entities.forEach((entity) => {
            entity.update();
        })

        this.frame += 1;
        console.log("Frame:", this.frame, t);
    }

    render() {
        this.game.display.clear();
        for (let i = 0; i <= this.lagging; i++) {
            this.renderVideoFrame(introFrames, this.frame - i);
        }

        if (this.renderX) {
            this.renderVideoFrame(xZoomFrames, this.frameX, -2)
        }

        this.renderEntities();
        this.renderText();
        this.renderKillScreen();

    }

    renderVideoFrame(data: any, frame: number, offset: number = 0) {
        if (data.frames.length <= frame) {
            frame = data.frames.length - 1;
        }
        // const t = performance.now()
        data.frames[frame].forEach((line, y) => {
            let l = line.split("|");
            if (l.length == 1) {
                return;
            }

            const xOffset = Number(l[0]);
            l[1].split(" ").forEach((tile, x) => {
                if (tile == "")  {
                    return;
                }

                const character = tile.charAt(tile.length - 1);
                const color = tile.slice(0, -1);
                this.game.display.draw(x + xOffset + offset, y + 2, character, data.colors[color], null);
            });
        });
        // console.log(performance.now() - t)
    }

    renderEntities() {
        this.entities.forEach((entity) => {
            entity.draw();
        })
    }

    renderText() {
        if (this.showEndingText) {
            this.renderEngine.drawCenteredText(16, "X-Quest")
            this.renderEngine.drawCenteredText(18, "by Walden's World Games")
            this.renderEngine.drawCenteredText(20, "© 2014-2022")
            this.walls();
        }

        // const seconds = Math.floor((performance.now() - this.tStart) / 1000)
        // if (seconds % 6 == 4 || seconds % 6 == 5) {
            this.renderEngine.drawCenteredText(28, "Press Space to start.");
        // }
    }

    renderKillScreen() {
        if (this.killScreenFrame > 0) {
            RNG.setSeed(this.killScreenFrame);

            for (let y = 0; y < this.game.options.height; y++)
            {
                for (let x = 0; x < this.game.options.width; x++)
                {
                    const color = this.renderEngine.objectColors[RNG.getUniformInt(0, 8)];
                    if (RNG.getUniformInt(0, 100) < this.killScreenFrame * 6)
                    {
                        const char = String.fromCharCode(RNG.getUniformInt(20 , 255));
                        this.game.display.draw(x, y, char, color, null);
                    }
                    else 
                    {
                        // this.game.display.draw(x + this.roadOffsetX, y + this.roadOffsetY, " ", color, null);
                    }
                }
            }
        }

    }



    walls() {
        const h = this.game.options.height < this.wallsFrame ? this.game.options.height : this.wallsFrame;
        for (let y = 0; y < h; y++) {
            this.game.display.draw(0, y, "/", "#FFFFFF", null);
            this.game.display.draw(this.game.options.width - 1, y, "\\", "#FFFFFF", null);
        }
    }


}