import { React } from '../../../utils/common';
import { NXPG } from '../../../supporters/network/NXPG';

// new navigator
import FM from '../../../supporters/navi';
import keyCode from "../../../supporters/keyCodes";
import { SlideType, G2SliderDefault, G2SliderKidsBanner, G2SlideKidsBanner } from '../components/module/KidsSlider';
import PageView from '../../../supporters/PageView';
import appConfig from "../../../config/app-config";
import constants from '../../../config/constants'
import { kidsConfigs } from '../config/kids-config';
import { isEmpty, isEqual } from 'lodash';

import '../../../assets/css/routes/monthly/DetailTop.css';
import '../../../assets/css/routes/kids/monthly/KidsDetailTop.css';
import Utils from 'Util/utils';
import update from 'react-addons-update';
import {
  G2SlideHorizantalVOD,
  G2SlideVerticalVOD,
  G2SlideCwVOD,
  G2SlideMenuVOD,
  G2SlideCircle
} from '../components/module/KidsSlider/G2SlideGenreMeneAll'
import { CTSInfo } from 'Supporters/CTSInfo';
import Core from 'Supporters/core';
import { SearchContents } from 'Module/Search';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[KidsMonthlyDetail] ' + msg, ...args);
} : () => { };

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[KidsMonthlyDetail] ' + msg, 'color: white; background: blue', ...args);
} : () => { };

class KidsMonthlyDetail extends PageView {
  constructor(props) {
    super(props);

    if (!isEmpty(this.historyData)) {
      this.state = this.historyData;
    } else {
      this.state = {
        bannerInfo: [],
        blockInfo: [],
        scrollInfo: {
          transform: 'translate(0px, 0px)'
        },
        historyInfo: {
          menuId: null,
          prevTitle: null,
          isJoined: false,
          focusKey: null,
          parentIndex: null,
          childIndex: null,
          isOnHistory: false
        }
      }
    }

    this.focusList = [
      { key: 'banner', fm: null },
      { key: 'joinBtn', fm: null },
      { key: 'blocks', fm: [] },
      { key: 'topButton', fm: null }
    ];

    this.declareFocusList(this.focusList)
  }

  static defaultProps = {};

  // Core.inst().showToast('????????? ???????????? ????????????.');
  /*********************************** Component Lifecycle Methods ****************************************/
  componentWillMount() {
    Core.inst().showKidsWidget();
    let locationInfo = this.props.location.state;

    if (!isEmpty(locationInfo)) {
      this.setHistory({
        menuId: locationInfo.menu_id,
        prevTitle: locationInfo.menu_nm,
        isJoined: locationInfo.isJoined
      });
      this.handleRequestAPI(locationInfo.menu_id);
    }
  }

  componentDidMount() {
    this.props.showMenu(false);

    const { historyInfo } = this.state;
    // ???????????? ???????????? ???????????? back ??? ?????? ??????
    if (historyInfo.isOnHistory && historyInfo.focusKey !== 'blocks') {
      this.resetHistory();
    }
  }

  /*
  shouldComponentUpdate(nextProps, nextState) {
    let updateFlag = true;
    if (JSON.stringify(this.state.historyInfo) !== JSON.stringify(nextState.historyInfo)) {
      updateFlag = false;
    }
    return updateFlag;
  }
  */

  /*********************************** H/E Request Methods ****************************************/
  handleRequestAPI(menuId) {
    this.handleRequsetBlockInfo(menuId);
  }

  handleRequsetBlockInfo = async (menuId) => {
    log('%c[this.state.historyInfo.menuId] ===>', 'color:#0000ff ', menuId);
    const result = await NXPG.request003({ menu_id: menuId });

    let responseBanner = result.banners ? result.banners : [];
    let responseBlock = result.blocks ? result.blocks : [];
    let banners = [], blocks = [], menus = [], cwBlocks = [];

    if (!isEmpty(responseBanner)) {
      responseBanner.map((banner, index) => {
        banners.push({
          shcurMenuId: banner.shcut_menu_id,
          bssImgPath: banner.bss_img_path,
          extImgPath: banner.ext_img_path,
          menuId: banner.menu_id,
          parMenuPath: banner.par_menu_path,
          bnrDetTypCd: banner.bnr_det_typ_cd,
          callTypCd: banner.call_typ_cd,
          callUrl: banner.call_url,
          menuNm: banner.menu_nm,
          cwCallIdVal: banner.cw_call_id_val,

          prdPrcVat: this.props.location.state.prdPrcVat, // ?????? ?????? ????????? ??????
          prdPrcId: this.props.location.state.prdPrcId, // ?????? ID
        })
      })
    }

    responseBlock.forEach((block, index) => {
      const tempInfo = {
        menuId: block.menu_id,
        menuNm: block.menu_nm,

        blkTypCd: block.blk_typ_cd, // ?????? ?????? ??????
        pstExpsTypCd: block.pst_exps_typ_cd, // ????????? ?????? ?????? ??????
        expsMthdCd: block.exps_mthd_cd, // ?????? ?????? ?????? ??????
        gnbTypCd: block.gnb_typ_cd, // ?????? ?????? ??????

        cwCallIdVal: block.cw_call_id_val,
        scnMthdCd: block.scn_mthd_cd,

        limLvlYn: block.lim_lvl_yn,
        menus: block.menus,
        blockIndex: index,
      }

      // H/E ????????? ????????? ?????? ?????? ?????? (?????? ??????)
      // if(!isEmpty(tempInfo.cwCallIdVal) && tempInfo.scnMthdCd === kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU) {
      //     if(tempInfo.blkTypCd === '20') {
      //         tempInfo.blkTypCd = '30';
      //     }
      // }

      // ?????? ????????? ?????????.
      switch (tempInfo.blkTypCd) {
        case kidsConfigs.BLOCK.CONTENTS_BLOCK_CD: // ????????? ??????

          // ???????????? ?????? ?????? ( CW, ??????, ?????? )
          if (isEqual(tempInfo.scnMthdCd, kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU)) {
            tempInfo.slideType = SlideType.KIDS_CW_SLIDE;
            cwBlocks.push(tempInfo);
          } else {
            tempInfo.slideType = tempInfo.pstExpsTypCd === kidsConfigs.POSTER_TYPE.H ?
              SlideType.KIDS_CONTENT_HOR_SLIDE : SlideType.KIDS_CONTENT_VER_SLIDE;
            blocks.push(tempInfo);
          }
          break;
        case kidsConfigs.BLOCK.MENU_BLOCK_CD: // ?????? ??????

          // ???????????? ?????? ?????? ( CW ) [ BTVQ-464: CW??? ?????? ?????? ????????? 20, 30 ?????? ???????????? ??????]
          if (isEqual(tempInfo.scnMthdCd, kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU)) {
            tempInfo.slideType = SlideType.KIDS_CW_SLIDE;
            cwBlocks.push(tempInfo);
          } else {
            if (!isEmpty(tempInfo.menus)) {
              if (tempInfo.menus[0].bnr_exps_mthd_cd === kidsConfigs.BNR_EXPS_MTHD_CD.TEXT || isEmpty(tempInfo.menus[0].bnr_exps_mthd_cd)) {
                tempInfo.slideType = SlideType.KIDS_MENU_SLIDE;
              } else {
                tempInfo.slideType = SlideType.KIDS_CIRCLE_SLIDE;
              }
              menus.push(tempInfo);
            }
          }
          break;
        default:
          break;
      }
    });

    // CW ?????? ????????? ??????
    // const cwBlocks = menus.filter((block, index) => {
    //     if(!isEmpty(block.cwCallIdVal) && block.scnMthdCd === kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU) {
    //         delete menus[index];
    //         return true;
    //     }
    // });

    // CW ?????? ????????? ??????
    if (!isEmpty(cwBlocks)) {
      await Promise.all(
        cwBlocks.map(cwBlock => NXPG.request009({ menu_id: cwBlock.menuId, cw_call_id: cwBlock.cwCallIdVal }))
      )
        .then(cwContentList => {
          log('%c[cwContentList] ===>', 'color:#0000ff ', cwContentList);
          cwBlocks.forEach((cwBlock, index) => {
            cwBlock.blockList = [];
            cwBlock.blockList = cwContentList[0].grid[index].block.map((cwContent) => {
              return {
                brcastTseqNm: cwContent.brcast_tseq_nm,
                cacBroYn: cwContent.cacbro_yn,
                epsdId: cwContent.epsd_id,
                kidsYn: cwContent.kids_yn,
                methTypCd: cwContent.meta_typ_cd,
                imgH: cwContent.poster_filename_h,
                imgV: cwContent.poster_filename_v,
                rsluTypCd: cwContent.rslu_typ_cd,
                salePrc: cwContent.sale_prc,
                sortSeq: cwContent.sort_seq,
                srisId: cwContent.sris_id,
                synonTypCd: cwContent.synon_typ_cd,
                title: cwContent.title,
                traakId: cwContent.track_id,
                watLvlCd: cwContent.wat_lvl_cd,
                menuId: cwContent.menu_id
              }
            });
          });
          log('%c[cwBlock] ===>', 'color:#0000ff ', cwBlocks);

        }).catch(err => new Error(err))
    }

    // ????????? ??????
    await Promise.all(
      blocks.map(block => NXPG.request006({ menu_id: block.menuId }))
    )
      .then(contentList => {
        blocks.forEach((block, index) => {
          block.blockList = [];

          contentList = contentList.filter((data) => {
            return !isEmpty(data.contents);
          });

          block.blockList = contentList[index].contents.map((content) => {
            return {
              menuId: contentList[index].menu_id,
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
        });
      })
      .catch(err => new Error(err))

    // ?????? ??????
    const characterData = (await NXPG.request101({ transactionId: 'XPG101' })).menus;

    menus.map((block, index) => {
      block.blockList = [];
      if (!isEmpty(block.menus)) {
        block.blockList = block.menus.map((menus, menuIdx) => {
          let menuTempInfo = {
            shcurMenuId: menus.shcut_menu_id,
            bnrOffImgPath: '',
            chrtrZonSubImg: '',
            menuId: menus.menu_id,
            gnbTypCd: menus.gnb_typ_cd,
            scnMthdCd: menus.scn_mthd_cd,
            bnrExpsMthdCd: menus.bnr_exps_mthd_cd,
            blkTypCd: menus.blk_typ_cd,
            callTypCd: menus.call_typ_cd,
            callUrl: menus.call_url,
            menuNm: menus.menu_nm,
            limLvlYn: menus.lim_lvl_yn,
          }

          let totChrtrFoutImg = '';
          let chrtrZonSubImg = '';
          characterData.some(chrtr => {
            totChrtrFoutImg = chrtr.tot_chrtr_fout_img;
            chrtrZonSubImg = chrtr.chrtr_zon_sub_img;
            return isEqual(menus.shcut_menu_id, chrtr.menu_id) && isEqual(chrtr.blk_typ_cd, kidsConfigs.BLOCK.MENU_BLOCK_CD)
          });
          menuTempInfo.bnrOffImgPath = totChrtrFoutImg;
          menuTempInfo.chrtrZonSubImg = chrtrZonSubImg;

          return menuTempInfo;
        });
        delete block.menus;
      }
    });

    // ?????? ???????????? ????????? ???????????? ????????????
    blocks = blocks.concat(cwBlocks, menus);
    blocks.sort((a, b) => { return a.blockIndex < b.blockIndex ? -1 : a.blockIndex > b.blockIndex ? 1 : 0; });
    blocks = blocks.filter((block) => { return !isEmpty(block.blockList) });

    log('%c[BANNERINFO] ===>', 'color:#0000ff ', banners);
    log('%c[BLOCKINFO] ===>', 'color:#0000ff ', blocks);

    this.setState({
      bannerInfo: banners,
      blockInfo: blocks
    }, () => {
      const { historyInfo, bannerInfo } = this.state;

      if (!isEmpty(this.state.bannerInfo)) {
        if (historyInfo.isOnHistory) {
          if (historyInfo.focusKey === 'blocks') {
            const parentIndex = !isEmpty(bannerInfo) && historyInfo.parentIndex + 1;
            this.scrollTo(historyInfo.parentIndex, '');
            this.setFocus(parentIndex, historyInfo.childIndex);
            this.resetHistory();
          }
        } else {
          const before = !historyInfo.isJoined && !isEmpty(bannerInfo);
          // const after = this.isJoined && isEmpty(bannerInfo);
          const afterBanner = historyInfo.isJoined && !isEmpty(bannerInfo);

          before && this.setFocus('joinBtn');
          afterBanner && this.setFocus('blocks', 0);
        }
      } else {
        if (historyInfo.isOnHistory) {
          this.scrollTo(historyInfo.parentIndex, '');
          this.setFocus(historyInfo.parentIndex, historyInfo.childIndex);
          this.resetHistory();
        } else {
          this.setFocus(0, 0);
        }
      }

      this.addFocusList([
        { key: 'topButton', fm: null }
      ]);

      const joinBtn = new FM({
        id: 'topButton',
        type: 'ELEMENT',
        focusSelector: '.csFocus',
        row: 1,
        col: 1,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        onFocusKeyDown: this.onKeyDownBottomBtn,
      });
      this.setFm('topButton', joinBtn);
    });
  }

  /*********************************** FocusManager KeyEvent Methods ***********************************/
  // ?????? ???????????? ????????? ?????? (onInitFocus)
  handleOnInitFocus = (fmId, idx) => {
    log(`[KEY EVENT][onInitFocus] >>> [fmId : ${fmId}] [idx : ${idx}]`);
  }

  // ?????? ???????????? ????????? ?????? (onSlider)
  handleOnSlider = (idx, container) => {
    log('[KEY EVENT][onSlider]');
  }

  // ?????? ??????????????? ????????? ?????? (offSlider)
  handleOffSlider = () => {
    log('[KEY EVENT][offSlider]');
  }

  // ????????? ????????? ?????? ????????? ?????? (onFocus)
  handleOnFocusMove = (parentIdx, childIdx) => {
    log('[KEY EVENT][onFocus] parentIdx : ', parentIdx + ' childIdx : ', childIdx);
    // this.scrollTo(parentIdx);
  }

  // ????????? ??? ????????? ?????? (onKeyDown)
  handleOnKeyDown = (event, parentIdx, childIdx) => {
    log('[KEY EVENT][onKeyDown]');
    log(`event : ${event.keyCode} parnetIdx : ${parentIdx} childIdx : ${childIdx}`);
    log('[focus List]', this.focusList);

    let { blockInfo } = this.state;
    const param = { pathName: '', state: '' }
    switch (event.keyCode) {
      case keyCode.Keymap.UP:
        this.scrollTo(parentIdx, event);
        break;

      case keyCode.Keymap.DOWN:
        if (parentIdx === blockInfo.length - 1) return;
        this.scrollTo(parentIdx, event);
        break;

      case keyCode.Keymap.ENTER:
        blockInfo = blockInfo[parentIdx];
        const contentInfo = blockInfo.blockList[childIdx];

        if (blockInfo.blkTypCd === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
          param.pathName = constants.SYNOPSIS;
          param.state = {
            menu_id: contentInfo.menuId,
            sris_id: contentInfo.srisId,
            epsd_id: contentInfo.epsdId
          }
        } else if (blockInfo.blkTypCd === kidsConfigs.BLOCK.MENU_BLOCK_CD) {
          if (blockInfo.slideType === SlideType.KIDS_CW_SLIDE) {
            param.pathName = constants.SYNOPSIS;
            param.state = {
              menu_id: blockInfo.menuId,
              sris_id: contentInfo.srisId,
              epsd_id: contentInfo.epsdId
            }
          } else {
            if (blockInfo.slideType === SlideType.KIDS_CIRCLE_SLIDE) {
              param.pathName = constants.KIDS_SUBCHARACTER;
              param.state = {
                menu_id: contentInfo.shcurMenuId,
                blk_typ_cd: contentInfo.blkTypCd,
                call_typ_cd: contentInfo.callTypCd,
                call_url: contentInfo.callUrl,
                chrtr_zon_sub_img: contentInfo.chrtrZonSubImg
              }

            } else {
              // ?????? ?????? ??????
              if (contentInfo.blkTypCd === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
                param.pathName = constants.KIDS_PLAYLIST;
              } else {
                param.pathName = constants.KIDS_GENRE_MENU_BLOCK;
              }
              param.state = {
                menu_id: contentInfo.menuId,
                menu_nm: contentInfo.menuNm
              }
            }
          }
        }

        const { historyInfo } = this.state;
        this.setHistory({
          menuId: historyInfo.menuId,
          prevTitle: historyInfo.prevTitle,
          isJoined: historyInfo.isJoined,
          focusKey: 'blocks',
          parentIndex: parentIdx,
          childIndex: childIdx,
          isOnHistory: !historyInfo.isOnHistory
        });
        this.movePage(param.pathName, param.state);
        break;
      default:
        break;
    }
  }

  onKeyDownBottomBtn = (event) => {
    if (event.keyCode === keyCode.Keymap.ENTER) {
      this.setState({
        scrollInfo: update(this.state.scrollInfo, {
          transform: { $set: `translate(0px, ${0}px)` }
        })
      }, () => {
        if (!isEmpty(this.state.bannerInfo)) {
          const { bannerInfo, historyInfo } = this.state;
          const before = !historyInfo.isJoined && !isEmpty(bannerInfo);
          // const after = this.isJoined && isEmpty(bannerInfo);
          const afterBanner = historyInfo.isJoined && !isEmpty(bannerInfo);

          before && this.setFocus('joinBtn');
          afterBanner && this.setFocus(1, 0);
        } else {
          this.setFocus(0, 0);
        }
      });
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

    log('%c[HISTORY DATA] ===>', 'color:#0000ff ', tempHistory);
    this.setState({ historyInfo: tempHistory });
  }

  // Get ????????????
  getHistory = (info) => {
    return this.state.historyInfo
  }

  // Reset ????????????
  resetHistory = () => {
    this.setState({
      historyInfo: {
        menuId: null,
        prevTitle: null,
        isJoined: this.state.historyInfo.isJoined,
        focusKey: null,
        parentIndex: null,
        childIndex: null,
        isOnHistory: false
      }
    });
  }

  /*********************************** Etc Methods ***********************************/
  handleOnSelect = () => {
    const param = {
      pathName: '',
      staet: ''
    }
    this.props.movePage(param.pathName, param.state);
  }

  scrollTo = (idx, event, focusKey = null, margin = null) => {
    console.log('focusList', this.focusList);
    let listArr = Array.prototype.slice.call(document.querySelectorAll('.kidsMonthlyDetail .contentGroup'));
    let topValue = 0;

    // ?????? ?????? ????????? ??? ??????
    if(!isEmpty(focusKey) && focusKey === 'topButton') {
      console.log('[listArr] : ', listArr);
      
    // ?????? ?????? ????????? ??? ??????  
    } else if(!isEmpty(focusKey) && typeof focusKey === 'object') {
      let anchor = focusKey;
      const SEARCH_MARGIN = 422;
      topValue = anchor.offsetTop - SEARCH_MARGIN;

    // ?????? ???????????? ??????
    } else {
      const { blockInfo, bannerInfo, historyInfo } = this.state;
      if (blockInfo.length <= 2 && isEmpty(bannerInfo)) return;

      const PADDING_VAL = 74;

      if (!isEmpty(event) && !historyInfo.isOnHistory) {
        listArr.shift();

        switch (event.keyCode) {
          case keyCode.Keymap.UP:
            if (idx === 0) return;
            topValue = idx === 1 ? 0 : listArr[idx - 1].offsetTop;
            break;
          case keyCode.Keymap.DOWN:
            if (idx === listArr.length - 1) return;
            topValue = idx === 0 ? listArr[idx + 1].offsetTop : listArr[idx + 1].offsetTop - PADDING_VAL;
            break;
          default:
            break;
        }
      } else {
        if (listArr[idx] && listArr[idx].offsetTop) {
          idx !== 0 && listArr.shift();
          topValue = idx === 1 ? listArr[idx].offsetTop : listArr[idx].offsetTop - PADDING_VAL;
        } else {
          topValue = idx.offsetTop - idx.clientHeight;
          // topValue = idx.offsetTop - (window.innerHeight - idx.clientHeight);
        }
      }
    }
    this.setState({
      scrollInfo: update(this.state.scrollInfo, {
        transform: { $set: `translate(0px, ${-topValue}px)` }
      })
    });
  }

  scrollToSearch = (anchor, margin) => {
    this.scrollTo(null, null, anchor, margin);
  }

  injectRef = (name, ref) => {
    this[name] = ref;
  }

  focusPrev() {
    let focusIndex = this.focusIndex;
    focusIndex--;
    if (focusIndex < 0) {
      focusIndex = 0
    }
    this.focusIndex = focusIndex;
    this.setFocus(this.focusIndex);
  }

  /*********************************** Render ***********************************/
  render() {
    let { blockInfo, bannerInfo, scrollInfo, historyInfo } = this.state;
    const bShow = !isEmpty(blockInfo) && (blockInfo && blockInfo.length !== 0);

    const before = !historyInfo.isJoined && !isEmpty(bannerInfo);
    const after = historyInfo.isJoined && isEmpty(bannerInfo);
    const afterBanner = historyInfo.isJoined && !isEmpty(bannerInfo);

    log(`before : ${before} after : ${after} afterBanner : ${afterBanner}`);

    // [HISTORY] ??????????????? ??????, Focus Index ????????????
    let getHistoryData = {};
    let childIndex = null;
    if (historyInfo.isOnHistory) {
      getHistoryData = this.getHistory();
      childIndex = getHistoryData.isOnHistory ? getHistoryData.childIndex : 0;
    }

    return (
      <div className="wrap">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="kidsMonthlyDetail scrollWrap" style={scrollInfo}>
          {
            before &&
            <div className="contentGroup">
              <KidsDetailTop
                banner={bannerInfo[0]}
                setHistory={this.setHistory}
                setFm={this.setFm} />
            </div>
          }
          {
            after &&
            <KidsDetailAfterTop
              prevTitle={historyInfo.prevTitle} />
          }
          {
            afterBanner &&
            <KidsDetailAfterBanner
              bannerInfo={bannerInfo}
              historyInfo={historyInfo}
              setHistory={this.setHistory}
              movePage={this.movePage}
              setFm={this.setFm} />
          }
          {
            blockInfo.map((block, index) => {
              return <G2SliderDefault
                id={'blocks'}
                idx={index}
                key={index}
                title={block.menuNm}

                bShow={bShow}
                rotate={true}
                slideType={block.slideType}

                setFm={this.setFm}
                setFocus={this.setFocus}
                onInitFocus={this.handleOnInitFocus}
                onSlider={this.handleOnSlider}
                offSlider={this.handleOffSlider}
                onFocus={this.handleOnFocusMove}
                onKeyDown={this.handleOnKeyDown}
                onScroll={this.scrollTo}
                focusIndex={childIndex}>
                {
                  block.blockList.map((content, cntIdx) => {
                    switch (block.slideType) {
                      case SlideType.KIDS_CW_SLIDE:
                        return (<G2SlideCwVOD
                          index={cntIdx}
                          lastIndex={block.blockList.length - 1}
                          key={cntIdx}
                          content={content} />)

                      case SlideType.KIDS_CONTENT_HOR_SLIDE:
                        return (<G2SlideHorizantalVOD
                          index={cntIdx}
                          lastIndex={block.blockList.length - 1}
                          key={cntIdx}
                          content={content} />)

                      case SlideType.KIDS_CONTENT_VER_SLIDE:
                        return (<G2SlideVerticalVOD
                          index={cntIdx}
                          lastIndex={block.blockList.length - 1}
                          key={cntIdx}
                          content={content} />)

                      case SlideType.KIDS_MENU_SLIDE:
                        return (<G2SlideMenuVOD
                          index={cntIdx}
                          lastIndex={block.blockList.length - 1}
                          key={cntIdx}
                          content={content} />)

                      case SlideType.KIDS_CIRCLE_SLIDE:
                        return (<G2SlideCircle
                          index={cntIdx}
                          lastIndex={block.blockList.length - 1}
                          key={cntIdx}
                          content={content} />)
                      default:
                        return (<div key={cntIdx}></div>)
                    }
                  })
                }
              </G2SliderDefault>
            })
          }

          <div className="contentGroup" ref={r => this.injectRef('topButton', r)} style={{ 'display': 'block' }}>
            <div className="btnTopWrap">
              <span className="csFocus btnTop" id="topButton" >
                <span>??? ??????</span>
              </span>
            </div>
          </div>
          <SearchContents
            // saveFocus={this.saveFocus}
            setFm={this.setFm}
            addFocusList={this.addFocusList}
            setFocus={this.setFocus}
            scrollTo={this.scrollToSearch}
            focusPrev={this.focusPrev}
            movePage={this.movePage}
          />
        </div>
      </div>
    )
  }
}

export default KidsMonthlyDetail;


/********************************* BigBanner Area Component ****************************************/
class KidsDetailTop extends React.Component {

  render() {
    const { banner } = this.props;
    const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.MONTHLY_BANNER_BIG);
    const bannerImg = isEqual(banner.bnrDetTypCd, kidsConfigs.BANNER_DET_TYPE.EXTEND) ? banner.extImgPath : banner.bssImgPath;
    //const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/default/banner_big_default.png';

    return (
      <div className="kidDetailTop">
        <div className="detailBg">
          {/* H/E ????????? ?????? ??? ????????? ???????????? ??????????????? ???????????? */}
          {/* <img src={imgUrl + bannerImg} alt="" /> */}
          <img src={imgUrl + bannerImg} alt="" />
        </div>
        <div className="subText">
          <span id="joinBtn" className="btnjoinWrap">
            <div className="csFocus">
              <p className="selectType">????????? ??????</p>
              <p className="price"><strong>{Number(banner.prdPrcVat).toLocaleString('ko-KR')}</strong>??? / ???</p>
            </div>
          </span>
          <p className="surtaxText">????????? ??????</p>
        </div>
      </div>
    );
  }

  onKeyDownJoinBtn = (event) => {
    if (event.keyCode === keyCode.Keymap.ENTER) {
      const { banner } = this.props;
      CTSInfo.purchasePPMByHome({ pid: banner.prdPrcId }, (data) => {
        blue('?????? callback:', data, this);

        if (data && data.result === '0000') {
          this.props.setHistory({ isJoined: true });
        }
      });
    }
  }

  componentDidMount() {
    const joinBtn = new FM({
      id: 'joinBtn',
      type: 'ELEMENT',
      focusSelector: '.csFocus',
      row: 1,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 0,
      onFocusKeyDown: this.onKeyDownJoinBtn,
    });
    this.props.setFm('joinBtn', joinBtn);
  }
}

class KidsDetailAfterTop extends React.Component {

  render() {
    return (
      <div className="kidDetailAfterTop">
        <div className="header">
          <span className="title">?????????></span>
          <span className="current">{this.props.prevTitle}</span>
        </div>
      </div>
    );
  }

  componentDidMount() { }
}

class KidsDetailAfterBanner extends React.Component {

  // ????????? ??? ????????? ?????? (onKeyDown)
  handleOnKeyDown = (event, childIdx) => {
    log('[KEY EVENT][onKeyDown]');
    log(`event : ${event.keyCode} childIdx : ${childIdx}`);
    log('[focus List]', this.focusList);

    let { bannerInfo, historyInfo } = this.props;
    const curBanner = bannerInfo[childIdx].callUrl.split('/');
    const gnbTyCd = curBanner[0];
    const menuId = curBanner[1];

    this.props.setHistory({
      menuId: historyInfo.menuId,
      prevTitle: historyInfo.prevTitle,
      isJoined: historyInfo.isJoined,
      focusKey: 'banner',
      parentIndex: null,
      childIndex: childIdx,
      isOnHistory: !historyInfo.isOnHistory
    });

    this.props.movePage(Utils.getGnbTypeCodeToPageMove(gnbTyCd, menuId), { menuId, gnbTyCd });
  }

  render() {
    const { bannerInfo } = this.props;
    const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.MONTHLY_BANNER_SMALL);
    // const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.MONTHLY_BANNER_BIG);
    // const bannerImg = isEqual(banner.bnrDetTypCd, kidsConfigs.BANNER_DET_TYPE.EXTEND) ? banner.extImgPath : banner.bssImgPath;
    return (
      <div className="kidDetailAfterTopBanner">
        <G2SliderKidsBanner
          id="banner"
          autoPlay={true}
          duration={200}
          onKeyDown={this.handleOnKeyDown}
          setFm={this.props.setFm}
          onFocusSlider={this.onFocusSlider}>
          {
            bannerInfo.map((banner, idx) => {
              // let bannerImg = banner.bnrDetTypCd === kidsConfigs.BANNER_DET_TYPE.EXTEND ? imgUrl + banner.extImgPath : imgUrl + banner.bssImgPath;
              let bannerImg = imgUrl + banner.bssImgPath;
              let bannerLink = banner.callUrl;
              return <G2SlideKidsBanner key={idx} idx={idx} bannerInfo={bannerInfo} imgURL={bannerImg} link={bannerLink} />
            })
          }
        </G2SliderKidsBanner>;
      </div>
    )
  }
}
