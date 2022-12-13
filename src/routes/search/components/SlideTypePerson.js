import {React, fnScrolling} from '../../../utils/common';
import '../../../assets/css/routes/search/SlideTypePerson.css';
import PropTypes from 'prop-types';

// const IMG_WIDTH = 287; // 이미지 가로
// const IMG_HEIGHT = 287; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class SlideTypePerson extends React.Component {
    constructor(props) {
        super(props);

        this.itemWidth = 287; // 슬라이드 가로 폭
        this.itemMargin = 64; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo:0,
            slideItem:this.props.slideInfo.slideItem,
            loadFocus : 2
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
                <div className="slideTypePerson">
                    <div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
                    <div className="slideWrap">
                        <div className="slideCon">
                            <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                {
                                    this.state.slideItem.map((data, i) => {
                                        return(
                                            <SlideTypePersonItem
                                                name={data.personName}
                                                job={data.personJob}
                                                birth={data.personBirth}
                                                key = {i}
                                                index = {i}
                                                items={this.items}
                                                maxLength={this.state.slideItem.length}
                                                slideTo={this.state.slideTo}
                                                event1={this.focusOn.bind(this, i)}
                                                event2={this.focusOut.bind(this, i)}
                                                event3={this.keyDown.bind(this, i)}
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

    componentDidMount() {
        document.querySelector('.contentGroup:nth-child(' + this.state.loadFocus + ') .slide:first-child .csFocus').classList.add('loadFocus');
        fnScrolling();
    }

}

SlideTypePerson.propTypes = {
    loadFocus: PropTypes.string
};

class SlideTypePersonItem extends React.Component {
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
            <div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
                <div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onBlur={this.focusOut.bind(this)} onKeyDown={this.keyDown.bind(this)}>
                    <span className="personName">{this.props.name}</span>
                    <span className="personJob">{this.props.job}</span>
                    <span className="personBirth">{this.props.birth}</span>
                </div>
            </div>
        )
    }
}

export default SlideTypePerson;