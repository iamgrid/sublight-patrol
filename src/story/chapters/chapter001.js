import r from '../recurring';

const chapter001 = {
	chapterName: 'Chapter 1',
	chapterTitle: 'Ensign Pia Rivero',
	scenes: [
		{
			sceneType: 'cutscene',
			spawn: [
				{
					entityType: 'valkyrie',
					props: {
						id: 'player',
						playerRelation: 'self',
						posX: 50,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
					},
				},
			],
			events: [...r.slipstreamJump],
		},
		{
			sceneType: 'cutscene',
			spawn: [],
			events: [
				{
					type: 'spawn',
					entityType: 'valkyrie',
					props: {
						id: 'commander_shepherd',
						playerRelation: 'friendly',
						posX: 800,
						posY: 225,
						latVelocity: 0,
						longVelocity: 0,
					},
				},
				{
					type: 'dialog',
					speaker: r.characters.shepherd,
					say:
						'Good morning Ensign Rivero. Thank you for helping out with our little shakedown event.',
				},
				{
					type: 'dialog',
					speaker: r.characters.player,
					say: 'Good morning Commander Shepherd, happy to be here!',
				},
				{
					type: 'dialog',
					speaker: r.characters.shepherd,
					say:
						"Since our time together is coming to a close, I'd like to tell you on behalf of the team that we really loved having you with us, getting clear-eyed feedback on the Valkyrie's control scheme and calibration from a fresh graduate's perspective turned out to be a huge help.",
				},
				{
					type: 'dialog',
					speaker: r.characters.shepherd,
					say:
						"I know you're itching to get out there, but as I've said before, please remember that you'll always have a place at the SDD*. You just let me know when you've had your fill of frontline life ok?",
					footnote: 'Starfighter Development Directorate',
				},
				{
					type: 'dialog',
					speaker: r.characters.player,
					say:
						"Thank you for the opportunity commander. I'll keep your offer in mind I promise.",
				},
				{
					type: 'dialog',
					speaker: r.characters.shepherd,
					say: "Alright Pia, let's get to it, steady as she goes.",
				},
				{
					type: 'animation',
					id: 'commander_shepherd',
					duration: '1s',
					do: 'move',
				},
				{ type: 'despawn', id: 'commander_shepherd' },
			],
		},
		{
			sceneType: 'gameplay',
			objectives: [
				{ type: 'inspect', target: 'container_alpha_1' },
				{ type: 'inspect', target: 'container_alpha_2' },
				{ type: 'inspect', target: 'container_alpha_3' },
			],
			spawn: [
				{
					entityType: 'container',
					props: {
						id: 'container_alpha_1',
						cargo: 'Empty',
						posX: 800,
						posY: 275,
					},
				},
				{
					entityType: 'container',
					props: {
						id: 'container_alpha_2',
						cargo: 'Medical Supplies',
						posX: 700,
						posY: 225,
					},
				},
				{
					entityType: 'container',
					props: {
						id: 'container_alpha_3',
						cargo: 'Farming Equipment',
						posX: 800,
						posY: 175,
					},
				},
			],
		},
	],
};

export default chapter001;
