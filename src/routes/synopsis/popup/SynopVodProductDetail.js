//import {React, fnScrolling } from '../../../utils/common';
import React from 'react';
import '../../../assets/css/routes/synopsis/VODProductDetail.css';
//import FM from 'Supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView.js'
//import { scroll } from 'Util/utils';

//import VODProductDetaiJson from '../../../assets/json/routes/synopsis/VODProductDetail.json';
import keyCodes from 'Supporters/keyCodes';
import Utils from '../../../utils/utils'
//import _ from 'lodash';
//import { Core } from 'Supporters';

class VODProductDetail extends PopupPageView {
	constructor(props) {
		super(props);
		this.itemWidth = 1325;

		let itemLength;
		itemLength = this.paramData.detailData.length;

		//slideItem : this.paramData.detailData.concat(this.paramData.detailData),
		this.state = {
			title : this.paramData.title,
			slideItem : this.paramData.detailData,
			focusOnIdx : 0,
			itemLength : itemLength,
		}
	}

	onKeyDown(e) {
		this.handleKeyEvent(e);
		switch(e.keyCode) {
			case keyCodes.Keymap.LEFT:
				let leftNextFocus = 0;
				if (this.state.itemLength > 1) {
					if (this.state.focusOnIdx === 0){
						leftNextFocus = this.state.itemLength -1;
					} else {
						leftNextFocus = this.state.focusOnIdx -1;
					}
					this.setState({
						focusOnIdx : leftNextFocus,
					});
				};
				break;
			case keyCodes.Keymap.RIGHT:
				let rightNextFocus = 0;
				if (this.state.itemLength > 1) {
					if (this.state.itemLength-1 === this.state.focusOnIdx){
						rightNextFocus = 0;
					} else {
						rightNextFocus = this.state.focusOnIdx + 1;
					}
					this.setState({
						focusOnIdx : rightNextFocus,
					});
				};
				break;

			case keyCodes.Keymap.BACK_SPACE:
				this.props.callback(this);
				return true;
			case keyCodes.Keymap.PC_BACK_SPACE:
				this.props.callback(this);
				return true;
			default:
				break;
		}
	}
	
	render() {
		let slidePage = [];
		const { slideItem, focusOnIdx, title } = this.state;
		
		for (const [i] of slideItem.entries()) {
			slidePage.push(<span key={i} className={i === focusOnIdx ? 'on': ''}></span>);
		}		
		const vodPopClass = this.paramData.darkTheme ? "VODPop dark" : "VODPop";
		
		return (
			<div className={vodPopClass}>
				<div className="VODProductDetailBg"></div>
				<div className="VODProductDetailWrap">
					<div className="productDetailSlide contentGroup">
						<p className="title">{title}</p>
						<div className="slideWrap" >
							<div className="slideCon">
								<div className="slideWrapper" id="banner" style={{'--page': focusOnIdx,'width': slideItem.length * this.itemWidth}}>
									{
										slideItem.map((data, i) => {
											return(
												<VODProductDetailSlideItem
													image={data.img_path}
													index={i}
													key={i}
													focusIdx={focusOnIdx}
												/>
											)
										})
									}
								</div>
								<div className="slidePage">
									{slidePage}
								</div>
								<div className="leftArrow"></div>
								<div className="rightArrow"></div>
							</div>
						</div>
					</div>
					<div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
				</div>
			</div>
		)
	}
}

class VODProductDetailSlideItem extends React.Component {
	render() {
		const {focusIdx, index} = this.props;
		const containerClass = `${focusIdx === index ?' csFocus focusOn':'csFocus'}`;
		let img = Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_DETAIL_SLIDE) + this.props.image;
		return(
			<div className="slide">
				<span className={containerClass}>
					<img src={img} alt=""/>
				</span>
			</div>
		)
	}
}
export default VODProductDetail;

