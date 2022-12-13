import { React } from '../../utils/common';
import '../../assets/css/components/popup/PopupDefault.css';
import '../../assets/css/components/popup/Popup.css';
import PopupPageView from '../../supporters/PopupPageView';
import FM from './../../supporters/navi';
import keyCodes from './../../supporters/keyCodes';

/**
 * 공통 팝업 필수 데이터 (예시)
 * paramData : { title: '구매 취소 확인',
 *				 desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
 *				 btns:["확인","취소"]
 *				}
 * callback(리턴데이터: result(boolean): true면 확인, false면 취소)
 */
class PopupConfirm extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'popupConfirmBtnList', fm: null }
		];
		this.declareFocusList(focusList);
		this.state = {
			data: this.paramData
		};
	}

	componentDidMount() {
		const btnListFm = new FM({
			id: 'popupConfirmBtnList',
			containerSelector: '.btnWrap',
			moveSelector: '',
			focusSelector: '.csFocusPop',
			row: 1,
			col: 2,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 1,
			onFocusKeyDown: this.onKeyDownBtnList
		});
		this.setFm('popupConfirmBtnList', btnListFm);
		this.setFocus(0);
	}

	onKeyDownBtnList = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			if (idx === 0) {
				this.props.callback({ result: true });
			} else {
				this.props.callback({ result: false });
			}
		} else if (evt.keyCode === keyCodes.Keymap.LEFT || evt.keyCode === keyCodes.Keymap.RIGHT) {
			evt.preventDefault();
		}
	}

	render() {
		return (
			<div className="popupWrap">
				<div className="popupCon">
					<div className="title">{this.state.data.title}</div>
					<div className="popupText">
						{this.state.data.desc}
					</div>
					<div id="popupConfirmBtnList" className="btnWrap">
						{this.state.data.btns.map((data, i) => {
							return (
								<span className="csFocusPop btnStyle type02" key={i}><span className="wrapBtnText">{data}</span></span>
							)
						})}
					</div>
				</div>
			</div>
		)
	}

}

export default PopupConfirm;