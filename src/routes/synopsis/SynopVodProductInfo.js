import React from 'react';
import { createMarkup } from '../../utils/common';
// import { fm } from '../../supporters/navigator';
// import FM from 'Supporters/navi';
// import appConfig from 'Config/app-config';
//import SynopVodProductClausePop from './popup/SynopVodProductClausePop.js';
// css
import '../../assets/css/routes/synopsis/VODProduct.css';
// import _ from 'lodash';
import caluseData from './popup/caluseData.json';

class SynopVodProductInfo extends React.Component {
	
	render() {
		const {moreBtnFocus, tabsInfo} = this.props;
		let productInfos = ['상품정보', '안내', '배송안내', '교환/환불 관련', '약관내용']
		let infoTitleTabs = []

		
		for( const [i, productInfo] of productInfos.entries()) {
			let className = 'csFocusTab csFocus tabItem';
			if(i === 4 && moreBtnFocus){
				className = 'csFocusTab csFocus tabItem defaultFocus';
			}
			infoTitleTabs.push(
				<li key={i}>
					<span className={className} idx={i}>
						<span className="wrapBtnText">{productInfo}</span>
					</span>
				</li>
			)
		}

		var re = /\r\n/g;
		const convertTabsInfo = tabsInfo.replace(re, '<br/>')

		let tabsInfomation;
		if (this.props.tabsIdx === 4) {
			tabsInfomation = (
				<div>
					<div className="scrollBoxWrap">
						<div className="clauseBox" style={{ 'WebkitBoxOrient': 'vertical' }} dangerouslySetInnerHTML={createMarkup(caluseData.clause)}></div>
					</div>
					<div className="btnWrap contentGroup" id="moreBtn">
						<span className="csFocusCenter csFocus btnStyle type03" >
							<span className="wrapBtnText">더보기</span>
						</span>
					</div>
				</div>
			)
		} else {
			tabsInfomation = (
				<div>
					<div className="scrollBoxWrap">
						<ul className="listCircle" style={{ listStyle: 'none' }}>
							<li dangerouslySetInnerHTML={createMarkup(convertTabsInfo)}></li>
						</ul>
					</div>
				</div>
			)
		}

		return (
			<div id="productInfoTabs">
				<ul className="tabStyle tabWrap contentGroup" >
					{infoTitleTabs}
				</ul>
				<div className="tabContWrap">
					<div className="tabCont select">
						{tabsInfomation}
					</div>
				</div>
			</div>
		)
	}
}

export default SynopVodProductInfo;