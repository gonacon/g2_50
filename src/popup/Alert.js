import React, { Component } from 'react';
import 'ComponentCss/popup/PopupDefault.css';
import 'Css/vod/VODPopup.css';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';

const KEY = keyCodes.Keymap;


const TEXT_WIDTH = 710;

class Alert extends PopupPageView {
    constructor(props) {
        super(props);

        this.onFocusKeyDown = this.onFocusKeyDown.bind(this);
    }

    onFocusKeyDown = (event) => {
        console.error('eent', event);
        if (event.keyCode === KEY.ENTER) {
            const { callback, onOk } = this.props;
            console.error('여기');
            callback();
            if (typeof onOk === 'function') {
                onOk();
            }
        }
    }

    componentDidMount() {
        this.focusList = [
            { key: 'ok', fm: null }
        ];
        this.declareFocusList(this.focusList);

        const fmConfirm = new FM({
            id: 'ok',
            type: 'FAKE',
            onFocusKeyDown: this.onFocusKeyDown
        });
        console.error('alert fm created', fmConfirm);
        this.setFm('ok', fmConfirm);
        this.setFocus(0);
    }

    componentWillUnmount() {
        this.setFm('ok', null);
        super.componentWillUnmount();
    }

    render() {
        const { title, msg, label } = this.props;
        let okLabel = '확인';
        if (label) {
            okLabel = label;
        }

        return (
            <div className="popupWrap">
				<div className="popupCon wide">
					<div className="title">{title}</div>
					<div className="popupVOD">
						<div className="subTitle" style={{width: TEXT_WIDTH}}>{msg}</div>
						<div id="ok" className="btnWrap">
                            <span className="csFocus btnStyle type02 focusOn">{okLabel}</span>
						</div>
					</div>
				</div>
			</div>
        )
    }
}

export default Alert;