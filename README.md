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

The project presupposes the presence of a MySQL database with a `finishers` table with the following fieldset:

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

[TODO: Insert instructions for db_connect.inc]