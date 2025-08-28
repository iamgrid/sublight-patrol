const finishers = {
	init() {
		const functionSignature = 'finishers.js@init()';
		console.log(functionSignature);

		document
			.getElementById('game__finishers__form')
			.addEventListener('submit', (event) => {
				finishers.postFinisherInfo(event);
			});
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

		console.log(functionSignature, finisherInfo);
	},
};

export default finishers;
