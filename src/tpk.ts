import { XQuest } from "./game";
import { Savefile } from "./models/game-save";
import { GameStatistics } from "./models/game-statistics";
import { Requests } from "./requests";
import { State } from "./state";

export default class TPKRequest extends Requests {
    loadGame(): Promise<Savefile> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', '/x-quest/load-game.php', true);
            req.onload = () => {
                return TPKRequest.onSuccess(req, resolve, reject);
            };
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.send();
        });
    }

    saveGame(state: State) {
        const data = new FormData();
        data.append('volume', state.volume.toString());
        data.append('mod_nightmare', state.hasSelectedModifier('Nightmare').toString());
        data.append('mod_incline', state.hasSelectedModifier('Incline').toString());
        data.append('mod_invasion', state.hasSelectedModifier('Invasion').toString());
        data.append('mod_matrix', state.hasSelectedModifier('Matrix').toString());
        data.append('mod_barebones', state.hasSelectedModifier('Barebones').toString());
        data.append('mod_survivor', state.hasSelectedModifier('Survivor').toString());

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', '/x-quest/save-game.php', true);
            req.onload = () => {
                return TPKRequest.onSuccess(req, resolve, reject);
            };
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.send(data);
        });
    }

    startGame(state: State) {
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
                return TPKRequest.onSuccess(req, resolve, reject);
            };
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.send(data);
        });
    }

    finishGame(state: State, death: string) {
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
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                return TPKRequest.onSuccess(req, resolve, reject);
            };
            req.send(data);
        });
    }

    gameStateSync(state: State, xcheck: string) {
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
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                return TPKRequest.onSuccess(req, resolve, reject);
            };
            req.send(data);
        });
    }

    loadHighScores(state: State, scoreList: string) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', `/x-quest/high-scores.php?list=${scoreList}`);
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                TPKRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
            };
            req.send();
        });
    }

    loadStatistics(state: State): Promise<GameStatistics> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', '/x-quest/statistics.php');
            req.onerror = (e) => reject(TPKRequest.onError(`Network Error: ${e}`));
            req.onload = () => {
                TPKRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(TPKRequest.onError(req.statusText))
            };
            req.send();
        });
    }

    static onSuccess(req: any, resolve: any, reject: any) {
        TPKRequest.checkHeaders(req);
        if (req.status !== 200) {
            return reject(TPKRequest.onError(req.statusText));
        }
        else {
            try {
                const obj = JSON.parse(req.response);
                return resolve(obj);
            }
            catch (e) {
                return reject(TPKRequest.onError(req.response));
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