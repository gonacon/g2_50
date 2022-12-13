import React from 'react'
import isFunction from 'lodash/isFunction';

import appConfig from "../config/app-config";
import { utility } from "../utils/utility";
import Location from "./Location";
import GlobalInputDispatcher from "./GlobalInputDispatcher";
// import EpgData from '../routes/liveTv/organization/epgData';
import { PATH, GNB_CODE, STB_PROP, STB_TYPE, STB_COMMAND } from './../config/constants';
import StbInterface, { CHManager } from './stbInterface';
import HistoryManager from 'Supporters/history';
import { KidsEndCertification } from './../routes/kids/playguide';
import PlayGuideEnd from './../routes/kids/playguide/PlayGuideEnd';
import { Communicate as cm } from './communicate';
// import keyCodes from 'Supporters/keyCodes';
import Axios from 'axios';
import Utils from 'Util/utils';

window.__coreInstance = null;

// const TIMEUNIT = 1800;         //30min
// const TIMEUNIT = 300;         //5min
// const TIME2PIXEL = 1425 / 5400;  //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기

// let kidsFlag = false;

// let oldKey = "";
// let reCount = 0;
// let timeoutID, runtimeID;

let config = {
    core: {
        maxHistoryLimit: 0,
        consoleLog: false,
        errorLog: false,
        warnLog: false,
    }
};


class Core {
    _log() {
        if (config.core.consoleLog) {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console, args);
        }
    }

    _warn() {
        if (config.core.warnLog) {
            var args = Array.prototype.slice.call(arguments);
            console.warn.apply(console, args);
        }
    }

    _error() {
        if (config.core.errorLog) {
            var args = Array.prototype.slice.call(arguments);
            console.error.apply(console, args);
        }
    }

    _reject_non_error() {
        if (typeof arguments === 'object')
            return;

        var args = Array.prototype.slice.call(arguments);
        if (config.core.errorLog)
            console.error.apply(console, args[1]);
        args[0]({ error: args[1] });
    }

    static inst() {
        if (window.__coreInstance === null) {
            this._error("Core instance is not initialized. Create core first");
        }

        return window.__coreInstance;
    }

    static create() {
        if (window.__coreInstance === null) {
            window.__coreInstance = new Core();
        } else {
            this._error("Core instance is already created.")
        }

        return window.__coreInstance;
    }

    resetData() {
        this._saveData = '';
    }

    constructor(_history) {
        if (window.__coreInstance) throw new Error("Core 인스턴스 중복 생성");

        ///////// Fields ////////////
        this._stbInfoFlag = false;
        this._recoverFlag = false;
        this._isLock = false;
        // focus격리 모드 마지막의 뷰에 키이벤트를 가둔다.
        // abandon 제외 이벤트 핸들러를 찾지 못할때 발생하는 undefined 로 인한 상위뷰에 이벤트 전달을 막음
        this._isIsolatedFocusMode = false;
        this.mainFocusStack = [];
        this.popupFocusStack = [];
        this.targetFocusStack = null;
        this._saveData = '';

        this.core = {};
        this.console = [];
        this.keyHandler = [];
        this.keyHandlerIndex = -1;
        // this.keyHandler2 = [];
        // this.keyHandlerIndex2 = -1;

        this.popupContainer = '';
        this.toast = '';
        this.gnbMenu = '';
        this.kidsWidget = '';
        this.kidsHome = '';
        this.webRoot = document.getElementById('root');
        this.webPageView = '';
        this.webShow = false;
        this.showMenu = () => { };
        // this.kidsFlag = false;
    }

    //////////////////////////
    // Getter / Setter
    //////////////////////////
    get saveData() {
        return this._saveData;
    }

    get recoverFlag() {
        return this._recoverFlag;
    }

    get isLock() {
        return this._isLock;
    }

    get isIsolatedFocusMode() {
        return this._isIsolatedFocusMode;
    }

    get inputDispatcher() {
        return this._inputDispatcher;
    }

    get lastFocus() {
        return this.focusStack[this.focusStack.length - 1] || null;
    }

    get focusLength() {
        return this.focusStack.length;
    }

    // get isRun() {
    //     return this._isRunning;
    // }

    // ActiveView : FocusedView
    // get activeView(){
    //   if( this.bindedComponents && this.bindedComponents.length > 0 ){
    //     return this.bindedComponents[0]
    //   } else {
    //     return null;
    //   }
    // }

    get activatedView() {
        return this._activatedView;
    }

    get focusStack() {
        if (this.targetFocusStack === 'main') {
            return this.mainFocusStack;
        } else if (this.targetFocusStack === 'popup') {
            return this.popupFocusStack;
        }
    }

    set focusStack(_stack) {
        if (this.targetFocusStack === 'main') {
            this.mainFocusStack = _stack;
        } else if (this.targetFocusStack === 'popup') {
            this.popupFocusStack = _stack;
        }
    }

    get historyManager() {
        return this._history;
    }

    get saveConsole() {
        return this.console;
    }

    set saveData(_data) {
        this._saveData = _data;
    }

    set saveConsole(_data) {
        this.console.push(_data);
    }

    reqConsoleClear() {
        this.console = [];
    }

    keyInputLock() {
        this._isLock = true;
    }

    releaseKeyInputLock() {
        this._isLock = false;
    }

    stbInfoFlag() {
        this._stbInfoFlag = true;
    }

    //////////////////////////
    // Methods
    //////////////////////////
    run(callback) {
        if (this.isRunning) {
            this._error("Core already run.")
            return;
        }
        this.initCallback = callback;
        this._inputDispatcher = new GlobalInputDispatcher();

        this._inputDispatcher.on('keydown', this.inputDispatch.bind(this));
        // window.addEventListener('keydown', this.inputDispatch.bind(this));
        StbInterface.requestStbInfo(callback);
        // StbInterface.middleWare();
        Utils.localImagePreLoad();  // 로컬 사용 이미지 프리로딩

        if (appConfig.runDevice) {
            // 초기 로딩 시간 확보를 위해 나중에 로드 
            setTimeout(() => {
                // StbInterface.getEpgData();
                CHManager.init();
            }, 7000);
        }

        this.updateCheck();

    }

    receiveMessageFromNative(obj) {
        StbInterface.receiveMessageFromNative(obj);

        //     // STB I/F Test // 나중에 삭제해야함
        //     if (utility.checkNullValue(this.location) && this.location.getPath().toLowerCase() === PATH.STB_TEST) {
        //         document.querySelector('#stbTest #response').innerHTML = JSON.stringify(obj);
        //     }
        //     // STB I/F Test
    }

    setHistory(_history) {
        // console.log(' history : ', _history);
        this.location = new Location(_history, this);
    }

    setPageView(webPageView, gnbShowFn) {
        // console.log(' history : ', _history);
        this.webPageView = webPageView;
        this.showMenu = gnbShowFn;
    }

    /**
     * page가 표시되고 있는지 표시되는지 숨겨졌는지를 반환 한다.
     * true === show, false is hide
     */
    isShowPage() {
        let bool = false;
        try {
            bool = this.webPageView.style.display === 'none' ? false : true;
        } catch (error) {

        }
        console.log('isShowPage bool=', bool);
        return bool;
    }

    /**
     * page를 표시한다. popup은 영향받지않음.
     * page는 route의 부모 엘리먼트
     */
    showPageView() {
        try {
            this.webPageView.style.display = 'block';
        } catch (error) {

        }
    }

    /**
     * page를 감춘다. popup은 영향받지않음.
     * page는 route의 부모 엘리먼트
     */
    hidePageView() {
        this.showMenu(false, false);
        try {
            this.webPageView.style.display = 'none';
        } catch (error) {

        }
    }

    /**
     * component로 전달된 팝업을 불러오도록 팝업컨테이너에 전달.
     * ex)
     * Core.inst().showPopup(<ConfirmPopup />, {}, this.confirmCallBack);
     * component : 팝업으로 보여질 팝업 component
     * obj : 팝업에서 사용될 변수들의 object
     * callFn : 팝업 종료 후 실행될 callback 함수 
     */
    showPopup = (component, obj, callFn) => {
        // TODO 팝업 컨테이너가 없는경우(null) 에러체크 필요
        if (this.popupContainer.popupList.length === 0 || this.popupContainer.popupList[this.popupContainer.popupList.length - 1].component.type !== component.type) {
            // 예외처리, 동일한 팝업을 연달아 호출(키 연타 등)일때, 한번만 호출할 수 있도록 한다.
            this.popupContainer.showPopup(component, obj, callFn);
        }
    }

    /**
     * 모든 팝업을 닫는다.
     * Core.inst().cancelPopup();
     */
    cancelPopup = () => {
        console.log('cancelPopup()');
        this.popupContainer.cancelPopup();
    }

    /**
    * Toast 팝업을 보여준다.
    * component로 전달된 팝업을 불러오도록 팝업컨테이너에 전달.
    * ex)
    * Core.inst().showToast('XPG 에러 9001 입니다. ', , 3000);
    * title : 화면에 1번째 표시될 text
    * detail : 화면 2번째 줄에 표시될 text
    * showTime : toast 메시지가 보여질 시간 showTime이 없는 경우는 기본 3초
    * 한줄로 표시할 경우 title 만 사용
    */
    showToast = (title, detail, showTime) => {
        StbInterface.requestOpenToast(title, detail);
        if (!appConfig.runDevice) {
            this.toast.show(title, detail, showTime);
        }
    }

    /**
    * kidszone widget을 숨긴다.
    */
    hideKidsWidget = () => {
        this.kidsWidget.hide();
    }

    /**
     * kidszone widget을 표시 한다.
     * 
     * data {
     *      type : 알림 타입
     *          alarmBefore - 알림 시간 전
     *          alarmAfter - 알림 시간 후
     *          alarmAtTime - 알림 시간 정각
     *          seeLimitTime - 시청 만료 임박 시간(분)
     *      character : 캐릭터(pororo, pinkfong, octonauts, kongsuni, carrie)
     *      text : 알림 위젯에 노출할 문구
     *      remainTime : 남은 시간(alarmBefore, alarmAfter, seeLimitTime 인 경우 필수)
     * }
     */
    showKidsWidget = (data, animation) => {
        this.kidsWidget.show(data, animation, this.kidsHome);
    }

    deliveryText = (text) => {
        console.log('deliveryText text=', text);

        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.deliveryText(text);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    onBtSearchKidszone = () => {
        console.log('onBtSearchKidszone');
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onBtSearchKidszone();
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    onChannelChanged = (kidsChannelServiceId) => {
        console.log('onChannelChanged kidsChannelServiceId=', kidsChannelServiceId);
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onChannelChanged(kidsChannelServiceId);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    ppmCancelNoti = (data) => {
        console.log('ppmCancelNoti data=', data);
        if (this.keyHandler.length > 0) {
            try {
                this.keyHandler[this.keyHandlerIndex].component.onPPMCancelNoti(data);
            } catch (error) {
                console.log('error=' + error);
            }
        }
    }

    setPopupContainer(popup) {
        this.popupContainer = popup;
    }

    setToast(toast) {
        this.toast = toast;
    }

    setGnbMenu(gnbMenu) {
        this.gnbMenu = gnbMenu;
    }

    setKidsWidget(kidsWidget) {
        this.kidsWidget = kidsWidget;
    }

    setKidsHome(kidsHome) {
        this.kidsHome = kidsHome;
    }

    move(path, obj) {
        if (this.location && isFunction(this.location.move)) {
            this.location.move(path, obj);
            this.showPageView();
        }
    }

    back() {
        if (this.location && isFunction(this.location.back)) {
            console.log('back HistoryManager.getList().length', HistoryManager.getList().length);

            if (HistoryManager.getList().length === 0) {
                // this.move(PATH.IDLE, {  showMenu: this.showMenu  });
                this.move(PATH.IDLE);
            } else {
                this.location.back();
            }
            this.showPageView();
        }
    }

    addKeyListener = (key, keyEvent, component) => {

        this.keyHandler.push({
            key,
            keyEvent,
            component,
            pathname: component.keyPathname
        });
        // console.log('addKeyListener path=%s', component.props.location.pathname);

        this.keyHandlerIndex = this.keyHandler.length - 1;
    }

    removeKeyListener = (key, keyEvent, component) => {
        // const pathname = component.props.location.pathname;
        const pathname = component.keyPathname;
        const handlerList = this.keyHandler.filter(handler => handler.pathname !== pathname);
        // console.log('removeKeyListener path=%s', pathname, handlerList);
        this.keyHandler = handlerList;
        this.keyHandlerIndex = this.keyHandler.length - 1;
    }

    /**
     * Clear 스크린 상태 알림
     * 나가기 키, 채널 재핑 키 눌렸을때 전달
     */
    clearScreen = () => {
        let isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
        this.cancelPopup();
        if (!isKidsMode) {
            this.webVisible(false);
            HistoryManager.clear();
            this.move(PATH.IDLE);
        }
    }

    /**
     * webView가 화면에 표시 될때 노출됨.
     */
    webShowNoti = () => {
        this.webVisible(true);
        // TODO  pip 이전에 있던 경우 처리 필요
        if (this.keyHandler.length > 0) {
            try {
                if (this.isShowPage()) {
                    this.keyHandler[this.keyHandlerIndex].component.webShowNoti();
                }
            } catch (error) {
                console.log('error=' + error);
            }
        }
        console.log('webShowNoti webview가 show 될때 호출됨 NATIVE WEB_SHOW_NOTI');
    }

    webVisible = (bool, isNativeHideCall = false) => {
        this.webShow = bool;
        console.log('this.webShow=', this.webShow);

        // TODO root display none block 처리, webView가 show 되는 시점을 알아야함.
        if (bool) {
            if (appConfig.runDevice) {
                // 기존 화면 잔상 남는 문제로 100ms 딜레이. peter
                setTimeout(() => {
                    // this.webRoot.style.display = 'block';
                    console.log('this.webRoot.style.display=', this.webRoot.style.display);
                }, 100);
            }
        } else {
            if (appConfig.runDevice) {
                // setTimeout(() => {
                // this.webRoot.style.display = 'none';
                console.log('this.webRoot.style.display=', this.webRoot.style.display);
                // }, 100);
            }

            if (isNativeHideCall) {
                StbInterface.webHideNoti();
            }

            this.updateCheck();
        }
    }

    isWebShow = () => {
        // return this.webRoot.style.display === 'block' ? true : false;
        return this.webShow;
    }

    updateCheck() {
        // let verPath = '/version.txt?update=' + new Date().getTime();
        // if (!appConfig.runDevice) {
        let verPath = '/ui5web/v5/version.txt?update=' + new Date().getTime();
        // }
        try {
            Axios.get(verPath).then(function (response) {
                const ver = StbInterface.getProperty(STB_PROP.WEBUI_VERSION);
                // console.log('response.data=', response.data);
                if (ver !== response.data) {
                    StbInterface.setProperty(STB_PROP.WEBUI_VERSION, response.data);
                    StbInterface.reload(1);
                }
                var localUrl = document.location.href.split(":")[1];
                document.getElementById('localver').innerHTML = localUrl + ' : ' + response.data;
            });
        }
        catch (error) {
        }
    }

    inputDispatch(evt) {

        // evt.nativeEvent = evt;
        // const key = evt.key;
        // const key = keyCodes.getKeyByValue(evt.keyCode);
        const isKidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
        let fnCallback = '';

        const key = evt.key;
        // console.log('%c inputDispatch key=', 'color: red; background: yellow', key);
        if (this.keyHandler.length > 0) {
            const rs = this.keyHandler[this.keyHandlerIndex].component.onKeyDown(evt.nativeEvent);
            // const rs = this.keyHandler[this.keyHandlerIndex].component.onKeyDown(evt);
            if (rs === true) {
                if ((key === 'BACK_SPACE') || ((!appConfig.runDevice) && (key === 'PC_BACK_SPACE'))) {
                    return
                }
            }
        }

        if (key === 'STB_HOME' || key === 'HOME') {
            // TODO home 키가 눌려도 history clear 안해야 되는 경우 있는지 검토 필요
            HistoryManager.clear();
            if (this.location.getPath() === PATH.BASE || this.location.getPath() === PATH.HOME) {
                this.move(PATH.IDLE);
                this.webVisible(false, true);
            } else {
                fnCallback = () => {
                    Core.inst().cancelPopup();
                    this.move(PATH.IDLE);
                    const gnb = StbInterface.getGnbMenuList(GNB_CODE.GNB_HOME);
                    this.move(PATH.HOME, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                }
                isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
            }
            return
        } else if ((key === 'BACK_SPACE') || ((!appConfig.runDevice) && (key === 'PC_BACK_SPACE'))) {
            // popup이 있는지 확인
            fnCallback = () => {
                if (!this.popupContainer.hasPopup()) {
                    if (HistoryManager.getList().length > 0) {
                        this.back();
                    } else {
                        // this.move(PATH.IDLE);
                        this.back();
                        this.webVisible(false, true);
                        if (!appConfig.runDevice) {
                            this.showToast('StbInterface.webHideNoti().', 'STB에서 화면 사라짐');
                        }
                    }
                    return
                }
            }
            isKidsMode && this.location.getPath() === PATH.KIDS_HOME ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
        }

        // peter key test
        if (key === 'MENU') {  // w 'key'
            // this.showToast('toast test');
            // let data = { "CONTENTS": "", "COMMAND": "NotifyClearScreen", "TYPE": "notify" }
            // this.receiveMessageFromNative(data);
        } else if (key === 'ALLMENU') {  // m 'key'
            // 전체 메뉴 하위뎁스 이동
            // let data = { "DATA": { "extInfo": { "currentPlayState": "5", "call_url": "NM1000018142/NM1000018146/NM1000019661" }, "menuType": "allMenu" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // btv pluse 전달
            // let data = { "DATA": { "text": "컨" }, "CONTENTS": "", "COMMAND": "DeliveryText", "TYPE": "notify" };
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{20639824-49E0-11E8-867B-3D11A15194C7}", "sris_id": "", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // let data = { "DATA": { "channelNumber": "325", "serviceId": "200", "state": "join", "channelName": "디자이어TV" }, "CONTENTS": "", "COMMAND": "SetChannelJoinState", "TYPE": "request" }
            // let data = { "DATA": { "channelNumber": "320", "serviceId": "184", "state": "join", "channelName": "플레이보이TV" }, "CONTENTS": "", "COMMAND": "SetChannelJoinState", "TYPE": "request" }
            // let data = {"DATA":{"point_count":"80000","coupon_new":"N","coupon_count":"0","point_new":"N"},"CONTENTS":"","COMMAND":"RequestCouponPoint","TYPE":"request"}
            // let data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" };
            // let data = { "DATA": { "directDataType": "setting_auth_number", "directData": "" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
            // data = { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }
            // let data = { "DATA": { "keyName": "allMenu","menuId": "allMenu"},"CONTENTS": "","COMMAND": "MenuHotKeyNavigationWeb","TYPE": "request"}
            // let data = {"DATA": {coupon_count: '21348',coupon_new: 'Y',bpoint_count: '98345',bpoint_new: ''},"CONTENTS": "","COMMAND": "RequestCouponPoint","TYPE": "request"}
            // let test = '"jump": { "sris_id": "CS01010313", "epsd_id": "CE0000006231", "sris_typ_cd": "02" }';
            // let data = {"DATA": {"extInfo": {"jumpType": "3","jump": "{ \"sris_id\": \"CS01010313\", \"epsd_id\": \"CE0000006231\", \"sris_typ_cd\": \"02\" }"},"menuType": "smartNotice"},"CONTENTS": "","COMMAND": "MenuNavigationWeb","TYPE": "request"};
            // let data = {"DATA": {"extInfo": {"jumpType": "3","jump": { "sris_id": "CS01010313", "epsd_id": "CE0000006231", "sris_typ_cd": "02" }}, "menuType": "smartNotice"},"CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request"}
            // 엔딩 시놉
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "", "epsd_id": "CE0001359343", "adultCheck": false, "title": "조선명탐정: 흡혈괴마의 비밀", "epsd_rslu_id": "{966E4876-236C-11E8-BA5D-F33514C76BAF}", "sris_id": "CS01116445", "search_type": "1" }, "menuType": "synopsisEnding" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 키즈존 -> 음성검색 -> 헬로카봇
            // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"60","epsd_id":"CE0001308900","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{35EAB2D3-395F-11E8-B7C9-65278E0872EC}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsis"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
            // 바커 채널에서 빨간키
            // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{33299A12-5E4C-11E8-91B3-AF1AD3B8D2B6}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
            // 바커 채널에서 빨간키
            // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{435D2952-624E-11E8-B712-97970028D4AA}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
            // 키즈존 -> 음성검색 -> 뽀로로
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "60", "epsd_id": "CE0000942511", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{C8EFB6A6-3A94-11E2-A16B-AD79C28776CB}", "sris_id": "", "currentPlayState": "5", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 바커 채널에서 빨간키
            // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"31","epsd_id":"","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{EC22430B-5E46-11E8-9F62-211E054CE9F3}","sris_id":"","currentPlayState":"5","search_type":"2"},"menuType":"synopsisDirect"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"}
            //     Core.inst().webShowNoti();
            // vod 재생 중   홈키
            // let data = { "DATA": { "extInfo": { "currentPlayState": "6" }, "menuType": "home" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 나가기 키
            // let data = { "CONTENTS": "", "COMMAND": "NotifyClearScreen", "TYPE": "notify" }
            // console.log('jump=' + JSON.stringify(test));
            // 음성 검색 "키즈존"
            // let data = { "DATA": { "extInfo": { "currentPlayState": "1" }, "menuType": "kidsZoneHome" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 핫키로 전체메뉴
            // let data = { "DATA": { "menuId": "NM10000018142/NM1000020100", "keyName": "allMenu" }, "CONTENTS": "", "COMMAND": "MenuHotKeyNavigationWeb", "TYPE": "request" }
            // 핫키로 검색
            // let data = { "DATA": { "extInfo": { "currentPlayState": "1" }, "menuType": "search" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 음성검색 -> 킹스맨
            // let data = {"DATA":{"extInfo":{"fromCommerce":false,"seeingPath":"60","epsd_id":"CE0000005185","adultCheck":false,"title":"","isKidsContents":"","epsd_rslu_id":"{A0862AC7-B49A-11E7-A772-B559D4D32E8F}","sris_id":"","currentPlayState":"1","search_type":"2"},"menuType":"synopsis"},"CONTENTS":"","COMMAND":"MenuNavigationWeb","TYPE":"request"};
            // 음성검색 -> 무한도전
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "60", "epsd_id": "CE0000716811", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "{60F3D30E-5887-11E6-BCEE-63002089F0E6}", "sris_id": "", "currentPlayState": "1", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" };
            // 빨간키 장르홈 이동
            // let data = { "DATA": { "directData": "U5_03//NM1000018171|NM1000000300|NM1000019803", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
            // let data = { "DATA": { "directData": "U5_03//NM1000018171|NM1000000300|NM1000019828", "directDataType": "OPMS" }, "CONTENTS": "", "COMMAND": "DirectMenu", "TYPE": "request" };
            // 빨간키 menunavi 이동
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "3", "epsd_id": "CE0001274847", "adultCheck": false, "title": "", "isKidsContents": "", "epsd_rslu_id": "", "sris_id": "CS01059416", "currentPlayState": "1", "search_type": "1" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 예고편 이전키 -> 시놉
            // let data = { "DATA": { "extInfo": { "fromCommerce": false, "seeingPath": "99", "epsd_id": "", "adultCheck": false, "title": "", "isKidsContents": "N", "epsd_rslu_id": "{9EFC08FB-2759-11E8-AF31-6514001B4B4E}", "sris_id": "", "currentPlayState": "6", "search_type": "2" }, "menuType": "synopsis" }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request" }
            // 키즈 알람 5분전
            // let data = { "DATA": { "alarmType": "0", "type": "alarmBefore", "text": "ㅡㅋ· 친구야이제 곧 유치원 갈 시간이야~", "character": "pinkfong" }, "CONTENTS": "", "COMMAND": "ShowKidsZoneAlarmWidget", "TYPE": "request" }

            // this.receiveMessageFromNative(data);

            // StbInterface.resizeMainPlayer('N', 2, 5, 600, 500);

        }

    }

    webkidsExit(menuType = null, callback) {
        const isKidsSafty = StbInterface.getProperty(STB_PROP.KIDS_SAFETY_PASSWORD);
        const fnCallback = (menuType) => {
            // if (isHistoryclear) {
            //     HistoryManager.clear();  //  키즈존 이탈은 모든 history 삭제
            // }
            if (menuType != null) {
                Core.inst().webVisible(true);
                cm.sendMessageToNative({
                    TYPE: STB_TYPE.RESPONSE,
                    COMMAND: STB_COMMAND.MENU_NAVIGATION_WEB,
                    CONTENTS: '',
                    DATA: {
                        menuType,
                        result: 'success'
                    }
                });
            }
        }

        if (isKidsSafty === '0') { // 1. 키즈존 잠금 미설정 시
            // 1-1. 키즈존 종료 가이드 호출,  20180619 peter 시나리오쪽에서 키즈존 종료 가이드 안보이도록 요청 받음.
            // Core.inst().showPopup(<PlayGuideEnd />, '', () => {
            // console.log('%c[PlayGuideEnd CallBack] ===>','color:#0000ff', data);
            // if (callback && typeof callback === 'function') {
            Core.inst().hideKidsWidget();
            StbInterface.kidszoneState('exit');
            !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
            if (callback) {
                callback();
            }
            fnCallback(menuType);
            // }
            // });

        } else { // 2. 키즈존 잠금 설정 시
            // 2-1. 키즈존 종료 인증 팝업 호출
            Core.inst().showPopup(<KidsEndCertification />, '', (data) => {
                // console.log('%c[KidsEndCertification CallBack] ===>','color:#0000ff', data);
                if (data && data.result === '0000') {
                    Core.inst().hideKidsWidget();
                    StbInterface.kidszoneState('exit');
                    !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '0');
                    if (callback && typeof callback) {
                        callback();
                    }
                    fnCallback(menuType);
                }
            });
        }
    }
}

window.CoreClass = Core;

export default Core





// STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayOap", "CONTENTS": "", "DATA": { "playState": 1 } }
// communicate.js: 46 STB I / F communicate.js: [getMessage] { "TYPE": "request", "COMMAND": "EncryptData", "CONTENTS": "", "DATA": { "target": "scs", "cryptType": "encrypt", "text": "{081E6E12-25AA-11E8-AD34-21E42E7495CA}^cc:4e:ec:d0:94:18^{A1449540-4850-11E8-9F62-211E054CE9F3}^6326286^10", "dateTime": "0608160724" } }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayInfo", "CONTENTS": "", "DATA": "" }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "DATA": { "contentId": "{34B14B5D-4947-11E8-9F62-211E054CE9F3}", "isPlayType": "VOD" }, "CONTENTS": "", "COMMAND": "PlayInfo", "TYPE": "response" }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "request", "COMMAND": "PlayVod", "CONTENTS": "", "DATA": { "playType": "preview", "playOption": "normal", "cnt_url": "skbvod://cdn2.hanafostv.com:554/movie/34950/M349243_2_180426.ts.pac?ci={A14…0-4850-11E8-9F62-211E054CE9F3}&oi=747aM349243_2_180426&op=4a0d4431437&rp=0", "type": "2", "repeatIndex": "", "useStartTime": "", "kids_yn": "N", "synopType": "normal", "seamless": "N", "seeingPath": "47", "gCode": "", "iptvSetProdBuyFlag": "N", "trailerTitle": "일반용UI 예고편 [곤지암]", "menuId": "", "fromCommerce": "", "uxReference": "", "kidschar_id": "", "synopsisInfo": { "title": "곤지암", "sris_id": "CS01067093", "epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}", "kids_yn": "N", "genreCode": "", "currentMenu": "", "openg_tmtag_tmsc": "", "endg_tmtag_tmsc": "", "org_epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}", "isMovie": "Y", "isFree": "N", "linkType": "Y", "isSample": "N", "isAdult": "N", "poster": "", "mediaType": "", "wat_lvl_cd": "15", "play_tms_val": "94", "ending_cw_call_id_val": "TEST.ENDING.SYNOPSIS.PAGE", "isSeries": "N", "mtx_capt_yn": "", "meta_typ_cd": "000", "cornerList": null, "preview_start_index": "0", "preview": [{ "pcim_addn_typ_nm": "예고편", "prd_prc_id": "6326286", "epsd_rslu_id": "{A1449540-4850-11E8-9F62-211E054CE9F3}", "img_path": "/movie/34950/M349243_2_trailer.jpg", "title": "일반용UI 예고편 [곤지암]" }] }, "wscsInfo": { "chargePeriod": "5", "contentId": "{A1449540-4850-11E8-9F62-211E054CE9F3}", "contentUrl": "tvsrtsp://cdn2.hanafostv.com:554/movie/34950/M349243_2_180426.ts.pac", "productType": "10", "productId": "6326286", "wmUseFlag": "N", "wmExtension": "", "wmMode": "0", "id": "747aM349243_2_180426", "password": "4a0d4431437" }, "startTime": "0" } }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "CONTENTS": "", "COMMAND": "WebHideNoti", "TYPE": "notify" }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "notify", "COMMAND": "WebHideNoti", "CONTENTS": "", "DATA": "" }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage]
// let data = {
//     "DATA": {
//         "extInfo": {
//             "fromCommerce": false, "seeingPath": "99", "epsd_id": "", 
//             "adultCheck": false,
//              "title": "", 
//              "isKidsContents": "",
//               "epsd_rslu_id": "{65CC0B1F-484E-11E8-9F62-211E054CE9F3}",
//                "sris_id": "", "currentPlayState": "5", "search_type": "2"
//         }, "menuType": "synopsis"
//     }, "CONTENTS": "", "COMMAND": "MenuNavigationWeb", "TYPE": "request"
// }
// communicate.js: 88 STB I / F communicate.js: [sendMessage] { "TYPE": "response", "COMMAND": "MenuNavigationWeb", "CONTENTS": "", "DATA": { "menuType": "synopsis", "result": "success" } }
// stbInterface.js: 1392 STB I / F static js: [receiveMessage] { "CONTENTS": "", "COMMAND": "WebShowNoti", "TYPE": "notify" }