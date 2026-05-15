import express, { Request, Response } from "express";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

type GameRow = {
    id: number;
    user_id: string;
    user_name: string;
    score: number;
    level: number;
    lines: number;
    ships_destroyed: number;
    powerups_used: number;
    moves: number;
    game_time: number;
    shots_fired: number;
    shots_destroyed: number;
    death: string | null;
    mod_nightmare: number;
    mod_incline: number;
    mod_invasion: number;
    mod_matrix: number;
    mod_barebones: number;
    mod_survivor: number;
    version: string;
    submitted: number;
    flags: string | null;
    ip: string | null;
    start_timestamp: number;
    end_timestamp: number | null;
    xcheck: string;
};

const app = express();
const port = Number(process.env.PORT ?? 3000);
const projectRoot = path.resolve(__dirname, "..", "..");
const distDir = path.resolve(projectRoot, "dist");
const schemaPath = path.resolve(projectRoot, "backend", "schema.sql");
const sqlitePath = process.env.SQLITE_PATH ?? path.resolve(projectRoot, "backend", "data", "xquest.sqlite");

function normalizeBaseUrl(value: string | undefined): string {
    const trimmed = value?.trim() ?? "";
    if (!trimmed || trimmed === "/") {
        return "/";
    }

    const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
}

function withBaseUrl(baseUrl: string, route: string): string {
    if (baseUrl === "/") {
        return route;
    }

    return `${baseUrl}${route}`;
}

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const baseUrl = normalizeBaseUrl(process.env.BASE_URL);

fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = new Database(sqlitePath);
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(schemaPath, "utf8"));

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function sanitizeName(value: unknown): string {
    return String(value ?? "").trim().slice(0, 12);
}

function sanitizeText(value: unknown, maxLength = 255): string {
    return String(value ?? "").trim().slice(0, maxLength);
}

function toInt(value: unknown): number {
    const parsed = Number.parseInt(String(value ?? "0"), 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toBoolInt(value: unknown): number {
    return String(value ?? "").toLowerCase() === "true" ? 1 : 0;
}

function validUserId(value: unknown): value is string {
    return typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);
}

function generateXCheck(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildFlags(game: GameRow, body: Record<string, unknown>, checkXCheck: boolean) {
    let flags = "";
    if (game.mod_nightmare !== toBoolInt(body.mod_nightmare)) flags += "mod_nightmare invalid|";
    if (game.mod_incline !== toBoolInt(body.mod_incline)) flags += "mod_incline invalid|";
    if (game.mod_invasion !== toBoolInt(body.mod_invasion)) flags += "mod_invasion invalid|";
    if (game.mod_matrix !== toBoolInt(body.mod_matrix)) flags += "mod_matrix invalid|";
    if (game.mod_barebones !== toBoolInt(body.mod_barebones)) flags += "mod_barebones invalid|";
    if (game.mod_survivor !== toBoolInt(body.mod_survivor)) flags += "mod_survivor invalid|";
    if (game.version !== sanitizeText(body.version, 24)) flags += "version invalid|";
    if (checkXCheck && game.xcheck !== sanitizeText(body.xcheck, 24)) flags += "xcheck invalid|";
    return flags || null;
}

function ipFromRequest(request: Request) {
    return sanitizeText(request.ip ?? request.socket.remoteAddress ?? "", 64);
}


function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function formatGameTime(seconds: number) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}m ${remainingSeconds}s`;
}

function topScores(list: string): GameRow[] {
    let extra: string = "";
    if (list === "nightmare") {
        extra = "AND mod_nightmare = 1";
    } else if (list === "incline") {
        extra = "AND mod_incline = 1";
    }

    return db.prepare(`
        WITH ranked_games AS (
            SELECT *,
                   ROW_NUMBER() OVER (
                       PARTITION BY user_id
                       ORDER BY score DESC, COALESCE(end_timestamp, 0) DESC
                   ) AS score_rank
            FROM games
            WHERE submitted = 1 ${extra}
        )
        SELECT *
        FROM ranked_games
        WHERE score_rank = 1
        ORDER BY score DESC, COALESCE(end_timestamp, 0) DESC
        LIMIT 10
    `).all() as GameRow[];
}

function personalBest(userId: string, list: string) {
    if (!userId) {
        return null;
    }

    let query = "SELECT * FROM games WHERE user_id = ?";
    if (list === "nightmare") {
        query += " AND mod_nightmare = 1";
    } else if (list === "incline") {
        query += " AND mod_incline = 1";
    }
    query += " ORDER BY score DESC, COALESCE(end_timestamp, 0) DESC LIMIT 1";

    return db.prepare(query).get(userId) as GameRow | undefined;
}

function renderHighScores(userId: string, list: string) {
    const rows = topScores(list);
    const topUserIds = new Set(rows.map((row) => row.user_id));

    const bodyRows = rows.map((score, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(score.user_name)}</td>
            <td>${score.score.toLocaleString()}</td>
            <td>${score.level}</td>
            <td>${formatGameTime(score.game_time)}</td>
            <td>${score.end_timestamp ? new Date(score.end_timestamp * 1000).toLocaleDateString() : "-"}</td>
        </tr>
    `).join("");

    let trailingRow = "";
    if (userId && !topUserIds.has(userId)) {
        const score = personalBest(userId, list);
        if (score) {
            trailingRow = `
                <tr><td></td><td colspan="5">...</td></tr>
                <tr>
                    <td></td>
                    <td>${escapeHtml(score.user_name)}</td>
                    <td>${score.score.toLocaleString()}</td>
                    <td>${score.level}</td>
                    <td>${formatGameTime(score.game_time)}</td>
                    <td>${score.end_timestamp ? new Date(score.end_timestamp * 1000).toLocaleDateString() : "-"}</td>
                </tr>
            `;
        }
    }

    return `
        <table>
            <thead>
                <tr>
                    <th class="level-class" style="width: 20px;"></th>
                    <th class="level-class" style="min-width: 120px;">Name</th>
                    <th class="level-class" style="width: 50px;">Score</th>
                    <th class="level-class" style="width: 50px;">Level</th>
                    <th class="level-class" style="width: 100px;">Game Time</th>
                    <th class="level-class" style="width: 100px;">Date Of</th>
                </tr>
            </thead>
            <tbody>${bodyRows}${trailingRow}</tbody>
        </table>
    `;
}

app.post(withBaseUrl(baseUrl, "/api/start-game"), (request: Request, response: Response) => {
    if (!validUserId(request.body.user_id)) {
        response.status(400).json({ error: "Invalid user id." });
        return;
    }

    const xcheck = generateXCheck();
    const insert = db.prepare(`
        INSERT INTO games (
            user_id,
            user_name,
            mod_nightmare,
            mod_incline,
            mod_invasion,
            mod_matrix,
            mod_barebones,
            mod_survivor,
            version,
            start_timestamp,
            ip,
            xcheck
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
        request.body.user_id,
        sanitizeName(request.body.user_name),
        toBoolInt(request.body.mod_nightmare),
        toBoolInt(request.body.mod_incline),
        toBoolInt(request.body.mod_invasion),
        toBoolInt(request.body.mod_matrix),
        toBoolInt(request.body.mod_barebones),
        toBoolInt(request.body.mod_survivor),
        sanitizeText(request.body.version, 24),
        Math.floor(Date.now() / 1000),
        ipFromRequest(request),
        xcheck
    );

    response.json({
        game_id: Number(result.lastInsertRowid),
        xcheck,
    });
});

app.post(withBaseUrl(baseUrl, "/api/update-game"), (request: Request, response: Response) => {
    if (!validUserId(request.body.user_id)) {
        response.status(400).json({ error: "Invalid user id." });
        return;
    }

    const game = db.prepare(`
        SELECT *
        FROM games
        WHERE id = ? AND user_id = ? AND end_timestamp IS NULL
        LIMIT 1
    `).get(toInt(request.body.game_id), request.body.user_id) as GameRow | undefined;

    if (!game) {
        response.status(404).json({ error: "Could not update game." });
        return;
    }

    const nextXCheck = generateXCheck();
    const flags = buildFlags(game, request.body as Record<string, unknown>, true);

    const transaction = db.transaction(() => {
        db.prepare(`
            INSERT INTO game_logs (
                user_id,
                game_id,
                score,
                level,
                timestamp,
                sent_xcheck,
                next_xcheck,
                flags,
                ip
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            request.body.user_id,
            game.id,
            toInt(request.body.score),
            toInt(request.body.level),
            Math.floor(Date.now() / 1000),
            sanitizeText(request.body.xcheck, 24),
            nextXCheck,
            flags,
            ipFromRequest(request)
        );

        db.prepare("UPDATE games SET xcheck = ? WHERE id = ?").run(nextXCheck, game.id);
    });

    transaction();

    response.json({ xcheck: nextXCheck });
});

app.post(withBaseUrl(baseUrl, "/api/finish-game"), (request: Request, response: Response) => {
    if (!validUserId(request.body.user_id)) {
        response.status(400).json({ error: "Invalid user id." });
        return;
    }

    const game = db.prepare(`
        SELECT *
        FROM games
        WHERE id = ? AND user_id = ? AND end_timestamp IS NULL
        LIMIT 1
    `).get(toInt(request.body.game_id), request.body.user_id) as GameRow | undefined;

    if (!game) {
        response.status(404).json({ error: "Could not finish game." });
        return;
    }

    const flags = buildFlags(game, request.body as Record<string, unknown>, false);
    const score = toInt(request.body.score);
    const level = toInt(request.body.level);

    db.prepare(`
        UPDATE games
        SET user_name = ?,
            score = ?,
            level = ?,
            lines = ?,
            ships_destroyed = ?,
            powerups_used = ?,
            moves = ?,
            game_time = ?,
            shots_fired = ?,
            shots_destroyed = ?,
            death = ?,
            mod_nightmare = ?,
            mod_incline = ?,
            mod_invasion = ?,
            mod_matrix = ?,
            mod_barebones = ?,
            mod_survivor = ?,
            end_timestamp = ?,
            version = ?,
            flags = ?,
            ip = ?
        WHERE id = ?
    `).run(
        sanitizeName(request.body.user_name),
        score,
        level,
        toInt(request.body.lines),
        toInt(request.body.ships_destroyed),
        toInt(request.body.powerups_used),
        toInt(request.body.moves),
        toInt(request.body.game_time),
        toInt(request.body.shots_fired),
        toInt(request.body.shots_destroyed),
        sanitizeText(request.body.cause_of_death, 32),
        toBoolInt(request.body.mod_nightmare),
        toBoolInt(request.body.mod_incline),
        toBoolInt(request.body.mod_invasion),
        toBoolInt(request.body.mod_matrix),
        toBoolInt(request.body.mod_barebones),
        toBoolInt(request.body.mod_survivor),
        Math.floor(Date.now() / 1000),
        sanitizeText(request.body.version, 24),
        flags,
        ipFromRequest(request),
        game.id
    );

    response.json();
});

app.get(withBaseUrl(baseUrl, "/api/high-scores"), (request: Request, response: Response) => {
    const userId = validUserId(request.query.user_id) ? request.query.user_id : "";
    const list = sanitizeText(request.query.list, 24);
    response.type("html").send(renderHighScores(userId, list));
});

app.post(withBaseUrl(baseUrl, "/api/submit-highscore"), (request: Request, response: Response) => {
    if (!validUserId(request.body.user_id)) {
        response.status(400).json({ error: "Invalid user id." });
        return;
    }

    const latestGame = db.prepare(`
        SELECT *
        FROM games
        WHERE user_id = ? AND end_timestamp IS NOT NULL
        ORDER BY end_timestamp DESC
        LIMIT 1
    `).get(request.body.user_id) as GameRow | undefined;

    if (!latestGame || latestGame.id !== toInt(request.body.game_id)) {
        response.status(404).json({ error: "Could not find game." });
        return;
    }

    db.prepare(`
        UPDATE games
        SET user_name = ?,
            submitted = 1
        WHERE id = ?
    `).run(
        sanitizeName(request.body.user_name),
        latestGame.id
    );

    response.json({ submitted: true });
});

app.get(withBaseUrl(baseUrl, "/api/statistics"), (request: Request, response: Response) => {
    if (!validUserId(request.query.user_id)) {
        response.status(400).json({ error: "Invalid user id." });
        return;
    }

    const stats = db.prepare(`
        SELECT
            COUNT(id) AS t_games,
            COALESCE(SUM(score), 0) AS t_score,
            COALESCE(SUM(level), 0) AS t_level,
            COALESCE(SUM(lines), 0) AS t_lines,
            COALESCE(SUM(game_time), 0) AS t_game_time,
            COALESCE(SUM(ships_destroyed), 0) AS t_ships_destroyed,
            COALESCE(SUM(shots_destroyed), 0) AS t_shots_destroyed,
            COALESCE(SUM(shots_fired), 0) AS t_shots_fired,
            COALESCE(SUM(powerups_used), 0) AS t_powerups_used,
            COALESCE(SUM(moves), 0) AS t_moves,
            COALESCE(SUM(CASE WHEN death = 'Abyss' THEN 1 ELSE 0 END), 0) AS t_death_abyss,
            COALESCE(SUM(CASE WHEN death = 'Spaceship' THEN 1 ELSE 0 END), 0) AS t_death_spaceship,
            COALESCE(SUM(CASE WHEN death = 'Wall' THEN 1 ELSE 0 END), 0) AS t_death_wall
        FROM games
        WHERE user_id = ?
    `).get(request.query.user_id);

    response.json(stats);
});

if (fs.existsSync(distDir)) {
    if (baseUrl !== "/") {
        app.get(new RegExp(`^${escapeRegex(baseUrl)}$`), (_request: Request, response: Response) => {
            response.redirect(308, `${baseUrl}/`);
        });
    }

    app.use(baseUrl, express.static(distDir));
}

app.get(withBaseUrl(baseUrl, "/{*path}"), (request: Request, response: Response) => {
    if (request.path.startsWith(withBaseUrl(baseUrl, "/api/")) || request.path === withBaseUrl(baseUrl, "/api")) {
        response.status(404).json({ error: "Not found." });
        return;
    }

    const indexPath = path.resolve(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
        response.sendFile(indexPath);
        return;
    }

    response.status(503).type("text/plain").send("Frontend build not found. Run `npm run build` first.");
});

app.listen(port, () => {
    console.log(`X-Quest server listening on port ${port}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`SQLite database: ${sqlitePath}`);
});
