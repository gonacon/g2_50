import React from 'react';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';
import { CTSInfo } from 'Supporters/CTSInfo';
import _ from 'lodash';

// css
import '../../../assets/css/routes/synopsis/SynopCornerSelect.css';

// utils
import { getCodeName } from '../../../utils/code';

class SynopPlayMovieType extends PopupPageView {
	constructor(props) {
		super(props);

		const focus = [
			{ key: 'synopPlayMovie', fm: null },
		]
		this.declareFocusList(focus);
	}

	componentDidMount() {
		const { purchase } = this.props.data;
        const fm = new FM ({
            id: 'synopPlayMovie',
            containerSelector: '.connerSelectBtn',
            moveSelector: '',
            focusSelector: '.csFocus',
            row: 1,
            col: purchase.length,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: purchase.length -1,
            onFocusKeyDown: this.onFocusKeyDown
        })
        this.setFm('synopPlayMovie', fm);
        this.setFocus(0, 0);
	}
	
	onFocusKeyDown = (e, idx) => {
		if (e.keyCode === keyCode.Keymap.ENTER) {
			const { synopsis, purchase, paramData } = this.props.data;
			let playInfo = {
				synopsis_type: '01',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
				playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
				ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
				ynSpecial: 'N',         //스페셜영상 재생 여부 (Y/N)
				playOption: 'normal',   //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
										//other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
				kids_yn: 'N',           //키즈 시놉 여부(Y/N)
				ynSerise: 'N',          //시리즈 여부(Y/N)
				isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
				isAll: 'N',             //전편 구매 여부(Y/N)    
				epsd_id: '',            //에피소드ID
				epsd_rslu_id: '',        //에피소드 해상도ID
				adult_flag: !_.isEmpty(paramData.adult_flag) ? paramData.adult_flag : '0',
				prd_prc_id: purchase[idx].prd_prc_id
			}

			var obj = {
				nxpg010: synopsis,
				playInfo: playInfo
			}
			CTSInfo.requestWatchVOD(obj, null);
		}
	}

	onKeyDown(e) {
		this.handleKeyEvent(e);
		if (e.keyCode === keyCode.Keymap.PC_BACK_SPACE || e.keyCode === keyCode.Keymap.BACK_SPACE) {
			this.props.callback(this);
			return true;
        }
	}

	render() {
		const { synopsis, purchase } = this.props.data;
		return (
			<div className="wrap">
				<div className="connerSelectWrap">
					<h2 className="connerTitle">{synopsis.contents.title}</h2>
					<h2 className="connerSubTitle">재생할 유형을 선택해주세요.</h2>
					<div className="connerSelectBtnWrap" id="synopPlayMovie">
						<div className="connerSelectBtn">
						{
							purchase.map((item, i) => {
								return (
									<span key={i} className="csFocus btnStyle">
										<span className="wrapBtnText">{getCodeName('LAG_CAPT_TYP_CD', item.lag_capt_typ_cd)}</span>
									</span>
								)
							})
						}
						</div>
					</div>
					<div className="keyWrap">
						<span className="btnKeyPrev">이전</span>
					</div>
				</div>
			</div>
		)
	}
}

export default SynopPlayMovieType;