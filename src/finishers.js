import c from './utils/constants';
import sc from './story/storyConstants';
import {
	makeName,
	shortenDisplayUrl,
	shortenGameVersion,
	showConfirmationDialog,
	showContinueDialog,
} from './utils/helpers';
import controlSchemes from './controlSchemes';

const nickRegex = new RegExp(/^[a-zA-Z0-9 .\-_'()]+$/);
const locationRegex = new RegExp(/^[a-zA-Z0-9 .\-_'(),]+$/);
const urlRegex = new RegExp(
	/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
);

const finishers = {
	handlers: { state: null }, // gets its values in App.js
	formInputsAreValid: false,
	defaultNickname: 'Anonymous',
	finisherInfo: {
		playerNickname: 'Anonymous',
		playerLocation: '',
		playerUrl: '',
		playerFinishedAtDateTime: '',
		playerFinalFighter: '',
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
			.getElementById('game__finishers__finisher-location')
			.addEventListener('input', () => {
				finishers.updatePreview();
			});
		document
			.getElementById('game__finishers__finisher-url')
			.addEventListener('input', () => {
				finishers.updatePreview();
			});

		document.getElementById(
			'game__dialog--finisher-form__try-again-button'
		).onclick = () => {
			finishers.closeDialog();

			document.getElementById('game__finishers__finisher-nickname').select();
		};

		document.getElementById(
			'game__dialog--finisher-form__exit-button'
		).onclick = () => {
			finishers.closeDialog();

			finishers.hide();
		};
	},
	updatePreview(firstRun = false) {
		const functionSignature = 'finishers.js@updatePreview()';
		// console.log(functionSignature);

		let nicknameIsValid = true;
		let locationIsValid = true;
		let urlIsValid = true;

		const finisherNicknameInputEl = document.getElementById(
			'game__finishers__finisher-nickname'
		);

		let updatedNickname = finisherNicknameInputEl.value;
		if (updatedNickname.length < 2) {
			updatedNickname = finishers.defaultNickname;
		} else {
			nicknameIsValid = nickRegex.test(updatedNickname);
			if (!nicknameIsValid) {
				updatedNickname = finishers.defaultNickname;
			}
		}
		finishers.finisherInfo.playerNickname = updatedNickname;
		document.getElementById('finishers-entry__nickname').innerText =
			finishers.finisherInfo.playerNickname;

		let updatedFinisherLocation = document.getElementById(
			'game__finishers__finisher-location'
		).value;

		const notProvidedStr = '-';

		if (updatedFinisherLocation.length < 2) {
			updatedFinisherLocation = notProvidedStr;
		} else {
			locationIsValid = locationRegex.test(updatedFinisherLocation);
			if (!locationIsValid) {
				updatedFinisherLocation = notProvidedStr;
			}
		}
		finishers.finisherInfo.playerLocation = updatedFinisherLocation;

		const updatedUrl = document.getElementById(
			'game__finishers__finisher-url'
		).value;
		finishers.finisherInfo.playerUrl = updatedUrl;
		let displayUrl = updatedUrl;

		if (
			finishers.finisherInfo.playerUrl.length === 0 ||
			finishers.finisherInfo.playerUrl === 'https://'
		) {
			displayUrl = notProvidedStr;
		} else {
			urlIsValid = urlRegex.test(finishers.finisherInfo.playerUrl);
			if (urlIsValid) {
				displayUrl = `<a href="${
					finishers.finisherInfo.playerUrl
				}" target="_blank">${shortenDisplayUrl(
					finishers.finisherInfo.playerUrl,
					30
				)}</a>`;
			} else {
				displayUrl = notProvidedStr;
			}
		}

		document.getElementById(
			'finishers-entry__finisher-details'
		).innerHTML = `Location: <span>${finishers.finisherInfo.playerLocation}</span> &nbsp;&middot;&nbsp; Url: <span>${displayUrl}</span>`;

		if (nicknameIsValid) {
			finisherNicknameInputEl.classList.remove('input--invalid');
			document
				.getElementById('game__finishers__finisher-nickname-validation')
				.classList.add('validation-bubble--hidden');
		} else {
			finisherNicknameInputEl.classList.add('input--invalid');
			document
				.getElementById('game__finishers__finisher-nickname-validation')
				.classList.remove('validation-bubble--hidden');
		}

		if (locationIsValid) {
			document
				.getElementById('game__finishers__finisher-location')
				.classList.remove('input--invalid');
			document
				.getElementById('game__finishers__finisher-location-validation')
				.classList.add('validation-bubble--hidden');
		} else {
			document
				.getElementById('game__finishers__finisher-location')
				.classList.add('input--invalid');
			document
				.getElementById('game__finishers__finisher-location-validation')
				.classList.remove('validation-bubble--hidden');
		}

		if (urlIsValid) {
			document
				.getElementById('game__finishers__finisher-url')
				.classList.remove('input--invalid');
			document
				.getElementById('game__finishers__finisher-url-validation')
				.classList.add('validation-bubble--hidden');
		} else {
			document
				.getElementById('game__finishers__finisher-url')
				.classList.add('input--invalid');
			document
				.getElementById('game__finishers__finisher-url-validation')
				.classList.remove('validation-bubble--hidden');
		}

		let formIsValid = false;
		if (nicknameIsValid && locationIsValid && urlIsValid) {
			formIsValid = true;
		}

		finishers.formInputsAreValid = formIsValid;

		// console.log(functionSignature, {
		// 	nicknameIsValid,
		// 	locationIsValid,
		// 	urlIsValid,
		// 	formIsValid,
		// });

		if (formIsValid) {
			document
				.getElementById('game__finishers__submit-button')
				.removeAttribute('disabled');
		} else {
			document
				.getElementById('game__finishers__submit-button')
				.setAttribute('disabled', 'disabled');
		}

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

			finishers.finisherInfo.playerFinalFighter =
				currentState.game.playerShips.current;
			document.getElementById('finishers-entry__final-fighter').innerText =
				makeName(finishers.finisherInfo.playerFinalFighter);

			finishers.finisherInfo.playerHangarContents =
				currentState.game.playerShips.hangarContents.join(', ');
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
		}
	},
	postFinisherInfo(event) {
		const functionSignature = 'finishers.js@postFinisherInfo()';
		console.log(functionSignature);
		event.preventDefault();

		if (finishers.finisherInfo.playerNickname === finishers.defaultNickname) {
			showConfirmationDialog(
				`Are you sure you'd like to be listed as "${finishers.defaultNickname}"?`,
				() => {
					finishers.postFinisherInfoProper(event);
				}
			);
		} else {
			finishers.postFinisherInfoProper();
		}
	},
	async postFinisherInfoProper() {
		const functionSignature = 'finishers.js@postFinisherInfo()';
		console.log(functionSignature);

		if (finishers.finisherInfo.playerUrl === 'https://') {
			finishers.finisherInfo.playerUrl = '-';
		}

		console.log(functionSignature, {
			finisherInfo: finishers.finisherInfo,
		});

		if (!finishers.formInputsAreValid) {
			console.warn(
				functionSignature,
				'Form inputs are not valid, returning early...'
			);
			return;
		}

		// store user inputs in localStorage for next time
		localStorage.setItem(
			'sp-finisher-nickname',
			finishers.finisherInfo.playerNickname
		);
		localStorage.setItem(
			'sp-finisher-location',
			finishers.finisherInfo.playerLocation
		);
		localStorage.setItem('sp-finisher-url', finishers.finisherInfo.playerUrl);

		let formSubmissionSuccessful = false;
		let displayMessage = '';

		const internalErrorMessage =
			'Submitting your form inputs failed with an internal error. I apologize for the inconvenience!';

		// eslint-disable-next-line no-undef
		const spToken = process.env.SUBLIGHT_PATROL_TOKEN;

		if (!spToken || spToken.length === 0) {
			console.error(functionSignature, 'No SP token found, returning early...');
			displayMessage = internalErrorMessage;
			formSubmissionSuccessful = false;
		} else {
			const postData = {
				...finishers.finisherInfo,
			};

			let resultData = null;

			try {
				const result = await fetch(
					`${c.rootUrl}/hall-of-finishers/endpoint.php`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-SP-Token': spToken,
						},
						body: JSON.stringify(postData),
					}
				);

				resultData = await result.json();

				console.log(functionSignature, { resultData });
			} catch (error) {
				console.error(functionSignature, 'fetch failed with error:', { error });
				displayMessage = internalErrorMessage;
				formSubmissionSuccessful = false;
			}

			if (resultData !== null) {
				if (resultData.success) {
					displayMessage =
						'Thank you! Your form inputs have been submitted successfully.';
					formSubmissionSuccessful = true;
				} else {
					let messageFromServer = '[no message was provided]';
					if (resultData.message && resultData.message.length > 0) {
						messageFromServer = resultData.message;
					}
					displayMessage = `Submitting your form inputs failed with the following error from the server:<br/>${messageFromServer}`;
					formSubmissionSuccessful = false;
				}
			} else {
				console.error(functionSignature, 'resultData is null');
				displayMessage = internalErrorMessage;
				formSubmissionSuccessful = false;
			}
		}

		console.log(functionSignature, {
			formSubmissionSuccessful,
			displayMessage,
		});

		if (!formSubmissionSuccessful) {
			document.getElementById(
				'game__dialog--finisher-form__message'
			).innerHTML = displayMessage;
			document.getElementById('game__dialog--finisher-form').showModal();
		} else {
			showContinueDialog(
				'Thank you! Your new plaque is now up in the <a href="/sublight-patrol/hall-of-finishers/" target="_blank">Hall of Finishers</a>! ;)',
				'green',
				() => {
					finishers.hide();
				}
			);
		}
	},
	show() {
		const storedNickname = localStorage.getItem('sp-finisher-nickname');
		if (storedNickname && storedNickname.length >= 2) {
			document.getElementById('game__finishers__finisher-nickname').value =
				storedNickname;
		}
		const storedLocation = localStorage.getItem('sp-finisher-location');
		if (storedLocation && storedLocation.length >= 2) {
			document.getElementById('game__finishers__finisher-location').value =
				storedLocation;
		}
		const storedUrl = localStorage.getItem('sp-finisher-url');
		if (storedUrl && storedUrl.length >= 2) {
			document.getElementById('game__finishers__finisher-url').value =
				storedUrl;
		}

		finishers.updatePreview(true);
		document.getElementById('game__finishers').style.display = 'flex';

		controlSchemes.suspendCurrentLayout();

		document.getElementById('game__finishers__finisher-nickname').select();
	},
	hide() {
		document.getElementById('game__finishers').style.display = 'none';

		controlSchemes.restoreSuspendedLayout();
	},
	closeDialog() {
		document.getElementById('game__dialog--finisher-form').close();
	},
};

export default finishers;
