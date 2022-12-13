import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

// const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.V5SCH.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.V5SCH.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'V5SCH',
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

    V5SCH.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.V5SCH.Live);
        V5SCH.V5SCH001 = new COMMON.network(getInfo(serverInfo.path + 'if-v5sch-001', TYPE_GET));
        V5SCH.V5SCH002 = new COMMON.network(getInfo(serverInfo.path + 'if-v5sch-002', TYPE_GET));
    };

    /**
     * V5SCH 즐겨찾기
     * **/
    V5SCH.V5SCH001 = new COMMON.network(getInfo(serverInfo.path + 'if-v5sch-001', TYPE_GET));
    V5SCH.V5SCH002 = new COMMON.network(getInfo(serverInfo.path + 'if-v5sch-002', TYPE_GET));

    V5SCH.getParam = function (IF) {
        var paramInfo = {
            'response_format': 'json',
            'ver': '5.0',
            'model_group': appConfig.STBInfo.model_group,
            'model_name': appConfig.STBInfo.model_name,
            'hash_id': appConfig.STBInfo.hash_id,
            'stb_id': encodeURIComponent(appConfig.STBInfo.stbId)
        };

        // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
        var param = {
            'response_format': paramInfo.response_format,
            'if_nm': IF,
            'ui_ver': paramInfo.ver,
            'model_group': paramInfo.model_group,
            'model_name': paramInfo.model_name,
            'hash_id': paramInfo.hash_id,
            'stb_id': paramInfo.stb_id
        };

        return param;
    };

    V5SCH.handleResult = function (resolve, reject, result) {
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
     * IF-V5SCH-001 자동완성
     * @param {String Object} param 
     * = { qry(필수): 요청 키워드
     *      doc_page(필수): 1페이지 당 검색 결과의 건수(default: 8)
     *      pg(필수): 자동완성 결과 페이지 번호(default: 1)
     *  }
     * @param {function} funcCallback
     */
    V5SCH.requestV5SCH001 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = V5SCH.getParam('IF-V5SCH-001');

        paramData.qry = param.qry;
        paramData.cug = appConfig.STBInfo.cug;
        paramData.pkg = appConfig.STBInfo.idPackage;
        paramData.doc_page = param.doc_page;
        paramData.pg = param.pg;

        V5SCH.V5SCH001.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: paramData
        });
    };
    V5SCH.request001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = V5SCH.getParam('IF-V5SCH-001');

        paramData.qry = param.qry;
        paramData.cug = appConfig.STBInfo.cug;
        paramData.pkg = appConfig.STBInfo.idPackage;
        paramData.doc_page = param.doc_page;
        paramData.pg = param.pg;

        V5SCH.V5SCH001.request({
            callback: (status, data, transactionId) => {
                V5SCH.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });

    });

})(V5SCH);

export function V5SCH() {
    return V5SCH;
}
