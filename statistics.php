<?php
require_once 'xquest.php';

$userId = isSet($_GET['user_id']) ? Text($_GET['user_id'])->in() : '-';

try {
    $SelectQuery = $PDO->prepare("
        SELECT 
            COUNT(`id`) as t_games,
            SUM(`score`) as t_score,
            SUM(`lines`) as t_lines,
            SUM(`game_time`) as t_game_time,
            SUM(`minigame_points`) as t_minigame_points,
            SUM(`ships_destroyed`) as t_ships_destroyed,
            SUM(`shots_destroyed`) as t_shots_destroyed,
            SUM(`shots_fired`) as t_shots_fired,
            SUM(`powerups_used`) as t_powerups_used,
            SUM(`moves`) as t_moves,
            SUM(CASE WHEN `death`='Abyss' THEN 1 ELSE 0 END) as t_death_abyss,
            SUM(CASE WHEN `death`='Spaceship' THEN 1 ELSE 0 END) as t_death_spaceship,
            SUM(CASE WHEN `death`='Wall' THEN 1 ELSE 0 END) as t_death_wall
        FROM `xquest_games`
        WHERE `user_id`=?");
    $SelectQuery->execute([ $userId ]);
    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
    $stats = $SelectQuery->fetch();
}
catch (PDOException $e) {
    handleError($e);
}

header("Content-Type: application/json");
echo json_encode($stats);
