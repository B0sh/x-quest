import { Changelog } from "./changelog";
import Utility from "./utility";
import jquery from '../jquery.js';
import { XQuest } from "./game";
import { InputUtility } from "./input-utility";
import { OverlayText } from "./render-engine";

var $ = (window as any).jQuery = jquery; 
let Game = new XQuest();
(window as any).Game = Game;

document.addEventListener('DOMContentLoaded', () => {
	Game.init();
	InputUtility.initListeners((event: KeyboardEvent) => {
		switch (event.code) {
			case 'KeyD': case 'KeyL': case 'ArrowRight':
				Game.Move('right');
				event.preventDefault();
				break; //Left arrow or "d" or "l"
			case 'KeyA': case 'KeyJ': case 'ArrowLeft':
				Game.Move('left');
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
				if (Game.Active == false) {
					Game.start();
				} else if (Game.state.levelLines >= Game.board.getLevelLines(Game.state.level)){
					Game.nextLevel();	
				} else {
					Game.togglePause();
				}
				event.preventDefault();

				break;
			default: return true;
		}
	});

	if (Utility.isiPad())
		$('.no_display_iPad').css('display', 'none');

	Game.state.load();
	Game.UpdateMode('normal');

	/* Default to medium size */
	Game.UpdateSize(24);
	Game.SetLevelClass(1);

	Game.map = [];
	for(let i = 0; i <= Game.height; i++) {
		Game.map[i] = '@@@@@@@@@@@@@@@';
	}

	$('tab').click(function (e) {
		ToggleTab($(this).attr('id'));
	});

	Game.UpdateStatistics();
	$("#Changelog").html(Changelog.createChangelog());
});


function ToggleTab(tab){
	for (let i = 0; i <= 12; i++) {
		$('[tab='+i+']').css('display', 'none');
		$('[id='+i+']').attr('class', 'x');
	}
	$('[tab='+tab+']').css('display', 'inline-block');
	$('[id='+tab+']').attr('class', 'selected');

	// if (tab == 3) {
	// 	Game.LoadHighScore();
	// }

	// if (tab == 0) {
	// 	Game.CalculateStuff();
	// }

	Game.CurrentTab = tab;
}

// Game.CalculateStuff = function() {
// 	var temp = Game.state.level;
// 	let text = "Easter Egg? There's a Kill Screen <br><br>";
// 	text += "Calculating Time to Reach Kill Screen<br>";

// 	Game.state.level = 0;
// 	let totalLines = 0;
// 	for (var Level = 0; Level <= 5000; Level++) {
// 		Game.state.level++;
// 		let x = Game.state.level;
// 		if (x > 9) x = 9;
// 		totalLines += Game.board.getLevelLines(x);
// 		if (Game.state.isKillScreen())
// 			break;
// 	}
// 	text += "Kill Screen Level: " + Game.state.level;
// 	text += "<br>Lines: " + totalLines;
// 	text += "<br>Base Clock: " + Game.BaseSpeed + "ms";
// 	text += "<br>Time: " + totalLines * Game.BaseSpeed / 1000 / 60 + " minutes"
// 	Game.state.level = temp;
// 	$('[tab=0]').html(text);

// };