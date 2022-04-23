import { XQuest } from "./game";
import { Savefile } from "./models/game-save";
import { Requests } from "./requests";
import { State } from "./state";

export default class WWRequest extends Requests {
    loadGame(): Promise<Savefile> {
        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        if (!save) {
            const newSave: Savefile = {
                high_score: 0,
                volume: 50,
                mod_barebones: 0,
                mod_incline: 0,
                mod_invasion: 0,
                mod_matrix: 0,
                mod_nightmare: 0,
                mod_survivor: 0,
                current_minigame_points: null,
            };
            localStorage.setItem("x-quest-save", JSON.stringify(newSave));
            return Promise.resolve(newSave);
        }
        return Promise.resolve(save);
    }

    saveGame(state: State) {
        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        save.volume = state.volume,
        save.mod_barebones = state.hasSelectedModifier('Barebones') ? 1 : 0,
        save.mod_incline = state.hasSelectedModifier('Incline') ? 1 : 0,
        save.mod_invasion = state.hasSelectedModifier('Invasion') ? 1 : 0,
        save.mod_matrix = state.hasSelectedModifier('Matrix') ? 1 : 0,
        save.mod_nightmare = state.hasSelectedModifier('Nightmare') ? 1 : 0,
        save.mod_survivor = state.hasSelectedModifier('Survivor') ? 1 : 0,
        localStorage.setItem("x-quest-save", JSON.stringify(save));
        return Promise.resolve(true);
    }

    startGame(state: State) {
        return Promise.resolve({ saved: true });
        const data = new FormData();
        data.append('version', XQuest.version);
        data.append('mod_nightmare', state.hasModifier('Nightmare').toString());
        data.append('mod_incline', state.hasModifier('Incline').toString());
        data.append('mod_invasion', state.hasModifier('Invasion').toString());
        data.append('mod_matrix', state.hasModifier('Matrix').toString());
        data.append('mod_barebones', state.hasModifier('Barebones').toString());
        data.append('mod_survivor', state.hasModifier('Survivor').toString());

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', '/x-quest/start-game.php', true);
            req.onload = () => {
                return WWRequest.onSuccess(req, resolve, reject);
            };
            req.onerror = (e) => reject(WWRequest.onError(`Network Error: ${e}`));
            req.send(data);
        });
    }

    finishGame(state: State, death: string) {
        return Promise.resolve({ });
        const data = new FormData();
        data.append('cause_of_death', death);
        data.append('game_id', state.gameId.toString());
        data.append('score', state.stats.Score.toString());
        data.append('level', state.level.toString());
        data.append('lines', state.lines.toString());
        data.append('shots_fired', state.stats.ShotsFired.toString());
        data.append('ships_destroyed', state.stats.ShipsDestroyed.toString());
        data.append('shots_destroyed', state.stats.ShotsDestroyed.toString());
        data.append('powerups_used', state.stats.PowerupsUsed.toString());
        data.append('moves', state.stats.Moves.toString());
        data.append('game_time', Math.floor(state.stats.Time).toString());
        data.append('version', XQuest.version);
        data.append('mod_nightmare', state.hasModifier('Nightmare').toString());
        data.append('mod_incline', state.hasModifier('Incline').toString());
        data.append('mod_invasion', state.hasModifier('Invasion').toString());
        data.append('mod_matrix', state.hasModifier('Matrix').toString());
        data.append('mod_barebones', state.hasModifier('Barebones').toString());
        data.append('mod_survivor', state.hasModifier('Survivor').toString());

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', '/x-quest/finish-game.php');
            req.onerror = (e) => reject(WWRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                return WWRequest.onSuccess(req, resolve, reject);
            };
            req.send(data);
        });
    }

    gameStateSync(state: State, xcheck: string) {
        return Promise.resolve({});
        const data = new FormData();
        data.append('game_id', state.gameId.toString());
        data.append('score', state.stats.Score.toString());
        data.append('level', state.level.toString());
        data.append('lines', state.lines.toString());
        data.append('shots_fired', state.stats.ShotsFired.toString());
        data.append('ships_destroyed', state.stats.ShipsDestroyed.toString());
        data.append('shots_destroyed', state.stats.ShotsDestroyed.toString());
        data.append('powerups_used', state.stats.PowerupsUsed.toString());
        data.append('moves', state.stats.Moves.toString());
        data.append('game_time', Math.floor(state.stats.Time).toString());
        data.append('xcheck', xcheck);
        data.append('version', XQuest.version);
        data.append('mod_nightmare', state.hasModifier('Nightmare').toString());
        data.append('mod_incline', state.hasModifier('Incline').toString());
        data.append('mod_invasion', state.hasModifier('Invasion').toString());
        data.append('mod_matrix', state.hasModifier('Matrix').toString());
        data.append('mod_barebones', state.hasModifier('Barebones').toString());
        data.append('mod_survivor', state.hasModifier('Survivor').toString());

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', '/x-quest/update-game.php');
            req.onerror = (e) => reject(WWRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                return WWRequest.onSuccess(req, resolve, reject);
            };
            req.send(data);
        });
    }

    loadHighScores(scoreList: string) {
        return Promise.resolve({});
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', `/x-quest/high-scores.php?list=${scoreList}`);
            req.onerror = (e) => reject(WWRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                WWRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
            };
            req.send();
        });
    }

    loadStatistics() {
        return Promise.resolve({});
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', '/x-quest/statistics.php');
            req.onerror = (e) => reject(WWRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                WWRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(WWRequest.onError(req.statusText))
            };
            req.send();
        });
    }

    static onSuccess(req: any, resolve: any, reject: any) {
        WWRequest.checkHeaders(req);
        if (req.status !== 200) {
            return reject(WWRequest.onError(req.statusText));
        }
        else {
            try {
                const obj = JSON.parse(req.response);
                return resolve(obj);
            }
            catch (e) {
                return reject(WWRequest.onError(req.response));
            }
        }
    }

    static onError(message: string) {
        return Error(message);
    }

    static checkHeaders(request: XMLHttpRequest) {
        if (request.getResponseHeader('AJAX_REDIRECT') !== null) {
            window.location.href = request.getResponseHeader('AJAX_REDIRECT');
        }
    }
}