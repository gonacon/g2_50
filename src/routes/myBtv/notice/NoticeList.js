import React from 'react';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import compact from 'lodash/compact';
import includes from 'lodash/includes';
import get from 'lodash/get';
import invoke from 'lodash/invoke';
import some from 'lodash/some';
import find from 'lodash/find';
//import cloneDeep from 'lodash/cloneDeep';

import FM from 'Supporters/navi';
import { NXPG, PNS } from 'Supporters/network';
import PageView from 'Supporters/PageView';
import keyCodes from 'Supporters/keyCodes';
import { CALL_URL } from 'Config/constants';
import appConfig from 'Config/app-config';
import { getCodeGroup } from 'Util/code';

import 'Css/myBtv/notice/NoticeList.css';

import BoardList from '../component/BoardList';
import BoardTab from '../component/BoardTab';

const DEBUG = false;
const NEW_PERIOD_BY_DAY = 3;
const { Keymap: { UP, DOWN, ENTER } } = keyCodes;

const pnsMap = {
  [CALL_URL.NOTICE]: {
    func: PNS.request501,
    parentField: 'customer_notices',
    field: 'date'
  },
  [CALL_URL.EVENT]: {
    func: PNS.request503,
    parentField: 'events',
    field: 'date'
  }
};

const ifMap = {
  'IF-PNS-501': {
    ...pnsMap[CALL_URL.NOTICE],
    callUrl: CALL_URL.NOTICE
  },
  'IF-PNS-503': {
    ...pnsMap[CALL_URL.EVENT],
    callUrl: CALL_URL.EVENT
  }
};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c [NoticeList] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class NoticeList extends PageView {
  constructor(props) {
    super(props);

    /*
    console.log('NoticeList this.props:', this.props);
    console.log('NoticeList this.historyData:', this.historyData, typeof this.historyData);
    console.log('NoticeList props:', props);
    console.log('NoticeList props.history.location.state:', props.history.location.state);
    console.log('NoticeList this.paramData:', this.paramData);
    console.log('NoticeList this.state:', this.state);
    */

    // 공지사항/이벤트
    this.state = {
      listData: this.historyData.listData || [],                // TODO: immutable이어야 하나?
      pagedListData: this.historyData.pagedListData || {},      // TODO: immutable이어야 하나?
      tabData: this.historyData.tabData || [],                  // TODO: immutable이어야 하나?
      listPage: this.historyData.listPage || 0,
      listFocusIndex: this.historyData.listFocusIndex || 0,
      tabFocusIndex: this.historyData.tabFocusIndex || 0,
      callUrl: this.historyData.callUrl || (this.props.location.state ? this.props.location.state.callUrl : ''),
      menuId: this.historyData.menuId || (this.props.location.state ? this.props.location.state.menuId : ''),
      loadingDone: false
    };

    // NOTE: 전반적으로 logic을 좀더 효율적으로 만들 필요가 있음.
    const focusList = [
      { key: 'boardTab', fm: null, link: { RIGHT: 'boardList', UP: null, DOWN: null } },
      { key: 'boardList', fm: null, link: { LEFT: 'boardTab', UP: null, DOWN: null } }
    ];

    this.declareFocusList(focusList);
  }

  //componentWillMount() {}

  componentDidMount = () => {
    this.props.showMenu(false);

    if (isEmpty(this.historyData)) {      // 일반적인 진입
      this.loadTab();
    } else {                            // back으로 진입
      this.setBoardTabFM(this.state.tabData);
      //this.setBoardListFM(this.state.listData);
      this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
      this.boardTab.drawActiveItemClass(this.state.tabFocusIndex);
      this.setFocus('boardList');
    }
  }

  setBoardTabFM = (tabData) => {
    if (!isEmpty(tabData)) {
      this.setFm('boardTab', new FM({
        id: 'boardTab',
        containerSelector: '.tabStyle2',
        focusSelector: '.csFocus',
        row: tabData.length || 0,
        col: 1,
        focusIdx: this.state.tabFocusIndex || 0,
        startIdx: 0,
        lastIdx: tabData.length - 1,
        onFocusChild: this.onFocusTabItem,
        onFocusContainer: this.onFocusTab,
        onBlurContainer: this.onBlurTab,
        onFocusKeyDown: this.onFocusTabKeyDown
      }));
    }
  }

  setBoardListFM = (listData) => {
    if (isEmpty(listData)) {
      this.setLink('boardTab', { RIGHT: '', UP: null, DOWN: null });
    } else {
      this.setLink('boardTab', { RIGHT: 'boardList', UP: null, DOWN: null });
      this.setFm('boardList', new FM({
        id: 'boardList',
        containerSelector: '.textList',
        focusSelector: '.csFocus',
        row: listData.length || 0,
        col: 1,
        focusIdx: this.state.listFocusIndex || 0,
        startIdx: 0,
        lastIdx: listData.length - 1,
        onFocusChild: this.onFocusListItem,
        onFocusContainer: this.onFocusList,
        onBlurContainer: this.onBlurList,
        onFocusKeyDown: this.onFocusListKeyDown
      }));

      this.setLink('boardTab', { RIGHT: 'boardList', UP: null, DOWN: null });
    }
  }

  tabItemMenuMapper = (menu) => {
    const menuItem = {
      title: menu.menu_nm
    };

    if (this.isUseGuide()) {
      menuItem.detailTitle = menu.uguid_title;
      menuItem.detailText = menu.uguid_expl;
      menuItem.detailVideoId = menu.uguid_epsd_rslu_id;
      menuItem.detailType = menu.uguid_typ_cd;
      menuItem.images = menu.guide_imgs;

      if (isEmpty(menuItem.detailType)) {
        console.warn('이용가이드 유형 코드가 없습니다.');
      } else if (!find(getCodeGroup('UGUID_TYP_CD'), { code: menuItem.detailType })) {
        console.warn('잘못된 "이용가이드 유형 코드"입니다.');
      }
    }

    return menuItem;
  }

  loadTab = async () => {
    const result = await NXPG.request003({ menu_id: this.state.menuId });
    let tabData = (result && result.blocks) ? result.blocks.map(item => (
      {
        title: item.menu_nm,
        callUrl: item.call_url,
        //menus: item.menus && item.menus.map(menu => ({ title: menu.menu_nm }))
        menus: item.menus && item.menus.map(this.tabItemMenuMapper)
      }
    )) : [];

    if (!this.isUseGuide()) {
      tabData = await this.checkNew(tabData);
    }

    blue('loadTab() tabData:', tabData);

    this.setState({ tabData }, () => {
      this.setBoardTabFM(this.state.tabData);
      this.loadList(this.state.tabFocusIndex);
      this.setFocus('boardTab');
    });
  }

  loadList = async (index) => {
    let result;
    let arr;

    //blue('$$$$$ loadList() this.state.callUrl:', this.state.callUrl, this.state.tabData);

    if (!isEmpty(this.state.tabData)) {
      let callUrl = this.state.tabData[index].callUrl || this.state.callUrl;

      // NOTE: logic 개선
      // TODO: 예외 처리
      //console.log('Request list:', index, callUrl);
      switch (callUrl) {
        case CALL_URL.NOTICE:
          result = await PNS.request501();
          arr = (result && result.customer_notices) || [];
          this.lastPage = Math.ceil(arr.length / BoardList.ITEM_COUNT_PER_SCREEN) - 1;
          this.setState({ listData: arr, pagedListData: this.cutPages(arr), listPage: 0, loadingDone: true }, () => {
            //console.log('pagedListdata:', this.state.pagedListData);
            this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
          });
          break;
        case CALL_URL.EVENT:
          result = await PNS.request503();
          arr = (result && result.events) || [];
          this.lastPage = Math.ceil(arr.length / BoardList.ITEM_COUNT_PER_SCREEN) - 1;
          this.setState({ listData: arr, pagedListData: this.cutPages(arr), listPage: 0, loadingDone: true }, () => {
            //console.log('pagedListdata:', this.state.pagedListData);
            this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
          });
          break;
        case CALL_URL.USE_GUIDE:
          result = (this.state.tabData[index] && this.state.tabData[index].menus) || [];
          this.lastPage = Math.ceil(result.length / BoardList.ITEM_COUNT_PER_SCREEN) - 1;
          this.setState({ listData: result, pagedListData: this.cutPages(result), listPage: 0, loadingDone: true }, () => {
            //console.log('pagedListdata:', this.state.pagedListData);
            this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
          });
          break;
        default:
          console.log('Not supported call_url', callUrl);
          break;
      }
    }

    return result;
  }

  checkNew = async (tabData) => {
    const callUrls = uniq(map(tabData, 'callUrl'));
    const pnses = compact(callUrls.map(callUrl => invoke(pnsMap, `${callUrl}.func`)));
    //console.log('pnses:', pnses);
    //const results = await Promise.all(pnses);
    //console.log('checkNew Response list:', results);

    // TODO: 위쪽까지는 동적으로 처리하고 있으나, 아래부터는 new를 체크할 date를 뽑는 것이 정형화되어 있어서 동적으로 처리 못함.

    /*
    const [result501, result503] = await Promise.all(pnses);
    //console.log('checkNew Response 501:', result501);
    //console.log('checkNew Response 503:', result503);
    const dates501 = map(get(result501, pnsMap[CALL_URL.NOTICE].parentField), pnsMap[CALL_URL.NOTICE].field);
    const dates503 = map(get(result503, pnsMap[CALL_URL.EVENT].parentField), pnsMap[CALL_URL.EVENT].field);
    //const dates501 = map(result501, `${pnsMap[CALL_URL.NOTICE].parentField}.${pnsMap[CALL_URL.NOTICE].field}`);
    //const dates501 = map(get(result501, 'customer_notices'), 'date');
    //console.log('checkNew dates501:', dates501);
    //console.log('checkNew dates501:', dates503);
    const dates = uniq([...dates501, ...dates503]);
    console.log('checkNew dates:', dates);
    */

    const results = await Promise.all(pnses);
    //console.log('results:', results);
    const newCallUrls = [];
    results.forEach(result => {
      const now = moment();
      const dates = uniq(map(get(result, ifMap[result.IF].parentField), ifMap[result.IF].field));
      const hasNew = some(dates, (date) => {
        return now.diff(moment(date, 'YYYY-MM-DD'), 'days') <= NEW_PERIOD_BY_DAY;
      });

      if (hasNew) {
        newCallUrls.push(ifMap[result.IF].callUrl);
      }
    });

    return tabData.map(item => {
      if (includes(newCallUrls, item.callUrl)) {
        item.new = true;
      }

      return item;
    });
  }

  cutPages = (list) => {
    const pagedList = {};

    list.forEach((item, index) => {
      const key = Math.floor(index / BoardList.ITEM_COUNT_PER_SCREEN);

      if (!pagedList[key]) {
        pagedList[key] = [];
      }

      pagedList[key].push(item);
    });

    return pagedList;
  }

  isUseGuide = () => {
    return this.state.callUrl === CALL_URL.USE_GUIDE;
  }

  onFocusListItem = index => {
    this.setState({ listFocusIndex: index });
  }

  onFocusList = () => {
    this.boardList.onFocus();
    this.boardList.setArrows({
      up: this.state.listPage > 0,
      down: this.state.listPage < this.lastPage
    });
  }

  onBlurList = () => {}

  movePageOfList = (event, index) => {
    if (event.keyCode === UP && index === 0 && this.state.listPage > 0) {
      this.getFm('boardList').removeFocus();
      this.setState({ listPage: this.state.listPage - 1, listFocusIndex: BoardList.ITEM_COUNT_PER_SCREEN - 1 }, () => {
        this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
        //this.setFocus('boardList', BoardList.ITEM_COUNT_PER_SCREEN - 1);        // setFocus()는 onBlur()를 호출함.
        this.getFm('boardList').setFocusByIndex(BoardList.ITEM_COUNT_PER_SCREEN - 1);
      });
    } else if (event.keyCode === DOWN && index === BoardList.ITEM_COUNT_PER_SCREEN - 1 && this.state.listPage < this.lastPage) {
      this.getFm('boardList').removeFocus();
      this.setState({ listPage: this.state.listPage + 1, listFocusIndex: 0 }, () => {
        this.setBoardListFM(this.state.pagedListData[this.state.listPage]);
        //this.setFocus('boardList', 0);      // setFocus()는 onBlur()를 호출함.
        this.getFm('boardList').setFocusByIndex(0);
      });
    }
  }

  onFocusListKeyDown = (event, index) => {
    this.movePageOfList(event, index);
    this.boardList.onKeyDown(event, index);
  }

  onFocusTabItem = index => {
    this.loadList(index);
    this.boardTab.onFocusItem(index);
    this.setState({ tabFocusIndex: index, listFocusIndex: 0 });
  }

  onFocusTab = () => {
    this.boardTab.onFocus();
    this.boardList.onBlur();
  }

  onBlurTab = () => {
    this.boardTab.onBlur();
  }

  onFocusTabKeyDown = (event, index) => {
    if (event.keyCode === ENTER && this.state.listData.length > 0) {
      this.setFocus('boardList', 0);
      return;
    }

    this.boardTab.onKeyDown(event, index);
  }

  render() {
    let callUrl = '';
    const pageTitle = this.isUseGuide() ? '이용 가이드' : '공지/이벤트';

    if (!isEmpty(this.state.tabData)) {
      callUrl = this.isUseGuide() ? this.state.callUrl : this.state.tabData[this.state.tabFocusIndex].callUrl;
    }

    return (
      <div className="wrap">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="noticeListWrap">
          <div className="contsArea">
            <div className="menuArea">
              <p className="pageTitle">{pageTitle}</p>
              <BoardTab ref={instance => { this.boardTab = instance }} listData={this.state.tabData} focusIndex={this.state.tabFocusIndex} />
            </div>
            <BoardList ref={instance => { this.boardList = instance }} loadingDone={this.state.loadingDone} listData={this.state.pagedListData[this.state.listPage]} callUrl={callUrl} />
          </div>
        </div>
      </div>
    )
  }
}

export default NoticeList;