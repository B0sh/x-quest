<?php
require_once 'xquest.php';

try {
    $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_state` WHERE `user_id`=? LIMIT 1");
    $SelectQuery->execute([ $user['user_id'] ]);
    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
    $xquest = $SelectQuery->fetch();

    if (!$xquest['user_id']) {
        $Insert = $PDO->prepare("
            INSERT INTO  `xquest_state` (`user_id`)
            VALUES (?)
        ");
        $Insert->execute([ $user['user_id'] ]);

        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_state` WHERE `user_id`=? LIMIT 1");
        $SelectQuery->execute([ $user['user_id'] ]);
        $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
        $xquest = $SelectQuery->fetch();
    }

    $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? ORDER BY `score` DESC LIMIT 1");
    $SelectQuery->execute([ $user['user_id'] ]);
    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
    $high_score = $SelectQuery->fetch();

    if (!isSet($high_score['id'])) {
        $high_score = 0;
    }
    else {
        $high_score = $high_score['score'];
    }
} catch (PDOException $e) {
    handleError($e);
}

echo json_encode([
    'current_minigame_points' => $user['minigame_points'],
    'volume' => $xquest['volume'],
    'high_score' => $high_score,
    'mod_nightmare' => $xquest['mod_nightmare'],
    'mod_incline' => $xquest['mod_incline'],
    'mod_invasion' => $xquest['mod_invasion'],
    'mod_matrix' => $xquest['mod_matrix'],
    'mod_barebones' => $xquest['mod_barebones'],
    'mod_survivor' => $xquest['mod_survivor'],
]);