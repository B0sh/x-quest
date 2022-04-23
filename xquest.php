<?php
$Page = "124";
require '../core/require/ajax.config.inc.php';

function generateXCheck() {
    return mt_rand(100000, 999999);
}

function xQuestMinigamePoints($score, $level, $modifiers) {
    if ($level < 30) $level = 30;
    $level_sum = ($level * ($level + 1)) / 3;

    $points = $level_sum * $score * ($modifiers + 1);

    // echo "(" . Format($score) . ", L=" . $level . ", M=+" . $modifiers * 100 . "%) &mdash; " . Format($points) . '<br /><br />';

    return $points;
}
