<!DOCTYPE html>
    <html>
	    <head>
            <title>X-Quest Wallpaper Generator</title>
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

Game.TotalMapLines = 20;
Game.CurrentTab = 1;
Game.Active = false;

// defaults
Game.Mode = 'normal';
Game.Level = 1;
Game.NextLevelClass = -1;
Game.Bullet = [];
Game.SFX = {
	"Noscore": new Audio("Sound/noscore.wav"),
	"LevelUp": new Audio("Sound/level.wav"),
	"Killscreen": new Audio("Sound/killscreen.wav"),
	"Bonus": new Audio("Sound/bonus.wav"),
	"Explosion": new Audio("Sound/explosion.wav"),
	"Score": new Audio("Sound/score.wav"),
	"Power": new Audio("Sound/power.wav"),
	"Shoot": new Audio("Sound/shoot.wav"),
	"GameOver": new Audio("Sound/gameover.wav"),
};

// var endZoneChar = 'â–“';
var endZoneChar = '.';
var roadChar = '|';
var endChar = '';

/* Called each time a new game begins; sets game variables */
Game.Start = function() {

	if (Game.Active == true) {

		if ( Game.LevelLines > Game.GetLevelLines(Game.Level) - Game.TotalMapLines) {
			Game.Warp = 0;
			Game.Invincible = 25;
			if (Game.Distortion != 0) {
				Game.CreateInterval(Game.BaseSpeed);
				Game.Distortion = 0;
			}
			Game.LevelLines = 0;
			Game.Text = [];

			Game.Level++;
			Game.NextLevelClass = Game.DisplayLevel % 9 + 1;
			if (Game.Level == 10)
				Game.Level = 9;
			Game.DisplayLevel++;

			$('#level').html(Game.DisplayLevel);
			if (Game.isKillScreen())
				Game.SFX.Killscreen.play();
			else
				Game.SFX.LevelUp.play();
		}

		$('.no_display_level_' + Game.DisplayLevel).css('display', 'block');

		return false;
	} else {

		for (var i = 1; i < 10; i++ )
			$('.no_display_level_' + Game.DisplayLevel + '').css('display', 'none');

	}
	Game.Active = true;
	Game.Paused = false;
	Game.Warp = 0;
	Game.Invincible = 100000;
	Game.Distortion = 0;
  Game.MultiShot = 0
	Game.Text = [];
	Game.Level = 1;
	Game.DisplayLevel = 1;
	Game.LevelLines = 0;
	Game.map = [];
	Game.LineLength = [];
	Game.LineReset = [];
	Game.LineEntered = [];
	Game.Bullet = [];
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

	Game.DestroySpaceship();

	Game.NextLevelClass = 1;

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
	$('#mode').css('display','none');
	$('#level').html(Game.Level);

	/* Generate the first 20 lines */
	for (y = 0; y <= Game.TotalMapLines; y++) {
		var Line = Game.GenerateLine();
		Game.map[y] = Line;
	}

	/* If you're on the high score screen and a new game starts don't let it submit */
	if (Game.CurrentTab == 6 || Game.CurrentTab == 7) {
		ToggleTab('1');
	}

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

	if (Game.Mode == 'normal')
  {
		var start = 0;
		var end = Game.LineSize;
	}
	else if (Game.Mode == 'nightmare')
	{
		var start = 2;
		var end = Game.LineSize - 2;

		Line = setCharAt(Line, 0, '>');
		Line = setCharAt(Line, 1, '>');

		Line = setCharAt(Line, Game.LineSize - 1, '<');
		Line = setCharAt(Line, Game.LineSize - 2, '<');
	}

	/* Generate tiles and manage lines */
	for(i=start; i<end; i++) {
		if (Game.LineLength[i] != 0) {
			var road = "`";

			if (getRandomInt(1, 1100) == 1) {
				road = 'I';
			}  else if (getRandomInt(1, 300) == 1) {
				road = 'P';
			} else if (getRandomInt(1, 900) === 1) {
				road = 'D';
			} else if (getRandomInt(1, 900) === 1 && Game.Level >= 6) {
				road = 'W';
			} else if (getRandomInt(1, 900) === 1 && Game.Level >= 3) {
				road = 'M';
			}

			Line = setCharAt(Line, i, road);

			/* Vertical line handler */
			Game.LineLength[i] -= 1;
			if (Game.LineLength[i] < getRandomInt(2, 6 - Math.floor(Game.Level/4)) && Game.LineReset[i] != 0) {
				Game.LineReset[i] = 0;
				if ((getRandomInt(1, 2) == 1 && i != end - 1) || i == start) {
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
	// if (Game.LevelLines > Game.GetLevelLines(Game.Level)-Game.TotalMapLines) {
	// 	for(i=start; i<end; i++) {
	// 		Line = setCharAt(Line, i, "%");
	// 	}
	// }

	return Line;
};

/* Adds a new line to the map array; called each tick */
Game.AddLine = function() {
	var newMap = [];
	for (y = 1; y <= Game.TotalMapLines; y++) {
		newMap[y-1] = Game.map[y];
	}
	Game.map = newMap;
	Game.map[Game.TotalMapLines] = Game.GenerateLine();
	Game.LevelLines += 1;

	if (Game.LevelLines < Game.GetLevelLines(Game.Level)) {
		Game.Stats.Lines += 1;
	}

	if (Game.Spaceship.exists)
	{
		Game.Spaceship.lines += 1;
	}

	return false;
};


/* Render the game map from the Game.map array of lines */
Game.DisplayMap = function(Text, RenderMode, options) {
	if (Game.isKillScreen()) {
		Text = Game.KillScreen(RenderMode);
	}

	var Map = "";
	for (y = Game.TotalMapLines; y >= 0; y--) {
		var Line = Game.map[y];

		// objects render mode
		if (RenderMode == "Objects")
		{
			needsOverwrite = false;
			// loop through bullets and set bullet character
			for (i = 0 ; i < Game.Bullet.length ; i++ ) {
				if (y == Game.Bullet[i].y) {
					Line = setCharAt(Line, Game.Bullet[i].x, "^");
					needsOverwrite = true;
				}
			}

			for (i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
				if (y == Game.Spaceship.Bullet[i].y) {
					Line = setCharAt(Line, Game.Spaceship.Bullet[i].x, "v");
					needsOverwrite = true;
				}
			}

			if (y == Game.Spaceship.y) {
				Line = setCharAt(Line, Game.Spaceship.x,   Game.Spaceship.display[0]);
				Line = setCharAt(Line, Game.Spaceship.x+1, Game.Spaceship.display[1]);
				Line = setCharAt(Line, Game.Spaceship.x+2, Game.Spaceship.display[2]);
				needsOverwrite = true;
			}

			if (Text != false) {
				for (i=0;i<Text.length;i++) {
					if (Text[i].y == y && !(typeof Text[i].overwritable !== 'undefined' && needsOverwrite == true))
						Line = Text[i].text.substr(0,Game.LineSize);
				}
			}

			if (y == 2 && (typeof options === "undefined" || typeof options.renderPlayer === "undefined")) Line = setCharAt(Line, Game.PlayerX, "X");

			Map += endChar + replaceAll('`', '&nbsp;',
				replaceAll('%', '&nbsp;',
				replaceAll('@', '&nbsp;', Line))) + endChar + "<br>";

		// road render mode all road tiles need to be road
		} else {
			if (Text != false) {
				for (i=0;i<Text.length;i++) {
					if (Text[i].y == y)
						Line = Text[i].text.substr(0,Game.LineSize);
				}
			}

			// if (!Game.isKillScreen()) {
				Line = replaceAll('P', '@', Line);
				Line = replaceAll('I', '@', Line);
				Line = replaceAll('D', '@', Line);
				Line = replaceAll('M', '@', Line);
				Line = replaceAll('W', '@', Line);
			// }

			// loop through bullets and set bullet character
			for (i = 0 ; i < Game.Bullet.length ; i++ ) {
				if (y == Game.Bullet[i].y)
				Line = setCharAt(Line, Game.Bullet[i].x, "@");
			}

			for (i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
				if (y == Game.Spaceship.Bullet[i].y)
				Line = setCharAt(Line, Game.Spaceship.Bullet[i].x, "@");
			}

			if (y == 2) Line = setCharAt(Line, Game.PlayerX, "@");
			if (y == Game.Spaceship.y) {
				Line = setCharAt(Line, Game.Spaceship.x,   '@');
				Line = setCharAt(Line, Game.Spaceship.x+1, '@');
				Line = setCharAt(Line, Game.Spaceship.x+2, '@');
			}

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

			$("#GameWindow_Road").html(Game.DisplayMap(false, "Road"));
            $("#GameWindow_Objects").html(Game.DisplayMap(false, "Objects"));
            
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
				Game.Stats.Powerups += 1;
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
			case 'D':
				Game.SFX.Power.play();
				Game.Distortion = 25;
				Game.Stats.Powerups += 1;
				Game.CreateInterval(Game.BaseSpeed*2);
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
			case 'M':
				Game.SFX.Power.play();
				Game.MultiShot = 1;
				Game.Stats.Powerups += 1;
				Game.map[2] = setCharAt(Game.map[2], Game.PlayerX, "`");
				break;
		  // nightmare mode wall tiles
			case '<':
			case '>':
				Game.Over('Wall');
				break;
			case '@':
				if (Game.Invincible == 0) {
					Game.Over('Normal');
				}
				break;
		}


		/* Bullet handling */
		if (Game.Bullet.length !== 0) {

			for (i = 0 ; i < Game.Bullet.length ; i++ ) {
				Game.Bullet[i].y += 1;
				if (Game.Bullet[i].y == Game.TotalMapLines + 1)
				{
					Game.DestroyBullet(i, 'player');
					continue;
				}

				if (Game.Spaceship.exists == true &&
					Game.Bullet[i].y == Game.Spaceship.y &&
					Contains(Game.Bullet[i].x, Game.Spaceship.x, Game.Spaceship.x+2)) {
						Game.DestroyBullet(i, 'player');
						Game.Stats.Score += 10;
						Game.Stats.ShipsDestroyed += 1;
						Game.AddText("Hit! +10 Score");
						Game.DestroySpaceship();
						Game.SFX.Explosion.play();
				}

				// allow spaceship bullets to be destoryed
				for (s = 0; s < Game.Spaceship.Bullet.length; s++ ) {
					if ((Game.Spaceship.Bullet[s].y == Game.Bullet[i].y || Game.Spaceship.Bullet[s].y+1 ==Game.Bullet[i].y) &&
						Game.Bullet[i].x == Game.Spaceship.Bullet[s].x && Game.Bullet[i].y != -1)
					{
						Game.DestroyBullet(i, 'player');
						Game.DestroyBullet(s, 'spaceship');
						Game.Stats.ShotsDestroyed += 1;
					}
				}
			}
		}

		/* Spaceship handling */
		if (Game.Spaceship.exists == true) {
			if ((Game.Spaceship.lines % 30) == 0)
				Game.Spaceship.y -= 1;

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

			//  Spaceship bullet handling
			if (Game.Spaceship.Bullet.length == 0 && getRandomInt(1, 5) == 1 && Game.Spaceship.flyaway == false) {

				Game.FireBullet('spaceship');

			} else {

				for (i = 0 ; i < Game.Spaceship.Bullet.length ; i++ ) {
					Game.Spaceship.Bullet[i].y -= 1;
					if (Game.Spaceship.Bullet[i].y == 0)
						Game.DestroyBullet(i, 'spaceship');

					else if (Game.Spaceship.Bullet[i].y == 1 && Game.Spaceship.Bullet[i].x == Game.PlayerX && Game.Invincible == 0) {
						Game.DestroyBullet(i, 'spaceship');
						Game.Over('Spaceship');
					}
				}
			}

			/* After 150 lines after the spaceship has spawned make it fly away (now) */
			if (Game.Spaceship.lines > 160) {
				Game.Spaceship.flyaway = true;
			}

			/* Destroy spaceship after it has flown off the screen */
			if (Game.Spaceship.x == -3 || Game.Spaceship.x == (Game.LineSize+3)) {
				Game.DestroySpaceship();
			}
		} else {
			/* Randomly generate spaceships every 100 lines at 1/4 chance */
			if (((1+Game.Stats.Lines) % 100 == 0 && getRandomInt(1, 4) == 1 && Game.Level >= 2) || Game.Stats.Lines+1 == 200)  {
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
		if (Game.MultiShot != 0) {
			// Game.Warp -= 1;
			$('#GameWindow_Objects').append('<br><b>MultiShot</b>');
		}
		if (Game.Distortion != 0) {
			Game.Distortion -= 1;
			if (Game.Distortion == 0) {
				Game.CreateInterval(Game.BaseSpeed);
			}
			$('#GameWindow_Objects').append('<br><b>Distortion:</b> '+Game.Distortion);
		}

		Game.ProcessText();

		if (Game.NextLevelClass != -1) {
			Game.SetLevelClass(Game.NextLevelClass);
			Game.NextLevelClass = -1;
		}
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

			Game.SFX.Shoot.play();
			Game.Stats.ShotsFired += 1;
			if (Game.MultiShot == 0) {
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
				Game.MultiShot = 0 ;
			}

		} else if (type == 'spaceship' && Game.Spaceship.Bullet.length == 0) {

			Game.SFX.Shoot.play();
			Game.Spaceship.Bullet.push({
				x: Game.Spaceship.x,
				y: Game.Spaceship.y,
			});

		}
	}
};

Game.CreateSpaceship = function() {
	return false;
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
	$('#stats_tracked').html("<h3>Fun Mode: Your statistics are no longer tracked.</h3>");
	console.log("Updated Speed");
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
	if (Game.LineSize >= 40) {
        $('.GameWindow').css('width', (Game.LineSize + 2) * 10 + 'px');
        $('#GameContainer').css('width', (Game.LineSize + 2) * 10 + 'px');
	} else {
		$('.GameWindow').css('width', '400px');
		$('#GameContainer').css('width', '400px');
	}

	return false;
};

Game.UpdateFont = function (font) {
  switch (font) {
    case 'comic_sans': font = '"Comic Sans MS", cursive, sans-serif'; break;
    case 'courier': font = '"Courier New", Courier, monospace'; break;
  }

  $('body').css('font-family', font);
  return false;
};

Game.UpdateMode = function(mode) {
	if (Game.Active == true)
	{
		alert("Wait until a game is no longer active");
		$('#mode').val(Game.Mode);
		return false;
	}

	if (mode == 'normal') {
		Game.Mode = 'normal';
		Game.BaseSpeed = 110;
	} else {
		Game.Mode = 'nightmare';
		Game.BaseSpeed = 60;
	}

	$('#high-score').html(Format(Game.SaveFile.Record[Game.Mode].Score));
	$('#high-lines').html(Format(Game.SaveFile.Record[Game.Mode].Lines));

	return true;
};

Game.UpdateLevel = function(level) {
    Game.SetLevelClass(level);
    Game.Level = level;
    Game.Lines = 0;
    Game.LevelLines = 0;
    return true;
}

Game.UpdateTotalMapLines = function(lines) {
    Game.TotalMapLines = parseInt(lines);
    return true;
}

/* Toggles pause on and off */
Game.TogglePause = function () {
	if (Game.Active == true) {
		if (Game.Paused == false) {
			Game.Paused = true;
			clearInterval(Game.Interval);
			// $("#GameWindow_Road").html(Game.DisplayMap([{y:10,text:"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"}], "Road"));
			// $("#GameWindow_Objects").html(Game.DisplayMap([{y:10,text:"@--@PAUSED@--@"}], "Objects"));

		} else {
			Game.Paused = false;
			Game.CreateInterval(Game.BaseSpeed);
		}
	}
};

Game.isNewRecord = function () {
	if (Game.SaveFile.Record[Game.Mode].Score < Game.Stats.Score)
		return true;
	else
		return false;
}

Game.Over = function(DeathType) {
	Game.SFX.GameOver.play();

	$('#linesize').css('display','inline');
	$('#mode').css('display','inline');
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
};

Game.CreateNewSaveFile = function() {
	Game.SaveFile = {
		Version: Game.Version,
		Volume: 0.1,
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
		Record: {
			normal: { Score: 0, Lines: 0},
			nightmare: { Score: 0, Lines: 0}
		},
		Achievements: {

		}
	};
};

Game.isKillScreen = function(test) {
	return Game.DisplayLevel > 63;
}

Game.KillScreen = function(RenderMode) {
	var toY = Game.DisplayLevel - 59;

	switch (RenderMode) {
		case 'Road':
			var Text = [];
			for (var y = 0; y <= toY; y++)
			{
				Text[y] = {y:y, text:"```````````````````````"};
				for (var x = 0; x <= 15; x++)
				{

					if (getRandomInt(0, 5) == 1)
						Text[y].text = setCharAt(Text[y].text, x, String.fromCharCode(getRandomInt(20 , 255)));
				}
			}
			return Text;
			break;
		case 'Objects':
			var Text = [];
			for (var y = 0; y <= toY; y++)
			{
				Text[y] = {y:y, text:"@@@@@@@@@@@@@@@@@@"};
				for (var x = 0; x <= 15; x++)
				{

					if (getRandomInt(0, 18) == 1)
						Text[y].text = setCharAt(Text[y].text, x, String.fromCharCode(getRandomInt(20 , 255)));
				}
			}

			if (getRandomInt(0, 2) == 1) {
				Text[Text.length] = {y: 12, text: "@COMPLETED:@" };
				Text[Text.length] = {y: 11, text: "@Level@"+(63-Game.DisplayLevel)+"@" };
				// Text[10] = {y: 10, text: "" + dashTimer + "@@@@@@@@@@@@@@@@@@@@@"};
				Text[Text.length] = {y: 9, text: "@Press Space@" };
				Text[Text.length] = {y: 8, text: "@to continue@" };
			}

			return Text;
			break;
	}

}
/* Save Game.SaveFile into localStorage */
Game.Save = function() {

}

/* Load the save file from localStorage */
Game.Load = function() {
		Game.CreateNewSaveFile();
};


$(document).ready(function() {
	if (isiPad)
		$('.no_display_iPad').css('display', 'none');

	Game.Load();
    Game.UpdateMode('normal');
    Game.UpdateVolume(0);

	/* Add the total score and lines from localStorage */
	$('#high-score').html(Format(Game.SaveFile.Record[Game.Mode].Score));
	$('#high-lines').html(Format(Game.SaveFile.Record[Game.Mode].Lines));
	$('#total-score').html(Format(Game.SaveFile.Totals.Score));
	$('#total-lines').html(Format(Game.SaveFile.Totals.Lines));

	/* Default to medium size */
	Game.UpdateSize(15);
	Game.SetLevelClass(1);
	Game.DestroySpaceship();

	Game.map = [];
	for(i=0;i<=20;i++) {
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
});

var down = {};
var isiPad = navigator.userAgent.match(/iPad/i) != null;

$(document).keydown(function(event){
	var keycode = (event.keyCode ? event.keyCode : event.which);

	// if you are active on a text area, don't process game characters.
	if (document.activeElement.nodeName == 'TEXTAREA' || document.activeElement.nodeName == 'INPUT')
		return true;

	if (down[keycode] == null || isiPad)
	{
		down[keycode] = true;
		switch (keycode) {
			// case 82: Game.Active = false; Game.Start(); break;
			case 37: case 65: case 74: Game.Move('left');         event.preventDefault(); break; //Right arrow or "a" or "j"
			case 39: case 68: case 76: Game.Move('right');        event.preventDefault(); break; //Left arrow or "d" or "l"
			case 38: case 87: case 73: Game.FireBullet('player'); event.preventDefault(); break; //Up arrow or "w" or i
			case 32:
				if (Game.Active == false || (Game.LevelLines >= parseInt(Game.GetLevelLines(Game.Level)))) {
					Game.Start(); //Spacebar to start
				} else {
					Game.TogglePause(); //Spacebar to pause
				}
				event.preventDefault();

				break;
			default: return true;
		}
	}
});

$(document).keyup(function(event) {
   var keycode = (event.keyCode ? event.keyCode : event.which);

   down[keycode] = null;
});


function ToggleTab(tab){
	for (i=0;i<=12;i++) {
		$('[tab='+i+']').css('display', 'none');
		$('[id='+i+']').attr('class', 'x');
	}
	$('[tab='+tab+']').css('display', 'inline-block');
	$('[id='+tab+']').attr('class', 'selected');

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

		.d1 { color: #eeff25; }
		.d2 { color: #bf404a; }
		.d3 { color: #c5b84c; }
		.d4 { color: #3a47b3; }
		.d5 { color: #4071bf; }
		.d6 { color: #40bfbf; }
		.d7 { color: #40bf75; }
		.d8 { color: #9ebf40; }
		.d9 { color: #15b5c1; }

		body{
			font-family:monospace;
			font-size:14px;
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
			line-height: 1;
			font-size:20px;
		}

		a {
			color: #3366BB;
			font-weight:bold;
		}

		.Xbox {
			font-size:20px;
		}

		.no_display_level_1,
		.no_display_level_2,
		.no_display_level_3,
		.no_display_level_4,
		.no_display_level_5,
		.no_display_level_6,
		.no_display_level_7,
		.no_display_level_8,
		.no_display_level_9 {
			display: none;
		}
		</style>
		<audio id="Sound" src="" style="display:none;"></audio>

	<div style="width:1200px;">
		<div class="TabContainer">
			<tab id="0" style="width:398px;"> X-Quest v1.wallpaper </tab>
			<tab id="1" class="selected">Instructions</tab>
			<tab id="2">Options</tab>
			<tab id="3">&nbsp;</tab>
			<tab id="4">&nbsp;</tab>
			<tab id="5">&nbsp;</tab>
		</div>
	</div>

	<div id="container" style="width:1200px;text-align:center;">
	<div id="outer_container">
		<div class="Window" style="position: relative;width:400px;" id="GameContainer">
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
	<span style="font-size:22px;">You are a <span class="Xbox">X</span> that goes on a quest.</span><br>

	&nbsp;&nbsp;&nbsp;Oh, and the quest is to stay on the road.<br><br>

	<b style="font-size: 18px;">Controls:</b><br>
	&nbsp;&nbsp;&nbsp;<span style="font-size:20px;"><span class="no_display_iPad">Left/Right, </span>A/D</span>: Move<br>
	&nbsp;&nbsp;&nbsp;<span style="font-size:20px;"><span class="no_display_iPad">Up, </span>W</span>: Shoot<br>
	<br>

	<b style="font-size: 18px;">Collect:</b><br>
	&nbsp;&nbsp;&nbsp;<span class="Xbox">D</span>: Distortion Powerup<br>
	&nbsp;&nbsp;&nbsp;<span class="Xbox">I</span>: Invincibility Powerup<br>
	&nbsp;&nbsp;&nbsp;<span class="Xbox">P</span>: Score Pellet<br>
	<span class="no_display_level_3">&nbsp;&nbsp;&nbsp;<span class="Xbox">M</span>: Muli Shot!<br></span>
	<span class="no_display_level_6">&nbsp;&nbsp;&nbsp;<span class="Xbox">W</span>: Warp across the abyss<br></span>
	<br>

	<b style="font-size: 18px;">Watch out:</b><br>
	&nbsp;&nbsp;&nbsp;<span class="Xbox"><_></span>: spaceship<br>
	&nbsp;&nbsp;&nbsp;<span class="Xbox">v</span>: it's bullets<br>
	&nbsp;&nbsp;&nbsp;<span style="font-size:20px;">&nbsp;</span>: The Abyss<br>
	<br>

	X-Quest v1.wallpaper by <a href="https://waldens.world">B0sh</a> &copy; 2014-<?=date('Y')?></div>
<div class="TabWindow" tab="2">
	<b>Volume:</b> (<span id="volumeLevel" style="width:32px;">30</span>)
		<input name="volume" type="range" min="0" max="100" step="5" value="10"
			oninput="$('#volumeLevel').html($('[name=volume]').val());"
			onchange="Game.UpdateVolume($('[name=volume]').val()); $('#volumeLevel').html($('[name=volume]').val());">
	<br><br>

	<b>Mode:</b>
	<select id="mode" onchange="return Game.UpdateMode($('#mode').val());">
		<option value="normal">Normal</option>
		<option value="nightmare">Nightmare</option>
	</select>
	<br><br>

    <b>Colors:</b>

    <select id="level_" onchange="return Game.UpdateLevel($('#level_').val());">
        <option value="1">Level 1</option>
        <option value="2">Level 2</option>
        <option value="3">Level 3</option>
        <option value="4">Level 4</option>
        <option value="5">Level 5</option>
        <option value="6">Level 6</option>
        <option value="7">Level 7</option>
        <option value="8">Level 8</option>
        <option value="9">Level 9</option>
    </select>
    <Br><br>

    <b>Total Map Lines:</b>

    <input type="text" value="20" size="2" id="map_lines" onchange="Game.UpdateTotalMapLines($('#map_lines').val());" />
    <Br><br>
    <b>Total Map Width:</b>

    <input type="text" value="15" size="2" id="map_width" onchange="Game.UpdateSize($('#map_width').val());" />
    <Br><br>


  <b>Font:</b> <select id="font_select" onchange="Game.UpdateFont($('#font_select').val());">
    <option value="monospace">Monospace</option>
    <option value="courier">Courier</option>
    <option value="comic_sans">Comic Sans MS</option>
  </select><br><br>

	<b>Game Speed:</b> <input type="text" value="120" size="2" id="speed" onchange="Game.UpdateSpeed($('#speed').val());" /> (ms)
</div>

		</div>
	</div>
</div>

	</body>
</html>
