import r from '../recurring';

const chapter001 = {
	chapterName: 'Chapter 1',
	chapterTitle: 'Ensign Pia Rivero',
	playerShip: 'Valkyrie',
	scenes: [
		{
			sceneType: 'cutscene',
			spawn: [{
				entityType: 'valkyrie',
					props: {
						id: 'player',
						playerRelation: 'self',
						posX: 50,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
					}
				
			}],
			events: [ ...r.slipstreamJump ]
		},
		{
			sceneType: 'cutscene',
			spawn: [],
			events: [
				{ type: 'spawn', entityType: 'valkyrie',
					props: {
						id: 'commander_shepherd',
						playerRelation: 'friendly',
						posX: 800,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
					}
				},
				{ type: 'dialog', speaker: r.characters.shepherd, 
					say: 'Hello Ensign!' 
				},
				{ type: 'dialog', speaker: r.characters.player, 
					say: 'Good day Commander Shepherd!' 
				},
				{ type: 'dialog', speaker: r.characters.shepherd, 
					say: 'More dialog...'
				},
				{ type: 'dialog', speaker: r.characters.player, 
					say: 'Even more dialog...' 
				},
				{ type: 'animation', id: 'commander_shepherd', duration: '1s', do: 'move' },
				{ type: 'despawn', id: 'commander_shepherd' }
			]
		},
		{
			sceneType: 'gameplay',
			objectives: [
				{ type: 'scan', target: 'container_1' },
				{ type: 'scan', target: 'container_2' },
				{ type: 'scan', target: 'container_3' },
			],
			spawn: [
				{
					entityType: 'container',
					props: { id: 'container_1', cargo: 'Empty', posX: 800, posY: 275 }
				},
				{
					entityType: 'container',
					props: { id: 'container_2', cargo: 'Medical Supplies', posX: 700, posY: 225 }
				},
				{
					entityType: 'container',
					props: { id: 'container_3', cargo: 'Farming Equipment', posX: 800, posY: 175 }
				}
			],
		}
	]
}

export default chapter001;