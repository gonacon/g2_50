import {React} from '../../utils/common';
import SlideTypeB from './SlideTypeB';
import '../../assets/css/components/modules/SlideTypeB_B.css';
import PropTypes from 'prop-types';

const IMG_WIDTH = 306; // 이미지 가로
const IMG_HEIGHT = 180; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class SlideTypeB_B extends SlideTypeB {
	constructor(props) {
		super(props);
		console.log("asdfsadfsdf");

		this.itemWidth = 287; // 슬라이드 가로 폭
		this.itemMargin = 20; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
	}

	keyDown1(event){
		this.props.event1(event);
	}

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeB_B">
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeBItem
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
												event4={this.keyDown1.bind(this)}
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
SlideTypeB.propTypes = {
	loadFocus: PropTypes.string
};

class SlideTypeBItem extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
		this.props.event4(event.keyCode);
	}

	render() {
		return(
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<div className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<span className="iconDel"></span>
					<img src={this.props.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					{
						(this.props.title !== undefined ?  <span className="programTitle">{this.props.title}</span> : '')
					}
					{
						(this.props.currentState !== undefined ? <div className ="loadingBar"><div className="currentState" style={{'width':this.props.currentState + "%"}}></div></div> : '')
					}
				</div>
			</div>
		)
	}
}

export default SlideTypeB_B;