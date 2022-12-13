// import _ from "lodash";
import appConfig from "../../config/app-config";
import CryptoJS from "crypto-js";
import StbInterface from './../stbInterface';

import { Core } from "Supporters";
/**
 * network 사용시 사용되는 Base Code
 *  @namespace COMMON 
 * */

// var COMMON = COMMON || {};

(function () {
    /**
     * @memberof COMMON
     * @param {object} apiInfo - API 연결 정보
     * @desc 요청한 apiInfo의 API 연결 정보로 class 사용법 : new cs(apiInfo)
     * @example
     */
    COMMON.network = function (apiInfo) {
        this.protocol = apiInfo.protocol;
        this.port = apiInfo.port;
        // this.path = apiInfo.path;
        this.apiName = apiInfo.apiName;
        this.type = apiInfo.type;
        this.retry = (apiInfo.retry) ? apiInfo.retry : 0;
        this.retryRecover = this.retry;
        this.cancelTimeout = (apiInfo.cancelTimeout) ? apiInfo.cancelTimeout : 0;
        this.setRequestHeader = apiInfo.setRequestHeader;
        this.param = '';
        this.IF = '';
        this.serverName = apiInfo.serverName;
        this.ip = '';
        this.addition = apiInfo.addition;
        this.gw = apiInfo.gw;
        if (typeof apiInfo.ip === 'object') {
            apiInfo.ip.division = apiInfo.category;
            for (var prop in apiInfo.ip) {
                this.ip += apiInfo.ip[prop];
            }
        } else {
            this.ip = apiInfo.ip;
        }

        if (this.port != null && this.port.length > 0)
            this.url = this.protocol + '://' + this.ip + ':' + this.port + this.apiName;
        else
            this.url = this.protocol + '://' + this.ip + this.apiName;

        /**
         * @memberof Utility
         * @function request
         * @param {object} requestInfo - request 정보
         * @property {object} requestInfo.param - request param 정보 <br> ex : {paramName : value, ...}
         * @property {string} requestInfo.transactionId - request에 대한 response를 확인하기 위한 고유 정보
         * @property {function} requestInfo.callback - response를 결과를 전달하기 위한 callback 함수
         * @desc 요청한 request 정보로 XMLHttpRequest 통신
         */
        this.request = function (requestInfo) {
            // if (_.isEmpty(appConfig.STBInfo.SmartSTB.stbId) || _.isUndefined(appConfig.STBInfo.SmartSTB.stbId)) {
            //     if (window.tvExt !== undefined) {
            //         appConfig.STBInfo.SmartSTB.stbId = window.tvExt.device.system.getProperty('STBID');
            //         appConfig.STBInfo.stbId = window.tvExt.device.system.getProperty('STBID');
            //         appConfig.STBInfo.SmartSTB.mac = window.tvExt.device.system.getProperty('mac');
            //         appConfig.STBInfo.mac = window.tvExt.device.system.getProperty('mac');
            //         appConfig.STBInfo.tokenGW = window.tvExt.device.system.getProperty('tokenGW');
            //         let ip = window.tvExt.device.system.getProperty('Client_IP');
            //         if (ip !== undefined) {
            //             appConfig.STBInfo.Client_IP = ip;
            //         }
            //         if (appConfig.runMode === '-dev' || appConfig.runMode === '-stg') {
            //             if (!_.isUndefined( window.tvExt.device.system.getProperty('apiKey'))) {
            //                 appConfig.STBInfo.Api_key = window.tvExt.device.system.getProperty('apiKey');
            //             }
            //            // core._log('[NATIVE 1 MIDDLEWARE AFTER]', appConfig.STBInfo.Api_key,' || ' , window.tvExt.device.system.getProperty('apiKey'))
            //         }
            //     } else {
            //        // core._log('------------------[window.tvExt is undefined]-----------------------')
            //     }
            // }

            var httpRequest = new XMLHttpRequest();
            // var prop, checkParam = '';
            this.param = ''; //param 초기화
            this.IF = requestInfo.param.IF ? requestInfo.param.IF : '';

            var dateFormat = require('dateformat');
            var date = new Date();
            var date_formatted = dateFormat(date, 'yyyymmddHHMMss');
            var timeStamp = date_formatted + '.' + date.getMilliseconds();
            var strTemp = appConfig.STBInfo.tokenGW + timeStamp;
            var encrypt = CryptoJS.SHA256(strTemp);
            var authVal = CryptoJS.enc.Base64.stringify(encrypt);

            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            var uuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

            if (this.port != null && this.port.length > 0) {
                this.url = this.protocol + '://' + this.ip + ':' + this.port + this.apiName;
            } else {
                this.url = this.protocol + '://' + this.ip + this.apiName;
            }

            if (requestInfo.param !== undefined) {
                if (this.type === 'GET') {
                    for (prop in requestInfo.param) {
                        this.param += prop + '=' + requestInfo.param[prop] + '&';
                    }
                    this.param = this.param.substr(0, this.param.length - 1);

                    // 추후 필요하면 추가하겠지만, 필요없으면 삭제예정
                    // SCS, METV확인필요
                    // let ifNum = _.isUndefined(requestInfo.param['IF']) ? requestInfo.param['if'] : requestInfo.param['IF'];
                    // if (ifNum == "IF-SCS-PRODUCT-001" ||
                    //     ifNum == "IF-ME-051" || ifNum == "IF-ME-032" || ifNum == 'IF-XPG-RCMD-002') {
                    //     this.param += "&G2TimeStamp=" + val;
                    // }
                    //     checkParam = this.param;
                } else {
                    this.param = requestInfo.param;
                    //     for (prop in requestInfo.param) {
                    //         checkParam += prop + '=' + requestInfo.param[prop] + '&';
                    //     }
                    //     checkParam = checkParam.substr(0, checkParam.length - 1);

                    // 추후 필요하면 추가하겠지만, 필요없으면 삭제예정
                    // SCS, METV확인필요
                    // let ifNum = _.isUndefined(requestInfo.param['IF']) ? requestInfo.param['if'] : requestInfo.param['IF'];
                    // if (ifNum == "IF-SCS-PRODUCT-001"  ||
                    //     ifNum == "IF-ME-051" || ifNum == "IF-ME-032" || ifNum == 'IF-XPG-RCMD-002') {
                    //     checkParam += "&G2TimeStamp=" + val;
                    // }
                }
            };
            httpRequest.timeout = this.cancelTimeout;
            httpRequest.serverName = this.serverName;
            // var url = this.url;
            // var param = this.param;
            // var retry = this.retry;
            if (this.type === 'GET') {
                this.url = this.url + '?';
                httpRequest.open('GET', this.url + this.param, true);
                if (this.gw) {
                    httpRequest.setRequestHeader("content-type", "application/json;charset=utf-8");
                    httpRequest.setRequestHeader("Client_ID", appConfig.STBInfo.stbId);
                    httpRequest.setRequestHeader("Client_IP", appConfig.STBInfo.Client_IP);
                    httpRequest.setRequestHeader("TimeStamp", timeStamp);
                    httpRequest.setRequestHeader("Auth_Val", authVal);
                    httpRequest.setRequestHeader("Api_Key", appConfig.STBInfo.Api_key);
                    httpRequest.setRequestHeader("UUID", uuid);
                    httpRequest.setRequestHeader("Trace", appConfig.STBInfo.Trace);
                    httpRequest.setRequestHeader("accept", "application/json;charset=utf-8");
                } else {
                    httpRequest.setRequestHeader("content-type", "application/json;charset=utf-8");
                }
                httpRequest.send();
            } else {
                httpRequest.open('POST', this.url, true);
                if (this.gw) {
                    httpRequest.setRequestHeader("content-type", "application/json;charset=utf-8");
                    httpRequest.setRequestHeader("Client_ID", appConfig.STBInfo.stbId);
                    httpRequest.setRequestHeader("Client_IP", appConfig.STBInfo.Client_IP);
                    httpRequest.setRequestHeader("TimeStamp", timeStamp);
                    httpRequest.setRequestHeader("Auth_Val", authVal);
                    httpRequest.setRequestHeader("Api_Key", appConfig.STBInfo.Api_key);
                    httpRequest.setRequestHeader("UUID", uuid);
                    httpRequest.setRequestHeader("Trace", appConfig.STBInfo.Trace);
                    httpRequest.setRequestHeader("accept", "application/json;charset=utf-8");
                    if (this.addition === 'delete') {
                        httpRequest.setRequestHeader("method", "delete");
                    }
                } else {
                    httpRequest.setRequestHeader("content-type", "application/json");  //  2018년 5월 4일 금요일 오후 5:18 지나웍스 김병현씨 요청으로 변경
                }

                if (typeof this.param === 'string') {
                    httpRequest.send(this.param);
                } else {
                    // core._log('this.param : ', JSON.stringify(this.param));
                    httpRequest.send(JSON.stringify(this.param));
                }
                if (requestInfo.isSendLog !== false) {
                    //cs.serverLog('POST / ' + this.IF + ' / ' + this.url + '?' + this.param, 'HE');
                } else {
                    if (this !== undefined && typeof this === 'object') {
                        this.IF = 'serverLog';
                    }
                }
            }

            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        console.info('[SKB G2] httpRequest.responseURL=' + httpRequest.responseURL);

                        this.retry = this.retryRecover;
                        requestInfo.callback(httpRequest.status, httpRequest.responseText, requestInfo.transactionId);
                    } else if (httpRequest.status === 590) {
                        // console.log('[SKB G2] Network return type check :', httpRequest.response);
                        let arr = JSON.parse(httpRequest.response);
                        console.error(' [SKB G2]WEB UI ERROR LOG - ', ' [RESULT] : ', arr.result, ' | [REASON] : ', arr.reason)

                        if (arr.result === "8002") {
                            StbInterface.requestToken();  //  stb에 새로운 토큰 요청
                        }
                        Core.inst().showToast(arr.result, arr.reason, 10000);  // route 에러 토스트로 표시
                        if (appConfig.runDevice === false) {
                            // [2018.03.16] PC 모드인 경우는 callback함수 호출해주도록 함.
                            requestInfo.callback(httpRequest.status, httpRequest.responseText, requestInfo.transactionId);
                        }
                        StbInterface.isqmsInfo(this.serverName, this.responseURL, '0', this.statusText);
                    } else {
                        console.error(' [SKB G2]WEB UI ERROR LOG - ', ' [status] : ', httpRequest.status, ' | [response] : ', httpRequest.response)
                        StbInterface.isqmsInfo(this.serverName, this.responseURL, '2', this.statusText);

                        // gslee, 사용 안함. networkRequestMap.remove(url + checkParam + requestInfo.transactionId);
                        // if (this.serverName == 'XPG' && appConfig.app.proxyMode != 'off' && this.retry > 0) {
                        //     var proxy = undefined;
                        //     if (appConfig.app.proxyMode == 'live') {
                        //         proxy = _.cloneDeep(appConfig.headEnd.Proxy.Live);
                        //     } else {
                        //         proxy = _.cloneDeep(appConfig.headEnd.Proxy.Test);
                        //     }

                        //     if (url.indexOf(proxy.ip) != -1) {
                        //         if (this.ip == proxy.ip) {
                        //             if (appConfig.app.headEndMode == 'live') {
                        //                 appConfig.app.proxyMode = 'off';
                        //                 this.protocol = appConfig.headEnd.XPG.Live.protocol;
                        //                 this.ip = appConfig.headEnd.XPG.Live.ip;
                        //                 this.port = appConfig.headEnd.XPG.Live.port;
                        //             } else {
                        //                 appConfig.app.proxyMode = 'off';
                        //                 this.protocol = appConfig.headEnd.XPG.Test.protocol;
                        //                 this.ip = appConfig.headEnd.XPG.Test.ip;
                        //                 this.port = appConfig.headEnd.XPG.Test.port;
                        //             }
                        //             appConfig.path.imageServer = Utils.getImageUrl(Utils.IMAGE_SIZE_VER);
                        //             appConfig.headEnd.IGS.Live.url = appConfig.headEnd.IGSIMAGE.url;
                        //         }
                        //         this.retry--;
                        //         this.request(requestInfo);
                        //         XPG.reset();
                        //     } else {
                        //         this.retry--;
                        //         this.request(requestInfo);
                        //         XPG.reset();
                        //     }
                        // } else 
                        if (this.retry > 0) {
                            //  console.info('[retry] : ' + this.retry + ' / ' + url + '?' + param);
                            this.retry--;
                            this.request(requestInfo);
                        } else {
                            this.retry = this.retryRecover;
                            requestInfo.callback(httpRequest.status, httpRequest.statusText, requestInfo.transactionId);
                        }
                    }
                }
            };
        };
    };
})();

export function COMMON() {
    return COMMON;
}