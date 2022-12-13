import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";
import dateFormat from 'dateformat';

const TYPE_POST = 'POST';
// const TYPE_GET = 'GET';

(function () {
    // private
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.IOS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.IOS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.retry,
        cancelTimeout: appConfig.headEnd.cancelTimeout,
        serverName: 'IOS',
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
    };
    
    IOS.reset = () => {
        serverInfo = cloneDeep(appConfig.headEnd.IOS.Live);
        IOS.IOSWIPTV001 = new COMMON.network(getInfo(serverInfo.path + '/wiptv/iptvProdInfo', TYPE_POST));
        IOS.IOSWIPTV002 = new COMMON.network(getInfo(serverInfo.path + '/wiptv/chPurchase', TYPE_POST));
    }
    /**
     * @memberof IOS
     * @function getData
     * @returns {object} network - network class instance
     */
    IOS.init = () => {
        IOS.IOSWIPTV001 = new COMMON.network(getInfo(serverInfo.path + '/wiptv/iptvProdInfo', TYPE_POST));
        IOS.IOSWIPTV002 = new COMMON.network(getInfo(serverInfo.path + '/wiptv/chPurchase', TYPE_POST));
    }


    IOS.getParam = function (IF) {
        var paramInfo = {
            'response_format': 'json',
            'ver': '5.0',
        };
        var param = {
            'IF': IF
        };
        switch (IF) {
            case 'IF-IOS-WIPTV-UI5-001':
                param = Object.assign(paramInfo, {
                    if: IF,
                    stb_id: appConfig.STBInfo.stbId,
                    mac_address: appConfig.STBInfo.mac,
                    method: 'post'  //소문자로 추가
                });
                break;
            case 'IF-IOS-WIPTV-UI5-002':
                param = Object.assign(paramInfo, {
                    if: IF,
                    stb_id: appConfig.STBInfo.stbId,
                    mac_address: appConfig.STBInfo.mac,
                    method: 'post'  //소문자로 추가
                });
                break;
            default:
                break;
        }
        return param;
    };

    IOS.handleResult = function (resolve, reject, result) {
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
     * IF-IOS-WIPTV-001 채널 상품 정보 요청
     * @param {String Object} param = { 
     *      id_svc(필수): 서비스 ID
     *      ch_no(필수): 채널 번호
     *      title(필수): 채널명
     *      adult_flag(필수): 성인인증 설정 기능 여부
     *      purchase_flag(필수): 구매인증 설정 기능 여부
     *      pdtl_type(선택): 요청후 채널, 채널+VOD 상품이 둘다 있을 경우 가져올 정보(없으면 전체) 1:채널, 2:채널+VOD
     *      isp_type(필수): 1 인터넷설정
     *      seeing_path(필수): 시청 경로
     *   }
     * @param {function} funcCallback
     */
    IOS.requestWIPTV001 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = IOS.getParam('IF-IOS-WIPTV-UI5-001');

        paramData.id_svc = param.id_svc;
        paramData.ch_no = param.ch_no;
        paramData.title = param.title;
        paramData.adult_flag = "1";
        paramData.purchase_flag = "1";

        paramData.isp_type = "1";
        paramData.seeing_path = "99";

        IOS.IOSWIPTV001.request({
            callback: (status, data, transactionId) => {
                IOS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-IOS-WIPTV-002 채널 상품 구매
     * @param {String Object} param = { 
     *      id_svc(필수): 서비스 ID
     *      ch_no(필수): 채널 번호
     *      paymethod(필수): 결제수단
     *      pid(필수): 상품 ID
     *      price(필수): 상품 가격
     *      ptype(필수): 상품 타입
     *      event_time(필수): 이벤트 시간
     *   }
     * @param {function} funcCallback
     */
    IOS.requestWIPTV002 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = IOS.getParam('IF-IOS-WIPTV-UI5-002');

        paramData.id_svc = param.id_svc;
        paramData.ch_no = param.ch_no;
        paramData.paymethod = param.paymethod;
        paramData.pid = param.pid;
        paramData.price = param.price;
        paramData.ptype = param.ptype;

        paramData.yn_coupon = param.yn_coupon;
        if (paramData.yn_coupon === 'y') {
            paramData.no_coupon = param.no_coupon;
            paramData.amt_discount = param.amt_discount.toString();
        }

        const req_date = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
        paramData.event_time = req_date;

        IOS.IOSWIPTV002.request({
            callback: (status, data, transactionId) => {
                IOS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

})(IOS);

setTimeout(() => {
    IOS.init();
}, 100);

export function IOS() {

    return IOS;
}

/**
 * Request Sample Code
 * 추후 삭제 예정입니다.
 * 
 * var param = {
    transactionId : ''
  };
  function responseIOS100(status, data, transactionId) {
    console.log("status: " + status);
    console.log("data: " + data);
    console.log("transactionId: " + transactionId);
  }
  IOS.requestIOS100(param, responseMeTV011);
 * 
 */