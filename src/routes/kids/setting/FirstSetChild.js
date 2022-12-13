import {React, Link, radioFn} from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/FirstSetLimit.css';
import '../../../assets/css/routes/kids/setting/FirstSetChild.css';

// TODO: Json 내용만 알맞게 교체되면 되므로 개발 완료 후 import는 FirstSetAlarmNoneData 삭제
// 직접입력 없음
import FirstSetChildNoneData from '../../../assets/json/routes/kids/setting/FirstSetChildNoneData.json';
// 직접입력 있음
import FirstSetChildData from '../../../assets/json/routes/kids/setting/FirstSetChildData.json';


class FirstSetChild extends React.Component {
	constructor(props) {
		super(props);

		let childData;

		if( this.props.data === "none"){
			childData = FirstSetChildNoneData;
		} else {
			childData = FirstSetChildData;
		}

		this.state = {
			contents : childData,
			item : childData.profileItem
		}
	}

	focusBtn(_this, event){
		if( document.querySelectorAll('.profileList li.focus').length !== 0 ){
			document.querySelector('.profileList li.focus').classList.remove('focus');
		}
		event.target.closest('li').classList.add('focus');
	}

	keyDownBtn(_this, event){
		document.querySelector('.profileList li.focus').classList.remove('focus');

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
							<li className="on">2</li>
							<li>3</li>
							<li>4</li>
						</ul>
					</div>
					<div className="setLimitTitleWrap">
						<p className="title">친구의 이름을 불러주고, 콘텐츠를 추천해 드릴게요.</p>
						<p className="subTitle">Btv 태어난 월에 맞추어 이벤트도 준비되어 있답니다.</p>
					</div>
					<div className="childListWrap">
						<ul className="profileList">
							{
								this.state.item.map((data, i) => {
									if(data.type === "nonData"){
										return(
											<li className="nonData" key={i}>
												<Link to="#" className="csFocus item" onFocus={this.focusBtn.bind(this,this.event)}>
													<span className="inner">
														<span className="text">프로필 등록</span>
													</span>
												</Link>
											</li>
										)
									} else {
										return(
											<li className={data.type} key={i}>
												<Link to="#" className="csFocus item" onFocus={this.focusBtn.bind(this,this.event)}>
													<span className="inner">
														<span className="text">{data.name}</span>
														<span className="detailAlarm">
															<span className="birth">{data.birth}</span>
															<span className="age">{data.age}</span>
														</span>
													</span>
												</Link>
												<Link to="#" className="csFocus childDel btnStyleLight3_1" onKeyDown={this.keyDownBtn.bind(this,this.event)}>삭제</Link>
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
		if(document.querySelectorAll('.profileList li').length > 1) {
			document.querySelector('.profileList li:first-child .item').classList.add('loadFocus');
		}else {
			document.querySelector('.btnBottomWrap .csFocus:first-child + .csFocus').classList.add('loadFocus');
		}
		radioFn();
	}

}

export default FirstSetChild;

