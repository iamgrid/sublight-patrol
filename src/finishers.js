import c from './utils/constants';
import sc from './story/storyConstants';
import { makeName, shortenGameVersion } from './utils/helpers';

const finishers = {
	handlers: { state: null }, // gets its values in App.js
	playerNicknameIsValid: true,
	playerUrlIsValid: true,
	finisherInfo: {
		playerNickname: 'Anonymous',
		playerUrl: '',
		playerFinishedAtDateTime: '',
		playerCurrentFighterId: '',
		playerHangarContents: '',
		gameVersion: '',
		finisherStars: 0,
		finalMissionName: '',
	},
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
		finishers.finisherInfo.playerNickname = updatedNickname;
		document.getElementById('finishers-entry__nickname').innerText =
			finishers.finisherInfo.playerNickname;

		const updatedUrl = document.getElementById(
			'game__finishers__finisher-url'
		).value;
		finishers.finisherInfo.playerUrl = updatedUrl;
		let displayUrl = updatedUrl;

		const notProvidedStr = '-';

		if (
			finishers.finisherInfo.playerUrl.length === 0 ||
			finishers.finisherInfo.playerUrl === 'https://' ||
			!finishers.playerUrlIsValid
		) {
			displayUrl = notProvidedStr;
		} else {
			displayUrl = `<a href="${finishers.finisherInfo.playerUrl}" target="_blank">${finishers.finisherInfo.playerUrl}</a>`;
		}

		document.getElementById(
			'finishers-entry__url'
		).innerHTML = `Url: <span>${displayUrl}</span>`;

		if (firstRun) {
			const nowDateObj = new Date();
			finishers.finisherInfo.playerFinishedAtDateTime =
				nowDateObj.toISOString();

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

			finishers.finisherInfo.playerCurrentFighterId =
				currentState.game.playerShips.current;
			document.getElementById('finishers-entry__final-fighter').innerText =
				makeName(finishers.finisherInfo.playerCurrentFighterId);

			finishers.finisherInfo.playerHangarContents = JSON.stringify(
				currentState.game.playerShips.hangarContents
			);
			// document.getElementById('finishers-entry__final-hangar').innerText =
			// 	finishers.finisherInfo.playerHangarContents;

			finishers.finisherInfo.gameVersion = shortenGameVersion(c.gameVersion);
			document.getElementById('finishers-entry__game-version').innerText =
				finishers.finisherInfo.gameVersion;

			finishers.finisherInfo.finalMissionName = sc.finalMissionTitle;
			document.getElementById('finishers-entry__final-mission').innerText =
				finishers.finisherInfo.finalMissionName;

			finishers.finisherInfo.finisherStars = c.finisherStars;
			document.getElementById(
				'finishers-entry__stars'
			).innerHTML = `<span>${'★'.repeat(
				finishers.finisherInfo.finisherStars
			)}</span>`;

			finisherNicknameInputEl.select();
		}
	},
	postFinisherInfo(event) {
		const functionSignature = 'finishers.js@postFinisherInfo()';
		console.log(functionSignature);

		event.preventDefault();

		// eslint-disable-next-line no-undef
		// const spToken = process.env.SUBLIGHT_PATROL_TOKEN;

		console.log(functionSignature, {
			finisherInfo: finishers.finisherInfo,
		});
	},
};

export default finishers;
