import {React, Link, radioFn} from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/FirstSetLimit.css';
import '../../../assets/css/routes/kids/setting/FirstSetAlarm.css';

// TODO: Json 내용만 알맞게 교체되면 되므로 개발 완료 후 import는 FirstSetAlarmNoneData 삭제
// 직접입력 없음
import FirstSetAlarmNoneData from '../../../assets/json/routes/kids/setting/FirstSetAlarmNoneData.json';
// 직접입력 있음
import FirstSetAlarmData from '../../../assets/json/routes/kids/setting/FirstSetAlarmData.json';


class FirstSetAlarm extends React.Component {
	constructor(props) {
		super(props);

		let alarmData;

		if( this.props.data === "none"){
			alarmData = FirstSetAlarmNoneData;
		} else {
			alarmData = FirstSetAlarmData;
		}

		this.state = {
			contents : alarmData,
			item : alarmData.alarmItem
		}
	}

	focusBtn(_this, event){
		if( document.querySelectorAll('.alarmList li.focus').length !== 0 ){
			document.querySelector('.alarmList li.focus').classList.remove('focus');
		}
		event.target.closest('li').classList.add('focus');
	}

	keyDownBtn(_this, event){
		document.querySelector('.alarmList li.focus').classList.remove('focus');

		if( event.keyCode === 40 ){
			document.querySelector('.btnBottomWrap .csFocus:first-child').focus();
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="mainBg"><img src={this.state.contents.mainBg} alt="" /></div>
				<div className="firstSetLimitWrap">
					<div className="setStep">
						<ul>
							<li>1</li>
							<li>2</li>
							<li className="on">3</li>
							<li>4</li>
						</ul>
					</div>
					<div className="setLimitTitleWrap">
						<p className="title">우리 친구 생활에 맞는 알람시간을 설정해 보세요.</p>
						<p className="subTitle">등록한 시간 5분 전부터 알림을 통해 우리 친구가 해야 할 일을 잊지 않고 할 수 있게 도와줘요.<br/>
							<strong>유치원 갈 시간, 식사시간, 휴식시간, 잘 시간</strong> 중 선택할 수 있어요.</p>
					</div>
					<div className="alarmListWrap">
						<ul className="alarmList">
							{
								this.state.item.map((data, i) => {
									let text = data.day[0];
									for (let i = 1; i < data.day.length; i++) {
										text += ',' + data.day[i];
									}
									if (data.type === "nonData") {
										return (
											<li className="nonData">
												<Link to="#" className="csFocus item" onFocus={this.focusBtn.bind(this,this.event)}>
													<span className="inner">
														<span className="text">알람 추가</span>
													</span>
												</Link>
											</li>
										)
									} else {
										return (
											<li className={data.type} key={i}>
												<Link to="#" className="csFocus item"
													  onFocus={this.focusBtn.bind(this, this.event)}>
												<span className="inner">
													<span className="text">{data.text}</span>
													<span className="detailAlarm">
														<span className="time">{data.time}</span>
														<span className="count">{data.count}</span>
														<span className="day">{text}</span>
													</span>
												</span>
												</Link>
												<Link to="#" className="csFocus alarmDel btnStyleLight3_1"
													  onKeyDown={this.keyDownBtn.bind(this, this.event)}>삭제</Link>
											</li>
										)
									}
								})
							}
						</ul>
					</div>
					<div className="btnBottomWrap">
						<Link to="#" tabIndex="-1" className="csFocus btnStyleKids1">
							<span className="wrapBtnText">이전단계</span>
						</Link>
						<Link to="#" tabIndex="-1" className="csFocus btnStyleKids1">
							<span className="wrapBtnText">다음</span>
						</Link>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		if(document.querySelectorAll('.alarmList li').length > 1) {
			document.querySelector('.alarmList li:first-child .item').classList.add('loadFocus');
		}else {
			document.querySelector('.btnBottomWrap .csFocus:first-child + .csFocus').classList.add('loadFocus');
		}
		radioFn();
	}

}

export default FirstSetAlarm;

