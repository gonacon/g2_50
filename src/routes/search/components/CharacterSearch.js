import 'Css/search/CharacterSearch.css';

import React, { Component } from 'react';
import moment from 'moment';
import FM from '../../../supporters/navi';

// const IMG_WIDTH = 287; // 이미지 가로
// const IMG_HEIGHT = 287; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class CharacterSearch extends Component {
    
    constructor(props) {
        super(props);
		this.itemWidth = 288; // 슬라이드 가로 폭
		this.itemMargin = 0; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo:0,
            slideItem:this.props.slideInfo.slideItem,
            slideType : this.props.slideInfo.slideType,
            active: false,
            currentIdx:0,
            slideWrapClass : []
        }

        this.anchor = null;
    }

    componentDidMount() {
        const { setFm,  slideInfo, setFocus } = this.props;

        const personSlide = new FM({
            id: 'personSlide',
            moveSelector: '.slideWrapper .slide',
            focusSelector: '.csFocus',
            row: 1,
            col: slideInfo.slideItem.length,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: slideInfo.slideItem.length - 1,
            bRowRolling: true,           
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlurContainer,
            onFocusChild: this.onFocusChanged,
            onFocusKeyDown: this.onSelectPerson
        });
        setFm('personSlide', personSlide);       

        setFocus(1);
    }

    componentWillUnmount(){

        const { setFm } = this.props;
        setFm('personSlide', null);

    }

    onSelectPerson = (event, idx) => {
        if(event.keyCode === 13){

            const {slideType, slideItem} = this.state;
            const { onSelectVod } = this.props;
            const slideInfo = slideItem[idx];

            if(slideInfo){
                if (onSelectVod && typeof onSelectVod === 'function') {
                    onSelectVod(slideType, slideInfo);
                }
            }
        }
    }

    onFocused = () => {
        const { scrollTo } = this.props;
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
        this.setState({
            active: true
        });
    }

    onBlured = () => {
        this.setState({active: false});
    }

    onBlurContainer = () => {
        this.setState({
            active: false
        });
    }

    focusOut = () => {
        this.setState({
            slideWrapClass: [],
        })
    }

    onFocusChanged = (idx) => {
        const maxItem = ITEMS;
        const { slideTo } = this.state;        
        const totalItem = this.state.slideItem.length;

        let startIndex = slideTo;
        let endIndex = slideTo + (maxItem - 1);

        if (idx < startIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
            startIndex = idx;
            if (startIndex < 0) {
                startIndex = 0;
            }
            endIndex = startIndex + (maxItem-1);
        } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
            endIndex = idx;
            if (endIndex > (maxItem - 1)) {
                startIndex = endIndex - (maxItem-1);
                endIndex = maxItem - 1;
            }
        } else { // 포커스가 현재 보여지는 Set 안에 있는경우
            if (idx === endIndex) {
                if (endIndex < totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
                    endIndex++;
                    startIndex++;
                }
                if (startIndex + maxItem > totalItem) {
                    startIndex = totalItem - maxItem;
                    endIndex = startIndex + maxItem - 1;
                }
            } else if (idx === startIndex) {
                if (startIndex >= 1 ) { // 첫 인덱스가 1이 아니면
                    startIndex--;
                    endIndex--;
                }
                if (startIndex < 0) {
                    startIndex = 0;
                    endIndex = maxItem -1;
                }
            }
        }
        const changedPage = startIndex;

        let slideWrapClass = ['activeSlide'];
        if ( idx === (totalItem - 1) ) {
            slideWrapClass.push('lastActive leftActive');
        } else if ( idx === 0 ) {
            slideWrapClass.push('firstActive rightActive');
        } else {
            slideWrapClass.push('leftActive rightActive');
        }

        this.setState({
            slideWrapClass
        });
        
        this.setState({
            slideTo: changedPage,
            currentIdx : idx
        });
    }
    
    onSelectVod = (idx) => {

    }

    render() {
        const { currentIdx , slideWrapClass, slideTo, active} = this.state;
        // const totalItem = this.state.slideItem.length;
        const isTitleUp = ((currentIdx === slideTo || currentIdx === (slideTo + 1)) && active);

        return (
                <div id="personSlide" className={`contentGroup ${isTitleUp? ' activeSlide': ''}`} ref={r => this.anchor = r}>
                    <div className="slideTypePerson">
                        <div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
                        <div className={`slideWrap ${active?slideWrapClass.join(' '):''}`}>
                            <div className="slideCon">
                                <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                    {
                                        this.state.slideItem.map((data, i) => {
                                            return(
                                                <CharacterItem
                                                    name={data.name}
                                                    job={data.job}
                                                    birth={data.birth}
                                                    key = {i}
                                                    index = {i}
                                                    items={this.items}
                                                    maxLength={this.state.slideItem.length}
                                                    slideTo={this.state.slideTo}
                                                    focusOn={this.focusOn}
                                                    focusOut={this.focusOut}
                                                    onFocusChanged={this.onFocusChanged}
                                                />                   
                                            );
                                        })
                                    }                                    
                                </div>
                            </div>
                            <div className="slideCount"><span className="current">{this.state.currentIdx+1}</span> / {this.state.slideItem.length}</div>
                            <div className="leftArrow"></div>
                            <div className="rightArrow"></div>
                        </div>
                    </div>
                </div>
        );
    }
}

class CharacterItem extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            active: null           
        }
    }

    onFocused = () => {
        this.setState({active: true});
        const { onFocusChanged, index } = this.props;
        onFocusChanged(index);
    }

    onBlured = (index) => {
        this.setState({ active: false })
        this.props.focusOut(index);
    }

    onSelect = () => {
        const { onSelectVod, index } = this.props;
        onSelectVod(index);
    }

    render() {
        const { birth } = this.props;

        const birthDay = birth ? moment(this.props.birth, 'YYYYMMDD').format('YYYY.MM.DD'):'';
        return(

            <div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
                    <div className={this.state.active ? "csFocus focusOn" : "csFocus"} tabIndex="-1">
                        <div className="personVertical">
                            <span className="personName" style={{"WebkitBoxOrient":"vertical"}}>{this.props.name}</span>
                            <span className="personJob">{this.props.job}</span>
                        </div>
                        <span className="personBirth">{birthDay}</span>
                    </div>
			</div>
        )
    }
}


export default CharacterSearch;