// commons
import React, { Component } from 'react';

// utils
import PropTypes from 'prop-types';


class NumberInput extends Component {

  static defaultProps = {
    type: null,
    maxLength: "4",
    placeholder: null,
    gridStyle: 'card',
    id: null,
  }

  static propTypes = {
    type: PropTypes.string,
    maxLength: PropTypes.number,
    placeholder: PropTypes.string,
    gridStyle: PropTypes.string,
    id: PropTypes.string,
    focusMove: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      selectionStart: null
    };
  }

  static defaultProps = {
    maxLength: 4
  };

  keyUp = (event) => {
    const evts = this.props.event;
    let evt = evts ? this.props.event : event;
    if (evt.key === 'a' && this.input.selectionStart !== 0) {
      this.input.selectionStart = this.state.selectionStart - 1;
      this.input.selectionEnd = this.state.selectionStart - 1;
    }
  }

  keyDown = (event) => {
    const evt = this.props.event;
    const { value } = this.state;
    const selectionStart = this.input.selectionStart - 1;
    let newValue = value.slice(0);
    // console.log('%c KEY DOWN', 'color: red; background: yellow', evt);
    // if ( evt.key === 'a' && this.input.selectionStart !== 0 ) {
    //     let newValue1 = newValue.split('');
    //     newValue1.splice(selectionStart, 1)
    //     this.setState({
    //         value: newValue1.join(''),
    //         selectionStart: this.input.selectionStart
    //     }, () => {
    //     });
    // }
  }

  keyInput = (event) => {
    let evts = this.props.event;
    let evt = evts ? this.props.event : event;
    // evt.preventDefault();
    const { onInputKeyDown, maxLength } = this.props;
    const { value } = this.state;
    const selectionStart = this.input.selectionStart - 1;
    let newValue = value.split('');
    if (value.length < Number(maxLength) && (evt.keyCode >= 48 && evt.keyCode <= 57)) {
      newValue.splice(selectionStart, 0, String.fromCharCode(evt.keyCode));
      this.setState({
        value: newValue.join('')
      }, (a, b) => {
        onInputKeyDown(evt, this.state.value);
        // 다음 input으로 자동 이동
        const { focusMove, index } = this.props;
        if (newValue.join('').length >= Number(maxLength) && focusMove) focusMove(index);
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.restoreInput) {
      this.setState({ value: '' }, () => {
        this.props.restoreInputStateToggle();
      });
    }
  }

  render() {
    const { injectRef, index, type, maxLength, placeholder, gridStyle, id } = this.props;
    const { value } = this.state;
    const etcProps = { maxLength, placeholder, id };
    const gridStyleClass = gridStyle ? gridStyle : 'card';

    return (
      <span className={`gridStyle ${gridStyleClass}`}>
        <input type={type}
          {...etcProps}
          className="inputText csFocusInput"
          onChange={this.keyInput}
          onKeyDown={this.keyDown}
          onKeyPress={this.keyPress}
          onKeyUp={this.keyUp}
          value={value}
          ref={r => { injectRef(r, index); this.input = r; }}
        />
        <label htmlFor="label" />
      </span>
    )
  }

  // 이벤트 발생 순서 테스트
  // 테스트 결과: down -> press -> input -> change -> up
  // keyDown = evt => {
  //     console.log('%c keyDown', 'color: red; background: yellow', );
  // }
  // keyUp = evt => {
  //     console.log('%c keyUp', 'color: red; background: yellow', );
  // }
  // keyPress = evt => {
  //     console.log('%c keyPress', 'color: red; background: yellow', );
  // }
  // inputFn = evt => {
  //     console.log('%c onInpur', 'color: red; background: yellow', );
  // }
  // changeFn = evt => {
  //     console.log('%c onChange', 'color: red; background: yellow', );
  // }

  // render() {
  //     return (
  //         <input type="text"
  //                 onKeyDown={this.keyDown}
  //                 onKeyUp={this.keyUp}
  //                 onKeyPress={this.keyPress}
  //                 onInput={this.inputFn}
  //                 onChange={this.changeFn} />
  //     )
  // }
}

export default NumberInput;