<?php
require_once 'xquest.php';

try {
    $SelectQuery = $PDO->prepare("
        SELECT 
            COUNT(`id`) as t_games,
            SUM(`score`) as t_score,
            SUM(`level`) as t_level,
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
    $SelectQuery->execute([ $user['user_id'] ]);
    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
    $stats = $SelectQuery->fetch();
}
catch (PDOException $e) {
    handleError($e);
}
?>

<table>
    <thead>
        <tr>
            <th colspan="2">/ / / &nbsp; X-Quest Statistics &nbsp; \ \ \</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="d1">Total Games:</td>
            <td><?=Format($stats['t_games'])?></td>
        </tr>
        <tr>
            <td class="d1">Score:</td>
            <td><?=Format($stats['t_score'])?></td>
        </tr>
        <tr>
            <td class="d1">Minigame Points:</td>
            <td><?=Format($stats['t_minigame_points'])?></td>
        </tr>
        <tr>
            <td class="d1">Powerups Used:</td>
            <td><?=Format($stats['t_powerups_used'])?></td>
        </tr>
        <tr>
            <td class="d1">Spaceships Destroyed:</td>
            <td><?=Format($stats['t_ships_destroyed'])?></td>
        </tr>
        <tr>
            <td class="d1">Shots Destroyed:</td>
            <td><?=Format($stats['t_shots_destroyed'])?></td>
        </tr>
        <tr>
            <td class="d1">Shots Fired:</td>
            <td><?=Format($stats['t_shots_fired'])?></td>
        </tr>
        <tr>
            <td class="d1">Deaths to Abyss:</td>
            <td><?=Format($stats['t_death_abyss'])?></td>
        </tr>
        <tr>
            <td class="d1">Deaths to Spaceship:</td>
            <td><?=Format($stats['t_death_spaceship'])?></td>
        </tr>
        <tr>
            <td class="d1">Deaths to Wall:</td>
            <td><?=Format($stats['t_death_wall'])?></td>
        </tr>
        <tr>
            <td class="d1">Game Time:</td>
            <td><?=sec2hms($stats['t_game_time'])?></td>
        </tr>
    </tbody>
</table>
