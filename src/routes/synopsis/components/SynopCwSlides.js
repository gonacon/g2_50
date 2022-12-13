// common
import React from 'react';
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD } from 'Module/G2Slider';

// utils
import _ from 'lodash';
// import Utils from '../../../utils/utils';

class SynopCwSlides extends React.Component {
	constructor(props) {
		super(props);
		
		this.cwType = '';
		this.cwList = [];
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.cwRelation) !== JSON.stringify(this.props.cwRelation);
	}

	onSelect = (slideIdx, childIdx) => {
		// console.log('연관콘텐츠 선택한 데이터!!!!!!!!!!!!',(slideIdx-this.props.slideContents.length), childIdx, this.cwList[childIdx]);
		let cwList = this.cwList[childIdx];
		if (this.cwType === 'info') {
			cwList = this.cwList[slideIdx-this.props.slideContents.length]['block'][childIdx];
		}
		cwList.childIdx = childIdx;
		this.props.onSelect('cwSlide', slideIdx, cwList);
	}

	render() {
		const { synopInfo, cwRelation, setFm, scrollTo, slideContents, synopType } = this.props;
		if (!_.isEmpty(cwRelation.related_info)) {
			this.cwList = cwRelation.related_info;
			this.cwType = 'info';
		} else if (!_.isEmpty(cwRelation.relation_contents)) {
			this.cwList = cwRelation.relation_contents;
			this.cwType = 'contents';
		}
		let type = SlideType.TALL;
		if (synopType === 'series') {
			type = SlideType.SYNOPSERIES;
		}

		let cwSlide = null;
		if (this.cwType === 'info') {
			cwSlide = this.cwList.map((item, i) => 
				<G2NaviSlider
					id={`slides`}
					idx={i + slideContents.length}
					key={`${Math.random()}_${i}`}
					title={item.sub_title}
					type={type}
					scrollTo={scrollTo}
					onSelectMenu={null}
					onSlideFocus={null}
					onSelectChild={this.onSelect}
					rotate={true}
					bShow={true}
					setFm={setFm}
				>
					{
						item.block.map((slide, idx2) => {
							let imgURL = slide.poster_filename_v;
							if (synopType === 'series') {
								imgURL = slide.poster_filename_h;
							}
							return (
								<G2NaviSlideMyVOD
									key={idx2} idx={idx2}
									title={slide.title}
									imgURL={imgURL}
									espdId={slide.epsd_id}
									srisId={null}
									menuId={null}
									onSelect={null}
									onClick={null}
								/>
							)
						})
					}
				</G2NaviSlider>
			)
		} else if (this.cwType === 'contents') {
			cwSlide =
				<G2NaviSlider
					id={`slides`}
					idx={0 + slideContents.length}
					key={`${Math.random()}`}
					title={`연관콘텐츠`}
					type={type}
					scrollTo={scrollTo}
					onSelectMenu={null}
					onSlideFocus={null}
					onSelectChild={this.onSelect}
					rotate={true}
					bShow={true}
					setFm={setFm}
				>
					{
						this.cwList.map((slide, idx2) => {
							let imgURL = slide.poster_filename_v;
							if (synopType === 'series') {
								imgURL = slide.poster_filename_h;
							}
							return (
								<G2NaviSlideMyVOD
									key={idx2} idx={idx2}
									title={slide.title}
									imgURL={imgURL}
									espdId={slide.epsd_id}
									srisId={null}
									menuId={null}
									onSelect={null}
									onClick={null}
								/>
							)
						})
					}
				</G2NaviSlider>
		}

		return cwSlide

	}
}

export default SynopCwSlides;