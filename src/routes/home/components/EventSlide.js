import React, { Component } from 'react';
import { G2NaviSlider, G2EventSlider } from 'Module/G2Slider';
import isEmpty from 'lodash/isEmpty';
import { Core } from 'Supporters';
import Utils from 'Util/utils';


class EventSlide extends Component {

    onSelectEvent = (slideIdx, idx) => {
		const { slideItem, isDetailedGenreHome, saveFocus, id, idx: containerIdx } = this.props;

		saveFocus({ blocksKey: id, listIdx: containerIdx, itemIdx: idx });

		if (isEmpty(slideItem[idx].callUrl.trim())) {
			Core.inst().showToast('H/E: call_url 필드가 없음.');
		} else {
			Utils.moveToCallTypeCode(slideItem[idx], isDetailedGenreHome);
		}
    }
    
	render() {
		const { slideItem } = this.props;

		return (
			<G2NaviSlider {...this.props} onSelectChild={this.onSelectEvent} >
				{ slideItem.map((slide, idx) =>
					<G2EventSlider key={idx} idx={idx}
						title={slide.title}
						menuId={slide.menu_id}
						image={slide.image}
						expsRsluCd={slide.expsRsluCd}
					/>
				)}
			</G2NaviSlider>
		)
	}
}

export default EventSlide;