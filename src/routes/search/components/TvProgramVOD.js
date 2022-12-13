import 'Css/search/TvProgramVOD.css';

import React, { Component } from 'react';
import FM from '../../../supporters/navi';
import appConfig from 'Config/app-config';
// import Utils from '../../../utils/utils';

const IMG_WIDTH = 306; // 이미지 가로
const IMG_HEIGHT = 180; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class TvProgramVOD extends Component {
    
    constructor(props) {
        super(props);
		this.itemWidth = 306; // 슬라이드 가로 폭
		this.itemMargin = 40; // 슬라이드 간격
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
        const { setFm,  slideInfo, setFocus, favorCh } = this.props;

        const liveSlide = new FM({
            id: 'liveSlide',
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
            onFocusKeyDown: this.onSelectLive
        });
        setFm('liveSlide', liveSlide);
        setFocus(1);
    }

    componentWillUnmount(){

        const { setFm } = this.props;
        setFm('liveSlide', null);

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
    
    onSelectLive = (event, idx) => {
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
        const { slideWrapClass, slideTo, currentIdx,active} = this.state;
        const { favorCh, channelList } = this.props;
        const isTitleUp = ((currentIdx === slideTo || currentIdx === (slideTo + 1)) && active);

        return (
                <div id="liveSlide" className={`contentGroup ${isTitleUp? ' activeSlide': ''}`} ref={r => this.anchor = r}>
                    <div className="slideTypeB_A">
                        <div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
                        <div className={`slideWrap  ${active?slideWrapClass.join(' '):''}`}>
                            <div className="slideCon">
                                <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                    {
                                        this.state.slideItem.map((data, i) => {
                                            return(
                                                    <TvProgramItem
                                                        image={data.image}
                                                        title={data.title}
                                                        onAir = {data.onAir}
                                                        grade19 = {data.level}
                                                        timer = {data.start_time}
                                                        favorCh = {this.props.favorCh}
                                                        key = {i}
                                                        index = {i}
                                                        items={this.items}
                                                        maxLength={this.state.slideItem.length}
                                                        slideTo={this.state.slideTo}
                                                        focusOn={this.focusOn}
                                                        focusOut={this.focusOut}
                                                        onFocusChanged={this.onFocusChanged}
                                                        channelCode = {data.channel_code}
                                                        channelList = {this.props.channelList}
                                                        start_time = {data.start_time}
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

class TvProgramItem extends Component {
    constructor(props) {
        super(props);

        const { image, favorCh, start_time, channelList } = this.props;
        this.state = {
            active: null,           
            img : image,
            favorCh: favorCh,
            channel: this.props.channelCode,
            channelList : this.props.channelList,
            start_time : start_time
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

    onError = () => {
        const image = appConfig.headEnd.LOCAL_URL+'/common/img/thumbnail-default-port.png';
        this.setState({ img: image });
    }

    render() {
        const { img, favorCh, channel, start_time } = this.state;
        const channelList = this.props.channelList;
        let arrTm = "";
        let tempArr = [];
        let favorChL = false;
        if(favorChL){
            tempArr = favorCh.split('|');
            for (let j = 0; j < tempArr.length; j++) {
                arrTm = tempArr[j].split('|');
                if(arrTm[0] === channel){
                    favorChL = true;
                }
            }
        }
        let rTm = "";
        let rTmArr = [];
        let timer = false;
        if(channelList){
            for (let h = 0; h < channelList.length; h++) {

                // 날자 데이터를 MS로 바꿔 준다
                let ms = "20"+start_time;
                let msecPerMinute = 1000 * 60;
                let msecPerHour = msecPerMinute * 60;
                let msecPerDay = msecPerHour * 24;

                let startH = ms.substring(8,10);  //시
                let startM = ms.substring(10,12); //분
                let startS = ms.substring(12,14); //초

                let startHMS = startH * msecPerHour;
                let startMMS = startM * msecPerMinute;

                let xx = ms.gettime;
                let startDate = new Date(ms.substring(0,4)+"-"+ms.substring(4,6)+"-"+ms.substring(6,8));

                let startTime = startHMS+startMMS;

                let startDateMs = startDate.getTime() + startTime -32400000; // Date 변환과정에서 생긴 9시간을 빼준다
                let proStartTime = channelList[h].channelInfo.startTime;
                
                if(channelList[h].channelNum === channel && startDateMs.toString() === proStartTime.toString()){ // 시작시간으로 비교 해야됨. 같은 채널 여러 시간대가 존제함
                    timer = true;
                }
            }
        }

        // 현재 방영 중인 것만 썸네일 보임
        let image = null;
        if(this.props.onAir){
            image = img;
        }else{
            image = appConfig.headEnd.LOCAL_URL+'/common/img/thumbnail-default-port.png';
        }
        
        return(
            <div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				    <div className={this.state.active ? "csFocus focusOn" : "csFocus"} tabIndex="-1">
                        <img src={image} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={this.onError}/>
                        {
                            (this.props.title !== undefined ?
                                timer === true ?
                                <span className="programTitle"><span className="iconTimer"></span>{this.props.title}</span>
                                :
                                    // this.props.favorCh === true ?
                                    favorChL === true ?
                                        <span className="programTitle"><span className="iconFavor"></span>{this.props.title}</span>
                                    :
                                        <span className="programTitle"><span id="timerIcon"></span>{this.props.title}</span>
                            :
                            '')
                        }
                        {
                            (this.props.onAir === true ? <span className="onAir">ON AIR</span> : '')
                        }
                        {
                            (this.props.grade19 === "19" ? <span className="grade19"><span className="gradeText"><span className="gradeCircle">19</span>등급제한</span></span> : '')
                        }
				    </div>
			</div>
        )
    }
}


export default TvProgramVOD;