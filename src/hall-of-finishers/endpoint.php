<?php
	require("token.inc");
	require("db_connect.inc");
	require("settings.inc");

	function mres($string){
		global $sp_db;
		return mysqli_real_escape_string($sp_db, $string);
	}

	$success = true;
	$responseMessage = "ok";

	$requiredFields = array(
		"playerNickname",
		"playerLocation",
		"playerUrl",
		"playerFinishedAtDateTime",
		"gameDifficulty",
		"playerFinalFighter",
		"playerHangarContents",
		"gameVersion",
		"finisherStars",
		"finalMissionName"
	);

	if (!isset($_SERVER['HTTP_X_SP_TOKEN'])) {
		$success = false;
		$responseMessage = "No token provided.";
	} else if ($_SERVER['HTTP_X_SP_TOKEN'] != $sublight_patrol_token) {
		$success = false;
		$responseMessage = "Invalid token.";
	} else {
		// Check post body
		$postContents = file_get_contents('php://input');
		if ($postContents == false || $postContents == "") {
			$success = false;
			$responseMessage = "No post body provided.";
		} else {
			$input = json_decode($postContents, true);
			if ($input == null) {
				$success = false;
				$responseMessage = "Post body is not valid JSON.";
			} else {
				$missingFields = array();
				foreach ($requiredFields as $field) {
					if (!isset($input[$field])) {
						$missingFields[] = $field;
					}
				}
				if (!empty($missingFields)) {
					$success = false;
					$responseMessage = "Post body is missing required fields: " . implode(", ", $missingFields);
				} else {
					$nicknameRegex = "/^[a-zA-Z0-9 .\-_'()]{2,40}$/";
					$locationRegex = "/^[a-zA-Z0-9 .\-_'(),]{0,80}$/";
					$finishedAtDateTimeRegex = "/^[0-9-T:.Z]+$/";
					$gameDifficultyRegex = "/^(EASY|NORMAL|HARD)$/";
					$currentFighterIdRegex = "/^[a-z0-9_]{2,32}$/";
					$hangarContentsRegex = "/^[a-z0-9_, ]*$/";
					$gameVersionRegex = "/^[a-zA-Z0-9. (),]{10,80}$/";
					$finalMissionNameRegex = "/^[a-zA-Z0-9 :.\-_'(),]{3,255}$/";
					$finisherStarsRegex = "/^[0-9]$/";

					if (!preg_match($nicknameRegex, $input["playerNickname"])) {
						$success = false;
						$responseMessage = "playerNickname is not valid.";
					} else if (!preg_match($locationRegex, $input["playerLocation"])) {
						$success = false;
						$responseMessage = "playerLocation is not valid.";
					} else if (!preg_match($finishedAtDateTimeRegex, $input["playerFinishedAtDateTime"])) {
						$success = false;
						$responseMessage = "playerFinishedAtDateTime is not valid.";
					} else if (!preg_match($gameDifficultyRegex, $input["gameDifficulty"])) {
						$success = false;
						$responseMessage = "gameDifficulty is not valid.";
					} else if (!preg_match($currentFighterIdRegex, $input["playerFinalFighter"])) {
						$success = false;
						$responseMessage = "playerFinalFighter is not valid.";
					} else if (!preg_match($hangarContentsRegex, $input["playerHangarContents"])) {
						$success = false;
						$responseMessage = "playerHangarContents is not valid.";
					} else if (!preg_match($gameVersionRegex, $input["gameVersion"])) {
						$success = false;
						$responseMessage = "gameVersion is not valid.";
					} else if (!preg_match($finalMissionNameRegex, $input["finalMissionName"])) {
						$success = false;
						$responseMessage = "finalMissionName is not valid.";
					} else if (!preg_match($finisherStarsRegex, $input["finisherStars"])) {
						$success = false;
						$responseMessage = "finisherStars is not valid.";
					}

					if ($success) {
						// ready to insert entry into the database

						$feQuery = "
							INSERT INTO `sublight_patrol_finishers` (
								`player_nickname`,
								`player_location`,
								`player_url`,
								`player_finished_at_datetime`,
								`game_difficulty`,
								`player_final_fighter`,
								`player_hangar_contents`,
								`game_version`,
								`finisher_stars`,
								`final_mission_name`
							) VALUES (
								'" . mres($input["playerNickname"]) . "',
								'" . mres($input["playerLocation"]) . "',
								'" . mres($input["playerUrl"]) . "',
								'" . mres($input["playerFinishedAtDateTime"]) . "',
								'" . mres($input["gameDifficulty"]) . "',
								'" . mres($input["playerFinalFighter"]) . "',
								'" . mres($input["playerHangarContents"]) . "',
								'" . mres($input["gameVersion"]) . "',
								" . intval($input["finisherStars"]) . ",
								'" . mres($input["finalMissionName"]) . "'
							);
						";
						$feResult = mysqli_query($sp_db, $feQuery);
						if ($feResult == false) {
							$success = false;
							$responseMessage = "Database error: " . mysqli_error($sp_db);
						} else {
							$success = true;
							$responseMessage = "Finisher entry submitted successfully.";

							mysqli_commit($sp_db);
						}
					}
				}
			}
		}
	}

	header('Content-Type: application/json');
	// header("Access-Control-Allow-Origin: *"); // allow CORS
	header("Access-Control-Allow-Origin: " . $websiteRootUrl);
	header("Access-Control-Allow-Methods: POST, OPTIONS");
	header("Access-Control-Allow-Headers: Origin, X-SP-Token, Content-Type");

	echo json_encode(array("success" => $success, "message" => $responseMessage));
?>