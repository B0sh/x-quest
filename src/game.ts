import { SFX } from './sfx';
import jquery from '../jquery.js';
import Utility from './utility';
import { State } from './state';
import { DisplayOptions } from 'rot-js/lib/display/types';
import { Display } from 'rot-js';
import { OverlayText, RenderEngine } from './render-engine';
import { Board } from './board';
import { Entity } from './entity';
import { Point } from './point';
import { Spaceship } from './spaceship';
import { PlayerBullet } from './player-bullet';

declare var Game: XQuest;
declare var $: any;

var $ = (window as any).jQuery = jquery; 

// var endZoneChar = '▓';
var endZoneChar = '.';
var roadChar = '|';
var endChar = '';

export class XQuest {
    version: string = '1.4';

    display: Display;
    // private player: Player;
    // private projectiles: Entity[] = [];
    // private enemies: Entity[] = [];

    state: State;
    // map: Map;
    options: DisplayOptions = {
        width: 30,
        height: 30,
        fontSize: 20,
        fontStyle: "bold",
        fontFamily: 'monospace',
    } as DisplayOptions;

    messages: string[] = [];
    map: string[] = [];
    Active: boolean = false;
    Paused: boolean = false;
    playerPosition: Point;
    LineSize: number = 25;
    GameHeight: number = 20;
    BaseSpeed: number;

    renderEngine: RenderEngine;
    board: Board;

    entities: Entity[] = [];

    positivePhrases = [
        "Good Luck!", "Having fun yet?", "Have fun!", "Kill &#39;em", "You can do it!",
        "Run run run", "Don&#39;t die", "Stay on the road", "Stay positive", "I&#39;m gonna do an internet!",
        "The time has come", "Your quest begins", "pow pow kachow", "pop click woosh", "Exhilaration",
        "You are an X", "You go on a quest", "Do well", "chicka chic pow", "Embody Luxury", "Precision", "Craftsmanship",
    ];

    constructor() {
        this.display = new Display(this.options);
        this.state = new State();
        this.renderEngine = new RenderEngine(this);
        this.board = new Board(this);
    }

    init() {
        // this.map = new Map(this);

        document.getElementsByClassName('TEMPGAMESPOT')[0].prepend(this.display.getContainer())
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
        console.log("CALL FIRE BULLET");
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

                const bullet = new PlayerBullet(this, new Point(this.playerPosition.x, this.playerPosition.y + 1));
                this.entities.push(bullet);

            } else {

                const bulletLeft = new PlayerBullet(this, new Point(this.playerPosition.x - 1, this.playerPosition.y));
                this.entities.push(bulletLeft);
                const bullet = new PlayerBullet(this, new Point(this.playerPosition.x, this.playerPosition.y + 1));
                this.entities.push(bullet);
                const bulletRight = new PlayerBullet(this, new Point(this.playerPosition.x + 1, this.playerPosition.y));
                this.entities.push(bulletRight);

                Game.state.multishot = 0;
            }
        }
    }

    Start() {
        if (this.Active == true) {
            if (this.state.levelLines > this.board.getLevelLines(this.state.level) - 20) {
                this.state.warp = 0;
                this.state.invincible = 25;
                if (this.state.distortion != 0) {
                    Game.CreateInterval(Game.BaseSpeed);
                    this.state.distortion = 0;
                }
                this.state.levelLines = 0;
                Game.messages = [];

                this.state.nextLevelClass = this.state.level % 9 + 1;
                this.state.level++;

                $('#level').html(this.state.level);
                if (this.state.isKillScreen())
                    SFX.Killscreen.play();
                else
                    SFX.LevelUp.play();
            }

            $('.no_display_level_' + this.state.level).css('display', 'block');

            return false;
        } else {
            for (var i = 1; i < 10; i++)
                $('.no_display_level_' + this.state.level + '').css('display', 'none');

        }
        this.entities = [];

        this.Active = true;
        this.Paused = false;
        this.state.warp = 0;
        this.state.invincible = 0;
        this.state.distortion = 0;
        this.state.multishot = 0
        Game.messages = [];
        this.state.level = 1;
        this.state.levelLines = 0;
        Game.map = [];
        Game.LineEntered = [];
        Game.Bullet = [];
        // Game.RoadTile = '<span class="c'+Game.state.level+'">' + roadChar + '</span>';
        Game.RoadTile = roadChar;
        Game.HighScore = false;
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
        var mid = Math.floor((Game.LineSize - 1) / 2);
        this.playerPosition = new Point(mid, Game.GameHeight - 1);

        this.board.generateStartingLines();


        $('#linesize').css('display', 'none');
        $('#mode').css('display', 'none');
        $('#level').html(this.state.level);

        /* If you're on the high score screen and a new game starts don't let it submit */
        if (Game.CurrentTab == 6 || Game.CurrentTab == 7) {
            ToggleTab('1');
        }

        Game.AddText(Game.positivePhrases[Utility.getRandomInt(0, (Game.positivePhrases.length - 1))]);

        /* Lets get this party started */
        Game.CreateInterval(Game.BaseSpeed);
        console.log('Game Started');
    }

    /* Main Game loop, main function is to process tiles and update map */
    CreateInterval(speed) {
        /* If a game loop exists already; kill it */
        clearInterval(Game.Interval);
        Game.CurrentSpeed = speed/1000;
        const _this = this;
        Game.Interval = setInterval(function() {
            Game.AddLine();

            if (_this.state.levelLines < Game.board.getLevelLines(_this.state.level)) {
                $("#GameWindow_Road").html(Game.DisplayMap(false, "Road"));
                $("#GameWindow_Objects").html(Game.DisplayMap(false, "Objects"));
            } else {

                let dashTimer: any = Math.floor((_this.state.levelLines - Game.board.getLevelLines(_this.state.level)) / 4);
                dashTimer = Array(dashTimer+1).join("-");

                // if the timer has reached the length of the line, then start the next level.
                if (dashTimer ==  Array(_this.board.lineLength.length+2).join("-"))
                {
                    // remove the completed text
                    $("#GameWindow_Road").html(Game.DisplayMap(false, "Road"));
                    $("#GameWindow_Objects").html(Game.DisplayMap(false, "Objects"));

                    Game.Start();
                    return;
                }

                $("#GameWindow_Objects").html(Game.DisplayMap([
                    {y: 12, text: "@COMPLETED:@", overwritable: true },
                    {y: 11, text: "@Level@"+Game.state.level+"@", overwritable: true },
                    {y: 10, text: "" + dashTimer + "@@@@@@@@@@@@@@@@@@@@@", overwritable: true},
                    {y: 9, text: "@Press Space@", overwritable: true },
                    {y: 8, text: "@to continue@", overwritable: true },
                ], "Objects"));

                $("#GameWindow_Road").html(Game.DisplayMap([
                    { y: 12, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
                    { y: 11, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
                    { y: 10, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
                    { y: 9, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
                    { y: 8, text: "@@@@@@@@@@@@@@@@@@@@@@@"}
                ], "Road"));


                const overlayText: OverlayText[] = [
                    { y: 14, centered: true, text: "COMPLETED:" },
                    { y: 15, centered: true, text: "Level "+Game.state.level },
                    { x: 2, y: 16, text: Utility.padEnd(dashTimer, Game.options.width - 4, ' ') },
                    { y: 17, centered: true, text: "Press Space" },
                    { y: 18, centered: true, text: "to continue" },
                ];
                Game.renderEngine.renderTextOverlay(overlayText);


            }
            Game.state.stats.Time += Game.CurrentSpeed;

            /* Create lines by the player for scoring purposes */
            for (let x=0; x<Game.LineSize; x++) {
                if (Game.map[3].charAt(x) == '@')
                    Game.LineEntered[x] = 0;
                else if (Game.LineEntered[x] == 0)
                    Game.LineEntered[x] = 1;
            }

            var Tile = Game.map[2].split('')[Game.playerPosition.x];
            switch (Tile) {
                case '|': break;
                case '' + roadChar + '': break;
                case 'P':
                    SFX.Bonus.play();
                    _this.state.stats.Score += (_this.state.level*2)+2;
                    _this.state.stats.Powerups += 1;
                    Game.AddText("+"+((_this.state.level*2)+2)+" Score");
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.playerPosition.x, "`");
                    break;
                case 'I':
                    SFX.Power.play();
                    _this.state.invincible = 50;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.playerPosition.x, "`");
                    break;
                case 'W':
                    SFX.Power.play();
                    _this.state.warp = 40;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.playerPosition.x, "`");
                    break;
                case 'D':
                    SFX.Power.play();
                    _this.state.distortion = 25;
                    _this.state.stats.Powerups += 1;
                    Game.CreateInterval(Game.BaseSpeed*2);
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.playerPosition.x, "`");
                    break;
                case 'M':
                    SFX.Power.play();
                    _this.state.multishot = 1;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.playerPosition.x, "`");
                    break;
            // nightmare mode wall tiles
                case '<':
                case '>':
                    Game.Over('Wall');
                    break;
                case '@':
                    if (Game.state.invincible == 0) {
                        Game.Over('Abyss');
                    }
                    break;
            }


            /* Randomly generate spaceships every 100 lines at 1/4 chance */
            let spaceshipExists: boolean = false;
            _this.entities.forEach((entity) => {
                if (entity instanceof Spaceship) {
                    spaceshipExists = true;
                }
            });
            if (((1+Game.state.stats.Lines) % 100 == 0 && Utility.getRandomInt(1, 4) == 1 && Game.state.level >= 2) || Game.state.stats.Lines+1 == 10)  {
                const spaceship = new Spaceship(_this);
                _this.entities.push(spaceship);
            }

            _this.entities.forEach((entity) => {
                entity.update();
            })

            _this.renderEngine.render();

            $('#score').html(Utility.format(Game.state.stats.Score));
            $('#lines').html(Utility.format(Game.state.stats.Lines));

            if (Game.isNewRecord() && Game.HighScore == false) {
                Game.HighScore = true;
                Game.AddText("<b>High Score!</b>");
            }
            if (Game.state.invincible != 0) {
                Game.state.invincible -= 1;
                $('#GameWindow_Objects').append('<br><b>Invincible:</b> '+Game.state.invincible);
            }
            if (Game.state.warp != 0) {
                Game.state.warp -= 1;
                $('#GameWindow_Objects').append('<br><b>Warp:</b> '+Game.state.warp);
            }
            if (Game.state.multishot != 0) {
                // Game.state.warp -= 1;
                $('#GameWindow_Objects').append('<br><b>MultiShot</b>');
            }
            if (Game.state.distortion != 0) {
                Game.state.distortion -= 1;
                if (Game.state.distortion == 0) {
                    Game.CreateInterval(Game.BaseSpeed);
                }
                $('#GameWindow_Objects').append('<br><b>Distortion:</b> '+Game.state.distortion);
            }

            Game.ProcessText();

            if (Game.state.nextLevelClass != -1) {
                Game.SetLevelClass(Game.state.nextLevelClass);
                Game.state.nextLevelClass = -1;
            }
        }, speed);
    };


    /* Render the game map from the Game.map array of lines */
    DisplayMap(Text, RenderMode: string, options) {
        this.renderEngine.render();

        var Map = "";
        for (let y = 20; y >= 0; y--) {
            var Line = Game.map[y];

            // objects render mode
            if (RenderMode == "Objects")
            {
                let needsOverwrite = false;


                if (Text != false) {
                    for (let i=0;i<Text.length;i++) {
                        if (Text[i].y == y && !(typeof Text[i].overwritable !== 'undefined' && needsOverwrite == true))
                            Line = Text[i].text.substr(0,Game.LineSize);
                    }
                }

                if (y == 2 && (typeof options === "undefined" || typeof options.renderPlayer === "undefined")) Line = Utility.setCharAt(Line, Game.playerPosition.x, "X");

                Map += endChar + Utility.replaceAll('`', '&nbsp;',
                    Utility.replaceAll('%', '&nbsp;',
                    Utility.replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";

            // road render mode all road tiles need to be road
            } else {
                if (Text != false) {
                    for (let i=0;i<Text.length;i++) {
                        if (Text[i].y == y)
                            Line = Text[i].text.substr(0,Game.LineSize);
                    }
                }

                // if (!Game.state.isKillScreen()) {
                    Line = Utility.replaceAll('P', '@', Line);
                    Line = Utility.replaceAll('I', '@', Line);
                    Line = Utility.replaceAll('D', '@', Line);
                    Line = Utility.replaceAll('M', '@', Line);
                    Line = Utility.replaceAll('W', '@', Line);
                // }
                Map += endChar + Utility.replaceAll('`', Game.RoadTile,
                    Utility.replaceAll('%', endZoneChar,
                    Utility.replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";
            }
        }
        return Map;
    };

    Over(DeathType: string) {
        SFX.GameOver.play();

        $('#linesize').css('display','inline');
        $('#mode').css('display','inline');
        Game.Active = false;
        clearInterval(Game.Interval);
        var Text = [
            {y:12, text:"@@@Game Over@@@@@@@@@@@@@@@@@@@@@"},
            {y:11, text:"@Score: "+Utility.format(Game.state.stats.Score)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
            {y:10, text:"@Lines: "+Utility.format(Game.state.stats.Lines)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
            {y:9, text:"@Level: "+Utility.format(Game.state.level)+"@@@@@@@@@@@@@@@@@@@@@@@@"}
        ];
        if (Game.isNewRecord()) {
            Text.push({y:8, text:"@@High Score!@@@@@@@@@@@@@@@@@@@@@@@@@@@"});
            ToggleTab('6');
        }
        $("#GameWindow_Objects").html(Game.DisplayMap(Text, "Objects"));

        var Text = [
            {y:12, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
            {y:11, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
            {y:10, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
            {y:9, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
        ];
        if (Game.isNewRecord()) {
            Text.push({y:8, text: "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"});
            ToggleTab('6');
        }

        $("#GameWindow_Road").html(Game.DisplayMap(Text, "Road"));

        const overlayText: OverlayText[] = [
            {centered: true, y:13, text:"Game Over"},
            {x: 2, y:14, text:"    Score: "+Utility.format(Game.state.stats.Score)+"              "},
            {x: 2, y:15, text:"    Lines: "+Utility.format(Game.state.stats.Lines)+"              "},
            {x: 2, y:16, text:"    Level: "+Utility.format(Game.state.level)+"              "}
        ];
        Game.renderEngine.renderTextOverlay(overlayText);


        if(Game.CHEAT == false) {
            switch(DeathType) {
                case 'Spaceship': Game.SaveFile.Totals.DeathShot++; break;
                case 'Wall': Game.SaveFile.Totals.DeathWall++; break;
                case 'Abyss': Game.SaveFile.Totals.DeathAbyss++; break;
            }

            Game.SaveFile.Totals.GamesPlayed += 1;
            Game.SaveFile.Totals.Score += Game.state.stats.Score;
            Game.SaveFile.Totals.Lines += Game.state.stats.Lines;
            Game.SaveFile.Totals.ShipsDestroyed += Game.state.stats.ShipsDestroyed;
            Game.SaveFile.Totals.Powerups += Game.state.stats.Powerups;
            Game.SaveFile.Totals.Moves += Game.state.stats.Moves;
            Game.SaveFile.Totals.Time += Game.state.stats.Time;
            Game.SaveFile.Totals.ShotsFired += Game.state.stats.ShotsFired;
            Game.SaveFile.Totals.ShotsDestroyed += Game.state.stats.ShotsDestroyed;

            if (Game.isNewRecord()) {
                Game.SaveFile.Record[Game.state.gameMode] = {
                    Score: Game.state.stats.Score,
                    Lines: Game.state.stats.Lines
                }
                $('#high-score').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Score));
                $('#high-lines').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Lines));
            }

            $('#total-score').html(Utility.format(Game.SaveFile.Totals.Score));
            $('#total-lines').html(Utility.format(Game.SaveFile.Totals.Lines));

            Game.Save();

            Game.UpdateStatistics();
        }
    };
};