import { Howler } from "howler";
import { Changelog } from "./changelog";
import { XQuest } from "./game";
import { GameStatistics } from "./models/game-statistics";
import { Modifier } from "./modifier";
import { Requests } from "./requests";
import { State } from "./state";
import Utility from "./utility";

export const enum Tab {
    AudioLockout = 0,
    Instructions = 1,
    Options = 2,
    HighScore = 3,
    Statistics = 4,
    Changelog = 5,
    GameOverStatistics = 6,
    FatalError = 7,
    Register = 8,
    EasterEgg = 9,
}

export class Layout {
    currentTab: number = Tab.Instructions;
    selectedModifiers: Modifier[] = [];

    constructor(
        private game: XQuest,
        private requests: Requests
    ) {
        const sheet = document.styleSheets[0];
        if (this.game.onTPK) {
            sheet.insertRule('.hidden-tpk { display: none; }');
        }
        if (this.game.onWW) {
            sheet.insertRule('.hidden-ww { display: none; }');
        }
    }

    initTabEvents() {
        document.querySelectorAll('.tab').forEach((element: Element) => {
            const id = element.getAttribute('tab-header');
            element.addEventListener('click', () => {
                this.toggleTab(Number(id));
            });
        });
    }

    toggleTab(tab: number) {
        const board = document.querySelector('.x-quest-board') as HTMLElement;
        if (board && tab != Tab.AudioLockout) 
            board.style.display = null;

        if (this.game.Crashed) {
            tab = Tab.FatalError;
        }

        for (let i = 0; i <= 9; i++) {
            const contentElement = document.querySelector(`[tab="${i}"]`) as HTMLElement;
            if (contentElement)
                contentElement.style.display = 'none';
            const tabElement = document.querySelector(`[tab-header="${i}"]`);
            if (tabElement)
                tabElement.classList.remove('active-tab');
        }

        let element: any;
        element = document.querySelector(`[tab="${tab}"]`) as HTMLElement;
        if (element)
            element.style.display = 'inline-block';

        element = document.querySelector(`[tab-header="${tab}"]`);
        if (element)
            element.classList.add('active-tab');

        if (tab == Tab.GameOverStatistics) {
            element = document.querySelector(`[tab-header="${Tab.Instructions}"]`);
            if (element)
                element.classList.add('active-tab');
        }

        if (tab == Tab.EasterEgg) {
        	this.killScreenEasterEgg();
        }

        if (tab == Tab.Options) {
            this.loadOptions();
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
        const element = document.querySelector('.highscore-content');
        element.innerHTML = '';
        this.requests.loadHighScores(this.game.state, scoreList).then((content: any) => {
            element.innerHTML = content;
            this.updateLevelColors();
        }).catch((error) => {
            this.game.handleError(error);
        });
    }

    loadStatistics() {
        (document.querySelector(`.stats-table`) as HTMLElement).style.visibility = "hidden";
        this.requests.loadStatistics(this.game.state).then((stats: GameStatistics) => {
            for (const stat in stats) {
                const element = document.querySelector(`[stat="${stat}"]`);
                if (element) {
                    const value = stats[stat] ? stats[stat] : 0;
                    if (stat == 't_game_time') {
                        element.innerHTML = Utility.sec2hms(value);
                    }
                    else {
                        element.innerHTML = Utility.format(value);
                    }
                }
            }
            (document.querySelector(`.stats-table`) as HTMLElement).style.visibility = "unset";
            this.updateLevelColors();
        }).catch((error) => {
            this.game.handleError(error);
        });
    }

    loadOptions() {
        this.loadModifiers();

        // document.querySelector('.userid-input').innerHTML = this.game.state.userId;
        document.querySelector('.username-input').innerHTML = this.game.state.username;
    }

    private loadModifiers() {
        const element = document.querySelector('.modifier-list');
        element.innerHTML = "";

        this.game.getModifiers().forEach((modifier) => {
            const checked: string = this.selectedModifiers.findIndex((sel) => sel.name == modifier.name) == -1 ? '' : 'checked';
            const disabled: string = this.selectedModifiers.find((sel) =>
                sel.invalidComboModifiers?.find((x) => x == modifier.name)
            ) ? 'disabled' : '';

            let modifierElement = '';
            if (modifier.scoreMultiplier) {
                modifierElement = `&mdash; <span class="level-class">+${modifier.scoreMultiplier * 100}%</span>`;
            }

            element.innerHTML += `<div style="clear: both;">
                <input type="checkbox"
                       class="checkbox"
                       onchange="Game.layout.updateModifier('${modifier.name}', this.checked); Game.state.save();"
                       ${disabled}
                       ${checked} />
                <span class="level-class">${modifier.name}</span> ${modifierElement} &mdash; ${modifier.description}
            </div>`;
        });
        this.updateLevelColors();
    }

    loadGameOverStatistics(state: State, death: string, minigamePoints: number, eventCurrency: number) {
        this.toggleTab(Tab.GameOverStatistics);

        document.querySelector('.game-over-score').innerHTML = Utility.format(state.stats.Score);

        const mgEl = document.querySelector('.game-over-minigame-points');
        if (mgEl && minigamePoints != null) {
            mgEl.innerHTML = '+' + Utility.format(minigamePoints);
        }
        else if (mgEl) {
            mgEl.innerHTML = 'Loading...';
        }

        const eventEl = document.querySelector('.game-over-event-currency');
        if (eventEl && eventCurrency != null) {
            eventEl.innerHTML = '<img src="https://sprites.tpkrpg.net/items/439.png" style="width:24px;height:24px;vertical-align:middle">&nbsp; +' + Utility.format(eventCurrency);
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
        this.game.getModifiers().forEach((modifier) => {
            if (state.hasModifier(modifier.name)) {
                let modifierElement = '';
                if (modifier.scoreMultiplier) {
                    modifierElement = `&mdash; <span class="level-class">+${modifier.scoreMultiplier * 100}%</span>`;
                }

                element.innerHTML += `<div>
                    <span class="level-class">${modifier.name}</span> ${modifierElement} &mdash; ${modifier.description}
                </div>`
            }
        });

        this.updateLevelColors();
    }

    updateModifier(modifierName: string, state: boolean) {
        const modifier = this.game.getModifiers().find((modifier) => modifier.name == modifierName);
        if (modifier == null) {
            return;
        }

        const index = this.selectedModifiers.findIndex((modifier) => modifier.name == modifierName);
        if (state && index == -1) {

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

        this.loadModifiers();
    }

    updateVolume(volume: number) {
        Howler.volume(volume / 100);
        this.game.state.volume = volume;
        document.querySelector<HTMLInputElement>('.volume-input').value = volume.toString();
    }

    updateOffline(offline: boolean) {
        this.game.state.offline = offline;
        document.querySelector<HTMLInputElement>('.offline-input').checked = offline;
    }

    updateUsername(username: string) {
        this.game.state.username = username;
        document.querySelector<HTMLInputElement>('.username-input').value = username;
    }

    updateLevelColors(level?: number) {
        level = this.game.state.level ? this.game.state.level : 1;
        let levelClass: number = level % 9;
        if (levelClass == 0)
            levelClass = 9;

        document.querySelectorAll('.level-class').forEach((element) => {
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
            document.querySelectorAll<HTMLElement>(`.no_display_level_${i}`).forEach((element) => {
                if (level < i) {
                    element.style.display = 'none';
                }
                else {
                    element.style.display = 'unset';
                }
            });
        }
    }

    submitHighScore() {
        const username = document.querySelector<HTMLInputElement>('.game-over-username-input').value;
        if (username.length > 0) {
            this.updateUsername(username);
            this.game.state.save();
            this.requests.submitHighScore(this.game.state, username).then(() => {
                document.querySelector<HTMLElement>('.game-over-high-score').style.display = "none";
                document.querySelector<HTMLElement>('.game-over-high-score-submitted').style.display = "unset";
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

        console.error(error);

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
