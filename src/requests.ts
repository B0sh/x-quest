import { Savefile } from "./models/game-save";
import { State } from "./state";

export class Requests {
    loadGame(): Promise<Savefile> { return null; }
    saveGame(state: State): Promise<any> { return null; }
    startGame(state: State): Promise<any> { return null; }
    finishGame(state: State, death: string): Promise<any> { return null; }
    gameStateSync(state: State, xcheck: string): Promise<any> { return null; }
    loadHighScores(scoreList: string): Promise<any> { return null; }
    loadStatistics(): Promise<any> { return null; }
}