import React, { Component, Fragment } from 'react';
import { newlineToBr } from 'Util/utils';
import { isEmpty } from 'lodash';
import appConfig from 'Config/app-config';

class DetailedListInfo extends Component {

	getDiscountArray = () => {
		const { pageType } = this.props;
		const {
			dc_coupon, dc_coupon_type, dc_coupon_value,     // 쿠폰
			dc_point,                                       // B포인트
			dc_membership, dc_membership_tot,               // T멤버십
			dc_ocb, dc_ocb_tot,                             // OK캐시백
			dc_tvpoint, dc_tvpoint_tot,                     // TV포인트
			dc_coupon_nm, dc_membership_text,				//월정액 인 경우
		} = this.props.data;

		let discountList = [];

		if ( pageType === 'PurchaseMonthlyList' ) {

			let voucherList = [
				{index: '쿠폰', title: dc_coupon_nm },
				{index: 'T멤버십', title: dc_membership_text },
				{index: 'B포인트', title: dc_point },
			];
	
			for ( let voucher of voucherList ) {
				if ( voucher.point !== '0원' ) {
					let { index, title } = voucher;
					discountList.push({ index, title });
				}
			}
		} else {

			// 쿠폰
			if ( dc_coupon !== '0원' ) {
				let dcType = (() => {
					if ( dc_coupon_type === '10' ) {
						return { ratio: dc_coupon_value }
					} else if ( dc_coupon_type === '20' ) {
						return { point: dc_coupon_value }
					}
				})();
	
				discountList.push({ index: '쿠폰', money: dc_coupon, ...dcType});
			}
			
			let voucherList = [
				{index: 'T멤버십', money: dc_membership, point: dc_membership_tot},
				{index: 'B포인트', money: dc_point, point: dc_point},
				{index: 'OK캐쉬백', money: dc_ocb, point: dc_ocb_tot},
				{index: 'TV포인트', money: dc_tvpoint, point: dc_tvpoint_tot},
			];
	
			for ( let voucher of voucherList ) {
				if ( voucher.point !== '0원' && voucher.point !== undefined ) {
					let { index, money, point } = voucher;
					discountList.push({ index, money, point });
				}
			}
		}

		return discountList;
	}

	getButtonText = () => {
		const { pageType } = this.props;
		const { prod_type_cd, period, yn_mchdse, yn_series, amt_price } = this.props.data;

		if ( pageType === 'PurchaseMonthlyList' ) {
			return amt_price === '해지' ? '재가입' : '가입해지';
		} else {
			if ( (yn_mchdse === 'N' || !yn_mchdse) &&
				(
					( yn_series === 'N' && prod_type_cd === '10' ) ||     // 단편
					( yn_series === 'Y' && prod_type_cd === '10' ) ||     // 시즌 회차
					( yn_series === 'Y' && prod_type_cd === '20' )        // 시즌 전편
				)
			) {
				if ( Number(period) > -1 || period === '' ) {
					return '바로재생';
				} else if ( period === '-1' ) {
					return '재구매';
				}
			} else if ( prod_type_cd === '41' || yn_mchdse === 'Y' ) {  // 패키지 || VOD관련
				return '상품정보';
			}

			if ( pageType === 'PurchaseOksusuList' ) {
				if ( prod_type_cd === '110' || prod_type_cd === '120' ) {
					if ( Number(period) > -1 || period === '' ) {
						return '바로재생';
					} else if ( period === '-1' ) {
						return '재구매';
					}
				}
			}
		}
	}

	render() {
		const { defaultInfo, defaultSub, caution, pageType, data, slideType } = this.props;
		const {
			title, amt_price,
			prod_type_nm, price, selling_price, method_pay_nm, reg_date, period_detail,
			nscreen,
			adult, level, prod_type,
		} = data;

		let productType = prod_type_nm || prod_type;

		let titleFull = title;
		if ( adult === 'Y' || level === '19' ) { // 19영화 ( 2: 청소년 보호 )
			titleFull = '청소년 보호 프로그램';
		}

		const discount = this.getDiscountArray();
		const buttonText = this.getButtonText();

		let titleDate = pageType === 'PurchaseMonthlyList' ? '가입일자' : '구매일자';	// 월정액인 경우는 구매일자가 아닌, 가입일자로 표기한다.
		return(
			<div className="bottomWrap">
				<div className="norWrap">
					<p className="info">{ defaultInfo }</p>
					<div className="subDetailInfo">{ defaultSub }</div>
				</div>
				<div className="innerWrapper" id="button">
					<div className="bottomLeft">
						<div className="titleFull" style={{WebkitBoxOrient:"vertical"}}>
							{titleFull}
						</div>
						<p className="priceInfo">{ selling_price || amt_price }{selling_price ? '에 구매 (부가세 포함)' : ''}</p>
						<span className="csFocus btnStyle type02">
							<span className="wrapBtnText">{ buttonText }</span>
						</span>
					</div>
					<div className="bottomRight">
						<div className="inner">
							<span className="tblTitle">상품타입</span>
							<div className="tblData">
								{ productType && <span>{ productType }</span> }
							</div>
							<span className="tblTitle">상품금액</span>
							<div className="tblData">{ price }</div>
							{ method_pay_nm &&
								<Fragment>
									<span className="tblTitle">결제방식</span>
									<div className="tblData">{method_pay_nm}</div>
								</Fragment>
							}
							<span className="tblTitle">{ titleDate }</span>
							<div className="tblData">{ reg_date }</div>
							<span className="tblTitle">이용기간</span>
							<div className="tblData">
								{ period_detail.replace(period_detail.match(/\(.*\)/gi), '')}
								<span className="detail">{ period_detail.match(/\(.*\)/gi) }</span>
							</div>
						</div>

						<div className="inner" key="i">
							{ !isEmpty(discount) && slideType === 'oksusu' &&
								discount.map((data, i) => {
									return(
										<div className="block" key={i}>
											<span className="tblTitle">{data.index}</span>
											<div className="tblData">
												{data.money !== undefined && <span className="money">{`-${data.money}`}</span>}
												{
													data.point !== undefined
													? <span className="detail">({Number(data.point.replace(/[^0-9]/g, '')).toLocaleString('ko-KR') + 'P 차감'})</span>
													: data.ratio !== undefined && <span className="detail">({data.ratio + '% 할인'})</span>
												}
												{data.title !== undefined && data.title}
											</div>
										</div>
									  )
								})
							}
							{ pageType === 'PurchaseMonthlyList' &&
							<div className="block">
								<span className="tblTitle">B포인트</span>
								<div className="tblData">
									<span className="detail text">
										B포인트 월정액 자동차감 설정<br/>
										여부에 따라 월정액 실제<br/>
										결제금액이 달라질 수 있습니다.
									</span>
								</div>
							</div>
							}
						</div>
						<ul className="cautionList">
							{ pageType === 'PurchaseOksusuList' &&
							<li className="caution">
								<span className="icOksusu">
									<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/logo-oksusu-app.png`} alt="옥수수 로고"/>
								</span>
								앱에서 구매한 콘텐츠 중 'B tv'시청 가능 콘텐츠 구매내역만 제공해 드립니다.
							</li>
							}
							{ nscreen === 'Y' && (
								pageType === 'PurchaseMonthlyList' ?
									<li className="caution">
										B tv에서 구매 시
										<span className="icOksusu">
											<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/logo-oksusu-app.png`} alt=""/>
										</span>
										에서 무료로 이용 가능한 상품입니다
									</li> :
									<li className="caution">
										해당 VOD는 이용기간 동안
										<span className="icOksusu">
											<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/logo-oksusu-app.png`} alt=""/>
										</span>
										에서도 시청 가능합니다.
									</li>
							)}
							{ caution !== undefined && 
								<li className="caution">{newlineToBr(caution)}</li>
							}
						</ul>
					</div>
				</div>
			</div>
		)
	}
}

export default DetailedListInfo;