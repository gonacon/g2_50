import React, { Component } from 'react';
import appConfig from 'Config/app-config';
import Utils from 'Util/utils';


class PurchaseMonthlySlideItem extends Component {

	errorImageFlag = true;

	errorImage = (evt) => {
		if ( this.errorImageFlag ) {
			evt.target.src = `${appConfig.headEnd.LOCAL_URL}/common/default/thumbnail_default_land.png`;
		}
	}

	render() {
    	const { ppm_poster, amt_price } = this.props.data;
		const isRegistered = amt_price !== '해지';
		const tagType = isRegistered ? 'tag' : 'tag expiry';
		const thumbImage = `${Utils.getIipImageUrl(0, 0)}${ppm_poster}`

		return (
			<div className="slide csFocus">
				<img src={thumbImage} alt="" onError={this.errorImage} />
				<span className={tagType}><span>{isRegistered ? '' : '해지'}</span></span>
			</div>
		)
	}
}

export default PurchaseMonthlySlideItem;