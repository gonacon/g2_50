import {React} from '../../utils/common';
import SlideTypeB from './SlideTypeB';
import '../../assets/css/components/modules/SlideTypeBC.css';


const IMG_WIDTH = 384; // 이미지 가로
const IMG_HEIGHT = 250; // 이미지 세로
const ITEMS = 4; // 메뉴별 아이템 개수

class SlideTypeBC extends SlideTypeB {
	constructor(props) {
		super(props);
		console.log("asdfsadfsdf");

		this.itemWidth = 384; // 슬라이드 가로 폭
		this.itemMargin = 50; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
	}

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeBC">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeBCItem
												image={data.image}
												title={data.title}
												currentState={data.currentState}
												key = {i}
												index = {i}
												items={this.items}
												maxLength={this.state.slideItem.length}
												slideTo={this.state.slideTo}
												event1={this.focusOn.bind(this, i)}
												event3={this.keyDown.bind(this, i)}
											/>
										)
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

class SlideTypeBCItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
	}

	render() {
		return(
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<img src={this.props.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					<span className="programTitle">{this.props.title}</span>
				</div>
			</div>
		)
	}
}

export default SlideTypeBC;