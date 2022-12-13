import React, { Fragment } from 'react';
import Moment from 'react-moment';
// import PropTypes from 'prop-types';
// import appConfig from 'config/app-config.js';

// utils
import _ from 'lodash';
import code, { getCodeName, getCode } from '../../../utils/code';

// components
import NumberFormat from '../../../components/modules/UI/NumberFormat';
import appConfig from 'Config/app-config';

class SynopPurchares extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
		
		}
	}
	
    shouldComponentUpdate(nextProps) {
		return (JSON.stringify(this.props.contents.btnPurchase) !== JSON.stringify(nextProps.contents.btnPurchase)
			|| nextProps.isBookmark !== this.props.isBookmark
			|| JSON.stringify(nextProps.buttonObj) !== JSON.stringify(this.props.buttonObj)
		);
	}

    render() {
		const { contents, isBookmark, buttonObj } = this.props;
		const synopType = contents.sris_typ_cd;
		const { purchase, unPurchase, free, change } = contents.btnPurchase; // 구매 여부

		// 부가세포함 우선순위
		// 프리미엄편성예정일 > 프리미엄편성종료일 > 콘텐츠종료일 > 가격변동일
		let fr_nm = null;
		let fr_dt = null;
		if (!_.isEmpty(buttonObj)) {
			if (!_.isEmpty(buttonObj.ppm_orgnz_fr_dt)) {
				fr_nm = '프리미어편성예정일';
				fr_dt = buttonObj.ppm_orgnz_fr_dt.substring(0,8);
			} else if (!_.isEmpty(buttonObj.ppm_orgnz_to_dt)) {
				fr_nm = '프리미어편성종료일';
				fr_dt = buttonObj.ppm_orgnz_to_dt.substring(0,8);
			} else if (!_.isEmpty(buttonObj.prd_prc_to_dt)) {
				fr_nm = '콘텐츠종료일'
				fr_dt = buttonObj.prd_prc_to_dt.substring(0,8);
			} else if (!_.isEmpty(buttonObj.next_prd_prc_fr_dt)) {
				fr_nm = '가격변경일';
				fr_dt = buttonObj.next_prd_prc_fr_dt.substring(0,8);
			}
		}
		
		let buttonList = [];
		let title, lag = null;
		if ((purchase.length !== 0 || free.length !== 0) && !change) {
			// 구매
			if (unPurchase.length !== 0) {
				buttonList.push(
					<li key={0}>
						<div>
							<div className="csFocus">
								<span className="onlyText">
									추가 상품구매
								</span>
							</div>
						</div>
					</li>
				)
			}
		} else {
			// 미구매
			!_.isEmpty(unPurchase) && (
			buttonList = unPurchase.map((item, i) => {
				title = getCodeName('PRD_TYP_CD', item.prd_typ_cd);
				item.prd_typ_cd === '10' && item.possn_yn === 'Y' ? title = '소장':title;
				lag = getCodeName('LAG_CAPT_TYP_CD', item.lag_capt_typ_cd);

				let iconPay = item.prd_typ_cd === '30' ?
					<span className="iconPlay">
						<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-monthlyfixedamount-none.png`} alt=""/>
						<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-monthlyfixedamount-on.png`} className="on" alt=""/>
					</span>
					: null;
				let price = item.prd_typ_cd !== '30' ?
					<span className="price">
						<span className="presentPrice">
						{
							item.sale_prc_vat === 0 ? '무료'
							:
							<Fragment>
								<NumberFormat value={item.sale_prc_vat} /><span>원 {item.isPrc && '~'}</span>
							</Fragment>
						}
						</span>
						{
							item.sale_prc_vat !== item.prd_prc_vat ?
							<span className="dcPrice"><NumberFormat value={item.prd_prc_vat} /><span>원</span></span>
							: null
						}
					</span>
					: null
				
				return (
					<li key={i}>
						<div>
							<div className={`csFocus${item.prd_typ_cd !== '30' ? ' priceBtn': ''}`}>
								{iconPay}
									{
										item.prd_typ_cd !== '30' ?
										<span className="text">{title}&nbsp;
											<span className="titleSub">{lag ? '('+lag+')': null}</span>
										</span>
										:
										<span className="text">{title}
											<span className="monthlyFixedAmount">가입</span>
										</span>
									}
								{price}
							</div>
						</div>
					</li>
				)
			}))
		}

		let firstBtn = true;
		if (_.isEmpty(contents.preview)) {
			firstBtn = false;
		}
		if (free.length !== 0 || purchase.length !== 0) {
			firstBtn = true;
		}
		return (
			<div className="synopBtn" id="purcharseButtons">
				<ul className="btnWrap">
					{
						(synopType !== '01' && firstBtn) &&
						<li>
							<div>
								<div className="csFocus">
									<span className="iconPlay">
										<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-play-none.png`} alt=""/>
										<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-play-play.png`} className="on" alt=""/>
									</span>
									<span className="text">
										{free.length !== 0 ? '무료보기' : purchase.length !== 0 ? '바로보기' : '예고편'}
									</span>
								</div>
							</div>
						</li>
					}
					{buttonList}
					<li>
						<div>
							<div className="csFocus">
								<span className="iconHeart">
									{
										isBookmark ?
										<Fragment>
											<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-star-restar.png`} alt=""/>
											<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-star-restar.png`} className="on" alt=""/>
										</Fragment>
										:
										<Fragment>
											<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-star-none.png`} alt=""/>
											<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-star-on.png`} className="on" alt=""/>
										</Fragment>
									}
								</span>
								<span className={`text${isBookmark ? ' per': ''}`}>{isBookmark ? '찜해제': '찜하기'}</span>
							</div>
						</div>
					</li>
                    {
                        (synopType === '01' && !_.isEmpty(contents.sson_choic_nm) ) &&
                        <li>
                            <div>
                                <ul className="seasonBtn">
                                    <li>
										<div className="csFocus leftBtn">
											<span className="iconHeart">
												<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/arrow-season-l.png`} alt=""/>
												<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/arrow-season-l-on.png`} className="on" alt=""/>
											</span>
										</div>
                                    </li>
                                    <li>
                                        <div className="centerBtn">
                                            <span className="text">{contents.sson_choic_nm}</span>
                                        </div>
                                    </li>
                                    <li>
										<div className="csFocus rightBtn">
											<span className="iconHeart">
												<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/arrow-season-r.png`} alt=""/>
												<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/arrow-season-r-on.png`} className="on" alt=""/>
											</span>
										</div>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    }
				</ul>
				
				{
					(buttonObj && buttonObj.prd_typ_cd !== '30') &&
					<div className="paymentPriceInfoWrap">
						<div className="paymentPriceInfo" style={{display:'block'}}>
							<span className="priceInfo1">부가세포함</span>
							<span className="bar"></span>
							<span className="priceInfo2">
							{
								!_.isEmpty(getCodeName('LAG_CAPT_TYP_CD', buttonObj.lag_capt_typ_cd)) ?
								<Fragment>
									[{getCodeName('LAG_CAPT_TYP_CD', buttonObj.lag_capt_typ_cd)}] {fr_nm}
								</Fragment>
								:
								fr_nm
							}
							<Moment format=" YYYY.MM.DD">{fr_dt}</Moment>
							</span>
						</div>
					</div>
				}
			</div>
		)
    }
}

export default SynopPurchares;