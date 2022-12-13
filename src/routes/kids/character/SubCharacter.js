import { React, createMarkup } from '../../../utils/common';
import { NXPG, MeTV } from '../../../supporters/network';
import { CTSInfo } from '../../../supporters/CTSInfo';
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP, CHILDREN_LIMIT_TYPE } from 'Config/constants';

// new navigator
import FM from '../../../supporters/navi';
import keyCodes from "../../../supporters/keyCodes";
import Core from '../../../supporters/core';
import { scroll } from '../../../utils/utils';

import PageView from 'Supporters/PageView';
import appConfig from 'Config/app-config';
import constants from '../../../config/constants'
import Utils from '../../../utils/utils';
import { kidsConfigs } from '../config/kids-config';
import { isEmpty, isEqual, uniq } from 'lodash';

//import { PlayGuideWatchDistance } from '../playguide';
import '../../../assets/css/routes/kids/character/SubCharacter.css';


const gCodeList = require("../../../utils/code");									// 공통코드
const { CONTENTS_BLOCK_CD/*, EVENT_BLOCK_CD*/ } = kidsConfigs.BLOCK;
const { CHRTR_MENU_CAT_CD, CALL_TYPE } = kidsConfigs;

// 장르유형 안올경우 방어코드
const UNKNOWN_CAT = {
  cat_cd: '90',
  cat_nm: '미분류',
  class_nm: 'etc'
};

const getNavibarClassNm = (categoryCd) => {
  let classNm = '';
  switch (categoryCd) {
    case '10': classNm = 'season'; break;
    case '20': classNm = 'song'; break;
    case '30': classNm = 'movie'; break;
    case '40': classNm = 'app'; break;
    case '50': classNm = 'entertain'; break;
    case UNKNOWN_CAT.cat_cd: classNm = UNKNOWN_CAT.class_nm; break;
    default: break;
  }
  return classNm;
};


export default class SubCharacter extends PageView {
  constructor(props) {
    super(props);

    this.state = isEmpty(this.historyData) ? {
      menu_id: !isEmpty(this.paramData.menu_id) ? this.paramData.menu_id : '',
      blk_typ_cd: !isEmpty(this.paramData.blk_typ_cd) ? this.paramData.blk_typ_cd : '',
      imgPoster: '',
      contentsCnt: 0,
      eventInfo: {},
      contentsInfo: [],
      watchListInfo: [],
      isShowWatchList: false,
      focusHistory: {
        id: null,
        rowIdx: 0,
        childIdx: 0
      },
      lastFocusedBlockIdx: 0,
      categoryClass: null
    } : this.historyData;

    this.focusList = [
      { key: 'leftBtns', fm: null },
      { key: 'navibar', fm: null },
      { key: 'blocks', fm: [] },
      { key: 'watchVod', fm: null }
    ];

    this.declareFocusList(this.focusList);
    this.focusInfo = {
      id: null,
      childIdx: -1
    }
  }

  /*********************************** Component Lifecycle Methods ****************************************/

  componentWillMount() {
    console.log('%c[paramData] ==================>', 'color:#0000ff;', this.paramData);
    console.log('%c[historyData] ==================>', 'color:#0000ff;', this.historyData);

    Core.inst().showKidsWidget();

    if (!isEmpty(this.historyData)) {
      this.initFmList();
    } else if (!isEmpty(this.paramData)) {
      const { menu_id, blk_typ_cd } = this.paramData;
      this.requestSubCharacterInfo(menu_id, blk_typ_cd);
    } else {
      if (typeof this.moveBack === 'function') {
        this.moveBack();
        Core.inst().showToast('[ERROR]', '데이터가 없습니다.');
      }
    }
  }

  componentDidMount() {
    // 상단 General GNB
    const { showMenu } = this.props;
    if (showMenu && typeof showMenu === 'function') showMenu(false);

    this.initFmList();
  }

  /*********************************** H/E Request Methods ****************************************/

	/**
	 * [H/E] 캐릭터 서브 컨텐츠 정보 + 캐릭터별 이어보기 정보 조회
	 */
  requestSubCharacterInfo = async (menuId, blkTypCd) => {
    let categoryData = [];

    let watchListData = (await MeTV.request025({})).watchList;																			// 1. 이어보기 정보
    const resultInfo = (await NXPG.request003({ menu_id: menuId, transactionId: 'XPG003_Blocks_' + menuId }));						// 2.블록 정보
    const blocksInfo = resultInfo.blocks;
    const bannerInfo = resultInfo.banners;

    // BTVQ-1310 특정 캐릭터의 이어보기 정보만 노출하도록 코드 추가 

    if (!isEmpty(watchListData)) {
      let curWatchInfo = null;
      let watchInfoYn = watchListData.some((watchInfo, index) => {
        curWatchInfo = watchInfo;
        return isEqual(watchInfo.kids_char_id, menuId)

      });
      watchListData = [];
      if (watchInfoYn) watchListData.push(curWatchInfo);
    } else {
      watchListData = [];
    }

    if (blocksInfo) {
      let totalContentsCnt = 0;
      // 2.블록별 그리드 정보
      const reqGridInfo = blocksInfo.filter(item => { return item.blk_typ_cd === CONTENTS_BLOCK_CD }).map(block => {
        let blockData = {
          menu_nm: block.menu_nm,
          menu_id: block.menu_id,
          blk_typ_cd: block.blk_typ_cd,
          call_typ_cd: block.call_typ_cd,
          call_url: block.call_url,
          chrtr_menu_cat_cd: block.chrtr_menu_cat_cd,
          pst_exps_typ_cd: block.pst_exps_typ_cd,
          contents: []
        };

        // 3. 장르 구분코드 수집
        if (block.chrtr_menu_cat_cd) {
          const categoryNm = gCodeList.getCodeName('CHRTR_MENU_CAT_CD', block.chrtr_menu_cat_cd);
          const naviClassNm = getNavibarClassNm(block.chrtr_menu_cat_cd);
          const catItem = {
            cat_cd: block.chrtr_menu_cat_cd,
            cat_nm: categoryNm ? categoryNm : UNKNOWN_CAT.name,
            class_nm: naviClassNm ? naviClassNm : UNKNOWN_CAT.class_nm
          }
          categoryData.push(catItem);
        } else {
          block.chrtr_menu_cat_cd = UNKNOWN_CAT.cat_cd;
          categoryData.push(UNKNOWN_CAT);
        }

        return NXPG.request006({ menu_id: block.menu_id, transactionId: 'XPG006_Blocks_' + block.menu_id }).then(grid => {
          blockData.contents = grid.contents;
          if (grid.contents !== undefined && grid.contents !== null) totalContentsCnt += Number(grid.contents.length);
          return blockData;
        }).catch(error => { console.log('[ERROR][XPG006]', error); });
      });

      let eventData = {
        banners: {}
      };
      const eventBlockInfo = bannerInfo ? bannerInfo[0] : [];
      // eventBlockInfo.menu_id
      if (!isEmpty(eventBlockInfo)) {
        // [2018.06.12] 이벤트 정보 H/E 변경으로 인하여 수정 
        // const eventContents = (await NXPG.request007({ menu_id : eventBlockInfo.menu_id })).banners;
        // eventData = eventBlockInfo[0];
        // eventData.banners = eventContents ? eventContents[0] : [];
        eventData.banners = eventBlockInfo;
      }
      const contentsData = await Promise.all(reqGridInfo);

      this.handleResponseAPI({
        eventData: eventData,
        contentsCnt: totalContentsCnt,
        contentsData: contentsData,
        categoryData: uniq(categoryData, 'cat_cd'),										// 동일 카테고리가 여러개 올경우에 대한 방어코드
        watchListData: watchListData ? watchListData : [],
      });
    } else {
      // 블록 데이터가 없을경우
      console.error('[ERROR][XPG003] NO_DATA :: menuId=' + menuId);
      setTimeout(() => {
        if (typeof this.moveBack === 'function') {
          this.moveBack();
          Core.inst().showToast('[ERROR]', '데이터가 없습니다.');
        }
      }, 500);
    }
  }

	/**
	 * [H/E] 데이터 가공 -> state
	 */
  handleResponseAPI = (responseData) => {
    let { eventData, contentsCnt, contentsData, categoryData, watchListData } = responseData;

    // 배포승인된 것만 이어보기 표시 (65:배포승인, 85:배포만료)
    let isShowWatchList = false;
    if (watchListData && watchListData.length > 0) {
      const { title, material_cd } = watchListData[0];
      if (title && material_cd === '65') isShowWatchList = true;
    }

    // 동일 카테고리가 여러개 올경우에 대한 방어코드
    if (!isEmpty(categoryData) && !isEmpty(contentsData)) {
      categoryData.forEach((container, idx) => {
        container.contents = [];

        contentsData.forEach((data, dataIdx) => {
          if (container.cat_cd === data.chrtr_menu_cat_cd) {
            const { menu_id, menu_nm, blk_typ_cd, call_typ_cd, call_url, pst_exps_typ_cd } = data;
            container = Object.assign(container, { menu_id, menu_nm, blk_typ_cd, call_typ_cd, call_url, pst_exps_typ_cd });
            container.contents = container.contents.concat(data.contents);
          }
        });
      });

      //this.sortArrayByKey(categoryData, 'cat_cd', 'number', 'asc');				// 장르 코드순으로 정렬이 필요할경우 다음 Comment 해제
    }

    // XPG006에 컨텐츠 없을경우 뒤로
    if (contentsCnt <= 0) {
      if (typeof this.moveBack === 'function') {
        this.moveBack();
        Core.inst().showToast('[ERROR]', '재생할 컨텐츠가 없습니다.');
      }
    }

    let stateData = {
      imgPoster: !isEmpty(this.paramData.chrtr_zon_sub_img) ? this.paramData.chrtr_zon_sub_img : '',
      eventInfo: eventData,
      contentsCnt: contentsCnt,
      contentsInfo: categoryData,
      watchListInfo: watchListData,
      isShowWatchList: isShowWatchList
    };

    if (eventData) {
      if (eventData.banners.bss_img_path) {
        stateData.imgPoster = eventData.banners.bss_img_path;			// 이벤트 이미지가 있을경우, 포스터 교체
      }
    }

    this.setState(stateData, () => {
      this.initFmList();
    });
  }

	/**
	 * FocusManager 초기화
	 */
  initFmList = () => {
    const { eventInfo, contentsInfo, isShowWatchList } = this.state;

    if (!isEmpty(eventInfo.banners)) {
      // 이벤트 상세보기 버튼 (모두재생 버튼은 TBD -> 구현난이도 및 예외상황이 많아 P2 로 결정됨)
      const leftBtnsFm = new FM({
        id: 'leftBtns',
        type: 'LIST',
        containerSelector: '.characterArea',
        focusSelector: '.csFocus',
        row: 1,
        col: 1,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        onFocusKeyDown: this.onSelectLeftBtns
      });

      this.setFm('leftBtns', leftBtnsFm);
    }

    // 이어보기 블럭
    if (isShowWatchList) {
      const watchVodFm = new FM({
        id: 'watchVod',
        type: 'ELEMENT',
        containerSelector: '.continueWrap',
        focusSelector: '.csFocus',
        row: 1,
        col: 1,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        onFocusKeyDown: this.onSelectWatchVod
      });

      this.setFm('watchVod', watchVodFm);
    }

    // HistoryData 있을경우, 포커스 복구
    if (!isEmpty(this.historyData)) {
      // H/E 없을경우를 위해, try/catch 로 방어코드 적용
      try {
        const { focusHistory } = this.historyData;

        if (focusHistory !== undefined) {
          if (focusHistory.id === 'blocks') {
            this.setListFocus(focusHistory.rowIdx, focusHistory.childIdx);
          } else {
            this.setFocus(focusHistory.id, focusHistory.childIdx);
          }
        }
      } catch (e) {
        console.error('[ERROR][initFmList] previous focus cannot recover!');
      }
    } else {
      if (isShowWatchList) {
        this.setFocus('watchVod');
      } else {
        if (!isEmpty(contentsInfo)) this.setListFocus();
        else this.setFocus('leftBtns');
      }
    }
  }


	/**
	 * 재생가이드 사용여부 체크
	 */
  isShowPlayGuide = () => {
    let isGuideUse = false;

    // 시간대 설정시, 현재 진입시간이 설정 시간대인지 체크
    const checkCustomTimeZone = (timeSet) => {
      let isTimeZone = false;
      if (timeSet && timeSet.indexOf(',') > -1) {
        let startHour = timeSet.split(',')[0];
        let startMin = timeSet.split(',')[1];
        let endHour = timeSet.split(',')[2];
        let endMin = timeSet.split(',')[3];

        let d = new Date();
        let startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startHour, startMin);
        let endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHour, endMin);


        if (d >= startDate && d <= endDate) {
          console.log('>> 설정한 시간대 : success');
          isTimeZone = true;
        } else {
          console.log('>> 설정한 시간대 : failure');
        }
      }

      return isTimeZone;
    }


    // 시간대 설정으로 부터 남은시간(분) 구하기
    const getRemainMinFromCustomTime = (timeSet) => {
      let timeLeft = 0;

      if (timeSet && timeSet.indexOf(',') > -1) {
        let endHour = timeSet.split(',')[2];
        let endMin = timeSet.split(',')[3];
        endHour = endHour ? Number(endHour) : 0;
        endMin = endMin ? Number(endMin) : 0;

        let d = new Date();
        let nowDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
        let endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHour, endMin);

        timeLeft = Math.floor(((endDate - nowDate) / 1000) / 60);
      }
      return timeLeft;
    }

    let limitType = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_TYPE);
    limitType = isEmpty(limitType) ? CHILDREN_LIMIT_TYPE.BTV : limitType;
    let remainedTime = 0;

    // 시청시간 5분이상 / 편수 2편이상 남아있는경우만 재생가이드 사용
    if (limitType === CHILDREN_LIMIT_TYPE.TIME || limitType === CHILDREN_LIMIT_TYPE.CUSTOM_TIME) {
      if (limitType === CHILDREN_LIMIT_TYPE.CUSTOM_TIME) {																									// 시간대 제한일경우 직접 남은시간 계산
        let timeSet = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT_TIME_SET);
        if (checkCustomTimeZone(timeSet)) {
          remainedTime = getRemainMinFromCustomTime(timeSet);
        } else {
          remainedTime = 0;
        }
      } else {
        remainedTime = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME);														// 남은시간
      }

      if (Number(remainedTime) >= 5) isGuideUse = true;
      else isGuideUse = false;

    } else if (limitType === CHILDREN_LIMIT_TYPE.VOD_COUNT) {
      let remainedVod = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD);
      if (Number(remainedVod) >= 2) isGuideUse = true;
      else isGuideUse = false;
    } else {
      isGuideUse = true;
    }

    return isGuideUse;
  }

	/* 장르 코드순으로 정렬이 필요할경우 다음 Comment 해제
	sortArrayByKey(array, key, data_type, sort_by) {
		let ret;
		if(array) {
			return array.sort(function(a, b) {
				let x = null;
				let y =  null;
				if(data_type.toLowerCase() === 'number') {
					x = Number(a[key]);
					y = Number(b[key]);
				} else if(data_type.toLowerCase() === 'string' || data_type.toLowerCase() === 'boolean') {
					x = a[key];
					y = b[key];
				}
				// 오름차순
				if(sort_by.toLowerCase() === 'asc') {
					ret = ((x < y) ? -1 : ((x > y) ? 1 : 0));
				} else if(sort_by.toLowerCase() === 'desc') {
					ret = ((x < y) ? -1 : ((x > y) ? 1 : 0));
				}
				return ret;
			});
		}
	} */

	/**
	 * VOD 재생, 재생가이드 팝업 호출후 처리
	 */
  onPlayVod = (vodParam) => {
    if (!isEmpty(vodParam)) {
       console.log('[onPlayVod] ===================>>>>>>', vodParam);
      CTSInfo.requestWatchVODForOthers(vodParam);
    } else {
      Core.inst().showToast('재생 정보가 없습니다.');
    }
  }

  /*********************************** FocusManager KeyEvent Methods ****************************************/

	/**
	 * NaviBar 에서 선택한 장르기준으로 index 값을 찾기위해
	 */
  /*
  getTargetBlockIndex = () => {
    let index = -1;

    try {
      // 선택된 장르의 블럭으로 이동하기위해
      const naviItem = document.querySelectorAll('.navigator .naviItem.sel');
      if (naviItem) {
        let catClassNm = naviItem[0].getAttribute('category');
        catClassNm = catClassNm ? '.' + catClassNm : '';

        let targetBlock = document.querySelector('.videoArea.scrollWrap .blocksContainer' + catClassNm);
        if (targetBlock) {
          index = targetBlock.getAttribute('id').split('_')[1];
        }
      }
    } catch (e) {
      console.error('[ERROR][getTargetBlockIndex] targetObject not found!');
    }

    return index;
  }
  */

  scrollTo = (anchor) => {
    let top = 0;
    let offset = 0;
    if (anchor) {
      top = anchor.offsetTop;
    }
    const margin = 110;
    if (top > 500) {
      offset = -(top - 60) + margin;
    } else {
      offset = 0;
    }

    // 키즈존 하단으로 스크롤시 위젯 안보이게 하기위해 : BTVQ-262
    // if((Math.abs(offset) < 600)) kidsConfigs.showKidsWidgetBySettingsshowKidsWidgetBySettings();
    // else Core.inst().hideKidsWidget();

    scroll(offset);
  }

	/**
	 * 장르 블럭포커스
	 * - Array 타입 fm에, setFocus 접근을 쉽게하기 위해
	 */
  setListFocus = (rowIdx, childIdx) => {
    const { contentsInfo } = this.state;
    if (!isEmpty(contentsInfo)) {
      let idxOffset = 0;
      for (let i = 0; i < this.focusList.length; i++) {
        if (this.focusList[i].key === 'blocks') break;
        if (this.focusList[i].fm !== null) idxOffset++;
      }

      let idxRow = rowIdx !== undefined && rowIdx !== null ? idxOffset + rowIdx : idxOffset;
      let idxChild = childIdx !== undefined && childIdx !== null ? childIdx : 0;

      this.setFocus(idxRow, idxChild);
    }
  }

  // [onKeyDown] 왼쪽 캐릭터영역 버튼 (모두재생 버튼은 TBD -> 구현난이도 및 예외상황이 많아 P2 로 결정됨)
  onSelectLeftBtns = (evt, childIdx) => {
    if (evt.keyCode === keyCodes.Keymap.ENTER) {
      const { eventInfo } = this.state;

      if (!isEmpty(eventInfo)) {
        if (!isEmpty(eventInfo.banners)) {
          const eventData = eventInfo.banners;
          const { menu_id, call_typ_cd, call_url, lim_lvl_yn } = eventData;
          console.log('[상세보기] eventData=', eventData);

          switch (call_typ_cd) {
            case CALL_TYPE.BROWSE:
              console.log('===> 이벤트 페이지:' + call_url);
              StbInterface.openPopup('url', call_url);
              break;
            case CALL_TYPE.MENU:
              break;
            case CALL_TYPE.APP:
              this.movePage(constants.MYBTV_HOME, call_url);
              break;
            case CALL_TYPE.SYNOP:
              if (call_url) {
                const callParam = call_url.split('/');

                if (callParam.length >= 3) {
                  let paramData = { menu_id: menu_id };
                  if (callParam[0]) paramData.synopsis_type = callParam[0];
                  if (callParam[2]) paramData.sris_id = callParam[2];
                  if (callParam[3]) paramData.epsd_id = callParam[3];
                  if (callParam[2] && callParam[3]) paramData.search_type = '1';

                  if (menu_id) {
                    // 3번째 parameter 에 wat_lvl_cd 를 넣어야하지만, XPG007 에 해당 필드가 없어서, 다음과 같이 처리함.
                    if (lim_lvl_yn !== 'Y') Utils.movePageAfterCheckLevel(constants.SYNOPSIS, paramData, '0');
                    else Utils.movePageAfterCheckLevel(constants.SYNOPSIS, paramData, '19');
                  }
                }
              }
              break;
            case CALL_TYPE.TV_APP:
              this.movePage(call_url);
              break;
            case CALL_TYPE.LIVE_CHANNEL:
            case CALL_TYPE.VR_CHANNEL:
              this.movePage(constants.KIDS_CHANNEL, { channelNo: call_url });
              break;
            default:
              break;
          }
        }
      }
    } else if (evt.keyCode === keyCodes.Keymap.RIGHT) {
      /*
      if (this.state.isShowWatchList) {
        this.setFocus('watchVod');
      } else {
        const { lastFocusedBlockIdx } = this.state;
        this.setListFocus(lastFocusedBlockIdx, 0);
      }
      */
      this.setFocus(this.focusInfo.id, this.focusInfo.childIdx);
    }

    // 아래로 이동금지
    if (evt.keyCode === keyCodes.Keymap.DOWN) {
      const curFocus = this.getFocusInfo('leftBtns');
      if (curFocus) {
        if (childIdx === curFocus.fm.listInfo.lastIdx) return true;
      }
    }

    this.setState({ focusHistory: { id: 'leftBtns', childIdx: childIdx } });
  }

  // [onKeyDown] 이어보기 블럭
  onSelectWatchVod = (evt, idx) => {
    scroll(0);

    if (evt.keyCode === keyCodes.Keymap.ENTER) {
      console.log('===============>> [이어보기]');

      const { watchListInfo } = this.state;
      if (!isEmpty(watchListInfo)) {
        // [TODO] VOD 재생코드 필요
        const { title, series_no, epsd_rslu_id } = watchListInfo[0];
        const vodParam = {
          search_type: '2',
          kids_yn: 'Y',
          seeingPath: '99',
          epsd_rslu_id: epsd_rslu_id
        };

        let popupParam = { title: title, brcast_tseq_nm: series_no };
        popupParam = Object.assign(popupParam, vodParam);

        console.log('%c[popupParam] ==================>','color:#0000ff;', popupParam);
        this.setState({ focusHistory: { id: 'watchVod' } });
        this.onPlayVod(popupParam);
      }
    } else if (evt.keyCode === keyCodes.Keymap.DOWN) {
      this.setListFocus(0, 0);
      return true;
    } else if (evt.keyCode === keyCodes.Keymap.LEFT) {
      this.focusInfo = {
        id: 'watchVod',
        childIdx: 0
      }

      this.setFocus('leftBtns');
    } else if (evt.keyCode === keyCodes.Keymap.RIGHT) {
      this.focusInfo = {
        id: 'watchVod',
        childIdx: 0
      }

      this.setFocus('navibar', 0);
    }

    // 이동금지
    if (evt.keyCode === keyCodes.Keymap.UP) {
      return true;
    }

    //this.setState({ focusHistory: { id: 'watchVod' } });
  }

  // [onKeyDown] 장르 블럭
  onSelectList = (evt, rowIdx, childIdx, lastIdx, data) => {
    //console.log('rowIdx, childIdx, lastIdx, data:', rowIdx, childIdx, lastIdx, data);
    switch (evt.keyCode) {
      case keyCodes.Keymap.LEFT:
        if (childIdx === 0) {
          /*
          let focusIndex = rowIdx;

          if (!isEmpty(this.state.eventInfo.banners)) {
            focusIndex++;
          }
          */

          this.focusInfo = {
            id: {
              id: 'blocks',
              idx: rowIdx,
              childIdx: 0
            },
            childIdx: 0
          }

          this.setFocus('leftBtns');
        }

        break;
      case keyCodes.Keymap.RIGHT:
        if (childIdx === lastIdx) {
          /*
          let focusIndex = rowIdx;

          if (!isEmpty(this.state.eventInfo.banners)) {
            focusIndex++;
          }
          */

          this.focusInfo = {
            id: {
              id: 'blocks',
              idx: rowIdx,
              childIdx: 0
            },
            childIdx: 0
          }

          this.setFocus('navibar');
          return true;
        }

        break;
      case keyCodes.Keymap.ENTER:
        if (data) {
          const { /*ltitle, brcast_tseq_nm, */synon_typ_cd, kids_yn, menu_id, sris_id, epsd_id, call_url } = data;
          const isApp = data.chrtr_menu_cat_cd === CHRTR_MENU_CAT_CD.APP;

          if (childIdx === 0) {
            if (isApp) {
              // console.log('===============>> [TV 앱 페이지 이동]', call_url);
              if (call_url) this.movePage(call_url);				// TV 앱으로 이동
            } else {
              let vodParam = {};
              vodParam.search_type = '1';
              if (synon_typ_cd) vodParam.synopsis_type = synon_typ_cd;
              if (menu_id) vodParam.kidschar_id = this.state.menu_id;
              if (sris_id) vodParam.sris_id = sris_id;
              if (epsd_id) vodParam.epsd_id = epsd_id;
              if (kids_yn) vodParam.kids_yn = kids_yn;

              console.log('===============>> [VOD 재생]', vodParam);
              this.onPlayVod(vodParam);
            }
          } else if (childIdx === 1) {
            if (!isApp) {
              const { menu_id, sris_id, epsd_id, synon_typ_cd, rslu_typ_cd, wat_lvl_cd } = data;
              const paramData = { menu_id, sris_id, epsd_id, synon_typ_cd, rslu_typ_cd };

              // console.log('===============>> [자세히]', paramData);
              if (menu_id) Utils.movePageAfterCheckLevel(constants.SYNOPSIS, paramData, wat_lvl_cd);
            }
          }
        }
        break;
      default:
        break;
    }

    // 이동금지
    /*
    if (evt.keyCode === keyCodes.Keymap.UP && !this.state.isShowWatchList) {
      const { contentsInfo } = this.state;
      if (contentsInfo.length > 0 && contentsInfo[0].class_nm === data.class_nm && data.index === 0) {
        return true;
      }
    }
    */
    if (evt.keyCode === keyCodes.Keymap.UP) {
      if (this.state.isShowWatchList && rowIdx === 0) {
        this.setFocus('watchVod');
        return true;
      } else {
        const { contentsInfo } = this.state;

        if (contentsInfo.length > 0 && contentsInfo[0].class_nm === data.class_nm && data.index === 0) {
          return true;
        }
      }
    }
  }

  // [onFocusChild] 장르블럭 포커스 변화시
  onFocusList = (rowIdx, childIdx, classNm) => {
    let category = null; 
    try {
      const navItem = document.querySelectorAll('.navigator .naviItem');
      if (navItem) {
        for (let i = 0; i < navItem.length; i++) {
          if (navItem[i].classList.contains(classNm)) {
            category = classNm;
          }
        }
      }
    } catch (error) { console.error('[ERROR][onFocusList]', error) }

    this.setState({ focusHistory: { id: 'blocks', rowIdx: rowIdx, childIdx: childIdx }, lastFocusedBlockIdx: rowIdx, categoryClass:category });
  }

  // [onKeyDown] 우측네비바 선택시
  onSelectNavibar = (evt, childIdx, genreCount) => {
    if (evt.keyCode === keyCodes.Keymap.LEFT) {
      /*
      try {
        const targetBlockIdx = this.getTargetBlockIndex();
        if (targetBlockIdx > -1) {
          let target = document.querySelectorAll('#blocks_' + targetBlockIdx + ' .csFocus');
          let lastIdx = (target && target.length === 1) ? 0 : 1;																// 앱일경우나, 자세히 버튼 없을경우 처리를 위함
          this.setListFocus(Number(targetBlockIdx), lastIdx);
        } else {
          const { isShowWatchList } = this.state;
          if (isShowWatchList) {
            this.setFocus('watchVod');
          } else {
            this.setListFocus();
          }
        }
      } catch (e) {
        console.log('[ERROR][onSelectNavibar] targetBlockIdx not found!');
      }
      */
      this.setFocus(this.focusInfo.id, this.focusInfo.childIdx);
    } else if (evt.keyCode === keyCodes.Keymap.UP && childIdx === 0) {
      return true;
    } else if (evt.keyCode === keyCodes.Keymap.DOWN && childIdx === genreCount - 1) {
      return true;
    } else if (evt.keyCode === keyCodes.Keymap.ENTER) {
      this.focusInfo = {
        id: {
          id: 'blocks',
          idx: this.categoryList.getBlockIndex(childIdx),
          childIdx: 0
        },
        childIdx: 0
      }
    }

    this.setState({ focusHistory: { id: 'navibar', rowIdx: 0, childIdx: childIdx } });
  }

  render() {
    const { imgPoster, watchListInfo, isShowWatchList, contentsCnt, contentsInfo, eventInfo, categoryClass } = this.state;

    let imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.SUB_CHARACTER);
    let subImg = imgPoster ? imgUrl + imgPoster : imgPoster;
    let watchListBlock = '';
    const default_subImg = appConfig.headEnd.LOCAL_URL + '/common/default/kids_character_sub_default.png';
    
    // 이어보기 정보 있을경우, 이어보기 블럭 표시
    if (isShowWatchList) {
      const { title, epsd_title, thumbnail, series_no, watch_rt } = watchListInfo[0];
      imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.SUB_CHARACTER_BLOCK);
      const watchedThumbImg = thumbnail ? imgUrl + thumbnail : thumbnail;
      const episodeNo = (series_no !== '0' && series_no !== 0) ? series_no + '화' : '';
      const seriesTitle = title ? title : '';
      const episodeTitle = epsd_title ? epsd_title : '';
      const watchedRateStyle = {
        width: (watch_rt ? watch_rt : 0) + '%'
      };																													// 시청비율 ProgressBar

      watchListBlock = <div id="watchVod" className="continueWrap contentGroup">
        <div className="inner">
          <div className="csFocus videoImg">
            <img src={watchedThumbImg} alt="" />
            <div className="loadingBar">
              <div className="currentState" style={watchedRateStyle}></div>
            </div>
          </div>
          <div className="videoDetail">
            <span className="continue">이어보기</span>
            <p className="text">
              {
                episodeNo !== '' && <span className="episode">{episodeNo}</span>
              }
              <span className="title">{episodeTitle}</span>
            </p>
            <p className="subTitle">{seriesTitle}</p>
          </div>
        </div>
      </div>;
    }

    return (
      <div className="charSubWrap">
        <div className="subCharacter">
          <div className="subCharacterWrap">
            <div className="characterArea" id="leftBtns">
              <div className="mainBg" onError={e => e.target.src = default_subImg}>
                <img src={subImg} alt="" />
              </div>
              {
                // 모두재생 버튼은 TBD -> 구현난이도 및 예외상황이 많아 P2 로 결정됨
								/* (!isEmpty(contentsInfo) && contentsCnt > 0) && 
								<span className="characterTop">
									<span className="csFocus btnPlay"><span>모두재생</span></span>
								</span> */
              }
              {
                !isEmpty(eventInfo.banners) &&
                <span className="csFocus btnDetail"><span>상세보기</span></span>
              }
            </div>
            <div className="videoArea scrollWrap">
              {watchListBlock}
              {
                !isEmpty(contentsInfo) &&
                <CategoryList
                  id='blocks'
                  data={contentsInfo}
                  onSelect={this.onSelectList}
                  onFocusChild={this.onFocusList}
                  setFm={this.setFm}
                  scrollTo={this.scrollTo}
                  ref={ref => this.categoryList = ref}
                />
              }
            </div>
            {
              /* 장르가 1개일경우, 네비바 표시안함. XPG006에 해당 컨텐츠가 없을경우도 표시안함. */
              ((!isEmpty(contentsInfo) && contentsInfo.length > 1) && contentsCnt > 0) &&
              <NaviBar
                id="navibar"
                data={contentsInfo}
                onSelect={this.onSelectNavibar}
                scrollTo={this.scrollTo}
                setFm={this.setFm}
                categoryClass={categoryClass}/>
            }
          </div>
        </div>
      </div>
    );
  }	// end of render()
}



/************************************ Category Components ********************************************/

/**
 * 장르블럭 리스트
 * - 이어보기는 style 이 다른관계로, 본 Components 에 포함시키지 않음.
 */
class CategoryList extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.data, nextProps.data);
  }

  setBlockFm = (focusListId, fm) => {
    const { setFm } = this.props;
    setFm(focusListId, fm);
  }

  onFocusChild = (rowIdx, childIdx, classNm) => {
    const { onFocusChild } = this.props;
    if (typeof onFocusChild === 'function') {
      onFocusChild(rowIdx, childIdx, classNm);
    }
  }

  onFocusKeyDown = (evt, rowIdx, childIdx, lastIdx, data) => {
    const { onSelect } = this.props;
    return onSelect(evt, rowIdx, childIdx, lastIdx, data);
  }

  getBlockIndex = (itemIndex) => {
    return this.blockIndexMap && this.blockIndexMap[itemIndex];
  }

  render() {
    const { id, data } = this.props;
    let rowIdx = 0;

    this.blockIndexMap = {};

    const categoryList = data && data.map((block, idxBlock) => {
      let title = block.cat_nm;
      let naviClass = block.class_nm;
      let listClass = block.chrtr_menu_cat_cd === CHRTR_MENU_CAT_CD.APP ? 'appContent' : 'listSeason';

      if (idxBlock === 0) rowIdx = 0;

      this.blockIndexMap[idxBlock] = rowIdx;

      return (
        <div key={idxBlock} className={"contentGroup subListWrapper " + naviClass}>
          <p className="wrapperTitle">{title}</p>
          <ul className={listClass}>
            {
              block.contents.map((grid, idx) => {
                if (!grid) return (<div key={idx}></div>);

                // 상위 데이터를 하위로 전달할 데이터에 추가해서 이용하기 위해
                grid.index = idx;
                grid.menu_id = block.menu_id;
                grid.call_url = block.call_url;
                grid.call_typ_cd = block.call_typ_cd;
                grid.chrtr_menu_cat_cd = block.chrtr_menu_cat_cd;												// 장르유형코드
                grid.class_nm = block.class_nm;
                grid.isLeaf = (idxBlock === (data.length - 1)) && (idx === (block.contents.length - 1));			// 마지막 Block 인지 확인용 (DOWN 포커스 막을 용도)

                return (
                  <BlockItem
                    id={id}
                    key={idx}
                    index={rowIdx++}
                    data={grid}
                    setFm={this.props.setFm}
                    setBlockFm={this.setBlockFm}
                    onFocusChild={this.onFocusChild}
                    onFocusKeyDown={this.onFocusKeyDown}
                    scrollTo={this.props.scrollTo}
                  />
                )
              })
            }
          </ul>
        </div>
      );
    });

    return (categoryList);
  }
}


/**
 * Horizontal 블럭 (Focus 객체의 경우의 수가 아래와 같이 가변적이므로, List 로 처리하지않고, Horizontal 개념으로 처리함)
 * - 썸네일
 * - 썸네일, 자세히
 * - TV앱 아이콘
 */
class BlockItem extends React.Component {
  constructor(props) {
    super(props)
    this.fm = null;
  }

  componentDidMount() {
    const { id, index, setBlockFm, data } = this.props;
    const { kids_yn } = data;

    const focusListId = id ? id : 'blocks';
    let fmId = focusListId + '_' + index;

    let containerClass = '.' + focusListId + 'Container';
    let isApp = data.chrtr_menu_cat_cd === CHRTR_MENU_CAT_CD.APP;
    let colCnt = (kids_yn && kids_yn !== 'Y') || isApp ? 1 : 2;			// 키즈시놉 없거나, 앱 일경우는 자세히 버튼이 없음
    let lastIdx = (kids_yn && kids_yn !== 'Y') || isApp ? 0 : 1;

    this.fm = new FM({
      id: fmId,
      type: 'LIST',
      containerSelector: containerClass,
      focusSelector: '.csFocus',
      row: 1,
      col: colCnt,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: lastIdx,
      onFocusChild: this.onFocusChild,
      onBlurContainer: this.onBlurContainer,
      onFocusKeyDown: this.onFocusKeyDown
    });

    setBlockFm(focusListId, this.fm);									// 각 블럭들을 상위 컴포넌트인 CategoryList 로 보내서, setFm 함
  }

  /*    // SubCharacter로 이동
  scrollTo = (anchor) => {
    let top = 0;
    let offset = 0;
    if (anchor) {
      top = anchor.offsetTop;
    }
    const margin = 110;
    if (top > 500) {
      offset = -(top - 60) + margin;
    } else {
      offset = 0;
    }

    // 키즈존 하단으로 스크롤시 위젯 안보이게 하기위해 : BTVQ-262
    // if((Math.abs(offset) < 600)) kidsConfigs.showKidsWidgetBySettingsshowKidsWidgetBySettings();
    // else Core.inst().hideKidsWidget();

    console.log('offset:', offset);
    scroll(offset);
  }
  */

  onFocusChild = (childIdx) => {
    const { index, onFocusChild, data } = this.props;
    if (typeof onFocusChild === 'function') {
      this.props.scrollTo(this.anchor);
      onFocusChild(index, childIdx, data.class_nm);
    }
  }

  onBlurContainer = () => {
    console.log('onBlurContainer');
    this.fm.setListInfo({ focusIdx: 0 });
  }

  onFocusKeyDown = (evt, childIdx) => {
    const { index, onFocusKeyDown, data } = this.props;
    if (evt.keyCode === keyCodes.Keymap.UP || evt.keyCode === keyCodes.Keymap.DOWN) {
      if (data.isLeaf && evt.keyCode === keyCodes.Keymap.DOWN) return true;
    }

    return onFocusKeyDown(evt, index, childIdx, this.fm.listInfo.lastIdx, data);
  }

  onErrored = (e) => {
    if (e.target) {
      e.target.src = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-port.png';
    }
  }

  render() {
    const { id, index, data } = this.props;
    const { title, poster_filename_h, kids_yn, chrtr_menu_cat_cd } = data;

    let isApp = chrtr_menu_cat_cd === CHRTR_MENU_CAT_CD.APP;										// TV앱일 경우, UI가 달라지므로
    let imgUrl = Utils.getImageUrl(isApp ? Utils.IMAGE_KIDS.SUB_CHARACTER_APP : Utils.IMAGE_KIDS.SUB_CHARACTER_BLOCK);
    let thumbImg = poster_filename_h ? imgUrl + poster_filename_h : poster_filename_h;				// 캐릭터 서브는 가로형 포스터 고정이라고 답변받음. 따라서, 포스터유형코드에 대한 처리를 하지않음.

    const focusListId = id ? id : 'blocks';
    let fmId = focusListId + '_' + index;
    let containerClass = focusListId + 'Container ' + data.class_nm;									// NaviBar 에서 왼쪽으로 이동시, 장르구분을 가능하도록 하기 위해 (중요)

    return (
      isApp ?
        <li id={fmId} className={containerClass} key={index} ref={r => this.anchor = r}>
          <span className="csFocus">
            <span className="wrapImg">
              <img src={thumbImg} alt="" />
            </span>
          </span>
          <div className="desc"><span dangerouslySetInnerHTML={createMarkup(title)}></span></div>
        </li>
        :
        <li id={fmId} className={containerClass} key={index} ref={r => this.anchor = r}>
          <span className="csFocus videoImg">
            <img src={thumbImg} alt="" onError={(e) => this.onErrored(e)} />
          </span>
          <div className="videoDetail">
            <p className="title">{title}</p>
            {kids_yn !== 'N' ? <span className="csFocus"><span>자세히</span></span> : ''}
          </div>
        </li>
    );
  }
}

/************************************ NaviBar Components ********************************************/

/**
 * 우측 네비바
 */
class NaviBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusIndex: 0,
      isFocused: false,
      isNotNavList: true
    }
    this.naviFm = null;
  }

  checkLocationOfBlock = (props) => {
    // 장르블록이 이동 될 때마다 블록 위치 체크하여 포커스 상태 변경
    const navItem = Array.prototype.slice.call(document.querySelectorAll('.navigator .naviItem'));
    let isChangeFlag = false;
    let curIdx = -1;
    isChangeFlag = navItem.some((list, index) => {
      curIdx = index;
      return list.classList.contains(props.categoryClass);
    });
    console.log('[checkLocationOfBlock] ', curIdx);
    if(isChangeFlag) this.setState({ 
      focusIndex: curIdx,
      isFocused: false,
      isNotNavList: true
    });
  }

  shouldComponentUpdate(nextProps) {
    return true;
  }

  componentWillReceiveProps(nextProps) {
    this.state.isNotNavList && this.checkLocationOfBlock(nextProps);
    console.log('componentWillReceiveProps : ',nextProps);
  }

  componentDidMount() {
    const { id, data, setFm } = this.props;
    const rowCnt = data && data.length > 0 ? data.length : 0;
    const lastIndex = rowCnt > 0 ? rowCnt - 1 : 0;
    this.naviFm = new FM({
      id: id,
      type: 'LIST',
      containerSelector: '.navigator',
      focusSelector: '.csFocus',
      row: rowCnt,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: lastIndex,
      onFocusContainer: this.onFocusContainer,
      onBlurContainer: this.onBlurContainer,
      onFocusChild: this.onFocusChild,
      onFocusKeyDown: this.onFocusKeyDown
    });

    this.rowCount = rowCnt;
    setFm(id, this.naviFm);
  }

  onFocusContainer = () => {
    // console.log('[onFocusContainer] focusIndex >>> ', this.state.focusIndex);
    const navItem = Array.prototype.slice.call(document.querySelectorAll('.navigator .naviItem img'));
    let isNotNavList = false;
    let curIdx = this.state.focusIndex;
    isNotNavList = navItem.some((list, index) => {
      const condi = list.src.indexOf('sel') > -1;
      curIdx = condi ? index : curIdx;
      return condi;
    });
    this.setState({ 
      focusIndex: isNotNavList ? curIdx : this.state.focusIndex,
      isFocused: isNotNavList ? false : true 
    });
  }

  onBlurContainer = () => {
    this.setState({ 
      isFocused: false,
      isNotNavList: true
    });
  }

  onFocusKeyDown = (evt, childIdx) => {
    // console.log('[onFocusKeyDown] focusIndex >>> ', childIdx, evt.keyCode);
    const { onSelect } = this.props;

    if (evt.keyCode === keyCodes.Keymap.ENTER) {
      this.scrollActive(childIdx);
      this.setState({
        focusIndex: this.state.focusIndex
      })
    }
    return onSelect(evt, childIdx, this.rowCount);
  }

  scrollActive = (index) => {
    try {
      const navItem = document.querySelectorAll('.navigator .naviItem');

      if (navItem) {
        const navibarClassNm = (navItem[index].classList)[1];			// navItem movie sel 순서이므로 index = 1 참조
        const target = document.querySelector('.blocksContainer.' + navibarClassNm);
        this.props.scrollTo(target);
      }
    } catch (error) { console.error('[ERROR][NaviBar.scrollActive]', error) }
  }

  onFocusChild = (idx) => {
    const { focusIndex, isNotNavList } = this.state;
    // console.log(`[render] focusIndex : ${focusIndex} isFocused : ${isFocused} isNotNavList : ${isNotNavList}`);

    if(isNotNavList) {
      console.log(this.naviFm);
      this.naviFm.setListInfo({ focusIdx: focusIndex });
    }
    this.setState({ 
        focusIndex: isNotNavList ? focusIndex : idx,
        isFocused: true,
        isNotNavList: false
     });
  }

  // GET 카테고리 & 포커스 상태 별 이미지 정보
  getCategoryImgInfo = (catCd, type) => {
    return `${appConfig.headEnd.LOCAL_UPDATE_URL}/kids_sub_${catCd}_${type}.png`;
  }

  // GET 현재 인덱스의 포커스 상태
  getFocusType = (idx, focusIdx, focused) => {
    let focusType = null;
    
    if(focused) {
      focusType = idx === focusIdx ? 'foc' : 'def';  
    } else {
      focusType = idx === focusIdx ? 'sel' : 'def';
    }
    return focusType;
  }

  render() {
    const { focusIndex, isFocused } = this.state;
    const { id, data } = this.props;
    const navNum = data && data.length > 0 ? data.length : 0;
    // console.log(`[render] focusIndex : ${focusIndex} isFocused : ${isFocused}`);
    
    const naviItems = data && data.map((item, idx) => {
      const focusFlag = (isFocused && (idx === focusIndex));
      return (
        <div className={"naviItem " + item.class_nm} key={'naviItem_' + idx} category={item.class_nm}>
          <div to="#" className={`csFocus${focusFlag ? ' focusOn' : ''}`}>
            <span className="icon">
              <img src={this.getCategoryImgInfo(item.cat_cd, this.getFocusType(idx, focusIndex, isFocused))} alt=""/>
            </span>
          </div>
        </div>
      )
    });

    return (
      <div id={id} className={"navigator num" + navNum}>
        {naviItems}
      </div>
    )
  }
}
