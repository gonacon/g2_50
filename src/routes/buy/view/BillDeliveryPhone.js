import {React, phoneNumFn} from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BillDeliveryPhone.css';
import { DIS } from '../../../supporters/network/DIS';
import keyCodes from '../../../supporters/keyCodes';
import PopupPageView from '../../../supporters/PopupPageView';
import FM from '../../../supporters/navi';
import Core from './../../../supporters/core';
import appConfig from '../../../config/app-config';
import StbInterface from './../../../supporters/stbInterface';
import NumberInputV2 from './../../../components/modules/NumberInputV2';
import { CTSInfo } from './../../../supporters/CTSInfo';
import { cloneDeep } from 'lodash';
import { convertSpaceToNum } from '../../../utils/utils';

const { Keymap: { BACK_SPACE, PC_BACK_SPACE, UP, DOWN, LEFT, RIGHT, ENTER } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;
const PHONE_DIGIT = 11;
const CONFIRM_DIGIT = 4;
const LIMIT_CERTIFY_TIME = 5 * 60;	// 5분(단위 sec)

class BillDeliveryPhone extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'certifyButton', fm: null, link : {'RIGHT': 'inputPhoneNumber'}},
			{ key: 'inputPhoneNumber', fm: null, link : {'LEFT': 'certifyButton', 'RIGHT': 'requestButton', 'DOWN': 'inputConfirmNumber'}},
			{ key: 'requestButton', fm: null, link : {'LEFT': 'inputPhoneNumber', 'DOWN': 'inputConfirmNumber'}},
			{ key: 'inputConfirmNumber', fm: null, link : {'UP': 'inputPhoneNumber', 'DOWN' : 'confirmButton'}},
			{ key: 'confirmButton', fm: null, link : {'UP': 'inputConfirmNumber'}}
		];

		this.declareFocusList(focusList);

		this.state = {
			ori_data: this.paramData,
			DATA_DIS_001: undefined,
			req_date: undefined,
			certifyDisabled : true,
			btnDisabled : true,
			index: 0,
			certifySelect: false,
			bSetLimitTimer: false,			//인증번호 제한시간
			limitTime: LIMIT_CERTIFY_TIME	//인증 제한시간 5분
		}
		// 휴대폰 인증번호 요청 후 certifyDisabled false로 변경해주세요.

		this.inputRefs = {};
		this.phoneNumber = '';
		this.confirmNumber = '';
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
		this.setFocusManager();
	}

	setFocusManager = () => {
		const certifyButtonFm = new FM({
			id : 'certifyButton',
			type: 'ELEMENT',
			containerSelector: '.allWrap',
			moveSelector: '',
			focusSelector : '.csFocus',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusKeyDown: this.onFocusKeyDownCertifyButton
		});

		const inputPhoneNumberFm = new FM({
			id : 'inputPhoneNumber',
			type: 'ELEMENT',
			containerSelector: '.birth',
			moveSelector: '',
			focusSelector : '.csFocusInput',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusContainer: this.onFocusInputPhoneNumber,
			onBlurContainer: this.onBlurInputPhoneNumber,
			onFocusKeyDown: this.onFocusKeyDownInputPhoneNumber
		});

		const requestButtonFm = new FM({
			id : 'requestButton',
			type: 'ELEMENT',
			containerSelector: '.gridWrap',
			moveSelector: '',
			focusSelector : '.btnRequire',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusKeyDown: this.onFocusKeyDownRequestButton
		});

		const inputConfirmNumberFm = new FM({
			id : 'inputConfirmNumber',
			type: 'ELEMENT',
			containerSelector: '.gridStyle',
			moveSelector: '',
			focusSelector : '.csFocusInput',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusContainer: this.onFocusInputConfirmNumber,
			onBlurContainer: this.onBlurInputConfirmNumber,
			onFocusKeyDown: this.onFocusKeyDownInputConfirmNumber
		});

		const confirmButtonFm = new FM({
			id : 'confirmButton',
			type: 'ELEMENT',
			containerSelector: '.btnWrap',
			moveSelector: '',
			focusSelector : '.csFocus',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusKeyDown: this.onFocusKeyDownConfirmButton
		});

		this.setFm('certifyButton', certifyButtonFm );
		this.setFm('inputPhoneNumber', inputPhoneNumberFm );
		this.setFm('requestButton', requestButtonFm );
		this.setFm('inputConfirmNumber', inputConfirmNumberFm );
		this.setFm('confirmButton', confirmButtonFm );

		this.setFocus(0);
	}

	onKeyDown(event) {
		super.onKeyDown(event);
		
		switch (event.keyCode) {
		  case BACK:
			this.props.callback();
			return true;      // 이전 PageView의 back을 막음
		  case UP:
		  case DOWN:
			// UP/DOWN 키로 focus group 간에 움직일 때, input tag에 focus가 생기는 것을 방지
			event.preventDefault();
			break;
		  case LEFT:
		  case RIGHT:
			// LEFT/RIGHT 키로 focus child 간에 움직일 때, input tag가 전체 선택 되는 것을 방지
			if (this.getCurrentFocusInfo().key !== 'inputGroup') {
			  event.preventDefault();
			}
			break;
		  default:
			break;
		}
	  }
	  onFocusMoveUnavailable = (data) => {
		const { btnDisabled, certifyDisabled } = this.state;
		if (btnDisabled && data.id === 'inputPhoneNumber' && data.direction === "RIGHT") {
			return true;
		} else if (certifyDisabled && data.id === 'inputConfirmNumber' && data.direction === "DOWN") {
			return true;
		} else {
			super.onFocusMoveUnavailable(data);
		}
	}

	onFocusInputPhoneNumber = () => {
		// setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
		setTimeout(() => {
		  this.inputRefs.phoneNumber.focus();
		}, 10);
	  }

  onBlurInputPhoneNumber = () => {
    this.inputRefs.phoneNumber.blur();
  }

  onFocusInputConfirmNumber = (idx) => {
    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs.confirmNumber.focus();
    }, 10);
  }

  onBlurInputConfirmNumber = () => {
    this.inputRefs.confirmNumber.blur();
  }

  onFocusKeyDownCertifyButton = (evt, idx) => {
	if (evt.keyCode === keyCodes.Keymap.ENTER) {
		const { certifySelect } = this.state;

		this.setState({ certifySelect: !certifySelect });
	}
}

	onFocusKeyDownInputPhoneNumber = (event) => {
		// input field 내에서의 커서 움직임 구현
		const { keyCode } = event;
		const target = this.inputRefs.phoneNumber;
		const length = target.value.length;
		const selection = target.selectionStart;
	
		if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
			if (length === selection && keyCode === RIGHT) return false;
			if (selection === 0 && keyCode === LEFT) return false;
			return true;
		}
	}

	onFocusKeyDownRequestButton = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { ori_data } = this.state;

			const dateFormat = require('dateformat');
			const newDate = new Date();
			const req_date_for_encrypt = dateFormat(newDate, 'mmddHHMMss');
			const req_date = dateFormat(newDate, 'yyyy-mm-dd HH:MM:ss');
			let param = {
				phoneNumber: this.phoneNumber,
				pid: ori_data.data.PID,
				req_code: "01",
				req_date_for_encrypt: req_date_for_encrypt,
				req_date: req_date
			}
			DIS.requestDIS001(param)
			.then(data => {
				console.log("data", data);
				if (data.result === '0000') {
					Core.inst().showToast('인증번호를 문자로 보냈습니다.');
					
					this.state.limitTime = LIMIT_CERTIFY_TIME;
					clearInterval(this.timer);
					this.state.bSetLimitTimer = true;
					this.timer = setInterval(this.tick, 1000);

					this.setState({ certifyDisabled: false, DATA_DIS_001: data, req_date: param.req_date });
				} else {
					Core.inst().showToast(data.result, data.reason);
				}
			});
	
			this.setState({ certifyDisabled: false });
		}

	}

	tick = () => {
		let limitTime = cloneDeep(this.state.limitTime);
		if (limitTime > 0) {
				limitTime--;
				this.setState({ limitTime: limitTime });
			} else {
				Core.inst().showToast('인증번호 입력시간을 초과했습니다. 인증번호를 다시 요청해 주세요.');
				clearInterval(this.timer);
				this.setState({ btnDisabled: true, bSetLimitTimer: false, limitTime: LIMIT_CERTIFY_TIME });
				this.setFocus('requestButton');
		}
	}

	onFocusKeyDownConfirmButton = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { DATA_DIS_001, req_date } = this.state;
			let param = {
				fir_ecrt_num: DATA_DIS_001.FIR_ECRT_NUM,
				mob_auth_num: this.confirmNumber, 
				req_date: req_date
			}
			DIS.requestDIS002(param)
			.then(data => {
				console.log("data", data);
				if (data.result === '0000') {
					let { ori_data } = this.state;
					let discount = {};
					discount.yn_coupon = 'n';
					discount.yn_bpoint = 'n';
					discount.fir_ecrt_num = DATA_DIS_001.FIR_ECRT_NUM;
					discount.snd_ecrt_num = data.SND_ECRT_NUM;
					discount.id_mchdse = ori_data.data.PROD_INFO.PROD_DTL.ID_MCHDSE;
					discount.totalPrice = ori_data.data.PROD_INFO.PROD_DTL.V_PRICE;
					CTSInfo.requestPurchaseSCS({mode: CTSInfo.MODE_VODPLUS, data: ori_data.data, paymethod: '90', discountInfo: discount});
				} else {
					Core.inst().showToast('명의자 정보가 유효하지 않습니다.\n확인 후 다시 요청해 주세요.');
				}
			});
		}
	}
	

	valueRequire(_this){
		let targetInput = _this.target.closest('.gridWrap').querySelector('#phoneNumber');
		let button = document.querySelector('.btnRequire');
		if( phoneNumFn(targetInput.value) ){
			button.setAttribute('data-disabled', false);
			button.classList.add('csFocus');
		} else {
			button.setAttribute('data-disabled', true);
			button.classList.remove('csFocus');
		}
	}

	onPhoneNumberInputKeyDown = (event) => {
		this.phoneNumber = event.target.value;
		this.setButtonDisable();
	  }

	onConfirmNumberInputKeyDown = (event) => {
		this.confirmNumber = event.target.value;
		this.setButtonDisable();
	  }
	

	  setButtonDisable = () => {
		  const { certifySelect } = this.state;
		const phoneEnable = this.phoneNumber.length === PHONE_DIGIT;
		const confirmEnable = this.confirmNumber.length === CONFIRM_DIGIT;
		const btnDisabled = !(phoneEnable && certifySelect);
		const certifyDisabled = !(phoneEnable && confirmEnable && certifySelect);
	
		this.setState({ btnDisabled, certifyDisabled }, () => {
		  const index = certifyDisabled ? 1 : 0;
	
		  this.getFm('confirmButton').setListInfo({
			firstIdx: index,
			focusIdx: index
		  });
		});
	  }
	  
  injectRef = (ref, i) => {
    this.inputRefs[i] = ref;
  }

	render() {
		const { btnDisabled, certifyDisabled, certifySelect, bSetLimitTimer, limitTime } = this.state;
		let seconds = Math.floor(limitTime % 60);
		const minutes = Math.floor(limitTime / 60);
		let convertLimitTime = convertSpaceToNum(minutes.toString(), 2) + ":" + convertSpaceToNum(seconds.toString(), 2);
		
		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="popWrap deliveryPhone">
					<div className="popTop">
						<div className="pageTitle">휴대폰 번호입력</div>
						<div className="subInfo">입력한 휴대폰 번호로 배송지 입력이 가능한 URL 정보를 전달해 드립니다.</div>
					</div>
					<fieldset>
						<div className="billCon">
						<div className="left">
								<p className="certifyTitle">개인정보 수집 및 제공, 활용 동의</p>
								<p className="certifySub">본 상품배송(또는 쿠폰발송)을 위한 연락처/주소 수집 및 제 3 자제공에 동의합니다.</p>
								<div id="certifyButton" className="allWrap">
									<div className="csFocus checkStyle loadFocus" select={certifySelect.toString()}>
										<span className="title">위 내용에 동의함</span>
									</div>
								</div>
							</div>
							<div className="right">
								<div className="inner">
									<div id="requestButton" className="gridWrap">
										<div id="inputPhoneNumber" className="tel">
											<p className="inputTitle">휴대폰 번호</p>
											<span className="gridStyle">
											<NumberInputV2 index="phoneNumber"
												id="phoneNumber"
												gridStyle=""
												maxLength={PHONE_DIGIT}
												injectRef={this.injectRef}
												onInputKeyDown={this.onPhoneNumberInputKeyDown}
												placeholder="숫자만 입력"
												htmlFor="phoneNumber"
												/>
										</span>
										</div>
										<span className='btnRequire' data-disabled={btnDisabled} >요청</span>
									</div>
								</div>
								<div id="inputConfirmNumber" className={certifyDisabled ? 'inner disabled valid' : 'inner valid'}>
									<p className="inputTitle">인증 번호</p>
									<span className="gridStyle valid">
										<NumberInputV2 index="confirmNumber"
											id="confirmNumber"
											gridStyle="valid"
											injectRef={this.injectRef}
											onInputKeyDown={this.onConfirmNumberInputKeyDown}
											placeholder="인증번호 입력"
											htmlFor="confirmNumber"
											/>
									</span>
									{bSetLimitTimer && <span className="validTime">{convertLimitTime}</span>}
								</div>
								<ConfirmButton certifyDisabled={certifyDisabled} />
							</div>
						</div>
					</fieldset>
					<div className="keyWrap"><span className="btnKeyPrev">취소</span></div>
				</div>
			</div>
		)
	}
}

class ConfirmButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}

	render() {
		const { certifyDisabled } = this.props;
		return (
			<div id="confirmButton" className="btnWrap">
				<span className='btnStyle csFocus' data-disabled={certifyDisabled} >완료</span>
			</div>
		);
		
	}
}

export default BillDeliveryPhone;