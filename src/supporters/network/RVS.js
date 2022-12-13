import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

const TYPE_POST = 'POST';
// const TYPE_GET = 'GET';


(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.RVS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.RVS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'RVS',
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

    RVS.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.RVS.Live);
        RVS.RVS501 = new COMMON.network(getInfo(serverInfo.path + '/reservation/add', TYPE_POST));
        RVS.RVS502 = new COMMON.network(getInfo(serverInfo.path + '/reservation/del', TYPE_POST));
        RVS.RVS503 = new COMMON.network(getInfo(serverInfo.path + '/reservation/get', TYPE_POST));
        RVS.RVS504 = new COMMON.network(getInfo(serverInfo.path + '/reservation/update', TYPE_POST));
        RVS.RVS505 = new COMMON.network(getInfo(serverInfo.path + '/reservation/delchannel', TYPE_POST));
    }

    RVS.RVS501 = new COMMON.network(getInfo(serverInfo.path + '/reservation/add', TYPE_POST));
    RVS.RVS502 = new COMMON.network(getInfo(serverInfo.path + '/reservation/del', TYPE_POST));
    RVS.RVS503 = new COMMON.network(getInfo(serverInfo.path + '/reservation/get', TYPE_POST));
    RVS.RVS504 = new COMMON.network(getInfo(serverInfo.path + '/reservation/update', TYPE_POST));
    RVS.RVS505 = new COMMON.network(getInfo(serverInfo.path + '/reservation/delchannel', TYPE_POST));

    RVS.getParam = function (IF) {
        var paramInfo = {
            'response_format': 'json',
            'ver': '5.0',
            'deviceType': 'O',
            'IF': IF,
        };

        // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
        var param = {
            'response_format': paramInfo.response_format,
            'ver': paramInfo.ver,
            'deviceType': paramInfo.deviceType,
            'stbID': paramInfo.stb_id,
            'if_no': paramInfo.IF,
        };

        return param;
    };
    RVS.handleResult = function (resolve, reject, result) {
        const { status, data, transactionId } = result;
        if (status === 200) {
            let result = null;
            try {
                // result = JSON.parse(data);   
                result = data;
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
     * IF-RVS-501 시청예약 프로그램 등록
     */

    RVS.request501 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = RVS.getParam('IF-RVS-501')
        paramData.method = param.method
        paramData.count = param.count
        paramData.contents = param.contents
        paramData.std_id = appConfig.STBInfo.stbId

        RVS.RVS501.request({
            callback: (status, data, transactionId) => {
                RVS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-RVS-502 시청예약 프로그램 삭제
     */
    RVS.request502 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = RVS.getParam('IF-RVS-502')
        paramData.method = param.method
        paramData.count = param.count
        paramData.contents = param.contents
        paramData.std_id = appConfig.STBInfo.stbId

        RVS.RVS502.request({
            callback: (status, data, transactionId) => {
                RVS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-RVS-503 시청예약 프로그램 목록 조회
     */
    RVS.request503 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = RVS.getParam('IF-RVS-503')
        paramData.method = param.method
        paramData.count = param.count
        paramData.sort = param.sort
        paramData.order = param.order
        paramData.std_id = appConfig.STBInfo.stbId

        RVS.RVS503.request({
            callback: (status, data, transactionId) => {
                RVS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(RVS);

export function RVS() {
    return RVS;
}

