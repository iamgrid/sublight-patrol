import Fenrir from './ships/Fenrir';
import Valkyrie from './ships/Valkyrie';
import ZangariFighterType1 from './ships/ZangariFighterType1';
import ZangariFighterType2 from './ships/ZangariFighterType2';
import ZangariFighterType3 from './ships/ZangariFighterType3';
import ZangariFighterType4 from './ships/ZangariFighterType4';
import GContainer from './other/GContainer';
import Buoy from './other/Buoy';

// prettier-ignore
const models = {
	'/ships/Fenrir': Fenrir,
	'/ships/Valkyrie': Valkyrie,
	'/ships/ZangariFighterType1': ZangariFighterType1,
	'/ships/ZangariFighterType2': ZangariFighterType2,
	'/ships/ZangariFighterType3': ZangariFighterType3,
	'/ships/ZangariFighterType4': ZangariFighterType4,
	'/other/GContainer': GContainer,
	'/other/Buoy': Buoy,
};

export default models;
