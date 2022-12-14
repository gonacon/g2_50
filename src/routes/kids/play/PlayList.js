import React from 'react';
import PageView from 'Supporters/PageView';
import { isEmpty } from 'lodash';

import keyCodes from 'Supporters/keyCodes';
import FM from '../../../supporters/navi';
import '../../../assets/css/routes/kids/genremenu/GenreMenuList.css';
import appConfig from '../../../config/app-config';
import constants from 'config/constants';
import { NXPG } from 'Supporters/network';
import Utils from 'Util/utils';
import Core from 'Supporters/core';
import GenreListItemType from './../genremenu/GenreListItemType';
import update from 'react-addons-update';

const GRID_SIZE = 6;

class PlayList extends PageView {
  constructor(props) {
    super(props);

    if (!isEmpty(this.historyData)) {
      this.state = this.historyData;
    } else {
      this.state = {
        orginInfo: [],
        slideInfo: [],
        slideLastLen: 0,
        listIndex: 0,
        scrollInfo: {
          transform: 'translate(0px, 0px)'
        },
        historyInfo: {
          menuId: null,
          prevTitle: null,
          focusKey: null,
          childIndex: null,
          isOnHistory: false
        }
      };
    }

    // [NEW_NAVI][FM]
    this.focusList = [
      { key: 'grids', fm: null },
      { key: 'bottomBtn', fm: null }
    ];
    this.declareFocusList(this.focusList);
  }

  static defaultProps = {};

  /*********************************** Component Lifecycle Methods ****************************************/
  componentWillMount() {
    Core.inst().showKidsWidget();
  }

  componentDidMount() {
    this.props.showMenu(false);
    let paramData = this.props.location.state;

    if (!isEmpty(paramData)) {
      this.setHistory({
        menuId: paramData.menu_id,
        prevTitle: paramData.menu_nm
      });
      this.handleRequestAPI(paramData.menu_id);
    }
  }

  /*********************************** H/E Request Methods ****************************************/
  handleRequestAPI(menuId) {
    this.handleRequestContentInfo(menuId);
  }

  handleRequestContentInfo = async (menuId) => {
    const result = await NXPG.request006({ menu_id: menuId });
    let contents = result.contents ? result.contents : [];

    console.log('contents ', contents);

    contents = contents.map((content, index) => {
      return {
        srisId: content.sris_id,
        epsdId: content.epsd_id,

        salePrc: content.sale_prc,
        title: content.title,
        badgeTypNm: content.badge_typ_nm, // ?????? ?????????
        brcastTseqNm: content.brcast_tseq_nm, // ?????? ??????
        imgV: content.poster_filename_v,
        imgH: content.poster_filename_h,
        userBadgeImgPath: content.user_badge_img_path, // ????????? ?????? ?????? ?????????(?????? ?????? ????????? ?????????)
        userBadgeWdtImgPath: content.user_badge_wdt_img_path, // ????????? ?????? ?????? ?????? ?????????(?????? ?????? ????????? ?????????)
        basBadgeImgPath: content.bas_badge_img_path, // ?????? ?????? ?????????(?????? ?????? ??????)

        synonTypCd: content.synon_typ_cd, // ?????? ???????????? ?????? ??????
        adltLvlCd: content.adlt_lvl_cd, // ?????? ?????? ??????
        watLvlCd: content.wat_lvl_cd, // ?????? ?????? ??????
        metaTypCd: content.meta_typ_cd, // ?????? ?????? ??????

        sortSeq: content.sort_seq, // ????????? ?????? ??????
        svcfrDt: content.svc_fr_dt, // ????????? ?????????
        svcToDt: content.svc_to_dt, // ????????? ?????????
        iconExpsFrDt: content.icon_exps_fr_dt, //??????(?????????) ?????? ?????? ??????
        iconExpsToDt: content.icon_exps_to_dt, //??????(?????????) ?????? ?????? ??????
        epsdDistFirSvcDt: content.epsd_dist_fir_svc_dt, // ???????????? ????????? ?????????
        srisDistFirSvcDt: content.sris_dist_fir_svc_dt, // ????????? ????????? ?????????

        rsluTypCd: content.rslu_typ_cd, // ?????? ?????????
        kidsYn: content.kids_yn, // ?????? ??????
        cacbroYn: content.cacbro_yn, // ?????? ??????
        iImgCd: content.i_img_cd
      }
    });
    this.setState({
      orginInfo: contents,
      slideInfo: this.pagingContentInfo(contents, GRID_SIZE),
      slideLastLen: contents.length
    }, () => {
      this.setFocusSetting();
    });
  }

  // ????????? ?????? ??????
  pagingContentInfo = (list, colCnt) => {
    let resultArr = [], tempArr = [];
    let totalLen = 0, count = 0;

    totalLen = list.length;
    list.forEach((item, index) => {
      tempArr.push(item);

      if ((index + 1) % colCnt === 0 || (index + 1) >= totalLen) {
        resultArr[count] = tempArr;
        count++;
        tempArr = [];
      }
    });
    console.log(resultArr);
    return resultArr;
  }

  setFocusSetting = () => {
    const { slideInfo, slideLastLen, historyInfo } = this.state;

    const fm = new FM({
      id: 'grids',
      containerSelector: '.listWrapper',
      focusSelector: '.csFocus',
      row: slideInfo.length - 1,
      col: GRID_SIZE,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: slideLastLen - 1,
      onFocusChild: this.onGridItemFocus,
      onFocusKeyDown: this.onGridItemKeyDown
    });

    const bottomBtnFm = new FM({
      id: 'bottomBtn',
      type: 'ELEMENT',
      focusSelector: '.csFocus',
      row: 1,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 0,
      onFocusKeyDown: this.onKeyDownBottomBtn,
    });

    this.setFm('bottomBtn', bottomBtnFm);
    this.setFm('grids', fm);

    if (historyInfo.isOnHistory) {
      if (historyInfo.focusKey === 'grids') {
        this.scrollTo(null, historyInfo.parentIndex, historyInfo.childIndex);
        this.setFocus(historyInfo.focusKey, historyInfo.childIndex);
        this.resetHistory();
      }
    } else {
      this.setFocus(0, 0);
    }
  }

  /*********************************** FocusManager KeyEvent Methods ***********************************/
  onGridItemFocus = (focusIdx) => {
    console.log('onGridItemFocus', focusIdx);
  }

  onGridItemKeyDown = (event, focusIdx) => {
    console.log('onGridItemKeyDown', this.focusList, event, focusIdx);
    const { slideLastLen } = this.state;
    let listIndex = this.state.listIndex;

    switch (event.keyCode) {
      case keyCodes.Keymap.LEFT:
        if (focusIdx === (listIndex * GRID_SIZE) && focusIdx !== 0) {
          listIndex--;
        } else {
          return;
        }
        break;
      case keyCodes.Keymap.RIGHT:
        if (focusIdx === ((listIndex + 1) * GRID_SIZE) - 1 && focusIdx !== slideLastLen - 1) {
          listIndex++;
        } else {
          return;
        }
        break;
      case keyCodes.Keymap.UP:
        if (listIndex === 0) return;
        listIndex--;
        break;
      case keyCodes.Keymap.DOWN:
        if (listIndex === Math.ceil(slideLastLen / GRID_SIZE) - 1) return;
        listIndex++;
        break;
      case keyCodes.Keymap.ENTER:
        const { historyInfo } = this.state;
        const param = { pathName: '', state: '' }
        const contentInfo = this.state.orginInfo[focusIdx];
        param.pathName = constants.SYNOPSIS;
        param.state = {
          menu_id: this.state.historyInfo.menuId,
          sris_id: contentInfo.srisId,
          epsd_id: contentInfo.epsdId
        }

        this.setHistory({
          menuId: historyInfo.menuId,
          prevTitle: historyInfo.prevTitle,
          focusKey: 'grids',
          parentIndex: listIndex,
          childIndex: focusIdx,
          isOnHistory: !historyInfo.isOnHistory
        });

        if (!isEmpty(param.state.sris_id) || !isEmpty(param.state.epsd_id)) {
          Utils.movePageAfterCheckLevel(param.pathName, param.state, contentInfo.watLvlCd);
        } else {
          Core.inst().Toast(`????????? ID : ${param.state.sris_id} ???????????? ID ${param.state.epsd_id}`);
        }

        return;
      default:
        break;
    }
    this.scrollTo(event, listIndex, focusIdx);
    this.setState({ listIndex: listIndex });
  }

  onKeyDownBottomBtn = (event) => {
    if (event.keyCode === keyCodes.Keymap.ENTER) {
      this.setState({
        listIndex: 0,
        scrollInfo: update(this.state.scrollInfo, {
          transform: { $set: `translate(0px, 0px)` }
        })
      }, () => {
        this.setFocus('grids', 0);
      })
    }
  }

  /*********************************** hisotry Methods ***********************************/
  // Set ????????????
  setHistory = (info) => {
    let tempHistory = this.state.historyInfo;
    for (let prop in info) {
      tempHistory = update(tempHistory, {
        [prop]: { $set: info[prop] }
      });
    }
    console.log('%c[HISTORY DATA] ===>', 'color:#0000ff ', tempHistory);
    this.setState({ historyInfo: tempHistory });
  }

  // Get ????????????
  getHistory = (info) => {
    return this.state.historyInfo
  }

  // Reset ????????????
  resetHistory = () => {
    this.setState({
      historyInfo: update(this.state.historyInfo, {
        focusKey: { $set: null },
        childIndex: { $set: null },
        isOnHistory: { $set: false }
      })
    })
  }

  /*********************************** Etc Methods ***********************************/
  scrollTo = (event, listIndex, idx) => {
    // ????????? ????????????
    const { slideInfo, slideLastLen, historyInfo } = this.state;
    if (slideInfo.length <= 2 && isEmpty(slideInfo)) return;

    // let listArr = Array.prototype.slice.call(document.querySelectorAll('.menuBlockList .contentGroup'));
    let topValue = 0;
    const TOP_MARGIN = 88.5;
    const SCOLL_TOP = listIndex === 0 ? 582 : 582 - TOP_MARGIN;

    if (!isEmpty(event) && !historyInfo.isOnHistory) {
      switch (event.keyCode) {
        case keyCodes.Keymap.LEFT:
        case keyCodes.Keymap.UP:
          topValue = listIndex * SCOLL_TOP;
          break;
        case keyCodes.Keymap.RIGHT:
        case keyCodes.Keymap.DOWN:
          if (listIndex === (Math.ceil(slideLastLen / GRID_SIZE))) return;
          topValue = listIndex * SCOLL_TOP;
          break;
        default:
          break;
      }
    } else {
      topValue = listIndex * SCOLL_TOP;
    }
    // if(event.keyCode !== keyCodes.Keymap.LEFT || event.keyCode !== keyCodes.Keymap.LEFT)
    this.setState({
      scrollInfo: update(this.state.scrollInfo, {
        transform: { $set: `translate(0px, ${-topValue}px)` }
      })
    });
  }

  /*********************************** Render ***********************************/
  render() {
    const { slideInfo, historyInfo, scrollInfo } = this.state;
    const menuInfo = {
      prevTitle: '?????? ??????',
      currentTitle: historyInfo.prevTitle
    }

    const bShow = (!isEmpty(slideInfo) && slideInfo.length !== 0);
    return (
      <div className="wrap">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="genreMenuListWrap scrollWrap" style={scrollInfo}>
          <div className="menuBlockTitle">
            <p className="highRankTitle">{menuInfo.prevTitle}></p>
            <p className="title">{menuInfo.currentTitle}</p>
          </div>
          <div className="menuBlockList">
            {
              bShow && <GenreListItemType
                id='blocks'
                setFm={this.setFm}
                setFocus={this.setFocus}
                slideInfo={slideInfo} />
            }
          </div>
          <div id="bottomBtn" className="btnTopWrap">
            <span className="csFocus btnTop"><span>??? ??????</span></span>
          </div>
        </div>
      </div>
    )
  }
}

export default PlayList;