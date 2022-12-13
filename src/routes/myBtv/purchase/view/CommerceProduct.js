// commons
import React, { Component, Fragment } from 'react';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import Utils, { scroll, newlineToBr } from 'Util/utils';
import { NXPG } from 'Network';
import { Core } from 'Supporters';

// style
import 'Css/myBtv/purchase/CommerceProduct.css';

// util
import moment from 'moment';
import isEqual from 'lodash/isEqual';

// component
import TermsPopup from '../components/TermsPopup';
import CommerceSlide from '../components/CommerceSlide';

// test data
import CommerceProductJson from '../../../../assets/json/routes/myBtv/purchase/CommerceProduct.json';

const { Keymap: { ENTER, BACK_SPACE, PC_BACK_SPACE, UP, DOWN } } = keyCodes;

let focusOpts = {
	btnGroup: {
		id : 'btnGroup',
        containerSelector : '.btnBottomWrap',
        focusSelector : '.csFocus',
        row : 1,
		col : 2,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 1
	},
	tabList: {
		id : 'tabList',
        moveSelector : 'li',
        focusSelector : '.csFocusTab',
        row : 1,
		col : 5,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 4
	},
	inTabBtn: {
		id : 'inTabBtn',
        containerSelector : '.btnWrap',
        focusSelector : '.csFocusCenter',
        row : 1,
		col : 1,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 0
	},
	termsPop: {
		id: 'termsPop',
		type: 'FAKE',
	}
}

class CommerceProduct extends PageView {
	constructor(props) {
		super(props);

		// 퍼블리싱 테스트 용
		let Json = CommerceProductJson;

		const locationState = this.props.history.location.state;
		let srisId = '', epsdId = '';
		if ( locationState ) {
			srisId = locationState.srisId;
			epsdId = locationState.epsdId;
		}

		this.state = {
			srisId,
			epsdId,
			data: {},

			// legacy
			tabBtnList: ['상품정보', '안내', '배송안내', '교환/환불 관련', '약관'],
			tabContainerClass: '',
			curTabIdx: 0,
			termsToggle: false,
			servicePeriod: true,
		};

		this.defaultFM = {
			btnGroup: new FM({
				...focusOpts.btnGroup,
				onFocusContainer: this.onBtnGroupFocus,
				onFocusKeyDown: this.onBtnGroupKeyDown
			}),
			tabList: new FM({
				...focusOpts.tabList,
				onFocusContainer: this.onTabFocus,
				onFocusChild: this.onTabItemFocus
			}),
			inTabBtn: new FM({
				...focusOpts.inTabBtn,
				onFocusKeyDown: this.onInTabBtnKeyDown,
			}),
			termsPop: new FM({
				...focusOpts.termsPop,
				onFocusChild: this.onTermsPopKeyDown
			})
		}

		const focusList = [
			{ key: 'itemDetails', fm: null },
			{ key: 'btnGroup', fm: null },
			{ key: 'tabList', fm: null },
			{ key: 'inTabBtn', fm: null },
			{ key: 'termsPop', fm: null }
		];
		this.declareFocusList(focusList);
	}

	onKeyDown(evt) {
		const { keyCode } = evt;
		const { termsToggle } = this.state;
		this.handleKeyEvent(evt);
		if ( keyCode === PC_BACK_SPACE || keyCode === BACK_SPACE ) {
			if ( termsToggle ) return true;
		}
	}

	onTermsPopKeyDown = (evt, idx) => {
		return true;
	}

	// 약관 더보기 버튼
	onInTabBtnKeyDown = (evt, idx) => {
		const { keyCode } = evt;
		const { termsToggle } = this.state;

		// ENTER 시
		if ( keyCode === ENTER ) {
			this.setState({ termsToggle: true });
			this.setFm('termsPop', this.defaultFM.termsPop);
		}

		// 약관이 활성화 되어있을 경우
		if ( termsToggle ) {
			if ( keyCode === UP || keyCode === DOWN ) {
				return true;	
			}
			if ( keyCode === BACK_SPACE || keyCode === PC_BACK_SPACE ) {
				this.setState({ termsToggle: false });
			}
		}
	}

	// 재구매, 닫기버튼 그룹에 포커스가 올 때
	onBtnGroupFocus = (evt, idx) => {
		this.setState({
			tabContainerClass: '',
			pagerWrapClass: '',
		});
		scroll(0);
	}

	// 재구매, 닫기버튼 그룹에서 키를 눌렀을 때
	onBtnGroupKeyDown = (evt, idx) => {
		const { keyCode } = evt;
		const { servicePeriod } = this.state;

		if ( keyCode !== ENTER ) return false;

		if ( servicePeriod ) {

			if ( idx === 0 ) {		// 재구매

			} else if ( idx === 1 ) {	// 닫기
				this.moveBack();
			}

		} else {
			if ( idx === 0 ) {		// 닫기
				this.moveBack();
			}
		}

	}

	// 탭에 포커스 올 때
	onTabFocus = (evt, idx) => {
		this.setState({
			tabContainerClass: 'focus',
			pagerWrapClass: 'down',
		});
		scroll(-1080);
	}

	// 탭 1개에 포커스 올 때
	onTabItemFocus = (idx) => {
		if ( idx === 4 ) {		// 약관 탭에 포커스
			this.setState({
				curTabIdx: idx,
			}, () => {
				this.setFm('inTabBtn', this.defaultFM.inTabBtn);
				// this.setFocus('tabList', 4);
			});
		} else {			// 약관이 아닌 탭에 포커스
			this.setState({
				curTabIdx: idx
			}, () => {
				this.setFm('inTabBtn', null);
			});
		}
	}

	// 포커스 초기화
	initFocus = () => {
		const { itemDetails, btnGroup, tabList } = this.defaultFM;
		this.setFm('btnGroup', btnGroup);
		this.setFm('tabList', tabList)
	}

	getData = async (sris_id, epsd_id) => {
		const NXPG_015 = await NXPG.request015({ sris_id, epsd_id });
		
		let data = {};
		let contents = {};
		let timeRemaining = 0;
		if ( NXPG_015.result === '0000' ) {
			data = NXPG_015.commerce;
			contents = NXPG_015.commerce.contents[0];
			timeRemaining = moment(data.svc_to_dt, "YYYY-MM-DD a HH:mm:ss").diff(moment(), 'days');
		}

		this.setState({ contents, data, servicePeriod: timeRemaining < 1 })
	}

	componentDidUpdate = (prevProps, prevState) => {
		if ( !isEqual(prevState.servicePeriod, this.state.servicePeriod) ) {
			console.log('포커스 정보', this.getFocusInfo('btnGroup'));
			this.getFocusInfo('btnGroup').fm.setListInfo({
				col : 1,
				focusIdx : 0,
				lastIdx : 0
			})
		}
	}
	

	componentDidMount() {
		const { srisId, epsdId } = this.state;
		document.querySelector('.wrapper').classList.add('dark');

		this.initFocus();

		if ( !srisId || !epsdId ) {
			this.moveBack();
		} else {
			this.getData(srisId, epsdId);
		}
	}

	componentWillUnmount() {
		document.querySelector('.wrapper').classList.remove('dark');
		super.componentWillUnmount();
	}

	render() {
		const {
			tabBtnList, tabContainerClass, pagerWrapClass, represent, curTabIdx, termsToggle, servicePeriod,
			productInfo, notice, delivery, policy,
		} = this.state;
		
		const { rltn_prd_nm, svc_to_dt, products, rltn_prd_expl, info_id, delivery_info_id, refund_info_id, clause_info_id } = this.state.data;
		const { contents } = this.state;

		const tabContentsGroup = [
			rltn_prd_expl,
			info_id,
			delivery_info_id,
			refund_info_id,
			clause_info_id
		];
		const clause = tabContentsGroup[tabContentsGroup.length-1];

		let endDayNumber = moment().diff(moment(svc_to_dt, "YYYY-MM-DD a HH:mm:ss"), 'days');
		let endDay = Math.abs(endDayNumber) > 7 ? null : `만료 ${endDayNumber}일전`;
		let endDate = moment(svc_to_dt, "YYYY-MM-DD a HH:mm:ss").format(
			'YYYY[.]MM[.]DD a hh:mm [까지]'
		);

		return (
			<div className="wrap">
				<div className="commerceProductBg">
					<img src='/assets/images/common/bg/bg_popup.png' alt="팝업 배경" />
				</div>
				<div className="commerceProductWrap scrollWrap">
					<div className="itemWrap contentGroup">
						<p className="title"> {rltn_prd_nm} </p>
						<p className="subInfo">
							이용기간&nbsp;
							{endDay && <span className="expiry">{endDay}</span>}
							<span className="date">({endDate})</span>
						</p>
						{ (contents && products) &&
							<ProductImage contents={contents}
										  products={products}
										  productTitle={rltn_prd_nm}
										  setFm={this.setFm}
										  setFocus={this.setFocus}
							/>
						}
						<div className="btnBottomWrap" id="btnGroup">
						{ servicePeriod &&
							<span className="csFocus btnStyle">
								<span className="wrapBtnText">재구매</span>
							</span>
						}
							<span className="csFocus btnStyle">
								<span className="wrapBtnText">닫기</span>
							</span>
						</div>
					</div>
					<div className={`pagerWrap ${pagerWrapClass}`}>
						<span className="infoTitle">상품정보 / 교환환불</span>
						<span className="pageArr"></span>
					{ (contents && products) && <span className="productTitle">{rltn_prd_nm}</span> }
					</div>

					<ul className={`tabStyle tabWrap contentGroup ${tabContainerClass}`} id="tabList">
						{ tabBtnList.map((item, idx) => (
							<li key={idx}>
								<span className={`csFocusTab tabItem ${idx === curTabIdx ? ' defaultFocus focusOn' : ''}`}>
									<span className="wrapBtnText">{ item }</span>
								</span>
							</li>
						))}
					</ul>

					<div className="tabContWrap">
						<div className="tabCont select">
							{ rltn_prd_expl &&
								<TabContents index={curTabIdx}
										 contents={tabContentsGroup[curTabIdx]}
										 infoDesc={contents.productInfoDesc}
								/>
							}
						</div>
					</div>
					{ termsToggle && <TermsPopup clause={clause}/> }
				</div>
			</div>
		)
	}

}

class ProductImage extends Component {

	constructor(props) {
		super(props);
		this.state = {
			focused: false
		};
	}

	onItemDetailsKeyDown = (evt, idx) => {
		const { keyCode } = evt;
		const { contents, products, productTitle } = this.props;
		const { epsd_id, sris_id, synon_typ_cd, wat_lvl_cd} = contents;

		if ( keyCode !== ENTER ) return ;

		if ( idx === 0 ) {		// 시놉시스 이동
			Utils.toSynopsis(synon_typ_cd, { sris_id, epsd_id, wat_lvl_cd });
		} else if ( idx === 1 ) {	// 이미지 상세
			console.log('product props', this.props.products)
			Core.inst().showPopup(
				<CommerceSlide products={products} title={productTitle} />,
				{},
				() => console.log('이미지 상세 닫음')
			);
		}
	}

	componentDidMount = () => {
		const { setFm, setFocus } = this.props;
		const fm = new FM({
			id : 'itemDetails',
			containerSelector : '.itemDetail',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onItemDetailsKeyDown
		});
		setFm('itemDetails', fm);
		setFocus('itemDetails', 0);
	}

	render() {
		const { contents, products, productTitle } = this.props;
		const poster = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${contents.poster_filename_v}`;
		const productImage = `${Utils.getIipImageUrl(684, 322)}${products[0].img_path}`;
		return (
			<div className="itemDetail" id="itemDetails">
				<div className="item csFocus">
					<img src={poster} alt=""/>
					<span className="itemTitle">{contents.title}</span>
				</div>
				<div className="itemPresent csFocus">
					<img src={productImage} alt=""/>
					<span className="itemTitle">{productTitle}</span>
				</div>
			</div>
		)
	}
}

class TabContents extends Component {
	render() {
		const { index, contents, infoDesc } = this.props;
		if ( index === 0 ) {
			let text = contents.split('\n');
			return (
				<Fragment>
					<ul className="listCircle">
						{ text.map((data, i) => (
							<li key={i}>{ data }</li>
						))}
					</ul>
					{ infoDesc && <p className="productInfo">{infoDesc}</p> }
				</Fragment>
			);
		} else if ( index === 4 ) {
			// const text = contents;
			console.log(contents);
			let text = newlineToBr(contents.exps_phrs_ctsc);
			const title = contents.exps_phrs_title;
			return (
				<Fragment>
					<div className="scrollBoxWrap">
						<div className="clauseBox" style={{'WebkitBoxOrient':'vertical'}}>
							{ title }
							<br/><br/>
							{ text }
						</div>
					</div>
					<div className="btnWrap contentGroup" id="inTabBtn">
						<span className="csFocusCenter btnStyle type03">
							<span className="wrapBtnText">더보기</span>
						</span>
					</div>
				</Fragment>
			)
		} else {
			let text = contents.exps_phrs_ctsc.split('\n')
			return (
				<ul className="listCircle">
					{ text.map((data, i) => <li key={i}>{ data }</li>)}
				</ul>
			);
		}
	}
}

export default CommerceProduct;

