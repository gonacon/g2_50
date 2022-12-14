import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

// const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.CSS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.CSS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'CSS',
        addition: '',
        gw: true,
    };

    function getInfo(apiName, method) {
        var info = serverInfo;
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }
        info.type = method;
        info.apiName = apiName;
        return info;
    }

    CSS.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.CSS.Live);
        CSS.CSS004 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-004', TYPE_GET));
        CSS.CSS001 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-001', TYPE_GET));
        CSS.CSS002 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-002', TYPE_GET));
    };

    CSS.CSS004 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-004', TYPE_GET));
    CSS.CSS001 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-001', TYPE_GET));
    CSS.CSS002 = new COMMON.network(getInfo(serverInfo.path + '/v5sch/if-v5sch-002', TYPE_GET));

    CSS.getParam = function (IF) {
        var paramInfo = {
            'ver': '5.0.0',
            'response_format': 'json',
            'model_group': 'STB',
            'model_name': appConfig.STBInfo.stbModel
        };

        var param = {
            'IF': IF,
            'ver': paramInfo.ver,
            'response_format': paramInfo.response_format,
            'model_group': 'STB',
            'model_name': appConfig.STBInfo.stbModel
        };

        switch (IF) {
            case 'IF-V5SCH-001':
                param = Object.assign(paramInfo, {
                    if: IF
                });
                break;
            case 'IF-V5SCH-004':
                param = Object.assign(paramInfo, {
                    if: IF
                });
                break;
            case 'IF-V5SCH-002':
                param = Object.assign(paramInfo, {
                    if: IF
                });
                break;
            default:
                break;
        }

        return param;
    };

    CSS.handleResult = function (resolve, reject, result) {
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
     * IF-V5SCH-004 ?????? VOD ????????? / ??????????????? ??????
     * @param {String Object} param = { transactionId }
     * @param {function} funcCallback
     */
    CSS.requestCSS004 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-004');
        paramData.search_type = param.searchType;
        paramData.doc_page = param.doc_page;
        paramData.hash_id = encodeURIComponent(appConfig.STBInfo.stbId);

        CSS.CSS004.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    CSS.request004 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-004');
        paramData.search_type = param.searchType;
        paramData.doc_page = param.doc_page;
        paramData.hash_id = encodeURIComponent(appConfig.STBInfo.stbId);

        CSS.CSS004.request({
            callback: (status, data, transactionId) => {
                CSS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });




    /**
     * IF-V5SCH-001 ???????????? ????????? ??????
     * @param {String Object} param = { transactionId }
     * @param {function} funcCallback
     */
    CSS.requestCSS001 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-001');
        paramData.hash_id = encodeURIComponent(appConfig.STBInfo.stbId);
        paramData.doc_page = param.doc_page;
        paramData.qry = encodeURIComponent(param.keyword);
        paramData.cug = param.cug; //CUG ??????(default: 0)    
        paramData.pg = 1;  //???????????? ?????? ????????? ??????(default:1)

        CSS.CSS001.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    CSS.request001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-001');
        paramData.hash_id = encodeURIComponent(appConfig.STBInfo.stbId);
        paramData.doc_page = param.doc_page;
        paramData.qry = encodeURIComponent(param.keyword);
        paramData.cug = 0; //CUG ??????(default: 0)    
        paramData.pg = 1;  //???????????? ?????? ????????? ??????(default:1)

        CSS.CSS001.request({
            callback: (status, data, transactionId) => {
                CSS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });



    /**
     * IF-V5SCH-002 ?????? ?????? ?????? ??????
     * @param {String Object} param = { transactionId }
     * @param {function} funcCallback
     */
    CSS.requestCSS002 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-002');

        paramData.qry = encodeURIComponent(param.keyword);
        paramData.cug = "0"; //CUG ??????(default: 0)    
        paramData.stb_id = encodeURIComponent(appConfig.STBInfo.stbId);
        paramData.tag_yn = param.tag_yn;
        paramData.doc_page = encodeURIComponent(param.doc_page);

        paramData.menu_cd = "UHDSTB";       //STB ????????????( AMS APP ????????? ?????? )
        paramData.patch_ver = '5.1.93';     //STB ????????????( AMS APP ????????? ?????? )
        paramData.area_code = encodeURIComponent(appConfig.STBInfo.regionCode);

        CSS.CSS002.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    CSS.request002 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = CSS.getParam('IF-V5SCH-002');

        paramData.qry = encodeURIComponent(param.keyword);
        paramData.cug = "0"; //CUG ??????(default: 0)    
        paramData.stb_id = encodeURIComponent(appConfig.STBInfo.stbId);
        paramData.tag_yn = param.tag_yn;
        paramData.doc_page = encodeURIComponent(param.doc_page);

        // paramData.menu_cd = "UHDSTB";       //STB ????????????( AMS APP ????????? ?????? )
        paramData.menu_cd = "UHD2V5";       //STB ????????????( AMS APP ????????? ?????? )
        paramData.patch_ver = appConfig.STBInfo.swVersion;     //STB ????????????( AMS APP ????????? ?????? )
        paramData.area_code = encodeURIComponent(appConfig.STBInfo.regionCode);

        CSS.CSS002.request({
            callback: (status, data, transactionId) => {
                CSS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(CSS);

export function CSS() {
    return CSS;
}

