import { Howler, Howl } from 'howler';

export class SFX {
	static readonly Noscore: Howl = new Howl({
        src: [ "noscore.wav" ]
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
	static readonly Explosion: Howl = new Howl({
        src: [ "explosion.wav" ]
    });
	static readonly Score: Howl = new Howl({
        src: [ "score.wav" ]
    });
	static readonly Power: Howl = new Howl({
        src: [ "power.wav" ]
    });
	static readonly Shoot: Howl = new Howl({
        src: [ "shoot.wav" ]
    });
	static readonly GameOver: Howl = new Howl({
        src: [ "gameover-new-1.wav" ]
    });
}
