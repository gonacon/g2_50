import React from 'react'
import Core from './../supporters/core';
import './../assets/css/components/popup/ToastPopup.css';
import { isEmpty } from 'lodash';
let toastTimer;
export default class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.defaultTime = 3000;
        // this.toastTimeout;
        this.time = 0;
        this.state = {
            time: 0,
            title: '',
            detail: '',
            visible: false,
            animation: false
        };
        this.show = this.show.bind(this);
        // this.hide = this.hide.bind(this);
        Core.inst().setToast(this);
    }
    // toastUp() {
    //     this.setState({
    //         animation: true, // 애니메이션 없이 토스트 on,off 하려면 false
    //         visible: true // 토스트 팝업 보이기
    //     });
    // }

    toastDown() {
        this.setState({
            visible: false // 토스트 팝업 감추기
        });
    }

    toastTimer() {
        // clearInterval(toastTimer);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            this.toastDown();
            // this.setState({
            //     time: 0,
            //     visible: false
            // });
        }, this.time);
    }

    show = (title, detail, showTime) => {
        // this.toastUp();
        this.time = isEmpty(showTime) ? this.defaultTime : showTime;
        console.log('title=%s, detail=%s, this.time=%s', title, detail, this.time);

        this.toastTimer();
        this.setState({ animation: true, visible: true, title, detail, time: this.time });
        // console.log('show', this.state);
    }

    hide() {
        console.log('hide');

        clearTimeout(toastTimer);
        this.toastDown();
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        const bool = JSON.stringify(this.state) !== JSON.stringify(nextState);
        // console.log('shouldComponentUpdate=', bool);
        return bool;
    }


    render() {
        // console.log('====================================');
        // console.log('Toast render this.state', this.state);
        // console.log('====================================');
        return (
            <div className={`toastPopupWrap ${this.state.animation === false ? "aniNone" : ""} ${this.state.visible === false ? "toastDown" : "toastUp"}`}>
                <div className="toastCon">
                    <div className="innerText">
                        <p className="guideText">{this.state.title}</p>
                        {
                            this.state.detail && <p className="errorCode">{this.state.detail}</p>
                        }
                    </div>
                </div>
            </div>
        );
    }
}


