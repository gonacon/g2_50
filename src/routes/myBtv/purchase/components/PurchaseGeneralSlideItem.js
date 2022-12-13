import React, { Component } from 'react';
import Utils from 'Util/utils';


class PurchaseGeneralSlideItem extends Component {
	render() {
		const { slideType } = this.props;
		const { series_no, period, adult, level, poster, yn_series } = this.props.data;
		let tagType = 'tag';
		let tagTypeDisplay = true;

		let dDay = '';
		if ( period === '0' ) dDay = '만료임박';
		else if ( period === '-1' ) dDay = '만료';
		else if ( period >= 8 ) dDay = '';
		else dDay = `D-${period}`;

		if (/D-/.test(dDay)) {
			// tagType = `${tagType} day`;
			tagTypeDisplay = false;
		}else if (dDay === '만료') {
			tagType = `${tagType} expiry`;
		}else if(dDay === '만료임박'){
			tagType = `${tagType} day type2`;
		}

		let image = '';
		if ( adult === 'Y' || level === '19' ) { // 19영화 ( 2: 청소년 보호 ), 19플러스영화 ( 0: 청소년 보호 )
			image = '/assets/images/common/img/thumbnail-default-protection.png';
		} else  { 
			image = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${poster}`;
		}
 
		return(
			<div className="slide csFocus">
				<img src={image} alt=""/>
				{ (slideType !== 'possesion' && tagTypeDisplay) && <span className={tagType}><span>{dDay}</span></span>}
				{ (series_no !== undefined && slideType !== 'possesion' && yn_series === 'Y' ) && <span className="episode">{series_no}화</span>}
			</div>
		)
	}
}

export default PurchaseGeneralSlideItem;