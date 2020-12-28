const sc = {
	characters: {
		player: {
			firstName: 'Marshal',
			lastName: 'Norin',
			title: '',
		},
	},
	objectiveTypes: {
		inspected: {
			id: 'inspected',
			desc: 'must be inspected',
			completed_desc: 'was inspected',
			meansFailureIfObjectiveWas: [],
		},
		disabled: {
			id: 'disabled',
			desc: 'must be disabled',
			completed_desc: 'was disabled',
			meansFailureIfObjectiveWas: [],
		},
		forcedToFlee: {
			id: 'forcedToFlee',
			desc: 'must be forced to flee',
			completed_desc: 'was forced to flee',
			meansFailureIfObjectiveWas: ['disabled', 'mustHaveArrived'],
		},
		destroyed: {
			id: 'destroyed',
			desc: 'must be destroyed',
			completed_desc: 'was destroyed',
			meansFailureIfObjectiveWas: [
				'disabled',
				'forcedToFlee',
				'mustHaveSurvived',
				'mustHaveArrived',
			],
		},
		mustHaveSurvived: {
			id: 'mustHaveSurvived',
			desc: 'must have survived until other objectives completed',
			completed_desc: 'has survived until other objectives completed',
			meansFailureIfObjectiveWas: [],
		},
		mustHaveArrived: {
			id: 'mustHaveArrived',
			desc: 'must have arrived',
			completed_desc: 'has arrived',
			meansFailureIfObjectiveWas: [],
		},
	},
};

export default sc;
