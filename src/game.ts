import { SFX } from './sfx';
import Utility from './utility';
import { State } from './state';
import { DisplayOptions } from 'rot-js/lib/display/types';
import { Display } from 'rot-js';
import { RenderEngine } from './render-engine';
import { Board } from './board';
import { Point } from './point';
import { Entity, EntityType } from './entities/entity';
import { Spaceship } from './entities/spaceship';
import { PlayerBullet } from './entities/player-bullet';
import { PelletText } from './entities/pellet-text';
import { Howler } from 'howler';
import { Timer } from './timer';
import { RoadBullet } from './entities/road-bullet';
import { Carrier } from './entities/carrier';
import { Menu } from './menu';

var roadChar = '|';

export class XQuest {
    version: string = '1.4';

    display: Display;
    state: State;
    renderEngine: RenderEngine;
    board: Board;
    timer: Timer;
    menu: Menu;

    options: DisplayOptions = {
        width: 30,
        height: 30,
        fontSize: 20,
        fontStyle: "bold",
        fontFamily: 'monospace',
    } as DisplayOptions;
    width: number = 25;
    height: number = 22;

    messages: string[] = [];
    map: string[] = [];

    Active: boolean = false;
    Finished: boolean = false;
    Paused: boolean = false;
    Restarting: boolean = false;

    playerPosition: Point;
    BaseSpeed: number;
    CHEAT: boolean = false;
    CurrentTab = 1;
    BaseLine: string;


    entities: Entity[] = [];
    
    // TO REPLACE
    LineEntered: any[] = [];


    constructor() {
        this.display = new Display(this.options);
        this.state = new State(this);
        this.renderEngine = new RenderEngine(this);
        this.board = new Board(this);
        this.menu = new Menu(this);
    }

    init() {
        document.getElementsByClassName('TEMPGAMESPOT')[0].prepend(this.display.getContainer())
        this.menu.initTabEvents();
        this.renderLoop();
    }

    frameCount: number = 0;
    renderLoop() {
        this.frameCount++;
        this.renderEngine.render();

        const self = this;
        window.requestAnimationFrame(() => {
            self.renderLoop();
        });
    }

    addEntity(entity: Entity) {
        this.entities.push(entity);
    }

    deleteEntity(entity: Entity) {
        entity.unload();
        let index: number = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }


    fireBullet() {
        let bulletExists: boolean = false;
        this.entities.forEach((entity) => {
            if (entity instanceof PlayerBullet) {
                bulletExists = true;
            }
        });

        if (!this.Paused && this.Active && !bulletExists) {
            SFX.Shoot.play();
            this.state.stats.ShotsFired += 1;

            if (this.state.multishot == 0) {
                const bullet = new PlayerBullet(this, new Point(this.playerPosition.x, this.playerPosition.y));
                this.entities.push(bullet);
            } else {
                const bulletLeft = new PlayerBullet(this, new Point(this.playerPosition.x - 1, this.playerPosition.y));
                this.entities.push(bulletLeft);
                const bullet = new PlayerBullet(this, new Point(this.playerPosition.x, this.playerPosition.y - 1));
                this.entities.push(bullet);
                const bulletRight = new PlayerBullet(this, new Point(this.playerPosition.x + 1, this.playerPosition.y));
                this.entities.push(bulletRight);

                this.state.multishot = 0;
            }
        }
    }


    start() {
        if (this.Active == true) {
            if (this.state.levelLines > this.board.getLevelLines(this.state.level) - this.height) {
                this.nextLevel();
            }
            return;
        }

        this.entities = [];

        this.Active = true;
        this.Finished = false;
        this.Paused = false;
        this.state.warp = 0;
        this.state.invincible = 0;
        this.state.distortion = 0;
        this.state.multishot = 0
        this.state.level = 1;
        this.state.lives = 3;
        this.state.levelLines = 0;
        this.state.power = null;
        this.map = [];
        this.LineEntered = [];
        this.state.stats = {
            Score: 0,
            Lines: 0,
            ShipsDestroyed: 0,
            ShotsDestroyed: 0,
            Powerups: 0,
            Moves: 0,
            ShotsFired: 0,
            Time: 0,
            DeathAbyss: 0,
            DeathWall: 0,
            DeathShot: 0,
        };

        this.state.nextLevelClass = 1;

        /* Player spawns in the middle location */
        const mid = Math.floor((this.width - 1) / 2);
        this.playerPosition = new Point(mid, this.height - 1);

        this.board.generateStartingLines();

        /* If you're on the high score screen and a new game starts don't let it submit */
        if (this.CurrentTab == 6 || this.CurrentTab == 7) {
            this.menu.toggleTab(1);
        }

        /* Lets get this party started */
        this.startGameLoop(this.BaseSpeed);
        console.log('Game Started');
    }

    nextLevel() {
        this.state.nextLevelClass = this.state.level % 9 + 1;
        this.state.level++;
        this.state.levelLines = 0;

        this.state.warp = 0;
        this.state.invincible = 25;
        if (this.state.distortion != 0) {
            this.startGameLoop(this.BaseSpeed);
            this.state.distortion = 0;
        }

        if (this.state.isKillScreen()) {
            SFX.Killscreen.play();
        } else {
            SFX.LevelUp.play();
        }
    }

    restartLevel() {
        this.Restarting = false;
        this.startGameLoop(this.BaseSpeed);
                
        this.entities = [];
        this.state.levelLines = 0;
        this.state.warp = 0;
        this.state.invincible = 0;
        this.state.power = null;
        this.state.levelLines = 0;
        if (this.state.distortion != 0) {
            this.startGameLoop(this.BaseSpeed);
            this.state.distortion = 0;
        }

        const mid = Math.floor((this.width - 1) / 2);
        this.playerPosition = new Point(mid, this.height - 1);

        this.board.generateStartingLines();
    }

    move(direction): void {
        if (this.Active && !this.Paused && !this.Restarting) {
            switch(direction) {
                case 'right': direction = 1; break;
                case 'left': direction = -1; break;
            }

            var Tile2 = this.map[2].split('')[this.playerPosition.x];

            // if you don't have warp mode on the move is pretty simple
            if (this.state.warp == 0) {
                this.playerPosition.x += direction;
                if (this.playerPosition.x > this.width-1 || this.playerPosition.x < 0) {
                    this.Over('Wall');
                    return;
                }

            // warp power up checks to find the next available line
            //   and if it doesn't find one its a wall game over ofc
            } else {
                var foundPosition = false;
                while (!foundPosition) {
                    this.playerPosition.x += direction;
                    const tileUnderPlayer = this.map[3].split('')[this.playerPosition.x];

                    // only check whats above you becuse athats the area you are moving to
                    if (tileUnderPlayer == '`' || tileUnderPlayer == '%')
                        foundPosition = true;

                    if (this.playerPosition.x > this.width-1)
                    {
                        this.playerPosition.x = 0;
                    }
                    else if (this.playerPosition.x < 0) {
                        this.playerPosition.x = this.width-1;
                        // foundPosition = true;
                    }
                }
            }

            if (this.LineEntered[this.playerPosition.x] == 1 && Tile2 != '%') {
                this.LineEntered[this.playerPosition.x] = 2;
                this.state.stats.Score += 1;
                SFX.Score.play();
            } else {
                SFX.Noscore.play();
            }

            this.state.stats.Moves += 1;

            var Tile2 = this.map[2].split('')[this.playerPosition.x];
            var tileUnderPlayer = this.map[3].split('')[this.playerPosition.x];

            if (tileUnderPlayer == '@' &&  Tile2 == '@' && this.state.invincible == 0) {
                this.Over('Abyss');
            }
        }
    }

    gameLoop() {
        this.AddLine();

        this.state.stats.Time += this.BaseSpeed / 1000;

        /* Create lines by the player for scoring purposes */
        for (let x=0; x<this.width; x++) {
            if (this.map[3].charAt(x) == '@')
                this.LineEntered[x] = 0;
            else if (this.LineEntered[x] == 0)
                this.LineEntered[x] = 1;
        }

        var Tile = this.map[2].split('')[this.playerPosition.x];
        switch (Tile) {
            case '|': break;
            case roadChar: break;
            case 'P':
                SFX.Bonus.play();
                const score = (this.state.level*2)+2
                this.state.stats.Score += score;
                const pelletText = new PelletText(this, score);
                this.addEntity(pelletText);
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'I':
                SFX.Power.play();
                this.state.power = 'I';
                // this.state.invincible = 50;
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'W':
                SFX.Power.play();
                this.state.power = 'W';
                // this.state.warp = 40;
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'D':
                SFX.Power.play();
                this.state.power = 'D';
                // this.state.distortion = 25;
                // this.startGameLoop(this.BaseSpeed*2);
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'M':
                SFX.Power.play();
                this.state.power = 'M';
                // this.state.multishot = 1;
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'R':
                SFX.Power.play();
                this.state.power = 'R';
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            // nightmare mode wall tiles
            case '<':
            case '>':
                this.Over('Wall');
                return;
                break;
            case '@':
                if (this.state.invincible == 0) {
                    this.Over('Abyss');
                    return;
                }
                break;
        }

        /* Randomly generate spaceships every 100 lines at 1/4 chance */
        let spaceshipExists: boolean = false;
        this.entities.forEach((entity) => {
            if (entity.type == EntityType.Spaceship) {
                spaceshipExists = true;
            }
        });

        if (((1+this.state.stats.Lines) % 100 == 0 && Utility.getRandomInt(1, 4) == 1 && this.state.level >= 2) || this.state.stats.Lines+1 == 200)  {
            const spaceship = new Spaceship(this);
            this.entities.push(spaceship);
        }

        this.entities.forEach((entity) => {
            entity.update();
        });

        if (this.state.invincible != 0) {
            this.state.invincible -= 1;
        }
        if (this.state.warp != 0) {
            this.state.warp -= 1;
        }
        if (this.state.multishot != 0) {
        }
        if (this.state.distortion != 0) {
            this.state.distortion -= 1;
            if (this.state.distortion == 0) {
                this.startGameLoop(this.BaseSpeed);
            }
        }

        if (this.state.nextLevelClass != -1) {
            this.setLevelClass(this.state.nextLevelClass);
            this.state.nextLevelClass = -1;
        }
    }

    usePowerup() {
        switch (this.state.power) {
            case 'D':
                SFX.Power.play();
                this.startGameLoop(this.BaseSpeed*2);
                this.state.distortion = 25;
                this.state.stats.Powerups += 1;
                break;
            case 'W':
                SFX.Power.play();
                this.state.warp = 50;
                this.state.stats.Powerups += 1;
                break;
            case 'I':
                SFX.Power.play();
                this.state.invincible = 50;
                this.state.stats.Powerups += 1;
                break;
            case 'R':
                const bullet = new RoadBullet(this, new Point(this.playerPosition.x, this.playerPosition.y - 1));
                SFX.Shoot.play();
                this.entities.push(bullet);
                break;
        }
        this.state.power = null;
    }

    startGameLoop(speed: number) {
        console.log("START GAME LOOP");
        if (this.timer && this.timer.interval == speed) {
            this.timer.start();
        } else if (this.timer) {
            this.timer.stop();
            this.timer = new Timer(this.gameLoop.bind(this), speed);
            this.timer.start();
        } else {
            this.timer = new Timer(this.gameLoop.bind(this), speed);
            this.timer.start();
        }
    }

    stopGameLoop() {
        console.log("STOP");
        this.timer.stop();
    }

    Over(death: string) {
        this.state.lives --;
        SFX.GameOver.play();
        if (this.state.lives > 0) {
            this.Restarting = true;
            this.stopGameLoop();
        }
        else {
            this.Active = false;
            this.Finished = true;
            this.stopGameLoop();

            if(this.CHEAT == false) {
                this.state.saveGameStats(death);

                this.menu.updateStatistics();
            }
        }
    }

    updateVolume(volume: number) {
        volume = 0.05;
        Howler.volume(volume);
        this.state.saveFile.Volume = volume;
        this.state.save();
        console.log("Updated Volume");
    }

    togglePause() {
        if (this.Active == true) {
            if (this.Paused == false) {
                this.Paused = true;
                this.stopGameLoop();
            } else {
                this.Paused = false;
                this.startGameLoop(this.BaseSpeed);
            }
        }
    }

    AddLine() {
        var newMap = [];
        for (let y = 1; y <= this.height; y++) {
            newMap[y-1] = this.map[y];
        }
        this.map = newMap;
        this.map[this.height] = this.board.generateLine();
        this.board.removeOneTileGaps();
        this.state.levelLines += 1;

        if (this.state.levelLines < this.board.getLevelLines(this.state.level)) {
            this.state.stats.Lines += 1;
        }

        return false;
    }

    setLevelClass(level: number) {
        document.querySelectorAll('.Xbox').forEach((element) => {
            element.classList.remove(`d1`);
            element.classList.remove(`d2`);
            element.classList.remove(`d3`);
            element.classList.remove(`d4`);
            element.classList.remove(`d5`);
            element.classList.remove(`d6`);
            element.classList.remove(`d7`);
            element.classList.remove(`d8`);
            element.classList.remove(`d9`);
            element.classList.add(`d${level}`);
        });
    }

    UpdateSpeed(speed) {
        this.BaseSpeed = speed;
        console.log("Updated Speed");
    }

    UpdateSize(size) {
        this.width = parseInt(size);
        var l = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@";
        this.BaseLine = l.substr(0,this.width);
    }

    UpdateMode(mode) {
        if (this.Active == true) {
            alert("Wait until a game is no longer active");
            return false;
        }

        if (mode == 'normal') {
            this.state.gameMode = 'normal';
            this.BaseSpeed = 110;
        } else {
            this.state.gameMode = 'nightmare';
            this.BaseSpeed = 60;
        }
    }
}