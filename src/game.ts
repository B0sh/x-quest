import { SFX } from './sfx';
import Utility from './utility';
import { State } from './state';
import { DisplayOptions } from 'rot-js/lib/display/types';
import { Display } from 'rot-js';
import { RenderEngine } from './render-engine';
import { Board } from './board';
import { BoundingBox } from './models/bounding-box';
import { ColliderEntity, Entity, EntityType } from './entities/entity';
import { Spaceship } from './entities/spaceship';
import { PlayerBullet } from './entities/player-bullet';
import { PelletText } from './entities/pellet-text';
import { Howler } from 'howler';
import { Timer } from './timer';
import { RoadBullet } from './entities/road-bullet';
import { Carrier } from './entities/carrier';
import { Layout, Tab } from './layout';
import { Menu } from './menu';
import TPKRequest from './tpk';

var roadChar = '|';

export class XQuest {
    static readonly version: string = '1.4';
    static readonly powerUps: string[] = [ '$', 'P', 'W', 'M', 'I', 'D', 'R' ];
    static readonly onTPK: boolean = true;
    static readonly onWW: boolean = false;

    display: Display;
    state: State;
    renderEngine: RenderEngine;
    board: Board;
    timer: Timer;
    layout: Layout;
    menu: Menu;

    options: DisplayOptions = {
        width: 30,
        height: 30,
        fontSize: 20,
        fontStyle: 'bold',
        fontFamily: 'courier new',
    } as DisplayOptions;

    width: number = 24;
    height: number = 22;

    messages: string[] = [];
    map: string[] = [];

    Active: boolean = false;
    Finished: boolean = false;
    Paused: boolean = false;
    Restarting: boolean = false;
    Crashed: boolean = false;

    playerPosition: BoundingBox;
    gameClockMs: number;
    BaseLine: string;
    gameOverDelayUntil: number = null;
    frameTime: number = 0;
    nextGameSyncTime: number = 0;
    isUpdating: boolean = false;

    entities: Entity[] = [];

    // TO REPLACE
    LineEntered: any[] = [];


    constructor() {
        this.display = new Display(this.options);
        this.state = new State(this);
        this.renderEngine = new RenderEngine(this);
        this.board = new Board(this);
        this.layout = new Layout(this);
        this.menu = new Menu(this);
    }

    init() {
        document.getElementsByClassName('x-quest-board')[0].prepend(this.display.getContainer())
        this.layout.initTabEvents();
        this.layout.updateInstructions(1);
        this.renderLoop();
    }

    frameCount: number = 0;
    renderLoop() {
        this.frameCount++;
        if (this.isUpdating) {
            // alert("CURRENTLY UPDATING" + this.frameCount);
        }
        else {
            this.renderEngine.render();
        }

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

    unloadEntities() {
        this.entities.forEach((entity) => {
            entity.unload();
        });
        this.entities = [ ];
    }

    start() {
        if (this.Active == true) {
            if (this.state.levelLines > this.board.getLevelLines(this.state.level) - this.height) {
                this.nextLevel();
            }
            return;
        }

        if (this.state.loading || (this.gameOverDelayUntil && this.gameOverDelayUntil > performance.now())) {
            return;
        }

        if (this.layout.currentTab == Tab.GameOverStatistics) {
            this.layout.toggleTab(Tab.Instructions);
        }

        this.unloadEntities();
        this.state.modifiers = this.layout.selectedModifiers.map(m => m.name);

        this.Active = true;
        this.Finished = false;
        this.Paused = false;
        this.Restarting = false;
        this.syncNextAt = performance.now() + 10000;
        this.state.gameId = 0;
        this.state.warp = 0;
        this.state.invincible = 0;
        this.state.distortion = 0;
        this.state.multishot = 0;
        this.state.level = 1;
        this.state.lines = 0;
        this.state.levelLines = 0;
        this.state.power = null;
        this.map = [];
        this.LineEntered = [];
        this.gameOverDelayUntil = null;
        this.state.stats = {
            Score: 0,
            ShipsDestroyed: 0,
            ShotsDestroyed: 0,
            PowerupsUsed: 0,
            Moves: 0,
            ShotsFired: 0,
            Time: 0,
            DeathAbyss: 0,
            DeathWall: 0,
            DeathShot: 0,
        };

        const mid = Math.floor((this.width - 1) / 2);
        this.playerPosition = new BoundingBox(mid, this.height - 1);

        this.board.generateStartingLines();
        this.layout.updateInstructions(this.state.level);

        if (this.state.hasModifier('Nightmare')) {
            this.gameClockMs = 60;
        }
        else {
            this.gameClockMs = 120;
        }

        if (this.state.hasModifier('Survivor')) {
            this.state.lives = 1;
        }
        else {
            this.state.lives = 3;
        }

        TPKRequest.startGame(this.state).then((result: any) => {
            this.state.gameId = result.game_id;
        }).catch((error) => {
            this.handleError(error);
        });

        /* Lets get this party started */
        this.startGameLoop(this.gameClockMs);
        console.log('Game Started');
    }

    nextLevel() {
        this.state.level++;
        this.state.levelLines = 0;

        this.state.warp = 0;
        this.state.invincible = 25;

        if (this.state.hasModifier('Incline')) {
            this.gameClockMs -= 1;
            this.startGameLoop(this.gameClockMs);
        }

        this.board.onNextLevel();
        this.layout.updateInstructions(this.state.level);

        if (this.state.isKillScreen()) {
            SFX.Killscreen.play();
        } else {
            SFX.LevelUp.play();
        }
    }

    restartLevel() {
        this.Restarting = false;
        this.startGameLoop(this.gameClockMs);

        this.unloadEntities();
        this.state.levelLines = 0;
        this.state.warp = 0;
        this.state.distortion = 0;
        this.state.multishot = 0;
        if (this.state.level == 1) {
            this.state.invincible = 0;
        } else {
            this.state.invincible = 25;
        }
        this.state.power = null;
        this.state.levelLines = 0;

        const mid = Math.floor((this.width - 1) / 2);
        this.playerPosition = new BoundingBox(mid, this.height - 1);

        this.board.generateStartingLines();
    }

    move(direction: string): void {
        if (this.Active && !this.Paused && !this.Restarting) {
            let xMovement: number = 0;
            switch(direction) {
                case 'right': xMovement = 1; break;
                case 'left': xMovement = -1; break;
            }

            var Tile2 = this.map[2].split('')[this.playerPosition.x];

            // if you don't have warp mode on the move is pretty simple
            if (this.state.warp == 0) {
                this.playerPosition.x += xMovement;
                if (this.playerPosition.x > this.width-1 || this.playerPosition.x < 0) {
                    this.over('Wall');
                    return;
                }

            // warp power up checks to find the next available line
            //   and if it doesn't find one its a wall game over ofc
            } else {
                var foundPosition = false;
                while (!foundPosition) {
                    this.playerPosition.x += xMovement;
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
                this.over('Abyss');
            }
        }
    }

    fireBullet() {
        let bulletExists: boolean = false;
        this.entities.forEach((entity) => {
            if (entity instanceof PlayerBullet) {
                bulletExists = true;
            }
        });

        if (this.Active && !this.Paused && !this.Restarting && !bulletExists) {
            this.state.stats.ShotsFired += 1;

            if (this.state.multishot == 0) {
                const bullet = new PlayerBullet(this, new BoundingBox(this.playerPosition.x, this.playerPosition.y - 1));
                this.entities.push(bullet);
                SFX.Shoot.play();
            } else {
                const bulletLeft = new PlayerBullet(this, new BoundingBox(this.playerPosition.x - 1, this.playerPosition.y));
                this.entities.push(bulletLeft);
                const bullet = new PlayerBullet(this, new BoundingBox(this.playerPosition.x, this.playerPosition.y - 1));
                this.entities.push(bullet);
                const bulletRight = new PlayerBullet(this, new BoundingBox(this.playerPosition.x + 1, this.playerPosition.y));
                this.entities.push(bulletRight);
                SFX.MultiShot.play();
            }
            //? Potentially a bad idea to check collisions outside of game
            //? loop, but this makes newly spawned bullets check for stuff inside
            //? them on spawn
            this.checkCollisions();
        }
    }

    usePowerup() {
        if (this.Active && !this.Paused && !this.Restarting) {
            switch (this.state.power) {
                case 'D':
                    SFX.Power.play();
                    this.state.distortion = 50;
                    this.state.stats.PowerupsUsed += 1;
                    break;
                case 'W':
                    SFX.Power.play();
                    this.state.warp = 50;
                    this.state.stats.PowerupsUsed += 1;
                    break;
                case 'I':
                    SFX.Power.play();
                    this.state.invincible = 50;
                    this.state.stats.PowerupsUsed += 1;
                    break;
                case 'M':
                    SFX.Power.play();
                    this.state.multishot = 50;
                    this.state.stats.PowerupsUsed += 1;
                    break;
                case 'R':
                    const bullet = new RoadBullet(this, new BoundingBox(this.playerPosition.x, this.playerPosition.y - 1));
                    SFX.Shoot.play();
                    this.entities.push(bullet);
                    break;
            }
            this.state.power = null;
        }
    }

    startGameLoop(speed: number) {
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
        this.isUpdating = false;
        this.timer.stop();
    }

    gameLoop() {
        this.isUpdating = true;
        const t = performance.now();
        if (this.state.distortion != 0) {
            this.state.distortion -= 1;
            if (this.state.distortion % 2 == 1) {
                return;
            }
        }

        this.nextLine();

        this.state.stats.Time += this.gameClockMs / 1000;

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
            case '$':
                SFX.Bonus.play();
                let score = this.state.level * 2 + 2;
                if (score > 20) score = 20;
                this.state.stats.Score += score;
                const pelletText = new PelletText(this, score);
                this.addEntity(pelletText);
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'I':
                SFX.Power.play();
                this.state.power = 'I';
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'W':
                SFX.Power.play();
                this.state.power = 'W';
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'D':
                SFX.Power.play();
                this.state.power = 'D';
                // this.startGameLoop(this.BaseSpeed*2);
                this.map[2] = Utility.setCharAt(this.map[2], this.playerPosition.x, "`");
                break;
            case 'M':
                SFX.Power.play();
                this.state.power = 'M';
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
                this.over('Wall');
                return;
                break;
            case '@':
                if (this.state.invincible == 0) {
                    this.over('Abyss');
                    return;
                }
                break;
        }

        this.spawnShips();

        for (let i = this.entities.length; i > 0; i--) {
            this.entities[i - 1].update();
        }

        this.checkCollisions();

        if (this.state.invincible != 0) {
            this.state.invincible -= 1;
        }
        if (this.state.warp != 0) {
            this.state.warp -= 1;
        }
        if (this.state.multishot != 0) {
            this.state.multishot -= 1;
        }

        this.checkForGameSync();

        this.frameTime = performance.now() - t;
        this.isUpdating = false;
    }

    spawnShips() {
        const loadingZone = this.state.levelLines >= this.board.getLevelLines(this.state.level);
        let spaceshipExists: boolean = false;
        let carrierExists: boolean = false;
        this.entities.forEach((entity) => {
            if (entity.type == EntityType.Spaceship) {
                spaceshipExists = true;
            }

            if (entity.type == EntityType.Carrier) {
                carrierExists = true;
            }
        });

        if (!carrierExists && !loadingZone &&
            (
                (this.state.level == 8 && this.state.levelLines == 50) ||
                (this.state.level > 8 && this.state.level % 8 == 0 && this.state.levelLines == 100 && Utility.getRandomInt(1, 3) == 1) ||
                (this.state.level > 8 && this.state.level % 8 != 0 && this.state.levelLines == 100 && Utility.getRandomInt(1, 16) == 1)
            )) {
            const carrier = new Carrier(this);
            this.entities.push(carrier);
            carrier.spawnShields();
            carrierExists = true;
        }

        if (!carrierExists && !loadingZone &&
            (
                (this.state.level == 2 && this.state.levelLines == 50) ||
                (this.state.level > 2 && this.state.lines % 100 == 0 && Utility.getRandomInt(1, 4) == 1) ||
                (this.state.hasModifier('Invasion') && this.state.level > 2 && this.state.lines % 100 == 3 && Utility.getRandomInt(1, 4) == 1) ||
                (this.state.hasModifier('Invasion') && this.state.level > 2 && this.state.lines % 100 == 6 && Utility.getRandomInt(1, 4) == 1) ||
                (this.state.hasModifier('Invasion') && this.state.level > 2 && this.state.lines % 100 == 9 && Utility.getRandomInt(1, 4) == 1)
            ))  {
            const spaceship = new Spaceship(this);
            this.entities.push(spaceship);
        }
    }

    checkCollisions() {
        const colliders: ColliderEntity[] = (this.entities as ColliderEntity[]).filter((entity) => entity.collide);
        const entityCount: number = colliders.length;
        for (let i = 0; i < entityCount; i++) {
            for (let j = i + 1; j < entityCount; j++) {
                if (colliders[i].position.intersets(colliders[j].position)) {
                    colliders[i].collide(colliders[j]);
                    colliders[j].collide(colliders[i]);
                }
            }
        }
    }

    xcheck: string = "";
    syncNextAt: number = 0;
    checkForGameSync() {
        if (performance.now() > this.syncNextAt) {
            this.syncNextAt = performance.now() + 20000;
            TPKRequest.gameStateSync(this.state, this.xcheck).then((result: any) => {
                this.xcheck = result.xcheck;
            }).catch((error: Error) => {
                this.handleError(error);
            });
        }
    }

    over(death: string) {
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

            this.gameOverDelayUntil = performance.now() + 4000;

            this.layout.loadGameOverStatistics(this.state, death, null, null);
            TPKRequest.finishGame(this.state, death).then((result: any) => {
                this.layout.loadGameOverStatistics(this.state, death, result.minigame_points, result.event_currency);
            }).catch((error: Error) => {
                this.handleError(error);
            });
        }
    }

    togglePause() {
        if (this.Active == true) {
            if (this.Paused == false) {
                this.Paused = true;
                this.stopGameLoop();
            } else {
                this.Paused = false;
                this.startGameLoop(this.gameClockMs);
            }
        }
    }

    handleError(error: Error) {
        if (this.Active == true) {
            this.Active = false;
            this.stopGameLoop();
        }

        this.Crashed = true;
        this.state.level = 99;

        this.layout.onError(error);
    }

    nextLine() {
        var newMap = [];
        for (let y = 1; y <= this.height; y++) {
            newMap[y-1] = this.map[y];
        }
        this.map = newMap;
        this.map[this.height] = this.board.generateLine();
        this.board.removeOneTileGaps();
        this.state.levelLines += 1;

        if (this.state.levelLines < this.board.getLevelLines(this.state.level)) {
            this.state.lines += 1;
        }

        return false;
    }
}
