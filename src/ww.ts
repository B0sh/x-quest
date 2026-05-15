import { XQuest } from "./game";
import { Savefile } from "./models/game-save";
import { Requests } from "./requests";
import { State } from "./state";
import { GameStatistics } from "./models/game-statistics";

type FinishedGameRecord = {
    user_id: string;
    user_name: string;
    cause_of_death: string;
    game_id: string;
    score: string;
    level: string;
    lines: string;
    shots_fired: string;
    ships_destroyed: string;
    shots_destroyed: string;
    powerups_used: string;
    moves: string;
    game_time: string;
    version: string;
    mod_nightmare: string;
    mod_incline: string;
    mod_invasion: string;
    mod_matrix: string;
    mod_barebones: string;
    mod_survivor: string;
    timestamp: number;
};

type GameStartResponse = {
    game_id: number;
    xcheck: string;
};

export default class WWRequest extends Requests {
    apiUrl: string;

    constructor() {
        super();
        this.apiUrl = `${this.resolveBasePath()}/api`;
    }

    private resolveBasePath(): string {
        const moduleScript = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
        const scriptPath = moduleScript?.src ? new URL(moduleScript.src, window.location.href).pathname : "";
        if (scriptPath) {
            const assetBasePath = scriptPath.replace(/\/[^/]*$/, "");
            const normalizedAssetBasePath = assetBasePath.endsWith("/src")
                ? assetBasePath.slice(0, -4) || "/"
                : assetBasePath || "/";
            return normalizedAssetBasePath === "/" ? "" : normalizedAssetBasePath;
        }

        const pathname = window.location.pathname;
        if (pathname === "/") {
            return "";
        }

        const withoutTrailingSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
        return withoutTrailingSlash || "";
    }

    private generateUserId(): string {
        return crypto.randomUUID();
    }

    private parse(): Savefile {
        let save: Savefile;
        try {
            save = JSON.parse(localStorage.getItem("x-quest-save") ?? "");
        } catch (error) {
            save = {
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
                game_log: [],
            };
            localStorage.setItem("x-quest-save", JSON.stringify(save));
        }

        return save;
    }

    private saveLocal(save: Savefile) {
        localStorage.setItem("x-quest-save", JSON.stringify(save));
    }

    private postBody(object: Record<string, string>) {
        return new URLSearchParams(object);
    }

    private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await fetch(`${this.apiUrl}${path}`, {
            ...init,
            credentials: "same-origin",
        });

        if (!response.ok) {
            throw new Error(await this.readError(response));
        }

        return response.json();
    }

    private async requestText(path: string): Promise<string> {
        const response = await fetch(`${this.apiUrl}${path}`, {
            credentials: "same-origin",
        });

        if (!response.ok) {
            throw new Error(await this.readError(response));
        }

        return response.text();
    }

    private async readError(response: Response): Promise<string> {
        const text = await response.text();
        return text || `Request failed with status ${response.status}`;
    }

    private calculateMinigamePoints(state: State): number {
        const level = Math.max(state.level, 30);
        const levelSum = (level * (level + 1)) / 3;
        const modifiers = (state.hasModifier("Barebones") ? 0.3 : 0)
            + (state.hasModifier("Incline") ? 0.5 : 0)
            + (state.hasModifier("Invasion") ? 0.5 : 0)
            + (state.hasModifier("Matrix") ? 0.5 : 0)
            + (state.hasModifier("Nightmare") ? 2 : 0)
            + (state.hasModifier("Survivor") ? 1 : 0);

        return Math.floor(levelSum * state.stats.Score * (modifiers + 1));
    }

    private buildOfflineStats(save: Savefile): GameStatistics {
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

        save.game_log.forEach((game: FinishedGameRecord) => {
            const score = Number(game.score);
            const level = Number(game.level);
            stats.t_games += 1;
            stats.t_score += score;
            stats.t_level += level;
            stats.t_lines += Number(game.lines);
            stats.t_game_time += Number(game.game_time);
            stats.t_minigame_points += this.calculateOfflineRecordMinigamePoints(game);
            stats.t_ships_destroyed += Number(game.ships_destroyed);
            stats.t_shots_destroyed += Number(game.shots_destroyed);
            stats.t_shots_fired += Number(game.shots_fired);
            stats.t_powerups_used += Number(game.powerups_used);
            stats.t_moves += Number(game.moves);
            stats.t_death_abyss += game.cause_of_death == "Abyss" ? 1 : 0;
            stats.t_death_spaceship += game.cause_of_death == "Spaceship" ? 1 : 0;
            stats.t_death_wall += game.cause_of_death == "Wall" ? 1 : 0;
        });

        return stats;
    }

    private calculateOfflineRecordMinigamePoints(game: FinishedGameRecord): number {
        const level = Math.max(Number(game.level), 30);
        const levelSum = (level * (level + 1)) / 3;
        const modifiers = (game.mod_barebones === "true" ? 0.3 : 0)
            + (game.mod_incline === "true" ? 0.5 : 0)
            + (game.mod_invasion === "true" ? 0.5 : 0)
            + (game.mod_matrix === "true" ? 0.5 : 0)
            + (game.mod_nightmare === "true" ? 2 : 0)
            + (game.mod_survivor === "true" ? 1 : 0);

        return Math.floor(levelSum * Number(game.score) * (modifiers + 1));
    }

    private buildOfflineHighScores(save: Savefile, scoreList: string): string {
        const filteredGames = (save.game_log as FinishedGameRecord[])
            .filter((game) => this.matchesScoreList(game, scoreList))
            .sort((a, b) => {
                const scoreDiff = Number(b.score) - Number(a.score);
                if (scoreDiff !== 0) {
                    return scoreDiff;
                }

                return Number(b.timestamp) - Number(a.timestamp);
            })
            .slice(0, 10);

        if (filteredGames.length === 0) {
            return `<div>No local high scores yet. Start a run to populate offline results.</div>`;
        }

        const rows = filteredGames.map((game, index) => {
            const date = new Date(Number(game.timestamp) * 1000);
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${this.escapeHtml(game.user_name || "Anonymous")}</td>
                    <td>${Number(game.score).toLocaleString()}</td>
                    <td>${Number(game.level)}</td>
                    <td>${this.formatGameTime(Number(game.game_time))}</td>
                    <td>${date.toLocaleDateString()}</td>
                </tr>
            `;
        }).join("");

        return `
            <div style="margin-bottom: 12px;">Offline leaderboard from this browser.</div>
            <table>
                <thead>
                    <tr>
                        <th class="level-class" style="width: 20px;"></th>
                        <th class="level-class" style="min-width: 120px;">Name</th>
                        <th class="level-class" style="width: 50px;">Score</th>
                        <th class="level-class" style="width: 50px;">Level</th>
                        <th class="level-class" style="width: 100px;">Game Time</th>
                        <th class="level-class" style="width: 100px;">Date Of</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    private matchesScoreList(game: FinishedGameRecord, scoreList: string): boolean {
        if (scoreList === "nightmare") {
            return game.mod_nightmare === "true";
        }

        if (scoreList === "incline") {
            return game.mod_incline === "true";
        }

        return true;
    }

    private escapeHtml(value: string): string {
        return value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    }

    private formatGameTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
        const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
        return `${minutes}m ${remainingSeconds}s`;
    }

    loadGame(): Promise<Savefile> {
        const save = this.parse();

        if (save.game_log.length > 0) {
            save.high_score = Number(save.game_log.reduce((a, b) => Number(a.score) > Number(b.score) ? a : b).score);
        } else {
            save.high_score = 0;
        }

        return Promise.resolve(save);
    }

    saveGame(state: State) {
        const save = this.parse();

        save.volume = state.volume;
        save.user_name = state.username;
        save.offline = state.offline;
        save.mod_barebones = state.hasSelectedModifier("Barebones") ? 1 : 0;
        save.mod_incline = state.hasSelectedModifier("Incline") ? 1 : 0;
        save.mod_invasion = state.hasSelectedModifier("Invasion") ? 1 : 0;
        save.mod_matrix = state.hasSelectedModifier("Matrix") ? 1 : 0;
        save.mod_nightmare = state.hasSelectedModifier("Nightmare") ? 1 : 0;
        save.mod_survivor = state.hasSelectedModifier("Survivor") ? 1 : 0;
        this.saveLocal(save);
        return Promise.resolve(true);
    }

    async startGame(state: State): Promise<GameStartResponse> {
        if (state.offline) {
            return { game_id: 0, xcheck: "" };
        }

        try {
            return await this.requestJson<GameStartResponse>("/start-game", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: this.postBody({
                    user_id: state.userId,
                    user_name: state.username,
                    version: XQuest.version,
                    mod_nightmare: state.hasModifier("Nightmare").toString(),
                    mod_incline: state.hasModifier("Incline").toString(),
                    mod_invasion: state.hasModifier("Invasion").toString(),
                    mod_matrix: state.hasModifier("Matrix").toString(),
                    mod_barebones: state.hasModifier("Barebones").toString(),
                    mod_survivor: state.hasModifier("Survivor").toString(),
                }),
            });
        } catch (error) {
            return { game_id: 0, xcheck: "" };
        }
    }

    async finishGame(state: State, death: string) {
        const data: FinishedGameRecord = {
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
            mod_nightmare: state.hasModifier("Nightmare").toString(),
            mod_incline: state.hasModifier("Incline").toString(),
            mod_invasion: state.hasModifier("Invasion").toString(),
            mod_matrix: state.hasModifier("Matrix").toString(),
            mod_barebones: state.hasModifier("Barebones").toString(),
            mod_survivor: state.hasModifier("Survivor").toString(),
            timestamp: Math.floor(Date.now() / 1000),
        };

        const save = this.parse();
        save.game_log.push(data);
        this.saveLocal(save);

        const offlineResponse = {
            minigame_points: this.calculateMinigamePoints(state),
            server_available: false,
        };

        if (state.offline || state.gameId === 0) {
            return offlineResponse;
        }

        try {
            return await this.requestJson("/finish-game", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: this.postBody({
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
                    mod_nightmare: state.hasModifier("Nightmare").toString(),
                    mod_incline: state.hasModifier("Incline").toString(),
                    mod_invasion: state.hasModifier("Invasion").toString(),
                    mod_matrix: state.hasModifier("Matrix").toString(),
                    mod_barebones: state.hasModifier("Barebones").toString(),
                    mod_survivor: state.hasModifier("Survivor").toString(),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                }),
            });
        } catch (error) {
            return offlineResponse;
        }
    }

    async gameStateSync(state: State, xcheck: string) {
        if (state.offline || state.gameId === 0) {
            return { xcheck };
        }

        try {
            return await this.requestJson("/update-game", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: this.postBody({
                    user_id: state.userId,
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
                    xcheck,
                    version: XQuest.version,
                    mod_nightmare: state.hasModifier("Nightmare").toString(),
                    mod_incline: state.hasModifier("Incline").toString(),
                    mod_invasion: state.hasModifier("Invasion").toString(),
                    mod_matrix: state.hasModifier("Matrix").toString(),
                    mod_barebones: state.hasModifier("Barebones").toString(),
                    mod_survivor: state.hasModifier("Survivor").toString(),
                }),
            });
        } catch (error) {
            return { xcheck };
        }
    }

    async loadHighScores(state: State, scoreList: string) {
        const save = this.parse();
        if (state.offline) {
            return this.buildOfflineHighScores(save, scoreList);
        }

        try {
            const userId = state.userId || "";
            return await this.requestText(`/high-scores?user_id=${encodeURIComponent(userId)}&list=${encodeURIComponent(scoreList)}`);
        } catch (error) {
            return this.buildOfflineHighScores(save, scoreList);
        }
    }

    async submitHighScore(state: State, username: string) {
        if (state.offline || state.gameId === 0) {
            return { submitted: false, server_available: false };
        }

        try {
            return await this.requestJson("/submit-highscore", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: this.postBody({
                    user_id: state.userId,
                    user_name: username,
                    game_id: state.gameId.toString(),
                    version: XQuest.version,
                }),
            });
        } catch (error) {
            return { submitted: false, server_available: false };
        }
    }

    async loadStatistics(state: State): Promise<GameStatistics> {
        const save = this.parse();

        if (state.offline) {
            return this.buildOfflineStats(save);
        }

        try {
            return await this.requestJson<GameStatistics>(`/statistics?user_id=${encodeURIComponent(save.user_id)}`);
        } catch (error) {
            return this.buildOfflineStats(save);
        }
    }
}
