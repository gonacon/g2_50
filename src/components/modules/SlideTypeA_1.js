import {React, $, Link } from '../../utils/common';
import '../../assets/css/components/modules/SlideTypeA.css';
import PropTypes from 'prop-types';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 4; // 메뉴별 아이템 개수

class SlideTypeA_1 extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 113; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
		
		this.state = {
			// slideTo:this.items,
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		}
	}
	
	componentWillMount() {
		// let slideItemLength = this.state.slideItem.length;
		// let data = [];
		//
		// data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
		//
		// for(let i = 0; i < this.items; i++){
		// 	data[0].push(data[0][i]);
		// }
		//
		// for(let i = 0; i < this.items; i++){
		// 	data[0].unshift(data[0][slideItemLength - 1]);
		// }
		//
		// this.setState({
		// 	slideItem : data[0]
		// });
	}
	
	focusOn(index, _this){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = $(document.activeElement);
		
		$('.slideWrap').removeClass('activeSlide');
		activeSlide.closest('.slideWrap').addClass('activeSlide');
		
		if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
			activeSlide.closest('.contentGroup').addClass('activeSlide');
		}else{
			activeSlide.closest('.contentGroup').removeClass('activeSlide');
		}
		
		if(activeSlide.hasClass('right')){
			slideIndex += 1;
			if(slideIndex + thisItems > slideLength - 1){
				slideIndex = slideLength - thisItems;
			}
		}else if(activeSlide.hasClass('left')){
			slideIndex -= 1;
			if(this.state.slideTo === 0){
				slideIndex = 0;
			}
		}
		
		// activeSlide.closest('.slideWrapper').one('webkitTransitionEnd', function(event){
		// 	if(index === slideLength - thisItems){
		// 		activeSlide.closest('.slideWrapper').addClass('transitionNone');
		// 		slideIndex = thisItems - (thisItems - 1);
		// 		activeSlide.closest('.slideWrapper').find('.slide:eq(' + thisItems + ') .csFocus').focus();
		// 	}else if(index === 0){
		// 		activeSlide.closest('.slideWrapper').addClass('transitionNone');
		// 		slideIndex = (thisItems * 2) - 1;
		// 		activeSlide.closest('.slideWrapper').find('.slide:eq(' + slideIndex + ') .csFocus').focus();
		// 		activeSlide.closest('.contentGroup').addClass('activeSlide');
		// 	}else{
		// 		slideIndex = classThis.state.slideTo;
		// 	}
		//
		// 	classThis.setState({
		// 		slideTo: slideIndex
		// 	});
		//
		// 	setTimeout(function(){
		// 		activeSlide.closest('.slideWrapper').removeClass('transitionNone');
		// 	},100);
		// });
		
		this.setState({
			slideTo: slideIndex
		});
		
		$('.slideCon').scrollLeft(0);
	}
	
	focusOut(){
		$('.contentGroup').removeClass('activeSlide');
	}
	
	keyDown(_this, i, keyCode) {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = $(document.activeElement);
		let direction = i;
		
		if(activeSlide.closest('.slide').index() === slideLength - 1 && direction === 39){
			slideIndex = 0;
			activeSlide.closest('.slideWrapper').find('.slide:first-child .csFocus').focus();
			activeSlide.closest('.contentGroup').addClass('activeSlide');
		}else if(activeSlide.closest('.slide').index() === 0 && direction === 37){
			slideIndex = slideLength - thisItems;
			activeSlide.closest('.slideWrapper').find('.slide:last-child .csFocus').focus();
		}
		
		// $('div[class^="slideType"] .csFocus').on('sn:navigatefailed',function(e){
		// 	console.log(classThis);
		// 	if(e.detail.direction === 'right'){
		// 		slideIndex = 0;
		// 		$(this).closest('.slideWrapper').find('.slide:first-child .csFocus').focus();
		// 	}else if(e.detail.direction === 'left'){
		// 		slideIndex = classThis.state.slideItem.length - classThis.items;
		// 		$(this).closest('.slideWrapper').find('.slide:last-child .csFocus').focus();
		// 	}
		//
		// });
		
		this.setState({
			slideTo: slideIndex
		});
	}
	
	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeA">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeAItem
												imageURL={data.image}
												link={data.link}
												title={data.title}
												key={i}
												index={i}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												event1={this.focusOn.bind(this, i)}
												event2={this.focusOut.bind(this, i)}
												event3={this.keyDown.bind(this, i)}
											/>
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
		);
	}
}

SlideTypeA_1.propTypes = {
	loadFocus: PropTypes.string
};

class SlideTypeAItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}
	
	focusOut(...args){
		this.props.event2(this, ...args);
	}
	
	keyDown(event){
		this.props.event3(event.keyCode);
	}
	
	render() {
		return(
			//<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide clone":"slide"}>
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<Link to="/home/genre/Type1" className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onBlur={this.focusOut.bind(this)} onKeyDown={this.keyDown.bind(this)}><img src={this.props.imageURL} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/><span className="slideTitle">{this.props.title}</span></Link>
			</div>
		)
	}
}


export default SlideTypeA_1;