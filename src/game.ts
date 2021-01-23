import { SFX } from './sfx';
import jquery from '../jquery.js';
import Utility from './utility';

declare var Game: XQuest;
declare var $: any;

var $ = (window as any).jQuery = jquery; 

// var endZoneChar = '▓';
var endZoneChar = '.';
var roadChar = '|';
var endChar = '';

export class XQuest {
    Version: '1.3';

    Active: boolean = false;
    Paused: boolean = false;
    LevelLines: number = 0;

    constructor() {

    }

    Start() {
        if (this.Active == true) {

            if (this.LevelLines > Game.GetLevelLines(Game.Level) - 20) {
                Game.Warp = 0;
                Game.Invincible = 25;
                if (Game.Distortion != 0) {
                    Game.CreateInterval(Game.BaseSpeed);
                    Game.Distortion = 0;
                }
                Game.LevelLines = 0;
                Game.Text = [];

                Game.Level++;
                Game.NextLevelClass = Game.DisplayLevel % 9 + 1;
                if (Game.Level == 10)
                    Game.Level = 9;
                Game.DisplayLevel++;

                $('#level').html(Game.DisplayLevel);
                if (Game.isKillScreen())
                    SFX.Killscreen.play();
                else
                    SFX.LevelUp.play();
            }

            $('.no_display_level_' + Game.DisplayLevel).css('display', 'block');

            return false;
        } else {

            for (var i = 1; i < 10; i++)
                $('.no_display_level_' + Game.DisplayLevel + '').css('display', 'none');

        }

        Game.Active = true;
        Game.Paused = false;
        Game.Warp = 0;
        Game.Invincible = 0;
        Game.Distortion = 0;
        Game.MultiShot = 0
        Game.Text = [];
        Game.Level = 1;
        Game.DisplayLevel = 1;
        Game.LevelLines = 0;
        Game.map = [];
        Game.LineLength = [];
        Game.LineReset = [];
        Game.LineEntered = [];
        Game.Bullet = [];
        // Game.RoadTile = '<span class="c'+Game.Level+'">' + roadChar + '</span>';
        Game.RoadTile = roadChar;
        Game.HighScore = false;
        Game.Stats = {
            Score: 0,
            Lines: 0,
            ShipsDestroyed: 0,
            ShotsDestroyed: 0,
            Powerups: 0,
            Moves: 0,
            ShotsFired: 0,
            Time: 0,
            Deaths: {
                Shot: 0,
                Wall: 0,
                Normal: 0
            }
        };

        Game.DestroySpaceship();

        Game.NextLevelClass = 1;

        /* Player spawns in the middle location */
        var mid = Math.floor((Game.LineSize - 1) / 2);
        Game.PlayerX = mid;
        var x;
        for (var i = 0; i < Game.LineSize; i++) {
            // if the location is one of the 3 middle columns then make a line there
            if (Utility.contains(i, mid - 1, mid + 1))
                x = 1;
            else x = 0;

            Game.LineLength.push(x * 25);
            Game.LineReset.push(x);
            Game.LineEntered.push(x);
        }

        $('#linesize').css('display', 'none');
        $('#mode').css('display', 'none');
        $('#level').html(Game.Level);

        /* Generate the first 20 lines */
        for (let y = 0; y <= 20; y++) {
            var Line = Game.GenerateLine();
            Game.map[y] = Line;
        }

        /* If you're on the high score screen and a new game starts don't let it submit */
        if (Game.CurrentTab == 6 || Game.CurrentTab == 7) {
            ToggleTab('1');
        }

        /* Add a positive phrase in the text field */
        Game.AddText(Game.PositivePhrases[Utility.getRandomInt(0, (Game.PositivePhrases.length - 1))]);

        /* Lets get this party started */
        Game.CreateInterval(Game.BaseSpeed);
        console.log('Game Started');
    };

};