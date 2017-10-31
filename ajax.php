<?php

require('../../require/header.top.php');

function protect($data, $Remove=0){
	$data = str_replace(array('&amp;','&lt;','&gt;','"','\''), array('&amp;amp;','&amp;lt;','&amp;gt;','&#34;','&#39;'), $data);
	$data = preg_replace('/(&#*\w+)[\x00-\x20]+;/u', '$1;', $data);
	$data = preg_replace('/(&#x*[0-9A-F]+);*/iu', '$1;', $data);
	$data = html_entity_decode($data, ENT_COMPAT, 'UTF-8');
	$data = preg_replace('#(<[^>]+?[\x00-\x20"\'])(?:on|xmlns)[^>]*+>#iu', '$1>', $data);
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=[\x00-\x20]*([`\'"]*)[\x00-\x20]*j[\x00-\x20]*a[\x00-\x20]*v[\x00-\x20]*a[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2nojavascript...', $data);
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*v[\x00-\x20]*b[\x00-\x20]*s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:#iu', '$1=$2novbscript...', $data);
	$data = preg_replace('#([a-z]*)[\x00-\x20]*=([\'"]*)[\x00-\x20]*-moz-binding[\x00-\x20]*:#u', '$1=$2nomozbinding...', $data);
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?expression[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?behaviour[\x00-\x20]*\([^>]*+>#i', '$1>', $data);
	$data = preg_replace('#(<[^>]+?)style[\x00-\x20]*=[\x00-\x20]*[`\'"]*.*?s[\x00-\x20]*c[\x00-\x20]*r[\x00-\x20]*i[\x00-\x20]*p[\x00-\x20]*t[\x00-\x20]*:*[^>]*+>#iu', '$1>', $data);
	$data = preg_replace('#</*\w+:\w[^>]*+>#i', '', $data);
	do
	{
		$old_data = $data;
		$data = preg_replace('#</*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|i(?:frame|layer)|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|title|xml)[^>]*+>#i', '', $data);
	}
	while ($old_data !== $data);
	$data = $data;
	if($Remove == 0) {
		return trim(htmlspecialchars($data));
	}else{
		return trim($data);
	}
}
$PDO = connectDB();

if (isSEt($_POST['showHS']))
{
	try {
		$Query = $PDO->prepare("SELECT * FROM xquest ORDER BY score DESC LIMIT 10");
		$Query->execute();
		$Query->setFetchMode(PDO::FETCH_ASSOC);
	}
	catch (PDOException $e) {
		exit;
	}

	echo '<table>
		<tr>
			<td>Rank</td>
			<td>Username</td>
			<td>Score</td>
<!--			<td>Lines</b>-->
			<td>Time</td>
		</tr>

	';
	$x = 1;
	while ($Score = $Query->fetch()) {
		$Stats= json_decode($Score['stats'], true);
		echo '<tr>
			<td>'.$x.'</td>
			<td>'.$Score['username'].'</td>
			<td>'.number_format($Score['score']).'</td>
			<!--<td>'.number_format($Stats['Lines']).'</td>-->
			<td>'.date('m/d/Y h:ia', $Score['timestamp']).'</td>
		</tr>';
		$x++;
	}
	if ($x == 1)
		ECHO '<tr><td>There is no high scores recorded.</td></tr>';

	echo '</table>';
}
else if (isSet($_POST['score']) && isSet($_POST['stats']) && isSet($_POST['username']))
{
	$score = protect($_POST['score']);
	$stats =str_replace("&quot;", "'", protect(json_encode($_POST['stats'])));
	$username = protect($_POST['username']);

	try {
		$Insert = $PDO->prepare("
			INSERT INTO xquest (score,stats,username, timestamp)
			VALUES (?,?,?,?)
		");
		$Insert->execute(array($score, $stats, $username, time()));
	}
	catch (PDOException $e) {
		exit;
	}

	echo 'Score Uploaded';
}
