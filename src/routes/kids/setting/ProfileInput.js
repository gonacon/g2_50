import {React, Link, selectFn, radioFn, checkFn } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/ProfileInput.css';

class ProfileInput extends React.Component {

	storeActive(event) {
		if(event.keyCode === 13 ) {
			if(event.target.getAttribute('select') === "true") {
				document.querySelector('.buttonWrap .csFocus:first-child').removeAttribute('disabled');
			}else {
				document.querySelector('.buttonWrap .csFocus:first-child').setAttribute('disabled', 'true');
			}
		}
	}

	render() {

		return (
			<div className="wrap">
				<div className="settingRegistWrap profileInput">
					<h2 className="pageTitle">우리아이 프로필</h2>
					<p className="subInfo">자녀분의 이름과 생년월,성별을 입력해주세요.</p>
					<div className="registerForm">
						<fieldset>
							<div className="contentBox">
								<div className="innerWrap">
									<p className="inputTitle">보내는 사람</p>
									<span className="gridStyle">
										<input type="text" id="name" className="csFocus" placeholder="이름을 입력해주세요."/>
										<label htmlFor="name"></label>
									</span>
									<div className="buttonKey">
										<ul>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅣ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													•
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅡ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㄱㅋ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㄴㄹ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㄷㅌ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅂㅍ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅅㅎ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅈㅊ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													문자지움
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													ㅇㅁ
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem">
													문자변환
												</Link>
											</li>
											<li>
												<Link to="#" className="buttonKeyItem lastRow">
													아이콘
												</Link>
											</li>
											<li className="endKey">
												<Link to="#" className="buttonKeyItem lastRow">
													입력완료
												</Link>
											</li>
										</ul>
									</div>

								</div>
								<div className="innerWrap">
									<p className="inputTitle">생일</p>
									<div className="gridWrap">
										<div className="time">
											<span className="gridStyle year">
												<input type="text" id="numberFirst" className="csFocus" maxLength="1"/>
												<label htmlFor="numberFirst"></label>
											</span>
											<span className="text">년</span>
											<span className="gridStyle">
												<input type="text" id="numberFirst" className="csFocus" maxLength="2"/>
												<label htmlFor="numberFirst"></label>
											</span>
											<span className="text">월</span>
										</div>
									</div>
									<div className="alarmRadio">
										<p className="inputTitle">성별</p>
										<div className="optionWrap">
											<Link to="/" className="csFocus radioStyle select">남아</Link>
											<Link to="/" className="csFocus radioStyle">여아</Link>
										</div>
									</div>
									<div className="agreeWrap">
										<Link to="/" className="csFocus checkStyle3" onKeyDown={this.storeActive.bind(this)}>개인정보 수집동의</Link>
										<p className="agreeDesc">* 개인정보 수집정책에 동의 후 이용이 가능합니다.</p>
									</div>
								</div>
							</div>

						</fieldset>
					</div>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2" disabled>
							<span className="wrapBtnText">저장</span>
						</button>
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">취소</span>
						</button>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.registerForm .contentBox:first-child .innerWrap .gridStyle .csFocus').classList.add('loadFocus');
		document.querySelector('.wrapper').classList.add('light');
		selectFn();
		radioFn();
		checkFn();
	}

	componentWillUnmount() {
		document.querySelector('.wrapper').classList.remove('light');
	}

}

export default ProfileInput;