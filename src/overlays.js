export default function overlays() {
	return `
		<div class="game__dialog" id="game__dialog">
			<div class="game__dialog-speaker" id="game__dialog-speaker"></div>
			<div class="game__dialog-message" id="game__dialog-message"></div>
		</div>
		<div class="game__warnings" id="game__warnings">
			<div class="game__warnings-proper" id="game__warnings-proper"></div>
		</div>
		<div class="game__pause" id="game__pause">
			<div class="game__pause-text">[Paused]</div>
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
		<div id="game__hud" class="game__hud">
			<div class="game__hud-proper">
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
		`;
}