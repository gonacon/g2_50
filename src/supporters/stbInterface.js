import { Communicate as cm } from './communicate';
// import _ from 'lodash';

import appConfig from '../config/app-config';
import { utility } from '../utils/utility';
import EpgData from '../routes/liveTv/organization/epgData';
import constants, { MENU_NAVI, PATH, STB_PROP, STB_TYPE, STB_COMMAND, GNB_CODE } from 'Config/constants';
import Core from './core';
import { CTSInfo } from 'Supporters/CTSInfo';
import BuyBill from './../routes/buy/view/BuyBill';
import { isEmpty, isFunction } from 'lodash';
import HistoryManager from 'Supporters/history';
import Utils from 'Util/utils';

const TIMEUNIT = 1800;         //30min
// const TIMEUNIT = 300;         //5min
const TIME2PIXEL = 1425 / 5400;  //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기

let callbackMap = new Map();

/***************************/
/* Native-WebApp Interface */
/***************************/
// (function() {
export default class StbInterface {

    static gnbMenuList = [];

    static playData = {};

    static getProperty(key, defaultVal = '') {
        if (appConfig.runDevice) {
            if (utility.checkNullValue(window.tvExt)) {
                return window.tvExt.device.system.getProperty(key);
            }
        } else {
            return localStorage.getItem(key, defaultVal);
        }
    }

    static setProperty(key, value) {
        if (appConfig.runDevice) {
            if (utility.checkNullValue(window.tvExt)) {
                window.tvExt.device.system.setProperty(key, value);
            }
        } else {
            return localStorage.setItem(key, value);
        }
    }

    static setSTBInfo(stbInfo) {
        appConfig.STBInfo.uiVersion = utility.checkNullValue(stbInfo.uiVersion) ? stbInfo.uiVersion : '';
        appConfig.STBInfo.cug = utility.checkNullValue(stbInfo.cug) ? stbInfo.cug : '';
        appConfig.STBInfo.idPackage = utility.checkNullValue(stbInfo.idPackage) ? stbInfo.idPackage : '';
        appConfig.STBInfo.ispType = '1'; //16.05.04 무조건 1로 해달라고 김응균 매니저님 요청//crytoUtil.decryptedByKey(stbInfo.stbId, stbInfo.ispType);
        appConfig.STBInfo.favVodList = utility.checkNullValue(stbInfo.favVodList) ? stbInfo.favVodList : '';
        appConfig.STBInfo.favAppList = utility.checkNullValue(stbInfo.favAppList) ? stbInfo.favAppList : '';
        appConfig.STBInfo.favChannelList = utility.checkNullValue(stbInfo.favChannelList) ? stbInfo.favChannelList : '';
        appConfig.STBInfo.userIdSaved = utility.checkNullValue(stbInfo.userIdSaved) ? stbInfo.userIdSaved : '';
        appConfig.STBInfo.bPoint = utility.checkNullValue(stbInfo.bPoint) ? stbInfo.bPoint : '0';
        appConfig.STBInfo.newBpoint = stbInfo.newBpoint ? 'Y' : 'N';
        appConfig.STBInfo.coupon = (utility.checkNullValue(stbInfo.coupon) === false) ? '0' : stbInfo.coupon;
        appConfig.STBInfo.couponNew = stbInfo.couponNew ? 'Y' : 'N';
        appConfig.STBInfo.postcode = utility.checkNullValue(stbInfo.postcode) ? stbInfo.postcode : '';
        appConfig.STBInfo.pssUseAgree = utility.checkNullValue(stbInfo.pssUseAgree) ? stbInfo.pssUseAgree : '';
        appConfig.STBInfo.serverList = utility.checkNullValue(stbInfo.serverList) ? stbInfo.serverList : '';
        appConfig.STBInfo.ppmList = utility.checkNullValue(stbInfo.ppmList) ? stbInfo.ppmList : '';
        appConfig.STBInfo.blockChList = utility.checkNullValue(stbInfo.blockChList) ? stbInfo.blockChList : '';
        appConfig.STBInfo.migrationMeTv = utility.checkNullValue(stbInfo.migrationMeTv) ? stbInfo.migrationMeTv : '';

        appConfig.STBInfo.favVodListMap = [];
        appConfig.STBInfo.favChannelListMap = [];
        appConfig.STBInfo.favAppListMap = [];
        appConfig.STBInfo.ppmListMap = [];
        appConfig.STBInfo.blockChListMap = [];

        let nowDate = new Date().getTime() - (600 * 1000);

        console.log('nowDate=', nowDate);
        // 조회 시간 10분전으로 셋팅
        StbInterface.setProperty(STB_PROP.COUPONS_POINT_REQUEST_TIME, nowDate);

        let tempArr, tempArr2;

        if (utility.checkNullValue(appConfig.STBInfo.favVodList)) {
            tempArr = appConfig.STBInfo.favVodList.split('|');
            for (let i = 0; i < tempArr.length; i++) {
                appConfig.STBInfo.favVodListMap.push(tempArr[i]);
            }
        }

        if (utility.checkNullValue(appConfig.STBInfo.favChannelList)) {
            tempArr = appConfig.STBInfo.favChannelList.split('|');
            for (let i = 0; i < tempArr.length; i++) {
                tempArr2 = tempArr[i].split('^');
                appConfig.STBInfo.favChannelListMap.push(tempArr2[0]);
            }
        }

        if (utility.checkNullValue(appConfig.STBInfo.favAppList)) {
            tempArr = appConfig.STBInfo.favAppList.split('|');
            for (let i = 0; i < tempArr.length; i++) {
                appConfig.STBInfo.favAppListMap.push(tempArr[i]);
            }
        }

        if (utility.checkNullValue(appConfig.STBInfo.ppmList)) {
            tempArr = appConfig.STBInfo.ppmList.split('|');
            for (let i = 0; i < tempArr.length; i++) {
                appConfig.STBInfo.ppmListMap.push(tempArr[i]);
            }
        } else {
            appConfig.STBInfo.ppmList = '';
        }

        if (utility.checkNullValue(appConfig.STBInfo.blockChList)) {
            tempArr = appConfig.STBInfo.blockChList.split('|');
            for (let i = 0; i < tempArr.length; i++) {
                appConfig.STBInfo.blockChListMap.push(tempArr[i]);
            }
        }

        if (appConfig.runDevice === true && appConfig.app.headEndMode === 'live') {
            if (utility.checkNullValue(appConfig.STBInfo.serverList)) {
                // stb에서 받는 serverList 형식
                // const serverList = "wscs^https://ems.hanafostv.com:8443^/ios/v5'|pns^http://popnotice.hanafostv.com:8090|image^http://stimage.hanafostv.com:8080|smtdv^http://smd.hanafostv.com:8080|scs^https://ems.hanafostv.com:8443|gw^http://agw-dev.sk-iptv.com:8080|gws^https://agw-dev.sk-iptv.com:8443|webclienthome^http://agw-dev.sk-iptv.com:8080/ui5web/v5/|dest^l7xx4fa00822f3b34d04baa103b3a80d466b|";
                tempArr = appConfig.STBInfo.serverList.split('|');
                var protocol = '', ip = '', port = '', tempArr3, tempArr4, serverName;

                for (let i = 0; i < tempArr.length; i++) {
                    tempArr2 = tempArr[i].split('^');
                    tempArr3 = tempArr2[1] && tempArr2[1].split('://');
                    tempArr4 = tempArr3 && tempArr3[1] && tempArr3[1].split(':');
                    protocol = tempArr3 && tempArr3[0];
                    ip = tempArr4 && tempArr4[0];
                    port = tempArr4 && tempArr4[1];
                    serverName = tempArr2[0];

                    // if (!utility.checkNullValue(tempArr2)) { //// 20170211_YD : 값이 없는 경우가 있다.
                    //     continue;
                    // }
                    console.log('serverName=' + serverName, appConfig.headEnd[serverName]);
                    if (isEmpty(appConfig.headEnd[serverName])) {
                        continue;
                    }
                    if ('IMAGE' === serverName) {
                        if (!isEmpty(protocol)) {
                            appConfig.headEnd.IMAGE.url = protocol + '://' + ip + ':' + port + '/thumbnails/iip';
                        }
                        // http://stimageqa.hanafostv.com:8080/thumbnails/iip
                    } else {
                        if (!isEmpty(protocol)) {
                            appConfig.headEnd[serverName].Live.protocol = protocol;
                            appConfig.headEnd[serverName].Live.ip = ip;
                            appConfig.headEnd[serverName].Live.port = port;
                        }
                    }

                    // appConfig.headEnd.NXPG.Live.protocol = tempArr2[1];
                    // switch (tempArr2[0]) {
                    //     case 'dest':
                    //     break;
                    // default:
                    //     break;
                    // }
                }
            }
        }
    }

    /**
     * Property Key String
     */
    static middleWare() {
        if (utility.checkNullValue(window.tvExt)) {
            console.log('start getProperty');
            appConfig.STBInfo.stbId = this.getProperty(STB_PROP.STB_ID); // STB 고유 아이디
            appConfig.STBInfo.hashId = this.getProperty(STB_PROP.HASH_ID); // stbId를 SHA-256으로 암호화한 데이터
            appConfig.STBInfo.mac = this.getProperty(STB_PROP.MAC); // STB MAC 주소
            appConfig.STBInfo.stbModel = this.getProperty(STB_PROP.STB_MODEL); // STB 모델
            appConfig.STBInfo.swVersion = this.getProperty(STB_PROP.SW_VERSION); // STB SW 버전
            appConfig.STBInfo.regionCode = this.getProperty(STB_PROP.REGION_CODE); // 지역 코드
            // appConfig.STBInfo.areaCode = this.getProperty(STB_PROP.AREA_CODE); // 지역코드
            appConfig.STBInfo.adultMovieMenu = this.getProperty(STB_PROP.ADULT_MOVIE_MENU); // 19 영화 표기 여부 //설정값 (표기함:1, 표기안함:0, 메뉴삭제 : 2)
            appConfig.STBInfo.erosMenu = this.getProperty(STB_PROP.EROS_MENU); // 19 플러스 표기 여부 // 설정값 (표기함:1, 표기안함:0, 메뉴삭제 : 2)
            appConfig.STBInfo.purchaseCertification = this.getProperty(STB_PROP.PURCHASE_CERTIFICATION); // 구매인증 설정 기능 여부 //설정값 (사용:1, 사용안함:0)
            appConfig.STBInfo.childrenSeeLimit = this.getProperty(STB_PROP.CHILDREN_SEE_LIMIT); // 시청연령제한 (0, 7, 12, 15, 19)
            appConfig.STBInfo.consecutivePlay = this.getProperty(STB_PROP.CONSECUTIVE_PLAY); // 시리즈 연속 시청 사용여부(Y/N)
            // appConfig.STBInfo.whatherWidget = this.getProperty(STB_PROP.WHATHER_WIDGET); // 날씨/시간 위젯 사용여부(Y/N)
            // appConfig.STBInfo.utilWidget = this.getProperty(STB_PROP.UTIL_WIDGET); // 유틸 위젯 사용여부(Y/N)
            appConfig.STBInfo.remoconKeyPadSetting = this.getProperty(STB_PROP.REMOCON_KEYPAD_SETTING); // 키패드 유형 신형: PROPERTY_NEW_REMOCON_KEYPAD 구형: PROPERTY_OLD_REMOCON_KEYPAD
            appConfig.STBInfo.userId = this.getProperty(STB_PROP.USER_ID); // Mobile(OKSUSU) 아이디
            appConfig.STBInfo.userPw = this.getProperty(STB_PROP.USER_PW); // Mobile(OKSUSU) 패스워드
            appConfig.STBInfo.userIdSaved = this.getProperty(STB_PROP.USER_ID_SAVED); // 사용자 ID 저장 여부(저장:Y, 저장안함:N)
            appConfig.STBInfo.bPointPerMonthDeduct = this.getProperty(STB_PROP.BPOINT_PER_MONTH_DEDUCT); // B포인트 월정액 차감 사용여부(Y/N)
            // appConfig.STBInfo.homeMyBtvMenu = this.getProperty(STB_PROP.HOME_MYBTV_MENU); // STB에 저장되어 있는 메뉴ID ('111'|'222'|'333')  // 4.0에서 사용하던 값
            // appConfig.STBInfo.homeAllMenu = this.getProperty(STB_PROP.HOME_ALLMENU); // STB에 저장되어 있는 메뉴ID ('111'|'222'|'333')  // 4.0에서 사용하던 값
            // appConfig.STBInfo.weatherInfo = this.getProperty(STB_PROP.WEATHER_INFO); // 날씨|지역|온도|CustomPostCode|갱신시간  // 4.0에서 사용하던 값
            // appConfig.STBInfo.screenBrightness = this.getProperty(STB_PROP.SCREEN_BRIGHTNESS); // 배경 투명도 설정 값  // 4.0에서 사용하던 값
            appConfig.STBInfo.listViewOption = this.getProperty(STB_PROP.LIST_VIEW_OPTION); // 텍스트/이미지|최신/이름  (TEXT:텍스트, IMAGE:이미지, NEW:최신, TITLE:가나다) => IMAGE|TITLE, TEXT|NEW 형태로 전달
            appConfig.STBInfo.pssUseAgree = this.getProperty(STB_PROP.PSS_USE_AGREE); // 1: 동의, 2: 미동의, 3: 선택안함
            appConfig.STBInfo.tokenGW = this.getProperty(STB_PROP.TOKEN_GW); // API Gateway 토큰
            appConfig.STBInfo.userSex = this.getProperty(STB_PROP.USER_SEX); // T-membership 고객 성별
            appConfig.STBInfo.userBirth = this.getProperty(STB_PROP.USER_BIRTH); // T-membership 고객 생년 월일
            appConfig.STBInfo.uiVersion = this.getProperty(STB_PROP.WEBUI_VERSION); // Web UI version 정보를 저장
            appConfig.STBInfo.Api_key = this.getProperty(STB_PROP.API_KEY); // server-list.conf 에 저장된 apiKey
            // console.log('STB_PROP.API_KEY=', appConfig.STBInfo.Api_key);
            appConfig.STBInfo.hdrSupport = this.getProperty(STB_PROP.HDR_SUPPORT); // HDR 지원 여부(true - 지원함, false - 지원 안함)
            appConfig.STBInfo.blueToothConnect = this.getProperty(STB_PROP.BLUETOOTH_CONNECT); // 블루투스 연결 상태(true - 연결, false - 연결 해제)
            if (window.tvExt && window.tvExt.device && window.tvExt.device.network) {
                appConfig.STBInfo.Client_IP = window.tvExt.device.network; // stb ip
            }
            // console.log('tokenGW=' + appConfig.STBInfo.tokenGW);
            console.log('end getProperty  tokenGW=%s Api_key=%s ', appConfig.STBInfo.tokenGW, appConfig.STBInfo.Api_key);
            if (utility.checkNullValue(appConfig.STBInfo.regionCode)) {
                let tempArr = appConfig.STBInfo.regionCode.split('^');
                let temp = '';
                for (let i = 0; i < 3; i++) {
                    if (i === 2) {
                        temp += tempArr[i];
                    } else {
                        temp += tempArr[i] + ';'
                    }
                }
                appConfig.STBInfo.regionCode2 = temp;
            }
        } else {

        }
        // console.log('STB I/F static js: [Property] ' + JSON.stringify(appConfig.STBInfo));
    }

    // static getEpgData() {
    //     console.log('STB I/F static js: getEpgData.length ' + EpgData.length);
    //     //console.log('length : ', EpgData.length)

    //     if (EpgData.length === 0) {
    //         // var nowTime = Date.now() / 1000;

    //         if (!utility.checkNullValue(window.tvExt)) {
    //             window.tvExt = {};
    //             window.tvExt.channel = {};
    //             window.tvExt.channel.info = {};
    //             window.tvExt.channel.manager = {};
    //             window.tvExt.channel.manager.message = {};
    //             window.tvExt.channel.manager.getList = () => { }

    //             window.tvExt.program = {};
    //             window.tvExt.program.manager = {};
    //             window.tvExt.program.manager.message = {};
    //             window.tvExt.program.manager.getList = () => { }
    //         }

    //         const channelManager = window.tvExt.channel.manager;
    //         const channelInfo = window.tvExt.channel.info;
    //         // const programManager = window.tvExt.program.manager;
    //         // const programInfo = window.tvExt.program.info;
    //         let allChennelCheck;
    //         let maxChannelCount;

    //         /// Get all channel 
    //         allChennelCheck = channelManager.getList(channelManager.SEARCH_TYPE_ALL, 0, 0);
    //         if (allChennelCheck) {
    //             maxChannelCount = channelManager.count;
    //         } /* else {
    //             maxChannelCount = 232;
    //         } */

    //         // get cahnnel information
    //         // id	Number	아이디
    //         // name	String	이름
    //         // num	Number	번호
    //         // uri	String	소스 경로
    //         // imagePath	String	이미지 경로
    //         // genre	Number	장르
    //         // category	Number	카테고리
    //         // type	Number	타입(0 : Reserved, 1 : DTV, 2 : Digit Radio, 128 : Audio)
    //         // areaCode	Number	지역 코드
    //         // pcrPID	Number	PCR PID
    //         // rating	Number	시청 연령(0 : All, 3/7/12/15/18/19)
    //         // runningStatus	Number	상태(0 : Hidden, 1 : Not Running, 3 : Pause, 4 : Running)
    //         // sampleTime	Number	미리보기 시간
    //         // resolution	Number	화면 해상도(0 : SD, 1 : HD)
    //         // isPay	Boolean	유료 채널 여부

    //         if (channelManager.getList(channelManager.SEARCH_TYPE_ALL, 0, 0)) {
    //             let channelPage = 0;
    //             let pageCount = 0;
    //             for (var i = 0; i < maxChannelCount; i++) {

    //                 if (channelInfo.getFromList(i)) {
    //                     // if (channelInfo.num.toString().length == '1'){
    //                     //     channelInfo.num = '00' + channelInfo.num
    //                     // }else if (channelInfo.num.toString().length == '2'){
    //                     //     channelInfo.num = '0' + channelInfo.num
    //                     // }
    //                     //console.log('channelInfo : ', channelInfo)

    //                     if (pageCount === 6) {
    //                         channelPage += 1;
    //                         pageCount = 0;
    //                     }
    //                     pageCount += 1;

    //                     EpgData.push({
    //                         channelIdx: i,
    //                         channelPage: channelPage,
    //                         svc_id: channelInfo.id,
    //                         channelName: channelInfo.name,
    //                         channel: channelInfo.num,
    //                         uri: channelInfo.uri,
    //                         logoImage: '',  //  '/assets/images/tmp/realtime/logo-kbs2.png',
    //                         genre: channelInfo.genre,
    //                         category: channelInfo.category,
    //                         type: channelInfo.type,
    //                         areaCode: channelInfo.areaCode,
    //                         pcrPID: channelInfo.pcrPID,
    //                         rating: channelInfo.rating,
    //                         runningStatus: channelInfo.runningStatus,
    //                         sampleTime: channelInfo.sampleTime,
    //                         resolution: channelInfo.resolution,
    //                         isPay: channelInfo.isPay,
    //                         favorite: false, //선호채널 등록 여부
    //                         block: false, // 차단채널 등록 여부
    //                         programs: []
    //                     });

    //                 }
    //             }
    //         }
    //     }
    //     // console.log('STB I/F static js: epgData: ' + JSON.stringify(EpgData));
    // }

    static getEpgDataByChannel(IndexCH, offset) {
        if (EpgData.length !== 0) {
            //get programs by channel
            // id	Number	아이디
            // name	String	이름
            // description	String	설명
            // imagePath	String	이미지 경로
            // channelID	Number	채널 아이디
            // contentNibble1	Number	Info 1(장르)
            // contentNibble2	Number	Info 2
            // contentUserNibble1	Number	User Info 1
            // contentUserNibble2	Number	User Info 2
            // director	String	감독
            // actors	String	배우
            // startTime	Date	시작 시간
            // endTime	Date	종료 시간
            // duration	Number	방영 시간
            // runningStatus	Number	상태(0 : Hidden, 1 : Not Running, 3 : Pause, 4 : Running)
            // rating	Number	시청 연령(0 : All, 3 / 7 / 12 / 15 / 18 / 19)
            // audioType	Number	오디오 타입(0 : None, 1 : Mono, 2 : Stereo, 3 : AC3)
            // price	String	가격
            // freeCAMode	Number	Free CA Mode
            // videoResolution	Number	화면 해상도(0 : SD, 1 : HD)
            // isCaption	Boolean	캡션 여부
            // isDolbyAudio	Boolean	돌비 오디오 여부
            // isDVS	Boolean	DVS 여부
            var nowTime = Date.now() / 1000;

            if (!utility.checkNullValue(window.tvExt)) {
                window.tvExt = {};
                window.tvExt.channel = {};
                window.tvExt.channel.info = {};
                window.tvExt.channel.manager = {};
                window.tvExt.channel.manager.message = {};
                window.tvExt.channel.manager.getList = () => { }

                window.tvExt.program = {};
                window.tvExt.program.manager = {};
                window.tvExt.program.manager.message = {};
                window.tvExt.program.manager.getList = () => { }
            }

            // const channelManager = window.tvExt.channel.manager;
            // const channelInfo = window.tvExt.channel.info;
            const programManager = window.tvExt.program.manager;
            const programInfo = window.tvExt.program.info;

            var current_time = (new Date()).getTime();

            for (let i = IndexCH; i < offset; i++) {

                if (EpgData[i].channel === 1 || EpgData[i].channel === 50) {
                    EpgData[i].programs = [];
                    const STARTTIMELINE = TIMEUNIT * Math.floor(nowTime / TIMEUNIT);
                    const ENDTIMELINE = STARTTIMELINE + (1450 / TIME2PIXEL);
                    EpgData[i].programs.push({
                        id: programInfo.id,
                        title: 'B tv 전용채널',
                        description: programInfo.description,
                        imagePath: programInfo.imagePath,
                        channelID: programInfo.channelID,
                        director: programInfo.director,
                        actors: programInfo.actors,
                        startTime: STARTTIMELINE,
                        endTime: ENDTIMELINE,
                        duration: ENDTIMELINE - STARTTIMELINE,
                        rating: 'All',
                        price: '0',
                    });
                } else if (programManager.getList(EpgData[i].channel, current_time, 0)) {
                    EpgData[i].programs = [];
                    for (var j = 0; j < programManager.count; j++) {
                        if (programInfo.getFromList(j)) {
                            EpgData[i].programs.push(
                                {
                                    id: programInfo.id,
                                    title: programInfo.name,
                                    description: programInfo.description,
                                    imagePath: programInfo.imagePath,
                                    channelID: programInfo.channelID,
                                    contentNibble1: programInfo.contentNibble1,
                                    contentNibble2: programInfo.contentNibble2,
                                    contentUserNibble1: programInfo.contentUserNibble1,
                                    contentUserNibble2: programInfo.contentUserNibble2,
                                    director: programInfo.director,
                                    actors: programInfo.actors,
                                    startTime: programInfo.startTime / 1000,
                                    endTime: programInfo.endTime / 1000,
                                    duration: programInfo.duration,
                                    runningStatus: programInfo.runningStatus,
                                    rating: programInfo.rating,
                                    audioType: programInfo.audioType,
                                    price: programInfo.price,
                                    freeCAMode: programInfo.freeCAMode,
                                    videoResolution: programInfo.videoResolution,
                                    isCaption: programInfo.isCaption,
                                    isDolby: programInfo.isDolbyAudio,
                                    isDVS: programInfo.isDVS
                                }
                            );
                        }
                    }

                }

            }  // end for
        }
        // console.log('STB I/F static js: epgData2222: ' + JSON.stringify(EpgData));
    }

    static getListByRealTime(channel_list) {
        // 인기채널 현재 반영중인 프로그램 정보만 가져옴
        const programManager = window.tvExt.program.manager;
        const programInfo = window.tvExt.program.info;

        let programByChannel = [];

        var current_time = (new Date()).getTime();
        var end_time = current_time + 1000 * 60 * 60 * 2

        for (let i = 0; i < channel_list.length; i++) {
            if (programManager.getList(channel_list[i], current_time, end_time)) {
                for (var j = 0; j < programManager.count; j++) {
                    if (j === 0) {
                        if (programInfo.getFromList(j)) {
                            programByChannel.push({
                                channelNo: channel_list[i],
                                id: programInfo.id,
                                title: programInfo.name,
                                imagePath: programInfo.imagePath,
                                channelID: programInfo.channelID,
                                startTime: programInfo.startTime / 1000,
                                endTime: programInfo.endTime / 1000,
                                duration: programInfo.duration,
                                runningStatus: programInfo.runningStatus,
                                rating: programInfo.rating,
                                audioType: programInfo.audioType,
                                price: programInfo.price,
                                freeCAMode: programInfo.freeCAMode,
                                videoResolution: programInfo.videoResolution,
                                isCaption: programInfo.isCaption,
                                isDolby: programInfo.isDolbyAudio,
                                isDVS: programInfo.isDVS
                            })
                        }
                    }

                }
            }
        }  // end for
        return programByChannel;
    }

    static checkCallbackMap(key, callback) {
        var result = false;
        if (utility.checkNullValue(callback) && typeof callback === 'function') {
            if (callbackMap.has(key)) {
                callbackMap.delete(key);
                result = true;
            }
            callbackMap.set(key, callback);
        }
        return result;
    }

    static setGnbMenuList(gnbList) {
        this.gnbMenuList = gnbList;
    }

    static getGnbMenuList(gnbCode) {
        let rs = {};

        for (let idx = 0; idx < this.gnbMenuList.length; idx++) {
            if (this.gnbMenuList[idx].gnbTypeCode === gnbCode) {
                rs = this.gnbMenuList[idx];
            }
        }
        return rs;  // {menuId, gnbTypeCode}
    }


    /*************************************/
    /* request/notify (WebApp -> Native) */
    /*************************************/

    /**
     * IF-STB-V5-101
     * STB 기본 정보 요청
     * Web -> Native -> Web
     */
    static requestStbInfo(callback) {
        if (this.checkCallbackMap(STB_COMMAND.STB_INFO, callback)) {
            return;
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.STB_INFO,
            CONTENTS: '',
            DATA: ''
        });
    }

    // vodCount
    // vodList			[
    //     vodInfo		{
    //         sris_id	    	VOD 컨텐츠의 시즌ID
    //         epsd_id		    VOD 컨텐트의 식별자
    //         epsd_rslu_id		VOD 컨텐트의 해상도ID
    //         series_no		VOD 컨텐트의 시리즈 회차
    //         title		    컨텐트의 이름
    //         level	    	사용자 등급
    //         adult		    성인물 여부 , - Y: 성인물, N: 성인물 아님
    //         thumbnail		포스터 주소(URL)의 패스(example = /menu/cate / poster.jpg)
    //         catchup		    VOD 컨텐츠의 신규 회차 배포 Y / N, group = VOD일 때 필수
    //         trans_type		"컨텐트 전송 방식, - 1: D & P, 2: RTSP, 3: HLS"
    //         watch_rt		시청비율 %
    //         watch_time		컨텐트 최종 시청 타임.단위 second
    //         reg_date		시청일(yy.MM.dd)
    //         material_cd		시즌ID별 최근 시청한 컨텐츠의 소재상태코드(65: 배포승인, 80: 배포만료 등)
    //     }
    // ]

    /**
     * IF-STB-V5-102
     * 최근시청 VOD 목록 요청
     * Web -> Native -> Web
     * 
     */
    static requestRecentVodList() {
        const rs = cm.getMessage({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.RECENT_VOD_LIST,
            CONTENTS: '',
            DATA: ''
        });
        return rs.DATA;
    }

    /**
     * IF-STB-V5-103
     * 설정된 채널 정보 조회(선호, 유료 가입, 차단 채널)
     * Web -> Native -> Web
     */
    static requestChannelList(callback) {
        if (this.checkCallbackMap(STB_COMMAND.CHANNEL_LIST, callback)) {
            return;
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.CHANNEL_LIST,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-104
     * 실시간 방송 예약 정보 요청 
     * Web -> Native -> Web
     */
    static requestReservationInfo(data = '', callback) {
        if (this.checkCallbackMap(STB_COMMAND.RESERVATION_INFO, callback)) {
            return;
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.RESERVATION_INFO,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-105
     * 현재 재생 정보 요청
     * Web -> Native -> Web
     */
    static requestPlayInfo(callback) {
        if (this.checkCallbackMap(STB_COMMAND.PLAY_INFO, callback)) {
            return;
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.PLAY_INFO,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-201
     * Native 메뉴 이동 요청
     * Web -> Native
     */
    static menuNavigationNative(menuType, data = {}) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.MENU_NAVIGATION_NATIVE,
            CONTENTS: '',
            DATA: {
                menuType: menuType,
                menu: data.menu || '',
                menuId: data.menuId || ''
            }
        });
    }

    /**
     * IF-STB-V5-202
     * 채널 관련 요청 (채널 이동/시청 예약/채널 가입)
     * Web -> Native -> Web
     * actionType : 
     *      M - 채널이동
     *      R - 시청예약
     *      D - 예약해제
     *      E - 월정액 가입 해지
     * entryPath : 처리구분이 M일 경우 필수
     *      MY_BTV - 홈 > 마이 Btv > 최근시청/선호 채널에서 요청 시
     *      WING_UI - Wing UI 인기/선호 채널에서 요청 시
     *      EPG_ALL - 전체편성표에서 요청 시
     *      EPG_GENRE - 장르편성표에서 요청 시
     *      fromMenu  - 처리구분이 M일 경우 선택 - KIDS_ZONE : 키즈존에서 진입 시
     * 
     */
    static requestLiveTvService(actionType, data, callback) {
        if (utility.checkNullValue(callback)) {
            if (this.checkCallbackMap(STB_COMMAND.LIVETV_SERVICE, callback)) {
                return;
            }
        }

        let sendData;
        switch (actionType) {
            case 'M':
                sendData = {
                    actionType: actionType,
                    channelNo: data.channelNo,
                    entryPath: data.entryPath,
                    fromMenu: data.fromMenu,
                };
                break;
            case 'R':
                sendData = {
                    actionType: actionType,
                    channelNo: data.channelNo,
                    channelName: data.channelName,
                    programName: data.programName,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    serviceId: data.serviceId
                };
                break;
            case 'D':
                sendData = {
                    actionType: actionType,
                    channelNo: data.channelNo,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    serviceId: data.serviceId
                };
                break;
            case 'E':
                sendData = {
                    actionType: actionType,
                    productCode: data.productCode,
                    productName: data.productName,
                    ppmId: data.ppmId,
                    pId: data.pId,
                    fromMenu: data.fromMenu
                };
                break;
            default:
                break;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.LIVETV_SERVICE,
            CONTENTS: '',
            DATA: sendData
        });
    }

    /**
     * IF-STB-V5-203
     * VOD 재생 요청 (WebApp에서 STB Player 호출)
     * Web -> Native -> Web
     * 
     * G2 4.0 I/F 그대로 가져옴,, 수정 필요
     * 
     * playType, playOption, time, XPGCNTM002, SCS,XPGAPPD024, ME011, XPGAPPD18, bool, seeingPath
     * 재생 유형, 재생 옵션, METV-024END_TIME, XPGCNTM002, SCS, XPGAPPD, METV011, XPGAPPD018, 시놉시작을 팝업으로 시작할 경우 , 진입경로
     */
    static requestPlayVod(data, callback) {
        if (this.checkCallbackMap(STB_COMMAND.PLAY_VOD, callback)) {
            return;
        }
        this.playData = data.synopsisInfo;
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.PLAY_VOD,
            CONTENTS: '',
            DATA: data
        });
    }

    static changeVodData(playType, playOption, time, XPGCNTM002, seriesObj, SCSPRODUCT001, PROD_INFO, PROD_DTL, XPGAPPD010, ME011, XPGAPPD003, bool, seeingPath, link_type, corner, epiId, synopType) {
        let y_n_bool = SCSPRODUCT001.POPUP === '10' ? 'Y' : 'N'

        let obj = {
            /**
             * 필수 XPG에서 가져온 데이터
             * **/
            playType: utility.checkNullValue(playType) ? playType : '', // VOD_PLAY : 일반   &&  VOD_PLAYLIST : 몰아보기 && VOD_ALL_CORNER : 코너별 모아보기 && VOD_CORNER : 코너별 보기
            playOption: utility.checkNullValue(playOption) ? playOption : '', // NORMAL : 일반 시놉에서 재생할 경우 && NEXT : 재생 종료 후 다음 회차 재생 (IF-CS-011) && OTHER : 재생 중 playbar를 통한 다른 회차 재생 (IF-CS-011) && SMART_RCU : SmartRCU를 통한 이어보기 (IF-CS-011)
            /**
             * 옵션
             * **/
            startTime: utility.checkNullValue(time) ? time : '',  //이어보기와 코너보기일 경우에만 설정

            /**
             * 필수
             * **/

            seamless: utility.checkNullValue(bool) ? bool : '',
            // epiId: XPGCNTM002.content.epi_list.epi_id,      //코너별 보기일 경우에만 설정 (XPG EPISODE ID)
            epiId: utility.checkNullValue(epiId) ? epiId : '',                                         //코너별 보기일 경우에만 설정 (XPG EPISODE ID)

            contentId: utility.checkNullValue(XPGCNTM002.content.con_id) ? XPGCNTM002.content.con_id : '',  //코너별 보기일 경우에만 설정
            seeingPath: utility.checkNullValue(seeingPath) ? seeingPath : '',
            gCode: utility.checkNullValue(XPGCNTM002.content.c_menu) ? XPGCNTM002.content.c_menu : '',
            iptvSetProdBuyFlag: utility.checkNullValue(PROD_DTL.IPT_SET_PROD_FLAG) ? PROD_DTL.IPT_SET_PROD_FLAG : '',
            trailerTitle: utility.checkNullValue(link_type.link_name) ? link_type.link_name : '',
            menuId: utility.checkNullValue(XPGCNTM002.content.c_menu) ? XPGCNTM002.content.c_menu : '',
            // trackId: XPGCNTM002.track_id,                        //********************************
            trackId: '',                        //********************************
            synopType: utility.checkNullValue(synopType) ? synopType : '',

            synopsisInfo: {
                title: utility.checkNullValue(XPGCNTM002.content.title) ? XPGCNTM002.content.title : '',
                masterId: utility.checkNullValue(XPGCNTM002.content.m_id) ? XPGCNTM002.content.m_id : '',
                // genreCode: XPGCNTM002.content.g_code,
                genreCode: '',

                currentMenu: utility.checkNullValue(XPGCNTM002.content.c_menu) ? XPGCNTM002.content.c_menu : '',
                quality: utility.checkNullValue(XPGCNTM002.content.fg_quality) ? XPGCNTM002.content.fg_quality : '',
                sdContentId: utility.checkNullValue(XPGCNTM002.content.sd_con_id) ? XPGCNTM002.content.sd_con_id : '',
                hdContentId: utility.checkNullValue(XPGCNTM002.content.hd_con_id) ? XPGCNTM002.content.hd_con_id : '',
                uhdContentId: utility.checkNullValue(XPGCNTM002.content.uhd_con_id) ? XPGCNTM002.content.uhd_con_id : '',
                orgContentId: utility.checkNullValue(XPGCNTM002.content.con_id) ? XPGCNTM002.content.con_id : '',
                isMovie: utility.checkNullValue(XPGCNTM002.content.yn_movie) ? XPGCNTM002.content.yn_movie : '',
                isFree: utility.checkNullValue(XPGCNTM002.content.yn_free) ? XPGCNTM002.content.yn_free : '',
                linkType: utility.checkNullValue(link_type.link_type) ? link_type.link_type : '',
                isSample: utility.checkNullValue(seriesObj.serList) ? seriesObj.serList[seriesObj.serIdx].seriesInfo.yn_sam : '',                         //맛보기 **********************
                isAdult: utility.checkNullValue(XPGCNTM002.content.yn_adult) ? XPGCNTM002.content.yn_adult : '',
                // isMultiCaption: XPGCNTM002.content.yn_mul_cap,
                isMultiCaption: utility.checkNullValue(XPGCNTM002.content.yn_mul_cap) ? XPGCNTM002.content.yn_mul_cap : '',

                isCatchUp: utility.checkNullValue(XPGCNTM002.content.yn_recent) ? XPGCNTM002.content.yn_recent : '',           //*********yn_recent
                poster: utility.checkNullValue(XPGCNTM002.content.poster) ? XPGCNTM002.content.poster : '',
                // mediaType: XPGCNTM002.content.media_type,
                mediaType: utility.checkNullValue('2D') ? '2D' : '',

                channelNo: utility.checkNullValue(XPGCNTM002.content.ch_no) ? XPGCNTM002.content.ch_no : '',
                rating: utility.checkNullValue(XPGCNTM002.content.level) ? XPGCNTM002.content.level : '',
                playTime: utility.checkNullValue(XPGCNTM002.content.p_time) ? XPGCNTM002.content.p_time : '',
                isSeries: utility.checkNullValue(XPGCNTM002.content.yn_ser) ? XPGCNTM002.content.yn_ser : '',
                seriesNo: utility.checkNullValue(XPGCNTM002.content.ser_no) ? XPGCNTM002.content.ser_no : '',              //회차 번호

                seriesIndex: utility.checkNullValue(seriesObj.serIdx) ? seriesObj.serIdx : '',          //index 값 시리즈 리스트의 현재 인덱스
                seriesList: utility.checkNullValue(seriesObj.serList) ? seriesObj.serList : '',
                cornerList: corner,
                captionList: [{
                    captionInfo: {
                        capFile: utility.checkNullValue(XPGCNTM002.content.cap_file) ? XPGCNTM002.content.cap_file : '',
                        mulCap: utility.checkNullValue(XPGCNTM002.content.mul_cap) ? XPGCNTM002.content.mul_cap : '',
                    }
                }],
                contentsList: [{
                    contentsInfo: {
                        contentId: utility.checkNullValue(XPGCNTM002.content.con_id) ? XPGCNTM002.content.con_id : '',
                    }
                }],

            },
            /**
             * 필수 scs상품정보 조회
             * **/

            wscsInfo: {
                responseIP: utility.checkNullValue(SCSPRODUCT001.STB_ID) ? SCSPRODUCT001.STB_ID : '',
                responseTime: utility.checkNullValue(SCSPRODUCT001.CUR_TIME) ? SCSPRODUCT001.CUR_TIME : '',//data, //RESPONSE TITME SCS 찔렀을)때
                isGiftVod: utility.checkNullValue(y_n_bool) ? y_n_bool : '',
                chargePeriod: utility.checkNullValue(SCSPRODUCT001.CHARGE_PERIOD) ? SCSPRODUCT001.CHARGE_PERIOD : '',
                contentId: utility.checkNullValue(SCSPRODUCT001.CTS_INFO.CID) ? SCSPRODUCT001.CTS_INFO.CID : '',
                contentUrl: utility.checkNullValue(SCSPRODUCT001.CTS_INFO.CNT_URL) ? SCSPRODUCT001.CTS_INFO.CNT_URL : '',
                productType: utility.checkNullValue(PROD_INFO.PTYPE) ? PROD_INFO.PTYPE : '',
                productId: utility.checkNullValue(PROD_DTL.PID) ? PROD_DTL.PID : '',
                wmUseFlag: utility.checkNullValue(SCSPRODUCT001.CTS_INFO.YN_WATER_MARK) ? SCSPRODUCT001.CTS_INFO.YN_WATER_MARK : '',
                wmExtension: utility.checkNullValue(SCSPRODUCT001.CTS_INFO.EXTENSION) ? SCSPRODUCT001.CTS_INFO.EXTENSION : '',
                wmMode: utility.checkNullValue(SCSPRODUCT001.CTS_INFO.WM_MODE) ? SCSPRODUCT001.CTS_INFO.WM_MODE : '',
            },

            /**
             * 옵션 코어별 모아보기 경우에만 사용
             * **/
            cornerStartIndex: utility.checkNullValue(XPGAPPD010.cornerStartIndex) ? XPGAPPD010.cornerStartIndex : '',
            cornerGroupList: utility.checkNullValue(XPGAPPD010.corner_list) ? XPGAPPD010.corner_list : '',

            /**
             * 옵션 몰아보기 경우에만 사용
             * **/
            groupList: utility.checkNullValue(ME011) ? ME011 : '',

            /**
             * 옵션 인기 에피소드 정보 리스트
             * **/
            epiStartIndex: utility.checkNullValue(XPGAPPD003.epiStartIndex) ? XPGAPPD003.epiStartIndex : '',
            epiInfoList: utility.checkNullValue(XPGAPPD003.epiInfoList) ? XPGAPPD003.epiInfoList : '',
        };
        return obj;
    }

    /**
     * IF-STB-V5-204
     * VOD 재생 종료 요청
     * Web -> Native -> Web
     */
    static requestStopVod(callback) {
        if (this.checkCallbackMap(STB_COMMAND.STOP_VOD, callback)) {
            return;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.STOP_VOD,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-205
     * PIP 재생 요청
     * Web -> Native -> Web
     */
    static requestPlayPip(data, callback) {
        /* if (this.checkCallbackMap(STB_COMMAND.PIP_PLAY_STATE, callback)) {
            return;
        } */

        this.checkCallbackMap(STB_COMMAND.PIP_PLAY_STATE, callback);

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.PLAY_PIP,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-206
     * 홈 OAP 재생 요청
     * Web -> Native -> Web
     */
    static requestPlayOap(data, callback) {
        // TODO 현재 OAP 사용 안함 
        if (data) {
            return;
        }
        if (isFunction(callback)) {
            // console.log('requestPlayOap has callback ');
            this.checkCallbackMap(STB_COMMAND.OAP_PLAY_STATE, callback);
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.PLAY_OAP,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-207
     * Token 갱신 요청(게이트웨이 연동중 토큰 검증 실패가 발생했을 때)
     * Web -> Native -> Web
     */
    static requestToken(callback) {
        if (this.checkCallbackMap(STB_COMMAND.REQUEST_TOKEN, callback)) {
            return;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.REQUEST_TOKEN,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-208
     * Native 팝업 노출 요청
     * Web -> Native
     */
    static openPopup(dataType, dataInfo, callback) {
        if (this.checkCallbackMap(STB_COMMAND.OPEN_POPUP, callback)) {
            return;
        }
        if (!appConfig.runDevice) {
            window.open(dataInfo, "", "");
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.OPEN_POPUP,
            CONTENTS: '',
            DATA: {
                dataType: dataType,
                dataInfo: dataInfo
            }
        });
    }

    /**
     * IF-STB-V5-209
     * 3rd party App 실행 요청
     * Web -> Native
     * data = {
     *  title			    ,  //	App 이름
        serviceId			,  //	App 서비스 아이디
        vassId			    ,  //	App 고유 아이디
        contentId			,  //	App 콘텐츠 아이디
        packageName			,  //	"앱 데이터에 PackageName 이 존재 할 경우 추가해서 내려준다. (만약 hasVaasId 가 Y 인경우 필수)"
        entryPath			,  //	HOME - 홈 > TV앱 실행 시
        hasVassId			,  //	vassId가 존재하지 않는 경우 Y (이 경우 packageName 만 필수값이며 packageName 으로 App 실행)
     }
     */
    static launchApp(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.LAUNCH_APP,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-210
     * 최근시청 VOD 정보 삭제 요청
     * Web -> Native
     */
    static deleteRecentVod(actionType, contentId = '') {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.DELETE_RECENT_VOD,
            CONTENTS: '',
            DATA: {
                actionType: actionType,
                contentId: contentId
            }
        });
    }

    /**
     * IF-STB-V5-211
     * 찜 등록/해제 요청 (VOD, App, Live Channel)
     * Web -> Native
     */
    static setFavorite(actionType, contentType, contentId, callback) {
        if (this.checkCallbackMap(STB_COMMAND.SET_FAVORITE, callback)) {
            return;
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.SET_FAVORITE,
            CONTENTS: '',
            DATA: {
                actionType: actionType,
                contentType: contentType,
                contentId: contentId
            }
        });
    }

    /**
     * IF-STB-V5-212
     * Native에 Web reload 요청
     * Web -> Native
     * @param {*} reloadTiming 즉시 reload 여부 (즉시 일경우 : 1 / 즉시가 아닐 경우 : 0)
     */
    static reload(reloadTiming) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.RELOAD,
            CONTENTS: '',
            DATA: {
                reloadTiming: reloadTiming,
            }
        });
    }

    /**
     * IF-STB-V5-213
     * 키즈존 가이드 재생 요청
     * Web -> Native
     * @param {*} fileName 가이드 코드 (입수 및 정리 필요)
     */
    static playKidszoneGuide(fileName) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.PLAY_KIDSZONE_GUIDE,
            CONTENTS: '',
            DATA: {
                fileName: fileName,
            }
        });
    }

    /**
     * IF-STB-V5-214
     * 데이터 암호화 요청(이니시스)
     * Web -> Native -> Web
     * @param {Object} data = {
     *   target			inicis - 이니시스
     *                   eps - EPS H/E
     *                   scs - SCS H/E
     *                   dis - DIS H/E
     *   cryptType		encrypt - 암호화
     *                   decrypt - 복호화
     *   text		  	plain text or encrypt text
     *   dateTime	    전송(응답)일시 (YYYYMMDDHH24MISS)
     *  }
     */
    static requestEncryptData(data) {
        const rs = cm.getMessage({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.ENCRYPT_DATA,
            CONTENTS: '',
            DATA: data
        });
        return rs.DATA.text;
    }

    /**
     * IF-STB-V5-215
     * 키즈존 채널 정보 요청
     * Web -> Native -> Web
     */
    static requestKidsZoneChannelInfo(callback) {
        if (this.checkCallbackMap(STB_COMMAND.KIDS_ZONE_CHANNEL_INFO, callback)) {
            return;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.KIDS_ZONE_CHANNEL_INFO,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-216
     * 홈 OAP 정보 요청
     * Web -> Native -> Web
     */
    static requestHomeOapInfo(callback) {
        if (this.checkCallbackMap(STB_COMMAND.HOME_OAP_INFO, callback)) {
            return;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.HOME_OAP_INFO,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-217
     * Native 에 캐싱되어 있는 VOD 찜 정보 요청
     * Web -> Native -> Web [동기]
     * @param data = {
     *  type	    :   "all - 전체 리스트 요청, select - 특정 seriesId 에 대한 찜 여부 요청"
     *  seriesId    :   시리즈 아이디 (type 이 select 인 경우 필수)
     * }
     * @return {
     *  type			    : request 에서 요청한 type
     *  favoriteVodList	: "VOD 찜 리스트 (type 이 all 인 경우 필수), - VOD의 seriesId를 구분자('|')를 통해 복수개의 목록을 전달 (id1|id2|id3)"
     *  isFavorite		: "찜 여부 (type 이 select) 인 경우 필수), - true : 찜, false : 찜 아님"
     * }
     *  ex) Stbinterface.reqeustFavoriteVodInfo({type:'select', seriesId:'CS0234001'});
     */
    static requestFavoriteVodInfo(data) {

        const rs = cm.getMessage({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.FAVORITE_VOD_INFO,
            CONTENTS: '',
            DATA: data
        });
        return rs.DATA;
    }

    /**
     * IF-STB-V5-218
     * 기기 연결 정보 요청
     * Web -> Native -> Web [비동기]
     * @param data = {
     *  type	    :   "all - 전체 리스트 요청, select - 특정 seriesId 에 대한 찜 여부 요청"
     *  seriesId    :   시리즈 아이디 (type 이 select 인 경우 필수)
     * }
     * @return {
     *  type			    : request 에서 요청한 type
     *  favoriteVodList	: "VOD 찜 리스트 (type 이 all 인 경우 필수), - VOD의 seriesId를 구분자('|')를 통해 복수개의 목록을 전달 (id1|id2|id3)"
     *  isFavorite		: "찜 여부 (type 이 select) 인 경우 필수), - true : 찜, false : 찜 아님"
     * }
     *  ex) Stbinterface.reqeustFavoriteVodInfo({type:'select', seriesId:'CS0234001'});
     */
    static requestDeviceInfo(callback) {
        if (this.checkCallbackMap(STB_COMMAND.DEVICE_INFO, callback)) {
            return;
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.DEVICE_INFO,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-219
     * Native 팝업 노출 요청 (TV페이, TV포인트 한정)
     * Web -> Native
     */
    static openPopupTV(type, url, callback) {
        if (this.checkCallbackMap(STB_COMMAND.OPEN_POPUP_TV, callback)) {
            return;
        }
        if (!appConfig.runDevice) {
            window.open(url, "", "");
        }
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.OPEN_POPUP_TV,
            CONTENTS: '',
            DATA: {
                type: type,
                url: url
            }
        });
    }

    /**
     * IF-STB-V5-220
     * Native 메인 영상 크기 조절
     * Web -> Native 
     * 메인 영상 크기 조절
     */
    static resizeMainPlayer(fullSize, x, y, width, height) {

        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.RESIZE_MAIN_PLAYER,
            CONTENTS: '',
            DATA: {
                fullSize, x, y, width, height
            }
        });
    }

    /**
     * IF-STB-V5-221
     * toast 노출 요청
     * Web -> Native 
     */
    static requestOpenToast(title, desc) {
        //toast_title 이나 toast_msg 둘 중 하나는 반드시 값이 있어야 함.
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.OPEN_TOAST,
            CONTENTS: '',
            DATA: {
                toast_title: title,
                toast_msg: desc,
            }
        });
    }
    /**
     * IF-STB-V5-222
     * 쿠폰/포인트 정보 조회
     * Web -> Native 
     */
    static requestCouponPoint(callback) {
        if (isFunction(callback)) {
            this.checkCallbackMap(STB_COMMAND.REQUEST_COUPON_POINT, callback);
        }

        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.REQUEST_COUPON_POINT,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-223
     * 월정액 가입/탈퇴 시 월정액 가입정보 조회 요청
     * Web -> Native 
     */
    static informationMonthlyPurchase() {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.MONTHLY_PURCHASE,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-224
     * oksusu 관련 정보(oksusu 구매내역 열람여부/소장용정보구매정보수집) 전달
     * Web -> Native 
     * @param {String } purchaseList : oksusu 구매내역 열람 여부 (0 : 동의 안함, 1 : 동의)
     * @param {String } unlimitedVod : oksusu 소장용 상품 구매정보 수집 (0 : 동의 안함, 1 : 동의)
     */
    static oksusuPurchaseInfo(purchaseList, unlimitedVod) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.REQUEST,
            COMMAND: STB_COMMAND.OKSUSU_PURCHASE_INFO,
            CONTENTS: '',
            DATA: {
                purchaseList,
                unlimitedVod,
            }
        });
    }

    /**
    * IF-STB-V5-303
    * 실시간 채널 가입 완료/해지 완료 이벤트
    * Web -> Native
    * @param {*} data {
    *      state,  //  가입 : join / 해지 : close / 이미 가입되어 있음 : joined
    *      channelNumber, // 채널번호
    *      serviceId,  //  서비스 아이디
    *      result,  //  결과 (success / fail)
    *      }
    */
    static setChannelJoinState(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.RESPONSE,
            COMMAND: STB_COMMAND.SET_CHANNEL_JOIN_STATE,
            CONTENTS: '',
            DATA: {
                state: data.state,
                channelNumber: data.channelNumber,
                serviceId: data.serviceId,
                result: data.result
            }
        });
    }

    /**
     * IF-STB-V5-307
     * VOD OTP 갱신 요청
     * Native -> Web -> Native
     * result			문자	필수	성공 여부 (success, fail)
     *  otpUrl			문자	필수	OTP URL
     *  otpId			문자	필수	OTP 아이디
     *  otpPassword			문자		OTP 패스워드
     */
    static responseOptData(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.RESPONSE,
            COMMAND: STB_COMMAND.REFRESH_VOD_OTP,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-401
     * 리모콘 특정 키 사용여부 전달
     * Web -> Native
     */
    static keyInfo(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.KEY_INFO,
            CONTENTS: '',
            DATA: data
        });
    }

    /**
     * IF-STB-V5-402
     * iSQMS 데이터 전달
     * Web -> Native
     */
    static isqmsInfo(serverName, responseIp, errorCode, errorMessage) {

        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.ISQMS_INFO,
            CONTENTS: '',
            DATA: {
                serverName: serverName,
                responseIp: responseIp,
                errorCode: errorCode,
                errorMessage: errorMessage
            }
        });
    }

    /**
     * IF-STB-V5-403
     * Web Hide 알림 전달
     * Web <-> Native
     *  !!! 직접 호출하지 말고, 아래 core로 호출
     *  Core.inst().webVisible(false, true);
     */
    static webHideNoti() {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.WEB_HIDE_NOTI,
            CONTENTS: '',
            DATA: ''
        });
    }

    /**
     * IF-STB-V5-407
     * 키즈존 진입, 종료 이벤트 전달
     * Web -> Native
     * @param {String} state 진입 : enter 종료 : exit
     */
    static kidszoneState(state) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.KIDSZONE_STATE,
            CONTENTS: '',
            DATA: {
                state: state
            }
        });
    }

    /**
     * IF-STB-V5-409
     * Web 메뉴 진입 상태 전달
     * Web -> Native
     * @param {String} menu 진입 메뉴 - HOME
     */
    static webMenuState(menu) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.WEB_MENU_STATE,
            CONTENTS: '',
            DATA: {
                menu: menu
            }
        });
    }

    /**
     * IF-STB-V5-410
     * TV 앱 목록 전달
     * Web -> Native
     * @param {String} data AMS 서버에서 전달 받은 응답 전문
     */
    static sendTvAppList(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.SEND_TV_APP_LIST,
            CONTENTS: '',
            DATA: {
                responseData: data
            }
        });
    }

    /**
     * IF-STB-V5-413
     * TAS (MenuNavi) 로그 전달
     * Web -> Native
     * @param {String} data 전송할 TAS 로그
     */
    static tasLog(data) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.TAS_LOG,
            CONTENTS: '',
            DATA: {
                responseData: data
            }
        });
    }

    /**
     * IF-STB-V5-414
     * 키즈존 나가기 화면 상태 알림
     * Web -> Native
     * @param {String } state 진입 : enter 종료 : exit
     * 
     */
    static kidsZoneExitState(state) {
        cm.sendMessageToNative({
            TYPE: STB_TYPE.NOTIFY,
            COMMAND: STB_COMMAND.KIDS_ZONE_EXIT_STATE,
            CONTENTS: '',
            DATA: {
                state
            }
        });
    }



    /**************************************/
    /* response/notify (Native -> WebApp) */
    /**************************************/
    static async receiveMessageFromNative(obj) {
        console.log('STB I/F static js: [receiveMessage] ' + JSON.stringify(obj));
        // console.log('STB I/F stbInterface js: [receiveMessage] COMMAND=' + obj.COMMAND);
        let data = obj.DATA, gnb;
        let isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');

        switch (obj.COMMAND) {
            /* response Native -> Webapp */
            case STB_COMMAND.STB_INFO:
                // IF-STB-V5-101
                this.setSTBInfo(data);
                this.middleWare();
                //static requestChannelList();
                //static requestRecentVodList();
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-102
            case STB_COMMAND.RECENT_VOD_LIST:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-103
            case STB_COMMAND.CHANNEL_LIST:
                switch (data.actionType) {
                    case 'R':
                        // FavModel.favRecentChannelList(data);
                        break;
                    case 'F':
                        // FavModel.data.favChannel = data;
                        break;
                    case 'W':
                        // FavModel.data.channelInfo = data;
                        break;
                    default:
                        break;
                }

                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-104
            case STB_COMMAND.RESERVATION_INFO:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-105
            case STB_COMMAND.PLAY_INFO:
                switch (data.isPlayType) {
                    case 'Live':
                        if (utility.checkNullValue(data.contentId)) {
                            let tempArr = data.contentId.split('|');
                            appConfig.STBInfo.currentLiveServiceId = tempArr[0];
                            appConfig.STBInfo.currentLiveChannelNum = tempArr[1];
                        } else {
                            appConfig.STBInfo.currentLiveServiceId = '';
                            appConfig.STBInfo.currentLiveChannelNum = '';
                        }
                        break;
                    case 'VOD':
                        // if( utility.checkNullValue(data.contentId)){
                        appConfig.STBInfo.currentVodContentId = data.contentId;
                        // }
                        break;
                    default: // ETC
                        break;
                }

                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-202
            case STB_COMMAND.LIVETV_SERVICE:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-203
            case STB_COMMAND.PLAY_VOD:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-204
            case STB_COMMAND.STOP_VOD:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-205
            case STB_COMMAND.PLAY_PIP:
                break;
            // IF-STB-V5-206
            case STB_COMMAND.PLAY_OAP:
                // StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-207
            case STB_COMMAND.REQUEST_TOKEN:
                switch (data.result) {
                    case '0': // 실패
                        // 시나리오 필요
                        break;
                    case '1': // 성공
                        appConfig.STBInfo.tokenGW = this.getProperty(STB_PROP.TOKEN_GW);
                        console.log('tokenGW=' + appConfig.STBInfo.tokenGW);
                        break;
                    case '2': // 인증 중
                        // 시나리오 필요
                        break;
                    default:
                        break;
                }
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-211
            case STB_COMMAND.SET_FAVORITE:
                StbInterface.callbackReceive(obj.COMMAND, data.result);
                break;
            // IF-STB-V5-214
            case STB_COMMAND.ENCRYPT_DATA:
                break;
            // IF-STB-V5-215
            case STB_COMMAND.KIDS_ZONE_CHANNEL_INFO:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-216
            case STB_COMMAND.HOME_OAP_INFO:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-218
            case STB_COMMAND.DEVICE_INFO:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-219
            case STB_COMMAND.OPEN_POPUP_TV:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;
            // IF-STB-V5-222
            case STB_COMMAND.REQUEST_COUPON_POINT:
                console.log('REQUEST_COUPON_POINT data', data);

                appConfig.STBInfo.bPoint = data.point_count;
                appConfig.STBInfo.newBpoint = data.point_new === 'Y' ? true : false;
                appConfig.STBInfo.coupon = data.coupon_count;
                appConfig.STBInfo.couponNew = data.coupon_new === 'Y' ? true : false;
                console.log('REQUEST_COUPON_POINT appConfig.STBInfo', appConfig.STBInfo);
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-301
            case STB_COMMAND.MENU_NAVIGATION_WEB:
                // 키즈존 일경우 키즈존 이탈 시나리오 적용 필요
                let fnCallback = '';
                let isVodPlay = false;  // vod play 중인지 체크
                let isPlaySame = false;  // 같은 컨텐츠 재생중인지 체크
                let isHistoryClear = false;  // history 처리 관련 플래그, true 삭제
                let isPopupClear = true;  // 팝업 처리 관련 플래그, true 팝업 삭제

                // 현재 재생 상태 1: 홈광고, 2: VOD 로딩광고, 3: VOD 중간광고, 4: VOD 종료광고, 5: LIVE 재생, 6: VOD 재생, 7: MultiView 재생, 8: 가상채널, 9: 앱 채널, 0: None
                if (data.extInfo.currentPlayState === '2' || data.extInfo.currentPlayState === '3' || data.extInfo.currentPlayState === '4' || data.extInfo.currentPlayState === '6') {
                    isVodPlay = true;
                    try {
                        if (this.playData.sris_id == data.extInfo.sris_id || this.playData.epsd_id == data.extInfo.epsd_id || this.playData.epsd_rslu_id == data.extInfo.epsd_rslu_id) {
                            isPlaySame = true;
                        }
                    } catch (error) {
                    }
                }
                let path = Core.inst().location.getPath();
                let pathList = path.split('/');
                let gnbPath = pathList[pathList.length - 1];
                let gnbCode = pathList[pathList.length - 2];
                console.log('path=' + path, 'data.menuType=' + data.menuType, 'Core.inst().isWebShow()=' + Core.inst().isWebShow() + '  gnbPath=' + gnbPath);

                // if (isKidsMode) {
                //     Core.inst().showKidsWidget();
                // } else {
                //     Core.inst().hideKidsWidget();
                // }

                // 현재 화면과 이동할 화면이 같은 경우 hide 처리
                if (Core.inst().isWebShow()) {
                    if (((gnbPath === GNB_CODE.GNB_TV) && data.menuType === MENU_NAVI.TV) ||
                        ((gnbPath === GNB_CODE.GNB_MOVIE) && data.menuType === MENU_NAVI.MOVIE) || ((path === PATH.EPG) && data.menuType === MENU_NAVI.EPG)) {
                        // 팝업 크리어
                        Core.inst().cancelPopup();
                        Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                        // webView 숨기기
                        Core.inst().webVisible(false, true);
                        cm.sendMessageToNative({
                            TYPE: STB_TYPE.RESPONSE,
                            COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
                            CONTENTS: '',
                            DATA: {
                                menuType: data.menuType,
                                result: 'success'
                            }
                        });
                        return;
                    } else if (((path === PATH.SEARCH_HOME) && data.menuType === MENU_NAVI.SEARCH) ||
                        ((path === PATH.ALL_MENU) && data.menuType === MENU_NAVI.MENU)) {
                        // 이전 화면 검색이고 검색 눌렸을때 또는 이전화면 전체메뉴이고 전체메뉴 눌렀을때. 
                        // 키즈 모드일때는 히스토리 크리어 안함
                        if (!isKidsMode) {
                            // 팝업 크리어
                            Core.inst().cancelPopup();
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                            Core.inst().webVisible(false, true);
                        }
                        cm.sendMessageToNative({
                            TYPE: STB_TYPE.RESPONSE,
                            COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
                            CONTENTS: '',
                            DATA: {
                                menuType: data.menuType,
                                result: 'success'
                            }
                        });
                        return;
                    }
                }

                switch (data.menuType) {
                    case MENU_NAVI.HOME:
                        gnb = this.getGnbMenuList(GNB_CODE.GNB_HOME);
                        fnCallback = () => {
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                            Core.inst().move(PATH.HOME, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode, menuNavi: true, mode: data.extInfo.mode });
                            isHistoryClear = true;
                        };
                        if (path === PATH.HOME || path === PATH.BASE) {
                            // TODO 검토 필요 auto hide 모드 일때 체크 필요, 이전 화면이 홈이면 리로딩 안하도록 해야 되는지 ?
                            // fnCallback = () => {
                            //     console.log('HOME nothing <<<<<<<<<<<<<<<<<<<<<<');
                            // };
                        }
                        isPopupClear = true;
                        isKidsMode ? Core.inst().webkidsExit(data.menuType, fnCallback) : fnCallback();
                        break;
                    case MENU_NAVI.MENU:
                        if (!isKidsMode) {
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                        }
                        Core.inst().move(PATH.ALL_MENU, {
                            menuId: data.extInfo.call_url, s_v_style: data.extInfo.s_v_style
                        });
                        break;
                    case MENU_NAVI.SYNOPSIS:
                    case MENU_NAVI.SYNOPSIS_NUGU:
                    case MENU_NAVI.SYNOPSIS_DIRECT:
                        const movePath = PATH.SYNOPSIS;
                        const moveParam = {
                            search_type: data.extInfo.search_type, epsd_id: data.extInfo.epsd_id, epsd_rslu_id: data.extInfo.epsd_rslu_id, sris_id: data.extInfo.sris_id,
                            adultCheck: data.extInfo.adultCheck, seeingPath: data.extInfo.seeingPath, fromCommerce: data.extInfo.fromCommerce, title: data.extInfo.title,
                            yn_recent: 'N'
                        }
                        let moveWatLevelCD = '0';
                        let isKidsContents = data.extInfo.isKidsContents;  // TODO   'Y' === 키즈  'N' === Btv  '' === H/E 조회
                        let adultCheck = data.extInfo.adultCheck;  //  adultCheck 값이 'false' 일때는 H/E 데이터 조회 후 사용 필요 
                        console.log('from native isKidsContents=' + isKidsContents);

                        // console.log('xpg010 조회 ');
                        // TODO xpg010 조회 검토 필요
                        let synopData = null;
                        if (adultCheck === 'false' || isKidsContents === '') {
                            synopData = await Utils.requestSynopsisData(moveParam);
                            console.log('synopData=', synopData);
                            isKidsContents = synopData.contents.kids_yn;
                            moveWatLevelCD = synopData.contents.wat_lvl_cd;
                        }
                        // TODO 에러 체크 필요

                        console.log('isKidsMode=%s, isKidsContents=%s, data.menuType=%s, HistoryManager.getList().length isVodPlay=%s, isPlaySame=%s', isKidsMode, isKidsContents, data.menuType, HistoryManager.getList().length, isVodPlay, isPlaySame);
                        fnCallback = () => { Core.inst().move(movePath, moveParam); };
                        // TODO  Btv 키즈에서 음성검색 진입 후 검색결과 중 키즈 콘텐츠가 아닌 메뉴/콘텐츠로 진입을 시도하는 경우 Btv 키즈 이탈 가능.
                        // 단, Btv 키즈 잠금 설정 또는 시청제한 연령 설정이 19세 이상으로 설정되어 있는 경우 인증완료 후 이동가능
                        if (isKidsMode) {
                            // 키즈 컨텐츠 일때, 또는 연령 체크 7세이하 일때 진행(7세이하는 H/E에서 적용 예정, H/E 적용되면 체크 안해도됨.)
                            if (isKidsContents === 'Y' || Number(moveWatLevelCD) <= 7) {
                                // vod 재생 중일때
                                if (isVodPlay) {
                                    // 같은 컨텐츠 재생중 일때
                                    if (isPlaySame) {
                                        // 이전 path 가 synopsis가 아니면 화면 이동.
                                        if (path !== PATH.SYNOPSIS) {
                                            fnCallback();
                                        }
                                        // 이전 path 가 synopsis면 webView만 보여줌.
                                        // TODO 같은 시놉시스가 아닐때의 문제 검토 필요.
                                    } else {
                                        // 다른 컨텐츠 재생중이면 
                                        fnCallback();
                                    }
                                } else {
                                    // vod 재생이 아닐때 history 누적하여 사용
                                    fnCallback();
                                }
                            } else {
                                isPopupClear = false;
                                // 키즈존 이탈 시나리오 시도
                                // TODO 성인 인증 체크 필요한지 검토 필요.
                                Core.inst().webkidsExit(null, fnCallback);
                            }
                        } else {
                            // Btv 일반 컨텐츠 일때

                            // vod 재생 중일때
                            if (isVodPlay) {
                                // 같은 컨텐츠 재생중 일때
                                if (isPlaySame) {
                                    // 이전 path 가 synopsis가 아니면 화면 이동.
                                    if (path !== PATH.SYNOPSIS) {
                                        fnCallback();
                                    }
                                    // 이전 path 가 synopsis면 webView만 보여줌.
                                    // TODO 같은 시놉시스가 아닐때의 문제 검토 필요.
                                } else {
                                    // 다른 컨텐츠 재생중이면 
                                    // 19세 이상 체크 완료 된경우
                                    if (new String(data.extInfo.adultCheck) === 'true') {
                                        fnCallback();
                                    } else {
                                        isPopupClear = false;
                                        // 성인 인증후 해당 path로 param 데이터를 이용하여 이동.
                                        Utils.movePageAfterCheckLevel(PATH.SYNOPSIS, moveParam, moveWatLevelCD);
                                        // 성인 인증 취소 됬을때,  // if('NUGU를 통한 실행 이었나 ?'){  //  TODO I/F 협의 필요  // }
                                    }
                                }
                            } else {
                                // vod 재생이 아닌 경우

                                // 19세 이상 체크 완료 된경우
                                if (new String(data.extInfo.adultCheck) === 'true') {
                                    fnCallback();
                                } else {
                                    isPopupClear = false;
                                    // 성인 인증후 해당 path로 param 데이터를 이용하여 이동.
                                    Utils.movePageAfterCheckLevel(PATH.SYNOPSIS, moveParam, moveWatLevelCD);
                                    // 성인 인증 취소 됬을때,  // if('NUGU를 통한 실행 이었나 ?'){  //  TODO I/F 협의 필요  // }
                                }
                            }
                        }
                        console.log('move after history length=', HistoryManager.getList().length);

                        break;
                    case MENU_NAVI.SYNOPSIS_ENDING:
                        isHistoryClear = false;
                        Core.inst().move(PATH.SYNOPSIS_ENDING, {
                            search_type: data.extInfo.search_type,
                            epsd_id: data.extInfo.epsd_id, epsd_rslu_id: data.extInfo.epsd_rslu_id,
                            sris_id: data.extInfo.sris_id,
                            adultCheck: data.extInfo.adultCheck, seeingPath: data.extInfo.seeingPath,
                            fromCommerce: data.extInfo.fromCommerce,
                            title: data.extInfo.title,
                            ending_cw_call_id_val: data.extInfo.ending_cw_call_id_val
                        });
                        break;
                    case MENU_NAVI.SYNOPSIS_POSSESSION:
                        Core.inst().move(PATH.MYBTV_PURCHASE_LIST, {
                            search_type: data.extInfo.search_type,
                            epsd_id: data.extInfo.epsd_id, epsd_rslu_id: data.extInfo.epsd_rslu_id,
                            sris_id: data.extInfo.sris_id,
                            adultCheck: data.extInfo.adultCheck, seeingPath: data.extInfo.seeingPath,
                            fromCommerce: data.extInfo.fromCommerce,
                            title: data.extInfo.title
                        });
                        break;
                    // case MENU_NAVI.SYNOPSIS_PACKAGE:  // 이전에 사용하던 것 삭제
                    case MENU_NAVI.SYNOPSIS_GATEWAY:
                        Core.inst().move(PATH.SYNOPSIS_GATEWAY, {
                            search_type: data.extInfo.search_type,
                            epsd_id: data.extInfo.epsd_id,
                            epsd_rslu_id: data.extInfo.epsd_rslu_id,
                            sris_id: data.extInfo.sris_id,
                            adultCheck: data.extInfo.adultCheck,
                            seeingPath: data.extInfo.seeingPath,
                            fromCommerce: data.extInfo.fromCommerce,
                            title: data.extInfo.title
                        });
                        break;
                    case MENU_NAVI.SYNOPSIS_GATEWAY_PRODUCT:
                        Core.inst().move(PATH.SYNOPSIS_VODPRODUCT, {
                            search_type: data.extInfo.search_type,
                            epsd_id: data.extInfo.epsd_id,
                            epsd_rslu_id: data.extInfo.epsd_rslu_id,
                            sris_id: data.extInfo.sris_id,
                            adultCheck: data.extInfo.adultCheck,
                            seeingPath: data.extInfo.seeingPath,
                            fromCommerce: data.extInfo.fromCommerce,
                            title: data.extInfo.title
                        });
                        break;
                    case MENU_NAVI.SEARCH:
                        console.log('data.extInfo.keyword=', isEmpty(data.extInfo.keyword));
                        if (!isKidsMode) {
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                        }
                        if (isEmpty(data.extInfo.keyword)) {
                            Core.inst().move(PATH.SEARCH_HOME);  // 검색 메인 화면으로 이동.
                        } else {
                            Core.inst().move(PATH.SEARCH_RESULT, { data: data.extInfo.keyword, tagYn: 'N' });  // 검색 결과 화면으로 이동.
                        }
                        break;
                    case MENU_NAVI.SEARCHPERSONDETAIL:
                        Core.inst().move(PATH.SYNOPSIS_PERSONAL, { menu_id: data.extInfo.menu_id, prs_id: data.extInfo.person_id });
                        break;
                    case MENU_NAVI.EPG:
                        fnCallback = () => { Core.inst().move(PATH.EPG, { lastchannelId: data.extInfo.lastchannelId, category: 2 }); };
                        isKidsMode ? Core.inst().webkidsExit(data.menuType, fnCallback) : fnCallback();
                        break;
                    case MENU_NAVI.ANIMATION_HOME:
                        gnb = this.getGnbMenuList(GNB_CODE.GNB_ANI);
                        Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_ANI}/${GNB_CODE.GNB_ANI}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                        break;
                    case MENU_NAVI.MONTHLY_HOME:
                        gnb = this.getGnbMenuList(GNB_CODE.GNB_MONTHLY);
                        Core.inst().move(`${PATH.MONTHLY_AFTER}/${GNB_CODE.GNB_MONTHLY}/${GNB_CODE.GNB_MONTHLY}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                        break;
                    case MENU_NAVI.TV_APP_HOME:
                        Core.inst().move(PATH.HOME_TVAPP);
                        break;
                    case MENU_NAVI.KIDS_ZONE_HOME:
                        // StbInterface.kidszoneState('enter');  // 키즈존 진입 전달
                        console.log('####### MENU_NAVI KIDS_ZONE_HOME');
                        Core.inst().onBtSearchKidszone();
                        Core.inst().gnbMenu.kidszoneExecute(GNB_CODE.GNB_KIDS, null);
                        break;
                    case MENU_NAVI.KIDS_ZONE_CHANNEL_LIST:
                        // 키즈 채널 관련 처리 
                        isHistoryClear = false;
                        Core.inst().onChannelChanged(data.extInfo.kidsChannelServiceId);
                        break;
                    case MENU_NAVI.MY_BTV:
                        if (path !== PATH.MYBTV_HOME) {
                            Core.inst().move(PATH.MYBTV_HOME);
                        }
                        break;
                    case MENU_NAVI.FAVORITE_VOD_LIST:
                        Core.inst().move(PATH.MYBTV_BOOKMARK_LIST);
                        break;
                    case MENU_NAVI.FAVORITE_CHANNEL_LIST:
                        Core.inst().move(PATH.EPG, { type: MENU_NAVI.FAVORITE_CHANNEL_LIST });
                        break;
                    case MENU_NAVI.COUPON:
                        Core.inst().move(PATH.MYBTV_COUPON_DETAIL);
                        break;
                    case MENU_NAVI.POINT:
                        Core.inst().move(PATH.MYBTV_BPOINT_DETAIL);
                        break;
                    case MENU_NAVI.RECENT_VOD:
                        Core.inst().move(PATH.MYBTV_EDIT_VODLIST);
                        break;
                    case MENU_NAVI.POSSESSION_VOD:
                        Core.inst().move(PATH.MYBTV_MYVOD_LIST);
                        break;
                    case MENU_NAVI.SMART_NOTICE:
                        const jump = JSON.parse(data.extInfo.jump);
                        const jumpType = data.extInfo.jumpType;
                        isHistoryClear = false;
                        console.log('jump', jump);

                        try {
                            if (jumpType === '1') {
                                // 장르홈이면
                                Core.inst().move(`${PATH.HOME}/${jump.gnb_typ_cd}/${jump.gnb_typ_cd}`, { menuId: jump.menu_id, gnbTypeCode: jump.gnb_typ_cd });
                            } else if (jumpType === '2') {
                                // 'jump.구분 === 블록위치'  TODO PATH.DETAIL_GENRE_HOME 일수도 있음 검토 필요
                                Core.inst().move(`${PATH.HOME}/${jump.gnb_typ_cd}/${jump.gnb_typ_cd}`, { menuId: jump.menu_id, gnbTypeCode: jump.gnb_typ_cd });
                            } else if (jumpType === '3') {
                                // 'jump.구분 === 시놉이면'  // "jump":{"sris_typ_cd":"02", "sris_id":"CS01010313","epsd_id":"CE0000006231"}
                                Core.inst().move(PATH.SYNOPSIS, {
                                    search_type: '1',
                                    epsd_id: jump.epsd_id, epsd_rslu_id: '',
                                    sris_id: jump.sris_id, productId: '',
                                });
                            } else if (jumpType === '4') {
                                // 'jump.구분 === 게이트웨이시놉이면'  "jump":{"sris_typ_cd":“02", "sris_id":"CS01152198“, “prd_id”:” PM0100086394”}
                                Core.inst().move(PATH.SYNOPSIS_GATEWAY, {
                                    search_type: '2',
                                    epsd_id: '', epsd_rslu_id: '',
                                    sris_id: jump.sris_id, productId: jump.prd_id,
                                });
                            }
                        } catch (error) {
                            Core.inst().showToast('error', 'SMART_NOTICE jump 필드 확인 필요 !');
                            console.error('SMART_NOTICE jump 확인요');
                        }
                        break;
                    default:
                        Core.inst().showToast('error', 'STB I/F ' + data.menuType + ' is not defined');
                        console.log('STB I/F ' + data.menuType + ' is not defined');
                        break;
                }
                if (isKidsMode) {
                    Core.inst().showKidsWidget();
                    return;
                } else {
                    Core.inst().hideKidsWidget();
                }
                // 팝업 크리어
                if (isPopupClear) {
                    Core.inst().cancelPopup();
                }
                // 히스토리 지우는 부분 검토 필요
                if (isHistoryClear) {
                    HistoryManager.clear();
                }
                console.log(' HistoryManager.getList().length=', HistoryManager.getList().length);
                // webView 숨겨진(display:none) 상태일때 보이도록 적용
                Core.inst().webVisible(true);

                cm.sendMessageToNative({
                    TYPE: STB_TYPE.RESPONSE,
                    COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
                    CONTENTS: '',
                    DATA: {
                        menuType: data.menuType,
                        result: 'success'
                    }
                });
                break;

            // IF-STB-V5-302
            case STB_COMMAND.PREPARE_VOD_PLAY:
                /**
                 * todo VOD 재생을 위한 사전 시나리오 처리 요청
                 * @param {Object} data = {
                 *       playType,	   //  VOD_CORNER : 코너별 보기
                 *                      //  VOD_ALL_CORNER : 코너별 모아보기
                 *                      //  VOD_PLAY : 일반
                 *       playOption,	   //  NORMAL : 일반 시놉에서 재생할 경우
                 *                      //  NEXT : 재생 종료 후 다음 회차 재생
                 *                      //  OTHER : 재생 중 playbar를 통한 다른 회차 재생
                 *                      //  SMART_RCU : SmartRCU를 통한 이어보기
                 *       contentId	,  //  재생할 VOD 콘텐츠 ID
                 *       startTime	,  //  이어보기 시간 
                 *       seeingPath	,  //  시청경로
                 *       groupId		,  //  VOD_ALL_CORNER 요청 시 groupId 추가하여 전달
                 *}
                 */

                if (isKidsMode) {
                    Core.inst().showKidsWidget();
                }
                // TODO 키즈존 이탈 시나리오 처리(검토) 필요

                // 웹뷰가 hide 된 상태
                const isWebShowprepareVOD = Core.inst().isWebShow();
                console.log('isWebShow=', isWebShowprepareVOD);
                if (!isWebShowprepareVOD) {
                    Core.inst().hidePageView();  //  팝업만 표시됨.
                }
                CTSInfo.prepareVOD(data, () => {
                    console.log('callback isWebShow=', isWebShowprepareVOD);
                    // 콜백은 무조건 취소일때만 발생.
                    if (data.playOption === CTSInfo.PALYOPTION.NEXT) {
                        // 다음화 재생을 실패한 경우 VOD STOP을 호출해준다.
                        StbInterface.requestStopVod();
                    }
                    if (!isWebShowprepareVOD) {
                        // web이 보여지고 있던 상태이면 hide 요청 
                        Core.inst().webVisible(false, true);  //  webHide 요청
                    }
                    // web이 보여지고 있었으면 nothing
                });

                break;

            // IF-STB-V5-303
            case STB_COMMAND.SET_CHANNEL_JOIN_STATE:

                /**
                 * 채널 가입/해지 처리
                 * @param {Object} data = {
                 *          state			,  //  가입 : join / 해지 : close
                 *          serviceId		,  //  서비스 아이디
                 *          channelNumber	,  //  채널 번호
                 *          channelName		,  //  채널 명
                 * } 
                 */
                // 웹뷰가 hide 된 상태
                const isWebShowpurchaseChannel = Core.inst().isWebShow();
                console.log('isWebShow=', isWebShowpurchaseChannel);
                if (!isWebShowpurchaseChannel) {
                    Core.inst().hidePageView();  //  팝업만 표시됨.
                }

                CTSInfo.purchaseChannel(data, () => {
                    console.log('callback isWebShow=', isWebShowpurchaseChannel);
                    // 콜백은 무조건 취소일때만 발생.
                    if (!isWebShowpurchaseChannel) {
                        // web이 보여지고 있던 상태이면 hide 요청 
                        Core.inst().webVisible(false, true);  //  webHide 요청
                    }
                    // web이 보여지고 있었으면 nothing
                });
                break;

            // IF-STB-V5-304
            case STB_COMMAND.SHOW_KIDS_ZONE_ALARM_WIDGET:
                /**
                 * 키즈존 알림시간 안내 위젯 노출
                 * @param {Object} data = {
                 *   type : 알림 타입
                 *       alarmBefore - 알림 시간 전
                 *       alarmAfter - 알림 시간 후
                 *       alarmAtTime - 알림 시간 정각
                 *       seeLimitTime - 시청 만료 임박 시간(분)"
                 *   character : 캐릭터(pororo, pinkfong, octonauts, kongsuni, carrie)
                 *   text : 알림 위젯에 노출할 문구
                 *   remainTime : 남은 시간(alarmBefore, alarmAfter, seeLimitTime 인 경우 필수)
                 * }
                 */
                Core.inst().showKidsWidget(data);
                break;
            // IF-STB-V5-305
            case STB_COMMAND.MENU_HOT_KEY_NAVIGATION_WEB:

                // 키즈존 일경우 키즈존 이탈 시나리오 적용 필요
                isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
                fnCallback = '';
                path = Core.inst().location.getPath();
                pathList = path.split('/');
                gnbPath = pathList[pathList.length - 1];
                gnbCode = pathList[pathList.length - 2];
                console.log('path=' + path, 'data.keyName=' + data.keyName, 'Core.inst().isWebShow()=' + Core.inst().isWebShow() + '  gnbPath=' + gnbPath + '  gnbCode=' + gnbCode);
                // 현재 화면과 이동할 화면이 같은 경우 hide 처리, 키즈 존 모드 일때는 다르게 처리.
                if (Core.inst().isWebShow()) {
                    if (((gnbPath === GNB_CODE.GNB_TV) && data.keyName === MENU_NAVI.TV) ||
                        ((gnbPath === GNB_CODE.GNB_MOVIE) && data.keyName === MENU_NAVI.MOVIE) || ((path === PATH.EPG) && data.keyName === MENU_NAVI.EPG)) {
                        // 팝업 크리어
                        Core.inst().cancelPopup();
                        Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                        // webView 숨기기
                        Core.inst().webVisible(false, true);
                        cm.sendMessageToNative({
                            TYPE: STB_TYPE.RESPONSE,
                            COMMAND: STB_COMMAND.MENU_HOT_KEY_NAVIGATION_WEB,
                            CONTENTS: '',
                            DATA: {
                                menuId: data.menuId,
                                keyName: data.keyName,
                                result: 'success'
                            }
                        });
                        return;
                    } else if (((path === PATH.SEARCH_MAIN) && data.keyName === MENU_NAVI.SEARCH) || ((path === PATH.ALL_MENU) && data.keyName === MENU_NAVI.MENU)) {
                        // 이전 화면 검색이고 검색 눌렸을때 또는 이전화면 전체메뉴이고 전체메뉴 눌렀을때. 
                        // 키즈 모드일때는 히스토리 크리어 안함
                        if (!isKidsMode) {
                            // 팝업 크리어
                            Core.inst().cancelPopup();
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                            Core.inst().webVisible(false, true);
                        }
                        cm.sendMessageToNative({
                            TYPE: STB_TYPE.RESPONSE,
                            COMMAND: STB_COMMAND.MENU_HOT_KEY_NAVIGATION_WEB,
                            CONTENTS: '',
                            DATA: {
                                menuId: data.menuId,
                                keyName: data.keyName,
                                result: 'success'
                            }
                        });
                        return;
                    }
                }

                switch (data.keyName) {
                    case MENU_NAVI.MENU:
                        let precode = GNB_CODE.GNB_MOVIE;
                        // if (path === PATH.SYNOPSIS || path === PATH.SYNOPSIS_VODPRODUCT || path === PATH.SYNOPSIS_GATEWAY || path === PATH.SYNOPSIS_PERSONAL ) {
                        //     precode = GNB_CODE.GNB_HOME;
                        // } else if ( gnbCode === GNB_CODE.GNB_MONTHLY || gnbCode === GNB_CODE.GNB_MOVIE || gnbCode === GNB_CODE.GNB_TV || gnbCode === GNB_CODE.GNB_ANI || gnbCode === GNB_CODE.GNB_SENIOR || gnbCode === GNB_CODE.GNB_DOCU ) {
                        //     precode = gnbCode;
                        // } else if (path === PATH.MYBTV_HOME) {
                        //     precode = GNB_CODE.GNB_MYBTV;
                        // } else if (path === PATH.KIDS_HOME) {
                        //     precode = GNB_CODE.GNB_KIDS;
                        // } else if (path === PATH.HOME_TVAPP) {
                        //     precode = GNB_CODE.GNB_TVAPP;
                        // } else if (path === PATH.SEARCH_MAIN) {
                        //     precode = GNB_CODE.GNB_SEARCH;
                        // } else if (path === PATH.EPG) {
                        //     precode = GNB_CODE.GNB_EPG;
                        // }

                        console.log('precode=', precode, HistoryManager.getList().length);
                        // TODO 키즈 화면일때 메뉴 처리 검토 필요.
                        if (!isKidsMode) {
                            Core.inst().move(PATH.IDLE);  // Idle 화면에서는 history clear 하고 있음.
                        }
                        Core.inst().move(PATH.ALL_MENU, {
                            menuId: data.menuId,
                            prevGnbCode: precode
                        });
                        break;
                    case MENU_NAVI.MOVIE:
                        gnb = this.getGnbMenuList(GNB_CODE.GNB_MOVIE);
                        fnCallback = () => { Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_MOVIE}/${GNB_CODE.GNB_MOVIE}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode }); };
                        isKidsMode ? Core.inst().webkidsExit(data.keyName, fnCallback) : fnCallback();
                        break;
                    case MENU_NAVI.TV:
                        gnb = this.getGnbMenuList(GNB_CODE.GNB_TV);
                        fnCallback = () => { Core.inst().move(`${PATH.HOME}/${GNB_CODE.GNB_TV}/${GNB_CODE.GNB_TV}`, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode }); };
                        isKidsMode ? Core.inst().webkidsExit(data.keyName, fnCallback) : fnCallback();
                        break;
                    case MENU_NAVI.SHOPPING:
                        // 쇼핑 핫키 처리, TODO 키즈존일때의 처리 확인 필요
                        // console.error('========================= 쇼핑:', data, data.categoryId);
                        let category = 2;
                        if (data.categoryId) {
                            category = Number(data.categoryId) + 3;
                        }
                        fnCallback = () => { Core.inst().move(PATH.EPG, { category: category }); };
                        isKidsMode ? Core.inst().webkidsExit(data.keyName, fnCallback) : fnCallback();
                        break;
                    default: break;
                }

                if (isKidsMode) {
                    Core.inst().showKidsWidget();
                    return;
                } else {
                    Core.inst().hideKidsWidget();
                }
                // 팝업 크리어
                Core.inst().cancelPopup();
                HistoryManager.clear();
                console.log(' HistoryManager.getList().length=', HistoryManager.getList().length);
                // webView 숨겨진(display:none) 상태일때 보이도록 적용
                Core.inst().webVisible(true);

                cm.sendMessageToNative({
                    TYPE: STB_TYPE.RESPONSE,
                    COMMAND: STB_COMMAND.MENU_HOT_KEY_NAVIGATION_WEB,
                    CONTENTS: '',
                    DATA: {
                        menuId: data.menuId,
                        keyName: data.keyName,
                        result: 'success'
                    }
                });
                break;

            // IF-STB-V5-307 VOD OTP 갱신 요청
            case STB_COMMAND.REFRESH_VOD_OTP:
                /** IF-STB-V5-307 VOD OTP 갱신 요청
                 * Request: cnt_url			문자	필수	Content URL
                 * Response: result			문자	필수	성공 여부 (success, fail)
                 *          otpUrl			문자	필수	OTP URL
                 *          otpId			문자	필수	OTP 아이디
                 *          otpPassword			문자		OTP 패스워드
                 */
                Core.inst().hidePageView();  //  팝업만 표시됨.
                CTSInfo.getNewOTP(data.cnt_url);
                break;

            // IF-STB-V5-308 메뉴이동요청
            case STB_COMMAND.DIRECT_MENU:

                // ex OPMS 의 경우 : U5_07/30/NM1000018171|NM1000000700|NM1000001200|NM1000019767|NM1000019779
                switch (data.directDataType) {
                    case 'setting_auth_number':

                        fnCallback = () => { Core.inst().move(PATH.MYBTV_HOME, { targetMenu: data.directDataType }); };
                        isKidsMode ? Core.inst().webkidsExit(data.keyName, fnCallback) : fnCallback();
                        break;
                    case 'OPMS':
                        // const metaData = data.directData.split('/');const gnbcode = metaData[0];const menuList = metaData[2].split('|');const menuId = menuList[menuList.length - 1];
                        let obj = {
                            callUrl: data.directData,
                            callTypeCode: constants.CALL_TYPE_CD.SHORT_CUT,
                        }
                        fnCallback = () => { Utils.moveToCallTypeCode(obj, true); };
                        // fnCallback = () => { Core.inst().move(`${PATH.HOME}/${gnbcode}/${gnbcode}`, { menuId: menuId, gnbTypeCode: gnbcode }); };
                        isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
                        break;
                    default: break;
                }

                cm.sendMessageToNative({
                    TYPE: STB_TYPE.RESPONSE,
                    COMMAND: STB_COMMAND.DIRECT_MENU,
                    CONTENTS: '',
                    DATA: {
                        result: 'success'
                    }
                });
                break;

            // IF-STB-V5-309 월정액 가입/해지 요청
            case STB_COMMAND.SET_MONTHLY_PRODUCT_JOIN_STATE:

                // data.state		    가입 : join / 해지 : close
                // data.productId		상품 아이디
                Core.inst().hidePageView();  //  팝업만 표시됨.

                if (data.state === 'join') {
                    CTSInfo.purchasePPMByHome({ state: data.state, pid: data.productId }, (obj) => {
                        let state = data.state;
                        if (obj.result === '0000') { // 가입 성공
                        } else if (obj.result === '1111') {
                            state = 'joined ';  // 이미 가입되어 있음.
                        } else {
                            state = 'cancel';  // 작업 취소
                        }
                        cm.sendMessageToNative({
                            TYPE: STB_TYPE.RESPONSE,
                            COMMAND: STB_COMMAND.SET_MONTHLY_PRODUCT_JOIN_STATE,
                            CONTENTS: '',
                            DATA: {
                                state: state,
                                productId: data.productId
                            }
                        });
                        Core.inst().webVisible(false, true);
                    });

                } else {
                    // TODO 해지 로직 처리 (native에서 받는 정보 부족)
                    cm.sendMessageToNative({
                        TYPE: STB_TYPE.RESPONSE,
                        COMMAND: STB_COMMAND.SET_MONTHLY_PRODUCT_JOIN_STATE,
                        CONTENTS: '',
                        DATA: {
                            state: 'close',
                            productId: data.productId
                        }
                    });
                    Core.inst().webVisible(false, true);
                }



                break;

            // IF-STB-V5-403
            case STB_COMMAND.WEB_HIDE_NOTI:
                // [TODO] 키즈 최초 진입 인 경우 로직 필요
                // console.log('VIGIN : ', StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY));
                // console.log('KIDS_MODE_ENTRY_VIRGIN : ', StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN));

                Core.inst().webVisible(false, false);
                break;

            // IF-STB-V5-404
            case STB_COMMAND.DELIVERY_TEXT:
                Core.inst().deliveryText(data.text);
                break;

            // IF-STB-V5-405
            case STB_COMMAND.OAP_PLAY_STATE:
                let callback = callbackMap.get(obj.COMMAND);
                if (utility.checkNullValue(callback) && typeof callback === 'function') {
                    callback(data.state);
                }
                break;

            // IF-STB-V5-406
            case STB_COMMAND.PIP_PLAY_STATE:
                StbInterface.callbackReceive(obj.COMMAND, data);
                break;

            // IF-STB-V5-408
            case STB_COMMAND.WEB_SHOW_NOTI:
                Core.inst().webShowNoti();
                break;

            // IF-STB-V5-411
            case STB_COMMAND.NOTIFY_CLEAR_SCREEN:
                Core.inst().clearScreen();
                break;

            // IF-STB-V5-412
            case STB_COMMAND.PPM_CANCEL_NOTI:
                Core.inst().ppmCancelNoti(data.result);
                break;

            case STB_COMMAND.OPEN_POPUP:
                if (data.menuType === 'TV_PAY_RESULT') {
                    var temp = data.extInfo.split('|');
                    BuyBill.callbackTVPay({
                        resultCode: temp[0], // 0-결제성공, 8900-사용자취소, 이외 미결제
                        seqNo: temp[1]
                    });
                } else {
                    StbInterface.callbackReceive(obj.COMMAND, data);
                }
                break;
            default:
                console.log('STB I/F static js: [receiveMessage] COMMAND ' + obj.COMMAND + ' is not defined');
                break;
        }
    }

    /**
     * native에서 받은 COMMAND에 해당하는 callback을 실행해주는 함수
     */
    static callbackReceive(COMMAND, data) {
        let callback = callbackMap.get(COMMAND);
        if (utility.checkNullValue(callback) && typeof callback === 'function') {
            callbackMap.delete(COMMAND);
            callback(data);
        }
    }

    // Native -> Webapp ReceiveMessage를 함수로 관리할 경우,, 아래와 같이 사용
    /* static addReceiveMessage() {
        cm.receiveMessageFromNative({
            command : 'StbInfo',
            request : function(data){
                console.log('stbInterface.js addRecive Test StbInfo');
            }
        });

        cm.receiveMessageFromNative({
            command : 'PlayInfo',
            request : function(data){
                console.log('stbInterface.js addRecive Test PlayInfo');
            }
        });
    } */

    /* static testCommunicator(obj) {
        cm.testCommunicator(obj);
    } */
    // })();
}

// export function stbInterface() {
//     return stbInterface;
// }

window.STB = StbInterface;

const pcChannelInterface = {
    searchType: {
        ALL: 'ALL',
        RANGE: 'RANGE',
        LIST: 'LIST'
    },
    getCurrentInfo() {
        return {
            num: 1,
            now: 1522142211629
        };
    },
    get(type, param) {
        return [];
    },
    getProgram(chList, startTime, endTime) {
        return [];
    }
}

const deviceChannelInterface = {
    searchType: {
        ALL: window.tvExt ? window.tvExt.channel.manager.SEARCH_TYPE_ALL : 'ALL',
        RANGE: window.tvExt ? window.tvExt.channel.manager.SEARCH_TYPE_RANGE : 'RANGE',
        LIST: window.tvExt ? window.tvExt.channel.manager.SEARCH_TYPE_LIST : 'LIST'
    },
    getProgram(chList, startTime, endTime) {
        const manager = window.tvExt.program.manager;
        const list = manager.getListByTime(chList, startTime, endTime);
        if (list && list.length !== 0) {
            return list.map((info, idx) => {
                return deviceChannelInterface._getProgramInfo(info);
            });
        }

        return list;
    },
    _getProgramInfo(info) {
        return {
            id: info.id,
            name: info.name,
            desc: info.description,
            img: info.imagePath,
            chID: info.channelID,

            director: info.director,
            actors: info.actors,
            startTime: Math.floor(info.startTime / 1000), // to unix timestamp
            endTime: Math.floor(info.endTime / 1000), // to unix timestamp
            startTimeOrigin: info.startTime,
            endTimeOrigin: info.endTime,
            duration: info.duration,
            status: info.runningStatus, // 0: Hidden, 1: Not running, 3: Pause, 4: Running
            rating: info.rating,
            audio: info.audioType,
            price: info.price,
            ca: info.freeCAMode,
            resolution: info.videoResolution,
            caption: info.isCaption,
            dolby: info.isDolbyAudio,
            dvs: info.isDVS
        };
    },
    get(type, param) {
        const manager = window.tvExt.channel.manager
        const { ALL, RANGE, LIST } = this.searchType;
        switch (type) {
            case ALL:
                if (manager.getList(ALL))
                    // return this.result();
                    return this.resultAsMap();
                return null;
            case RANGE:
                const { start, end } = param;
                if (manager.getList(RANGE, start, end))
                    return this.result();
                return null;
            case LIST:
                const { list } = param;
                if (manager.getList(LIST, list))
                    return this.result();
                return null;
            default: break;
        }
    },
    _getChannelInfo(info) {
        return {
            id: info.id,
            name: info.name,
            num: info.num,
            uri: info.uri,
            img: info.imagePath,
            genre: info.genre,
            category: info.category,
            type: info.type, // 0: Reserved, 1: DTV, 2: Digit Radio, 128: Audio
            areaCode: info.areaCode,
            pid: info.pcrPID,
            rating: info.rating,
            status: info.runningStatus, // 0: Hidden, 1: Not Running, 3: Pause, 4: Running
            previewTime: info.sampleTime,
            resolution: info.resolution,
            pay: info.isPay,
            exclusive: (info.num === 1 || info.num === 50),
            now: Date().now // 현재시간.
        };
    },
    getCurrentInfo() {
        const info = window.tvExt.channel.info;
        let currentInfo = null;
        if (info.getInfo(1)) {
            currentInfo = deviceChannelInterface._getChannelInfo(info);
        }
        return currentInfo;
    },
    result() {
        const info = window.tvExt.channel.info;
        const manager = window.tvExt.channel.manager;
        const list = [];
        for (let i = 0; i < manager.count; i++) {
            info.getFromList(i);
            const channelInfo = deviceChannelInterface._getChannelInfo(info);
            list.push(channelInfo);
        }
        return list;
    },
    resultAsMap() {
        const info = window.tvExt.channel.info;
        const manager = window.tvExt.channel.manager;
        const list = new Map();
        for (let i = 0; i < manager.count; i++) {
            info.getFromList(i);
            const channelInfo = deviceChannelInterface._getChannelInfo(info);
            list.set(channelInfo.num, channelInfo);
        }
        return list;
    }
}


class ChannelManager {
    constructor() {
        this.currentNumber = 1;
        this.currentlInfo = null;

        this.channelInterface = null;

        // 최초 부팅 시점에서 한번 세팅, 이후 적당한 타이밍 & 주기로 갱신 필요...
        this.allChannelInfoList = null;

        // 필터링 해서 보여줄 채널 리스트 (단순 인덱스 리스트)
        this.favChannelList = null;
        this.blockChannelList = null;
        this.joinChannelList = null;
    }

    init = () => {
        if (!appConfig.runDevice) {
            this.channelInterface = pcChannelInterface;
        } else {
            this.channelInterface = deviceChannelInterface;
        }

        this.currentInfo = this.channelInterface.getCurrentInfo();
        if (this.currentInfo) {
            this.currentInfo.now = Date.now(); // 현재시간 설정
        }
        this.currentNumber = this.currentInfo.num;

        // 전체 채널 정보를 가져와서 세팅
        this.allChannelInfoList = this._getAllList();
    }

    getCurrentInfo = () => {
        this.currentInfo.now = Date.now();
        return this.currentInfo;
    }

    _getAllList = () => {
        const { ALL } = this.channelInterface.searchType;
        return this.channelInterface.get(ALL);
    }

    getAllList = () => {
        // 미리 세팅된 채널정보. 
        return this.allChannelInfoList;
    }

    getRegisteredList = () => {
        const list = new Promise((res, rej) => {
            StbInterface.requestChannelList((data) => {
                const {
                    favoriteChannel: fav,
                    blockChannel: block,
                    joinChannel: join
                } = data;
                res({
                    fav: fav ? fav.split('|').map(str => parseInt(str, 10)) : [],
                    block: block ? block.split('|').map(str => parseInt(str, 10)) : [],
                    join: join ? join.split('|').map(str => parseInt(str, 10)) : []
                });
            });
        });
        return list
    }

    getReservationList = (list, start) => {
        return new Promise((res, rej) => {
            StbInterface.requestReservationInfo({
                isAll: 'NO',
                channelCount: list.length,
                channelList: list.map((pr, idx) => {
                    return {
                        channelInfo: {
                            // channelNo: ch.num,
                            // startTime
                        }
                    }
                })
            })
        })
    }

    getRangeList = (start, end) => {
        const { RANGE } = this.channelInterface.searchType;
        return this.channelInterface.get(RANGE, { start, end });
    }

    getListList = (list) => {
        let listString = '';
        for (const channelNo of list) {
            listString += channelNo + '|';
        }
        listString = listString.slice(0, -1);
        const { LIST } = this.channelInterface.searchType;
        return this.channelInterface.get(LIST, { list: listString });
    }

    getProgramList = (channelList, startTime, endTime) => {
        // const listString = channelList;
        // let listString = '';
        // for(const channelNo of channelList) {
        //     listString += channelNo + '|';
        // }
        // return this.channelInterface.getProgram(channelList, startTime*1000, endTime*1000);
        return this.channelInterface.getProgram(channelList, startTime * 1000, endTime * 1000);
    }
}

const CHManager = new ChannelManager();
// Object.freeze(CHManager);
window.CHManager = CHManager;
window.STB = StbInterface;
export { CHManager };

