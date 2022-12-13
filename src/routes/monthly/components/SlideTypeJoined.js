import {React} from '../../../utils/common';
import '../../../assets/css/routes/monthly/SlideTypeJoined.css';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 161; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class SlideTypeJoined extends React.Component {
	constructor(props) {
		super(props);
		
		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 40; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo:0,
			activeSlide:1,
            slideItem:this.props.slideInfo.slideItem
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
	
		if(slideIndex > 0) {
			activeSlide.closest('.slideWrap').classList.add('leftActive');
		}else{
			activeSlide.closest('.slideWrap').classList.remove('leftActive');
		}
		if(slideIndex + thisItems <= slideLength - 1) {
			activeSlide.closest('.slideWrap').classList.add('rightActive');
		}else{
			activeSlide.closest('.slideWrap').classList.remove('rightActive');
		}
        
        this.setState({
            slideTo: slideIndex,
			activeSlide:activeIndex
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
			setTimeout(() => {
				activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
				activeSlide.closest('.contentGroup').classList.add('activeSlide');
			},200);
			activeSlide.closest('.slideWrap').classList.remove('lastActive');
        }else if(targetIndex === 0 && direction === 37){
            slideIndex = slideLength - thisItems;
			if(slideIndex < 0) slideIndex = 0;
			setTimeout(() => {
				activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
			},200);
        }

        this.setState({
            slideTo: slideIndex
        });
    }

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeJoined">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
                            <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{

                                    this.state.slideItem.map((data, i) => {
                                        return(
											<SlideTypeJoinedItem
												thumb = {data.thumbImage}
												imageS = {data.imageS}
                                                text = {data.text}
												itemClass = {data.text !== undefined ? "itemMore" : null}
                                                key = {i}
												index = {i}
												items={this.items}
                                                maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
                                                event1={this.focusOn.bind(this, i)}
                                                event3={this.keyDown.bind(this, i)}
											/>
                                        )
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

class SlideTypeJoinedItem extends React.Component {
    focusOn(...args){
        this.props.event1(this, ...args);
    }

    keyDown(event){
        this.props.event3(event.keyCode);
    }

	render() {
     	return(
        <div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
			<div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
                <img className="norImg" src={this.props.thumb} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
                <img className="focImg" src={this.props.imageS} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
				{/*<span className="wrapImg">*/}
					{/*<img className="logo" src={this.props.imageS} alt=""/>*/}
					{/*<img className="focusLogo" src={this.props.imageB} alt=""/>*/}
				{/*</span>*/}
      	 	 </div>
		</div>
		)
	}
}


export default SlideTypeJoined;