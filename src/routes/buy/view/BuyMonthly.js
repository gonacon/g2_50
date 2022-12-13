import { React } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BuyMonthly.css';
import keyCodes from '../../../supporters/keyCodes';
import Utils, { numberWithCommas } from '../../../utils/utils';
import FM from '../../../supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView';
import Core from '../../../supporters/core';
import BuyBillMonthly from './BuyBillMonthly'
import { cloneDeep } from 'lodash';
import appConfig from './../../../config/app-config';
import PopupConfirm from '../../../components/popup/PopupConfirm';
import { CTSInfo } from 'Supporters/CTSInfo';
import _ from 'lodash';
import StbInterface from './../../../supporters/stbInterface';

/**
 * 홈에서 진입하는 월정액만(데이터 규격이 달라 분리함.)
 */
// 구매옵션 화면 표시 컨텐츠
class BuyMonthly extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'ppmList', fm: null },
			{ key: 'buyMonthlyBtnList', fm: null }
		];
		this.declareFocusList(focusList);

		console.log('param: ', this.paramData);
		let data = this.paramData;

		this.state = {
			mode: data.mode,
			modeCategory: 0,
			DATA_PPM: data,
			selectedIdx: 0,	//월정액에서 사용
			focusIdx: 0		//현재 포커스
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
		const arrangedFocusList = this.arrangedFocusList;
		if (data.id === 'ppmList') {
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
		} else if (data.id === 'buyMonthlyBtnList' && data.direction === "LEFT") {
			this.state.focusView = 0;
			this.state.focusIdx = 0;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		}
	}
	
	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			if (this.state.DATA_PPM.enterance === 1) {
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
		const { DATA_PPM, selectedIdx } = this.state;
		let resultData = cloneDeep(DATA_PPM);
		resultData.mode = this.state.mode;
		resultData.PROD_INFO.PROD_DTL = cloneDeep(DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx]);
		resultData.enterance = 2;
		Core.inst().showPopup(<BuyBillMonthly />, resultData);
	}
	
	onPPMKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			this.setState({selectedIdx: idx, focusView: 0, focusIdx: idx});
			this.setFocus(0, idx);
		}
	}

	render() {
		console.log('render');

		if (this.state.DATA_PPM === undefined) {
			return null;
		}

		const { DATA_PPM, selectedIdx } = this.state;
		const selectPPMProduct = DATA_PPM.PROD_INFO.PROD_DTL.map((data, i) => {
			let strClass = "csFocus radioStyle2";
			if (selectedIdx === i) {
				strClass += ' select';
			}
			return (
				<div className={strClass} key={i}>
					{data.PNAME}
					<span>{Number(data.V_PRICE).toLocaleString('ko-KR')}원/월</span>
				</div>
			)
		});

		const ppmListFm = new FM({
			id : 'ppmList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : DATA_PPM.PROD_INFO.PROD_DTL.length,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : DATA_PPM.PROD_INFO.PROD_DTL.length - 1,
			bRowRolling: false,
			onFocusKeyDown: this.onPPMKeyDown,
			onFocusChild: this.onFocusChild
		});
		this.setFm('ppmList', ppmListFm);

		let detailInfo =
			{
				PNAME: DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].PNAME,
				PTYPE: DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].PTYPE,
				PPM_PROD_IMG_PATH: DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].PPM_PROD_IMG_PATH,
				V_PRICE: numberWithCommas(DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].V_PRICE),
				NSCREEN: DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].NSCREEN
			};
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>월정액 구매</span>
					<div>{DATA_PPM.PROD_INFO.PROD_DTL[selectedIdx].PNAME}</div>
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
						<div id="buyMonthlyBtnList">
							<ButtonContainer callback={this.props} setFm={this.setFm} moveNextPage={this.moveNextPage} />
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

		let imgPath = data.PPM_PROD_IMG_PATH;
		const price = data.V_PRICE;
		const url = Utils.getImageUrl(Utils.PURCHASE_PPM_IMAGE);		
		imgPath = imgPath !== "" && imgPath !== null ? url + imgPath : '';

		return (
			<div className="optionView">
				<div className="imgWrap">
					<img src={imgPath !== "" ? imgPath : null} alt="" />
				</div>
				{ data.NSCREEN === 'Y' && <span class="useGuideText">Btv에서 구매시 <span class="logoOksusu"></span> 에서 무료로 이용가능</span>}
				<p>한번 가입하시면 매번 결제하는 번거로움 없이 월 {price}원으로 지상파 약정형 프로그램을 마음껏 시청하실 수 있는 서비스입니다.</p>
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
		const buyMonthlyBtnListFm = new FM({
			id : 'buyMonthlyBtnList',
			type: '',
			moveSelector : '.btnWrap',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			bRowRolling: false,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('buyMonthlyBtnList', buyMonthlyBtnListFm);
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

export default BuyMonthly;