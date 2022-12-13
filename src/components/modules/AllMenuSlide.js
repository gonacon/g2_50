import {React, Link } from '../../utils/common';
import '../../assets/css/components/modules/AllMenuSlide.css';

import { VerticalList, HorizontalList, Focusable } from '../../supporters/navigation';

const SLIDEITEMS = 4; // 메뉴별 아이템 개수

class AllMenuSlide extends React.Component {
	constructor(props) {
		super(props);
		
		this.itemHeight = 144; // 슬라이드 세로 폭
		this.menuLine = 3; // 이전 다음 clone 개수
		
		this.state = {
			menuTo:this.menuLine,
			slideItem:this.props.slideInfo,
			active: false
		};
	}
	
	componentWillMount() {
		let slideItemLength = this.state.slideItem.length;
		let data = [];
		
		data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
		for(let i = 0; i < this.menuLine; i++){
			data[0].push(data[0][i]);
		}
		
		for(let i = 0; i < this.menuLine; i++){
			data[0].unshift(data[0][slideItemLength - 1]);
		}
		
		this.setState({
			slideItem : data[0]
		});
	}
	
	focusOn(_this,index,childIndex,childSlideTo){
///--		
/*		
		let classThis = this;
		let slideIndex = _this;
		let slideLength = this.state.slideItem.length;
		let thisMenuLine = this.menuLine;
		let eventFlag = true;
		
		document.querySelector('.allMenuCon').addEventListener('webkitTransitionEnd', function(event){
			if(eventFlag){
				eventFlag = false;
				
				if(slideIndex >= slideLength - thisMenuLine){
					slideIndex = thisMenuLine;
					document.querySelector('.allMenuCon').classList.add('transitionNone');
					if(typeof(childIndex) === 'number'){
						document.querySelectorAll('.allMenuCon .slideWrap')[slideIndex].querySelectorAll('.csFocus')[childIndex].focus();
					}else{
						document.querySelectorAll('.allMenuCon .slideWrap')[slideIndex].querySelector('.allMenuDepth1 a').focus();
					}
				}
				if(slideIndex <= thisMenuLine - 1){
					slideIndex = slideLength - thisMenuLine - 1;
					document.querySelector('.allMenuCon').classList.add('transitionNone');
					if(typeof(childIndex) === 'number'){
						document.querySelectorAll('.allMenuCon .slideWrap')[slideIndex].querySelectorAll('.csFocus')[childIndex].focus();
					}else{
						document.querySelectorAll('.allMenuCon .slideWrap')[slideIndex].querySelector('.allMenuDepth1 a').focus();
					}
				}
				
				classThis.setState({
					menuTo: slideIndex
				});
				
				if(document.querySelectorAll('.allMenuCon.transitionNone').length !== 0){
					document.querySelector('.allMenuCon.transitionNone').classList.remove('transitionNone');
				}
			}
		});

		this.setState({
			menuTo: slideIndex
		});
		
		if(document.querySelectorAll('.slideWrap.active').length !== 0){
			document.querySelector('.slideWrap.active').classList.remove('active');
		}
		if(document.querySelectorAll('.slideWrap.type1').length !== 0){
			document.querySelector('.slideWrap.type1').classList.remove('type1');
		}
		document.activeElement.closest('.slideWrap').classList.add('active');
		
		document.activeElement.closest('.slideWrap').previousSibling.classList.add('type1');
		document.activeElement.closest('.slideWrap').nextSibling.classList.add('type1');
		document.querySelector('.allMenu .contentGroup').scrollTop = 0;
*/		
	}
	
	keyDown(event) {
///--
/*		
		let activeSlide = document.activeElement;
		let direction = event.keyCode;
		
		if(activeSlide.classList.contains('csFocusMenu') && direction === 37){
			activeSlide.closest('.slideWrap').querySelector('.csFocus:last-child').focus();
		}
*/		
	}


	///--
	/// backup code
	/*
	<Link to={data.link} className={"csFocusMenu " + data.class} onFocus={this.focusOn.bind(this, i)} onKeyDown={this.keyDown.bind(this)}>
			<span className="title" style={{'WebkitBoxOrient':'vertical'}}>
				{data.depth1}
			</span>
	</Link>
	*/

	render() {
		return (
			<div className="allMenuCon" style={{'--menuLine':this.state.menuTo,'height':this.state.slideItem.length * this.itemHeight}}>
				{this.state.slideItem.map((data, i) => {
					return(
						<div className={i < this.menuLine || i >= this.state.slideItem.length - this.menuLine ? "slideWrap clone " + data.class:"slideWrap " + data.class} key={i}>
							<HorizontalList navDefault>
								<div className="allMenuDepth1">
									<Focusable onFocus={() => this.setState({active: true})} onBlur={() => this.setState({active: false})} navDefault>
										<Link to={data.link} className={"csFocusMenu " + data.class} onFocus={this.focusOn(this, i)} onKeyDown={this.keyDown.bind(this)}>
												<span className="title" style={{'WebkitBoxOrient':'vertical'}}>
													{data.depth1}
												</span>
										</Link>
									</Focusable>
								</div>
								<div className="slideCon">
									<MenuContents
										depth2={data.depth2}
										key={i}
										index={i}
										maxLength={this.state.slideItem.length}
										event1={this.focusOn.bind(this, i)}
									/>
								</div>
								{SLIDEITEMS < data.depth2.length ? <div className="slideLeft"></div> : ''}
								{SLIDEITEMS < data.depth2.length ? <div className="slideRight"></div> : ''}
							</HorizontalList>
						</div>
					)}
				)}
			</div>
		);
	}

	/**
	 * Mount
	 */
	componentDidMount() {
		document.querySelector('.allMenuCon .slideWrap.clone + .slideWrap:not(.clone)').classList.add('active');
	///--
	/*	
		document.querySelector('.allMenuCon .slideWrap.active .allMenuDepth1 a').focus();
		
		let thisSlideIndex;
		let nextSlideIndex;
		let csFocusEvent = document.querySelectorAll('.allMenuCon .csFocus');
		
		function willUnFocus(csFocusEvent){
			for(let k = 0; k < document.querySelectorAll('.slideWrap').length; k++){
				if(document.querySelectorAll('.slideWrap')[k] === csFocusEvent.closest('.slideWrap')){
					thisSlideIndex = k;
					break;
				}
			}
		}
		
		function willFocus(event,csFocusEvent){
			for(let m = 0; m < document.querySelectorAll('.slideWrap').length; m++){
				if(document.querySelectorAll('.slideWrap')[m] === csFocusEvent.closest('.slideWrap')){
					nextSlideIndex = m;
					break;
				}
			}
			
			if(event.detail.direction === 'down' && thisSlideIndex + 2 <= nextSlideIndex){
				event.preventDefault();
				document.querySelectorAll('.allMenuCon .slideWrap')[nextSlideIndex - 1].querySelector('.csFocus:last-child').focus();
			}
			if(event.detail.direction === 'up' && thisSlideIndex - 2 >= nextSlideIndex){
				event.preventDefault();
				document.querySelectorAll('.allMenuCon .slideWrap')[nextSlideIndex + 1].querySelector('.csFocus:last-child').focus();
			}
		}
		
		for(let i = 0; i < csFocusEvent.length; i++){
			csFocusEvent[i].addEventListener('sn:willunfocus', willUnFocus(csFocusEvent[i]));
			csFocusEvent[i].addEventListener('sn:willfocus', function(event){willFocus(event,csFocusEvent[i])});
		}
	*/
	}

	componentWillUnmount() {
	
	}

	/**
	 * Update
	 */
	componentWillUpdate() {
	
	}

	componentDidUpdate() {
	
	}
}

class MenuContents extends React.Component {
	constructor(props) {
		super(props);
		
		this.itemWidth = 330; // 슬라이드 가로 폭
		this.Items = SLIDEITEMS; // 슬라이드 개수
		
		this.state = {
			slideTo:0,
			slideItem:this.props.depth2,
			active: false
		};
	}
	
	focusOn(_this, ...args){
		// SpatialNavigation.disable('csFocusMenu');
		let thisClass = this;
		let slideIndex = thisClass.state.slideTo;
		let activeSlide = document.activeElement;
		let thisItems = this.Items;
		let slideLength = this.state.slideItem.length;
		
		if(_this === slideLength - 1 && slideLength > 4){
			slideIndex = slideLength - thisItems;
		}
		
		if(activeSlide.classList.contains('right')){
			slideIndex += 1;
			if(slideIndex + thisItems > slideLength - 1){
				slideIndex = slideLength - thisItems;
			}
		}else if(activeSlide.classList.contains('left')){
			slideIndex -= 1;
		}
		
		thisClass.setState({
			slideTo: slideIndex
		});
		
		for(let i = 0; i < document.querySelectorAll('.allMenuCon .slideCon').length; i++){
			document.querySelectorAll('.allMenuCon .slideCon')[i].scrollLeft = 0;
		}
		
		if(!activeSlide.closest('.slideWrap').classList.contains('clone')){
			let activeClass = activeSlide.closest('.slideWrap').classList.value;
			activeClass = activeClass.replace(' ','');
			activeClass = activeClass.replace('slideWrap','');
			activeClass = activeClass.replace('active','');
			activeClass = activeClass.replace('type1','');
			
			if(document.querySelectorAll('.slideWrap.clone.' + activeClass).length !== 0){
				let slideWidth = document.querySelector('.slideWrap.clone.' + activeClass + ' .slideWrapper').offsetWidth;
				document.querySelector('.slideWrap.clone.' + activeClass + ' .slideWrapper').setAttribute('style','--page:' + slideIndex + ';width:' + slideWidth + 'px;');
			}
		}
		
		this.props.event1(this, _this, slideIndex, ...args);
	}
	
	keyDown(_this, event){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let activeSlide = document.activeElement;
		let direction = event.keyCode;
		
		if((_this === slideLength - 1 && direction === 39) || (_this === 0 && direction === 37)){
			slideIndex = 0;
			activeSlide.closest('.slideWrap').querySelector('.csFocusMenu').focus();
			// setTimeout(function(){
			// 	SpatialNavigation.enable('csFocusMenu');
			// },1);
		}
		
		this.setState({
			slideTo: slideIndex
		});
	}
	
	render() {
		return(
			<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length) * this.itemWidth}}>
				{this.props.depth2.map((data,i) => {
					return(
						<Focusable onFocus={() => this.setState({active: true})} onBlur={() => this.setState({active: false})}>
							<Link to={data.link} className={i === this.Items + this.state.slideTo - 1 ? "csFocus right": i === this.state.slideTo - 1 ? "csFocus left" : "csFocus"} onFocus={this.focusOn.bind(this, i)} onKeyDown={this.keyDown.bind(this, i)} key={i}>
								<span className="title" style={{'WebkitBoxOrient':'vertical'}}>
									{data.title}
								</span>
								{data.bg !== "" ?
									<img src={data.bg} alt="" />
									:
									""
								}
							</Link>
						</Focusable>
					)
				})}
			</div>
		)
	}
}

export default AllMenuSlide;