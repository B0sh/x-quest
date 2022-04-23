<?php
require_once 'xquest.php';

if (isSet($_POST['mod_nightmare']) ||
    isSet($_POST['mod_incline']) ||
    isSet($_POST['mod_invasion']) ||
    isSet($_POST['mod_matrix']) ||
    isSet($_POST['mod_barebones']) ||
    isSet($_POST['mod_survivor']) ||
    isSet($_POST['volume'])) {

    $volume = Text($_POST['volume'])->num();
    $mod_nightmare = $_POST['mod_nightmare'] == 'true' ? 1 : 0;
    $mod_incline = $_POST['mod_incline'] == 'true' ? 1 : 0;
    $mod_invasion = $_POST['mod_invasion'] == 'true' ? 1 : 0;
    $mod_matrix = $_POST['mod_matrix'] == 'true' ? 1 : 0;
    $mod_barebones = $_POST['mod_barebones'] == 'true' ? 1 : 0;
    $mod_survivor = $_POST['mod_survivor'] == 'true' ? 1 : 0;

    try {
        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_state` WHERE `user_id`=? LIMIT 1");
        $SelectQuery->execute([ $user['user_id'] ]);
        $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
        $xquest = $SelectQuery->fetch();

        if (!$xquest['user_id']) {
            echo 'An error has occurred.';
            exit; 
        }

        $Update = $PDO->prepare("UPDATE `xquest_state` SET 
            `volume`=?,
            `mod_nightmare`=?,
            `mod_incline`=?,
            `mod_invasion`=?,
            `mod_matrix`=?,
            `mod_survivor`=?,
            `mod_barebones`=?
            WHERE `user_id`=? LIMIT 1");
        $Update->execute([ 
            $volume,
            $mod_nightmare,
            $mod_incline,
            $mod_invasion,
            $mod_matrix,
            $mod_survivor,
            $mod_barebones,
            $user['user_id']
        ]);
    } catch (PDOException $e) {
        handleError($e);
    }

    echo json_encode([
        'saved' => true
    ]);
}