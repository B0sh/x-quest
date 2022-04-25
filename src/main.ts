import Utility from "./utility";
import { XQuest } from "./game";
import { InputUtility } from "./input-utility";


let Game = new XQuest('ww');
(window as any).Game = Game;

document.addEventListener('DOMContentLoaded', () => {
    Game.init();

    InputUtility.initListeners((event: KeyboardEvent) => {
        if (Game.Crashed) {
            return true;
        }

        switch (event.code) {
            case 'KeyD': case 'KeyL': case 'ArrowRight':
                Game.move('right');
                event.preventDefault();
                break;
            case 'KeyA': case 'KeyJ': case 'ArrowLeft':
                Game.move('left');
                event.preventDefault();
                break;
            case 'KeyW': case 'KeyI': case 'ArrowUp':
                Game.fireBullet();
                event.preventDefault();
                break;
            case 'KeyE': case 'KeyO': case 'ArrowDown':
                Game.usePowerup();
                event.preventDefault();
                break;
            // case 'KeyY': 
            //     Game.startIntro();
            //     break;
            // case 'KeyU':
            //     Game.intro.stop();
            //     break;
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

    Game.state.load();

    Game.map = [];
    for(let i = 0; i <= Game.height; i++) {
        Game.map[i] = '@'.repeat(Game.width);
    }
});

