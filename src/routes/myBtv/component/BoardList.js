import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import moment from 'moment';

import keyCodes from 'Supporters/keyCodes';
import constants from 'Config/constants';
import { Core } from 'Supporters';
import { CALL_URL } from 'Config/constants';
import { createMarkup } from 'Util/common';
import StbInterface from 'Supporters/stbInterface';
import { PNS } from 'Supporters/network';

import 'Css/myBtv/notice/NoticeList.css';

const ITEM_HEIGHT = 85;
const ITEM_MARGIN = 0;
//const ITEM_COUNT_PER_SCREEN = 8;
const NEW_PERIOD_BY_DAY = 3;

const { MYBTV_NOTICE_DETAIL, MYBTV_USE_GUIDE_DETAIL } = constants;
const { Keymap: { UP, DOWN, ENTER } } = keyCodes;

const useGuideHeaders = [
  '음성검색을 실행해 <strong>‘이용 가이드’</strong>라고 말씀하시면 빠르게 접근할 수 있습니다.',
  '이용 가이드에서 원하는 내용을 찾지 못하셨다면, 고객센터(국번 없이 106)로 문의해 주세요!'
];

const noItemMessages = {
  [CALL_URL.NOTICE]: '등록된 공지사항이 없습니다.',
  [CALL_URL.EVENT]: '진행중인 이벤트가 없습니다.',
  [CALL_URL.USE_GUIDE]: '등록된 이용가이드가 없습니다.'
};

class BoardList extends React.PureComponent {
  static propTypes = {
    listData: PropTypes.array,
    focusIndex: PropTypes.number,
    loadingDone: PropTypes.bool
  }

  static ITEM_COUNT_PER_SCREEN = 8;

  constructor(props) {
    super(props);

    this.currentFocusIndex = this.props.focusIndex || 0;
    //console.log('currentFocusIndex:', this.currentFocusIndex, this.props);

    this.state = {
      slideTo: 0,
      slideToPage: 0,
    }
  }

  componentDidMount() {
    this.listArea = document.querySelector('.listArea');
  }

  onFocusItem = index => {
    this.currentFocusIndex = index;
  }

  onFocus = () => {
    this.listArea.classList.add('activeSlide');
    //this.setState({ slideTo: 0, slideToPage: 0 });      // 진입 시 첫번째 item에 focus
    //this.setArrow();
  }

  onBlur = () => {
    //this.setState({ slideTo: 0, slideToPage: 0 });      // 이탈 시 첫번째 item에 focus
    this.listArea.classList.remove('activeSlide');
  }

  onNaviKeyDown = (index) => {
    let slideTo = Math.floor(index / BoardList.ITEM_COUNT_PER_SCREEN) * BoardList.ITEM_COUNT_PER_SCREEN;
    let slideToPage = slideTo / BoardList.ITEM_COUNT_PER_SCREEN;

    //console.log('slideTo:', slideTo, 'slideToPage:', slideToPage);
    if (slideTo > this.props.listData.length - 1 || slideTo < 0) {
      return;
    }

    this.setState({ slideTo, slideToPage });
    //this.setArrow();
  }

  onEnterKeyDown = (index) => {
    const id = this.props.listData[index].id;

    if (this.isUseGuide()) {
      Core.inst().move(MYBTV_USE_GUIDE_DETAIL, { detail: this.props.listData[index], callUrl: this.props.callUrl });
    } else if (this.isNotice()) {
      //Core.inst().move(MYBTV_NOTICE_DETAIL, { id: this.props.listData[index].id, callUrl: this.props.callUrl });
      Core.inst().move(MYBTV_NOTICE_DETAIL, { id, callUrl: this.props.callUrl });
    } else if (this.isEvent()) {
      this.openEventDetail(id);
    } else {
      console.warn('알 수 없는 call_url:', this.props.callUrl);
    }
  }

  onKeyDown = (event, index) => {
    //console.log('onKeyDown in BoardList:', event, index);
    switch (event.keyCode) {
      case UP:
        this.onNaviKeyDown(--index);
        break;
      case DOWN:
        this.onNaviKeyDown(++index);
        break;
      case ENTER:
        this.onEnterKeyDown(index);
        break;
      default:
        //console.log('Not supported:', event);
        break;
    }
  }

  setArrows = (arrows) => {
    if (arrows.up) {
      this.listArea.classList.add('leftActive');
    } else {
      this.listArea.classList.remove('leftActive');
    }

    if (arrows.down) {
      this.listArea.classList.add('rightActive');
    } else {
      this.listArea.classList.remove('rightActive');
    }
  }

  getCurrentFocusIndex = () => {
    return this.currentFocusIndex;
  }

  openEventDetail = async (id) => {
    // TODO: 예외 처리
    const response = await PNS.request504(id);
    const url = get(response, 'event_info.link_info.call_url');

    //console.log('PNS504:', response, url);
    if (response.result === '0000') {
      //console.log('event link:', url);
      StbInterface.openPopup('url', url);
    } else {
      Core.inst().showToast(response.reason || ('오류 코드: ' + response.result));
    }

    return response;
  }

  isUseGuide = () => {
    return this.props.callUrl === CALL_URL.USE_GUIDE;
  }

  isEvent = () => {
    return this.props.callUrl === CALL_URL.EVENT;
  }

  isNotice = () => {
    return this.props.callUrl === CALL_URL.NOTICE;
  }

  hasItem = () => {
    return !isEmpty(this.props.listData);
  }

  isNew = date => {
    let isNew = false;
    
    if (date) {
      const now = moment();
      const dateMoment = moment(date, 'YYYY.MM.DD');
      if (now.diff(dateMoment, 'days') <= NEW_PERIOD_BY_DAY) {
        isNew = true;
      }

      //console.log('diff:', now.diff(dateMoment, 'days'), isNew, NEW_PERIOD_BY_DAY);
    }

    return isNew;
  }

  renderItem = (data, index) => {
    const bellCN = 'title' + (data.bell ? ' bell' : '');
    const isNew = !this.isUseGuide() && this.isNew(data.date);
    //console.log('renderItem():', index, this.state.slideTo, this.state.slideToPage);
    //console.log('renderItem():', index, data, isNew);

    return (
      <li className={isNew ? 'new' : ''} key={index}>
        <div className="csFocus">
          <span className="listItemWrap">
            <span className={bellCN}>
              <span className="txt">{data.title}</span>
              {
                isNew && <span className="new">N</span>
              }
            </span>
          </span>
        </div>
      </li>
    );
  }

  renderHasItem = () => {
    const listStyle = {
      //'--page': this.state.slideTo / 8,
      '--page': this.state.slideToPage,
      'height': (ITEM_HEIGHT + ITEM_MARGIN) * (this.props.listData && this.props.listData.length ? this.props.listData.length : 0)
    };

    //console.log('this.props.listData:', this.props.listData);
    return (
      <div className="listScrollWrap">
        <ul className="textList" style={listStyle} id="boardList">
          {this.props.listData && this.props.listData.map && this.props.listData.map(this.renderItem)}
        </ul>
        <div className="topArrow"></div>
        <div className="bottomArrow"></div>
      </div>
    );
  }

  renderNoItem = () => {
    return (
      <span className="noticeNone">{noItemMessages[this.props.callUrl]}</span>
    );
  }

  renderItems = () => {
    return (!this.hasItem() && this.props.loadingDone) ? this.renderNoItem() : this.renderHasItem();
  }

  renderUseGuideHeader = () => {
    return (
      <ul className="useGuideInfo">
        {
          useGuideHeaders.map((data, i) => {
            return (
              <li dangerouslySetInnerHTML={createMarkup(data)} key={i}></li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const listClassName = 'listArea' + (!this.hasItem() ? ' none' : '');
    //console.log('render() BoardList:', this.state.slideTo, this.state.slideToPage, this.props);

    return (
      <div className={listClassName}>
        {this.isUseGuide() && this.renderUseGuideHeader()}
        {this.renderItems()}
      </div>
    );
  }
}

export default BoardList;