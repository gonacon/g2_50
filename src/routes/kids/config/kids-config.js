//import Core from '../../../supporters/core';
//import StbInterface from 'Supporters/stbInterface';
//import { STB_PROP, CHILDREN_LIMIT_TYPE } from 'Config/constants';
//import appConfig from 'Config/app-config';

const kidsConfigs = {
    // [2018.06.07 일자로 IS_RUNDEVICE_MODE 데이터 삭제하겠습니다.]
    // IS_RUNDEVICE_MODE : true,                                                   // 실제 DEVICE 에서 테스트시 : true, LOCAL OFFLINE 에서 테스트시 : false

    IS_SUCCESS_CERT : 'KIDS_IS_SUCCESS_CERT',

    /**
     * 키즈 GNB 코드
     */
    KIDS_MENU_CODE: {
        MONTHLY: '10',
        GENRE: '20',
        CHARACTER: '30',
        LEARNING: '40',
        CHANNEL: '50',
        HABIT: '60',
        FAIRYTALE: '70'
    },

    /**
     * 위젯 모드 : 시청제한 모드 타입
     */
    KIDS_WIDGET_SETTING_MODE: {
        TIME: 'TIME',
        CUSTOM_TIME: 'CUSTOM_TIME',
        VOD_COUNT: 'VOD_COUNT',
        BTV: 'BTV'
    },

     /**
     * 위젯 모드 : 알람 모드 타입
     */
    KIDS_WIDGET_ALARM_MODE: {
        ALARM_BEFORE: 'alarmBefore',
        ALARM_AFTER: 'alarmAfter',
        ALARM_AT_TIME: 'alarmAtTime',
        SEE_LIMIT_TIME: 'seeLimitTime'
    },

    /**
     * 위젯 모드 : 알람 종류별 문구 타입
     */
    KIDS_WIDGET_ALARM_KIND_TYPE: {
        KINDERGARTEN: '0',
        MEAL: '1',
        REST: '2',
        SLEEP: '3'
    },

    /**
     * 회전 슬라이드 클론 아이템 개수 지정
     */
    SLIDE_TO: {
        CHARACTER: 3,
        CHANNEL: 0
    },

    /**
     * 블럭유형
     * 공통코드 : BLK_TYP_CD
     */
    BLOCK : {
        MENU_BLOCK_CD : '20',
        CONTENTS_BLOCK_CD : '30',
        EVENT_BLOCK_CD : '70'
    },

    EXPS_RSLU_CD : {
        BANNER_C : '10',
        BANNER_B : '20',
        BANNER_A : '30'
    },

    /**
     * 노출 방식 코드
     * 공통코드 : CNTS_TYP_CD
     */
    EXPS_MTHD : {
        CONTENT_EXPS_CD : '10',
        BLOCK_EXPS_CD : '20'
    },

    /**
     * 포스터 유형 
     * H : 가로, V : 세로
     */
    POSTER_TYPE : {
        H : '10',
        V : '20'
    },

    /**
     * 배너 상세유형 (BNR_DET_TYP_CD)
     * EXTEND: 확장형, FIXED: 고정형, NORMAL:일반형, CHARACTER:캐릭터
     */
    BANNER_DET_TYPE : {
        EXTEND : '10',
        FIXED : '20',
        NORMAL : '30',
        CHARACTER : '40'
    },

    /**
     * 배너 노출 방식코드
     */
    BNR_EXPS_MTHD_CD : {
        TEXT : '10',
        IMAGE : '20'
    },

    /**
     * 캐릭터메뉴 카테고리 코드 (CHRTR_MENU_CAT_CD)
     */
    CHRTR_MENU_CAT_CD : {
        SEASON : '10',
        SONGS : '20',
        MOVIE : '30',
        APP : '40',
        ENTER : '50'
    },

    /**
     * 상영방식코드 - 월정액(KidsMonthlyHome) 에서 사용
     */
    SCN_MTHD_CD : {
        CW_RECMD_MENU : '501',
        CW_HOME_MENU : '502',
        KIDS_CHRTR_SUB : '503',
        HOME_RECENT_VOD : '504'
    },

    /**
     * 호출유형
     * 501:메뉴바로가기, 502:UI App(마이Btv), 503:시놉시스, 504:TV앱, 505:실시간채널(LIVE), 506:가상채널(LIVE)
     */
    CALL_TYPE : {
        BROWSE: '2',
        MENU: '501',
        APP: '502',
        SYNOP: '503',
        TV_APP: '504',
        LIVE_CHANNEL: '505',
        VR_CHANNEL: '506'
    },

    /**
     * CharacterList 팝업 : 캐릭터 정렬순서 / XPG 와 MeTV 간 요청 키값이 달라서 매칭시켜주는 용도로 사용
     * - xpgKey : ME048 - 정렬타입(hiddenchar_sort)
     * - meKey : XPG101 - 정렬타입(order_type)
     */
    CHAR_SORT_TYPE : [
        { 
            xpgKey : '', 
            meKey : 'date',
            name : '최신순'
        },
        { 
            xpgKey : 'chrtr_nm', 
            meKey: 'string',
            name : '가나다순'
        },
        { 
            xpgKey : '03', 
            meKey: 'rank',
            name : '추천순'
        }
    ],

    /**
     * CharacterList/CharacterEdit : 캐릭터 정렬/숨김정보 설정값 조회조건 (ME049 : hiddenchar_type)
     * - ALL : 정렬설정값 + 숨김캐릭터ID 설정값
     * - sort : 정렬설정값
     * - char : 숨김캐릭터ID 설정값
     */
    CHAR_SETTING_TYPE : {
        ALL : 'ALL',
        SORT : 'sort',
        CHAR : 'char'
    },

    /**
     * 키즈 채널 PIP 상태 값
     */
    CHANNEL_PIP_STATUS : {
        PLAY : '0',
        STOP : '1'
    },

    /**
     * 진입할 시놉시스 유형 코드
     * 공통코드 : SYNON_TYP_CD
     * - 0 : 단편 시놉시스
     * - 1 : 시즌 시놉시스
     * - 2 : 게이트웨이 시놉시스
     * - 3 : VOD + 관련상품 시놉시스
     */
    SYNOP_MOVE_MTHD : {
        SHORT_SYNOP: '01',
        SIRES_SYNOP: '02',
        GATEWAY_SYNOP: '03',
        COMMERCE_SYNOP: '04'
    },

    /**
     * 키이름, 값으로 index (= 캐릭터 정렬 index) 조회
     */
    getCharSortIndexByKey : (keyName, value) => {
        const defaultIndex = 0;
        let retIndex = -1;

        if(keyName) {
            if(value) {
                for(let i=0; i<kidsConfigs.CHAR_SORT_TYPE.length; i++) {
                    if(kidsConfigs.CHAR_SORT_TYPE[i][keyName] === value) {
                        retIndex = i;
                        break;
                    }
                }
            } else {
                retIndex = defaultIndex;                // 조건 비교값이 없을경우 radioIndex 를 기본값으로 셋팅
            }
        }
        
        return retIndex;
    },

    /**
	 * Array 의 해당되는 key값에 따라 정렬하기 위한 함수 
	 * ex) sort_seq
	 * @param {*} array 
	 * @param {*} key 
	 */
	sortArrayByKey : (array, key, data_type, sort_by) => {
		let ret;
		if(array) {
			return array.sort(function(a, b) {
				let x = null;
				let y =  null;
				if(data_type.toLowerCase() === 'number') {
					x = Number(a[key]);
					y = Number(b[key]);
				} else if(data_type.toLowerCase() === 'string' || data_type.toLowerCase() === 'boolean') {
					x = a[key];
					y = b[key];
				}
				// 오름차순
				if(sort_by.toLowerCase() === 'asc') {
					ret = ((x < y) ? -1 : ((x > y) ? 1 : 0));
				} else if(sort_by.toLowerCase() === 'desc') {
					ret = ((x < y) ? -1 : ((x > y) ? 1 : 0));
				}
				return ret;
			});
		}
	},

    /**
     * 시청제한 설정되어 있을경우만 보여줄때 사용
     * p.143 : 시청제한 되지 않을않았을경우 키즈홈에서만 위젯보임
     */
    // showKidsWidgetBySettings : () => {
	// 	let limitType = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_TYPE);
    //     limitType = limitType !== undefined && limitType !== null ? limitType : CHILDREN_LIMIT_TYPE.BTV;
        
	// 	if(limitType !== CHILDREN_LIMIT_TYPE.BTV) {
	// 		Core.inst().showKidsWidget();
	// 	} else {
	// 		Core.inst().hideKidsWidget();
    //     }
    // }
}

export { kidsConfigs };