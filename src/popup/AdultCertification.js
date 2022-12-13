import { React } from '../utils/common';
import '../assets/css/routes/certification/JuvenileProtection.css';
import constants, { CERT_TYPE } from '../config/constants';
import PopupPageView from '../supporters/PopupPageView.js'
import { fm } from '../supporters/navigator'
import { SCS } from '../supporters/network';
// import Core from '../supporters/core';
import keyCodes from '../supporters/keyCodes';
import StbInterface from '../supporters/stbInterface';
import { MENU_ID, MENU_NAVI } from '../config/constants';
import appConfig from '../config/app-config';

const SUCCESS_CODE = '0000'
// const INVALID_REQUEST_CODE = '0108'
const server = appConfig.headEnd.PPM.Live;
const CERTIFICATION_INITIAL_URL = server.protocol + '://' + server.ip + ':' + server.port + server.path;
//  'http://1.255.231.162:8080/Test/constant/UI5/pw_reset/reset_main.jsp';
// const CERT_TYPE = {
// 	PROTECTION: 'PROTECTION',
// 	KIDS_ZONE: 'KIDS_ZONE',
// 	CHILD_SAFETY: 'CHILD_SAFETY',
// 	CERT_NUMBER: 'CERT_NUMBER',
// 	AGE_LIMIT: 'AGE_LIMIT',
// 	ADULT_SELECT : 'ADULT_SELECT',
// 	ADULT_PLAYPURCHASE : 'ADULT_PLAYPURCHASE',
// 	WATCH_LIMIT : 'WATCH_LIMIT',
// 	PURCHASE : 'PURCHASE'
// }

const Protection = () => (
	<div className="titleWrap">
		<p className="title juvenile">청소년 보호</p>
	</div>
);

const KidsZone = () => (
	<div className="titleWrap">
		<p className="title juvenile">접근제한</p>
		<p className="mesSetting">
			B tv 키즈 설정을 변경하려면 성인 인증번호 4자리를 입력해 주세요.<br />
			(B tv 키즈 잠금 설정 / 우리 아이 프로필 / 시청 가이드 캐릭터 / 알림 시간 설정 / 시력 보호 설정)
	</p>
	</div>
);

const ChildSafety = () => (
	<div className="titleWrap">
		<p className="title juvenile">접근제한</p>
		<p className="mesSetting">
			자녀 안심 설정을 변경하려면 성인 인증번호 4자리를 입력해 주세요.<br />
			(시청 연령 제한 / 시청 습관 관리 / 성인 메뉴 표시)
		</p>
	</div>
);


const AgeLimit = ({ className, stbAge, contentAge }) => (
	<div className="titleWrap">
		<p className={className}>{contentAge}세 이상 시청 가능</p>
		<p className="mesSetting">시청 연령 제한이 {stbAge}세로 설정되어 있습니다.<br />본 컨텐츠는 {contentAge}세 이상 시청할 수 있으며 성인인증이 필요합니다.</p>
	</div>
)

const CertNumber = () => (
	<div className="titleWrap">
		<p className="title juvenile">접근제한</p>
		<p className="mesSetting">인증번호 설정을 변경하시려면 성인 인증번호 4자리를 입력해주세요.<br />
			(성인 인증번호 / 시청 제한 인증번호 / 구매 인증번호)</p>
	</div>
)

const AdultSelect = () => (
	<div className="titleWrap">
		<p className="title juvenile">접근 제한</p>
		<p className="mesSetting">청소년 유해 매체물로 접근을 제한합니다.</p>
	</div>
)

const AdultPlayPurchase = () => (
	<div className="titleWrap">
		<p className="title age19">19세 성인 인증</p>
		<p className="mesSetting">본 콘텐츠는 청소년 유해 매체물로 '정보 통신망 이용 촉진 및 정보 보호 등에 관한 법률'과<br />'청소년 보호법'에 따라 19세 미만 청소년은 이용할 수 없습니다.</p>
	</div>
)

const WatchLimit = () => (
	<div className="titleWrap">
		<p className="title child">자녀 시청 제한</p>
		<p className="mesSetting">시청 습관 관리 설정으로 B tv 시청이 제한됩니다.<br />계속 이용하려면 시청 제한 인증번호 4자리를 입력해 주세요.</p>
	</div>
)

const Purchase = () => (
	<div className="titleWrap">
		<p className="title2">구매인증</p>
		<p className="mesSetting">구매 인증번호 4자리를 입력해주세요.</p>
	</div>
)

//성인인증 호출 방법
// ex )
// let param = {
// 	certification_type: constants.CERT_TYPE.CHILD_SAFETY,
// 	age_type : '' //rating(ex ) 7, 12, 15, 19, 나이제한 이외에는 '' 처리로 셋팅)
// }
// Core.inst().showPopup(<AdultCertification />, param, this.purchaseCallBack);

//PROTECTION(청소년보호) [마이 B tv > 자녀안심 설정] 내 성인메뉴 표시 설정이 ‘청소년 보호’로 설정되어 있는 경우, 19영화, 19플러스 관련 메뉴 선택 시 해당 화면 제공
//param = {certification_type: constants.CERT_TYPE.PROTECTION, age_type : ''}

//CHILD_SAFETY(자녀안심) [마이 B tv > 자녀안심 설정] 메뉴 선택 시 해당 성인인증 단계 제공
//param = {certification_type: constants.CERT_TYPE.CHILD_SAFETY, age_type : ''}

//CERT_NUMBER(인증번호) [마이 B tv > 인증번호 설정] 메뉴 선택 시 해당 성인인증 단계 제공
//param = {certification_type: constants.CERT_TYPE.CERT_NUMBER, age_type : ''}

//KIDS_ZONE(키즈존셋팅) [마이 B tv > 자녀안심 설정] 메뉴 선택 시 해당 성인인증 단계 제공
//param = {certification_type: constants.CERT_TYPE.KIDS_ZONE, age_type : ''}

//ADULT_SELECT [마이 B tv > 자녀안심 설정] 내 시청연령 제한이 설정되어 있는 경우,19영화, 19플러스 관련 메뉴 선택 시, 또는 설정되어있는 연령 등급 이상의 콘텐츠 선택 시 해당 성인인증 단계 제공.
//param = {certification_type: constants.CERT_TYPE.ADULT_SELECT, age_type : ''}

//ADULT_PLAYPURCHASE [마이 B tv > 자녀안심 설정] 내 시청연령 제한이 설정되어 있는 경우, 19영화, 19플러스 콘텐츠 구매 또는 재생 시 해당 성인인증 단계 제공.
//param = {certification_type: constants.CERT_TYPE.ADULT_PLAYPURCHASE, age_type : ''}

//AGE_LIMIT(나이제한) 나이제한일 경우 해당 제한 나이를 age_type컬럼에 데이터 넣어준다 Live TV 시청 중 재핑 또는 DCA를 통해 해당 화면 진입 후 R/C [이전] 키 선택 시 이전 채널로 이동.
//param = {certification_type: constants.CERT_TYPE.AGE_LIMIT, age_type : '7'}

// WATCH_LIMIT(시청제한) [마이 B tv > 자녀안심 설정] 내 ‘시청습관 관리’가 설정되어 있는 경우, 시청 제한 시점 도달 시 해당 인증 단계 제공.
//param = {certification_type: constants.CERT_TYPE.WATCH_LIMIT, age_type : ''}

//PURCHASE(구매인증) 
//1. 마이 B tv > 인증번호 설정] 내 구매 인증번호 사용 설정이 사용함으로 설정되어 있을 시 해당 성인인증 단계 제공
//2. 마이 B tv 내 구매내역 메뉴 진입 시 구매인증 시나리오 정의
//   - *구매내역 진입 시 [마이 B tv > 인증번호 설정] 내 구매 인증번호 사용 설정 여부에 상관없이 구매인증 단계를 항상 제공
//param = {certification_type: constants.CERT_TYPE.PURCHASE, age_type : ''}

//============================================================================================================

class AdultCertification extends PopupPageView {
	constructor(props) {
		super(props);

		let errorData;
		let remainingCount = 5;

		if (this.props.data === "error") {
			errorData = true;
		} else {
			errorData = false;
		}

		this.stbKeyInfo(false);

		this.age_type = null;
		this.certification_type = this.paramData.certification_type;
		this.content_age_limit = null;

		if (this.certification_type === CERT_TYPE.AGE_LIMIT) {
			const children_see_Limit = Number(StbInterface.getProperty(constants.STB_PROP.CHILDREN_SEE_LIMIT));
			this.age_type = children_see_Limit === 18 ? 19 : children_see_Limit === 0 ? 19 : children_see_Limit;
			this.content_age_limit = this.paramData.age_type === 18 ? 19 : this.paramData.age_type;
		}

		this.certificationMessage = {};
		switch (this.certification_type) {
			case CERT_TYPE.PROTECTION: this.certificationMessage = <Protection />; break;
			case CERT_TYPE.KIDS_ZONE: this.certificationMessage = <KidsZone />; break;
			case CERT_TYPE.CHILD_SAFETY: this.certificationMessage = <ChildSafety />; break;
			case CERT_TYPE.CERT_NUMBER: this.certificationMessage = <CertNumber />; break;
			case CERT_TYPE.AGE_LIMIT:
				const ageClassName = 'title age' + this.content_age_limit
				this.certificationMessage = <AgeLimit className={ageClassName} stbAge={this.age_type} contentAge={this.content_age_limit} />
				break
			case CERT_TYPE.ADULT_SELECT: this.certificationMessage = this.certificationMessage = <AdultSelect />; break;
			case CERT_TYPE.ADULT_PLAYPURCHASE: this.certificationMessage = <AdultPlayPurchase />; break;
			case CERT_TYPE.WATCH_LIMIT: this.certificationMessage = <WatchLimit />; break;
			case CERT_TYPE.PURCHASE: this.certificationMessage = <Purchase />; break;
			default: break;
		}

		this.state = {
			textInputFocus: ['focusOn', '', '', ''],
			focusId: 'inputCertification',
			error: errorData,
			certificationExpired: false,
			password: '',
			digit: 4,
			remainingCount: remainingCount,
			certificationType: this.certification_type
		}
	}

	componentWillMount() {
	}

	componentDidMount() {
		if (this.certification_type !== CERT_TYPE.PROTECTION) {
			this.btnFocus = fm.createFocus({
				id: 'inputCertification',
				moveSelector: 'span',
				focusSelector: '.csFocus',
				row: 1,
				col: 3,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: 3
			})
			this.btnFocus.addFocus()
		}

		//if(this.certification_type === CERT_TYPE.PURCHASE) {
		this.stbKeyInfo(false);
		//}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		StbInterface.keyInfo({
			numKeyUse: true
		});
	}

	stbKeyInfo = (useYn) => {
		StbInterface.keyInfo({
			numKeyUse: useYn
		});
	}

	moveFocusManager = (type) => {
		this.btnFocus.removeFocus()

		if (type === 'password') {
			this.btnFocus = fm.createFocus({
				id: 'inputCertification',
				moveSelector: 'span',
				focusSelector: '.csFocus',
				row: 1,
				col: 3,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: 3
			})

			if(this.certification_type === CERT_TYPE.PURCHASE) {
				this.stbKeyInfo(false);
			}
			
			this.setState({
				textInputFocus: ['focusOn', '', '', ''],
				focusId: 'inputCertification'
			})
		} else {
			this.btnFocus = fm.createFocus({
				id: 'certificationInit',
				moveSelector: '',
				focusSelector: '.csFocus',
				row: 1,
				col: 0,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: 0
			})
			
			if(this.certification_type === CERT_TYPE.PURCHASE) {
				this.stbKeyInfo(true);
			}
			
			this.setState({
				textInputFocus: ['', '', '', ''],
				focusId: 'certificationInit'
			})
		}
		this.btnFocus.addFocus();
	}

	onKeyDown = (evt) => {
		const { certificationExpired, textInputFocus, focusId } = this.state;

		if (evt.keyCode === keyCodes.Keymap.UP || evt.keyCode === keyCodes.Keymap.DOWN || evt.keyCode === keyCodes.Keymap.ENTER) {
			switch (evt.keyCode) {
				case keyCodes.Keymap.UP:
					if (this.certification_type !== CERT_TYPE.PROTECTION) {
						if (!certificationExpired) {
							this.setState({
								textInputFocus: ['focusOn', '', '', ''],
							})
							this.moveFocusManager('password');
						}
					}
					break;
				case keyCodes.Keymap.DOWN:
					if (this.certification_type !== CERT_TYPE.PROTECTION) {
						this.setState({
							textInputFocus: ['', '', '', ''],
							password: ''
						})
						for (let i = 0; i < textInputFocus.length; i++) {
							this[`input${i}`].value = '';
						}
						this.moveFocusManager('initial');
					}
					break;
				case keyCodes.Keymap.ENTER:
					if (this.certification_type === CERT_TYPE.PROTECTION) {
						StbInterface.menuNavigationNative(MENU_NAVI.SETTING, { menuId: MENU_ID.SETTING_CHILD_LIMIT });  // 자녀안심 설정 화면 이동  
					} else {
						if (focusId === 'certificationInit') {
							//let url = CERTIFICATION_INITIAL_URL + '?pw_param=a'
							let url = CERTIFICATION_INITIAL_URL + '?ui_name=btvuh2v500&pw_param=a'
							if (this.certification_type === CERT_TYPE.PURCHASE) {
								url = CERTIFICATION_INITIAL_URL + '?ui_name=btvuh2v500&pw_param=p'
							} else if (this.certification_type === CERT_TYPE.WATCH_LIMIT) {
								url = CERTIFICATION_INITIAL_URL + '?ui_name=btvuh2v500&pw_param=k'
							}
							this.setState({
								remainingCount: 5,
								certificationExpired: false,
								error: false
							})
							StbInterface.openPopup('url', url);
						}
					}
					break;
				default:
					break;
			}
		} else if (evt.keyCode === keyCodes.Keymap.N1 || evt.keyCode === keyCodes.Keymap.N2 || evt.keyCode === keyCodes.Keymap.N3 || evt.keyCode === keyCodes.Keymap.N4 || evt.keyCode === keyCodes.Keymap.N5 || evt.keyCode === keyCodes.Keymap.N6 || evt.keyCode === keyCodes.Keymap.N7 || evt.keyCode === keyCodes.Keymap.N8 || evt.keyCode === keyCodes.Keymap.N9 || evt.keyCode === keyCodes.Keymap.N0) {
			if (focusId === 'inputCertification') {
				this.passwordInput(evt.keyCode);
			}
		} else if (evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) { //key 중복 리모컨 * 키와 pc상 backspace 상 동일(8)
			if (!appConfig.runDevice) {
				this.props.callback();
				return true;
			} else {
				this.removePasswordInput();
			}
		} else if (evt.keyCode === keyCodes.Keymap.BACK_SPACE) {
			this.props.callback();
			return true;
		} else if (evt.keyCode === keyCodes.Keymap.EXIT) {
			if (!appConfig.runDevice) {
				this.props.callback();
				return true;
			}
		}
	}
	removePasswordInput = () => {
		const { password } = this.state;
		const pwLen = password.length;		
		if (pwLen > 0) {
			const delPassword = password.slice(0, pwLen - 1)
			let focusArray = new Array(4);
			
			for(let i = focusArray.length-1; i >= pwLen-1; i--){
				this[`input${i}`].value = '';
			}
			
			//this[`input${pwLen - 1}`].value = '';
			focusArray[pwLen - 1] = 'focusOn';
			this.setState({
				textInputFocus: focusArray,
				password: delPassword
			})
		}
	}
	passwordInput = (keyCode) => {
		let inputData;
		if (keyCode === keyCodes.Keymap.N1) {
			inputData = '1'
		} else if (keyCode === keyCodes.Keymap.N2) {
			inputData = '2'
		} else if (keyCode === keyCodes.Keymap.N3) {
			inputData = '3'
		} else if (keyCode === keyCodes.Keymap.N4) {
			inputData = '4'
		} else if (keyCode === keyCodes.Keymap.N5) {
			inputData = '5'
		} else if (keyCode === keyCodes.Keymap.N6) {
			inputData = '6'
		} else if (keyCode === keyCodes.Keymap.N7) {
			inputData = '7'
		} else if (keyCode === keyCodes.Keymap.N8) {
			inputData = '8'
		} else if (keyCode === keyCodes.Keymap.N9) {
			inputData = '9'
		} else if (keyCode === keyCodes.Keymap.N0) {
			inputData = '0'
		}
		let password;
		let focousArray = new Array(4);

		password = this.state.password + inputData;

		if (password.length < 4) {
			for (let i = 0; i < password.length; i++) {
				this[`input${i}`].value = inputData;
			}
			focousArray[password.length] = 'focusOn';

			this.setState({
				textInputFocus: focousArray,
				password: password
			})
		} else {
			let currentCount = this.state.remainingCount;
			let changeCount;

			this[`input${3}`].value = inputData;

			let passwd_type = 'adult';
			if (this.certification_type === CERT_TYPE.KIDS_ZONE || this.certification_type === CERT_TYPE.WATCH_LIMIT) {
				passwd_type = 'kid';
			} else if (this.certification_type === CERT_TYPE.PURCHASE) {
				passwd_type = 'purchase';
			}

			let param = {
				passwd: password,
				passwd_type: passwd_type
			}

			let certification_expired = false;
			let error = false;

			SCS.requestGWSVC002(param).then((response) => {
				if (response.result === SUCCESS_CODE) {
					const resultRs = {
						result: '0000',
						adult_flag: '1'
					}
					this.props.callback(resultRs);
				} else {
					error = true;
					if (currentCount > 1) {
						changeCount = currentCount - 1;
					} else {
						certification_expired = true;
					}

					for (let i = 0; i < this.state.textInputFocus.length; i++) {
						this[`input${i}`].value = '';
					}

					if (certification_expired === true) {
						this.moveFocusManager('initial');
					} else {
						this.moveFocusManager('password');
					}

					this.setState({
						password: '',
						error: error,
						certificationExpired: certification_expired,
						remainingCount: changeCount,
					})
				}
			})
		}
	}
	render() {
		const { textInputFocus, certificationExpired, error, remainingCount, certificationType } = this.state;

		const inputTag = new Array(4).fill(0).map((item, idx) => (
			<span className="gridStyle certification" key={idx}>
				<input
					type="password"
					ref={ref => this[`input${idx}`] = ref}
					className={`inputText csFocus ${textInputFocus[idx]}`}
					min="0"
					max="9"
					maxLength="1"
					onFocus={this.blur}
					readOnly="readonly"
				/>
				<label htmlFor="label"></label>
			</span>
		))

		let noticeText = '성인 인증번호가 기억나지 않으세요?';
		if (certificationType === CERT_TYPE.PURCHASE) {
			noticeText = '구매 인증번호가 기억나지 않으세요?';
		} else if (certificationType === CERT_TYPE.WATCH_LIMIT) {
			noticeText = '시청 제한 인증번호가 기억나지 않으세요?';
		}

		let mesInputText = '';
		if (certificationType === CERT_TYPE.AGE_LIMIT || certificationType === CERT_TYPE.ADULT_PLAYPURCHASE) {
			mesInputText = '성인 인증번호 4자리를 입력해 주세요.';
		} else if (certificationType === CERT_TYPE.ADULT_SELECT) {
			mesInputText = '서비스를 이용하려면 성인 인증번호 4자리를 입력해 주세요.';
		}

		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>

				<div className={this.certification_type === CERT_TYPE.PURCHASE ? "purchaseCertificationWrap" : this.certification_type === CERT_TYPE.PROTECTION ? "juvenileProtectionWrap" : "adultCertificationWrap"}  >
					{this.certificationMessage}

					{this.certification_type === CERT_TYPE.PROTECTION ? "" :
						error === false ?
							<div className="certificationContentWrap" >
								<div className="inputArea">
									<div className="gridWrap" id="inputCertification">
										{inputTag}
									</div>
								</div>
								<p className="mesInput">{mesInputText}</p>
							</div>
							:
							certificationExpired === true ?
								<div className="certificationContentWrap error">
									<div className="inputArea">
										<div className="gridWrap" id="inputCertification">
											{inputTag}
										</div>
									</div>
									<p className="mesInput error">입력횟수를 초과하였습니다.<br />인증번호 초기화 후 다시 시도해주세요.</p>

								</div>
								:
								<div className="certificationContentWrap">
									<div className="inputArea">
										<div className="gridWrap" id="inputCertification">
											{inputTag}
										</div>
									</div>
									<p className="mesInput error">인증번호가 일치하지 않습니다. 입력하신 정보를 다시 확인해 주세요. <br /><strong>남은 입력 횟수 <span>{remainingCount}</span>회</strong></p>
								</div>
					}

					<div>
						{this.certification_type === CERT_TYPE.PROTECTION ?
							<div className="btnSettingCertificationWrapProTection" id="settings">
								<p className="noticeText">청소년 유해 매체물을 포함하고 있어 서비스의 접근을 제한합니다.<br />
									서비스를 이용하려면 [마이 B tv > 자녀 안심 설정 > 성인메뉴 표시]에서 설정을 변경해 주세요.</p>
								<span tabIndex="-1" className="csFocus focusOn btnStyle type03">
									<span className="wrapBtnText">설정 변경</span>
								</span>
							</div>
							:
							<div className="btnSettingCertificationWrap" id="certificationInit">
								<p className="noticeText">{noticeText}</p>
								<span tabIndex="-1" className="csFocus btnStyle type03"  >
									<span className="wrapBtnText">인증번호 초기화</span>
								</span>
							</div>
						}
						<div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
					</div>
				</div>
			</div>
		)
	}
}

export { CERT_TYPE, AdultCertification as default };

