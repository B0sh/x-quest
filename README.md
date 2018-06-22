# x-quest

You are a X that goes on a Quest. Play it at [https://waldens.world](https://waldens.world/projects/x-quest/)

Author: Walden Perry ([B0sh](http://waldens.world/))

X-Quest is an 80s arcade-inspired action game. It features 9 levels that slowly ramp up in difficulty and then it continues on forever at the same difficulty in pursuit of high scores. (Even though the High Score list is easily hacked). There are two distinct game modes: Normal and Nightmare which have their own seperate leaderboard. It also features a lifetime statictics tracker through localStorage.

There's no compliation required! X-Quest is rendered entirely with ASCII characters. Pure JavaScript is used for the game logic with the only library being jQuery to interact with the DOM. The server side component is PHP connecting to a simple MySQL database with one table to store the high scores. It's just what I was already using on Walden's World.

### Known Issues

* **Gaps Between Tiles:** Google Chrome is the only browser that has the CSS attribute `line-height` working as I intend so that the road doesn't have any gaps between map lines. The game works the even if the line breaks are there. It's an artifact of not using any graphics.

* **Changing Board Size Glitches:** I explicitely say in the game that it doesn't work; its just for fun if you want to try it.