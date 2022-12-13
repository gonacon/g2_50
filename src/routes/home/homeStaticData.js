import appConfig from "../../config/app-config";

export default {
	'U5_01': {
		htmlClass: 'myBtvMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000200_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000200_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000200_foc.png'
		}
	},
	'U5_02': {
		htmlClass: 'monthlyMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000100_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000100_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000100_foc.png'
		}
	},
	'U5_03': {
		htmlClass: 'homeMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000300_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000300_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000300_foc.png'
		}
	},
	'U5_04': {
		htmlClass: 'movieMenu',
		imgs: {
			// normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000400_def.png',
			// select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000400_sel.png',
			// focus: appConfig.headEnd.LOCAL_UPDATE_URL 	+ '/gnbmenu_NM1000000400_foc.png'
			// normal: '',
			// select: '',
			// focus: ''
		}
	},
	'U5_05': {
		htmlClass: 'tvMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000500_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000500_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000500_foc.png'
		}
	},
	'U5_06': {
		htmlClass: 'aniMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000600_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000600_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000600_foc.png'
		}
	},
	'U5_07': {
		htmlClass: 'kidMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000700_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000700_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000700_foc.png'
		}
	},
	'U5_08': {
		htmlClass: 'docuMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000800_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000800_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000800_foc.png'
		}
	},
	'U5_09': {
		htmlClass: 'tvAppMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000900_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000900_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000000900_foc.png'
		}
	},
	'U5_10': {
		htmlClass: 'seniorMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000001700_def.png',
			select: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000001700_sel.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_NM1000001700_foc.png'
		}
	},
	'U5_11': {
		htmlClass: 'searchMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_search_def.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_search_foc.png',
		},
		gnbTypeCode: 'SEARCH'
	},
	'VIEW_ALL': {	//VIEW_ALL 로 변경 예정
		htmlClass: 'allMenu',
		imgs: {
			normal: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_all_def.png',
			focus: appConfig.headEnd.LOCAL_UPDATE_URL + '/gnbmenu_all_foc.png',

		},
		gnbTypeCode: 'VIEW_ALL'
	}
};