import EventEmitter from "events";
import Core from "./core";

import KeyCodes from "./keyCodes";

var oldKeyCodeDown, oldKeyCodeUp;
var setTimeoutIdDown, setTimeoutIdUp, keyBlockTimeDown = 20, keyBlockTimeUp = 10;
// var firstKey = false;

class GlobalInputDispatcher extends EventEmitter {
    constructor() {
        super();

        /*  core._log("Init InputDispatcher")*/
        document.onkeydown = this.setOnKeydown.bind(this);
        document.onkeyup = this.setOnKeyup.bind(this);
    }

    /**
     * @private
     * @function setOnKeyup
     * @desc 키 이벤트 핸들러
     * @param {Object} oEvent - 키 이벤트
     */
    setOnKeyup(oEvent) {
        // console.log('keyUP, oEvent: ' + oEvent.keyCode);
        // const preventDefault = function () {
        //     oEvent.preventDefault();
        //     oEvent.stopPropagation();
        //     return false;
        // };

        if (Core.inst().recoverFlag) {
            // lazyKeyHandler.push(oEvent.keyCode);
            return;
        }

        if (Core.inst().isLock) {
            //  core._log('[CS] view.setOnKeyup ===> key blocked');
            return;
        }


        /* logViewer 키 관련 code end */
        // var currentActiveView = Core.inst().lastFocus;

        var key = KeyCodes.getKeyByValue(oEvent.keyCode);
        // core._log('[CS] view.setOnKeyup ===> activeView: ' + currentActiveView.name +', keyCode: ' + oEvent.keyCode +', value: ' + key + ', isLock: '+ Core.inst().isLock +', recoverFlag: '+Core.inst().recoverFlag);

        // console.log('key: ' + key);
        if (oldKeyCodeUp === key)
            return;

        _setKeyBlockUp(keyBlockTimeUp, key);

        // back space를 눌러 뒤로가기를 막는다.
        if (key === 'BACK_SPACE') {
            if (typeof oEvent.preventDefault === 'function') {
                oEvent.preventDefault();
            }
        }

        /// Emit
        if (key) {
            // core._log("[I-ON] view.setOnKeyup : ", key, oEvent );
            this.emit("keyup", {
                key: key,
                nativeEvent: oEvent
            });
        }
    }

    /**
     * @private
     * @function setOnKeydown
     * @desc 키 이벤트 핸들러
     * @param {Object} oEvent - 키 이벤트
     */
    setOnKeydown(oEvent) {
        // console.log('keyDown, oEvent: ' + oEvent.keyCode);
        //키 이벤트 호출 시 화면 종료 루틴 reset
        //   console.log("onkeydown Event - hideHomeViewFlag : " + core.store.getState().default.HomeReducer.hideHomeViewFlag);
        //   const preventDefault = function () {
        //     oEvent.preventDefault();
        //     oEvent.stopPropagation();
        //     return false;
        //   };

        // if (core.store.getState().default.HomeReducer.hideHomeViewFlag) {
        //     core.store.dispatch(actions.HomeAction.setHideView(false));
        //     //   preventDefault();
        // }

        // if (Core.inst().recoverFlag) {
        //     // lazyKeyHandler.push(oEvent.keyCode);
        //     return;
        //     //   return preventDefault();
        // }

        //document.getElementById('key-input').innerHTML = `${KeyCodes.getKeyByValue(oEvent.keyCode)} / ${new Date()}`

        // if (Core.inst().isLock) {
        //     // core._log('[CS] view.setOnKeydown ===> key blocked');
        //     return;
        //     //   return preventDefault(); 
        // }



        /* logViewer 키 관련 code start */
        // if( cs.module.logger ){
        //   cs.checkLogViewerKeys(oEvent.keyCode);
        //   // logger에 키를 전달
        //   if ( cs.getKeyDownStatus() ){
        //     cs.onLogViewerKeyDown(oEvent.keyCode);
        //     oEvent.preventDefault();
        //     return;
        //   }
        // }
        /*cs.checkLogViewerKeys(oEvent.keyCode);
    
        // logger에 키를 전달
        if ( cs.getKeyDownStatus() ){
            cs.onLogViewerKeyDown(oEvent.keyCode);
            oEvent.preventDefault();
            return;
        }*/
        /* logViewer 키 관련 code end */
        // var currentActiveView = Core.inst().lastFocus;
        // console.error('GLOBAL.KeyCode', oEvent.keyCode);
        var key = KeyCodes.getKeyByValue(oEvent.keyCode);
        //
        if (oldKeyCodeDown === key)
            return;

        // added by daemang7
        _setKeyBlockDown(keyBlockTimeDown, key);

        // core._log('[CS] view.setOnKeydown ===> activeView: ' + currentActiveView.name +', keyCode: ' + oEvent.keyCode +', value: ' +
        //   key + ', isLock: '+ Core.inst().isLock +', recoverFlag: '+Core.inst().recoverFlag);


        // back space를 눌러 뒤로가기를 막는다.
        if (key === 'BACK_SPACE') {
            if (typeof oEvent.preventDefault === 'function') {
                oEvent.preventDefault();
            }
        }

        /// Emit
        if (key) {
            // core._log("[I-ON] view.setOnKeydown : ", key, oEvent );
            this.emit("keydown", {
                key: key,
                nativeEvent: oEvent
            });
        }
    }
}

/**
 * @private
 * @function _setKeyBlock
 * @desc 키 block
 * @param {Number} t - 키 block 시간
 */
function _setKeyBlockDown(t, key) {
    var time = t || keyBlockTimeDown;

    if (setTimeoutIdDown) {
        clearTimeout(setTimeoutIdDown);
    }
    setTimeoutIdDown = setTimeout(function () {
        oldKeyCodeDown = '';
    }, time);
    oldKeyCodeDown = key;
}

/**
 * @private
 * @function _setKeyBlock
 * @desc 키 block
 * @param {Number} t - 키 block 시간
 */
function _setKeyBlockUp(t, key) {
    var time = t || keyBlockTimeUp;

    if (setTimeoutIdUp) {
        clearTimeout(setTimeoutIdUp);
    }
    setTimeoutIdUp = setTimeout(function () {
        oldKeyCodeUp = '';
    }, time);
    oldKeyCodeUp = key;
}

export default GlobalInputDispatcher
