import { React, createMarkup } from '../../../utils/common';

// new navigator
import FM from '../../../supporters/navi';
import keyCodes from "../../../supporters/keyCodes";
import Core from '../../../supporters/core';

import PopupPageView from '../../../supporters/PopupPageView';
import { KidsEndCertification } from './index';
import '../../../assets/css/routes/kids/playguide/PlayGuideWatchEnd.css';

const CHAR_COMMENT = '약속한 시간이 되었어요.<br/>B tv를 종료하시겠습니까?';			// 다빈,다솔 친구야~<br/> 약속한 시간이야!

// 호출방법 : Core.inst().showPopup(<PlayGuideWatchEnd/>, '', this.onClosePopup);
export default class PlayGuideWatchEnd extends PopupPageView {
    constructor(props) {
        super(props);

		this.state = {}
		const focusList = [
			{ key: 'confirmBtns', fm: null }
		];
		this.declareFocusList(focusList);
	}
	
	componentDidMount() {
		// 상단 General GNB
		const { showMenu } = this.props;
		if (showMenu && typeof showMenu === 'function') showMenu(false);
		
		Core.inst().hideKidsWidget();																	// 위젯 숨김 p.152 정책참조

		document.querySelector('.wrapper').classList.add('dark');

		const confirmBtns = new FM({
			id : 'confirmBtns',
			type: 'LIST',
			containerSelector : '.buttonWrap',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			bRowRolling: false,
			onFocusKeyDown: this.onSelectConfirmBtns
		});
		this.setFm('confirmBtns', confirmBtns);
		this.setFocus('confirmBtns', 0);
	}

	componentWillUnmount() {
		document.querySelector('.wrapper').classList.remove('dark');
	}

	// 종료하기 / 계속이용하기 버튼
	onSelectConfirmBtns = (evt, childIdx) => {
		if(evt.keyCode === keyCodes.Keymap.ENTER) {
			if(childIdx === 0) {
				console.log('[Btv 종료하기]');
			} else if(childIdx === 1) {
				console.log('[계속 이용하기]');
				Core.inst().cancelPopup();
				Core.inst().showPopup(<KidsEndCertification/>, '', this.onClosePopup); 		// 인증팝업
			}
		}
	}

	onClosePopup = (result) => {
		console.log('인증팝업종료====>', result);
	}

    render() {
       return(
		   <div className="wrap">
				<div className="watchEndWrap">
				   <h2 className="pageTitle">시청제한 만료</h2>
					<div className="mesTextWrap">
						<p className="mesText" dangerouslySetInnerHTML={createMarkup(CHAR_COMMENT)}></p>
					</div>
				   <div className="buttonWrap" id="confirmBtns">
					   <span className="csFocus btnStyle">
						   <span className="wrapBtnText">B tv 종료하기</span>
					   </span>
					   <span className="csFocus btnStyle">
						   <span className="wrapBtnText">계속 이용하기</span>
					   </span>
				   </div>
			   </div>
		   </div>
	   )
    }
  
}