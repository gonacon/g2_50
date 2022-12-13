// External Modules
import React from 'react';
import isEmpty from 'lodash/isEmpty';

// Common
import FM from 'Supporters/navi';
import Core from 'Supporters/core';
import PopupPageView from 'Supporters/PopupPageView';
import keyCodes from 'Supporters/keyCodes';
import appConfig from 'Config/app-config';

// Network
import { EPS } from 'Network';

// Component
import NumberInputV2 from 'Module/NumberInputV2';
import StbInterface from 'Supporters/stbInterface';

// Style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/okcash/OkCashRegist.css';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE, LEFT, RIGHT, UP, DOWN } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;

const errorMessage = '입력하신 정보가 OK캐쉬백 카드 정보와 일치하지 않습니다.\n입력하신 정보를 다시 확인해 주세요.';
const okMessage = 'OK캐쉬백 카드가 등록되었습니다.';
const toastMessages = {
  '4551': errorMessage,
  '4552': errorMessage,
  '4553': errorMessage,
  '4554': errorMessage,
  '0000': okMessage
};

const PWD_DIGIT = 4;
const DIGIT = 16;

let focusOpts = {
  cardNumber: {
    id: 'cardNumber',
    moveSelector: '.contentBox .gridWrap .gridStyle',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 4,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 3,
  },
  pwdInput: {
    id: 'pwdInput',
    type: 'ELEMENT',
    focusSelector: '.csFocusInput',
    row: 1,
    col: 1,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 0,
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
  },
}

class OkCashRegist extends PopupPageView {
  constructor(props) {
    super(props);
    this.name = '[OkCashRegist] ';
    this.state = isEmpty(this.historyData) ? {
      registButtonDisabled: true,
      sequence: this.props.data.sequence || 1,
    } : this.historyData;

    this.inputRefs = [];
    this.cardNo = ['', '', '', ''];    // 카드번호 16자리
    this.pwd = '';
    this.cardInputFocusIndex = 0;

    this.defaultFM = {
      cardNumber: new FM({
        ...focusOpts.cardNumber,
        onFocusChild: this.onFocusInput,
        onBlurContainer: this.onBlurInput,
        onFocusKeyDown: this.onInputCursor
      }),
      pwdInput: new FM({
        ...focusOpts.pwdInput,
        onFocusChild: this.onFocusPwdInput,
        onBlurContainer: this.onBlurPwdInput,
        onFocusKeyDown: this.onPwdInputCursor
      }),
      buttonGroup: new FM({
        ...focusOpts.buttonGroup,
        onFocusKeyDown: this.onButtonGroupKeyDown
      })
    }

    const focusList = [
      { key: 'cardNumber', fm: null },
      { key: 'pwdInput', fm: null },
      { key: 'buttonGroup', fm: null },
    ];

    this.declareFocusList(focusList);
  }

  onKeyDown(event) {
    super.onKeyDown(event);

    switch (event.keyCode) {
      case BACK:
        this.props.callback();
        return true;      // 이전 PageView의 back을 막음
      case UP:
      case DOWN:
        // UP/DOWN 키로 focus group 간에 움직일 때, input tag에 focus가 생기는 것을 방지
        event.preventDefault();
        break;
      case LEFT:
      case RIGHT:
        const key = this.getCurrentFocusInfo().key;

        // LEFT/RIGHT 키로 focus child 간에 움직일 때, input tag가 전체 선택 되는 것을 방지
        // 제대로 처리하지 않으면 input field 내 커서 이동 불가능
        if (key !== 'cardNumber' && key !== 'pwdInput') {
          event.preventDefault();
        }

        break;
      default:
        break;
    }
  }

  registCard = () => {
    const { sequence } = this.state;

    //console.log('%c OK캐시백 카드 등록', 'color: red; background: yellow', );
    EPS.request560({
      sequence,
      cardNo: this.cardNo.join(''),
      password: this.pwd
    }).then(data => {
      const msg = toastMessages[data.result] || data.reason;

      //console.log('%c data', 'color: red; background: yellow', data);

      if (data.result === '0000') {
        this.props.callback(data.result);
      }

      Core.inst().showToast(msg);
      //setTimeout(() => { this.props.callback(data.result); }, 3000);
    });
  }

  onButtonGroupKeyDown = (event, index) => {
    const { keyCode } = event;

    if (keyCode !== ENTER) return;

    if (index === 0) {          // 등록
      this.registCard();
    } else if (index === 1) {   // 취소
      this.props.callback();
    }
  }

  onInputKeyDown = (event, value) => {
    this.cardNo[this.cardInputFocusIndex] = value;

    if (this.cardNo.join('').length === DIGIT && this.pwd.length === PWD_DIGIT) {
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
  }

  onInputCursor = (event, index) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs[index];
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

  onPwdInputCursor = (event) => {
    // input field 내에서의 커서 움직임 구현
    const { keyCode } = event;
    const target = this.inputRefs.pwd;
    const length = target.value.length;
    const selection = target.selectionStart;

    if (length > 0 && (keyCode === RIGHT || keyCode === LEFT)) {
      if (length === selection && keyCode === RIGHT) return false;
      if (selection === 0 && keyCode === LEFT) return false;
      return true;
    }
  }

  onBlurInput = (key) => {
    this.inputRefs[this.cardInputFocusIndex].blur();
  }

  onFocusInput = (index) => {
    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs[index].focus();
    }, 10);

    this.cardInputFocusIndex = index;
  }

  onFocusPwdInput = (index) => {
    // setTimeout() 주지 않으면 focus() 호출하여 다른 <input>으로 focus 이동 후, 이동한 <input>의 onkeydown()에 좌우키가 입력되어 한 번 더 이동함.
    setTimeout(() => {
      this.inputRefs.pwd.focus();
    }, 10);

    //this.inputRefs.pwd.focus();
  }

  onBlurPwdInput = (key) => {
    this.inputRefs.pwd.blur();
  }

  injectRef = (ref, i) => {
    console.log(this.name + 'injectRef', ref, i);
    this.inputRefs[i] = ref;
  }

  initFocus = () => {
    const { cardNumber, pwdInput, buttonGroup } = this.defaultFM;
    this.setFm('cardNumber', cardNumber);
    this.setFm('pwdInput', pwdInput);
    this.setFm('buttonGroup', buttonGroup);
    this.setFocus(0);
  }

  onPwdInputKeyDown = (event) => {
    //console.log('onPwdInputKeyDown event:', event, event.target.value);
    this.pwd = event.target.value;

    if (this.cardNo.join('').length === DIGIT && this.pwd.length === PWD_DIGIT) {
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
  }

  onFullCardInput = (index) => {
    const indexToMove = index + 1;

    if (this.inputRefs[indexToMove]) {
      this.setFocus('cardNumber', indexToMove);
      this.inputRefs[indexToMove].focus();
    } else if (indexToMove === 4) {
      this.setFocus('pwdInput');
      this.inputRefs.pwd.focus();
    }
  }

  componentDidMount() {
    super.componentDidMount();

    document.querySelector('.wrapper').classList.add('dark');
    this.initFocus();
    StbInterface.keyInfo({
      numKeyUse: false
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    document.querySelector('.wrapper').classList.remove('dark');
    if (appConfig.runDevice) window.tvExt.utils.ime.setSearchMode(false);
    StbInterface.keyInfo({
      numKeyUse: true
    });
  }

  render() {
    const { registButtonDisabled } = this.state;
    const inputTag = new Array(4).fill(0).map((item, index) => (
      <NumberInputV2 key={index}
        index={index}
        onInputKeyDown={this.onInputKeyDown}
        onFull={this.onFullCardInput}
        injectRef={this.injectRef}
        gridStyle="card"
        htmlFor="label"
      />
    ));

    return (
      <div className="wrap">
        <div className="registWrap okRegist">
          <h2 className="pageTitle">OK캐쉬백 카드 등록</h2>
          <p className="subInfo">OK캐쉬백 카드번호 16자리와 카드 비밀번호를 입력해주세요.</p>
          <div className="registerForm" id="cardNumber">
            <div className="contentBox">
              <p className="inputTitle">카드번호</p>
              <div className="gridWrap contentGroup1">
                {inputTag}
              </div>
            </div>
            <div className="contentBox addition contentGroup1">
              <div className="password">
                <p className="inputTitle">비밀번호</p>
                <NumberInputV2 index="pwd"
                  id="pwdInput"
                  type="password"
                  gridStyle="noClass"
                  placeholder="4자리 숫자"
                  onInputKeyDown={this.onPwdInputKeyDown}
                  injectRef={this.injectRef}
                  htmlFor="label"
                />
              </div>
            </div>
          </div>
          <div className="fakeWrapper" id="buttonGroup">
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

export default OkCashRegist;
