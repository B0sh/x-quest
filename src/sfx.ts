import { Howler, Howl } from 'howler';
import Utility from './utility';

export class SFX {
    static readonly Intro: Howl = new Howl({ 
        src: [ new URL("../static/intro.mp3", import.meta.url).href ]
    });

	static readonly Noscore: Howl = new Howl({
        src: [ new URL("../static/noscore.wav", import.meta.url).href ]
    });
	static readonly Score: Howl = new Howl({
        src: [ new URL("../static/score.wav", import.meta.url).href ]
    });
	static readonly LevelUp: Howl = new Howl({
        src: [ new URL("../static/level.wav", import.meta.url).href ]
    });
	static readonly Killscreen: Howl = new Howl({
        src: [ new URL("../static/killscreen.wav", import.meta.url).href ]
    });
	static readonly Bonus: Howl = new Howl({
        src: [ new URL("../static/bonus.wav", import.meta.url).href ]
    });
	static readonly Power: Howl = new Howl({
        src: [ new URL("../static/power.wav", import.meta.url).href ]
    });
	static readonly GameOver: Howl = new Howl({
        src: [ new URL("../static/gameover-new-1.wav", import.meta.url).href ]
    });

	static readonly Explosion: Howl = new Howl({
        src: [ new URL("../static/explosion-3.wav", import.meta.url).href ]
    });
	static readonly ExplosionBullet: Howl = new Howl({
        src: [ new URL("../static/explosion-bullet.wav", import.meta.url).href ]
    });
	static readonly ExplosionLow: Howl = new Howl({
        src: [ new URL("../static/explosion-2.wav", import.meta.url).href ]
    });
	static readonly CarrierEngine: Howl = new Howl({
        src: [ new URL("../static/carrier-engine.mp3", import.meta.url).href ]
    });
	static readonly CarrierDeath: Howl = new Howl({
        src: [ new URL("../static/carrier-death.wav", import.meta.url).href ]
    });

	static readonly Shoot1: Howl = new Howl({
        src: [ new URL("../static/shoot-1.wav", import.meta.url).href ]
    });
	static readonly Shoot2: Howl = new Howl({
        src: [ new URL("../static/shoot-2.wav", import.meta.url).href ]
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
        src: [ new URL("../static/multishot-1.wav", import.meta.url).href ]
    });
	static readonly MultiShot2: Howl = new Howl({
        src: [ new URL("../static/multishot-2.wav", import.meta.url).href ]
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
