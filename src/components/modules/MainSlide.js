import React, { Component } from 'react';
import '../../assets/css/components/modules/MainSlide.css';

let autoTimer, mainSlideEvent, mainSlideEvent1;

const IMG_WIDTH = 1920; // 이미지 가로
const IMG_HEIGHT = 390; // 이미지 세로

class MainSlide extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 1920; // 슬라이드 가로 폭
		this.items = 2; // 한 화면의 슬라이드 개수 1개 슬라이드의 경우 양쪽 2개의 슬라이드가 추가되므로 +1
		this.that = this;
		
		this.state = {
			slideTo:this.items,
			slideItem:this.props.slideInfo.slideItem
		};
	}
	
	componentWillMount() {
		let slideItemLength = this.state.slideItem.length;
		let data = [];
		
		data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
		for(let i = 0; i < this.items; i++){
			data[0].push(data[0][i]);
		}
		
		for(let i = 0; i < this.items; i++){
			data[0].unshift(data[0][slideItemLength - 1]);
		}
		
		this.setState({
			slideItem : data[0]
		});
	}
	
	focusOn(_this,index){
		clearTimeout(autoTimer);
		autoTimer = setTimeout(() => {
			document.querySelector('.mainSlide .slide.active + .slide .csFocus').focus();
		},3000);
		let classThis = this;
		let slideIndex = _this;
		let pageIndex = slideIndex;
		let eventFlag = true;
		
		// if(document.activeElement.querySelectorAll('.videoWrap').length){
		// 	let currentTime = document.activeElement.querySelector('video').currentTime;
		// 	let duration = document.activeElement.querySelector('video').duration;
		// 	if(duration === currentTime){
		// 		document.activeElement.querySelector('video').currentTime = 0;
		// 	}
		// 	document.activeElement.querySelector('video').play();
		// }
		
		document.querySelector('.mainSlide').classList.add('autoPlayStop');

		document.querySelector('.mainSlide .slideCon').scrollLeft = 0;
		
		if(document.querySelectorAll('.mainSlide .slideWrap.activeSlide').length){
			document.querySelector('.mainSlide .slideWrap.activeSlide').classList.remove('activeSlide');
		}
		document.querySelector('.mainSlide .slideWrap').classList.add('activeSlide');
		document.querySelector('.mainSlide').classList.add('focus');
		
		if(slideIndex + 1 >= (classThis.state.slideItem.length - 1)){
			pageIndex = classThis.items;
			document.querySelector('.mainSlide .slideWrapper').addEventListener('webkitTransitionEnd', mainSlideEvent1 = function(event){
				if(eventFlag){
					eventFlag = false;
					
					document.querySelector('.mainSlide .slideWrapper').classList.add('transitionNone');
					
					// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').length){
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').pause();
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ') video').play();
					// }
					
					document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ')').classList.add('active');
					document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ') .csFocus').focus();
					document.querySelector('.mainSlide .slideWrap .slideCon').scrollLeft = 0;
					slideIndex = classThis.items;
					classThis.setState({
						slideTo: slideIndex
					});
					
					document.querySelector('.mainSlide .slideWrapper').classList.remove('transitionNone');
					if(document.querySelectorAll('.mainSlide .clone.slide.active').length) document.querySelector('.mainSlide .clone.slide.active').classList.remove('active');
				}
				
				document.querySelector('.mainSlide .slideWrapper').removeEventListener('webkitTransitionEnd',mainSlideEvent1,true);
			}, true);
		}else if(slideIndex - 1 <= 0){
			pageIndex = classThis.state.slideItem.length - 3;
			document.querySelector('.mainSlide .slideWrapper').addEventListener('webkitTransitionEnd', mainSlideEvent = function(event){
				if(eventFlag){
					eventFlag = false;
					
					document.querySelector('.mainSlide .slideWrapper').classList.add('transitionNone');
					
					// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (slideIndex - 1) + ') video').length){
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex - 1) + ') video').pause();
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (pageIndex + 1)+ ') video').play();
					// }
					
					document.querySelector('.mainSlide .slide:nth-child(' + (pageIndex + 1)+ ')').classList.add('active');
					document.querySelector('.mainSlide .slide:nth-child(' + (pageIndex + 1)+ ') .csFocus').focus();
					document.querySelector('.mainSlide .slideWrap .slideCon').scrollLeft = 0;
					slideIndex = pageIndex;
					classThis.setState({
						slideTo: slideIndex
					});
					
					document.querySelector('.mainSlide .slideWrapper').classList.remove('transitionNone');
					if(document.querySelectorAll('.mainSlide .clone.slide.active').length) document.querySelector('.mainSlide .clone.slide.active').classList.remove('active');
				}
				
				document.querySelector('.mainSlide .slideWrapper').removeEventListener('webkitTransitionEnd',mainSlideEvent,true);
			}, true);
		}
		document.querySelector('.mainSlide .slidePage .on').classList.remove('on');
		document.querySelectorAll('.mainSlide .slidePage span')[pageIndex - 2].classList.add('on');
		if(document.querySelectorAll('.mainSlide .slide.active').length) document.querySelector('.mainSlide .slide.active').classList.remove('active');
		document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ')').classList.add('active');
		
		this.setState({
			slideTo: slideIndex
		});

		setTimeout(() => {
			// SpatialNavigation.resume();
		},300);
	}

	focusOut(_this,event){
	
	}

	keyDown(event){
		event.preventDefault();
		if(event.keyCode === 13) {
			if(event.target.closest('.mainSlide').classList.contains('half') === true) {
				event.target.closest('.mainSlide').classList.add('full');
			}
		}
		
		if(event.keyCode === 40 || event.keyCode === 38){
			if(event.keyCode === 40) document.querySelectorAll('.content .csFocus.left')[0].focus();
			document.querySelector('.mainSlide').classList.remove('autoPlayStop');
			document.querySelector('.mainSlide').classList.remove('half');
			document.querySelector('.mainSlide').classList.remove('focus');
			document.querySelector('.mainSlide').classList.remove('full');
			document.querySelector('.mainSlide .slideWrap').classList.remove('activeSlide');
			clearTimeout(autoTimer);
			
			if(!document.querySelectorAll('.home').length){
				this.mainSlideAutoPlay();
			}
		}
		
		// if(event.target.querySelectorAll('.videoWrap').length && (event.keyCode === 37 || event.keyCode === 39)){
		// 	let currentTime = event.target.querySelector('video').currentTime;
		// 	let duration = event.target.querySelector('video').duration;
		// 	if(duration === currentTime){
		// 		event.target.querySelector('video').currentTime = 0;
		// 	}
		// 	event.target.querySelector('video').pause();
		// }
	}
	
	mainSlideAuto(_this){
		if(document.querySelectorAll('.mainSlide').length && document.querySelector('.mainSlide').classList.contains('autoPlayStop')){
			document.querySelector('.mainSlide').classList.remove('autoPlayStop');
			if(!document.querySelectorAll('.home').length){
				this.mainSlideAutoPlay();
			}
		}
	}
	
	mainSlideAutoPlay(){
		let classThis = this;
		let slideIndex = this.state.slideTo;
		let timerDuration = 3000; // 자동롤링 기본 시간
		
		if(slideIndex + 1 >= (classThis.state.slideItem.length - 1)) slideIndex = classThis.items;
		
		if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').length){
			let currentTime = document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').currentTime;
			let duration = document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').duration;
			timerDuration = (duration - currentTime) * 1000;
			if(duration === currentTime){
				timerDuration = 3000;
			}else{
				document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').play();
			}
			autoTimer = setTimeout(classThis.mainSlideAutoPlayFn.bind(classThis),timerDuration);
		}else{
			autoTimer = setTimeout(classThis.mainSlideAutoPlayFn.bind(classThis),timerDuration);
		}

	}
	
	mainSlideAutoPlayFn(){
		let classThis = this;
		let slideIndex = classThis.state.slideTo;
		let pageIndex = slideIndex;
		let eventFlag = true;
		// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (slideIndex - 1) + ') video').length){
		// 	document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex - 1) + ') video').currentTime = 0;
		// }
		//
		// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').length){
		// 	document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 1) + ') video').currentTime = 0;
		// }
		
		if(slideIndex + 2 >= (classThis.state.slideItem.length - 1)){
			pageIndex = classThis.items - 1;
			document.querySelector('.mainSlide .slideWrapper').addEventListener('webkitTransitionEnd', mainSlideEvent = function(event){
				if(eventFlag){
					eventFlag = false;
					
					// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + slideIndex + ') video').length){
					// 	document.querySelector('.mainSlide .slide:nth-child(' + slideIndex + ') video').currentTime = 0;
					// 	document.querySelector('.mainSlide .slide:nth-child(' + slideIndex + ') video').pause();
					// }
					//
					// if(document.querySelectorAll('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ') video').length){
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ') video').currentTime = 0;
					// 	document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ') video').play();
					// }
					
					
					slideIndex = classThis.items;
					document.querySelector('.mainSlide .slideWrapper').classList.add('transitionNone');
					classThis.setState({
						slideTo: slideIndex
					});
					
					if(document.querySelectorAll('.mainSlide .slide.active').length) document.querySelector('.mainSlide .slide.active').classList.remove('active');
					document.querySelector('.mainSlide .slide:nth-child(' + (classThis.items + 1) + ')').classList.add('active');
					
					setTimeout(function(){
						document.querySelector('.mainSlide .slideWrapper').classList.remove('transitionNone');
					},200);
				}
				
				document.querySelector('.mainSlide .slideWrapper').removeEventListener('webkitTransitionEnd',mainSlideEvent,true);
			}, true);
		}
		document.querySelector('.mainSlide .slidePage .on').classList.remove('on');
		document.querySelectorAll('.mainSlide .slidePage span')[pageIndex - 1].classList.add('on');
		if(document.querySelectorAll('.mainSlide .slide.active').length) document.querySelector('.mainSlide .slide.active').classList.remove('active');
		if(slideIndex + 2 >= (classThis.state.slideItem.length - 1)){
			document.querySelector('.mainSlide .slide.clone + .slide:not(.clone)').classList.add('active');
			this.setState({
				slideTo:this.items
			});
		}else{
			document.querySelector('.mainSlide .slide:nth-child(' + (slideIndex + 2) + ')').classList.add('active');
			this.setState({
				slideTo:slideIndex+1
			});
		}
		
		if(!document.querySelectorAll('.home').length){
			this.mainSlideAutoPlay();
		}
	}

	render() {
		return (
			<div className="contentGroup">
				<div className={this.state.slideItem[0].videoF !== undefined ? "mainSlide OAP" : "mainSlide"}>
					<div className="slideWrap">
						<div className="slideCon">
							{
								this.state.slideItem[this.state.slideTo].video === undefined ?
									<span className="keyWrap">
										<span className="keyOk"><span className="iconOk"></span>상세화면 보기</span>
									</span>
									:
									<span className="videoContentWrap">
										<span className="videoWrap">
											{/*<video autoPlay={false} muted>*/}
												{/*<source src={this.props.video} type="video/mp4" />*/}
											{/*</video>*/}
											<span className="keyWrap">
												<span className="keyOk"><span className="iconOk"></span>전체화면 보기</span>
											</span>
										</span>
									</span>
							}
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':this.state.slideItem.length * this.itemWidth}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<MainslideItem
												title={data.title}
												bgColor={data.bgColor}
												imageN={data.imageN}
												imageS={data.imageS}
												video={data.video}
												key={i}
												index={i}
												items={this.items}
											    maxLength={this.state.slideItem.length}
												event1={this.focusOn.bind(this, i)}
												event2={this.focusOut.bind(this, i)}
												event3={this.keyDown.bind(this)}
											/>
										)
									})
								}
							</div>
						</div>
						<div className="slideLeft"></div>
						<div className="slideRight"></div>
						<div className="slidePage">
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Mount
	 */
	componentDidMount() {
		let slidePage = document.querySelector('.slidePage');
		let that = this;
		
		for(let i = 1; i <= this.state.slideItem.length - 4; i++){
			if(i === 1){
				slidePage.insertAdjacentHTML('beforeend','<span class="on"></span>');
			}else{
				slidePage.insertAdjacentHTML('beforeend','<span></span>');
			}
		}
		
		if(!document.querySelectorAll('.home').length){
			if(document.querySelectorAll('.mainSlide video').length){
				document.querySelectorAll('.mainSlide video')[document.querySelectorAll('.mainSlide video').length - 1].onloadeddata = () =>{
					that.mainSlideAutoPlay();
				}
			}else{
				that.mainSlideAutoPlay();
			}
		}
		
		document.querySelector('.mainSlide .slide:nth-child(' + (this.state.slideTo + 1) + ')').classList.add('active');
		
		if(document.querySelectorAll('.mainBg').length){
			document.querySelector('.mainBg img').src = '/assets/images/home/bg_silver_pip.png';
		}
		
		// document.addEventListener('keydown', this.mainSlideAuto.bind(this.that));
	}

	componentWillUnmount() {
		// console.log('MainSlide Bye. ');
		clearInterval(autoTimer);
	}

	/**
	 * Update
	 */
	componentWillUpdate() {
		// console.log('MainSlide componentWillUpdate');
	}

	componentDidUpdate() {
		// console.log('MainSlide componentDidUpdate');
	}
}

class MainslideItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}
	
	focusOut(event){
		this.props.event2(event);
	}

	keyDown(event){
		this.props.event3(event);
	}
	
	render() {
		return(
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide clone":"slide"}>
				<div className="csFocus" onFocus={this.focusOn.bind(this)} onBlur={this.focusOut.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					{
						this.props.video !== undefined ?
							<span className="imgWrap">
								<img src={this.props.imageN} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="nor" />
								<img src={this.props.imageS} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="sel" />
							</span>
							:
							<span className="imgWrap onlyImg">
								<img src={this.props.imageN} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" className="nor" />
							</span>
					}
				</div>
			</div>
		)
	}
}

export default MainSlide;