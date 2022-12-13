import { React, createMarkup } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BillCertify.css';
import PopupPageView from '../../../supporters/PopupPageView';
import keyCodes from '../../../supporters/keyCodes';
import appConfig from '../../../config/app-config';

let _target;
let contentHeight;
let scrollHeight;
let scrollContentHeight;

class CertifyPopup extends PopupPageView {
	constructor(props) {
		super(props);

		this.state = {
			data: this.paramData
		};
	}

	componentDidMount() {
		document.querySelector('.innerContentInfo').focus();

		// popupScroll();
		_target = document.querySelector('.innerContentInfo');
		contentHeight = _target.scrollHeight;
		scrollHeight = _target.clientHeight;
		scrollContentHeight = _target.offsetHeight

		if (scrollHeight < contentHeight) {
			let scrollBarHeight = Math.ceil((scrollHeight / contentHeight) * scrollContentHeight);

			if (scrollBarHeight < 80) {
				document.querySelector('.scrollBar').style.height = '80px';
				document.querySelector('.scrollBar').style.transform = 'translate(0,-50%)';
			} else {
				document.querySelector('.scrollBar').style.height = scrollBarHeight + 'px';
			}

			// document.querySelector('.innerContentInfo').addEventListener('keydown', (e) => { scrolling() });
		} else {
			document.querySelector('.scrollBarBox').remove();
		}
	}

	onKeyDown = (evt) => {
		console.log('keyCode: ' + evt.keyCode);
		let scrollTopPosition = Math.ceil((_target.scrollTop / contentHeight) * scrollContentHeight);
		switch (evt.keyCode) {
			case keyCodes.Keymap.BACK_SPACE:
			case keyCodes.Keymap.PC_BACK_SPACE:
				this.props.callback();
				return true;
			case keyCodes.Keymap.UP:
				scrollTopPosition = Math.ceil(((_target.scrollTop - 2) / contentHeight) * scrollContentHeight);
				document.querySelector('.scrollBar').style.top = scrollTopPosition + 'px';
				break;
			case keyCodes.Keymap.DOWN:
				scrollTopPosition = Math.ceil(((_target.scrollTop + 2) / contentHeight) * scrollContentHeight);
				document.querySelector('.scrollBar').style.top = scrollTopPosition + 'px';
				break;
			default:
				break;
		}
	}

	render() {
		const {data} = this.state;
		let convertData = (data.detail).replace(/\n/gi, '<br />');
		return (
			<div className="wrap">
				<div className="popWrap certify">
					<div className="billCon multi">
						<div className="contentPop">
							<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
							<div className="innerContentPop">
								<div className="innerContentInfo" tabIndex="0" >
									<div className="contentInfo">
										<p className="title">{data.title}</p>
										<div className="contentText">
											<div className="text" dangerouslySetInnerHTML={createMarkup(convertData)}></div>
										</div>
									</div>
								</div>
								<span className="scrollBarBox">
									<div className="innerScrollBarBox">
										<span className="scrollBar"></span>
										<span className="scrollBarBG"></span>
									</div>
								</span>
							</div>
							<div className="keyWrap">
								<span className="btnKeyPrev">닫기</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default CertifyPopup;