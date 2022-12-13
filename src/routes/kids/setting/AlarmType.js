import {React, Link } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/AlarmType.css';

class AlarmType extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			alarmState : [true, true, false, false]
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="settingRegistWrap alarmType">
					<h2 className="pageTitle">알림시간 설정</h2>
					<p className="subInfo">알람 종류를 선택해주세요</p>
					<ul className="alarmList">
						<li className="school">
							<Link to="/" className="item csFocus">
								<span className="inner">
									<span className="text">유치원 갈 시간</span>
								</span>
								{ this.state.alarmState[0] === true && <span className="alarmState">적용중</span> }
							</Link>
						</li>
						<li className="meal">
							<Link to="/" className="item csFocus">
								<span className="inner">
									<span className="text">식사시간</span>
								</span>
								{ this.state.alarmState[1] === true && <span className="alarmState">적용중</span> }
							</Link>
						</li>
						<li className="rest">
							<Link to="/" className="item csFocus">
								<span className="inner">
									<span className="text">휴식시간</span>
								</span>
								{ this.state.alarmState[2] === true && <span className="alarmState">적용중</span> }
							</Link>
						</li>
						<li className="sleep">
							<Link to="/" className="item csFocus">
								<span className="inner">
									<span className="text">잘 시간</span>
								</span>
								{ this.state.alarmState[3] === true && <span className="alarmState">적용중</span> }
							</Link>
						</li>
					</ul>
					<span className="btnOK">선택</span>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.alarmList li:first-child .csFocus').classList.add('loadFocus');
	}

}

export default AlarmType;