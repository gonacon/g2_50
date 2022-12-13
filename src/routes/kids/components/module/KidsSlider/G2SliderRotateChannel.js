import React, { Component } from 'react';
import { DIR } from './SlideInfo.js';
import 'Css/kids/channel/ChannelHome.css';
import FM from 'Supporters/navi.js';
//import '../../../../src/assets/css/routes/kids/character/CharacterHome.css';
import keyCodes from 'Supporters/keyCodes';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[G2SliderRotateChannel] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[G2SliderRotateChannel] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class G2SliderRotateChannel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      currentIdx: this.props.currentIdx || 0,
      fakeChildren: null
    };

    //this.fakeChildrenList = new Map(); // ref 저장용
  }

  static defaultProps = {
    onSelect: null,
    slideDuration: 200,
    bAnimation: false,
    width: 1804, // 1920,
    height: 700, // 792,
    itemWidth: 331,
    itemHeight: 293,
    maxSlideMenu: 3
  }

  onFocusContainer = () => {
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
    const { offSlider } = this.props;

    this.setState({ focused: false }, () => {
      this.createFakeElements();

      if (offSlider && typeof offSlider === 'function') {
        offSlider(this.state.currentIdx);
      }
    });

    /*
    const { autoPlay } = this.props;
    if (autoPlay) {
      this.timer = setInterval(() => {
        this.slide(DIR.RIGHT);
      }, 3000);
    }
    */
  }

  onFocusKeyDown = (evt, childIdx) => {
    let currentIdx = this.state.currentIdx;
    const { onKeyDown, onUpdateAnimation } = this.props;

    log('[onFocusKeyDown()] childIdx:', childIdx);

    if (evt.keyCode === keyCodes.Keymap.LEFT) {
      onUpdateAnimation(currentIdx, 'off');
      this.slide(DIR.LEFT);
    }

    if (evt.keyCode === keyCodes.Keymap.RIGHT) {
      onUpdateAnimation(currentIdx, 'off');
      this.slide(DIR.RIGHT);
    }

    if (onKeyDown && typeof onKeyDown === 'function') {
      onKeyDown(evt, currentIdx);
    }
  }

  /*
  onEnterDown = () => {
    this.onSelect();
  }
  */

  slide = (dir) => {
    blue('[slide()]', dir);

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
          currentIdx: realChildren.length,
          bAnimation: false
        }, () => {
          setTimeout(() => {
            this.setState({
              currentIdx: index,
              bAnimation: true
            }, () => {
              this.createFakeElements();
            });
          }, 1);
        });
      } else {
        this.setState({
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
          currentIdx: -1,
          bAnimation: false
        }, () => {
          setTimeout(() => {
            this.setState({
              currentIdx: index,
              bAnimation: true
            }, () => {
              this.createFakeElements();
            });
          }, 1)
        })
      } else {
        this.setState({
          currentIdx: index,
          bAnimation: true
        }, () => {
          this.createFakeElements();
        });
      }
    }
  }

  /*
  onSelect = () => {
    const { onSelect } = this.props;

    if (typeof onSelect === 'function') {
      onSelect(this.state.currentIdx);
    }
  }
  */

  getCurrentIndex = () => {
    return this.state.currentIdx;
  }

  createFakeElements = () => {
    const { children } = this.props;
    const { currentIdx, focused: containerFocused } = this.state;
    const childList = children ? React.Children.toArray(children) : null;
    const cloneList = React.Children.map(childList, (child, idx) => {
      const focused = (containerFocused && idx === currentIdx);
      const isDefault = idx === currentIdx;
      return React.cloneElement(child, { focused, isDefault, pos: idx, currentIdx, idx, key: idx });
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

  componentDidMount() {
    const { setFm, id, onUpdateAnimation } = this.props;

    blue('[componentDidMount()]');

    setFm(id, new FM({
      id,
      type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
      onFocusKeyDown: this.onFocusKeyDown,
      onFocusContainer: this.onFocusContainer,
      onBlurContainer: this.onBlurContainer,
    }));

    this.createFakeElements();

    setTimeout(() => { onUpdateAnimation(this.state.currentIdx, 'on'); }, 1);
  }

  componentWillReceiveProps(nextProps) {
    blue('[componentWillReceiveProps()] nextProps:', nextProps);

    // children 을 JSON.parse 하면 순환구조 오류로 인해 체크 불가.
    // const { children } = this.props;
    // const { children: prevChildren } = nextProps;
    // console.log( 'receive props:', children);
    // if (JSON.stringify(children) !== JSON.stringify(prevChildren)) {
    //     this.createFakeElements();
    // }
    this.setState({
      currentIdx: nextProps.currentIdx,
      bAnimation: false
    }, () => {
      this.createFakeElements();
    });

    //this.createFakeElements();
  }

  componentDidUpdate(prevProps) {
    blue('[componentDidUpdate()] prevProps:', prevProps);
  }

  getSlideStyle = () => {
    const { slideDuration, itemWidth, maxSlideMenu } = this.props;
    const neededFakes = Math.ceil(maxSlideMenu / 2);
    const { currentIdx, bAnimation } = this.state;
    const fakeIdx = currentIdx + neededFakes;
    const x = -(fakeIdx * itemWidth) + -(currentIdx * 29);

    const style = {
      transition: `transform ease-in-out ${bAnimation ? slideDuration : 0}ms`,
      transform: `translateX(${x}px)`,
      // 6/14 paddingLeft 수치 660 -> 662 수정
      paddingLeft: 662 // Math.floor( width / 2 ) <== ( item 수가 작은 경우 처리해줘야됨 )
    }
    return style;
  }

  render() {
    const { id, bShow } = this.props;
    const { fakeChildren, focused } = this.state;
    const className = {
      scrollWrap: `channelSlideWrap scrollWrap${focused ? ' focus' : ''}`
    }

    blue('[render()]');

    const slideStyle = this.getSlideStyle();
    const style = {
      bShow: { display: bShow ? 'block' : 'none' },
      transfrom: 'translate(0px, 0px)'
    }

    return (
      <div id={id} className={className.scrollWrap} style={style}> {/* 포커스시 focus 추가*/}
        <div className="contentGroup">
          <div className="slideWrap">
            <div className="slideCon">
              <div className="slideWrapper" style={slideStyle}>
                {fakeChildren}
              </div>
            </div>
            <span className="icRocket"></span>
            <div className="leftArrow"></div>
            <div className="rightArrow"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default G2SliderRotateChannel
