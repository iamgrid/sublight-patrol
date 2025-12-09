<?php 
	function convertVesselTypeName($input) {
		// replace underscores with spaces
		$output = str_replace("_", " ", $input);
		// capitalize first letter of each word
		$output = ucwords($output);
		return $output;
	}

	function capitalize($input) {
		$words = explode(" ", mb_strtolower($input));
		$capitalizedWords = array_map('ucfirst', $words);
		return implode(" ", $capitalizedWords);
	}

	function renderPlaque($feRow) {
		$gameDifficulty = $feRow['game_difficulty'];
		$displayUrl = $feRow['player_url'];
		$renderUrl = "<span>" . $displayUrl . "</span>";
		if (strlen($displayUrl) > 5) {
			if (strlen($displayUrl) > 30) {
				$displayUrl = substr($feRow['player_url'], 0, 27) . "...";
			}
			$renderUrl = "<a href=\"" . $feRow['player_url'] . "\" target=\"_blank\" rel=\"noopener noreferrer\">" . $displayUrl . "</a>";
		}

		print "<div class=\"finishers-entry finishers-entry--" . $gameDifficulty . "\" data-entry-nickname=\"" . $feRow['player_nickname'] . "\" id=\"finishers-entry-" . $feRow['id'] . "\">\n";
		print "<div class=\"finishers-entry__proper\">\n";

		print "<div class=\"finishers-entry__stars-wrapper\">\n";
		print "<div class=\"finishers-entry__stars\" title=\"The number of stars you earn for finishing increase when I add more missions to the game or increase the difficulty in other ways.\"><span>" . str_repeat("★", $feRow['finisher_stars']) . "</span></div>\n";
		print "</div>\n";

		print "<section class=\"finishers-entry__section finishers-entry__section__top\">\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__nickname\">\n";
		print "<div class=\"finishers-entry__readout-label\">Nickname</div>\n";
		print "<div class=\"finishers-entry__nickname\">" . $feRow['player_nickname'] . "</div>\n";
		print "</div>\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__url\">\n";
		print "<div class=\"finishers-entry__finisher-details\">Location: <span>" . $feRow['player_location'] . "</span> &middot; Url: " . $renderUrl . "</div>\n";
		print "</div>\n";
		print "</section>\n";

		print "<div class=\"finishers-entry__bottom-wrapper\">\n";

		print "<section class=\"finishers-entry__section finishers-entry__section__left\">\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__game-difficulty\">\n";
		print "<div class=\"finishers-entry__readout-label\">Game Difficulty</div>\n";
		print "<div class=\"finishers-entry__game-difficulty\">" . capitalize($feRow['game_difficulty']) . "</div>\n";
		print "</div>\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__final-fighter\">\n";
		print "<div class=\"finishers-entry__readout-label\">Final Fighter</div>\n";
		print "<div class=\"finishers-entry__final-fighter\">" . convertVesselTypeName($feRow['player_final_fighter']) . "</div>\n";
		print "</div>\n";
		print "</section>\n";

		print "<section class=\"finishers-entry__section finishers-entry__section__right\">\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__finished-at\">\n";
		print "<div class=\"finishers-entry__readout-label\">Game completed on</div>\n";
		print "<div class=\"finishers-entry__finished-at\" id=\"finishers-entry__finished-at-" . $feRow['id'] . "\">" . $feRow['player_finished_at_datetime'] . "</div>\n";
		print "</div>\n";
		print "<div class=\"finishers-entry__readout finishers-entry__readout__game-version\" title=\"Final Mission: " . $feRow['final_mission_name'] . "\">\n";
		print "<div class=\"finishers-entry__readout-label\">Game Version</div>\n";
		print "<div class=\"finishers-entry__game-version\">" . $feRow['game_version'] . "</div>\n";
		print "</div>\n";
		print "</section>\n";

		print "</div>\n"; // finishers-entry__bottom-wrapper

		print "</div>\n"; // finishers-entry__proper
		print "</div>\n"; // finishers-entry
		print "<div class=\"direct-link-wrapper\">\n";
		print "<a class=\"direct-link\" href=\"https://iamgrid.co.uk/sublight-patrol/hall-of-finishers/plaque.php?id=" . $feRow['id'] . "\" title=\"Direct link to this plaque\">direct link</a>\n";
		print "</div>\n";
	}
?>
