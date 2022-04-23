<?php
require_once 'xquest.php';

if (isSet($_POST['user_id']) && strlen($_POST['user_id']) == 36 && (
    isSet($_POST['game_id']) ||
    isSet($_POST['score']) ||
    isSet($_POST['level']) ||
    isSet($_POST['lines']) ||
    isSet($_POST['ships_destroyed']) ||
    isSet($_POST['powerups_used']) ||
    isSet($_POST['moves']) ||
    isSet($_POST['game_time']) ||
    isSet($_POST['shots_fired']) ||
    isSet($_POST['shots_destroyed']) ||
    isSet($_POST['cause_of_death']) ||
    isSet($_POST['mod_nightmare']) ||
    isSet($_POST['mod_incline']) ||
    isSet($_POST['mod_invasion']) ||
    isSet($_POST['mod_matrix']) ||
    isSet($_POST['mod_barebones']) ||
    isSet($_POST['mod_survivor']) ||
    isSet($_POST['version']) ||
    isSet($_POST['timestamp']))) {

    $user_id = isSet($_POST['user_id']) ? Text($_POST['user_id'])->in() : '-';
    $score = Text($_POST['score'])->num();
    $game_id = Text($_POST['game_id'])->num();
    $level = Text($_POST['level'])->num();
    $lines = Text($_POST['lines'])->num();
    $ships_destroyed = Text($_POST['ships_destroyed'])->num();
    $powerups_used = Text($_POST['powerups_used'])->num();
    $moves = Text($_POST['moves'])->num();
    $game_time = Text($_POST['game_time'])->num();
    $shots_fired = Text($_POST['shots_fired'])->num();
    $shots_destroyed = Text($_POST['shots_destroyed'])->num();
    $death = Text($_POST['cause_of_death'])->in();
    $version = Text($_POST['version'])->in();
    $mod_nightmare = $_POST['mod_nightmare'] == 'true' ? 1 : 0;
    $mod_incline = $_POST['mod_incline'] == 'true' ? 1 : 0;
    $mod_invasion = $_POST['mod_invasion'] == 'true' ? 1 : 0;
    $mod_matrix = $_POST['mod_matrix'] == 'true' ? 1 : 0;
    $mod_barebones = $_POST['mod_barebones'] == 'true' ? 1 : 0;
    $mod_survivor = $_POST['mod_survivor'] == 'true' ? 1 : 0;

    try {
        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? AND `end_timestamp` IS NULL AND `id`=? LIMIT 1");
        $SelectQuery->execute([
            $user_id,
            $game_id
        ]);
        $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
        $xquest_game = $SelectQuery->fetch();
    } catch (PDOException $e) {
        handleError($e);
    }

    if (!isSet($xquest_game['id'])) {
        echo 'Could not finish game.';
        exit;
    }

    $errors = '';
    if ($xquest_game['mod_nightmare'] != $mod_nightmare) {
        $errors .= 'mod_nightmare invalid|';
    }
    if ($xquest_game['mod_incline'] != $mod_incline) {
        $errors .= 'mod_incline invalid|';
    }
    if ($xquest_game['mod_invasion'] != $mod_invasion) {
        $errors .= 'mod_invasion invalid|';
    }
    if ($xquest_game['mod_matrix'] != $mod_matrix) {
        $errors .= 'mod_matrix invalid|';
    }
    if ($xquest_game['mod_barebones'] != $mod_barebones) {
        $errors .= 'mod_barebones invalid|';
    }
    if ($xquest_game['mod_survivor'] != $mod_survivor) {
        $errors .= 'mod_survivor invalid|';
    }
    if ($xquest_game['version'] != $version) {
        $errors .= 'version invalid|';
    }

    if ($errors == '') $errors = NULL;

    $modifiers = $mod_barebones * 0.3 + $mod_incline * 0.5 + $mod_invasion * 0.5 + $mod_matrix * 0.5 + $mod_nightmare * 2 + $mod_survivor * 1;
    $minigame_points = xQuestMinigamePoints($score, $level, $modifiers);

    try {
        $Update = $PDO->prepare("
            UPDATE `xquest_games` SET
               `score`=?,
               `minigame_points`=?,
               `level`=?,
               `lines`=?,
               `ships_destroyed`=?,
               `powerups_used`=?,
               `moves`=?,
               `game_time`=?,
               `shots_fired`=?,
               `shots_destroyed`=?,
               `death`=?,
               `mod_nightmare`=?,
               `mod_incline`=?,
               `mod_invasion`=?,
               `mod_matrix`=?,
               `mod_barebones`=?,
               `mod_survivor`=?,
               `end_timestamp`=?,
               `version`=?,
               `flags`=?,
               `ip`=?
            WHERE `id`=? LIMIT 1
        ");
        $Update->execute([
            $score,
            $minigame_points,
            $level,
            $lines,
            $ships_destroyed,
            $powerups_used,
            $moves,
            $game_time,
            $shots_fired,
            $shots_destroyed,
            $death,
            $mod_nightmare,
            $mod_incline,
            $mod_invasion,
            $mod_matrix,
            $mod_barebones,
            $mod_survivor,
            time(),
            $version,
            $errors,
            $game_id,
            Text($_SERVER['REMOTE_ADDR'])->in()
        ]);
    } catch (PDOException $e) {
        handleError($e);
    }

    header("Content-Type: application/json");
    echo json_encode([
        'minigame_points' => $minigame_points
    ]);
}
else {
    echo 'Game could not be finished';
}
