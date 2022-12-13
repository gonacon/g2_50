import React from 'react';
import moment from 'moment';

import PageView, { FOCUSING_TYPE } from 'Supporters/PageView';
import FM from 'Supporters/navi';
import Core from 'Supporters/core';
import { SCS, DIS } from 'Network';
import NumberInput from './NumberInput';

import 'Css/certification/PhoneCertification.css';
import '../../../assets/css/components/popup/PopupDefault.css';
import '../../../assets/css/components/popup/Popup.css';
import appConfig from 'Config/app-config';

const AgencyList = ["SKT", "SKM", "KT", "LG U+"];

class PhoneCertification extends PageView {
	constructor(props) {
		super(props);

		this.state = {
			userName: '',

			genderIdx: 0,
			focusedGenderIdx: 0,

			isSelectAgencyOn: false,
			selectedAgencyIdx: 0,

			isRequestButtonEnabled: false,

			isCertNumberInputEnabled: false,
			isCompleteButtonEnabled: false
		}

		// for API
		this.birth = '';
		this.phoneNumber = '';

		// 인풋 박스의 refs 들 ==> validation 및 버튼활성화 조건 체크용
		this.birthInput = null;
		this.phoneNumberInput = null;
		this.certNumberInput = null;

		const focusList = [
			{ key: 'gender', fm: null },
			{ key: 'birth', fm: null },
			{ key: 'telAgency', fm: null },
			{ key: 'telAgencySelect', fm: null, link: { 'UP': null, 'RIGHT': null, 'DOWN': null, 'LEFT': null } },  // 셀렉트 박스의 포커스 이동 막기
			{ key: 'inputPhoneNumber', fm: null },
			{ key: 'requestButton', fm: null },
			{ key: 'certificationNumber', fm: null },
			{ key: 'completeButton', fm: null },
			{ key: 'cancelButton', fm: null }
		];
		// 포커스 순서를 정의
		this.declareFocusList(focusList);

		// 페이지의 포커싱 방식을 CLOSEST 로 변경
		this.setFocusingType(FOCUSING_TYPE.CLOSEST);
	}

	registerFm = () => {
		// 모든 FM 생성
		const genderCheckBox = new FM({
			id: 'gender',
			containerSelector: '.optionWrap',
			focusSelector: '.csFocus',
			row: 1,
			col: 2,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 1,
			onFocusChild: this.onFocusChildGender,
			onFocusKeyDown: this.onFocusKeyDownGender
		});

		const birthInput = new FM({
			id: 'birth',
			type: 'ELEMENT',
			containerSelector: '.birth',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusContainer: this.onFocusBirthInput,
			onBlurContainer: this.onBlurBirthInput,
			onFocusChild: this.onFocusChildBirthInput,
			onFocusKeyDown: this.onFocusKeyDownBirthInput
		});

		const telAgency = new FM({
			id: 'telAgency',
			type: 'ELEMENT',
			containerSelector: '.selectWrap',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusChild: this.onFocusChildTelAgency,
			onFocusKeyDown: this.onFocusKeyDownTelAgency
		});

		const telAgencySelect = new FM({
			id: 'telAgencySelect',
			containerSelector: '.selectList',
			focusSelector: '.radioStyle',
			row: AgencyList.length,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: AgencyList.length - 1,
			onFocusKeyDown: this.onFocusKeyDownAgencySelect
		});

		const phoneNumberInput = new FM({
			id: 'inputPhoneNumber',
			type: 'ELEMENT',
			containerSelector: '.gridStyle',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusContainer: this.onFocusPhoneNumberInput,
			onBlurContainer: this.onBlurPhoneNumberInput,
			onFocusKeyDown: this.onFocusKeyDownPhoneNumberInput
		});

		const requestButton = new FM({
			id: 'requestButton',
			type: 'ELEMENT',
			containerSelector: '.btnRequire',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onFocusKeyDownRequestButton
		});

		const certificationNumber = new FM({
			id: 'certificationNumber',
			type: 'ELEMENT',
			containerSelector: '',
			focusSelector: '',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusContainer: this.onFocusCertificationNumberInput,
			onBlurContainer: this.onBlurCertificationNumberInput,
			onFocusKeyDown: this.onFocusKeyDownCertificationNumberInput,
		});

		const completeButton = new FM({
			id: 'completeButton',
			type: 'ELEMENT',
			containerSelector: '.btnStyle',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onFocusKeyDownCompleteButton
		});

		const cancelButton = new FM({
			id: 'cancelButton',
			type: 'ELEMENT',
			containerSelector: '.btnStyle',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onFocusKeyDownCancelButton
		});

		// FM 등록
		this.setFm('gender', genderCheckBox);
		this.setFm('birth', birthInput);
		this.setFm('telAgency', telAgency);
		this.setFm('inputPhoneNumber', phoneNumberInput);
		this.setFm('requestButton', requestButton);
		this.setFm('certificationNumber', certificationNumber);
		this.setFm('completeButton', completeButton);
		this.setFm('cancelButton', cancelButton);
		this.setFm('telAgencySelect', telAgencySelect)

		this.setFocus(0);

		// 최초 진입시 조건이 충족되지 않은 버튼들 비활성화
		this.setFocusEnable('requestButton', false);
		this.setFocusEnable('completeButton', false);
		this.setFocusEnable('certificationNumber', false);
		this.setFocusEnable('telAgencySelect', false);
	}

	onFocusKeyDownGender = (event, idx) => {
		if (event.keyCode === 13) {
			this.setState({
				genderIdx: idx
			})
		}
	}

	onFocusChildGender = (idx) => {
		this.setState({ focusedGenderIdx: idx });
	}

	onFocusBirthInput = () => {
		if (this.birthInput) {
			this.birthInput.focus();
			setTimeout(() => {
				this.birthInput.selectionStart = this.birthInput.value.length;
				this.birthInput.selectionEnd = this.birthInput.value.length;
			}, 1);
		}
	}

	onBlurBirthInput = () => {
		if (this.birthInput) {
			this.birthInput.blur();
		}

		const birthText = this.birthInput.value;
		const expr = /^[0-9]{8,8}/;
		if (!expr.test(birthText)) {
			Core.inst().showToast('알림', '생년월일 8자리를 입력해 주세요', 2000);
		}
	}

	// input.onKeyDown
	onBirthInputKeyDown = (evt, value) => {
		this.birth = value;
		this.checkValueToEnableButton();
	}

	// focus.onKeyDown
	onFocusKeyDownBirthInput = (evt) => {
		const target = this.birthInput;
		const length = target.value.length;
		const selection = target.selectionStart;
		if (length > 0 && (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft')) {
			if (length === selection && evt.key === 'ArrowRight') return false;
			if (selection === 0 && evt.key === 'ArrowLeft') return false;
			return true;
		}
	}

	// phoneInput :: focus.onFocus
	onFocusPhoneNumberInput = () => {
		if (this.phoneNumberInput) {
			this.phoneNumberInput.focus();
			setTimeout(() => {
				this.phoneNumberInput.selectionStart = this.phoneNumberInput.value.length;
				this.phoneNumberInput.selectionEnd = this.phoneNumberInput.value.length;
			}, 1);
		}
	}

	onBlurPhoneNumberInput = () => {
		if (this.phoneNumberInput) {
			this.phoneNumberInput.blur();
		}

		if (!/^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/.test(this.phoneNumberInput.value)) {
			Core.inst().showToast('알림', '올바른 휴대폰 번호를 입력해 주세요', 2000);
		}
	}

	// phoneInput :: input.onKeyDown
	onPhoneNumberInputKeyDown = (evt, value) => {
		this.phoneNumber = value;
		this.checkValueToEnableButton();
	}

	// phoneInput :: focus.onKeyDown
	onFocusKeyDownPhoneNumberInput = (evt) => {
		const target = this.phoneNumberInput;
		const length = target.value.length;
		const selection = target.selectionStart;
		if (length > 0 && (evt.key === 'ArrowRight' || evt.key === 'ArrowLeft')) {
			if (length === selection && evt.key === 'ArrowRight') return false;
			if (selection === 0 && evt.key === 'ArrowLeft') return false;
			return true;
		}
	}

	onCertNumberInputKeyDown = (evt, value) => {
		this.certNumber = value;
		this.checkValueToEnableButton();
	}

	onFocusKeyDownTelAgency = (evt) => {
		if (evt.keyCode === 13) {
			const { isSelectAgencyOn } = this.state;
			const isOpen = !isSelectAgencyOn;
			if (isOpen) {

				this.showSelectAgency();
			} else {
				this.hideSelectAgency();
			}
		}
	}

	onFocusKeyDownAgencySelect = (evt, childIdx) => {
		if (evt.keyCode === 13) {
			this.hideSelectAgency();
			this.setState({
				selectedAgencyIdx: childIdx
			})
			this.setFocus('telAgency');

			this.checkValueToEnableButton();
		}
	}

	onFocusKeyDownRequestButton = (evt, childIdx) => {
		if (evt.keyCode === 13) {
			this.setFocusEnable('certificationNumber', true);
			this.setState({ isCertNumberInputEnabled: true });
		}
	}

	onCertNumberInputKeyDown = (evt, value) => {
		this.checkValueToEnableButton();
	}

	onFocusCertificationNumberInput = () => {
		this.certNumberInput.focus();
	}

	onBlurCertificationNumberInput = () => {
		this.certNumberInput.blur();
	}

	showSelectAgency = () => {
		this.setState({
			isSelectAgencyOn: true
		}, () => {
			setTimeout(() => {
				this.setFocusEnable('telAgencySelect', true);
				this.setFocus('telAgencySelect');
			}, 1)
		});

	}

	hideSelectAgency = () => {
		this.setState({
			isSelectAgencyOn: false
		}, () => {
			setTimeout(() => {
				this.setFocusEnable('telAgencySelect', false);
			}, 1)
		});
	}

	checkValueToEnableButton = () => {
		const birth = this.birthInput.value;
		const phoneNumber = this.phoneNumberInput.value;

		const isRequestButtonEnabled = /^[0-9]{8,8}/.test(birth) && /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/.test(phoneNumber);
		this.setState({ isRequestButtonEnabled });
		this.setFocusEnable('requestButton', isRequestButtonEnabled);

		const certNumber = this.certNumberInput.value;
		const isCompleteButtonEnabled = /^[0-9]{4,4}/.test(certNumber);
		this.setState({ isCompleteButtonEnabled });
		this.setFocusEnable('completeButton', isCompleteButtonEnabled);
	}

	updateName = (responseData) => {
		let name = responseData.username
		let maskingName = '';
		if (name.length === 1) {
			maskingName = name.slice(0, 1) + '*'
		} else {
			maskingName = name.slice(0, 2) + '*'
		}
		this.setState({
			userName: maskingName
		})
	}

	initValue = () => {
		this.birth = '';
		this.phoneNumber = '';
	}

	componentWillMount() {
		//API test
		const regnumber = '100601039501'
		const license = '070718'
		const req_date = moment().format('YYYYMMDDHHMM')
		const param_001 = {
			regnumber: regnumber,
			license: license,
			req_date: req_date
		}

		SCS.requestSTB001(param_001).then((response) => {
			this.updateName(response)
		})
	}

	componentWillReceiveProps(nextProps) {
		const { showMenu } = nextProps;
		if (typeof showMenu === 'function') {
			showMenu(false);
		}
	}

	componentDidMount() {
		const { showMenu } = this.props;
		if (typeof showMenu === 'function') {
			showMenu(false);
		}

		this.initValue();
		this.registerFm();
	}

	requestCertification = () => {
		let param = {
			phoneNumber: '01011112222',
		}
		const result = DIS.requestSTB001(param);
		console.log('request result:', result)
	}

	render() {
		const {
			genderIdx,
			focusedGenderIdx,
			isSelectAgencyOn,
			selectedAgencyIdx,
			isRequestButtonEnabled,
			isCertNumberInputEnabled,
			isCompleteButtonEnabled
		} = this.state;

		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="phoneCertificationWrap">
					<div className="contsArea">
						<div className="titleArea">
							<p className="title">인증번호 초기화</p>
							<p className="subTitle">휴대폰 본인인증 후 인증번호 초기화를 진행합니다.</p>
						</div>
						<div className="inputArea">
							<div className="nameWrap">
								<p className="title">B tv 가입 명의자</p>
								<p className="userName">{this.state.userName} 님</p>
							</div>
							<div className="inputCon">
								<div className="gridWrap">
									<div className="gender" id="gender">
										<p className="inputTitle" >성별</p>
										<div className="optionWrap">
											<span>
												<div className={`csFocus radioStyle${genderIdx === 0 ? ' select' : ''}${focusedGenderIdx === 0 ? ' focusOn' : ''}`}>남성</div>
											</span>
											<span>
												<div className={`csFocus radioStyle${genderIdx === 1 ? ' select' : ''}${focusedGenderIdx === 1 ? ' focusOn' : ''}`}>여성</div>
											</span>
										</div>
									</div>
									<div className="birth" id="birth">
										<p className="inputTitle">생년월일</p>
										<span className="gridStyle birth" >
											<NumberInput
												id="birthNumber"
												innerRef={r => this.birthInput = r}
												className="inputText csFocus"
												maxLength={8}
												placeholder="예)19921010"
												onKeyDown={this.onBirthInputKeyDown}
											/>
											<label htmlFor="birthNumber"></label>
										</span>
									</div>
								</div>
								<div className="gridWrap">
									<div className="agency" id="telAgency">
										<p className="inputTitle">통신사</p>
										<div className={`selectWrap${isSelectAgencyOn ? ' active' : ''}`}>
											<div className="selectStyle" >
												<div className="csFocus selectBtn" tabIndex="-1">{AgencyList[selectedAgencyIdx]}</div>
												<ul id="telAgencySelect" className="selectList">
													{
														AgencyList.map((data, i) => {
															return (
																<li key={i}><div tabIndex="-1" className="radioStyle">{data}</div></li>
															)
														})
													}
												</ul>
											</div>
										</div>
									</div>
									<div className="tel" id="inputPhoneNumber">
										<p className="inputTitle">휴대폰 번호</p>
										<span className="gridStyle" >
											<NumberInput
												innerRef={r => this.phoneNumberInput = r}
												className="inputText csFocus"
												maxLength={11}
												placeholder="숫자만 입력"
												onKeyDown={this.onPhoneNumberInputKeyDown}
											/>
											<label htmlFor="phoneNumber"></label>
										</span>
									</div>
									<span id="requestButton" >
										<span className="csFocus btnRequire" data-disabled={isRequestButtonEnabled ? "false" : "true"}>요청</span>
									</span>
								</div>
								<div className={`inner valid${isCertNumberInputEnabled ? '' : ' disable'}`} >
									<p className="inputTitle">인증 번호</p>
									<span className="gridStyle" id="certificationNumber">
										<NumberInput
											innerRef={r => this.certNumberInput = r}
											className="inputText csFocus"
											maxLength={4}
											placeholder="인증번호 입력"
											onKeyDown={this.onCertNumberInputKeyDown}
										/>
										<label htmlFor="certificationNumber"></label>
									</span>
								</div>
								<div className="btnWrap">
									<span>
										<span id="completeButton" className="csFocus btnStyle certificationEnd" data-disabled={!isCompleteButtonEnabled} >
											<span>인증완료</span>
										</span>
										<span id="cancelButton" className="csFocus btnStyle">취소</span>
									</span>
								</div>
							</div>
						</div >
					</div>
				</div>
			</div>
		)
	}
}

export default PhoneCertification;

