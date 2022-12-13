import React from 'react'

import './../../../assets/css/components/popup/PopupDefault.css';
import './../../../assets/css/components/popup/Popup.css';
import { createMarkup } from '../../../utils/UI';
import { CTSInfo } from '../../../supporters/CTSInfo';
import PopupPageView from 'Supporters/PopupPageView';
import { numberWithCommas } from './../../../utils/utils';
import { getCodeName } from '../../../utils/code';

/** data = {
 * 	title,
 *  option,
 *  useDate,
 *  price,
 * 	realPrice,
 *  pid
 * }
*/
class PurchaseFinish extends PopupPageView {
	constructor(props) {
		super(props);

		let detailInfo = this.paramData;

		let data = {
			title: '',
			line1_title: '',
			line1_desc: '',
			line2_title: '',
			line2_desc: '',
			price: '',
			v_price: '',
			desc: ''
		};
		
		switch (detailInfo.mode) {
			case CTSInfo.MODE_PPV:
			case CTSInfo.MODE_PPS:
			case CTSInfo.MODE_PPP:
			case CTSInfo.MODE_VODPLUS:
				let strVOC_LAG = "";
				if (detailInfo.PROD_INFO.PROD_DTL.VOC_LAG !== undefined) {
					if (detailInfo.PROD_INFO.PROD_DTL.VOC_LAG === '01') {
						strVOC_LAG = '/ 우리말';
					} else if (detailInfo.PROD_INFO.PROD_DTL.VOC_LAG === '02') {
						strVOC_LAG = '/ 한글자막';
					}
				}
				const FGQUALITY_STR = getCodeName('RSLU_TYP_CD', detailInfo.PROD_INFO.PROD_DTL.FGQUALITY);
				data.title = detailInfo.PROD_INFO.PROD_DTL.PNAME;
				data.line1_title = "시청기간";
				data.line1_desc = detailInfo.PROD_INFO.PROD_DTL.DUETIME_PERIOD + " / " + detailInfo.PROD_INFO.PROD_DTL.DUETIME_STR;
				data.line2_title = "영상옵션";
				data.line2_desc = detailInfo.PTYPE_STR + " / " + FGQUALITY_STR + " " + strVOC_LAG;
				data.price = detailInfo.PROD_INFO.PROD_DTL.PRICE;
				data.v_price = Math.floor(detailInfo.totalPrice);
				data.desc = "콘텐츠 시청시 광고가 포함될 수 있습니다.";
				break;
				
			case CTSInfo.MODE_CHANNEL:
				data.title = detailInfo.PROD_INFO_LIST.PNAME;
				data.line1_title = "시청 기간";
				data.line1_desc = '해지 전까지 무제한';
				data.line2_title = "구매유형";
				data.line2_desc = "월정액";
				data.price = detailInfo.PROD_INFO_LIST.PRICE;
				data.v_price = Math.floor(detailInfo.totalPrice);
				break;
			case CTSInfo.MODE_PPM:
			case CTSInfo.MODE_PPM_HOME:
				data.title = detailInfo.PROD_INFO.PROD_DTL.PNAME;
				data.line1_title = "이용기간";
				data.line1_desc = detailInfo.PROD_INFO.PROD_DTL.DUETIME_STR;
				data.line2_title = "구매유형";
				data.line2_desc = "월정액";
				data.price = detailInfo.PROD_INFO.PROD_DTL.PRICE;
				data.v_price = Math.floor(detailInfo.totalPrice);
				break;
			case CTSInfo.MODE_BPOINT:
				data.title = "B포인트 " + detailInfo.title;
				data.line1_title = "이용기간";
				data.line1_desc = detailInfo.expireMessage;
				data.line2_title = "구매유형";
				data.line2_desc = "B포인트";
				data.price = detailInfo.supplyAmount;
				data.v_price = detailInfo.totalAmount;
				break;
			default:
				break;
		}
		this.state = {
			data: data
		};
	}

	componentDidMount = () => {
		setTimeout(() => {
			this.props.callback({ playVOD: true });
		}, 5000);
	}

	render() {
		return (
			<div className="buyWrap">
				<Popup data={this.state.data} />
			</div>
		)
	}
}

class Popup extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			data: this.props.data
		};
	}
	
	render() {
		const { data } = this.state;
		return (
			<div className="popupWrap">
				<div className="popupCon">
					<div className="title">구매가 완료되었습니다</div>
					<div className="priceEndWrap">
						<div className="subTitle">{data.title}</div>
						<div className="priceInfo">
							<ul>
								<li>
									<span>{data.line1_title}</span>
									<span className="optionList">{data.line1_desc}</span>
								</li>
								<li>
									<span>{data.line2_title}</span>
									<span className="optionList">{data.line2_desc}</span>
								</li>
							</ul>
							<div className="price">
								<span>구매금액</span>
								<span className="priceValue">{numberWithCommas(data.price)}<em>원</em></span>
							</div>
							<div className="priceCon">
								<span>실제 구매금액 <em>(부가세 포함)</em></span>
								<span className="priceResult">{numberWithCommas(data.v_price)}<em>원</em></span>
							</div>
						</div>
						<div className="textCon"  dangerouslySetInnerHTML={createMarkup(data.desc)}></div>
					</div>
				</div>
			</div>
		)
	}
}
export default PurchaseFinish;
