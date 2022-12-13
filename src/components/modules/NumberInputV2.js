import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isUndefined from 'lodash/isUndefined';
import isFunction from 'lodash/isFunction';

import keyCodes from 'Supporters/keyCodes';
import appConfig from 'Config/app-config';

const DEBUG = false;
const { Keymap } = keyCodes;

const log = DEBUG ? (msg, ...args) => {
  console.log('[NumberInputV2] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  // console.log('%c [NumberInputV2] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class NumberInputV2 extends Component {
  constructor(props) {
    super(props);

    this.ime = appConfig.runDevice ? window.tvExt.utils.ime : {
      setKeyboardMode: () => {},
      setEnableSoftKeyboard: () => {},
      setSearchMode: () => {},
      sendKeyEvent: () => {}
    };

    this.preventKey = false;
  }

  setHandler = () => {
    this.ime.onSearchMode = (mode) => {
      log('onSearchMode:', mode);

      if (mode) {
        this.ime.setKeyboardMode(this.ime.KEYBOARD_MODE_NUMBER);
      }
    };

    this.ime.onChunjiinMode = (event) => {};

    this.ime.onOKEvent = (event) => {
      //log('onOKEvent:', event);
    };

    this.ime.onKeyboardMode = (mode) => {
      //log('onKeyboardMode:', mode);   //IME 키보드 모드 (0 : 한글, 1 : 영대, 2 : 영소, 3 : 숫자, 4 : 특1, 5 : 특2)
      this.keyboardMode = mode;
      //log('[onKeyboardMode] this.keyboardMode:', this.keyboardMode, this.rand);   //IME 키보드 모드 (0 : 한글, 1 : 영대, 2 : 영소, 3 : 숫자, 4 : 특1, 5 : 특2)
    };
  }

  onFocus = () => {
    blue('onFocus():', this.props.index, this.input.value);

    this.input.selectionStart = this.input.value.length;
    this.setHandler();
    this.ime.setEnableSoftKeyboard(false);
    this.ime.setSearchMode(true);
  }

  onBlur = () => {
    blue('onBlur():', this.props.index);

    this.ime.setEnableSoftKeyboard(true);
    this.ime.setSearchMode(false);
  }

  isKeyOK = (keyCode) => {
    return keyCode === Keymap.ENTER;
  }

  isKeyNumber = (keyCode) => {
    switch (keyCode) {
      case Keymap.N0:
      case Keymap.N1:
      case Keymap.N2:
      case Keymap.N3:
      case Keymap.N4:
      case Keymap.N5:
      case Keymap.N6:
      case Keymap.N7:
      case Keymap.N8:
      case Keymap.N9:
        return true;
      default:
        return false;
    }
  }

  processKeyOK = () => {
    return true;
  }

  processKeyArrow = (keyCode) => {
    return false;
  }

  processKeyNumber = (keyCode) => {
    //log('processKeyNumber()] this.keyboardMode:', this.keyboardMode, this.rand);
    //log('[processKeyNumber()] isNotNumberMode:', this.keyboardMode !== this.ime.KEYBOARD_MODE_NUMBER);
    //log('[onKeyboardMode] this.keyboardMode:', this.keyboardMode, this);   //IME 키보드 모드 (0 : 한글, 1 : 영대, 2 : 영소, 3 : 숫자, 4 : 특1, 5 : 특2)
    //log('[processKeyNumber()] ime.NUMBER_MODE:', this.ime.KEYBOARD_MODE_NUMBER);
    return this.keyboardMode !== this.ime.KEYBOARD_MODE_NUMBER;
  }

  isKeyArrow = (keyCode) => {
    switch (keyCode) {
      case Keymap.LEFT:
      case Keymap.RIGHT:
      case Keymap.UP:
      case Keymap.DOWN:
        return true;
      default:
        return false;
    }
  }

  //keyUp = (event) => {}

  keyDown = (event) => {
    log('KeyDown(): ' + event.keyCode);

    this.preventKey = false;

    if (this.isKeyOK(event.keyCode)) {
      this.processKeyOK();
      this.preventKey = true;
      event.preventDefault();
    } else if (this.isKeyArrow(event.keyCode)) {
      if (this.processKeyArrow(event.keyCode)) {
        this.preventKey = true;
        event.preventDefault();
      }
    } else if (this.isKeyNumber(event.keyCode) && !event.shiftKey) {
      if (this.processKeyNumber(event.keyCode)) {
        this.preventKey = true;
        event.preventDefault();
      }
    } else if (event.shiftKey && event.keyCode === Keymap.N3) {
      this.ime.setKeyboardMode(this.ime.KEYBOARD_MODE_NUMBER);

      this.preventKey = true;
      event.preventDefault();
    } else if (event.shiftKey && event.keyCode === Keymap.N8) {
      this.ime.sendKeyEvent(this.ime.IME_KEYCODE_DEL);

      this.preventKey = true;
      event.preventDefault();
    }
  }

  keyPress = (event) => {
    log("keyPress(): " + event.keyCode);

    if (this.preventKey) {
      event.preventDefault();
    }
  }

  keyUp = (event) => {
    log("keyUp(): " + event.keyCode);

    if (this.preventKey) {
      event.preventDefault();
    }
  }

  onChange = (event) => {
    log('onChange():', event, this.input.value);

    //log('this.input:', this.input.value);
    this.props.onInputKeyDown(event, this.input.value);

    if ((this.input.value.length === parseInt(this.props.maxLength, 10)) && isFunction(this.props.onFull)) {
      log('Invoke onFull()');
      this.props.onFull(this.props.index);
    }
  }

  //keyInput = (event) => {}

  clear = () => {
    this.input.value = '';
  }

  render() {
    const { injectRef, type, maxLength, placeholder, gridStyle, id, htmlFor, value } = this.props;
    const etcProps = { maxLength, placeholder, id, value };
    const gridStyleClass = isUndefined(gridStyle) ? 'card' : gridStyle;

    const index = isUndefined(this.props.index) ? this.props.id : this.props.index;

    return (
      <span className={`gridStyle ${gridStyleClass}`}>
        <input type={type}
          {...etcProps}
          onKeyUp={this.keyUp}
          onKeyDown={this.keyDown}
          onKeyPress={this.keyPress}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          className={this.props.inputFocusClassName}
          ref={r => { if (injectRef) injectRef(r, index); this.input = r; }}
        />
        <label htmlFor={htmlFor} />
      </span>
    )
  }

  // 이벤트 발생 순서 테스트
  // 테스트 결과: down -> press -> input -> change -> up
}

NumberInputV2.defaultProps = {
  type: null,
  maxLength: '4',
  placeholder: null,
  gridStyle: 'card',
  inputFocusClassName: 'inputText csFocusInput',
  id: null,
  htmlFor: 'label'
};

NumberInputV2.propTypes = {
  id: PropTypes.string,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  type: PropTypes.string,
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.string,
  placeholder: PropTypes.string,
  gridStyle: PropTypes.string,
  inputFocusClassName: PropTypes.string,
  htmlFor: PropTypes.string,
  //focusMove: PropTypes.func,
  injectRef: PropTypes.func,
  onInputKeyDown: PropTypes.func,
  onFull: PropTypes.func
};

export default NumberInputV2;