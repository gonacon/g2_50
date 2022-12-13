import { React } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BuyMonthly.css';
// import constants from './../../../config/constants';
import keyCodes from '../../../supporters/keyCodes';
import { numberWithCommas } from '../../../utils/utils';
import FM from '../../../supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView';
import Core from '../../../supporters/core';
import BuyBillChannel from './BuyBillChannel'
import { cloneDeep } from 'lodash';
import appConfig from '../../../config/app-config';
import PopupConfirm from './../../../components/popup/PopupConfirm';
import { CTSInfo } from './../../../supporters/CTSInfo';
import _ from 'lodash';
import StbInterface from './../../../supporters/stbInterface';

// 구매옵션 화면 표시 컨텐츠
// : 채널 Only
class BuyChannel extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'ppmList', fm: null },
			{ key: 'buyChannelBtnList', fm: null }
		];
		this.declareFocusList(focusList);

		console.log('param: ', this.paramData);
		let data = this.paramData;
		let mode = data.PROD_INFO_LIST[0].PTYPE;

		this.state = {
			mode: mode,
			modeCategory: 0,
			DATA_CHANNEL: data,
			selectedIdx: 0,	//월정액에서 사용
		};

	}

	componentWillMount() {
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: false
		});
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: true
		});
	}

	componentDidMount = () => {
		this.state.focusView = 0;
		this.setFocus(0);
	}

	onFocusMoveUnavailable = (data) => {
		console.log('data: ', data);
		if (data.id === 'ppmList') {
			const arrangedFocusList = this.arrangedFocusList;
			if (data.direction === "RIGHT") {
				// 버튼으로 이동
				this.state.focusView = 1;
				this.state.focusIdx = 0;
				this.setFocus(this.state.focusView, this.state.focusIdx);
			} else if (data.direction === "UP") {
				// 월정액은 roopling기능 추가
				if (!_.isEmpty(arrangedFocusList[this.state.focusView].fm) 
					&& arrangedFocusList[this.state.focusView].fm.listInfo.curIdx === 0 ) {
					this.setFocus(this.state.focusView, arrangedFocusList[this.state.focusView].fm.listInfo.lastIdx);
				}
			} else if (data.direction === "DOWN") {
				// 월정액은 roopling기능 추가
				if (!_.isEmpty(arrangedFocusList[this.state.focusView].fm)
					&& arrangedFocusList[this.state.focusView].fm.listInfo.curIdx === arrangedFocusList[this.state.focusView].fm.listInfo.lastIdx) {
					this.setFocus(this.state.focusView, 0);
				}
			}
		} else if (data.id === 'buyChannelBtnList' && data.direction === "LEFT") {
			this.state.focusView = 0;
			this.state.focusIdx = 0;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		}
	}

	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			if (this.state.DATA_CHANNEL.enterance === 1) {
				// 마지막 남은 구매 화면이면 구매 취소 팝업 호출(시나리오)
				// 구매 취소
				const param = {
					title: '구매 취소 확인',
					desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
					btns: ["확인", "취소"]
				}
				Core.inst().showPopup(<PopupConfirm />, param, (info) => {
					if (info.result) {
						CTSInfo.requestPurchaseAllCancel();
					}
				});
			} else {
				this.props.callback();
			}
			return true;
		} else {
			super.onKeyDown(evt);
		}
	}

	moveNextPage = (data) => {
		const { DATA_CHANNEL, selectedIdx } = this.state;
		let resultData = cloneDeep(DATA_CHANNEL);
		resultData.PROD_INFO_LIST = cloneDeep(DATA_CHANNEL.PROD_INFO_LIST[selectedIdx]);
		resultData.enterance = 2;
		Core.inst().showPopup(<BuyBillChannel />, resultData, null);
	}

	onPPMKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			this.setState({ selectedIdx: idx });
			this.setFocus(0, idx);
		}
	}

	render() {
		console.log('render');

		if (this.state.DATA_CHANNEL === undefined) {
			return null;
		}

		const { DATA_CHANNEL, selectedIdx } = this.state;
		const selectPPMProduct = DATA_CHANNEL.PROD_INFO_LIST.map((data, i) => {
			let strClass = "csFocus radioStyle2";
			if (selectedIdx === i) {
				strClass += ' select';
			}
			
			const price = Number(data.PRICE) * 1.1;	//부가세 포함 가격 설정
			return (
				<div className={strClass} key={i}>
					{data.PNAME}
					<span>{price.toLocaleString('ko-KR')}원/월</span>
				</div>
			)
		});

		const ppmListFm = new FM({
			id: 'ppmList',
			containerSelector: '.optionWrap',
			moveSelector: '',
			focusSelector: '.csFocus',
			row: DATA_CHANNEL.PROD_INFO_LIST.length,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: DATA_CHANNEL.PROD_INFO_LIST.length - 1,
			bRowRolling: false,
			onFocusKeyDown: this.onPPMKeyDown,
			onFocusChild: this.onFocusChild
		});
		this.setFm('ppmList', ppmListFm);

		let detailInfo =
			{
				PNAME: DATA_CHANNEL.PROD_INFO_LIST[selectedIdx].PNAME,
				PTYPE: DATA_CHANNEL.PROD_INFO_LIST[selectedIdx].PTYPE,
				PPM_PROD_IMG_PATH: DATA_CHANNEL.PROD_INFO_LIST[selectedIdx].PPM_PROD_IMG_PATH,
				PRICE: numberWithCommas(DATA_CHANNEL.PROD_INFO_LIST[selectedIdx].PRICE)
			};
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>채널구매</span>
					<div>{DATA_CHANNEL.PROD_INFO_LIST[selectedIdx].PNAME} 채널</div>
					<div className="progress">
						<span className="on">1</span>
						<img src={`${appConfig.headEnd.LOCAL_URL}/buy/path-8.png`} alt="" />
						<span>2</span>
					</div>
				</div>
				<div className="buyContent buyMonthly">
					<div id="ppmList" className="left">
						<div className="optionWrap">
							<div className="title">상품선택<em className="taxInfo">모든 가격은 부가세 포함가입니다.</em></div>
							{selectPPMProduct}
						</div>
					</div>
					<div className="right">
						<OptionDetailView mode={this.state.mode} curCategory="0" data={detailInfo} idx={this.state.idxSelected} />
						<div id="buyChannelBtnList">
							<ButtonContainer callback={this.props.callback} setFm={this.setFm} moveNextPage={this.moveNextPage} />
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class OptionDetailView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}
	render() {
		const { data, idx } = this.props;
		console.log('data=', data);
		console.log('idx=', idx);

		const imgPath = data.PPM_PROD_IMG_PATH;
		return (
			<div className="optionView">
				<div className="imgWrap">
					<img src={imgPath !== null && imgPath !== "" ? imgPath : null} alt="" />
				</div>
				<p>{data.PNAME} 채널을 해지 전까지 무제한으로 시청하실 수 있습니다.</p>
			</div>
		)
	}
}

class ButtonContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}

	componentDidMount() {
		const { setFm } = this.props;
		const buyChannelBtnListFm = new FM({
			id: 'buyChannelBtnList',
			type: '',
			moveSelector: '.btnWrap',
			focusSelector: '.csFocus',
			row: 1,
			col: 2,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 1,
			bRowRolling: false,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('buyChannelBtnList', buyChannelBtnListFm);
	}

	onFocusKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			if (idx === 0) {
				const { data, moveNextPage } = this.props;
				console.log('data: ', data);
				moveNextPage(data);
			} else {
				const param = {
					title: '구매 취소 확인',
					desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
					btns: ["확인", "취소"]
				}
				Core.inst().showPopup(<PopupConfirm />, param, (info) => {
					if (info.result) {
						CTSInfo.requestPurchaseAllCancel();
					}
				});
			}
		}
	}

	render() {
		return (
			<div className="btnWrap">
				<span className="csFocus btnStyle nextBtn">다음</span>
				<span className="csFocus btnStyle cancelBtn">취소</span>
			</div >
		);
	}
}

export default BuyChannel;