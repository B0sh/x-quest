import { Howler } from "howler";
import { Changelog } from "./changelog";
import { XQuest } from "./game";
import { Modifier, MODIFIERS } from "./modifier";
import { State } from "./state";
import TPKRequest from "./tpk";
import Utility from "./utility";

export const enum Tab {
    EasterEgg = 0,
    Instructions = 1,
    Options = 2,
    HighScore = 3,
    Statistics = 4,
    Changelog = 5,
    GameOverStatistics = 6,
    FatalError = 7,
}

export class Layout {
    currentTab: number = Tab.Instructions;
    selectedModifiers: Modifier[] = [];

    constructor(
        private game: XQuest
    ) {

    }

    initTabEvents() {
        document.querySelectorAll('.tab').forEach((element: Element) => {
            const id = element.getAttribute('id').replace('tab_', '');
            element.addEventListener('click', () => {
                this.toggleTab(Number(id));
            });
        });
    }

    toggleTab(tab: number) {
        if (this.game.Crashed) {
            tab = Tab.FatalError;
        }

        for (let i = 0; i <= 9; i++) {
            const contentElement = document.querySelector(`[tab="${i}"]`) as HTMLElement;
            if (contentElement)
                contentElement.style.display = 'none';
            const tabElement = document.querySelector(`[id="tab_${i}"]`);
            if (tabElement)
                tabElement.classList.remove('active-tab');
        }

        let element: any;
        element = document.querySelector(`[tab="${tab}"]`) as HTMLElement;
        if (element)
            element.style.display = 'inline-block';

        element = document.querySelector(`[id="tab_${tab}"]`);
        if (element)
            element.classList.add('active-tab');

        if (tab == Tab.EasterEgg) {
        	this.killScreenEasterEgg();
        }

        if (tab == Tab.Options) {
            this.loadModifiers();
        }

        if (tab == Tab.HighScore) {
            this.loadHighScores();
        }

        if (tab == Tab.Statistics) {
            this.loadStatistics();
        }

        if (tab == Tab.Changelog) {
            document.querySelector("#Changelog").innerHTML = Changelog.createChangelog();
        }

        this.currentTab = tab;
    }

    loadHighScores(scoreList: string = 'overall') {
        const element = document.querySelector('#HighScores');
        element.innerHTML = 'Loading...';
        TPKRequest.loadHighScores(scoreList).then((content: any) => {
            element.innerHTML = content;
        }).catch((error) => {
            this.game.handleError(error);
        });
    }

    loadStatistics() {
        const element = document.querySelector('#Statistics');
        element.innerHTML = 'Loading...';
        TPKRequest.loadStatistics().then((content: any) => {
            element.innerHTML = content;
        }).catch((error) => {
            this.game.handleError(error);
        });
    }

    loadModifiers() {
        const element = document.querySelector('.modifier-list');
        element.innerHTML = "";
        MODIFIERS.forEach((modifier) => {
            const checked: string = this.selectedModifiers.findIndex((sel) => sel.name == modifier.name) == -1 ? '' : 'checked';
            element.innerHTML += `<div style="clear: both;">
                <input type="checkbox" class="test" onchange="Game.layout.updateModifier('${modifier.name}', this.checked); Game.state.save();" ${checked} />
                <span class="d1">${modifier.name}</span> &mdash; <span class="d1">+${modifier.scoreMultiplier * 100}%</span> &mdash; ${modifier.description}
            </div>`
        });
    }

    loadGameOverStatistics(state: State, death: string, minigamePoints: number, eventCurrency: number) {
        this.toggleTab(Tab.GameOverStatistics);

        document.querySelector('.game-over-score').innerHTML = Utility.format(state.stats.Score);

        if (minigamePoints != null) {
            document.querySelector('.game-over-minigame-points').innerHTML = '+' + Utility.format(minigamePoints);
        }
        else {
            document.querySelector('.game-over-minigame-points').innerHTML = 'Loading...';
        }

        if (eventCurrency != null) {
          document.querySelector('.game-over-event-currency').innerHTML = '<img src="https://sprites.tpkrpg.net/items/439.png" style="width:24px;height:24px;vertical-align:middle">&nbsp; +' + Utility.format(eventCurrency);
        }

        const seconds = Utility.padStart(Math.floor(state.stats.Time) % 60, 2, '0');
        const minutes = Utility.padStart(Math.floor((state.stats.Time - state.stats.Time % 60) / 60), 2, '0');
        document.querySelector('.game-over-game-time').innerHTML = minutes + ':' + seconds;
        document.querySelector('.game-over-level').innerHTML = Utility.format(state.level);
        document.querySelector('.game-over-powerups-used').innerHTML = Utility.format(state.stats.PowerupsUsed);
        document.querySelector('.game-over-spaceship-hits').innerHTML = Utility.format(state.stats.ShipsDestroyed);
        document.querySelector('.game-over-bullet-hits').innerHTML = Utility.format(state.stats.ShotsDestroyed);

        if (death == 'Abyss') {
            document.querySelector('.game-over-cause-of-death').innerHTML = 'Death by Abyss';
        }
        if (death == 'Wall') {
            document.querySelector('.game-over-cause-of-death').innerHTML = 'Death by Wall';
        }
        if (death == 'Spaceship') {
            document.querySelector('.game-over-cause-of-death').innerHTML = 'Death by Spaceship';
        }
        if (death == 'Carrier') {
            document.querySelector('.game-over-cause-of-death').innerHTML = 'Death by Carrier';
        }

        let element: HTMLElement = document.querySelector('.game-over-modifier-header');
        if (state.modifiers.length > 0) {
            element.style.display = 'block';
        }
        else {
            element.style.display = 'none';
        }
        element = document.querySelector('.game-over-modifiers');
        element.innerHTML = "";
        MODIFIERS.forEach((modifier) => {
            if (state.hasModifier(modifier.name)) {
                element.innerHTML += `<div>
                    <span class="d1">${modifier.name}</span> &mdash; <span class="d1">+${modifier.scoreMultiplier * 100}%</span> &mdash; ${modifier.description}
                </div>`
            }
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
                return;
            }
        }
        else if (!state && index > -1) {
            this.selectedModifiers.splice(index, 1)
        }
    }

    updateVolume(volume: number) {
        Howler.volume(volume / 100);
        this.game.state.volume = volume;
        //@ts-ignore
        document.querySelector('.volume-input').value = volume;
    }

    updateInstructions(level: number) {
        const levelClass: number = level % 9;
        document.querySelectorAll('.Xbox').forEach((element) => {
            element.classList.remove(`d1`);
            element.classList.remove(`d2`);
            element.classList.remove(`d3`);
            element.classList.remove(`d4`);
            element.classList.remove(`d5`);
            element.classList.remove(`d6`);
            element.classList.remove(`d7`);
            element.classList.remove(`d8`);
            element.classList.remove(`d9`);
            element.classList.add(`d${levelClass}`);
        });


        for (let i = 1; i <= 9; i++) {
            document.querySelectorAll(`.no_display_level_${i}`).forEach((element) => {
                if (level < i) {
                    //@ts-ignore
                    element.style.display = 'none';
                }
                else {
                    //@ts-ignore
                    element.style.display = 'inherit';
                }
            });
        }
    }

    onError(error: Error) {
        this.toggleTab(Tab.FatalError);

        let text = `<div style="font-size: 20px;">
            / / / <b class="c6">X-Quest has crashed.</b> \\ \\ \\
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;Oh, and you must refresh to continue.<br /><br />`;
        text += error.message;

        (document.querySelector(`[tab="7"]`) as HTMLElement).innerHTML = text;
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
        text += "<br>Base Clock: " + this.game.gameClockMs + "ms";
        text += "<br>Time: " + totalLines * this.game.gameClockMs / 1000 / 60 + " minutes"
        this.game.state.level = temp;

        (document.querySelector(`[tab="0"]`) as HTMLElement).innerHTML = text;
    }
}
