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
		<link rel="icon" href="https://iamgrid.co.uk/portfolio_assets/favicon.ico" type="image/x-icon"/>
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
			<h1>Hall of Finishers</h1>
		</header>
<?php
	print "<div class=\"entries\">\n";
	
	$feQuery = "SELECT * FROM `sublight_patrol_finishers` ORDER BY `id` DESC";
	$feResult = mysqli_query($sp_db, $feQuery);
	while ($feRow = mysqli_fetch_assoc($feResult)) {
		renderPlaque($feRow);
	}

	print "</div>\n";
?>
		</div>
	</body>
</html>