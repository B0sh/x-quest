<?php
$v = 0.95;
/*
	Move text to left hand bar?
*/
?><!DOCTYPE html>
<html>
	<head>
		<title>X-Quest</title>
		<script src='jquery.js' type='text/javascript'></script>
		<script type="text/javascript">
function setCharAt(str,index,chr) {
    if(index > str.length-1 || index < 0) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}
function Contains(x, min, max) {
  return x >= min && x <= max;
}
/* phpjs number_format */
function Format(number, decimals, dec_point, thousands_sep) {
  //  discuss at: http://phpjs.org/functions/number_format/

  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

Game = {};

Game.Updates = [
	[	'v0.95',
		'August 3rd 2016',
		'Added a high score list.'
	],
	[	'v0.9',
		'September 12th 2014',
		'Added a changelog.',
		'More layout changes.',
		'Pellets now give less score from leveling up.',
		'Time played is now tracked.',
		'Added sound effects.'
	],
	[	'v0.81',
		'June 16th 2014',
		'Pausing during a game over will cause it to revive you.',
		'You couldn&#39;t shoot ship bullets.'
	],
	[	'v0.8',
		'June 13th 2014',
		'Ships fly on and off the screen instead of disappearing',
		'Added tabbed windows',
		'Statistics window now tracks many more types of statistics',
		'New save file storage system (All previous saves had to be wiped)'
	]
];


Game.CurrentTab = 1;
Game.Active = false;
Game.CHEAT = false;
Game.Version = <?=$v?>;
Game.BaseSpeed = 120; //milliseconds
Game.PositivePhrases = [
	"Good Luck!", "Having fun yet?", "Have fun!", "Kill &#39;em", "You can do it!",
	"Run run run", "Don&#39;t die", "Stay on the road", "Stay positive", "I&#39;m gonna do an internet!",
	"The time has come", "Your quest begins", "pow pow kachow", "",
	"You are an X", "Indubitably"
];

/* Called each time a new game begins; sets game variables */
Game.Start = function() {
	if (Game.Active == true)
		return false;

	Game.Active = true;
	Game.Paused = false;
	Game.Invincible = 0;
	Game.Distortion = 0;
	Game.Text = [];
	Game.Level = 1;
	Game.map = [];
	Game.LineLength = [];
	Game.LineReset = [];
	Game.LineEntered = [];
	Game.RoadTile = '<span class="c'+Game.Level+'">|</span>';
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

	/* "Destroying" = Create empty objects */
	Game.DestroyBullet('player');
	Game.DestroySpaceship();

	/* Player spawns in the middle location */
	var mid = Math.floor((Game.LineSize - 1) / 2);
	Game.PlayerX = mid;

	for(var i = 0; i < Game.LineSize; i++) {
		// if the location is one of the 3 middle columns then make a line there
		if (Contains(i, mid-1, mid+1))
			x = 1;
		else x = 0;

    	Game.LineLength.push(x*25);
    	Game.LineReset.push(x);
    	Game.LineEntered.push(x);
	}

	$('#linesize').css('display','none');
	$('#level').html(Game.Level);

	/* Generate the first 20 lines */
	for (y = 0; y <= 20; y++) {
		var Line = Game.GenerateLine();
		Game.map[y] = Line;
	}

	/* If you're on the high score screen and a new game starts don't let it submit */
	if (Game.CurrentTab == 6 || Game.CurrentTab == 7) {
		ToggleTab('1');
	}

	/* Add a positive phrase in the text field */
	Game.AddText( Game.PositivePhrases[getRandomInt(0, (Game.PositivePhrases.length-1))] );

	/* Lets get this party started */
	Game.CreateInterval(Game.BaseSpeed);
	console.log('Game Started');
};

/* Generates the line (as text) */
Game.GenerateLine = function () {
	var Line = Game.BaseLine;

	/* Randomly start a new line every once in a while (Higher line size = less new lines) */
	if (getRandomInt(1, 30+Game.LineSize) == 1) {
		var x = getRandomInt(0,Game.LineSize-1);
		Game.LineReset[x] = 1;
		Game.LineLength[x] = getRandomInt(6, 22-Game.Level);
	}

	/* Generate tiles and manage lines */
	for(i=0; i<Game.LineSize; i++) {
		if (Game.LineLength[i] != 0) {
			var road = "`";
			if ((Game.Stats.Lines+1) % 250 == 0 && Game.Level != 9) {
				road = "L";
			} else if (getRandomInt(1, 1100) == 1) {
				road = "I";
			}  else if (getRandomInt(1, 300) == 1) {
				road = "P";
			} else if (getRandomInt(1, 900) === 1) {
				road = "D";
			}
			Line = setCharAt(Line, i, road);

			/* Vertical line handler */
			Game.LineLength[i] -= 1;
			if (Game.LineLength[i] < getRandomInt(2, 6 - Math.floor(Game.Level/4)) && Game.LineReset[i] != 0) {
				Game.LineReset[i] = 0;
				if ((getRandomInt(1, 2) == 1 && i != Game.LineSize - 1) || i == 0) {
					Game.LineReset[i+1] = 1;
					Game.LineLength[i+1] = getRandomInt(6, 22 - Game.Level);
				} else {
					Game.LineReset[i-1] = 1;
					Game.LineLength[i-1] = getRandomInt(6, 20 - Game.Level);
				}
			}
		}
	}

	return Line;
};

/* Adds a new line to the map array; called each tick */
Game.AddLine = function() {
	var newMap = [];
	for (y = 1; y <= 20; y++) {
		newMap[y-1] = Game.map[y];
	}
	Game.map = newMap;
	Game.map[20] = Game.GenerateLine();
	Game.Stats.Lines+=1;

	return false;
};

/* Render the game map from the Game.map array of lines */
Game.DisplayMap = function(Text) {
	var Map = "";
	for (y = 20; y >= 0; y--) {
		var Line = Game.map[y];

		if (y == Game.Bullet.y)
			Line = setCharAt(Line, Game.Bullet.x, "^");
		if (y == Game.Spaceship.Bullet.y)
			Line = setCharAt(Line, Game.Spaceship.Bullet.x, "v");
		if (y == 2)
			Line = setCharAt(Line, Game.PlayerX, "X");
		if (y == Game.Spaceship.y) {
			Line = setCharAt(Line, Game.Spaceship.x,   Game.Spaceship.display[0]);
			Line = setCharAt(Line, Game.Spaceship.x+1, Game.Spaceship.display[1]);
			Line = setCharAt(Line, Game.Spaceship.x+2, Game.Spaceship.display[2]);
		}

		if (Text != false) {
			for (i=0;i<Text.length;i++) {
				if (Text[i].y == y)
					Line = Text[i].text.substr(0,Game.LineSize);
			}
		}

		Map += "#"+replaceAll('`', Game.RoadTile, replaceAll('@', '&nbsp;', Line))+"#<br>";
	}
	return Map;
};

/* Main Game loop, main function is to process tiles and update map */
Game.CreateInterval = function(speed) {
	/* If a game loop exists already; kill it */
	clearInterval(Game.Interval);
	Game.CurrentSpeed = speed/1000;
	Game.Interval = setInterval(function() {
		Game.AddLine();
		$("#GameWindow").html(Game.DisplayMap(false));
		Game.Stats.Time += Game.CurrentSpeed;

		/* Create lines by the player for scoring purposes */
		for(x=0; x<Game.LineSize; x++) {
			if (Game.map[3].charAt(x) == '@')
				Game.LineEntered[x] = 0;
			else if (Game.LineEntered[x] == 0)
				Game.LineEntered[x] = 1;
		}

		var Tile = Game.map[2].split('')[Game.PlayerX];
		switch (Tile) {
			case '|': break;
			case 'P':
				Game.PlaySound('bonus.wav');
				Game.Stats.Score += (Game.Level*2)+2;
				Game.Stats.Powerups += 1;
				Game.AddText("+"+((Game.Level*2)+2)+" Score");
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
			case 'I':
				Game.Invincible = 50;
				Game.Stats.Powerups += 1;
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				Game.PlaySound('power.ogg');
				break;
			case 'L':
				Game.Level += 1;
				Game.RoadTile = '<span class="c'+Game.Level+'">|</span>';
				Game.AddText("<b>LEVEL "+Game.Level+"</b>");
				$('#level').html(Game.Level);
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				Game.PlaySound('level.wav');
				break;
			case 'D':
				Game.Distortion = 25;
				Game.Stats.Powerups += 1;
				Game.CreateInterval(Game.BaseSpeed*2);
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				Game.PlaySound('power.ogg');
				break;
			case '@':
				if (Game.Invincible == 0) {
					Game.Over('Normal');
				}
				break;
		}


		/* Bullet handling */
		if (Game.Bullet.exists == true) {
			Game.Bullet.y += 1;
			if (Game.Bullet.y == 21)
				Game.DestroyBullet('player');

			if (Game.Spaceship.exists == true &&
				Game.Bullet.y == Game.Spaceship.y &&
				Contains(Game.Bullet.x, Game.Spaceship.x, Game.Spaceship.x+2)) {
					Game.DestroyBullet('player');
					Game.Stats.Score += 10;
					Game.Stats.ShipsDestroyed += 1;
					Game.AddText("Hit! +10 Score");
					Game.DestroySpaceship();
					Game.PlaySound('explosion.ogg');
			}
			if ((Game.Spaceship.Bullet.y == Game.Bullet.y || Game.Spaceship.Bullet.y+1 ==Game.Bullet.y) &&
				Game.Bullet.x == Game.Spaceship.Bullet.x && Game.Bullet.y != -1) {
					Game.DestroyBullet('player');
					Game.DestroyBullet('Spaceship');
					Game.Stats.ShotsDestroyed += 1;
			}
		}

		/* Spaceship handling */
		if (Game.Spaceship.exists == true) {
			if ((Game.Stats.Lines % 30) == 0) Game.Spaceship.y -= 1;

			/* Spaceship movement */
			if (Game.Spaceship.move == false) {
				Game.Spaceship.move = true;
			} else {
				if (Game.Spaceship.flyaway == false) {
					if(Game.Spaceship.x >= getRandomInt(Math.floor(Game.LineSize*.7), Game.LineSize-3)
					 && Game.Spaceship.direction == 1) {
						Game.Spaceship.direction *= -1;
					}
					if(Game.Spaceship.x <= getRandomInt(1, Math.floor(Game.LineSize*.3)) && Game.Spaceship.direction == -1) {
						Game.Spaceship.direction *= -1;
					}
				}

				Game.Spaceship.move = false;
				Game.Spaceship.x += Game.Spaceship.direction;
			}

			/* Spaceship bullet handling */
			if (Game.Spaceship.Bullet.exists == false && getRandomInt(1, 5) == 1 && Game.Spaceship.flyaway == false) {
				Game.Spaceship.Bullet = {
					exists: true,
					x: Game.Spaceship.x,
					y: Game.Spaceship.y
				}
			} else {
				Game.Spaceship.Bullet.y -= 1;
				if (Game.Spaceship.Bullet.y == 0) Game.DestroyBullet('Spaceship');
				if (Game.Spaceship.Bullet.y == 1 && Game.Spaceship.Bullet.x == Game.PlayerX && Game.Invincible == 0) {
					Game.DestroyBullet('Spaceship');
					Game.Over('Spaceship');
				}
			}

			/* After 150 lines after the spaceship has spawned make it fly away (now) */
			if ((Game.Spaceship.start+150 ) < Game.Stats.Lines) {
				Game.Spaceship.flyaway = true;
			}

			/* Destroy spaceship after it has flown off the screen */
			if (Game.Spaceship.x == -3 || Game.Spaceship.x == (Game.LineSize+3)) {
				Game.DestroySpaceship();
			}
		} else {
			/* Randomly generate spaceships every 100 lines at 1/4 chance */
			if ((1+Game.Stats.Lines) % 100 == 0 &&
				(getRandomInt(1, 4) == 1 || Game.Stats.Lines < 150))  {
				Game.CreateSpaceship();
			}
		}

		$('#score').html(Format(Game.Stats.Score));
		$('#lines').html(Format(Game.Stats.Lines));

		if (Game.isNewRecord() && Game.HighScore == false) {
			Game.HighScore = true;
			Game.AddText("<b>High Score!</b>");
		}
		if (Game.Invincible != 0) {
			Game.Invincible -= 1;
			$('#GameWindow').append('<br><b>INVINCIBILITY:</b> '+Game.Invincible);
		}
		if (Game.Distortion != 0) {
			Game.Distortion -= 1;
			if (Game.Distortion == 0) {
				Game.CreateInterval(Game.BaseSpeed);
			}
			$('#GameWindow').append('<br><b>Distortion:</b> '+Game.Distortion);
		}

		Game.ProcessText();
	}, speed);
};

Game.AddText = function ( txt ) {
	Game.Text.unshift( { ticks: 20, text: txt } );
};
Game.ProcessText = function () {
	for (i=0;i<Game.Text.length;i++) {
		if (Game.Text[i] != []) {
			Game.Text[i].ticks -= 1;
			if (Game.Text[i].ticks == 0) {
				Game.Text.pop();
			} else {
				$('#GameWindow').append("<br>"+Game.Text[i].text);
			}
		}
	}
};

Game.Move = function (direction){
	if (Game.Active == true && Game.Paused == false) {
		switch(direction) {
			case 'right':
				Game.PlayerX += 1;
				if (Game.PlayerX > Game.LineSize-1)
					Game.Over('Wall');
				break;
			case 'left':
				Game.PlayerX -= 1;
				if (Game.PlayerX < 0)
					Game.Over('Wall');
				break;
		}
		if (Game.LineEntered[Game.PlayerX] == 1) {
			Game.LineEntered[Game.PlayerX] = 2;
			Game.Stats.Score += 1;
			Game.PlaySound('score.ogg');
		} else Game.PlaySound('noscore.ogg');
		Game.Stats.Moves += 1;
	}
};
Game.DestroyBullet = function(type) {
	var bullet = {
		exists:false,
		x:0,
		y:-1
	};
	switch (type) {
		case 'player': Game.Bullet = bullet; break;
		case 'Spaceship': Game.Spaceship.Bullet = bullet; break;
	}
};
Game.FireBullet = function(type) {
	if (Game.Paused == false && Game.Active == true) {
		if (type == 'player' && Game.Bullet.exists == false) {
			Game.PlaySound('shoot.ogg');
			Game.Stats.ShotsFired += 1;
			Game.Bullet = {
				exists: true,
				x: Game.PlayerX,
				y: 2
			};
		} else if (type == 'Spaceship' && Game.Spaceship.Bullet.exists == false) {
			Game.PlaySound('shoot.ogg');
			Game.Bullet = {
				exists: true,
				x: Game.Spaceship.x,
				y: Game.Spaceship.y
			};
		}
	}
};
Game.CreateSpaceship = function() {
	if (getRandomInt(0, 1) == 0) {
		var x = Game.LineSize + 2;
		var dir = -1;
	} else {
		var x = -2;
		var dir = 1;
	}
	if (getRandomInt(0, 20) == 0) {
		var disp = "^_~";
	} else var disp = "<_>";


	Game.Spaceship = {
		exists: true,
		move:false,
		flyaway:false,
		direction: dir,
		start:Game.Stats.Lines,
		display:disp,
		Bullet:{
			exists:false,
			x:0,
			y:-1
		},
		x: x,
		y: getRandomInt(16,20)
	}
};
Game.DestroySpaceship = function() {
	Game.Spaceship = {
		exists:false,move:false,flyaway:false,start:0,direction:0,x:0,y:-1,Bullet:{exists:false,x:0,y:-1}
	};
}
Game.UpdateSpeed = function (speed) {
	Game.BaseSpeed = speed;
	Game.CHEAT = true;
	console.log("Updated");
};

Game.UpdateSound = function (sound) {
	Game.SaveFile.Sound = sound;
	Game.Save();
	console.log("Updated Sound");
};
Game.UpdateSize = function(size) {
	Game.LineSize = parseInt(size);
	var l = "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@";
	Game.BaseLine = l.substr(0,Game.LineSize);
	if (Game.LineSize == 27) {
		$('#GameWindow').css('width', '250px');
	} else {
		$('#GameWindow').css('width', '200px');
	}
	$('#GameWindow').html("Press spacebar to begin.");
	return false;
};
/* Toggles pause on and off */
Game.TogglePause = function () {
	if (Game.Active == true) {
		if (Game.Paused == false) {
			Game.Paused = true;
			clearInterval(Game.Interval);
			$("#GameWindow").html(Game.DisplayMap([{y:10,text:"@PAUSED@@@@@@@@@@@@@@@@@@@@@@@@@"}]));
		} else {
			Game.Paused = false;
			Game.CreateInterval(Game.BaseSpeed);
		}
	}
};

Game.isNewRecord = function () {
	if (Game.SaveFile.Record.Score < Game.Stats.Score)
		return true;
	else
		return false;
}

Game.Over = function(DeathType) {
	Game.PlaySound('gameover.ogg');

	$('#linesize').css('display','inline');
	Game.Active = false;
	clearInterval(Game.Interval);
	var Text = [
		{y:12, text:"@@@Game Over@@@@@@@@@@@@@@@@@@@@@"},
		{y:11, text:"@Score: "+Format(Game.Stats.Score)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:10, text:"@Lines: "+Format(Game.Stats.Lines)+"@@@@@@@@@@@@@@@@@@@@@@@@"},
		{y:9, text:"@Level: "+Format(Game.Level)+"@@@@@@@@@@@@@@@@@@@@@@@@"}
	];
	if (Game.isNewRecord()) {
		Text.push({y:8, text:"@@High Score!@@@@@@@@@@@@@@@@@@@@@@@@@@@"});
		ToggleTab('6');
	}

	$("#GameWindow").html(Game.DisplayMap(Text));

	if(Game.CHEAT == false) {
		switch(DeathType) {
			case 'Spaceship': Game.SaveFile.Totals.Deaths.Shot++; break;
			case 'Wall': Game.SaveFile.Totals.Deaths.Wall++; break;
			case 'Normal': Game.SaveFile.Totals.Deaths.Normal++; break;
		}
		Game.SaveFile.Totals.GamesPlayed += 1;
		Game.SaveFile.Totals.Score += Game.Stats.Score;
		Game.SaveFile.Totals.Lines += Game.Stats.Lines;
		Game.SaveFile.Totals.ShipsDestroyed += Game.Stats.ShipsDestroyed;
		Game.SaveFile.Totals.Powerups += Game.Stats.Powerups;
		Game.SaveFile.Totals.Moves += Game.Stats.Moves;
		Game.SaveFile.Totals.Time += Game.Stats.Time;
		Game.SaveFile.Totals.ShotsFired += Game.Stats.ShotsFired;
		Game.SaveFile.Totals.ShotsDestroyed += Game.Stats.ShotsDestroyed;

		if (Game.isNewRecord()) {
			Game.SaveFile.Record = {
				Score: Game.Stats.Score,
				Lines: Game.Stats.Lines
			}
			$('#high-score').html(Format(Game.SaveFile.Record.Score));
			$('#high-lines').html(Format(Game.SaveFile.Record.Lines));
		}

		$('#total-score').html(Format(Game.SaveFile.Totals.Score));
		$('#total-lines').html(Format(Game.SaveFile.Totals.Lines));

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
		Version: Game.Version,
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
		if (err instanceof SecurityError)
			alert("Browser security settings blocked access to local storage.");
		else
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
		Game.SaveFile.Sound = 'y';
	}

	console.log("Game Loaded");
};

Game.PlaySound = function(sound) {
	document.getElementById("Sound").src = "Sound/"+sound;
	if (Game.SaveFile.Sound == 'y') {
		document.getElementById("Sound").play();
	}
	return true;
}

Game.UpdateStatistics = function() {
	var Time = Game.SaveFile.Totals.Time;
	if(Time < 600) {
		Time = Format(Time, 1) + " Seconds";
	} else if (Time < 36000) {
		Time = Format(Time/60, 1) + " Minutes";
	} else {
		Time = Format(Time / 3600, 1) + " Hours";
	}

	$('#Statistics').html(
		'<b>Games Played:</b> '+Format(Game.SaveFile.Totals.GamesPlayed)+'<br>'+
		'<b>Score:</b> '+Format(Game.SaveFile.Totals.Score)+'<br>'+
		'<b>Lines:</b> '+Format(Game.SaveFile.Totals.Lines)+'<br>'+
		'<b>Times Moved:</b> '+Format(Game.SaveFile.Totals.Moves)+'<br>'+
		'<b>Shots Fired:</b> '+Format(Game.SaveFile.Totals.ShotsFired)+'<br>'+
		'<b>Shots Destroyed:</b> '+Format(Game.SaveFile.Totals.ShotsDestroyed)+'<br>'+
		'<b>Ships Destroyed:</b> '+Format(Game.SaveFile.Totals.ShipsDestroyed)+'<br>'+
		'<b>Powerups Collected:</b> '+Format(Game.SaveFile.Totals.Powerups)+'<br>'+
		'<b>Deaths To The Abyss:</b> '+Format(Game.SaveFile.Totals.Deaths.Normal)+'<br>'+
		'<b>Deaths To The Ship:</b> '+Format(Game.SaveFile.Totals.Deaths.Shot)+'<br>'+
		'<b>Deaths To The Wall:</b> '+Format(Game.SaveFile.Totals.Deaths.Wall)+'<br>'+
		'<b>Time Played:</b> '+Time+'<br>'
	);
};

Game.CreateChangelog = function() {
	var Changelog = '';
	for(q=0;q<Game.Updates.length;q++) {
		Changelog += 'X-Quest '+Game.Updates[q][0]+' : '+Game.Updates[q][1]+'<br>'
		for(w=2;w<Game.Updates[q].length;w++) {
			Changelog += ' &bull; '+Game.Updates[q][w]+'<br>';
		}
		Changelog += '<br>';
	}
	return Changelog;
};

Game.LoadHighScore = function() {
	$.ajax({
		method: "POST",
		data: {
			showHS: true
		},
		url: 'ajax.php',
		success: function (data) {
			$('#highScoreList').html(data);
		}

	});
}

Game.SendHighScore = function(data) {
	$.ajax({
		method: "POST",
		data: {
			score: Game.Stats.Score,
			username: $('#username').val(),
			stats: Game.Stats
		},
		url: 'ajax.php',
		success: function(data) {
			ToggleTab('7');
			$('#HighScoreSubmit').html(data);
		}
	})
}

$(document).ready(function() {
	Game.Load();

	/* Add the total score and lines from localStorage */
	$('#high-score').html(Format(Game.SaveFile.Record.Score));
	$('#high-lines').html(Format(Game.SaveFile.Record.Lines));
	$('#total-score').html(Format(Game.SaveFile.Totals.Score));
	$('#total-lines').html(Format(Game.SaveFile.Totals.Lines));

	/* Default to medium size */
	Game.UpdateSize(15);
	Game.DestroyBullet('player');
	Game.DestroySpaceship();

	Game.map = [];
	for(i=0;i<=20;i++) {
		Game.map[i] = '@@@@@@@@@@@@@@@';
	}

	$('#GameWindow').html(Game.DisplayMap([
		{y:11,text:"@@Press@Space@@"},
		{y:10,text:"@@@to@start.@@@"},
		{y:2 ,text:"@@@@@@@@@@@@@@@"}
	]));

	$('tab').click(function (e) {
		ToggleTab($(this).attr('id'));
	});

	Game.UpdateStatistics();
	$("#Changelog").html(Game.CreateChangelog());
});

$(document).keydown(function(e) {
	var code = e.keyCode;
	switch (code) {
		case 82: Game.Active = false; Game.Start(); break;
		case 37: case 65: Game.Move('left');         break; //Right arrow or "a"
		case 39: case 68: Game.Move('right');        break; //Left arrow or "d"
		case 38: case 87: Game.FireBullet('player'); break; //Up arrow or "w"
		case 32:
			if (Game.Active == false) {
				Game.Start();//Spacebar to start
			} else {
				Game.TogglePause(); //Spacebar to pause
			}
			break;
		default: return true;
	}
	return false;
});


function ToggleTab(tab){
	for (i=0;i<=12;i++) {
		$('[tab='+i+']').css('display', 'none');
		$('[id='+i+']').attr('class', 'x');
	}
	$('[tab='+tab+']').css('display', 'inline-block');
	$('[id='+tab+']').attr('class', 'selected');

	if (tab == 3) {
		Game.LoadHighScore();
	}

	Game.CurrentTab = tab;
}
	</script>
	</head>
	<body>
		<style>
		.c1,.c2,.c3,.c4,.c5,.c6,.c7,.c8,.c9,.header{font-weight:bold;}
		.c1 { color: blue; }
		.c2 { color: #FF0000; }
		.c3 { color: green; }
		.c4 { color: orange; }
		.c5 { color: magenta; }
		.c6 { color: purple; }
		.c7 { color: brown; }
		.c8 { color: black; }
		.c9 { color: #0000FF; }

		body{
			font-family:monospace;
			font-size:1em;
			margin:0px;
		}
		.Window {
			float:left;
			min-height:400px;
		}
		.header {
			font-size:20px;
		}
		.TabContainer tab {
			float:left;
			width:147px;
			text-align:center;
			margin-bottom:10px;
			font-size:16px;
			padding-top:4px;
			padding-bottom:4px;
			color:black;
			cursor:pointer;
			font-weight:bold;
		   -webkit-touch-callout: none;
		   -webkit-user-select: none;
		   -khtml-user-select: none;
		   -moz-user-select: none;
		   -ms-user-select: none;
			user-select: none;

			border-right:1px solid black;
			border-bottom:1px solid black;
		}
		.TabContainer .selected {
			color:blue;
		}
		.TabWindow {
			display:none;
		}
		#GameInfo {
			width:750px;
			text-align:left;
		}
		</style>
		<audio id="Sound" src="" style="display:none;"></audio>
	<div style="width:1200px;">
		<div class="TabContainer">
			<tab id="0" style="width:398px;"> X-Quest v<?=$v?> </tab>
			<tab id="1" class="selected">Instructions</tab>
			<tab id="2">Options</tab>
			<tab id="3">High Scores</tab>
			<tab id="4">Statistics</tab>
			<tab id="5">Changelog</tab>
		</div>
	</div>

	<div id="container" style="width:1200px;text-align:center;">
	<div id="outer_container">
		<div class="Window" style="width:200px;">
			<b>Current Game:</b><br>
			<div style="width:200px;">
				<div style="width:120px;text-align:right;float:left">Score:&nbsp;</div>
				<div style="width:80px;text-align:left;float:left" id="score">0</div>
			</div>
			<div style="width:200px;">
				<div style="width:120px;text-align:right;float:left">Lines Passed:&nbsp;</div>
				<div style="width:80px;text-align:left;float:left" id="lines">0</div>
			</div>
			<div style="width:200px;">
				<div style="width:120px;text-align:right;float:left">Level:&nbsp;</div>
				<div style="width:80px;text-align:left;float:left" id="level">0</div>
			</div><br><br><br><br>

			<b>High Score:</b><br>
			<div style="width:200px;">
				<div style="width:120px;text-align:right;float:left">Score:&nbsp;</div>
				<div style="width:80px;text-align:left;float:left" id="high-score">0</div>
			</div>
			<div style="width:200px;">
				<div style="width:120px;text-align:right;float:left">Lines Passed:&nbsp;</div>
				<div style="width:80px;text-align:left;float:left" id="high-lines">0</div>
			</div><br><br><br><br>
		</div>
		<div class="Window" style="margin-top:2px;" id="GameWindow">
			X-Quest required JavaScript to be enabled.
		</div>

		<div class="Window" id="GameInfo">
<div class="TabWindow" tab="0">
	Easter Egg?
</div>
<div class="TabWindow" style="display:inline;" tab="1">
	You are a X that goes on a quest.<br>
	The quest is to stay on the road. (Don&#39;t get shot either)<br>
	Score is earned by moving to a new line.<br>
	Each level makes the lines progressively shorter.<br><br>

	Controls:<br>
	Left and Right (or A and D) to move your character left and right.<br>
	Up (or W) to shoot the spaceships (or spaceship bullets).<br>
	Spacebar to start/reset the game.<br><br>

	Special Tiles:<br>
	L (Level): Land on this tile to level up<br>
	I (Invulnerable): Invincibility for 50 lines<br>
	P (Pellet): Score bonus.<br>
	D (Distortion): Halves game speed for 25 turns<br>

	<br>X-Quest v<?=$v?> by <a href="http://tpkrpg.net/">B0sh</a> &copy; 2014-<?=date('Y')?>
</div>
<div class="TabWindow" tab="2">
	<b>Sound:</b> <select id="sound" onchange="Game.UpdateSound($('#sound').val());">
		<option value="y"> Enabled </option>
		<option value="n"> Disabled </option>
	</select><br><br>

	<b>Board Size:</b> <select id="linesize" onchange="Game.UpdateSize($('#linesize').val());">
		<option value="9"> Small </option>
		<option value="15" selected> Medium </option>
		<option value="21"> Long </option>
		<option value="27"> Extra Long </option>
	</select><br><br>

	For each of the below options, changing them will result in statistics (ex: high score) not being recorded. Refreshing will reset these.<br><br>

	<b>Game Speed:</b> <input type="text" value="120" size="2" id="speed" onchange="Game.UpdateSpeed($('#speed').val());" /> (ms)
</div>
<div class="TabWindow" tab="3">
	High Scores<br><br>

	<div id="highScoreList">Loading...</div>
</div>
<div class="TabWindow" id="Statistics" tab="4">

</div>
<div class="TabWindow" tab="5" id="Changelog"style="overflow:scroll;overflow-x:hidden;height:350px;width:740px;">
</div>
<div class="TabWindow" tab="6" id="HighScoreEnter">

	Congratulations on your HIGH SCORE!<br><br>

	Would you like to submit it to the FUN-ONLY X-Quest High score list?<br><br>

	<form method="POST">
		<b>Nickname:</b> (Registering not enforced)<br>
		<input type="text" value="" name="nickname" id="username" /><br>
		<input type="submit" value="Send It Away" onclick="Game.SendHighScore(); return false;" />
	</form>

</div>
<div class="TabWindow" tab="7" id="HighScoreSubmit">


</div>

		</div>
	</div>
</div>

	</body>
</html>
