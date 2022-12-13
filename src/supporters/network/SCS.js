import appConfig from "../../config/app-config";
import cloneDeep from "lodash/cloneDeep";
import { COMMON } from "./COMMON";
import { cryptoUtil } from "../../utils/cryptoUtil";
import dateFormat from 'dateformat';
import StbInterface from "Supporters/stbInterface";
import _ from 'lodash';

const TYPE_POST = 'POST';
const TYPE_GET = 'GET';

(function () {
    var serverInfo = {};
    if (appConfig.app.headEndMode === 'live') {
        serverInfo = cloneDeep(appConfig.headEnd.SCS.Live);
    } else {
        serverInfo = cloneDeep(appConfig.headEnd.SCS.Test);
    }

    var connectInfo = {
        async: true,
        retry: appConfig.headEnd.SCS.retry,
        cancelTimeout: appConfig.headEnd.SCS.cancelTimeout,
        serverName: 'SCS',
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
            info.ip = appConfig.headEnd.SCS.Live.ip;
            info.port = appConfig.headEnd.SCS.Live.port;
        } else {
            info.ip = appConfig.headEnd.SCS.Test.ip;
            info.port = appConfig.headEnd.SCS.Test.port;
        }
        return info;
    }

    /**
     * @memberof SCS
     * @function getData
     * @returns {object} network - network class instance
     */
    SCS.reset = function() {
        serverInfo = cloneDeep(appConfig.headEnd.SCS.Live);
        SCS.SCS_PRODUCT_UI5_001 = new COMMON.network(getInfo(serverInfo.path + 'product/info', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_002 = new COMMON.network(getInfo(serverInfo.path + 'product/purchase', TYPE_POST));
        SCS.SCS_PRODUCT_UI5_003 = new COMMON.network(getInfo(serverInfo.path + 'discountinfo', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_004 = new COMMON.network(getInfo(serverInfo.path + 'productall', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_005 = new COMMON.network(getInfo(serverInfo.path + 'productppm/get', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_006 = new COMMON.network(getInfo(serverInfo.path + 'productppm/post', TYPE_POST));
        SCS.SCS_GWSVC_UI5_001 =   new COMMON.network(getInfo(serverInfo.path + 'otp', TYPE_POST));
        SCS.SCS_GWSVC_UI5_002 =   new COMMON.network(getInfo(serverInfo.path + 'password/confirm', TYPE_GET));
        SCS.SCS_GWSVC_UI5_003 =   new COMMON.network(getInfo(serverInfo.path + 'password/change', TYPE_POST));
        SCS.SCS_STB_UI5_001 =     new COMMON.network(getInfo(serverInfo.path + 'stbconfirm', TYPE_POST));
        SCS.SCS_STB_UI5_002 =     new COMMON.network(getInfo(serverInfo.path + 'stbauth', TYPE_POST));
    };

    // init(getInfo);
    SCS.init = () => {
        SCS.SCS_PRODUCT_UI5_001 = new COMMON.network(getInfo(serverInfo.path + 'product/info', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_002 = new COMMON.network(getInfo(serverInfo.path + 'product/purchase', TYPE_POST));
        SCS.SCS_PRODUCT_UI5_003 = new COMMON.network(getInfo(serverInfo.path + 'discountinfo', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_004 = new COMMON.network(getInfo(serverInfo.path + 'productall', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_005 = new COMMON.network(getInfo(serverInfo.path + 'productppm/get', TYPE_GET));
        SCS.SCS_PRODUCT_UI5_006 = new COMMON.network(getInfo(serverInfo.path + 'productppm/post', TYPE_POST));
        SCS.SCS_GWSVC_UI5_001 =   new COMMON.network(getInfo(serverInfo.path + 'otp', TYPE_POST));
        SCS.SCS_GWSVC_UI5_002 =   new COMMON.network(getInfo(serverInfo.path + 'password/confirm', TYPE_GET));
        SCS.SCS_GWSVC_UI5_003 =   new COMMON.network(getInfo(serverInfo.path + 'password/change', TYPE_POST));
        SCS.SCS_STB_UI5_001 =     new COMMON.network(getInfo(serverInfo.path + 'stbconfirm', TYPE_POST));
        SCS.SCS_STB_UI5_002 =     new COMMON.network(getInfo(serverInfo.path + 'stbauth', TYPE_POST));
    }

    SCS.getParam = function (IF) {
        var param = {
            'response_format': 'json',
            'if': IF,
            'ver': '1.0',
            "mac_address": encodeURIComponent(appConfig.STBInfo.mac),
            "stb_id": encodeURIComponent(appConfig.STBInfo.stbId),
        };
        // POST타입은 encodeURIComponent사용하지 않는다.
        switch (IF) {
            case 'IF-SCS-PRODUCT-UI5-001':
                break;
            case 'IF-SCS-PRODUCT-UI5-002':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            case 'IF-SCS-PRODUCT-UI5-006':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            case 'IF-SCS-GWSVC-UI5-001':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            case 'IF-SCS-GWSVC-UI5-002':
                break;
            case 'IF-SCS-GWSVC-UI5-003':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            case 'IF-SCS_STB_UI5_001':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            case 'IF-SCS_STB_UI5_002':
                param.mac_address = appConfig.STBInfo.mac;
                param.stb_id = appConfig.STBInfo.stbId;
                break;
            default:
                break;
        }
        return param;
    };

    SCS.handleResult = function (resolve, reject, result) {
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
     * IF-SCS-PRODUCT-UI5-001 상품정보 조회
     * @param {String Object} param 
     * = { cid(필수): Content_id(혹은 epi_id)
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      ptype(필수): 상품 Type(10: ppv, 20: pps, 30: ppm, 40: 에피소드ppp, 41: 시즌ppp, 42: VOD+관련상품) 
     *      synopsis_type(필수): 진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉, 05:기타
     *      adult_flag(필수): 성인 인증 여부(성인인증 받음: 1, 성인인증 안함: 2)
     *      purchase_flag(필수): 구매 인증 설정 여부(사용:1, 사용안함: 0)
     *      method(필수): method: get 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.request001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-001');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, cid, pid ptype 암호화된 값(구분자는 ^)
        let req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
         + '^' + SCS.checkNullValue(param.cid) + '^' + SCS.checkNullValue(param.pid) + '^' + SCS.checkNullValue(param.ptype);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            req_date = dateFormat(new Date(), 'yyyy-mm-dd_HH:MM:ss');
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }

        paramData.cid = encodeURIComponent(param.cid);
        paramData.pid = param.pid;
        paramData.synopsis_type = param.synopsis_type;
        paramData.ptype = param.ptype;
        paramData.adult_flag = param.adult_flag;
        paramData.purchase_flag = param.purchase_flag;
        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;
        paramData.method = 'get';

        SCS.SCS_PRODUCT_UI5_001.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-SCS-PRODUCT-UI5-002 상품 구매 요청
     * @param {String Object} param 
     * = {
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      price(필수): 가격
     *      ptype(필수): 상품타입(10: PPV(단일상품), 20: PPS(시리즈상품), 30: PPM(월정액), 40: PPP(에피소드패키지), 41:PPP(시즌패키지), 42: VOD+관련상품)
     *      character_id(필수): 캐릭터 정보(GUID 형식)
     *      mid(휴대폰 결제인 경우 필수)
     *      tid(휴대폰 결제인 경우 필수)
     *      yn_coupon(선택): 쿠폰 사용 유무(Y/N)
     *      no_coupon(선택): 쿠폰 번호
     *      amt_discount(선택): 쿠폰 할인적용액
     *      yn_bpoint(선택): B포인트 사용 유무(Y/N)
     *      amt_bpoint(선택): B포인트 사용 금액
     *      amt_sale(선택): 청구금액
     *      fir_ecrt_num(VOD+상품 구매시 필수): DIS에서 받은 값 전달(IF-DIS-MOB-UI5-001)
     *      snd_ecrt_num(VOD+상품 구매시 필수): DIS에서 받은 값 전달(IF-DIS-MOB-UI5-001)
     *      id_mchdse(VOD+상품 구매시 필수): VOD+관련상품 구매 ID
     *      verf_req_data(필수): 암호화 된 검증 data, stb_id, mac_address, cid, pid, price, yn_coupon, no_coupon, yn_bpoint, amt_bpoint 암호화된 값(구분자는 ^) 
     *                      항목에 값이 없을경우 문자열 null 로 조합. 
     *      req_date(필수): 요청날짜(YYYY-MM-DD_HH24MISS)
     *  }
     * @param {function} funcCallback
     */
    SCS.request002 = (param = {}) => new Promise((resolve, reject) => {
        var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-002');
        paramData.stb_id = appConfig.STBInfo.stbId;

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        // stb_id, mac_address, pid, price, yn_coupon, no_coupon, yn_bpoint, amt_bpoint 
        let req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
          + '^' + SCS.checkNullValue(param.pid) + '^' + SCS.checkNullValue(param.price) + '^' + SCS.checkNullValue(param.yn_coupon)
          + '^' + SCS.checkNullValue(param.no_coupon) + '^' + SCS.checkNullValue(param.yn_bpoint) + '^' + SCS.checkNullValue(param.amt_bpoint);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }

        paramData.method = 'post';  // 'post'로 고정(규격서 참고)
        paramData.pid = param.pid;
        paramData.price = param.price;
        paramData.ptype = param.ptype;
        paramData.yn_coupon = param.yn_coupon;
        paramData.no_coupon = param.no_coupon;
        paramData.amt_discount = param.amt_discount;
        paramData.yn_bpoint = param.yn_bpoint;
        paramData.amt_bpoint = param.amt_bpoint;
        paramData.amt_sale = param.amt_sale;
        paramData.fir_ecrt_num = param.fir_ecrt_num;
        paramData.snd_ecrt_num = param.snd_ecrt_num;
        paramData.id_mchdse = param.id_mchdse;

        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;

        SCS.SCS_PRODUCT_UI5_002.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
         * IF-SCS-PRODUCT-UI5-003 상품정보 조회
         * @param {String Object} param 
         * = { cid(필수): Content_id(혹은 epi_id)
         *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
         *      price(필수): 가격
         *      ptype(필수): 상품 Type(10: ppv, 20: pps, 30: ppm, 40: 에피소드ppp, 41: 시즌ppp, 42: VOD+관련상품) 
         *      pTargetPayment: 상품 결제 수단(90:후불, 10:휴대폰, 2:TV페이(신용카드))
         *      id_mchdse(VOD+상품 필수): VOD+ 관련상품 ID
         *      ver_req_data(필수): 암호화된 검증 data
         *              stb_id, mac_address, cid, pid, price, pTargetPayment 암호화된 값(구분자는 ^), 값이 없으면 null
         *      req_date(필수): 요청날짜(YYYY-MM-DD_HH24MMSS)
         *      method(필수): method: get 추가
         *  }
         * @param {function} funcCallback
         */
    SCS.request003 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-003');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        // stb_id, mac_address, pid, price, pTargetPayment 암호화된 값(구분자는 ^) 
        const req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
          + '^' + SCS.checkNullValue(param.pid) + '^' + SCS.checkNullValue(param.price)
          + '^' + SCS.checkNullValue(param.pTargetPayment);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            req_date = dateFormat(new Date(), 'yyyy-mm-dd_HH:MM:ss');
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }

        paramData.pid = param.pid;
        paramData.price = param.price;
        paramData.ptype = param.ptype;
        paramData.pTargetPayment = param.pTargetPayment;
        if ('id_mchdse' in param) paramData.id_mchdse = param.id_mchdse;

        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;
        paramData.method = 'get';

        SCS.SCS_PRODUCT_UI5_003.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-SCS-PRODUCT-UI5-004 상품정보 조회
     * @param {String Object} param 
     * = { epsd_id(필수): 에피소드 아이디(혹은 epi_id)
     *      sris_id(필수): 시리즈 아이디(혹은 sris_id)
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      ptype(필수): 상품 Type(10: ppv, 20: pps, 30: ppm, 40: 에피소드ppp, 41: 시즌ppp, 42: VOD+관련상품) 
     *      adult_flag(필수): 성인 인증 여부(성인인증 받음: 1, 성인인증 안함: 2)
     *      purchase_flag(필수): 구매 인증 설정 여부(사용:1, 사용안함: 0)
     *      method(필수): method: get 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.request004 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-004');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, epsd_id, sris_id, pid, ptype 암호화된 값(구분자는 ^)
        let req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
          + '^' + SCS.checkNullValue(param.epsd_id) + '^' + SCS.checkNullValue(param.sris_id)
          + '^' + SCS.checkNullValue(param.pid) + '^' + SCS.checkNullValue(param.ptype);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            req_date = dateFormat(new Date(), 'yyyy-mm-dd_HH:MM:ss');
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }

        paramData.epsd_id = param.epsd_id;
        paramData.sris_id = param.sris_id;
        paramData.synopsis_type = param.synopsis_type;
        paramData.pid = param.pid;
        paramData.ptype = param.ptype;
        paramData.adult_flag = param.adult_flag;
        paramData.purchase_flag = param.purchase_flag;
        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;
        paramData.method = 'get';

        SCS.SCS_PRODUCT_UI5_004.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-SCS-PRODUCT-UI5-005 월정액 홈 상품정보 조회
     * @param {String Object} param 
     * = {
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      adult_flag(필수): 성인 인증 여부(성인인증 받음: 1, 성인인증 안함: 2)
     *      purchase_flag(필수): 구매 인증 설정 여부(사용:1, 사용안함: 0)
     *      method(필수): method: get 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.request005 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-005');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, pid 암호화된 값(구분자는 ^)
        let req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
         + '^' + SCS.checkNullValue(param.pid);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            req_date = dateFormat(new Date(), 'yyyy-mm-dd_HH:MM:ss');
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }

        paramData.pid = param.pid;
        paramData.adult_flag = param.adult_flag;
        paramData.purchase_flag = param.purchase_flag;
        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;
        paramData.method = 'get';

        SCS.SCS_PRODUCT_UI5_005.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-SCS-PRODUCT-UI5-006 월정액 홈 상품구매 요청
     * @param {String Object} param 
     * = {
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      price(필수): 가격
     *      yn_coupon: 쿠폰 사용 유무(y/n)
     *      no_coupon: 쿠폰 번호
     *      amt_discount: 쿠폰 할인적용액
     *      method(필수): method: post 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.request006 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-006');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, pid, price, yn_coupon, no_coupon 암호화된 값(구분자는 ^) 
        let req_data = SCS.checkNullValue(appConfig.STBInfo.stbId) + '^' + SCS.checkNullValue(appConfig.STBInfo.mac)
         + '^' + SCS.checkNullValue(param.pid) + '^' + SCS.checkNullValue(param.price)
         + '^' + SCS.checkNullValue(param.yn_coupon) + '^' + SCS.checkNullValue(param.no_coupon);
        const date = new Date();
        req_date = dateFormat(date, 'yyyy-mm-dd_HH:MM:ss');
        if (appConfig.runDevice) {
            const encryptedReqDate = dateFormat(date, 'mmddHHMMss');
            let data = { target: 'scs', cryptType: 'encrypt', text: req_data, dateTime: encryptedReqDate }
            encryptedReqData = StbInterface.requestEncryptData(data);
        } else {
            req_date = dateFormat(new Date(), 'yyyy-mm-dd_HH:MM:ss');
            encryptedReqData = cryptoUtil.encryptAES256ByKey(req_date, req_data);
        }
        
        paramData.pid = param.pid;
        paramData.price = param.price;
        if ('sequence' in param) paramData.sequence = param.sequence;
        if ('yn_coupon' in param) paramData.yn_coupon = param.yn_coupon;
        if ('no_coupon' in param) paramData.no_coupon = param.no_coupon;
        if ('amt_discount' in param) paramData.amt_discount = param.amt_discount;
        paramData.verf_req_data = encryptedReqData;
        paramData.req_date = req_date;
        paramData.method = 'post';

        SCS.SCS_PRODUCT_UI5_006.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-SCS-GWSVC-UI5-001 OTP 발급
     * @param {String Object} param 
     * = { 
     *      type(필수): 요청 타입 (ftp:1, rtsp:2, hls:3, 기타:99)
     *      cid(선택): ContentId
     *      cnt_url(필수): Content URL
     *  }
     * @param {function} funcCallback
     */
    SCS.requestGWSVC001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-GWSVC-UI5-001');

        paramData.type = '2';   // 2로 하드코딩하여 사용(디지캡과 확인완료)
        if ('cid' in param) paramData.cid = param.cid;
        paramData.cnt_url = param.cnt_url;
        const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
        paramData.req_date = req_date;
        paramData.method = 'post';
        console.log(paramData);
        SCS.SCS_GWSVC_UI5_001.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-SCS-GWSVC-UI5-002 비밀번호 확인(성인, 자녀안심, 구매)
     * @param {String Object} param 
     * = { cid(필수): Content_id(혹은 epi_id)
     *      pid(필수): 상품 Id(하나의 상품에 대한 PID)
     *      ptype(필수): 상품 Type(10: ppv, 20: pps, 30: ppm, 40: 에피소드ppp, 41: 시즌ppp, 42: VOD+관련상품) 
     *      adult_flag(필수): 성인 인증 여부(성인인증 받음: 1, 성인인증 안함: 2)
     *      purchase_flag(필수): 구매 인증 설정 여부(사용:1, 사용안함: 0)
     *      isp_type(필수): 인터넷 설정(SKB이면1, 아니면4)
     *      method(필수): method: get 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.requestGWSVC002 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-GWSVC-UI5-002');

        paramData.passwd = param.passwd;
        paramData.passwd_type = param.passwd_type;
        paramData.method = 'get';
        console.log(paramData)
        SCS.SCS_GWSVC_UI5_002.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });


    /**
     * IF-SCS-GWSVC-UI5-003 비밀번호 변경(성인, 자녀안심, 구매)
     * @param {String Object} param 
     * = { if(필수): 인터페이스 아이디
     *      ver(필수): 인터페이스 버전
     *      ui_name(선택): UI 구분자
     *      stb_id(필수): STB ID
     *      mac_address(필수): MAC Address
     *      old_passwod(필수): 기존비밀번호
     *      new_passwod(필수): 신규비밀번호
     *      passwd_type(필수) : 비밀번호 구분(adult/purchase/kid)
     *      update_type()
     *      method(필수): put 추가
     *  }
     * @param {function} funcCallback
     */
    SCS.requestGWSVC003 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-GWSVC-UI5-003');

        paramData.old_password = param.old_password;
        paramData.new_password = param.new_password;
        paramData.passwd_type = param.passwd_type;
        paramData.update_type = param.update_type;
        paramData.method = 'put';

        SCS.SCS_GWSVC_UI5_003.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
     * IF-SCS-STB-UI5-001 STB 사용자 확인
     * @param {String Object} param 
     * = { 
            if (필수) : 인터페이스 아이디
            ver (필수) : 인터페이스 버전
            ui_name(선택) : UI 구분자
            stb_id(선택) : stb id
            mac_address(필수) : mac address
            device_id(선택) : stb id
            model(필수) : stb model
            sw_ver(필수) : stb version
            regnumber(필수) : 가입자번호
            license(필수) : 생년월일
            req_date(필수) : 요청일시
            method(필수) : 'get'
     *  }
     * @param {function} funcCallback
     */

    //'response_format': 'json',
    //'if': IF,
    //'ver': '1.0',
    //"mac_address" : encodeURIComponent(appConfig.STBInfo.mac),
    //"stb_id": encodeURIComponent(appConfig.STBInfo.stbId),

    SCS.requestSTB001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-STB-UI5-001');

        paramData.mac_address = appConfig.STBInfo.mac;
        paramData.model = appConfig.STBInfo.stbModel;
        paramData.sw_ver = appConfig.STBInfo.swVersion;
        //paramData.regnumber = '100601039501' //temp
        //paramData.license = '070718'//temp
        paramData.regnumber = param.regnumber;
        paramData.license = param.license;
        paramData.req_date = param.req_date;
        paramData.method = 'get';

        console.log(paramData)
        SCS.SCS_STB_UI5_001.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    /**
    * IF-SCS-STB-UI5-002 STB 사용자 인증
    * @param {String Object} param 
    * = { 
           if (필수)         : 인터페이스 아이디
           ver (필수)        : 인터페이스 버전
           ui_name(선택)     : UI 구분자
           stb_id(선택)      : stb id
           mac_address(필수) : mac address
           device_id(선택)   : stb id
           model(필수)       : stb model
           sw_ver(필수)      : stb version
           regnumber(필수)   : 가입자번호
           license(필수)     : 생년월일
           snum(필수)        : S넘버
           sdata(필수)       : S데이터
           req_date(필수)    : 요청일시
           method(필수)      : POST 방식으로 전송 시 method : post (소문자) 추가
    *  }
    * @param {function} funcCallback
    */
    SCS.requestSTB002 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-STB-UI5-002');

        paramData.mac_address = appConfig.STBInfo.mac;
        paramData.model = appConfig.STBInfo.stbModel;
        paramData.sw_ver = appConfig.STBInfo.swVersion;
        paramData.regnumber = param.regnumber;
        paramData.license = param.license;
        paramData.snum = param.snum;
        paramData.sdata = param.sdata;
        paramData.req_date = param.req_date;
        paramData.method = 'post';

        SCS.SCS_STB_UI5_002.request({
            callback: function (status, data, transactionId) {
                SCS.handleResult(resolve, reject, { status, data, transactionId });
            },
            transactionId: transactionId,
            param: paramData
        });
    });

    SCS.checkNullValue = (data) => {
        // 변조화 체크시 데이터없는 경우 NULL로 설정
        if (_.isEmpty(data) || data === "") {
            return 'null';
        } else {
            return data;
        }

    }
})(SCS);

setTimeout(() => {
    SCS.init();
}, 100);

export function SCS() {
    return SCS;
}