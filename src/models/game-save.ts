export interface Savefile {
    user_id: string;
    user_name: string;
    offline: boolean;
    volume: number;
    high_score: number;
    mod_nightmare: number;
    mod_incline: number;
    mod_invasion: number;
    mod_matrix: number;
    mod_barebones: number;
    mod_survivor: number;

    // TPK Exclusive
    current_minigame_points: number;

    game_log: any[];
}