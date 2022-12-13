import React, { Component } from 'react';

import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { Home, HomeOther, Idle, HomeDynamic, AllMenu, TvApp, GenreDetails } from 'routes';
//시놉시스
import { SynopsisView, SynopsisViewOther, SynopGateWay, SynopPersonalInformation, SynopVodProduct, SynopEnding } from 'routes';
//월정액
import { HomeJoinAfter, HomeJoinBefore, MonthlyDetail } from 'routes';
// 구매
import { BillCoupon, BillCertify, CertifyPopup, BillPhoneCertify, BillDeliveryPhone } from 'routes';
import { BuyShort, BuyChannel, BuyMonthly, BuyBill, BuyBillChannel, OkCashBag } from 'routes';
//마이btv - bPoint, coupon, okcashbag, Tmembership
import { BpointHistory, BpointDetail, CouponDetail, OkCashManage, Tmembership, PackageProduct, CommerceProduct } from 'routes';
//마이btv - 공지사항
import { NoticeList, ListTextDetail, UseGuideItemPop } from 'routes';
//마이btv - 구매내역
import { PurchaseList, } from 'routes';
//마이btv - 찜목록
import { BookmarkList, EditBookmarkList } from 'routes';

//검색
import { SearchHome, SearchMain, SearchResult, SearchResultNone, SearchResultOther } from 'routes';
//실시간
import { ScheduleChart, BoxOffice } from 'routes';
// Organization,
//키즈존
import { KidsHome, Channel, GenreMenuBlock, GenreMenuList, GenreAll, PlayBlock, PlayList, PlayLearning, MonthlyHome, KidsMonthlyDetail, SubCharacter, CharacterHome, CharacterList, CharacterEdit, PlayGuideWatchDistance, PlayGuideWatchLimit, PlayGuideWatchEnd, PlayGuideEnd } from 'routes';

import { PhoneCertification } from 'routes';

import { SweatHome } from 'routes';
import { TestCase } from 'routes';

import './App.css';
// import Menu from '../components/layout/Menu';
import Menu from '../components/gnb/Menu';
import staticData from '../routes/home/homeStaticData';

import PopupContainer from '../popup/PopupContainer'
import Toast from '../popup/Toast'

import {
	MyBtvHome,
	MyVodList,
	EditRecentVodList,
	MyVodDetail,
	MyVodSeasonDetail
} from 'routes';

import Core from "../supporters/core";

import constants from './../config/constants';
import { RecommendVodList } from 'routes';

import { StbTest } from 'routes';
// import { registerObserver } from 'react-perf-devtool';
import KidsWidget from '../routes/kids/widget/KidsWidget';
import { isEmpty } from 'lodash';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';
import { PNS, MeTV, AMS, NXPG, CSS, DIS, EPS, RVS, SCS, SMD, WEPG } from 'Network';
import { IOS } from './../supporters/network/IOS';
import appConfig from 'Config/app-config';
// import framerate from 'framerate';

class App extends Component {
	constructor() {
		super();
		this.state = {
			menuId: '',
			gnbTypeCode: '',
			gnbFm: null,
			menulist: [],
			wrapperClass: ''
		}
		this.gnbMenu = null;
		this.home = null;
		this.synopsisView = null;
		this.SearchResult = null;
	}

	componentDidCatch(error, info) {
		console.log('2@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ componentDidCatch');
		this.setState({
			error: true
		});
	}

	setWrapperClass = classnames => {
		// this.setState({ wrapperClass: classname });
		const classlist = classnames.trim().split(' ');
		const target = document.querySelector('.wrapper');
		if (classnames) {
			target.classList.add(...classlist);
		} else {
			target.classList.remove('default', 'dark');
		}
	}

	setMenuInfo = ({ menuId, gnbTypeCode, gnbFm }) => {
		console.log('setMenuInfo ', arguments);

		const { menuId: thisMenuId, gnbTypeCode: thisGnbTypeCode, gnbFm: thisGnbFm } = this.state;

		this.setState({
			// this.state = {
			menuId: menuId === undefined ? thisMenuId : menuId,
			gnbTypeCode: gnbTypeCode === undefined ? thisGnbTypeCode : gnbTypeCode,
			gnbFm: gnbFm === undefined ? thisGnbFm : gnbFm,
		})
	}

	render() {
		// console.log('%c App.render', 'color: red; background: yellow', );
		const renderWithProps = (Component, props = {}) => (routerProps) => <Component {...routerProps} {...props} />;
		const { menuId, gnbTypeCode, gnbFm, menulist, wrapperClass } = this.state;
		const wrapperClassname = `wrapper ${wrapperClass}`;
		const gnbData = {
			data: { menuId, gnbTypeCode, gnbFm },
			showMenu: this.showMenu,
			activeMenu: this.activeMenu,
			setWrapperClass: this.setWrapperClass
		};
		const monthlyInfo = this.state.menulist[0];

		// Home 과 HomeOther에 번갈아 쓰는 방식 시도
		let HomeComponent = Home;
		if (this.home === Home || this.home === HomeOther) {
			if (this.home === Home) {
				HomeComponent = HomeOther;
			}
		}
		// let HomeComponent = HomeDynamic;
		// if (this.home === HomeDynamic || this.home === HomeOther) {
		// 	if (this.home === HomeDynamic) {
		// 		HomeComponent = HomeOther;
		// 	}
		// }
		let SynopComponent = SynopsisView;
		if (this.synopsisView === SynopsisView || this.synopsisView === SynopsisViewOther) {
			if (this.synopsisView === SynopsisView) {
				SynopComponent = SynopsisViewOther;
			}
		}
		let SearchComponent = SearchResult;
		if (this.SearchResult === SearchResult || this.SearchResult === SearchResultOther) {
			if (this.SearchResult === SearchResult) {
				SearchComponent = SearchResultOther;
			}
		}
		// console.log('====================================');
		// console.log('@@@@@@@@@@@@@@@@@@@@@@@ HomeComponent', HomeComponent.name, gnbData, menulist);
		// console.log('====================================');
		this.home = HomeComponent;
		this.synopsisView = SynopComponent;
		const style = {
			position: "absolute",
			// overflow: "hidden",
			width: "1920px",
			height: "1080px"
		}

		if (this.state.error) {
			console.log('render !!!!!!!!!!!!!!!!!!! this.state.error=', this.state.error);
			return (<h1>에러발생!</h1>);
		}

		return (
			<div className={wrapperClassname} style={style}>
				<HistoryListener setHistory={this.setHistory} />
				<Toast />
				<PopupContainer />
				<Menu setMenuInfo={this.setMenuInfo}
					menulist={menulist}
					menuId={menuId}
					gnbTypeCode={gnbTypeCode}
					gnbFm={gnbFm}
					innerRef={r => this.gnbMenu = r}
				/>
				<KidsWidget />
				<div className="content" ref={r => this.setPageView(r)}>
					<Switch>
						{/* STB I/F Test */}
						<Route path={constants.STB_TEST} render={renderWithProps(StbTest)} />

						{/* 홈으로 보내버리기 */}
						<Route exact path="/" component={GoToHome} />

						{/* 홈 */}
						<Route exact path={constants.IDLE} render={renderWithProps(Idle, gnbData)} />
						<Route exact path={constants.BASE} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={constants.HOME} render={renderWithProps(HomeComponent, { ...gnbData, test: '' })} />
						<Route exact path={`${constants.HOME}/:gnbTypeCode/:menuId`} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={`${constants.HOME_MOVIE}/:gnbTypeCode/:menuId`} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={`${constants.HOME_TV}/:gnbTypeCode/:menuId`} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={`${constants.HOME_ANI}/:gnbTypeCode/:menuId`} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={`${constants.HOME_DOCU}/:gnbTypeCode/:menuId`} render={renderWithProps(HomeComponent, gnbData)} />
						<Route exact path={`${constants.MONTHLY_AFTER}/:gnbTypeCode/:menuId`} component={renderWithProps(HomeJoinAfter, gnbData)} />
						<Route exact path={constants.HOME_TVAPP} render={renderWithProps(TvApp, gnbData)} />
						<Route exact path={constants.DETAIL_GENRE_HOME} render={renderWithProps(GenreDetails, gnbData)} />

						{/* 전체매뉴 */}
						<Route path={constants.ALL_MENU} render={renderWithProps(AllMenu, gnbData)} />

						{/* 실시간 */}
						{/* <Route path={constants.EPG} render={renderWithProps(Organization, { ...gnbData, pageTitle: "전체편성표" })} /> */}
						<Route path={constants.EPG} render={renderWithProps(ScheduleChart, gnbData)} />
						<Route exact path={`${constants.EPG}/:category`} render={renderWithProps(ScheduleChart, gnbData)} />
						<Route path={constants.BOX_OFFICE} render={renderWithProps(BoxOffice, gnbData)} />

						{/* 시놉시스 */}
						{/* <Route path={constants.SYNOPSIS} compoenent={SynopsisView} showMenu={this.showMenu} /> */}
						<Route path={constants.SYNOPSIS} render={renderWithProps(SynopComponent, gnbData)} />
						{/* <Route path={`${constants.SYNOPSIS}/:epsd_id/:sris_id`} render={renderWithProps(SynopsisView, gnbData)} /> */}
						<Route path={constants.SYNOPSIS_GATEWAY} render={renderWithProps(SynopGateWay, gnbData, { payState: false })} />
						<Route path={constants.SYNOPSIS_PERSONAL} render={renderWithProps(SynopPersonalInformation, gnbData)} />
						{/* <Route path={constants.SYNOPSIS_STEEL} render={renderWithProps(SynopShortSteel)} /> */}
						<Route path={constants.SYNOPSIS_VODPRODUCT} render={renderWithProps(SynopVodProduct, gnbData, { payState: false })} />
						<Route path={constants.SYNOPSIS_ENDING} render={renderWithProps(SynopEnding, gnbData)} />

						{/* 키즈존 */}
						<Route path={constants.KIDS_HOME} render={renderWithProps(KidsHome, gnbData)} />
						<Route path={constants.KIDS_CHANNEL} render={renderWithProps(Channel, gnbData)} />
						<Route path={constants.KIDS_GENRE_MENU_ALL} render={renderWithProps(GenreAll, gnbData)} />
						<Route path={constants.KIDS_GENRE_MENU_BLOCK} render={renderWithProps(GenreMenuBlock, gnbData)} />
						<Route path={constants.KIDS_GENRE_MENU_LIST} render={renderWithProps(GenreMenuList, gnbData)} />
						<Route path={constants.KIDS_PLAYBLOCK} render={renderWithProps(PlayBlock, gnbData)} />
						<Route path={constants.KIDS_PLAYLIST} render={renderWithProps(PlayList, gnbData)} />
						<Route path={constants.KIDS_PLAYLEARNING} render={renderWithProps(PlayLearning, gnbData)} />
						<Route path={constants.KIDS_MONTHLYHOME} render={renderWithProps(MonthlyHome, gnbData)} />
						<Route path={constants.KIDS_MONTHLYDETAIL} render={renderWithProps(KidsMonthlyDetail, gnbData)} />
						<Route path={constants.KIDS_MONTHLY_DETAIL_AFTER} render={renderWithProps(KidsMonthlyDetail, { data: "after" })} />
						<Route path={constants.KIDS_SUBCHARACTER} render={renderWithProps(SubCharacter, gnbData)} />
						<Route path={constants.KIDS_CHARACTER_HOME} render={renderWithProps(CharacterHome, gnbData)} />
						<Route path={constants.KIDS_CHARACTER_LIST} render={renderWithProps(CharacterList, gnbData)} />
						<Route path={constants.KIDS_CHARACTER_EDIT} render={renderWithProps(CharacterEdit, gnbData)} />
						<Route path={constants.KIDS_GUIDE_WATCH_DISTANCE} render={renderWithProps(PlayGuideWatchDistance, gnbData)} />
						<Route path={constants.KIDS_GUIDE_WATCH_LIMIT} render={renderWithProps(PlayGuideWatchLimit, gnbData)} />
						<Route path={constants.KIDS_GUIDE_WATCH_END} render={renderWithProps(PlayGuideWatchEnd, gnbData)} />
						<Route path={constants.KIDS_GUIDE_END} render={renderWithProps(PlayGuideEnd, gnbData)} />
						{/* <Route path={constants.KIDS_VIEW_MOVE} render={renderWithProps(KidsViewMove, gnbData)} /> */}

						{/* monthly */}
						<Route path={constants.MONTHLY_AFTER} render={renderWithProps(HomeJoinAfter)} />
						<Route path={constants.MONTHLY_BEFORE} render={renderWithProps(HomeJoinBefore)} />
						<Route path={constants.MONTHLY_DETAIL} render={renderWithProps(MonthlyDetail)} />

						{/* 구매 */}
						<Route path={constants.PURCHASE} render={renderWithProps(BuyShort)} />
						<Route path={constants.PURCHASE_CHANNEL} render={renderWithProps(BuyChannel)} />
						<Route path={constants.PURCHASE_MONTHLY} render={renderWithProps(BuyMonthly)} />
						<Route path={constants.PURCHASE_PRICEEND} render={renderWithProps(OkCashBag, { popup: "PriceEnd" })} />
						<Route path={constants.PURCHASE_BUYBILL} render={renderWithProps(BuyBill, { popup: 'none' })} />
						<Route path={constants.PURCHASE_BUYBILL_CHANNEL} render={renderWithProps(BuyBillChannel)} />
						<Route path={constants.PURCHASE_BILLCOUPON} render={renderWithProps(BillCoupon)} />
						<Route path={constants.PURCHASE_BILLCERTIFY} render={renderWithProps(BillCertify)} />
						<Route path={constants.PURCHASE_CERTIFYPOPUP} render={renderWithProps(CertifyPopup)} />
						<Route path={constants.PURCHASE_BILLCERTIFYONE} render={renderWithProps(BillCertify, { data: 'single' })} />
						<Route path={constants.PURCHASE_BILLPHONECERTIFY} render={renderWithProps(BillPhoneCertify)} />
						<Route path={constants.PURCHASE_BILLDELIVERYPHONE} render={renderWithProps(BillDeliveryPhone)} />

						{/* myBtv */}

						<Route exact path={constants.MYBTV_HOME} render={renderWithProps(MyBtvHome, gnbData)} />
						<Route path={constants.MYBTV_EDIT_VODLIST} render={renderWithProps(EditRecentVodList, gnbData)} />
						<Route path={constants.MYBTV_MYVOD_LIST} render={renderWithProps(MyVodList, gnbData)} />
						<Route exact path={`${constants.MYBTV_MYVOD_DETAIL}/:epsdId/:srisId/:prodId`} render={renderWithProps(MyVodDetail, gnbData)} />
						<Route exact path={`${constants.MYBTV_MYVOD_SEASON_DETAIL}/:epsdId/:srisId/:prodId`} render={renderWithProps(MyVodSeasonDetail, gnbData)} />
						<Route path={constants.MYBTV_MYVOD_RECOMMEND_LIST} render={renderWithProps(RecommendVodList, gnbData)} />
						<Route path={constants.MYBTV_COUPON_DETAIL} render={renderWithProps(CouponDetail, { ...gnbData, monthlyInfo })} />
						<Route path={constants.MYBTV_BPOINT_HISTORY} render={renderWithProps(BpointHistory, gnbData)} />
						<Route path={constants.MYBTV_BPOINT_DETAIL} render={renderWithProps(BpointDetail, gnbData)} />
						{/* <Route path={constants.MYBTV_TMEMBERSHIP} render={renderWithProps(Tmembership, gnbData)} /> 팝업으로 변경 */}
						{/* <Route path={constants.MYBTV_OKCASHBAG_MANAGE} render={renderWithProps(OkCashManage, gnbData)} 팝업으로 변경 /> */}
						<Route exact path={constants.MYBTV_PURCHASE_LIST} render={renderWithProps(PurchaseList, { showMenu: this.showMenu, data: 'general', tabNumber: 0 })} />
						<Route exact path={constants.MYBTV_PURCHASE_PACKAGE} render={renderWithProps(PackageProduct, gnbData)} />
						<Route exact path={constants.MYBTV_PURCHASE_COMMERCE} render={renderWithProps(CommerceProduct, gnbData)} />
						<Route path={constants.MYBTV_NOTICE_LIST} render={renderWithProps(NoticeList, gnbData)} />
						<Route path={constants.MYBTV_NOTICE_DETAIL} render={renderWithProps(ListTextDetail, { ...gnbData, callUrl: constants.CALL_URL.NOTICE })} />
						<Route path={constants.MYBTV_USE_GUIDE_LIST} render={renderWithProps(NoticeList, gnbData)} />
						<Route path={constants.MYBTV_USE_GUIDE_DETAIL} render={renderWithProps(UseGuideItemPop, { ...gnbData, callUrl: constants.CALL_URL.USE_GUIDE })} />
						<Route path={constants.MYBTV_BOOKMARK_LIST} render={renderWithProps(BookmarkList, gnbData)} />
						<Route path={constants.MYBTV_EDIT_BOOKMART_LIST} render={renderWithProps(EditBookmarkList, gnbData)} />

						{/* 검색 */}
						<Route path={constants.SEARCH_MAIN} render={renderWithProps(SearchMain, gnbData)} />
						<Route path={constants.SEARCH_RESULT} render={renderWithProps(SearchComponent, gnbData)} />
						<Route path={constants.SEARCH_RESULT_NONE} render={renderWithProps(SearchResultNone, gnbData)} />
						<Route path={constants.SEARCH_HOME} render={renderWithProps(SearchHome, gnbData)} />

						{/* 샘플 */}
						{/* <Route path="/ui5web/v5/sample/Sample" component={AddPropsToRoute(Sample)} />
								<Route path="/ui5web/v5/sample2/Sample2" component={AddPropsToRoute(Sample2)} /> */}
						<Route path={constants.SAMPLE_CERTI_PHONE} render={renderWithProps(PhoneCertification, gnbData)} />

						{/* 테스트 홈*/}
						<Route exact path={'/ui5web/v5/sweathome'} render={renderWithProps(SweatHome, gnbData)} />
						{/* <Route path={'/ui5web/v5/testcase/'} render={renderWithProps(TestCase, gnbData)} /> */}
						<Route path={'/ui5web/v5/testcase'} component={renderWithProps(TestCase, {...gnbData, showMenu:this.showMenu })} />
					</Switch>
				</div>
			</div>
		);
	}

	showMenu = (bShow, bScrollDown) => {
		// console.error('showMenu:', this.gnbMenu);
		if (!this.gnbMenu) {
			return;
		}
		this.gnbMenu.show(bShow, bScrollDown);
	}

	activeMenu = (gnbTypeCode) => {
		this.gnbMenu.activeMenu(gnbTypeCode);
	}

	setHistory = (history) => {
		Core.inst().setHistory(history);
	}

	setPageView = (webPage) => {
		Core.inst().setPageView(webPage, this.showMenu);
	}


	componentDidMount() {
		// framerate.on('frame', function(fps, frameTime){
		// 	document.getElementById('fps').innerHTML = `[fps: ${fps.toFixed(2)}] `;
		// });
		// console.log('%c APP.componentDidMount', 'color: black; background: white; font-size: 30px;', this.state);
	}

	componentWillReceiveProps(nextProps) {
		//console.error('app.receive', nextProps);
	}

	resetServer() {
		// console.log('resetServer');
		AMS.reset();
		CSS.reset();
		DIS.reset();
		EPS.reset();
		IOS.reset();
		MeTV.reset();
		NXPG.reset();
		PNS.reset();
		RVS.reset();
		SCS.reset();
		SMD.reset();
		// V5SCH.reset();
		WEPG.reset();
	}

	// componentDidMount() {
	requestGnbMenu = () => {
		const { location: { pathname } } = this.props;
		// console.log('app.props', this.props);
		this.resetServer();
		// GNB 메뉴 정보
		NXPG.request001({ transactionId: 'GNB_menu_info' })
			.then(data => {
				let { menus } = data;

				let menulist = !isEmpty(menus) ? menus.map(item => {
					return {
						htmlClass: staticData[item.gnb_typ_cd] && staticData[item.gnb_typ_cd].htmlClass,
						menuText: item.menu_nm,
						menuId: item.menu_id,
						imgs: staticData[item.gnb_typ_cd] && (staticData[item.gnb_typ_cd].imgs || {}),
						gnbTypeCode: item.gnb_typ_cd
					};
					// }).concat([staticData.search, staticData.allmenu]) : [];
				}) : [];

				let gnbTypeCode = '';
				let menuId = '';

				let pathnameSplit = pathname.split('/');
				let homeFlag = pathnameSplit.slice(3, 4)[0];
				let isHome = isEmpty(homeFlag) || homeFlag === 'home';

				// 스윗홈 테스트 코드
				let isSweatHome = pathname.indexOf('/testcase/home') !== -1 || pathname.indexOf('/sweathome') !== -1;

				if (isHome) {
					gnbTypeCode = menulist[2].gnbTypeCode;
					menuId = menulist[2].menuId;
				} else if (isSweatHome) {
					gnbTypeCode = menulist[2].gnbTypeCode;
					menuId = menulist[2].menuId;
				}
				else {
					gnbTypeCode = pathnameSplit[4];
					menuId = pathnameSplit[5];
				}

				const gnbFm = new FM({
					id: 'gnbMenu',
					containerSelector: '.menuWrap ul',
					row: 1,
					col: menulist.length,
					focusIdx: 0,
					startIdx: 0,
					lastIdx: menulist.length - 1,
					onFocusChild: this.gnbMenu.onFocusChild,
					onFocusContainer: this.gnbMenu.onFocusContainer,
					onBlurContainer: this.gnbMenu.onBlurContainer,
					onFocusKeyDown: this.gnbMenu.onFocusKeyDown,
					bRowRolling: true
				});
				StbInterface.setGnbMenuList(menulist);
				this.setState({ menulist, gnbTypeCode, menuId, gnbFm });

			});
	}

	componentWillMount() {
		Core.inst().run(this.requestGnbMenu);
		// this.requestGnbMenu();
		if (!appConfig.runDevice) {
			this.requestGnbMenu();
		}
	}
}

class GoToHome extends Component {
	render() {
		return (
			<Redirect to={constants.HOME} />
		);
	}
}

const HistoryListener = withRouter(class Listener extends Component {
	componentDidMount() {
		const { setHistory } = this.props;
		if (setHistory && typeof setHistory === 'function') {
			// console.error('history:', this.props.history);
			setHistory(this.props.history);
		}
	}
	render() {
		return null;
	}
})

export default withRouter(App);