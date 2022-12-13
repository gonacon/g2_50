//import '../../../assets/css/routes/search/SlideTypeSearch.css';

import React, { Component } from 'react';
import FM from 'Supporters/navi';
import Utils from '../../../utils/utils';
import appConfig from 'Config/app-config';

const IMG_WIDTH = 188; // 이미지 가로
const IMG_HEIGHT = 268; // 이미지 세로
const ITEMS = 7; // 메뉴별 아이템 개수

class SlideTypeSearch extends Component {
    constructor(props) {
        super(props);
        this.itemWidth = 188; // 슬라이드 가로 폭
		this.itemMargin = 34; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo:0,
            slideItem:this.props.slideInfo.slideItem,
            active: false,
            currentIdx:0
        }
    }

    componentDidMount() {
        if(this.state.slideItem.length > 0){
            const { setFm } = this.props;
            const searchSlideList = new FM({
                id: 'searchSlideList',
                moveSelector: '.slideWrapper .slide',
                focusSelector: '.csFocus',
                row: 1,
                col: this.state.slideItem.length,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: this.state.slideItem.length - 1,
                bRowRolling: true,           
                onFocusChild: this.onFocusChanged,
                onFocusKeyDown: this.onFocusKeyDown
            });
            setFm('searchSlideList', searchSlideList);
        }
    }

    onFocusKeyDown = (event, childIdx) => {
        const { slideItem } = this.state;
        const { onVodSelect } = this.props;
        if(event.keyCode === 13){
            const slideInfo = slideItem[childIdx];

            if(slideInfo && slideInfo.idx){
                const synopData = { menu_id : "", sris_id:"", epsd_id : slideInfo.epsd_id, level : slideInfo.level};
                if (onVodSelect && typeof onVodSelect === 'function') {
                    onVodSelect(synopData);
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
        // let slideLeft = maxItem - idx;

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
        
        if(document.querySelectorAll('.slideTypeSearch .slideTitle')[idx].clientWidth  >= document.querySelectorAll('.slideTypeSearch .slideWrapper .slide')[idx].clientWidth){
            document.querySelectorAll('.slideTypeSearch .slideTitle')[idx].closest('.csFocus').classList.add('textOver');
        }
        
        this.setState({
            slideTo: changedPage,
            currentIdx : idx
        });


        if(idx === totalItem-1) {
            document.querySelector('.slideWrap').classList.remove('rightActive');
            document.querySelector('.slideWrap').classList.add('leftActive');
        }else{
            if(startIndex > 0) {
                document.querySelector('.slideWrap').classList.add('leftActive');
            }else{
                document.querySelector('.slideWrap').classList.remove('leftActive');
            }
            if(endIndex < totalItem - 1) {
                document.querySelector('.slideWrap').classList.add('rightActive');
            }else{
                document.querySelector('.slideWrap').classList.remove('rightActive');
            }
        }


    }
    

    render() {

        const { currentIdx } = this.state;
        const totalItem = this.state.slideItem.length;
        const isLast = currentIdx === (totalItem - 1);
        const isFirst = currentIdx === 0;

        return (
                <div id="searchSlideList" className="contentGroup">
                    <div className="slideTypeSearch">
                        <div className="title">{this.props.slideInfo.slideTitle}</div>
                        <div className={`slideWrap activeSlide${isFirst?' firstActive':''}${isLast?' lastActive':''}`}>
                            <div className="slideCon">
                                <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>                                
                                    {
                                        this.state.slideItem.map((data, i) => {
                                            return(
                                                    <SlideTypeAItem
                                                        imageURL={data.image}
                                                        title={data.title}
                                                        epsd_id={data.epsd_id}
                                                        key={i}
                                                        idx={i}
                                                        items={this.items}
                                                        maxLength={this.state.slideItem.length}
                                                        slideTo={this.state.slideTo}
                                                        onFocusChanged={this.onFocusChanged}
                                                    />                                            
                                            );
                                        })
                                    }                                    
                                </div>
                            </div>
                            <div className="slideCount"><span className="current">{currentIdx+1}</span> / {this.state.slideItem.length}</div>
                            <div className="leftArrow"></div>
                            <div className="rightArrow"></div>
                        </div>
                    </div>
                </div>
        );
    }
}

class SlideTypeAItem extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            active: null           
        }
    }

    render() {
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${this.props.imageURL}`;

        return(
            <div className="slide">
                    <div className={this.state.active ? "csFocus focusOn" : "csFocus"} tabIndex="-1" >
                        <img src={img} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={(e) => e.target.src=appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png'}/>
                        <span className="slideTitle">{this.props.title}</span>
                    </div>
            </div>
        )
    }
}


export default SlideTypeSearch;