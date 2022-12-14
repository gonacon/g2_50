import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";
import { cryptoUtil } from "../../utils/cryptoUtil";
// import { Moment } from "react-moment";
import StbInterface from "Supporters/stbInterface";

// const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.DIS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.DIS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'DIS',
        gw: true,
    };

    function getInfo(apiName, method) {
        var info = cloneDeep(serverInfo);
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }

        info.type = method;
        info.apiName = apiName;

        if (appConfig.app.headEndMode === 'live') {
            info.ip = appConfig.headEnd.DIS.Live.ip;
            info.port = appConfig.headEnd.DIS.Live.port;
        } else {
            info.ip = appConfig.headEnd.DIS.Test.ip;
            info.port = appConfig.headEnd.DIS.Test.port;
        }
        return info;
    }


    DIS.handleResult = function (resolve, reject, result) {
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
     * @memberof DIS
     * @function getData
     * @returns {object} network - network class instance
     */
    DIS.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.DIS.Live);
        DIS.DIS_MOB_UI5_001 = new COMMON.network(getInfo(serverInfo.path + 'mobile_auth_req', TYPE_GET));
        DIS.DIS_MOB_UI5_002 = new COMMON.network(getInfo(serverInfo.path + 'mobile_auth_confirm', TYPE_GET));
    };

    DIS.DIS_MOB_UI5_001 = new COMMON.network(getInfo(serverInfo.path + 'mobile_auth_req', TYPE_GET));
    DIS.DIS_MOB_UI5_002 = new COMMON.network(getInfo(serverInfo.path + 'mobile_auth_confirm', TYPE_GET));

    DIS.getParam = function (IF) {
        var param = {
            'response_format': 'json',
            'if': IF,
            'ver': '1.0',
            "stb_id": encodeURIComponent(appConfig.STBInfo.stbId),
            'method': 'get'

        };
        return param;
    };

    /**
     * IF-DIS-MOB-UI5-001 ????????? ???????????? ??????
     * param = {
     *  phoneNumber(??????): ???????????? ??? ????????? ??????
     *  pid(??????): proudct Id
     *  req_code(??????): ???????????? ??????(01:VOD+????????????)
     *  req_date(??????): ?????? ?????? ??????
     * }
     */
    DIS.requestDIS001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = DIS.getParam('IF-DIS-MOB-UI5-001');

        paramData.req_date = param.req_date;
        if (appConfig.runDevice) {
            let data = { target: 'dis', cryptType: 'encrypt', text: param.phoneNumber, dateTime: param.req_date_for_encrypt }
            paramData.enc_mobile_number = StbInterface.requestEncryptData(data);
        } else {
            paramData.enc_mobile_number = cryptoUtil.encryptAES256ByDIS(paramData.req_date, param.phoneNumber);
        }
        paramData.pid = param.pid;
        paramData.req_code = param.req_code;

        DIS.DIS_MOB_UI5_001.request({
            callback: (status, data, transactionId) => {
                DIS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-DIS-MOB-UI5-002 ????????? ???????????? ??????
     * param = {
     * fir_ecrt_num(??????): IDX + 1??? ????????? + STB_ID????????? ??? (DIS-001?????? ???????????? ??? ??????)
     * mob_auth_num(??????): ????????????
     * req_date(??????): DIS-001?????? ???????????? ?????? ??????
     * }
     */
    DIS.requestDIS002 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = DIS.getParam('IF-DIS-MOB-UI5-002');

        paramData.fir_ecrt_num = param.fir_ecrt_num;
        paramData.mob_auth_num = param.mob_auth_num;
        paramData.req_date = param.req_date;

        DIS.DIS_MOB_UI5_002.request({
            callback: (status, data, transactionId) => {
                DIS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(DIS);

export function DIS() {
    return DIS;
}