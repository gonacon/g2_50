import {React, Link, fnScrolling} from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/FirstSetLimit.css';
import '../../../assets/css/routes/kids/setting/FirstSetCharacter.css';

import FirstSetCharacterData from '../../../assets/json/routes/kids/setting/FirstSetCharacterData.json';

const IMG_WIDTH = 273; // 이미지 가로
const IMG_HEIGHT = 285; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class FirstSetCharacter extends React.Component {
	constructor(props) {
		super(props);

		this.itemWidth = 273; // 슬라이드 가로 폭
		this.itemMargin = 12; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
		this.slideClone = 3; // 이전 다음 clone 개수

		this.state = {
			contents : FirstSetCharacterData,
			slideItem : FirstSetCharacterData.slideItem,
			slideTo : this.slideClone

		}
	}

	componentWillMount() {
		let slideItemLength = this.state.slideItem.length;
		let data = [];

		data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
		for(let i = 0; i < this.slideClone; i++){
			data[0].push(data[0][i]);
		}

		for(let i = 0; i < this.slideClone; i++){
			data[0].unshift(data[0][slideItemLength - 1]);
		}

		this.setState({
			slideItem : data[0]
		});
	}

	focusOn(index, _this){
		document.querySelector('.characterListSlide').classList.add('focus');
		if(document.querySelectorAll('.defaultFocus').length !== 0){
			document.querySelector('.defaultFocus').classList.remove('defaultFocus');
		}
		_this.target.classList.add('defaultFocus');
		_this.target.closest('.slide').classList.add('active');

		if( _this.target.closest('.slide').classList.contains('active') ){
			_this.target.closest('.slideWrapper').classList.add('active')
		} else {
			_this.target.closest('.slideWrapper').classList.remove('active')
		}

		let classThis = this;
		let slideIndex = index;
		let slideLength = this.state.slideItem.length;
		let thisSlideTo = this.slideClone;
		let eventFlag = true;

		document.querySelector('.slideWrapper').addEventListener('webkitTransitionEnd', function(event){
			if(eventFlag){
				eventFlag = false;

				if(slideIndex >= slideLength - thisSlideTo){
					slideIndex = thisSlideTo;
					document.querySelector('.slideWrapper').classList.add('transitionNone');
					document.querySelectorAll('.slideWrapper .slide')[slideIndex].querySelector('.csFocusCenter').focus();
				}
				if(slideIndex <= thisSlideTo - 1){
					slideIndex = slideLength - thisSlideTo - 1;
					document.querySelector('.slideWrapper').classList.add('transitionNone');
					document.querySelectorAll('.slideWrapper .slide')[slideIndex].querySelector('.csFocusCenter').focus();
				}

				classThis.setState({
					slideTo: slideIndex
				});

				if(document.querySelectorAll('.slideWrapper.transitionNone').length !== 0){
					document.querySelector('.slideWrapper.transitionNone').classList.remove('transitionNone');
				}
			}
		});

		for(let i=0; i<document.querySelectorAll('.slide').length; i++){
			document.querySelectorAll('.slide')[i].classList.remove('left');
			document.querySelectorAll('.slide')[i].classList.remove('right');
		}

		if(_this.target.closest('.slide.active').previousSibling.previousSibling.previousSibling !== null) {
			_this.target.closest('.slide.active').previousSibling.previousSibling.previousSibling.classList.add('left');
		}

		if(_this.target.closest('.slide.active').nextSibling.nextSibling.nextSibling !== null) {
			_this.target.closest('.slide.active').nextSibling.nextSibling.nextSibling.classList.add('right');
		}

		_this.target.closest('.slide.active').previousSibling.previousSibling.classList.add('left');
		_this.target.closest('.slide.active').previousSibling.classList.add('left');
		_this.target.closest('.slide.active').nextSibling.classList.add('right');
		_this.target.closest('.slide.active').nextSibling.nextSibling.classList.add('right');

		document.querySelector('.slideCon').scrollLeft = 0;

		this.setState({
			slideTo: slideIndex
		});
	}



	focusOut(index, _this){
		document.querySelector('.characterListSlide').classList.remove('focus');
		_this.target.closest('.slide').classList.remove('active');

		if( _this.target.closest('.slide').classList.contains('active') ){
			_this.target.closest('.slideWrapper').classList.add('active')
		} else {
			_this.target.closest('.slideWrapper').classList.remove('active')
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="mainBg"><img src={this.state.contents.mainBg} alt="" /></div>
				<div className="firstSetLimitWrap">
					<div className="setStep">
						<ul>
							<li className="on">1</li>
							<li>2</li>
							<li>3</li>
							<li>4</li>
						</ul>
					</div>
					<div className="setLimitTitleWrap">
						<p className="title">새로워진 키즈존에 오신 것을 환영해요!</p>
						<p className="subTitle">Btv 키즈존에서 함께 할 친구를 골라보세요.</p>
					</div>
					<div className="characterListWrap scrollWrap">
						<div className="contentGroup">
							<div className="characterListSlide">
								<div className="slideWrap">
									<div className="slideCon">
										<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':this.state.slideItem.length * this.itemWidth}}>
											{
												this.state.slideItem.map((data, i) => {
													return(
														<div className={i < this.slideClone || i >= this.state.slideItem.length - this.slideClone ? "slide clone" : "slide"} key={i}>
															<span className="comeon"></span>
															<Link to="/home/genre/Type1" className="csFocusCenter" tabIndex="-1" onFocus={this.focusOn.bind(this, i)} onBlur={this.focusOut.bind(this, i)}>

																<img src={data.norImage} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="norImage" />
																<img src={data.selImage} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="selImage" />
																<img src={data.focImage} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="focImage" />
																<span className="slideTitle">{data.title}</span>
															</Link>
														</div>
													);
												})
											}
										</div>
									</div>
									<div className="leftArrow"></div>
									<div className="rightArrow"></div>
								</div>
							</div>
						</div>
					</div>
					<div className="btnBottomWrap">
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
		document.querySelector('.characterListSlide .slide.clone + .slide:not(.clone) .csFocusCenter').classList.add('defaultFocus');
		document.querySelector('.characterListSlide .csFocusCenter.defaultFocus').classList.add('loadFocus');
		fnScrolling();
	}

}


export default FirstSetCharacter;

