const sPHOF = {
	init: function () {
		const functionSignature = 'hall-of-finishers.js@init()';
		console.log(functionSignature);

		document
			.querySelectorAll('.finishers-entry__finished-at')
			.forEach((domElement) => {
				// console.log(functionSignature, domElement.textContent);

				const finishedAtDateObj = new Date(domElement.textContent);

				if (!isNaN(finishedAtDateObj)) {
					// displayDateTime format: "August 29, 2025 3:16 PM"
					const options = {
						hour12: true,
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit',
					};
					const displayDateTime = finishedAtDateObj.toLocaleString(
						'en-US',
						options
					);
					domElement.textContent = displayDateTime;

					domElement.title = `The date and time shown are in your local timezone.\n(The same timestamp converts to UTC as '${finishedAtDateObj.toUTCString()}'.)`;
				} else {
					console.warn(
						functionSignature,
						'Could not process the following date:',
						domElement.textContent
					);
				}
			});
	},
};

document.addEventListener('DOMContentLoaded', sPHOF.init);
