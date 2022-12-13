import {React, ReactDOM} from '../../utils/common';
import {getByteLength} from "../../utils/UI";

import SlideTypeA from './SlideTypeA';
import '../../assets/css/components/modules/SlideTypeAC.css';


const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class SlideTypeA_C extends SlideTypeA {
	constructor(props) {
		super(props);
		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 40; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
	}

	keyDown1(event){
		this.props.event1(event);
	}

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeAC">
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeA_CItem
												imageURL={data.image}
												title={data.title}
												key={i}
												index={i}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												allView={this.props.allView}
												event1={this.focusOn.bind(this, i)}
												event3={this.keyDown.bind(this, i)}
												event4={this.keyDown1.bind(this)}
											/>
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

class SlideTypeA_CItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
		this.props.event4(event.keyCode);
	}
	
	render() {
		return(
			<div className={this.props.allView && this.props.index === 0 ? "slide first":"slide"}>
				<div ref="slideItem" className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<span className="iconDel"></span>
					<img src={this.props.imageURL} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					<span className="slideTitle">{this.props.title}</span>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.textAlign(this.props);
	}

	textAlign(_props) {
		if (_props.index === 0 && getByteLength(_props.title) >= 20) {
			ReactDOM.findDOMNode(this.refs.slideItem).style = "text-align:left";
		} else if (_props.index === _props.maxLength - 1 && getByteLength(_props.title) >= 20) {
			ReactDOM.findDOMNode(this.refs.slideItem).style = "text-align:right";
		}
	}
}

export default SlideTypeA_C;