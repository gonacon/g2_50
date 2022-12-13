import appConfig from "../../config/app-config";
import { utility } from "../../utils/utility";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";

const TYPE_POST = 'POST';
// const TYPE_GET = 'GET';

(function () {
    // private
    var serverInfo = {};
    if (appConfig.app.headEndMode == 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.AMS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.AMS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        setRequestHeader: 'Accept:application/json',
        serverName: 'AMS',
        gw: true
    };

    function getInfo(apiName, method) {
        var info = serverInfo;
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }
        if (appConfig.STBInfo.stbModel == 'BKO-100' || appConfig.STBInfo.useVirtualChannel === 'Y') {
            info.setRequestHeader = 'Accept:json';
        }
        info.type = method;
        info.apiName = apiName;
        return info;
    };

    AMS.reset = function () {
        if (appConfig.app.headEndMode == 'live') {
            serverInfo = cloneDeep(appConfig.headEnd.AMS.Live);
            AMS.getiTV702S = new COMMON.network(getInfo(serverInfo.path, TYPE_POST));
        }
    };

    AMS.getParam = function () {
        var param = {};
        if (appConfig.runDevice) {
            param = {
                'BIZ_CD': {
                    '_NUM': '1',
                    '_TYPE': 'iTV702S',
                    'DATA': {
                        '_NO': '1',
                        'MENU_CD': appConfig.headEnd.AMS.PocCode,
                        'MENU_VER': '0',
                        'PLATFORM_CD': 'ALL',
                        'STB_CD': appConfig.STBInfo.stbModel,  // "BHX-S100",  //  appConfig.STBInfo.stbModel,
                        'CUG_CD': appConfig.STBInfo.cug,
                        'PATCH_VER': appConfig.STBInfo.swVersion,
                        'MAC_ADDR': appConfig.STBInfo.mac,
                        'APPL_VER': '0',
                        'STB_ID': appConfig.STBInfo.stbId,
                        'ENTRY_PATH': 'page',
                        'ETC': ''
                    }
                }
            };
        } else {

            param = {
                "BIZ_CD": {
                    "_NUM": "1",
                    "_TYPE": "iTV702S",
                    "DATA": {
                        "_NO": "1",
                        "MENU_CD": appConfig.headEnd.AMS.PocCode,  //  "SmartSTB",
                        "MENU_VER": "0",
                        "PLATFORM_CD": "ALL",
                        "STB_CD": appConfig.STBInfo.stbModel,  //  "BHX-S100"
                        "CUG_CD": appConfig.STBInfo.cug,  // "0",
                        "PATCH_VER": appConfig.STBInfo.swVersion,  //  "5.3.35",
                        "MAC_ADDR": appConfig.STBInfo.mac,  //  "94:3b:b1:1c:2:c3",
                        "APPL_VER": "0",
                        "STB_ID": appConfig.STBInfo.stbId,  //  "{A734A275-AFE7-11E7-8237-45F8D990F722}",
                        "ENTRY_PATH": "page",
                        'ETC': ''
                    }
                }
            };
        }

        return utility.parser.json2xml_str(param);
    };

    AMS.handleResult = function (resolve, reject, result) {
        const { status, data, transactionId } = result;
        if (status === 200) {
            let result = null;
            try {
                result = JSON.parse(data);
                result.originData = data;
            } catch (err) {
                reject({ status: 10000, data, transactionId });
            } finally {
                resolve(result);
            }
        } else {
            reject(status, data, transactionId);
        }
    }
    // public
    /**
     * @memberof AMS
     * @function getiTV702S
     * @returns {object} network - network class instance
     * @desc TV Application 목록 요청
     */
    AMS.getiTV702S = new COMMON.network(getInfo(serverInfo.path, TYPE_POST));

    AMS.appList = function () {
        console.log("AMS.getiTV702S : ", AMS.getiTV702S);
        var param = AMS.getParam();
        console.log("AMS.getiTV702S param : ", param);
        AMS.getiTV702S.request({
            callback: function (status, data, transactionId) {
                if (status == '200') {
                    //console.log('response data : ', data);
                    console.log('response JSON.parse data : ', JSON.parse(data));
                } else {
                    console.log('response status : ', status);
                }
            }.bind(this),
            transactionId: 'AAA',
            param: param
        });
    };

    AMS.appList_r = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = AMS.getParam();

        AMS.getiTV702S.request({
            callback: (status, data, transactionId) => {
                AMS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(AMS);

export function AMS() {
    return AMS;
}