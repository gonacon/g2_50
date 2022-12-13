import React from 'react';

import appConfig from 'Config/app-config';
import { EPS } from 'Network';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import PopupPageView from 'Supporters/PopupPageView';

import TmembershipCard from './TmembershipCard';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/tmembership/TmembershipDelete.css';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE } } = keyCodes;
const BACK = appConfig.runDevice ? BACK_SPACE : PC_BACK_SPACE;

let focusOpts = {
  button: {
    id: 'focus1',
    containerSelector: '.buttonWrap',
    focusSelector: '.csFocus',
    row: 1,
    col: 2,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  }
}

const merge = Object.assign;

class TmembershipDelete extends PopupPageView {
  constructor(props) {
    console.log('%c DELETE props', 'color: red; background: yellow', props);
    super(props);
    this.state = {
      cardItem: props.data.contentSlides,
    }

    this.defaultFM = {
      button: new FM(merge(focusOpts.button, {
        onFocusKeyDown: this.onButtonKeyDown,
      }))
    }

    const focusList = [
      { key: 'button', fm: null },
    ];
    this.declareFocusList(focusList);

  }

  onButtonKeyDown = (evt, focusIdx) => {
    console.log('%c onButtonKeyDown', 'color: green', evt, focusIdx);
    if (evt.keyCode === ENTER) {
      if (focusIdx === 0) {			// 삭제
        this.deleteCard();
      } else if (focusIdx === 1) {	// 취소
        this.props.callback();
        return true;
      }
    }
  }

  deleteCard = () => {
    // T멤버쉽 카드 해제 요청
    EPS.request530({ transactionId: 'tmembership_card_delete_request' })
      .then(data => {
        console.log('%c card delete complete', 'color: red; background: yellow;', data);
        if (data.result === '0000') {		// 성공
          this.props.callback();
        }
      });
  }

  onKeyDown(event) {
    super.onKeyDown(event);

    if (event.keyCode === BACK) {
      this.props.callback();
      return true;      // 이전 PageView의 back을 막음
    }
  }

  componentDidMount() {
    document.querySelector('.wrapper').classList.add('dark');
    this.setFm('button', this.defaultFM.button);
    this.setFocus(0);
  }
  componentWillUnmount() {
    document.querySelector('.wrapper').classList.remove('dark');
    super.componentWillUnmount();
  }

  render() {
    return (
      <div className="wrap" id="focus1">
        <div className="TmembershipDelete">
          <div className="registWrap">
            <h2 className="pageTitle">T 멤버십 할인카드 삭제</h2>
            <p className="subInfo">선택하신 T 멤버십 할인카드를 삭제하시겠습니까?</p>
            <TmembershipCard cardInfo={this.state.cardItem} type="delete"/>
          </div>
        </div>
      </div>
    )
  }

}

export default TmembershipDelete;