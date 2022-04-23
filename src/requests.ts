import { Savefile } from "./models/game-save";
import { GameStatistics } from "./models/game-statistics";
import { State } from "./state";

export class Requests {
    loadGame(): Promise<Savefile> { return null; }
    saveGame(state: State): Promise<any> { return null; }
    startGame(state: State): Promise<any> { return null; }
    finishGame(state: State, death: string): Promise<any> { return null; }
    gameStateSync(state: State, xcheck: string): Promise<any> { return null; }
    loadHighScores(state: State, scoreList: string): Promise<any> { return null; }
    loadStatistics(state: State): Promise<GameStatistics> { return null; }
}