// commons
import React from 'react';
import Core from 'Supporters/core';
//import constants from 'Config/constants';
import keyCodes from 'Supporters/keyCodes';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';

// network
import { EPS } from 'Network';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/okcash/OkCashDelete.css';
import appConfig from 'Config/app-config';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE } } = keyCodes;

/*
const logBlue = (msg, ...args) => {
  console.log('%c' + msg, 'color: white; background: blue', ...args);
}
*/

class OkCashbagCardDelete extends PopupPageView {
  constructor(props) {
    super(props);

    const { sequence, cardNumber } = this.props.data;

    //console.log('%c data', 'color: red; background: yellow', this.props.data);

    this.state = {
      cardType: appConfig.headEnd.LOCAL_URL + '/myBtv/logo-okcashbag.png',
      sequence,
      cardNumber
    };

    //console.log('%c OkCashbagCardDelete paramData', 'color: green', this.paramData);

    this.fm = new FM({
      id: 'buttons',
      // moveSelector,
      // layoutSelector,
      containerSelector: '.buttonWrap',
      focusSelector: '.csFocus',
      row: 1,
      col: 2,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 1,
      onFocusChild: this.onFocusButtonChild,
      onFocusKeyDown: this.onFocusButtonKeyDown
    });

    this.declareFocusList([{ key: 'buttons', fm: this.fm }]);
  }

  onFocusButtonChild = (event, index) => {
    //console.log('onFocusButtonChild:', event, index);
  }

  onFocusButtonKeyDown = (event, index) => {
    //console.log('onFocusButtonKeyDown:', event, index);
    if (event.keyCode === ENTER) {
      if (index === 0) {
        this.deleteCard();
      } else {
        this.deleteCancel();
      }
    }
  }

  onKeyDown(evt) {
    super.onKeyDown(evt);

    if (evt.keyCode === PC_BACK_SPACE || evt.keyCode === BACK_SPACE) {
      this.props.callback();
      return true;
    }
  }

  deleteCancel = () => {
    //console.log('%c 취소 버튼', 'color: red; background: yellow', );
    this.props.callback();
  }

  deleteCard = () => {
    //console.log('%c OKCashbag card delete', 'color: green', 'card delete');
    let toastMsg = {
      success: 'OK캐쉬백 카드가 삭제되었습니다.',
      fail: 'OK캐쉬백 카드 삭제에 실패하였습니다.'
    };

    EPS.request580({ masterNo: this.state.sequence }).then(data => {
      //console.log('%c EPS-580', 'color: green', data);
      const { reason } = data;

      this.props.callback(data.result);

      // reason 필드 정상 동작시 '성공' 또는 'success' 로 수정 요망
      if (reason === 'OK') {
        Core.inst().showToast(toastMsg.success);
      } else {
        Core.inst().showToast(toastMsg.fail);
      }

      //setTimeout(() => { this.props.callback(data.result); }, 3000);
    }).catch(err => {
      Core.inst().showToast(toastMsg.fail);
      setTimeout(() => { this.props.callback(); }, 3000);
    });
  }

  componentDidMount() {
    // document.querySelector('.topMenu').style.display = 'none';
    super.componentDidMount();
    document.querySelector('.wrapper').classList.add('dark');
    this.setFm('buttons', this.fm);
    this.setFocus(0);
  }

  componentWillUnmount() {
    //logBlue('OkCahsbagCardDelete unmounting');
    super.componentWillUnmount();
    document.querySelector('.wrapper').classList.remove('dark');
  }

  render() {
    const { cardType, cardNumber/*, btnFocused*/ } = this.state;
    const numberBlock = cardNumber.map((item, idx, arr) => (
      <span className="numberBlock" key={idx}>{item}</span>
    ));

    return (
      <div className="wrap">
        <div className="registWrap okCashDelete">
          <h2 className="pageTitle">OK캐쉬백 카드 삭제</h2>
          <p className="subInfo">선택하신 OK캐쉬백 카드를 삭제하시겠습니까?</p>
          <div className="cardWrap">
            <div className="card">
              <span className="cardLogo">
                <img src={cardType} alt="OK캐시백 로고" />
              </span>
              <div className="cardInfo">
                <div className="cardNumber">
                  {numberBlock}
                  <span className="numberBlock">****</span>
                  <span className="numberBlock">****</span>
                </div>
              </div>
            </div>
          </div>
          <div className="buttonWrap" id="buttons">
            <span className="csFocus btnStyle">
              <span className="wrapBtnText">삭제</span>
            </span>
            <span className="csFocus btnStyle">
              <span className="wrapBtnText">취소</span>
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default OkCashbagCardDelete;