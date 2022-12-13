import 'Css/search/ApplicationList.css';

import React, { Component } from 'react';
import FM from '../../../supporters/navi';
import StbInterface from 'Supporters/stbInterface';

const IMG_WIDTH = 349; // 이미지 가로
const IMG_HEIGHT = 287; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class ApplicationList extends Component {
    
    constructor(props) {
        super(props);
		this.itemWidth = 349; // 슬라이드 가로 폭
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

        const appSlide = new FM({
            id: 'appSlide',
            moveSelector: '.slideWrapper',
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
        setFm('appSlide', appSlide);       

        setFocus(1);
    }

    onSelectApp = (event, idx) => {
        if(event.keyCode === 13){
            const {slideType, slideItem} = this.state;
            const { onSelectVod } = this.props;
            const slideInfo = slideItem[idx];
            if(slideInfo){
                if (onSelectVod && typeof onSelectVod === 'function') {
                    
                    const data = {
                        title: slideInfo.title,  //	App 이름
                        serviceId: slideInfo.service_id,  //	App 서비스 아이디
                        vassId: slideInfo.vass_id,  //	App 고유 아이디
                        contentId: slideInfo.item_id,  //	App 콘텐츠 아이디
                        packageName: '',  //	"앱 데이터에 PackageName 이 존재 할 경우 추가해서 내려준다. (만약 hasVaasId 가 Y 인경우 필수)"
                        entryPath: 'SEARCH',  // 검색에서 진입시
                        hasVassId: 'Y',  //	vassId가 있는 경우 Y (이 경우 packageName 만 필수값이며 packageName 으로 App 실행)
                    }
                    StbInterface.launchApp(data);
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
        const { slideWrapClass, currentIdx, slideTo, active} = this.state;
        const isTitleUp = ((currentIdx === slideTo || currentIdx === (slideTo + 1)) && active);
        return (
                <div id="appSlide" className={`contentGroup ${isTitleUp? ' activeSlide': ''}`} ref={r => this.anchor = r}>
                    <div className="slideTypeD">
                        <div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
                        <div className={`slideWrap ${active?slideWrapClass.join(' '):''}`}>
                            <div className="slideCon">
                                <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                    {
                                        this.state.slideItem.map((data, i) => {
                                            return(
                                                <ApplicationItem
                                                    imageURL={data.image}
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

class ApplicationItem extends Component {
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
        // let imgURL = "http://stimage.hanafostv.com:8080/UHDSTB2"+this.props.imageURL;
        let imgURL = "http://stimage.hanafostv.com:8080/UHD2V5"+this.props.imageURL;
        return(
                <div className={this.state.active ? "slide csFocus focusOn" : "slide csFocus"} tabIndex="-1">
                    <img src={imgURL} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
                </div>
        )
    }
}


export default ApplicationList;