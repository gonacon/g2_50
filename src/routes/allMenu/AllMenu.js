// commons
import React from 'react'
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import constants, { GNB_CODE, STB_PROP, MENU_NAVI, MENU_ID, CERT_TYPE } from 'Config/constants';

// style
import 'Css/allMenu/AllMenu.css';

// network
import { NXPG } from 'Network';

// utils
import { isEmpty, isNil } from 'lodash';

// components
import SubDepth from './SubDepth';
import StbInterface from 'Supporters/stbInterface';
import { Core } from 'Supporters';
import appConfig from 'Config/app-config';
import HistoryManager from 'Supporters/history';
import AdultCertification from '../../popup/AdultCertification';
import Utils from 'Util/utils';
import KidsViewMove from './../kids/kidsViewMove';
const { /*MONTHLY_BEFORE, MONTHLY_AFTER, HOME_MOVIE, HOME_ANI, HOME_DOCU, HOME_TV,*/
	HOME, MYBTV_HOME, HOME_TVAPP, KIDS_HOME, ALL_MENU, SEARCH_MAIN, EPG } = constants;
const { GNB_ANI, GNB_DOCU, GNB_HOME, GNB_KIDS, GNB_MONTHLY, GNB_MOVIE, GNB_MYBTV, GNB_TV, GNB_TVAPP, GNB_SEARCH } = GNB_CODE;
const { Keymap: { DOWN, UP, LEFT, RIGHT, ENTER, PC_BACK_SPACE, BACK_SPACE } } = keyCodes;
const MAX_MENU_ROW = 10;

class AllMenu extends PageView {
	constructor(props) {
		super(props);
		//this.prevGnbCode = !isEmpty(this.paramData.prevGnbCode)? this.paramData.prevGnbCode: GNB_HOME;

		this.prevGnbCode = GNB_MONTHLY; //아래 작업 전까지 기본 0(월정액)으로 default 06.08 신군호매니져님 요청사항

		this.defaultMenuIdList = '';
		this.defaultFocusMenuId = '';
		if (this.paramData.menuId) {
			//test
			//const sampleData = 'NM1000018142/NM1000018146/NM1000020888/NM1000021106'; //19영화
			//const sampleData = 'NM1000018142/NM1000020783';//편성표
			//const sampleData = 'NM1000018142/NM1000019308/NM1000019670/NM1000020172' //sport 애니
			//const sampleData = 'NM1000018142/NM1000018144' //다큐멘터리
			//const sampleData = 'NM1000018142/NM1000018144/NM1000019676/NM1000019680' //BBC 다큐
			//this.defaultMenuIdList = sampleData.split('/');

			//stb
			this.defaultMenuIdList = this.paramData.menuId.split('/');
			//const menuIdListLen = this.defaultMenuIdList.length;
			//this.defaultFocusMenuId = this.defaultMenuIdList[menuIdListLen-1];
		}

		// console.log('this.paramData=', this.paramData);
		// if (this.paramData && this.paramData.prevGnbCode) {
		// 	this.prevGnbCode = this.paramData.prevGnbCode;
		// }
		//console.error("시작 this.historyData:", this.historyData);
		this.state = isEmpty(this.historyData) ? {
			data: {},
			kidsMode: (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1'),
			headTitle: '',
			menuTitle: '',
			menuDepth1: '',
			menuDepth2: '',
			menuPage: 0,
			contentMenu: [],
			originData: [],
			depthByIndex: [0],
			depth: [],
			currentDepth: 0,
			defaultActiveIdx: 0,
			activeFocusIdx: -1
		} : this.historyData;

		let focusList = [
			{ key: 'focus1', fm: null }
		];
		const stbInfo = this.getSTBInfo();
		this.CHILDRENSEELIMIT = stbInfo.childrenSeeLimit;
		this.ADULTMOVIEMENU = stbInfo.adultMovieMenu;
		this.EROSMENU = stbInfo.erosMenu;
		this.declareFocusList(focusList);
		this.defaultActiveIdx = 0;
	}

	componentDidMount() {
		this.props.showMenu(false);
		// console.error("this.historyData: ", this.historyData);
		if (!this.historyData) {
			this.getAllMenuData();
		} else {
			this.initFM();
		}
	}

	getSTBInfo = () => {

		const seeLimit = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT); // 시청연령제한 ( 0: 사용안함, 7: 7세, 12: 12세, 15: 15세, 18: 19세)
		const adultMovieMenu = StbInterface.getProperty(STB_PROP.ADULT_MOVIE_MENU); // 19 영화 표기 여부 ( 0 : 청소년 보호 , 1 : 메뉴표시 , 2 : 메뉴 숨김 )
		const erosMenu = StbInterface.getProperty(STB_PROP.EROS_MENU); // 19 플러스 표기 여부 ( 0 : 청소년 보호 , 1 : 메뉴표시 , 2 : 메뉴 숨김 )	

		const CHILDRENSEELIMIT = seeLimit ? Number(seeLimit) : 18;
		const ADULTMOVIEMENU = adultMovieMenu ? Number(adultMovieMenu) : 0;
		const EROSMENU = erosMenu ? Number(erosMenu) : 0;

		const res = {
			childrenSeeLimit: CHILDRENSEELIMIT,
			adultMovieMenu: ADULTMOVIEMENU,
			erosMenu: EROSMENU
		}
		return res;
	}

	initFM() {
		const { contentMenu, defaultActiveIdx } = this.state;
		this.focus1 = new FM({
			id: 'focus1',
			moveSelector: 'li',
			focusSelector: '.csFocusMenu',
			row: contentMenu.length,
			col: 1,
			focusIdx: defaultActiveIdx >= 0 ? defaultActiveIdx : 0,
			startIdx: 0,
			lastIdx: contentMenu.length - 1,
			bRowRolling: true,
			onFocusChild: this.onMenuFocusChild,
			// onFocusContainer,
			// onBlurContainer,
			onFocusKeyDown: this.onMenuKeyDown
		});

		this.setFm('focus1', this.focus1);
		// console.error( "this.prevGnbCode: ", this.prevGnbCode );
		// console.error( "defaultActiveIdx: ", defaultActiveIdx );
		this.setFocus('focus1');
	}

	// 2뎁스 이상인 경우 back키를 통해 상위 뎁스로 이동함
	onKeyDown(evt) {
		const { currentDepth } = this.state;
		//console.error('전:',  this.state.currentDepth);//1
		super.onKeyDown(evt);
		//console.error('후:', this.state.currentDepth);//0
		return !(currentDepth === 0); //true가 전달되면 일반 back키로 발생하는 이전 화면으로 이동이 일어나지 않음.
	}
	onMenuFocusChild = (focusIdx) => {
		this.setState({
			activeFocusIdx: focusIdx
		})
	}
	onMenuKeyDown = (evt, focusIdx) => {
		const { contentMenu, depth, currentDepth } = this.state;
		const { keyCode } = evt;
		const { isLeaf } = contentMenu[focusIdx];
		switch (keyCode) {
			case ENTER:
				// if( isEmpty( contentMenu[focusIdx].depth) ){
				if (isLeaf === "Y") {
					this.moveByOK();
					return;
				} else {
					this.depthIn(focusIdx);
				}
				break;
			case RIGHT:
				this.depthIn(focusIdx);
				break;
			case LEFT:
			case PC_BACK_SPACE:
			case BACK_SPACE:
				this.depthOut(focusIdx);
				break;
			case UP:
			case DOWN:
				this.onKeyDirUpandDown(focusIdx, evt);
				break;
			default:
				break;
		}
	}

	depthIn = (idx) => {
		const { contentMenu, depth, currentDepth, allMenuTitle } = this.state;
		let contentData = contentMenu[idx].depth;
		if (isEmpty(contentData)) return;

		let contentDepth = depth;
		let menuDepth1 = this.state.menuDepth2;
		let menuDepth2 = contentMenu[idx].title;
		let contentDepthLength = contentDepth.length;

		contentDepth.push(idx);
		if (contentDepth.length === 1) {
			menuDepth2 = "";
			menuDepth1 = allMenuTitle;
		} else if (contentDepth.length >= 2) {
			if (contentDepth.length === 2) {
				menuDepth1 = allMenuTitle;
			}
			menuDepth2 = this.state.menuTitle;
		}

		this.setState({
			menuTitle: this.state.contentMenu[idx].title,
			contentMenu: contentData,
			depth: contentDepth,
			menuDepth1,
			menuDepth2,
			currentDepth: currentDepth + 1,
			menuPage: 0
		});
		//console.error('in 키처리 currentDepth:', currentDepth, 'this.state.currentDepth:', this.state.currentDepth );
		this.focus1.setListInfo({
			row: contentData.length,
			lastIdx: contentData.length - 1,
		});

		this.focus1.setFocusByIndex(0);
	}

	depthOut = (idx) => {
		const { originData, depth, contentMenu, currentDepth, allMenuTitle } = this.state;
		//console.log('%c contentMenu[idx].depth', 'color: green', contentMenu[idx].depth);
		if (currentDepth === 0) return;

		let contentData = originData;
		let contentDepth = depth;
		let onFocus = depth[this.state.depth.length - 1];
		let menuPage = parseInt(onFocus / 10, 10);
		let menuTitle;
		let menuDepth1;
		let menuDepth2 = originData;
		let contentDepthLength = contentDepth.length;

		contentDepth.forEach((data, index) => {
			if (index !== contentDepthLength - 1) {
				menuTitle = contentData[contentDepth[index]].title; //현재메뉴타이틀
				contentData = contentData[contentDepth[index]].depth; //서브메뉴
			}
		});

		contentDepth.forEach((data, index) => {
			if (index >= 1 && index !== contentDepthLength - 1) {
				if (contentDepth[index - 2] !== undefined)
					menuDepth2 = menuDepth2[contentDepth[index - 2]].depth;
				if (index !== contentDepthLength - 2)
					menuDepth1 = menuDepth2;
			}
		});

		if (contentDepth[contentDepthLength - 3] !== undefined)
			menuDepth2 = menuDepth2[contentDepth[contentDepth.length - 3]].title;
		if (menuDepth1 !== allMenuTitle && contentDepth[contentDepthLength - 4] !== undefined)
			menuDepth1 = menuDepth1[contentDepth[contentDepth.length - 4]].title;

		contentDepth.pop();

		if (contentDepth.length === 0) {
			menuTitle = allMenuTitle;
			menuDepth2 = "";
		} else if (contentDepth.length <= 2) {
			menuDepth1 = allMenuTitle;
			if (contentDepth.length <= 1) menuDepth2 = "";
		}

		this.setState({
			menuTitle,
			menuPage,
			contentMenu: contentData,
			depth: contentDepth,
			onFocus,
			menuDepth1,
			menuDepth2,
			currentDepth: currentDepth - 1
		});
		//console.error('out 키처리 currentDepth:', currentDepth, 'this.state.currentDepth:', this.state.currentDepth );
		this.focus1.setListInfo({
			row: contentData.length,
			lastIdx: contentData.length - 1,
		});
		this.focus1.setFocusByIndex(onFocus);
	}

	onKeyDirUpandDown = (idx, evt) => {
		const { keyCode } = evt;
		let { menuPage, contentMenu } = this.state;
		let { lastIdx } = this.focus1;
		const totalIdx = contentMenu.length - 1;
		let nextPage = 0;
		let activeIdx = 0;
		if (keyCode === DOWN) {
			activeIdx = idx + 1;
			if (activeIdx > totalIdx) {
				activeIdx = 0;
			}
		} else if (keyCode === UP) {
			activeIdx = idx - 1;
			if (activeIdx < 0) {
				activeIdx = totalIdx;
			}
		}
		nextPage = parseInt(activeIdx / MAX_MENU_ROW);
		if (nextPage !== menuPage) {
			menuPage = nextPage;
			this.setState({
				...this.state,
				menuPage
			});
		}
	}

	moveByOK = async () => {
		const currentIdx = this.focus1.getFocusedIndex();
		const { contentMenu } = this.state;

		const { gnbTypeCode, call_typ_cd, callUrl, shcut_menu_id, title, depthNum, isLeaf, titleDepth1, titleDepth2, lim_lvl_yn, menu_exps_prop_cd } = contentMenu[currentIdx];

		const menuId = shcut_menu_id;
		let path = Utils.getGnbTypeCodeToPageMove(gnbTypeCode, menuId);
		let pathInfoObj = {}, kidsParam = {};
		if (gnbTypeCode === GNB_KIDS) {
			// [키즈존][PATH]
			path = Utils.getGnbTypeCodeToPageMove(gnbTypeCode);
		}

		let detailedGenreHome = true;
		if (depthNum === 2) {
			// StbInterface.webMenuState(this.gnbTypeCode);
			switch (gnbTypeCode) {
				case GNB_TVAPP:
					pathInfoObj = { gnbTypeCode, menuId, menuPage: 8 };
					break;
				case GNB_KIDS:
					pathInfoObj = {};
					break;
				case GNB_MYBTV:
				default:
					pathInfoObj = { gnbTypeCode, menuId, detailedGenreHome: false };
					break;
			}
		} else if (depthNum === 3) {
			pathInfoObj = { gnbTypeCode, menuId, title, detailedGenreHome };
			if (gnbTypeCode === GNB_KIDS) {
				pathInfoObj = {
					menu_id: menuId,
					kidsGnbCode: this.state.originData[this.state.depth[0]].depth[currentIdx].callUrl.split('/')[1],
					blkTyCode: null
				}
				KidsViewMove.setMoveParam('', pathInfoObj);
				kidsParam = await KidsViewMove.getMoveParam();
				path = kidsParam.path;
				pathInfoObj = kidsParam.pathParam;
			}
		} else if (depthNum === 4) {
			pathInfoObj = { gnbTypeCode, menuId, title, prevTitle: titleDepth2, detailedGenreHome };
			if (gnbTypeCode === GNB_KIDS) {
				const parentInfo = this.state.originData[this.state.depth[0]].depth[this.state.depth[1]];
				const childInfo = parentInfo.depth[currentIdx];
				pathInfoObj = {
					menu_id: childInfo.shcut_menu_id,
					prevTitle: childInfo.title,
					kidsGnbCode: parentInfo.callUrl.split('/')[1],
					blkTyCode: parentInfo.callUrl.split('/')[2]
				}
				KidsViewMove.setMoveParam('', pathInfoObj);
				kidsParam = await KidsViewMove.getMoveParam();
				path = kidsParam.path;
				pathInfoObj = kidsParam.pathParam;
			}
		}

		if (path.indexOf(HOME) !== -1) {
			pathInfoObj.depth1Title = titleDepth1;
			pathInfoObj.depth2Title = title;
		}

		//Todo: 1. '페이지', '세부장르'등의 페이지로 이동시킬 수 있는 pathInfoObj 구조 정하기.(천선임님과)
		// history를 위해 현재 상태 저장
		this.setState({
			defaultActiveIdx: currentIdx
		});

		if (callUrl === 'btv011') {
			const fnCallback = () => {
				this.movePage(EPG);
			};
			Core.inst().webkidsExit(null, fnCallback);
			return;
		};
		// console.error("전체메뉴->", title, "path: ", path, "pathInfoObj:", pathInfoObj);

		/************************************************** [키즈존][예외처리][START] **************************************************/

		// 1. 키즈존 진입 상태인 경우 Btv관련 화면 이동 시, 종료가이드 또는 인증 팝업 처리
		// 2. 키즈존 진입 상태가 아닌 경우 키즈존 화면 진입 시 초기 설정
		// 이외에 조건은 모두 정상 작동하도록 구현
		// const kidsMode = (StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1');
		const kidsMode = this.state.kidsMode;
		console.log('kidsMode=', kidsMode);

		if (kidsMode && gnbTypeCode !== GNB_KIDS) { // 1번 조건
			const fnCallback = () => {
				this.movePage(path, pathInfoObj);
				// return;
			};
			// 검색일때는 키즈존 이탈 안함.
			if (gnbTypeCode === GNB_SEARCH) {
				fnCallback();
			} else {
				Core.inst().webkidsExit(null, fnCallback);
			}
			return;
		} else if (!kidsMode && gnbTypeCode === GNB_KIDS) { // 2번 조건
			let isFirstKidsEntry = StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN);
			// isFirstKidsEntry = !appConfig.runDevice && '1';
			if (isFirstKidsEntry === '0' || isEmpty(isFirstKidsEntry)) { // 키즈존 최초 진입 시 값은 0 또는 undefined
				StbInterface.menuNavigationNative(MENU_NAVI.KIDS_ZONE, { menuId: MENU_ID.KIDS_ZONE_FIRST_INTRO });  // 키즈존 최초 설정 이동
				appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN, '1'); // 키즈존 최초 진입 시 1로 셋팅 필요
				return;
			} else {
				StbInterface.kidszoneState('enter');  // 키즈존 진입 전달
				!appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '1');
				setTimeout(() => {
					const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE) === '1';
					if (voiceUse) {
						const chrtrName = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);
						StbInterface.playKidszoneGuide(`${chrtrName}_01_guide_welcome.mp3`);
					}
				}, 1000);
			}
		}
		/************************************************** [키즈존][예외처리][END] **************************************************/

		//menu_exps_prop_cd : 30(19플러스) // 29(19영화(핑크무비))
		let obj;
		if (menu_exps_prop_cd === "29" || menu_exps_prop_cd === '30') {
			if (this.CHILDRENSEELIMIT === 0 && ((menu_exps_prop_cd === '29' && this.ADULTMOVIEMENU === 1) || (menu_exps_prop_cd === '30' && this.EROSMENU === 1))) {
				//메뉴 표시 && 시청연령 제한 : 사용안함 - 두 조건 만족시일때만 인증없이 바로 이동
				this.movePage(path, pathInfoObj);
				return;
			} else {
				let certification_type;
				if (menu_exps_prop_cd === '29') {
					if (this.ADULTMOVIEMENU === 0) {
						certification_type = CERT_TYPE.PROTECTION;
					} else {
						certification_type = CERT_TYPE.ADULT_SELECT;
					}
				} else {
					if (this.EROSMENU === 0) {
						certification_type = CERT_TYPE.PROTECTION;
					} else {
						certification_type = CERT_TYPE.ADULT_SELECT;
					}
				}

				obj = {
					certification_type: certification_type,
					age_type: '',
				}

				if (certification_type) {
					Core.inst().showPopup(
						<AdultCertification />,
						obj,
						response => {
							if (certification_type === CERT_TYPE.PROTECTION) {
								const stbInfo = this.getSTBInfo()
								if (menu_exps_prop_cd === '29' && stbInfo.adultMovieMenu === 1) {
									this.movePage(path, pathInfoObj);
								} else if (menu_exps_prop_cd === '30' && stbInfo.erosMenu === 1) {
									this.movePage(path, pathInfoObj);
								}
							} else {
								if (response && response.result === '0000') {
									this.movePage(path, pathInfoObj);
								}
							}

							// if (this.EROSMENU === 0 || this.ADULTMOVIEMENU === 0) { //청소년 보호로 설정되어 있을 경우 안심설정 메뉴 보기로 설정 후 진입가능하도록 변경
							// 	const stbInfo = this.getSTBInfo()
							// 	if (menu_exps_prop_cd === '29') {
							// 		if (stbInfo.adultMovieMenu === 1) {
							// 			this.movePage(path, pathInfoObj);
							// 		}
							// 	} else if (menu_exps_prop_cd === '30') {
							// 		if (stbInfo.erosMenu === 1) {
							// 			this.movePage(path, pathInfoObj);
							// 		}
							// 	}
							// } else if (this.EROSMENU === 1 || this.ADULTMOVIEMENU === 1) { //메뉴 보기로 설정되어 있을 경우 비밀번호 인증 성공 경우만 진입가능하도록 변경
							// 	if (response.result === "0000") {
							// 		this.movePage(path, pathInfoObj);
							// 	}
							// }
						});
				}
				//return;
				//}
			}
		} else {
			if (depthNum === 2 || path === KIDS_HOME) {
				this.movePage(path, pathInfoObj);
			} else {
				let obj = {
					callUrl: callUrl,
					callTypeCode: call_typ_cd,
				}
				Utils.moveToCallTypeCode(obj, true);
			}
		}
	}

	reDataForTeenager() {
		const stbInfo = this.getSTBInfo();

		const changeTitle = item => {
			let { title, originTitle, menu_exps_prop_cd, lim_lvl_yn } = item;
			if (lim_lvl_yn === 'Y' && menu_exps_prop_cd === '30') {
				title = stbInfo.erosMenu === 0 ? "청소년 보호(기타)" : originTitle;
			}
			if (lim_lvl_yn === 'Y' && menu_exps_prop_cd === '29') {
				title = stbInfo.adultMovieMenu === 0 ? "청소년 보호(영화)" : originTitle;
			}
			return title;
		}
		const reflectionMenuByTeenager = target => {
			let filtered = target.concat();

			if (stbInfo.erosMenu === 2) {
				filtered = target.filter(item => item.menu_exps_prop_cd !== '30' && item.lim_lvl_yn !== "Y");
			}

			if (stbInfo.adultMovieMenu === 2) {
				filtered = target.filter(item => item.menu_exps_prop_cd !== '29' && item.lim_lvl_yn !== "Y");
			}

			return filtered.map((item, idx) => (
				{
					...item,
					title: changeTitle(item),
					originTitle: item.title,
					depth: item.depth ? reflectionMenuByTeenager(item.depth) : null,
				}))
		};
		const { contentMenu } = this.state;

		let changedContentMenu = reflectionMenuByTeenager(contentMenu);

		this.setState({
			contentMenu: changedContentMenu,
			originData: changedContentMenu
		})
	}

	changeDataForTeenager() {
		// 시청제한 상태가 아닌 경우 return
		//if( this.ADULTMOVIEMENU === 1 && this.EROSMENU === 1 ) return;
		const changeTitle = item => {
			// // ToDo 180517 성인/핑크 조건으로 변경 되어야 함.
			// if (item.lim_lvl_yn === "Y") {
			// 	title = this.EROSMENU === 0 ? "청소년 보호" : title;
			// }

			let { title, menu_exps_prop_cd, lim_lvl_yn } = item;
			if (lim_lvl_yn === 'Y' && menu_exps_prop_cd === '30') {
				title = this.EROSMENU === 0 ? "청소년 보호(기타)" : title;
			}
			if (lim_lvl_yn === 'Y' && menu_exps_prop_cd === '29') {
				title = this.ADULTMOVIEMENU === 0 ? "청소년 보호(영화)" : title;
			}
			return title;
		}
		const reflectionMenuByTeenager = target => {
			// 19영화 메뉴숨김 필터, 19 플러스 메뉴숨김인 경우 필터..
			// if(!appConfig.runDevice){
			// 	this.EROSMENU = 0; //테스트용 
			// }
			let filtered = target.concat();

			if (this.EROSMENU === 2) {
				filtered = target.filter(item => item.menu_exps_prop_cd !== '30' && item.lim_lvl_yn !== "Y");
			}

			if (this.ADULTMOVIEMENU === 2) {
				filtered = target.filter(item => item.menu_exps_prop_cd !== '29' && item.lim_lvl_yn !== "Y");
			}

			return filtered.map((item, idx) => (
				{
					...item,
					title: changeTitle(item),
					depth: item.depth ? reflectionMenuByTeenager(item.depth) : null,
				}))
		};
		const { originDataBackUp } = this.state;

		let contentMenu = reflectionMenuByTeenager(originDataBackUp);
		let defaultFocusData = this.defaultFocusMenu(contentMenu);

		const defaultMenu = defaultFocusData.defaultMenu;
		const depthList = defaultFocusData.depthList;
		this.defaultActiveIdx = defaultFocusData.defaultIdx;
		const depthTitle = defaultFocusData.depthTitle;
		const menuTitle = depthTitle.slice(-1)[0];

		this.setState({
			menuTitle,
			contentMenu: defaultMenu,
			originData: contentMenu,
			menuDepth1: depthTitle[0],
			menuDepth2: depthTitle[1],
			depth: depthList,
			currentDepth: depthList.length,
			defaultActiveIdx: this.defaultActiveIdx
		})
	}

	setContentMenu = data => {
		const reflectionMenu = target => {
			let titleDepth1 = "";
			let titleDepth2 = "";
			// console.log("this.prevGnbCode: ", this.prevGnbCode );

			if (target.menus.length !== 0) {
				// 세브장르페이지로 이동인 경우 전달할 상위 뎁스의 타이틀 정보 저장
				if (target.depth === 1) {
					this.defaultActiveIdx = target.menus.findIndex(menu => menu.gnb_typ_cd === this.prevGnbCode);
					// 0516 이용중이던 메뉴에 디폴트 포커스 기능은 cms 이슈로 홀딩(김응균 매니저 확인)
					//console.log('this.defaultActiveIdx=', this.defaultActiveIdx);
					if (this.defaultActiveIdx === -1) {
						// epg 체크
						this.defaultActiveIdx = target.menus.findIndex(menu => menu.call_url === this.prevGnbCode);
						//console.log('@ this.defaultActiveIdx=', this.defaultActiveIdx);
						if (this.defaultActiveIdx === -1) {
							this.defaultActiveIdx = target.menus.findIndex(menu => menu.gnb_typ_cd === GNB_MOVIE);
						}
					}
				}
				else if (target.depth === 2) {
					titleDepth1 = target.menu_nm;
					titleDepth2 = "";
				} else if (target.depth >= 3) {
					titleDepth2 = target.menu_nm;
				}
			}
			// return target.menus.filter(item => item.lim_lvl_yn === "N").map((item, idx) => ({//성인메뉴제한인경우 필터링
			return target.menus.map((item, idx) => ({
				title: item.menu_nm,
				depth: item.menus ? reflectionMenu(item) : null,
				isLeaf: item.is_leaf,
				gnbTypeCode: item.gnb_typ_cd,
				menuId: item.menu_id,
				callUrl: item.call_url,
				call_typ_cd: item.call_typ_cd,
				depthNum: item.depth,
				shcut_menu_id: item.shcut_menu_id,
				//shcut_par_menu_id: item.shcut_par_menu_id,
				lim_lvl_yn: item.lim_lvl_yn, //성인메뉴여부 (제한등급여부)
				menu_exps_prop_cd: item.menu_exps_prop_cd, // 29(19영화(핑크무비)),  30(19플러스) 
				//par_menu_id: item.par_menu_id,
				titleDepth1,
				titleDepth2,
				//TODO: 페이지 정보를 가져오기위한 추가 정보 기재되어야 합니다.
			}))
		};

		const allMenuTitle = data.menus[0].menu_nm;
		let contentMenu = reflectionMenu(data.menus[0]);

		this.setState({
			allMenuTitle,
			menuTitle: allMenuTitle,
			contentMenu,
			originDataBackUp: contentMenu, //청소년 보호 데이터 보정 전. back키로 진입한 경우 청소년 보호 설정이 이전과 다를까봐 저장해 놓음.
			originData: contentMenu,       // 청소년 보호 데이터 보정 후 사용 되는 데이터
			defaultActiveIdx: this.defaultActiveIdx
		});
		this.changeDataForTeenager(); //테스트중
		this.initFM();
	}

	defaultFocusMenu = (targetList) => {
		let defaultFocusMenu = [];
		const { allMenuTitle } = this.state;
		const defaultFocus = (targetList) => {
			//console.log(targetList)
			let focusMenuData = [];
			let focusList = [];
			let titleDepthList = [];
			let depthList = [];
			focusList = targetList;

			const menuIdListLength = this.defaultMenuIdList.length;
			for (let i = 0; i < menuIdListLength; i++) {
				const defaultMenuIdList = this.defaultMenuIdList[i];
				if (focusList.findIndex(menu => menu.menuId === defaultMenuIdList) !== -1) {
					let focusIdx = focusList.findIndex(menu => menu.menuId === defaultMenuIdList);
					depthList.push(focusIdx)
					if (i !== menuIdListLength - 1) {
						focusList = focusList.find(menu => menu.menuId === defaultMenuIdList);
						//console.log('i :: ', i , 'focusList :: ', focusList);
						titleDepthList.push(focusList.title);
						focusList = focusList.depth;
					}
				}
			}
			focusMenuData = {
				focusList: focusList,
				titleDepthList: titleDepthList,
				depthList: depthList
			}

			return focusMenuData;
		}
		let focusMenuData = defaultFocus(targetList);
		//console.log('fcousMenuData ====== ', focusMenuData)
		const defaultMenu = focusMenuData.focusList;
		const depthList = focusMenuData.depthList;
		const depthTitle = focusMenuData.titleDepthList;
		const defaultActiveIdx = depthList.slice(-1)[0];

		depthList.pop();
		depthTitle.unshift(allMenuTitle);

		defaultFocusMenu = {
			defaultMenu,
			depthList,
			defaultIdx: defaultActiveIdx,
			depthTitle,
		}

		return defaultFocusMenu;
	}

	getAllMenuData = () => {
		NXPG.request002({ transactionId: 'allmenu_info' })
			.then(data => this.setContentMenu(data));
	}

	render() {
		const { contentMenu, depth, menuDepth1, menuDepth2, menuPage, menuTitle, onFocus, currentDepth, activeFocusIdx } = this.state;
		const totalPage = parseInt(contentMenu.length / MAX_MENU_ROW);
		const allmenuLeftList = !isEmpty(contentMenu) &&
			contentMenu.map((data, i) => (
				<SubDepth key={i}
					idx={i}
					data={data}
					focusData={onFocus}
					focusIdx={activeFocusIdx}
				/>
			));

		let subMenuTitle = menuTitle;
		if (menuTitle.length >= 12) {
			subMenuTitle = menuTitle.substring(0, 9) + '...';
		}
		return (
			<div className={`allMenuWrap ${totalPage > 0 && menuPage === 0 ? ' firstActive' : ''} ${totalPage > 0 && menuPage === totalPage ? ' lastActive' : ''}  `}>
				<div className="allMenuCon">
					<div className="allMenuNav">
						{depth[0] !== undefined &&
							<div className="allMenuDepth">
								<span className="allMenuDepthEllipsis">
									<span>{currentDepth > 2 ? '> ' : ''}{menuDepth1}</span>
								</span>
								<span className="allMenuDepthTitle">&gt; {menuDepth2}</span>
							</div>
						}
						{subMenuTitle}
					</div>
					<div className="allMenuLeftWrap">
						<ul className="allMenuLeft" id="focus1" style={{ '--page': menuPage }}>
							{allmenuLeftList}
						</ul>
					</div>
					{contentMenu.length > 10 &&
						<div className="arrowCon">
							<span className="arrowUp" />
							<span className="arrowDown" />
						</div>
					}
				</div>
			</div>
		)
	}

}

export default AllMenu;