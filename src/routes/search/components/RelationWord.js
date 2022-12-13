import 'Css/search/RelationWord.css';

import React, { Component } from 'react';
import FM from '../../../supporters/navi';

// const IMG_WIDTH = 246; // 이미지 가로
// const IMG_HEIGHT = 140; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class RelationWord extends Component {
    
    constructor(props) {
        super(props);
		this.itemWidth = 246; // 슬라이드 가로 폭
        this.itemMargin = 42; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo:0,
            slideItem:this.props.slideInfo.slideItem,
            active: false,
            currentIdx:0,
            slideWrapClass : [],
            slideType : this.props.slideInfo.slideType
        }

        this.anchor = null;
    }

    componentDidMount() {
        const { setFm,  slideInfo, setFocus } = this.props;

        const relationSlide = new FM({
            id: 'relationSlide',
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
            onFocusKeyDown: this.onSelectApp
        });
        setFm('relationSlide', relationSlide);   
        
        setFocus(1);
    }

    componentWillUnmount(){

        const { setFm } = this.props;
        setFm('relationSlide', null);

    }

    onFocused = () => {
        const { scrollTo } = this.props;
        // if (scrollTo && typeof scrollTo === 'function') { // 스크롤 이동 수정
        //     scrollTo(this.anchor, 400);
        // }
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

    onSelectApp = (event, idx) => {
        if(event.keyCode === 13){
            const {slideType, slideItem} = this.state;
            const { onSelectVod } = this.props;
            const slideInfo = slideItem[idx];
            
            if(slideInfo){
                if (onSelectVod && typeof onSelectVod === 'function') {
                    onSelectVod(slideType, slideInfo.keyword);
                }
            }
        }
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

    render() {
        const { currentIdx, slideWrapClass, slideTo, active} = this.state;
        // const totalItem = this.state.slideItem.length;
        const isTitleUp = ((currentIdx === slideTo || currentIdx === (slideTo + 1)) && active);

        return (
                <div id="relationSlide" className={`contentGroup ${isTitleUp? ' activeSlide': ''}`} ref={r => this.anchor = r}>
                    <div className="slideTypeRelation">
                        <div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
                        <div className={`slideWrap ${active?slideWrapClass.join(' '):''}`}>
                            <div className="slideCon">
                                <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                    {
                                        this.state.slideItem.map((data, i) => {
                                            return(
                                                <RelationItem
                                                    relation={data.keyword}
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

class RelationItem extends Component {
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


    render() {
        return(
            <div className="slide">
                <div className={this.state.active ? "csFocus focusOn" : "csFocus"} tabIndex="-1">
                    <span className="relatedSearch">{this.props.relation}</span>
                </div>
			</div>
        )
    }
}


export default RelationWord;