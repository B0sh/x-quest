import { Changelog } from "./changelog";
import { XQuest } from "./game";
import { Modifier, MODIFIERS } from "./modifier";
import Utility from "./utility";

export class Menu {
    currentTab: number = 1;
    selectedModifiers: Modifier[] = [];

    constructor(
        private game: XQuest
    ) {

    }

    initTabEvents() {
        document.querySelectorAll('tab').forEach((element: Element) => {
            const id = element.getAttribute('id');
            element.addEventListener('click', () => {
                this.toggleTab(Number(id));
            });
        });
    }

    toggleTab(tab: number){
        for (let i = 0; i <= 5; i++) {
            (document.querySelector(`[tab="${i}"]`) as HTMLElement).style.display = 'none';
            document.querySelector(`[id="${i}"]`).classList.remove('selected');
        }

        (document.querySelector(`[tab="${tab}"]`) as HTMLElement).style.display = 'inline-block';
        document.querySelector(`[id="${tab}"]`).classList.add('selected');

        // if (tab == 3) {
        // 	Game.LoadHighScore();
        // }

        if (tab == 0) {
        	this.killScreenEasterEgg();
        }

        if (tab == 2) {
            this.loadModifiers();
        }

        if (tab == 4) {
            this.updateStatistics();
        }

        if (tab == 5) {
            document.querySelector("#Changelog").innerHTML = Changelog.createChangelog();
        }

        this.currentTab = tab;
    }

    loadModifiers() {
        const element = document.querySelector('.modifier-list');
        element.innerHTML = "";
        MODIFIERS.forEach((modifier) => {
            const checked: string = this.selectedModifiers.findIndex((sel) => sel.name == modifier.name) == -1 ? '' : 'checked';
            element.innerHTML += `<div>
                <input type="checkbox" onchange="Game.menu.updateModifier('${modifier.name}', this.checked);" ${checked} />
                ${modifier.name} &mdash; +${modifier.scoreMultiplier * 100}% &mdash; ${modifier.description}
            </div>`
        });
    }

    updateModifier(modifierName: string, state: boolean) {
        const index = this.selectedModifiers.findIndex((modifier) => modifier.name == modifierName);
        if (state && index == -1) {
            const modifier = MODIFIERS.find((modifier) => modifier.name == modifierName);

            let valid: boolean = true;
            if (modifier.invalidComboModifiers) {
                this.selectedModifiers.forEach((selected) => {
                    modifier.invalidComboModifiers.forEach((invalidName) => {
                        if (selected.name == invalidName) {
                            valid = false;
                        }
                    });
                });
            }

            if (valid) {
                this.selectedModifiers.push(modifier);
            }
            else {
                alert("Modifier cannot be paired with " + modifier.invalidComboModifiers.join(' '));
            }
        }
        else if (!state && index > -1) {
            this.selectedModifiers.splice(index, 1)
        }
    }

    updateStatistics() {
        const saveFile = this.game.state.saveFile;
        if (!saveFile || !saveFile.Totals) {
            return;
        }

        const time = saveFile.Totals.Time;
        let timeFormatted: string;

        if(time < 600) {
            timeFormatted = Utility.format(time, 1) + " Seconds";
        } else if (time < 36000) {
            timeFormatted = Utility.format(time/60, 1) + " Minutes";
        } else {
            timeFormatted = Utility.format(time / 3600, 1) + " Hours";
        }

        document.querySelector('#Statistics').innerHTML = '' +
            '<b>Games Played:</b> '+Utility.format(saveFile.Totals.GamesPlayed)+'<br>'+
            '<b>Score:</b> '+Utility.format(saveFile.Totals.Score)+'<br>'+
            '<b>Lines:</b> '+Utility.format(saveFile.Totals.Lines)+'<br>'+
            '<b>Times Moved:</b> '+Utility.format(saveFile.Totals.Moves)+'<br>'+
            '<b>Shots Fired:</b> '+Utility.format(saveFile.Totals.ShotsFired)+'<br>'+
            '<b>Shots Destroyed:</b> '+Utility.format(saveFile.Totals.ShotsDestroyed)+'<br>'+
            '<b>Ships Destroyed:</b> '+Utility.format(saveFile.Totals.ShipsDestroyed)+'<br>'+
            '<b>Powerups Collected:</b> '+Utility.format(saveFile.Totals.Powerups)+'<br>'+
            '<b>Deaths To The Abyss:</b> '+Utility.format(saveFile.Totals.DeathAbyss)+'<br>'+
            '<b>Deaths To The Ship:</b> '+Utility.format(saveFile.Totals.DeathShot)+'<br>'+
            '<b>Deaths To The Wall:</b> '+Utility.format(saveFile.Totals.DeathWall)+'<br>'+
            '<b>Time Played:</b> '+timeFormatted+'<br>';
    }

    killScreenEasterEgg() {
        const temp = this.game.state.level;

        let text = "Easter Egg? There's a Kill Screen <br><br>";
        text += "Calculating Time to Reach Kill Screen<br>";

        this.game.state.level = 0;
        let totalLines = 0;
        for (let level = 0; level <= 5000; level++) {
            this.game.state.level++;
            totalLines += this.game.board.getLevelLines(this.game.state.level);
            if (this.game.state.isKillScreen())
                break;
        }

        text += "Kill Screen Level: " + this.game.state.level;
        text += "<br>Lines: " + totalLines;
        text += "<br>Base Clock: " + this.game.BaseSpeed + "ms";
        text += "<br>Time: " + totalLines * this.game.BaseSpeed / 1000 / 60 + " minutes"
        this.game.state.level = temp;

        (document.querySelector(`[tab="0"]`) as HTMLElement).innerHTML = text;
    }
}