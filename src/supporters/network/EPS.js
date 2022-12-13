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
   * IF-EPS-100 구매 가능 B포인트 목록 조회
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
   * 핸드폰 구매 인증번호 요청
   * data = {
   *  productId: 구매할 상품 ID
   *  phoneData: 핸드폰 결제를 위한 암호화된 Data String
   *      = {
   *          corpCode: 통신사 타입(SKT, KTF, LGU)
   *          registNumber: 주민번호 앞부터 7자리
   *          phoneNumber: 핸드폰 번호(숫자형식만 허용)
   *          amount: 구매금액(부가세 제외)
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
   * B포인트 구매 요청
   * @param {String} param = {
   *      bpointNumber: B포인트 정책번호
   *      useCoupon: 쿠폰 사용유무 (사용: true, 미사용: false)
   *      couponNo: 결제에 사용할 쿠폰 번호 (쿠폰 사용시 필수)
   *      useTmembership: T멤버쉽 사용 유무 (사용: true, 미사용: false)
   *      tmembershipGrade: T멤버십 등급 코드(생략 시 default 할인 적용)
   *      useOcb: OCB 사용 유무 (사용: true, 미사용: false)
   *      ocbSequence: OCB 카드 순번 (1 ~ 3)
   *      ocbPassword: OCB 결제를 위한 패스워드
   *      useTvpoint: TV 포인트 사용 유무 (사용: true, 미사용: false)
   *      tvpointAmount: TV 포인트 결제 금액 (TV 포인트 사용시 필수, 부가세 제외)
   *      useBpoint: B포인트 사용 유무 (사용: true, 미사용: false)
   *      useTvpay: TV페이 사용 유무 (사용: true, 미사용: false)
   *      ifSequence: TV Hub 연동 순번 (TV페이 사용시 필수, 부가세 제외)
   *      tvpayAmount: TV페이 결제금액 (TV페이 사용시 필수, 부가세 제외)
   *      usePhone: 핸드폰 결제 사용 유무 (사용: true, 미사용: false)
   *      phoneData: 핸드폰 결제를 위한 암호화된 DataString
   *          : {
   *              corpCode:
   *              registNumber: 주민번호 앞 7자리
   *               phoneNumber: 핸드폰 번호
   *               amount: 구매금액(부가세 제외)
   *               corpTypeCode: 핸드폰 구매시 인증 데이터1 (EPS-105응답데이터)
   *               authKey1: 핸드폰 구매시 인증 데이터1 (EPS-105응답데이터) (Gateway코드, hppcotype)
   *               authKey2: 핸드폰 구매시 인증 데이터1 (EPS-105응답데이터) (인증데이터, hppphoneid)
   *               authKey3: 핸드폰 구매시 인증 데이터1 (EPS-105응답데이터) (인증데이터, hppauthserial)
   *               authNumber: MMS로 받은 인증번호
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
   *  IF-EPS-300 전체 포인트 정보조회
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
   * IF-EPS-401 등록된 쿠폰 목록 조회
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
   * IF-EPS-402 등록된 쿠폰 목록 상세 조회
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
      IF-EPS-300 전체 포인트 정보조회
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
   * IF-EPS-402 등록된 B 포인트 목록 조회
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
   * IF-EPS-410 쿠폰 등록 요청
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
   * IF-EPS-411 기프티콘 등록 요청
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
   * IF-EPS-460 B포인트 등록 요청
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
   * IF-EPS-461 B포인트 자동 차감 설정 요청
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
   * IF-EPS-481 B포인트 자동 차감 해제 요청
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
   * IF-EPS-501 등록된 T멤버쉽 정보 조회
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId 상품ID (상품에 대한 할인율 조회시 사용, 카드 목록만 조회할 경우 생략 가능)
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
   * IF-EPS-502 T멤버쉽 카드 조회 요청
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
   * IF-EPS-510 T멤버쉽 카드 등록 요청
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
   * IF-EPS-530 T멤버쉽 카드 해제 요청
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId 상품ID (상품에 대한 할인율 조회시 사용, 카드 목록만 조회할 경우 생략 가능)
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
   * IF-EPS-551 등록된 OCB 카드 목록 조회
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId 상품ID (상품에 대한 할인율 조회시 사용, 카드 목록만 조회할 경우 생략 가능)
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
   * IF-EPS-552 OCB 카드 정보 조회
   * @param {String Object} param = { transactionId, productId }
   * @param {String} param.productId 상품ID (상품에 대한 할인율 조회시 사용, 카드 목록만 조회할 경우 생략 가능)
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
   * IF-EPS-560 OCB 카드 등록 요청
   * @param {String Object} param = { transactionId(opt), cardNo, password, sequence }
   * @param {String} param.productId 상품ID (상품에 대한 할인율 조회시 사용, 카드 목록만 조회할 경우 생략 가능)
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
   * IF-EPS-570 OCB 카드 수정 요청
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
   * IF-EPS-580 OCB 카드 해제 요청
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
   * IF-EPS-601 TV포인트 정보 조회
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
