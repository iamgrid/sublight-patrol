export default function overlays() {
	return `
		<div class="game__loading_states" id="game__loading_states">
			<div class="game__loading" id="game__loading">
				<div class="game__loading_text" id="game__loading_text">Loading assets, please wait...</div>
			</div>
			<div class="game__loading_done" id="game__loading_done">
				<div class="game__loading_done_text_top">Ready to launch.</div>
				<div class="game__loading_done_text_middle">Volume controls are on the top right, you might need them.</div>
				<div class="game__loading_done_text_bottom">Hit [ENTER] to start</div>
			</div>
		</div>
		<div class="game__dialog" id="game__dialog">
			<div class="game__dialog-speaker" id="game__dialog-speaker"></div>
			<div class="game__dialog-message" id="game__dialog-message"></div>
		</div>
		<div class="game__alertsAndWarnings" id="game__alertsAndWarnings">
			<div 
				class="game__alertsAndWarnings-alerts" 
				id="game__alertsAndWarnings-alerts"
			></div>
			<div 
				class="game__alertsAndWarnings-warnings" 
				id="game__alertsAndWarnings-warnings"
			></div>
		</div>
		<div id="game__hud" class="game__hud">
			<div class="game__hud-proper">
				<div class="game__hud-coords-and-lives">
					<div class="game__hud-lives" id="game__hud-lives"></div>
					<div class="game__hud-coords" id="game__hud-coords"></div>
				</div>
				<div class="game__hud-left-edge"></div>
				<div class="game__hud-player-desc">
					<div
						class="game__hud-player-desc-proper"
						id="game__hud-player-desc-proper"
					>
						<div class="game__hud-id-text" id="game__hud-player-id"></div>
						<div
							class="game__hud-contents-text"
							id="game__hud-player-contents"
						></div>
					</div>
				</div>
				<div id="game__hud-meters" class="game__hud-meters">
					<div id="game__hud-meters-proper" class="game__hud-meters-proper">
						<div class="game__hud-meter" id="game__hud-meter-player-shield">
							<div
								class="meter-text"
								id="game__hud-meter-player-shield-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-shield-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-player-hull">
							<div
								class="meter-text"
								id="game__hud-meter-player-hull-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-hull-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-player-system">
							<div
								class="meter-text meter-text--disabled"
								id="game__hud-meter-player-system-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-system-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-shield">
							<div
								class="meter-text"
								id="game__hud-meter-target-shield-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-target-shield-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-hull">
							<div
								class="meter-text"
								id="game__hud-meter-target-hull-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-target-hull-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-system">
							<div
								class="meter-text"
								id="game__hud-meter-target-system-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-target-system-bar"
							></div>
						</div>
					</div>
				</div>
				<div class="game__hud-target-desc">
					<div
						class="game__hud-target-desc-proper"
						id="game__hud-target-desc-proper"
					>
						<div class="game__hud-id-text" id="game__hud-target-id"></div>
						<div
							class="game__hud-contents-text"
							id="game__hud-target-contents"
						></div>
					</div>
				</div>
				<div class="game__hud-right-edge"></div>
			</div>
		</div>
		<div class="game__main_menu" id="game__main_menu">
			<div class="game__main_menu_logo"></div>
			<div class="game__main_menu_version" id="game__main_menu_version"></div>
		</div>
		<div class="game__plates" id="game__plates">
			<div class="game__plates_plate" id="game__plates_plate">
				<div class="game__plates_plate_atl" id="game__plates_plate_atl"></div>
				<div class="game__plates_plate_line" id="game__plates_plate_line"></div>
				<div class="game__plates_plate_btl" id="game__plates_plate_btl"></div>
			</div>
		</div>
		<div class="game__pause" id="game__pause">
			<div class="game__pause-text">[Paused]</div>
			<div class="game__pause-objectives" id="game__pause-objectives"></div>
		</div>
		<div class="game__status game__status--hidden" id="game__status">
			<div class="game__status-expand" id="game__status-expand">
				<svg
					class="game__status-expand-chevron"
					id="game__status-expand-chevron"
					width="16"
					height="10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						class="game__status-expand-chevron-path"
						d="M1 9L8 2L15 9"
						stroke="white"
						stroke-width="1.5"
					/>
				</svg>
			</div>
			<div
				class="game__status-proper customScroll"
				id="game__status-proper"
			></div>
		</div>
		`;
}
