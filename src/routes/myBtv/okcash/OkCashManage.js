// external modules
import React from 'react';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import pull from 'lodash/pull';
import isNil from 'lodash/isNil';

import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import Core from 'Supporters/core';
import keyCodes from 'Supporters/keyCodes';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/okcash/OkCashManage.css';

// network
import { EPS } from 'Network';

// components
import CardItem from './CardItem';
import BuyBillOkCashBag from '../../../popup/BuyBillOkCashBag';
import OkCashRegist from './OkCashRegist';
import OkCashbagCardDelete from './OkCashbagCardDelete';
import appConfig from 'Config/app-config';

const DEBUG = false;

const { Keymap: { ENTER, PC_BACK_SPACE, BACK_SPACE } } = keyCodes;

const merge = Object.assign;
const OK = '0000';

const log = DEBUG ? (msg, ...args) => {
  console.log('[OkCashManage] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c [OkCashManage] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

const splitBy4Digit = (num) => {
  let no = num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, '|');
  return no.split('|');
}

/*
const logBlue = (msg, ...args) => {
  console.log('%c' + msg, 'color: white; background: blue', ...args);
}
*/

let focusOpts = {
  cardList: {
    id: 'cardList',
    moveSelector: '.cardItemWrapper',
    focusSelector: '.csFocus',
    row: 1,
    col: 3,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 2,
  },
  cardBtn: {
    id: 'cardBtn',
    containerSelector: '.buttonWrap',
    focusSelector: '.csFocus',
    row: 1,
    col: 2,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  },
}

class OkCashManage extends PopupPageView {
  constructor(props) {
    const focusList = [
      { key: 'cardList', fm: null },
      { key: 'cardBtn', fm: null },
    ];

    super(props);

    //console.log('OkCashManage props:', this.props);
    //console.log('historyData:', this.historyData);
    //console.log('paramData:', this.paramData);
    this.state = isEmpty(this.historyData) ? {
      pageTitle: 'OK????????? ????????????',
      cardItems: [],
      currentFocus: 0,
    } : this.historyData;

    this.cardList = [];       // CardItem??? refs ??????
    this.declareFocusList(focusList);
  }

  onKeyDown(evt) {
    super.onKeyDown(evt);

    if (evt.keyCode === BACK_SPACE || evt.keyCode === PC_BACK_SPACE) {
      this.props.callback();
      return true;
    }
  }

  innerRefs = (ref, name) => {
    this.cardList[name] = ref;
  }

  onCardFocusOn = (focusIdx) => {
    if (this.state.cardItems[focusIdx].isRegisterItem) {
      this.setFm('cardBtn', null);
    } else {
      this.setFm('cardBtn', this.defaultFM.cardBtn);
    }

    this.setState({ currentFocus: focusIdx })
  }

  onCardKeyDown = (evt, idx) => {
    const { hasPoint, isRegisterItem } = this.state.cardItems[idx];

    if (evt.keyCode === ENTER) {
      if (!isRegisterItem && !hasPoint) {
        this.usablePointInquiry(idx);
      } else if (isRegisterItem) {  // ?????? ?????? ?????? ??? ??????
        Core.inst().showPopup(<OkCashRegist />, { className: 'OkCashRegist', sequence: this.findEmptySequence() }, result => {
          if (result === OK) this.setCardList(true);
        });
      }
    }
  }

  onButtonKeyDown = (evt, idx) => {
    const currentItem = this.state.cardItems[this.state.currentFocus];

    if (evt.keyCode === ENTER) {
      if (idx === 0) {    // ??? ???????????? ??????
        this.setMaster(currentItem);
        this.getFm('cardBtn').removeFocus();
      } else {            // ??????
        this.deleteCard(currentItem);
      }
    }
  }

  deleteCard = (cardItem) => {
    const callback = (result) => {
      //console.log('%c ?????? ?????? ??????', 'color: red; background: yellow', result);
      this.setCardList(result === OK);
    }

    this.getFm('cardBtn').removeFocus();
    Core.inst().showPopup(<OkCashbagCardDelete />, cardItem, callback);
  }

  usablePointInquiry = (idx) => {
    //console.log('%c usablePointInquiry', 'color: red; background: yellow', );
    const { cardItems } = this.state;
    let point;

    if (cardItems[idx].hasPoint) return;

    /*
    * ???????????? ?????? (???????????? ?????? ??? ??????)
    * @param <String> password
    * @return undefined
    */
    let inquiry = (password, callbacks) => {
      //console.log('%c inquiry password', 'color: green', password);
      EPS.request552({
        transactionId: 'Inquiry_of_Ok_cashbag_info',
        sequence: cardItems[idx].sequence,
        password
      }).then(data => {
        //console.log('%c EPS-552', 'color: green', data);
        if (data.result === '0000') {
          point = data.ocb.balance;
          callbacks.close();
        } else {
          callbacks.showErrorMessage('??????????????? ???????????? ????????????. ?????? ????????? ?????????.');
        }
      })
    };

    let updatePoint = (obj) => {
      //console.log('%c updatePoint', 'color: green', obj);

      if (obj && obj.btnSelect === 1) return;
      this.setState({
        cardItems: cardItems.map((info, infoIdx) => {
          if (infoIdx === idx) {
            return Object.assign({}, info, { point, hasPoint: true });
          } else {
            return info;
          }
        })
      })
    };

    let subTitle = cardItems[idx].isMaster ? '??? ????????????' : '';
    let popupState = {
      className: 'BuyBillOkCashBag',
      type: 'OkCashBag',
      title: 'OK????????? ????????????',
      subTitle,
      cardNum: cardItems[idx].cardNumber,
      strDesc: 'OK????????? ??????????????? ??????????????????.',
      checkFailMessage: '??????????????? ???????????? ????????????. ?????? ????????? ?????????.',
      btns: ['??????', '??????'],
      inquiry
    }

    Core.inst().showPopup(<BuyBillOkCashBag />, popupState, updatePoint);
  }

  setMaster = (cardItem) => {
    EPS.request570({ transactionId: 'set_mainly_card', masterNo: cardItem.sequence, isMaster: true }).then(data => {
      //console.log('%c PNS-570 data', 'color: green', data);
      this.setCardList()
    });
  }

  findEmptySequence = () => {
    const seqs = [1, 2, 3];

    this.state.cardItems.forEach(item => {
      pull(seqs, item.sequence);
    });

    return seqs[0];
  }

  /*
  getMasterSequence = () => {
    const masterCard = find(this.state.cardItems, 'isMaster');

    return masterCard && masterCard.sequence;
  }
  */

  getPoint = sequence => {
    const card = find(this.state.cardItems, { sequence });

    return card && card.point;
  }

  setCardList = (willFocusReset) => {
    EPS.request551({ transactionId: 'OK_Cashback_card_list' }).then(data => {
      // NOTE: ?????? ?????? ?????? ??????.
      //console.log('%c PNS-551 data', 'color: green', data);
      const cardList = data.ocbList.ocb;
      const isCardList = !isEmpty(cardList);
      const cardItems = isCardList ? cardList.map((item/*, index*/) => {
        const point = this.getPoint(item.sequence);

        return {
          isRegisterItem: false,
          isMaster: item.sequence === data.ocbMasterSequence,
          point,
          hasPoint: !isNil(point),
          cardNumber: splitBy4Digit(item.cardNo),
          sequence: item.sequence
        };
      }) : [];

      if (cardItems.length < 3) {
        cardItems.push({ isRegisterItem: true });
      }

      //console.log('cardItems:', cardItems);

      this.setState({ cardItems }, () => {
        this.setDefaultFM(willFocusReset);
      });
    })
  }

  setDefaultFM = (willFocusReset) => {
    this.defaultFM = {
      cardList: new FM(merge(focusOpts.cardList, {
        col: this.state.cardItems.length,
        curIdx: 0,
        firstIdx: 0,
        lastIdx: this.state.cardItems.length - 1,
        onFocusChild: this.onCardFocusOn,
        onFocusKeyDown: this.onCardKeyDown
      })),
      cardBtn: new FM(merge(focusOpts.cardBtn, {
        onFocusKeyDown: this.onButtonKeyDown
      })),
    }

    this.setFm('cardList', this.defaultFM.cardList);

    if (this.state.cardItems.length === 1) {    // ?????? ????????? ?????? ???(????????? ????????? ?????? ??????)
      this.setFm('cardBtn', null);
    } else {
      this.setFm('cardBtn', this.defaultFM.cardBtn);
    }

    log('currentFocus:', this.state.currentFocus);
    this.setFocus(0, willFocusReset ? 0 : this.state.currentFocus);
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    blue('[componentWillUnmount]');
  }

  componentDidMount() {
    super.componentDidMount();
    this.setCardList();
  }

  render() {
    const { pageTitle, cardItems, currentFocus } = this.state;

    return (
      <div className="wrap">
        <div className="myBtvLayout">
          <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
          <div className="okCashManage">
            <h2 className="pageTitle">{pageTitle}</h2>
            <div className="cardWrap" id="cardList">
              {!isEmpty(cardItems) && cardItems.map((data, i) => (
                <CardItem key={i}
                  data={data}
                  isSelected={currentFocus === i}
                  innerRefs={this.innerRefs}
                  index={i}
                />
              ))}
            </div>
			{/* ???????????? ?????? ?????? */}
            <div className="bottomWrap">
              <div className="defaultWrap">
                <p className="infoText">OK????????? ????????? ?????? 3????????? ????????? ???????????????.<br/>
                  ??? ??????????????? ????????? ?????? ??? ?????? ????????? ?????? ??????????????? ????????? ???????????? ???????????????.<br/>
                  (?????? ?????? ??? ????????? ??? ?????? ????????? ??????)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OkCashManage;