import React from 'react';
import { MeTV } from 'Network';

import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/my/RecentVod.css';
import FM from 'Supporters/navi';

import keyCodes from 'Supporters/keyCodes';
import PopupPageView from 'Supporters/PopupPageView';
import Core from './../../../supporters/core';

const KEY = keyCodes.Keymap;

class ConfirmDeleteAllRecentVodList extends PopupPageView {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            count: 0
        }

        const focusList = [
            { key: 'bottomButtons', fm: null }
        ];
        this.declareFocusList(focusList);
    }

    componentDidMount() {
        const { title, count } = this.paramData;
        const vodTitle = title ? title : '';
        const restCount = count ? count : 0;
        this.setState({ title: vodTitle, count: restCount });

        const bottomButtons = new FM({
            id: 'bottomButtons',
            containerSelector: '.buttonWrap',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onFocusKeyDownBottomButtons
        });
        this.setFm('bottomButtons', bottomButtons);
        this.setFocus('bottomButtons');
    }

    onFocusKeyDownBottomButtons = (event, idx) => {
        if (event.keyCode === KEY.ENTER) {
            if (idx === 0) { // 전체삭제
                this.deleteAll();
            } else {
                this.props.callback({result: false});
            }
        }
    }

    deleteAll = async () => {
        try {
            const request022 = await MeTV.request022({ isAll: 'Y' });
            if (request022.result === '0000') {
                this.props.callback({result: true});
            } else {
                Core.inst().showToast(request022.result, request022.reason);
            }
        } catch (err) {
            console.log('최근시청 목록 전체삭제 실패', err);
            Core.inst().showToast("잠시후 다시 시도해주세요.");
        }
    }

    render() {
        const { title, count } = this.state;
        let topText = '';
        if (count === 0) {
            topText = `최근 감상하신 ${title}의 VOD 시청목록을`;
        } else {
            topText = `최근 감상하신 ${title} 외 ${count}편의 VOD 시청목록을`;
        }

        return (
            <div className="wrap">
                <div className="registWrap vodPop">
                    <h2 className="pageTitle">최근 시청 VOD 전체삭제</h2>
                    <div className="registerAllDel">
                        <p className="textAllDel">{topText}<br />모두 삭제 하시겠습니까?</p>
                    </div>
                    <div id="bottomButtons" className="buttonWrap">
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">삭제</span>
                        </span>
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">취소</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfirmDeleteAllRecentVodList;