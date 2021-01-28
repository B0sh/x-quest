import { XQuest } from "./game";
import Utility from "./utility";

export class Board {
    lineLength: number[] = [];
    lineReset: number[] = [];
    lineEntered: number[] = [];

    constructor(private game: XQuest) {

    }

    generateStartingLines() {
        this.lineLength = [];
        this.lineReset = [];
        this.lineEntered = [];
        this.game.map = [];

        const mid = Math.floor((this.game.width - 1) / 2);

        for (var i = 0; i < this.game.width; i++) {
            // if the location is one of the 3 middle columns then make a line there
            const isMid: number  = Utility.contains(i, mid - 1, mid + 1) ? 1 : 0;

            this.lineLength.push(isMid * 25);
            this.lineReset.push(isMid);
            this.lineEntered.push(isMid);
        }

        for (let y = 0; y <= this.game.height; y++) {
            this.game.map.push(this.generateLine());
        }
    }

    generateLine(): string {
        let line: string = this.game.BaseLine;

        /* Randomly start a new line every once in a while (Higher line size = less new lines) */
        if (Utility.getRandomInt(1, 30 + this.game.width) == 1) {
            let lineIndex = Utility.getRandomInt(0, this.game.width - 1);
            this.lineReset[lineIndex] = 1;
            this.lineLength[lineIndex] = Utility.getRandomInt(6, 22 - this.game.state.level);
        }

        if (this.game.state.gameMode == 'normal') {
            var start = 0;
            var end = this.game.width;
        }
        else if (this.game.state.gameMode == 'nightmare') {
            var start = 2;
            var end = this.game.width - 2;

            line = Utility.setCharAt(line, 0, '>');
            line = Utility.setCharAt(line, 1, '>');

            line = Utility.setCharAt(line, this.game.width - 1, '<');
            line = Utility.setCharAt(line, this.game.width - 2, '<');
        }

        for (let i = start; i < end; i++) {
            if (this.lineLength[i] != 0) {
                let road: string = "`";

                if (Utility.getRandomInt(1, 1100) == 1) {
                    road = 'I';
                } else if (Utility.getRandomInt(1, 300) == 1) {
                    road = 'P';
                } else if (Utility.getRandomInt(1, 900) === 1) {
                    road = 'D';
                } else if (Utility.getRandomInt(1, 900) === 1 && this.game.state.level >= 6) {
                    road = 'W';
                } else if (Utility.getRandomInt(1, 900) === 1 && this.game.state.level >= 3) {
                    road = 'M';
                }

                line = Utility.setCharAt(line, i, road);

                /* Vertical line handler */
                this.lineLength[i] -= 1;
                if (this.lineLength[i] < Utility.getRandomInt(2, 6 - Math.floor(this.game.state.level / 4)) && this.lineReset[i] != 0) {
                    this.lineReset[i] = 0;
                    if ((Utility.getRandomInt(1, 2) == 1 && i != end - 1) || i == start) {
                        this.lineReset[i + 1] = 1;
                        this.lineLength[i + 1] = Utility.getRandomInt(6, 22 - this.game.state.level);
                    } else {
                        this.lineReset[i - 1] = 1;
                        this.lineLength[i - 1] = Utility.getRandomInt(6, 20 - this.game.state.level);
                    }
                }
            }
        }

        // at the end of the level
        if (this.game.state.levelLines > this.game.board.getLevelLines(this.game.state.level) - this.game.height) {
            for (let i = start; i < end; i++) {
                line = Utility.setCharAt(line, i, "%");
            }
        }

        return line;
    }

    getLevelLines(level: number): number {
        switch (level) {
            case 1: return 101; break;
            case 2: return 151; break;
            case 3: return 151; break;
            case 4: return 176; break;
            case 5: return 201; break;
            case 6: return 251; break;
            case 7: return 301; break;
            case 8: return 351; break;
            case 9:
            default: return 301; break;
        }
    }
}