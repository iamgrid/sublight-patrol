import { v4 as uuidv4 } from 'uuid';

const idCreator = {
	// Adapter Pattern
	create() {
		return uuidv4();
	},
};

export default idCreator;
