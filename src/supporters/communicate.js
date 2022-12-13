// import Core from './core';
// import appConfig from '../config/app-config';

/**
 * Webapp/STB간 통신 API<br><br>
 * cs.sendMssageToCSS / cs.receiveMessageFromCSS 메소드를 이용하여 데이터를 주고 받음.
 *
 * @namespace Communicator
 * @see cs.sendMssageToCSS
 * @see cs.receiveMessageFromCSS
 * @example
*/

export class Communicate {
    // (function () {

    static callbacks = {};
    // static cm = null;

    // static getInterface() {
    //     if (this.cm !== null) {
    //         this.cm = new Communicate();
    //     }
    //     return this.cm;
    // }

    static initialize() {
        if (typeof android !== 'undefined') {
            // var output, property;
            // for (property in window.android) {
            //     output += property + ': ' + window.android[property] + '; \n';
            // }
            /* app.setMessageCallback('ContainerToApp', function( obj ){
                execCallback(obj.TYPE, obj.COMMAND, obj.CONTENTS, obj.DATA);
            }); */
            if (typeof window.android.setMessageCallback === 'function') {
                window.android.setMessageCallback('ContainerToApp', 'core.receiveMessageFromNative');
            }
        }
    }

    static getMessage(obj) {
        var noUseServerLog = ['TYPE', 'COMMAND', 'CONTENTS', 'DATA'];
        // isUseServerLog = true, 
        let data = JSON.stringify(obj), rs = { DATA: '' };
        // console.log('STB I/F communicate.js: [getMessage] ' + data);
        // console.log('STB I/F communicate.js: [sendMessage] COMMAND=' + obj.COMMAND);

        for (var i = 0; i < noUseServerLog.length; i++) {
            if (data.indexOf(noUseServerLog[i]) >= 0) {
                // isUseServerLog = false;
                break;
            }
        }

        if (typeof window.android !== 'undefined') {
            if (typeof window.android.sendMessage === 'function') {
                try {
                    rs = JSON.parse(window.android.sendMessage('AppToContainer', data));
                } catch (error) {
                    rs = { DATA: '' };
                }
            }
        }
        // console.log('rs=', rs);
        return rs;
    }


    /**
     * Native에 데이터를 보냄
     * @param {object} obj - 데이터 객체
     * @alias sendMessageToNative
     * @example
        cm.sendMessageToNative({
            TYPE: '',
            COMMAND: '',
            CONTENTS: '',
            DATA: ''
        });
     * @memberof cm
     */
    static sendMessageToNative(obj) {
        // static sendMessage(obj) {
        var noUseServerLog = ['TYPE', 'COMMAND', 'CONTENTS', 'DATA'], isUseServerLog = true, i;

        let data = JSON.stringify(obj);
        console.log('STB I/F communicate.js: [sendMessage] ' + data);
        // console.log('STB I/F communicate.js: [sendMessage] COMMAND=' + obj.COMMAND);

        for (i = 0; i < noUseServerLog.length; i++) {
            if (data.indexOf(noUseServerLog[i]) >= 0) {
                isUseServerLog = false;
                break;
            }
        }

        if (typeof window.android !== 'undefined') {
            if (typeof window.android.sendMessage === 'function') {
                window.android.sendMessage('AppToContainer', data);
                if (isUseServerLog === true) {
                    // 차후 서버 로그 필요시 구현
                    // utility.serverLog(data);
                }
            }
        }
        // else if (!appConfig.runDevice) { // PC Test
        //     setTimeout(() => {
        //         Core.inst().receiveMessageFromNative(obj);
        //     }, 0);
        // }
    }

    static receiveMessage(obj) {
        this.execCallback(obj.TYPE, obj.COMMAND, obj.CONTENTS, obj.DATA);
    }

    // static _send(obj) {
    //     if (typeof obj === 'object') {
    //         this.sendMessage(obj);
    //     }
    // }

    static _receive(obj) {
        var cmd;
        if (typeof obj === 'object') {
            if (typeof obj.command !== 'undefined') {
                cmd = obj.command;
                this.callbacks[cmd] = {};
                for (var pro in obj) {
                    if (pro !== 'command') {
                        this.callbacks[cmd][pro] = obj[pro];
                    }
                }
            }
        }
    }

    static execCallback(type, command, contents, data) {
        if (typeof this.callbacks[command] !== 'undefined') {
            if (typeof this.callbacks[command][type] === 'function') {
                this.callbacks[command][type](data);
            }
        }
    }

    // /**
    //  * Native에 데이터를 보냄
    //  * @param {object} obj - 데이터 객체
    //  * @alias sendMessageToNative
    //  * @example
    //     cm.sendMessageToNative({
    //         TYPE: '',
    //         COMMAND: '',
    //         CONTENTS: '',
    //         DATA: ''
    //     });
    //  * @memberof cm
    //  */
    // static sendMessageToNative(obj) {
    // this._send(obj);
    // };

    /**
     * STB에서 보낸 데이터를 받을 함수 정의
     * @memberof cm
     * @example
        cm.receiveMessageFromNative({
            command : 'StbInfo',
            request : function(data){
                // 함수 정의
            }
        });
     */
    static receiveMessageFromNative(obj) {
        this._receive(obj);
    };

    /**
     * STB에서 보낼 가상의 데이터를 받음
     * @memberof cm
     */
    static testCommunicator(obj) {
        this.receiveMessage(obj);
    };
}

Communicate.initialize();
// }) ();

// export function cm() {
//     return cm;
// }



