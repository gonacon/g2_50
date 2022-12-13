// common
import React from 'react';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';
import { CTSInfo } from 'Supporters/CTSInfo';
import Core from 'Supporters/core';

// utils
import _ from 'lodash';

// css
import '../../../assets/css/routes/synopsis/SynopCornerPop.css';

class SynopCornerPop extends PopupPageView {
	constructor(props) {
		super(props);

        this.state = {
            synopsis: this.props.data,  // 시놉 데이터
            index: this.props.data.index,    // 코너의 인덱스
            type: this.props.data.type,      // 'synopsis', 'search' 진입경로
            context: '선택한 코너부터 시청합니다.'
        }
        const focusList = [
            {key: 'SynopCornerPop', fm: null}
        ]
        this.declareFocusList(focusList);


        this.defaultPlayInfo = {
            synopsis_type: '02',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            playType: CTSInfo.PLAYTYPE.VOD_CORNER,     //default : 일반, corner : 코너별 보기, allCornel : 코너별 모아보기
            ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
            ynSpecial: 'N',         //스페셜영상 재생 여부 (Y/N)
            playOption: 'normal',   //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
                                    //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
            kids_yn: 'N',           //키즈 시놉 여부(Y/N)
            ynSerise: 'N',          //시리즈 여부(Y/N)
            isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
            isAll: 'N',             //전편 구매 여부(Y/N)
            epsd_id: '',            //에피소드ID
        }
    }

    componentWillMount() {

    }

    componentDidMount() {
        const fm = new FM ({
            id: 'SynopCornerPop',
            containerSelector: '.connerSelectBtn',
            moveSelector: '',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onFocusKeyDown
        })
        this.setFm('SynopCornerPop', fm);
        this.setFocus(0, 0);
    }

    onKeyDown(e) {
        this.handleKeyEvent(e);
        if (e.keyCode === keyCode.Keymap.BACK_SPACE
            || e.keyCode === keyCode.Keymap.PC_BACK_SPACE) {
            this.props.callback(this);
            return true;
        }
    }

    onFocusKeyDown = (e, idx) => {
        if (e.keyCode === keyCode.Keymap.LEFT || e.keyCode === keyCode.Keymap.RIGHT) {
            let context = '선택한 코너부터 시청합니다.';
            if (e.keyCode === keyCode.Keymap.RIGHT) {
                context = '선택한 코너의 모든 회차를 연속 시청합니다.';
            }
            this.setState({
                context
            })
        } else if (e.keyCode === keyCode.Keymap.ENTER) {
            const { synopsis, index, type } = this.state;
            if (type === 'synopsis') {
                let playInfo = _.clone(this.defaultPlayInfo);
                playInfo.cornerStartIndex = index;
                if (idx === 0) {
                    // 코너 바로보기
                    playInfo.seeingPath = '50'; //코너별시청을 통한 VOD 시청(시놉-시즌-코너별 시청)
                    this.setVodPlay(type, synopsis, playInfo);
                } else {
                    // 코너 모아보기
                    playInfo.seeingPath = '51'; //코너별 모아보기를 통한 VOD 시청(시놉-시즌-코너별 모아보기)
                    playInfo.playType = CTSInfo.PLAYTYPE.VOD_ALL_CORNER;
                    this.setVodPlay(type, synopsis, playInfo);
                }
            } else {
                // Core.inst().showToast('검색에서 코너진입시 재생서비스는 준비중입니다.');
                const playInfo = {
                    type: type,
                    playType: CTSInfo.PLAYTYPE.VOD_CORNER,
                    playOption: 'normal',
                    search_type: '1',
                    fromCommerce: 'N'
                }
                if (idx === 0) {
                    // 코너 바로보기
                    const obj = {
                        apiData: synopsis,
                        playInfo: playInfo
                    }
                    CTSInfo.requestWatchCorenr(obj, this.vodCallback);
                } else {
                    const playInfo = {
                        type: type,
                        playType: CTSInfo.PLAYTYPE.VOD_ALL_CORNER,
                        playOption: 'normal',
                        search_type: '1',
                        fromCommerce: 'N'
                    }
                    // 코너 모아보기
                    const obj = {
                        apiData: synopsis,
                        playInfo: playInfo
                    }
                    CTSInfo.requestWatchCorenr(obj, this.vodCallback);
                }
            }
        }
    }

    // VOD재생
    setVodPlay = (type, synopsis, playInfo, prdType) => {
        let tempSynop = _.clone(synopsis);
        if (prdType) {
            tempSynop.purchares = prdType;
        }
        playInfo.type = type;
        var obj = {
            nxpg010: tempSynop,
            playInfo: playInfo
        }
        // console.log('setVodPlay', obj);
        CTSInfo.requestWatchCorenr(obj, this.vodCallback);
    }
    

	render() {
        const {
            synopsis,
            index,
            type,
            context
        } = this.state;

        let cnr_nm = '';    // 코너제목
        let title = '';     // 제목 + 회차
        switch(type) {
            case 'synopsis':
                cnr_nm = synopsis.contents.corners[index].cnr_nm;
                title = synopsis.contents.title + synopsis.contents.brcast_tseq_nm + '회';
            break;
            case 'search':
                cnr_nm = synopsis.title;
                title = synopsis.contants_title;
            break;
            default:break;
        }
		return (
			<div className="wrap">
				<div className="connerSelectWrap">
					<h2 className="connerTitle">{cnr_nm}</h2>
					<h2 className="connerSubTitle">{title}</h2>
					<div className="connerSelectBtnWrap" id="SynopCornerPop">
						<div className="connerSelectBtn">
							<span className="csFocus btnStyle">
								<span className="wrapBtnText">코너 바로보기</span>
							</span>
							<span className="csFocus btnStyle">
								<span className="wrapBtnText">코너별 모아보기</span>
							</span>
						</div>
						<p className="selectBtnInfo">{context}</p>
					</div>
					<div className="keyWrap">
						<span className="btnKeyPrev">이전</span>
					</div>
				</div>
			</div>
		)
	}
}

export default SynopCornerPop;