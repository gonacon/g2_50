// common
import React from 'react';
import { createMarkup } from '../../../utils/common';
import FM from 'Supporters/navi';
import PopupPageView from 'Supporters/PopupPageView';
import keyCode from 'Supporters/keyCodes';

// utils
import _ from 'lodash';
import Utils from '../../../utils/utils';
import synopAPI from '../api/synopAPI';

// css
import '../../../assets/css/routes/synopsis/SynopContentAssessment.css';
import appConfig from 'Config/app-config';

class SynopContentAssessment extends PopupPageView {
    constructor(props) {
        super(props);

        this.state = {
            active: this.paramData.like === '0' ? false : true,
            assessment: this.paramData.like
        }

        const focusList = [
            { key: 'synopAssessment', fm: null }
        ]
        this.declareFocusList(focusList);
        this.series_id = this.paramData.sris_id;
    }

    componentDidMount() {
        const { like } = this.paramData;
        const fm = new FM({
            id: 'synopAssessment',
            containerSelector: '.btnArea',
            focusSelector: '.csFocusPop',
            row: 1,
            col: 2,
            focusIdx: like === 'down' ? 1 : 0,
            startIdx: 0,
            lastIdx: 1,
            // bRowRolling: true,
            onFocusKeyDown: this.onFocusKeyDown,
            // onFocusContainer
        });
        this.setFm('synopAssessment', fm);
        this.setFocus(0);
    }

    onFocusKeyDown = (e, idx) => {
        if (e.keyCode === keyCode.Keymap.ENTER) {
            let assessment = null;
            if (idx === 0) {
                assessment = 'up';
            } else {
                assessment = 'down';
            }
            this.registerLikeHate(idx, assessment);
        }
    }

    onKeyDown(e) {
        this.handleKeyEvent(e);
        if (e.keyCode === keyCode.Keymap.BACK_SPACE || e.keyCode === keyCode.Keymap.PC_BACK_SPACE) {
            this.props.callback(this.state.assessment);
            return true;
        }
    }

    registerLikeHate(idx, assessment) {
        let like_action = 0;
        let active = false;
        if(this.state.assessment === assessment) {
            like_action = 0;
        } else {
            if(idx === 0) {
                like_action = 1;
            } else {
                like_action = 2;
            };
            active = true;
        };
        
        let param = {
            series_id : this.series_id,
            like_action : like_action
        };
        
        synopAPI.smd004(param).then(res => {
            if(res.result === 'OK'){
                switch(res.like_action) {
                    case '1': assessment = 'up'; break;
                    case '2': assessment = 'down'; break;
                    default: assessment = res.like_action; break;
                }
                this.setState({
                    assessment: assessment,
                    active : active
                });
            };
        });
    }

    render() {
        const { data } = this.props;
        const { active, assessment } = this.state;
        const bgImg = `${_.isEmpty(data.bg_img_path) ? appConfig.headEnd.LOCAL_URL + '/synopsis/bg-synopsis-default.png' : Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + data.bg_img_path}`;
        let style = {
            backgroundImage: "url(" + bgImg + ")",
            width: '1920px',
            top: '0'
        };
        let darkClass = _.isEmpty(data.bg_img_path) ? " default" : "";
        darkClass += data.dark_img_yn === 'N' ? "" : " dark";

        const markup = "고객님의 선호도를 표현해주세요.<br>평가 및 시청목록을 바탕으로 맞춤 추천 서비스를 제공합니다.";

        return (
			// 6/12 popBgBlur class 추가
            <div className={`contentAssessment popContents${darkClass} popBgBlur`} style={style}>
                <div className="innerContents" id="synopAssessment">
                    <p className="assessmentTitle">{data.title}</p>
                    <div className="btnArea">
                        <div className={'csFocusPop' + (assessment === 'up' && active ? ' sel focusOn' : '')}>
                            <span className="checkArea"></span>
                            <span className="contsBox">
                                <span className="imgArea">
                                    <span className="iconWrap">
                                        <span className="iconLike"></span>
                                    </span>
                                </span>
                                <span className="stateText">좋아요</span>
                            </span>
                        </div>
                        <div className={'csFocusPop' + (assessment === 'down' && active ? ' sel focusOn' : '')}>
                            <span className="checkArea"></span>
                            <span className="contsBox">
                                <span className="imgArea">
                                    <span className="iconWrap">
                                        <span className="iconLike"></span>
                                    </span>
                                </span>
                                <span className="stateText">별로예요</span>
                            </span>
                        </div>
                    </div>
                    <p className="mesAssessment" dangerouslySetInnerHTML={createMarkup(markup)}></p>
                </div>
                <div className="keyWrap">
                    <span className="btnKeyPrev">닫기</span>
                </div>
            </div>
        )
    }

}

export default SynopContentAssessment;