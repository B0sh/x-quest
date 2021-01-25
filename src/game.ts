import { SFX } from './sfx';
import jquery from '../jquery.js';
import Utility from './utility';
import { State } from './state';
import { DisplayOptions } from 'rot-js/lib/display/types';
import { Display } from 'rot-js';
import { OverlayText, RenderEngine } from './render-engine';
import { Board } from './board';

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
    PlayerX: number;
    LineSize: number = 25;
    BaseSpeed: number;

    renderEngine: RenderEngine;
    board: Board;

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

        Game.DestroySpaceship();

        this.state.nextLevelClass = 1;

        /* Player spawns in the middle location */
        var mid = Math.floor((Game.LineSize - 1) / 2);
        Game.PlayerX = mid;

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

            var Tile = Game.map[2].split('')[Game.PlayerX];
            switch (Tile) {
                case '|': break;
                case '' + roadChar + '': break;
                case 'P':
                    SFX.Bonus.play();
                    _this.state.stats.Score += (_this.state.level*2)+2;
                    _this.state.stats.Powerups += 1;
                    Game.AddText("+"+((_this.state.level*2)+2)+" Score");
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.PlayerX, "`");
                    break;
                case 'I':
                    SFX.Power.play();
                    _this.state.invincible = 50;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.PlayerX, "`");
                    break;
                case 'W':
                    SFX.Power.play();
                    _this.state.warp = 40;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.PlayerX, "`");
                    break;
                case 'D':
                    SFX.Power.play();
                    _this.state.distortion = 25;
                    _this.state.stats.Powerups += 1;
                    Game.CreateInterval(Game.BaseSpeed*2);
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.PlayerX, "`");
                    break;
                case 'M':
                    SFX.Power.play();
                    _this.state.multishot = 1;
                    _this.state.stats.Powerups += 1;
                    Game.map[2] = Utility.setCharAt(Game.map[2], Game.PlayerX, "`");
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


            /* Bullet handling */
            if (Game.Bullet.length !== 0) {

                for (let i = 0 ; i < Game.Bullet.length ; i++ ) {
                    Game.Bullet[i].y += 1;
                    if (Game.Bullet[i].y == 21)
                    {
                        Game.DestroyBullet(i, 'player');
                        continue;
                    }

                    if (Game.Spaceship.exists == true &&
                        Game.Bullet[i].y == Game.Spaceship.y &&
                        Utility.contains(Game.Bullet[i].x, Game.Spaceship.x, Game.Spaceship.x+2)) {
                            Game.DestroyBullet(i, 'player');
                            Game.state.stats.Score += 10;
                            Game.state.stats.ShipsDestroyed += 1;
                            Game.AddText("Hit! +10 Score");
                            Game.DestroySpaceship();
                            SFX.Explosion.play();
                    }

                    // allow spaceship bullets to be destoryed
                    for (let s = 0; s < Game.Spaceship.Bullet.length; s++ ) {
                        if ((Game.Spaceship.Bullet[s].y == Game.Bullet[i].y || Game.Spaceship.Bullet[s].y+1 ==Game.Bullet[i].y) &&
                            Game.Bullet[i].x == Game.Spaceship.Bullet[s].x && Game.Bullet[i].y != -1)
                        {
                            Game.DestroyBullet(i, 'player');
                            Game.DestroyBullet(s, 'spaceship');
                            Game.state.stats.ShotsDestroyed += 1;
                        }
                    }
                }
            }

            /* Spaceship handling */
            if (Game.Spaceship.exists == true) {
                if ((Game.Spaceship.lines % 30) == 0)
                    Game.Spaceship.y -= 1;

                /* Spaceship movement */
                if (Game.Spaceship.move == false) {
                    Game.Spaceship.move = true;
                } else {
                    if (Game.Spaceship.flyaway == false) {
                        if(Game.Spaceship.x >= Utility.getRandomInt(Math.floor(Game.LineSize*.7), Game.LineSize-3)
                        && Game.Spaceship.direction == 1) {
                            Game.Spaceship.direction *= -1;
                        }
                        if(Game.Spaceship.x <= Utility.getRandomInt(1, Math.floor(Game.LineSize*.3)) && Game.Spaceship.direction == -1) {
                            Game.Spaceship.direction *= -1;
                        }
                    }

                    Game.Spaceship.move = false;
                    Game.Spaceship.x += Game.Spaceship.direction;
                }

                //  Spaceship bullet handling
                if (Game.Spaceship.Bullet.length == 0 && Utility.getRandomInt(1, 5) == 1 && Game.Spaceship.flyaway == false) {

                    Game.FireBullet('spaceship');

                } else {

                    for (let i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
                        Game.Spaceship.Bullet[i].y -= 1;
                        if (Game.Spaceship.Bullet[i].y == 0)
                            Game.DestroyBullet(i, 'spaceship');

                        else if (Game.Spaceship.Bullet[i].y == 1 && Game.Spaceship.Bullet[i].x == Game.PlayerX && Game.state.invincible == 0) {
                            Game.DestroyBullet(i, 'spaceship');
                            Game.Over('Spaceship');
                        }
                    }
                }

                /* After 150 lines after the spaceship has spawned make it fly away (now) */
                if (Game.Spaceship.lines > 160) {
                    Game.Spaceship.flyaway = true;
                }

                /* Destroy spaceship after it has flown off the screen */
                if (Game.Spaceship.x == -3 || Game.Spaceship.x == (Game.LineSize+3)) {
                    Game.DestroySpaceship();
                }
            } else {
                /* Randomly generate spaceships every 100 lines at 1/4 chance */
                if (((1+Game.state.stats.Lines) % 100 == 0 && Utility.getRandomInt(1, 4) == 1 && Game.state.level >= 2) || Game.state.stats.Lines+1 == 200)  {
                    Game.CreateSpaceship();
                }
            }

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
                // loop through bullets and set bullet character
                for (let i = 0 ; i < Game.Bullet.length ; i++ ) {
                    if (y == Game.Bullet[i].y) {
                        Line = Utility.setCharAt(Line, Game.Bullet[i].x, "^");
                        needsOverwrite = true;
                    }
                }

                for (let i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
                    if (y == Game.Spaceship.Bullet[i].y) {
                        Line = Utility.setCharAt(Line, Game.Spaceship.Bullet[i].x, "v");
                        needsOverwrite = true;
                    }
                }

                if (y == Game.Spaceship.y) {
                    Line = Utility.setCharAt(Line, Game.Spaceship.x,   Game.Spaceship.display[0]);
                    Line = Utility.setCharAt(Line, Game.Spaceship.x+1, Game.Spaceship.display[1]);
                    Line = Utility.setCharAt(Line, Game.Spaceship.x+2, Game.Spaceship.display[2]);
                    needsOverwrite = true;
                }

                if (Text != false) {
                    for (let i=0;i<Text.length;i++) {
                        if (Text[i].y == y && !(typeof Text[i].overwritable !== 'undefined' && needsOverwrite == true))
                            Line = Text[i].text.substr(0,Game.LineSize);
                    }
                }

                if (y == 2 && (typeof options === "undefined" || typeof options.renderPlayer === "undefined")) Line = Utility.setCharAt(Line, Game.PlayerX, "X");

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

                // loop through bullets and set bullet character
                for (let i = 0 ; i < Game.Bullet.length ; i++ ) {
                    if (y == Game.Bullet[i].y)
                    Line = Utility.setCharAt(Line, Game.Bullet[i].x, "@");
                }

                for (let i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
                    if (y == Game.Spaceship.Bullet[i].y)
                    Line = Utility.setCharAt(Line, Game.Spaceship.Bullet[i].x, "@");
                }

                if (y == 2) Line = Utility.setCharAt(Line, Game.PlayerX, "@");
                if (y == Game.Spaceship.y) {
                    Line = Utility.setCharAt(Line, Game.Spaceship.x,   '@');
                    Line = Utility.setCharAt(Line, Game.Spaceship.x+1, '@');
                    Line = Utility.setCharAt(Line, Game.Spaceship.x+2, '@');
                }

                Map += endChar + Utility.replaceAll('`', Game.RoadTile,
                    Utility.replaceAll('%', endZoneChar,
                    Utility.replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";
            }
        }
        return Map;
    };

};