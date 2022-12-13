import React, { Component } from 'react';
import 'ComponentCss/popup/PopupDefault.css';
import 'Css/vod/VODPopup.css';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';

const KEY = keyCodes.Keymap;

const TEXT_WIDTH = 710;

class Confirm extends PopupPageView {
    onFocusKeyDown = (event, idx) => {
        if (event.keyCode === KEY.ENTER) {
            const { callback, onOk } = this.props;
            callback();
            if (idx === 0 && typeof onOk === 'function') {
                onOk();
            }
        }
    }

    componentDidMount() {
        this.focusList = [
            { key: 'buttons', fm: null }
        ];
        this.declareFocusList(this.focusList);

        const buttons = new FM({
            id: 'buttons',
            containerSelector: '.btnWrap',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onFocusKeyDown
        });

        this.setFm('buttons', buttons);
        this.setFocus('buttons');
    }

    componentWillUnmount() {
        this.setFm('buttons', null);
        super.componentWillUnmount();
    }

    render() {
        const { title, msg, labels } = this.props;
        const okLabel = labels? labels[0]: '확인';
        const cancelLabel = labels? labels[1]: '취소';
        return (
            <div className="popupWrap">
				<div className="popupCon wide">
					<div className="title">{title}</div>
					<div className="popupVOD">
						<div className="subTitle" style={{width: TEXT_WIDTH}}>{msg}</div>
						<div id="buttons" className="btnWrap">
                            <span className="csFocus btnStyle type02">{okLabel}</span>
                            <span className="csFocus btnStyle type02">{cancelLabel}</span>
						</div>
					</div>
				</div>
			</div>
        )
    }
}

export default Confirm;