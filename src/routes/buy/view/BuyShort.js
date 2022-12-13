import { React } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BuyShort.css';
import constants, { STB_PROP } from './../../../config/constants';
import keyCodes from '../../../supporters/keyCodes';
import Utils, { numberWithCommas } from '../../../utils/utils';
import FM from '../../../supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView';
import Core from '../../../supporters/core';
import BuyBill from './BuyBill'
import { getCodeName } from '../../../utils/code';
import { cloneDeep } from 'lodash';
import appConfig from './../../../config/app-config';
import PopupConfirm from '../../../components/popup/PopupConfirm';
import _ from 'lodash';
import StbInterface from '../../../supporters/stbInterface';
import { CTSInfo } from './../../../supporters/CTSInfo';

// const MODE_PPV = constants.PRD_TYP_CD.PPV;
// const MODE_PPS = constants.PRD_TYP_CD.PPS;
const MODE_PPM = constants.PRD_TYP_CD.PPM;
// const MODE_PPP = constants.PRD_TYP_CD.PPP;

// const VIEW_LIST = 'view_list';
// const VIEW_BTN = 'view_btn'

// 구매옵션 화면 표시 컨텐츠
// : 단편 일반, 단편 소장, 시즌 전편, 시즌 에피소드, 월정액(시놉시스내 진입), 월정액 페이지 진입(일부만)
class BuyShort extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'optionTotalList', fm: [] },
			{ key: 'ppmList', fm: null },
			{ key: 'butShortBtnList', fm: null }
		];
		this.declareFocusList(focusList);

		console.log('param: ', this.paramData);
		let data = this.paramData;

		let mode = data.PROD_INFO[0].PTYPE;
		let modeCategory = 0, selectedData = {};
		if (mode !== MODE_PPM) {
			// 단일 상품이거나, 시리즈 상품일때, 데이터 정렬 (옵션팝업에서 사용)
			for (let i = 0; i < data.PROD_INFO.length; i++) {
				let sd = [], hd = [], uhd = [], uhdhdr = [];
				let reuslt = [];
				for (let j = 0; j < data.PROD_INFO[i].PROD_DTL.length; j++) {
					let prod_dtl = data.PROD_INFO[i].PROD_DTL[j];
					if (prod_dtl.FGQUALITY === constants.RESOLUTION_TYPE_CD.SD) {
						sd.push(prod_dtl);
					}
					if (prod_dtl.FGQUALITY === constants.RESOLUTION_TYPE_CD.HD) {
						hd.push(prod_dtl);
					}
					if (prod_dtl.FGQUALITY === constants.RESOLUTION_TYPE_CD.UHD) {
						uhd.push(prod_dtl);
					}
					if (prod_dtl.FGQUALITY === constants.RESOLUTION_TYPE_CD.UHD_HDR) {
						uhdhdr.push(prod_dtl);
					}

					// find Selected PID
					if (data.PID === prod_dtl.PID) {
						modeCategory = i;
						selectedData.fgQuality = prod_dtl.FGQUALITY;
						selectedData.vocLag = prod_dtl.VOC_LAG;
					}
				}

				if (sd.length > 0) {
					sd = this.checkLanguage(sd);
					if (sd.length > 0) reuslt.push({ FGQUALITY: constants.RESOLUTION_TYPE_CD.SD, list_lang: sd});
				}
				if (hd.length > 0) {
					hd = this.checkLanguage(hd);
					if (hd.length > 0) reuslt.push({ FGQUALITY: constants.RESOLUTION_TYPE_CD.HD, list_lang: hd});
				}
				if (uhd.length > 0) {
					uhd = this.checkLanguage(uhd);
					if (uhd.length > 0) reuslt.push({ FGQUALITY: constants.RESOLUTION_TYPE_CD.UHD, list_lang: uhd});
				}
				if (uhdhdr.length > 0) {
					uhdhdr = this.checkLanguage(uhdhdr);
					if (uhdhdr.length > 0) reuslt.push({ FGQUALITY: constants.RESOLUTION_TYPE_CD.UHD_HDR, list_lang: uhdhdr});
				}
				data.PROD_INFO[i].list_fg = reuslt;
			}
			if (_.isEmpty(selectedData)) {
				selectedData.fgQuality = data.PROD_INFO[0].list_fg[0].FGQUALITY;
				selectedData.vocLag = data.PROD_INFO[0].list_fg[0].list_lang[0].VOC_LAG;
			}
		}

		this.resetFmList('optionTotalList');

		this.state = {
			mode: mode,
			modeCategory: modeCategory,
			selectedData: selectedData,
			DATA_SCS: data,
			selectedPPMIdx: 0,	//월정액에서 사용
			focusView: 0,
			focusIdx: 0,
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
	
	componentDidMount () {
		if (this.state.mode === MODE_PPM) {
			this.setFocus(0);
		} else {
			this.state.focusView = this.arrangedFocusList.length - 1;
			this.setFocus(this.state.focusView);
		}
	}
	
	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			this.props.callback();
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

	checkLanguage(data) {
		let result = [], kor = [], cap_kr = [];
		for (let i = 0; i < data.length; i++) {
			if (_.isEmpty(data[i].VOC_LAG) || data[i].VOC_LAG === constants.LANGUAGE_TYPE_CD.KOREAN) {
				kor.push(data[i]);
			}
			if (data[i].VOC_LAG === constants.LANGUAGE_TYPE_CD.CAPTION_KR) {
				cap_kr.push(data[i]);
			}
		}
		if (kor.length > 0) {
			result.push({ VOC_LAG: constants.LANGUAGE_TYPE_CD.KOREAN, list: kor });
		}
		if (cap_kr.length > 0) {
			result.push({ VOC_LAG: constants.LANGUAGE_TYPE_CD.CAPTION_KR, list: cap_kr });
		}
		return result;
	}
	
	moveNextPage = (data) => {
		const { DATA_SCS, selectedPPMIdx } = this.state;
		let resultData = cloneDeep(DATA_SCS);
		if (this.state.mode === MODE_PPM) {
			resultData.PROD_INFO = cloneDeep(DATA_SCS.PROD_INFO[0]);
			resultData.PROD_INFO.PROD_DTL = resultData.PROD_INFO.PROD_DTL[selectedPPMIdx];
		} else {
			resultData.PROD_INFO = cloneDeep(DATA_SCS.PROD_INFO[this.state.modeCategory]);
			resultData.PROD_INFO.PROD_DTL = data;
		}
		//지원하지 않는 해상도일 경우 구매하지 못하도록 설정
		const hdr_support = StbInterface.getProperty(STB_PROP.HDR_SUPPORT);
		if (hdr_support === "false" && resultData.PROD_INFO.PROD_DTL.FGQUALITY === constants.RESOLUTION_TYPE_CD.UHD_HDR) {
			Core.inst().showToast("보유하신 TV가 UHD 또는 HDR 화질을 지원하지 않습니다.\n다른 화질을 선택해 주세요.\n(UHD,HDR 지원 여부는 TV제조사의 서비스센터에 문의해 주세요.)");
			return;
		}
		resultData.enterance = 2;
		Core.inst().showPopup(<BuyBill />, resultData);
	}
	
	onFocusMoveUnavailable = (data) => {
		const { mode } = this.state;
		const arrangedFocusList = this.arrangedFocusList;
		let lastIdx, preFocusIdx;
		console.log('arrangedFocusList ', arrangedFocusList);
		if ((data.id === 'categoryList' || data.id === 'resolutionList' || data.id === 'languageList' 
			|| data.id === 'ppmList') && data.direction === "RIGHT") {
			this.state.focusView = arrangedFocusList.length - 1;
			this.setFocus('butShortBtnList');
		} else if (data.id === 'butShortBtnList' && data.direction === "LEFT") {
			let setIdx = 0;
			this.state.focusView = 0;
			if (mode === MODE_PPM) {
				setIdx = 0;
			} else {
				setIdx = arrangedFocusList[this.state.focusView].fm.listInfo.lastIdx;
			}
			this.setFocus(this.state.focusView, setIdx);
		} else if (this.state.focusView > 0 && this.state.focusView < this.arrangedFocusList.length - 1 && data.direction === "UP") {
			preFocusIdx = arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
			this.state.focusView = this.state.focusView - 1;
			lastIdx = arrangedFocusList[this.state.focusView].fm.listInfo.lastIdx;
			if (lastIdx < preFocusIdx) {
				preFocusIdx = lastIdx;
			}
			this.setFocus(this.state.focusView, preFocusIdx);
		} else if (this.state.focusView + 1 < arrangedFocusList.length - 1 && data.direction === "DOWN") {
			preFocusIdx = arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
			this.state.focusView = this.state.focusView + 1;
			lastIdx = arrangedFocusList[this.state.focusView].fm.listInfo.lastIdx;
			if (lastIdx < preFocusIdx) {
				preFocusIdx = lastIdx;
			}
			this.setFocus(this.state.focusView, preFocusIdx);
		} else if (data.id === 'ppmList') {
			const currntFm = arrangedFocusList[this.state.focusView].fm;
			if (!_.isEmpty(currntFm) && currntFm.listInfo.curIdx === 0  && data.direction === "UP") {
				// 월정액은 roopling기능 추가
				this.setFocus(this.state.focusView, currntFm.listInfo.lastIdx);
			} else if (!_.isEmpty(currntFm) && currntFm.listInfo.curIdx === currntFm.listInfo.lastIdx && data.direction === "DOWN") {
				// 월정액은 roopling기능 추가
				this.setFocus(this.state.focusView, 0);
			}
		} 
	}
	
	updateSelectedData = (which, data) => {
		let selectedData, setIdx;
		switch(which) {
			case "category":
				this.setState({ modeCategory: data });
				this.state.focusView = 0;
				setIdx = this.arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
				this.state.focusIdx = setIdx;
				this.setFocus(this.state.focusView, setIdx);
				break;
			case "fgQuality":
				selectedData = this.state.selectedData;
				selectedData.fgQuality = data;
				setIdx = this.arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
				this.setState({ selectedData: selectedData, focusIdx: setIdx });
				this.setFocus(this.state.focusView, setIdx);
				break;
			case "vocLag":
				selectedData = this.state.selectedData;
				selectedData.vocLag = data;
				setIdx = this.arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
				this.setState({ selectedData: selectedData, focusIdx: setIdx });
				this.setFocus(this.state.focusView, setIdx);
				break;
			default:
			break;
		}	
	}

	onPPMKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			this.setState({selectedPPMIdx: idx});
			this.state.focusView = 0;
			const setIdx = this.arrangedFocusList[this.state.focusView].fm.listInfo.curIdx;
			this.setFocus(this.state.focusView, idx);
		}
	}

	renderPPM() {
		const { DATA_SCS, selectedPPMIdx } = this.state;
		const selectPPMProduct = DATA_SCS.PROD_INFO[0].PROD_DTL.map((data, i) => {
			let strClass = "csFocus radioStyle2";
			if (selectedPPMIdx === i) {
				strClass += ' select';
			}
			return (
				<div className={strClass} key={i}>
					{data.PNAME}
					<span>{Number(data.PRICE).toLocaleString('ko-KR')}원/월</span>
				</div>
			)
		});

		const ppmListFm = new FM({
			id : 'ppmList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : DATA_SCS.PROD_INFO[0].PROD_DTL.length,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : DATA_SCS.PROD_INFO[0].PROD_DTL.length - 1,
			bRowRolling: false,
			onFocusKeyDown: this.onPPMKeyDown,
			onFocusChild: this.onFocusChild
		});
		this.setFm('ppmList', ppmListFm);

		let detailInfo =
			{
				PTYPE: DATA_SCS.PROD_INFO[0].PTYPE,
				CLTYN: DATA_SCS.PROD_INFO[0].CLTYN,
				PPM_PROD_IMG_PATH: DATA_SCS.PROD_INFO[0].PROD_DTL[selectedPPMIdx].PPM_PROD_IMG_PATH,
				FGQUALITY: "",
				VOC_LAG: "",
				DUETIME_PERIOD: "",
				DUETIME_STR: "",
				PRICE: DATA_SCS.PROD_INFO[0].PROD_DTL[selectedPPMIdx].V_PRICE,
				NSCREEN: DATA_SCS.PROD_INFO[0].PROD_DTL[selectedPPMIdx].NSCREEN,
				ORI_PRICE: DATA_SCS.PROD_INFO[0].PROD_DTL[selectedPPMIdx].ORI_PRICE
			};
		const PNAME = DATA_SCS.PROD_INFO[0].PROD_DTL[selectedPPMIdx].PNAME;
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>월정액</span>
					<div>{PNAME}</div>
					<div className="progress">
						<span className="on">1</span>
						<img src={`${appConfig.headEnd.LOCAL_URL}/buy/path-8.png`} alt="" />
						<span>2</span>
					</div>
				</div>
				<div className="buyContent buyMonthly">
					<div className="left">
						<div id="ppmList" className="optionWrap">
							<div className="title">상품선택<em className="taxInfo">모든 가격은 부가세 포함가입니다.</em></div>
							<div>{selectPPMProduct}</div>
						</div>
					</div>
					<div className="right">
						<OptionDetailView mode={this.state.mode} curCategory="0" data={detailInfo} idx={this.state.idxSelected} />
						<div id="butShortBtnList">
							<ButtonContainer setFm={this.setFm} moveNextPage={this.moveNextPage} />
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderOthers() {
		const { mode, selectedData, modeCategory, DATA_SCS, idxSelected } = this.state;
		const PTYPE = this.state.DATA_SCS.PROD_INFO[modeCategory].PTYPE;
		const list_fg = this.state.DATA_SCS.PROD_INFO[modeCategory].list_fg;

		let fgIdx = 0, languageIdx = 0;
		for (let i = 0; i < list_fg.length; i++) {
			if (list_fg[i].FGQUALITY === selectedData.fgQuality) {
				fgIdx = i;
				for (let j = 0; j < list_fg[i].list_lang.length; j++) {
					if (list_fg[i].list_lang[j].VOC_LAG === selectedData.vocLag) {
						languageIdx = j;
					}
				}
			}
		}

		const curSelectedData = list_fg[fgIdx].list_lang[languageIdx].list[0];
		let detailInfo =
			{
				PTYPE: PTYPE,
				CLTYN: curSelectedData.CLTYN,
				PPM_PROD_IMG_PATH: "",
				FGQUALITY: curSelectedData.FGQUALITY,
				VOC_LAG: curSelectedData.VOC_LAG,
				DUETIME_PERIOD: curSelectedData.DUETIME_PERIOD,
				DUETIME_STR: curSelectedData.DUETIME_STR,
				PRICE: curSelectedData.V_PRICE,
				NSCREEN: curSelectedData.NSCREEN,
				ORI_PRICE: curSelectedData.ORI_PRICE
			};

		const kindBuy = DATA_SCS.PROD_INFO[modeCategory].CLTYN === 'N' ? '일반' : '소장';
		
		this.resetFmList('optionTotalList');
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>{kindBuy}구매</span>
					<div>{curSelectedData.PNAME}</div>
					<div className="progress">
						<span className="on">1</span>
						<img src={`${appConfig.headEnd.LOCAL_URL}/buy/path-8.png`} alt="" />
						<span>2</span>
					</div>
				</div>
				<div className="buyContent">
					<div className="left">
						{DATA_SCS.PROD_INFO.length > 1 &&
							<CategoryList idx={modeCategory} data={DATA_SCS.PROD_INFO}
							 setFm={this.setFm} updateSelectedData={this.updateSelectedData} />
						}
						{list_fg.length > 1 &&
							<ResolutionList idx={fgIdx} data={list_fg} 
							setFm={this.setFm} updateSelectedData={this.updateSelectedData} />
						}
						{list_fg[fgIdx].list_lang.length > 1 &&
							<LanguageList idx={languageIdx} data={list_fg[fgIdx].list_lang}
							 setFm={this.setFm} updateSelectedData={this.updateSelectedData} />
						}
					</div>
					<div className="right">
						<OptionDetailView mode={mode} data={detailInfo} idx={idxSelected} />
						<div id="butShortBtnList">
							<ButtonContainer setFm={this.setFm} data={curSelectedData} moveNextPage={this.moveNextPage} />
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		console.log('render');

		if (this.state.DATA_SCS === undefined) {
			return null;
		}

		if (this.state.mode === MODE_PPM) {
			return this.renderPPM();
		} else {
			return this.renderOthers();
		}
	}
}

class CategoryList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}
	
	onFocusContainer = (direction) => {
		console.log('direction: ' + direction);
		
	}
	onBlurContainer = (direction) => {
		console.log('direction: ' + direction);
		
	}
	onFocusChild = (curIdx) => {
		console.log('curIdx: ' + curIdx);
	}
	onFocusKeyDown = (evt, idx) => {
		console.log('keyCode: ' + evt.keyCode);
		console.log('idx: ' + idx);
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			this.props.updateSelectedData('category', idx);
		}
	}
	render() {
		const { setFm, data, idx } = this.props;
		let focusIdx = idx;
		if (idx > data.length -1) {
			focusIdx = data.length -1;
		}
		const fm = new FM({
			id : 'categoryList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : 1,
			col : data.length,
			focusIdx : focusIdx,
			startIdx : 0,
			lastIdx : data.length -1,
			bRowRolling: false,
			onFocusContainer: this.onFocusContainer,
			onBlurContainer: this.onBlurContainer,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('optionTotalList', fm);
		const categoryList = data.map((data, i) => {
			let txtClass = idx === i ? "category csFocus radioStyle1 select" : "category csFocus radioStyle1";
			return (
				<span key={i} className={txtClass} data-type="category" >
					{data.CLTYN === 'Y' ? '소장' : '일반'}
				</span>
			)
		});

		return (
			<div id="categoryList" className="optionWrap">
				<div className="title">유형</div>
				{/*6/12 radioBtnWrap className 추가*/}
				<div className="radioBtnWrap">{categoryList}</div>
			</div>
		)
	}
}

class ResolutionList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			idx: this.props.idx
		}
	}
	onFocusContainer = (direction) => {
		
	}
	onBlurContainer = (direction) => {
		
	}
	onFocusChild = (curIdx) => {
		
	}
	onFocusKeyDown = (evt, idx) => {
		console.log('keyCode: ' + evt.keyCode);
		console.log('idx: ' + idx);
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { data, updateSelectedData } = this.props;
			updateSelectedData('fgQuality', data[idx].FGQUALITY);
		}
	}

	render() {
		const { setFm, data, idx } = this.props;
		let focusIdx = idx;
		if (idx > data.length -1) {
			focusIdx = data.length -1;
		}
		const fm = new FM({
			id : 'resolutionList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : 1,
			col : data.length,
			focusIdx : focusIdx,
			startIdx : 0,
			lastIdx : data.length -1,
			bRowRolling: false,
			onFocusContainer: this.onFocusContainer,
			onBlurContainer: this.onBlurContainer,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('optionTotalList', fm);

		const screenList = data.map((data, i) => {
			let txtClass = idx === i ? "category csFocus radioStyle1 select" : "category csFocus radioStyle1";
			return (
				<span className={txtClass} key={i} data-type="fgQuality" >
					{getCodeName('RSLU_TYP_CD', data.FGQUALITY)}
				</span>
			)
		});

		return (
			<div id="resolutionList" className="optionWrap">
				<div className="title">화질</div>
				{/*6/12 radioBtnWrap className 추가*/}
				<div className="radioBtnWrap">{screenList}</div>
			</div>
		)
	}
}

class LanguageList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			idx: this.props.idx
		}
	}
	
	onFocusContainer = (direction) => {
		
	}
	onBlurContainer = (direction) => {
		
	}
	onFocusChild = (curIdx) => {
		
	}
	onFocusKeyDown = (evt, idx) => {
		console.log('keyCode: ' + evt.keyCode);
		console.log('idx: ' + idx);
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { data, updateSelectedData } = this.props;
			updateSelectedData('vocLag', data[idx].VOC_LAG);
		}
	}

	render() {
		const { setFm, data, idx } = this.props;
		let focusIdx = idx;
		if (idx > data.length -1) {
			focusIdx = data.length -1;
		}
		const fm = new FM({
			id : 'languageList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : 1,
			col : data.length,
			focusIdx : focusIdx,
			startIdx : 0,
			lastIdx : data.length -1,
			bRowRolling: false,
			onFocusContainer: this.onFocusContainer,
			onBlurContainer: this.onBlurContainer,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('optionTotalList', fm);

		const langList = data.map((data, i) => {
			const txtClass = idx === i ? "category csFocus radioStyle1 select" : "category csFocus radioStyle1";
			return (
				<span key={i} className={txtClass} data-type="language" >
					{data.VOC_LAG === '02' ? '자막' : '우리말'}
				</span>
			)
		});

		return (
			<div id="languageList" className="optionWrap">
				<div className="title">언어</div>
				{/*6/12 radioBtnWrap className 추가*/}
				<div className="radioBtnWrap">{langList}</div>
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
		const { data } = this.props;
		if (this.props.mode === MODE_PPM) {
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
		} else {
			let language = "";
			if (data.VOC_LAG === '01') {
				language = '우리말';
			} else if (data.VOC_LAG === '02') {
				language = '자막';
			}

			const bShoowOriPrice = Number(data.ORI_PRICE) > Number(data.PRICE) ? true : false;
			return (
				<div className="optionView">
					<ul>
						<li>
							<span>영상옵션</span>
							<span className="optionList">{data.CLTYN === 'Y' ? '소장' : '일반'} <em>/</em> {getCodeName('RSLU_TYP_CD', data.FGQUALITY)} <em>/</em> {language}</span>
						</li>
						<li>
							<span>시청기간</span>
							<span className="optionList">{data.DUETIME_PERIOD} <em>/</em>{data.DUETIME_STR}</span>
						</li>
					</ul>
					{this.props.data.NSCREEN === "Y" && <div className="oksusu"><img src={`${appConfig.headEnd.LOCAL_URL}/buy/logo.png`} alt="" />가입자는 추가 구매 없이 이용하실 수 있습니다.</div>}
					<div className="optionPrice">
						{bShoowOriPrice &&
							<div className="priceCon">
								<span className="priceIndex">기존가격</span>
								<span className="priceResult">{numberWithCommas(data.ORI_PRICE)}<em>원</em></span>
							</div>
						}
						<div className="priceCon total">
							<span className="priceIndex">구매가격<em className="tax">(부가세 포함)</em></span>
							<span className="priceResult">{numberWithCommas(data.PRICE)}<em>원</em></span>
						</div>
					</div>
				</div>
			)
		}
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
		const butShortBtnListFm = new FM({
			id : 'butShortBtnList',
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
		setFm('butShortBtnList', butShortBtnListFm);
	}
	
	onFocusKeyDown = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			if (idx === 0) {
				const { data, moveNextPage } = this.props;
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

export default BuyShort;