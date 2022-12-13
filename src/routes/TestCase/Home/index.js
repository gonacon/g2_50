import React from 'react';
import PageView from 'Supporters/PageView';
import appConfig from 'Config/app-config';
import constants from 'Config/constants';
import FM from 'Supporters/navi';
import { NXPG, MeTV } from 'Network';
// import STB from 'Supporters/stbInterface';
import Utils from 'Util/utils';
import isEmpty from 'lodash/isEmpty';
import { SlideType } from 'Module/G2Slider';
import keyCodes from 'Supporters/keyCodes';
import BlockList, { Banner } from './components/BlockList';
import { ContentContainer, ContentGroup } from 'Module/ContentGroup';

const CODE = constants.CODE;
const KEY = keyCodes.Keymap;

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

        this.scrollTop = 0;
        this.contentRectList = new Map();

        this.declareFocusList([
            { key: 'gnbMenu', fm: null },
            { key: 'banner', fm: null },
            { key: 'recentVod', fm: null },
            { key: 'blocks', fm: [] },
            { key: 'topButton', fm: null },
        ]);
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
            onFocusKeyDown: this.onBtnTopKeydown
        });
        this.setFm('topButton', topFm);
    }

    onBtnTopKeydown = (event) => {
        if (event.keyCode === KEY.ENTER) {
            this.loadNextBlockPage();
        }
    }

    onKeyDown = (event) => {
        event.preventDefault();
        if (this.contentContainer.isBusy()) { // 스크롤 중이면 패스~!
            return;
        }
        this.handleKeyEvent(event);
    }

    update = async (props) => {
        // console.error('home::update');
        const {
            data: {
                menuId,
                gnbTypeCode
            }
        } = props;

        await this.updateBlockInfos(menuId, gnbTypeCode);
        await this.loadNextBlockPage(INITIAL_LOADING_PAGE_SIZE);
    }

    updateBannerInfo = (info) => {
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
        this.setState({
            bannerInfo
        }, () => {
            setTimeout(() => {
                this.contentContainer.adjustBy(this.topButtonContent);
            }, 1);
        });
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
            if (info.blk_typ_cd === '20') {
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
            } else if (info.scn_mthd_cd === '501' || info.scn_mthd_cd === '502') {
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
                cwIdx += cwList.length;
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
        console.error('블럭정보 리스트 업데이트:', this.blockInfos);
    }

    loadAllBlockPage = async () => {

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
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((banner, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.TRIPLE)}${banner.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: banner.menu_nm,
                                    menu_id: banner.menu_id,
                                    callUrl: banner.call_url,
                                    callTypeCode: banner.call_typ_cd,
                                    contentTypeCode: banner.cnts_type_cd
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
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((banner, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.COUPLE)}${banner.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: banner.menu_nm,
                                    menu_id: banner.menu_id,
                                    callUrl: banner.call_url,
                                    callTypeCode: banner.call_typ_cd,
                                    contentTypeCode: banner.cnts_type_cd
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
                            list = result.banners.filter(b => b.bnr_det_typ_cd !== 40).map((banner, idx) => {
                                const imagePath = `${Utils.getImageUrl(Utils.EVENT.TRIPLE)}${banner.bnr_off_img_path}`;
                                return {
                                    image: imagePath,
                                    title: banner.menu_nm,
                                    menu_id: banner.menu_id,
                                    callUrl: banner.call_url,
                                    callTypeCode: banner.call_typ_cd,
                                    contentTypeCode: banner.cnts_type_cd
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
        console.error(`블럭페이지 로딩 [페이지: ${this.loadedBlockPage + 1}]`, loadingBlocks, '===>', newBlocks);

        // 렌더 이후의 액션을 보장하기 위해서 await.
        await new Promise((res, rej) => {
            this.setState({
                blocks: newBlocks
            }, () => {
                setTimeout(() => {
                    this.contentContainer.adjustBy(this.topButtonContent);
                    res();
                }, 1);
            });
        });

        this.loadedBlockPage += loadingPageCount;
    }

    updateBanner = async () => {

    }

    setDefaultFocus = () => {
        // 일단  gnb 로 설정.
        setTimeout(() => {
            this.setFocus(0, 2);
        }, 1);
    }

    onFocusContent = async (id, idx, container) => {
        const currentblockPage = Math.floor(idx / BLOCK_CHUNK_SIZE);

        if (currentblockPage + 2 > this.loadedBlockPage) {
            await this.loadNextBlockPage();
        }
        this.scrollTo(container);
    }

    scrollTo = (anchor, marginTop) => {
        if (this.contentContainer) {
            this.contentContainer.scrollTo(anchor, marginTop);
        }
    }

    componentDidMount() {
        window.SWEAT = this;
        this.initFocus();
        const {
            data: {
                menuId,
                // gnbTypeCode,
                gnbFm
            },
            // showMenu
        } = this.props;

        // gnb fm이 있으면 설정.
        if (gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        // menuId 가 있으면 block 정보 업데이트.
        if (menuId) {
            this.update(this.props);
        }

        this.contentContainer.adjust();
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: {
                menuId: prevMenuId,
                gnbTypeCode: prevGnbTypeCode
            }
        } = this.props;
        const {
            data: {
                menuId,
                gnbTypeCode,
                gnbFm
            }
        } = nextProps;

        // gnb fm이 있으면 설정.
        const prevGnbFm = this.getFocusInfo('gnbMenu');
        if (!prevGnbFm && gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        if (menuId && (prevMenuId !== menuId || prevGnbTypeCode !== gnbTypeCode)) {
            this.update(nextProps);
        }
    }

    render() {
        const {
            isScrollDown,
            bannerInfo,
            blocks
        } = this.state;

        return (
            <div className="wrap" ref={r => this.wrapper = r}> {/* 빅베너 없을경우 bigBannerNone 클래스 추가 */}
                <div className="mainBg">
                    {/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver${(isScrollDown || this.gnbTypeCode !== CODE.GNB_HOME) ? '' : '_pip'}.png`} alt="배경이미지"/> */}
                    <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} alt="배경이미지" />
                </div>
                <ContentContainer ref={r => this.contentContainer = r}> {/* 스크롤을 하기 위해서 ref 설정*/}
                    <Banner
                        list={bannerInfo}
                        isHome={true}
                        onFocused={this.onFocusContent}
                        setFm={this.setFm}
                        innerRef={r => this.banner = r}
                    />
                    <BlockList
                        blockInfos={this.blockInfos}
                        blocks={blocks}
                        setFm={this.setFm}
                        updateRect={this.updateRect}
                        onFocused={this.onFocusContent}
                    />
                    <ContentGroup className="contentGroup" ref={r => this.topButtonContent = r}>
                        <div className="btnTopWrap">
                            <span id="topButton" className="csFocus btnTop" >
                                <span>맨 위로</span>
                            </span>
                        </div>
                    </ContentGroup>
                </ContentContainer>
            </div>
        )
    }
}


export default SweatHome;