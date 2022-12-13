import {React, ReactDOM} from '../../utils/common';
import {getByteLength} from "../../utils/UI";
import SlideTypeA from './SlideTypeA';
import '../../assets/css/components/modules/SlideTypeAD.css';


const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class SlideTypeAD extends SlideTypeA {
	constructor(props) {
		super(props);
		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 40; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
		
		this.state = {
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		}
	}
	
	componentWillMount() {
		if(this.props.allView){
            let data = [];
			let first = {
                "title": "전체보기",
                "link": "/"
            };
            data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
            data[0].unshift(first);

            console.log(data);
            this.setState({
                slideItem : data[0]
            });
		}
	}
	
	focusOn(index, _this){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;
		let activeIndex = index + 1;

		if(document.querySelectorAll('.slideWrap.activeSlide').length !== 0){
			document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
		}
		activeSlide.closest('.slideWrap').classList.add('activeSlide');

		if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else{
			activeSlide.closest('.contentGroup').classList.remove('activeSlide');
		}

		if(index === 0) {
			activeSlide.closest('.slideWrap').classList.remove('lastActive');
			activeSlide.closest('.slideWrap').classList.add('firstActive');
		}else if(index === slideLength - 1) {
			activeSlide.closest('.slideWrap').classList.remove('firstActive');
			activeSlide.closest('.slideWrap').classList.add('lastActive');
		}else {
			activeSlide.closest('.slideWrap').classList.remove('firstActive', 'lastActive');
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
			slideTo: slideIndex,
			activeSlide:activeIndex
		});
		
		document.querySelector('.slideCon').scrollLeft = 0;
	}
	
	focusOut(){
		if(document.querySelectorAll('.contentGroup.activeSlide').length !== 0){
			document.querySelector('.contentGroup.activeSlide').classList.remove('activeSlide');
		}
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
				<div className="slideTypeAD">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeADItem
												imageURL={data.image}
												title={data.title}
												key={i}
												index={i}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												allView={this.props.allView}
												event1={this.focusOn.bind(this, i)}
												event3={this.keyDown.bind(this, i)}
											/>
										);
									})
								}
							</div>
						</div>
						<div className="slideCount"><span className="current">{this.state.activeSlide}</span> / {this.state.slideItem.length}</div>
						<div className="leftArrow"></div>
						<div className="rightArrow"></div>
					</div>
				</div>
			</div>
		);
	}
}

class SlideTypeADItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
	}
	
	render() {
		return(
			<div className={this.props.allView && this.props.index === 0 ? "slide first":"slide"}>
				<div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<img src={this.props.imageURL} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					<span className="slideTitle">{this.props.title}</span>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.textAlign(this.props);
	}

	textAlign(_props) {
		if (_props.index === 0 && getByteLength(_props.title) >= 20) {
			ReactDOM.findDOMNode(this.refs.slideItem).style = "text-align:left";
		} else if (_props.index === _props.maxLength - 1 && getByteLength(_props.title) >= 20) {
			ReactDOM.findDOMNode(this.refs.slideItem).style = "text-align:right";
		}
	}
}

export default SlideTypeAD;