import {React } from '../../utils/common';
import '../../assets/css/components/modules/SlideTypeB.css';
import PropTypes from 'prop-types';

const IMG_WIDTH = 306; // 이미지 가로
const IMG_HEIGHT = 180; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class SlideTypeB extends React.Component {
	constructor(props) {
		super(props);

		this.itemWidth = 306; // 슬라이드 가로 폭
		this.itemMargin = 40; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		this.state = {
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		}
	}
	componentWillMount() {
	
	}

	focusOn(index, _this){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;
		
		if(document.querySelectorAll('.slideWrap.activeSlide').length !== 0){
			document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
		}
		activeSlide.closest('.slideWrap').classList.add('activeSlide');

		if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else{
			activeSlide.closest('.contentGroup').classList.remove('activeSlide');
		}

		if(activeSlide.classList.contains('right')){
			slideIndex += 1;
			if(slideIndex + thisItems > slideLength - 1){
				slideIndex = slideLength - thisItems;
			}
		}else if(activeSlide.classList.contains('left')){
			slideIndex -= 1;
			if(this.state.slideTo === 0){
				slideIndex = 0;
			}
		}

		this.setState({
			slideTo: slideIndex
		});

		document.querySelector('.slideCon').scrollLeft = 0;
	}

	keyDown(_this, i, keyCode) {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;
		let direction = i;
		let targetIndex = _this;
		
		if(targetIndex === slideLength - 1 && direction === 39){
			slideIndex = 0;
			activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else if(targetIndex === 0 && direction === 37){
			slideIndex = slideLength - thisItems;
			activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
		}

		this.setState({
			slideTo: slideIndex
		});
	}

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeB">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeBItem
												image={data.image}
												title={data.title}
												currentState={data.currentState}
												key = {i}
												index = {i}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												event1={this.focusOn.bind(this, i)}
												event2={this.keyDown.bind(this, i)}
											/>
										)
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
SlideTypeB.propTypes = {
	loadFocus: PropTypes.string
};

class SlideTypeBItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event2(event.keyCode);
	}

	render() {
		return(
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<img src={this.props.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					{
						(this.props.title !== undefined ?  <span className="programTitle">{this.props.title}</span> : '')
					}
					{
						(this.props.currentState !== undefined ? <div className="loadingBar"><div className="currentState" style={{'width':this.props.currentState + "%"}}></div></div> : '')
					}
				</div>
			</div>
		)
	}
}

export default SlideTypeB;