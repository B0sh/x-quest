import { QuestStatistics } from "./stats";

export class State {
    level: number;
    levelLines: number;
    nextLevelClass: number;
    gameMode: string;

    invincible: number = 0;
    distortion: number = 0;
    multishot: number = 0;
    warp: number = 0;
    lives: number = 3;

    stats: QuestStatistics;

    constructor() {

    }

    isKillScreen() {
        return this.level > 63;
    }
}