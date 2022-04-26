import { XQuest } from "./game";
import { Savefile } from "./models/game-save";
import { Requests } from "./requests";
import { State } from "./state";
import { v4 as uuidv4 } from 'uuid';
import { GameStatistics } from "./models/game-statistics";

export default class WWRequest extends Requests {
    apiUrl: string;
    constructor() {
        super();

        //@ts-ignore parcel imports process automatically
        if (process.env.NODE_ENV !== 'production') {
            this.apiUrl = 'http://localhost/x-quest';
        }
        else {
            this.apiUrl = '/projects/x-quest';
        }
    }

    private generateUserId(): string {
        return uuidv4();
    }

    loadGame(): Promise<Savefile> {
        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        if (!save) {
            const newSave: Savefile = {
                user_id: this.generateUserId(),
                user_name: "",
                offline: false,
                high_score: 0,
                volume: 50,
                mod_barebones: 0,
                mod_incline: 0,
                mod_invasion: 0,
                mod_matrix: 0,
                mod_nightmare: 0,
                mod_survivor: 0,
                current_minigame_points: null,
                game_log: [],
            };
            localStorage.setItem("x-quest-save", JSON.stringify(newSave));
            return Promise.resolve(newSave);
        }

        if (save.game_log.length > 0) {
            save.high_score = Number(save.game_log.reduce((a,b) => Number(a.score) > Number(b.score) ? a : b).score);
        }
        else {
            save.high_score = 0;
        }

        return Promise.resolve(save);
    }

    saveGame(state: State) {
        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        save.volume = state.volume,
        save.user_name = state.username;
        save.offline = state.offline;
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
        const data = {
            user_id: state.userId,
            user_name: state.username,

            version: XQuest.version,
            mod_nightmare: state.hasModifier('Nightmare').toString(),
            mod_incline: state.hasModifier('Incline').toString(),
            mod_invasion: state.hasModifier('Invasion').toString(),
            mod_matrix: state.hasModifier('Matrix').toString(),
            mod_barebones: state.hasModifier('Barebones').toString(),
            mod_survivor: state.hasModifier('Survivor').toString(),
            
            date: new Date(),
        };

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', `${this.apiUrl}/start-game`, true);
            req.withCredentials = true;
            req.onload = () => {
                return WWRequest.onSuccess(req, resolve, reject);
            };
            req.onerror = (e) => reject(WWRequest.onError());
            req.send(this.postData(data));
        });
    }

    finishGame(state: State, death: string) {
        const data = {
            user_id: state.userId,
            user_name: state.username,

            cause_of_death: death,
            game_id: state.gameId.toString(),
            score: state.stats.Score.toString(),
            level: state.level.toString(),
            lines: state.lines.toString(),
            shots_fired: state.stats.ShotsFired.toString(),
            ships_destroyed: state.stats.ShipsDestroyed.toString(),
            shots_destroyed: state.stats.ShotsDestroyed.toString(),
            powerups_used: state.stats.PowerupsUsed.toString(),
            moves: state.stats.Moves.toString(),
            game_time: Math.floor(state.stats.Time).toString(),
            version: XQuest.version,
            mod_nightmare: state.hasModifier('Nightmare').toString(),
            mod_incline: state.hasModifier('Incline').toString(),
            mod_invasion: state.hasModifier('Invasion').toString(),
            mod_matrix: state.hasModifier('Matrix').toString(),
            mod_barebones: state.hasModifier('Barebones').toString(),
            mod_survivor: state.hasModifier('Survivor').toString(),
            
            timestamp: Math.floor(new Date().getTime() / 1000),
        };

        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        save.game_log.push(data);
        localStorage.setItem("x-quest-save", JSON.stringify(save));

        if (state.offline) {
            return Promise.resolve({ });
        } else {
            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();
                req.open('POST', `${this.apiUrl}/finish-game`);
                req.withCredentials = true;
                req.onerror = (e) => reject(WWRequest.onError());
                req.onload = () => {
                    return WWRequest.onSuccess(req, resolve, reject);
                };
                req.send(this.postData(data));
            });
        }
    }

    gameStateSync(state: State, xcheck: string) {
        const data = {
            user_id: state.userId.toString(),
            user_name: state.username,

            game_id: state.gameId.toString(),
            score: state.stats.Score.toString(),
            level: state.level.toString(),
            lines: state.lines.toString(),
            shots_fired: state.stats.ShotsFired.toString(),
            ships_destroyed: state.stats.ShipsDestroyed.toString(),
            shots_destroyed: state.stats.ShotsDestroyed.toString(),
            powerups_used: state.stats.PowerupsUsed.toString(),
            moves: state.stats.Moves.toString(),
            game_time: Math.floor(state.stats.Time).toString(),
            xcheck: xcheck,
            version: XQuest.version,
            mod_nightmare: state.hasModifier('Nightmare').toString(),
            mod_incline: state.hasModifier('Incline').toString(),
            mod_invasion: state.hasModifier('Invasion').toString(),
            mod_matrix: state.hasModifier('Matrix').toString(),
            mod_barebones: state.hasModifier('Barebones').toString(),
            mod_survivor: state.hasModifier('Survivor').toString(),
        };

        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', `${this.apiUrl}/update-game`);
            req.withCredentials = true;
            req.onerror = (e) => reject(WWRequest.onError());
            req.onload = () => {
                return WWRequest.onSuccess(req, resolve, reject);
            };
            req.send(this.postData(data));
        });
    }

    loadHighScores(state: State, scoreList: string) {
        let userId = '';
        if (!state.offline) {
            userId = state.userId;    
        }
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('GET', `${this.apiUrl}/high-scores?user_id=${userId}&list=${scoreList}`);
            req.withCredentials = true;
            req.onerror = (e) => reject(WWRequest.onError());
            req.onload = () => {
                WWRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
            };
            req.send();
        });
    }

    submitHighScore(state: State, username: string) {
        const data = {
            user_id: state.userId.toString(),
            user_name: username,
            game_id: state.gameId.toString(),
            version: XQuest.version,
        };
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.open('POST', `${this.apiUrl}/submit-highscore`);
            req.withCredentials = true;
            req.onerror = (e) => reject(WWRequest.onError());
            req.onload = () => {
                WWRequest.checkHeaders(req);
                return req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
            };
            req.send(this.postData(data));
        });
    }

    loadStatistics(state: State): Promise<GameStatistics> {
        const save: Savefile = JSON.parse(localStorage.getItem("x-quest-save"));
        const userId = save.user_id;
        if (state.offline) {
            const stats: GameStatistics = {
                t_games: 0,
                t_score: 0,
                t_level: 0,
                t_lines: 0,
                t_game_time: 0,
                t_minigame_points: 0,
                t_ships_destroyed: 0,
                t_shots_destroyed: 0,
                t_shots_fired: 0,
                t_powerups_used: 0,
                t_moves: 0,
                t_death_abyss: 0,
                t_death_spaceship: 0,
                t_death_wall: 0
            };
            save.game_log.forEach((game) => {
                stats.t_games += 1;
                stats.t_score += Number(game.score);
                stats.t_level += Number(game.level);
                stats.t_lines += Number(game.lines);
                stats.t_game_time += Number(game.game_time);
                stats.t_ships_destroyed += Number(game.ships_destroyed);
                stats.t_shots_destroyed += Number(game.shots_destroyed);
                stats.t_shots_fired += Number(game.shots_fired);
                stats.t_powerups_used += Number(game.powerups_used);
                stats.t_moves += Number(game.moves);
                stats.t_death_abyss += game.cause_of_death == "Abyss" ? 1 : 0;
                stats.t_death_spaceship += game.cause_of_death == "Spaceship" ? 1 : 0;
                stats.t_death_wall += game.cause_of_death == "Wall" ? 1 : 0;
            });
            return Promise.resolve(stats);
        }
        else {
            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();
                req.open('GET', `${this.apiUrl}/statistics?user_id=${userId}`);
                req.withCredentials = true;
                req.onerror = (e: any) => { 
                    reject(WWRequest.onError());
                };
                req.onload = () => {
                    return WWRequest.onSuccess(req, resolve, reject);
                };
                req.send();
            });
        }
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

    private postData(object: any): FormData {
        const formData: FormData = new FormData();
        for (let property in object) {
            formData.append(property, object[property]);
        }
        return formData;
    }

    static onError(message: string = "") {
        if (message == "") {
            return Error("<br>X-Quest could not connect to the server.<br><br>Offline mode can be enabled in options if problems persist.");
        }
        return Error(message);
    }

    static checkHeaders(request: XMLHttpRequest) {
        // if (request.getResponseHeader('AJAX_REDIRECT') !== null) {
        //     window.location.href = request.getResponseHeader('AJAX_REDIRECT');
        // }
    }
}