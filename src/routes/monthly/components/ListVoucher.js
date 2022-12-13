import {React, createMarkup } from '../../../utils/common';
import '../../../assets/css/routes/monthly/ListVoucher.css';

const IMG_WIDTH = 438; // 이미지 가로
const IMG_HEIGHT = 285; // 이미지 세로
const ITEMS = 4; // 메뉴별 아이템 개수

class ListVoucher extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 438; // 슬라이드 가로 폭
		this.itemMargin = 24; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		this.state = {
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		};

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
		
		activeSlide.closest('.slideCon').scrollLeft = 0;
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
				<div className="listVoucher">
					<div className="slideTitle">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.props.slideInfo.slideItem.map((data, i) => {
										return(
											<ListVoucherItem
												Image={data.thumbImage}
												channelImage={data.channelImage}
												voucherImage={data.voucherImage}
												voucherText={data.voucherText}
												price={data.price}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												event1 = {this.focusOn.bind(this, i)}
												event3 = {this.keyDown.bind(this, i)}
												key = {i}
												index = {i}
											/>
										)
									})
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
	componentDidMount() {

	}
}

class ListVoucherItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
	}

	render() {
		return(
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<div tabIndex="-1" className='csFocus' onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<img src={this.props.Image} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
					<span className="wrapImg"><img src={this.props.channelImage} alt=""/></span>
					<div className="detailInfo">
						<img src={this.props.voucherImage} alt=""/>
						<div className="detailText" dangerouslySetInnerHTML={createMarkup(this.props.voucherText)}></div>
						<p className="price"><span>{this.props.price}</span>원/월</p>
					</div>
				</div>
			</div>
		)
	}
}


export default ListVoucher;