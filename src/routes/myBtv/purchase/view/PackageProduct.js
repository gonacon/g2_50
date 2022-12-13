// commons
import React, { Component } from 'react';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import constants from 'Config/constants';

// network
import { NXPG } from 'Network';

// style
import 'Css/myBtv/purchase/PackageProduct.css';

//util
import moment from 'moment';
import Utils from 'Util/utils';

// component
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD } from 'Module/G2Slider';

// test data
// import packageProductSlide from '../../../assets/json/routes/myBtv/purchase/packageProductSlide.json';

const { Keymap: { BACK_SPACE, PC_BACK_SPACE, ENTER } } = keyCodes;
const { SYNOPSIS, SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT } = constants;

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

const merge = Object.assign;
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
	}
};

class PackageProduct extends PageView {
	constructor(props) {
		super(props);

		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 42; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		this.state = {
			slideItem:[],
			// allView: true,
			slideWrapClass: 'slideWrap',
			slideCurIdx: 0,
            slideTo: 0,
			activeSlide: false,
			bottomBtn : ["재구매", "닫기"],
			endDay: '',
			endDate: '',
			packageName: '',
		};

		this.defaultFM = {
			btnGroup: new FM(merge(focusOpts.btnGroup, {
				onFocusKeyDown: this.onBtnKeyDown
			}))
		}

		const focusList = [
			{ key: 'slideList', fm: null },
			{ key: 'btnGroup', fm: null },
		];
		this.declareFocusList(focusList);
	}

	closePage = () => {
		//팝업 일때
		// this.props.callback();
		// return true;
		this.moveBack();
	}

	onBtnKeyDown = (evt, idx) => {
		const { keyCode } = evt;
		const { bottomBtn } = this.state;
		if ( keyCode !== ENTER ) return ;

		if ( bottomBtn.length === 1 ) {			// 버튼 1개만 있을 때 (닫기 처리)
			if ( idx === 0 ) {
				return this.closePage();
			}
		} else if ( bottomBtn.length === 2 ) {	// 버튼 2개 있을 때 (재구매, 닫기 처리)
			if ( idx === 0 ) {
				// 재구매
				
			} else if ( idx === 1 ) {
				return this.closePage();
			}
		}
	}

	onSlideItemFocus = (idx) => {	
	}

	toSynopsis = (synon_typ_cd, param) => {
		let path = SYNOPSIS;
		if (synon_typ_cd === '01' || synon_typ_cd === '02') {		//시즌/단편
			path = SYNOPSIS;
		} else if (synon_typ_cd === '03') {			// GW시놉(패키지 형)
			path = SYNOPSIS_GATEWAY;
		} else if (synon_typ_cd === '04') {			// VOD관련상품 시놉 (커머스형)
			path = SYNOPSIS_VODPRODUCT;
		}
		// this.movePage(path, param);
		Utils.movePageAfterCheckLevel(path, param, param.wat_lvl_cd);
	}

	onSelectSlideVOD = (evt, focusIdx) => {
		if ( evt.keyCode !== ENTER ) return ;
		const { slideItem: { epsdId: epsd_id, srisId: sris_id, synopsisTypeCode, adult, level: wat_lvl_cd } } = this.state;
		const synopParam = { sris_id, epsd_id, wat_lvl_cd };
		this.toSynopsis(synopsisTypeCode, synopParam);
	}

	initFocus = () => {
		const { slideItem } = this.state;
		const { btnGroup } = this.defaultFM;
		this.setFm('btnGroup', btnGroup);
		this.setFocus('slideList', 0);
	}

	getPackageList = async () => {
		console.log('%c this.props', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', this.props);
		const { srisId: sris_id, epsdId: epsd_id } = this.props.history.location.state;

		if ( typeof sris_id === 'undefined' || typeof epsd_id === 'undefined' ) {
			return this.moveBack();
		}

		const list = await NXPG.request014({sris_id, epsd_id});
		const lang = {
			'01': '우리말',	
			'02': '한글자막',	
			'03': '영어자막',	
			'04': '영어더빙',	
			'05': '중국어더빙',	
			'15': '외국어자막서비스',	
			'13': '기타',
		};

		// 날짜만 따지므로 시,분,초는 무시 (2017.06.19 오전 10:52 까지)
		let endDayNumber = moment().diff(moment(list.package.svc_to_dt, "YYYY-MM-DD a HH:mm:ss"), 'days');
		let endDay = Math.abs(endDayNumber) > 7 ? null : `만료 ${endDayNumber}일전`;
		let endDate = moment(list.package.svc_to_dt, "YYYY-MM-DD a HH:mm:ss").format(
			'YYYY[.]MM[.]DD a hh:mm [까지]'
		);
		let packageName = list.package.title;
		let slideItem = !list.package.contents ? [] : list.package.contents.map((item, idx) => ({
			// image: `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${item.poster_filename_v}`,
			image: item.poster_filename_v,
			title: item.title,
			lang: lang[item.lag_capt_typ_cd],
			epsdId: item.epsd_id,
			srisId: item.sris_id,
			synopsisTypeCode: item.synon_typ_cd,
			adult: item.adlt_lvl_cd,
			level: item.wat_lvl_cd
		}));

		let bottomBtn = endDayNumber >= 0 ?  ['재구매', '닫기'] : ['닫기'];

		this.setState({
			packageName,
			endDay,
			endDate,
			slideItem,
			bottomBtn,
		});
		
	}

	componentDidUpdate(prevProps, prevState) {
		if ( this.state.slideItem !== prevState.slideItem ) {
			this.initFocus();
		}
	}

	componentDidMount() {
		this.props.showMenu(false);
		this.getPackageList();
	}

	render() {
		const { slideTo, slideItem, /*allView,*/ slideWrapClass, slideCurIdx, bottomBtn, endDay, endDate, packageName } = this.state;
		const length = slideItem.length;

		return (
			<div className="wrap">
				<div className="packageProductWrap scrollWrap">
					<div className="packageProductTitleWrap">
						<p className="title">{packageName}</p>
						<p className="subTitle">
							<span className="usingDateTitle">
								이용기간 {endDay && <strong>{endDay}</strong>}
							</span>
						</p>
						<p className="subTitle">({endDate})</p>
					</div>
					<div className="recommendSlideWrap">
						<G2NaviSlider
							id="slideList"
							title={null}
							type={SlideType.RECOMMEND}
							onKeyDown={this.onSelectSlideVOD}
							rotate={true}
							bShow={true}
							setFm={this.setFm}
						>
							{ slideItem.map((slide, idx) => (
								<G2NaviSlideMyVOD key={idx} idx={idx}
									adultLevelCode={slide.adult}
									watLevelCode={slide.level}
									title={slide.title}
									imgURL={slide.image}
									espdId={slide.epsdId}
									srisId={slide.srisId}
									synopsisTypeCode={slide.synopsisTypeCode}
									lang={slide.lang}
									bAdult={slide.isProtection}
								/>
							))}
						</G2NaviSlider>
					</div>
					<div className="btnBottomWrap" id="btnGroup">
						{ bottomBtn.map((data, i) => (
							<span className="csFocus btnStyle" key={i}>
								<span className="wrapBtnText">{data}</span>
							</span>
						))}
					</div>
				</div>
			</div>
		)
	}
}

export default PackageProduct;

