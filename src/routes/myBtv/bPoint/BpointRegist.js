import React from 'react';

import appConfig from 'Config/app-config';
import NumberInputV2 from 'Module/NumberInputV2';
import { EPS } from 'Network';
import FM from 'Supporters/navi';
import { Core } from 'Supporters';
import keyCodes from 'Supporters/keyCodes';
import PopupPageView from 'Supporters/PopupPageView';
import StbInterface from 'Supporters/stbInterface';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/bPoint/BpointRegist.css';

const { Keymap: { BACK_SPACE, PC_BACK_SPACE, UP, DOWN, LEFT, RIGHT, ENTER } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;
const COUPON_DIGIT = 16;
const GIFTICON_DIGIT = 12;

let focusOpts = {
  radioGroup: {
    id: 'radioGroup',
    moveSelector: '.optionWrap .gridWrap',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 2,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  },
  inputGroup: {
    id: 'inputGroup',
    moveSelector: '.contentBox .gridWrap .gridStyle',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 4,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 3,
  },
  buttonGroup: {
    id: 'buttonGroup',
    moveSelector: '.buttonWrap',
    focusSelector: '.csFocus',
    row: 1,
    col: 2,
    focusIdx: 1,
    startIdx: 1,
    lastIdx: 1,
  }
};

class BpointRegist extends PopupPageView {
  constructor(props) {
    super(props);

    this.state = {
      radioSelectYN: ['select', ''],
      registButtonDisabled: true
    };

    this.inputRefs = [];
    this.inputFocusIndex = 0;
    this.pointNo = ['', '', '', ''];
    this.digit = COUPON_DIGIT;

    this.defaultFM = {
      radioGroup: new FM({
        ...focusOpts.radioGroup,
        onFocusKeyDown: this.onRadioKeyDown,
        onFocusContainer: this.onFocusRadioGroup
      }),
      inputGroup: new FM({
        ...focusOpts.inputGroup,
        onFocusChild: this.onFocusInput,
        onBlurContainer: this.onBlurInputGroup,
        onFocusKeyDown: this.onInputCursor
      }),
      buttonGroup: new FM({
        ...focusOpts.buttonGroup,
        onFocusKeyDown: this.onButtonKeyDown,
        onFocusChild: this.onButtonFocusChild
      })
    }

    const focusList = [
      { key: 'radioGroup', fm: null },
      { key: 'inputGroup', fm: null, link: { DOWN: 'buttonGroup' } },
      { key: 'buttonGroup', fm: null }
    ];
    this.declareFocusList(focusList);

    StbInterface.keyInfo({
      numKeyUse: false
    });
  }

  onInputCursor = (event, idx) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs[idx];
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

  onFocusInput = (idx) => {
    setTimeout(() => {
      this.inputRefs[idx].focus();
    }, 10);

    this.inputFocusIndex = idx;
  }

  onBlurInputGroup = () => {}

  initFocus = () => {
    const { radioGroup, inputGroup, buttonGroup } = this.defaultFM;
    this.setFm('radioGroup', radioGroup);
    this.setFm('inputGroup', inputGroup);
    this.setFm('buttonGroup', buttonGroup);
    this.setFocus('inputGroup', 0);
  }

  injectRef = (ref, i) => {
    this.inputRefs[i] = ref;
  }

  onButtonFocusChild = () => {
    this.inputRefs[this.inputFocusIndex].blur();
  }

  onFocusRadioGroup = () => {
    const inputRef = this.inputRefs[this.inputFocusIndex];

    if (inputRef) {
      inputRef.blur();
    }
  }

  onButtonKeyDown = (event, focusIdx) => {
    if (event.keyCode === ENTER) {
      if (focusIdx === 0) {			// 등록완료
        this.sendRegistInfo();
      } else if (focusIdx === 1) {	// 취소
        this.registCancel();
        return true;
      }
    }
  }

  onRadioKeyDown = (event, focusIdx) => {
    let { radioSelectYN } = this.state;
    let max = 4;

    if (event.keyCode !== ENTER) return;

    this.setState({
      radioSelectYN: radioSelectYN.map((item, idx) => {
        if (focusIdx === idx) return 'select';
        else return '';
      }),
      registButtonDisabled: true
    });

    this.pointNo = new Array(max - focusIdx).fill('');
    this.digit = focusIdx === 0 ? COUPON_DIGIT : GIFTICON_DIGIT;
    this.setFocus(0, focusIdx);

    this.defaultFM.inputGroup.setListInfo({
      col: max - focusIdx,
      focusIdx: 0,
      lastIdx: max - focusIdx - 1
    });

    this.defaultFM.buttonGroup.setListInfo({
      firstIdx: 1,
      focusIdx: 1
    });

    if (focusIdx === 1 && this.inputRefs.length > 3) {		// 기프티콘 일 경우
      this.inputRefs.pop();
    }

    this.inputRefs.forEach(inputRef => { inputRef.value = '' });
  }

  sendRegistInfo = () => {
    const pointNo = this.pointNo.join('');
    let toastParam = {
      msg: '',
      msgSub: '',
      time: ''
    };

    if (this.digit === GIFTICON_DIGIT) {
      EPS.request411({
        transactionId: 'giftcon_regist',
        couponNo: pointNo
      }).then(data => {
        //console.log('%c EPS-411 data', 'color: green', data);

        switch (data.result) {
          case '4061':
          case '4751':
            toastParam = {
              msg: '기프티콘 번호 정보가 맞지 않습니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          case '4753':
            toastParam = {
              msg: '이미 사용한 기프티콘 번호입니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          case '4752':
            toastParam = {
              msg: '이용기간이 만료되어 사용할 수 없는 기프티콘 번호입니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          default:
            toastParam = {
              msg: data.result,
              msgSub: data.reason,
              time: 3000
            };
            break;
        }

        const { msg, msgSub, time } = toastParam;
        Core.inst().showToast(msg, msgSub, time);

        if (data.result === '0000') {
          StbInterface.requestCouponPoint();
          this.props.callback({ result: '0000' });
        }
      })
    } else if (this.digit === COUPON_DIGIT) {
      EPS.request460({ pointNo: pointNo }).then(data => {
        //console.log('%c EPS.request460', 'color: red', data);

        switch (data.result) {
          case '4410':
          case '4411':
            toastParam = {
              msg: '쿠폰번호 정보가 맞지 않습니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          case '4413':
            toastParam = {
              msg: '이미 사용한 쿠폰번호입니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          case '4412':
            toastParam = {
              msg: '이용기간이 만료되어 사용할 수 없는 쿠폰번호입니다.',
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          case '0000':
            toastParam = {
              msg: data.coupon.title,
              msgSub: '쿠폰이 등록되었습니다.',
              time: 4000
            };
            break;
          case '4513':
            toastParam = {
              msg: data.reason,
              msgSub: '입력하신 정보를 다시 확인해 주세요.',
              time: 3000
            };
            break;
          default:
            toastParam = {
              msg: data.result,
              msgSub: data.reason,
              time: 3000
            };
            break;
        }

        const { msg, msgSub, time } = toastParam;
        Core.inst().showToast(msg, msgSub, time);

        if (data.result === '0000') {
          this.props.callback({ result: '0000' });
        }
      });
    }
  }

  registCancel = () => {
    this.props.callback();
  }

  isReadyforRegistration = () => {
    return this.pointNo.join('').length === this.digit;
  }

  setButtonGroup = (cb) => {
    if (this.isReadyforRegistration()) {
      this.setState({ registButtonDisabled: false }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 0,
          focusIdx: 0
        });

        return cb && cb();
      });
    } else if (!this.state.registButtonDisabled) {
      this.setState({ registButtonDisabled: true }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 1,
          focusIdx: 1
        });
      });
    }
  }

  onInputKeyDown = (event, cpNo) => {
    this.pointNo[this.inputFocusIndex] = cpNo;

    this.setButtonGroup();
    /*
    if (this.isReadyforRegistration) {
      this.setState({ registButtonDisabled: false }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 0,
          focusIdx: 0
        });
      });
    } else if (!this.state.registButtonDisabled) {
      this.setState({ registButtonDisabled: true }, () => {
        this.defaultFM.buttonGroup.setListInfo({
          firstIdx: 1,
          focusIdx: 1
        });
      });
    }
    */
  }

  onFullInput = (index) => {
    const indexToMove = index + 1;
    const isBpointRegist = this.state.radioSelectYN[0] === 'select';
    const inputRange = isBpointRegist ? 4 : 3;

    if (this.inputRefs[indexToMove]) {
      this.setFocus('inputGroup', indexToMove);
      this.inputRefs[indexToMove].focus();
    } else if (indexToMove === inputRange) {
      this.setButtonGroup(() => {
        this.setFocus('buttonGroup');
      });
    }
  }

  componentDidMount() {
    super.componentDidMount();

    document.querySelector('.wrapper').classList.add('dark');
    this.initFocus();
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    document.querySelector('.wrapper').classList.remove('dark');
    if (appConfig.runDevice) window.tvExt.utils.ime.setSearchMode(false);
    StbInterface.keyInfo({
      numKeyUse: true
    });
  }

  onKeyDown(event) {
    super.onKeyDown(event);

    switch (event.keyCode) {
      case BACK:
        this.props.callback();
        return true;
      case UP:
      case DOWN:
        // UP/DOWN 키로 focus group 간에 움직일 때, input tag에 focus가 생기는 것을 방지
        event.preventDefault();
        break;
      case LEFT:
      case RIGHT:
        // LEFT/RIGHT 키로 focus child 간에 움직일 때, input tag가 전체 선택 되는 것을 방지
        if (this.getCurrentFocusInfo().key !== 'inputGroup') {
          event.preventDefault();
        }
        break;
      default:
        break;
    }
  }

  render() {
    const { registButtonDisabled, radioSelectYN } = this.state;
    const isBpointRegist = radioSelectYN[0] === 'select';
    const inputTitle = isBpointRegist ? 'B포인트 번호' : '기프티콘';
    const inputRange = isBpointRegist ? 4 : 3;
    const inputTag = new Array(inputRange).fill(0).map((item, idx) => (
      <NumberInputV2 key={idx}
        index={idx}
        onInputKeyDown={this.onInputKeyDown}
        onFull={this.onFullInput}
        injectRef={this.injectRef}
        gridStyle="card"
        htmlFor="label"
      />
    ));

    return (
      <div className="wrap">
        <div className="registWrap bPoint">
          <h2 className="pageTitle">B포인트 등록</h2>
          <p className="subInfo">발급받으신 B포인트 등록번호 16자리 또는 12자리를 입력해주세요.</p>
          <div className="registerForm">
            <fieldset>
              <div className="contentBox radioWrap contentGroup1" id="radioGroup">
                <div className="optionWrap">
                  <div className="gridWrap">
                    <span className={`csFocusInput radioStyle default ${radioSelectYN[0]}`}
                      tabIndex="-1">
                      일반 B포인트 (16자리)
										</span>
                    <span className={`csFocusInput radioStyle ${radioSelectYN[1]}`}
                      tabIndex="-1">
                      기프티콘 번호 (12자리)
										</span>
                  </div>
                </div>
              </div>
              <div className="radioContentWrapper" id="inputGroup">
                <div className={`contentBox select contentGroup2 ${isBpointRegist ? '' : 'gift'}`}>
                  <p className="inputTitle">{inputTitle}</p>
                  <div className="gridWrap">
                    {inputTag}
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
          <div id="buttonGroup">
            <div className="buttonWrap">
              <span className="csFocus btnStyle default" data-disabled={registButtonDisabled}>
                <span className="wrapBtnText">등록완료</span>
              </span>
              <span className="csFocus btnStyle">
                <span className="wrapBtnText">취소</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BpointRegist;