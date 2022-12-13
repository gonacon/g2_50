// common
import React, { Fragment } from 'react';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import constants from 'Config/constants';
import appConfig from './../../../config/app-config';

// style
import 'Css/kids/genremenu/GenreMenuList.css';
import 'Css/home/Home.css';

// network
import { NXPG } from 'Network';

// util
import Utils, { divisionArray, scroll } from 'Util/utils';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';

// component
import ListItemType from 'Module/ListItemType.js';
import { SearchContents } from 'Module/Search';

// dummy data
// import GenreListItemTypeJson from '../../../assets/json/routes/kids/genremenu/GenreListItemType.json';

const { Keymap: { ENTER } } = keyCodes;
const { SYNOPSIS, SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT } = constants;

class GenreDetails extends PageView {
    constructor(props) {
        super(props);

        this.items = 6; // 한 화면의 슬라이드 개수
        this.pageNo = 1;        // 페이징
        this.pageCount = this.items * 3;    // 6개 1줄 3줄씩 호출

        if ( !this.props.history.location.state ) this.moveBack();

        let { state: locationState } = this.props.history.location;
        if ( !locationState ) {
            locationState = { depth1Title: '', depth2Title: '', gnbTypeCode: '', menuId: '', }
        }
        const { depth1Title, depth2Title,  gnbTypeCode, menuId } = locationState;
        this.state = isEmpty(this.historyData) ? {
            slideItem: [],
            slideLength: 0,
            depth1Title,
            depth2Title,
            gnbTypeCode,
            menuId,
            topBtnVisible: true,
            curFocus: 0,
            curListIdx: 0,
            totalListIdx: 0,
        } : this.historyData;

        const focusList = [
			{ key: 'gnbMenu', fm: null },
			{ key: 'grids', fm: null },
			{ key: 'topBtn', fm: null },
		];
        this.declareFocusList(focusList);

        this.defaultFM = {
            grids: new FM({
                id: 'grids',
                containerSelector: '.listWrapper',
                focusSelector: '.csFocus',
                col: this.items,
                startIdx: 0,
                onFocusChild: this.onGridItemFocus,
                onFocusKeyDown: this.onGridItemKeyDown
            }),
            topButton: new FM({
                id: 'topBtn',
                type: 'ELEMENT',
                focusSelector: '.csFocus',
                row: 1,
                col: 1,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 0,
                onFocusKeyDown: this.onKeyDownSelectTop,
                onFocusChild: this.onTopBtnFocus
            })
        }

        console.log('genre detail props', this.props);
    }

    injectRefs = (ref, idx) => {
        this[`contentGroup${idx}`] = ref;
    }

    scrollMove = (container) => {
        let top = 0;
        let offset = 0;
		if (container) top = container.offsetTop;
		let bShowMenu = true;
		if (top > 400) {
			offset = -(top - 140);
			bShowMenu = false;
		} else {
			offset = 0;
        }
		scroll(offset);
		const { showMenu } = this.props;
		showMenu(bShowMenu, true);
    }

    onGridItemKeyDown = (evt, focusIdx) => {
        if ( evt.keyCode !== ENTER ) return ;

        const { slideItem } = this.state;
        const contentGroupIdx = Math.floor(focusIdx / this.items);
        const slideItemIdx = focusIdx % this.items;
        const slideInfo = slideItem[contentGroupIdx][slideItemIdx];

		if ( slideInfo ) {
            const { menu_id, sris_id, epsd_id, synon_typ_cd, wat_lvl_cd } = slideInfo;
            const synopParam = { menu_id, sris_id, epsd_id, wat_lvl_cd };
            let path = '';
            
            switch ( synon_typ_cd ) {
                case '01': path = SYNOPSIS;
                break;
                case '02': path = SYNOPSIS;
                break;
                case '03': path = SYNOPSIS_GATEWAY;
                break;
                case '04': path = SYNOPSIS_VODPRODUCT;
                break;
                default: break;
            }
            Utils.movePageAfterCheckLevel(path, synopParam, wat_lvl_cd);
		}
    }

    onGridItemFocus = focusIdx => {
        const { gnbTypeCode, menuId, topBtnVisible, curListIdx, slideLength, totalListIdx } = this.state;
        const listIdx = Math.floor((focusIdx+1) / this.items);
        this.scrollMove(this[`contentGroup${Math.floor(focusIdx / this.items)}`]);

        if ( listIdx === Math.ceil( slideLength / this.items) - 2 && totalListIdx !== listIdx + 1 ) {    // 2줄 이전에 다음 data를 불러온다.
            const addFlag = true;
            this.setBlock(gnbTypeCode, menuId, addFlag);
        }

        this.setState({
            curFocus: focusIdx,
            curListIdx: listIdx
        });
    }

    resetFocusSetting = (topBtnVisible, slideLength) => {
        const { slideItem } = this.state;
        const lastIdx = (()=>{
            let length = 0;
            for ( let block of slideItem ) {
                length += block.length;
            }
            return length - 1;
        })();

        this.defaultFM.grids.setListInfo({
            row: slideLength,
            focusIdx: 0,
            lastIdx,
        })
        this.setFm('grids', this.defaultFM.grids)
        
        let topButtonFm = null;
        if ( topBtnVisible ) {
            topButtonFm = this.defaultFM.topButton;
        }
        this.setFm('topBtn', topButtonFm);
        this.setFocus('grids', this.state.curFocus);
    }
    
    getNextPage = () => {
        const { slideItem } = this.state;
        const slideLength = (() => {
            let length = 0;
            for ( let item of slideItem ) {
                length += item.length;
            }
            return length;
        })();

        return Math.ceil( slideLength / this.pageCount ) + 1;
    }

    setBlock = async (gnbTypeCode, menuId, addFlag) => {
        const { slideLength, slideItem } = this.state;
        const page_no = this.getNextPage();

        let NXPG006 = await NXPG.request006({menu_id: menuId, page_no, page_cnt: this.pageCount});

        if ( !NXPG006.contents ) {
            return ;
        }
        this.pageNo += 1;

        // let data = GenreListItemTypeJson.slideItem;     // dummy data
        const slideItemBefore = isUndefined(NXPG006.contents) ? [] : NXPG006.contents.map((contItem, idx) => {
            const image = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${contItem.poster_filename_v}`;
            return {
                image,
                title: contItem.title,
                epsd_id: contItem.epsd_id,
                sris_id: contItem.sris_id,
                synon_typ_cd: contItem.synon_typ_cd,
                rslu_typ_cd: contItem.rslu_typ_cd,
                adlt_lvl_cd: contItem.adlt_lvl_cd,
                wat_lvl_cd: contItem.wat_lvl_cd,
                badge: contItem.i_img_cd,
                menu_id: NXPG006.menu_id,
                userBadgeImgPath: contItem.user_badge_img_path,
                userBadgeWidthImgPath: contItem.user_badge_wdt_img_path,
            };
        });
        const addSlideLength = slideLength + slideItemBefore.length;
        const topBtnVisible = addSlideLength <=this.items ? false : true;
        if ( slideItemBefore.length > 0 ) {
            let addSlideItem = [];
            let slideItemData = divisionArray(slideItemBefore, this.items);
            if ( addFlag ) {
                addSlideItem = addSlideItem.concat(slideItem, slideItemData);
            } else {
                addSlideItem = addSlideItem.concat(slideItemData);
            }

            this.setState({
                slideItem: addSlideItem,
                slideLength: addSlideLength,
                totalListIdx: Math.ceil(NXPG006.total_count / this.items),
                topBtnVisible
            }, (prevState) => {
                this.resetFocusSetting(topBtnVisible, addSlideLength);
            });

        } else {
            this.setState({ slideItem: [], topBtnVisible: false }, () => {
                this.resetFocusSetting(topBtnVisible, addSlideLength);
            });
        }
    }

    onTopBtnFocus = () => {
        const btnOffsetTop = this.topBtn.offsetTop;
        const offsetTop = (btnOffsetTop-600)* -1;
        scroll(offsetTop);
    }

    onKeyDownSelectTop = (evt, idx) => {
        if ( evt.keyCode !== ENTER ) return ;
        this.setFocus('grids', 0);
    }

    getGnbIndex = (gnbTypeCode) => {
        let gnbIndex = {
            U5_01: 1,
            U5_02: 0,
            U5_03: 2,
            U5_04: 3,
            U5_05: 4,
            U5_06: 5,
            U5_07: 6,
            U5_08: 8,
            U5_09: 9,
            U5_10: 7,
        };
        return gnbIndex[gnbTypeCode];
    }

    scrollEnd = () => {
    }

    componentDidMount() {
        const { gnbTypeCode, menuId, topBtnVisible, slideItem } = this.state;
        const { showMenu, activeMenu, data } = this.props;

        showMenu(true, true);
        activeMenu(gnbTypeCode);
        if ( isEmpty(this.historyData) ) {
            this.setBlock(gnbTypeCode, menuId);
        } else {
            this.resetFocusSetting(topBtnVisible, slideItem.length);
        }
        this.setFm('gnbMenu', this.props.data.gnbFm);
    }

    componentDidUpdate(prevProps, prevState) {
        const { slideItem, gnbTypeCode, topBtnVisible } = this.state;
        if ( slideItem <= 0 ) {
            this.setFocus('gnbMenu', this.getGnbIndex(gnbTypeCode));
        }

        if ( !topBtnVisible ) {
            this.focusList = this.focusList.slice(0, 2);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { gnbFm } = nextProps.data;
        const { gnbTypeCode } = this.state;
        const _this = this;
        if ( this.props.data.gnbFm !== nextProps.data.gnbFm ) {
            gnbFm.setListInfo({ focusIdx: _this.getGnbIndex(gnbTypeCode) });
            this.setFm('gnbMenu', gnbFm);
        }
    }

    render() {
        const { depth1Title, depth2Title, slideItem, topBtnVisible, curFocus } = this.state;
		
        return(
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="genreMenuListWrap scrollWrap" onTransitionEnd={this.scrollEnd}>
                    <div className="menuBlockTitle" style={{paddingTop: '120px'}}>
                        <p className="highRankTitle">{ depth1Title } &gt;</p>
                        <p className="title">{ depth2Title }</p>
                    </div>
					<div className="menuBlockList">
                        { slideItem &&
                            <ListItemType slideInfo={slideItem}
                                          injectRefs={this.injectRefs}
                                          curFocus={curFocus} />
                        }
					</div>
                    { topBtnVisible &&
                        <Fragment>
                            <div className="btnTopWrap" ref={r => this.topBtn = r}>
                                <span className="csFocus btnTop" id="topBtn"><span>맨 위로</span></span>
                            </div>
                            <SearchContents
                                saveFocus={this.saveFocus}
                                setFm={this.setFm}
                                addFocusList={this.addFocusList}
                                setFocus={this.setFocus}
                                focusPrev={this.focusPrev}
                                scrollTo={this.scrollTo}
                                movePage={this.movePage}
                            />
                        </Fragment>
                    }
				</div>
			</div>
		)
    }

}
export default GenreDetails;
