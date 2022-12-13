import appConfig from "../../config/app-config";
import { cloneDeep } from "lodash";
import { COMMON } from "./COMMON";

const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    // private
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.SMD.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.SMD.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.SMD.retry,
        cancelTimeout: appConfig.headEnd.SMD.cancelTimeout,
        serverName: 'SMD',
        gw: false,
    };

    function getInfo(apiName, method) {
        var info = serverInfo;
        for (var prop in connectInfo) {
            info[prop] = connectInfo[prop];
        }

        info.type = method;
        info.apiName = apiName;
        return info;
    };

    SMD.reset = function () {
        serverInfo = cloneDeep(appConfig.headEnd.SMD.Live);
        SMD.SMD001 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));
        SMD.SMD003 = ({ m, IF }) => new COMMON.network(getInfo(serverInfo.path + `/delivery/UI5/sd-ui5service?IF=${IF}&m=${m}`, TYPE_POST));
        SMD.SMD004 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));
        SMD.SMD005 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));
    };
    /**
     * @memberof SMD
     * @function getData
     * @returns {object} network - network class instance
     */
    // SMD.SMD003 = new COMMON.network(getInfo('/delivery/couponPointReceiveConfirm', TYPE_POST));
    SMD.SMD001 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));
    SMD.SMD003 = ({ m, IF }) => new COMMON.network(getInfo(serverInfo.path + `/delivery/UI5/sd-ui5service?IF=${IF}&m=${m}`, TYPE_POST));
    SMD.SMD004 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));
    SMD.SMD005 = new COMMON.network(getInfo(serverInfo.path + '/delivery/UI5/sd-ui5service', TYPE_GET));


    SMD.getParam = (IF) => {
        let paramInfo = {
            'stb_id': encodeURIComponent(appConfig.STBInfo.stbId),
            'mac_address': encodeURIComponent(appConfig.STBInfo.mac),
            'IF': IF,
        };
        let param = {}
        switch (IF) {
            case 'IF-SMTDV-V5-001':
                param = Object.assign(paramInfo, {
                    version_sw: '3.3.144',
                });
                break;
            case 'IF-SMTDV-V5-003':
                param = Object.assign(paramInfo, {
                    version_sw: '3.3.144',
                });
                break;
            case 'IF-SMTDV-V5-004':
                param = Object.assign(paramInfo, {
                    version_sw: '3.3.144',
                });
                break;
            case 'IF-SMTDV-V5-005':
                param = Object.assign(paramInfo, {
                    version_sw: '3.3.144',
                });
                break;
            default:
                break;
        }
        return param;
    };

    SMD.handleResult = function (resolve, reject, result) {
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
     * IF-SMTDV-V5-001 잔여 쿠폰/,B포인트 정보 + 신규 이벤트 쿠폰/B포인트 등록여부 + 신규/만료 쿠폰/B포인트 리스트 알림 . 		
     * @param {String Object} param = { transactionId, m }
     * @param {String} param.m: 호출될 메소드(GET Parameter) 명
     */
    SMD.request001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SMD.getParam('IF-SMTDV-V5-001');
        paramData.m = param.m;

        SMD.SMD001.request({
            callback: (status, data, transactionId) => {
                SMD.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-SMTDV-V5-003 신규 및 만기 알림 목록 유무 확인
     * @param {String Object} param = { transactionId, m, data }
     * @param {String} param.m: 호출될 메소드(GET Parameter) 명
     * @param {String JSONString} param.data: IF-SMTDV-V5-001에서 전달된 쿠폰,B포인트 정보 ( coupons, points)
     */
    SMD.request003 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SMD.getParam('IF-SMTDV-V5-003');
        paramData.m = param.m;
        paramData.data = param.data;
        const newParam = {
            data: param.data,
            mac_address: paramData.mac_address,
            stb_id: paramData.stb_id,
            version_sw: paramData.version_sw
        }

        SMD.SMD003({ m: param.m, IF: paramData.IF }).request({
            callback: (status, data, transactionId) => {
                SMD.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: newParam
        });
    });

    /**
     * IF-SMTDV-V5-004 BTV 평점 등록 ( like_action = 0, 미평가상태, 1 좋아요, 2 별루예요.) 
     * @param {String Object} param = { transactionId, m}
     * @param {String} param.m: 호출될 메소드 식별자(필수)
     * @param {String} param.series_id: 시리즈 아이디(필수)
     * @param {String} param.like_action: 좋아요정보등록, 1 = 좋아요, 2 = 별루예요(필수)
     * @param {String} param.title: 타이틀(옵션)
     * 
     */
    SMD.request004 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SMD.getParam('IF-SMTDV-V5-004');
        paramData.m = 'registerLikeHate';
        paramData.series_id = param.series_id;
        paramData.like_action = param.like_action;
        if (param.title) {
            paramData.title = param.title;
        }

        SMD.SMD004.request({
            callback: (status, data, transactionId) => {
                SMD.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-SMTDV-V5-005 BTV 평점 조회 
     * @param {String Object} param = {}
     * @param {String} param.m: 호출될 메소드 식별자
     * @param {String} param.series_id: 시리즈 아이디
     */
    SMD.request005 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SMD.getParam('IF-SMTDV-V5-005');
        paramData.m = 'getLikeHate';
        paramData.series_id = param.series_id;

        SMD.SMD005.request({
            callback: (status, data, transactionId) => {
                SMD.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(SMD);

export function SMD() {
    return SMD;
}