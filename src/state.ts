import { XQuest } from "./game";
import { QuestStatistics } from "./models/quest-statistics";
import { SaveFile } from "./models/save-file";
import { Modifier } from "./modifier";

export class State {
    level: number;
    levelLines: number;
    nextLevelClass: number;
    modifiers: string[] = [];

    invincible: number = 0;
    distortion: number = 0;
    multishot: number = 0;
    warp: number = 0;
    lives: number = 3;
    power: string = null;

    stats: QuestStatistics;
    saveFile: SaveFile;

    constructor(private game: XQuest) {

    }

    hasModifier(modifier: string): boolean {
        return this.modifiers.indexOf(modifier) !== -1; 
    }

    isKillScreen() {
        return this.level > 63;
    }

    currentHighScore(): number {
        if (!this.saveFile || !this.saveFile.records)
            return 0;
        if (this.saveFile.records.length == 0)
            return 0;
        const currentRecord = this.saveFile.records[0];
        return currentRecord.score;
    }

    saveGameStats(death: string) {
        this.saveFile.Totals.GamesPlayed += 1;
        this.saveFile.Totals.Score += this.stats.Score;
        this.saveFile.Totals.Lines += this.stats.Lines;
        this.saveFile.Totals.ShipsDestroyed += this.stats.ShipsDestroyed;
        this.saveFile.Totals.Powerups += this.stats.Powerups;
        this.saveFile.Totals.Moves += this.stats.Moves;
        this.saveFile.Totals.Time += this.stats.Time;
        this.saveFile.Totals.ShotsFired += this.game.state.stats.ShotsFired;
        this.saveFile.Totals.ShotsDestroyed += this.game.state.stats.ShotsDestroyed;

        switch(death) {
            case 'Spaceship': this.saveFile.Totals.DeathShot++; break;
            case 'Wall': this.saveFile.Totals.DeathWall++; break;
            case 'Abyss': this.saveFile.Totals.DeathAbyss++; break;
        }

        if (this.saveFile.records.length == 0) {
            this.saveFile.records.push({
                score: this.stats.Score
            });
        }
        else {
            const currentRecord = this.saveFile.records[0];
            if (currentRecord.score > this.stats.Score) {
                currentRecord.score = this.stats.Score;
            }
        }

        this.save();
    }

    newSaveFile() {
        this.saveFile = {
            Version: this.game.version,
            Volume: 0.3,
            Totals:  {
                GamesPlayed: 0,
                Score: 0,
                Lines: 0,
                ShipsDestroyed: 0,
                Powerups: 0,
                Moves: 0,
                Time: 0,
                ShotsFired: 0,
                ShotsDestroyed: 0,
                DeathAbyss: 0,
                DeathShot: 0,
                DeathWall: 0,
            },
            records: []
        };
    }

    save() {
        try {
            localStorage.setItem("XQuest", JSON.stringify(this.saveFile));
        }
        catch(e) {
            alert("Save Failed!");
            console.log(e);
        }
    }

    load() {
        let saveFile: any;
        try {
            saveFile = localStorage.getItem("XQuest");

            if (!saveFile) {
                this.newSaveFile();
                this.save();
                this.load();
                return false;
            }
        }
        catch(err) {
            alert("Cannot access localStorage - browser may not support localStorage, or storage may be corrupt");
            return false;
        }

        this.saveFile = JSON.parse(saveFile);
        //save file validation
        if (!this.saveFile.records) {
            this.saveFile.records = [];
        }
        this.game.updateVolume(this.saveFile.Volume);
        console.log("Game Loaded");
    }
}