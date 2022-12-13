import { React, createMarkup } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BillCertify.css';
import keyCodes from '../../../supporters/keyCodes';
import Core from '../../../supporters/core';
import PopupPageView from '../../../supporters/PopupPageView';
import CertifyPopup from '../popup/CertifyPopup';
import appConfig from './../../../config/app-config';
import FM from './../../../supporters/navi';
import { cloneDeep } from 'lodash';
import Utils from './../../../utils/utils';
import StbInterface from './../../../supporters/stbInterface';

const VIEW_CERTIFY = 'view_certify';
const VIEW_BTN_DETAIL = 'view_btn_detail';

const MODE_ALL = "mode_all";
const MODE_PPM = "mode_ppm";
const MODE_PHONE = "mode_phone";
/**
 * mode = PPM: 월정액 or 채널 월정액
 * 		  PHONE: 핸드폰 결제
 * 		  ALL : 월정액 or 채널 월정액 이면서 핸드폰 결제
 */
class BillCertify extends PopupPageView {
	constructor(props) {
		super(props);
		this.state = {
			mode: this.paramData.mode,
			DATA_API: this.paramData.DATA,
			content: [],
			detail: "",
			popData: 0,
			focusView: VIEW_CERTIFY,
			selectIdx: [],
			allSelect: false,
			activeList: false,
			curIdx: 0
		}
		
		const focusList = [
			{ key: 'certifyList', fm: null },
			{ key: 'certifyAgreeAll', fm: null },
			{ key: 'billCertifyBtnList', fm: null }
		];
		this.declareFocusList(focusList);
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
		const { mode } = this.state;
		let addr = "";
		if (mode === MODE_ALL) {
			addr = 'assets/purchaseCertify/ppm_phone_list.json';
		} else if (mode === MODE_PPM) {
			addr = 'assets/purchaseCertify/ppm_list.json';
		} else {
			addr = 'assets/purchaseCertify/phone_list.json';
		}
		
		Utils.getlocalFile(addr)
		.then(data => {
			try { 
				const content = data.data.terms;
				if (content.length === 1) {
					Utils.getlocalFile(content[0].detail)
					.then(data => {
						console.log('data: ', data);
						try { 
							this.settingView(content, data.data);
						} catch (error) {
							Core.inst().showToast("잠시후 다시 시도해 주세요.");
							this.props.callback({result: false});
						}
					}, () => {
						Core.inst().showToast("잠시후 다시 시도해주세요.");
						this.props.callback({result: false});
					});
				} else {
					this.settingView(content, "");
				}
				
			} catch (error) {
				Core.inst().showToast("잠시후 다시 시도해 주세요.");
				this.props.callback({result: false});
			}
		}, () => {
			Core.inst().showToast("잠시후 다시 시도해주세요.");
			this.props.callback({result: false});
		});
	}

	settingView = (content, detail) => {
		let selectIdx = [];
		for (let i = 0; i < content.length; i++) {
			selectIdx.push(0);
		}
		console.log('selectIdx: ', selectIdx);
		this.setState({content: content, detail: detail, selectIdx: selectIdx});

		const butShortBtnListFm = new FM({
			id : 'billCertifyBtnList',
			containerSelector: '.btnWrap',
			moveSelector : '',
			focusSelector : '.btnStyle',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			bRowRolling: false,
			onFocusKeyDown: this.onFocusKeyDownBtnList
		});
		this.setFm('billCertifyBtnList', butShortBtnListFm);
		const certifyListFm = new FM({
			id : 'certifyList',
			containerSelector: '.optionWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : content.length,
			col : 1,
			focusIdx : content.length - 1,
			startIdx : 0,
			lastIdx : content.length - 1,
			bRowRolling: false,
			onFocusContainer: this.onFocusContainer,
			onBlurContainer: this.onBlurContainer,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onFocusKeyDownCertifyList
		});
		this.setFm('certifyList', certifyListFm);
		if (content.length > 1) {
			const certifyAgreeAllFm = new FM({
				id : 'certifyAgreeAll',
				containerSelector: '.allWrap',
				moveSelector : '',
				focusSelector : '.csFocus',
				row : 1,
				col : 1,
				focusIdx : 0,
				startIdx : 0,
				lastIdx : 0,
				bRowRolling: false,
				onFocusKeyDown: this.onFocusKeyDownCertifyAll
			});
			this.setFm('certifyAgreeAll', certifyAgreeAllFm);
			this.setFocus('certifyAgreeAll');
		} else {
			this.setFocus('certifyList');
		}
	}

	callbackMoveCertifyPopup = (data) => {
		console.log('data: ' + data);
		Core.inst().showPopup(<CertifyPopup />, data, this.callbackCertifyPopup);
	}
	
	onFocusContainer = () => {
		const { content } = this.state;
		this.setState({ activeList: true, curIdx: content.length - 1 });
	}
	onBlurContainer = () => {
		this.setState({ activeList: false });
	}
	onFocusChild = (curIdx) => {
		this.setState({ curIdx: curIdx });
	}

	onFocusKeyDownCertifyList = (evt, idx) => {
		console.log('this.state: ', this.state);
		const { content, allSelect } = this.state;
		let focusView = cloneDeep(this.state.focusView); 
		if (content.length === 1 && idx === content.length - 1 && evt.keyCode === keyCodes.Keymap.DOWN) {
			// 약관이 한개 일때 바로 버튼으로 이동시
			if (!allSelect) {
				return true;
			}
		} else if (evt.keyCode === keyCodes.Keymap.LEFT && focusView === VIEW_BTN_DETAIL) {
			focusView = VIEW_CERTIFY;
			this.setState({ focusView: focusView });
		} else if (evt.keyCode === keyCodes.Keymap.RIGHT && focusView === VIEW_CERTIFY) {
			focusView = VIEW_BTN_DETAIL;
			this.setState({ focusView: focusView });
		} else if (evt.keyCode === keyCodes.Keymap.UP && focusView === VIEW_BTN_DETAIL) {
			focusView = VIEW_CERTIFY;
			this.setState({ focusView: focusView });
		} else if (evt.keyCode === keyCodes.Keymap.DOWN && focusView === VIEW_BTN_DETAIL) {
			focusView = VIEW_CERTIFY;
			this.setState({ focusView: focusView });
		} else if (evt.keyCode === keyCodes.Keymap.ENTER) {
			if (focusView === VIEW_BTN_DETAIL) {
				// 상세보기 팝업
				const { content } = this.state;
				Utils.getlocalFile(content[idx].detail)
				.then(data => {
					console.log('data: ', data);
					Core.inst().showPopup(<CertifyPopup />, {title: content[idx].title, detail: data.data}, this.callbackCertifyPopup);
				}, () => {
					Core.inst().showToast("잠시후 다시 시도해주세요.");
					this.props.callback({result: false});
				});
			} else {
				// 약관 동의 체크
				let selectIdx = cloneDeep(this.state.selectIdx); 
				selectIdx[idx] = selectIdx[idx] === 0 ? 1 : 0;
				console.log('selectIdx: ', selectIdx);

				let allSelect = true;
				for (let i = 0; i < selectIdx.length; i++) {
					if (selectIdx[i] === 0) {
						allSelect = false;
					}
				}

				this.setState({ allSelect: allSelect, selectIdx: selectIdx });
			}
		}
	}
	onFocusKeyDownCertifyAll = (evt, idx) => {
		const { allSelect } = this.state;
		if (evt.keyCode === keyCodes.Keymap.DOWN) {
			// 약관에서 버튼으로 이동시
			if (!allSelect) {
				return true;
			}
		} else if (evt.keyCode === keyCodes.Keymap.ENTER) {
			let allSelect = cloneDeep(!this.state.allSelect);
			let selectIdx = cloneDeep(this.state.selectIdx);
			if (allSelect) {
				for (let i = 0; i < selectIdx.length; i++) {
					selectIdx[i] = 1;
				}
			} else {
				for (let i = 0; i < this.state.selectIdx.length; i++) {
					selectIdx[i] = 0;
				}
			}
			this.setState({ allSelect: allSelect, selectIdx: selectIdx });
		}
	}
	onFocusKeyDownBtnList = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			this.props.callback({result: true});
			// const { DATA_API } = this.state;
			// Core.inst().showPopup(<BillPhoneCertify />, { DATA_API: DATA_API }, this.callbackBillPhoneCertify);
		}
	}
	
	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			this.props.callback({result: false});
			return true;
		} else {
			super.onKeyDown(evt);
		}
	}

	callbackCertifyPopup = (info) => {
		console.log('callbackCertifyPopup: ', info);
	}

	callbackBillPhoneCertify = (info) => {
		console.log('callbackBillPhoneCertify: ', info);
	}

	render() {
		const { content, selectIdx, allSelect, focusView, detail, curIdx, activeList } = this.state;

		return (
			<div id="billCerfity" className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="popWrap certify">
					<div className="popTop">
						<div className="pageTitle">구매 약관동의</div>
					</div>
					<CertifyDetails content={content} setFm={this.setFm}
						allSelect={allSelect}
						selectIdx={selectIdx}
						focusView={focusView}
						detail={detail}
						activeList={activeList}
						curIdx={curIdx}
					/>
					<div className="keyWrap"><span className="btnKeyPrev">취소</span></div>
				</div>
			</div>
		)
	}
}

class CertifyDetails extends React.Component {
	render() {
		const { content, selectIdx, allSelect, focusView, detail, activeList, curIdx } = this.props;

		return (
			<div id="certifyList" className={`billCon ${content.length > 1 ? 'multi' : 'single'}`}>
				<div className="optionWrap">
					{
						content.map((data, i) => {
							const txtClass = activeList && curIdx === i ? "discountWrap focus" : "discountWrap";
							return (
								<div className={txtClass} key={i}>
									<div className={`changeBtn btnStyle type03 ${activeList && curIdx === i && focusView === VIEW_BTN_DETAIL ? 'focusOn' : ''}`}>상세보기</div>
									<div className={`csFocus checkStyle  ${activeList && curIdx === i && focusView === VIEW_CERTIFY ? 'focusOn' : ''}`} select={`${selectIdx[i] === 1 ? 'true' : 'false'}`}>
										<span className="title">{data.title}</span>
									</div>
								</div>
							)
						})
					}
				</div>
				{ content.length === 1 && 
					<div className="agreeCon" style={{'WebkitBoxOrient':'vertical'}}>
					<div className="text" dangerouslySetInnerHTML={createMarkup(detail)}></div>
					</div>
				}
				
				{ content.length > 1 && 
					<div id="certifyAgreeAll" className="allWrap">
						<div className="csFocus checkStyle" select={allSelect.toString()}>
							<span className="title">전체 약관동의</span>
						</div>
					</div>
				}
				<div id="billCertifyBtnList" className="btnWrap">
					<span className="btnStyle" data-disabled={!allSelect}>확인</span>
				</div>
			</div>
		)
	}
}
export default BillCertify;