import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';

import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi.js';

//import appConfig from './../../../../../config/app-config';
import { kidsConfigs } from '../../../config/kids-config.js';
import { DIR } from './SlideInfo.js';

import 'Css/kids/character/CharacterHome.css';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[G2SliderRotateCharacter] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[G2SliderRotateCharacter] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class G2SliderRotateCharacter extends Component {
  constructor(props) {
    super(props);

    log('[kidsConfigs.SLIDE_TO.CHARTER]', kidsConfigs.SLIDE_TO.CHARACTER);
    this.state = {
      slideTo: kidsConfigs.SLIDE_TO.CHARACTER + 2,
      focused: false,
      currentIdx: 0,
      fakeChildren: null
    };

    //this.fakeChildrenList = new Map(); // ref 저장용
    this.isAnimating = false;
    this.keyTimer = 0;
  }

  static defaultProps = {
    onSelect: null,
    slideDuration: 200,
    bAnimation: false,
    width: 1830, // 1920,
    height: 633, // 792,
    itemWidth: 366,
    itemHeight: 633,
    maxSlideMenu: 5
  }

  /*********************************** Component Lifecycle Methods ***********************************/
  componentDidMount() {
    const { setFm, id } = this.props;

    setFm(id, new FM({
      id,
      focusIdx: this.props.focusIndex,
      type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
      onFocusKeyDown: this.onFocusKeyDown,
      onFocusContainer: this.onFocusContainer,
      onBlurContainer: this.onBlurContainer,
    }));

    this.setState({
      currentIdx: this.props.focusIndex,
      slideTo: kidsConfigs.SLIDE_TO.CHARACTER + this.props.focusIndex
    }, () => {
      const { onInitFocus } = this.props;
      //const transitionElem = document.querySelector('characterSlide');

      this.createFakeElements();

      if (onInitFocus && typeof onInitFocus) {
        onInitFocus(this.props.focusIndex);
      }

      /*
      if (transitionElem) {
        transitionElem.addEventListener('webkitTransitionEnd', this.onWebkitTransitionEnd);
        log('transitionEnd event handler is added.');
      } else {
        log('Cannot find .characterSlide element.');
      }
      */
      /*
      if (this.slideElem) {
        this.slideElem.addEventListener('webkitTransitionEnd', this.onWebkitTransitionEnd, false);
        log('transitionEnd event handler is added.');
      } else {
        log('Cannot find .characterSlide element.');
      }
      */
    });
  }

  componentWillReceiveProps(nextProps) {
    // children 을 JSON.parse 하면 순환구조 오류로 인해 체크 불가.
    // const { children } = this.props;
    // const { children: prevChildren } = nextProps;
    // console.log( 'receive props:', children);
    // if (JSON.stringify(children) !== JSON.stringify(prevChildren)) {
    //     this.createFakeElements();
    // }
    this.createFakeElements();
  }

  /*********************************** FocusManager KeyEvent Methods ***********************************/
  onFocusContainer = () => {
    log('[currentIdx], ', this.state.currentIdx);
    const { onSlider } = this.props;

    this.setState({ focused: true }, () => {
      this.createFakeElements();

      if (onSlider && typeof onSlider === 'function') {
        onSlider(this.state.currentIdx);
      }
    });

    clearInterval(this.timer);
  }

  onBlurContainer = () => {
    log('[currentIdx], ', this.state.currentIdx);
    const { offSlider } = this.props;

    this.setState({ focused: false }, () => {
      this.createFakeElements();

      if (offSlider && typeof offSlider === 'function') {
        offSlider(this.state.currentIdx);
      }
    });
    const { autoPlay } = this.props;
    if (autoPlay) {
      this.timer = setInterval(() => {
        this.slide(DIR.RIGHT);
      }, 3000);
    }
  }

  onFocusKeyDown = (evt, childIdx) => {
    let currentIdx = this.state.currentIdx;
    const { onKeyDown, onUpdateAnimation } = this.props;

    blue('[onFocusKeyDown]');

    if (evt.keyCode === keyCodes.Keymap.LEFT && !this.isAnimating) {
      onUpdateAnimation(currentIdx, 'off');
      this.slide(DIR.LEFT);
      // setTimeout(() => {
      //     this.slide(DIR.LEFT);
      // }, 1);
      //this.isAnimating = true;
      log('Change isAnimating:', this.isAnimating);
    }

    if (evt.keyCode === keyCodes.Keymap.RIGHT && !this.isAnimating) {
      onUpdateAnimation(currentIdx, 'off');
      // this.lock('slide', this.slide, DIR.RIGHT);
      this.slide(DIR.RIGHT);
      // setTimeout(() => {
      //     this.slide(DIR.RIGHT);
      // }, 1);
      //this.isAnimating = true;
      log('Change isAnimating:', this.isAnimating);
    }

    if (onKeyDown && typeof onKeyDown === 'function') {
      onKeyDown(evt, currentIdx);
    }
  }

  onEnterDown = () => {
    this.onSelect();
  }

  onSelect = () => {
    const { onSelect } = this.props;
    if (typeof onSelect === 'function') {
      onSelect(this.state.currentIdx);
    }
  }

  onWebkitTransitionEnd = (event) => {
    blue('[onWebkitTransitionEnd()] event:', event);
  }

  onTransitionEnd = (event) => {
    const { propertyName, elapsedTime, nativeEvent } = event;
    blue('[onTransitionEnd()]');
    //blue('[onTransitionEnd()] event:', event);
    //log('nativeEvent:', nativeEvent);
    log('propertyName: %s, elapsedTime: %s, 1st path className:"%s"', propertyName, elapsedTime, nativeEvent.path[0].className);

    clearTimeout(this.keyTimer);

    this.keyTimer = setTimeout(() => {
      this.isAnimating = false;
      log('Change isAnimating:', this.isAnimating);
    }, 400);
    /*
        this.isAnimating = false;
    if (nativeEvent.path[0].className === 'slide') {
      setTimeout(() => {
        this.isAnimating = false;
        log('Change isAnimating:', this.isAnimating);
      }, 1);
    }
    */
  }

  /*********************************** Etc Methods ***********************************/
  // lock = (funcName, lockFunc, param) => {
  //     let old = {};

  //     if(this[funcName].locked) {
  //         return false;
  //     }
  //     old = this[funcName];
  //     this[funcName] = lockFunc;
  //     this[funcName].locked = true;

  //     return () => {
  //         this[funcName] = old;
  //     }
  // }

  slide = (dir) => {
    const CLONE_SLIDE = kidsConfigs.SLIDE_TO.CHARACTER;

    if (dir === DIR.LEFT) {
      const { currentIdx } = this.state;
      const { children } = this.props;
      const realChildren = React.Children.toArray(children);
      let index = currentIdx - 1;
      let bSkipped = false;

      if (index === -1) {
        index = realChildren.length - 1;
        bSkipped = true;
      }

      if (bSkipped) {
        this.setState({
          slideTo: this.state.slideTo - 1,
          currentIdx: realChildren.length,
          bAnimation: false
        }, () => {
          setTimeout(() => {
            this.setState({
              slideTo: realChildren.length - 1 + CLONE_SLIDE,
              currentIdx: index,
              bAnimation: true
            }, () => {
              this.createFakeElements();
            });
          }, 1);
        });
      } else {
        this.setState({
          slideTo: this.state.slideTo - 1,
          currentIdx: index,
          bAnimation: true
        }, () => {
          this.createFakeElements();
        });
      }
    } else {
      const { currentIdx } = this.state;
      const { children } = this.props;
      const realChildren = React.Children.toArray(children);
      let index = currentIdx + 1;
      let bSkipped = false;

      if (index === realChildren.length) {
        index = 0;
        bSkipped = true;
      }

      if (bSkipped) {
        this.setState({
          slideTo: this.state.slideTo + 1,
          currentIdx: -1,
          bAnimation: false
        }, () => {
          setTimeout(() => {
            this.setState({
              slideTo: CLONE_SLIDE,
              currentIdx: index,
              bAnimation: true
            }, () => {
              this.createFakeElements();
            });
          }, 1)
        })
      } else {
        this.setState({
          slideTo: this.state.slideTo + 1,
          currentIdx: index,
          bAnimation: true
        }, () => {
          this.createFakeElements();
        });
      }
    }
  }

  createFakeElements = () => {
    const { children } = this.props;
    const { currentIdx, focused: containerFocused } = this.state;
    const childList = children ? React.Children.toArray(children) : null;
    const cloneList = React.Children.map(childList, (child, idx) => {
      const focused = (containerFocused && idx === currentIdx);
      return React.cloneElement(child, { focused, pos: idx, currentIdx, idx, key: idx });
    });

    if (!childList) {
      this.setState({ fakeChildren: null });
      return;
    }

    // TODO: item 수가 max보다 작은경우 처리
    const { maxSlideMenu } = this.props;
    const neededFakes = Math.ceil(maxSlideMenu / 2);
    const lastIdx = childList.length;
    // head : needed ~ last
    // tail : 0 ~ needed
    const heads = childList.slice(lastIdx - neededFakes, lastIdx);
    const headList = React.Children.map(heads, (child, index) => {
      const pos = -(neededFakes - index);
      const key = -(neededFakes - index);
      const idx = childList.length - (neededFakes - index);
      const clone = true;
      return React.cloneElement(child, { pos, key, idx, clone });
    });
    const tails = childList.slice(0, neededFakes);
    const tailList = React.Children.map(tails, (child, index) => {
      const pos = childList.length + index;;
      const key = pos;
      const idx = index;
      const clone = true;
      return React.cloneElement(child, { pos, key, idx, clone });
    });

    const fakeChildren = [];
    fakeChildren.push(...headList);
    fakeChildren.push(...cloneList);
    fakeChildren.push(...tailList);

    this.setState({ fakeChildren });
  }

  // getSlideStyle = () => {
  //     const { slideDuration, itemWidth, maxSlideMenu } = this.props;
  //     const neededFakes = Math.ceil(maxSlideMenu / 2);
  //     const { currentIdx, bAnimation } = this.state;
  //     const fakeIdx = currentIdx + neededFakes;
  //     const x = -(fakeIdx * itemWidth);

  //     const style = {
  //         transition: `transform ease-in-out ${bAnimation ? slideDuration : 0}ms`,
  //         transform: `translateX(${x}px)`,
  //         paddingLeft: 750 // Math.floor( width / 2 ) <== ( item 수가 작은 경우 처리해줘야됨 )
  //     }
  //     return style;
  // }

  /*********************************** Render ***********************************/
  render() {
    //const { id } = this.props;
    const { slideTo, fakeChildren, focused } = this.state;
    const { itemWidth } = this.props;
    const className = {
      scrollWrap: `characterSlideWrap scrollWrap${focused ? ' focus' : ''}`
    }

    const cuStomStyle = {
      slideStyle: {
        '--slidePage': slideTo,
        'width': !isEmpty(fakeChildren) ? (fakeChildren.length * itemWidth) : '0'
      }
    }
    // const slideStyle = this.getSlideStyle();

            //<div className="characterSlide" style={cuStomStyle.slideStyle} onTransitionEnd={this.onTransitionEnd}>
            //<div className="characterSlide" ref={ref => this.slideElem = ref} style={cuStomStyle.slideStyle}>
    return (
      <div className={className.scrollWrap}>
        <div className="dim"></div>
        <div className="characterSlideInner">
          <div className="contentGroup">
            <div className="characterSlide" style={cuStomStyle.slideStyle} onTransitionEnd={this.onTransitionEnd}>
              {fakeChildren}
            </div>
          </div>
        </div>
        <img src="/assets/images/kids/button/arrow-left.png" className="leftArrow" alt="" />
        <img src="/assets/images/kids/button/arrow-right.png" className="rightArrow" alt="" />
        <div className="keyWrap mini"><span className="btnKeyDown">캐릭터 전체보기</span></div>
      </div>
      // <div id={id} className={className.scrollWrap} style={{ transform: 'translate(0px, 0px)' }}> {/* 포커스시 focus 추가*/}
      //     {/* <div className={focused ? 'dim' : ''}/> */}
      //     <div className="characterSlideInner">
      //         <div className="contentGroup">
      //             <div className="characterSlide" style={slideStyle}>
      //                 {fakeChildren}
      //             </div>
      //         </div>
      //     </div>
      //     <img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-left.png`} className="leftArrow" alt="" />
      //     <img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-right.png`} className="rightArrow" alt="" />
      //     <div className="charKeyWrap"><span className="charBtnKeyOption">캐릭터 전체보기</span></div>
      // </div>
    );
  }
}

export default G2SliderRotateCharacter
