import {React, Link, fnScrolling } from '../../../utils/common';
import '../../../assets/css/routes/kids/character/CharacterHome.css';
import CharacterSlide from '../../../assets/json/routes/kids/character/CharacterHome.json';
import KidsWidget from 'routes/kids/widget/KidsWidget';
import appConfig from './../../../config/app-config';

let dataSample;

export default class extends React.Component {
	constructor(props) {
		super(props);
		
		this.itemWidth = 366; // 슬라이드 가로 폭
		this.slideTo = 3; // 이전 다음 clone 개수
		
		this.state = {
			slideItem: CharacterSlide,
			slideTo:this.slideTo
		};
		if(this.props.type === "sampleNoSetting"){
			dataSample = {
				"default": "fade",
				"motion": "",
				"setting": false,
				"timeText": "남은시간",
				"timeLimit": "3600",
				"episodeLimit": "",
				"character": "pororo",
				"widgetText": "다빈, 다솔 친구야,<br />유치원 갈 시간이야~"
			}
		}
		
		if(this.props.type === "sampleCharacter"){
			dataSample = {
				"default": "",
				"motion": "characterMotion",
				"setting": true,
				"timeText": "남은시간",
				"timeLimit": "3600",
				"episodeLimit": "",
				"character": "pororo",
				"widgetText": "다빈, 다솔 친구야,<br />유치원 갈 시간이야~"
			}
		}
		
		if(this.props.type === "sampleBalloon"){
			dataSample = {
				"default": "fade",
				"motion": "fullMotion",
				"setting": true,
				"timeText": "남은시간",
				"timeLimit": "3600",
				"episodeLimit": "",
				"character": "pororo",
				"widgetText": "다빈, 다솔 친구야,<br />유치원 갈 시간이야~"
			}
		}
		
		if(this.props.type === "sampleEpisode"){
			dataSample = {
				"default": "",
				"motion": "",
				"setting": true,
				"timeText": "남은시간",
				"timeLimit": "3600",
				"episodeLimit": "10",
				"character": "pororo",
				"widgetText": "다빈, 다솔 친구야,<br />유치원 갈 시간이야~"
			}
		}
		
		if(this.props.type === "sampleEnd"){
			dataSample = {
				"default": "",
				"motion": "",
				"setting": true,
				"timeText": "남은시간",
				"timeLimit": "300",
				"episodeLimit": "",
				"character": "pororo",
				"widgetText": "다빈, 다솔 친구야,<br />유치원 갈 시간이야~"
			}
		}
	}
	
	componentWillMount() {
		let slideItemLength = this.state.slideItem.length;
		let data = [];
		
		data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
		for(let i = 0; i < this.slideTo; i++){
			data[0].push(data[0][i]);
		}
		
		for(let i = 0; i < this.slideTo; i++){
			data[0].unshift(data[0][slideItemLength - 1]);
		}
		
		this.setState({
			slideItem : data[0]
		});
	}
	
	onFocus(index, _this){
		// clearTimeout(SpatialTimer);
		// SpatialNavigation.pause();
		// SpatialTimer = setTimeout(() => {
		// 	SpatialNavigation.resume();
		// },300);
		document.querySelector('.characterSlideWrap').classList.add('focus');
		if(document.querySelectorAll('.defaultFocus').length !== 0){
			document.querySelector('.defaultFocus').classList.remove('defaultFocus');
		}
		_this.target.classList.add('defaultFocus');
		_this.target.closest('.slide').classList.add('active');
		_this.target.closest('.slide').previousSibling.classList.add('left');
		_this.target.closest('.slide').nextSibling.classList.add('right');
		
		let classThis = this;
		let slideIndex = index;
		let slideLength = this.state.slideItem.length;
		let thisSlideTo = this.slideTo;
		let eventFlag = true;
		
		document.querySelector('.characterSlide').addEventListener('webkitTransitionEnd', function(event){
			if(eventFlag){
				eventFlag = false;

				if(slideIndex >= slideLength - thisSlideTo){
					slideIndex = thisSlideTo;
					document.querySelector('.characterSlide').classList.add('transitionNone');
					document.querySelectorAll('.characterSlide .slide')[slideIndex].querySelector('.csFocusCenter').focus();
				}
				if(slideIndex <= thisSlideTo - 1){
					slideIndex = slideLength - thisSlideTo - 1;
					document.querySelector('.characterSlide').classList.add('transitionNone');
					document.querySelectorAll('.characterSlide .slide')[slideIndex].querySelector('.csFocusCenter').focus();
				}

				classThis.setState({
					slideTo: slideIndex
				});

				if(document.querySelectorAll('.characterSlide.transitionNone').length !== 0){
					document.querySelector('.characterSlide.transitionNone').classList.remove('transitionNone');
				}
			}
		});
		
		document.querySelector('.characterSlideInner').scrollLeft = 0;
		
		this.setState({
			slideTo: slideIndex
		});
	}
	
	onBlur(_this){
		document.querySelector('.characterSlideWrap').classList.remove('focus');
		_this.target.closest('.slide').classList.remove('active');
		_this.target.closest('.slide').previousSibling.classList.remove('left');
		_this.target.closest('.slide').nextSibling.classList.remove('right');
	}

	render() {
		return (
			<div className="characterHome">
				<div className="kidsMenu">
					<div className="gnbInfo">메뉴</div>
					<ul>
						<li>
							<a className="csFocus" href="/">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu1-default.png`} className="default" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu1-active.png`} className="active" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu1-focus.png`} className="focus" alt="" />
								월정액
							</a>
						</li>
						<li>
							<a className="csFocus" href="/">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu2-default.png`} className="default" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu2-active.png`} className="active" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu2-focus.png`} className="focus" alt="" />
								전체장르
							</a>
						</li>
						<li>
							<a className="csFocus active loadFocus" href="/">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu3-default.png`} className="default" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu3-active.png`} className="active" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu3-focus.png`} className="focus" alt="" />
								캐릭터 홈
							</a>
						</li>
						<li>
							<a className="csFocus" href="/">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu4-default.png`} className="default" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu4-active.png`} className="active" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu4-focus.png`} className="focus" alt="" />
								놀이학습
							</a>
						</li>
						<li>
							<a className="csFocus" href="/">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu5-default.png`} className="default" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu5-active.png`} className="active" alt="" />
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/menu/menu5-focus.png`} className="focus" alt="" />
								채널
							</a>
						</li>
					</ul>
					{console.log(dataSample)}
					<KidsWidget sampleData={dataSample} />
				</div>
				<div className="characterSlideWrap scrollWrap">
					<div className="dim"></div>
					<div className="characterSlideInner">
						<div className="contentGroup">
							<div className="characterSlide" style={{'--slidePage':this.state.slideTo,'width':this.state.slideItem.length * this.itemWidth}}>
								{this.state.slideItem.map((data,i) => {
									return(
										<div className={i < this.slideTo || i >= this.state.slideItem.length - this.slideTo ? "slide clone" : "slide"} key={i}>
											<Link to="/" className="csFocusCenter" onFocus={this.onFocus.bind(this, i)} onBlur={this.onBlur.bind(this)}>
												<img src={data.bg} alt="" />
												{data.new === true && <img src={data.newImg} className="new" alt="" />}
												{data.btv === true && <img src={data.btvImg} className="btv" alt="" />}
												{data.event === true && <img src={data.eventImg} className="event" alt="" />}
												<div className="focusContent">
													<img src={data.focusBg} alt=""/>
													{data.new === true && <img src={data.newFocusImg} className="new" alt="" />}
													{data.btv === true && <img src={data.btvFocusImg} className="btv" alt="" />}
													{data.event === true && <img src={data.eventFocusImg} className="event" alt="" />}
													{data.follwUp === true &&
														<div className="follwUp">
															<img src={`${appConfig.headEnd.LOCAL_URL}/kids/character/img-bottom-gradient.png`} alt=""/>
															<div className="follwUpCon">
																<img src={data.follwUpImage} alt="" />
																<div className="follwUpText">
																	<span>이어보기</span>
																	<div className="title">{data.follwUpTitle}</div>
																	<span className="follwUpGo">바로가기</span>
																</div>
															</div>
														</div>
													}
												</div>
											</Link>
										</div>
									)}
								)}
							</div>
						</div>
					</div>
					<img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-left.png`} className="leftArrow" alt=""/>
					<img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-right.png`} className="rightArrow" alt=""/>
					<div className="btnInfo">
						<img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/option-icon.png`} alt="" />
						캐릭터 전체보기
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		document.querySelector('.characterSlideWrap .slide.clone + .slide:not(.clone) .csFocusCenter').classList.add('defaultFocus');
		fnScrolling();
	}

}