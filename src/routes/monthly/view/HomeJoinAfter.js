// external modules
import React from 'react';

import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';
import invoke from 'lodash/invoke';
import map from 'lodash/map';

// common
import appConfig from 'Config/app-config';
import constants from 'Config/constants';
import { SlideType, G2NaviBannerSlider, G2NaviBanner, G2NaviSlider, G2MonthlySlider } from 'Module/G2Slider';
import { SearchContents } from 'Module/Search';
import { NXPG, MeTV, AMS } from 'Network';
import AdultCertification from 'Popup/AdultCertification';
import { Core } from 'Supporters';
import { CTSInfo } from 'Supporters/CTSInfo';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import PageView from 'Supporters/PageView';
import StbInterface from 'Supporters/stbInterface';
import Utils, { scroll } from 'Util/utils';

// style
import 'Css/monthly/HomeJoinAfter.css';

// component
import DetailTop from '../components/DetailTop';
import Blocks from '../../home/view/Blocks';
import { getMenuBlockClass } from '../../home/dataFatory/homeUtils';

const DEBUG = false;

const { /*CODE, */CALL_TYPE_CD, HOME, MONTHLY_AFTER, DETAIL_GENRE_HOME, HOME_MOVIE, HOME_TV, HOME_ANI, HOME_DOCU } = constants;
const { SYNOPSIS, SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT, STB_PROP, CERT_TYPE } = constants;
const { CALL_URL: { REGISTERED_MONTHLY, RECENT_WATCH_VOD } } = constants;
//const { GNB_MONTHLY, GNB_MYBTV, GNB_HOME, GNB_MOVIE, GNB_TV, GNB_ANI, GNB_DOCU, GNB_TVAPP, HOME_TVAPP, GNB_KIDS } = CODE;
const { Keymap: { ENTER } } = keyCodes;
const OK = '0000';
const MENU_BLOCK_TYPE = '20';
const CONTENT_TYPE = '30';
const EVENT_TYPE = '70';

const gnbIndex = {
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

const log = DEBUG ? (msg, ...args) => {
  console.log('[HomeJoinAfter] ' + msg, ...args);
} : () => { };

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[HomeJoinAfter] ' + msg, 'color: white; background: blue', ...args);
} : () => { };

class HomeJoinAfter extends PageView {
  constructor(props) {
    super(props);
    this.name = '[HomeJoinAfter]';
    const { gnbTypeCode, menuId } = this.props.match.params;

    blue('[constructor()] this.props:', this.props);
    log('[construtor()] this:', this);
    log('[constructor()] this.historyData:', this.historyData);
    this.menuId = null;
    this.gnbTypeCode = null;
    this.prodIds = [];
    //this.purchaseList = [];
    /*
    this.title = get(this.props, 'history.location.state.title');
    this.isAfterRegistration = get(this.props, 'history.location.state.isAfterRegistration');   // ????????? 1????????? ???????????? ????????? ?????? true
    this.isRegisteredPPM = get(this.props, 'history.location.state.isRegisteredPPM');   // ????????? ????????? ????????? ?????????????????? ??????
    this.isNoBannerRegisteredPPM = false;                                                   // ?????? ?????? ????????? ????????? ?????????????????? ??????
    this.registeredPPMs = [];
    */
    this.movePage = this.movePage.bind(this);
    this.keepData = {
      title: get(this.props, 'history.location.state.title'),
      isDetail: get(this.props, 'history.location.state.isDetail'),
      //isAfterRegistration: get(this.props, 'history.location.state.isAfterRegistration'),   // ????????? 1????????? ???????????? ????????? ?????? true
      isRegisteredPPM: get(this.props, 'history.location.state.isRegisteredPPM'),             // ????????? ????????? ????????? ?????????????????? ??????. ????????? ???????????? undefined??? ???.
      isNoBannerRegisteredPPM: false,                                                         // ?????? ?????? ????????? ????????? ?????????????????? ??????
      prodId: get(this.props, 'history.location.state.prd_prc_id'),
      registeredPPMs: [],
      focusData: {
        key: 'blocks',
        listIdx: 0,
        itemIdx: 0
      },
    };

    log('?????? ID:', this.keepData.prodId);

    if (!isEmpty(this.props.data)) {
      // const { menuId, gnbTypeCode } = this.props.data;
      this.menuId = menuId;
      this.gnbTypeCode = gnbTypeCode;
    }

    if (!isEmpty(this.historyData) && !isEmpty(this.historyData.keepData)) {
      this.keepData = cloneDeep(this.historyData.keepData);
    }

    log('[constructor()] this.keepData:', this.keepData);

    /*
    this.state = isEmpty(this.historyData) ? {
      bigBanner: [],    // ????????? state??? type ?????? ????????? ?????? ???????????? ?????? : bigBanner.bannerType ( 'monthly', 'normal' )
      contentSlides: [],
      currentGnbMenuId: menuId,
      currentGnbTypeCode: gnbTypeCode,
      changeMenuTrigger: true,
      headEndCallEnd: false,
      isScrolling: false
      //monthlyDetailYN: monthlyDetailYN
    } : this.historyData;
    */

    this.state = {
      bigBanner: [],    // ????????? state??? type ?????? ????????? ?????? ???????????? ?????? : bigBanner.bannerType ( 'monthly', 'normal' )
      contentSlides: [],
      currentGnbTypeCode: gnbTypeCode
      //isDetail: false
    };

    this.defaultFM = {
      topButton: new FM({
        id: 'topButton',
        type: 'ELEMENT',
        focusSelector: '.csFocus',
        row: 1,
        col: 1,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        onFocusKeyDown: this.onKeyDownTopButton,
        onFocusChild: this.onFocusChildTopButton,
      })
    };

    this.declareFocusList([
      { key: 'gnbMenu', fm: null },
      { key: 'banner', fm: null },
      { key: 'blocks', fm: [] },
      { key: 'topButton', fm: null },
    ]);
  }

  // 19??????, 19????????? ?????????
  hideMenuCheck = (gridData) => {
    let refactory = [];

    if (gridData) {
      // console.log('%c gridData', 'color: red; background: yellow', gridData);
      refactory = gridData.filter((grid, idx) => {
        // console.log('%c ?????? ?????????', 'color: red; background: yellow; font-size: 30px', );
        if (Number(this.ADULT_MOVIE_MENU) === 2 && grid.adlt_lvl_cd === '01') { // 19?????? ( 2: ???????????? )
          return false;
        } else if (Number(this.EROS_MENU) === 2 && grid.adlt_lvl_cd === '03') { // 19????????? ?????? ( 2: ???????????? )
          return false;
        } else {
          return true;
        }
      });
    }

    return refactory;
  }

  restoreFocus = () => {
    const { key: id, listIdx: idx, itemIdx: childIdx } = this.keepData.focusData;

    blue('[restoreFocus()] focusData:', this.keepData.focusData);

    if (!idx) {
      this.setFocus(id, childIdx);
    } else {
      this.setFocus({ id, idx, childIdx });
    }
  }

  scrollTo = (anchor, marginTop) => {
    blue('[scrollTo] anchor, marginTop:', anchor, marginTop);
    const margin = marginTop || 0;
    let top = anchor ? anchor.offsetTop : 0;
    let offset = 0;
    let bShowMenu = true;

    if (top > 500) {
      offset = -(top - 60) + margin;
      bShowMenu = false;
    } else {
      offset = 0;
    }

    scroll(offset);
    this.props.showMenu(bShowMenu, true);
  }

  shouldProtect = (watchLevelCode) => {
    const stbProhibitAge = parseInt(StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT), 10);
    const contentProhibitAge = parseInt(watchLevelCode, 10);

    log('STB ?????? ?????? ??????:', stbProhibitAge);
    log('????????? ?????? ??????:', contentProhibitAge);

    return stbProhibitAge > 0 && stbProhibitAge <= contentProhibitAge;
  }

  setProdIds = async () => {
    const result = await Utils.getRegisteredMonthlyProducts();

    blue('[setProdIds()] result:', result);

    this.prodIds = map(result.purchaseList, 'prod_id');
    this.isAfterRegistration = !isEmpty(this.prodIds);
    log('this.prodIds:', this.prodIds, this.isAfterRegistration);
  }

  // ??????????????? ????????? ????????? ??????
  /*
  getMenuBlockClass = (gnbTypeCode) => {
    const classnames = {
      [GNB_MOVIE]: 'movieGenre',
      [GNB_TV]: 'tvGenre',
      [GNB_ANI]: 'animationGenre',
      [GNB_KIDS]: 'kidsGenre',
      [GNB_DOCU]: 'lifeGenre',
    }

    return classnames[gnbTypeCode] || '';
  }
  */

  getBlockData = async (menuId) => {
    log('keepdata:', this.keepData);
    // 
    const imgPath = Utils.getImageUrl(this.keepData.isRegisteredPPM === false ? Utils.IMAGE_SIZE_MONTHLY_BANNER_BIG : Utils.IMAGE_SIZE_MONTHLY_BANNER_SMALL);
    let result;
    let blockData = {};
    let banners;
    let bigBanner = [];
    let blocks;
    let contents = [];

    blue('[getBlockData()]');

    //await this.setProdIds();

    if (!this.keepData.isDetail && this.isAfterRegistration) {
      result = await NXPG.request005({ menu_id: menuId, prd_prc_id_lst: this.prodIds.join(',') });
      log('NXPG-005 result:', result);
    } else {
      result = await NXPG.request003({ menu_id: menuId });
      log('NXPG-003 result:', result);
    }

    banners = result.banners;

    if (this.keepData.isDetail && isEmpty(banners)) {
      if (this.keepData.isRegisteredPPM) {
        this.keepData.isNoBannerRegisteredPPM = true;
      } else {                                          // ????????? ?????? ??? ?????????????????? ?????? Big banner??? ????????? ???. (from ?????????M)
        blue('????????? ?????? ??? ?????? ????????? Big banner ????????? ????????????. (H/E ?????? ??????)');

        Core.inst().showToast('????????? ?????? ??? Big banner ????????? ????????????. (H/E ?????? ??????)', '', 3000);
        this.moveBack();
        return;
      }
    }

    // bigBanner ??????
    if (this.keepData.isDetail && !this.keepData.isRegisteredPPM) {
      log('????????? ????????? ?????? Big Banner:', banners);
      bigBanner = isEmpty(banners) ? [] : banners.map(banner => {
        return {
          img: `${imgPath}${banner.bss_img_path}`,  // ?????? ?????????
          prd_prc: banner.prd_prc,                  // ????????????
          prd_prc_id: banner.prd_prc_id,            // ???????????? ID
          prd_prc_vat: banner.prd_prc_vat,          // ????????? ?????? ????????????
          sale_prc: banner.sale_prc,                // ????????????
          sale_prc_vat: banner.sale_prc_vat,        // ????????? ?????? ????????????
        }
      });
    } else {
      log('????????? ??? / ?????? ?????? Big Banner:', banners);
      bigBanner = isEmpty(banners) ? [] : banners.map(banner => {
        let imageN = `${imgPath}${banner.bss_img_path}`;  // ?????? ?????????
        let imageS = `${imgPath}${banner.ext_img_path}`;  // ?????? ?????????
        const imgs = (() => {
          if (isEmpty(banner.ext_img_path)) {
            return { imageN };
          } else {
            return { imageS, imageN };
          }
        })();

        return {
          isSingle: Object.keys(imgs).length < 2,       // ???????????? ???????????? ??????
          imgs,
          callUrl: banner.call_url,
          bannerDetailTypeCode: banner.bnr_det_typ_cd,  // ?????? ?????? ?????? ??????
          callTypeCode: banner.call_typ_cd,
          shortcutEpisodeId: banner.shcut_epsd_id,
          shortcutSeriesId: banner.shcut_sris_id,
          synopsisTypeCode: banner.synon_typ_cd,
          vasId: banner.vas_id,
          vasItemId: banner.vas_itm_id,
          vasServiceId: banner.vas_svc_id,
        }
      });
    }

    // block ??????
    blocks = isEmpty(result.blocks) ? [] : result.blocks.map(item => {
      return {
        blk_typ_cd: item.blk_typ_cd,
        call_url: item.call_url,
        cw_call_id_val: item.cw_call_id_val,
        gnb_typ_cd: item.gnb_typ_cd,
        menus: item.menus,
        menu_id: item.menu_id,
        menu_nm: item.menu_nm,
        pst_exps_typ_cd: item.pst_exps_typ_cd,
        scn_mthd_cd: item.scn_mthd_cd,
        title: item.menu_nm
      };
    });

    for (let block of blocks) {
      const content = await this.gridDataPromise(block);

      log('block:', block);
      if (content && !isEmpty(content.slideItem)) {
        content.call_url = block.call_url;
        contents.push(content);
        log('content:', content);
      }
    }

    /*    parallel ????????????, ????????? ?????? ?????? ????????? ??????.
    await Promise.all(blocks.map(async (block) => {
      const content = await this.gridDataPromise(block);

      log('block:', block);
      if (content && !isEmpty(content.slideItem)) {
        content.call_url = block.call_url;
        contents.push(content);
        log('content:', content);
      }
    }));
    */

    log('contents:', contents);

    if (isEmpty(contents)) {
      Core.inst().showToast('H/E ?????? ????????? ????????????.', '', 3000);
      this.moveBack();
      return;
    }

    blockData.contentSlides = contents;
    blockData.bigBanner = bigBanner;

    return blockData;
  }

  gridDataPromise = (item/*, gnbTypeCode*/) => {
    return new Promise((res, rej) => {
      // ????????? ????????? slide type ??? ????????????, image ????????? ????????? ?????? ?????????
      // menus type ?????? menus ???????????? ??????
      log('[gridDataPromise] item:', item);
      if (item.blk_typ_cd === MENU_BLOCK_TYPE) {
        if (item.call_url === REGISTERED_MONTHLY) {   // ????????? ?????????
          const callUrls = map(item.menus, 'call_url');
          blue('[gridDataPromise] ????????? ?????????:', item);
          log('callUrls:', callUrls);
          this.keepData.registeredPPMs = this.keepData.registeredPPMs.concat(callUrls);

          res({
            blockType: item.blk_typ_cd,
            slideType: SlideType.MONTHLY,
            //slideType: SlideType.MENU_BLOCK,
            slideTitle: item.title,
            slideItem: ((item) => {
              return item.menus && item.menus.map((itemMenu, idx) => {
                return {
                  call_url: itemMenu.call_url,
                  gnbTypeCode: itemMenu.gnb_typ_cd,
                  imgs: {
                    //normal: itemMenu.bnr_off_img_path,
                    //focused: itemMenu.bnr_on_img_path
                    off: itemMenu.bnr_off_img_path,
                    on: itemMenu.bnr_on_img_path
                  },
                  menu_id: itemMenu.menu_id,
                  parentCallUrl: item.call_url,
                  prd_prc_id: itemMenu.prd_prc_id,        // ????????????ID(VAS ID??? ???????????? ?????? ???)
                  prd_prc: itemMenu.prd_prc,              // ???????????? ID
                  prd_prc_vat: itemMenu.prd_prc_vat,      // ??????(?????????) ????????? ??????
                  prd_typ_cd: itemMenu.prd_typ_cd,        // "34": ?????? VOD PPM ??????, "35": ?????? PPM (from NXPG ????????????)
                  sale_prc: itemMenu.sale_prc,            // ????????????
                  sale_prc_vat: itemMenu.sale_prc_vat,    // ???????????? ????????? ??????
                  shcut_menu_id: itemMenu.shcut_menu_id,
                  title: itemMenu.menu_nm
                };
              })
            })(item),
            menu_id: item.menu_id,
          });
        } else if (item.call_url === RECENT_WATCH_VOD) {    // ?????? ?????? vod
          blue('????????? ?????? ?????? VOD');
          MeTV.request021({ yn_ppm: 'Y' }).then(watchedVods => {
            const vodList = watchedVods.watchList;
            /*
            if (Number(watchedVods.watch_no) > 0) {
              this.setState({
                isVodList: true,
              });
            }
            */
            res({
              blockType: item.blk_typ_cd,
              slideType: SlideType.RECENT_VOD,
              slideTitle: item.title,
              slideItem: vodList && vodList.map((vod, idx) => {
                return {
                  title: Number(vod.series_no) > 0 ? `${vod.title} ${vod.series_no}???` : vod.title,
                  imgURL: vod.thumbnail,
                  bAdult: vod.adult,
                  rate: vod.watch_rt,
                  epsdId: vod.epsd_id,
                  srisId: vod.sris_id,
                  epsdRsluId: vod.epsd_rslu_id,
                }
              }),
              menu_id: item.menu_id
            });
          });
          //} else if (this.keepData.isDetail) {        // ????????? ?????? ?????? ??????
        } else {        // ????????? ??? ?????? ??????          
          res({
            blockType: item.blk_typ_cd,
            //slideType: SlideType.MONTHLY,
            //slideType: SlideType.MENU_BLOCK,
            //slideTitle: item.title,
            slideType: this.keepData.isDetail ? SlideType.MENU_BLOCK : SlideType.MONTHLY,
            slideTitle: item.menu_nm_exps_yn === 'N' ? '' : item.title,
            classOfSlideType: getMenuBlockClass(item.gnb_typ_cd),
            slideItem: ((item) => {
              return item.menus && item.menus.map((itemMenu, idx) => {
                return {
                  call_url: itemMenu.call_url,
                  gnbTypeCode: itemMenu.gnb_typ_cd,
                  imgs: {
                    //normal: itemMenu.bnr_off_img_path,
                    //focused: itemMenu.bnr_on_img_path
                    off: itemMenu.bnr_off_img_path,
                    on: itemMenu.bnr_on_img_path
                  },
                  menu_id: itemMenu.menu_id,
                  parentCallUrl: item.call_url,
                  prd_prc_id: itemMenu.prd_prc_id,        // ????????????ID(VAS ID??? ???????????? ?????? ???)
                  prd_prc: itemMenu.prd_prc,              // ???????????? ID
                  prd_prc_vat: itemMenu.prd_prc_vat,      // ??????(?????????) ????????? ??????
                  prd_typ_cd: itemMenu.prd_typ_cd,        // "34": ?????? VOD PPM ??????, "35": ?????? PPM (from NXPG ????????????)
                  sale_prc: itemMenu.sale_prc,            // ????????????
                  sale_prc_vat: itemMenu.sale_prc_vat,    // ???????????? ????????? ??????
                  shcut_menu_id: itemMenu.shcut_menu_id,
                  title: itemMenu.menu_nm
                };
              })
            })(item),
            menu_id: item.menu_id,
          });
        }
      } else if (item.blk_typ_cd === CONTENT_TYPE) {              // ????????? ????????????
        if (item.scn_mthd_cd === '501') {                 // CW ?????? ?????????
          NXPG.request009({
            cw_call_id: item.cw_call_id_val,
            type: 'all',
            menu_id: item.menu_id,
            // stb_id: '%7B660D7F55-89D8-11E5-ADAE-E5AC4F814417%7D'    // TODO stb_id ?????? ?????? ???(?????? ??????)
          }).then(data => {
            res({
              blockType: item.blk_typ_cd,
              slideType: SlideType.TALL,
              slideTitle: item.title,
              slideItem: ((item) => {
                let newSlideItemFiltering = this.hideMenuCheck(data.grid[0].block);

                return newSlideItemFiltering.map((grid, idx) => {
                  return {
                    adlt_lvl_cd: grid.adlt_lvl_cd,
                    badge: grid.i_img_cd,
                    epsd_id: grid.epsd_id,
                    image: grid.poster_filename_v,
                    menu_id: item.menu_id,
                    menuExposure: grid.menu_exps_prop_cd,
                    sris_id: grid.sris_id,
                    synon_typ_cd: grid.synon_typ_cd,
                    title: grid.title,
                    userBadgeImgPath: grid.user_badge_img_path,
                    wat_lvl_cd: grid.wat_lvl_cd
                  }
                });
              })(item),
              menu_id: item.menu_id
            })
          }).catch(err => {
            res({
              blockType: item.blk_typ_cd,
              menu_id: item.menu_id,
              slideType: SlideType.TALL,
              slideTitle: item.title,
              slideItem: []
            })
          });
        } else {
          // console.log('%c pst_exps_typ_cd', 'color: red; background: yellow', item.pst_exps_typ_cd, item.menu_nm);
          // pst_exps_typ_cd === 10 ????????? ????????????
          if (item.pst_exps_typ_cd === '10') {
            NXPG.request006({
              menu_id: item.menu_id,
              transactionId: 'block_by_block_gid'
            }).then(grids => {
              res({
                blockType: item.blk_typ_cd,
                slideType: SlideType.HORIZONTAL,
                slideTitle: item.title,
                slideItem: ((item) => {
                  let newSlideItemFiltering = this.hideMenuCheck(grids.contents);
                  return newSlideItemFiltering.map((grid, i) => {
                    return {
                      adlt_lvl_cd: grid.adlt_lvl_cd,
                      badge: grid.i_img_cd,
                      epsd_id: grid.epsd_id,
                      image: grid.poster_filename_h,
                      menu_id: item.menu_id,
                      menuExposure: grid.menu_exps_prop_cd,
                      sris_id: grid.sris_id,
                      synon_typ_cd: grid.synon_typ_cd,
                      title: grid.title,
                      // user_badge_img_path                          // ??????
                      // user_badge_wdt_img_path                      // ??????
                      // userBadgeImgPath: grid.user_badge_img_path,  // ??????
                      userBadgeWidthImgPath: grid.user_badge_wdt_img_path, // ??????
                      wat_lvl_cd: grid.wat_lvl_cd
                    };
                  });
                })(item),
                menu_id: item.menu_id
              });
            });
          } else {
            NXPG.request006({
              menu_id: item.menu_id,
              transactionId: 'block_by_block_gid'
            }).then(grids => {
              res({
                blockType: item.blk_typ_cd,
                slideType: SlideType.TALL,
                slideTitle: item.title,
                slideItem: ((item) => {
                  let newSlideItemFiltering = this.hideMenuCheck(grids.contents);
                  return newSlideItemFiltering.map((grid, i) => {
                    return {
                      adlt_lvl_cd: grid.adlt_lvl_cd,
                      badge: grid.i_img_cd,
                      epsd_id: grid.epsd_id,
                      image: grid.poster_filename_v,
                      menu_id: item.menu_id,
                      menuExposure: grid.menu_exps_prop_cd,
                      sris_id: grid.sris_id,
                      synon_typ_cd: grid.synon_typ_cd,
                      title: grid.title,
                      userBadgeImgPath: grid.user_badge_img_path,  // ??????
                      wat_lvl_cd: grid.wat_lvl_cd
                    };
                  });
                })(item),
                menu_id: item.menu_id
              });
            });
          }
        }
      } else if (item.blk_typ_cd === EVENT_TYPE) {                      // ????????? ??????
        NXPG.request007({
          menu_id: item.menu_id
        }).then(grids => {
          res({
            blockType: item.blk_typ_cd,
            slideType: SlideType.EVENT,
            slideTitle: item.title,
            slideItem: ((item) => {
              if (!grids.banners) return [];
              let bannersFiltering = grids.banners.filter(bnr => bnr.bnr_det_typ_cd !== 40);
              return bannersFiltering.map((bnrItem, idx) => {
                // ???????????? on/off 2?????? ????????? ?????? ?????????????????? 1?????? ??????/?????? ?????? ??????
                // on/off ????????? ????????? ??????????????? ????????????
                // ?????? ???????????? on/off ????????? ??? ?????? ???????????? ?????? ????????? ????????? ???????????????.
                let imagPath = `${Utils.getIipImageUrl(1690, 220)}${bnrItem.bnr_off_img_path}`;
                return {
                  image: imagPath,
                  title: bnrItem.menu_nm,
                  memu_id: bnrItem.menu_id,
                  callUrl: bnrItem.call_url,
                  callTypeCode: bnrItem.call_typ_cd,
                  contentTypeCode: bnrItem.cnts_typ_cd,
                  synopsisTypeCode: bnrItem.synon_typ_cd,
                  shortcutSeriesId: bnrItem.shcut_sris_id,
                  shortcutEpisodeId: bnrItem.shcut_epsd_id
                };
              })
            })(item),
            menu_id: item.menu_id
          })
        })
      } else {
        res({
          blockType: item.blk_typ_cd,
          slideType: SlideType.MENU_BLOCK,
          slideTitle: item.title,
          slideItem: [],
          menu_id: item.menu_id
        });
      }
    }).catch(err => console.error(err));
  }

  saveFocus = (key, index, childIndex) => {
    const { focusData } = this.keepData;

    blue('[saveFocus()] key, index, childIndex:', key, index, childIndex);

    focusData.key = key;

    if (!isNil(index)) {
      focusData.listIdx = index;
    }

    if (!isNil(childIndex)) {
      focusData.itemIdx = childIndex;
    }
  }

  // ??? ?????? ?????? enter ??????
  onKeyDownTopButton = (evt) => {
    const { keyCode } = evt;

    // ENTER
    if (keyCode === ENTER) {
      this.setFocus('blocks', 0);
    }
  }

  onSlideFocus = (container, direction) => {
    let top = 0;
    let anchor = null;
    let bShowMenu = true;
    let offset = 0;

    blue('[onSlideFocus] container, directon:', container, direction);
    log('this.focusIndex, this.getCurrentFocusInfo().idx:', this.focusIndex, this.getCurrentFocusInfo().idx);

    if (container) {
      anchor = container.closest('.contentGroup');
      top = anchor.offsetTop;
    }

    if (anchor) {
      top = anchor.offsetTop;
    }

    if (top > 500) {
      offset = -(top - 60);
      bShowMenu = false;
    } else {
      offset = 0;
    }

    scroll(offset);
    this.props.showMenu(bShowMenu, true);

    this.saveFocus('blocks', this.getCurrentFocusInfo().idx);
  }

  onSlideFocusChild = (focusIdx) => {
    blue('[onSlideFocusChild()] focusIdx:', focusIdx);

    //this.keepData.focusData.itemIdx = focusIdx;
    this.saveFocus('blocks', null, focusIdx);
  }

  moveToCallTypeCode = async (data) => {
    const { callUrl, callTypeCode/*, bannerDetailTypeCode*/, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId/*, vasItemId*/, vasServiceId } = data;

    switch (callTypeCode) {
      case CALL_TYPE_CD.SHORT_CUT:        // ??????????????????
        const parsedCallUrl = Utils.parseCallUrl(callUrl);
        const { gnbTypeCode, menuId } = parsedCallUrl;
        const url = `${HOME}/${gnbTypeCode}/${menuId}`;

        this.movePage(url, { gnbTypeCode, menuId });
        break;
      case CALL_TYPE_CD.SYNOPSIS:         // ???????????? ??????
        const synopParam = { sris_id: shortcutSeriesId, epsd_id: shortcutEpisodeId };

        this.toSynopsis(synopsisTypeCode, synopParam);
        break;
      case CALL_TYPE_CD.LIVE_CH:          // ????????? ??????
        const channelNo = callUrl.split('=')[1];
        const data = { channelNo, entryPath: 'WING_UI', fromMenu: '' }

        StbInterface.requestLiveTvService('M', data, null); //????????????
        break;
      case CALL_TYPE_CD.VIRTUAL_CH:       // ?????? ??????
        Core.inst().showToast('??????????????? ?????? ??? ??? ????????????.', '', 3000);
        break;
      case CALL_TYPE_CD.BROWSER:          // ????????????
        StbInterface.openPopup('url', callUrl);
        break;
      case CALL_TYPE_CD.APP:
        const AMS_applistData = await AMS.appList_r();
        const appList = AMS_applistData.BIZ_CD.DATA.ITEM_LIST.ITEM_INFO;
        let appLaunchData = {};
        let title = '';
        let contentId = '';
        let packageName = '';
        let inquiryFlag = false;
        for (let item of appList) {
          if (item.VASS_ID === vasId) {
            title = item.TITLE;
            contentId = item.CON_ID;
            inquiryFlag = true;
            appLaunchData = {
              title,                    // App ??????
              serviceId: vasServiceId,  // App ????????? ?????????
              vassId: vasId,            // App ?????? ?????????
              contentId,                // App ????????? ?????????
              packageName,              // "??? ???????????? PackageName ??? ?????? ??? ?????? ???????????? ????????????. (?????? hasVaasId ??? Y ????????? ??????)"
              entryPath: 'HOME',        // "HOME" - ??? > TV??? ?????? ???
            }
            break;
          }
        }
        if (inquiryFlag) {
          StbInterface.launchApp(appLaunchData);
        } else {
          Core.inst().showToast('AMS App list ?????? ???????????? ?????? ????????????. H/E ??????', '', 3000);
        }
        break;
      default: break;
    }
  }

  // ????????? enter ?????? ??? ??????
  onSelectBanner = (index) => {
    const { bigBanner } = this.state;
    const targetBanner = bigBanner[index];
    const { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode } = targetBanner;
    const { vasId, vasItemId, vasServiceId } = targetBanner;
    const data = {
      callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId,
      synopsisTypeCode, vasId, vasItemId, vasServiceId, isRegisteredPPM: includes(this.keepData.registeredPPMs, callUrl)
    };

    blue('[onSelectBanner] index:', index);
    log('keepData.registeredPPMs:', this.keepData.registeredPPMs);
    log('callUrl:', callUrl, data);
    if (isEmpty(callUrl.trim())) {
      Core.inst().showToast('call_url ????????? ?????? ????????????. H/E ??????');
    } else {
      this.moveToCallTypeCode(data);
    }
  }

  // ????????? ??????
  onMonthlySelect = (groupIdx, itemIdx) => {
    const item = this.state.contentSlides[groupIdx].slideItem[itemIdx];

    blue('[onMonthlySelect] groupIdx: %s, itemIdx: %s', groupIdx, itemIdx, item);
    log('this.state.keepData:', this.state.keepData);
    log('this.keepData:', this.keepData);
    this.state.keepData = this.keepData;
    Utils.moveMonthlyPage(MONTHLY_AFTER, item, item.parentCallUrl === REGISTERED_MONTHLY);
  }

  moveToSynopsis = (slideIndex, index) => {
    const sliderInfo = this.state.contentSlides[slideIndex];

    if (sliderInfo && sliderInfo.slideItem[index]) {
      const vodInfo = sliderInfo.slideItem[index];
      const { menu_id, sris_id, epsd_id, synon_typ_cd, wat_lvl_cd } = vodInfo;
      const synopParam = { menu_id, sris_id, epsd_id, wat_lvl_cd };
      this.toSynopsis(synon_typ_cd, synopParam);
    }
  }

  // slide ????????? enter ??????
  onSelectSlideVOD = (slideIndex, index) => {
    const sliderInfo = this.state.contentSlides[slideIndex];
    let watchLevelCode;

    blue('[onSelectSlideVOD] slideIndex: %s, index: %s', slideIndex, index, sliderInfo);

    if (sliderInfo && sliderInfo.slideItem[index]) {
      watchLevelCode = sliderInfo.slideItem[index].wat_lvl_cd;
    } else {
      console.log('????????? ????????? ????????????.');
      return;
    }

    // if (this.shouldProtect(watchLevelCode)) {
    //   log('should be protected');
    //   const opts = {
    //     certification_type: CERT_TYPE.AGE_LIMIT,
    //     age_type: parseInt(watchLevelCode, 10)
    //   }

    //   Core.inst().showPopup(<AdultCertification />, opts, (res) => {
    //     if (res && res.result === OK) {
    //       this.moveToSynopsis(slideIndex, index);
    //     }
    //   });
    // } else {
    //   log('do not need protection');
      this.moveToSynopsis(slideIndex, index);
    // }
  }

  // menu block enter ??????
  onSelectMenuBlock = (slideIdx, idx) => {
    blue('[onSelectMenuBlock] slideIdx: %s, idx: %s', slideIdx, idx);

    const { contentSlides } = this.state;
    const sliderInfo = contentSlides[slideIdx];
    const menuInfo = sliderInfo.slideItem[idx];
    const { gnbTypeCode, menu_id } = menuInfo;
    // const params = `/${gnbTypeCode}/${menu_id}`;
    let movePagePath = {
      U5_03: HOME,
      U5_04: HOME_MOVIE,
      U5_05: HOME_TV,
      U5_06: HOME_ANI,
      U5_08: HOME_DOCU
    };
    if (movePagePath[gnbTypeCode] !== HOME) {
      // ??????????????? gnbTypeCode??? ???(U5_03)??? ????????? ??????(?????????M ?????? ??????)
      // ????????? ???????????? ????????? H/E??? ????????? ??????.
      this.movePage(DETAIL_GENRE_HOME, {
        gnbTypeCode,
        menuId: menu_id,
        depth1Title: sliderInfo.slideTitle,
        depth2Title: menuInfo.title
      });
    }
  }

  onSelectRecentVod = (flag, index) => {
    const slide = find(this.state.contentSlides, { slideType: SlideType.RECENT_VOD });
    const slideItem = get(slide, `slideItem[${index}]`);

    blue('[onSelectRecentVod] flag: %s, index: %s', flag, index, slideItem);

    if (!isEmpty(slideItem)) {
      const data = {
        search_type: '2',
        epsd_rslu_id: slideItem.epsdRsluId,
        seeingPath: '13'	 //?????????????????? ?????? VOD ??????(??????Btv-????????????-??????????????????)
      }
      CTSInfo.requestWatchVODForOthers(data);
    } else {
      console.log('???????????? ?????? ?????? VOD ???????????? ????????? ??? ????????????.');
    }
  }

  toSynopsis = (synon_typ_cd, param) => {
    blue('[toSynopsis] synon_typ_cd: %s, param: %s', synon_typ_cd, param);

    let path = SYNOPSIS;

    if (synon_typ_cd === '01' || synon_typ_cd === '02') {   //??????/??????
      path = SYNOPSIS;
    } else if (synon_typ_cd === '03') {                     // GW??????(????????? ???)
      path = SYNOPSIS_GATEWAY;
    } else if (synon_typ_cd === '04') {                     // VOD???????????? ?????? (????????????)
      path = SYNOPSIS_VODPRODUCT;
    }

    Utils.movePageAfterCheckLevel(path, param, param.wat_lvl_cd);
  }

  onFocusChildTopButton = () => {
    this.scrollTo(this.topButton, 522);
  }

  onFocusKeyDownTopButton = (a, b) => {
    this.setFocus('blocks');
  }

  movePage(path, obj) {
    blue('[movePage] path, obj:', path, obj);

    //this.state.keepData.focusData = this.focusData;
    this.state.keepData = this.keepData;
    super.movePage(path, obj);
  }

  componentDidMount() {
    console.log('componentDidMount()');

    // const { activeMenu, data: { gnbFm } } = this.props;
    // const { curGnbTypeCode } = this.state;

    // activeMenu(curGnbTypeCode, this.menuId);
    this.props.showMenu(true, true);
  }

  componentWillMount() {

    blue('[componentWillMount()]');
    this.props.showMenu(true, true);
    /*
    //this.props.showMenu(true, true);
    invoke(this.props, 'showMenu', true, true);
    //const { currentGnbMenuId, currentGnbTypeCode } = this.state;
    //const { gnbFm } = this.props.data;
    if (!this.historyData) {
      this.setBlock(this.menuId, GNB_MONTHLY);
    }

    // ????????? ?????? ????????? ??????
    this.setFm('topButton', new FM({
      ...this.defaultFM.topButton,
    }));
    */

    /*
    invoke(this.props, 'showMenu', true, true);

    if (!this.historyData) {
      this.setBlock(this.menuId, GNB_MONTHLY);
    } else {
      await this.setPurchaseList();

      this.setState({
        contentSlides: this.contentList
      }, () => {
        this.restoreFocus();
      });
    }
    */

    /*
    if (this.historyData) {
      log('Loading ??????');
      this.loadDone = true;
    }
    */
  }


  componentWillReceiveProps(nextProps) {
    blue('[componentWillReceiveProps()]');

    // GNB FM ???????????? ??????
    if (!this.props.data.gnbFm) {
      this.setFm('gnbMenu', nextProps.data.gnbFm);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    //super.componentWillUpdate(nextProps, nextState);

    blue('[componentWillUpdate()]');
  }

  componentDidUpdate(prevProps, prevState) {
    //super.componentDidUpdate(prevProps, prevState);
    blue('[componentDidUpdate()]');

    if (this.props.data && this.props.data.gnbFm) {
      const { gnbFm } = this.props.data;
      this.setFm('gnbMenu', gnbFm);
    }

    /*
    if (this.keepData.isDetail && !isEmpty(this.state.bigBanner)) {
      this.setFocus('banner', 0);
    } else {
      this.setFocus('blocks', 0);
    }
    */
  }

  getGnbIndex = (gnbTypeCode) => {
    return gnbIndex[gnbTypeCode];
  }

  refreshPage = async (isRefresh) => {
    let blockData = this.historyData;
    console.log(this.name + 'refreshPage', isRefresh);

    blue('[refreshPage()]');

    invoke(this.props, 'showMenu', true, true);
    await this.setProdIds();

    if (isRefresh) {
      // TODO: ?????? ????????? H/E?????? ????????? ????????? ????????? ?????? refresh??? ?????? ?????? ????????? ????????? ??????
      //this.keepData.isRegisteredPPM = includes(this.prodIds, this.keepData.prodId);
      this.keepData.isRegisteredPPM = true;
    }

    // history back??? ?????? ?????? ????????? ????????????
    if (!this.historyData) {
      blockData = await this.getBlockData(this.menuId);
    }

    this.loadDone = true;

    this.setState({
      ...blockData
    }, () => {
      // FM ??????
      this.setFm('topButton', new FM({
        ...this.defaultFM.topButton
      }));

      if (get(this.props, 'data.gnbFm')) {
        this.setFm('gnbMenu', this.props.data.gnbFm);
      }

      // ?????? ????????? ?????? ??????
      if (this.historyData) {
        this.restoreFocus();
      } else if (this.keepData.isDetail && !isEmpty(this.state.bigBanner) && !this.keepData.isRegisteredPPM) {
        this.setFocus('banner', 0);
      } else {
        this.setFocus('blocks', 0);
      }
      console.log(this.name + 'this.paramData=', this.paramData);

      if (this.paramData) {
        // ????????? ?????? GNB ????????? ??????
        if (isFunction(this.props.activeMenu)) {
          if (this.keepData.isDetail && this.props.history.location.state.genreGnbTypeCode) {
            this.props.activeMenu(this.props.history.location.state.genreGnbTypeCode);
            this.props.data.gnbFm.setListInfo({ focusIdx: this.getGnbIndex(this.props.history.location.state.genreGnbTypeCode) });
            this.props.data.gnbFm.removeFocus();
          } else {
            this.props.activeMenu(this.state.currentGnbTypeCode);
            this.props.data.gnbFm.setListInfo({ focusIdx: this.getGnbIndex(this.state.currentGnbTypeCode) });
            this.props.data.gnbFm.removeFocus();
          }
        }
      }
    });
  }

  async componentDidMount() {
    super.componentDidMount();

    blue('[componentDidMount()] ????????????:', appConfig.STBInfo.level);

    await this.refreshPage();
  }

  renderNoBannerTitle = () => {
    let jsx = null;

    if (this.keepData.isNoBannerRegisteredPPM) {
      jsx = (
        <div className="monthlyAfterTitleArea">
          <p className="preMenu">{'?????????'} &gt;</p>
          <p className="currentMenu">{this.keepData.title}</p>
        </div>
      );
    }

    return jsx;
  }

  render() {
    const { bigBanner, contentSlides/*, isDetail*/ } = this.state;
    const monthlyPriceInfo = this.props.history.location.state && this.props.history.location.state.price;
    const prd_prc_id = this.props.history.location.state ? this.props.history.location.state.prd_prc_id : '';  // ????????? ????????? ???????????? ??????
    let mustShowSearch = this.loadDone && ((!this.keepData.isDetail && this.isAfterRegistration) || (this.keepData.isDetail && this.keepData.isRegisteredPPM));
    let containerClassName = 'home scrollWrap monthly';

    blue('[render()] this.keepData.isRegisteredPPM:', this.keepData.isRegisteredPPM);
    log('[render()] this.keepData.isNoBannerRegisteredPPM:', this.keepData.isNoBannerRegisteredPPM);

    if (this.keepData.isNoBannerRegisteredPPM) {
      containerClassName += ' monthlyAfterNoneBanner';
    } else if (this.isAfterRegistration) {
      containerClassName += ' monthlyAfter';
    }

    return (
      <div className="wrap">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className={containerClassName}>
          {this.renderNoBannerTitle()}
          {/* Big Banner */}
          {(bigBanner && bigBanner.length !== 0 && this.keepData.isDetail && !this.keepData.isRegisteredPPM) &&
            bigBanner.map((banner, idx) =>
              <DetailTop key={idx} id="banner"
                price={monthlyPriceInfo}
                productPriceId={prd_prc_id}
                hasButton={!this.keepData.isRegisteredPPM}
                bg={banner.img}
                setFm={this.setFm}
                type="????????? ??????"
                surtax="????????? ??????"
                refreshPage={this.refreshPage}
              />
            )
          }
          {(bigBanner.length !== 0 && (!this.keepData.isDetail || this.keepData.isRegisteredPPM)) &&
            <G2NaviBannerSlider id="banner"
              autoPlay={true}
              duration={200}
              onSelect={this.onSelectBanner}
              onFocusSlider={this.onMainslide}
              setFm={this.setFm}
            >
              {bigBanner.map((banner, idx) => (
                <G2NaviBanner key={idx}
                  imgs={banner.imgs}
                  link={banner.link}
                  video={false}
                />
              ))}
            </G2NaviBannerSlider>
          }
          {contentSlides.map((item, idx) => {
            //if (item.blockType === '20' && item.slideType === SlideType.MENU_BLOCK) {
            if (item.blockType === MENU_BLOCK_TYPE && item.slideType === SlideType.MONTHLY) {
              return (
                <G2NaviSlider id={`blocks`} idx={idx} key={idx}
                  title={item.slideTitle}
                  type={item.slideType}
                  onSlideFocus={this.onSlideFocus}
                  onSelectMenu={null}
                  onSelectChild={this.onMonthlySelect}
                  onSlideFocusChild={this.onSlideFocusChild}
                  rotate={true}
                  bShow={true}
                  setFm={this.setFm}
                >
                  {item.slideItem.map((slide, idx2) =>
                    /*
                     <G2MenuBlockSlider
                       key={idx2}
                       idx={idx2}
                       title={slide.title}
                       menuId={slide.menu_id}
                       gnbTypeCode={slide.gnbTypeCode}
                       images={slide.imgs}
                     />
                     */
                    <G2MonthlySlider key={idx2} idx={idx2}
                      title={slide.title}
                      menuId={slide.menu_id}
                      gnbTypeCode={slide.gnbTypeCode}
                      imgs={slide.imgs}
                    />
                  )}
                </G2NaviSlider>
              );
            } else {
              return (
                <Blocks key={idx}
                  // currentRowIndex={this.focusIndex}
                  blockInfo={item}
                  idx={idx}
                  setFm={this.setFm}
                  onSlideFocus={this.onSlideFocus}
                  onSlideFocusChild={this.onSlideFocusChild}
                  onSelectRecentVod={this.onSelectRecentVod}
                  scrollTo={this.onSlideFocus}
                  onSelectSlideVOD={this.onSelectSlideVOD}
                  onSelectMenuBlock={this.onSelectMenuBlock}
                  onSelectEvent={this.onSelectEvent}
                  onMonthlySelect={this.onMonthlySelect}
                  onSelectFavorite={this.onSelectFavorite}
                  saveFocus={this.saveFocus}
                />
              );
            }
          })}
          {
            this.loadDone && this.state.contentSlides && this.state.contentSlides.length > 1 &&
            <div className="contentGroup" ref={r => this.topButton = r}>
              <div className="btnTopWrap">
                <span className="csFocus btnTop" id="topButton">
                  <span>??? ??????</span>
                </span>
              </div>
            </div>
          }
          {
            // this.keepData.isAfterRegistration && !this.keepData.isDetail &&
            //this.loadDone && !this.isAfterRegistration &&
            mustShowSearch &&
            <SearchContents
              setFm={this.setFm}
              addFocusList={this.addFocusList}
              setFocus={this.setFocus}
              saveFocus={this.saveFocus}
              focusPrev={this.focusPrev}
              scrollTo={this.scrollTo}
              movePage={this.movePage}
            />
          }
        </div>
      </div>
    )
  }
}

export default HomeJoinAfter;
