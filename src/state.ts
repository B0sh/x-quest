import { XQuest } from "./game";
import { Savefile } from "./models/game-save";
import { QuestStatistics } from "./models/quest-statistics";
import { Modifier } from "./modifier";
import { Requests } from "./requests";
import TPKRequest from "./tpk";

export class State {
    level: number;
    lines: number;
    levelLines: number;
    modifiers: string[] = [];

    invincible: number = 0;
    distortion: number = 0;
    multishot: number = 0;
    warp: number = 0;
    lives: number = 3;
    power: string = null;

    stats: QuestStatistics;
    volume: number = 0;
    highScore: number = 0;
    gameId: number;
    loading: boolean = true;

    username: string;
    userId: string;
    offline: boolean;

    constructor(
        private game: XQuest,
        private requests: Requests
    ) { }

    hasModifier(modifier: string): boolean {
        return this.modifiers.indexOf(modifier) !== -1; 
    }

    hasSelectedModifier(modifier: string): boolean {
        return this.game.layout.selectedModifiers.map((m) => m.name).indexOf(modifier) !== -1; 
    }

    isKillScreen() {
        return this.level > 63;
    }

    save() {
        this.requests.saveGame(this).then(() => {
            console.log("Finished saving");
        }).catch((error: Error) => {
            this.game.handleError(error);
        });
    }

    load() {
        this.requests.loadGame().then((result: Savefile) => {
            this.game.layout.updateVolume(result.volume);
            this.game.layout.updateOffline(result.offline);
            this.highScore = result.high_score;
            this.userId = result.user_id;
            this.username = result.user_name;

            this.game.layout.updateModifier('Nightmare', result.mod_nightmare == 1);
            this.game.layout.updateModifier('Incline', result.mod_incline == 1);
            this.game.layout.updateModifier('Invasion', result.mod_invasion == 1);
            this.game.layout.updateModifier('Matrix', result.mod_matrix == 1);
            this.game.layout.updateModifier('Survivor', result.mod_survivor == 1);
            this.game.layout.updateModifier('Barebones', result.mod_barebones == 1);

            this.game.layout.loadOptions();
            this.loading = false;
        }).catch((error: Error) => {
            this.game.handleError(error);
        });
    }
}