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
        // POST????????? encodeURIComponent???????????? ?????????.
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
     * IF-SCS-PRODUCT-UI5-001 ???????????? ??????
     * @param {String Object} param 
     * = { cid(??????): Content_id(?????? epi_id)
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      ptype(??????): ?????? Type(10: ppv, 20: pps, 30: ppm, 40: ????????????ppp, 41: ??????ppp, 42: VOD+????????????) 
     *      synopsis_type(??????): ????????? ???????????? ??????(01 : ?????? ??????, 02 : ?????? ??????, 03 : ??????????????? ??????, 04 : ????????? ??????, 05:??????
     *      adult_flag(??????): ?????? ?????? ??????(???????????? ??????: 1, ???????????? ??????: 2)
     *      purchase_flag(??????): ?????? ?????? ?????? ??????(??????:1, ????????????: 0)
     *      method(??????): method: get ??????
     *  }
     * @param {function} funcCallback
     */
    SCS.request001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-001');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, cid, pid ptype ???????????? ???(???????????? ^)
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
     * IF-SCS-PRODUCT-UI5-002 ?????? ?????? ??????
     * @param {String Object} param 
     * = {
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      price(??????): ??????
     *      ptype(??????): ????????????(10: PPV(????????????), 20: PPS(???????????????), 30: PPM(?????????), 40: PPP(?????????????????????), 41:PPP(???????????????), 42: VOD+????????????)
     *      character_id(??????): ????????? ??????(GUID ??????)
     *      mid(????????? ????????? ?????? ??????)
     *      tid(????????? ????????? ?????? ??????)
     *      yn_coupon(??????): ?????? ?????? ??????(Y/N)
     *      no_coupon(??????): ?????? ??????
     *      amt_discount(??????): ?????? ???????????????
     *      yn_bpoint(??????): B????????? ?????? ??????(Y/N)
     *      amt_bpoint(??????): B????????? ?????? ??????
     *      amt_sale(??????): ????????????
     *      fir_ecrt_num(VOD+?????? ????????? ??????): DIS?????? ?????? ??? ??????(IF-DIS-MOB-UI5-001)
     *      snd_ecrt_num(VOD+?????? ????????? ??????): DIS?????? ?????? ??? ??????(IF-DIS-MOB-UI5-001)
     *      id_mchdse(VOD+?????? ????????? ??????): VOD+???????????? ?????? ID
     *      verf_req_data(??????): ????????? ??? ?????? data, stb_id, mac_address, cid, pid, price, yn_coupon, no_coupon, yn_bpoint, amt_bpoint ???????????? ???(???????????? ^) 
     *                      ????????? ?????? ???????????? ????????? null ??? ??????. 
     *      req_date(??????): ????????????(YYYY-MM-DD_HH24MISS)
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

        paramData.method = 'post';  // 'post'??? ??????(????????? ??????)
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
         * IF-SCS-PRODUCT-UI5-003 ???????????? ??????
         * @param {String Object} param 
         * = { cid(??????): Content_id(?????? epi_id)
         *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
         *      price(??????): ??????
         *      ptype(??????): ?????? Type(10: ppv, 20: pps, 30: ppm, 40: ????????????ppp, 41: ??????ppp, 42: VOD+????????????) 
         *      pTargetPayment: ?????? ?????? ??????(90:??????, 10:?????????, 2:TV??????(????????????))
         *      id_mchdse(VOD+?????? ??????): VOD+ ???????????? ID
         *      ver_req_data(??????): ???????????? ?????? data
         *              stb_id, mac_address, cid, pid, price, pTargetPayment ???????????? ???(???????????? ^), ?????? ????????? null
         *      req_date(??????): ????????????(YYYY-MM-DD_HH24MMSS)
         *      method(??????): method: get ??????
         *  }
         * @param {function} funcCallback
         */
    SCS.request003 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        const paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-003');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        // stb_id, mac_address, pid, price, pTargetPayment ???????????? ???(???????????? ^) 
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
     * IF-SCS-PRODUCT-UI5-004 ???????????? ??????
     * @param {String Object} param 
     * = { epsd_id(??????): ???????????? ?????????(?????? epi_id)
     *      sris_id(??????): ????????? ?????????(?????? sris_id)
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      ptype(??????): ?????? Type(10: ppv, 20: pps, 30: ppm, 40: ????????????ppp, 41: ??????ppp, 42: VOD+????????????) 
     *      adult_flag(??????): ?????? ?????? ??????(???????????? ??????: 1, ???????????? ??????: 2)
     *      purchase_flag(??????): ?????? ?????? ?????? ??????(??????:1, ????????????: 0)
     *      method(??????): method: get ??????
     *  }
     * @param {function} funcCallback
     */
    SCS.request004 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-004');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, epsd_id, sris_id, pid, ptype ???????????? ???(???????????? ^)
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
     * IF-SCS-PRODUCT-UI5-005 ????????? ??? ???????????? ??????
     * @param {String Object} param 
     * = {
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      adult_flag(??????): ?????? ?????? ??????(???????????? ??????: 1, ???????????? ??????: 2)
     *      purchase_flag(??????): ?????? ?????? ?????? ??????(??????:1, ????????????: 0)
     *      method(??????): method: get ??????
     *  }
     * @param {function} funcCallback
     */
    SCS.request005 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-005');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, pid ???????????? ???(???????????? ^)
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
     * IF-SCS-PRODUCT-UI5-006 ????????? ??? ???????????? ??????
     * @param {String Object} param 
     * = {
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      price(??????): ??????
     *      yn_coupon: ?????? ?????? ??????(y/n)
     *      no_coupon: ?????? ??????
     *      amt_discount: ?????? ???????????????
     *      method(??????): method: post ??????
     *  }
     * @param {function} funcCallback
     */
    SCS.request006 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-PRODUCT-UI5-006');

        const dateFormat = require('dateformat');
        let req_date, encryptedReqData = '';
        //stb_id, mac_address, pid, price, yn_coupon, no_coupon ???????????? ???(???????????? ^) 
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
     * IF-SCS-GWSVC-UI5-001 OTP ??????
     * @param {String Object} param 
     * = { 
     *      type(??????): ?????? ?????? (ftp:1, rtsp:2, hls:3, ??????:99)
     *      cid(??????): ContentId
     *      cnt_url(??????): Content URL
     *  }
     * @param {function} funcCallback
     */
    SCS.requestGWSVC001 = (param = {}) => new Promise((resolve, reject) => {
        const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
        var paramData = SCS.getParam('IF-SCS-GWSVC-UI5-001');

        paramData.type = '2';   // 2??? ?????????????????? ??????(???????????? ????????????)
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
     * IF-SCS-GWSVC-UI5-002 ???????????? ??????(??????, ????????????, ??????)
     * @param {String Object} param 
     * = { cid(??????): Content_id(?????? epi_id)
     *      pid(??????): ?????? Id(????????? ????????? ?????? PID)
     *      ptype(??????): ?????? Type(10: ppv, 20: pps, 30: ppm, 40: ????????????ppp, 41: ??????ppp, 42: VOD+????????????) 
     *      adult_flag(??????): ?????? ?????? ??????(???????????? ??????: 1, ???????????? ??????: 2)
     *      purchase_flag(??????): ?????? ?????? ?????? ??????(??????:1, ????????????: 0)
     *      isp_type(??????): ????????? ??????(SKB??????1, ?????????4)
     *      method(??????): method: get ??????
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
     * IF-SCS-GWSVC-UI5-003 ???????????? ??????(??????, ????????????, ??????)
     * @param {String Object} param 
     * = { if(??????): ??????????????? ?????????
     *      ver(??????): ??????????????? ??????
     *      ui_name(??????): UI ?????????
     *      stb_id(??????): STB ID
     *      mac_address(??????): MAC Address
     *      old_passwod(??????): ??????????????????
     *      new_passwod(??????): ??????????????????
     *      passwd_type(??????) : ???????????? ??????(adult/purchase/kid)
     *      update_type()
     *      method(??????): put ??????
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
     * IF-SCS-STB-UI5-001 STB ????????? ??????
     * @param {String Object} param 
     * = { 
            if (??????) : ??????????????? ?????????
            ver (??????) : ??????????????? ??????
            ui_name(??????) : UI ?????????
            stb_id(??????) : stb id
            mac_address(??????) : mac address
            device_id(??????) : stb id
            model(??????) : stb model
            sw_ver(??????) : stb version
            regnumber(??????) : ???????????????
            license(??????) : ????????????
            req_date(??????) : ????????????
            method(??????) : 'get'
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
    * IF-SCS-STB-UI5-002 STB ????????? ??????
    * @param {String Object} param 
    * = { 
           if (??????)         : ??????????????? ?????????
           ver (??????)        : ??????????????? ??????
           ui_name(??????)     : UI ?????????
           stb_id(??????)      : stb id
           mac_address(??????) : mac address
           device_id(??????)   : stb id
           model(??????)       : stb model
           sw_ver(??????)      : stb version
           regnumber(??????)   : ???????????????
           license(??????)     : ????????????
           snum(??????)        : S??????
           sdata(??????)       : S?????????
           req_date(??????)    : ????????????
           method(??????)      : POST ???????????? ?????? ??? method : post (?????????) ??????
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
        // ????????? ????????? ??????????????? ?????? NULL??? ??????
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