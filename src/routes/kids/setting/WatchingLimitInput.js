import {React, Link, selectFn } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/WatchingLimitInput.css';

class WatchingLimitInput extends React.Component {

	render() {

		return (
			<div className="wrap">
				<div className="settingRegistWrap watchTime">
					<h2 className="pageTitle">VOD 시청제한 시간대를 직접 입력하세요</h2>
					<p className="subInfo">리모콘의 숫자키로 입력할 수 있어요.</p>
					<div className="registerForm">
						<fieldset>
							<div className="contentBox">
								<p className="inputTitle">시청제한 시간대</p>
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
						</fieldset>
					</div>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">등록</span>
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
		selectFn();
	}

}

export default WatchingLimitInput;