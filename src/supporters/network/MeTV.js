import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

// var MeTV = MeTV || {};

const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.MeTV.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.MeTV.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'MeTV',
        addition: '',
        gw: true,
    };

    function getInfo(apiName, method) {
        var info = serverInfo;
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }
        /*
        if ('/bookmark/bookmark/del' === apiName
            || apiName === '/watch/season/del') {
            info.addition = 'delete';
        }
        */
        if (apiName.endsWith('/del')) {
          info.addition = 'delete';
        }
        // if ('/purchase/nscreen' === apiName) {
        //     info.port = '8443';
        // } else {
        //     info.port = '8080';
        // }

        info.type = method;
        info.apiName = apiName;
        return info;
    }

    MeTV.reset = function () {
        serverInfo = appConfig.headEnd.MeTV.Live;
        
        MeTV.ME011 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark', TYPE_GET));
        MeTV.ME012 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark/add', TYPE_POST));
        MeTV.ME013 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark/del', TYPE_POST));
        MeTV.ME021 = new COMMON.network(getInfo(serverInfo.path + '/watch/season', TYPE_GET));
        MeTV.ME022 = new COMMON.network(getInfo(serverInfo.path + '/watch/season/del', TYPE_POST));
        MeTV.ME023 = new COMMON.network(getInfo(serverInfo.path + '/watch/lastseries', TYPE_GET));
        MeTV.ME024 = new COMMON.network(getInfo(serverInfo.path + '/watch/lastplaytime', TYPE_GET));
        MeTV.ME025 = new COMMON.network(getInfo(serverInfo.path + '/watch/characterlast', TYPE_GET));             // 키즈존 : 캐릭터별 마지막 시청정보 조회
        MeTV.ME031 = new COMMON.network(getInfo(serverInfo.path + '/purchase/general', TYPE_GET));                // 구매내역 : 일반VOD
        MeTV.ME032 = new COMMON.network(getInfo(serverInfo.path + '/purchase/unlimited', TYPE_GET));              // 구매내역 : 365/소장용
        MeTV.ME033 = new COMMON.network(getInfo(serverInfo.path + '/purchase/fixedcharge', TYPE_GET));            // 구매내역 : 월정액
        MeTV.ME034 = new COMMON.network(getInfo(serverInfo.path + '/purchase/nscreen', TYPE_POST));               // 구매내역 : OKSUSU
        MeTV.ME035 = new COMMON.network(getInfo(serverInfo.path + '/purchase/possession', TYPE_GET));             // 나의 소장용 VOD
        MeTV.ME036 = new COMMON.network(getInfo(serverInfo.path + '/setting/fixedchargelist', TYPE_GET));	        // 월정액 메뉴 리스트
        MeTV.ME044 = new COMMON.network(getInfo(serverInfo.path + '/setting/childsafety', TYPE_GET));
        MeTV.ME046 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonesetting', TYPE_GET));
        MeTV.ME048 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonehiddenchar', TYPE_GET));          // 키즈존 숨김캐릭터, 정렬조건 조회
        MeTV.ME049 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonehiddenchar/add', TYPE_POST));     // 키즈존 숨김캐릭터, 정렬조건 등록
        MeTV.ME061 = new COMMON.network(getInfo(serverInfo.path + '/datamart/directview', TYPE_POST));
        MeTV.ME062 = new COMMON.network(getInfo(serverInfo.path + '/datamart/directviewgateway', TYPE_POST));
    };

    /**
     * MeTV 즐겨찾기
     * **/
    MeTV.ME011 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark', TYPE_GET));
    MeTV.ME012 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark/add', TYPE_POST));
    MeTV.ME013 = new COMMON.network(getInfo(serverInfo.path + '/bookmark/bookmark/del', TYPE_POST));
    MeTV.ME021 = new COMMON.network(getInfo(serverInfo.path + '/watch/season', TYPE_GET));
    MeTV.ME022 = new COMMON.network(getInfo(serverInfo.path + '/watch/season/del', TYPE_POST));
    MeTV.ME023 = new COMMON.network(getInfo(serverInfo.path + '/watch/lastseries', TYPE_GET));
    MeTV.ME024 = new COMMON.network(getInfo(serverInfo.path + '/watch/lastplaytime', TYPE_GET));
    MeTV.ME025 = new COMMON.network(getInfo(serverInfo.path + '/watch/characterlast', TYPE_GET));     // 키즈존 : 캐릭터별 마지막 시청정보 조회
    MeTV.ME031 = new COMMON.network(getInfo(serverInfo.path + '/purchase/general', TYPE_GET));
    MeTV.ME032 = new COMMON.network(getInfo(serverInfo.path + '/purchase/unlimited', TYPE_GET));              // 구매내역 : 365/소장용
    MeTV.ME033 = new COMMON.network(getInfo(serverInfo.path + '/purchase/fixedcharge', TYPE_GET));    // 월정액 구매내역 조회
    MeTV.ME034 = new COMMON.network(getInfo(serverInfo.path + '/purchase/nscreen', TYPE_POST));
    MeTV.ME035 = new COMMON.network(getInfo(serverInfo.path + '/purchase/possession', TYPE_GET));
    MeTV.ME036 = new COMMON.network(getInfo(serverInfo.path + '/setting/fixedchargelist', TYPE_GET));	// 월정액 메뉴 리스트
    MeTV.ME044 = new COMMON.network(getInfo(serverInfo.path + '/setting/childsafety', TYPE_GET));
    MeTV.ME046 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonesetting', TYPE_GET));
    MeTV.ME048 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonehiddenchar', TYPE_GET));          // 키즈존 숨김캐릭터, 정렬조건 조회
    MeTV.ME049 = new COMMON.network(getInfo(serverInfo.path + '/setting/kzonehiddenchar/add', TYPE_POST));     // 키즈존 숨김캐릭터, 정렬조건 등록


    /**
     * MeTV 바로보기
     * **/
    MeTV.ME061 = new COMMON.network(getInfo(serverInfo.path + '/datamart/directview', TYPE_POST));
    MeTV.ME062 = new COMMON.network(getInfo(serverInfo.path + '/datamart/directviewgateway', TYPE_POST));
    // ui_name: appConfig.STBInfo.ui_name,
    // 'stb_id': encodeURIComponent(appConfig.STBInfo.stbId)
    MeTV.getParam = function (IF) {
        var paramInfo = {
            response_format: 'json',
            ver: '5.0',
        };

        // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
        // 'ui_name': paramInfo.ui_name,
        var param = {
            response_format: paramInfo.response_format,
            IF: IF,
            ver: paramInfo.ver,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId)
        };

        if (IF === 'IF-ME-034') {
            param.stb_id = appConfig.STBInfo.stbId;
        }

        return param;
    };

    MeTV.handleResult = function (resolve, reject, result) {
        const { status, data, transactionId } = result;
        if (status === 200) {
            let result = null;
            try {
                result = JSON.parse(data);
            } catch (err) {
                reject({ status: 10000, data, transactionId });
            } finally {
                resolve(result);
            }
        } else {
            reject(status, data, transactionId);
        }
    }

    /**
     * IF-ME-011 즐겨찾기 조회
     * @param {String Object} param 
     * = { group(필수): 즐겨찾기 유형(VOD: VOD 컨텐츠, IPTV: 실시간 채널, VAS: 부가서비스-TV앱)
     *   page_no(선택): 요청할 페이지의 번호 (Default: 1)
     *   entry_no(선택): 요청한 페이지에 보여질 개수 (Default: 10)
     *   yn_block(조건형필수): group이 IPTV인 경우(실시간채널) 필수( N(선호채널), Y(차단채널) 택1
     *   svc_code(조건형필수): 서비스 구분자(svc_code가 KIDSZONE인 경우 필수, Default: BTV)
     *                        서비스 구분형(BTV: Btv서비스, KZONE: KIDSZONE 서비스)
     *  }
     * @param {function} funcCallback
     */
    MeTV.requestME011 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-011');
        paramData.group = param.group;
        paramData.page_no = param.page_no === undefined ? '1' : param.page_no;
        paramData.entry_no = param.entry_no === undefined ? '10' : param.entry_no;
        paramData.hash_id = appConfig.STBInfo.hashId;

        if (param.group === 'IPTV') {
            paramData.ch_type = param.ch_type;
        }

        paramData.svc_code = param.svc_code === undefined ? 'BTV' : param.svc_code;

        MeTV.ME011.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };

    MeTV.request011 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-011');
        paramData.group = param.group;
        paramData.page_no = param.page_no === undefined ? '1' : param.page_no;
        paramData.entry_no = param.entry_no === undefined ? '10' : param.entry_no;
        paramData.hash_id = appConfig.STBInfo.hashId;
        if (param.group === 'IPTV') {
            paramData.ch_type = param.ch_type;
        }

        paramData.svc_code = param.svc_code === undefined ? 'BTV' : param.svc_code;

        MeTV.ME011.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-ME-012 즐겨찾기 등록
     * @param {String Object} param 
     * = { group(필수): 즐겨찾기 유형(VOD: VOD 컨텐츠, IPTV: 실시간 채널, VAS: 부가서비스-TV앱)
     *      sris_id(조건형필수): VOD컨텐츠의 식별자(VOD일때 필수, VAS일때 선택)
     *      epsd_id(선택):
     *      level(조건형필수): 사용자등급(VAS일때 필수)
     *      svc_id(조건형필수): 실시간 채널의 식별자 또는 부가서비스의 ServiceId(IPTV, VOD 필수)
     *      yn_block(조건형필수): group이 IPTV인 경우(실시간채널) 필수( N(선호채널), Y(차단채널) 택1
     *      item_id(조건형 필수): 부가서비스의 식별자(VAS일때 필수)
     *      vas_id(조건형 필수): 부가서비스의 VAS ID(VAS일떄 필수)
     *      call_url(조건형 필수): 부가서비스의 호출할 URL(VAS일떄 필수)
     *      available(조건형 필수): 부가서비스의 available(VAS일때 필수)
     *      priority(조건형 필수): 부가서비스의 priority(VAS일때 필수)
     *      yn_kzone(필수): 등록대상 KZONE 구분자(N: Btv서비스, Y: KIDS ZONE 서비스) 
     * }
     * @param {function} funcCallback
     */
    MeTV.requestME012 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-012');
        paramData.group = param.group;
        paramData.yn_kzone = param.yn_kzone;
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.stb_id = appConfig.STBInfo.stbId;
        // if (param.epsd_id !== undefined) param.epsd_id;

        if (param.group === 'VOD') {
            paramData.sris_id = param.sris_id;
        } else if (param.group === 'IPTV') {
            paramData.svc_id = param.svc_id;
            paramData.ch_type = param.ch_type;
            // paramData.yn_block = param.yn_block;
        } else if (param.group === 'VAS') {
            if (param.sris_id !== undefined) paramData.sris_id = param.sris_id;
            paramData.level = param.level;
            paramData.svc_id = param.svc_id;
            paramData.item_id = param.item_id;
            paramData.vas_id = param.vas_id;
            paramData.call_url = param.call_url;
            paramData.available = param.available;
            paramData.priority = param.priority;
        }

        MeTV.ME012.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    // static request012  (param = {})  {
    //     return new Promise((resolve, reject) =>{

    //     }
    // }
    MeTV.request012 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-012');
        paramData.group = param.group;
        paramData.yn_kzone = param.yn_kzone;
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.stb_id = appConfig.STBInfo.stbId;
        // if (param.epsd_id !== undefined) param.epsd_id;

        if (param.group === 'VOD') {
            paramData.sris_id = param.sris_id;
            paramData.epsd_id = param.epsd_id;
            paramData.epsd_rslu_id = param.epsd_rslu_id;
        } else if (param.group === 'IPTV') {
            paramData.svc_id = param.svc_id;
            paramData.ch_type = param.ch_type;
            // paramData.yn_block = param.yn_block;
        } else if (param.group === 'VAS') {
            if (param.sris_id !== undefined) paramData.sris_id = param.sris_id;
            paramData.level = param.level;
            paramData.svc_id = param.svc_id;
            paramData.item_id = param.item_id;
            paramData.vas_id = param.vas_id;
            paramData.call_url = param.call_url;
            paramData.available = param.available;
            paramData.priority = param.priority;
        }

        paramData.svc_code = param.svc_code === undefined ? 'BTV' : param.svc_code;

        MeTV.ME012.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });
    /**
 * IF-ME-013 즐겨찾기 삭제
 * @param {String Object} param 
 * = { group(필수): 즐겨찾기 유형(VOD: VOD 컨텐츠, IPTV: 실시간 채널, VAS: 부가서비스-TV앱)
 *      isAll_type(필수) : 삭제종류(0 : 단건 또는 복수건 삭제(deleteList는 반드시 설정하여야 함, 1 : 그룹별 전체삭제, 2 : 그룹별 키즈존 전체삭제, 
                                   3 : 선호채널 전체삭제(group 은 반드시 IPTV 이어야 함), 4 : 차단채널 전체삭제(group 은 반드시 IPTV 이어야 함)
                                   5 : 선호채널 키즈존 전체삭제(group 은 반드시 IPTV 이어야 함), 6 : 차단채널 키즈존 전체삭제(group 은 반드시 IPTV 이어야 함))))
 *      deleteList(조건형필수): 단건 또는 복수건 즐겨찾기 삭제할 unique key 집합 (isAll_type = 0 일 때 필수)
                                1. unique key 의미
                                - group=VOD 일 때, sris_id를 의미
                                - group=IPTV 일 때, svc_id를 의미
                                - group=VAS 일 때, item_id를 의미
                                2. 단건 및 복수건 삭제시 unique key 값을 List로 요청
                                3. 조건형 필수
                                - isAll_type > 0 이면, deleteList=null 또는 deleteList=[]로 요청해야함
                                - isAll_type = 0 deleteList 의 항목값 필수(deleteList=null 또는 deleteList=[] 이면 error)
                                ex) [group = IPTV 일때] "deleteList" : ["16", "17"]
 * }
 * @param {function} funcCallback
 */

    MeTV.requestME013 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-013');
        paramData.stb_id = appConfig.STBInfo.stbId;
        paramData.group = param.group;
        paramData.hash_id = appConfig.STBInfo.hashId;

        paramData.isAll_type = param.isAll_type;
        // if (param.isAll_type === 0) {
        paramData.deleteList = param.deleteList;
        // }

        MeTV.ME013.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    MeTV.request013 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-013');
        paramData.group = param.group;
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.stb_id = appConfig.STBInfo.stbId;

        paramData.isAll_type = param.isAll_type;
        // if (param.isAll_type === 0) {
        paramData.deleteList = param.deleteList;
        // }

        MeTV.ME013.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /*

    */
    MeTV.requestME021 = function (param, cb) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-021');

        // ui_name: appConfig.STBInfo.ui_name,
        const defaultParam = {
            sort: 'date', // 'date': 날짜순, 'search': 검색순
            page_no: '1', // 페이지 번호
            entry_no: '10', // 페이지별 갯수
            order: 'desc', // 'asc': 오름차순, 'desc': 내림차순
            yn_ppm: 'N', // 'Y': 월정액, 'N': Btv
            svc_code: 'KZONE', // KZONE: 키즈존, BTV: Btv
            hash_id: appConfig.STBInfo.hashId
        };
        const parameters = Object.assign(commonParam, defaultParam, param);
        // console.log('====================================');
        // console.log(parameters);
        // console.log('====================================');
        MeTV.ME021.request({
            callback: (status, data, transactionId) => {
                cb(status, data, transactionId);
            },
            transactionId,
            param: parameters
        })
    }
    MeTV.request021 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-021');

        const defaultParam = {
            sort: 'date', // 'date': 날짜순, 'search': 검색순
            page_no: '1', // 페이지 번호
            entry_no: '10', // 페이지별 갯수
            order: 'desc', // 'asc': 오름차순, 'desc': 내림차순
            yn_ppm: 'N', // 'Y': 월정액, 'N': Btv
            svc_code: 'BTV', // KZONE: 키즈존, BTV: Btv
            ui_name: appConfig.STBInfo.ui_name,
            hash_id: appConfig.STBInfo.hashId
        };
        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME021.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: parameters
        });
    });

    /**
     * IF-ME-022 최근시청 VOD 목록 삭제
     * @param {String Object} param 
     * @param {function} funcCallback 
     * isAll(선택) : 전체 목록 삭제여부 (default: 'N')
     * deleteList(선택) : 삭제 목록( sris_id 의 리스트 , [ 's1012030123', 's23310234'] )
     */
    MeTV.requestME022 = function (param, cb) {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-022');
        commonParam.stb_id = appConfig.STBInfo.stbId;
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId,
        };
        const { isAll, deleteList } = param;
        let params = {};
        if (isAll) {
            param.isAll = 'Y';
        } else {
            param.isAll = 'N';
            param.deleteList = deleteList;
        }
        const parameters = Object.assign(commonParam, defaultParam, params);

        MeTV.ME022.request({
            callback: (status, data, transactionId) => {
                cb(status, data, transactionId);
            },
            tId,
            param: parameters
        })
    }
    MeTV.request022 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-022');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId,
            stb_id: appConfig.STBInfo.stbId
        };
        const { isAll, deleteList } = param;
        let params = {};
        if (isAll === 'Y') {
            params.isAll = 'Y';
        } else {
            params.isAll = 'N';
            params.deleteList = deleteList;
        }
        const parameters = Object.assign(commonParam, defaultParam, params);

        MeTV.ME022.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * 마지막 시청회차 VOD 조회
     * IF-ME-023
     * @param {*} param = {sris_id}
     */
    MeTV.request023 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-023');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME023.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * VOD 재생정보 조회(이어보기)
     * IF-ME-024
     * @param {*} param = {epsd_id}
     */
    MeTV.request024 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-024');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME024.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });


    /**
     * 캐릭터별 마지막 시청정보 조회
     * IF-ME-025
     * @param {*} param 
     */
    MeTV.request025 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-025');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME025.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * 일반 구매내역 조회
     * IF-ME-031
     * @param {*} param 
     */
    MeTV.request031 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-031');
        const defaultParam = {
            // page_no: '1', // 페이지 번호
            // entry_no: '11', // 페이지별 갯수
            ui_name: appConfig.STBInfo.ui_name,
            hash_id: appConfig.STBInfo.hashId,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId)
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME031.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * 365/소장용 구매내역 조회
     * IF-ME-033
     * @param {*} param 
     */
    MeTV.request032 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-032');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId),
            // stb_id: encodeURIComponent('{A5E1E25F-E1E6-11E5-A490-FDCFBFF8EC17}')
            entry_no: '999'
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME032.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * 월정액 구매내역 조회
     * IF-ME-033
     * @param {*} param 
     */
    MeTV.request033 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-033');
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId),
            // stb_id: encodeURIComponent('{A5E1E25F-E1E6-11E5-A490-FDCFBFF8EC17}')
            entry_no: '999'
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME033.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /**
     * N-screen 구매내역 조회 (Oksusu)
     * IF-ME-034
     * @param {*} param 
     */
    MeTV.request034 = (param = {}) => new Promise((resolve, reject) => {
        var tId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-034');
        console.log('%c appConfig.STBInfo.userId', 'color: red; background: yellow', appConfig.STBInfo.userId);
        const defaultParam = {
            hash_id: appConfig.STBInfo.hashId,
            // muser_num: appConfig.STBInfo.userId,
            muser_num: 'U124515256',
        };

        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME034.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: tId,
            param: parameters
        });
    });

    /*
        IF-ME-035
    */
    MeTV.requestME035 = function (param, cb) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-035');

        const defaultParam = {
            sort: 'date', // 'date': 날짜순, 'search': 검색순
            page_no: '1', // 페이지 번호
            entry_no: '10', // 페이지별 갯수
            order: 'desc', // 'asc': 오름차순, 'desc': 내림차순
            yn_ppm: 'N', // 'Y': 월정액, 'N': Btv
            svc_code: 'BTV', // KZONE: 키즈존, BTV: Btv
            ui_name: appConfig.STBInfo.ui_name,
            hash_id: appConfig.STBInfo.hashId,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId)
        };
        const parameters = Object.assign(commonParam, defaultParam, param);
        MeTV.ME035.request({
            callback: (status, data, transactionId) => {
                cb(status, data, transactionId);
            },
            transactionId,
            param: parameters
        })
    }
    MeTV.request035 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-035');

        const defaultParam = {
            sort: 'date', // 'date': 날짜순, 'search': 검색순
            page_no: '1', // 페이지 번호
            entry_no: '60', // 페이지별 갯수
            order: 'desc', // 'asc': 오름차순, 'desc': 내림차순
            yn_ppm: 'N', // 'Y': 월정액, 'N': Btv
            svc_code: 'BTV', // KZONE: 키즈존, BTV: Btv
            ui_name: appConfig.STBInfo.ui_name,
            hash_id: appConfig.STBInfo.hashId,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId)
        };
        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME035.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: parameters
        });
    });

    /**
     * IF-ME-036 월정액 메뉴 리스트
     * @param {String Object} param 
     * @param {function} funcCallback 
     * page_no(선택) : 페이지번호 (default: 1)
     * entry_no(선택) : 요청한 페이지에 보여질 개수 (default: 10)
     * svc_code(조건형 필수) : KZONE, BTV
     */
    MeTV.requestME036 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-036');

        const defaultParam = {
            ver: '5.0',
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId),
            hash_id: appConfig.STBInfo.hashId,
            entry_no: '999'
        };
        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME036.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: parameters
        });
    }
    MeTV.request036 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParam = MeTV.getParam('IF-ME-036');

        const defaultParam = {
            ver: '5.0',
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId),
            hash_id: appConfig.STBInfo.hashId,
            entry_no: '999'
        };
        const parameters = Object.assign(commonParam, defaultParam, param);

        MeTV.ME036.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: parameters
        });
    });

    /**
     * IF-ME-044 자녀안심설정 조회
     * @param {String Object} param 
        IF(필수) : 인터페이스 식별자
        ver(필수) : 인터페이스 버전
        response_format(필수) : 서버로부터 회신받고자 하는 데이터 포맷
        stb_id(필수) : STB ID
        hash_id(필수) : 비식별자 ID
        est_type(필수) : "ALL : 전체메뉴 조회default / WAT_AGE_LIM : 시청 연령 제한 / WAT_TME_LIM : 시청 시간 제한 / ADT_MNU_VIS : 성인 메뉴 표시"
     * ]
     * @param {function} funcCallback
     */

    MeTV.requestME044 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-044');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.est_type = param.est_type;

        MeTV.ME044.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };

    MeTV.request044 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-044');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.est_type = param.est_type;

        MeTV.ME044.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
    * IF-ME-046 키즈존 설정 조회
    * @param {String Object} param 
       IF(필수) : 인터페이스 식별자
       ver(필수) : 인터페이스 버전
       response_format(필수) : 서버로부터 회신받고자 하는 데이터 포맷
       stb_id(필수) : STB ID
       hash_id(필수) : 비식별자 ID
       est_type(필수) : "ALL : 전체조회(Default) / KZN_LOC_SET : 키즈존 잠금 설정 / KID_PRF_SET : 우리아이 프로필 / GUD_CHA_SET : 시청 가이드 캐릭터 / ALT_TME_SET : 알림시간 설정 / EYE_PRT_SET : 시력보호설정"

    * ]
    * @param {function} funcCallback
    */
    MeTV.requestME046 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-046');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.est_type = param.est_type;

        MeTV.ME046.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };

    MeTV.request046 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-046');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.est_type = param.est_type;

        MeTV.ME046.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * 키즈존 숨김캐릭터, 정렬조건 조회
     * hidden_type(필수) : 숨김캐릭터 정보조회 구분 
     * - 숨김캐틱터 정렬조건 + 숨김캐릭터 정보조회(ALL)
     * - 숨김캐틱터 정럴조건 (sort)
     * - 숨김캐릭터 정보조회 (char)
     */
    MeTV.request048 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-048');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.hidden_type = param.hidden_type;

        MeTV.ME048.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * 키즈존 숨김캐릭터, 정렬조건 등록
     * event_type(필수) : 등록(ADD), 삭제(DEL)
     * hiddenchar_type(필수) : 숨김캐릭터 등록 구분 - 숨김캐릭터 정렬조건(sort), 숨김캐릭터 정보조회(char)
     * 
     * hiddenchar_sort(필수) : 추천순(rank:default), 가나다순(string), 최신순(date)
     * hiddenchar_id(조건필수) : 숨김캐릭터ID - hiddenchar_type = char 일경우 필수 
     */
    MeTV.request049 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-049');
        paramData.stb_id = appConfig.STBInfo.stbId;
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.hiddenchar_type = param.hiddenchar_type;
        paramData.event_type = param.event_type;

        if (param.hiddenchar_sort) paramData.hiddenchar_sort = param.hiddenchar_sort;
        if (param.hiddenchar_id) paramData.hiddenchar_id = param.hiddenchar_id;

        MeTV.ME049.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-ME-061 바로보기
     * @param {String Object} param 
     * stb_id(필수): STB ID (MeTV 확인용)
     * hash_id(필수): 비식별화 ID
     * yn_series_synopsis(필수): N 단편시놉, Y 시리즈시놉 (default: N)
     * series_id(조건형 필수): 최근본회차정보 확인을 위한 식별자 + 컨텐츠의 series_id + yn_series_synopsis = 'Y' 일 때, 필수 
     * req_directList(필수): 바로보기 요청 집합
     * List(선택)[
     *  req_directList / grp_no(조건형 필수): 바로보기 상하위관계 그룹 식별자
     *  req_directList / order_no(조건형 필수): 바로보기 우선순위 식별자 (0 ~ 순차적인 값, null)
     *  req_directList / content_id(선택): VOD 컨텐트의 식별자
     * ]
     * @param {function} funcCallback
     */
    MeTV.requestME061 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-061');
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.sris_id = encodeURIComponent(param.sris_id);
        paramData.yn_season_synopsis = param.yn_season_synopsis;
        paramData.ppv_products = param.ppv_products;
        paramData.pps_products = param.pps_products;

        MeTV.ME061.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    MeTV.request061 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-061');
        paramData.stb_id = appConfig.STBInfo.stbId;
        paramData.hash_id = appConfig.STBInfo.hashId;
        // paramData.muser_num = 'Y';
        paramData.sris_id = encodeURIComponent(param.sris_id);
        paramData.synopsis_type = param.synopsis_type;
        paramData.ppv_products = param.ppv_products;
        paramData.pps_products = param.pps_products;

        MeTV.ME061.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    MeTV.request062 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = MeTV.getParam('IF-ME-062');
        paramData.stb_id = appConfig.STBInfo.stbId;
        paramData.hash_id = appConfig.STBInfo.hashId;
        paramData.req_pidList = param.req_pidList;

        MeTV.ME062.request({
            callback: (status, data, transactionId) => {
                MeTV.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(MeTV);

export function MeTV() {
    return MeTV;
}


/**
 * Request Sample Code
 * 추후 삭제 예정입니다.
 * 
 * var param = {
      group : 'VOD',
      transactionId : '20180308'
    };

    function responseMeTV011(status, data, transactionId) {
      console.log("status: " + status);
      console.log("data: " + data);
      console.log("transactionId: " + transactionId);
    }
    MeTV.requestME011(param, responseMeTV011);
 * 
 */