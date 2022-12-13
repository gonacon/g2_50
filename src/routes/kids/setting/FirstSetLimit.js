import {React, Link, radioFn} from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/FirstSetLimit.css';

// TODO: Json 내용만 알맞게 교체되면 되므로 개발 완료 후 import는 FirstSetLimitNoneData 삭제
// 직접입력 없음
import FirstSetLimitNoneData from '../../../assets/json/routes/kids/setting/FirstSetLimitNoneData.json';
// 직접입력 있음
import FirstSetLimitData from '../../../assets/json/routes/kids/setting/FirstSetLimitData.json';


class FirstSetLimit extends React.Component {
	constructor(props) {
		super(props);

		let limitData;

		if( this.props.data === "none"){
			limitData = FirstSetLimitNoneData;
		} else {
			limitData = FirstSetLimitData;
		}

		this.state = {
			contents : limitData
		}
	}

	keyDown(_this, event){
		if( event.keyCode === 13 ){
			event.preventDefault();

			let index = 0;
			let contentList = document.querySelectorAll('.radioWrap .csFocus');

			for(let i = 0; i < contentList.length; i++) {
				if(contentList[i] === event.target) {
					index = i;
					break;
				}
			}

			document.querySelector('.radioContentWrap .limitItem.sel').classList.remove('sel');
			document.querySelectorAll('.radioContentWrap .limitItem')[index].classList.add('sel');
		}
	}

	timeLimitSel(_this, event){
		if( event.keyCode === 13 ){
			event.preventDefault();

			let index = 0;
			let contentList = document.querySelectorAll('.timeLimit .csFocus');

			for(let i = 0; i < contentList.length; i++) {
				if(contentList[i] === event.target) {
					index = i;
					break;
				}
			}

			if( document.querySelectorAll('.timeLimit .csFocus.sel').length !== 0){
				document.querySelector('.timeLimit .csFocus.sel').classList.remove('sel');
			}
			document.querySelectorAll('.timeLimit .csFocus')[index].classList.add('sel');
		}

		if( event.keyCode === 40 ){
			document.querySelector('.btnBottomWrap .csFocus:first-child').focus();
		}
	}

	pieceLimitSel(_this, event){
		if( event.keyCode === 13 ){
			event.preventDefault();

			let index = 0;
			let contentList = document.querySelectorAll('.pieceLimit .csFocus');

			for(let i = 0; i < contentList.length; i++) {
				if(contentList[i] === event.target) {
					index = i;
					break;
				}
			}

			if( document.querySelectorAll('.pieceLimit .csFocus.sel').length !== 0){
				document.querySelector('.pieceLimit .csFocus.sel').classList.remove('sel');
			}
			document.querySelectorAll('.pieceLimit .csFocus')[index].classList.add('sel');
		}

		if( event.keyCode === 40 ){
			document.querySelector('.btnBottomWrap .csFocus:first-child').focus();
		}
	}

	focusBtn(_this, event){
		if( event.keyCode === 40 ){
			document.querySelector('.btnBottomWrap .csFocus:first-child').focus();
		}
	}

	render() {
		let contentData = this.state.contents;
		return (
			<div className="wrap">
				<div className="mainBg"><img src={this.state.contents.mainBg} alt="" /></div>
				<div className="firstSetLimitWrap">
					<div className="setStep">
						<ul>
							<li>1</li>
							<li>2</li>
							<li>3</li>
							<li className="on">4</li>
						</ul>
					</div>
					<div className="setLimitTitleWrap">
						<p className="title">하루에 얼만큼 볼 건지 약속해요</p>
						<p className="subTitle">하루동안  VOD를 얼마나 볼 지 설정하면 약속을 지킬 수 있도록 도와드릴게요.<br/>
							약속한 시간이 지나도 부모님께 허락받으면 계속해서 이용할 수 있어요.</p>
					</div>
					<div className="radioWrap kids">
						<div className="optionWrap">
							<Link to="#" className="csFocus radioStyle select" onKeyDown={this.keyDown.bind(this,this.event)}>시간으로 제한</Link>
							<Link to="#" className="csFocus radioStyle" onKeyDown={this.keyDown.bind(this,this.event)}>편 수로 제한</Link>
							<Link to="#" className="csFocus radioStyle" onKeyDown={this.keyDown.bind(this,this.event)}>시간대로 제한</Link>
						</div>
					</div>
					<div className="radioContentWrap">
						<div className="limitItem timeLimit sel">
							<ul>
								<li><Link to="#" className="csFocus" onKeyDown={this.timeLimitSel.bind(this,this.event)}><span>제한없음</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.timeLimitSel.bind(this,this.event)}><span>1시간</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.timeLimitSel.bind(this,this.event)}><span>2시간</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.timeLimitSel.bind(this,this.event)}><span>3시간</span></Link></li>
								<li className="directInput">
									{contentData.timeLimit === "" ?
										<Link to="#" className="csFocus" onKeyDown={this.focusBtn.bind(this,this.event)}>
											<span>직접입력</span>
										</Link>
										:
										<Link to="#" className="csFocus inData" onKeyDown={this.timeLimitSel.bind(this,this.event)}>
											<span>{contentData.timeLimit}</span>
										</Link>
									}
								</li>
							</ul>
						</div>
						<div className="limitItem pieceLimit">
							<ul>
								<li><Link to="#" className="csFocus" onKeyDown={this.pieceLimitSel.bind(this,this.event)}><span>제한없음</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.pieceLimitSel.bind(this,this.event)}><span>1편</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.pieceLimitSel.bind(this,this.event)}><span>5편</span></Link></li>
								<li><Link to="#" className="csFocus" onKeyDown={this.pieceLimitSel.bind(this,this.event)}><span>10편</span></Link></li>
								<li className="directInput">
									{contentData.pieceLimit === "" ?
										<Link to="#" className="csFocus" onKeyDown={this.focusBtn.bind(this,this.event)}>
											<span>직접입력</span>
										</Link>
										:
										<Link to="#" className="csFocus inData" onKeyDown={this.pieceLimitSel.bind(this,this.event)}>
											<span>{contentData.pieceLimit}</span>
										</Link>
									}
								</li>
							</ul>
						</div>
						<div className="limitItem timeslotLimit">
							<ul>
								<li className="timeslotInput">
									{contentData.timeslotLimit === "" ?
										<Link to="#" className="csFocus">
											<span>시청제한 시간대 등록</span>
										</Link>
										:
										<Link to="#" className="csFocus inData2">
											<span className="dataTitle">시청제한 시간대</span>
											<span>{contentData.timeslotLimit}</span>
										</Link>
									}
								</li>
							</ul>
						</div>
					</div>
					<div className="btnBottomWrap">
						<Link to="#" tabIndex="-1" className="csFocus btnStyleKids1">
							<span className="wrapBtnText">이전단계</span>
						</Link>
						<Link to="#" tabIndex="-1" className="csFocus btnStyleKids1">
							<span className="wrapBtnText">다했어요</span>
						</Link>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.firstSetLimitWrap .radioWrap .optionWrap .csFocus:first-child').classList.add('loadFocus');

		radioFn();

		// TODO : 화면 구성 요소 보여주기 용 스크립트 이므로 삭제
		if(this.props.focus === 'piece'){
			document.querySelector('.radioWrap .csFocus.select').classList.remove('select');
			document.querySelector('.radioWrap .csFocus:nth-of-type(2)').classList.add('select');
			document.querySelector('.radioWrap .csFocus:nth-of-type(2)').focus();
			document.querySelector('.radioContentWrap .limitItem.sel').classList.remove('sel');
			document.querySelector('.radioContentWrap .limitItem:nth-of-type(2)').classList.add('sel');
		}else if(this.props.focus === 'timeslot'){
			document.querySelector('.radioWrap .csFocus.select').classList.remove('select');
			document.querySelector('.radioWrap .csFocus:nth-of-type(3)').classList.add('select');
			document.querySelector('.radioWrap .csFocus:nth-of-type(3)').focus();
			document.querySelector('.radioContentWrap .limitItem.sel').classList.remove('sel');
			document.querySelector('.radioContentWrap .limitItem:nth-of-type(3)').classList.add('sel');
		}
	}

}

export default FirstSetLimit;

