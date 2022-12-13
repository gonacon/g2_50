import 'Css/search/MovieVOD.css';

import React, { Component } from 'react';
import FM from '../../../supporters/navi';
import Utils from '../../../utils/utils';
import appConfig from 'Config/app-config';
import { MeTV } from 'Network';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class MovieVod extends Component {
    constructor(props) {
        super(props);
        this.itemWidth = 246; // 슬라이드 가로 폭
        this.itemMargin = 43; // 슬라이드 간격
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

    

    componentWillUnmount(){

        const { setFm } = this.props;
        setFm('vodSlide', null);

    }


    componentDidMount() {
        const { setFm,  slideInfo, setFocus } = this.props;
        
        if(slideInfo.slideType === 'VOD'){
            const vodSlide = new FM({
                id: 'vodSlide',
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
                onFocusKeyDown: this.onSelectVod
            });
            setFm('vodSlide', vodSlide);

            

        }else{
            const pkgSlide = new FM({
                id: 'pkgSlide',
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
                onFocusKeyDown: this.onSelectVod
            });
            setFm('pkgSlide', pkgSlide);
        }

        setFocus(1);
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

    onBlurContainer = () => {
        this.setState({
            active: false
        });
    }


    onBlured = () => {
        this.setState({active: false});
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
            console.log("endIndex1: ",endIndex);
            endIndex = startIndex + (maxItem-1);
            console.log("endIndex2: ",endIndex);
        } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
            endIndex = idx;
            console.log("startIndex1: ",startIndex);
            if (endIndex > (maxItem - 1)) {
                startIndex = endIndex - (maxItem-1);
                endIndex = maxItem - 1;
            }
            console.log("startIndex2: ",startIndex);
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
        // if ( idx === (totalItem - 1) ) {
        //     slideWrapClass.push('lastActive leftActive');
        // } else if ( idx === 0 ) {
        //     slideWrapClass.push('firstActive rightActive');
        // } else {
        //     slideWrapClass.push('leftActive rightActive');
        // }
        if(startIndex > 0) {
            slideWrapClass.push('leftActive ');
        }else if(idx === totalItem - 1){
            slideWrapClass.push('leftActive ');
        }else{
            slideWrapClass.pop('leftActive ');
        }

        if(idx < totalItem - 1) {
            slideWrapClass.push('rightActive activeSlide');
        }else if(idx < 6) { // 하나 있을경우
            slideWrapClass.pop('leftActive activeSlide rightActive');
        }else if(idx === totalItem - 1 && idx > 6){
            slideWrapClass.push('lastActive');
        }
        

        let fmId = "";
        if(this.props.slideInfo.slideType === 'VOD'){
            fmId = "vodSlide";
        }else{
            fmId = "pkgSlide";
        }

        if(document.querySelectorAll('#'+fmId+' .slideTypeAA .slideTitle')[idx].clientWidth  >= document.querySelectorAll('#'+fmId+' .slideTypeAA .slideWrapper .slide')[idx].clientWidth){
            document.querySelectorAll('#'+fmId+' .slideTypeAA .slideTitle')[idx].closest('.csFocus').classList.add('textOver');
        }

        this.setState({
            slideWrapClass,
            slideTo: changedPage,
            currentIdx : idx
        });
    }

    

    onSelectVod = (event, idx) => {


        
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

    render() {
        const { slideWrapClass, slideItem, currentIdx, slideTo, active} = this.state;
        const { slideInfo } = this.props;
        const isTitleUp = ((currentIdx === slideTo || currentIdx === (slideTo + 1)) && active);
        let fmId = "";
        if(slideInfo.slideType === 'VOD'){
            fmId = "vodSlide";
        }else{
            fmId = "pkgSlide";
        }
        
        return (
            <div id={fmId} className={`contentGroup ${isTitleUp? ' activeSlide': ''}`} ref={r => this.anchor = r}>
                <div className="slideTypeAA">
                    <div className="title">{slideInfo.slideTitle} (<span className="count">{slideItem.length}</span>)</div>
                    <div className={`slideWrap ${active?slideWrapClass.join(' '):''}`}>
                        <div className="slideCon">
                            <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(slideItem.length * this.itemWidth) + (slideItem.length * this.itemMargin)}}>
                                {
                                    this.state.slideItem.map((data, i) => {
                                        return(
                                                <MovieItem
                                                    imageURL={data.image}
                                                    title={data.title}
                                                    key={i}
                                                    idx={i}
                                                    items={this.items}
                                                    maxLength={this.state.slideItem.length}
                                                    slideTo={this.state.slideTo}
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

class MovieItem extends Component {
    constructor(props) {
        super(props);
        const image = Utils.getImageUrl(Utils.IMAGE_SIZE_VER) + this.props.imageURL;
        this.state = {
            active: null,   
            img : image    
        }
    }

    onError = () => {
        const image = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
        this.setState({ img: image });
    }

    render() {
        const {img} = this.state;

        return(
            <div className="slide" >
                <div className={this.state.active ? "csFocus focusOn" : "csFocus"} tabIndex="-1" >
                    <img src={img} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={this.onError}/>
                    {/* H/E 관련 Flag 정보 안옴.
                        <span className="imgWrap">
                        <span className="flagWrap">
                            
                        </span>
                    </span> */}
                    <span className="slideTitle">{this.props.title}</span>
                </div>
            </div>
        )
    }
}


export default MovieVod;