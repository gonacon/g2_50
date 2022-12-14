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
  // private
  var serverInfo = {};
  if (appConfig.app.headEndMode === 'live') {
    serverInfo = cloneDeep(appConfig.headEnd.EPS.Live);
  } else {
    serverInfo = cloneDeep(appConfig.headEnd.EPS.Test);
  }

  var connectInfo = {
    async: true,
    retry: appConfig.headEnd.EPS.retry,
    cancelTimeout: appConfig.headEnd.EPS.cancelTimeout,
    serverName: 'EPS',
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

  /**
   * @memberof EPS
   * @function getData
   * @returns {object} network - network class instance
   */
  EPS.EPS100 = new COMMON.network(getInfo(serverInfo.path + '/payment/bpoints', TYPE_GET));
  EPS.EPS105 = new COMMON.network(getInfo(serverInfo.path + `/payment/phone/auth?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS110 = (bpointNumber) => new COMMON.network(getInfo(serverInfo.path + `/payment/bpoints/${bpointNumber}?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS111 = (productId, contentId) => new COMMON.network(getInfo(serverInfo.path + `/payment/ppc/${productId}?method=${TYPE_POST}&contentId=${contentId !== undefined ? contentId : ''}`, TYPE_POST));
  EPS.EPS112 = (productId, contentId) => new COMMON.network(getInfo(serverInfo.path + `/payment/ppm/${productId}?method=${TYPE_POST}&contentId=${contentId !== undefined ? contentId : ''}`, TYPE_POST));
  EPS.EPS300 = new COMMON.network(getInfo(serverInfo.path + '/settopbox/points', TYPE_GET));
  EPS.EPS401 = new COMMON.network(getInfo(serverInfo.path + '/coupons', TYPE_GET));
  EPS.EPS402 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/${couponNo}`, TYPE_GET));
  EPS.EPS410 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/${couponNo}?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS411 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/gifticon/${couponNo}?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS451 = new COMMON.network(getInfo(serverInfo.path + '/bpoints', TYPE_GET));
  EPS.EPS460 = (pointNo) => new COMMON.network(getInfo(serverInfo.path + `/bpoints/${pointNo}?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS461 = new COMMON.network(getInfo(serverInfo.path + `/bpoints/run?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS481 = new COMMON.network(getInfo(serverInfo.path + `/bpoints/run?method=DELETE`, TYPE_POST));
  EPS.EPS501 = new COMMON.network(getInfo(serverInfo.path + '/tmembership', TYPE_GET));
  EPS.EPS502 = new COMMON.network(getInfo(serverInfo.path + `/tmembership`, TYPE_GET));
  EPS.EPS510 = new COMMON.network(getInfo(serverInfo.path + `/tmembership?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS530 = new COMMON.network(getInfo(serverInfo.path + `/tmembership?method=DELETE`, TYPE_POST));
  EPS.EPS551 = new COMMON.network(getInfo(serverInfo.path + '/okcashbag', TYPE_GET));
  EPS.EPS552 = new COMMON.network(getInfo(serverInfo.path + '/okcashbag', TYPE_GET));
  EPS.EPS560 = (sequence) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${sequence}?method=${TYPE_POST}`, TYPE_POST));
  EPS.EPS570 = (masterNo) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${masterNo}?method=PUT`, TYPE_POST));
  EPS.EPS580 = (masterNo) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${masterNo}?method=DELETE`, TYPE_POST));
  EPS.EPS601 = new COMMON.network(getInfo(serverInfo.path + '/tvpoints', TYPE_GET));

  EPS.reset = function () {
    serverInfo = cloneDeep(appConfig.headEnd.EPS.Live);
    EPS.EPS100 = new COMMON.network(getInfo(serverInfo.path + '/payment/bpoints', TYPE_GET));
    EPS.EPS105 = new COMMON.network(getInfo(serverInfo.path + `/payment/phone/auth?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS110 = (bpointNumber) => new COMMON.network(getInfo(serverInfo.path + `/payment/bpoints/${bpointNumber}?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS111 = (productId, contentId) => new COMMON.network(getInfo(serverInfo.path + `/payment/ppc/${productId}?method=${TYPE_POST}&contentId=${contentId !== undefined ? contentId : ''}`, TYPE_POST));
    EPS.EPS112 = (productId, contentId) => new COMMON.network(getInfo(serverInfo.path + `/payment/ppm/${productId}?method=${TYPE_POST}&contentId=${contentId !== undefined ? contentId : ''}`, TYPE_POST));
    EPS.EPS300 = new COMMON.network(getInfo(serverInfo.path + '/settopbox/points', TYPE_GET));
    EPS.EPS401 = new COMMON.network(getInfo(serverInfo.path + '/coupons', TYPE_GET));
    EPS.EPS402 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/${couponNo}`, TYPE_GET));
    EPS.EPS410 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/${couponNo}?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS411 = (couponNo) => new COMMON.network(getInfo(serverInfo.path + `/coupons/gifticon/${couponNo}?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS451 = new COMMON.network(getInfo(serverInfo.path + '/bpoints', TYPE_GET));
    EPS.EPS460 = (pointNo) => new COMMON.network(getInfo(serverInfo.path + `/bpoints/${pointNo}?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS461 = new COMMON.network(getInfo(serverInfo.path + `/bpoints/run?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS481 = new COMMON.network(getInfo(serverInfo.path + `/bpoints/run?method=DELETE`, TYPE_POST));
    EPS.EPS501 = new COMMON.network(getInfo(serverInfo.path + '/tmembership', TYPE_GET));
    EPS.EPS502 = new COMMON.network(getInfo(serverInfo.path + `/tmembership`, TYPE_GET));
    EPS.EPS510 = new COMMON.network(getInfo(serverInfo.path + `/tmembership?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS530 = new COMMON.network(getInfo(serverInfo.path + `/tmembership?method=DELETE`, TYPE_POST));
    EPS.EPS551 = new COMMON.network(getInfo(serverInfo.path + '/okcashbag', TYPE_GET));
    EPS.EPS552 = new COMMON.network(getInfo(serverInfo.path + '/okcashbag', TYPE_GET));
    EPS.EPS560 = (sequence) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${sequence}?method=${TYPE_POST}`, TYPE_POST));
    EPS.EPS570 = (masterNo) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${masterNo}?method=PUT`, TYPE_POST));
    EPS.EPS580 = (masterNo) => new COMMON.network(getInfo(serverInfo.path + `/okcashbag/${masterNo}?method=DELETE`, TYPE_POST));
    EPS.EPS601 = new COMMON.network(getInfo(serverInfo.path + '/tvpoints', TYPE_GET));
  }

  EPS.getParam = function (IF, method) {
    var param = {
      if: IF,
      response_format: 'json',
      ui_name: appConfig.STBInfo.ui_name,
      ver: '5.0',
      stb_id: (method && (method.toLowerCase() === 'post')) ? appConfig.STBInfo.stbId : encodeURIComponent(appConfig.STBInfo.stbId),
      mac: (method && (method.toLowerCase() === 'post')) ? appConfig.STBInfo.stbId : encodeURIComponent(appConfig.STBInfo.mac)
    };

    switch (IF) {
      //case 'IF-EPS-100':
      case 'IF-EPS-105':
      case 'IF-EPS-110':
      case 'IF-EPS-111':
      case 'IF-EPS-112':
        param.stb_id = appConfig.STBInfo.stbId;
        param.mac = appConfig.STBInfo.mac;
        break;
      case 'IF-EPS-300':
        break;
      case 'IF-EPS-401':
        break;
      case 'IF-EPS-402':
        break;
      case 'IF-EPS-410':
      case 'IF-EPS-411':
        param.stb_id = appConfig.STBInfo.stbId;
        break;
      case 'IF-EPS-451':
        break;
      case 'IF-EPS-460':
      case 'IF-EPS-461':
        param.stb_id = appConfig.STBInfo.stbId;
        break;
      case 'IF-EPS-481':
      case 'IF-EPS-501':
        break;
      /*
      case 'IF-EPS-510':
        param = {
          ...paramInfo,
          if: IF,
          mac: appConfig.STBInfo.mac,
          stb_id: appConfig.STBInfo.stbId,
        };
        break;
      */
      case 'IF-EPS-530':
        param.stb_id = appConfig.STBInfo.stbId;
        break;
      case 'IF-EPS-560':
        param.stb_id = appConfig.STBInfo.stbId;
        param.mac = appConfig.STBInfo.mac;
        break;
      case 'IF-EPS-551':
      case 'IF-EPS-552':
      case 'IF-EPS-570':
      case 'IF-EPS-580':
      case 'IF-EPS-601':
        break;
      default:
        break;
    }

    return param;
  };

  EPS.handleResult = function (resolve, reject, result) {
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
   * IF-EPS-100 ?????? ?????? B????????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.requestEPS100 = function (param, funcCallback) {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-100');

    EPS.EPS100.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request100 = (param = {}) => new Promise((resolve, reject) => {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-100');

    EPS.EPS100.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * ????????? ?????? ???????????? ??????
   * data = {
   *  productId: ????????? ?????? ID
   *  phoneData: ????????? ????????? ?????? ???????????? Data String
   *      = {
   *          corpCode: ????????? ??????(SKT, KTF, LGU)
   *          registNumber: ???????????? ????????? 7??????
   *          phoneNumber: ????????? ??????(??????????????? ??????)
   *          amount: ????????????(????????? ??????)
   *      }
   * }
   */
  EPS.request105 = (param = {}) => new Promise((resolve, reject) => {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-105');

    if ('productId' in param) paramData.productId = param.productId;
    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;
    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: JSON.stringify(param.phoneData), dateTime: req_date };
      if ('phoneData' in param) paramData.phoneData = StbInterface.requestEncryptData(data);
    } else {
      if ('phoneData' in param) paramData.phoneData = cryptoUtil.encryptAESByKeyEPS(req_date, JSON.stringify(param.phoneData));
    }

    EPS.EPS105.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * B????????? ?????? ??????
   * @param {String} param = {
   *      bpointNumber: B????????? ????????????
   *      useCoupon: ?????? ???????????? (??????: true, ?????????: false)
   *      couponNo: ????????? ????????? ?????? ?????? (?????? ????????? ??????)
   *      useTmembership: T????????? ?????? ?????? (??????: true, ?????????: false)
   *      tmembershipGrade: T????????? ?????? ??????(?????? ??? default ?????? ??????)
   *      useOcb: OCB ?????? ?????? (??????: true, ?????????: false)
   *      ocbSequence: OCB ?????? ?????? (1 ~ 3)
   *      ocbPassword: OCB ????????? ?????? ????????????
   *      useTvpoint: TV ????????? ?????? ?????? (??????: true, ?????????: false)
   *      tvpointAmount: TV ????????? ?????? ?????? (TV ????????? ????????? ??????, ????????? ??????)
   *      useBpoint: B????????? ?????? ?????? (??????: true, ?????????: false)
   *      useTvpay: TV?????? ?????? ?????? (??????: true, ?????????: false)
   *      ifSequence: TV Hub ?????? ?????? (TV?????? ????????? ??????, ????????? ??????)
   *      tvpayAmount: TV?????? ???????????? (TV?????? ????????? ??????, ????????? ??????)
   *      usePhone: ????????? ?????? ?????? ?????? (??????: true, ?????????: false)
   *      phoneData: ????????? ????????? ?????? ???????????? DataString
   *          : {
   *              corpCode:
   *              registNumber: ???????????? ??? 7??????
   *               phoneNumber: ????????? ??????
   *               amount: ????????????(????????? ??????)
   *               corpTypeCode: ????????? ????????? ?????? ?????????1 (EPS-105???????????????)
   *               authKey1: ????????? ????????? ?????? ?????????1 (EPS-105???????????????) (Gateway??????, hppcotype)
   *               authKey2: ????????? ????????? ?????? ?????????1 (EPS-105???????????????) (???????????????, hppphoneid)
   *               authKey3: ????????? ????????? ?????? ?????????1 (EPS-105???????????????) (???????????????, hppauthserial)
   *               authNumber: MMS??? ?????? ????????????
   *      }
   * }
   */
  EPS.request110 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-110');
    let bpointNumber = param.bpointNumber;

    if ('useCoupon' in param) paramData.useCoupon = param.useCoupon;
    if ('useTmembership' in param) paramData.useTmembership = param.useTmembership;
    if ('useOcb' in param) paramData.useOcb = param.useOcb;
    if ('useTvpoint' in param) paramData.useTvpoint = param.useTvpoint;
    if ('useBpoint' in param) paramData.useBpoint = param.useBpoint;
    if ('useTvpay' in param) paramData.useTvpay = param.useTvpay;
    if ('ifSequence' in param) paramData.ifSequence = param.ifSequence;
    if ('usePhone' in param) paramData.usePhone = param.usePhone;

    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;
    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: JSON.stringify(param.phoneData), dateTime: req_date };
      if ('phoneData' in param) paramData.phoneData = StbInterface.requestEncryptData(data);
    } else {
      if ('phoneData' in param) paramData.phoneData = cryptoUtil.encryptAESByKeyEPS(req_date, JSON.stringify(param.phoneData));
    }

    EPS.EPS110(bpointNumber).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  EPS.request111 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-111');
    let productId = param.productId;
    let contentId = !_.isEmpty(param.contentId) ? encodeURIComponent(param.contentId) : '';

    if ('useCoupon' in param) paramData.useCoupon = param.useCoupon;
    if ('couponNo' in param) paramData.couponNo = param.couponNo;
    if ('useTmembership' in param) paramData.useTmembership = param.useTmembership;
    if ('tmembershipGrade' in param) paramData.tmembershipGrade = param.tmembershipGrade;
    if ('useOcb' in param) paramData.useOcb = param.useOcb;
    if ('ocbAmount' in param) paramData.ocbAmount = param.ocbAmount;
    if ('ocbSequence' in param) paramData.useOcb = param.ocbSequence;
    if ('ocbPassword' in param) paramData.useOcb = param.ocbPassword;
    if ('useTvpoint' in param) paramData.useTvpoint = param.useTvpoint;
    if ('tvpointAmount' in param) paramData.tvpointAmount = param.tvpointAmount;
    if ('useBpoint' in param) paramData.useBpoint = param.useBpoint;

    paramData.useTvpay = param.useTvpay !== undefined ? param.useTvpay : false;

    if (paramData.useTvpay) {
      paramData.ifSequence = param.ifSequence;
      paramData.tvpayAmount = param.tvpayAmount;
    }

    paramData.usePhone = param.usePhone !== undefined ? param.usePhone : false;
    if (paramData.usePhone) {
      paramData.phoneData = param.phoneData;
    }

    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: JSON.stringify(param.phoneData), dateTime: req_date };
      if ('phoneData' in param) paramData.phoneData = StbInterface.requestEncryptData(data);
    } else {
      if ('phoneData' in param) paramData.phoneData = cryptoUtil.encryptAESByKeyEPS(req_date, JSON.stringify(param.phoneData));
    }

    EPS.EPS111(productId, contentId).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  EPS.request112 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-112');
    let productId = param.productId;
    let contentId = !_.isEmpty(param.contentId) ? encodeURIComponent(param.contentId) : '';

    if ('useCoupon' in param) paramData.useCoupon = param.useCoupon;
    if ('useTmembership' in param) paramData.useTmembership = param.useTmembership;
    if ('useOcb' in param) paramData.useOcb = param.useOcb;
    if ('useTvpoint' in param) paramData.useTvpoint = param.useTvpoint;
    if ('useBpoint' in param) paramData.useBpoint = param.useBpoint;
    if ('useTvpay' in param) paramData.useTvpay = param.useTvpay;
    if ('usePhone' in param) paramData.usePhone = param.usePhone;

    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: JSON.stringify(param.phoneData), dateTime: req_date };
      if ('phoneData' in param) paramData.phoneData = StbInterface.requestEncryptData(data);
    } else {
      if ('phoneData' in param) paramData.phoneData = cryptoUtil.encryptAESByKeyEPS(req_date, JSON.stringify(param.phoneData));
    }

    EPS.EPS112(productId, contentId).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /*
   *  IF-EPS-300 ?????? ????????? ????????????
   * @param {String Object} param = { transactionId }
  */
  EPS.requestEPS300 = function (param, cb) {
    const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    const paramData = EPS.getParam('IF-EPS-300');

    EPS.EPS300.request({
      callback: (status, data, transactionId) => {
        cb(status, data, transactionId);
      },
      transactionId,
      param: paramData
    });
  }
  EPS.request300 = (param = {}) => new Promise((resolve, reject) => {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-300');

    EPS.EPS300.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-401 ????????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.requestEPS401 = function (param, funcCallback) {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-401');

    if ('productId' in param) paramData.productId = param.productId;
    if ('contentId' in param) paramData.contentId = param.contentId;

    EPS.EPS401.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request401 = (param = {}) => new Promise((resolve, reject) => {
    var transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    var paramData = EPS.getParam('IF-EPS-401');

    if ('productId' in param) paramData.productId = param.productId;
    if ('contentId' in param) paramData.contentId = param.contentId;

    EPS.EPS401.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-402 ????????? ?????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId, couponNo }
   * @param {function} funcCallback
   */
  EPS.requestEPS402 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-402');
    let couponNo = param.couponNo;

    EPS.EPS402(couponNo).request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };
  EPS.request402 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-402');
    let couponNo = param.couponNo;

    EPS.EPS402(couponNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /*
      IF-EPS-300 ?????? ????????? ????????????
  */
  EPS.requestEPS300 = function (param, cb) {
    const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    const paramData = EPS.getParam('IF-EPS-300');

    EPS.EPS300.request({
      callback: (status, data, transactionId) => {
        cb(status, data, transactionId);
      },
      transactionId,
      param: paramData
    });
  }

  EPS.request300 = (param = {}) => new Promise((resolve, reject) => {
    const transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    const paramData = EPS.getParam('IF-EPS-300');

    EPS.EPS300.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-402 ????????? B ????????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.requestEPS451 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-451');

    EPS.EPS451.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request451 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-451');

    EPS.EPS451.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-410 ?????? ?????? ??????
   * @param {String Object} param = { transactionId, couponNo }
   * @param {function} funcCallback
   */
  EPS.requestEPS410 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-410');
    let couponNo = param.couponNo;

    EPS.EPS410(couponNo).request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request410 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-410');
    paramData.mac = appConfig.STBInfo.mac;
    let couponNo = param.couponNo;

    EPS.EPS410(couponNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-411 ???????????? ?????? ??????
   * @param {String Object} param = { transactionId, couponNo }
   * @param {function} funcCallback
   */
  EPS.requestEPS411 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-411');
    let couponNo = param.couponNo;

    EPS.EPS411(couponNo).request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request411 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-411');
    let couponNo = param.couponNo;

    EPS.EPS411(couponNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-460 B????????? ?????? ??????
   * @param {String Object} param = { transactionId, pointNo }
   * @param {function} funcCallback
   */
  EPS.requestEPS460 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-460');
    let pointNo = param.pointNo;

    EPS.EPS460(pointNo).request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request460 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-460');
    let pointNo = param.pointNo;

    EPS.EPS460(pointNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-461 B????????? ?????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.request461 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-461');
    paramData.stb_id = appConfig.STBInfo.stbId;

    EPS.EPS461.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-481 B????????? ?????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.request481 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-481');
    paramData.stb_id = appConfig.STBInfo.stbId;
    EPS.EPS481.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-501 ????????? T????????? ?????? ??????
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId ??????ID (????????? ?????? ????????? ????????? ??????, ?????? ????????? ????????? ?????? ?????? ??????)
   * @param {function} funcCallback
   */
  EPS.requestEPS501 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-501');
    paramData.productId = param.productId;

    EPS.EPS501.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: paramData
    });
  };

  EPS.request501 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-501');
    if ('productId' in param) paramData.productId = param.productId;

    EPS.EPS501.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-502 T????????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId, cardNo, birthday, genderCode }
   * @param {function} funcCallback
   */
  EPS.request502 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-502', 'GET');
    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');

    paramData.requestDateTime = req_date;
    paramData.genderCode = param.genderCode;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: param.cardNo, dateTime: req_date }
      if ('cardNo' in param) paramData.cardNo = encodeURIComponent(StbInterface.requestEncryptData(data));

      data = { target: 'eps', cryptType: 'encrypt', text: param.birthday, dateTime: req_date }
      if ('birthday' in param) paramData.birthday = encodeURIComponent(StbInterface.requestEncryptData(data));
    } else {
      if ('cardNo' in param) paramData.cardNo = cryptoUtil.encryptAESByKeyEPS(req_date, param.cardNo);
      if ('birthday' in param) paramData.birthday = cryptoUtil.encryptAESByKeyEPS(req_date, param.birthday);
    }

    EPS.EPS502.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-510 T????????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId, cardNo, birthday, genderCode }
   * @param {function} funcCallback
   */
  EPS.request510 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-510', 'post');
    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');

    paramData.requestDateTime = req_date;
    paramData.genderCode = param.genderCode;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: param.cardNo, dateTime: req_date }
      if ('cardNo' in param) paramData.cardNo = StbInterface.requestEncryptData(data);

      data = { target: 'eps', cryptType: 'encrypt', text: param.birthday, dateTime: req_date }
      if ('birthday' in param) paramData.birthday = StbInterface.requestEncryptData(data);
    } else {
      if ('cardNo' in param) paramData.cardNo = cryptoUtil.encryptAESByKeyEPS(req_date, param.cardNo);
      if ('birthday' in param) paramData.birthday = cryptoUtil.encryptAESByKeyEPS(req_date, param.birthday);
    }

    EPS.EPS510.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-530 T????????? ?????? ?????? ??????
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId ??????ID (????????? ?????? ????????? ????????? ??????, ?????? ????????? ????????? ?????? ?????? ??????)
   * @param {function} funcCallback
   */
  EPS.request530 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-530');

    EPS.EPS530.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-551 ????????? OCB ?????? ?????? ??????
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId ??????ID (????????? ?????? ????????? ????????? ??????, ?????? ????????? ????????? ?????? ?????? ??????)
   * @param {function} funcCallback
   */
  EPS.request551 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-551');

    EPS.EPS551.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-552 OCB ?????? ?????? ??????
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId ??????ID (????????? ?????? ????????? ????????? ??????, ?????? ????????? ????????? ?????? ?????? ??????)
   * @param {function} funcCallback
   */
  EPS.request552 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-552');

    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: param.cardNo, dateTime: req_date }
      if ('cardNo' in param) paramData.cardNo = encodeURIComponent(StbInterface.requestEncryptData(data));

      data = { target: 'eps', cryptType: 'encrypt', text: param.password, dateTime: req_date }
      if ('password' in param) paramData.password = encodeURIComponent(StbInterface.requestEncryptData(data));
    } else {
      if ('cardNo' in param) paramData.cardNo = encodeURIComponent(cryptoUtil.encryptAESByKeyEPS(req_date, param.cardNo));
      if ('password' in param) paramData.password = encodeURIComponent(cryptoUtil.encryptAESByKeyEPS(req_date, param.password));
    }

    if ('sequence' in param) paramData.sequence = param.sequence;

    EPS.EPS552.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-560 OCB ?????? ?????? ??????
   * @param {String Object} param = { transactionId(opt), cardNo, password, sequence }
   * @param {String} param.productId ??????ID (????????? ?????? ????????? ????????? ??????, ?????? ????????? ????????? ?????? ?????? ??????)
   * @param {function} funcCallback
   */
  EPS.request560 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-560');

    const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
    paramData.requestDateTime = req_date;

    if (appConfig.runDevice) {
      let data = { target: 'eps', cryptType: 'encrypt', text: param.cardNo, dateTime: req_date }
      if ('cardNo' in param) paramData.cardNo = StbInterface.requestEncryptData(data);

      data = { target: 'eps', cryptType: 'encrypt', text: param.password, dateTime: req_date }
      if ('password' in param) paramData.password = StbInterface.requestEncryptData(data);
    } else {
      if ('cardNo' in param) paramData.cardNo = cryptoUtil.encryptAESByKeyEPS(req_date, param.cardNo);
      if ('password' in param) paramData.password = cryptoUtil.encryptAESByKeyEPS(req_date, param.password);
    }

    // if ('sequence' in param) paramData.sequence = param.sequence;

    EPS.EPS560(param.sequence).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-570 OCB ?????? ?????? ??????
   * @param {String Object} param = { transactionId, cardNo, password, isMaster, masterNo }
   * @param {function} funcCallback
   */
  EPS.request570 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-570', 'post');
    let masterNo = param.masterNo;

    if ('cardNo' in param) paramData.cardNo = param.cardNo;
    if ('password' in param) paramData.password = param.password;
    if ('isMaster' in param) paramData.isMaster = param.isMaster;

    EPS.EPS570(masterNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-580 OCB ?????? ?????? ??????
   * @param {String Object} param = { transactionId, masterNo }
   * @param {function} funcCallback
   */
  EPS.request580 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-580', 'post');
    let masterNo = param.masterNo;

    EPS.EPS580(masterNo).request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });

  /**
   * IF-EPS-601 TV????????? ?????? ??????
   * @param {String Object} param = { transactionId }
   * @param {function} funcCallback
   */
  EPS.requestEPS601 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'AAA' : param.transactionId;
    let paramData = EPS.getParam('IF-EPS-601');

    EPS.EPS601.request({
      callback: (status, data, transactionId) => {
        EPS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: paramData
    });
  });
})(EPS);

export function EPS() {
  return EPS;
}
