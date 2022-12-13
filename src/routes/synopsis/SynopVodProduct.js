// common
import React from 'react';
//import {  createMarkup } from '../../utils/common';
import FM from 'Supporters/navi';
//import appConfig from 'Config/app-config';

// css
import '../../assets/css/routes/synopsis/VODProduct.css';

// utils
import _ from 'lodash';
import { Core } from '../../supporters';
import keyCodes from '../../supporters/keyCodes';
import constants from '../../../src/config/constants'
import {scroll} from '../../utils/utils.js'
import PageView from '../../supporters/PageView.js';
import synopAPI from './api/synopAPI';

//import VODProductJson from '../../assets/json/routes/synopsis/VODProduct.json';
//import vodRelation from '../../assets/json/routes/synopsis/Vod115.json';

//component
import Utils from '../../utils/utils'
import SynopVodProductDetail from './popup/SynopVodProductDetail';
import SynopVodProductInfo from './SynopVodProductInfo' ;
import SynopVodProductTop from './SynopVodProductTop';
import SynopVodProductClausePop from './popup/SynopVodProductClausePop.js';
import { CTSInfo } from 'Supporters/CTSInfo';


class SynopVodProduct extends PageView {
	constructor(props) {
		super(props);

		//!_.isEmpty(this.historyData) ? payState = this.historyData.payState : payState = false
		this.state = _.isEmpty(this.historyData) ? {
			synopInfo : [],
			payState : null, //구매여부
			tabsDescription : '',
			tabsFocusOn : false,
			//synopInfo : null,
			synopVodProducts : null,
			tabsIdx : 0,
			darkTheme : true,
			adult_flag: !_.isEmpty(this.paramData.adult_flag) ? this.paramData.adult_flag : '0',
			moreBtnFocus: false
		} : this.historyData;

		this.focusList = [];
	}

	componentDidMount() {
		const { showMenu } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
		}
		
		//let paramData = this.paramData;
		let payState = null;
		
		if(this.historyData) {
			payState = this.historyData.payState;
			const synopVodProducts = this.historyData.synopVodProducts;	
			if (payState){
				this.setState({
					payState : payState
				})
			}
			this.setFocusList(payState);
				this.setDefaultFm(synopVodProducts);
				this.setFocus(0, 0);

		} else {
			let param = {	
				sris_id : this.paramData.sris_id
			}
			synopAPI.xpg015(param).then((xpgResult) => {
				if(!_.isEmpty(xpgResult) && xpgResult.result === '0000') {
					const xpg015Info = xpgResult.commerce;

					let meTv062Param = {
						prd_prc_id : xpg015Info.prd_prc_id
					}
					let synopVodProducts = [];

					for(const [idx, product] of xpg015Info.products.entries()) {
						if(idx === 0) { // 현재는 products 의 0번째를 synop 메인 이미지로 요청(구분값없음)
							synopVodProducts.push({
								index : idx,
								title : '',
								sris_id : '',
								epsd_id : '',
								wat_lvl_cd : '',
								contentType : 'related',
								languageCode : '',
								img_path : product.img_path
							})
						}
					}
					
					const relatedProductLen = synopVodProducts.length;
					for(const [idx, product] of xpg015Info.contents.entries()) {	
						synopVodProducts.push({
							index : relatedProductLen + idx,
							title : product.title,
							sris_id : product.sris_id,
							epsd_id : product.epsd_id,
							wat_lvl_cd : product.wat_lvl_cd,
							contentType : 'vod',
							languageCode : product.lag_capt_typ_cd,		
							img_path : product.poster_filename_v
						})
					}
					
					this.setState({
						synopInfo : xpg015Info,
						synopVodProducts : synopVodProducts
					})
					
					synopAPI.metv062(meTv062Param).then((metvInfo) => {
						if(!_.isEmpty(metvInfo) && metvInfo.result === '0000') {
							const payStateYn = metvInfo.resp_directList[0].resp_direct_result;
							
							if(payStateYn === 'Y') {
								payState = true;
							} else {
								payState = false;
							}
							
							this.setState({
								payState : payState
							})
							this.setFocusList(payState);
							this.setDefaultFm(synopVodProducts);
							this.setFocus(0, 0);
						} else {
							Core.inst().showToast(metvInfo.result, metvInfo.reason);
						}
					})
				} else {
                    Core.inst().showToast(xpgResult.result, xpgResult.reason);
				}
			})
		}
	}

	setFocusList = (payState) => {
		if (payState) {
			this.focusList = [
				{ key : 'productTop', fm: null },
				{ key : 'productInfoTabs', fm: null },
				{ key : 'moreBtn', fm: null}
			]
		} else {
			this.focusList = [
				{ key : 'productTop', fm: null },
				{ key : 'purchaseBtn', fm: null },
				{ key : 'productInfoTabs', fm: null},
				{ key : 'moreBtn', fm: null}
			]
		}
		this.declareFocusList(this.focusList);
	}
	
	setDefaultFm = (synopVodProducts) => {
		for(let item of this.focusList) {
			let containerSelector = '';
			let moveSelector = '';
			let row = 1;
			let col = 1;
			let focusIdx = 0;
            let startIdx = 0;
            let lastIdx = 0;
			let dataLen = 0;
			let type = 'LIST';
			let bRowRolling = true
			let onFocusKeyDown = function () {};
			let onFocusContainer = function () {};
			let onBlurContainer = function () {};
			let onFocusChild = function() {};

			switch (item.key) {
				case 'productTop':
					dataLen = synopVodProducts.length;
					col = dataLen;
					lastIdx = dataLen-1;
					onFocusKeyDown = this.onFocusKeyDownProductTop;
					break;
				case 'purchaseBtn':
					type = 'ELEMENT';
					onFocusKeyDown = this.onFocusKeyDownPurchaseBtn;
					break;
				case 'productInfoTabs':
					moveSelector = 'ul li'
					col = 5
					lastIdx = 4
					focusIdx = 0
					onFocusKeyDown = this.onFocusKeyDownPoroductInfoTabs
					onFocusContainer = this.onFocusProductInfoTabs
					onBlurContainer = this.onBlurPoroductInfoTabs
					onFocusChild = this.onFocusChildProductInfoTabs
					break;
				case 'moreBtn':
					type = 'ELEMENT';
					moveSelector = '';
					onFocusContainer = this.onFocusMoreBtn
					onFocusKeyDown = this.onFocusKeyDownMoreBtn
					onBlurContainer = this.onBlurKeyDownMoreBtn
					break;
					
				default:
					break;
			}
			let option = {
                id: item.key,
                containerSelector,
                moveSelector: moveSelector,
                focusSelector: '.csFocus',
                row: row,
				col: col,
				type : type,
                focusIdx: focusIdx,
                startIdx: startIdx,
                lastIdx: lastIdx,
                bRowRolling: bRowRolling,
                onFocusKeyDown: onFocusKeyDown,
				onFocusContainer : onFocusContainer,
				onBlurContainer : onBlurContainer,
				onFocusChild : onFocusChild
			}
			const fm = new FM(option);
			this.setFm(item.key, fm);
			this.setFocusEnable('moreBtn', false);	
			
		}
	}
	onFocusKeyDownMoreBtn = (evt) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			let obj = {
				darkTheme : this.state.darkTheme
			}
			Core.inst().showPopup(<SynopVodProductClausePop />, obj, null)
		}
	}
	onFocusMoreBtn = () => {
		this.setState({
			moreBtnFocus: true
		})
	} 
	onBlurKeyDownMoreBtn = () => {
		this.setState({
			moreBtnFocus: false
		})
	}
	onFocusChildProductInfoTabs =(idx) => {
		//'상품정보', '안내', '배송안내', '교환/환불 관련', '약관내용'
		
		let tabsDescrip = '';
		switch (idx){
			case 0: 
				//'상품정보'
				this.setFocusEnable('moreBtn', false);
				tabsDescrip = this.state.synopInfo.rltn_prd_expl;
				break;
			case 1:
				//안내
				this.setFocusEnable('moreBtn', false);
				tabsDescrip = this.state.synopInfo.info_id.exps_phrs_ctsc;
				break;
			case 2:
				//배송안내
				this.setFocusEnable('moreBtn', false);
				tabsDescrip = this.state.synopInfo.delivery_info_id.exps_phrs_ctsc;
				break;
			case 3:
				//교환/환불 관련
				this.setFocusEnable('moreBtn', false);
				tabsDescrip = this.state.synopInfo.refund_info_id.exps_phrs_ctsc;
				break;
			case 4:
				//약관내용 고정데이터 퍼블리싱작업중
				this.setFocusEnable('moreBtn', true);	
				tabsDescrip = '전자상거래(인터넷사이버몰) 표준약관'
				break;
			default:
			break;
		}
		this.setState({
			tabsDescription : tabsDescrip,
			tabsIdx : idx
		})


	}
	onFocusKeyDownProductTop = (evt, idx) => {
		
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const { synopVodProducts } = this.state;
			const synopVodProduct = synopVodProducts[idx];

			//VOD 선택시 시놉페이지로 이동 / 이외에는 상품상세페이지로 이동
			if(synopVodProduct.contentType === 'vod'){
				let synopParam = {
					sris_id : synopVodProduct.sris_id,
					epsd_id : synopVodProduct.epsd_id,
				}
				this.movePage(constants.SYNOPSIS, synopParam);
			} else {
				let obj = {
					title : this.state.synopInfo.rltn_prd_nm,
					detailData : this.state.synopInfo.products,
					darkTheme : this.state.darkTheme
				}
				if (this.state.synopInfo.products) {
					Core.inst().showPopup(<SynopVodProductDetail />, obj, null);
				} else { 
					Core.inst().showToast('해당 데이터가 존재하지 않습니다.');
				}
			}
		}
	}

	onFocusKeyDownPurchaseBtn =(evt) => {
		if(evt.keyCode === keyCodes.Keymap.ENTER) {
			const { synopInfo, adult_flag } = this.state;
			const param = {
				//에피소드 ID(xpg에 epsd_id)
				//(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
				//진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
				epsd_id: 'noEpsdId',
				sris_id: synopInfo.sris_id,    //시리즈 ID(시놉에서 진입한 시리즈 ID, xpg에 sris_id)
				prd_prc_id: synopInfo.prd_prc_id, //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
				prd_prc_vat: synopInfo.prd_prc_vat, //기존가격
				synopsis_type: '04',	//진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
				ptype: synopInfo.asis_prd_typ_cd,          //상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
				adult_flag: adult_flag
			};
			CTSInfo.purchasePackage(param, this.purchaseCallBack);
		}
	}

	onFocusKeyDownPoroductInfoTabs = (evt) => {
		if (evt.keyCode === keyCodes.Keymap.UP) {
			scroll(0)
			this.setState({
				tabsFocusOn : false
			})
		}
	}

	onFocusProductInfoTabs =() => {
		scroll(-1080)
		this.setState({
			tabsFocusOn : true
		})
	}
	
	purchaseCallBack = (response) => {
		if (response.result === '0000'){
			this.setFocus(0, 0);
			this.setState({
				payState : true
			})
		}
	}

	render() {
		const { synopInfo, synopVodProducts, payState, tabsFocusOn, tabsIdx, tabsDescription, darkTheme, moreBtnFocus } = this.state;
		let bgImg = Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + synopInfo.bg_img_path
		const darkThemeClass = darkTheme ? "VODProductWrap scrollWrap dark" : "VODProductWrap scrollWrap"
		return (
			!_.isEmpty(synopInfo) &&
			<div className="wrap">
				<div className="VODProductBg">
					<img src={bgImg} alt=""/>
				</div>
				<div className={darkThemeClass} >
					<SynopVodProductTop 
						synopInfo={synopInfo}
						synopVodProducts = {synopVodProducts}
						payState={payState}
						tabFocusStatus = {tabsFocusOn}
					/>
					<SynopVodProductInfo 
						synopInfo={synopInfo}
						tabsIdx = {tabsIdx}
						tabsInfo={tabsDescription}
						moreBtnFocus = {moreBtnFocus}
					/>
				</div>
			</div>
		)
	}
}

export default SynopVodProduct;