<?php
$v = "1.0";

// /"{"Version":0.95,"Totals":{"GamesPlayed":339,"Score":13093,"Lines":79114,"ShipsDestroyed":138,"Powerups":680,"Moves":11561,"Time":10202.040000000103,"ShotsFired":856,"ShotsDestroyed":71,"Deaths":{"Shot":5,"Wall":17,"Normal":317}},"Record":{"Score":816,"Lines":3570},"Achievements":{},"Sound":"y","Volume":"20"}"

/*
	Move text to left hand bar?
*/
?><!DOCTYPE html>
<html>
	<head>
		<title>X-Quest</title>
  	<link rel="shortcut icon" type="image/x-icon" href="xquest-favicon.png" />
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
	[ 'v1.0',
		'October 30th 2017',
		'New colors; Black Page conversion.',
		'New breaks at Levels.',
		'New Road Tiles with smooth tiling.',
		'New Powerup: Warp',
		'Added Volume Slider.',
		'Fixed double jumping bug.'
	],
	[	'v0.96',
		'October 20th 2017',
		'Added a favicon for style consistiency.'
	],
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
Game.SFX = {
	"Noscore": new Audio("Sound/noscore.wav"),
	"LevelUp": new Audio("Sound/level.wav"),
	"Bonus": new Audio("Sound/bonus.wav"),
	"Explosion": new Audio("Sound/explosion.wav"),
	"Score": new Audio("Sound/score.wav"),
	"Power": new Audio("Sound/power.wav"),
	"Shoot": new Audio("Sound/shoot.wav"),
	"GameOver": new Audio("Sound/gameover.wav"),
};

Game.BaseSpeed = 120; //milliseconds
Game.PositivePhrases = [
	"Good Luck!", "Having fun yet?", "Have fun!", "Kill &#39;em", "You can do it!",
	"Run run run", "Don&#39;t die", "Stay on the road", "Stay positive", "I&#39;m gonna do an internet!",
	"The time has come", "Your quest begins", "pow pow kachow", "pop click woosh", "x, dgd or bge?",
	"You are an X", "You go on a quest", "High Score?", "Do well", "chicka chic pow",
];

// var endZoneChar = '▓';
var endZoneChar = '.';
var roadChar = '|';
var endChar = '';

/* Called each time a new game begins; sets game variables */
Game.Start = function() {

	if (Game.Active == true) {

		if ( Game.LevelLines > Game.GetLevelLines(Game.Level)-20) {
			Game.Warp = 0;
			Game.Invincible = 25;
			if (Game.Distortion != 0) {
				Game.CreateInterval(Game.BaseSpeed);
				Game.Distortion = 0;
			}
			Game.LevelLines = 0;
			Game.Text = [];

			Game.Level++;
			if (Game.Level == 10)
				Game.Level = 9;

			Game.SetLevelClass(Game.Level);
			$('#level').html(Game.Level);
			Game.SFX.LevelUp.play();
		}
		return false;
	}
	Game.Active = true;
	Game.Paused = false;
	Game.Warp = 0;
	Game.Invincible = 0;
	Game.Distortion = 0;
	Game.Text = [];
	Game.Level = 1;
	Game.LevelLines = 0;
	Game.map = [];
	Game.LineLength = [];
	Game.LineReset = [];
	Game.LineEntered = [];
	// Game.RoadTile = '<span class="c'+Game.Level+'">' + roadChar + '</span>';
	Game.RoadTile = roadChar;
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

	Game.SetLevelClass(1);

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
			// if ((Game.Stats.Lines+1) % 250 == 0 && Game.Level != 9) {
			// 	road = "L";
			// } else
			if (getRandomInt(1, 1100) == 1) {
				road = "I";
			}  else if (getRandomInt(1, 300) == 1) {
				road = "P";
			} else if (getRandomInt(1, 900) === 1) {
				road = "D";
			} else if (getRandomInt(1, 900) === 1) {
				road = "W";
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

	// at the end of the level
	if (Game.LevelLines > Game.GetLevelLines(Game.Level)-20) {
		for(i=0; i<Game.LineSize; i++) {
			Line = setCharAt(Line, i, "%");
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
	Game.LevelLines += 1;
	if (Game.LevelLines < Game.GetLevelLines(Game.Level)) {
		Game.Stats.Lines += 1;
	}

	return false;
};

/* Render the game map from the Game.map array of lines */
Game.DisplayMap = function(Text, RenderMode) {
	var Map = "";
	for (y = 20; y >= 0; y--) {
		var Line = Game.map[y];

		if (RenderMode == "Objects")
		{
			if (y == Game.Bullet.y)
				Line = setCharAt(Line, Game.Bullet.x, "^");
			if (y == Game.Spaceship.Bullet.y)
				Line = setCharAt(Line, Game.Spaceship.Bullet.x, "v");
			if (y == 2)
				Line = setCharAt(Line, Game.PlayerX, "<span style=''>X</span>");
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

			Map += endChar + replaceAll('`', '&nbsp;',
				replaceAll('%', '&nbsp;',
				replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";
		} else {
			if (Text != false) {
				for (i=0;i<Text.length;i++) {
					if (Text[i].y == y)
						Line = Text[i].text.substr(0,Game.LineSize);
				}
			}

			Line = replaceAll('P', '`', Line);
			Line = replaceAll('I', '`', Line);
			Line = replaceAll('D', '`', Line);
			Line = replaceAll('L', '`', Line);
			Line = replaceAll('W', '`', Line);

			Map += endChar + replaceAll('`', Game.RoadTile,
				replaceAll('%', endZoneChar,
				replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";

		}
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

		if (Game.LevelLines < Game.GetLevelLines(Game.Level)) {
			$("#GameWindow_Road").html(Game.DisplayMap(false, "Road"));
			$("#GameWindow_Objects").html(Game.DisplayMap(false, "Objects"));
		} else {

			dashTimer = Math.floor((Game.LevelLines - Game.GetLevelLines(Game.Level)) / 4);
			dashTimer = Array(dashTimer+1).join("-");

			if (dashTimer ==  Array(Game.LineLength.length+2).join("-"))
			{
				// remove the completed text
				$("#GameWindow_Road").html(Game.DisplayMap(false, "Road"));
				$("#GameWindow_Objects").html(Game.DisplayMap(false, "Objects"));

				Game.Start();
				return;
			}

			$("#GameWindow_Objects").html(Game.DisplayMap([
				{y: 13, text: "@COMPLETED:@" },
				{y: 12, text: "@Level@"+Game.Level+"@" },
				{y: 11, text: "" + dashTimer + "@@@@@@@@@@@@@@@@@@@@@"},
				{y: 10, text: "@Press Space@" },
				{y: 9, text: "@to continue@" },
			], "Objects"));


			$("#GameWindow_Road").html(Game.DisplayMap([
				{ y: 13, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
				{ y: 12, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
				{ y: 11, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
				{ y: 10, text: "@@@@@@@@@@@@@@@@@@@@@@@"},
				{ y: 9, text: "@@@@@@@@@@@@@@@@@@@@@@@"}
			], "Road"));

		}
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
			case '' + roadChar + '': break;
			case 'P':
				Game.SFX.Bonus.play();
				Game.Stats.Score += (Game.Level*2)+2;
				Game.Stats.Powerus += 1;
				Game.AddText("+"+((Game.Level*2)+2)+" Score");
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
			case 'I':
				Game.SFX.Power.play();
				Game.Invincible = 50;
				Game.Stats.Powerups += 1;
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
			case 'W':
				Game.SFX.Power.play();
				Game.Warp = 40;
				Game.Stats.Powerups += 1;
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
			// case 'L':
			// 	Game.Level += 1;
			// 	Game.SetLevelClass(Game.Level);
			//
			// 	Game.AddText("<b>LEVEL "+Game.Level+"</b>");
			// 	$('#level').html(Game.Level);
			// 	Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
			// 	Game.PlaySound('level.wav');
			// 	break;
			case 'D':
				Game.SFX.Power.play();
				Game.Distortion = 25;
				Game.Stats.Powerups += 1;
				Game.CreateInterval(Game.BaseSpeed*2);
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
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
					Game.SFX.Explosion.play();
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
			$('#GameWindow_Objects').append('<br><b>Invincible:</b> '+Game.Invincible);
		}
		if (Game.Warp != 0) {
			Game.Warp -= 1;
			$('#GameWindow_Objects').append('<br><b>Warp:</b> '+Game.Warp);
		}
		if (Game.Distortion != 0) {
			Game.Distortion -= 1;
			if (Game.Distortion == 0) {
				Game.CreateInterval(Game.BaseSpeed);
			}
			$('#GameWindow_Objects').append('<br><b>Distortion:</b> '+Game.Distortion);
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
				$('#GameWindow_Objects').append("<br>"+Game.Text[i].text);
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
		if (Game.Warp == 0) {
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

				if (Game.PlayerX > Game.LineSize-1 || Game.PlayerX < 0) {
					Game.Over('Wall');
					foundPosition = true;
				}
			}
		}

		if (Game.LineEntered[Game.PlayerX] == 1 && Tile2 != '%') {
			Game.LineEntered[Game.PlayerX] = 2;
			Game.Stats.Score += 1;
			Game.SFX.Score.play();
		} else {
			Game.SFX.Noscore.play();
		}

		Game.Stats.Moves += 1;

		var Tile2 = Game.map[2].split('')[Game.PlayerX];
		var Tile3 = Game.map[3].split('')[Game.PlayerX];

		if (Tile3 == '@' &&  Tile2 == '@' && Game.Invincible == 0) {
			Game.Over('Normal');
		}
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
			Game.SFX.Shoot.play();
			Game.Stats.ShotsFired += 1;
			Game.Bullet = {
				exists: true,
				x: Game.PlayerX,
				y: 2
			};
		} else if (type == 'Spaceship' && Game.Spaceship.Bullet.exists == false) {
			Game.SFX.Shoot.play();
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
	if (getRandomInt(0, 20) == 0)
		var disp = "^_~";
	else
		var disp = "<_>";

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

Game.SetLevelClass = function(level) {
	for (var i = 1; i <= 9; i++) {
		$('#GameWindow_Road').removeClass("c"+i);
	}
	$('#GameWindow_Road').addClass("c"+level);
	for (var i = 1; i <= 9; i++) {
		$('#GameWindow_Objects').removeClass("d"+i);
	}
	$('#GameWindow_Objects').addClass("d"+level);
}

Game.GetLevelLines = function(level) {
	switch (level) {
		case 1: return 151; break;
		case 2: return 177; break;
		case 3: return 201; break;
		case 4: return 225; break;
		case 5: return 251; break;
		case 6: return 277; break;
		case 7: return 301; break;
		case 8: return 351; break;
		case 9: return 401; break;
	}
}

Game.DestroySpaceship = function() {
	Game.Spaceship = {
		exists:false,move:false,flyaway:false,start:0,direction:0,x:0,y:-1,Bullet:{exists:false,x:0,y:-1}
	};
};

Game.UpdateSpeed = function (speed) {
	Game.BaseSpeed = speed;
	Game.CHEAT = true;
	console.log("Updated");
};

Game.UpdateVolume = function (volume) {
  for (var prop in Game.SFX) {
     if (Game.SFX.hasOwnProperty(prop)) {
        Game.SFX[prop].volume = volume / 100;
     }
  }

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
	return false;
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
	if (Game.SaveFile.Record.Score < Game.Stats.Score)
		return true;
	else
		return false;
}

Game.Over = function(DeathType) {
	Game.SFX.GameOver.play();

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
	}
	if (!Game.SaveFile.Volume)
		Game.SaveFile.Volume = 30;
	Game.UpdateVolume(Game.SaveFile.Volume);

	console.log("Game Loaded");
};

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

	$('#GameWindow_Road').html('');
	$('#GameWindow_Objects').html(Game.DisplayMap([
		{y:11,text:"@@Press@Space@@"},
		{y:10,text:"@@@to@start.@@@"},
		{y:2 ,text:"@@@@@@@@@@@@@@@"}
	], "Objects"));

	$('tab').click(function (e) {
		ToggleTab($(this).attr('id'));
	});

	Game.UpdateStatistics();
	$("#Changelog").html(Game.CreateChangelog());
});

$(document).keydown(function(e) {
	var code = e.keyCode;

	switch (code) {
		// case 82: Game.Active = false; Game.Start(); break;
		case 37: case 65: case 74: Game.Move('left');         break; //Right arrow or "a" or "j"
		case 39: case 68: case 76: Game.Move('right');        break; //Left arrow or "d" or "l"
		case 38: case 87: case 73: Game.FireBullet('player'); break; //Up arrow or "w" or i
		case 32:
			if (Game.Active == false || (Game.LevelLines >= parseInt(Game.GetLevelLines(Game.Level)))) {
				Game.Start(); //Spacebar to start
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

		.c1 { color: #2196f3; }
		.c2 { color: #40bfb5; }
		.c3 { color: #40bf6f; }
		.c4 { color: #98bf40; }
		.c5 { color: #bf8e40; }
		.c6 { color: #bf4040; }
		.c7 { color: #bf408a; }
		.c8 { color: #6140bf; }
		.c9 { color: #ea4a3e; }

		.d1,.d2,.d3,.d4,.d5,.d6,.d7,.d8,.d9{font-weight:bold; }

		.d1 { color: #1100da; filter: invert(100%);}
		.d2 { color: #40bfb5; filter: invert(100%);}
		.d3 { color: #c5b84c; filter: invert(100%);}
		.d4 { color: #98bf40; filter: invert(100%);}
		.d5 { color: #bf8e40; filter: invert(100%);}
		.d6 { color: #bf4040; filter: invert(100%);}
		.d7 { color: #bf408a;filter: invert(100%); }
		.d8 { color: #6140bf; filter: invert(100%);}
		.d9 { color: #ea4a3e;filter: invert(100%); }

		body{
			font-family:monospace;
			font-size:14 px;;
			margin:0px;
			background-color: black;
			color: white;
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
			font-size:20px;
			padding-top:4px;
			padding-bottom:4px;
			color:white;
			cursor:pointer;
			font-weight:bold;
		   -webkit-touch-callout: none;
		   -webkit-user-select: none;
		   -khtml-user-select: none;
		   -moz-user-select: none;
		   -ms-user-select: none;
			user-select: none;

			border-right:1px solid white;
			border-bottom:1px solid white;
		}
		.TabContainer .selected {
			color:black;
			background: white;
		}
		.TabWindow {
			display:none;
		}

		#ScoreWindow {
			width: 200px;
			text-align:left;
		}

		#GameInfo {
			width:750px;
			text-align:left;
		}

		.GameWindow {
			line-height:100%;
			font-size:20px;
		}

		a {
			color: #3366BB;
			font-weight:bold;
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
		<div class="Window" id="ScoreWindow" style="font-size:16px;">
			<b>&nbsp;Current Game:</b><br>
			<div style="width:100%">
				<div style="width:70%;text-align:right;float:left">Score:&nbsp;</div>
				<div style="width:30%;text-align:left;float:left" id="score">0</div>
			</div>
			<div style="width:100%">
				<div style="width:70%;text-align:right;float:left">Lines:&nbsp;</div>
				<div style="width:30%;text-align:left;float:left" id="lines">0</div>
			</div>
			<div style="width:100%">
				<div style="width:70%;text-align:right;float:left">Level:&nbsp;</div>
				<div style="width:30%;text-align:left;float:left" id="level">0</div>
			</div><br><br><br><br>

			<b>&nbsp;High Score:</b><br>
			<div style="width:100%">
				<div style="width:70%;text-align:right;float:left">Score:&nbsp;</div>
				<div style="width:30%;text-align:left;float:left" id="high-score">0</div>
			</div>
			<div style="width:100%">
				<div style="width:70%;text-align:right;float:left">Lines:&nbsp;</div>
				<div style="width:30%;text-align:left;float:left" id="high-lines">0</div>
			</div><br><br><br><br>
		</div>
		<div class="Window" style="position: relative;width:200px;">
			<div class="GameWindow" style="position: absolute; margin-top:2px;" id="GameWindow_Road">
				X-Quest requires JavaScript to be enabled.
			</div>
			<div class="GameWindow" style="position: absolute; margin-top:2px;z-index:1;" id="GameWindow_Objects">

			</div>
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
	D (Distortion): Halves game speed for 25 turns<br>
	L (Level): Land on this tile to level up<br>
	I (Invulnerable): Invincibility for 50 lines<br>
	P (Pellet): Score bonus.<br>
	W (Warp): Move through the abyss.<br>

	<br>X-Quest v<?=$v?> by <a href="https://waldens.world">B0sh</a> &copy; 2014-<?=date('Y')?>
</div>
<div class="TabWindow" tab="2">
	<b>Volume:</b> (<span id="volumeLevel" style="width:32px;">30</span>)
		<input name="volume" type="range" min="0" max="100" step="5" value="30"
			oninput="$('#volumeLevel').html($('[name=volume]').val());"
			onchange="Game.UpdateVolume($('[name=volume]').val()); $('#volumeLevel').html($('[name=volume]').val());">
	<br>
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
