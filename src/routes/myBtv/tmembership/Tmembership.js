import React from 'react';

import appConfig from 'Config/app-config';
import { EPS } from 'Network';
import { Core } from 'Supporters';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import PopupPageView from 'Supporters/PopupPageView';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/tmembership/Tmembership.css';

// components
import TmembershipCard from './TmembershipCard';
import TmembersipEnrollment from './TmembershipEnrollment';
import TmembershipDelete from './TmembershipDelete';

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE } } = keyCodes;

const toSplit = (num) => {
  let no = num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, "|");
  return no.split('|');
}

class Tmembership extends PopupPageView {
  constructor(props) {
    super(props);

    this.state = {
      contentSlides: {}
    }

    this.defaultFM = {
      card: new FM({
        id: 'card',
        containerSelector: '.buttonWrap',
        focusSelector: '.csFocus',
        row: 1,
        col: 2,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 1,
        onFocusKeyDown: this.onCardBtnKeyDown,
      }),
      none: new FM({
        id: 'card',
        type: 'ELEMENT',
        focusSelector: '.csFocus',
        row: 1,
        col: 1,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        onFocusKeyDown: this.onNoneButtonKeyDown
      }),
    }

    this.declareFocusList([{ key: 'card', fm: null }]);
    this.loadDone = false;
  }

  registComplete = (a, b, c) => {
    console.log('%c 등록 또는 변경 팝업 콜백', 'color: red; background: yellow', a, b, c);
    // 다시 조회 (등록 된 카드 조회)
    this.cardInquiry();
  }

  deleteComplete = (a, b, c) => {
    console.log('%c 삭제 팝업 콜백', 'color: red; background: yellow', a, b, c);
    this.cardInquiry();
  }

  onCardBtnKeyDown = (evt, focusIdx) => {
    const { contentSlides } = this.state;
    if (evt.keyCode === ENTER) {
      if (focusIdx === 0) {         // 변경
        Core.inst().showPopup(
          <TmembersipEnrollment action="change" />,
          {},
          this.registComplete
        );
      } else if (focusIdx === 1) {  // 삭제
        Core.inst().showPopup(
          <TmembershipDelete />,
          { contentSlides },
          this.deleteComplete
        );
      }
    }
  }

  onNoneButtonKeyDown = (evt, focusIdx) => {
    const { keyCode } = evt;
    if (keyCode !== ENTER) return;
    console.log('%c 카드등록 버튼', 'color: red; background: yellow', );
    Core.inst().showPopup(
      <TmembersipEnrollment action="regist" />,
      {},
      this.registComplete
    );
  }

  onKeyDown(evt) {
    this.handleKeyEvent(evt);
    if (evt.keyCode === BACK_SPACE || evt.keyCode === PC_BACK_SPACE) {
      this.props.callback();
      return true;
    }
  }

  initFocus = (isCard) => {
    console.log('%c initFocus isCard', 'color: green', isCard);
    const { card, none } = this.defaultFM;
    this.setFm('card', isCard ? card : none);
    this.setFocus(0);
  }

  cardInquiry = () => {
    EPS.request501()
      .then(data => {
        console.log('%c T멤버십 조회', 'color: green', data);
        this.loadDone = true;

        if (data.tmembership) {
          let { tmembership } = data;
          let contentSlides = {
            cardType: appConfig.headEnd.LOCAL_URL + '/myBtv/card-tmem.png',
            cardLogo: appConfig.headEnd.LOCAL_URL + '/myBtv/logo-box.png',
            point: tmembership.balance,
            cardNumber: toSplit(tmembership.cardNo)
          }

          this.setState({ contentSlides });
          this.initFocus(true);
        } else {
          this.setState({ contentSlides: [] });
          this.initFocus(false);
        }

        switch (data.result) {
          case '0000':
            break;
          case '4505':
            break;
          default: break;
        }
      });
  }

  componentDidMount() {
    this.cardInquiry();
  }

  render() {
    const { contentSlides } = this.state;

    return (
      <div className="wrap">
        <div className="myBtvLayout">
          <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="배경 이미지" /></div>
          <div className="Tmembership">
            <h2 className="pageTitle">T 멤버십 카드관리</h2>
            <p className="subInfo">T 멤버십 카드를 이용하여 프리미어 월정액 할인 등 다양한 혜택을 경험해 보세요.</p>
            {this.loadDone &&
            <TmembershipCard cardInfo={contentSlides} />
            }
            <div className="bottomWrap">
              <div className="defaultWrap">
                <p className="infoText">콘텐츠 구매 시 20% 할인 및 월정액 구매 시 첫 달 50% 할인이 적용됩니다.<br />
                  (교육장르, 성인장르, 부가서비스 상품 및 일부 제휴 월정액 상품은 제외)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Tmembership;
