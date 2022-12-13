import {React, Link, selectFn, radioFn, checkFn } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/AlarmSetting.css';

class AlarmSetting extends React.Component {

	checkBlock(event) {
		if(event.keyCode === 13 ) {
			if(event.target.classList.contains('selectWeek')) {
				event.target.closest('.week').querySelector('.checkWrap').classList.add('active');
			}else {
			event.target.closest('.week').querySelector('.checkWrap').classList.remove('active');
			}
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="settingRegistWrap alarmSetting">
					<h2 className="pageTitle">알림시간 설정</h2>
					<p className="subInfo">시간과 분은 리모콘의 숫자키로 입력할 수 있습니다.</p>
					<div className="registerForm">
						<fieldset>
							<div className="contentBox">
								<div className="innerWrap">
									<p className="inputTitle">알림 시간</p>
									<div className="gridWrap timeSet">
										<div className="selectWrap">
											<select name="" id="telAgency">
												<option value="morning">오전</option>
												<option value="afternoon">오후</option>
											</select>
											<div className="selectStyle type02">
												<Link to="/" className="csFocus selectBtn" tabIndex="-1">오전</Link>
												<ul className="selectList">
													<li><Link to="/" tabIndex="-1" className="radioStyle">오전</Link></li>
													<li><Link to="/" tabIndex="-1" className="radioStyle">오후</Link></li>
												</ul>
											</div>
										</div>
										<div className="time">
											<span className="gridStyle">
												<input type="text" id="numberFirst" className="csFocus" maxLength="1"/>
												<label htmlFor="numberFirst"></label>
											</span>
											<span className="text">시</span>
											<span className="gridStyle">
												<input type="text" id="numberFirst" className="csFocus" maxLength="2"/>
												<label htmlFor="numberFirst"></label>
											</span>
											<span className="text">분</span>
										</div>
									</div>
								</div>

								<div className="innerWrap">
									<div className="alarmRadio">
										<p className="inputTitle">알림 간격</p>
										<div className="optionWrap">
											<Link to="/" className="csFocus radioStyle select">한번만</Link>
											<Link to="/" className="csFocus radioStyle">5분 마다</Link>
										</div>
										<p className="alarmDesc">‘5분 마다’의 경우 1시간 동안 지속됩니다.</p>
									</div>
								</div>
							</div>

							<div className="contentBox week">
								<div className="alarmRadio">
									<p className="inputTitle">요일 지정</p>
									<div className="optionWrap">
										<Link to="/" className="csFocus radioStyle select" onKeyDown={this.checkBlock.bind(this)}>매일</Link>
										<Link to="/" className="csFocus radioStyle selectWeek" onKeyDown={this.checkBlock.bind(this)}>요일선택</Link>
									</div>
								</div>
								<div className="checkWrap">
									<Link to="/" className="csFocus checkStyle2" select="true">월</Link>
									<Link to="/" className="csFocus checkStyle2">화</Link>
									<Link to="/" className="csFocus checkStyle2">수</Link>
									<Link to="/" className="csFocus checkStyle2">목</Link>
									<Link to="/" className="csFocus checkStyle2">금</Link>
									<Link to="/" className="csFocus checkStyle2">토</Link>
									<Link to="/" className="csFocus checkStyle2">일</Link>
								</div>
							</div>

						</fieldset>
					</div>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2" data-disabled="true">
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
		document.querySelector('.registerForm .inputTitle + .gridWrap .time .gridStyle:first-child .csFocus').classList.add('loadFocus');
		document.querySelector('.wrapper').classList.add('light');
		selectFn();
		radioFn();
		checkFn();
	}

	componentWillUnmount() {
		document.querySelector('.wrapper').classList.remove('light');
	}

}

export default AlarmSetting;