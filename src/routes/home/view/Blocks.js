// common
import React, { Component, Fragment } from 'react';

// utils
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

// component
import { SlideType } from 'Module/G2Slider';
import HorizontalSlide from '../components/HorizontalSlide';
import VerticalSlide from '../components/VerticalSlide';
import MenuBlockSlide from '../components/MenuBlockSlide';
import EventSlide from '../components/EventSlide';
import RecentVODListHome from '../components/RecentVODListHome';


class Blocks extends Component {
	shouldComponentUpdate(nextProps) {
		return !isEqual(this.props.blockInfo, nextProps.blockInfo);
	}

	propsMixin = ( slideType ) => {
		const {
			blockInfo, idx,
			onSlideFocus,
			onSlideFocusChild, onSelectFavorite, onSelectRecentVod, onSelectSlideVOD,
			setFm, saveFocus,
			isDetailedGenreHome	// 홈에서 세부장르홈 인지 여부를 판단
		} = this.props;
		let bShow = true;

		let defaultProps = {
			key: idx,
			idx,
			id: 'blocks',
			title: blockInfo.slideTitle,
			type: blockInfo.slideType,
			bShow,
			setFm,
			rotate: true,
			onSlideFocus,
			onSlideFocusChild,
			saveFocus,
			isDetailedGenreHome,
		};
		let propsMix = {}
		let SlideComponent = null;
		
		if ( /EVENT/.test(slideType) ) {
			console.error('defaultProps:', blockInfo.slideTitle, defaultProps);
			SlideComponent = EventSlide;
		} else {
			switch ( blockInfo.slideType ) {
				case SlideType.RECENT_VOD:
					delete defaultProps.type;
					propsMix = {
						isHome: true,
						list: blockInfo.slideItem,
						scrollTo: onSlideFocus,
						onSelect: onSelectRecentVod,
						bShow: !isEmpty(blockInfo.slideItem),
					};
					SlideComponent = RecentVODListHome;
				break;
				case SlideType.TALL:
					propsMix = {
						// onSelectFavorite,
						onSelectSlideVOD
					};
					SlideComponent = VerticalSlide;
				break;
				case SlideType.HORIZONTAL:
					propsMix = {
						// onSelectFavorite,
						onSelectSlideVOD
					};
					SlideComponent = HorizontalSlide;
				break;
				case SlideType.MENU_BLOCK:
					propsMix = {
						menuBlockClass: blockInfo.classOfSlideType,
					};
					SlideComponent = MenuBlockSlide;
				break;
				default: break;
			}
		}

		return {
			props: { ...defaultProps, ...propsMix },
			SlideComponent
		};
	}

	render() {
		const { slideType, slideItem } = this.props.blockInfo;
		const { props, SlideComponent } = this.propsMixin(slideType);

		// if ( /EVENT/.test(slideType) ) {
		// 	console.error('props', props, slideItem);
		// }

		return (
			<SlideComponent {...props} slideItem={slideItem} />
		);
	}
}

export default Blocks;