CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    lines INTEGER NOT NULL DEFAULT 0,
    ships_destroyed INTEGER NOT NULL DEFAULT 0,
    powerups_used INTEGER NOT NULL DEFAULT 0,
    moves INTEGER NOT NULL DEFAULT 0,
    game_time INTEGER NOT NULL DEFAULT 0,
    shots_fired INTEGER NOT NULL DEFAULT 0,
    shots_destroyed INTEGER NOT NULL DEFAULT 0,
    death TEXT,
    mod_nightmare INTEGER NOT NULL DEFAULT 0,
    mod_incline INTEGER NOT NULL DEFAULT 0,
    mod_invasion INTEGER NOT NULL DEFAULT 0,
    mod_matrix INTEGER NOT NULL DEFAULT 0,
    mod_barebones INTEGER NOT NULL DEFAULT 0,
    mod_survivor INTEGER NOT NULL DEFAULT 0,
    version TEXT NOT NULL DEFAULT '',
    submitted INTEGER NOT NULL DEFAULT 0,
    flags TEXT,
    ip TEXT,
    start_timestamp INTEGER NOT NULL,
    end_timestamp INTEGER,
    xcheck TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS game_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    game_id INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    timestamp INTEGER NOT NULL,
    sent_xcheck TEXT NOT NULL DEFAULT '',
    next_xcheck TEXT NOT NULL DEFAULT '',
    flags TEXT,
    ip TEXT,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_submitted_score ON games(submitted, score DESC);
CREATE INDEX IF NOT EXISTS idx_games_end_timestamp ON games(end_timestamp);
CREATE INDEX IF NOT EXISTS idx_game_logs_game_id ON game_logs(game_id);
