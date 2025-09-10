<?php
	require("db_connect.inc");
	require("renderPlaque.inc");
	require("settings.inc");
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>i.am.grid &middot; Sublight Patrol Hall of Finishers</title>
		<link
			href="https://fonts.googleapis.com/css?family=Roboto:300,700&subset=latin-ext"
			rel="stylesheet"
		/>
		<link rel="stylesheet" href="hall-of-finishers.css" />
		<script src="hall-of-finishers.js" defer></script>
	</head>
	<body class="customScroll">
		<div class="content">
		<header>
			<a class="sublight-patrol-logo" title="Return to the game" href="<?php echo $gameRootUrl; ?>"></a>
			<h1 class="plaque-display-case-h1">Hall of Finishers</h1>
			<h3 class="plaque-display-case-h3">Plaque Display Case</h3>
		</header>
<?php
	print "<div class=\"entries\">\n";
	
	$feQuery = "SELECT * FROM `sublight_patrol_finishers` WHERE `id` = " . intval($_GET['id']);
	$feResult = mysqli_query($sp_db, $feQuery);

	if (!$feResult || mysqli_num_rows($feResult) < 1) {
		print "<p class=\"error\">I apologize, I could not locate the requested plaque.</p>\n";
	} else {
		$feRow = mysqli_fetch_assoc($feResult);
		renderPlaque($feRow);
	}


	print "</div>\n";
?>
		<div class="return-link-wrapper">
			<a class="return-link" href="<?php echo $gameRootUrl; ?>hall-of-finishers/">Return to the main hall</a>
		</div>
		</div>
	</body>
</html>