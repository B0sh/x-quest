import { Howler, Howl } from 'howler';
import Utility from './utility';

export class SFX {
    static readonly Menu: Howl = new Howl({ 
        src: [ "menu.mp3" ],
        loop: true
    });

	static readonly Noscore: Howl = new Howl({
        src: [ "noscore.wav" ]
    });
	static readonly Score: Howl = new Howl({
        src: [ "score.wav" ]
    });
	static readonly LevelUp: Howl = new Howl({
        src: [ "level.wav" ]
    });
	static readonly Killscreen: Howl = new Howl({
        src: [ "killscreen.wav" ]
    });
	static readonly Bonus: Howl = new Howl({
        src: [ "bonus.wav" ]
    });
	static readonly Power: Howl = new Howl({
        src: [ "power.wav" ]
    });
	static readonly GameOver: Howl = new Howl({
        src: [ "gameover-new-1.wav" ]
    });

	static readonly Explosion: Howl = new Howl({
        src: [ "explosion-1.wav" ]
    });
	static readonly ExplosionLow: Howl = new Howl({
        src: [ "explosion-2.wav" ]
    });

	static readonly Shoot1: Howl = new Howl({
        src: [ "shoot-1.wav" ]
    });
	static readonly Shoot2: Howl = new Howl({
        src: [ "shoot-2.wav" ]
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
}
