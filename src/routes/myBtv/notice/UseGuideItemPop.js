import React from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

//import UseGuideItemPopData from '../../../assets/json/routes/myBtv/useguide/UseGuideItemPopData.json';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import { CTSInfo } from 'Supporters/CTSInfo';
import keyCodes from 'Supporters/keyCodes';
import appConfig from 'Config/app-config';
import Utils from 'Util/utils';

import 'Css/myBtv/useguide/UseGuideItemPop.css';

const DEBUG = false;
const LOG_DEBUG = false;

const IMAGE_WIDTH = 1500;
const IMAGE_HEIGHT = 670;
const TEXT_TYPE = '10';
//const IMAGE_TYPE = '20';
const { Keymap: { ENTER } } = keyCodes;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[UseGuideItemPop] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c [UseGuideItemPop] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class UseGuideItemPop extends PageView {
  constructor(props) {
    super(props);

    blue('this:', this);
    //blue('this.props:', this.props);
    //blue('this.paramData:', this.paramData);
    this.itemWidth = 1077;
    this.items = 2; // 한 화면의 슬라이드 개수 1개 슬라이드의 경우 양쪽 2개의 슬라이드가 추가되므로 +1

    blue('paramData:', this.paramData);
    const images = map(get(this.paramData, 'detail.images'), 'img_path');
    blue('historyData:', this.historyData);
    /*
    this.detail = this.paramData.detail || {};
    this.images = map(this.detail.images, 'img_path') || [];
    this.hasVideo = !isEmpty(this.detail.detailVideoId);
    */

    /*
    this.images.push('/edu/40/MM0000832540/MM0000832540_TVPW_20180425170130408_01.png');
    this.images.push('/edu/61/MM0000843461/MM0000843461_TVPW_20180425122927756_01.png');
    this.images.push('/edu/84/MM0000553484/MM0000553484_TVPW_20180425123356105_01.png');
    this.images.push('/current/05/MM0000453405/MM0000453405_TVPW_20180425123633849_01.png');
    */

    this.state = isEmpty(this.historyData) ? {
      detail: this.paramData.detail || {},
      images,
      hasVideo: !isEmpty(get(this.paramData, 'detail.detailVideoId')),
      slideItem: [...images],
      slideTo: this.items
    } : this.historyData;

    const focusList = [
      { key: 'videoButton', fm: null },
      { key: 'images', fm: null }
    ];

    this.declareFocusList(focusList);
    if (!this.state.hasVideo) {
      this.setFocusEnable('videoButton', false);
    }

    if (isEmpty(this.state.images)) {
      this.setFocusEnable('images', false);
    }
  }

  componentWillMount() {
    super.componentWillMount();

    if (this.props.data === "text") {
      this.setState({
        slideItem: []
      });
    } else {
      let slideItemLength = this.state.slideItem.length;
      //let slideItemLength = this.state.images.length;
      let data = [];

      data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
      for (let i = 0; i < this.items; i++) {
        data[0].push(data[0][i]);
      }

      for (let i = 0; i < this.items; i++) {
        data[0].unshift(data[0][slideItemLength - 1]);
      }

      //this.state.images = data[0];
      this.setState({
        slideItem: data[0]
      });
    }
  }

  componentDidMount() {
    super.componentDidMount();

    this.props.showMenu(false);

    if (document.querySelectorAll('.buttonWrap .btnStyle').length !== 0) {
      document.querySelector('.buttonWrap .btnStyle').classList.add('loadFocus');
    } else {
      if (document.querySelectorAll('.innerContentInfo').length !== 0) {
        document.querySelector('.innerContentInfo').classList.add('loadFocus');
      } else if (document.querySelectorAll('.commerceSlide').length !== 0) {
        let elem = document.querySelector('.slideWrapper .clone + .slide:not(.clone)');
        
        if (elem) elem.classList.add('active');
        elem = document.querySelector('.slideWrapper .active .csFocus');
        if (elem) elem.classList.add('loadFocus');
      }
    }

    let slidePage = document.querySelector('.slidePage');

    if (slidePage) {
      for (let i = 1; i <= this.state.slideItem.length - 4; i++) {
        if (i === 1) {
          log('add on');
          slidePage.insertAdjacentHTML('beforeend', '<span class="on"></span>');
        } else {
          log('add normal');
          slidePage.insertAdjacentHTML('beforeend', '<span></span>');
        }
      }
    }

    this.setFm('videoButton', new FM({
      id: 'videoButton',
      type: 'ELEMENT',
      containerSelector: '.buttonWrap',
      focusSelector: '.csFocus',
      row: 1,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 0,
      onFocusKeyDown: this.onFocusButtonKeyDown
    }));

    this.setFm('images', new FM({
      id: 'images',
      containerSelector: '.slideWrapper',
      focusSelector: '.csFocus',
      row: 1,
      col: this.state.slideItem.length,
      focusIdx: 2,
      startIdx: 2,
      lastIdx: this.state.slideItem.length - 3,
      bRowRolling: true,
      onFocusChild: this.onFocusImage,
      onFocusContainer: this.onFocusImages,
      onBlurContainer: this.onBlurImages,
      onFocusKeyDown: this.onFocusImageKeyDown
    }));

    this.setFocus(0);
  }

  onFocusButtonKeyDown = (event, index) => {
    blue('[onFocusButtonKeyDown]', event, index);

    if (event.keyCode === ENTER) {
      CTSInfo.requestWatchVODForUseGuide(this.state.detail.detailVideoId);
    }
  }

  onFocusImage = (index) => {
    blue('[onFocusImage]', index);

    let slideIndex = index;
    let slideLength = this.state.slideItem.length;
    let thisItems = this.items;
    if (slideIndex >= slideLength - thisItems) {
      slideIndex = thisItems;
      document.querySelector('.commerceSlide .slide:nth-child(' + (slideIndex + 1) + ') .csFocus').focus();
    }

    if (slideIndex <= thisItems - 1) {
      slideIndex = slideLength - thisItems - 1;
      document.querySelector('.commerceSlide .slide:nth-child(' + (slideIndex + 1) + ') .csFocus').focus();
    }

    document.querySelector('.slideCon').scrollLeft = 0;

    blue('slideIndex:', slideIndex);
    this.setState({
      slideTo: slideIndex
    });

    let slidePageIndex = slideIndex;
    if (slidePageIndex - 1 === 0) slidePageIndex = 2;

    const activeElem = document.querySelector('.slide.active');
    if (activeElem) activeElem.classList.remove('active');
    document.querySelector('.slide:nth-child(' + (slideIndex + 1) + ')').classList.add('active');
    document.querySelector('.slidePage span.on').classList.remove('on');
    document.querySelector('.slidePage span:nth-child(' + (slidePageIndex - 1) + ')').classList.add('on');
  }

  onFocusImages = () => {
    blue('[onFocusImages]');
  }

  onBlurImages = () => {
    blue('[onBlueImages]');
  }

  onFocusImageKeyDown = (event, index) => {
    blue('[onFocusImageKeyDown]', event, index);
  }

  renderVideoButton = () => {
    return (
      <div id="videoButton" className="buttonWrap">
        <span className="btnStyle type03 csFocus">
          <span className="wrapBtnText">동영상보기</span>
        </span>
      </div>
    );
  }

  renderTextType = () => {
    let detailText = this.state.detail.detailText;

    if (detailText) {
      detailText = detailText.split('\n').map((line, i) => {
        return (<div key={i}>{line}</div>);
      });
    }

    return (
      <div className="popupScrollWrap">
        {/*동영상보기 버튼 유무에 따른 class 변화*/}
        <div className={this.state.hasVideo ? "contScrollWrap" : "contScrollWrap long"}>
          <div className="innerContentInfo">
            <div className="contentInfo">
              <div className="contentText">
                <div>
                  <div className="text">{detailText}</div>
                </div>
              </div>
            </div>
          </div>
          <span className="scrollBarBox" style={{ display: 'none' }}>
            <div className="innerScrollBarBox">
              <span className="scrollBar"></span>
              <span className="scrollBarBG"></span>
            </div>
          </span>
        </div>
      </div>
    );
  }
  
  renderImageType = () => {
    return (
      <div className="commerceSlide contentGroup">
        <div className="slideWrap">
          <div className="slideCon">
            <div id="images" className="slideWrapper" style={{ '--page': this.state.slideTo, 'width': this.state.slideItem.length * this.itemWidth }}>
              {
                this.state.slideItem.map((data, i) => {
                  return (
                    <CommerceSlideItem
                      image={Utils.getIipImageUrl(IMAGE_WIDTH, IMAGE_HEIGHT) + data}
                      index={i}
                      key={i}
                      items={this.items}
                      slideTo={this.state.slideTo}
                      maxLength={this.state.slideItem.length}
                    />
                  )
                })
              }
            </div>
            <div className="slidePage"></div>
            <div className="leftArrow"></div>
            <div className="rightArrow"></div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    blue('[render()] this.state.detail.detailType:', this.state.detail.detailType);

    return (
      <div className="contentPop popGuideItem">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="innerContentPop">
          <div className="detailTitleWrap">
            <p className="detailTitle"><span style={{ WebkitBoxOrient: "vertical" }}>{this.state.detail.detailTitle}</span></p>
          </div>
          {
            this.state.hasVideo && this.renderVideoButton()
          }
          {
            this.state.detail.detailType === TEXT_TYPE ? this.renderTextType() : this.renderImageType()
          }
        </div>
        <div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
      </div>
    );
  }
}

class CommerceSlideItem extends React.Component {
  render() {
    return (
      <div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide clone" : "slide"}>
        <span className="csFocus">
          <img src={this.props.image} alt="" />
        </span>
      </div>
    );
  }
}

export default UseGuideItemPop;