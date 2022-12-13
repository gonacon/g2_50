// commons
import React, { Component } from 'react';
import appConfig from 'Config/app-config';
import constants from 'Config/constants';

// utils
import PropTypes from 'prop-types';
import Utils from 'Util/utils';

// components
import NumberFormat from '../../../components/modules/UI/NumberFormat';
import { ContentGroup } from 'Module/ContentGroup';


class HomeHeadContent extends Component {

	static defaultProps = {
		content: {},
	}

	static propTypes = {
		content: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props);

		this.state={
			bPoint: {
				new: false,
				count: 0,
			},
			coupon: {
				new: false,
				count: 0,
			},
		}
	}

	/**
	 * 포인트 쿠폰 정보 콜백으로 업데이트
	 * @param {*} data = {
	 * 		coupon_count
	 * 		coupon_new  ,  "Y" : new 존재, "N" : new 없음
	 * 		bpoint_count
	 * 		bpoint_new  ,  "Y" : new 존재, "N" : new 없음
	 * }
	 */
	callbackCouponsPointInfo = (data) => {
		// appConfig.STBInfo.bPoint = data.bpoint_count;
		// appConfig.STBInfo.newBpoint = data.bpoint_new === 'Y' ? true : false;
		// appConfig.STBInfo.coupon = data.coupon_count;
		// appConfig.STBInfo.couponNew = data.coupon_new === 'Y' ? true : false;

		// 쿠폰, 포인트, update
		console.log('@@@ callbackCouponsPointInfo', data);
		this.setState({
			bPoint: { new: appConfig.STBInfo.newBpoint, count: appConfig.STBInfo.bPoint },
			coupon: { new: appConfig.STBInfo.couponNew, count: appConfig.STBInfo.coupon }
		});
	}

	inquiryPointAndCoupon = () => {
		Utils.requestCouponsPointInfo(this.callbackCouponsPointInfo);
		if (!appConfig.runDevice) {
			Utils.requestCouponsPointInfo(this.callbackCouponsPointInfo);
		}
	}

	componentDidMount = () => {
		Utils.requestCouponsPointInfo(this.callbackCouponsPointInfo);
		const { contentRef } = this.props;
		if (contentRef) {
			contentRef(this.content);
		}
	}
	

	render() {

		let { bPoint, coupon } = this.state;

		return (
			<ContentGroup className="contentGroup" ref={r=>this.content=r}>
				<div className="myPoint">
					<dl>
						<dt>B포인트{ bPoint.new && <span className="new"/> }</dt>
						<dd><NumberFormat value={bPoint.count} unit="P" /></dd>
						<dt>쿠폰{ coupon.new && <span className="new"/> }</dt>
						<dd><NumberFormat value={coupon.count} unit="개" /></dd>
					</dl>
				</div>
			</ContentGroup>
		);
	}
}

export default HomeHeadContent;