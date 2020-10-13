const r = {
	characters: {
		player: {
			firstName: 'Pia',
			lastName: 'Rivero',
			title: 'Ensign'
		},
		purslane: {
			firstName: 'Purslane',
			lastName: 'Shepherd',
			title: 'Commander'
		},
		wells: {
			firstName: 'Geoffrey',
			lastName: 'Wells',
			title: 'Lieutenant'
		},
		cadence: {
			firstName: 'Cadence',
			lastName: 'Covox',
			title: 'Dr.'
		},
	},
	slipstreamJump: [
		{ type: 'animation', id: 'player', duration: '1s', do: 'extendHarness' },
		{ type: 'animation', id: 'player', duration: '2s', do: 'spoolUpSlipstreamDrive' },
		{ type: 'animation', id: 'player', duration: '8s', do: 'slipstreamTravel'},
		{ type: 'animation', id: 'player', duration: '1s', do: 'spoolDownSlipstreamDrive' },
		{ type: 'animation', id: 'player', duration: '0.5s', do: 'retractHarness' }
	]
}

export default r;