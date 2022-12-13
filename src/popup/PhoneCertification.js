import {React, fnScrolling, selectFn, radioFn, phoneNumFn } from '../utils/common';

import '../assets/css/routes/certification/PhoneCertification.css';
import './../assets/css/components/popup/PopupDefault.css';
import './../assets/css/components/popup/Popup.css';

import Fm, { fm } from '../supporters/navigator'

import PhoneCertificationData from '../assets/json/routes/certification/PhoneCertificationData.json';
import PopupPageView from '../supporters/PopupPageView';
import appConfig from './../config/app-config';



class PhoneCertification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: PhoneCertificationData
		}
    }

	componentDidMount() {
        document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.gender .optionWrap .csFocus:first-child').classList.add('loadFocus');
        fnScrolling();
		selectFn();
		radioFn();

		// TODO: 인증번호 유무, 추후 삭제
		if(this.props.input === "certification"){
			document.querySelector("#birthNumber").value = '19901231';
			document.querySelector("#phoneNumber").value = '01094780753';
			document.querySelector("#certificationNumber").value = '172234';
			document.querySelector("#certificationNumber").setAttribute("data-disabled",false);
			document.querySelector(".valid").classList.remove("disable");
			document.querySelector(".btnRequire").setAttribute("data-disabled",false);
			document.querySelector(".certificationEnd").setAttribute("data-disabled",false);
		}

		this.btnFocus = fm.createFocus ({
			id : 'gender',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1
		})
		this.btnFocus.addFocus()

	}
	onKeyDown = (evt) => {
		console.log(evt.keyCode)
		let direction;
		if (evt.keyCode === 37 || evt.keyCode === 38 || evt.keyCode === 39 || evt.keyCode === 40 || evt.keyCode === 13 || evt.keyCode === 67) {
			switch (evt.keyCode) {
				// case 37:
				// 	direction = 'LEFT'
				// 	this.btnFocus.removeFocus()
				// 	this.btnFocus.moveFocus(direction)
				// 	break
				case 38:
					direction = 'UP'
					if (!this.state.certificationExpired) {
						this.moveFocusManager('password')
					}
					break
				case 39:
					direction = 'RIGHT'	
					this.btnFocus.removeFocus()
					this.btnFocus.moveFocus(direction)
					break
				// case 40:
				// 	direction = 'DOWN'
				// 	this.moveFocusManager('initial')
				// 	break
				case 67:
					console.log('67 event')
					console.log(this)
					this.props.callback(this);
					break
				default:
					break
			}
		}
	}

	valueRequire(_this){
		let targetInput = _this.target.closest('.gridWrap').querySelector('#phoneNumber');
		if( phoneNumFn(targetInput.value) ){
			document.querySelector('.btnRequire').setAttribute('data-disabled', false);
			document.querySelector('.btnRequire').classList.add('csFocus');
		} else {
			document.querySelector('.btnRequire').setAttribute('data-disabled', true);
		}
	}

	render() {
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
								<p className="userName">홍길* 님</p>
							</div>
							<div className="inputCon">
								<div className="gridWrap">
									<div className="gender" >
										<p className="inputTitle" >성별</p>
										<div className="optionWrap" >
										<div id="gender">
											<div className="csFocus radioStyle select">남성</div>
											<div className="csFocus radioStyle">여성</div>
										</div>
										</div>
									</div>
									<div className="birth">
										<p className="inputTitle">생년월일</p>
										<span className="gridStyle birth">
											<input type="text" id="birthNumber" className="inputText csFocus" maxLength="11" placeholder="예)19921010" />
											<label htmlFor="birthNumber"></label>
										</span>
									</div>
								</div>
								<div className="gridWrap">
									<div className="agency">
										<p className="inputTitle">통신사</p>
										<div className="selectWrap">
											<select name="" id="telAgency">
												<option value="SKT">SKT</option>
												<option value="KT">KT</option>
												<option value="LGU+">LGU+</option>
											</select>
											<div className="selectStyle">
												<div className="csFocus selectBtn" tabIndex="-1">SKT</div>
												<ul className="selectList">
													{
														this.state.content.telAgency.map((data, i) => {
															return(
																<li key={i}><div tabIndex="-1" className="radioStyle">{data}</div></li>
															)
														})
													}
												</ul>
											</div>
										</div>
									</div>
									<div className="tel">
										<p className="inputTitle">휴대폰 번호</p>
										<span className="gridStyle">
											<input type="text" id="phoneNumber" className="inputText csFocus" maxLength="11" placeholder="숫자만 입력" onChange={this.valueRequire.bind(this)}/>
											<label htmlFor="phoneNumber"></label>
										</span>
									</div>
									<span className="csFocus btnRequire" data-disabled="true">요청</span>
								</div>
								<div className="inner valid disable">
									<p className="inputTitle">인증 번호</p>
									<span className="gridStyle">
										<input type="text" id="certificationNumber" className="inputText csFocus" placeholder="인증번호 입력" data-disabled="true"/>
										<label htmlFor="certificationNumber"></label>
									</span>
								</div>
								<div className="btnWrap">
									<span className="csFocus btnStyle certificationEnd" data-disabled="true">
										<span>인증완료</span>
									</span>
									<span className="csFocus btnStyle">취소</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default PhoneCertification;

