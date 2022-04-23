<?php
$Page = "124";
require '../require/header.top.php';

if (LOCAL) 
{
    header('Access-Control-Allow-Origin: http://localhost:1234');
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With, Set-Cookie, Cookie, Bearer');

}
session_start();

function Format($i) {
    return number_format($i);
}

function sec2hms($sec, $padHours = true, $hms = "")
{
    $hours = intval(intval($sec) / 3600);
    $hms .= ($padHours) ? str_pad($hours, 2, "0", STR_PAD_LEFT).':' : $hours.':';
    $minutes = intval(($sec / 60) % 60);
    $hms .= str_pad($minutes, 2, "0", STR_PAD_LEFT).':';
    $seconds = intval($sec % 60);
    $hms .= str_pad($seconds, 2, "0", STR_PAD_LEFT);

    return $hms;
}

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
