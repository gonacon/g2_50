import React, { Component } from 'react';
import { G2NaviSlider, G2MenuBlockSlider } from 'Module/G2Slider';
import constants from 'Config/constants';
import Utils from 'Util/utils';


const {
	HOME, DETAIL_GENRE_HOME, MONTHLY_AFTER,	// route
	PRD_TYP_CD,
} = constants;

class MenuBlockSlide extends Component {

	onSelectMenuBlock = (slideIdx, idx) => {
		const { slideItem, saveFocus, id, idx: containerIdx } = this.props;
		const menuInfo = slideItem[idx];
		const { gnbTypeCode, menu_id, blockTypeCode, limitlevelYN, menuExpsPropCode } = menuInfo;
		const path = blockTypeCode === '30' ? DETAIL_GENRE_HOME : HOME;
		const level = limitlevelYN === 'Y' ? 19 : 0;
		const isCW = menuInfo.scn_mthd_cd === '501' || menuInfo.scn_mthd_cd === '502';
		
		let param = {
			gnbTypeCode,
			menuId: menu_id,
			depth1Title: this.props.title,
			depth2Title: menuInfo.title,
			isDetailedGenreHome: true,
			certificate: true,
			cwGridCall: isCW,
			cwInfo: isCW ? menuInfo.cwInfo : '',
		};

		saveFocus({ blocksKey: id, listIdx: containerIdx, itemIdx: idx });

		// 월정액 페이지 이동
		if (menuInfo.prc_typ_cd === PRD_TYP_CD.PPM) {
			Utils.moveMonthlyPage(MONTHLY_AFTER, menuInfo);
		} else {
			Utils.goToPageCertification({menuExpsPropCode, path, param, level});
		}

	}

	render() {
		const { slideItem } = this.props;

		return (
			<G2NaviSlider {...this.props} onSelectChild={this.onSelectMenuBlock}>
				{slideItem.map((slide, idx) =>{
					return <G2MenuBlockSlider
						key={idx} idx={idx}
						title={slide.title}
						images={slide.imgs}
						adultLevelCode={slide.adlt_lvl_cd}
						watLevelCode={slide.wat_lvl_cd}
						menuId={slide.menu_id}
						gnbTypeCode={slide.gnbTypeCode}
						bannerExposure={slide.bannerExposure}
						bAdult={slide.isProtection}
					/>
				}
				)}
			</G2NaviSlider>
		);
	}
}

export default MenuBlockSlide;