import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";
import Utils from "Util/utils";
import isEmpty from 'lodash/isEmpty';
import { isObject } from "util";

// const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    // 추후 Proxy mode 추가 예정
    // if (appConfig.app.proxyMode != 'off') {
    //     if (appConfig.app.proxyMode == 'live') {
    //         serverInfo = cloneDeep(appConfig.headEnd.Proxy.Live);
    //     } else {
    //         serverInfo = cloneDeep(appConfig.headEnd.Proxy.Test);
    //     }
    // } else {
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.NXPG.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.NXPG.Test);
    }

    // }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'NXPG',
        gw: true,
    };

    function getInfo(apiName, method) {
        var info = cloneDeep(serverInfo);
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }

        info.type = method;
        info.apiName = apiName;
        return info;
    }

    NXPG.reset = function () {
        // if (appConfig.app.headEndMode === 'live' && appConfig.app.proxyMode === 'off') {
        // serverInfo = cloneDeep(appConfig.headEnd.NXPG.Live);
        serverInfo = appConfig.headEnd.NXPG.Live;
        NXPG.NXPG001 = new COMMON.network(getInfo(serverInfo.path + '/menu/gnb', TYPE_GET));
        NXPG.NXPG002 = new COMMON.network(getInfo(serverInfo.path + '/menu/all', TYPE_GET));
        NXPG.NXPG003 = new COMMON.network(getInfo(serverInfo.path + '/menu/block', TYPE_GET));
        NXPG.NXPG004 = new COMMON.network(getInfo(serverInfo.path + '/menu/monthinfo', TYPE_GET));
        NXPG.NXPG005 = new COMMON.network(getInfo(serverInfo.path + '/menu/month', TYPE_GET));
        NXPG.NXPG006 = new COMMON.network(getInfo(serverInfo.path + '/grid/grid', TYPE_GET));
        NXPG.NXPG007 = new COMMON.network(getInfo(serverInfo.path + '/grid/event', TYPE_GET));
        NXPG.NXPG008 = new COMMON.network(getInfo(serverInfo.path + '/contents/rating', TYPE_GET));
        NXPG.NXPG009 = new COMMON.network(getInfo(serverInfo.path + '/inter/cwgrid', TYPE_GET));
        NXPG.NXPG010 = new COMMON.network(getInfo(serverInfo.path + '/contents/synopsis', TYPE_GET));
        NXPG.NXPG011 = new COMMON.network(getInfo(serverInfo.path + '/people/info', TYPE_GET));
        NXPG.NXPG012 = new COMMON.network(getInfo(serverInfo.path + '/inter/cwrelation', TYPE_GET));
        NXPG.NXPG013 = new COMMON.network(getInfo(serverInfo.path + '/added/epg', TYPE_GET));
        NXPG.NXPG014 = new COMMON.network(getInfo(serverInfo.path + '/contents/gwsynop', TYPE_GET));
        NXPG.NXPG015 = new COMMON.network(getInfo(serverInfo.path + '/contents/commerce', TYPE_GET));
        NXPG.NXPG016 = new COMMON.network(getInfo(serverInfo.path + '/contents/corner', TYPE_GET));
        NXPG.NXPG017 = new COMMON.network(getInfo(serverInfo.path + '/added/epggenre', TYPE_GET));
        NXPG.NXPG018 = new COMMON.network(getInfo(serverInfo.path + '/added/realtimechannel', TYPE_GET));
        NXPG.NXPG101 = new COMMON.network(getInfo(serverInfo.path + '/menu/kzchar', TYPE_GET));
        NXPG.NXPG102 = new COMMON.network(getInfo(serverInfo.path + '/menu/kzgnb', TYPE_GET));
        NXPG.NXPG103 = new COMMON.network(getInfo(serverInfo.path + '/grid/kzcharinfo', TYPE_GET));         // 키즈존 캐릭터서브 정보
        // }
    };

    /**
     * @memberof NXPG
     * @function getData
     * @returns {object} network - network class instance
     */

    NXPG.NXPG001 = new COMMON.network(getInfo(serverInfo.path + '/menu/gnb', TYPE_GET));
    NXPG.NXPG002 = new COMMON.network(getInfo(serverInfo.path + '/menu/all', TYPE_GET));
    NXPG.NXPG003 = new COMMON.network(getInfo(serverInfo.path + '/menu/block', TYPE_GET));
    NXPG.NXPG004 = new COMMON.network(getInfo(serverInfo.path + '/menu/monthinfo', TYPE_GET));
    NXPG.NXPG005 = new COMMON.network(getInfo(serverInfo.path + '/menu/month', TYPE_GET));
    NXPG.NXPG006 = new COMMON.network(getInfo(serverInfo.path + '/grid/grid', TYPE_GET));
    NXPG.NXPG007 = new COMMON.network(getInfo(serverInfo.path + '/grid/event', TYPE_GET));
    NXPG.NXPG008 = new COMMON.network(getInfo(serverInfo.path + '/contents/rating', TYPE_GET));
    NXPG.NXPG009 = new COMMON.network(getInfo(serverInfo.path + '/inter/cwgrid', TYPE_GET));
    NXPG.NXPG010 = new COMMON.network(getInfo(serverInfo.path + '/contents/synopsis', TYPE_GET));
    NXPG.NXPG011 = new COMMON.network(getInfo(serverInfo.path + '/people/info', TYPE_GET));
    NXPG.NXPG012 = new COMMON.network(getInfo(serverInfo.path + '/inter/cwrelation', TYPE_GET));
    NXPG.NXPG013 = new COMMON.network(getInfo(serverInfo.path + '/added/epg', TYPE_GET));
    NXPG.NXPG014 = new COMMON.network(getInfo(serverInfo.path + '/contents/gwsynop', TYPE_GET));
    NXPG.NXPG015 = new COMMON.network(getInfo(serverInfo.path + '/contents/commerce', TYPE_GET));
    NXPG.NXPG016 = new COMMON.network(getInfo(serverInfo.path + '/contents/corner', TYPE_GET));
    NXPG.NXPG017 = new COMMON.network(getInfo(serverInfo.path + '/added/epggenre', TYPE_GET));
    NXPG.NXPG018 = new COMMON.network(getInfo(serverInfo.path + '/added/realtimechannel', TYPE_GET));
    NXPG.NXPG101 = new COMMON.network(getInfo(serverInfo.path + '/menu/kzchar', TYPE_GET));
    NXPG.NXPG102 = new COMMON.network(getInfo(serverInfo.path + '/menu/kzgnb', TYPE_GET));
    NXPG.NXPG103 = new COMMON.network(getInfo(serverInfo.path + '/grid/kzcharinfo', TYPE_GET));         // 키즈존 캐릭터서브 정보

    NXPG.getParam = function (IF) {
        var paramInfo = {
            response_format: 'json',
            ui_name: appConfig.STBInfo.ui_name,
            stb_id: encodeURIComponent(appConfig.STBInfo.stbId),//'%7B5FA8A750-FD44-11E5-A490-FDCFBFF8EC17%7D',
        };

        // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
        var param = {
            response_format: paramInfo.response_format,
            IF: IF,
            menu_stb_svc_id: appConfig.STBInfo.ui_name,
            stb_id: paramInfo.stb_id
        };
        switch (IF) {
            default:
                break;
        }
        return param;
    };

    NXPG.handleResult = function (resolve, reject, result) {
        const { status, data, transactionId } = result;
        if (status === 200) {
            let result = null;
            try {
                if (isObject(data)) {
                    // console.log('isObject ');
                    result = data;
                } else {
                    // console.log('isString ');
                    result = JSON.parse(data);
                }
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
     * IF-NXPG-001 GNB 메뉴 정보
     * @param {String Object} param = { transactionId: optional }
     * @param {function} funcCallback
     */
    NXPG.requestNXPG001 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-001');

        NXPG.NXPG001.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-001');

        NXPG.NXPG001.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-002 전체 메뉴 정보
     * @param {String Object} param = { transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG002 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-002');

        NXPG.NXPG002.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request002 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-002');

        NXPG.NXPG002.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-NXPG-003 블록 정보
     * @param {String Object} param = { menu_id, transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG003 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-003');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG003.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request003 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-003');
        paramData.menu_id = param.menu_id;

        // const key = paramData.IF + paramData.menu_id;
        // console.log('key=', key);
        // 데이터가 있으면 사용, 없으면 네트워크 처리
        // const rs = Utils.getNxpgCache(key);
        // if (!isEmpty(rs)) {
        //     // console.log('has data ~~~~~~~~~');
        //     paramData.block_version = rs.block_version ? rs.block_version : '';
        //     paramData.banner_version = rs.banner_version ? rs.banner_version : '';
        // }

        NXPG.NXPG003.request({
            callback: (status, data, transactionId) => {
                // 결과 값에 따른 처리
                // const result = JSON.parse(data);
                // //  일반적인 요청시 성공 (result : 0000)
                // if (result.result === '0001') {  //  배너정보가 최신버전일 경우 (result : 0001)
                //     result.banners = rs.banners;
                // } else if (result.result === '0002') {  //  블록정보가 최신버전일 경우 (result : 0002)
                //     result.blocks = rs.blocks;
                // } else if (result.result === '0003') {  //  배너,블록정보 모두 최신버전일 경우 (result : 0003)
                //     result.banners = rs.banners;
                //     result.blocks = rs.blocks;
                // }

                // Utils.setNxpgCache(key, result);
                // NXPG.handleResult(resolve, reject, { status, data: result, transactionId });
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-004 월정액 상세정보
     * @param {String Object} param = { prd_prc_id, transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG004 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-004');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG004.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request004 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-004');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG004.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-005 월정액 가입자 메뉴 정보
     * @param {String Object} param = { menu_id, prd_prc_id_lst, transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG005 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-005');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG005.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };

    NXPG.request005 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-005');
        paramData.menu_id = param.menu_id;
        paramData.prd_prc_id_lst = param.prd_prc_id_lst;

        NXPG.NXPG005.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-006 블록별 그리드 정보
     * @param {String Object} param = { menu_id, transactionId }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG006 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-006');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG006.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request006 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-006');
        paramData.menu_id = param.menu_id;
        if ('stb_id' in param) paramData.stb_id = param.stb_id;
        if ('page_no' in param) paramData.page_no = param.page_no
        if ('page_cnt' in param) paramData.page_cnt = param.page_cnt;

        // 캐싱 처리 안하도록 변경 20180620 김응균M 요청

        // const key = paramData.IF + paramData.menu_id + paramData.page_no + paramData.page_cnt;
        // console.log('key=', key);
        // 데이터가 있으면 사용, 없으면 네트워크 처리, 
        // const rs = Utils.getNxpgCache(key);
        // if (!isEmpty(rs)) {
        //     // console.log('has data ~~~~~~~~~');
        //     paramData.version = rs.version ? rs.version : '';
        // }

        NXPG.NXPG006.request({
            callback: (status, data, transactionId) => {
                // 결과 값에 따른 처리
                //const result = JSON.parse(data);
                // let result;
                // try {
                //   result = JSON.parse(data);
                // } catch (e) {
                //   console.log('[NXPG-006] Parsing error - data:', data);
                //   result = {};
                // }

                // if (result.result === '0000') {  //  블록정보가 최신버전일 경우 (result : 0002)
                //     if (isEmpty(result.contents)) {
                //         result.contents = rs.contents;
                //     }
                // }
                // Utils.setNxpgCache(key, result);
                // NXPG.handleResult(resolve, reject, { status, data: result, transactionId });
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-007 이벤트 정보
     * @param {String Object} param = { menu_id, transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG007 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-007');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG007.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request007 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-007');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG007.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-008 평점 및 리뷰
     * @param {String Object} param = { menu_id, epsd_id, yn_recent, transactionId }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG008 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-008');
        paramData.sris_id = param.sris_id;
        paramData.page_no = param.page_no;
        paramData.page_cnt = param.page_cnt;
        paramData.site_cd = param.site_cd;

        NXPG.NXPG008.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request008 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-008');
        paramData.sris_id = param.sris_id;
        paramData.page_no = param.page_no;
        paramData.page_cnt = param.page_cnt;
        paramData.site_cd = param.site_cd;

        NXPG.NXPG008.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-009 CW연동 그리드
     * @param {String Object} param = { menu_id }
     * @param {functon} funcCallback
     */
    NXPG.request009 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-009');
        if (!param.cw_call_id || !param.menu_id) reject('error!!!!!');
        paramData.cw_call_id = param.cw_call_id;
        paramData.type = param.type || 'all';
        paramData.menu_id = param.menu_id;
        if ('stb_id' in param) paramData.stb_id = param.stb_id;
        if ('session_id' in param) paramData.session_id = param.session_id;
        if ('track_id' in param) paramData.track_id = param.track_id;
        if ('section_id' in param) paramData.section_id = param.section_id;
        if ('rslu_typ_cd' in param) paramData.rslu_typ_cd = param.rslu_typ_cd;

        // const key = NXPG.NXPG009.url + JSON.stringify(paramData);
        const key = paramData.cw_call_id + paramData.menu_id;
        // console.log('key=', key);

        // 데이터가 있으면 사용, 없으면 네트워크 처리
        const rs = Utils.getCWNxpg009Cache(key);
        if (isEmpty(rs)) {
            // console.log('has not rs 009~~~~~~~~');
            NXPG.NXPG009.request({
                callback: (status, data, transactionId) => {
                    // 결과값 있을때만 저장
                    const result = JSON.parse(data);
                    // console.log('result', result);
                    if (result.result === '0000') {
                        Utils.setCWNxpg009Cache(key, data);
                    }
                    NXPG.handleResult(resolve, reject, { status, data, transactionId });
                },
                transactionId: transactionId,
                param: paramData
            });
        } else {
            NXPG.handleResult(resolve, reject, { status: 200, data: rs, transactionId });
        }
    });

    /**
     * IF-NXPG-010 시놉시스
     * @param {String Object} param = { menu_stb_svc_id, menu_id, IF, stb_id, sris_id, epsd_id, yn_recent, epsd_rslu_id, transactionId: optional }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG010 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-010');
        paramData.menu_id = param.menu_id;
        paramData.sris_id = encodeURIComponent(param.sris_id);
        paramData.epsd_id = encodeURIComponent(param.epsd_id);
        if (param.yn_recent) {
            paramData.yn_recent = param.yn_recent;
        }
        if (param.epsd_rslu_id) {
            paramData.epsd_rslu_id = encodeURIComponent(param.epsd_rslu_id);
        }

        NXPG.NXPG010.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request010 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-010');

        paramData.search_type = param.search_type;
        if ('sris_id' in param) paramData.sris_id = encodeURIComponent(param.sris_id);
        if ('epsd_id' in param) paramData.epsd_id = encodeURIComponent(param.epsd_id);
        if ('epsd_rslu_id' in param) paramData.epsd_rslu_id = encodeURIComponent(param.epsd_rslu_id);
        if ('yn_recent' in param) paramData.yn_recent = param.yn_recent;
        if ('ukey_prd_id' in param) paramData.ukey_prd_id = param.ukey_prd_id;
        if ('session_id' in param) paramData.session_id = param.session_id;
        if ('track_id' in param) paramData.track_id = param.track_id;
        if ('cur_menu' in param) paramData.menu_id = param.menu_id;

        NXPG.NXPG010.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-011 인물정보
     * @param {String Object} param = { menu_id, prs_id transactionId }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG011 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-011');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG011.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request011 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-011');
        paramData.menu_id = param.menu_id;
        paramData.prs_id = encodeURIComponent(param.prs_id);

        NXPG.NXPG011.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-NXPG-012 CW연관콘텐츠
     * @param {String Object} param = { menu_id, prs_id transactionId }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG012 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-012');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG012.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request012 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-012');
        paramData.menu_id = param.menu_id;
        paramData.cw_call_id = param.cw_call_id;
        paramData.type = param.type;
        paramData.epsd_rslu_id = encodeURIComponent(param.epsd_rslu_id);
        paramData.epsd_id = param.epsd_id;

        const key = paramData.cw_call_id + paramData.menu_id + paramData.epsd_rslu_id + paramData.epsd_id + paramData.type;
        console.log('key=', key);

        // 데이터가 있으면 사용, 없으면 네트워크 처리
        const rs = Utils.getCWNxpg009Cache(key);
        if (isEmpty(rs)) {
            console.log('has not rs 012 ~~~~~~~~');
            NXPG.NXPG012.request({
                callback: (status, data, transactionId) => {
                    // 결과값 있을때만 저장
                    const result = JSON.parse(data);
                    console.log('result', result);
                    if (result.result === '0000') {
                        Utils.setCWNxpg009Cache(key, data);
                    } else if (result.result === '8901') { // 라우팅 에러일때 return
                        resolve(result);
                    }
                    NXPG.handleResult(resolve, reject, { status, data, transactionId });
                },
                transactionId: transactionId,
                param: paramData
            });
        } else {
            let modyfiyRs = JSON.parse(rs);
            modyfiyRs.response_time = new Date().getTime();
            NXPG.handleResult(resolve, reject, { status: 200, data: modyfiyRs, transactionId });
        }
    });

    /**
     * IF-NXPG-013 실시간 EPG 정보
     * @param {String Object} param = {menu_stb_svc_id, menu_id, IF, stb_id}
     * @param {functon} funcCallback
     */

    NXPG.requestNXPG013 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-013');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG013.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request013 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-013');
        paramData.menu_id = param.menu_id;
        paramData.stb_id = param.stb_id;

        NXPG.NXPG013.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-014 게이트웨이시놉
     * @param {String Object} param = { menu_id, sris_id epsd_id pid }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG014 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-014');
        paramData.sris_id = param.sris_id;
        paramData.epsd_id = param.epsd_id;
        paramData.pid = param.pid;

        NXPG.NXPG014.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request014 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-014');
        paramData.sris_id = param.sris_id;
        if ('menu_id' in param) paramData.menu_id = param.menu_id;
        if ('epsd_id' in param) paramData.epsd_id = param.epsd_id;

        NXPG.NXPG014.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-015 VOD+관련상품 시놉시스
     * @param {String Object} param = {menu_stb_svc_id, menu_id, IF, stb_id}
     * menu_stb_svc_id(필수) 서비스코드 (메뉴 서비스 셋톱 ID)
     * menu_id(필수) 메뉴 ID
     * IF (선택) 인터페이스 명
     * sris_id (필수) 서비스아이디        //04.23 ver. 규격서 상 잘못표기되었음
     * epsd_id (선택) 에피소드아이디
     * pid (선택)패키지 상품 아이디       //04.23 ver. 규격서 상 잘못표기되었음
     * stb_id (필수) 셋톱박스아이디
     * 
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG015 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-015');

        paramData.sris_id = param.sris_id;

        NXPG.NXPG015.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request015 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-015');


        paramData.sris_id = param.sris_id;

        if (param.menu_id) {
            paramData.menu_id = param.menu_id;
        }

        if (param.epsd_id) {
            paramData.epsd_id = param.epsd_id;
        }
        if (param.pid) {
            paramData.pid = param.pid
        }

        NXPG.NXPG015.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-016 코너 모아보기
     * @param {String Object} param = {menu_stb_svc_id, menu_id, IF, stb_id}
     * menu_id(필수) 메뉴 ID
     * epg_gid(선택) 코너그룹아이디
     * 
     * @param {functon} funcCallback
     */
    NXPG.request016 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-016');

        paramData.cnr_grp_id = param.cnr_grp_id;

        NXPG.NXPG016.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-017 EPG 장르 편성표
     * @param {String Object} param = {menu_stb_svc_id, IF, stb_id}
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG017 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-017');
        //paramData.stb_id = param.stb_id;
        console.log('paramData!!! :: ', paramData)
        NXPG.NXPG017.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request017 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-017');
        //paramData.stb_id = param.stb_id;
        console.log('paramData :: ', paramData)
        NXPG.NXPG017.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-NXPG-018 실시간 채널 순위
     * @param {String Object} param = {menu_stb_svc_id, IF, stb_id}
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG018 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-018');

        NXPG.NXPG018.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request018 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-018');

        NXPG.NXPG018.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });



    /**
     * IF-NXPG-101 키즈존 캐릭터메뉴 및 캐릭터전체보기
     * @param {String Object} param = { menu_id }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG101 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParamData = NXPG.getParam('IF-NXPG-101');
        var paramData = Object.assign(commonParamData, param);

        NXPG.NXPG101.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request101 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var commonParamData = NXPG.getParam('IF-NXPG-101');
        var paramData = Object.assign(commonParamData, param);

        NXPG.NXPG101.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-NXPG-102 키즈존 GNB메뉴 정보
     * @param {String Object} param = { menu_id }
     * @param {functon} funcCallback
     */
    NXPG.requestNXPG102 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-102');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG102.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    };
    NXPG.request102 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-102');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG102.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-NXPG-103 키즈존 캐릭터서브 정보
     * @param {String Object} param = { menu_id }
     * @param {functon} funcCallback 
     */
    NXPG.requestNXPG103 = (param, funcCallback) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-103');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG103.request({
            callback: ((status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            }),
            transactionId: transactionId,
            param: paramData
        });
    }
    NXPG.request103 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = NXPG.getParam('IF-NXPG-103');
        paramData.menu_id = param.menu_id;

        NXPG.NXPG102.request({
            callback: (status, data, transactionId) => {
                NXPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(NXPG);

export function NXPG() {
    return NXPG;
}

/**
 * Request Sample Code
 * 추후 삭제 예정입니다.
 * 
 * var menu_id = 'A000002200';
    var param = {
      menu_id : menu_id,
      transactionId : menu_id
    };

    function responseNXPG004(status, data, transactionId) {
      console.log("status: " + status);
      console.log("data: " + data);
      console.log("transactionId: " + transactionId);
    }

    NXPG.requestNXPG004(param, responseNXPG004);
 * 
 */