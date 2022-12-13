// commons
import React from 'react';
import PageView from 'Supporters/PageView';
import constants, { GNB_CODE } from 'Config/constants';
import { Core } from 'Supporters';
import { CTSInfo } from 'Supporters/CTSInfo';
import keyCodes from 'Supporters/keyCodes';
import StbInterface from 'Supporters/stbInterface';
import FM from 'Supporters/navi';
import appConfig from '../../../config/app-config';

// utils
import { isEmpty, isEqual, cloneDeep } from 'lodash';
import Utils, { scroll, /*getByteLength*/ } from 'Util/utils';
import { gridDataPromiseCW, gridDataPromise } from '../dataFatory/homeUtils';

// network
import { NXPG, MeTV } from 'Network';

// style
import 'Css/home/Home.css';
import 'Css/home/HomeTestPage.css';

// components
import HomeHeadContent from "../components/HomeHeadContent";
import BigBanner from '../components/BigBanner';
import { SlideType } from 'Module/G2Slider';
import Blocks from './Blocks';
import ToolGuide from 'Module/UI/ToolGuide';
import AdultCertification from '../../../popup/AdultCertification';
import { SearchContents } from 'Module/Search';

const { /*ALL_MENU, EPG,*/
	SYNOPSIS, SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT,
	HOME, HOME_MOVIE, HOME_ANI, HOME_DOCU, HOME_TV, DETAIL_GENRE_HOME, MYBTV_HOME, MONTHLY_AFTER,
	CODE,
	CALL_TYPE_CD,
	STB_PROP: {
		TOOLTIPGUIDE_FLAG_HOME, TOOLTIPGUIDE_FLAG_ANI, TOOLTIPGUIDE_FLAG_DOCU, TOOLTIPGUIDE_FLAG_MOVIE, TOOLTIPGUIDE_FLAG_SENIOR, TOOLTIPGUIDE_FLAG_TV,
		ADULT_MOVIE_MENU, EROS_MENU, CHILDREN_SEE_LIMIT
	},
	CERT_TYPE,
	PRD_TYP_CD
} = constants;
const { GNB_MONTHLY, GNB_MYBTV, GNB_HOME, GNB_MOVIE, GNB_TV, GNB_ANI, GNB_DOCU, GNB_TVAPP, HOME_TVAPP } = CODE;
const { Keymap: { ENTER, DOWN, UP } } = keyCodes;
// const AGE_LIMIT = appConfig.STBInfo.level;

const TOOLTIP_FLAG = {
	U5_03: TOOLTIPGUIDE_FLAG_HOME,
	U5_04: TOOLTIPGUIDE_FLAG_MOVIE,
	U5_05: TOOLTIPGUIDE_FLAG_TV,
	U5_06: TOOLTIPGUIDE_FLAG_ANI,
	U5_10: TOOLTIPGUIDE_FLAG_SENIOR,
	U5_08: TOOLTIPGUIDE_FLAG_DOCU,
};
const tooltipMassage = {
	U5_03: 'B tv 인기영화',
	U5_04: '영화/시리즈',
	U5_05: 'TV다시보기',
	U5_06: '애니',
	U5_10: '시니어',
	U5_08: '다큐/라이프/교육',
}

class HomeDynamic extends PageView {
	constructor(props) {
		super(props);

		this.VIEW_ROW = 5;
		this.blocksList = [];
		this.contentList = [];
		// const { menuId, gnbTypeCode, gnbFm } = this.props.data;
		this.menuId = null;
		this.gnbTypeCode = null;
		this.gnbFm = null;
		this.searchTrigger = false;
		this.mode = '';
		this.autoHideTime = '';
		this.AUTO_HIDE = 'autoHide';
		this.bannerSlider = '';
		this.isKeyResume = true;
		console.log('====================================');
		console.log('HomeDynacim constructor this.props=', this.props);
		console.log('HomeDynacim constructor this.historyData=', this.historyData);
		console.log('HomeDynacim constructor this.paramData=', this.paramData);
		console.log('====================================');
		if (!isEmpty(this.props.data)) {
			const { menuId, gnbTypeCode } = this.props.data;
			this.menuId = menuId;
			this.gnbTypeCode = gnbTypeCode;
		}

		if (!isEmpty(this.paramData)) {
			this.menuId = this.paramData.menuId;
			this.gnbTypeCode = this.paramData.gnbTypeCode;
			this.mode = this.paramData.mode;  // from_setting - 설정에서 종료 후 홈 들어가야될 경우,  autoHide  - 부팅 후 자동 홈 모드로 홈 진입한 경우 (10 초 후 사용자의 입력이 없는 경우 홈 화면 Hide 처리)
			this.detailedGenreHome = this.paramData.detailedGenreHome;

			if (this.mode === this.AUTO_HIDE) {
				// 사용자 입력이 10초동안 없는 경우 자동 hide 처리
				this.autoHideTime = setTimeout(() => {
					Core.inst().webVisible(false, true);
				}, 10000);
			}
		}

		// 세부 장르홈인지 판단
		this.isDetailedGenreHome = false;
		if ((this.props.history.location.state && this.props.history.location.state.isDetailedGenreHome) || this.detailedGenreHome) {
			this.isDetailedGenreHome = true;
		}

		/*
			PROPERTY_CHILDREN_SEE_LIMIT_SETTING : 자녀안심 시청 적용 범위 (Value - btv 전체 : btv, 키즈존만 : KIDS)
			CHILDREN_SEE_LIMIT : 등급제한 	시청연령제한 (0, 7, 12, 15, )
			ADULT_MOVIE_MENU : 19영화 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
			EROS_MENU : 19플러스 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
		*/

		this.ADULT_MOVIE_MENU = StbInterface.getProperty(ADULT_MOVIE_MENU);
		this.EROS_MENU = StbInterface.getProperty(EROS_MENU);
		this.CHILDREN_SEE_LIMIT = StbInterface.getProperty(CHILDREN_SEE_LIMIT);
		console.log('%c STB INFO', 'color: balck; background: white; font-size: 14px;', {
			'시청연령제한': this.CHILDREN_SEE_LIMIT,
			'19영화': this.EROS_MENU,
			'19플러스': this.ADULT_MOVIE_MENU
		});

		this.TOOLTIP_FLAG = TOOLTIP_FLAG[this.gnbTypeCode];
		// StbInterface.setProperty(this.TOOLTIP_FLAG, '');

		this.state = isEmpty(this.historyData) ? {
			bigBanner: [],		// 빅배너 state에 type 키로 월정액 인지 아닌지를 구분 : bigBanner.bannerType ( 'monthly', 'normal' )
			homeData: {
				bPoint: { new: false, count: 0 },
				coupon: { new: false, count: 0 }
			},
			isHome: false,
			contentSlides: [],
			curGnbMenuId: '',
			curGnbTypeCode: '',
			changeMenuTrigger: true,
			headEndCallEnd: false,
			focusData: {
				key: 'blocks',
				listIdx: 0,
				itemIdx: 0
			},
			isScrolling: false,
			isTooltipGuided: false,
		} : this.historyData;

		this.homeOapList = [];  // 홈 OAP 정보 리스트

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
				onFocusChild: this.onFocusChildTopButton
			})
		}

		const focusList = [
			{ key: 'gnbMenu', fm: null },
			{ key: 'banner', fm: null },
			{ key: 'blocks', fm: [] },
			{ key: 'topButton', fm: null },
		];
		this.declareFocusList(focusList);

		this.ime = appConfig.runDevice ? window.tvExt.utils.ime : {
			setKeyboardMode: () => { },
			setEnableSoftKeyboard: () => { },
			setSearchMode: () => { },
			sendKeyEvent: () => { }
		};

		this.ime.onSearchMode = (mode) => { };
		this.ime.onChunjiinMode = (event) => { };
		this.ime.onOKEvent = (event) => { };
		this.ime.onKeyboardMode = (mode) => { };

		this.ime.setSearchMode(false);
	}

	onKeyDown(evt) {
		if (this.isKeyResume) {
			super.onKeyDown(evt);
			// 사용자 입력이 10초동안 없는 경우 자동 hide 처리
			if (this.mode === this.AUTO_HIDE) {
				clearTimeout(this.autoHideTime);
			}
		}
	}

	setBlock = async (menuId, gnbTypeCode) => {
		gnbTypeCode = gnbTypeCode || this.gnbTypeCode;
		const result003 = await NXPG.request003({ menu_id: menuId });

		// 빅배너 설정
		let { banners } = result003;
		const imgPath = Utils.getImageUrl(Utils.IMAGE_SIZE_BIGBANNER);
		let bigBanner = isEmpty(banners) ? [] : banners.map(banner => {
			let imageN = `${imgPath}${banner.bss_img_path}`;	// 기본 이미지
			let imageS = `${imgPath}${banner.ext_img_path}`;	// 확장 이미지
			const imgs = (() => {
				if (isEmpty(banner.ext_img_path)) {
					return { imageN };
				} else {
					return { imageS, imageN };
				}
			})();
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

		// 블록 리스트
		this.blocksList = isEmpty(result003.blocks) ? [] : result003.blocks.map(item => {
			return {
				blk_typ_cd: item.blk_typ_cd,
				menu_id: item.menu_id,
				gnb_typ_cd: item.gnb_typ_cd,
				title: item.menu_nm,
				scn_mthd_cd: item.scn_mthd_cd || '',
				cw_call_id_val: item.cw_call_id_val,
				menus: item.menus,
				call_url: item.call_url,
				pst_exps_typ_cd: item.pst_exps_typ_cd,
				menu_nm: item.menu_nm,
				exps_rslu_cd: item.exps_rslu_cd,
				exps_mthd_cd: item.exps_mthd_cd,
			}
		});
		console.log('setBlock this.blocksList.length=%s' + this.blocksList.length);

		this.contentList = [];
		let cnt = this.blocksList.length < this.VIEW_ROW ? this.blocksList.length : this.VIEW_ROW;

		for (let i = 0; i < cnt; i++) {
			const block = this.blocksList[i];
			({ i, cnt } = await this.gridDataPromise(block, gnbTypeCode, i, cnt));
		}

		// 보유 쿠폰 및 포인트 정보 호출
		if (gnbTypeCode === GNB_CODE.GNB_HOME) {
			// this.inquiryPointAndCoupon();
			Utils.requestCouponsPointInfo(this.callbackCouponsPointInfo);
		}
		// let EPS300 = await EPS.request300();
		// console.log('%c EPS-300', 'color: red; background: pink', EPS300);

		// setState
		this.setState({
			contentSlides: this.contentList,
			bigBanner,
		}, () => {
			this.restoreFocus();

			// this.requestHomeOapInfo();

			// setTimeout(() => {
			// 	this.getRemainingBlockList();
			// }, 50);
		});
	}

	// inquiryPointAndCoupon = () => {
	// let pointCouponInfoState = {
	// 	isHome: true,
	// 	homeData: {
	// 		bPoint: { new: false, count: 0 },
	// 		coupon: { new: false, count: 0 }
	// 	}
	// };

	// this.setState({
	// 	...pointCouponInfoState
	// })
	// }

	// 맨 위로 버튼 enter 일때
	onKeyDownTopButton = (evt) => {
		const { keyCode } = evt;

		// ENTER
		if (keyCode === ENTER) {
			this.setFocus('blocks', 0);
		}

		// DOWN
		if (keyCode === DOWN) {
			// console.log('%c this.focusList', 'color: red; background: yellow', this.focusList);
		}
	}

	// 맨 위로 버튼 Focus 될 때
	onFocusChildTopButton = () => {
		this.scrollTo(this.topButton, 522);
		console.log('onFocusChildTopButton', this.searchTrigger);
		if (this.searchTrigger) {
			this.searchTrigger = false;
			const scrollWrap = document.querySelector('.scrollWrap');
			const searchWrapper = document.querySelector('.searchWrapper');
			const searchWrapperHeight = searchWrapper.clientHeight;
			let curStyle = scrollWrap.style.transform;
			let posX = +curStyle.replace(/translate\(|\)|px|\s/gi, '').split(',')[1];
			searchWrapper.classList.remove('active');
			console.log('top sum = ' + (posX + searchWrapperHeight));

			scrollWrap.style.transform = `translate(0px, ${posX + searchWrapperHeight}px)`;
		}
	}

	// menu block enter 일때
	onSelectMenuBlock = (slideIdx, idx) => {
		const { contentSlides } = this.state;
		const sliderInfo = contentSlides[slideIdx];
		const menuInfo = sliderInfo.slideItem[idx];
		const { gnbTypeCode, menu_id, blockTypeCode, limitlevelYN, menuExpsPropCode } = menuInfo;

		let movePagePath = {
			U5_03: HOME,
			U5_04: HOME_MOVIE,
			U5_05: HOME_TV,
			U5_06: HOME_ANI,
			U5_08: HOME_DOCU
		};

		const path = blockTypeCode === '30' ? DETAIL_GENRE_HOME : HOME;
		const level = limitlevelYN === 'Y' ? 19 : 0;
		const param = {
			gnbTypeCode,
			menuId: menu_id,
			depth1Title: sliderInfo.slideTitle,
			depth2Title: menuInfo.title,
			isDetailedGenreHome: true,
		};

		const eros = this.EROS_MENU;
		const adult = this.ADULT_MOVIE_MENU;

		if (menuInfo.prc_typ_cd === PRD_TYP_CD.PPM) {
			Utils.moveMonthlyPage(MONTHLY_AFTER, menuInfo);
			return;
		}

		if (this.CHILDREN_SEE_LIMIT === '0') {
			Core.inst().move(path, param);
			return;
		}

		if (menuExpsPropCode === '29' || menuExpsPropCode === '30') {
			let certificationType;
			if (menuExpsPropCode === '29') {
				if (adult === '0') {
					certificationType = CERT_TYPE.PROTECTION;
				} else if (adult === '1') {
					certificationType = CERT_TYPE.ADULT_SELECT;
				}
			} else {
				if (eros === '0') {
					certificationType = CERT_TYPE.PROTECTION;
				} else if (eros === '1') {
					certificationType = CERT_TYPE.ADULT_SELECT;
				}
			}
			Core.inst().showPopup(
				<AdultCertification />,
				{
					certification_type: certificationType,
					age_type: '',
				},
				response => {
					const ADULTMOVIEMENU = StbInterface.getProperty(ADULT_MOVIE_MENU);
					const EROSMENU = StbInterface.getProperty(EROS_MENU);

					if (certificationType === CERT_TYPE.PROTECTION) {
						if (menuExpsPropCode === '29' && ADULTMOVIEMENU === '1')
							Core.inst().move(path, param);
						else if (menuExpsPropCode === '30' && EROSMENU === '1') {
							Core.inst().move(path, param);
						}
					} else {
						if (response.result === "0000") {
							Core.inst().move(path, param)
						}
					}

				}
			)
		} else {
			//일반
			Utils.movePageAfterCheckLevel(path, param, level);
		}
	}

	getPageToCode = (gnbTypeCode, menuId) => {
		let gnbTypeCodeToPageMove = {
			[GNB_MONTHLY]: `${HOME}/${gnbTypeCode}/${menuId}`,
			[GNB_MYBTV]: MYBTV_HOME,
			[GNB_HOME]: HOME,
			[GNB_MOVIE]: `${HOME}/${gnbTypeCode}/${menuId}`,
			[GNB_TV]: `${HOME}/${gnbTypeCode}/${menuId}`,
			[GNB_ANI]: `${HOME}/${gnbTypeCode}/${menuId}`,
			// [GNB_KIDS]: kidsFirstCheck,
			[GNB_DOCU]: `${HOME}/${gnbTypeCode}/${menuId}`,
			[GNB_TVAPP]: HOME_TVAPP,
		};

		return gnbTypeCodeToPageMove[gnbTypeCode];
	}

	// 찜(즐겨찾기) 목록 확인
	inquiryFavorit = async (sris_id, epsd_id) => {
		// const bookmark = await StbInterface.reqeustFavoriteVodInfo({
		//     type: 'select',
		//     seriesId: sris_id
		// });
		// return bookmark.isFavorite
		let flag = false;
		const bookmark = await MeTV.request011({ group: 'VOD' });

		for (let item of bookmark.bookmarkList) {
			if (item.epsd_id === epsd_id && item.sris_id === sris_id) {
				flag = true;
			}
		}

		return flag;
	}

	// 찜키 선택 시
	onSelectFavorite = async (slideIdx, idx) => {
		const { contentSlides } = this.state;
		const slideItem = contentSlides[slideIdx].slideItem[idx];
		const { sris_id, epsd_id, menu_id, title } = slideItem;
		const isFavorite = await this.inquiryFavorit(sris_id, epsd_id);
		const xpg010 = await NXPG.request010({
			menu_id,
			sris_id,
			epsd_id,
			search_type: '1',
		});

		if (isFavorite) {
			// 해제
			const param = {
				group: 'VOD',
				yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				isAll_type: '0',
				deleteList: [sris_id],
				sris_id: sris_id,
			};
			let bookmarkDelete = await Utils.bookmarkDelete(param, 'D');
			if (bookmarkDelete.result === '0000') {
				Core.inst().showToast(title, '찜 등록 해제되었습니다.', 3000);
			} else {
				Core.inst().showToast('찜 등록에 실패 하였습니다.', '', 3000);
			}
		} else {
			// 등록
			// group (VOD 콘텐츠: "VOD", TV App: "VAS", Live Channel: "IPTV")
			// sris_id (VOD 콘텐츠: epsd_id, TV App: content_id, Live Channel: serviceId)
			let bookmarkAdd = await Utils.bookmarkCreate({
				group: 'VOD',
				yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				sris_id: sris_id,
				epsd_id: epsd_id,
				epsd_rslu_id: xpg010.contents.epsd_rslu_info[0].epsd_rslu_id
			});

			if (bookmarkAdd.result === '0000') {
				Core.inst().showToast(title, '찜 등록 되었습니다.', 3000);
			} else {
				Core.inst().showToast('찜 등록에 실패 하였습니다.', '', 3000);
			}

		}

		// TODO: 찜 기능을 구현
	}

	// oap 상태 전달 bool = {true : pip 보이기,  false : pip 감추기}
	onOapPlayState = (bool) => {
		let state = bool ? 'none' : 'block';
		// console.log('onOapPlayState bool=', bool);
		try {
			if (this.state.isHome) {
				// focus 2 넘어가면 
				if (this.focusIndex > 2) {
					state = 'block';
				} else {
					state = 'block';
					console.log('this.bannerSlider.isOapPlayState()=', this.bannerSlider.isOapPlayState());

					if (this.bannerSlider.isOapPlayState()) {
						state = 'none';
					}
				}
				this.bgImage.style.display = state;
				console.log('bool=%s, state=%s', bool, state);
			}
		} catch (error) {

		}
	}

	// 백배너 포커스 out 될때
	onMainslideBlure = (container, index) => {
		const { bigBanner } = this.state;
		if (!isEmpty(bigBanner) && !isEmpty(bigBanner[index]) && !isEmpty(bigBanner[index].file_name)) {
			// oap 소리 제거
			StbInterface.requestPlayOap({ item_id: 'item_id', playState: 3, soundSetting: '0' });
		}
	}

	// 빅배너 포커스 될때 
	onMainslide = (container, index) => {
		console.error('container', container, index);
		const { bigBanner } = this.state;
		if (!isEmpty(bigBanner) && !isEmpty(bigBanner[index]) && !isEmpty(bigBanner[index].file_name)) {
			// oap 소리 출력
			StbInterface.requestPlayOap({ item_id: 'item_id', playState: 3, soundSetting: '1' });
		}

		this.saveFocus('banner');

	}

	// block list의 남아 있는 개수를 가져 온다.
	getRemainingBlockList = async () => {

		const cnt = this.blocksList.length < this.VIEW_ROW ? this.blocksList.length : this.VIEW_ROW;
		let block;

		for (let i = cnt; i < this.blocksList.length; i++) {
			block = this.blocksList[i];
			let content = null;
			// content = this.getBlockData(i);
			content = await gridDataPromise(block, this.gnbTypeCode, this.isDetailedGenreHome);

			if (isEmpty(content.slideItem)) {
				this.blocksList.splice(i, 1); // block 정보가 없으면 제거
				i -= 1;
			} else {
				this.contentList[i] = content;
			}
		}

		this.setState({
			contentSlides: this.contentList
		}, () => {
			// ****TODO 화면에 없는 block display none 처리 ****
			// for (let index = this.VIEW_ROW; index < this.arrangedFocusList.length; index++) {
			// 	const element = this.arrangedFocusList[index];
			// 	// console.log('index=' + index, element.fm.anchor);
			// 	if (element.fm.anchor) {
			// 		element.fm.anchor.style.display = 'none';
			// 	}
			// }
		});
	}

	scrollTo = (anchor, marginTop) => {
		let top = 0;
		let offset = 0;
		if (anchor) {
			top = anchor.offsetTop;
		}
		const margin = marginTop ? marginTop : 0;
		let bShowMenu = true;
		if (top > 500) {
			offset = -(top - 60) + margin;
			bShowMenu = false;
		} else {
			offset = 0;
		}
		console.log('scrollTo ', offset);

		scroll(offset);
		const { showMenu } = this.props;
		showMenu(bShowMenu, true);
	}


	// 해당 index의 block 정보를 가져와서 셋팅한다.
	getBlockData = async (idx) => {
		let index = idx + 1;
		const block = this.blocksList[index];
		// console.log('index=', index, block);
		console.log('index=%s, this.blocksList.length=%s=', index, this.blocksList.length);
		// blocksList 없는 경우 로직 종료
		if (index > this.blocksList.length - 1) {
			return;
		}

		let content;
		// network 받아왔던 데이터가 있는 경우, 사용
		if (this.contentList[index]) {
			content = this.contentList[index];
		} else {
			content = await this.gridDataPromise(block);
			if (!isEmpty(content.slideItem)) {
				// this.contentList.push(content);
				this.contentList[index] = content;
			} else {
				this.blocksList.splice(index, 1);  // block 정보가 없으면 제거
				this.getBlockData(index - 1);  // blockData 다시 요청
				return;
			}
		}

		console.log('content=', content);
		console.log('this.contentList', this.contentList);

		this.setState({
			contentSlides: cloneDeep(this.contentList)
		});
		return content;
	}

	// 상하 이동시 발생되는 이벤트
	onSlideFocus = (container, direction) => {
		const { contentSlides, focusData } = this.state;
		console.log('onSlideFocus focusIndex=%s direction=%s ', this.focusIndex, direction, container);

		if (this.focusIndex === 2) {
			// if (direction === 'UP') {
			this.onOapPlayState(true);
			// }
		} else {
			this.onOapPlayState(false);
		}

		let top = 0;
		let anchor = null;
		let bShowMenu = true;
		let offset = 0;
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

		this.keyEventPause();
		const callback = () => {
			console.log('Home callback this.focusIndex=%s, direction=%s', this.focusIndex, direction);
			if (direction === 'UP') {
				// const element = this.arrangedFocusList[this.focusIndex + 3];
				const element = this.arrangedFocusList[this.focusIndex + this.VIEW_ROW + 1];
				if (element && element.fm && element.fm.anchor) {
					element.fm.anchor.style.display = 'none';
				}
			} else if (direction === 'DOWN') {
				// const element = this.arrangedFocusList[this.focusIndex + 2];
				// const content = await this.getBlockData(this.focusIndex);
				const content = this.getBlockData(this.focusIndex);

				const element = this.arrangedFocusList[this.focusIndex + (this.VIEW_ROW - 1)];
				if (element && element.fm && element.fm.anchor) {
					element.fm.anchor.style.display = 'block';
				}
			}
			this.keyEventResume();
		}

		scroll(offset, callback);
		this.props.showMenu(bShowMenu, true);

		this.saveFocus('blocks', this.getCurrentFocusInfo().idx);

		this.setState({
			isScrolling: this.focusIndex > 2
		})
	}

	onSlideFocusChild = (focusIdx) => {
		const { focusData } = this.state;
		this.state.focusData = {
			...focusData,
			itemIdx: focusIdx
		};
	}

	// 빅배너 enter 했을 때 이동
	onSelectBanner = (idx) => {
		const { bigBanner } = this.state;
		const targetBanner = bigBanner[idx];
		const { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId } = targetBanner;
		const data = { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId };

		if (!isEmpty(bigBanner) && !isEmpty(bigBanner[idx]) && !isEmpty(bigBanner[idx].file_name)) {
			const oapData = {
				item_id: bigBanner[idx].item_id, playState: 2, fullSize: 'Y'
			};
			StbInterface.requestPlayOap(oapData);

			// pip 영역 가리기
			this.onOapPlayState(false);
		} else if ((CALL_TYPE_CD.APP !== callTypeCode) && isEmpty(callUrl.trim())) {
			Core.inst().showToast('call_url 필드가 비어 있습니다. H/E 이슈');
		} else {
			Utils.moveToCallTypeCode(data, this.isDetailedGenreHome);
		}

	}

	onSelectRecentVod = (flag, idx) => {
		const { contentSlides } = this.state;
		let slideItem = {};
		for (let slide of contentSlides) {
			if (slide.slideType === SlideType.RECENT_VOD) {
				slideItem = slide.slideItem[idx];
			}
		}
		const data = {
            search_type: '2',
			epsd_rslu_id: slideItem.epsdRsluId,
			seeingPath: '13'	 //시청컨텐츠를 통한 VOD 시청(마이Btv-최근시청-최근시청목록)
		}
		CTSInfo.requestWatchVODForOthers(data);
	}

	// 홈 OAP 재생 요청 callback
	// callbackPlayOap = (data) => {
	// 	console.log('callbackPlayOap ', data);
	// }

	/**
	 * 홈 OAP 재생 요청, data 구조
	 * {
	 * 	item_id,  	//  item_id 사용으로 변경 예정
	 * 	playState,  //  재생 상태 값 (play : 0, stop : 1, resize : 2)
	 *  fullSize,  	//  전체 화면 여부(Y/N)
	 *  x,  		//  play, resize만 필수
	 *  y,  		//  play, resize만 필수
	 *  width,  	//  play, resize만 필수
	 *  height,  	//  play, resize만 필수
	 * }
	 */
	// playOap = (data) => {
	// 	// 홈 OAP 재생 요청, TODO native callback 필요한지 검토 필요
	// 	StbInterface.requestPlayOap(data, this.callbackPlayOap);
	// }

	/**
	 * 홈 OAP 정보 callback
	 */
	callbackHomeOapInfo = (data) => {
		console.log('callbackHomeOapInfo ', data);
		// data 구조 
		// banner_list  배너 리스트
		// {
		// 	item_id					OAP 아이디
		// 	item_seq				OAP 순번
		// 	call_type				"0:없음,1:시놉바로가기,2:메뉴바로가기, 3:팝업, (3:즉시 PNS질의)"
		// 	call_object				call_type 값이 '0' 이 아닌 경우 해당 타입에 대한 고유 값
		// 	log_flag				OAP 로그 전송 유무(Y, N)
		// 	file_name				OAP 파일 이름
		// 	grade_cd				OAP 등급
		// 	play_type				1 : D&P, 2 : 스트리밍
		// 	exception_method		0:일반, 1:사용 (1(사용) 인 경우홈메타요청실패시 재생하지 말아야 함)
		// 	image_url				이미지 경로 url
		// }
		const localData = {
			"banner_list": [
				{
					"log_flag": "Y",
					"grade_cd": "00",
					"call_type": "0",
					"image_url_default": "adv/oapTestFile3.png",
					"image_url_focus": "adv/oapTestFile3.png",
					"item_id": "O0000000004",
					"play_type": "1",
					"file_name": "o35931-170718181416.ts",
					"exception_method": "0",
					"item_seq": "1",
					"call_object": ""
				},
				{
					"log_flag": "Y",
					"grade_cd": "00",
					"call_type": "0",
					"image_url_default": "adv/oapTestFile.png",
					"image_url_focus": "adv/oapTestFile.png",
					"item_id": "O0000000005",
					"play_type": "1",
					"file_name": "o36907-171201164728.ts",
					"exception_method": "0",
					"item_seq": "2",
					"call_object": ""
				},
				{
					"log_flag": "Y",
					"grade_cd": "00",
					"call_type": "0",
					"image_url_default": "adv/oapTestFile2.png",
					"image_url_focus": "adv/oapTestFile2.png",
					"item_id": "O0000000006",
					"play_type": "1",
					"file_name": "o37535-180518180007.ts",
					"exception_method": "0",
					"item_seq": "3",
					"call_object": ""
				}]
		}

		let oapLIst = [];
		// to peter test
		if (!appConfig.runDevice) {
			this.homeOapList = localData.banner_list;
		} else {
			this.homeOapList = data.banner_list;
		}

		const imgPath = Utils.getIipImageUrl('0', '0', 'A20');

		oapLIst = isEmpty(this.homeOapList) ? [] : this.homeOapList.map(banner => {
			let imageN = `${imgPath}/${banner.image_url_default}`;	// 기본 이미지
			let imageS = `${imgPath}/${banner.image_url_focus}`;	// 확장 이미지
			const imgs = { imageS, imageN };

			return {
				isSingle: false,		// 이미지가 한장인지 여부
				imgs,
				callUrl: '',
				bannerDetailTypeCode: '',	// 배너 상세 유형 코드
				callTypeCode: banner.call_type,
				shortcutEpisodeId: '',
				shortcutSeriesId: '',
				synopsisTypeCode: '',
				vasId: '',
				vasItemId: '',
				vasServiceId: '',
				file_name: banner.file_name,
				item_id: banner.item_id,
			}
		});

		// TODO 이미지 없을때 걸러내는 로직 필요
		if (oapLIst.length > 0) {
			const allList = this.state.bigBanner.concat(oapLIst);
			// console.log('allList=', allList);
			this.setState({
				...this.state,
				bigBanner: allList
			})
		}
	}

	restoreFocus = () => {
		const { focusData } = this.state;
		const { key: id, listIdx: idx, itemIdx: childIdx } = focusData;

		if (!idx) {
			this.setFocus(id, childIdx);
		} else {
			this.setFocus({ id, idx, childIdx });
		}

		if (!isEmpty(this.topButton)) {
			this.topButton.style.display = 'block';
		}
	}

	saveFocus = (key, idx) => {
		this.setState({
			focusData: {
				...this.state.focusData,
				key,
				listIdx: idx
			}
		});
	}

	searchInputFocusChild = (idx) => {
		console.log('searchInputFocusChild', this.searchTrigger);

		if (!this.searchTrigger) {
			this.searchTrigger = true;
			const searchWrapper = document.querySelector('.searchWrapper');
			searchWrapper.classList.add('active');
			const scrollWrap = document.querySelector('.scrollWrap');
			const searchWrapperHeight = searchWrapper.clientHeight;
			let curStyle = scrollWrap.style.transform;
			let posX = +curStyle.replace(/translate\(|\)|px|\s/gi, '').split(',')[1];
			console.log('search sum = ' + (posX + searchWrapperHeight));
			scrollWrap.style.transform = `translate(0px, ${posX - searchWrapperHeight}px)`;

		}

		return true;
	}

	async gridDataPromise(block, gnbTypeCode, i, cnt) {
		let content = null;
		// 조건문 수정 해야함 (headEnd 정상적으로 되면 로직 다시 만들어야함)
		if (block.scn_mthd_cd === '501') {
			content = await gridDataPromiseCW(block, gnbTypeCode, this.isDetailedGenreHome);
			if (!isEmpty(content)) {
				let isContent = (() => {
					if (Array.isArray(content)) {
						return content.length > 0;
					}
					else if (!isEmpty(content.slideItem)) {
						return true;
					}
					else {
						return false;
					}
				})();
				if (!isContent) {
					this.blocksList.splice(i, 1); // block 정보가 없으면 제거
					i -= 1;
				}
				else {
					for (let idx = 0; idx < content.length; idx += 1) {
						const element = content[idx];
						let index = idx === 0 ? i : ++i;
						this.contentList[index] = element;
						cnt += 1;
					}
				}
			}
		}
		else {
			content = await gridDataPromise(block, gnbTypeCode, this.isDetailedGenreHome);
			if (content) {
				if (isEmpty(content.slideItem)) {
					this.blocksList.splice(i, 1); // block 정보가 없으면 제거
					i -= 1;
				}
				else {
					this.contentList[i] = content;
				}
			}
		}
		return { i, cnt };
	}

	// 홈화면 일경우, 홈 OAP 정보 요청(가져오기) / 검색영역 포커스 적용
	requestHomeOapInfo() {
		if (!isEmpty(this.gnbTypeCode) && this.gnbTypeCode === GNB_CODE.GNB_HOME) {
			// TODO 기존에 banner 데이터를 나중에 받게 되면 문제 있음.
			StbInterface.requestHomeOapInfo(this.callbackHomeOapInfo);
			if (!appConfig.runDevice) {
				setTimeout(() => {
					this.callbackHomeOapInfo();
				}, 500);
			}
		}
	}

	/**
	 * 포인트 쿠폰 정보 콜백으로 업데이트
	 * @param {*} data = {
	 * 		coupon_count
	 * 		coupon_new  ,  "Y" : new 존재, "N" : new 없음
	 * 		bpoint_count
	 * 		bpoint_new  ,  "Y" : new 존재, "N" : new 없음
	 * }
	 */
	callbackCouponsPointInfo = (data) => {
		// appConfig.STBInfo.bPoint = data.bpoint_count;
		// appConfig.STBInfo.newBpoint = data.bpoint_new === 'Y' ? true : false;
		// appConfig.STBInfo.coupon = data.coupon_count;
		// appConfig.STBInfo.couponNew = data.coupon_new === 'Y' ? true : false;

		// 쿠폰, 포인트, update
		console.log('callbackCouponsPointInfo', data);
		const pointCouponInfoState = {
			isHome: true,
			homeData: {
				bPoint: { new: appConfig.STBInfo.newBpoint, count: appConfig.STBInfo.bPoint },
				coupon: { new: appConfig.STBInfo.couponNew, count: appConfig.STBInfo.coupon }
			}
		};
		console.log('pointCouponInfoState', pointCouponInfoState);
		this.setState({
			...pointCouponInfoState
		})
	}

	componentWillMount = () => {
		this.props.showMenu(true, true);

		const { gnbFm } = this.props.data;

		if (!isEmpty(this.menuId) && !isEmpty(this.gnbTypeCode)) {
			if (!this.historyData) {
				this.setBlock(this.menuId, this.gnbTypeCode);
			}
		}

		// GNB FM 인스턴스 적용
		if (gnbFm) {
			this.setFm('gnbMenu', gnbFm);
			this.gnbFm = gnbFm;
		}
		this.setFm('topButton', this.defaultFM.topButton);
	}

	webShowNoti() {
		console.log('====================================');
		console.log('webShowNoti this.state=', this.state);
		console.log('webShowNoti this.bannerSlider=', this.bannerSlider);
		console.log('====================================');
		const { bigBanner, isHome } = this.state;
		const idx = this.bannerSlider.state.currentIdx;

		// if ('현재 홈 상태 인가') {
		if (isHome) {
			// if ('빅배너의 현재 포커스 값이 재생할 oap가 있는가') {
			if (!isEmpty(bigBanner) && !isEmpty(bigBanner[idx]) && !isEmpty(bigBanner[idx].file_name)) {
				setTimeout(() => {
					// G2NaviBannerSlider의 startOapPlay();
					try {
						this.bannerSlider.startOapPlay();
					} catch (error) {
					}
				}, 300);
			}
		}
	}
	componentDidMount() {
		// console.log('HOME did mount');
		const { activeMenu, data } = this.props;
		activeMenu(this.gnbTypeCode, this.menuId);
		if (!isEmpty(this.historyData)) this.restoreFocus();
		window.HOME = this;

		this.isGuided = StbInterface.getProperty(this.TOOLTIP_FLAG);
		if (!this.isGuided) {
			this.setState({ isTooltipGuided: true });
		}

		// GUI 테스트 용
		if (this.props.test === 'test') {
			this.wrapper.classList.add('homeTestPage');
		}

	}

	toolTipEnd = () => {
		StbInterface.setProperty(this.TOOLTIP_FLAG, true);
		this.setState({ isTooltipGuided: false });
	}

	componentWillReceiveProps(nextProps) {
		console.log('%c HomeDynamic componentWillReceiveProps', 'color: red; background: yellow', this.gnbFm, nextProps);
	}

	componentDidUpdate(prevProps, prevState) {
		// // 홈 최초 진입시
		if (this.gnbTypeCode === GNB_HOME) {
			let gnbFm = this.props.data.gnbFm;
			if (gnbFm) {
				gnbFm.removeFocus();
				gnbFm.setListInfo({ focusIdx: 2 });
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!isEqual(this.state, nextState)) return true;
		return false;
	}

	componentWillUnmount() {
		// console.log('%c HOME willUnmount', 'color: red; background: yellow', );
		super.componentWillUnmount();
	}

	setBannerSlider = (cpt) => {
		this.bannerSlider = cpt;
	}

	keyEventResume = () => {
		this.isKeyResume = true;
	}

	keyEventPause = () => {
		this.isKeyResume = false;
	}

	render() {
		const { homeData, bigBanner, contentSlides, isHome, isScrolling, isTooltipGuided } = this.state;
		const style = { display: (contentSlides.length < this.VIEW_ROW ? 'none' : 'block') };
		const searchDisplay = this.gnbTypeCode !== CODE.GNB_HOME ? { display: 'none' } : {};

		console.log(this.__proto__.constructor.name, 'render');

		return (
			<div className="wrap" ref={ref => this.wrapper = ref} >
				<div className="mainBg">
					{/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver${(isScrolling || this.gnbTypeCode !== CODE.GNB_HOME) ? '' : '_pip'}.png`} alt="배경 이미지" /> */}
					{/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver_pip.png`} alt="배경 이미지" /> */}
					<img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} ref={r => this.bgImage = r} style={{ display: 'block' }} alt="배경이미지" />
					{/* id, alt, src, ref, style, width, height */}
				</div>
				<div className="home scrollWrap">
					{bigBanner.length === 0 && <div className="genreHeader" />}
					{/* Big Banner */}
					{(bigBanner.length !== 0 && !this.monthlyDetailYN) &&
						<BigBanner
							list={bigBanner}
							onSelect={this.onSelectBanner}
							onFocusSlider={this.onMainslide}
							onBlurSlider={this.onMainslideBlure}
							onOapPlayState={this.onOapPlayState}
							setFm={this.setFm}
							isHome={this.gnbTypeCode === CODE.GNB_HOME}
							setBannerSlider={this.setBannerSlider}
						/>
					}
					{/* Coupon, B points */}
					{isHome && <HomeHeadContent content={homeData} />}

					{/* Content Block */}
					{contentSlides.map((item, idx) => {
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
								//onSelectSlideVOD={this.onSelectSlideVOD}  // this.onSelectSlideVod가 존재하지 않음.
								onSelectMenuBlock={this.onSelectMenuBlock}
								isDetailedGenreHome={this.isDetailedGenreHome}
							// onSelectFavorite={this.onSelectFavorite} // 찜키 삭제 (신군호 매니저님, 2018-06-04)
							/>
						)
					}
					)}
					<div className="contentGroup" ref={r => this.topButton = r} style={{ 'display': 'none' }}>
						<div className="btnTopWrap">
							<span className="csFocus btnTop" id="topButton" >
								<span>맨 위로</span>
							</span>
						</div>
					</div>
					{isHome &&
						<SearchContents
							saveFocus={this.saveFocus}
							setFm={this.setFm}
							addFocusList={this.addFocusList}
							setFocus={this.setFocus}
							focusPrev={this.focusPrev}
							scrollTo={this.scrollTo}
							movePage={this.movePage}
						/>
					}

					{isTooltipGuided &&
						<ToolGuide guideTitle={`음성검색으로 “${tooltipMassage[this.gnbTypeCode]} 찾아줘” 라고 말씀해보세요.`}
							top="390"	// 110 (빅배너 없을 때)
							left="600"
							aniTime="3"
							delayTime="5"
							arrowClass="none"
							onAnimationEnd={this.toolTipEnd}
						/>
					}
				</div>
			</div >
		)
	}

}

export default HomeDynamic;