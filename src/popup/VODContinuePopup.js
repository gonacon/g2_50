import {React} from '../utils/common';
import '../assets/css/components/popup/PopupDefault.css';
import '../assets/css/routes/vod/VODPopup.css';

import FM from './../supporters/navi';
import PopupPageView from '../supporters/PopupPageView';
import keyCodes from './../supporters/keyCodes';
import Core from './../supporters/core';

class VODContinuePopup extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'btnList', fm: null }
		];
		this.declareFocusList(focusList);

		this.state = {
			data: this.paramData,
			focusIdx: 0
		};
	}
	
	componentDidMount() {
		const { focusIdx } = this.state;
		const btnListFm = new FM({
			id : 'btnList',
			containerSelector : '.btnWrap',
			focusSelector : '.csFocus',
			row : 1,
			col : 3,
			focusIdx : focusIdx,
			startIdx : 0,
			lastIdx : 2,
			bRowRolling: false,
			onFocusKeyDown: this.onFocusKeyDown,
			onFocusChild: this.onFocusChild
		});
		this.setFm('btnList', btnListFm);
		this.setFocus(0, focusIdx);
	}

	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			this.props.callback();
			return true;
		} else {
			super.onKeyDown(evt);
		}
	}
	
	onFocusKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { data } = this.state;
			switch(idx) {
				case 0:
					//이어보기
					this.props.callback({startTime: data.startTime, data: data});
					break;
				case 1:
					//처음부터 보기
					this.props.callback({startTime: '0', data: data});
					break;
				case 2:
					//취소
					this.props.callback();
					break;
				default:
					break;
			}

		}

	}

	getTimeToSeconds(seconds) {
		seconds =  seconds === undefined || seconds === "" ? 0 : Number(seconds) ;
        let hours = Math.floor(seconds / 3600);
		seconds -= hours * 3600;
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		if (hours   < 10) {hours   = "0" + hours;}
		if (minutes < 10) {minutes = "0" + minutes;}
		if (seconds < 10) {seconds = "0" + seconds;}
		return hours + ':' + minutes + ':' + seconds;
	}

	render() {
		const { data } = this.state;
		const endTime = data.synopsisInfo.play_tms_val * 60;
		const startTimeStr = this.getTimeToSeconds(data.startTime);
		const endTimeStr = this.getTimeToSeconds(endTime);
		const progress = (data.startTime / endTime) * 100;
		return (
			<div className="popupWrap">
				<div className="popupCon wide">
					<div className="title">{data.synopsisInfo.title}</div>
					<div className="popupVOD">
						<div className="subTitle">이전 시청내역이 있습니다. 이어서 감상하시겠어요?</div>
						<div className="progressWrap">
							<div className="ingTime">{startTimeStr}</div>
							<div className="loadingBar">
								<div className="currentState" style={{'width':progress + "%"}}></div>
							</div>
							<div className="endTime">{endTimeStr}</div>
						</div>
						<div id="btnList" className="btnWrap">
							<span className="csFocus btnStyle type02">이어보기</span>
							<span className="csFocus btnStyle type02">처음부터 보기</span>
							<span className="csFocus btnStyle type02">취소</span>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default VODContinuePopup;