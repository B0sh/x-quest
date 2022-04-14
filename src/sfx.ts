import { Howler, Howl } from 'howler';
import Utility from './utility';

export class SFX {
    static readonly Menu: Howl = new Howl({ 
        src: [ "x-quest/static/menu.mp3" ],
        loop: true
    });

	static readonly Noscore: Howl = new Howl({
        src: [ "x-quest/static/noscore.wav" ]
    });
	static readonly Score: Howl = new Howl({
        src: [ "x-quest/static/score.wav" ]
    });
	static readonly LevelUp: Howl = new Howl({
        src: [ "x-quest/static/level.wav" ]
    });
	static readonly Killscreen: Howl = new Howl({
        src: [ "x-quest/static/killscreen.wav" ]
    });
	static readonly Bonus: Howl = new Howl({
        src: [ "x-quest/static/bonus.wav" ]
    });
	static readonly Power: Howl = new Howl({
        src: [ "x-quest/static/power.wav" ]
    });
	static readonly GameOver: Howl = new Howl({
        src: [ "x-quest/static/gameover-new-1.wav" ]
    });

	static readonly Explosion: Howl = new Howl({
        src: [ "x-quest/static/explosion-3.wav" ]
    });
	static readonly ExplosionBullet: Howl = new Howl({
        src: [ "x-quest/static/explosion-bullet.wav" ]
    });
	static readonly ExplosionLow: Howl = new Howl({
        src: [ "x-quest/static/explosion-2.wav" ]
    });
	static readonly CarrierEngine: Howl = new Howl({
        src: [ "x-quest/static/carrier-engine.mp3" ]
    });
	static readonly CarrierDeath: Howl = new Howl({
        src: [ "x-quest/static/carrier-death.wav" ]
    });

	static readonly Shoot1: Howl = new Howl({
        src: [ "x-quest/static/shoot-1.wav" ]
    });
	static readonly Shoot2: Howl = new Howl({
        src: [ "x-quest/static/shoot-2.wav" ]
    });
    static readonly Shoot = { 
        play() {
            if (Utility.getRandomInt(1, 2) == 1) {
                SFX.Shoot1.play();
            }
            else {
                SFX.Shoot2.play();
            }
        }
    };

	static readonly MultiShot1: Howl = new Howl({
        src: [ "x-quest/static/multishot-1.wav" ]
    });
	static readonly MultiShot2: Howl = new Howl({
        src: [ "x-quest/static/multishot-2.wav" ]
    });
    static readonly MultiShot = { 
        play() {
            if (Utility.getRandomInt(1, 2) == 1) {
                SFX.MultiShot1.play();
            }
            else {
                SFX.MultiShot2.play();
            }
        }
    };
}
