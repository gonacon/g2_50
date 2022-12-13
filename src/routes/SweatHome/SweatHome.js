import React from 'react';
import PageView from 'Supporters/PageView';
import appConfig from 'Config/app-config';
import constants, { GNB_CODE } from 'Config/constants';
import FM from 'Supporters/navi';
import { NXPG, MeTV } from 'Network';
// import STB from 'Supporters/stbInterface';
import Utils from 'Util/utils';
import isEmpty from 'lodash/isEmpty';
import { SlideType } from 'Module/G2Slider';
import keyCodes from 'Supporters/keyCodes';
import BlockList, { Banner } from './components/BlockList';
import { ContentContainer, ContentGroup } from 'Module/ContentGroup';
import { AEDSearchContents as SearchContents } from 'Module/Search';

import { Core } from 'Supporters';
import STB from 'Supporters/stbInterface';
import HomeHeadContent from '../home/components/HomeHeadContent';

const KEY = keyCodes.Keymap;
const {
    HOME,
    MYBTV_HOME,
    CODE,
    CALL_TYPE_CD,
    STB_PROP: {
        TOOLTIPGUIDE_FLAG_HOME, TOOLTIPGUIDE_FLAG_ANI, TOOLTIPGUIDE_FLAG_DOCU, TOOLTIPGUIDE_FLAG_MOVIE, TOOLTIPGUIDE_FLAG_SENIOR, TOOLTIPGUIDE_FLAG_TV,
        ADULT_MOVIE_MENU, EROS_MENU,
    },
} = constants;
const { GNB_MONTHLY, GNB_MYBTV, GNB_HOME, GNB_MOVIE, GNB_TV, GNB_ANI, GNB_DOCU, GNB_TVAPP, HOME_TVAPP } = CODE;
const TOOLTIP_FLAG = {
    U5_03: TOOLTIPGUIDE_FLAG_HOME,
    U5_04: TOOLTIPGUIDE_FLAG_MOVIE,
    U5_05: TOOLTIPGUIDE_FLAG_TV,
    U5_06: TOOLTIPGUIDE_FLAG_ANI,
    U5_10: TOOLTIPGUIDE_FLAG_SENIOR,
    U5_08: TOOLTIPGUIDE_FLAG_DOCU,
};

// 툴팁 메세지
const tooltipMassage = {
    U5_03: 'B tv 인기영화',
    U5_04: '영화/시리즈',
    U5_05: 'TV다시보기',
    U5_06: '애니',
    U5_10: '시니어',
    U5_08: '다큐/라이프/교육',
}

// 블럭타입
const BLOCKTYPE = {
    RECENT_VOD: 'RECENT_VOD',
    MENU: 'MENU',
    TALL: 'TALL',
    WIDE: 'WIDE',
    EVENT: 'EVENT',
    EVENT_DOUBLE: 'EVENT_DOUBLE',
    EVENT_TRIPLE: 'EVENT_TRIPLE',
    CW: 'CW'
}

// 한번에 로딩할 블럭 사이즈 갯수
const BLOCK_CHUNK_SIZE = 3;
// 처음 로딩할 페이지 갯수
const INITIAL_LOADING_PAGE_SIZE = 1; // 한번에 로딩할 블럭수는 * BLOCK_CHUNK_SIZE 수

class SweatHome extends PageView {
    constructor(props) {
        super(props);

        this.state = {
            isScrollDown: false,
            points: null,
            bannerInfo: [],
            blocks: [],
            isHome: false,
            isUpdated: false
        };

        this.gnbTypeCode = null;
        this.menuId = null;

        this.blockInfos = [];
        this.cwBlockInfos = [];
        this.totalBlockCount = 0;
        this.totalBlockPage = 0; // 1 ~
        this.loadedBlockPage = 0;

        this.contentIdx = 0;

        this.loading = false;

        this.declareFocusList([
            { key: 'gnbMenu', fm: null },
            { key: 'banner', fm: null },
            { key: 'recentVod', fm: null },
            { key: 'blocks', fm: [] },
            { key: 'topButton', fm: null },
        ]);

        this.AUTO_HIDE_TIME = 15000;
        this.AUTO_HIDE = 'autoHide';
        this.ADULT_MOVIE_MENU = STB.getProperty(ADULT_MOVIE_MENU);
        this.EROS_MENU = STB.getProperty(EROS_MENU);

        this.homeOapList = []; //  홈 OAP 정보 리스트

        // 최초 실행일 경우
        // console.log('this', this);
        // console.log('this.props', props);
        // console.log('this.props.data', props.data);

        if (props && props.data) {
            const { menuId, gnbTypeCode } = props.data;
            this.menuId = menuId;
            this.gnbTypeCode = gnbTypeCode;
        }

        // 홈 / 영화시리즈 / TV 다시보기 / 애니 / 다큐라이프 / 골드존 등의 분기일 경우
        if (this.paramData) {
            this.menuId = this.paramData.menuId;
            this.gnbTypeCode = this.paramData.gnbTypeCode;
            this.mode = this.paramData.mode;
            this.detailedGenreHome = this.paramData.detailedGenreHome;
            this.titleDepth1 = this.paramData.depth1Title;
            this.titleDepth2 = this.paramData.depth2Title;

            if (this.mode === this.AUTO_HIDE) {
                this.autoHideTime = setTimeout(() => {
                    Core.inst().webVisible(false, true);
                }, this.AUTO_HIDE_TIME);
            }
        }
        if (this.gnbTypeCode === GNB_CODE.GNB_HOME) {
            this.state.isHome = true;
        }
        this.TOOLTIP_FLAG = TOOLTIP_FLAG[this.gnbTypeCode];

        // 세부 장르홈인지 판단
        this.isDetailedGenreHome = false;
        let locationState = this.props.history.location.state;
        let depth1Title = '';
        let depth2Title = '';
        if ((locationState && locationState.isDetailedGenreHome) || this.detailedGenreHome) {
            this.isDetailedGenreHome = true;
            // 세부장르홈 타이틀
            depth1Title = this.titleDepth1 || locationState.depth1Title;
            depth2Title = this.titleDepth2 || locationState.depth2Title;
        }

        if (this.historyData) {
            this.restoreState();
        }
    }

    restoreState = () => {
        // this.ADULT_MOVIE_MENU
        // this.EROS_MENU

        // state 복구
    }

    static defaultProps = {

    }

    initFocus = () => {
        const topFm = new FM({
            id: 'topButton',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onBtnTopKeydown,
            onFocusContainer: this.onFocusTopButton

        });
        this.setFm('topButton', topFm);
    }

    onBtnTopKeydown = (event) => {
        if (event.keyCode === KEY.ENTER) {
            this.setFocus({ id: 'blocks', idx: 0, focusIdx: 0 });
            const { showMenu } = this.props;
            showMenu(true, true);
            this.contentContainer.warpTo(this.bannerContent);
        }
    }

    onFocusTopButton = () => {
        this.contentContainer.scrollTo(this.topButtonContent, 606);
    }

    onKeyDown = (event) => {
        event.preventDefault();

        if (this.contentContainer.isBusy() || this.loading) { // 스크롤 중이면 패스~!
            return;
        }
        this.handleKeyEvent(event);
    }

    update = async (props) => {
        console.error('home::update');
        // const { 
        //     data: {
        //         menuId,
        //         gnbTypeCode
        //     }
        // } = props;
        const { isUpdated } = this.state;
        if (isUpdated) {
            return;
        }

        console.error('this', this);

        await this.updateBlockInfos(this.menuId, this.gnbTypeCode);
        await this.loadNextBlockPage(INITIAL_LOADING_PAGE_SIZE);

        this.setDefaultFocus();
        this.setState({
            isUpdated: true
        })
    }

    updateBannerInfo = (info) => {
        console.error('updateBannerInfo');
        const imgPath = Utils.getImageUrl(Utils.IMAGE_SIZE_BIGBANNER);
        let bannerInfo = isEmpty(info) ? [] : info.map(banner => {
            let imageN = `${imgPath}${banner.bss_img_path}`;	// 기본 이미지
            let imageS = `${imgPath}${banner.ext_img_path}`;	// 확장 이미지
            const imgs = isEmpty(banner.ext_img_path) ? { imageN } : { imageS, imageN };
            return {
                isSingle: Object.keys(imgs).length < 2,		// 이미지가 한장인지 여부
                imgs,
                callUrl: banner.call_url,
                bannerDetailTypeCode: banner.bnr_det_typ_cd,	// 배너 상세 유형 코드
                callTypeCode: banner.call_typ_cd,
                shortcutEpisodeId: banner.shcut_epsd_id,
                shortcutSeriesId: banner.shcut_sris_id,
                synopsisTypeCode: banner.synon_typ_cd,
                vasId: banner.vas_id,
                vasItemId: banner.vas_itm_id,
                vasServiceId: banner.vas_svc_id,
            }
        });

        // await new Promise((res, rej) => {
        this.setState({
            bannerInfo
        }, () => {
            setTimeout(() => {
                if (!this) {
                    return;
                }
                let insertContent = this.topButtonContent;
                if (this.isHome) {
                    insertContent = this.pointContent;
                }
                this.contentContainer.adjustBy(insertContent);
                // res();
            }, 1);
        });
        // });

        // this.setState({
        //     bannerInfo
        // }, () => {
        //     setTimeout(() => {
        //         this.contentContainer.adjustBy(this.topButtonContent);
        //     }, 1);
        // });
    }

    updateBlockInfos = async (menuId) => {
        const result003 = await NXPG.request003({ menu_id: menuId });

        const bannerInfo = result003.banners;
        this.updateBannerInfo(bannerInfo);

        const { blocks: list } = result003;
        const blockInfos = [];
        let cwIdx = 0;
        for (const info of list) {
            let type = null;
            let cwList = null;
            if (info.scn_mthd_cd === '501' || info.scn_mthd_cd === '502') {
                const cwResult = await NXPG.request009({
                    cw_call_id: info.cw_call_id_val,
                    type: 'all',
                    menu_id: info.menu_id
                });
                let cwIndex = cwIdx;
                cwList = (cwResult.grid && cwResult.grid.length !== 0) ? cwResult.grid.map((cwBlock, idx) => {
                    const blockInfo = {
                        type: BLOCKTYPE.CW,
                        title: cwBlock.sub_title,
                        cwIdx: cwIndex + idx,
                        info
                    };
                    const list = (cwBlock.block && cwBlock.block.length !== 0) ? cwBlock.block.map((item, itemIdx) => {
                        return {
                            isProtection: item.isProtection,
                            image: item.poster_filename_v,
                            title: item.maskingTitle ? item.maskingTitle : item.title,
                            menu_id: cwBlock.menu_id,
                            sris_id: item.sris_id,
                            epsd_id: item.epsd_id,
                            synon_typ_cd: item.synon_typ_cd,
                            badge: item.i_img_cd,
                            adlt_lvl_cd: item.adlt_lvl_cd,
                            userBadgeImgPath: item.user_badge_img_path,
                            userBadgeWidthImgPath: item.user_badge_wdt_img_path,
                            wat_lvl_cd: item.wat_lvl_cd,
                            menuExposure: item.menu_exps_prop_cd,
                        }
                    }) : [];
                    this.cwBlockInfos.push(list);
                    return blockInfo;
                }) : null;
                if (cwList) {
                    cwIdx += cwList.length;
                }
            } else if (info.blk_typ_cd === '20') {
                if (info.call_url === 'btv017' && info.scn_mthd_cd === '504') { // 최근시청VOD
                    type = BLOCKTYPE.RECENT_VOD; // => RECENT_VOD
                } else { // 메뉴 블럭
                    type = BLOCKTYPE.MENU; // => MENU_BLOCK
                }
            } else if (info.blk_typ_cd === '30') {
                if (info.pst_exps_typ_cd === '10') {
                    type = BLOCKTYPE.WIDE; // => HORIZONTAL
                } else {
                    type = BLOCKTYPE.TALL; // => TALL
                }
            } else if (info.blk_typ_cd === '70') {// 이벤트
                if (info.exps_rslu_cd === '20') {
                    type = BLOCKTYPE.EVENT_DOUBLE;
                } else if (info.exps_rslu_cd === '30') {
                    type = BLOCKTYPE.EVENT_TRIPLE;
                } else {
                    type = BLOCKTYPE.EVENT;
                }
            } else {
                type = BLOCKTYPE.MENU; // MENU_BLOCK
            }

            if (cwList) {
                const cnt = cwList.length;
                let i;
                for (i = 0; i < cnt; i++) {
                    const blockInfo = cwList[i];
                    blockInfos.push(blockInfo);
                }
            } else {
                const blockInfo = {
                    type,
                    title: info.menu_nm,
                    info
                };
                blockInfos.push(blockInfo);
            }
        }

        this.blockInfos = blockInfos;
        const cntBlocks = list.length;
        this.totalBlockCount = cntBlocks;
        this.totalBlockPage = Math.ceil(cntBlocks / BLOCK_CHUNK_SIZE);
        // console.error('블럭정보 리스트 업데이트:', this.blockInfos);
    }

    loadNextBlockPage = async (loadingPageCount = 1) => {
        if (this.loading) {
            console.error('블럭데이터를 로딩중이라 그냥 리턴');
            return;
        }
        if (this.totalBlockPage === this.loadedBlockPage) {
            // console.error('로드할 블럭 페이지가 없음');
            return;
        }

        this.loading = true;
        const start = this.loadedBlockPage * BLOCK_CHUNK_SIZE;
        const loadingBlocks = this.blockInfos.slice(start, start + BLOCK_CHUNK_SIZE * loadingPageCount);

        const promiseList = loadingBlocks.map((blockinfo, idx) => {
            const { info } = blockinfo;
            switch (blockinfo.type) {
                case BLOCKTYPE.RECENT_VOD:
                    return new Promise(async (res, rej) => {
                        const result = await MeTV.request021({});
                        //const result = STB.requestRecentVodList();
                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.watchList && result.watchList.length !== 0) {
                            list = result.watchList.map((vod, idx) => {
                                return {
                                    title: vod.title,
                                    image: vod.thumbnail,
                                    bAdult: vod.adult,
                                    rate: vod.watch_rt,
                                    epsdId: vod.epsd_id,
                                    srisId: vod.sris_id,
                                    epsdRslId: vod.epsd_rslu_id
                                }
                            });
                        };
                        res({
                            slideType: SlideType.RECENT_VOD,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.MENU:
                    return new Promise((res, rej) => {
                        const title = blockinfo.title;
                        let list = [];
                        if (info.menus && info.menus.length !== 0) {
                            list = info.menus.map((menu, idx) => {
                                return {
                                    title: menu.menu_nm,
                                    gnbTypeCode: menu.gnb_typ_cd,
                                    menu_id: menu.menu_id,
                                    blockTypeCode: menu.blk_typ_cd,
                                    isProtections: true,
                                    bannerExposure: menu.bnr_exps_mthd_cd,
                                    prc_typ_cd: menu.prd_typ_cd,
                                    prd_prc: menu.prd_prc,
                                    prd_prc_vat: menu.prd_prc_vat,
                                    sale_prc: menu.sale_prc,
                                    sale_prc_vat: menu.sale_prc_vat,
                                    prd_prc_id: menu.prd_prc_id,
                                    shcut_menu_id: menu.shcut_menu_id,
                                    imgs: {
                                        on: menu.bnr_on_img_path,
                                        off: menu.bnr_off_img_path
                                    },
                                    scn_mthd_cd: menu.scn_mthd_cd,
                                    cwInfo: {
                                        cw_call_id_val: menu.cw_call_id_val,
                                        blk_typ_cd: menu.blk_typ_cd,
                                        menu_id: menu.menu_id,
                                        scn_mthd_cd: menu.scn_mthd_cd
                                    }
                                };
                            });
                        }
                        res({
                            slideType: SlideType.MENU_BLOCK,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.CW:
                    return new Promise(async (res, rej) => {
                        const title = blockinfo.title;
                        const list = this.cwBlockInfos[blockinfo.cwIdx];
                        res({
                            slideType: SlideType.TALL,
                            title,
                            list,
                        });
                    });
                case BLOCKTYPE.TALL:
                    return new Promise(async (res, rej) => {
                        const result = await NXPG.request006({ menu_id: info.menu_id });

                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.contents && result.contents.length !== 0) {
                            list = result.contents.map((vod, idx) => {
                                return {
                                    image: vod.poster_filename_v,
                                    title: vod.title,
                                    menu_id: info.menu_id,
                                    sris_id: vod.sris_id,
                                    epsd_id: vod.epsd_id,
                                    synon_typ_cd: vod.synon_typ_cd,
                                    badge: vod.i_img_cd,
                                    adlt_lvl_cd: vod.adlt_lvl_cd,
                                    wat_lvl_cd: vod.wat_lvl_cd,
                                    // TODO:
                                    isProtection: false,
                                    userBadgeImgPath: vod.user_badge_img_path,
                                    userBadgeWidthImgPath: vod.user_badge_wdt_img_path,
                                    menuExposure: vod.menu_exps_prop_cd

                                }
                            });
                        }
                        res({
                            slideType: SlideType.TALL,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.WIDE:
                    return new Promise(async (res, rej) => {
                        const result = await NXPG.request006({ menu_id: info.menu_id });

                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.contents && result.contents.length !== 0) {
                            list = result.contents.map((vod, idx) => {
                                return {
                                    image: vod.poster_filename_h,
                                    menu_id: info.menu_id,
                                    sris_id: vod.sris_id,
                                    epsd_id: vod.epsd_id,
                                    synon_typ_cd: vod.synon_typ_cd,
                                    badge: vod.i_img_cd,
                                    adlt_lvl_cd: vod.adlt_lvl_cd,
                                    wat_lvl_cd: vod.wat_lvl_cd
                                };
                            });
                        }
                        res({
                            slideType: SlideType.HORIZONTAL,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.EVENT:
                    return new Promise(async (res, rej) => {
                        const result = await NXPG.request007({ menu_id: info.menu_id });

                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.banners && result.banners.length !== 0) {
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((bnrItem, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.TRIPLE)}${bnrItem.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: bnrItem.menu_nm,
                                    memu_id: bnrItem.menu_id,
                                    callUrl: bnrItem.call_url,
                                    callTypeCode: bnrItem.call_typ_cd,
                                    contentTypeCode: bnrItem.cnts_typ_cd,
                                    synopsisTypeCode: bnrItem.synon_typ_cd,
                                    shortcutSeriesId: bnrItem.shcut_sris_id,
                                    shortcutEpisodeId: bnrItem.shcut_epsd_id,
                                    expsRsluCd: 10,		// 이벤트 슬라이드 디자인 타입 결정 ( 10: 1단, 20: 2단, 30: 3단 )
                                };
                            });
                        }
                        res({
                            slideType: SlideType.EVENT,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.EVENT_DOUBLE:
                    return new Promise(async (res, rej) => {
                        const result = await NXPG.request007({ menu_id: info.menu_id });

                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.banners && result.banners.length !== 0) {
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((bnrItem, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.COUPLE)}${bnrItem.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: bnrItem.menu_nm,
                                    memu_id: bnrItem.menu_id,
                                    callUrl: bnrItem.call_url,
                                    callTypeCode: bnrItem.call_typ_cd,
                                    contentTypeCode: bnrItem.cnts_typ_cd,
                                    synopsisTypeCode: bnrItem.synon_typ_cd,
                                    shortcutSeriesId: bnrItem.shcut_sris_id,
                                    shortcutEpisodeId: bnrItem.shcut_epsd_id,
                                    expsRsluCd: 20,		// 이벤트 슬라이드 디자인 타입 결정 ( 10: 1단, 20: 2단, 30: 3단 )
                                };
                            });
                        }
                        res({
                            slideType: SlideType.EVENT_COUPLE,
                            title,
                            list
                        });
                    });
                case BLOCKTYPE.EVENT_TRIPLE:
                    return new Promise(async (res, rej) => {
                        const result = await NXPG.request007({ menu_id: info.menu_id });
                        const title = blockinfo.title;
                        let list = [];
                        if (result && result.banners && result.banners.length !== 0) {
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((bnrItem, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.TRIPLE)}${bnrItem.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: bnrItem.menu_nm,
                                    memu_id: bnrItem.menu_id,
                                    callUrl: bnrItem.call_url,
                                    callTypeCode: bnrItem.call_typ_cd,
                                    contentTypeCode: bnrItem.cnts_typ_cd,
                                    synopsisTypeCode: bnrItem.synon_typ_cd,
                                    shortcutSeriesId: bnrItem.shcut_sris_id,
                                    shortcutEpisodeId: bnrItem.shcut_epsd_id,
                                    expsRsluCd: 30,		// 이벤트 슬라이드 디자인 타입 결정 ( 10: 1단, 20: 2단, 30: 3단 )
                                };
                            });
                        }
                        res({
                            slideType: SlideType.EVENT_TRIPLE,
                            title,
                            list
                        });
                    });
                default: break;
            }
        })

        const blocks = await Promise.all(promiseList);
        this.loading = false;
        const newBlocks = [...this.state.blocks];
        newBlocks.push(...blocks);
        // console.error(`블럭페이지 로딩 [페이지: ${this.loadedBlockPage +1}]`, loadingBlocks, '===>', newBlocks);

        // 렌더 이후의 액션을 보장하기 위해서 await.
        await new Promise((res, rej) => {
            this.setState({
                blocks: newBlocks
            }, () => {
                setTimeout(() => {
                    console.error('block update');
                    if (!this) {
                        return;
                    }
                    this.contentContainer.adjustBy(this.topButtonContent);
                    res();
                }, 1);
            });
        });

        this.loadedBlockPage += loadingPageCount;
    }

    setDefaultFocus = () => {
        // 일단  gnb 로 설정.
        setTimeout(() => {
            this.setFocus({ id: 'blocks', idx: 0, focusIdx: 0 });
        }, 1);
    }

    onFocusContent = async (id, idx, content) => {
        // console.error('onFocusContent', id, idx, content);
        const { showMenu } = this.props;
        const currentblockPage = Math.floor(idx / BLOCK_CHUNK_SIZE);
        if (currentblockPage + 2 > this.loadedBlockPage) { // 현재 페이지 + 2 이상의 페이지로 이동했을 시 로딩
            await this.loadNextBlockPage();
        }

        const { blocks } = this.state;

        let marginTop = 20;
        if (id === 'banner') {
            marginTop = 0;
        } else if (id === 'blocks') {
            if (idx === 0) {
                marginTop = 360;
                showMenu(true, true);
            } else if (idx === 1) {
                showMenu(false, true);
            } else if (idx === blocks.length - 1) {
                this.contentContainer.scrollTo(this.topButtonContent, 606);
                return;
                // marginTop = 150;
            }
        }

        this.scrollTo(content, marginTop);
    }

    scrollTo = (anchor, marginTop) => {
        if (this.contentContainer) {
            this.contentContainer.scrollTo(anchor, marginTop);
        }
    }

    componentDidMount() {
        console.error('home.didMount');
        window.SWEAT = this;
        this.initFocus();
        const {
            data: {
                menuId,
                gnbTypeCode,
                gnbFm
            },
            showMenu
        } = this.props;

        // gnb fm이 있으면 설정.
        if (gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        if (showMenu) {
            showMenu(true, false);
        }

        // menuId 가 있으면 block 정보 업데이트.
        if (this.menuId) {
            console.error(`didmount에서 세팅된 menuId가 있음 => menuId: ${this.menuId}, gnbTypeCode: ${gnbTypeCode}`)
            this.update();
        } else if (menuId) {
            this.menuId = menuId;
            this.gnbTypeCode = gnbTypeCode;
            console.error(`menuId: ${this.menuId}, gnbTypeCode: ${gnbTypeCode}`)
            this.update()
        }

        this.contentContainer.adjust();
    }

    componentWillReceiveProps(nextProps) {
        console.error('home.receive');
        const {
            data: {
                menuId: prevMenuId,
                gnbTypeCode: prevGnbTypeCode
            },
            showMenu
        } = this.props;
        const {
            data: {
                menuId,
                gnbTypeCode,
                gnbFm
            }
        } = nextProps;

        // if (showMenu) {
        //     showMenu(true)
        // }

        // gnb fm이 있으면 설정.
        const prevGnbFm = this.getFocusInfo('gnbMenu');
        if (!prevGnbFm && gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        if (menuId && (prevMenuId !== menuId || prevGnbTypeCode !== gnbTypeCode)) {
            this.menuId = menuId;
            this.gnbTypeCode = gnbTypeCode;
            // console.error(`receive ==> menuId: ${this.menuId}, gnbTypeCode: ${this.gnbTypeCode}`)
            this.update();
        }
    }

    render() {
        const {
            isScrollDown,
            bannerInfo,
            blocks,
            isUpdated,
            isHome
        } = this.state;
        console.log('render isHome', isHome);

        return (
            <div className="wrap" ref={r => this.wrapper = r}> {/* 빅베너 없을경우 bigBannerNone 클래스 추가 */}
                <div className="mainBg">
                    {/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver${(isScrollDown || this.gnbTypeCode !== CODE.GNB_HOME) ? '' : '_pip'}.png`} alt="배경이미지"/> */}
                    <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} alt="배경이미지" />
                </div>
                <ContentContainer ref={r => this.contentContainer = r}> {/* 스크롤을 하기 위해서 ref 설정*/}
                    <Banner
                        id="banner"
                        list={bannerInfo}
                        isHome={true}
                        onFocused={this.onFocusContent}
                        setFm={this.setFm}
                        innerRef={r => this.banner = r}
                        contentRef={r => this.bannerContent = r}
                    />
                    {/* Coupon, B points */}
                    {isHome && <HomeHeadContent contentRef={r=>this.pointContent=r}/>}
                    <BlockList
                        gnbTypeCode={this.gnbTypeCode} // 실제 렌더에 필요한 데이터를 만들기 이전에 this.gnbTypeCode 가 세팅되어 있다.....고 가정.
                        blockInfos={this.blockInfos}
                        blocks={blocks}
                        setFm={this.setFm}
                        updateRect={this.updateRect}
                        onFocused={this.onFocusContent}
                    />
                    <ContentGroup className="contentGroup" ref={r => this.topButtonContent = r} style={{ visibility: isUpdated ? 'visible' : 'hidden' }}>
                        <div className="btnTopWrap">
                            <span id="topButton" className="csFocus btnTop" >
                                <span>맨 위로</span>
                            </span>
                        </div>
                    </ContentGroup>
                    <SearchContents
                        setFm={this.setFm}
                        addFocusList={this.addFocusList}
                        setFocus={this.setFocus}
                        focusPrev={this.focusPrev}
                        scrollTo={this.scrollTo}
                        movePage={this.movePage}
                        style={{ visibility: isUpdated ? 'visible' : 'hidden' }}
                    />
                </ContentContainer>
            </div>
        )
    }
}


export default SweatHome;