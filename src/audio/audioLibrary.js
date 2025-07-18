const audioLibrary = {
	// prettier-ignore
	manifest: {
		music: {
			'sublight_patrol_theme': 'i_am_grid_-_sublight-patrol-theme-2025-3a.mp3'
		},
		soundEffects: {
			'laser_type1_1': 'laser_type1_1.mp3',
			'laser_type1_2': 'laser_type1_2.mp3',
			'laser_type1_3': 'laser_type1_3.mp3',
			'laser_type1_4': 'laser_type1_4.mp3',
			'laser_type2_1': 'laser_type2_1.mp3',
			'laser_type2_2': 'laser_type2_2.mp3',
			'laser_type2_3': 'laser_type2_3.mp3',
			'laser_type2_4': 'laser_type2_4.mp3',
			'shield_damage_1': 'shield_damage_1.mp3',
			'shield_damage_2': 'shield_damage_2.mp3',
			'shield_damage_3': 'shield_damage_3.mp3',
			'shield_damage_4': 'shield_damage_4.mp3',
			'hull_damage_high_health_1': 'hull_damage_high_health_1.mp3',
			'hull_damage_high_health_2': 'hull_damage_high_health_2.mp3',
			'hull_damage_high_health_3': 'hull_damage_high_health_3.mp3',
			'hull_damage_high_health_4': 'hull_damage_high_health_4.mp3',
			'hull_damage_low_health_1': 'hull_damage_low_health_1.mp3',
			'hull_damage_low_health_2': 'hull_damage_low_health_2.mp3',
			'hull_damage_low_health_3': 'hull_damage_low_health_3.mp3',
			'hull_damage_sys_dropout_1': 'hull_damage_sys_dropout_1.mp3',
			'hull_damage_sys_dropout_2': 'hull_damage_sys_dropout_2.mp3',
			'emp_sys_dropout': 'emp_sys_dropout.mp3',
			'misc_damage_1': 'misc_damage_1.mp3',
			'misc_damage_2': 'misc_damage_2.mp3',
			'misc_damage_3': 'misc_damage_3.mp3',
			'ship_explosion_1': 'ship_explosion_1.mp3',
			'ship_explosion_2': 'ship_explosion_2.mp3',
			'ship_explosion_3': 'ship_explosion_3.mp3',
			'ship_explosion_4': 'ship_explosion_4.mp3',
			'ship_explosion_5': 'ship_explosion_5.mp3',
			'misc_explosion_1': 'misc_explosion_1.mp3',
			'misc_explosion_2': 'misc_explosion_2.mp3',
			'misc_explosion_3': 'misc_explosion_3.mp3',
			'entity_disabled': 'entity_disabled.mp3',
			'emp': 'emp.mp3',
			'main_thruster': 'main_thruster.mp3',
			'side_thruster': 'side_thruster.mp3',
			'menu_cycle_1': 'menu_cycle_1.mp3',
			'menu_cycle_2': 'menu_cycle_2.mp3',
			'menu_activate_1': 'menu_activate_1.mp3',
			'menu_activate_2': 'menu_activate_2.mp3',
		}
	},
	// prettier-ignore
	library: {
		music: {
			sublight_patrol_theme: { id: 'sublight_patrol_theme' }
		},
		soundEffects: {
			laser_type1: { id: 'laser_type1', variants: 4 },
			laser_type2: { id: 'laser_type2', variants: 4 },
			shield_damage: { id: 'shield_damage', variants: 4 },
			hull_damage_high_health: { id: 'hull_damage_high_health', variants: 4 },
			hull_damage_low_health: { id: 'hull_damage_low_health', variants: 3 },
			misc_damage: { id: 'misc_damage', variants: 3 },
			hull_damage_sys_dropout: { id: 'hull_damage_sys_dropout', variants: 2 },
			emp_sys_dropout: { id: 'emp_sys_dropout', variants: 1 },
			ship_explosion: { id: 'ship_explosion', variants: 5 },
			misc_explosion: { id: 'misc_explosion', variants: 3 },
			entity_disabled: { id: 'entity_disabled', variants: 1 },
			emp: { id: 'emp', variants: 1 },
			main_thruster: { id: 'main_thruster', variants: 1 },
			side_thruster: { id: 'side_thruster', variants: 1 },
			menu_cycle: { id: 'menu_cycle', variants: 2 },
			menu_activate: { id: 'menu_activate', variants: 2 },
		}
	},
};

export default audioLibrary;
