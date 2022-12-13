// commons
import React, { Component } from 'react';

// style
import 'ComponentCss/modules/SlideTypeA.css';

// component
import DetailedListInfo from './DetailedListInfo';
import PurchaseMonthlySlideItem from './PurchaseMonthlySlideItem';
import PurchaseGeneralSlideItem from './PurchaseGeneralSlideItem';


class PurchaseGeneralList extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};

		this.setSlideParam();
	}

	setSlideParam = () => {
		this.slideDefaultInfo = {
			monthly: {
				width: 438,
				margin: 0,
				items: 4
			},
			notMonthly: {
				width: 288,
				margin: 0,
				items: 6
			}
		};

		this.slideDefault = this.slideDefaultInfo.notMonthly;

		if(this.props.slideType === 'monthly' ) {
			this.slideDefault = this.slideDefaultInfo.monthly;
		}
	}

	render() {
		const { slideType, totalLength, items } = this.props;
		const { activeItem, activeSlide, slideTo, pageType, defaultInfo, defaultSub, caution, slideInfo:slideItem } = this.props.data;
		const currentLength = slideItem.length;
		const length = totalLength;
		const slideWrapClass1 = activeSlide ? ' activeSlide' : '';
		const slideWrapClass2 = activeItem === 0 ? ' firstActive' : activeItem === currentLength - 1 ? ' lastActive' : '';
		const slideWrapClass3 = slideTo + items <= length - 1 ? ' rightActive' : '';
		const slideWrapClass4 = slideTo > 0 ? ' leftActive' : '';
		// const lth = length < this.items ? this.items : length;
		const lth = length;
		const wrapperStyle = {'--page':slideTo,'width': `${currentLength * this.slideDefault.width}px` };
		let slideTypeClass = 'slideTypeA';
		slideTypeClass = pageType === 'PurchaseMonthlyList' ? 'slideMonthly' : slideTypeClass;
		const SlideItemComponent = pageType === 'PurchaseMonthlyList' ? PurchaseMonthlySlideItem : PurchaseGeneralSlideItem;

		return (
			<div className={`contentGroup${slideWrapClass1}`}>
				<div className={slideTypeClass}>
					<div className={`slideWrap${slideWrapClass1}${slideWrapClass2}${slideWrapClass3}${slideWrapClass4}`} id="slide">
						<div className="slideCon">
							<div className="slideWrapper" style={wrapperStyle}>
								{ slideItem.map((data, i) => (
								<SlideItemComponent key={i}
													data={data}
													slideType={slideType}
								/>
								))}
							</div>
						</div>
						<div className="slideCount">
							<span className="current">{activeItem+1}</span> / {length}
						</div>
						<div className="leftArrow"/><div className="rightArrow"/>
					</div>
					{ activeItem < currentLength &&
						<DetailedListInfo pageType={pageType}
										  slideType={slideType}
										  defaultInfo={defaultInfo}
										  defaultSub={defaultSub}
										  caution={caution}
										  data={slideItem[activeItem]} />
					}
				</div>
			</div>
		);
	}
}

export default PurchaseGeneralList;