// commons
import React from 'react';
import constants, { GNB_CODE } from 'Config/constants';
import { Core } from 'Supporters';
import PageView from 'Supporters/PageView';
import appConfig from '../../../config/app-config';

// style
import 'Css/home/Home.css';
import 'Css/home/HomeTestPage.css';

// utils
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import StbInterface from 'Supporters/stbInterface';
import Utils, { scroll } from 'Util/utils';

// network
import { NXPG } from 'Network';

// components
import HomeHeadContent from "../components/HomeHeadContent";
import BigBanner from '../components/BigBanner';
import GenreHeader from '../components/GenreHeader';
import ToolGuide from 'Module/UI/ToolGuide';
import { gridDataPromise, gridDataPromiseCW } from '../dataFatory/homeUtils';
import Blocks from './Blocks';
import { SearchContents } from 'Module/Search';
import TopButton from '../components/TopButton';

const {
	HOME, MYBTV_HOME, CODE, CALL_TYPE_CD,
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
const tooltipMassage = {
	U5_03: 'B tv 인기영화',
	U5_04: '영화/시리즈',
	U5_05: 'TV다시보기',
	U5_06: '애니',
	U5_10: '시니어',
	U5_08: '다큐/라이프/교육',
}

class Home extends PageView {
	constructor(props) {
		super(props);

		//===========
		this.firstCallSetBlock = false;
		this.blocksListCount = 0;
		//===========

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
		this.AUTO_HIDE_TIME = 15000;
		this.AUTO_HIDE = 'autoHide';
		this.bannerSlider = '';
		this.headEndCallEnd = null;
		// console.log('====================================');
		// console.log('Home constructor this.props=', this.props);
		// console.log('Home constructor this.historyData=', this.historyData);
		// console.log('Home constructor this.paramData=', this.paramData);
		// console.log('====================================');
		if (!isEmpty(this.props.data)) {
			console.error('this.props.data', this.props.data);
			const { menuId, gnbTypeCode } = this.props.data;
			this.menuId = menuId;
			this.gnbTypeCode = gnbTypeCode;
		}

		if (!isEmpty(this.paramData)) {
			console.error('this.paramData', this.paramData);
			this.menuId = this.paramData.menuId;
			this.gnbTypeCode = this.paramData.gnbTypeCode;
			this.mode = this.paramData.mode;  // from_setting - 설정에서 종료 후 홈 들어가야될 경우,  autoHide  - 부팅 후 자동 홈 모드로 홈 진입한 경우 (10 초 후 사용자의 입력이 없는 경우 홈 화면 Hide 처리)
			this.detailedGenreHome = this.paramData.detailedGenreHome;
			this.titleDepth1 = this.paramData.depth1Title;
			this.titleDepth2 = this.paramData.depth2Title;

			if (this.mode === this.AUTO_HIDE) {
				// 사용자 입력이 10초동안 없는 경우 자동 hide 처리
				this.autoHideTime = setTimeout(() => {
					Core.inst().webVisible(false, true);
				}, this.AUTO_HIDE_TIME);
			}
		}

		/*
			PROPERTY_CHILDREN_SEE_LIMIT_SETTING : 자녀안심 시청 적용 범위 (Value - btv 전체 : btv, 키즈존만 : KIDS)
			CHILDREN_SEE_LIMIT : 등급제한 	시청연령제한 (0, 7, 12, 15, )
			ADULT_MOVIE_MENU : 19영화 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
			EROS_MENU : 19플러스 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
		*/

		this.ADULT_MOVIE_MENU = StbInterface.getProperty(ADULT_MOVIE_MENU);
		this.EROS_MENU = StbInterface.getProperty(EROS_MENU);
		const adultAndEros = {
			ADULT_MOVIE_MENU: this.ADULT_MOVIE_MENU,
			EROS_MENU: this.EROS_MENU,
		};
		// console.log('%c STB INFO', 'color: balck; background: white; font-size: 14px;', {
		// 	'19영화': this.EROS_MENU,
		// 	'19플러스': this.ADULT_MOVIE_MENU
		// });

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
			console.error('this.historyData', this.historyData);
		}
		this.state = isEmpty(this.historyData) ? {
			bigBanner: [],		// 빅배너 state에 type 키로 월정액 인지 아닌지를 구분 : bigBanner.bannerType ( 'monthly', 'normal' )
			isHome: false,
			contentSlides: [],
			curGnbMenuId: '',
			curGnbTypeCode: this.gnbTypeCode,
			changeMenuTrigger: true,
			headEndCallEnd: false,
			focusData: {
				key: 'blocks',
				listIdx: 0,
				itemIdx: 0
			},
			isScrolling: false,
			isTooltipGuided: false,

			// 세부장르홈 타이틀
			depth1Title,
			depth2Title,

			topButtonVisible: false,
		} : ((historyData, isDetailedGenreHome, adultAndEros) => {
			let contentSlides = historyData.contentSlides.map((slide, idx) => {
				let data = {
					...slide,
					slideItem: Utils.hideMenuCheck(slide.slideItem, false, adultAndEros)
				};
				return data;
			});
			return { ...historyData, contentSlides };
		})(this.historyData, this.isDetailedGenreHome, adultAndEros);

		this.homeOapList = [];  // 홈 OAP 정보 리스트

		const focusList = [
			{ key: 'gnbMenu', fm: null },
			{ key: 'banner', fm: null },
			{ key: 'blocks', fm: [] },
			{ key: 'topButton', fm: null },
		];
		this.declareFocusList(focusList);
	}

	onKeyDown(evt) {
		this.handleKeyEvent(evt);
		// 사용자 입력이 10초동안 없는 경우 자동 hide 처리
		if (this.mode === this.AUTO_HIDE) {
			clearTimeout(this.autoHideTime);
		}
	}

	setBigBanner = (data) => {
		const imgPath = Utils.getImageUrl(Utils.IMAGE_SIZE_BIGBANNER);
		let bigBanner = isEmpty(data) ? [] : data.map(banner => {
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

		return bigBanner;
	}

	setBlock2 = async (menuId, gnbTypeCode) => {
		gnbTypeCode = gnbTypeCode || this.gnbTypeCode;
		// 성인인증/청소년보호 property
		const adultProperty = {
			ADULT_MOVIE_MENU: this.ADULT_MOVIE_MENU,
			EROS_MENU: this.EROS_MENU,
		};
		const NXPG003 = await NXPG.request003({ menu_id: menuId });
		if (!this.firstCallSetBlock) {
			this.firstCallSetBlock = true
		}

		// 빅배너 설정
		let bigBanner = this.setBigBanner(NXPG003.banners);

		// 블록 리스트 갯수 저장
		this.blocksListCount = NXPG003.blocks ? Number(NXPG003.blocks.length) : 0;

		const makeData = async (blocks) => {
			let blocksList = isEmpty(blocks) ? [] : blocks;
			let blocksListLength = Number(blocksList.length);
			let blocksListIndex = 0;
			let contentList = [];

			while (blocksListIndex < blocksListLength) {
				let block = blocksList[blocksListIndex];
				let content = null;
				if (block.scn_mthd_cd === '501' || block.scn_mthd_cd === '502') {
					content = await gridDataPromiseCW(block, gnbTypeCode, this.isDetailedGenreHome, adultProperty);
				} else {
					content = await gridDataPromise(block, gnbTypeCode, this.isDetailedGenreHome, adultProperty);
				}
				contentList = contentList.concat(content);
				blocksListIndex += 1;
			}

			return contentList;
		}

		let data = [];
		let locationState = this.props.history.location.state;
		if (locationState && locationState.cwGridCall) {
			// 메뉴블럭에서 CW연동그리드 호출 일 경우 NXPG003을 거치지 않고 바로 cw연동그리드를 호출한다.
			let cwBlockInfo = locationState.cwInfo;
			data = await makeData([].concat(cwBlockInfo));
		} else {
			data = await makeData(NXPG003.blocks);
			this.setState({ isHome: gnbTypeCode === GNB_CODE.GNB_HOME });
		}

		// 리스트가 없는 데이터는 필터링
		data = data.filter(item => !isEmpty(item.slideItem));

		// setState
		this.setState({
			contentSlides: data,
			bigBanner,
			headEndCallEnd: true,
			topButtonVisible: data.length > 1
		}, () => {
			this.restoreFocus();
			// setTimeout(() => { this.getRemainingBlockList(); }, 50);
		});
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

	// oap 상태 전달 bool = {true : pip 보이기,  false : pip 감추기}
	onOapPlayState = (bool) => {
		let state = bool ? 'none' : 'block';

		if (this.state.isHome) {
			// focus 2 넘어가면 
			if (this.focusIndex > 2) {
				state = 'block';
			} else {
				state = 'block';

				if (this.bannerSlider.isOapPlayState()) {
					state = 'none';
				}
			}
			// this.bgImage.style.display = state;
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
		// console.error('container', container, index);
		const { bigBanner } = this.state;
		if (!isEmpty(bigBanner) && !isEmpty(bigBanner[index]) && !isEmpty(bigBanner[index].file_name)) {
			// oap 소리 출력
			StbInterface.requestPlayOap({ item_id: 'item_id', playState: 3, soundSetting: '1' });
		}
	}

	scrollTo = (anchor, marginTop) => {
		if (anchor === 'topButton') {
			for (let focusItem of this.focusList) {
				if (focusItem.key === 'blocks') {
					anchor = focusItem.fm[focusItem.fm.length - 1].anchor;
				}
			}
		}

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

		scroll(offset);
		const { showMenu } = this.props;
		showMenu(bShowMenu, true);
	}

	// 상하 이동시 발생되는 이벤트
	onSlideFocus = (container, direction) => {
		if (this.focusIndex === 2) {
			this.onOapPlayState(true);
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
		scroll(offset);
		this.props.showMenu(bShowMenu, true);
		this.saveFocus('blocks', this.getCurrentFocusInfo().idx);
		this.setState({ isScrolling: this.focusIndex > 2 });
	}

	onSlideFocusChild = (focusIdx) => {
		// const { focusData } = this.state;
		this.state.focusData = { key: null, listIdx: null, itemIdx: null };
	}

	// 빅배너 enter 했을 때 이동
	onSelectBanner = (idx) => {
		const { bigBanner } = this.state;
		const targetBanner = bigBanner[idx];
		const { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId } = targetBanner;
		const data = { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId };

		this.saveFocus('banner');

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

	// 홈화면 일경우, 홈 OAP 정보 요청(가져오기) / 검색영역 포커스 적용, @기능 제거
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

	setBannerSlider = (cpt) => {
		this.bannerSlider = cpt;
	}

	setSearchTrigger = flag => {
		this.searchTrigger = flag;
	}

	getGnbIndex = (gnbTypeCode) => {
		let gnbIndex = {
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
		return gnbIndex[gnbTypeCode];
	}

	restoreFocus = () => {
		const { focusData, contentSlides } = this.state;
		const locationState = this.props.history.location.state;
		const { key: id, listIdx: idx, itemIdx: childIdx } = focusData;

		if (locationState && locationState.listMenuId && !this.historyData) {
			let listIdx = 0;
			contentSlides.forEach((item, idx) => {
				if (item.menu_id === locationState.listMenuId) {
					listIdx = idx;
				}
			});
			setTimeout(() => this.setFocus({ id: 'blocks', idx: listIdx, childIdx: 0 }), 1);

		} else {
			if (isNil(idx)) {
				console.log('listIdx 1111', id, idx, childIdx);
				// setTimeout(() => this.setFocus(id, childIdx), 1);
				setTimeout(() => this.setFocus('gnbMenu', this.getGnbIndex[this.gnbTypeCode]), 1);
			} else {
				console.log('listIdx 2222', id, idx, childIdx);
				setTimeout(() => this.setFocus({ id, idx, childIdx }), 1);
			}
		}

		if (isEmpty(contentSlides)) {
			this.setFocus('gnbMenu', this.getGnbIndex[this.gnbTypeCode]);
		}
	}

	saveFocus = (key, idx) => {
		console.log('home saveFocus', `key: ${key}, idx: ${idx}`);
		const { focusData } = this.state;

		if (!Array.isArray(key) && typeof key === 'object') {
			const { blocksKey, listIdx, itemIdx } = key;
			this.setState({
				focusData: { key: blocksKey, listIdx, itemIdx }
			});
		} else {
			this.setState({
				focusData: { ...focusData, key, listIdx: idx }
			});
		}
	}

	searchInputFocusChild = (idx) => {
		// console.log('searchInputFocusChild', this.searchTrigger);

		if (!this.searchTrigger) {
			this.searchTrigger = true;
			const searchWrapper = document.querySelector('.searchWrapper');
			searchWrapper.classList.add('active');
			const scrollWrap = document.querySelector('.scrollWrap');
			const searchWrapperHeight = searchWrapper.clientHeight;
			let curStyle = scrollWrap.style.transform;
			let posX = +curStyle.replace(/translate\(|\)|px|\s/gi, '').split(',')[1];
			// console.log('search sum = ' + (posX + searchWrapperHeight));
			scrollWrap.style.transform = `translate(0px, ${posX - searchWrapperHeight}px)`;

		}

		return true;
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

	toolTipEnd = () => {
		StbInterface.setProperty(this.TOOLTIP_FLAG, true);
		this.setState({ isTooltipGuided: false });
	}

	componentWillMount = () => {
		const { gnbFm } = this.props.data;

		this.props.showMenu(true, true);

		if (!isEmpty(this.menuId) && !isEmpty(this.gnbTypeCode)) {
			if (!this.historyData) {
				this.setBlock2(this.menuId, this.gnbTypeCode);
			}
		}

		// GNB FM 인스턴스 적용
		if (gnbFm) {
			this.setFm('gnbMenu', gnbFm);
			this.gnbFm = gnbFm;
		}
	}

	componentDidMount() {
		const { activeMenu, data: { gnbFm } } = this.props;
		const { curGnbTypeCode } = this.state;

		activeMenu(curGnbTypeCode, this.menuId);

		if (!isEmpty(this.historyData)) {
			this.setState({
				headEndCallEnd: true
			}, () => setTimeout(() => this.restoreFocus(), 1))
		}

		// 툴팁
		this.isGuided = StbInterface.getProperty(this.TOOLTIP_FLAG);
		if (!this.isGuided) {
			this.setState({ isTooltipGuided: true });
		}

		// GNB 포커스 설정
		gnbFm && gnbFm.setListInfo({ focusIdx: this.getGnbIndex(curGnbTypeCode) });

		// home 테스트용 - 추후 삭제 요망
		window.HOME = this;
	}

	componentDidUpdate(prevProps, prevState) {
		const { contentSlides, curGnbTypeCode } = this.state;
		let { gnbFm } = this.props.data;

		// gnbFm이 존재하면 gnb의 focus 위치를 gnbTypeCode에 맞춘다.
		gnbFm && gnbFm.setListInfo({ focusIdx: this.getGnbIndex(curGnbTypeCode) });

		if (!isEmpty(contentSlides)) {
			gnbFm.removeFocus();
		}

	}

	shouldComponentUpdate(nextProps, nextState) {
		return !isEqual(this.state, nextState) ? true : false;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {
		const {
			bigBanner, contentSlides, // data
			isHome, isTooltipGuided, headEndCallEnd, topButtonVisible,	// flag
			depth1Title, depth2Title,	// 장르홈 타이틀
		} = this.state;

		return (
			<div className="wrap" ref={ref => this.wrapper = ref} >
				<div className="mainBg">
					{/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver_pip.png`} alt="배경 이미지" /> */}
					<img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} ref={r => this.bgImage = r} style={{ display: 'block' }} alt="배경이미지" />
				</div>
				<div className="home scrollWrap" ref={r => this.scrollWrap = r}>

					{/* 세부장르홈일 경우 타이틀 표시 */}
					{this.isDetailedGenreHome && <GenreHeader title={{ depth1Title, depth2Title }} />}

					{/* Big Banner */}
					{bigBanner.length !== 0 &&
						<BigBanner list={bigBanner}
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
					{isHome && <HomeHeadContent />}

					{/* Content Block */}
					{contentSlides.map((item, idx) => {
						return (
							<Blocks key={idx}
								blockInfo={item}
								idx={idx}
								setFm={this.setFm}
								onSlideFocus={this.onSlideFocus}
								onSlideFocusChild={this.onSlideFocusChild}
								onSelectRecentVod={this.onSelectRecentVod}
								scrollTo={this.onSlideFocus}
								isDetailedGenreHome={this.isDetailedGenreHome}
								saveFocus={this.saveFocus}
							// onSelectFavorite={this.onSelectFavorite} // 찜키 삭제 (신군호 매니저님, 2018-06-04)
							/>
						)
					}
					)}

					<TopButton setFocus={this.setFocus}
						setFm={this.setFm}
						bShow={topButtonVisible}
						searchTrigger={this.searchTrigger}
						setSearchTrigger={this.setSearchTrigger}
						scrollTo={this.scrollTo} />

					{(headEndCallEnd && topButtonVisible) &&
						<SearchContents saveFocus={this.saveFocus}
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

export default Home;