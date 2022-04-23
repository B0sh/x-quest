<?php
require_once 'xquest.php';

$list = Text($_GET['list'])->in();

try {
    if ($list == 'nightmare') {
        $Fetch_Scores = $PDO->prepare("
            SELECT `user_id`, max(score) as highscore
            FROM `xquest_games`
            WHERE `mod_nightmare`=1
            GROUP BY `user_id`
            ORDER BY highscore DESC LIMIT 10
        ");
    }
    else if ($list == 'incline') {
        $Fetch_Scores = $PDO->prepare("
            SELECT `user_id`, max(score) as highscore
            FROM `xquest_games`
            WHERE `mod_incline`=1
            GROUP BY `user_id`
            ORDER BY highscore DESC LIMIT 10
        ");
    }
    else {
        $Fetch_Scores = $PDO->prepare("
            SELECT `user_id`, max(score) as highscore
            FROM `xquest_games`
            GROUP BY `user_id`
            ORDER BY highscore DESC LIMIT 10
        ");
    }
    $Fetch_Scores->execute([ ]);
    $Fetch_Scores->setFetchMode(PDO::FETCH_ASSOC);
    $High_Scores = $Fetch_Scores->fetchAll();
}
catch (PDOException $e) {
    handleError($e);
}
?>
/ / / &nbsp; X-Quest High Scores &nbsp; \ \ \<br /><br />

<?php if ($list == 'overall') { ?>
<b class="d1">Overall</b> |
<?php } else { ?>
<a href="" onclick="Game.layout.loadHighScores('overall'); return false;">Overall</a> |
<?php } ?> 
<?php if ($list == 'nightmare') { ?>
<b class="d1">Nightmare</b> |
<?php } else { ?>
<a href="" onclick="Game.layout.loadHighScores('nightmare'); return false;">Nightmare</a> |
<?php } ?>
<?php if ($list == 'incline') { ?>
<b class="d1">Incline</b>
<?php } else { ?>
<a href="" onclick="Game.layout.loadHighScores('incline'); return false;">Incline</a>
<?php } ?><br /><br />

<table>
    <thead>
        <tr>
            <th class="d1" style="width: 20px;"></th>
            <th class="d1" style="min-width: 120px;">Name</th>
            <th class="d1" style="width: 50px;">Score</th>
            <th class="d1" style="width: 50px;">Level</th>
            <th class="d1" style="width: 100px;">Game Time</th>
            <th class="d1" style="width: 100px;">Date Of</th>
        </tr>
    </thead>
    <tbody>
        <?php
            $placed = false;
            foreach ($High_Scores as $Index => $Score)
            {
                try {
                    if ($list == 'nightmare') {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? AND `mod_nightmare`=1 ORDER BY `score` DESC, `end_timestamp` DESC LIMIT 1");
                    }
                    else if ($list == 'incline') {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? AND `mod_incline`=1 ORDER BY `score` DESC, `end_timestamp` DESC LIMIT 1");
                    }
                    else {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? ORDER BY `score` DESC, `end_timestamp` DESC LIMIT 1");
                    }
                    $SelectQuery->execute([ $Score['user_id'] ]);
                    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
                    $Score = $SelectQuery->fetch();
                } catch (PDOException $e) {
                    handleError($e);
                }

                echo "
                    <tr>
                        <td>" . ($Index + 1) . "</td>
                        <td>" . $userClass->display_name($Score['user_id'], 1, 0, 0, 1) . "</td>
                        <td>" . Format($Score['score']) . "</td>
                        <td>" . $Score['level'] . "</td>
                        <td>" . date("i\m s\s", $Score['game_time']) . "</td>
                        <td>" . date("m/d/y", $Score['end_timestamp']) . "</td>
                    </tr>
                ";

                if ($Score['user_id'] == $user['user_id']) {
                    $placed = true;
                }
            }

            if ($placed === false) {
                try {
                    if ($list == 'nightmare') {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? AND `mod_nightmare`=1 ORDER BY score DESC LIMIT 1");
                    }
                    else if ($list == 'incline') {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? AND `mod_incline`=1 ORDER BY score DESC LIMIT 1");
                    }
                    else {
                        $SelectQuery = $PDO->prepare("SELECT * FROM `xquest_games` WHERE `user_id`=? ORDER BY score DESC LIMIT 1");
                    }
                    $SelectQuery->execute([ $user['user_id'] ]);
                    $SelectQuery->setFetchMode(PDO::FETCH_ASSOC);
                    $Score = $SelectQuery->fetch();
                }
                catch (PDOException $e) {
                    handleError($e);
                }

                echo '<tr> <td></td> <td colspan="5">...</td> </tr>';

                if (isSet($Score['score'])) {
                    echo "
                        <tr>
                            <td></td>
                            <td>" . $userClass->display_name($Score['user_id'], 1, 0, 0, 1) . "</td>
                            <td>" . Format($Score['score']) . "</td>
                            <td>" . $Score['level'] . "</td>
                            <td>" . date("i\m s\s", $Score['game_time']) . "</td>
                            <td>" . date("m/d/y", $Score['end_timestamp']) . "</td>
                        </tr>
                    ";
                }
                else {
                    echo "
                        <tr>
                            <td></td>
                            <td>" . $userClass->display_name($user['user_id'], 1, 0, 0, 1) . "</td>
                            <td>" . Format(0) . "</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    ";
                }
            }
        ?>
    </tbody>
</table>
