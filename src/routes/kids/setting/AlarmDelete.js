import {React } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/AlarmDelete.css';
import AlarmDeleteJson from '../../../assets/json/routes/kids/setting/AlarmDelete.json';

class AlarmDelete extends React.Component {
	constructor(props) {
		super(props);

		let JsonData = AlarmDeleteJson;
		this.state = {
			data : JsonData,
			item : JsonData.alarmItem
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="settingRegistWrap alarmDelete">
					<h2 className="pageTitle">알람 삭제</h2>
					<p className="subInfo">선택하신 알람을 삭제하시겠습니까?</p>
					<ul className="alarmList">
						{
							this.state.item.map((data, i) => {
								let text = data.day[0];
								for (let i=1; i< data.day.length; i++) {
									text += ','+ data.day[i];
								}
								return(
									<li className={data.type} key={i}>
										<div className="item">
											<span className="inner">
												<span className="text">{data.text}</span>
												<span className="detailAlarm">
													<span className="time">{data.time}</span>
													<span className="count">{data.count}</span>
													<span className="day">{text}</span>
												</span>
											</span>
										</div>
									</li>
								);
							})
						}
					</ul>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">삭제</span>
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
		document.querySelector('.buttonWrap .csFocus:first-child').classList.add('loadFocus');
	}

}

export default AlarmDelete;