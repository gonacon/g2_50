import { NXPG, MeTV } from "Network";
import { SlideType } from "Module/G2Slider";
import Utils from "Util/utils";
import { GNB_CODE, STB_PROP } from "Config/constants";
import StbInterface from "Supporters/stbInterface";
import isUndefined from 'lodash/isUndefined';
import appConfig from "Config/app-config";


const { ADULT_MOVIE_MENU, EROS_MENU } = STB_PROP;


// 메뉴블록에 장르별 클래스 부여
const getMenuBlockClass = (gnbTypeCode) => {
    const classnames = {
        [GNB_CODE.GNB_HOME]: 'homeGenre',
        [GNB_CODE.GNB_MOVIE]: 'movieGenre',
        [GNB_CODE.GNB_TV]: 'tvGenre',
        [GNB_CODE.GNB_ANI]: 'animationGenre',
        [GNB_CODE.GNB_KIDS]: 'kidsGenre',
        [GNB_CODE.GNB_DOCU]: 'lifeGenre',
        [GNB_CODE.GNB_SENIOR]: 'movieGenre',
    }

    return classnames[gnbTypeCode] || '';
}

const gridDataPromiseCW = (item, gnbTypeCode, isDetailedGenreHome, adultMenuProperty) => {
    return new Promise((res, rej) => {
        NXPG.request009({
            cw_call_id: item.cw_call_id_val,
            type: 'all',
            menu_id: item.menu_id,
            // stb_id: appConfig.STBInfo.stbId   //  '%7B660D7F55-89D8-11E5-ADAE-E5AC4F814417%7D'		// TODO :stb_id 변경 해야 함(현재 임시)
        }).then(data => {
            let list = data.grid ? data.grid.map((cwBlock, cwBlockIdx) => {
                return {
                    blockType: item.blk_typ_cd,
                    slideType: SlideType.TALL,
                    slideTitle: cwBlock.sub_title,
                    slideItem: (cwBlock => {
                        let newSlideItemFiltering = Utils.hideMenuCheck(cwBlock.block, isDetailedGenreHome, adultMenuProperty);

                        return newSlideItemFiltering.map((grid, idx) => {
                            return {
                                isProtection: grid.isProtection,
                                image: grid.poster_filename_v,
                                originTitle: grid.title,
                                title: grid.maskingTitle ? grid.maskingTitle : grid.title,
                                menu_id: cwBlock.menu_id,
                                sris_id: grid.sris_id,
                                epsd_id: grid.epsd_id,
                                synon_typ_cd: grid.synon_typ_cd,
                                badge: grid.i_img_cd,
                                adlt_lvl_cd: grid.adlt_lvl_cd,
                                userBadgeImgPath: grid.user_badge_img_path,
                                userBadgeWidthImgPath: grid.user_badge_wdt_img_path,
                                wat_lvl_cd: grid.wat_lvl_cd,
                                menuExposure: grid.menu_exps_prop_cd,
                            }
                        });
                    })(cwBlock),
                    menu_id: item.menu_id
                }
            }) : {
                blockType: item.blk_typ_cd,
                slideType: SlideType.TALL,
                slideTitle: '데이터 없음',
                slideItem: [],
                menu_id: item.menu_id
            };
            res(list);
        });
    })
}

// case 별 DATA 호출
const gridDataPromise = (item, gnbTypeCode, isDetailedGenreHome, adultMenuProperty) => {
    // gnbTypeCode = gnbTypeCode || this.gnbTypeCode;
    const menuBlockType = getMenuBlockClass(gnbTypeCode);

    return new Promise((res, rej) => {
        // console.log('@@@ item', item);

        // menus type 이면 menus 데이터를 사용
        if (item.blk_typ_cd === '20') {

            if (item.call_url === 'btv017' && item.scn_mthd_cd === '504') {		// 최근 시청 vod
                MeTV.request021()
                    .then(watchedVods => {
                        const vodList = watchedVods.watchList;

                        // 성인 컨텐츠는 필터링함
                        const slideItem = vodList ? vodList.map((vod, idx) => {
                            return {
                                title: Number(vod.series_no) > 0 ? `${vod.title} ${vod.series_no}회` : vod.title,
                                imgURL: vod.thumbnail,
                                bAdult: vod.adult,
                                rate: vod.watch_rt,
                                epsdId: vod.epsd_id,
                                srisId: vod.sris_id,
                                epsdRsluId: vod.epsd_rslu_id,
                            }
                        }) : [];

                        const adultFiltering = slideItem.filter(item => !(item.bAdult === 'Y'));

                        res({
                            blockType: item.blk_typ_cd,
                            slideType: SlideType.RECENT_VOD,
                            slideTitle: item.menu_nm,
                            slideItem: adultFiltering,
                            menu_id: item.menu_id
                        });
                    });
            } else {		// 메뉴 블록					
                res({
                    blockType: item.blk_typ_cd,
                    slideType: SlideType.MENU_BLOCK,
                    slideTitle: item.menu_nm_exps_yn === 'N' ? '' : item.menu_nm,
                    classOfSlideType: menuBlockType,
                    slideItem: ((item) => {
                        let list = item.menus ? Utils.hideMenuCheck(item.menus, isDetailedGenreHome, adultMenuProperty) : [];	// 성인메뉴 숨김 / 시청연령 체크
                        const refactory = list.map((itemMenu, idx) => {
                            return {
                                menuExpsPropCode: itemMenu.menu_exps_prop_cd,	// 매뉴 노출 속성 코드
                                menu_exps_prop_cd: itemMenu.menu_exps_prop_cd,	// 매뉴 노출 속성 코드
                                limitlevelYN: itemMenu.lim_lvl_yn,			// 성인물 여부
                                blockTypeCode: itemMenu.blk_typ_cd,			// 20: 블록리스트(홈처럼) / 30: 세부장르홈(그리드)
                                isProtection: itemMenu.isProtection,
                                originTitle: itemMenu.menu_nm,
                                title: itemMenu.maskingTitle ? itemMenu.maskingTitle : itemMenu.menu_nm,
                                gnbTypeCode: item.gnb_typ_cd,
                                menu_id: itemMenu.menu_id,
                                bannerExposure: itemMenu.bnr_exps_mthd_cd,
                                prc_typ_cd: itemMenu.prd_typ_cd,   // 상품 유형 코드. 30: 월정액, 34, 35: 월정액 복합상품
                                prd_prc: itemMenu.prd_prc,
                                prd_prc_vat: itemMenu.prd_prc_vat,
                                sale_prc: itemMenu.sale_prc,
                                sale_prc_vat: itemMenu.sale_prc_vat,
                                prd_prc_id: itemMenu.prd_prc_id,
                                shcut_menu_id: itemMenu.shcut_menu_id,
                                imgs: {
                                    on: itemMenu.bnr_on_img_path,
                                    off: itemMenu.bnr_off_img_path
                                },
                                scn_mthd_cd: itemMenu.scn_mthd_cd,
                                cwInfo: {
                                    cw_call_id_val: itemMenu.cw_call_id_val,
                                    blk_typ_cd: itemMenu.blk_typ_cd,
                                    menu_id: itemMenu.menu_id,
                                    scn_mthd_cd: itemMenu.scn_mthd_cd,
                                }
                            };
                        });
                        return refactory;
                    })(item),
                    menu_id: item.menu_id,
                });
            }
        } else if (item.blk_typ_cd === '30') { // 세로형 슬라이드
            // pst_exps_typ_cd === 10 가로형 슬라이드
            if (item.pst_exps_typ_cd === '10') {
                NXPG.request006({
                    menu_id: item.menu_id,
                    transactionId: 'block_by_block_gid'
                }).then(grids => {
                    res({
                        blockType: item.blk_typ_cd,
                        slideType: SlideType.HORIZONTAL,
                        slideTitle: item.menu_nm,
                        slideItem: ((item) => {
                            let newSlideItemFiltering = grids.contents ? Utils.hideMenuCheck(grids.contents, isDetailedGenreHome, adultMenuProperty) : [];

                            return newSlideItemFiltering.map((grid, i) => {
                                return {
                                    isProtection: grid.isProtection,
                                    image: grid.poster_filename_h,
                                    originTitle: grid.title,
                                    title: grid.maskingTitle ? grid.maskingTitle : grid.title,
                                    menu_id: item.menu_id,
                                    sris_id: grid.sris_id,
                                    epsd_id: grid.epsd_id,
                                    synon_typ_cd: grid.synon_typ_cd,
                                    badge: grid.i_img_cd,
                                    adlt_lvl_cd: grid.adlt_lvl_cd,
                                    wat_lvl_cd: grid.wat_lvl_cd,
                                    userBadgeImgPath: grid.user_badge_img_path,	// 세로
                                    userBadgeWidthImgPath: grid.user_badge_wdt_img_path, // 가로
                                    menuExposure: grid.menu_exps_prop_cd
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
                        slideTitle: item.menu_nm,
                        slideItem: ((item) => {
                            let newSlideItemFiltering = grids.contents ? Utils.hideMenuCheck(grids.contents, isDetailedGenreHome, adultMenuProperty) : [];
                            return newSlideItemFiltering.map((grid, i) => {
                                return {
                                    isProtection: grid.isProtection,
                                    image: grid.poster_filename_v,
                                    originTitle: grid.title,
                                    title: grid.maskingTitle ? grid.maskingTitle : grid.title,
                                    menu_id: item.menu_id,
                                    sris_id: grid.sris_id,
                                    epsd_id: grid.epsd_id,
                                    synon_typ_cd: grid.synon_typ_cd,
                                    badge: grid.i_img_cd,
                                    adlt_lvl_cd: grid.adlt_lvl_cd,
                                    userBadgeImgPath: grid.user_badge_img_path,
                                    userBadgeWidthImgPath: grid.user_badge_wdt_img_path,
                                    wat_lvl_cd: grid.wat_lvl_cd,
                                    menuExposure: grid.menu_exps_prop_cd
                                };
                            });
                        })(item),
                        menu_id: item.menu_id
                    });
                });
            }
        } else if (item.blk_typ_cd === '70') { // 이벤트 블록
            NXPG.request007({
                menu_id: item.menu_id
            }).then(grids => {
                let slideType = '';
                let size = '';
                switch (item.exps_rslu_cd) {
                    // case '10': 
                    // 	return SlideType.EVENT;
                    case '20':
                        slideType = SlideType.EVENT_COUPLE;
                        size = Utils.EVENT.COUPLE;
                        break;
                    case '30':
                        slideType = SlideType.EVENT_TRIPLE;
                        size = Utils.EVENT.COUPLE;
                        break;
                    default:
                        slideType = SlideType.EVENT;
                        size = Utils.EVENT.SINGLE;
                        break;
                }

                res({
                    blockType: item.blk_typ_cd,
                    slideType,
                    slideTitle: item.menu_nm,
                    slideItem: ((item) => {
                        if (!grids.banners) return [];
                        let bannersFiltering = grids.banners.filter(bnr => bnr.bnr_det_typ_cd !== '40'); // 40은 키즈존 캐릭터
                        return bannersFiltering.map((bnrItem, idx) => {
                            /* 이미지가 on/off 2장이 있으나 현재 퍼블리싱에는 1장을 확대/축소 하고 있음
                                on/off 처리를 하려면 퍼블리싱이 필요하고
                                하지 않는다면 on/off 이미지 중 어떤 이미지를 써야 하는지 결정이 필요합니다. 현재는 off 이미지만 사용
                            */
                            let imagPath = `${Utils.getImageUrl(size)}${bnrItem.bnr_off_img_path}`;
                            return {
                                image: imagPath,
                                title: bnrItem.menu_nm,
                                memu_id: bnrItem.menu_id,
                                callUrl: bnrItem.call_url,
                                callTypeCode: bnrItem.call_typ_cd,
                                contentTypeCode: bnrItem.cnts_typ_cd,
                                synopsisTypeCode: bnrItem.synon_typ_cd,
                                shortcutSeriesId: bnrItem.shcut_sris_id,
                                shortcutEpisodeId: bnrItem.shcut_epsd_id,
                                expsRsluCd: item.exps_rslu_cd,		// 이벤트 슬라이드 디자인 타입 결정 ( 10: 1단, 20: 2단, 30: 3단 )
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
                slideTitle: item.menu_nm,
                slideItem: [],
                menu_id: item.menu_id
            });
        }
    })
        .catch(err => console.log(err));
}


export {
    getMenuBlockClass,
    gridDataPromiseCW,
    gridDataPromise
}