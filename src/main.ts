import { Changelog } from "./changelog";
import Utility from "./utility";
import jquery from '../jquery.js';
import { SFX } from "./sfx";
import { Howler } from "howler";
import { XQuest } from "./game";
import { InputUtility } from "./input-utility";

var $ = (window as any).jQuery = jquery; 
let Game = new XQuest();
(window as any).Game = Game;

document.addEventListener('DOMContentLoaded', () => {
	Game.init();
	InputUtility.initListeners((event: KeyboardEvent) => {
		switch (event.code) {
			case 'KeyD': case 'KeyL': case 'ArrowLeft':
				Game.Move('right');
				event.preventDefault();
				break; //Left arrow or "d" or "l"
			case 'KeyA': case 'KeyJ': case 'ArrowRight':
				Game.Move('left');
				event.preventDefault();
				break; //Right arrow or "a" or "j"
			case 'KeyW': case 'KeyI': case 'ArrowUp':
				Game.FireBullet('player');
				event.preventDefault();
				break; //Up arrow or "w" or i
			case 'Space':
				if (Game.Active == false || (Game.state.levelLines >= parseInt(Game.GetLevelLines(Game.Level)))) {
					Game.Start(); //Spacebar to start
				} else {
					Game.TogglePause(); //Spacebar to pause
				}
				event.preventDefault();

				break;
			default: return true;
		}
	});

	if (Utility.isiPad())
		$('.no_display_iPad').css('display', 'none');

	Game.Load();
	Game.UpdateMode('normal');

	/* Add the total score and lines from localStorage */
	$('#high-score').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Score));
	$('#high-lines').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Lines));
	$('#total-score').html(Utility.format(Game.SaveFile.Totals.Score));
	$('#total-lines').html(Utility.format(Game.SaveFile.Totals.Lines));

	/* Default to medium size */
	Game.UpdateSize(15);
	Game.SetLevelClass(1);
	Game.DestroySpaceship();

	Game.map = [];
	for(let i=0;i<=20;i++) {
		Game.map[i] = '@@@@@@@@@@@@@@@';
	}

	$('#GameWindow_Road').html('');
	$('#GameWindow_Objects').html(Game.DisplayMap([
		{y:11,text:"@@Press@Space@@"},
		{y:10,text:"@@@to@start.@@@"}
	], "Objects", {renderPlayer:false}));

	$('tab').click(function (e) {
		ToggleTab($(this).attr('id'));
	});

	Game.UpdateStatistics();
	$("#Changelog").html(Changelog.createChangelog());
});


Game.CurrentTab = 1;
Game.CHEAT = false;


Game.PositivePhrases = [
	"Good Luck!", "Having fun yet?", "Have fun!", "Kill &#39;em", "You can do it!",
	"Run run run", "Don&#39;t die", "Stay on the road", "Stay positive", "I&#39;m gonna do an internet!",
	"The time has come", "Your quest begins", "pow pow kachow", "pop click woosh", "Exhilaration",
	"You are an X", "You go on a quest", "Do well", "chicka chic pow", "Embody Luxury", "Precision", "Craftsmanship",
];

// defaults
Game.state.gameMode = 'normal';
Game.state.level = 1;
Game.state.nextLevelClass = -1;
Game.Bullet = [];

/* Generates the line (as text) */
Game.GenerateLine = function () {
	var Line = Game.BaseLine;

	/* Randomly start a new line every once in a while (Higher line size = less new lines) */
	if (Utility.getRandomInt(1, 30+Game.LineSize) == 1) {
		var x = Utility.getRandomInt(0,Game.LineSize-1);
		Game.LineReset[x] = 1;
		Game.LineLength[x] = Utility.getRandomInt(6, 22-Game.state.level);
	}

	if (Game.state.gameMode == 'normal')
  {
		var start = 0;
		var end = Game.LineSize;
	}
	else if (Game.state.gameMode == 'nightmare')
	{
		var start = 2;
		var end: any = Game.LineSize - 2;

		Line = Utility.setCharAt(Line, 0, '>');
		Line = Utility.setCharAt(Line, 1, '>');

		Line = Utility.setCharAt(Line, Game.LineSize - 1, '<');
		Line = Utility.setCharAt(Line, Game.LineSize - 2, '<');
	}

	/* Generate tiles and manage lines */
	for(let i=start; i<end; i++) {
		if (Game.LineLength[i] != 0) {
			var road = "`";

			if (Utility.getRandomInt(1, 1100) == 1) {
				road = 'I';
			}  else if (Utility.getRandomInt(1, 300) == 1) {
				road = 'P';
			} else if (Utility.getRandomInt(1, 900) === 1) {
				road = 'D';
			} else if (Utility.getRandomInt(1, 900) === 1 && Game.state.level >= 6) {
				road = 'W';
			} else if (Utility.getRandomInt(1, 900) === 1 && Game.state.level >= 3) {
				road = 'M';
			}

			Line = Utility.setCharAt(Line, i, road);

			/* Vertical line handler */
			Game.LineLength[i] -= 1;
			if (Game.LineLength[i] < Utility.getRandomInt(2, 6 - Math.floor(Game.state.level/4)) && Game.LineReset[i] != 0) {
				Game.LineReset[i] = 0;
				if ((Utility.getRandomInt(1, 2) == 1 && i != end - 1) || i == start) {
					Game.LineReset[i+1] = 1;
					Game.LineLength[i+1] = Utility.getRandomInt(6, 22 - Game.state.level);
				} else {
					Game.LineReset[i-1] = 1;
					Game.LineLength[i-1] = Utility.getRandomInt(6, 20 - Game.state.level);
				}
			}
		}
	}

	// at the end of the level
	if (Game.state.levelLines > Game.GetLevelLines(Game.state.level)-20) {
		for(let i=start; i<end; i++) {
			Line = Utility.setCharAt(Line, i, "%");
		}
	}

	return Line;
};

/* Adds a new line to the map array; called each tick */
Game.AddLine = function() {
	var newMap = [];
	for (let y = 1; y <= 20; y++) {
		newMap[y-1] = Game.map[y];
	}
	Game.map = newMap;
	Game.map[20] = Game.GenerateLine();
	Game.state.levelLines += 1;

	if (Game.state.levelLines < Game.GetLevelLines(Game.state.level)) {
		Game.state.stats.Lines += 1;
	}

	if (Game.Spaceship.exists)
	{
		Game.Spaceship.lines += 1;
	}

	return false;
};


Game.AddText = function ( txt ) {
	Game.messages.unshift( { ticks: 20, text: txt } );
};
Game.ProcessText = function () {
	for (let i=0;i<Game.messages.length;i++) {
		if (Game.messages[i] != []) {
			Game.messages[i].ticks -= 1;
			if (Game.messages[i].ticks == 0) {
				Game.messages.pop();
			} else {
				$('#GameWindow_Objects').append("<br>"+Game.messages[i].text);
			}
		}
	}
};

Game.Move = function (direction){
	if (Game.Active == true && Game.Paused == false) {
		switch(direction) {
			case 'right': direction = 1; break;
			case 'left': direction = -1; break;
		}

		var Tile2 = Game.map[2].split('')[Game.PlayerX];

		// if you don't have warp mode on the move is pretty simple
		if (Game.state.warp == 0) {
			Game.PlayerX += direction;
			if (Game.PlayerX > Game.LineSize-1 || Game.PlayerX < 0)
				Game.Over('Wall');

		// warp power up checks to find the next available line
		//   and if it doesn't find one its a wall game over ofc
		} else {
			var foundPosition = false;
			while (!foundPosition) {
				Game.PlayerX += direction;
				var Tile3 = Game.map[3].split('')[Game.PlayerX];

				// only check whats above you becuse athats the area you are moving to
				if (Tile3 == '`' || Tile3 == '%')
					foundPosition = true;

				if (Game.PlayerX > Game.LineSize-1)
				{
					Game.PlayerX = 0;
				}
				else if (Game.PlayerX < 0) {
					Game.PlayerX = Game.LineSize-1;
					// foundPosition = true;
				}
			}
		}

		if (Game.LineEntered[Game.PlayerX] == 1 && Tile2 != '%') {
			Game.LineEntered[Game.PlayerX] = 2;
			Game.state.stats.Score += 1;
			SFX.Score.play();
		} else {
			SFX.Noscore.play();
		}

		Game.state.stats.Moves += 1;

		var Tile2 = Game.map[2].split('')[Game.PlayerX];
		var Tile3 = Game.map[3].split('')[Game.PlayerX];

		if (Tile3 == '@' &&  Tile2 == '@' && Game.state.invincible == 0) {
			Game.Over('Abyss');
		}
	}
};


Game.DestroyBullet = function(id, type) {

	switch (type) {
		case 'player':
			Game.Bullet.splice(id, 1);
			break;
		case 'spaceship':
			Game.Spaceship.Bullet.splice(id, 1);
			break;
	}
};



Game.FireBullet = function(type) {
	if (Game.Paused == false && Game.Active == true) {
		if (type == 'player' && Game.Bullet.length === 0) {

			SFX.Shoot.play();
			Game.state.stats.ShotsFired += 1;
			if (Game.state.multishot == 0) {
				Game.Bullet.push({
					x: Game.PlayerX,
					y: 3,
				});

			} else {
				// multi shot activated
				Game.Bullet.push({
					x: Game.PlayerX-1,
					y: 2,
				});
				Game.Bullet.push({
					x: Game.PlayerX,
					y: 3,
				});
				Game.Bullet.push({
					x: Game.PlayerX+1,
					y: 2,
				});
				Game.state.multishot = 0 ;
			}

		} else if (type == 'spaceship' && Game.Spaceship.Bullet.length == 0) {

			SFX.Shoot.play();
			Game.Spaceship.Bullet.push({
				x: Game.Spaceship.x,
				y: Game.Spaceship.y,
			});

		}
	}
};

Game.CreateSpaceship = function() {
	if (Utility.getRandomInt(0, 1) == 0) {
		var x = Game.LineSize + 2;
		var dir = -1;
	} else {
		var x:any = -2;
		var dir = 1;
	}
	if (Utility.getRandomInt(1, 24) == 0)
		var disp = "^_~";
	else
		var disp = "<_>";

	Game.Spaceship = {
		exists: true,
		lines: Utility.getRandomInt(0, 30),
		move:false,
		flyaway:false,
		direction: dir,
		start:Game.state.stats.Lines,
		display:disp,
		Bullet:[],
		x: x,
		y: Utility.getRandomInt(16,20)
	}
};

Game.SetLevelClass = function(level) {
	for (var i = 1; i <= 9; i++) {
		$('#GameWindow_Road').removeClass("c"+i);
	}
	$('#GameWindow_Road').addClass("c"+level);
	for (var i = 1; i <= 9; i++) {
		$('#GameWindow_Objects').removeClass("d"+i);
	}
	$('#GameWindow_Objects').addClass("d"+level);
	for (var i = 1; i <= 9; i++) {
		$('.Xbox').removeClass("d"+i);
	}
	$('.Xbox').addClass("d"+level);
}

Game.GetLevelLines = function(level) {
	switch (level) {
		case 1: return 101; break;
		case 2: return 151; break;
		case 3: return 151; break;
		case 4: return 176; break;
		case 5: return 201; break;
		case 6: return 251; break;
		case 7: return 301; break;
		case 8: return 351; break;
		case 9: return 301 ; break;
	}
}

Game.DestroySpaceship = function() {
	Game.Spaceship = {
		exists:false,move:false,flyaway:false,start:0,direction:0,x:0,y:-1,Bullet:[]
	};
};

Game.UpdateSpeed = function (speed) {
	Game.BaseSpeed = speed;
	Game.CHEAT = true;
	$('#stats_tracked').html("<h3>Fun Mode: Your statistics are no longer tracked.</h3>");
	console.log("Updated Speed");
};

Game.UpdateVolume = function (volume) {
	Howler.volume(volume);
	Game.SaveFile.Volume = volume;
	Game.Save();
	console.log("Updated Volume");
};

Game.UpdateSize = function(size) {
	Game.LineSize = parseInt(size);
	var l = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@";
	Game.BaseLine = l.substr(0,Game.LineSize);
	if (Game.LineSize == 27) {
		$('.GameWindow').css('width', '250px');
	} else {
		$('.GameWindow').css('width', '200px');
	}

	$('#GameWindow_Road').html("Press spacebar to begin.");

	if (size != 15) {
		Game.CHEAT = true;
		$('#stats_tracked').html("<h3>Fun Mode: Your statistics are no longer tracked.</h3>");
	}

	return false;
};

Game.UpdateMode = function(mode) {
	if (Game.Active == true)
	{
		alert("Wait until a game is no longer active");
		$('#mode').val(Game.state.gameMode);
		return false;
	}

	if (mode == 'normal') {
		Game.state.gameMode = 'normal';
		Game.BaseSpeed = 110;
	} else {
		Game.state.gameMode = 'nightmare';
		Game.BaseSpeed = 60;
	}

	$('#high-score').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Score));
	$('#high-lines').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Lines));

	return true;
};

/* Toggles pause on and off */
Game.TogglePause = function () {
	if (Game.Active == true) {
		if (Game.Paused == false) {
			Game.Paused = true;
			clearInterval(Game.Interval);
			$("#GameWindow_Road").html(Game.DisplayMap([{y:10,text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"}], "Road"));
			$("#GameWindow_Objects").html(Game.DisplayMap([{y:10,text:"@--@PAUSED@--@"}], "Objects"));

		} else {
			Game.Paused = false;
			Game.CreateInterval(Game.BaseSpeed);
		}
	}
};

Game.isNewRecord = function () {
	if (Game.SaveFile.Record[Game.state.gameMode].Score < Game.state.stats.Score)
		return true;
	else
		return false;
}

Game.Over = function(DeathType) {
	SFX.GameOver.play();

	$('#linesize').css('display','inline');
	$('#mode').css('display','inline');
	Game.Active = false;
	clearInterval(Game.Interval);
	var Text = [
		{y:12, text:"@@@Game Over@@@@@@@@@@@@@@@@@@@@@"},
		{y:11, text:"@Score: "+Utility.format(Game.state.stats.Score)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:10, text:"@Lines: "+Utility.format(Game.state.stats.Lines)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:9, text:"@Level: "+Utility.format(Game.state.level)+"@@@@@@@@@@@@@@@@@@@@@@@@"}
	];
	if (Game.isNewRecord()) {
		Text.push({y:8, text:"@@High Score!@@@@@@@@@@@@@@@@@@@@@@@@@@@"});
		ToggleTab('6');
	}
		$("#GameWindow_Objects").html(Game.DisplayMap(Text, "Objects"));

	var Text = [
		{y:12, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:11, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:10, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:9, text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"},
	];
	if (Game.isNewRecord()) {
		Text.push({y:8, text: "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"});
		ToggleTab('6');
	}

	$("#GameWindow_Road").html(Game.DisplayMap(Text, "Road"));

	if(Game.CHEAT == false) {
		switch(DeathType) {
			case 'Spaceship': Game.SaveFile.Totals.DeathShot++; break;
			case 'Wall': Game.SaveFile.Totals.DeathWall++; break;
			case 'Abyss': Game.SaveFile.Totals.DeathAbyss++; break;
		}

		Game.SaveFile.Totals.GamesPlayed += 1;
		Game.SaveFile.Totals.Score += Game.state.stats.Score;
		Game.SaveFile.Totals.Lines += Game.state.stats.Lines;
		Game.SaveFile.Totals.ShipsDestroyed += Game.state.stats.ShipsDestroyed;
		Game.SaveFile.Totals.Powerups += Game.state.stats.Powerups;
		Game.SaveFile.Totals.Moves += Game.state.stats.Moves;
		Game.SaveFile.Totals.Time += Game.state.stats.Time;
		Game.SaveFile.Totals.ShotsFired += Game.state.stats.ShotsFired;
		Game.SaveFile.Totals.ShotsDestroyed += Game.state.stats.ShotsDestroyed;

		if (Game.isNewRecord()) {
			Game.SaveFile.Record[Game.state.gameMode] = {
				Score: Game.state.stats.Score,
				Lines: Game.state.stats.Lines
			}
			$('#high-score').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Score));
			$('#high-lines').html(Utility.format(Game.SaveFile.Record[Game.state.gameMode].Lines));
		}

		$('#total-score').html(Utility.format(Game.SaveFile.Totals.Score));
		$('#total-lines').html(Utility.format(Game.SaveFile.Totals.Lines));

		Game.Save();

		Game.UpdateStatistics();
	}
};

Game.CreateNewSaveFile = function() {
	if (localStorage["xquest_HighScore"] !== undefined) {
		var Record = {Score: parseInt(localStorage["xquest_HighScore"]),Lines: parseInt(localStorage["xquest_HighLines"])};
	} else {
		var Record = { Score:0, Lines: 0};
	}

	Game.SaveFile = {
		Version: Game.version,
		Volume: 0.3,
		Totals: {
			GamesPlayed: 0,
			Score: 0,
			Lines: 0,
			ShipsDestroyed: 0,
			Powerups: 0,
			Moves: 0,
			Time: 0,
			ShotsFired: 0,
			ShotsDestroyed: 0,
			Deaths: {
				Shot: 0,
				Wall: 0,
				Normal: 0
			}
		},
		Record: Record,
		Achievements: {

		}
	};
};

/* Save Game.SaveFile into localStorage */
Game.Save = function() {
	try {
		localStorage.setItem("XQuest", JSON.stringify(Game.SaveFile));
	}
	catch(e) {
		console.log(e);
		alert("Save Failed!");
	}
}

/* Load the save file from localStorage */
Game.Load = function() {
	var SaveFile = 'Invalid';
	try {
		SaveFile = localStorage.getItem("XQuest");
	}
	catch(err) {
		alert("Cannot access localStorage - browser may not support localStorage, or storage may be corrupt");
		return false;
	}

	/* If a save file does not exist, create a new one */
	if (!SaveFile) {
		Game.CreateNewSaveFile();
		Game.Save();
		Game.Load();
		return false;
	}
	if (SaveFile == 'Invalid') {
		alert("Save file not loaded.");
		return false;
	}

	Game.SaveFile = JSON.parse(SaveFile);

	if (Game.SaveFile.Version < 0.9) {
		Game.SaveFile.Totals.Time = Game.SaveFile.Totals.Lines * 0.12;
	}

	if (!Game.SaveFile.Volume)
		Game.SaveFile.Volume = 30;
	Game.UpdateVolume(Game.SaveFile.Volume);

	if (typeof Game.SaveFile.Record.nightmare == "undefined")
	{
		Game.SaveFile.Record = {
			normal: Game.SaveFile.Record,
			nightmare: { Score: 0, Lines: 0}
		}
	}


	console.log("Game Loaded");
};

Game.UpdateStatistics = function() {
	var Time = Game.SaveFile.Totals.Time;
	if(Time < 600) {
		Time = Utility.format(Time, 1) + " Seconds";
	} else if (Time < 36000) {
		Time = Utility.format(Time/60, 1) + " Minutes";
	} else {
		Time = Utility.format(Time / 3600, 1) + " Hours";
	}

	$('#Statistics').html(
		'<b>Games Played:</b> '+Utility.format(Game.SaveFile.Totals.GamesPlayed)+'<br>'+
		'<b>Score:</b> '+Utility.format(Game.SaveFile.Totals.Score)+'<br>'+
		'<b>Lines:</b> '+Utility.format(Game.SaveFile.Totals.Lines)+'<br>'+
		'<b>Times Moved:</b> '+Utility.format(Game.SaveFile.Totals.Moves)+'<br>'+
		'<b>Shots Fired:</b> '+Utility.format(Game.SaveFile.Totals.ShotsFired)+'<br>'+
		'<b>Shots Destroyed:</b> '+Utility.format(Game.SaveFile.Totals.ShotsDestroyed)+'<br>'+
		'<b>Ships Destroyed:</b> '+Utility.format(Game.SaveFile.Totals.ShipsDestroyed)+'<br>'+
		'<b>Powerups Collected:</b> '+Utility.format(Game.SaveFile.Totals.Powerups)+'<br>'+
		'<b>Deaths To The Abyss:</b> '+Utility.format(Game.SaveFile.Totals.DeathAbyss)+'<br>'+
		'<b>Deaths To The Ship:</b> '+Utility.format(Game.SaveFile.Totals.DeathShot)+'<br>'+
		'<b>Deaths To The Wall:</b> '+Utility.format(Game.SaveFile.Totals.DeathWall)+'<br>'+
		'<b>Time Played:</b> '+Time+'<br>'
	);
};

Game.LoadHighScore = function() {
	($ as any).ajax({
		method: "POST",
		data: {
			showHS: true,
			mode: Game.state.gameMode
		},
		url: 'ajax.php',
		success: function (data) {
			$('#highScoreList').html(data);

			if (typeof Game.state.displayLevel === "undefined")
				Game.SetLevelClass(1);
			else
				Game.SetLevelClass(((Game.state.displayLevel - 1) % 9 + 1));
		}

	});
}

Game.SendHighScore = function(data) {
	($ as any).ajax({
		method: "POST",
		data: {
			score: Game.state.stats.Score,
			username: $('#username').val(),
			stats: Game.state.stats,
			mode: Game.state.gameMode,
			version: Game.version
		},
		url: 'ajax.php',
		success: function(data) {
			ToggleTab('7');
			$('#HighScoreSubmit').html(data);
		}
	})
}


function ToggleTab(tab){
	for (let i = 0; i <= 12; i++) {
		$('[tab='+i+']').css('display', 'none');
		$('[id='+i+']').attr('class', 'x');
	}
	$('[tab='+tab+']').css('display', 'inline-block');
	$('[id='+tab+']').attr('class', 'selected');

	if (tab == 3) {
		Game.LoadHighScore();
	}

	if (tab == 0) {
		Game.CalculateStuff();
	}

	Game.CurrentTab = tab;
}

// Game.CalculateStuff = function() {
// 	var temp = Game.state.displayLevel;
// 	let text = "Easter Egg? There's a Kill Screen <br><br>";
// 	text += "Calculating Time to Reach Kill Screen<br>";

// 	Game.state.displayLevel = 0;
// 	let totalLines = 0;
// 	for (var Level = 0; Level <= 5000; Level++) {
// 		Game.state.displayLevel++;
// 		let x = Game.state.displayLevel;
// 		if (x > 9) x = 9;
// 		totalLines += Game.GetLevelLines(x);
// 		if (Game.state.isKillScreen())
// 			break;
// 	}
// 	text += "Kill Screen Level: " + Game.state.displayLevel;
// 	text += "<br>Lines: " + totalLines;
// 	text += "<br>Base Clock: " + Game.BaseSpeed + "ms";
// 	text += "<br>Time: " + totalLines * Game.BaseSpeed / 1000 / 60 + " minutes"
// 	Game.state.displayLevel = temp;
// 	$('[tab=0]').html(text);

// };