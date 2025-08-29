import c from './utils/constants';
import sc from './story/storyConstants';
import { makeName, shortenGameVersion } from './utils/helpers';

const finishers = {
	handlers: { state: null }, // gets its values in App.js
	playerNickname: 'Anonymous',
	playerNicknameIsValid: true,
	playerUrl: '',
	playerUrlIsValid: true,
	playerFinishedAtDateTime: '',
	playerCurrentFighterId: '',
	playerHangarContents: '',
	gameVersion: '',
	finisherStars: 0,
	finalMissionName: '',
	init() {
		const functionSignature = 'finishers.js@init()';
		console.log(functionSignature);

		document
			.getElementById('game__finishers__form')
			.addEventListener('submit', (event) => {
				finishers.postFinisherInfo(event);
			});
		document
			.getElementById('game__finishers__finisher-nickname')
			.addEventListener('input', () => {
				finishers.updatePreview();
			});
		document
			.getElementById('game__finishers__finisher-url')
			.addEventListener('input', () => {
				finishers.updatePreview();
			});
	},
	updatePreview(firstRun = false) {
		const functionSignature = 'finishers.js@updatePreview()';
		console.log(functionSignature);

		const finisherNicknameInputEl = document.getElementById(
			'game__finishers__finisher-nickname'
		);

		let updatedNickname = finisherNicknameInputEl.value;
		if (
			updatedNickname === '' ||
			updatedNickname.length < 2 ||
			updatedNickname.length > 40
		) {
			updatedNickname = 'Anonymous';
		}
		finishers.playerNickname = updatedNickname;
		document.getElementById('finishers-entry__nickname').innerText =
			finishers.playerNickname;

		const updatedUrl = document.getElementById(
			'game__finishers__finisher-url'
		).value;
		finishers.playerUrl = updatedUrl;
		let displayUrl = updatedUrl;

		const notProvidedStr = '-';

		if (
			finishers.playerUrl.length === 0 ||
			finishers.playerUrl === 'https://' ||
			!finishers.playerUrlIsValid
		) {
			displayUrl = notProvidedStr;
		} else {
			displayUrl = `<a href="${finishers.playerUrl}" target="_blank">${finishers.playerUrl}</a>`;
		}

		document.getElementById(
			'finishers-entry__url'
		).innerHTML = `Url: <span>${displayUrl}</span>`;

		if (firstRun) {
			const nowDateObj = new Date();
			finishers.playerFinishedAtDateTime = nowDateObj.toISOString();

			// displayDateTime format: "August 29, 2025 3:16 PM"
			const options = {
				hour12: true,
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			};
			const displayDateTime = nowDateObj.toLocaleString('en-US', options);

			document.getElementById('finishers-entry__finished-at').innerText =
				displayDateTime;

			const currentState = finishers.handlers.state();

			console.log(functionSignature, { currentState });

			finishers.playerCurrentFighterId = currentState.game.playerShips.current;
			document.getElementById('finishers-entry__final-fighter').innerText =
				makeName(finishers.playerCurrentFighterId);

			finishers.playerHangarContents = JSON.stringify(
				currentState.game.playerShips.hangarContents
			);
			// document.getElementById('finishers-entry__final-hangar').innerText =
			// 	finishers.playerHangarContents;

			finishers.gameVersion = c.gameVersion;
			document.getElementById('finishers-entry__game-version').innerText =
				shortenGameVersion(finishers.gameVersion);

			finishers.finalMissionName = sc.finalMissionTitle;
			document.getElementById('finishers-entry__final-mission').innerText =
				finishers.finalMissionName;

			finishers.finisherStars = c.finisherStars;
			document.getElementById(
				'finishers-entry__stars'
			).innerHTML = `<span>${'★'.repeat(finishers.finisherStars)}</span>`;

			finisherNicknameInputEl.select();
		}
	},
	postFinisherInfo(event) {
		const functionSignature = 'finishers.js@postFinisherInfo()';
		console.log(functionSignature, event);

		event.preventDefault();
	},
	postFinisherInfoProper(
		playerNickname,
		playerFinishedAtDateTime,
		playerUrl,
		playerCurrentFighterId,
		playerHangarContents,
		gameVersion,
		finisherStars,
		finalMissionName
	) {
		const functionSignature = 'finishers.js@postFinisherInfoProper()';

		const finisherInfo = {
			playerNickname,
			playerFinishedAtDateTime,
			playerUrl,
			playerCurrentFighterId,
			playerHangarContents,
			gameVersion,
			finisherStars,
			finalMissionName,
		};

		// eslint-disable-next-line no-undef
		const spToken = process.env.SUBLIGHT_PATROL_TOKEN;

		console.log(functionSignature, { finisherInfo, spToken });
	},
};

export default finishers;
