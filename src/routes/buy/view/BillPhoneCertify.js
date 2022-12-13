import {React } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BillPhoneCertify.css';
import keyCodes from '../../../supporters/keyCodes';
import constants from '../../../config/constants';
import { EPS } from '../../../supporters/network';
import PopupPageView from '../../../supporters/PopupPageView';
import FM from '../../../supporters/navi';
import appConfig from './../../../config/app-config';
import Core from './../../../supporters/core';
import PopupConfirm from '../../../components/popup/PopupConfirm';
import { CTSInfo } from './../../../supporters/CTSInfo';
import StbInterface from '../../../supporters/stbInterface';

import NumberInputV2 from 'Module/NumberInputV2';
import { cryptoUtil } from '../../../utils/cryptoUtil';
import { deepCopy, convertSpaceToNum } from '../../../utils/utils';
import { cloneDeep } from 'lodash';

const { Keymap: { BACK_SPACE, PC_BACK_SPACE, UP, DOWN, LEFT, RIGHT, ENTER } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;
const LIST_TEL_AGENCY =  ["SKT", "KT", "LG U+"];
const BIRTHDAY_DIGIT = 7;
const PHONE_DIGIT = 11;
const CONFIRM_DIGIT = 6;
const LIMIT_CERTIFY_TIME = 5 * 60;	// 5분(단위 sec)

/** data= {
	mode,
	PID,
	V_PRICE
}
*/
class BillPhoneCertify extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'genderButton', fm: null, link : {'RIGHT': 'inputBirthday', 'DOWN' : 'inputPhoneNumber'}},
			{ key: 'inputBirthday', fm: null, link : {'LEFT': 'genderButton', 'DOWN' : 'inputPhoneNumber'}},
			{ key: 'telAgencyButton', fm: null, link : {'RIGHT': 'inputPhoneNumber', 'UP': 'inputBirthday', 'DOWN' : 'inputPhoneNumber'}},
			{ key: 'telAgencyList', fm: null},
			{ key: 'inputPhoneNumber', fm: null, link : {'LEFT': 'telAgencyButton', 'UP': 'inputBirthday', 'DOWN' : 'inputConfirmNumber', 'RIGHT': 'requestButton'}},
			{ key: 'requestButton', fm: null, link : {'LEFT': 'inputPhoneNumber', 'UP': 'inputBirthday', 'DOWN' : 'inputConfirmNumber'}},
			{ key: 'inputConfirmNumber', fm: null, link: {'UP': 'inputPhoneNumber', 'DOWN' : 'confirmButton'}},
			{ key: 'confirmButton', fm: null, link: {'UP': 'inputConfirmNumber'}},
		];
		
		this.declareFocusList(focusList);

		this.state = {
			mode: this.paramData.data.mode,
			ptype: constants.PRD_TYP_CD.PPS,
			data: this.paramData.data,
			DATA_API: this.paramData.DATA_API,
			telDisabled : true,
			btnDisabled : true,
			modeTelAgency: false,
			selectedTelAgency: 0,
			focusIdxTelAgency: 0,
			selectedGender : 0,	// 0: male, 1: female
			bSetLimitTimer: false,			//인증번호 제한시간
			limitTime: LIMIT_CERTIFY_TIME	//인증 제한시간 5분
		};
		// 휴대폰 인증번호 요청 후 telDisabled false로 변경해주세요.

		this.inputRefs = {};
		this.birthday = '';
		this.phoneNumber = '';
		this.confirmNumber = '';
	}
	
	componentWillMount() {
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: false
		});
	}

	componentDidMount() {
		this.setFocusManager();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: true
		});

		this.state.bSetLimitTimer = false;
		clearInterval(this.timer);
	}
	
	setFocusManager = () => {
		const inputBirthdayFm = new FM({
			id : 'inputBirthday',
			type: 'ELEMENT',
			containerSelector: '.birth',
			moveSelector: '',
			focusSelector : '.csFocusInput',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusContainer: this.onFocusInputBirthday,
			onBlurContainer: this.onBlurInputBirthday,
			onFocusKeyDown: this.onFocusKeyDownInputBirthday
		});

		const telAgencyButtonFm = new FM({
			id : 'telAgency',
			type: 'ELEMENT',
			containerSelector: '.selectStyle',
			moveSelector: '',
			focusSelector : '.selectBtn',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusKeyDown: this.onFocusKeyDownTelAgencyButton
		});

		const telAgencyListFm = new FM({
			id : 'telAgency',
			containerSelector: '.selectList',
			moveSelector: '',
			focusSelector : '.radioStyle',
			row : 3,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 2,
			onFocusKeyDown: this.onFocusKeyDownTelAgencyList
		});

		const inputPhoneNumberFm = new FM({
			id : 'inputPhoneNumber',
			type: 'ELEMENT',
			moveSelector: 'span',
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
			containerSelector: '.gridStyle',
			focusSelector : '.csFocusInput',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusContainer: this.onFocusContainer,
			onFocusChild: this.onFocusInputConfirmNumber,
			onBlurContainer: this.onBlurInputConfirmNumber,
			onFocusKeyDown: this.onFocusKeyDownInputConfirmNumber
		});
		
		const confirmButtonFm = new FM({
			id : 'confirmButton',
			containerSelector: '.btnWrap',
			moveSelector: '',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 1,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onFocusKeyDownConfirmButton
		});

		this.setFm('inputBirthday', inputBirthdayFm );
		this.setFm('telAgencyButton', telAgencyButtonFm );
		this.setFm('telAgencyList', telAgencyListFm );
		this.setFm('inputPhoneNumber', inputPhoneNumberFm );
		this.setFm('requestButton', requestButtonFm );
		this.setFm('inputConfirmNumber', inputConfirmNumberFm );
		this.setFm('confirmButton', confirmButtonFm );

		this.setFocus(0, 0);
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
		const { telDisabled } = this.state;
		if (telDisabled && data.id === 'inputPhoneNumber' && data.direction === "RIGHT") {
			return true;
		} else {
			super.onFocusMoveUnavailable(data);
		}
	}

	onFocusKeyDownGenderButton = (idx) => {
		this.state.selectedGender = idx;
		this.setFocus('genderButton', idx);
	}

	onFocusKeyDownTelAgencyButton = (evt, idx) => {
		switch(evt.keyCode) {
			case ENTER:
				this.setState({modeTelAgency: true});
				this.setFocus(3);
				break;
			case RIGHT:
				this.setFocus(4);
				break;
			case DOWN:
				this.setFocus(6);
				break;
			default:
				break;
		}
	}

	onFocusKeyDownTelAgencyList = (evt, idx) => {
		if (evt.keyCode === ENTER) {
			this.setState({modeTelAgency: false, selectedTelAgency: idx});
			this.setFocus(2);
		}
	}
	
  onFocusKeyDownInputBirthday = (event) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs.birthday;
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

	onFocusContainer = (dir) => {
		StbInterface.keyInfo({
			numKeyUse: false
		});
	}
	onBlurContainer = (dir) => {
		StbInterface.keyInfo({
			numKeyUse: true
		});
	}
	
  onFocusInputBirthday = () => {
    this.onFocusContainer();

    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs.birthday.focus();
    }, 10);
  }

  onBlurInputBirthday = () => {
    this.onBlurContainer();

    this.inputRefs.birthday.blur();
  }

  onFocusInputPhoneNumber = (idx) => {
    this.onFocusContainer();

    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs.phoneNumber.focus();
    }, 10);
  }

  onBlurInputPhoneNumber = () => {
    this.onBlurContainer();

    this.inputRefs.phoneNumber.blur();
  }

  onFocusInputConfirmNumber = (idx) => {
    //this.onFocusContainer();

    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs.confirmNumber.focus();
    }, 10);
  }

  onBlurInputConfirmNumber = (idx) => {
    this.onBlurContainer();

    this.inputRefs.confirmNumber.blur();
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

	onFocusKeyDownRequestButton = (evt, idx) => {
		if (evt.keyCode === ENTER) {
			const { data, selectedTelAgency, selectedGender } = this.state;

			const intGender = Number(this.birthday.substring(this.birthday.length - 1, this.birthday.length));
			const intPhoneNumber = this.phoneNumber.substring(0, 3);
			if (selectedGender === 0 && !(intGender === 1 || intGender === 3)) {
				Core.inst().showToast('성별 정보가 맞지 않습니다.\n입력하신 정보를 다시 확인해 주세요.');
				return;
			} else if (selectedGender === 1 && !(intGender === 2 || intGender === 4)) {
				Core.inst().showToast('성별 정보가 맞지 않습니다.\n입력하신 정보를 다시 확인해 주세요.');
				return;
			} else if (intPhoneNumber !== '010') {
				Core.inst().showToast('형식에 맞는 휴대폰 번호가 아닙니다.');
				return;
			}


			let corpCode;
			switch(LIST_TEL_AGENCY[selectedTelAgency]) {
				case 'SKT':
					corpCode = 'SKT';
				break;
				case 'KT':
					corpCode = 'KTF';
				break;
				case 'LG U+':
					corpCode = 'LGU';
				break;
				default:
				break;
			}
			// 통신사 타입
			// - SKT
			// - KTF
			// - LGU
			const param = {
				transactionId: "AAA",
				productId: data.PID,
				phoneData: {
					corpCode: corpCode,					// 통신사 타입(SKT,KTF,LGU)
					registNumber: this.birthday,	//주민번호 앞자리
					phoneNumber: this.phoneNumber,	//핸드폰 번호 (숫자형식만 허용)
					amount: data.V_PRICE // 구매금액(부가세포함)
				}
			}
			EPS.request105(param)
				.then(data => {
					console.log('data: ', data);
					if (data.result === '0000') {
						Core.inst().showToast('인증번호를 문자로 보냈습니다.');

						this.state.limitTime = LIMIT_CERTIFY_TIME;
						clearInterval(this.timer);
						this.state.bSetLimitTimer = true;
						this.timer = setInterval(this.tick, 1000);

						let decryptedData;
						if (appConfig.runDevice) {
							const decrypt = { target: 'eps', cryptType: 'decrypt', text: data.phoneData, dateTime: data.responseDateTime };
							decryptedData = StbInterface.requestEncryptData(decrypt);
						} else {
							decryptedData = cryptoUtil.decryptedAESByKeyEPS(data.responseDateTime, data.phoneData);
						}
						data.phoneData = JSON.parse(decryptedData);
						this.setState({ telDisabled: false, certifyData: data });
					} else {
						Core.inst().showToast('명의자 정보가 유효하지 않습니다.\n확인 후 다시 요청해 주세요.');
					}
				});
		}
	}

  onFocusKeyDownInputConfirmNumber = (event) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs.confirmNumber;
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

	onFocusKeyDownConfirmButton = (evt, idx) => {
		const {btnDisabled} = this.state;
		if (btnDisabled && idx === 1 && evt.keyCode === keyCodes.Keymap.LEFT) {
			return true;
		} else if (evt.keyCode === ENTER) {
			if (idx === 0) {
				const { data, DATA_API, selectedTelAgency, certifyData } = this.state;
				
				let corpCode;
				switch(LIST_TEL_AGENCY[selectedTelAgency]) {
					case 'SKT':
						corpCode = 'SKT';
					break;
					case 'KT':
						corpCode = 'KTF';
					break;
					case 'LG U+':
						corpCode = 'LGU';
					break;
					default:
					break;
				}
				if (this.state.ptype === constants.PRD_TYP_CD.PPS || this.state.ptype === constants.PRD_TYP_CD.PPV
					|| this.state.ptype === constants.PRD_TYP_CD.PPP) {
			// 		// 단건 (PPS, PPV, PPP) 구매시 EPS-111번 호출
					let discount = {};
					// 휴대폰 결제이므로
					discount.useCoupon = false;
					discount.useTmembership = false;
					discount.useOcb = false;
					discount.useTvpoint = false;
					discount.useBpoint = false;
					discount.useTvpay = false;
					discount.usePhone = true;
					discount.phoneData = {
						corpCode: corpCode,
						registNumber: this.birthday,
						phoneNumber: this.phoneNumber,
						amount: data.V_PRICE,
						corpTypeCode: certifyData.phoneData.corpTypeCode,
						authKey1: certifyData.phoneData.authKey1,//'1',
						authKey2: certifyData.phoneData.authKey2,
						authKey3: certifyData.phoneData.authKey3,
						authNumber: this.confirmNumber,
					};
					discount.totalPrice = data.V_PRICE;
					CTSInfo.requestPurchaseEPS111({ mode: data.mode, data: DATA_API, discountInfo: discount });
				} else {
					let discount = {};
					// 휴대폰 결제이므로
					discount.useCoupon = false;
					discount.useTmembership = false;
					discount.useOcb = false;
					discount.useTvpoint = false;
					discount.useBpoint = false;
					discount.useTvpay = false;
					discount.usePhone = true;
					discount.phoneData = {
						corpCode: corpCode,
						registNumber: this.birthday,
						phoneNumber: this.phoneNumber,
						amount: data.V_PRICE,
						corpTypeCode: certifyData.phoneData.corpTypeCode,
						authKey1: certifyData.phoneData.authKey1,
						authKey2: certifyData.phoneData.authKey2,
						authKey3: certifyData.phoneData.authKey3,
						authNumber: this.confirmNumber
					};
					discount.totalPrice = data.V_PRICE;
					if (data.mode === CTSInfo.MODE_PPM_HOME) {
						// 홈 월정액인 경우, SCS-006 사용
						const paramData = {
							mode: data.mode,
							data: DATA_API,
							paymethod: '10',
							discountInfo: discount
						}
						CTSInfo.requestPurchaseHomePPM(paramData);
					} else {
						CTSInfo.requestPurchaseEPS112({data: DATA_API, paymethod: '10', discountInfo: discount});
					}
				}
			} else {
				// 구매 취소
				const param = {
					title: '구매 취소 확인',
					desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
					btns:["확인","취소"]
				}
				Core.inst().showPopup(<PopupConfirm />, param, (info) => {
					if (info.result) {
						CTSInfo.requestPurchaseAllCancel();
					}
				});
			}
		}
	}
	
  onBirthdayInputKeyDown = (event) => {
    this.birthday = event.target.value;
    this.setButtonDisable();
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
    const birthEnable = this.birthday.length === BIRTHDAY_DIGIT;
    const phoneEnable = this.phoneNumber.length === PHONE_DIGIT;
    const confirmEnable = this.confirmNumber.length === CONFIRM_DIGIT;
	const telDisabled = !phoneEnable;
    const btnDisabled = !(birthEnable && phoneEnable && confirmEnable);

    this.setState({ telDisabled, btnDisabled }, () => {
      const index = btnDisabled ? 1 : 0;

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
		const { telDisabled, bSetLimitTimer, limitTime, btnDisabled, modeTelAgency, 
			selectedGender, selectedTelAgency } = this.state;

		let seconds = Math.floor(limitTime % 60);
		const minutes = Math.floor(limitTime / 60);
		let convertLimitTime = convertSpaceToNum(minutes.toString(), 2) + ":" + convertSpaceToNum(seconds.toString(), 2);
		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="popWrap phoneCertify">
					<div className="popTop">
						<div className="pageTitle">휴대폰 본인인증</div>
					</div>
					<div className="billCon">
						<div className="gridWrap">
							<GenderButton selectedGender={selectedGender} setFm={this.setFm} onFocusKeyDownGenderButton={this.onFocusKeyDownGenderButton} />
							<div id="inputBirthday" className="birth">
								<p className="inputTitle">생년월일+주민번호 뒷 1자리</p>
								<NumberInputV2 index="birthday"
									id="birthday"
									gridStyle="birth"
									maxLength={BIRTHDAY_DIGIT}
									injectRef={this.injectRef}
									onInputKeyDown={this.onBirthdayInputKeyDown}
									placeholder="예)921010-1"
									htmlFor="birthday"
									/>
						</div>
					</div>
				<div id="requestButton" className="gridWrap">
					<TelAgencyButton modeTelAgency={modeTelAgency} selectedTelAgency={selectedTelAgency} />
             	<div id="inputPhoneNumber" className="tel">
					<p className="inputTitle">휴대폰 번호</p>
					<NumberInputV2 index="phoneNumber"
						id="phoneNumber"
						gridStyle=""
						maxLength={PHONE_DIGIT}
						injectRef={this.injectRef}
						onInputKeyDown={this.onPhoneNumberInputKeyDown}
						placeholder="숫자만 입력"
						htmlFor="phoneNumber"
					/>
				</div>
				<span data-line="2" type="button" className="btnRequire" data-type="btnRequest" data-disabled={telDisabled} >요청</span>
				</div>
            <div id="inputConfirmNumber" className={telDisabled ? 'inner valid disabled' : 'inner valid'}>
              <p className="inputTitle">인증 번호</p>
              <NumberInputV2 index="confirmNumber"
                id="validateNumber"
                gridStyle="valid"
                maxLength={CONFIRM_DIGIT}
                injectRef={this.injectRef}
                onInputKeyDown={this.onConfirmNumberInputKeyDown}
                placeholder="인증번호 입력"
								htmlFor="validateNumber"
              />
						{bSetLimitTimer && <span className="validTime">{convertLimitTime}</span>}
			      </div>
						<ConfirmButton btnDisabled={btnDisabled}/>
					</div>
					<div className="keyWrap"><span className="btnKeyPrev">이전</span></div>
				</div>
			</div>
		)
	}
}
              //<InputBirthday birthday={birthday} injectRef={this.injectRef} />
              //<InputPhoneNumber phoneNumber={phoneNumber} injectRef={this.injectRef} />
            //<InputConfirmNumber telDisabled={telDisabled} confirmNumber={confirmNumber} injectRef={this.injectRef} />

class GenderButton extends React.Component {
	constructor(props) {
		super(props);
		const { selectedGender } = this.props;
		this.state = {
			selectedGender: selectedGender
		}
	}
	
	componentDidMount = () => {
		const { setFm } = this.props;
		const genderButtonFm = new FM({
			id : 'genderButton',
			containerSelector: '.gender',
			moveSelector: '',
			focusSelector : '.radioStyle',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onFocusKeyDown
		});
		setFm('genderButton', genderButtonFm );
  }

	onFocusKeyDown = (evt, idx) => {
		if (evt.keyCode === ENTER) {
			this.setState({selectedGender: idx});
			this.props.onFocusKeyDownGenderButton(idx);
		}
	}
	render() {
		const { selectedGender } = this.state;

		return (
			<div id="genderButton" className="gender">
				<p className="inputTitle">성별</p>
				<div className="optionWrap">
					<div className={selectedGender === 0 ? "csFocus radioStyle select" : "csFocus radioStyle"} 
					data-line="1" data-type="male" >남성</div>
					<div className={selectedGender === 1 ? "csFocus radioStyle select" : "csFocus radioStyle"} 
					data-line="1" data-type="female">여성</div>
				</div>
			</div>
		);
	}
}

class TelAgencyButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}
	
	render() {
		const { modeTelAgency, selectedTelAgency } = this.props;

		const classSelectWrap = modeTelAgency ? 'selectWrap active' : 'selectWrap';
		return (
			<div className="agency">
				<p className="inputTitle">통신사</p>
				<div className={classSelectWrap}>
					{/* <select name="">
						<option value="SKT">SKT</option>
						<option value="KT">KT</option>
						<option value="LGU+">LGU+</option>
					</select> */}
					<div id="telAgency" className="selectStyle">
						<div data-line="2" data-type="selectTelAgency" className="csFocus selectBtn" >{LIST_TEL_AGENCY[selectedTelAgency]}</div>
						<ul id='telAgencyList' className="selectList">
							{
								LIST_TEL_AGENCY.map((data, i) => {
									const classList = selectedTelAgency === i ? 'radioStyle select' : 'radioStyle';
									return(
										<li className="listTelAgency" key={i} ><div index={i} tabIndex="-1" className={classList}>{data}</div></li>
									)
								})
							}
						</ul>
					</div>
				</div>
			</div>
		);
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
		const { btnDisabled } = this.props;
		return (
			<div id="confirmButton" className="btnWrap">
				<span data-line="4" className="btnStyle csFocus" data-type="btnBill"
					data-disabled={btnDisabled} >
					<span>완료</span>
				</span>
				<span data-line="4" className="csFocus btnStyle">취소</span>
			</div>
		);
	}
}

export default BillPhoneCertify;