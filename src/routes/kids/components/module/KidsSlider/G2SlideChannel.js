import React, { Component } from 'react';

import appConfig from 'Config/app-config';

const DEBUG = false;
const LOG_DEBUG = false;

//const notFreeNormalImage = `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-notjoin-nor.png`;
//const notFreeFocusImage = `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-notjoin-foc.png`;
//const restrictNormalImage = `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-restrict-nor.png`;
//const restrictFocusImage = `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-restrict-foc.png`;

const notFreeImages = {
  nor: `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-notjoin-nor.png`,
  foc: `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-notjoin-foc.png`
};

const restrictImages = {
  nor: `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-restrict-nor.png`,
  foc: `${appConfig.headEnd.LOCAL_URL}/kids/channel/kids-thumbnail-default-restrict-foc.png`
};

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[G2SliderChannel] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[G2SliderChannel] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class G2SlideChannel extends Component {
  constructor(props) {
    super(props);

    blue('[constructor()] props:', this.props);

    //this.isInitLoad = false;
    this.curProgramImage = appConfig.headEnd.IGSIMAGE.url + this.props.data.svcId + '.png';
    this.defaultIndex = 0;
    this.defaultImgs = {
      foc: appConfig.headEnd.LOCAL_URL + '/common/default/thumbnail_default_land.png',
      nor: appConfig.headEnd.LOCAL_URL + '/common/default/thumbnail_default_land.png'
    }
  }

  componentWillMount() {
    //blue('[componentWillMount()]');

    //this.isInitLoad = true;
  }

  renderFocusImage() {
    // NOTE: focused는 focus가 아닐 때 false, focus일 때는 undefined로 오고 있음.
    //let image = !this.props.focused ? this.curProgramImage : '';
    const { focused } = this.props;
    const key = focused ? 'foc' : 'nor';
    const onError = !focused ? (e) => { e.target.src = this.defaultImgs[key]; } : () => {};
    let image = focused ? '' : this.curProgramImage;

    if (this.props.data.isNotFree) {
      image = notFreeImages[key];
    }

    if (this.props.data.shouldBlock) {
      image = restrictImages[key];
    }

    log('this.props.focused:', this.props.focused);
    log('isNotFree:', this.props.data.isNotFree);
    log('shouldBlock:', this.props.data.shouldBlock);
    log('image:', image);

    //return <img src={image} alt="" onError={e => e.target.src = this.defaultImgs[key]} />;
    return <img src={image} alt="" onError={onError} />;
  }

  render() {
    const { data, focused, isDefault, idx, clone } = this.props;

    //blue('[render()] props, this.isInitLoad:', this.props, this.isInitLoad);

    const {
      curProgram,
      //svcId,
      chName,
      chNo
    } = data;

    //const curProgramInfo = data.programs[curProgramIdx];
    // TODO: program의 imagePath를 쓰는 것이 맞을 것 같은데, 명확하게 로직을 설명 받지 못함.
    //       현재는 imagePath가 ''라 확인 불가능함.
    //       imagePath의 앞쪽 URL 정보도 모름.
    //const curProgramImage = isEmpty(curProgram.imagePath) ? appConfig.headEnd.IGSIMAGE.url + svcId + '.png' : curProgram.imagePath;
    //const curProgramImage = appConfig.headEnd.IGSIMAGE.url + svcId + '.png';
    let slideClass = `slide${focused ? ' active' : ''}${clone ? ' clone' : ''}`;
    //console.log('slideClass:', idx, slideClass);

    //console.log('this.slide:', this.slide);
    /*
    if (this.slide && this.slide.classList) {
      //console.log('this.slide.classList:', this.slide.classList);
      //console.log('this.slide.className:', idx, this.slide.className);
      if (this.slide.classList.contains('left')) {
        console.log('left', idx);
        //slideClass += 'left';
      } else if (this.slide.classList.contains('right')) {
        console.log('right', idx);
        //slideClass += 'right';
      }
    }
    */

    //let csFocusCenter = `csFocusCenter${focused || (this.isInitLoad && idx === 0) ? ' defaultFocus' : ''}`;
    let csFocusCenter = `csFocusCenter${isDefault ? ' defaultFocus' : ''}`;

    //log('csFocusCenter:', csFocusCenter);

    /*
    if (checkBlur()) {
      const target = document.querySelectorAll('.channelWrap .slideWrapper .slide:not(.clone)')[idx];

      if (target.classList.contains('active')) {
        csFocusCenter = 'csFocusCenter defaultFocus';
      }
    }
    */

              //<img src={isNotFree ? notFreeNormalImage : curProgramImage} alt="" onError={e => e.target.src = this.defaultImgs.focusOnImg} />
    return (
      <div ref={ref => { this.slide = ref; }} className={slideClass} data-index={idx}>
        <div className={`${csFocusCenter}${focused ? ' focusOn' : ''}`}>
          <div className="nor">
            <span className="wrapImg">
              {this.renderFocusImage()}
            </span>
            <p className="vodTitle"><span className="num">{chNo}</span><span className="title"></span></p>
            <p className="channelInfo"><span className="state">LIVE</span>{chName}</p>
          </div>
          <div className="foc">
            <span className="wrapImg">
              {this.renderFocusImage()}
            </span>
            <span className="progessBar">
              <span className="proceed" style={{ width: curProgram.progress + "%" }}></span>
            </span>
            <p className="vodTitle"><span className="num">{chNo}</span><span className="title">{curProgram && curProgram.title}</span></p>
            <p className="channelInfo"><span className="state">LIVE</span>{chName}</p>
          </div>
        </div>
      </div>
    )
  }

  componentWillUpdate(nextProps, nextState) {
    //blue('[componentWillUpdate()]');
    //this.isInitLoad = true;
  }

  componentDidUpdate(prevProps, prevState) {
    //blue('[componentDidUpdate]');

    /*
    if (this.isInitLoad) {
      this.props.onUpdateAnimation(0, 'on');
    }

    this.isInitLoad = false;
    */
  }

  componentDidMount() {
    //blue('[componentDidMount()] this.isInitLoad:', this.isInitLoad);

    /*
    if (this.isInitLoad) {
      this.props.onUpdateAnimation(0, 'on');
    }

    this.isInitLoad = false;
    */
  }
}

export default G2SlideChannel;
