import appConfig from '../../config/app-config';
import cloneDeep from 'lodash/cloneDeep';
import { COMMON } from './COMMON';

const TYPE_POST = 'POST';

(function () {
  let serverInfo = {};

  if (appConfig.app.headEndMode === 'live') {
    serverInfo = cloneDeep(appConfig.headEnd.PNS.Live);
  } else {
    serverInfo = cloneDeep(appConfig.headEnd.PNS.Test);
  }

  let connectInfo = {
    async: true,
    retry: appConfig.headEnd.retry,
    cancelTimeout: appConfig.headEnd.cancelTimeout,
    serverName: 'PNS',
    addition: '',
    gw: true,
  };

  function getInfo(apiName, method) {
    let info = serverInfo;

    for (let prop in connectInfo) {
      info[prop] = connectInfo[prop];
    }

    info.type = method;
    info.apiName = apiName;
    return info;
  }

  PNS.reset = function () {
    serverInfo = cloneDeep(appConfig.headEnd.PNS.Live);
    //PNS.PNS301 = new COMMON.network(getInfo('/kidshomeeventList?method=getEventList', TYPE_POST));
    //PNS.PNS304 = new COMMON.network(getInfo('/kidseventList?method=getEventList', TYPE_POST));
    //PNS.PNS305 = new COMMON.network(getInfo('/kidseventCnts?method=getEventCnts', TYPE_POST));
    PNS.PNS501 = new COMMON.network(getInfo(serverInfo.path + '/customer/list/notice', TYPE_POST));
    PNS.PNS502 = new COMMON.network(getInfo(serverInfo.path + '/customer/detail/notice', TYPE_POST));
    PNS.PNS503 = new COMMON.network(getInfo(serverInfo.path + '/customer/list/event', TYPE_POST));
    PNS.PNS504 = new COMMON.network(getInfo(serverInfo.path + '/customer/detail/event', TYPE_POST));
  };

  //PNS.PNS301 = new COMMON.network(getInfo('/kidshomeeventList?method=getEventList', TYPE_POST));
  //PNS.PNS304 = new COMMON.network(getInfo('/kidseventList?method=getEventList', TYPE_POST));
  //PNS.PNS305 = new COMMON.network(getInfo('/kidseventCnts?method=getEventCnts', TYPE_POST));
  PNS.PNS501 = new COMMON.network(getInfo(serverInfo.path + '/customer/list/notice', TYPE_POST));
  PNS.PNS502 = new COMMON.network(getInfo(serverInfo.path + '/customer/detail/notice', TYPE_POST));
  PNS.PNS503 = new COMMON.network(getInfo(serverInfo.path + '/customer/list/event', TYPE_POST));
  PNS.PNS504 = new COMMON.network(getInfo(serverInfo.path + '/customer/detail/event', TYPE_POST));

  PNS.getParam = function (IF) {
    let paramInfo = {
      ver: '1.0',
      response_format: 'json',
      //'stb_id': encodeURIComponent(appConfig.STBInfo.stbId),
      stb_id: appConfig.STBInfo.stbId,
      stb_model: appConfig.STBInfo.stbModel,
      sw_ver: appConfig.STBInfo.swVersion,
      ui_ver: '5.0.0',
      ui_name: appConfig.STBInfo.ui_name,
      cug: '0'
    };

    // 차후 데이터 관리를 위하여 공통으로 사용하는 데이터는 param에 지정하여 주세요.
    /*
    let param = {
      'IF': IF,
      'ver': paramInfo.ver,
      'response_format': paramInfo.response_format,
      'stb_id': paramInfo.stb_id,
      'stb_model': paramInfo.stb_model
    };
    */

    let param = {
      IF: IF,
      ...paramInfo
    };

    return param;
  };

  PNS.handleResult = function (resolve, reject, result) {
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
   * IF-PNS-501 공지 리스트 요청
   * @param {*} param 
   * @param {*} funcCallback 
   */
  PNS.requestPNS501 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS501' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-501');
    const defaultParam = {
      id_package: '20',
      genre_code: '0',
      //realtv_ver: '201804041301',
      //customer_ver:'201804041301'
      realtv_ver: '0',      // TODO: 규격서에 default가 "0"이라고 되어 있으나 확인 필요
      customer_ver: '0'
    }
    const parameter = Object.assign(commonParam, defaultParam, param ? param : {});

    PNS.PNS501.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: parameter
    });
  }

  PNS.request501 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS501' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-501');
    const defaultParam = {
      id_package: '20',
      genre_code: '0',
      realtv_ver: '201804041301',
      customer_ver: '201804041301'
    };
    const parameter = Object.assign(commonParam, defaultParam, param ? param : {});

    PNS.PNS501.request({
      callback: (status, data, transactionId) => {
        PNS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: parameter
    });
  });

  /**
   * IF-PNS-502 공지 상세 정보 요청
   * @param {*} param 
   * @param {*} funcCallback 
   * id(필수): 공지 ID
   */
  PNS.requestPNS502 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS502' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-502');
    const defaultParam = {};
    const parameter = Object.assign(commonParam, defaultParam, param ? { id: param } : {});

    PNS.PNS502.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: parameter
    });
  }

  PNS.request502 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS502' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-502');
    const defaultParam = {};
    const parameter = Object.assign(commonParam, defaultParam, param ? { id: param } : {});

    PNS.PNS502.request({
      callback: (status, data, transactionId) => {
        PNS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: parameter
    });
  });

  /**
   * IF-PNS-503 이벤트 리스트 요청
   * @param {*} param 
   * @param {*} funcCallback 
   */
  PNS.requestPNS503 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS503' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-503');
    const defaultParam = {
      id_package: '20',
      list_ver: '201804301600',
      etype: '1'
    }
    const parameter = Object.assign(commonParam, defaultParam, param ? param : {});

    PNS.PNS503.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: parameter
    });
  }

  PNS.request503 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS503' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-503');
    const defaultParam = {
      id_package: '20',
      list_ver: '201804301600',
      etype: '1'
    }
    const parameter = Object.assign(commonParam, defaultParam, param ? param : {});

    PNS.PNS503.request({
      callback: (status, data, transactionId) => {
        PNS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: parameter
    });
  });

  /**
   * IF-PNS-504 이벤트 상세 정보 요청
   * @param {*} param 
   * @param {*} funcCallback 
   * id(필수): 이벤트 ID
   */
  PNS.requestPNS504 = function (param, funcCallback) {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS504' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-504');
    const defaultParam = {};
    const parameter = Object.assign(commonParam, defaultParam, param ? { id: param } : {});

    PNS.PNS504.request({
      callback: (status, data, transactionId) => {
        funcCallback(status, data, transactionId);
      },
      transactionId: transactionId,
      param: parameter
    });
  }

  PNS.request504 = (param = {}) => new Promise((resolve, reject) => {
    let transactionId = param.transactionId === undefined || param.transactionId === '' ? 'PNS504' : param.transactionId;
    let commonParam = PNS.getParam('IF-PNS-504');
    const defaultParam = {};
    const parameter = Object.assign(commonParam, defaultParam, param ? { id: param } : {});

    PNS.PNS504.request({
      callback: (status, data, transactionId) => {
        PNS.handleResult(resolve, reject, { status, data, transactionId });
      },
      transactionId: transactionId,
      param: parameter
    });
  });

})(PNS);

export function PNS() {
  return PNS;
}