import { React, createMarkup } from '../utils/common';
import '../assets/css/routes/kids/endcertification/KidsEndCertification.css';
// import constants, { CERT_TYPE } from '../config/constants';
import PopupPageView from '../supporters/PopupPageView.js'
//import Fm, { fm } from '../supporters/navigator'
import FM from 'Supporters/navi';
import { SCS } from '../supporters/network';
// import Core from '../supporters/core';
import keyCodes from '../supporters/keyCodes';

// STB
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';
import appConfig from './../config/app-config';

const CHARACTERCOMMENT = '잘가~!<br/>우리 또 만나자!'
const SUCCESS_CODE = '0000'

const server = appConfig.headEnd.PPM.Live;
const CERTIFICATION_INITIAL_URL = server.protocol + '://' + server.ip + ':' + server.port + server.path;
// const CERTIFICATION_INITIAL_URL = 'http://1.255.231.162:8080/Test/constant/UI5/pw_reset/reset_main.jsp';

//kizZone 호출 방법
//Core.inst().showPopup(<KidsEndCertification />, '', this.certificationCallBack);

//인증 성공 시 response : {result: '0000'}
//이전 키 누를 시 response : 없음

class KidsEndCertification extends PopupPageView {
	constructor(props) {
		super(props)

		let errorData;
		let remainingCount = 5;

		if (this.props.data === "error") {
			errorData = true;
		} else {
			errorData = false;
		}


		StbInterface.keyInfo({
			numKeyUse: false
		});

		this.state = {
			textInputFocus: ['focusOn', '', '', ''],
			focusId: 'inputCertification',
			error: errorData,
			certificationExpired: false,
			password: '',
			remainingCount: remainingCount,
		};

		this.noState = {
			char_name: '',
			isVoiceUse: false
		};
		StbInterface.kidsZoneExitState('enter');
	}

	componentWillMount() {
		this.noState.char_name = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);			// 캐릭터명
		const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE);				// 음성사용유무
		this.noState.isVoiceUse = Number(voiceUse) === 1 ? true : false;

		this.setFocusList();
	}

	componentDidMount() {
		this.setDefaultFm()
		this.setFocus(0, 0);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		StbInterface.kidsZoneExitState('exit');
		StbInterface.keyInfo({
			numKeyUse: true
		});
	}

	setFocusList = () => {
		if (this.state.certificationExpired) {
			this.focusList = [
				{ key: 'inputCertification', fm: null },
				{ key: 'initCertification', fm: null, link: { UP: null } }
			]
		} else {
			this.focusList = [
				{ key: 'inputCertification', fm: null },
				{ key: 'initCertification', fm: null }
			]
		}

		this.declareFocusList(this.focusList)
	}

	setDefaultFm = (vodData) => {
		for (let item of this.focusList) {
			let containerSelector = '';
			let moveSelector = '';
			let row = 1;
			let col = 1;
			let focusIdx = 0;
			let startIdx = 0;
			let lastIdx = 0;
			let type = 'LIST';
			let bRowRolling = true
			let onFocusKeyDown = function () { };
			let onFocusContainer = function () { };
			let onBlurContainer = function () { };
			let onFocusChild = function () { };

			switch (item.key) {
				case 'inputCertification':
					moveSelector = 'span'
					col = 4
					lastIdx = 3
					focusIdx = 0
					type = 'ELEMENT'
					onFocusContainer = this.onFocusInput
					onBlurContainer = this.onBlurInput
					onFocusChild = this.onFocusChildInput
					onFocusKeyDown = this.onFocusKeyDownInput
					break;

				case 'initCertification':
					moveSelector = ''
					//col = 0
					row = 0
					type = 'ELEMENT'
					onFocusKeyDown = this.onFocusKeyDownInit

					break;
				default:
					break;
			}

			let option = {
				id: item.key,
				containerSelector,
				moveSelector: moveSelector,
				focusSelector: '.csFocus',
				row: row,
				col: col,
				type: type,
				focusIdx: focusIdx,
				startIdx: startIdx,
				lastIdx: lastIdx,
				bRowRolling: bRowRolling,
				onFocusKeyDown: onFocusKeyDown,
				onFocusContainer: onFocusContainer,
				onBlurContainer: onBlurContainer,
				onFocusChild: onFocusChild
			}

			const fm = new FM(option);
			this.setFm(item.key, fm);
		}
	}

	onBlurInput = () => {
		for (let i = 0; i < this.state.textInputFocus.length; i++) {
			this[`input${i}`].value = '';
		}

		this.setState({
			textInputFocus: ['', '', '', ''],
			password: ''
		})
	}

	onFocusKeyDownInput = (evt) => {
		if (evt.keyCode === keyCodes.Keymap.N1 || evt.keyCode === keyCodes.Keymap.N2 || evt.keyCode === keyCodes.Keymap.N3 || evt.keyCode === keyCodes.Keymap.N4 || evt.keyCode === keyCodes.Keymap.N5 || evt.keyCode === keyCodes.Keymap.N6 || evt.keyCode === keyCodes.Keymap.N7 || evt.keyCode === keyCodes.Keymap.N8 || evt.keyCode === keyCodes.Keymap.N9 || evt.keyCode === keyCodes.Keymap.N0) {
			this.passwordInput(evt.keyCode);
		} else if (evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			if (!appConfig.runDevice) {
				this.props.callback();
				return true;
			} else {
				this.removePasswordInput();
			}
		} else if (evt.keyCode === keyCodes.Keymap.BACK_SPACE) {
			this.props.callback();
		} else if (evt.keyCode === keyCodes.Keymap.EXIT) {
			if (!appConfig.runDevice) {
				this.props.callback();
			}
		}
	}

	removePasswordInput = () => {
		const { password } = this.state;
		const pwLen = password.length;
		if (pwLen > 0) {
			const delPassword = password.slice(0, pwLen - 1)
			let focusArray = new Array(4);

			this[`input${pwLen - 1}`].value = '';
			focusArray[pwLen - 1] = 'focusOn';
			this.setState({
				textInputFocus: focusArray,
				password: delPassword
			})
		}
	}

	passwordInput = (keyCode) => {
		let inputData
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

		password = this.state.password + inputData

		if (password.length < 4) {
			for (let i = 0; i < password.length; i++) {
				this[`input${i}`].value = inputData
			}
			focousArray[password.length] = 'focusOn';

			this.setState({
				textInputFocus: focousArray,
				password: password
			})
		} else {
			let currentCount = this.state.remainingCount
			let changeCount;
			this[`input${3}`].value = inputData;
			let param = {
				passwd: password,
				passwd_type: 'kid'
			}
			let certification_expired = false;
			let error = false;

			SCS.requestGWSVC002(param).then((response) => {
				if (response.result === SUCCESS_CODE) {
					const resultRs = {
						result: '0000'
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
						this.setState({
							textInputFocus: ['', '', '', ''],
							password: ''
						})
						this.setFocus(1)
					} else {
						this.setState({
							textInputFocus: ['focusOn', '', '', ''],
							password: ''
						})
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
	onFocusKeyDownInit = (evt) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {

			this.setState({
				remainingCount: 5,
				certificationExpired: false,
				error: false
			})
			//현재 kizZoneEndPop시 초기화 parameter 따로 없음. 시청제한parameter 와 동일하게 호출 요청 전달받음
			//추후 변경 소지 있음
			// StbInterface.openPopup('url', CERTIFICATION_INITIAL_URL + '?ui_name=btvuh2v500&pw_param=k');
			StbInterface.openPopup('url', CERTIFICATION_INITIAL_URL + '?ui_name=' + appConfig.STBInfo.ui_name + '&pw_param=k');
		} else if (evt.keyCode === keyCodes.Keymap.BACK_SPACE) {
			this.props.callback();
		} else if (evt.keyCode === keyCodes.Keymap.EXIT) {
			if (!appConfig.runDevice) {
				this.props.callback();
			}
		}
	}

	onErrored = (e, type) => {
		if (e.target) {
			if (type === 'character') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-character-pororo-end.png';
			if (type === 'bubble') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-security-bubble-pororo.png';
		}
	}

	onKeyDown = (evt) => {
		super.onKeyDown(evt);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE) {
			return true;
		}
	}

	render() {
		const { textInputFocus, certificationExpired, error, remainingCount } = this.state
		const { char_name, isVoiceUse } = this.noState;

		if (certificationExpired) {
			this.setFocusList()
			this.setDefaultFm()
		}

		if (isVoiceUse) {
			setTimeout(() => {
				StbInterface.playKidszoneGuide(char_name + '_10_guide_good-bye.mp3');
			}, 300);
			this.noState.isVoiceUse = false;
		}

		const inputTag = new Array(4).fill(0).map((item, idx) => (
			<span className="gridStyle certification" key={idx}>
				<input
					type="password"
					ref={ref => this[`input${idx}`] = ref}
					className={`inputText csFocus ${textInputFocus[idx]}`}
					min="0"
					max="9"
					maxLength="1"
					readOnly="readonly"
				/>
				<label htmlFor="number"></label>
			</span>
		))

		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="kidsEndCertificationWrap">
					<div className="characterWrap">
						<div className="imageWrap">
							<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-character-${char_name}-end.png`} onError={(e) => this.onErrored(e, 'character')} alt="" />
						</div>
						<div className="bubbleArea">
							<div className="bubbleWrap">
								<div className="textArea">
									<span dangerouslySetInnerHTML={createMarkup(CHARACTERCOMMENT)}></span>
								</div>
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-security-bubble-${char_name}.png`} onError={(e) => this.onErrored(e, 'bubble')} alt="" />
							</div>
						</div>
					</div>
					<div className="titleWrap">
						<p className="title">키즈존 종료</p>
						<p className="mesSetting">키즈존을 종료하시겠어요?<br />키즈존을 종료하려면 성인인증번호 4자리를 입력해 주세요.</p>
					</div>

					{error === false ?
						<div className="certificationContentWrap">
							<div className="inputArea">
								<div className="gridWrap" id="inputCertification">
									{inputTag}
								</div>
							</div>
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
								<p className="mesInput error">인증번호가 일치하지 않습니다. 확인 후 다시 입력해주세요 <br /><strong>남은 입력 횟수 <span>{remainingCount}</span>회</strong></p>
							</div>
					}
					<div className="btnSettingCertificationWrap" id="initCertification">
						<p className="noticeText">휴대폰 본인인증 후 인증번호를 초기화할 수 있어요.</p>
						<span tabIndex="-1" className="csFocus btnStyle type03">
							<span className="wrapBtnText">인증번호 초기화</span>
						</span>
					</div>
					<div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
				</div>
			</div>
		)
	}
}

export default KidsEndCertification;