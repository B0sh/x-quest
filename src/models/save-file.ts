import { HighScore } from "./high-score";
import { QuestStatistics } from "./quest-statistics";

export interface SaveFile {
    Version: string,
    Volume: number
    Totals: QuestStatistics,
    records: HighScore[]
}