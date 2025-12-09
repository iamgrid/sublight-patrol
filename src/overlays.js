export default function overlays() {
	return `
		<div class="game__loading_states" id="game__loading_states">
			<div class="game__loading" id="game__loading">
				<div class="game__loading_text" id="game__loading_text">Loading assets, please wait...</div>
			</div>
			<div class="game__loading_done" id="game__loading_done">
				<div class="game__loading_done__ready">Ready to launch.</div>
				<div class="game__loading_done__hit-enter">Hit [ENTER] to start</div>
				<div class="game__loading_done__callout game__loading_done__callout--audio" id="game__loading_done__callout--audio">
					<div class="game__loading_done__callout-proper">
						<div class="game__loading_done__callout-icon">
							<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M340-520ZM146-160q-27.67 0-46.83-19.58Q80-199.17 80-226.67v-586.66q0-27.5 19.17-47.09Q118.33-880 146-880h387.33q27.5 0 47.09 19.58Q600-840.83 600-813.33v189q-17.67 2.33-34.28 6.48t-32.39 10.18v-205.66H146v586.66h187.33V-160H146Zm187.33-120.33V-320q0-7.1.5-13.89.5-6.78 1.17-13.78-28.33-1.66-48.67-22.66Q266-391.33 266-420q0-30.56 21.39-51.94 21.39-21.39 51.94-21.39 11 0 20.67 3.33 9.67 3.33 18.67 9.33 8.66-14.66 18.83-27.83 10.17-13.17 22.17-25.5-17-12.33-37.17-19.17-20.17-6.83-43.17-6.83-58 0-99 41t-41 99q0 56.47 39.17 96.74 39.17 40.26 94.83 42.93ZM340-620q25 0 42.5-17.5T400-680q0-25-17.5-42.5T340-740q-25 0-42.5 17.5T280-680q0 25 17.5 42.5T340-620ZM546.67-80h-73.4Q443-80 421.5-101.54 400-123.08 400-153.33V-320q0-100 70-170t170-70q100 0 170 70t70 170v166.67q0 30.25-21.54 51.79T806.67-80h-73.34v-186.67h100V-320q0-80.56-56.34-136.94-56.34-56.39-136.83-56.39-80.49 0-136.99 56.39-56.5 56.38-56.5 136.94v53.33h100V-80Z"/></svg>
						</div>
						<div class="game__loading_done__callout-text">Volume controls will show up on the top right,<br/>you might need them in a second.</div>
					</div>
					<div class="game__loading_done__callout-arrow">
						<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M689.74-180v-397.44h-413.9l156.77 156.77-35.79 36L180-601.49 397.03-820l35.99 36-156.51 156.31H740V-180h-50.26Z"/></svg>
					</div>
				</div>
				<div class="game__loading_done__callout game__loading_done__callout--keyboard" id="game__loading_done__callout--keyboard">
					<div class="game__loading_done__callout-proper">
						<div class="game__loading_done__callout-icon">
							<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M146.67-200q-27 0-46.84-20.17Q80-240.33 80-266.67v-426.66q0-27 19.83-46.84Q119.67-760 146.67-760h666.66q27 0 46.84 19.83Q880-720.33 880-693.33v426.66q0 26.34-19.83 46.5Q840.33-200 813.33-200H146.67Zm0-66.67h666.66v-426.66H146.67v426.66Zm160-56.66h346.66V-390H306.67v66.67ZM202-446.67h66.67v-66.66H202v66.66Zm122.67 0h66.66v-66.66h-66.66v66.66Zm122 0h66.66v-66.66h-66.66v66.66Zm122.66 0H636v-66.66h-66.67v66.66Zm122 0H758v-66.66h-66.67v66.66ZM202-570h66.67v-66.67H202V-570Zm122.67 0h66.66v-66.67h-66.66V-570Zm122 0h66.66v-66.67h-66.66V-570Zm122.66 0H636v-66.67h-66.67V-570Zm122 0H758v-66.67h-66.67V-570ZM146.67-266.67v-426.66 426.66Z"/></svg>
						</div>
						<div class="game__loading_done__callout-text">This game is 100% keyboard controlled. The legend below displays the key mapping for your current context.</div>
					</div>
					<div class="game__loading_done__callout-arrow">
						<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M220-180v-447.69h463.49L526.98-784l35.99-36L780-601.49 563.18-384.67l-35.79-36 156.77-156.77h-413.9V-180H220Z"/></svg>
					</div>
				</div>
			</div>
		</div>
		<div class="game__dialogs" id="game__dialogs">
			<dialog class="game__dialog game__dialog--confirm game__dialog--yellow" id="game__dialog--confirm">
				<form method="dialog">
					<div id="game__dialog--confirm__message"></div>
					<div class="game__dialog__buttons">
						<button type="button" class="sp-button" id="game__dialog--confirm__cancel-button">Cancel</button>
						<button type="button" class="sp-button" id="game__dialog--confirm__confirm-button"><b>Confirm</b></button>
					</div>
				</form>
			</dialog>
			<dialog class="game__dialog game__dialog--red game__dialog--finisher-form" id="game__dialog--finisher-form">
				<form method="dialog">
					<div id="game__dialog--finisher-form__message"></div>
					<div class="game__dialog__buttons">
						<button type="button" class="sp-button" id="game__dialog--finisher-form__try-again-button">I'd like to try again</button>
						<button type="button" class="sp-button" id="game__dialog--finisher-form__exit-button">Exit finisher form (takes you to the game's main menu)</button>
					</div>
				</form>
			</dialog>
			<dialog class="game__dialog game__dialog--continue" id="game__dialog--continue">
				<form method="dialog">
					<div id="game__dialog--continue__message"></div>
					<div class="game__dialog__buttons">
						<button type="button" class="sp-button" id="game__dialog--continue__continue-button">Continue</button>
					</div>
				</form>
			</dialog>
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
		<div class="game__messagelayer" id="game__messagelayer">
			<div class="game__messagelayer-proper" id="game__messagelayer-proper">
				<div class="game__messagelayer-message">
					<div class="game__messagelayer-where-and-when" id="game__messagelayer-where-and-when"></div>
					<div class="game__messagelayer-message-text" id="game__messagelayer-message-text"></div>
					<div class="game__messagelayer-key">Hit [M] to advance this dialog</div>
				</div>
				<div class="game__messagelayer-top">
					<div class="game__messagelayer-speaker" id="game__messagelayer-speaker"></div>
					<div></div>
				</div>
				<div class="game__messagelayer-message-queue-readout" id="game__messagelayer-message-queue-readout"></div>
			</div>
		</div>
		<div id="game__hud" class="game__hud">
			<div class="game__hud-proper">
				<div class="game__hud-coords-and-lives">
					<div class="game__hud-lives" id="game__hud-lives"></div>
					<div class="game__hud-coords" id="game__hud-coords" title="Your current coordinates"></div>
				</div>
				<div class="game__hud-left-edge"></div>
				<div class="game__hud-player-desc">
					<div
						class="game__hud-player-desc-proper"
						id="game__hud-player-desc-proper"
					>
						<div class="game__hud-id-text" id="game__hud-player-id" title="Your current designation"></div>
						<div
							class="game__hud-contents-text"
							id="game__hud-player-contents"
							title="The cargo/contents of your current vessel"
						></div>
					</div>
				</div>
				<div id="game__hud-meters" class="game__hud-meters">
					<div id="game__hud-meters-proper" class="game__hud-meters-proper">
						<div class="game__hud-meter" id="game__hud-meter-player-shield" title="Your current shield strength">
							<div
								class="meter-text"
								id="game__hud-meter-player-shield-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-shield-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-player-hull" title="Your current hull strength">
							<div
								class="meter-text"
								id="game__hud-meter-player-hull-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-hull-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-player-system" title="Your vessel's current system health">
							<div
								class="meter-text meter-text--disabled"
								id="game__hud-meter-player-system-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-player-system-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-shield" title="Target's current shield strength">
							<div
								class="meter-text"
								id="game__hud-meter-target-shield-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-target-shield-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-hull" title="Target's current hull strength">
							<div
								class="meter-text"
								id="game__hud-meter-target-hull-text"
							></div>
							<div
								class="meter-bar"
								id="game__hud-meter-target-hull-bar"
							></div>
						</div>
						<div class="game__hud-meter" id="game__hud-meter-target-system" title="Target vessel's current system health">
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
						<div class="game__hud-id-text" id="game__hud-target-id" title="The designation of your current target"></div>
						<div
							class="game__hud-contents-text"
							id="game__hud-target-contents"
							title="The cargo/contents of your current target"
						></div>
					</div>
				</div>
				<div class="game__hud-right-edge"></div>
			</div>
		</div>
		<div class="game__main_menu" id="game__main_menu">
			<div class="game__main_menu_logo">
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="365px"
	 height="175px" viewBox="0 0 365 175" enable-background="new 0 0 365 175" xml:space="preserve">
					<g id="Layer_7">
						<g>
							<g>
								<path fill="#FFFFFF" d="M56.459,92.476c3.798,0,6.708-0.925,8.732-2.774c2.022-1.851,3.034-4.625,3.034-8.325
									c0-2.221-0.358-4.058-1.073-5.514c-0.716-1.454-1.653-2.663-2.812-3.626c-1.16-0.962-2.479-1.75-3.959-2.367
									c-1.48-0.616-2.997-1.196-4.551-1.739c-1.554-0.542-3.071-1.135-4.551-1.776c-1.48-0.641-2.8-1.454-3.959-2.441
									c-1.16-0.986-2.098-2.231-2.812-3.737c-0.716-1.504-1.073-3.392-1.073-5.661c0-2.664,0.481-4.847,1.443-6.549
									s2.183-3.034,3.663-3.996s3.108-1.628,4.884-1.998s3.478-0.555,5.106-0.555c1.48,0,2.935,0.11,4.366,0.333
									c1.43,0.222,2.712,0.53,3.848,0.925c1.134,0.396,2.06,0.851,2.775,1.369c0.714,0.518,1.073,1.049,1.073,1.591
									c0,0.396-0.161,0.851-0.481,1.369c-0.321,0.518-0.729,0.776-1.221,0.776c-0.296,0-0.703-0.147-1.221-0.443
									s-1.184-0.616-1.998-0.962c-0.814-0.345-1.813-0.666-2.997-0.962s-2.59-0.444-4.218-0.444c-1.382,0-2.751,0.137-4.107,0.407
									c-1.357,0.271-2.565,0.766-3.626,1.479c-1.061,0.716-1.924,1.665-2.59,2.85c-0.666,1.184-0.999,2.689-0.999,4.514
									c0,2.468,0.616,4.366,1.85,5.698c1.232,1.332,2.762,2.417,4.588,3.256c1.825,0.839,3.811,1.579,5.957,2.22
									c2.146,0.642,4.131,1.543,5.957,2.701c1.825,1.16,3.354,2.738,4.588,4.736c1.232,1.998,1.85,4.724,1.85,8.177
									c0,2.615-0.383,4.872-1.147,6.771c-0.766,1.9-1.813,3.467-3.145,4.699c-1.332,1.233-2.923,2.135-4.773,2.701
									c-1.85,0.567-3.861,0.851-6.031,0.851c-2.368,0-4.465-0.283-6.29-0.851c-1.826-0.566-3.367-1.258-4.625-2.071
									c-1.258-0.814-2.208-1.666-2.849-2.554c-0.642-0.888-0.962-1.628-0.962-2.22c0-0.493,0.185-0.962,0.555-1.406
									s0.751-0.666,1.147-0.666c0.444,0,0.9,0.321,1.369,0.962c0.468,0.642,1.134,1.357,1.998,2.146
									c0.862,0.789,2.022,1.505,3.478,2.146C52.105,92.155,54.042,92.476,56.459,92.476z"/>
								<path fill="#FFFFFF" d="M107.149,43.044c0-0.543,0.186-0.937,0.556-1.185c0.37-0.246,0.801-0.37,1.295-0.37
									c0.444,0,0.862,0.124,1.258,0.37c0.395,0.248,0.592,0.642,0.592,1.185v37.443c0,2.813-0.383,5.206-1.146,7.179
									c-0.766,1.974-1.826,3.577-3.183,4.81c-1.357,1.233-2.948,2.135-4.772,2.701c-1.826,0.567-3.8,0.851-5.92,0.851
									c-2.122,0-4.096-0.283-5.92-0.851c-1.826-0.566-3.404-1.468-4.736-2.701c-1.332-1.232-2.381-2.836-3.145-4.81
									c-0.766-1.973-1.147-4.366-1.147-7.179V43.044c0-0.543,0.197-0.937,0.592-1.185c0.395-0.246,0.814-0.37,1.258-0.37
									c0.493,0,0.925,0.124,1.295,0.37c0.37,0.248,0.555,0.642,0.555,1.185v37.443c0,4.145,0.986,7.179,2.96,9.103
									c1.972,1.924,4.735,2.886,8.288,2.886c3.552,0,6.327-0.962,8.325-2.886c1.997-1.924,2.996-4.958,2.996-9.103V43.044z"/>
								<path fill="#FFFFFF" d="M122.318,43.118c0-0.543,0.186-0.949,0.556-1.222c0.37-0.271,0.776-0.407,1.221-0.407h11.544
									c2.12,0,4.107,0.161,5.957,0.481c1.85,0.321,3.452,0.938,4.81,1.85c1.356,0.914,2.43,2.184,3.22,3.812
									c0.788,1.628,1.184,3.726,1.184,6.29c0,3.207-0.58,5.858-1.739,7.955c-1.159,2.098-2.677,3.564-4.551,4.402
									c1.135,0.494,2.17,1.086,3.108,1.776c0.937,0.691,1.738,1.543,2.404,2.553c0.666,1.012,1.185,2.209,1.555,3.589
									c0.37,1.382,0.555,3.034,0.555,4.958v1.332c0,2.813-0.37,5.181-1.11,7.104c-0.739,1.924-1.764,3.478-3.07,4.662
									c-1.308,1.184-2.85,2.035-4.625,2.553c-1.776,0.519-3.7,0.777-5.772,0.777h-13.468c-0.544,0-0.975-0.16-1.295-0.48
									c-0.321-0.32-0.481-0.678-0.481-1.074V43.118z M126.018,64.578h9.99c1.874,0,3.515-0.173,4.921-0.519
									c1.406-0.345,2.564-0.925,3.478-1.739c0.913-0.813,1.592-1.874,2.035-3.182c0.444-1.307,0.666-2.947,0.666-4.921
									c0-1.924-0.284-3.479-0.851-4.662c-0.568-1.184-1.357-2.109-2.368-2.775c-1.012-0.666-2.208-1.121-3.589-1.368
									c-1.382-0.247-2.911-0.37-4.588-0.37h-9.694V64.578z M137.266,92.032c3.502,0,6.24-0.926,8.214-2.775
									c1.973-1.85,2.96-4.821,2.96-8.917v-1.258c0-2.022-0.259-3.737-0.776-5.144c-0.519-1.405-1.259-2.553-2.221-3.44
									c-0.962-0.889-2.134-1.529-3.515-1.924c-1.382-0.395-2.936-0.593-4.662-0.593h-11.248v24.051H137.266z"/>
								<path fill="#FFFFFF" d="M163.462,95.584c-0.444,0-0.851-0.135-1.221-0.407c-0.37-0.271-0.556-0.677-0.556-1.221V43.044
									c0-0.543,0.197-0.937,0.593-1.185c0.394-0.246,0.813-0.37,1.258-0.37c0.492,0,0.925,0.124,1.295,0.37
									c0.37,0.248,0.555,0.642,0.555,1.185v48.988h21.831c0.492,0,0.85,0.185,1.072,0.555s0.334,0.776,0.334,1.222
									c0,0.443-0.111,0.851-0.334,1.221c-0.223,0.369-0.58,0.555-1.072,0.555H163.462z"/>
								<path fill="#FFFFFF" d="M198.504,43.044c0-0.543,0.197-0.937,0.592-1.185c0.395-0.246,0.814-0.37,1.258-0.37
									c0.492,0,0.926,0.124,1.295,0.37c0.371,0.248,0.555,0.642,0.555,1.185v50.912c0,0.544-0.184,0.95-0.555,1.221
									c-0.369,0.272-0.803,0.407-1.295,0.407c-0.443,0-0.863-0.135-1.258-0.407c-0.395-0.271-0.592-0.677-0.592-1.221V43.044z"/>
								<path fill="#FFFFFF" d="M239.5,54.366c-0.396-3.108-1.555-5.439-3.479-6.993c-1.924-1.555-4.514-2.331-7.77-2.331
									c-3.553,0-6.303,0.962-8.252,2.886s-2.922,4.958-2.922,9.102v23.458c0,4.145,0.973,7.179,2.922,9.103s4.699,2.886,8.252,2.886
									c3.551,0,6.314-0.962,8.287-2.886s2.961-4.958,2.961-9.103v-9.916h-10.953c-0.494,0-0.863-0.185-1.109-0.555
									c-0.248-0.37-0.371-0.751-0.371-1.146c0-0.395,0.123-0.777,0.371-1.147c0.246-0.37,0.615-0.555,1.109-0.555h13.098
									c0.494,0,0.877,0.173,1.148,0.518c0.27,0.346,0.406,0.74,0.406,1.185v11.617c0,2.813-0.383,5.206-1.146,7.179
									c-0.766,1.974-1.826,3.577-3.182,4.81c-1.357,1.233-2.949,2.135-4.773,2.701c-1.826,0.567-3.773,0.851-5.846,0.851
									c-2.123,0-4.084-0.283-5.883-0.851c-1.803-0.566-3.367-1.468-4.699-2.701c-1.332-1.232-2.381-2.836-3.146-4.81
									c-0.764-1.973-1.146-4.366-1.146-7.179V57.029c0-2.812,0.383-5.204,1.146-7.178c0.766-1.973,1.814-3.576,3.146-4.81
									c1.332-1.232,2.896-2.134,4.699-2.701c1.799-0.566,3.736-0.852,5.809-0.852c2.318,0,4.402,0.322,6.252,0.963
									c1.852,0.642,3.43,1.517,4.736,2.627c1.307,1.109,2.307,2.43,2.998,3.959c0.689,1.529,1.035,3.182,1.035,4.958
									c0,0.691-0.174,1.184-0.518,1.479c-0.346,0.296-0.791,0.444-1.332,0.444c-0.494,0-0.914-0.123-1.258-0.37
									C239.746,55.304,239.549,54.909,239.5,54.366z"/>
								<path fill="#FFFFFF" d="M279.828,69.239h-22.57v24.717c0,0.544-0.184,0.95-0.555,1.221c-0.369,0.272-0.803,0.407-1.295,0.407
									c-0.443,0-0.863-0.135-1.258-0.407c-0.395-0.271-0.592-0.677-0.592-1.221V43.044c0-0.543,0.197-0.937,0.592-1.185
									c0.395-0.246,0.814-0.37,1.258-0.37c0.492,0,0.926,0.124,1.295,0.37c0.371,0.248,0.555,0.642,0.555,1.185v22.792h22.57V43.044
									c0-0.543,0.197-0.937,0.592-1.185c0.395-0.246,0.814-0.37,1.258-0.37c0.494,0,0.926,0.124,1.295,0.37
									c0.371,0.248,0.557,0.642,0.557,1.185v50.912c0,0.544-0.186,0.95-0.557,1.221c-0.369,0.272-0.801,0.407-1.295,0.407
									c-0.443,0-0.863-0.135-1.258-0.407c-0.395-0.271-0.592-0.677-0.592-1.221V69.239z"/>
								<path fill="#FFFFFF" d="M321.342,41.489c0.543,0,0.936,0.174,1.184,0.519c0.246,0.346,0.371,0.74,0.371,1.184
									c0,0.444-0.125,0.864-0.371,1.259c-0.248,0.395-0.641,0.592-1.184,0.592h-12.729v48.914c0,0.544-0.197,0.95-0.592,1.221
									c-0.395,0.272-0.814,0.407-1.258,0.407c-0.494,0-0.926-0.135-1.295-0.407c-0.371-0.271-0.555-0.677-0.555-1.221V45.042h-12.877
									c-0.494,0-0.877-0.186-1.146-0.556c-0.271-0.369-0.406-0.776-0.406-1.221s0.135-0.851,0.406-1.221
									c0.27-0.37,0.652-0.556,1.146-0.556H321.342z"/>
							</g>
							<g>
								<path fill="#00ADEE" d="M135.015,107.592c0.624,0,0.936,0.301,0.936,0.9v12.42c0,0.624-0.312,0.936-0.936,0.936h-13.32
									c-0.288,0-0.432,0.133-0.432,0.396v10.404c0,0.624-0.3,0.936-0.9,0.936c-0.625,0-0.936-0.312-0.936-0.936v-24.156
									c0-0.6,0.312-0.9,0.936-0.9H135.015z M121.695,109.428c-0.288,0-0.432,0.145-0.432,0.432v9.721c0,0.288,0.144,0.432,0.432,0.432
									h11.988c0.288,0,0.432-0.144,0.432-0.432v-9.721c0-0.287-0.144-0.432-0.432-0.432H121.695z"/>
								<path fill="#00ADEE" d="M152.223,107.592c0.864,0,1.596,0.276,2.196,0.828c0.6,0.553,0.959,1.248,1.08,2.088l3.096,22.032
									c0.024,0.024,0.036,0.085,0.036,0.181c0,0.575-0.324,0.863-0.972,0.863c-0.504,0-0.792-0.264-0.864-0.792l-1.008-6.769
									c-0.024-0.239-0.168-0.359-0.432-0.359h-11.052c-0.264,0-0.408,0.12-0.432,0.359l-1.008,6.769
									c-0.072,0.528-0.36,0.792-0.864,0.792c-0.648,0-0.972-0.288-0.972-0.863c0-0.096,0.012-0.156,0.036-0.181l3.096-22.032
									c0.12-0.84,0.468-1.535,1.044-2.088c0.576-0.552,1.32-0.828,2.232-0.828H152.223z M147.435,109.428
									c-0.864,0-1.356,0.445-1.476,1.332l-1.692,12.708c0,0.24,0.132,0.36,0.396,0.36h10.332c0.288,0,0.432-0.12,0.432-0.36
									l-1.728-12.708c-0.12-0.887-0.612-1.332-1.476-1.332H147.435z"/>
								<path fill="#00ADEE" d="M178.506,107.592c0.6,0,0.9,0.301,0.9,0.9c0,0.624-0.301,0.936-0.9,0.936h-6.623
									c-0.289,0-0.432,0.145-0.432,0.432v22.789c0,0.624-0.313,0.936-0.938,0.936c-0.6,0-0.898-0.312-0.898-0.936v-22.789
									c0-0.287-0.145-0.432-0.434-0.432h-6.551c-0.6,0-0.9-0.312-0.9-0.936c0-0.6,0.3-0.9,0.9-0.9H178.506z"/>
								<path fill="#00ADEE" d="M199.781,107.592c0.623,0,0.936,0.301,0.936,0.9v12.203c0,0.625-0.313,0.937-0.936,0.937h-2.232
									c-0.287,0-0.432,0.12-0.432,0.36c0,0.12,0.012,0.192,0.035,0.216l3.961,10.08c0.047,0.192,0.072,0.312,0.072,0.36
									c0,0.624-0.324,0.936-0.973,0.936c-0.432,0-0.695-0.191-0.791-0.576l-4.357-11.088c-0.119-0.191-0.264-0.288-0.432-0.288h-8.135
									c-0.289,0-0.434,0.144-0.434,0.433v10.584c0,0.624-0.299,0.936-0.898,0.936c-0.625,0-0.938-0.312-0.938-0.936v-24.156
									c0-0.6,0.313-0.9,0.938-0.9H199.781z M198.881,109.859c0-0.287-0.145-0.432-0.432-0.432h-11.951
									c-0.289,0-0.434,0.145-0.434,0.432v9.504c0,0.289,0.145,0.433,0.434,0.433h11.951c0.287,0,0.432-0.144,0.432-0.433V109.859z"/>
								<path fill="#00ADEE" d="M220.588,107.592c1.561,0,2.342,0.756,2.342,2.268v21.457c0,0.647-0.217,1.188-0.648,1.619
									c-0.432,0.433-0.996,0.648-1.693,0.648h-11.627c-0.6,0-1.123-0.216-1.566-0.648c-0.443-0.432-0.666-0.972-0.666-1.619v-21.457
									c0-1.512,0.744-2.268,2.232-2.268H220.588z M208.961,109.428c-0.264,0-0.396,0.145-0.396,0.432v21.457
									c0,0.287,0.133,0.432,0.396,0.432h11.627c0.289,0,0.434-0.145,0.434-0.432v-21.457c0-0.287-0.145-0.432-0.434-0.432H208.961z"/>
								<path fill="#00ADEE" d="M229.264,107.592c0.625,0,0.938,0.301,0.938,0.9v22.824c0,0.287,0.131,0.432,0.395,0.432h14.076
									c0.6,0,0.9,0.301,0.9,0.9c0,0.624-0.301,0.936-0.9,0.936h-15.408c-0.6,0-0.898-0.312-0.898-0.936v-24.156
									C228.365,107.893,228.664,107.592,229.264,107.592z"/>
							</g>
							
								<line fill="none" stroke="#A7A9AC" stroke-width="1.9" stroke-linecap="round" stroke-miterlimit="10" x1="109.305" y1="120.943" x2="42.104" y2="120.943"/>
							
								<line fill="none" stroke="#A7A9AC" stroke-width="1.9" stroke-linecap="round" stroke-miterlimit="10" x1="322.896" y1="120.943" x2="251.555" y2="120.943"/>
						</g>
					</g>
				</svg>
			</div>
			<div class="game__main_menu_version" id="game__main_menu_version"></div>
		</div>
		<div class="game__plates" id="game__plates">
			<div class="game__plates_plate" id="game__plates_plate">
				<div class="game__plates_plate_atl" id="game__plates_plate_atl"></div>
				<div class="game__plates_plate_line" id="game__plates_plate_line"></div>
				<div class="game__plates_plate_btl" id="game__plates_plate_btl"></div>
			</div>
		</div>
		<div class="game__intro" id="game__intro">
			<div class="game__intro-plate" id="game__intro-plate-1">
				<div class="game__intro-plate__big-text" id="game__intro-plate-1__big-text">i.am.grid</div>
				<div class="game__intro-plate__small-text" id="game__intro-plate-1__small-text">presents</div>
			</div>
			<div class="game__intro-plate" id="game__intro-plate-2">
				<div class="game__intro-plate__small-text" id="game__intro-plate-2__small-text">an</div>
				<div class="game__intro-plate__big-text" id="game__intro-plate-2__big-text">open source and noncommercial<br>side-scrolling space shooter<br>browser game</div>
			</div>
			<div class="game__intro-plate" id="game__intro-plate-3">
				<div class="game__intro-plate__small-text" id="game__intro-plate-3__small-text-1">built in</div>
				<div class="game__intro-plate__big-text" id="game__intro-plate-3__big-text-1">JavaScript, HTML, CSS</div>
				<div class="game__intro-plate__small-text" id="game__intro-plate-3__small-text-2">and</div>
				<div class="game__intro-plate__big-text" id="game__intro-plate-3__big-text-2">WebGL (via PixiJS)</div>
			</div>
		</div>
		<div class="game__pause" id="game__pause">
			<div class="game__pause-text">[Paused]</div>
			<div class="game__pause-objectives" id="game__pause-objectives"></div>
		</div>
		<div class="game__log game__log--hidden" id="game__log" title="Combat log">
			<div class="game__log-expand" id="game__log-expand">
				<svg
					class="game__log-expand-chevron"
					id="game__log-expand-chevron"
					width="16"
					height="10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						class="game__log-expand-chevron-path"
						d="M1 9L8 2L15 9"
						stroke="white"
						stroke-width="1.5"
					/>
				</svg>
			</div>
			<div
				class="game__log-proper customScroll"
				id="game__log-proper"
			></div>
		</div>
		<div class="game__finishers" id="game__finishers">
			<form class="game__finishers__form" id="game__finishers__form">
				<div class="game__finishers__form__field game__finishers__form__field__nickname">
					<label for="game__finishers__finisher-nickname">Your Nickname:</label>
					<input type="text" id="game__finishers__finisher-nickname" name="game__finishers__finisher-nickname" maxlength="40" value="Anonymous" autocomplete="off" spellcheck="false">
					<div class="validation-bubble validation-bubble--hidden" id="game__finishers__finisher-nickname-validation">This field accepts 40 of the following characters:<br/>ASCII letters, numbers, spaces, dots, dashes, underscores, singlequotes and parentheses</div>
				</div>
				<div class="game__finishers__form__field game__finishers__form__field__location">
					<label for="game__finishers__finisher-location">Your Location (optional):</label>
					<input type="text" id="game__finishers__finisher-location" name="game__finishers__finisher-location" maxlength="80" value="" autocomplete="off" placeholder="London, United Kingdom">
					<div class="validation-bubble validation-bubble--hidden" id="game__finishers__finisher-location-validation">This field accepts 80 of the following characters:<br/>ASCII letters, numbers, spaces, dots, dashes, underscores, singlequotes, parentheses and commas</div>
				</div>
				<div class="game__finishers__form__field game__finishers__form__field__url">
					<label for="game__finishers__finisher-url">Your Url (optional):</label>
					<input type="text" id="game__finishers__finisher-url" name="game__finishers__finisher-url" maxlength="500" value="https://" autocomplete="off" spellcheck="false">
					<div class="validation-bubble validation-bubble--hidden" id="game__finishers__finisher-url-validation">This field accepts a valid url with a maximum length of 500 characters</div>
				</div>
				<div class="game__finishers__button-wrapper">
					<button type="submit" id="game__finishers__submit-button" class="sp-button">Submit</button>
				</div>
			</form>
			<div class="game__finishers__preview" id="game__finishers__preview">
				<h2>A Preview of Your Entry in the Sublight Patrol <a href="/sublight-patrol/hall-of-finishers/" target="_blank" class="hall-of-finishers-link">Hall of Finishers</a>:</h2>
				<div class="finishers-entry">
					<div class="finishers-entry__proper">
						<div class="finishers-entry__stars-wrapper">
							<div class="finishers-entry__stars" id="finishers-entry__stars" title="The number of stars you earn for finishing increase when I add more missions to the game."><span>★★★★</span></div>
						</div>
						<section class="finishers-entry__section finishers-entry__section__top">
							<div class="finishers-entry__readout finishers-entry__readout__nickname">
								<div class="finishers-entry__readout-label">Nickname</div>
								<div class="finishers-entry__nickname" id="finishers-entry__nickname"></div>
							</div>
							<div class="finishers-entry__readout finishers-entry__readout__url">
								<div class="finishers-entry__finisher-details" id="finishers-entry__finisher-details"></div>
							</div>
						</section>
						<div class="finishers-entry__bottom-wrapper">
							<section class="finishers-entry__section finishers-entry__section__stats">
								<!-- <h3>Stats</h3> -->
								<div class="finishers-entry__readout finishers-entry__readout__finished-at">
									<div class="finishers-entry__readout-label">Game completed on</div>
									<div class="finishers-entry__finished-at" id="finishers-entry__finished-at"></div>
								</div>
								<div class="finishers-entry__readout finishers-entry__readout__final-fighter">
									<div class="finishers-entry__readout-label">Final Fighter</div>
									<div class="finishers-entry__final-fighter" id="finishers-entry__final-fighter"></div>
								</div>
								<!-- <div class="finishers-entry__readout finishers-entry__readout__final-hangar">
									<div class="finishers-entry__readout-label">Final Hangar Contents</div>
									<div class="finishers-entry__final-hangar" id="finishers-entry__final-hangar"></div>
								</div> -->
							</section>
							<section class="finishers-entry__section finishers-entry__section__game-version">
								<!-- <h3>Game Version</h3> -->
								<div class="finishers-entry__readout finishers-entry__readout__game-version">
									<div class="finishers-entry__readout-label">Game Version</div>
									<div class="finishers-entry__game-version" id="finishers-entry__game-version"></div>
								</div>
								<div class="finishers-entry__readout finishers-entry__readout__final-mission">
									<div class="finishers-entry__readout-label">Final Mission</div>
									<div class="finishers-entry__final-mission" id="finishers-entry__final-mission"></div>
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</div>
		`;
}
