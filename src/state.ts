import { QuestStatistics } from "./stats";

export class State {
    level: number;
    levelLines: number;
    displayLevel: number;
    nextLevelClass: number;
    gameMode: string;

    invincible: number = 0;
    distortion: number = 0;
    multishot: number = 0;
    warp: number = 0;

    stats: QuestStatistics;

    constructor() {

    }

    isKillScreen() {
        return this.displayLevel > 63;
    }
}