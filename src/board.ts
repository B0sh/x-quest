import { RoadBullet } from "./entities/road-bullet";
import { XQuest } from "./game";
import Utility from "./utility";

export const enum LevelType {
    XQuest,
    Sinusoidal,
    Tightrope
}

export class Board {
    lineLength: number[] = [];
    lineReset: number[] = [];
    lineEntered: number[] = [];

    levelType: LevelType = LevelType.XQuest;
    sinFrequency: number[] = [];

    constructor(private game: XQuest) {
    }

    generateStartingLines() {
        this.onNextLevel();

        this.lineLength = [];
        this.lineReset = [];
        this.lineEntered = [];
        this.game.map = [];

        if (this.game.state.level == 1) {
            const mid = Math.floor((this.game.width - 1) / 2);

            for (var i = 0; i < this.game.width; i++) {
                // if the location is one of the 3 middle columns then make a line there
                const isMid: number = Utility.contains(i, mid - 1, mid + 1) ? 1 : 0;


                this.lineLength.push(isMid * 25);
                this.lineReset.push(isMid);
                this.lineEntered.push(isMid);
            }

            for (let y = 0; y <= this.game.height; y++) {
                this.game.map.push(this.generateLine());
            }
        }
        else {
            const line1X = Utility.getRandomInt(0, this.game.width - 1);
            const line2X = Utility.getRandomInt(0, this.game.width - 1);
            const line3X = Math.floor((this.game.width - 1) / 2);

            for (var i = 0; i < this.game.width; i++) {
                let spawnLine = (i == line1X || i == line2X || i == line3X);

                this.lineLength.push(spawnLine ? 25 : 0);
                this.lineReset.push(spawnLine ? 1 : 0);
                this.lineEntered.push(spawnLine ? 1 : 0);
            }

            for (let y = 0; y <= this.game.height; y++) {
                this.game.map.push(this.generateLine());
            }

            for (let y = 0; y <= this.game.height; y++) {
                this.game.map[y] = "%".repeat(this.game.map[y].length);
            }
        }
    }

    onNextLevel() {
        const level = this.game.state.level;

        if (level % 8 == 0) {
            this.levelType = LevelType.Sinusoidal;
            this.sinFrequency = [
                9,
                Utility.getRandomInt(15, 21),
                Utility.getRandomInt(23, 27)
            ];
        }
        else {
            this.levelType = LevelType.XQuest;
        }
    }

    generateLine(): string {
        let line: string = "@".repeat(this.game.width);

        const level = this.game.state.level > 9 ? 9 : this.game.state.level;

        /* Randomly start a new line every once in a while (Higher line size = less new lines) */
        if (this.levelType == LevelType.XQuest && Utility.getRandomInt(1, 30 + this.game.width) == 1) {
            let lineIndex = Utility.getRandomInt(0, this.game.width - 1);
            this.lineReset[lineIndex] = 1;
            this.lineLength[lineIndex] = Utility.getRandomInt(6, 22 - level);
        }

        let start: number; 
        let end: number;
         if (this.game.state.hasModifier('Nightmare')) {
            start = 2;
            end = this.game.width - 2;

            line = Utility.setCharAt(line, 0, '>');
            line = Utility.setCharAt(line, 1, '>');

            line = Utility.setCharAt(line, this.game.width - 1, '<');
            line = Utility.setCharAt(line, this.game.width - 2, '<');
        }
        else {
            start = 0;
            end = this.game.width;
        }

        const barebones: number = this.game.state.hasModifier('Barebones') ? 1.5 : 1;
        const invasion: number = this.game.state.hasModifier('Invasion') ? 0.5 : 1;
        for (let i = start; i < end; i++) {
            if (this.levelType == LevelType.Sinusoidal) {
                const s = (1 +
                    Math.sin(this.game.state.lines / this.sinFrequency[0]) *
                    Math.sin(this.game.state.lines / this.sinFrequency[1]) *
                    Math.sin(this.game.state.lines / this.sinFrequency[2])
                ) * this.game.width / 2;
                if (i - 4 < s && i + 5 > s) {
                    const road: string = this.roadTile(level, barebones, invasion);
                    line = Utility.setCharAt(line, i, road);
                }
            }

            if (this.lineLength[i] != 0) {

                if (this.levelType == LevelType.XQuest) {
                    const road: string = this.roadTile(level, barebones, invasion);
                    line = Utility.setCharAt(line, i, road);
                }

                this.lineLength[i] -= 1;

                const gap = Utility.getRandomInt(2, 6 - Math.floor(level / 4));

                if (this.lineLength[i] < gap && this.lineReset[i] != 0) {
                    this.lineReset[i] = 0;

                    let direction = Utility.getRandomInt(1, 2);
                    if (i == start && direction == 2) direction = 1;
                    if (i == end - 1 && direction == 1) direction = 2;

                    if (direction == 1) {
                        this.lineReset[i + 1] = 1;
                        this.lineLength[i + 1] = Utility.getRandomInt(6, 22 - level);
                    }
                    else if (direction == 2) {
                        this.lineReset[i - 1] = 1;
                        this.lineLength[i - 1] = Utility.getRandomInt(6, 20 - level);
                    }
                }
            }
        }

        // At the end of the level keep generating new lines, but cover over with the dead zone
        if (this.game.state.levelLines > this.game.board.getLevelLines(this.game.state.level) - this.game.height) {
            for (let i = start; i < end; i++) {
                line = Utility.setCharAt(line, i, "%");
            }
        }

        return line;
    }

    private roadTile(level: number, barebones: number, invasion: number) {
        let road: string = "`";

        let levelTypeModifier: number = 1;
        if (this.levelType == LevelType.Sinusoidal) {
            levelTypeModifier = 1.5;
        }

        if (Utility.getRandomInt(1, 1100 * barebones * levelTypeModifier) == 1) {
            road = 'I';
        } else if (Utility.getRandomInt(1, 300 * levelTypeModifier) == 1) {
            road = '$';
        } else if (Utility.getRandomInt(1, 900 * barebones * levelTypeModifier) === 1) {
            road = 'D';
        } else if (Utility.getRandomInt(1, 1000 * barebones * invasion * levelTypeModifier) === 1) {
            road = 'M';
        } else if (Utility.getRandomInt(1, 900 * barebones * levelTypeModifier) === 1 && level >= 6) {
            road = 'W';
        } else if (Utility.getRandomInt(1, 900 * barebones * levelTypeModifier) === 1 && level >= 3) {
            road = 'R';
        }
        return road;
    }

    finishRoadBullet(roadBullet: RoadBullet) {
        if (this.levelType == LevelType.XQuest) {
            const x = roadBullet.position.x;
            this.lineReset[x] = 1;
            this.lineLength[x] = 3;
            this.lineEntered[x] = 0;
        }
    }

    removeOneTileGaps() {
        const yTop = this.game.height - 1;
        for (let x = 0; x < this.game.width; x++) {
            const top = this.game.map[yTop][x]
            const middle = this.game.map[yTop-1][x]
            const bottom = this.game.map[yTop-2][x]
            if (top != '@' && middle == '@' && bottom != '@') {
                this.game.map[yTop - 1] = Utility.setCharAt(this.game.map[yTop-1], x, '=');
            }
        }
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