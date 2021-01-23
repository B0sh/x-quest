import { Howler, Howl } from 'howler';

export class SFX {
	static readonly Noscore: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/noscore.wav" ]
    });
	static readonly LevelUp: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/level.wav" ]
    });
	static readonly Killscreen: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/killscreen.wav" ]
    });
	static readonly Bonus: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/bonus.wav" ]
    });
	static readonly Explosion: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/explosion.wav" ]
    });
	static readonly Score: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/score.wav" ]
    });
	static readonly Power: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/power.wav" ]
    });
	static readonly Shoot: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/shoot.wav" ]
    });
	static readonly GameOver: Howl = new Howl({
        src: [ "https://waldens.world/projects/x-quest/Sound/gameover.wav" ]
    });
}
