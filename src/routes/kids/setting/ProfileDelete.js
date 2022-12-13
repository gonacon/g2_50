import {React } from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/RegistLayout.css';
import '../../../assets/css/routes/kids/setting/ProfileDelete.css';
import AlarmDeleteJson from '../../../assets/json/routes/kids/setting/ProfileDelete.json';

class ProfileDelete extends React.Component {
	constructor(props) {
		super(props);

		let JsonData = AlarmDeleteJson;
		this.state = {
			data : JsonData,
			item : JsonData.profileItem
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="settingRegistWrap profileDelete">
					<h2 className="pageTitle">프로필 삭제</h2>
					<p className="subInfo">선택하신 프로필을 삭제하시겠습니까?</p>
					<ul className="profileList">
						{
							this.state.item.map((data, i) => {
								return(
									<li className={data.type} key={i}>
										<div className="item">
											<span className="inner">
												<span className="text">{data.name}</span>
												<span className="detailAlarm">
													<span className="birth">{data.birth}</span>
													<span className="age">{data.age}</span>
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

export default ProfileDelete;