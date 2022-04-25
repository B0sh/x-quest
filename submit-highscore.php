<?php
require_once 'xquest.php';

if (isSet($_POST['user_id']) && strlen($_POST['user_id']) == 36 && (
    isSet($_POST['user_name']) &&
    isSet($_POST['game_id']) &&
    isSet($_POST['version']))) {

    $user_id = isSet($_POST['user_id']) ? Text($_POST['user_id'])->in() : '-';
    $user_name = substr(Text($_POST['user_name'])->in(), 0, 12);
    $game_id = Text($_POST['game_id'])->num();
    $version = Text($_POST['version'])->in();

    try {
        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? ORDER BY `end_timestamp` DESC LIMIT 1");
        $SelectQuery->execute([
            $user_id,
        ]);
        $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
        $latest_xquest_game = $SelectQuery->fetch();
    } catch (PDOException $e) {
        handleError($e);
    }

    if (!isSet($latest_xquest_game['id'])) {
        echo 'Could not finish game.';
        exit;
    }

    if ($latest_xquest_game['id'] != $game_id) {
        echo 'Could not find game.';
        exit;
    }


    try {
        $Update = $PDO->prepare("
            UPDATE `xquest_games` SET
                `user_name`=?,
                `submitted`=?
            WHERE `id`=? LIMIT 1
        ");
        $Update->execute([
            $user_name,
            1,
            $game_id,
        ]);
    } catch (PDOException $e) {
        handleError($e);
    }

    header("Content-Type: application/json");
    echo json_encode([
        'submitted' => true
    ]);
}
else {
    echo 'Game could not be submitted';
}
