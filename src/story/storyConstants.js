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
		},
		disabled: {
			id: 'disabled',
			desc: 'must be disabled',
			completed_desc: 'was disabled',
		},
		forcedToFlee: {
			id: 'forcedToFlee',
			desc: 'must be forced to flee',
			completed_desc: 'was forced to flee',
		},
		destroyed: {
			id: 'destroyed',
			desc: 'must be destroyed',
			completed_desc: 'was destroyed',
		},
		mustHaveSurvived: {
			id: 'mustHaveSurvived',
			desc: 'must have survived until other objectives completed',
			completed_desc: 'has survived until other objectives completed',
		},
		mustHaveArrived: {
			id: 'mustHaveArrived',
			desc: 'must have arrived',
			completed_desc: 'has arrived',
		},
	},
};

export default sc;
