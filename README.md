# Sublight Patrol

A side-scrolling space shooter browser game built with JavaScript and WebGL (using PixiJS)

## Live version
Sublight Patrol is live at https://iamgrid.co.uk/sublight-patrol/ .

## Installation
The root folder of the project will need a `.env` file with the following contents:

```
SUBLIGHT_PATROL_TOKEN=%your_token_here%
```

To make this same token visible to `hall-of-finishers/endpoint.php` we also need to add a `token.inc` file to the `hall-of-finishers` folder with the following contents:

```
<?php
	$sublight_patrol_token = '%your_token_here%';
?>
```

The project presupposes the presence of a MySQL database with a `sublight_patrol_finishers` table with the following fieldset:

```
CREATE TABLE `sublight_patrol_finishers` (
  `id` int NOT NULL,
  `player_nickname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_url` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_finished_at_datetime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_final_fighter` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_final_hangar_contents` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_version` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finisher_stars` int NOT NULL,
  `final_mission_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `sublight_patrol_finishers`
  ADD PRIMARY KEY (`id`);
  
ALTER TABLE `sublight_patrol_finishers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;
```

The MySQL database connection settings go into `hall-of-finishers/db_connect.inc` like so:

```
<?php
	$sp_db_host = "%your_host_here%";
	$sp_db_user = "%your_mysql_user_here%";
	$sp_db_pass = "%your_mysql_user_password_here%";
	$sp_db_db = "%your_mysql_db_here%";

	$sp_db = mysqli_connect($sp_db_host, $sp_db_user, $sp_db_pass, $sp_db_db); 
	if (!$sp_db) { 
		die('Could not connect to MySQL: ' . mysqli_error()); 
	}

	mysqli_autocommit($sp_db, FALSE);
	mysqli_set_charset($sp_db, "utf8");

?>
```

The `package.json` `start` script (which is used to run the project locally using a WebPack dev server) assumes the presence of a globally installed `cross-env` npm package.