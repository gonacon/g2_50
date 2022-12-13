import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

// const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.WEPG.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.WEPG.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'WEPG',
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

    WEPG.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.WEPG.Live);
        WEPG.V5001 = new COMMON.network(getInfo(serverInfo.path + '/getAllChannels', TYPE_GET));
    };

    WEPG.V5001 = new COMMON.network(getInfo(serverInfo.path + '/getAllChannels', TYPE_GET));

    WEPG.getParam = function (IF) {
        var paramInfo = {
            'ver': '1.0',
            'response_format': 'json',
            'stb_id': encodeURIComponent(appConfig.STBInfo.stbId),
            'stb_model': 'BKO-100'
        };

        // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
        var param = {
            'IF': IF,
            'ver': paramInfo.ver,
            // 'response_format': paramInfo.response_format,
            // 'stb_model': paramInfo.stb_model    
        };

        return param;
    };

    WEPG.handleResult = function (resolve, reject, result) {
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
    * WEPG-V5001 키즈존 홈 이벤트 정보 요청
    * @param {*} param 
    * @param {*} funcCallback 
    */
    WEPG.requestWEPG_V5001 = function (param, funcCallback) {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'WEPG_V5_001' : param.transactionId;
        var commonParam = WEPG.getParam('IF-WEPG-V5-001');
        const defaultParam = {
            'sw_ver': '4.1.108',
            'ui_ver': '1.1.124',
            'cug': '0',
            'poc': 'STB'
        }
        const parameter = Object.assign(commonParam, defaultParam, param ? param : {});
        WEPG.V5001.request({
            callback: (status, data, transactionId) => {
                funcCallback(status, data, transactionId);
            },
            transactionId: transactionId,
            param: parameter
        });
    }

    WEPG.requestV5001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'WEPG_V5_001' : param.transactionId;
        var paramData = WEPG.getParam('IF-WEPG-V5-001')
        paramData.m = param.m
        paramData.svc_ids = encodeURIComponent(param.svc_ids)
        paramData.poc = param.poc
        paramData.o_date = param.o_date

        WEPG.V5001.request({
            callback: (status, data, transactionId) => {
                WEPG.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    // WEPG.requestV5001 ()

})(WEPG);

export function WEPG() {
    return WEPG;
}

