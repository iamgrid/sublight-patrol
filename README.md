# Sublight Patrol

A side-scrolling space shooter browser game built with JavaScript and WebGL (using PixiJS)

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

[TODO: Insert finishers table dump]
[TODO: Insert instructions for db_connect.inc]