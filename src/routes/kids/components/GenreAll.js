import React, { Component } from 'react';
import update from 'react-addons-update';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { NXPG } from 'Network';
import constants from 'Config/constants';
import { SearchContents } from 'Module/Search';
import keyCode from 'Supporters/keyCodes';

import { kidsConfigs } from './../config/kids-config';
import { KidsMenu } from './';
import { SlideType, G2SliderDefault } from './module/KidsSlider';
import {
  G2SlideHorizantalVOD,
  G2SlideVerticalVOD,
  G2SlideCwVOD,
  G2SlideMenuVOD,
  G2SlideCircle,
  G2SlideBannerC,
  G2SlideBannerB,
  G2SlideBannerA
} from './module/KidsSlider/G2SlideGenreMeneAll'
import FM from 'Supporters/navi';

import 'Css/kids/genremenu/GenreMenuAll.css';
import Utils from 'Util/utils';
import Core from 'Supporters/core';

// const NXPG003 = createDummyPromise(BLOCK_DATA);
// const NXPG006 = createDummyPromise(CONTENT_DATA);

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[GenreAll] ' + msg, ...args);
} : () => { };

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[GenreAll] ' + msg, 'color: white; background: blue', ...args);
} : () => { };

class GenreAll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalBlockCnt: 0,
      blockCnt: 0,
      blockInfo: [],
      scrollInfo: {
        transform: 'translate(0px, 0px)',
        height: 1690
      },
      pageInfo: {}
    };

    this.menuId = '';
  }

  /*********************************** Component Lifecycle Methods ***********************************/
  componentWillReceiveProps(nextProps) {
    const { menuId: prev } = this.props;
    const { menuId: cur } = nextProps;
    if (prev === '' && cur !== '') {
      blue('[componentWillReceiveProps()] nextProps.menuId', cur);
      this.menuId = cur;
      this.updateInfo(nextProps);
    }
  }

  componentDidMount() {
    const { menuId } = this.props;
    const { blockInfo } = this.state;
    if (menuId !== '') {
      blue('[componentDidMount()] props.menuId:', menuId);
      this.menuId = menuId;
      this.handleRequestAPI();
    }
  }

  componentDidUpdate(prevProps, prevState) {
  }

  /*********************************** H/E Request Methods ***********************************/
  handleRequestAPI = () => {
    this.handleRequsetBlockInfo();
  }

  handleRequsetBlockInfo = async () => {
    const result = await NXPG.request003({ menu_id: this.menuId });
    log('NXPG-003:', result);

    // 블록 정보 가져오기
    let resopnseBlock = result.blocks ? result.blocks : [];
    let blocks = [], menus = [], events = [], cwBlocks = [];

    log('%c[responseBlock] ===>', 'color:#0000ff ', resopnseBlock);

    resopnseBlock.forEach((block, index) => {
      const tempInfo = {
        menuId: block.menu_id,
        menuNm: block.menu_nm,
        pstExpsTypCd: block.pst_exps_typ_cd, // 포스터 노출 유형 코드
        blkTypCd: block.blk_typ_cd, // 블럭 유형 코드
        expsMthdCd: block.exps_mthd_cd, // 배너 노출 방식 코드
        gnbTypCd: block.gnb_typ_cd, // 상영 방식 코드
        expsRsluCd: block.exps_rslu_cd, // 노출 해당 도 코드 (10: 1단, 20: 2단, 30: 3단)

        cwCallIdVal: block.cw_call_id_val,
        scnMthdCd: block.scn_mthd_cd,

        limLvlYn: block.lim_lvl_yn,
        menus: block.menus,
        blockIndex: index,
      }

      // H/E 데이터 오류로 임시 코드 적용 (삭제 예정)
      // if(!isEmpty(tempInfo.cwCallIdVal) && tempInfo.scnMthdCd === kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU) {
      //     if(tempInfo.blkTypCd === '20') {
      //         tempInfo.blkTypCd = '30';
      //     }
      // }

      // 블록 타입을 정한다.
      switch (tempInfo.blkTypCd) {
        case kidsConfigs.BLOCK.CONTENTS_BLOCK_CD: // 콘텐츠 블록
          // 슬라이드 타입 구분 ( CW, 가로, 세로 )
          if (isEqual(tempInfo.scnMthdCd, kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU)) {
            tempInfo.slideType = SlideType.KIDS_CW_SLIDE;
            cwBlocks.push(tempInfo);
          } else {
            tempInfo.slideType = tempInfo.pstExpsTypCd === kidsConfigs.POSTER_TYPE.H ?
              SlideType.KIDS_CONTENT_HOR_SLIDE : SlideType.KIDS_CONTENT_VER_SLIDE;
            blocks.push(tempInfo);
          }
          break;
        case kidsConfigs.BLOCK.MENU_BLOCK_CD: // 메뉴 블록
          // 슬라이드 타입 구분 ( CW ) [ BTVQ-464: CW는 블록 타입 코드가 20, 30 모두 포함으로 변경]
          if (isEqual(tempInfo.scnMthdCd, kidsConfigs.SCN_MTHD_CD.CW_RECMD_MENU)) {
            tempInfo.slideType = SlideType.KIDS_CW_SLIDE;
            cwBlocks.push(tempInfo);
          } else {
            if (!isEmpty(tempInfo.menus)) {
              if (tempInfo.menus[0].bnr_exps_mthd_cd === kidsConfigs.BNR_EXPS_MTHD_CD.TEXT) {
                tempInfo.slideType = SlideType.KIDS_MENU_SLIDE;
              } else {
                tempInfo.slideType = SlideType.KIDS_CIRCLE_SLIDE;
              }
              menus.push(tempInfo);
            }
          }
          break;
        case kidsConfigs.BLOCK.EVENT_BLOCK_CD: // 이벤트 블록
          if (tempInfo.expsRsluCd === kidsConfigs.EXPS_RSLU_CD.BANNER_C) {
            tempInfo.slideType = SlideType.KIDS_BANNER_SLIDE_C
          } else if (tempInfo.expsRsluCd === kidsConfigs.EXPS_RSLU_CD.BANNER_B) {
            tempInfo.slideType = SlideType.KIDS_BANNER_SLIDE_B
          } else {
            tempInfo.slideType = SlideType.KIDS_BANNER_SLIDE_A
          }
          events.push(tempInfo);
          break;
        default:
          break;
      }
    });

    // CW 연동 콘텐츠 정보
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
                watLvlCd: cwContent.wat_lvl_cd
              }
            });
          });
          log('%c[cwBlock] ===>', 'color:#0000ff ', cwBlocks);

        }).catch(err => new Error(err))
    }

    // 콘텐츠 정보
    await Promise.all(
      blocks.map(block => NXPG.request006({ menu_id: block.menuId, page_no: 1, page_cnt: 10 }))
    ).then(contentList => {
      blocks.forEach((block, index) => {
        block.blockList = [];

        contentList = contentList.filter((data) => {
          return !isEmpty(data.contents);
        });

        block.blockList = contentList[index].contents.map((content) => {
          return {
            menuId: blocks[index].menuId,
            srisId: content.sris_id,
            epsdId: content.epsd_id,

            salePrc: content.sale_prc,
            title: content.title,
            badgeTypNm: content.badge_typ_nm, // 뱃지 유형명
            brcastTseqNm: content.brcast_tseq_nm, // 방송 회차
            imgV: content.poster_filename_v,
            imgH: content.poster_filename_h,
            userBadgeImgPath: content.user_badge_img_path, // 사용자 등록 뱃지 이미지(하단 노출 이벤트 이미지)
            userBadgeWdtImgPath: content.user_badge_wdt_img_path, // 사용자 등록 뱃지 가로 이미지(하단 노출 이벤트 이미지)
            basBadgeImgPath: content.bas_badge_img_path, // 기본 뱃지 이미지(상단 노출 뱃지)

            synonTypCd: content.synon_typ_cd, // 진입 시놉시스 유형 코드
            adltLvlCd: content.adlt_lvl_cd, // 성인 등급 코드
            watLvlCd: content.wat_lvl_cd, // 시청 등급 코드
            metaTypCd: content.meta_typ_cd, // 메타 유형 코드

            sortSeq: content.sort_seq, // 시리즈 정렬 순번
            svcfrDt: content.svc_fr_dt, // 서비스 시작일
            svcToDt: content.svc_to_dt, // 서비스 종료일
            iconExpsFrDt: content.icon_exps_fr_dt, //뱃지(이벤트) 노출 시작 일자
            iconExpsToDt: content.icon_exps_to_dt, //뱃지(이벤트) 노출 종료 일자
            epsdDistFirSvcDt: content.epsd_dist_fir_svc_dt, // 에피소드 동기화 승인일
            srisDistFirSvcDt: content.sris_dist_fir_svc_dt, // 시리즈 동기화 승인일

            rsluTypCd: content.rslu_typ_cd, // 상품 해상도
            kidsYn: content.kids_yn, // 키즈 여부
            cacbroYn: content.cacbro_yn, // 결방 여부
            iImgCd: content.i_img_cd
          };
        });
      });
    }).catch(err => new Error(err));

    // 메뉴 정보
    // const characterData = (await NXPG.request101({ transactionId : 'XPG101' })).menus;
    menus.forEach((block, index) => {
      block.blockList = [];
      block.blockList = block.menus.map((menus, menuIdx) => {
        return {
          // bnrOffImgPath: characterData.filter((chrtr) => { 
          //     return isEqual(menus.shcut_menu_id, chrtr.menu_id) && isEqual(chrtr.blk_typ_cd, kidsConfigs.BLOCK.MENU_BLOCK_CD)
          // }).tot_chrtr_fout_img,
          // chrtrZonSubImg: characterData.filter((chrtr) => { 
          //     return isEqual(menus.shcut_menu_id, chrtr.menu_id) && isEqual(chrtr.blk_typ_cd, kidsConfigs.BLOCK.MENU_BLOCK_CD)
          // }).chrtr_zon_sub_img,
          bnrOnImgPath: menus.bnr_on_img_path,
          bnrOffImgPath: menus.bnr_off_img_path,
          bnrDetTypcd: menus.bnr_det_typ_cd,
          bnrExpsMthdCd: menus.bnr_exps_mthd_cd,
          blkTypCd: menus.blk_typ_cd,
          callTypCd: menus.call_typ_cd,
          callUrl: menus.call_url,
          gnbTypCd: menus.gnb_typ_cd,
          limLvlYn: menus.lim_lvl_yn,
          menuId: menus.menu_id,
          menuNm: menus.menu_nm,
          shcutMenuId: menus.shcut_menu_id,
        }
      });
      delete block.menus;
    });

    // 이벤트 정보
    await Promise.all(
      events.map(event => NXPG.request007({ menu_id: event.menuId }))
    )
      .then(eventList => {
        events.forEach((event, index) => {
          event.blockList = [];

          eventList = eventList.filter((data) => {
            return !isEmpty(data.banners);
          });
          event.blockList = eventList[index].banners.map((banner) => {
            return {
              menuId: banner.menu_id,
              menuNm: banner.menu_nm,

              shcutSrisId: banner.shcut_sris_id,
              shcutEpsdId: banner.shcut_epsd_id,

              salePrc: banner.sale_prc, // 판매 가격
              salePrcVat: banner.sale_prc_vat, // 판매 가격 부가세 포함 
              prdPrc: banner.prd_prc, // 상품 가격
              prdPrcVat: banner.prd_prc_vat, // 상품 가격 부가세 포함
              prdPrcId: banner.prd_prc_id, // 상품 ID

              bnrOnImgPath: banner.bnr_on_img_path,
              bnrOffImgPath: banner.bnr_off_img_path,

              gnbTypCd: banner.gnb_typ_cd, // 상영 방식 코드
              blkTypCd: banner.blk_typ_cd, // 블록 유형 코드
              bnrExpsMthdCd: banner.bnr_exps_mthd_cd, // 배너 노출 방식 코드 (10 : 텍스트, 20: 이미지)
              synopTypeCd: banner.synon_typ_cd,
              callTypeCd: banner.call_typ_cd,

              callUrl: banner.call_url,
              vasId: banner.vas_id,
              vasSvcId: banner.vas_svc_id
            }
          });
        });
      })
      .catch(err => new Error(err))


    blocks = blocks.concat(cwBlocks, menus, events);
    blocks.sort((a, b) => {
      return a.blockIndex < b.blockIndex ? -1 : a.blockIndex > b.blockIndex ? 1 : 0;
    })

    blocks = blocks.filter((block) => {
      return !isEmpty(block.blockList)
    });

    this.setState({
      blockInfo: blocks
    }, () => {
      const { getHistory/*, resetHistory, setFocus*/ } = this.props;
      const historyInfo = getHistory();

      if (historyInfo.isOnHistory) {
        this.scrollTo(historyInfo.parentIndex, '');
      } else {
        // setFocus(historyInfo.parentIndex + 2, historyInfo.childIndex);
      }
    });
  }
  /*********************************** FocusManager KeyEvent Methods ***********************************/

  // 블록 포커스셋 이벤트 함수 (onInitFocus)
  handleOnInitFocus = (fmId, idx) => {
    log(`[handleOnInitFocus()] >>> [fmId : ${fmId}] [idx : ${idx}]`);
  }

  // 블록 포커스온 이벤트 함수 (onSlider)
  handleOnSlider = (idx, container) => {
    log('[handleOnSlider()] parentIdx:', idx);

    const { blockInfo } = this.state;
    //const listArr = Array.prototype.slice.call(document.querySelectorAll('.genreMenuAllList.scrollWrap .contentGroup'));

    if (blockInfo.length === idx + 1) {
      this.scrollTo(idx, '');
    }
  }

  // 블록 포커스오프 이벤트 함수 (offSlider)
  handleOffSlider = (idx, dir) => {
    log(`[handleOffSlider()] >>> [parentIdx : ${idx}] [direction : ${dir}]`);
    const { setFocus } = this.props;
    if (typeof setFocus === 'function') {
      if (idx === 0 && dir === "UP") {
        setFocus(1, 1);
      }
    }
  }

  // 콘텐츠 포커스 이동 이벤트 함수 (onFocus)
  handleOnFocusMove = (childIdx) => {
    log('[handleOnFocusMove()] childIdx:', childIdx);
  }

  // 콘텐츠 키 이벤트 함수 (onKeyDown)
  handleOnKeyDown = (event, parentIdx, childIdx) => {
    blue(`[handleOnKeyDown()] >>> [parentIdx : ${parentIdx}] [childIdx : ${childIdx}]`);
    let { blockInfo } = this.state;
    let param = { pathName: '', state: '' }

    switch (event.keyCode) {
      case keyCode.Keymap.UP:
        //if (parentIdx === 0) return;
        parentIdx--;
        this.scrollTo(parentIdx, event);
        break;
      case keyCode.Keymap.DOWN:
        if (parentIdx === blockInfo.length - 1) return;

        parentIdx++;
        this.scrollTo(parentIdx, event);
        break;
      case keyCode.Keymap.ENTER:
        blockInfo = blockInfo[parentIdx];
        const contentInfo = blockInfo.blockList[childIdx];

        if (blockInfo.blkTypCd === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
          param.pathName = constants.SYNOPSIS;
          param.state = {
            menu_id: blockInfo.menuId,
            sris_id: contentInfo.srisId,
            epsd_id: contentInfo.epsdId
          }
          param.wat_lvl_cd = contentInfo.watLvlCd;
          this.props.setHistory({
            comptName: 'CharacterHome',
            focusKey: 'contents',
            parentIndex: parentIdx,
            childIndex: childIdx,
            isInitKidsHome: false
          });
          Utils.movePageAfterCheckLevel(param.pathName, param.state, param.wat_lvl_cd);
        
        } else if (blockInfo.blkTypCd === kidsConfigs.BLOCK.MENU_BLOCK_CD) {
          if (blockInfo.slideType === SlideType.KIDS_CW_SLIDE) {
            param.pathName = constants.SYNOPSIS;
            param.state = {
              menu_id: blockInfo.menuId,
              sris_id: contentInfo.srisId,
              epsd_id: contentInfo.epsdId
            }
            param.wat_lvl_cd = contentInfo.watLvlCd;
            this.props.setHistory({
              comptName: 'CharacterHome',
              focusKey: 'contents',
              parentIndex: parentIdx,
              childIndex: childIdx,
              isInitKidsHome: false
            });
            Utils.movePageAfterCheckLevel(param.pathName, param.state, param.wat_lvl_cd);
          } else {
            if (blockInfo.slideType === SlideType.KIDS_CIRCLE_SLIDE) {
              param.pathName = constants.KIDS_SUBCHARACTER;
              param.state = {
                menu_id: contentInfo.shcutMenuId,
                blk_typ_cd: contentInfo.blkTypCd,
                call_typ_cd: contentInfo.callTypCd,
                call_url: contentInfo.callUrl,
                chrtr_zon_sub_img: contentInfo.chrtrZonSubImg
              }
            } else {
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
          this.props.setHistory({
            comptName: 'CharacterHome',
            focusKey: 'contents',
            parentIndex: parentIdx,
            childIndex: childIdx,
            isInitKidsHome: false
          });
  
          this.props.onMovePage(param.pathName, param.state);

        } else if (blockInfo.blkTypCd === kidsConfigs.BLOCK.EVENT_BLOCK_CD) {
          const { callTypeCd, callUrl, shcutSrisId, shcutEpsdId, synonTypCd, vasId, vasSvcId, isDetailedGenreHome = false} = contentInfo;

          this.props.setHistory({
            comptName: 'CharacterHome',
            focusKey: 'contents',
            parentIndex: parentIdx,
            childIndex: childIdx,
            isInitKidsHome: false
          });
          if (isEmpty(callUrl.trim())) {
            Core.inst().showToast('H/E: call_url 필드가 없음.');
          } else {
            Utils.moveToCallTypeCode({
                callTypeCode: callTypeCd,
                callUrl,
                shortcutSeriesId: shcutSrisId,
                shortcutEpisodeId: shcutEpsdId,
                synopsisTypeCode: synonTypCd,
                vasId,
                vasServiceId: vasSvcId
            }, isDetailedGenreHome, true);
          }
        }
        break;
      default:
        break;
    }
  }

  /*********************************** Etc Methods ***********************************/
  scrollTo = (idx, event) => {
    // 스크롤 예외처리
    const { blockInfo, scrollInfo } = this.state;
    const { getHistory } = this.props;

    blue('[scrollTo()] idx, event:', idx, event);

    const historyInfo = getHistory();
    //const listArr = Array.prototype.slice.call(document.querySelectorAll('.genreMenuAllList.scrollWrap .contentGroup'));
    const listArr = Array.prototype.slice.call(document.querySelectorAll('.genreMenuAllWrap.scrollWrap .contentGroup'));

    //log('listArr:', listArr);

    // listArr.shift();
    //const PADDING_VAL = 0;
    let topValue = 0;

    if (blockInfo.length <= 1 && isEmpty(blockInfo)) return;

    if (!isEmpty(event) && !historyInfo.isOnHistory) {
      switch (event.keyCode) {
        case keyCode.Keymap.UP:
          if (idx === -1) {
            topValue = 0;
          } else {
            topValue = listArr[idx].offsetTop;
          }

          break;
        case keyCode.Keymap.DOWN:
          topValue = listArr[idx].offsetTop;
          break;
        default:
          break;
      }
    } else {
      if (idx === 0) {
        topValue = listArr[idx].offsetTop;
      } else {
        if (listArr[idx] && listArr[idx].offsetTop) {
          topValue = listArr[idx].offsetTop;
        } else {
          //let posY = -1 * Number(scrollInfo.transform.replace(/translate\(|\)|\s|px/gi, '').split(',')[1]);
          topValue = idx.offsetTop - (window.innerHeight - idx.clientHeight);
          // log('%c event', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', posY);
          // log('%c topValue', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', topValue);
        }
      }
    }

    this.setState({
      scrollInfo: update(scrollInfo, {
        transform: { $set: `translate(0px, ${-topValue}px)` }
      })
    }, () => {
      const { getHistory, resetHistory, setFocus } = this.props;
      const historyInfo = getHistory();

      if (historyInfo.isOnHistory) {
        this.scrollTo(historyInfo.parentIndex, '');
        setFocus(historyInfo.parentIndex + 2, historyInfo.childIndex);
        resetHistory();
      }
    });
  }

  /*********************************** Render ***********************************/
  //<div className="genreMenuAllWrap scrollWrap" style={{ height: 1690 }}>
  //<div className="genreMenuAllList" style={scrollInfo}>
  render() {
    console.log('[GENRE ALL RENDER]');
    let { blockInfo, scrollInfo } = this.state;
    const { setFm, setFocus, getHistory, menuInfo, menuIndex, showMenu, getFocusInfo, getCurrentFocusInfo, onFocus, onSelect, addFocusList, focusPrev, onMovePage } = this.props;
    blue('[render()]');

    const bShow = !isEmpty(blockInfo) && (blockInfo && blockInfo.length !== 0);

    // [HISTORY] 히스토리인 경우, Focus Index 가져오기
    const getHistoryData = this.props.getHistory();
    this.childIndex = getHistoryData.isOnHistory ? getHistoryData.childIndex : 0;

    return (
      <div className="genreMenuAllWrap scrollWrap" style={scrollInfo}>
        <KidsMenu
          id="kidsMenu"
          menus={menuInfo}
          menuIndex={menuIndex}
          showMenu={showMenu}
          setFm={setFm}
          setFocus={setFocus}
          getHistory={getHistory}
          getFocusInfo={getFocusInfo}
          getCurrentFocusInfo={getCurrentFocusInfo}
          onFocus={onFocus}
          onSelect={onSelect}
        />
        <div className="genreMenuAllList">
          {
            bShow ?
              blockInfo.map((block, index) => {
                return <G2SliderDefault
                  id={'contents'}
                  idx={index}
                  key={index}
                  title={block.menuNm}

                  rotate={true}
                  slideType={block.slideType}

                  setFm={setFm}
                  setFocus={setFocus}
                  onInitFocus={this.handleOnInitFocus}
                  onSlider={this.handleOnSlider}
                  offSlider={this.handleOffSlider}
                  onFocus={this.handleOnFocusMove}
                  onKeyDown={this.handleOnKeyDown}
                  focusIndex={this.childIndex}>
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

                        case SlideType.KIDS_BANNER_SLIDE_C:
                          return (<G2SlideBannerC
                            index={cntIdx}
                            lastIndex={block.blockList.length - 1}
                            key={cntIdx}
                            content={content} />)

                        case SlideType.KIDS_BANNER_SLIDE_B:
                          return (<G2SlideBannerB
                            index={cntIdx}
                            lastIndex={block.blockList.length - 1}
                            key={cntIdx}
                            content={content} />)

                        case SlideType.KIDS_BANNER_SLIDE_A:
                          return (<G2SlideBannerA
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
              }) : null
          }
          {
            bShow ?
              <div className="contentGroup" ref={r => this.props.injectRef('topButton', r)} style={{ 'display': 'block' }}>
                <div className="btnTopWrap">
                  <span className="csFocus btnTop" id="topButton" >
                    <span>맨 위로</span>
                  </span>
                </div>
              </div> : null
          }
          {
            bShow ?
              <SearchContents
                // saveFocus={this.saveFocus}
                setFm={setFm}
                addFocusList={addFocusList}
                setFocus={setFocus}
                focusPrev={focusPrev}
                scrollTo={this.scrollTo}
                movePage={onMovePage}
              /> : null
          }
        </div>
      </div>
    )
  }
}

export default GenreAll;
