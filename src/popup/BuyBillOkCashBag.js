// commons
import React from 'react'

import appConfig from 'Config/app-config';
import NumberInputV2 from 'Module/NumberInputV2';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import PopupPageView from 'Supporters/PopupPageView';
import StbInterface from 'Supporters/stbInterface';

// style
import 'ComponentCss/popup/PopupDefault.css';
import 'ComponentCss/popup/Popup.css';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE, LEFT, RIGHT, UP, DOWN } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;
const DIGIT = 4;

class BuyBillOkCashBag extends PopupPageView {
  constructor(props) {
    super(props);

    this.declareFocusList([{ key: 'inputList', fm: null }, { key: 'buttonGroup', fm: null }]);

    const { cardNum, sequence, strDesc, title, subTitle } = this.props.data;

    this.state = {
      inputNumber: ['', '', '', ''],
      title,
      sequence,
      cardNum,
      strDesc,
      subTitle,
      isError: false,
      okBtnDisabled: true,
    };

    this.inputRefs = [];
    this.inputFocusIndex = 0;
    this.ime = appConfig.runDevice ? window.tvExt.utils.ime : {
      setKeyboardMode: () => { },
      setEnableSoftKeyboard: () => { },
      setSearchMode: () => { },
      sendKeyEvent: () => { }
    };

    this.ime.onSearchMode = (mode) => {
      if (mode) {
        this.ime.setKeyboardMode(this.ime.KEYBOARD_MODE_NUMBER);
      }
    };

    this.ime.onChunjiinMode = (event) => {};
    this.ime.onOKEvent = (event) => {};
    this.ime.onKeyboardMode = (mode) => {};
  }

  componentDidMount = () => {
    super.componentDidMount();
    /*
    console.log('====================================');
    console.log('this.props', this.props);
    console.log('====================================');
    */

    this.ime.setEnableSoftKeyboard(false);
    this.ime.setSearchMode(true);
    StbInterface.keyInfo({
      numKeyUse: false
    });

    if (document.querySelectorAll('.scrollWrap').length !== 0) {
      let style = document.querySelector('.scrollWrap').style.transform;
      document.querySelector('.popupWrap').style.transform = style;
    }

    this.registerFm();
  }

  componentWillUnmount = () => {
    super.componentWillUnmount();

    this.ime.setEnableSoftKeyboard(true);
    this.ime.setSearchMode(false);
    StbInterface.keyInfo({
      numKeyUse: true
    });
  }

  onKeyDown(event) {
    super.onKeyDown(event);

    switch (event.keyCode) {
      case BACK:
        this.props.callback({ btnSelect: 1 });
        return true;      // ?????? PageView??? back??? ??????
      case UP:
      case DOWN:
        // UP/DOWN ?????? focus group ?????? ????????? ???, input tag??? focus??? ????????? ?????? ??????
        event.preventDefault();
        break;
      case LEFT:
      case RIGHT:
        // LEFT/RIGHT ?????? focus child ?????? ????????? ???, input tag??? ?????? ?????? ?????? ?????? ??????
        if (this.getCurrentFocusInfo().key !== 'inputList') {
          event.preventDefault();
        }

        break;
      default:
        break;
    }
  }

  onFullInputList = (index) => {
    const indexToMove = index + 1;

    if (this.inputRefs[indexToMove]) {
      this.setFocus('inputList', indexToMove);
      this.inputRefs[indexToMove].focus();
    }
  }

  registerFm = () => {
    this.inputListFm = new FM({
      id: 'inputList',
      containerSelector: '.passwordWrap',
      focusSelector: '.csFocusPop',
      row: 1,
      col: 4,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 3,
      onFocusChild: this.onFocusInput,
      onBlurContainer: this.onBlurInput,
      onFocusKeyDown: this.onInputCursor
    });

    this.buttonGroupFm = new FM({
      id: 'buttonGroup',
      containerSelector: '.btnWrap',
      focusSelector: '.csFocusPop',
      row: 1,
      col: 2,
      focusIdx: 1,
      startIdx: 1,
      lastIdx: 1,
      onFocusKeyDown: this.onButtonGroupKeyDown
    });

    this.setFm('inputList', this.inputListFm);
    this.setFm('buttonGroup', this.buttonGroupFm);

    this.setFocus(0);
  }

  onBlurInput = () => {
    this.inputRefs[this.inputFocusIndex].blur();
  }

  onFocusInput = (index) => {
    // setTimeout() ?????? ????????? focus() ???????????? ?????? <input>?????? focus ?????? ???, ????????? <input>??? onkeydown()??? ???????????? ???????????? ??? ??? ??? ?????????.
    setTimeout(() => {
      this.inputRefs[index].focus();
    }, 10);

    this.inputFocusIndex = index;
  }

  onInputCursor = (event, index) => {
    // input field ???????????? ?????? ????????? ??????
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

  onButtonGroupKeyDown = (event, index) => {
    if (event.keyCode === ENTER) {
      this.inquiryExec(index);
    }
  }

  showErrorMessage = msg => {
    this.setState({
      strDesc: msg,
      isError: true,
      inputNumber: ['', '', '', ''],
      okBtnDisabled: true,
    });

    this.setButtonDisable();
    this.setFocus(0, 0)
  }

  inquiryExec = (index) => {
    const { inputNumber } = this.state;

    if (index === 0) {        // ??????
      this.props.data.inquiry(
        inputNumber.join(''),
        { close: this.props.callback, showErrorMessage: this.showErrorMessage }
      )
    } else if (index === 1) {    // ??????
      this.props.callback({ btnSelect: 1 });
    }
  }

  injectRef = (ref, i) => {
    this.inputRefs[i] = ref;
  }

  setButtonDisable = () => {
    const okBtnDisabled = this.state.inputNumber.join('').length !== DIGIT;

    this.setState({ okBtnDisabled }, () => {
      const index = okBtnDisabled ? 1 : 0;

      this.buttonGroupFm.setListInfo({
        firstIdx: index,
        focusIdx: index
      });
    });
  }

  onInputKeyDown = (event, value) => {
    this.state.inputNumber[this.inputFocusIndex] = value;
    this.setButtonDisable();
  }

  render() {
    let { cardNum, title, subTitle, strDesc, isError, okBtnDisabled } = this.state;
    let masking = '****';
    let okCashBagNum = cardNum;
    //console.log('buybill:', okCashBagNum);

    if (Array.isArray(okCashBagNum)) {
      okCashBagNum = `${okCashBagNum.join('-')}-${masking}-${masking}`;
    } else {
      okCashBagNum = okCashBagNum.replace(/(\d)(?=(?:\d{4})+(?!\d))/g, '$1-');
      okCashBagNum = `${okCashBagNum}-${masking}-${masking}`;
    }
    const strDescStyle = isError ? { color: 'red' } : {};

    return (
      <div className="popupWrap">
        <div className="popupCon">
          <div className="title">{title}</div>
          <div className="okCashBagWrap">
            <div className="subTitle">{`${subTitle} `}{okCashBagNum}</div>
            <div id="inputList" className="passwordWrap">
              {
                new Array(4).fill(0).map((item, index) => (
                  <NumberInputV2
                    key={index}
                    index={index}
                    type="password"
                    value={this.state.inputNumber[index]}
                    gridStyle=""
                    inputFocusClassName="inputText csFocusPop"
                    maxLength={1}
                    injectRef={this.injectRef}
                    onFull={this.onFullInputList}
                    onInputKeyDown={this.onInputKeyDown}
                    htmlFor={`numberFirst${index + 1}`}
                  />
                ))
              }
            </div>
            <p style={strDescStyle}>{strDesc}</p>
            <div id="buttonGroup" className="btnWrap">
              <span className="csFocusPop btnStyle type02" data-disabled={okBtnDisabled}>
                <span className="wrapBtnText">
                  ??????
                </span>
              </span>
              <span className="csFocusPop btnStyle type02">
                <span className="wrapBtnText">
                  ??????
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BuyBillOkCashBag;
