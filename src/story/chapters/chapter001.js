import r from '../recurring';

const chapter001 = {
	chapterName: 'Chapter 1',
	chapterTitle: 'Ensign Pia Rivero',
	playerShip: 'Valkyrie',
	scenes: [
		{
			sceneType: 'cutscene',
			entities: [],
			events: [ ...r.slipstreamJump ]
		},
		{
			sceneType: 'cutscene',
			entities: [
				{
					entityType: 'valkyrie',
					props: {
						posX: 800,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
						playerRelation: 'friendly',
						id: 'commander_shepherd'
					}
				}
			],
			events: [
				{ type: 'dialog', speaker: r.characters.purslane , say: 'Hello Ensign!' },
				{ type: 'dialog', speaker: r.characters.player, say: 'Good day Commander Shepherd!' },
				{ type: 'dialog', speaker: r.characters.purslane, say: 'More dialog...'},
				{ type: 'dialog', speaker: r.characters.player, say: 'Even more dialog...' },
			]
		},
		{
			sceneType: 'gameplay',
			goals: [
				{ type: 'scan', target: 'container_1' },
				{ type: 'scan', target: 'container_2' },
				{ type: 'scan', target: 'container_3' },
			],
			entities: [
				{
					entityType: 'container',
					props: { id: 'container_1',	cargo: 'Empty',	posX: 800, posY: 275 }
				},
				{
					entityType: 'container',
					props: { id: 'container_2',	cargo: 'Medical Supplies', posX: 700, posY: 225 }
				},
				{
					entityType: 'container',
					props: { id: 'container_3',	cargo: 'Farming Equipment', posX: 800, posY: 175 }
				}
			],
		}
	]
}

export default chapter001;