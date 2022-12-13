import React, { Component } from 'react';
import { G2NaviSlider, G2NaviSlideMyVOD } from 'Module/G2Slider';
import Utils from 'Util/utils';


class VerticalSlide extends Component {

    onSelectSlideVOD = (slideIdx, idx) => {
        const { slideItem, isDetailedGenreHome, id, idx: containerIdx, saveFocus } = this.props;
		if ( slideItem[idx] ) {
			const { menu_id, sris_id, epsd_id, synon_typ_cd, wat_lvl_cd } = slideItem[idx];
			const synopParam = { menu_id, sris_id, epsd_id, wat_lvl_cd };

			saveFocus({ blocksKey: id, listIdx: containerIdx, itemIdx: idx });

			Utils.toSynopsis(synon_typ_cd, synopParam, isDetailedGenreHome);
		}
	}

	render () {
		const { slideItem, isDetailedGenreHome } = this.props;
		
		return (
			<G2NaviSlider {...this.props} onSelectChild={this.props.onSelectSlideVOD ? this.props.onSelectSlideVOD : this.onSelectSlideVOD}>
				{ slideItem.map((slide, idx) => 
					<G2NaviSlideMyVOD key={idx} idx={idx}
						adultLevelCode={slide.adlt_lvl_cd}
						watLevelCode={slide.wat_lvl_cd}
						title={slide.title}
						imgURL={slide.image}
						espdId={slide.epsd_id}
						srisId={slide.sris_id}
						synopsisTypeCode={slide.synon_typ_cd}
						menuId={slide.menu_id}
						productPriceId={slide.prd_prc_id}
						badge={slide.badge}
						userBadgeImgPath={slide.userBadgeImgPath}
						userBadgeWidthImgPath={slide.userBadgeWidthImgPath}
						isDetailedGenreHome={isDetailedGenreHome}
						bAdult={slide.isProtection}
					/>
				)}
			</G2NaviSlider>
		);
	}
}

export default VerticalSlide;