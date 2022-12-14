import React from 'react';
import PageView from 'Supporters/PageView';
import { kidsConfigs } from '../config/kids-config';
import { NXPG } from 'Network';
import constants from 'Config/constants';
import '../../../assets/css/routes/kids/genremenu/GenreMenuBlock.css';
import '../../../assets/css/components/modules/GenreTitle.css';
import { isEmpty } from 'lodash';
import Utils from 'Util/utils';
import { SlideType, G2SliderDefault } from '../components/module/KidsSlider';
import { G2SlideHorizantalVOD, G2SlideVerticalVOD, G2SlideMenuVOD, G2SlideBannerA, G2SlideBannerB, G2SlideBannerC } from '../components/module/KidsSlider/G2SlideGenreMeneAll';
import keyCode from 'Supporters/keyCodes';
import FM from '../../../supporters/navi';
import appConfig from './../../../config/app-config';
import update from 'react-addons-update';
import Core from 'Supporters/core';

class GenreMenuBlock extends PageView {
	constructor(props) {
		super(props);

		if(!isEmpty(this.historyData)) {
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
                    focusKey: null,
                    parentIndex: null,
                    childIndex: null,
                    isOnHistory: false
                }
            }
            console.log('%c[this.state] ===>','color:#0000ff ', this.state);
        }
        const focusList = [
            { key: 'blocks', fm: [] },
            { key: 'bottomBtn', fm: null }
        ]
        this.declareFocusList(focusList);
	}

	static defaultProps = {};

    /*********************************** Component Lifecycle Methods ****************************************/
    componentWillMount() {
        Core.inst().showKidsWidget();
        let locationInfo = this.props.location.state;

        if (!isEmpty(locationInfo)) {
            this.setHistory({
                menuId: locationInfo.menu_id,
                prevTitle: locationInfo.menu_nm
            });
            this.handleRequestAPI(locationInfo.menu_id);
        }
    }

	componentDidMount() {
        this.props.showMenu(false);

        // ???????????? ???????????? ???????????? back ??? ?????? ??????
        const { historyInfo } = this.state;
        if(historyInfo.isOnHistory && historyInfo.focusKey !== 'blocks') {
            this.resetHistory();
        }

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
    }

    componentWillReceiveProps(nextProps) {
        // this.handleRequestAPI(this.paramData.menu_id);
    }

    /*********************************** H/E Request Methods ****************************************/
    handleRequestAPI(menuId) {
		this.handleRequsetBlockInfo(menuId);
	}

	handleRequsetBlockInfo = async (menuId) => {
		const result = await NXPG.request003({ menu_id: menuId });

		// ?????? ?????? ????????????
		let resopnseBlock = result.blocks ? result.blocks : [];
		let blocks = [], menus = [], events = [];

		resopnseBlock.forEach((block, index) => {
            const tempInfo = {
                menuId: block.menu_id,
                menuNm: block.menu_nm,
                pstExpsTypCd: block.pst_exps_typ_cd, // ????????? ?????? ?????? ??????
                blkTypCd: block.blk_typ_cd, // ?????? ?????? ??????
                expsMthdCd: block.exps_mthd_cd, // ?????? ?????? ?????? ??????

                menus: block.menus,
                blockIndex: index,
            }

            // ?????? ????????? ?????????.
            switch (tempInfo.blkTypCd) {
                case kidsConfigs.BLOCK.CONTENTS_BLOCK_CD: // ????????? ??????
                    tempInfo.slideType = tempInfo.pstExpsTypCd === kidsConfigs.POSTER_TYPE.H ?
                    SlideType.KIDS_CONTENT_HOR_SLIDE : SlideType.KIDS_CONTENT_VER_SLIDE;
                    blocks.push(tempInfo);
                    break;
                case kidsConfigs.BLOCK.MENU_BLOCK_CD: // ?????? ??????
                    tempInfo.slideType = SlideType.KIDS_MENU_SLIDE
                    menus.push(tempInfo);
                    break;
                case kidsConfigs.BLOCK.EVENT_BLOCK_CD: // ????????? ??????
                    if(tempInfo.expsRsluCd === kidsConfigs.EXPS_RSLU_CD.BANNER_C) {
                        tempInfo.slideType = SlideType.KIDS_BANNER_SLIDE_C
                    } else if(tempInfo.expsRsluCd === kidsConfigs.EXPS_RSLU_CD.BANNER_B) {
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
        console.log('[menus] ', menus);
        
        menus.map((block, index) => {
            block.blockList = [];
            if(!isEmpty(block.menus)) {
                block.blockList = block.menus.map((menus, menuIdx) => {
                    return {
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
            }
        });

        // ????????? ??????
        events.forEach((block, index) => {
            block.blockList = [];
            block.blockList = block.menus;
            delete block.menus;
        })

        blocks = blocks.concat(menus, events);
        blocks.sort((a, b) => {
            return a.blockIndex < b.blockIndex ? -1 : a.blockIndex > b.blockIndex ? 1 : 0;
		});
		
		blocks = blocks.filter((block) => {
            return !isEmpty(block.blockList)
        });

        this.setState({
            blockInfo: blocks
        }, () => {
            const { historyInfo } = this.state;
            if(historyInfo.isOnHistory) {
                if(historyInfo.focusKey === 'blocks') {
                    this.setFocus(historyInfo.parentIndex, historyInfo.childIndex);
                    this.resetHistory();
                }
            } else {
                this.setFocus(0, 0);
            }
        });
	}

    /*********************************** FocusManager KeyEvent Methods ***********************************/
    // ?????? ???????????? ????????? ?????? (onInitFocus)
	handleOnInitFocus = (fmId, idx) => {


		console.log('[KEY EVENT][onInitFocus]');
	}

	// ?????? ???????????? ????????? ?????? (onSlider)
	handleOnSlider = (idx, container) => {
		console.log('[KEY EVENT][onSlider]');
	}

	// ?????? ??????????????? ????????? ?????? (offSlider)
	handleOffSlider = () => {


		console.log('[KEY EVENT][offSlider]');
	}

	// ????????? ????????? ?????? ????????? ?????? (onFocus)
	handleOnFocusMove = (childIdx) => {
		console.log('[KEY EVENT][onFocus] childIdx : ', childIdx);
	}

	// ????????? ??? ????????? ?????? (onKeyDown)
	handleOnKeyDown = (event, parentIdx, childIdx) => {
		console.log('[KEY EVENT][onKeyDown]');
		console.log(`event : ${event.keyCode} parnetIdx : ${parentIdx} childIdx : ${childIdx}`);

        let { blockInfo, historyInfo } = this.state;
		const param = { pathName: '', state: '' }
        switch (event.keyCode) {
            case keyCode.Keymap.UP:
                this.scrollTo(parentIdx, event);
                break;

            case keyCode.Keymap.DOWN:
                if(parentIdx === blockInfo.length - 1) return;
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
                    param.wat_lvl_cd = contentInfo.watLvlCd;

                    this.setHistory({
                        menuId: historyInfo.menuId,
                        prevTitle: historyInfo.prevTitle,
                        focusKey: 'blocks',
                        parentIndex: parentIdx,
                        childIndex: childIdx,
                        isOnHistory: !historyInfo.isOnHistory
                    });
                    Utils.movePageAfterCheckLevel(param.pathName, param.state, param.wat_lvl_cd);

                } else if (blockInfo.blkTypCd === kidsConfigs.BLOCK.MENU_BLOCK_CD) {
                        if(contentInfo.blkTypCd === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
                            param.pathName = constants.KIDS_PLAYLIST;
                        } else {
                            param.pathName = constants.KIDS_PLAYBLOCK;
                        }
                        param.state = {
                            menu_id: contentInfo.menuId,
                            menu_nm: contentInfo.menuNm
                        }
                        this.setHistory({
                            menuId: historyInfo.menuId,
                            prevTitle: historyInfo.prevTitle,
                            focusKey: 'blocks',
                            parentIndex: parentIdx,
                            childIndex: childIdx,
                            isOnHistory: !historyInfo.isOnHistory
                        });
                        this.movePage(param.pathName, param.state);
                }
                break;
            default:
                break;
        }
	}

	onKeyDownBottomBtn = (event) => {
		if (event.keyCode === keyCode.Keymap.ENTER) {
            this.setState({
                scrollInfo: update(this.state.scrollInfo, {
                    transform: { $set: `translate(0px, 0px)` }
                })
            }, () => {
                this.setFocus(0, 0);
            })
		}
    }
    
    /*********************************** hisotry Methods ***********************************/
    // Set ????????????
    setHistory = (info) => {
        let tempHistory = this.state.historyInfo;
        for(let prop in info) {
            tempHistory = update(tempHistory, {
                [prop] : { $set: info[prop] }
            });        
        }
        console.log('%c[HISTORY DATA] ===>','color:#0000ff ', tempHistory);
        this.setState({ historyInfo: tempHistory });
    }

    // Get ????????????
    getHistory = (info) => {
        return this.state.historyInfo
    }

    // Reset ????????????
    resetHistory = () => {
        this.setState({ historyInfo: update(this.state.historyInfo, {
                focusKey: { $set: null },
                parentIndex: { $set: null },
                childIndex: { $set: null },
                isOnHistory: { $set: false }
            })
        })
    }

    /*********************************** Etc Methods ***********************************/
	scrollTo = (idx, event) => {
        // ????????? ????????????
        const { blockInfo, historyInfo } = this.state;
        if(blockInfo.length <= 2 && isEmpty(blockInfo)) return;

		let listArr = Array.prototype.slice.call(document.querySelectorAll('.genreMenuBlock .contentGroup'));
        let topValue = 0;

        const PADDING_VAL = 74;
        if(!isEmpty(event) && !historyInfo.isOnHistory) {
            switch(event.keyCode) {
                case keyCode.Keymap.UP :
                    if(idx === 0) return;
                    if(idx === 1) {
                        topValue = 0;
                    } else {
                        topValue = (listArr[idx - 1].offsetTop) - PADDING_VAL;
                    }
                    break;
                case keyCode.Keymap.DOWN :
                    if(idx === listArr.length - 1) return;
                    topValue = (listArr[idx + 1].offsetTop) - PADDING_VAL;
                    break;
                default:
                    break;
            }
        } else {
            topValue = (listArr[historyInfo.childIndex].offsetTop) - PADDING_VAL;
        }
        this.setState({
            scrollInfo: update(this.state.scrollInfo, {
                transform: { $set: `translate(0px, ${-topValue}px)` }
            })
        });
    }

    /*********************************** Render ***********************************/
	render() {
		const { blockInfo, historyInfo, scrollInfo } = this.state;
		const content = {
			prevTitle: '?????? ??????',
			currentTitle: historyInfo.prevTitle
		}
        const bShow = !isEmpty(blockInfo) && (blockInfo && blockInfo.length !== 0);
        
         // [HISTORY] ??????????????? ??????, Focus Index ????????????
         let getHistoryData = {};
         let childIndex = 0;
         if(historyInfo.isOnHistory) {
             getHistoryData = this.getHistory();
             childIndex = getHistoryData.isOnHistory ? getHistoryData.childIndex : 0;
         }
		
		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="genreMenuBlock scrollWrap" style={scrollInfo}>
					<div className="menuBlockTitle">
						<p className="highRankTitle">{content.prevTitle} &gt;</p>
						<p className="title">{content.currentTitle}</p>
					</div>
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
                                            case SlideType.KIDS_CONTENT_HOR_SLIDE:
                                                return(<G2SlideHorizantalVOD
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)

                                            case SlideType.KIDS_CONTENT_VER_SLIDE:
                                                return(<G2SlideVerticalVOD
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)

                                            case SlideType.KIDS_MENU_SLIDE:
                                                return(<G2SlideMenuVOD
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)
                                            case SlideType.KIDS_BANNER_SLIDE_C:
                                                return(<G2SlideBannerC
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)

                                            case SlideType.KIDS_BANNER_SLIDE_B:
                                                return(<G2SlideBannerB
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)

                                            case SlideType.KIDS_BANNER_SLIDE_A:
                                                return(<G2SlideBannerA
                                                            index={cntIdx}
                                                            lastIndex={block.blockList.length - 1}
                                                            key={cntIdx}
                                                            content={content} />)           
                                            default:
                                                return(<div key={cntIdx}></div>)
                                        }
                                    })
                                }
                            </G2SliderDefault>
                        })
					}
					<div id="bottomBtn" className="btnTopWrap">
						<span className="csFocus btnTop"><span>??? ??????</span></span>
					</div>
				</div>
			</div>
		)
	}
}

export default GenreMenuBlock;