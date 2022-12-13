import React from 'react';
// import { fnScrolling, createMarkup } from '../../utils/common';
// import { fm } from '../../supporters/navigator';
// import FM from 'Supporters/navi';
// import appConfig from 'Config/app-config';
import Utils from '../../utils/utils'
import _ from 'lodash';
import NumberFomat from 'Module/UI/NumberFormat';
import getTextWidth from 'text-width';
import appConfig from 'Config/app-config';

const LANGUAGE = {
	'01' : '우리말',
	'02' : '한글자막',
	'03' : '영어자막',
	'04' : '영어더빙',
	'05' : '중국어더빙',
	'15' : '외국어 자막서비스',
	'13' : '기타'
}

class SynopVodProductTop extends React.Component {
	constructor(props){
		super(props);
		
	}
	
	getTitleWidth = (itemTitle) => {
		const titleWidth = getTextWidth( itemTitle, {
			family: 'SK Btv',
			size: '26px',
			weight: '700'
		});

		return titleWidth;
	}

	render () {
		const {synopInfo, payState, synopVodProducts} = this.props;

		let itemProducts = [];
		for( const [idx, product] of synopVodProducts.entries()){
			if(product.contentType  === 'related') {
				const focusName = idx === 0 ? 'csFocus itemPresent first' : 'csFocus itemPresent';
				const itemTitle = payState ? '':'구매하기 전 상품을 확인해 주세요';

				const titleWidth = this.getTitleWidth(itemTitle)
				
				const content_width = Number(appConfig.headEnd.IMAGE.synop_detail_slide.replace('/', '').split('_')[0]);
				
				let textWrapStyle = {
					textAlign: 'center',
				};

				if(synopVodProducts.length >= 6){
					if ( idx === 0 && titleWidth > content_width) {
						textWrapStyle = {
							right: '-40%',
							textAlign: 'left',
						}
					} else {
						textWrapStyle = {
							textAlign: 'center',
						}
					}
				}

				itemProducts.push(
					<div className={focusName} key={idx}>
		 				{
		 					!_.isEmpty(product.img_path) ?
		 					<img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_DETAIL_SLIDE) + product.img_path} alt="" />
		 					:""
		 				}
		 				<span className="itemTitle" style={textWrapStyle}>{itemTitle}</span>
		 			</div>
				)
			} else {
				const languageCode = product.languageCode;
				const language = LANGUAGE[languageCode];
				const contentTitle = product.title;
				let lastIndex = false;
				lastIndex = idx === synopVodProducts.length-1;
				
				const itemTitle = payState ? contentTitle : '구매하기 전 상품을 확인해 주세요';
				
				let focusName = 'csFocus item';
				if(synopVodProducts.length >= 6){
					 focusName = lastIndex ? 'csFocus item last' : 'csFocus item';

				}
				const titleWidth = this.getTitleWidth(itemTitle)

				const content_width = Number(appConfig.headEnd.IMAGE.synop_vod_content.replace('/', '').split('_')[0]);
				
				let textWrapStyle = {
					textAlign: 'center',
				};
				
				if(synopVodProducts.length >= 6){
					if ( lastIndex && titleWidth >= content_width) {
						textWrapStyle = {
							left: '-0%',
							textAlign: 'right',
						}
					} else {
						textWrapStyle = {
							textAlign: 'center',
						}
					}
				}
				
				itemProducts.push(
					<div className={focusName}  key={idx}>
						{
							!_.isEmpty(product.img_path) ?
							<img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_VOD_CONTENT_SIZE) + '/' + product.img_path} alt=""/>
							:<img alt=""/>
						}
						<span className="itemTitle" style={textWrapStyle}>{itemTitle}</span>
						{
							!_.isEmpty(language) ?
							<span className="langMark">{language}</span> : ''
						}
						
					</div>
				)
			}
		}
		
		let pagerWrapClassName = 'pagerWrap';
		if (this.props.tabFocusStatus) {
			pagerWrapClassName = 'pagerWrap down';
		}

		let salePrc;
		if(Number(synopInfo.prd_prc_vat) === Number(synopInfo.sale_prc_vat)){
			salePrc = false;
		}else{
			salePrc = true;
		}
		
		return (
			<div>
				<div className="itemWrap contentGroup">
					<div className="itemDetail" >
						<div id="productTop">
							{itemProducts}
						</div>
					</div>
					{
						payState ? ''
						:
						<div className="btnBottomWrap" id="purchaseBtn">
							<div className="csFocus btnStyle2" >
								<span className="wrapBtnText">
									<span className="purchase">
										<span className="purchaseTitle">구매하기</span>
										{salePrc ? <span className="productionCost"><NumberFomat value={synopInfo.prd_prc_vat}/></span>: ''} 
										<span className="dc"><NumberFomat value={synopInfo.sale_prc_vat}/></span>
										원
									</span>
								</span>
							</div>
						</div>
					}
				</div>
				<div className={pagerWrapClassName}>
					<span className="infoTitle">상품정보 / 교환환불</span>
					<span className="pageArr"></span>
					{/* <span className="productTitle">{synopInfo.rltn_prd_nm}</span> */}
				</div>
			</div>
		)
	}
}

export default SynopVodProductTop;