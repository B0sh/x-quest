<?php
require_once 'xquest.php';


if (isSet($_POST['user_id']) && strlen($_POST['user_id']) == 36 && (
    isSet($_POST['mod_nightmare']) ||
    isSet($_POST['mod_incline']) ||
    isSet($_POST['mod_invasion']) ||
    isSet($_POST['mod_matrix']) ||
    isSet($_POST['mod_barebones']) ||
    isSet($_POST['mod_survivor']) || 
    isSet($_POST['version']))) {

    $user_id = isSet($_POST['user_id']) ? Text($_POST['user_id'])->in() : '-';
    $mod_nightmare = $_POST['mod_nightmare'] == 'true' ? 1 : 0;
    $mod_incline = $_POST['mod_incline'] == 'true' ? 1 : 0;
    $mod_invasion = $_POST['mod_invasion'] == 'true' ? 1 : 0;
    $mod_matrix = $_POST['mod_matrix'] == 'true' ? 1 : 0;
    $mod_barebones = $_POST['mod_barebones'] == 'true' ? 1 : 0;
    $mod_survivor = $_POST['mod_survivor'] == 'true' ? 1 : 0;
    $version = Text($_POST['version'])->in();

    try {
        $Insert = $PDO->prepare("
            INSERT INTO `xquest_games` (
                `user_id`,
                `mod_nightmare`,
                `mod_incline`,
                `mod_invasion`,
                `mod_matrix`,
                `mod_barebones`,
                `mod_survivor`,
                `version`,
                `start_timestamp`,
                `ip`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $Insert->execute([
            $user_id,
            $mod_nightmare,
            $mod_incline,
            $mod_invasion,
            $mod_matrix,
            $mod_barebones,
            $mod_survivor,
            $version,
            time(),
            Text($_SERVER['REMOTE_ADDR'])->in()
        ]);
    } catch (PDOException $e) {
        handleError($e);
    }

    $_SESSION['xquest_xcheck'] = generateXCheck();

    header("Content-Type: application/json");
    echo json_encode([
        'game_id' => $PDO->lastInsertId(),
        'xcheck' => $_SESSION['xquest_xcheck']
    ]);
}
else {
    echo 'Game could not be created.';
}
