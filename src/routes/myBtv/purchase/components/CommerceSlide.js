import React from 'react';
import PopupPageView from 'Supporters/PopupPageView';
import 'Css/myBtv/purchase/CommerceSlide.css';
import keyCodes from 'Supporters/keyCodes';
import Utils from 'Util/utils';

const { Keymap: { BACK_SPACE, PC_BACK_SPACE, LEFT, RIGHT } } = keyCodes;


class CommerceSlide extends PopupPageView {
	constructor(props) {
		super(props);
		this.itemWidth = 1325;
		this.items = 2; // 한 화면의 슬라이드 개수 1개 슬라이드의 경우 양쪽 2개의 슬라이드가 추가되므로 +1

		this.state = {
			// contents:Json,
			title: this.props.title,
			slideItem: this.props.products.concat(this.props.products),
			slideTo : 0
		}
	}

	onKeyDown(evt) {
		const { keyCode } = evt;
		const { slideTo, slideItem } = this.state;
		this.handleKeyEvent(evt);
		if ( keyCode === BACK_SPACE || keyCode === PC_BACK_SPACE ) {
			this.props.callback({});
			return true;
		}

		let nextSlideTo = slideTo;
		switch ( keyCode ) {
			case LEFT: 
				nextSlideTo = slideTo === 0 ? slideItem.length -1 : slideTo - 1;
			break;
			case RIGHT:
				nextSlideTo = slideTo === slideItem.length -1 ? 0 : slideTo + 1;
			break;
			default: break;
		}

		this.setState({ slideTo: nextSlideTo });
	}

	componentWillUnmount() {
		console.log('commerceSlide will mount');
		document.querySelector('.wrapper').classList.remove('dark');
		super.componentWillUnmount();
	}

	focusOn(_this,index){
		let slideIndex = _this;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		if(slideIndex >= slideLength - thisItems){
			slideIndex = thisItems;
			document.querySelector('.commerceSlide .slide:nth-child(' + (slideIndex + 1) + ') .csFocus').focus();
		}

		if(slideIndex <= thisItems - 1){
			slideIndex = slideLength - thisItems - 1;
			document.querySelector('.commerceSlide .slide:nth-child(' + (slideIndex + 1) + ') .csFocus').focus();
		}
		
		document.activeElement.closest('.slideCon').scrollLeft = 0;

		this.setState({
			slideTo: slideIndex
		});

		let slidePageIndex = slideIndex;
		if(slidePageIndex - 1 === 0) slidePageIndex = 2;
		document.querySelector('.slide.active').classList.remove('active');
		document.querySelector('.slide:nth-child(' + (slideIndex + 1) + ')').classList.add('active');
		document.querySelector('.slidePage span.on').classList.remove('on');
		document.querySelector('.slidePage span:nth-child(' + (slidePageIndex - 1) + ')').classList.add('on');

	}

	render() {
		const { slideTo, slideItem, title } = this.state;

		let pager = [];
		slideItem.forEach((item, idx) => {
			pager.push( <span key={idx} className={idx === slideTo ? 'on': ''}/> )
		});

		return (
			<div className="commercePop">
				<div className="commerceProductBg"></div>
				<div className="commerceWrap">
					<div className="commerceSlide contentGroup">
						<p className="title">{title}</p>
						<div className="slideWrap">
							<div className="slideCon">
								<div className="slideWrapper" style={{'--page': slideTo,'width': slideItem.length * this.itemWidth}}>
									{ slideItem.map((data, i) => (
										<CommerceSlideItem index={i} key={i}
											slideTo={slideTo}
											image={data.img_path}
											items={this.items}
											maxLength={slideItem.length}
										/>
									))}
								</div>
								<div className="slidePage">{pager}</div>
								<div className="leftArrow"></div>
								<div className="rightArrow"></div>
							</div>
						</div>
					</div>
					<div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
				</div>
			</div>
		)
	}
	componentDidMount() {
		let slidePage = document.querySelector('.slidePage');
		for(let i = 1; i <= this.state.slideItem.length - 4; i++){
			if(i === 1){
				slidePage.insertAdjacentHTML('beforeend','<span class="on"></span>');
			}else{
				slidePage.insertAdjacentHTML('beforeend','<span></span>');
			}
		}
		// document.querySelector('.topMenu').style.display = 'none';
		// document.querySelector('.slideWrapper .clone + .slide:not(.clone)').classList.add('active');
		// document.querySelector('.slideWrapper .active .csFocus').classList.add('loadFocus');
		document.querySelector('.wrapper').classList.add('dark');
		// fnScrolling();
	}
}

class CommerceSlideItem extends React.Component {

	render() {
		const { index, slideTo, image } = this.props;
		const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_DETAIL_SLIDE)}${image}`;
		const focused = index === slideTo ? ' focusOn' : '';
		return(
			<div className="slide">
				<span className={`csFocus${focused}`}>
					<img src={img} alt="이미지"/>
				</span>
			</div>
		)
	}
}

export default CommerceSlide;

