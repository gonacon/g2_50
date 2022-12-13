import 'Css/myBtv/my/MyBtvHome.css';
import { EPS, MeTV, NXPG/*, SMD*/ } from 'Network';
import PageView from 'Network/../PageView';
import React, { Component, Fragment } from 'react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import constants, { STB_PROP } from '../../../config/constants';
import Core from '../../../supporters/core';
import Utils, { scroll } from '../../../utils/utils';
import CSMenu from '../component/CSMenu';
import ConnectMenu from '../component/ConnectMenu';
import PointList from '../component/PointList';
import SettingMenu from '../component/SettingMenu';
import Top3VODList from '../component/Top3VODList';
import { BookmarkVODList, MyVODList, RecentVODList } from '../component/vodLists';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';
import appConfig from 'Config/app-config';
import keyCodes from 'Supporters/keyCodes';
import Tmembership from '../tmembership/Tmembership';
import OkCashManage from '../okcash/OkCashManage';
import { CTSInfo } from 'Supporters/CTSInfo';
import IMG from 'react-image';
import { Alert } from 'Popup';

const KEY = keyCodes.Keymap;

class BtnTop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
    this.anchor = null;
  }

  onFocused = () => {
    this.setState({ focused: true });
  }

  onBlured = () => {
    this.setState({ focused: false });
  }

  render() {
    const { focused } = this.state;
    const focusClass = `csFocus btnTop${focused ? ' focusOn' : ''}`;
    return (
      <div className="btnTopWrap" ref={r => this.anchor = r}>
        <div id="top" className={focusClass}><span>맨 위로</span></div>
      </div>
    );
  }
}

class MyBtvHome extends PageView {
  constructor(props) {
    super(props);
    this.state = {
      batteryInfo: null,
      productInfo: null,
      pointInfo: {
        couponInfo: {
          isNew: appConfig.STBInfo.couponNew, count: appConfig.STBInfo.coupon
        },
        bPointInfo: {
          isNew: appConfig.STBInfo.newBpoint, balance: appConfig.STBInfo.bPoint
        },
        tMembershipInfo: null,
        okCashInfo: [],
        tvPointInfo: []
      },
      vodInfo: {
        watchedInfo: {
          menuId: null,
          title: '',
          cw_call_id_val: '',
          watchedList: []
        },
        myVodInfo: {
          menuId: null,
          title: '',
          cw_call_id_val: '',
          myVodList: []
        },
        bookmarkInfo: {
          menuId: null,
          title: '',
          cw_call_id_val: '',
          bookmarkList: []
        },
        recommendInfo: {
          menuId: null,
          title: '',
          cw_call_id_val: '',
          recommendList: []
        },
      },
      csInfo: {
        menuId: null,
        title: '',
        csList: []
      },
      connectInfo: [0, 0, 0, 0],
      update: false,
      menuId: this.menuId,
      ocbMasterSequence: 0
    };

    this.restoreFocusInfo = null;

    if (this.paramData) {
      this.menuId = this.paramData.menuId;
      this.state.menuId = this.paramData.menuId;
      this.gnbTypeCode = this.paramData.gnbTypeCode;
      this.state.gnbTypeCode = this.paramData.gnbTypeCode;
    } else if (this.historyData.menuId) {
      this.menuId = this.historyData.menuId;
      this.state.menuId = this.historyData.menuId;
    } else {
      this.menuId = null;
    }

    // 페이지 복구
    if (this.historyData) {
      this.gnbTypeCode = this.historyData.gnbTypeCode;
      if (this.historyData.csInfo) {
        this.state.csInfo = cloneDeep(this.historyData.csInfo);
      }
      if (this.historyData.vodInfo) {
        this.state.vodInfo = cloneDeep(this.historyData.vodInfo);
      }
      this.state.currentPage = this.historyData.currentPage;
      this.state.focusedIdx = this.historyData.focusedIdx;
      this.state.isDark = this.historyData.isDark;

      this.restoreFocusInfo = this.historyData.__FOCUSINFO__;
    }

    if (appConfig.STBInfo.bPoint === undefined) {
      appConfig.STBInfo.bPoint = '0';
    }

    

    this.scrollPos = 0;

    const focusList = [
      { key: 'gnbMenu', fm: null },
      { key: 'productLink', fm: null, tab: true },
      { key: 'pointInfo', fm: null },
      { key: 'recentVod', fm: null },
      { key: 'myVod', fm: null },
      { key: 'bookedVod', fm: null },
      { key: 'top3Vod', fm: null },
      { key: 'csMenu', fm: null },
      { key: 'connectMenu', fm: null },
      { key: 'settingMenu', fm: null },
      { key: 'top', fm: null }
    ];
    this.declareFocusList(focusList);

    this.tvPointUrl = '';
    this.tvPointTermId = '';

    this.gnbFm = null;

    if (this.paramData) { // '' or null or undefined 
      const { targetMenu } = this.paramData;
      if (targetMenu) {
        this.targetMenu = targetMenu;
      }
    }
  }

  moveToTargetMenu = () => {
    if (this.targetMenu) {
      switch (this.targetMenu) {
        case 'setting_auth_number':
          this.setFocus('settingMenu');
          break;
        default:
          console.log('targetMenu 에 해당하는 메뉴가 없습니다', this.targetMenu);
          this.setFocus(1);
          break;
      }
      this.targetMenu = '';
    }
  }

  // 기기 정보 업데이트
  callbackDeviceInfo = (data) => {
    let connectedCount = 0;
    const rawConnectValue = StbInterface.getProperty(STB_PROP.BLUETOOTH_CONNECT);
    try {
      connectedCount = parseInt(rawConnectValue, 10);
    } catch (err) {
      connectedCount = rawConnectValue === 'true' ? 1 : 0;
    }
    const connectInfo = [
      Number(data.oksusu) > 0 ? 1 : 0,
      data.btvPlus ? Number(data.btvPlus) : 0,
      connectedCount ? Number(connectedCount) : 0,
      data.nugu === 'Y' ? 1 : 0
    ];
    this.setState({
      connectInfo
    });
  }

  updateConnectInfo = () => {
    StbInterface.requestDeviceInfo(this.callbackDeviceInfo);
  }

  webShowNoti = () => {
    // console.log('정보 업데이트');
    this.updateBattery();
    this.updatePointInfo();
    this.updateConnectInfo();
    this.updateCsInfo();
  }

  // 최초 업데이트를 담당하고 디폴트 메뉴로 포커스를 이동시킨다.
  update = async () => {
    // console.log('정보 업데이트');
    this.updateBattery();
    this.updatePointInfo();
    this.updateCsInfo();
    this.updateConnectInfo();
    await this.updateVodInfo();

    // 초기 포커스 새팅 
    const {
      vodInfo: {
        watchedInfo,
        myVodInfo,
        bookmarkInfo,
        recommendInfo
      }
    } = this.state;

    // 파라미터로 넘겨받은 디폴트 메뉴가 있으면 그 위치로 이동.
    if (this.targetMenu) {
      this.moveToTargetMenu();
    } else if(!this.historyData.__FOCUSINFO__){ // 없으면 데이터가 있는 vod 콘텐츠로 이동
      if (watchedInfo.watchedList && watchedInfo.watchedList.length !== 0) {
        this.setFocus('recentVod');
      } else if (myVodInfo.myVodList && myVodInfo.myVodList.length !== 0) {
        this.setFocus('myVod');
      } else if (bookmarkInfo.bookmarkList && bookmarkInfo.bookmarkList.length !== 0) {
        this.setFocus('bookedVod');
      } else if (recommendInfo.recommendList && recommendInfo.recommendList.length !== 0) {
        this.setFocus('top3Vod');
      } else {
        this.setFocus('pointInfo');
      }
    } else {
      const bSuccess = this.restorePreviousFocus();
      console.error('bSuccess', bSuccess);
      if (!bSuccess) {
        if (watchedInfo.watchedList && watchedInfo.watchedList.length !== 0) {
          this.setFocus('recentVod');
        } else if (myVodInfo.myVodList && myVodInfo.myVodList.length !== 0) {
          this.setFocus('myVod');
        } else if (bookmarkInfo.bookmarkList && bookmarkInfo.bookmarkList.length !== 0) {
          this.setFocus('bookedVod');
        } else if (recommendInfo.recommendList && recommendInfo.recommendList.length !== 0) {
          this.setFocus('top3Vod');
        } else {
          this.setFocus('pointInfo');
        }
      }
    }
  }

  // 배터리 정보 업데이트
  updateBattery = () => {
    let charged = StbInterface.getProperty(STB_PROP.PROPERTY_REMOTE_BATTERY);
    const batteryInfo = charged;
    this.setState({
      batteryInfo
    });
  }

  // 포인트 쿠폰 정보 콜백으로 업데이트
  // callbackCouponsPointInfo = (data) => {
  //   console.log('callbackCouponsPointInfo data=', data);

  //   const couponInfo = {
  //     isNew: appConfig.STBInfo.couponNew,
  //     count: appConfig.STBInfo.coupon
  //   }

  //   const bPointInfo = {
  //     isNew: appConfig.STBInfo.newBpoint,
  //     balance: appConfig.STBInfo.bPoint
  //   }

  //   let pointInfo = this.state.pointInfo;
  //   pointInfo.couponInfo = couponInfo;
  //   pointInfo.bPointInfo = bPointInfo;

  //   this.setState({
  //     pointInfo
  //   });
  // }


  // 포인트 정보 업데이트
  updatePointInfo = async () => {
    let result = null;
    let ocbMasterSequence = 0;
    // let resultSMD = null;

    try {
      result = await EPS.request300();
      // console.log('EPS.request300 result', result);

      // resultSMD = await SMD.request001({ m: 'getCouponsPointInfo' });
    } catch (err) {
      Core.inst().showToast(`신규 포인트 정보를 가져올 수 없습니다.`, '', 3000);
    } finally {

    }
    // result.usableBpoints  // b 포인트
    // result.usableCount  // 쿠폰 카운트
    // console.log('포인트정보:', result);

    this.tvPointUrl = result && result.tvpoint && result.tvpoint.tvpoint && result.tvpoint.tvpoint.url;
    this.tvPointTermId = result && result.tvpoint && result.tvpoint.tvpoint && result.tvpoint.tvpoint.id;

    // Utils.requestCouponsPointInfo(this.callbackCouponsPointInfo);
    // const isNewBpoint = resultSMD && resultSMD.points_new && resultSMD.points_new.length !== 0;
    // const isNewCoupon = resultSMD && resultSMD.coupons_new && resultSMD.coupons_new.length !== 0;
    const isNewBpoint = appConfig.STBInfo.newBpoint;
    const isNewCoupon = appConfig.STBInfo.couponNew;
    //     isNew: appConfig.STBInfo.couponNew,
    //     isNew: appConfig.STBInfo.newBpoint,

    // const couponInfo = this.state.pointInfo.couponInfo;
    const couponInfo = {
      isNew: isNewCoupon,
      count: (result && result.usableCount) ? result.usableCount : 0
    }

    // const bPointInfo = this.state.pointInfo.bPointInfo;
    const bPointInfo = {
      isNew: isNewBpoint,
      balance: (result && result.usableBpoints) ? result.usableBpoints : 0
    }

    const tMembershipInfo = (result && result.tmembership) ? {
      cardNo: result.tmembership.cardNo,
      balance: result.tmembership.balance,
      grade: result.tmembership.grade
    } : null;

    let okCashInfo = [];
    if (result && result.ocbList.ocb && result.ocbList.ocb.length !== 0) {
      for (let cardInfo of result.ocbList.ocb) {
        okCashInfo.push({
          cardNo: cardInfo.cardNo,
          balance: cardInfo.balance ? cardInfo.balance : -1,
          sequence: cardInfo.sequence
        });
      }

      ocbMasterSequence = result.ocbMasterSequence;
    }

    const tvPointInfo = [];
    const defaultTvPointInfo = {
      isUser: false,
      id: '',
      balance: -1
    };

    if (result && result.tvpoint) {
      const { useTvpoint: isUse = false, id: tvpId = '', balance: tvpBalance = -1 } = result.tvpoint.tvpoint;
      tvPointInfo.push({
        isUse,
        id: tvpId,
        balance: tvpBalance
      })
    } else {
      tvPointInfo.push(defaultTvPointInfo);
    }

    const pointInfo = {
      couponInfo,
      bPointInfo,
      tMembershipInfo,
      okCashInfo,
      tvPointInfo
    };

    this.setState({
      pointInfo,
      ocbMasterSequence
    });
  }

  // vod 정보 업데이트
  updateVodInfo = async () => {
    this.setState({ isProgress: true });
    const [
      watchedVods,
      myVods,
      bookedVods
    ] = await Promise.all([
      MeTV.request021(),
      MeTV.request035(),
      MeTV.request011({ group: 'VOD', entry_no: 60 })
    ]);

    const watchList = watchedVods.watchList ? watchedVods.watchList : [];
    const filtered = watchList.filter(vod => vod.adult === 'N');
    let watchedList = filtered.map((vod, idx) => {
      const {
        series_no,
        title,
        thumbnail: imgURL,
        watch_rt: rate,
        adult,
        epsd_id: epsdId,
        sris_id: srisId,
        epsd_rslu_id: epsdRsluId,
        material_cd: materialCd
      } = vod;
      const watchRate = parseInt(rate, 10);
      const bAdult = adult === 'Y';
      // console.log('vod', vod);
      return {
        title: Number(series_no) > 0 ? `${title} ${series_no}회` : title,
        imgURL,
        rate: watchRate,
        bAdult,
        epsdId,
        srisId,
        epsdRsluId,
        materialCd
      };
    });

    const purchaseList = myVods.purchaseList ? myVods.purchaseList : [];
    let myVodList = purchaseList.map((vod, idx) => {
      const {
        title,
        poster: imgURL,
        epsd_id: epsdId,
        sris_id: srisId,
        adult,
        epsd_rslu_id: epsdRsluId,
        prod_id: prodId,
        level,
        material_cd: materialCd
      } = vod;
      const bAdult = adult === 'Y';
      // const bAdult = level === '19';

      return {
        title,
        imgURL,
        epsdId,
        srisId,
        bAdult,
        epsdRsluId,
        prodId,
        level,
        materialCd
      };
    });

    const bookedkList = bookedVods.bookmarkList ? bookedVods.bookmarkList : [];
    let bookmarkList = bookedkList.map((vod, idx) => {
      const {
        title,
        poster: imgURL,
        epsd_id: epsdId,
        sris_id: srisId,
        adult,
        epsd_rslu_id: epsdRsluId,
        level,
        material_cd: materialCd
      } = vod;
      const bAdult = adult === 'Y';
      // const bAdult = level === '19';

      return {
        title,
        imgURL,
        epsdId,
        srisId,
        bAdult,
        epsdRsluId,
        level,
        materialCd
      };
    });

    // 인기 TOP3 VOD 확인용
    // bookmarkList = [];
    // myVodList = [];
    // watchedList = [];
    const isNoVodInfo = watchedList.length === 0 && myVodList.length === 0 && bookmarkList.length === 0;
    let recommendList = [];
    if (isNoVodInfo) { // TODO :: 테스트를 위해 무조건 실행. 추후 삭제 요망
      this.setFm('myVod', null);
      const result009 = await NXPG.request009({
        menu_id: 'NM1000020097',
        cw_call_id: 'MOVIESERIESREC.PAGE',
        type: 'all',
        // stb_id: '%7B660D7F55-89D8-11E5-ADAE-E5AC4F814417%7D'
      });

      if (result009.result === '0000') {
        let list = result009.grid[0].block;
        if (list.length > 3) {
          list = list.slice(0, 3);
        }
        recommendList = list.map((vod, idx) => {
          return {
            title: vod.title,
            imgURL: vod.poster_filename_v, // vod.poster_filename_h
            epsdId: vod.epsd_id,
            srisId: vod.sris_id,
            bAdult: vod.adlt_lvl_cd === '19'
          };
        });
      } else {
        Core.inst().showToast(`추천 VOD 정보를 가져올 수 없습니다 [${result009.result}]`);
      }
    } else {
      this.setFm('top3Vod', null);
    }

    let vodInfo = cloneDeep(this.state.vodInfo);
    vodInfo.watchedInfo.watchedList = watchedList;
    vodInfo.myVodInfo.myVodList = myVodList;
    vodInfo.bookmarkInfo.bookmarkList = bookmarkList;
    vodInfo.recommendInfo.recommendList = recommendList;

    this.setState({
      isProgress: false,
      vodInfo
    });
  }

  updateCsInfo = async () => {
    const result = await NXPG.request003({ menu_id: this.menuId });
    const csMenu = find(result.blocks, { call_url: constants.CALL_URL.CS });
    const csInfo = {
      menuId: csMenu && csMenu.menu_id,
      title: csMenu && csMenu.menu_nm
    };

    csInfo.csList = csMenu && csMenu.menus && csMenu.menus.map(menu => ({
      callUrl: menu.call_url,
      name: menu.menu_nm,
      menuId: menu.menu_id
    }
    ));
    let vodInfo = cloneDeep(this.state.vodInfo);
    for (let i = 0; i < result.blocks.length; i++) {
      switch(result.blocks[i].call_url) {
        case 'btv001':  //최근시청VOD
          vodInfo.watchedInfo.menuId = result.blocks[i].menu_id;
          vodInfo.watchedInfo.title = result.blocks[i].menu_nm;
          vodInfo.watchedInfo.cw_call_id_val = result.blocks[i].cw_call_id_val;
          break;
        case 'btv002':  //나의 소장용VOD
          vodInfo.myVodInfo.menuId = result.blocks[i].menu_id;
          vodInfo.myVodInfo.title = result.blocks[i].menu_nm;
          vodInfo.myVodInfo.cw_call_id_val = result.blocks[i].cw_call_id_val;
          break;
        case 'btv003':  //VOD찜목록
          vodInfo.bookmarkInfo.menuId = result.blocks[i].menu_id;
          vodInfo.bookmarkInfo.title = result.blocks[i].menu_nm;
          vodInfo.bookmarkInfo.cw_call_id_val = result.blocks[i].cw_call_id_val;
          break;
        default:
          break;
      }
    }
    
    this.setState({ csInfo, vodInfo });
  }

  onSelectPointInfo = (type) => {
    switch (type) {
      case 'coupon': this.movePage(constants.MYBTV_COUPON_DETAIL); break;
      case 'bpoint': this.movePage(constants.MYBTV_BPOINT_HISTORY); break;
      case 'tmembership': Core.inst().showPopup(<Tmembership />, {}, () => { this.updatePointInfo(); }); break;
      case 'okcash': Core.inst().showPopup(<OkCashManage />, { className: 'OkCashManage' }, () => { this.updatePointInfo(); }); break;
      case 'tvpoint':
        if (!this.tvPointUrl) {
          Core.inst().showToast('tvPoint의 URL 정보가 없습니다', '', 3000);
        } else {
          const url = `${this.tvPointUrl}?termId=${this.tvPointTermId}`;
          StbInterface.openPopup('url', url, () => {
            console.log('tvpoint 호출 콜백')
          });
        }
        break;
      default: break;
    }
  }

  onKeyDownSelectTop = (event) => {
    if (event.keyCode === KEY.ENTER) {
      this.setFocus(1);
    }
  }

  // vod 선택시 처리
  onSelectVOD = (id, idx) => {
    const { vodInfo } = this.state;
    let vod = null;
    switch (id) {
      case 'bookedVod': // 찜 목록
        const { bookmarkInfo } = vodInfo;
        vod = bookmarkInfo.bookmarkList[idx - 1];
        break;
      case 'recentVod': // 최근시청 목록
        const { watchedInfo } = vodInfo;
        vod = watchedInfo.watchedList[idx];
        if (vod.materialCd === '80') {
          Core.inst().showPopup(<Alert title="서비스가 종료된 컨텐츠입니다" onOk={() => { 
            const param = {
              group: 'VOD',
              sris_id: vod.srisId,
              isAll_type: '0',
              deleteList: [vod.srisId]
            };
            Utils.deleteRecentVod(param, 'D').then((result) => {
              if (result) {
                this.updateVodInfo();
              }
            })
          }}/>);
          return;
        }

        this.onSelectRecentVod(vod);
        return;
      case 'myVod': // 소장용 목록
        const { myVodInfo } = vodInfo;
        vod = myVodInfo.myVodList[idx - 1];
        // 소장용 목록에서 종료 컨텐츠 선택시 그냥 팝업만 노출
        if (vod.materialCd === '80') {
          Core.inst().showPopup(<Alert title="알림" msg="서비스가 종료된 컨텐츠입니다" onOk={() => { 
            console.error('종료 팝업에서 확인 누름');
          }}/>);
          return;
        }

        this.onSelectMyVOD(vod);
        return;
      case 'recommendVod': // 추천 목록
        const { recommendInfo } = vodInfo;
        vod = recommendInfo.recommendList[idx];
        break;
      default: break;
    }

    // 찜목록에서 종료 컨텐츠 선택시
    if (vod.materialCd === '80') {
      Core.inst().showPopup(<Alert title="서비스가 종료된 컨텐츠입니다" onOk={() => { 
        // 해당 vod 삭제후 업데이트
        const param = {
          group: 'VOD',
          sris_id: vod.srisId,
          isAll_type: '0',
          deleteList: [vod.srisId]
        };
        Utils.bookmarkDelete(param, 'D').then((result) => {
          if (result.result === '0000') {
            this.updateVodInfo();
          }
        });
      }}/>);
      return;
    }

    if (vod) {
      // let { menuId } = this.props.history.location.state;
      const param = {
        epsd_id: vod.epsdId,
        sris_id: vod.srisId,
        epsd_rslu_id: vod.epsdRsluId,
        menuId: '' //this.props.history.location.state ? menuId : ''
      };
      Utils.movePageAfterCheckLevel(constants.SYNOPSIS, param, vod.level);
    }
  }

  // 최근시청 vod 선택시 처리
  onSelectRecentVod = (vod) => {
		const data = {
      search_type: '2',
			epsd_rslu_id: vod.epsdRsluId,
			seeingPath: '13'	 //시청컨텐츠를 통한 VOD 시청(마이Btv-최근시청-최근시청목록)
		}
		CTSInfo.requestWatchVODForOthers(data);
  }

  // 소장용 vod 선택시 처리
  onSelectMyVOD = async ({ epsdId, srisId, prodId, epsdRsluId, level }) => {
    const param = {
      menu_id: this.menuId,
      epsd_id: epsdId,
      sris_id: srisId,
      search_type: 1
    };

    let details = null;
    try {
      details = await NXPG.request010(param);
    } catch (err) {
      Core.inst().showToast('VOD 정보를 가져올 수 없습니다');
    } finally {
      if (details) {
        if (details.contents && details.contents.sris_typ_cd === '01') { //시리즈
          Utils.movePageAfterCheckLevel(`${constants.MYBTV_MYVOD_SEASON_DETAIL}/${epsdId}/${srisId}/${prodId}`, null, level);
        } else { // 단편
          Utils.movePageAfterCheckLevel(`${constants.MYBTV_MYVOD_DETAIL}/${epsdId}/${srisId}/${prodId}`, null, level);
        }
      }
    }
  }

  // 나의 소장용 VOD 전체보기 선택
  onSelectViewAllMyVOD = () => {
    const { vodInfo } = this.state;
    this.movePage(constants.MYBTV_MYVOD_LIST, {myVodInfo: vodInfo.myVodInfo});
  }

  // 찜 VOD 목록 전체보기
  onSelectViewAllBookedVOD = () => {
    this.movePage(constants.MYBTV_BOOKMARK_LIST);
  }

  // 최근 시청 VOD 슬라이드 keydown
  onRecentVodKeyDown = (event) => {
    if ((event && event.keyCode) === KEY.OPTION
      || event.keyCode === KEY.OPTION_KEY
      || event.keyCode === KEY.BLUE
      || event.keyCode === KEY.BLUE_KEY
    ) {
      this.movePage(constants.MYBTV_EDIT_VODLIST);
    }
  }

  // 찜 목록 vod 목록 keydown
  onBookmarkVodKeyDown = async (event, idx) => {
    switch (event.keyCode) {
      case KEY.BLUE:
      case KEY.BLUE_KEY:
      case KEY.OPTION:
      case KEY.OPTION_KEY:
        this.movePage(constants.MYBTV_EDIT_BOOKMART_LIST);
        break;
      case KEY.FAV:
      case KEY.FAV_KEY:
        if (idx === 0) { // 전체보기
          return;
        }
        const {
          vodInfo: {
            bookmarkInfo
          }
        } = this.state;
        const vod = bookmarkInfo.bookmarkList[idx - 1];
        const param = {
          group: 'VOD',
          sris_id: vod.srisId,
          isAll_type: '0',
          deleteList: [vod.srisId]
        };
        const delResult = await Utils.bookmarkDelete(param, 'D');
        if (delResult.result === '0000') {
          Core.inst().showToast(vod.title, '찜 등록 해제되었습니다.', 2000);
          this.updateVodInfo();
        }
        break;
      default: break;
    }
  }

  scrollTo = (anchor, marginTop) => {
    let top = 0;
    let offset = 0;
    if (anchor) {
      top = anchor.offsetTop;
    }
    const margin = marginTop ? marginTop : 0;
    let bShowMenu = true;
    if (top > 500) {
      offset = -(top - 60) + margin;
      bShowMenu = false;
    } else {
      offset = 0;
    }
    scroll(offset);
    const { showMenu } = this.props;
    showMenu(bShowMenu, true);
  }

  getGnbIndex = (gnbTypeCode) => {
    let gnbIndex = {
        U5_02: 0,
        U5_01: 1,
        U5_03: 2,
        U5_04: 3,
        U5_05: 4,
        U5_06: 5,
        U5_07: 6,
        U5_08: 7,
        U5_10: 8,
        U5_09: 9,
  
    };
    return gnbIndex[gnbTypeCode];
  }

  setGnbActiveMenu = (gnbTypeCode) => {
    this.gnbFm.setListInfo({ focusIdx: this.getGnbIndex(gnbTypeCode) });
  }

  componentDidMount() {
    window.MYBTV = this;
    const { showMenu } = this.props;
    showMenu(true);

    this.update();

    const { data, activeMenu } = this.props;
    if (data.gnbFm) {
      this.setFm('gnbMenu', data.gnbFm);
      this.setFocus(0);
      this.gnbFm = data.gnbFm;
      activeMenu(this.gnbTypeCode);
    }

    const topButtonFm = new FM({
      id: 'top',
      type: 'ELEMENT',
      focusSelector: '.csFocus',
      row: 1,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 0,
      onFocusKeyDown: this.onKeyDownSelectTop,
    });
    this.setFm('top', topButtonFm);

    // if (this.historyData.__FOCUSINFO__) {
    //   const bSuccess = this.restorePreviousFocus();
      // if (!bSuccess) { // 포커스 복구가 실퍠하면, 디폴트 포커스 위치로 이동
      //   const {
      //     vodInfo: {
      //       watchedInfo,
      //       myVodInfo,
      //       bookmarkInfo,
      //       recommendInfo
      //     }
      //   } = this.state;
    
      //   if (watchedInfo.watchedList && watchedInfo.watchedList.length !== 0) {
      //     this.setFocus('recentVod');
      //   } else if (myVodInfo.myVodList && myVodInfo.myVodList.length !== 0) {
      //     this.setFocus('myVod');
      //   } else if (bookmarkInfo.bookmarkList && bookmarkInfo.bookmarkList.length !== 0) {
      //     this.setFocus('bookedVod');
      //   } else if (recommendInfo.recommendList && recommendInfo.recommendList.length !== 0) {
      //     this.setFocus('top3Vod');
      //   } else {
      //     this.setFocus('pointInfo');
      //   }
      // }
    // }
  }

  componentWillReceiveProps(nextProps) {
    const { data, activeMenu } = nextProps;
    if (data.gnbFm && !this.gnbFm) {
      this.setFm('gnbMenu', data.gnbFm);
      this.setFocus(0);
      activeMenu(this.gnbTypeCode);
    }
  }

  render() {
    const {
      batteryInfo,
      //productInfo,
      pointInfo,
      vodInfo,
      csInfo,
      connectInfo,
      ocbMasterSequence
    } = this.state;

    let battery = 'Error';
    if (batteryInfo) {
      switch (batteryInfo) {
        case '0': battery = 'Empty'; break;
        case '1': battery = 'Low'; break;
        case '2': battery = 'Normal'; break;
        default: battery = 'Error'; break;
      }
    }

    const batteryClass = `remoteController battery${battery}`;
    //const productName = productInfo ? productInfo.name : '';

    const {
      watchedInfo,
      myVodInfo,
      bookmarkInfo,
      recommendInfo
    } = vodInfo;

    const w = (!watchedInfo.watchedList || (watchedInfo.watchedList && watchedInfo.watchedList.length === 0));
    const m = (!myVodInfo.myVodList || (myVodInfo.myVodList && myVodInfo.myVodList.length === 0));
    const b = (!bookmarkInfo.bookmarkList || (bookmarkInfo.bookmarkList && bookmarkInfo.bookmarkList.length === 0));
    const bShowRecommendVod = (w && m && b && recommendInfo.recommendList.length !== 0);

    return (
      <div className="wrap">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="MyBtvHome scrollWrap">
          <div className="changeItem">나의 B tv 할인 혜택 / 가입상품 정보</div>
          {/* <ProductInfo productName={productName} scrollTo={this.scrollTo} setFm={this.setFm} /> */}
          <div className={batteryClass}>리모콘 배터리</div>
          <PointList
            pointInfo={pointInfo}
            ocbMasterSequence={ocbMasterSequence}
            onSelect={this.onSelectPointInfo}
            scrollTo={this.scrollTo}
            setFm={this.setFm}
          />
          <RecentVODList
            bShow={!w}
            list={watchedInfo.watchedList}
            onSelect={this.onSelectVOD}
            scrollTo={this.scrollTo}
            onKeyDown={this.onRecentVodKeyDown}
            setFm={this.setFm}
          />
          <MyVODList
            bShow={!m}
            list={myVodInfo.myVodList}
            onSelect={this.onSelectVOD}
            onSelectMenu={this.onSelectViewAllMyVOD}
            scrollTo={this.scrollTo}
            allMenu={true}
            setFm={this.setFm}
          />
          <BookmarkVODList
            bShow={!b}
            list={bookmarkInfo.bookmarkList}
            onSelect={this.onSelectVOD}
            onSelectMenu={this.onSelectViewAllBookedVOD}
            scrollTo={this.scrollTo}
            allMenu={true}
            setFm={this.setFm}
            onKeyDown={this.onBookmarkVodKeyDown}
          />
          <Top3VODList
            bShow={bShowRecommendVod}
            list={recommendInfo.recommendList}
            onSelect={this.onSelectVOD}
            viewComponent={this}
            scrollTo={this.scrollTo}
            setFm={this.setFm}
          />
          <CSMenu scrollTo={this.scrollTo}
            title={csInfo.title}
            menuId={csInfo.menuId}
            list={csInfo.csList}
            setFm={this.setFm}
          />
          <ConnectMenu info={connectInfo} scrollTo={this.scrollTo} setFm={this.setFm} />
          <SettingMenu scrollTo={this.scrollTo} setFm={this.setFm} />
          <BtnTop scrollTo={this.scrollTo} setFm={this.setFm} />
        </div>
      </div>
    );
  }
}

const BG = ({img}) => {
  return (
    <div className="mainBg">
      <IMG 
        src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + img}
        alt=""
        loader={ <div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}></div>}
      />
    </div>
  )
}

export default MyBtvHome;

