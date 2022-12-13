// commons
import React from 'react';

// style
import '../../../assets/css/routes/myBtv/bPoint/BpointGift.css';

// utils
import { toLocalePrice } from '../../../utils/utils';
import _ from 'lodash';

class BpointGiftSlide extends React.Component {

	itemWidth = 564; // 슬라이드 가로 폭
	itemMargin = 0; // 슬라이드 간격 폭

	constructor(props) {
		super(props);

		this.state = {
			slideTo: 2,
			slideItem: []
		}
	}
	
	focusOn(index, _this){
	}
	
	keyDown(_this, keyCode) {
	}
	
	componentWillMount() {
	}

	render() {
		const { slideTo, slideItem } = this.state;
		const length = _.isEmpty(slideItem) ? 0 : slideItem.length;

		return (
			<div className="contentGroup">
				<div className="BpointGiftSlide">
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page': slideTo-1,'width':(length * this.itemWidth) + (length * this.itemMargin)}}>
								{
									slideItem.map((data, i) => {
										return(
											<div className={i < slideTo || i >= length - slideTo ? "slide clone" : "slide"} key={i}>
												<div className="csFocusCenter" tabIndex="-1" onFocus={this.focusOn.bind(this, i)} onKeyDown={this.keyDown.bind(this)}>
													<span className="wrapImg">
														<img src={data.imageS} alt=""/>
														<img src={data.imageB} alt=""/>
													</span>
													<span className="point">{toLocalePrice(data.point)}P</span>
													<span className="text">선물하기</span>
													<span className="price"><span className="number">{toLocalePrice(data.point*1.1)}</span><span className="value">원</span></span>
												</div>
											</div>
										);
									})
								}
							</div>
						</div>
						<div className="leftArrow"></div>
						<div className="rightArrow"></div>
					</div>
				</div>
			</div>
		);
	}

}

export default BpointGiftSlide;