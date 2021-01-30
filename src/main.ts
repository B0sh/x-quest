import Utility from "./utility";
import { XQuest } from "./game";
import { InputUtility } from "./input-utility";

let Game = new XQuest();
(window as any).Game = Game;

document.addEventListener('DOMContentLoaded', () => {
	Game.init();
	InputUtility.initListeners((event: KeyboardEvent) => {
		switch (event.code) {
			case 'KeyD': case 'KeyL': case 'ArrowRight':
				Game.move('right');
				event.preventDefault();
				break; //Left arrow or "d" or "l"
			case 'KeyA': case 'KeyJ': case 'ArrowLeft':
				Game.move('left');
				event.preventDefault();
				break; //Right arrow or "a" or "j"
			case 'KeyW': case 'KeyI': case 'ArrowUp':
				Game.fireBullet();
				event.preventDefault();
				break; //Up arrow or "w" or i
			case 'KeyE': 
				Game.usePowerup();
				event.preventDefault();
				break;
			case 'Space':
				if (!Game.Active) {
					Game.start();
				} else if (Game.state.levelLines >= Game.board.getLevelLines(Game.state.level)){
					Game.nextLevel();	
				} else if (!Game.Restarting) {
					Game.togglePause();
				}
				event.preventDefault();

				break;
			default: return true;
		}
	});

	if (Utility.isiPad()) {
		document.querySelectorAll('.no_display_iPad').forEach((element: any) => {
			element.style.display ='none';
		});
	}

	Game.state.load();

	Game.UpdateSize(24);
	Game.setLevelClass(1);

	Game.map = [];
	for(let i = 0; i <= Game.height; i++) {
		Game.map[i] = '@@@@@@@@@@@@@@@';
	}

});

