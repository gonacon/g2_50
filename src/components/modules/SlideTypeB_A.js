import {React } from '../../utils/common';
import SlideTypeB from './SlideTypeB';
import '../../assets/css/components/modules/SlideTypeB_A.css';

const IMG_WIDTH = 287; // 이미지 가로
const IMG_HEIGHT = 180; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class SlideTypeB_A extends SlideTypeB {
	constructor(props) {
		super(props);
		this.itemWidth = 287; // 슬라이드 가로 폭
		this.itemMargin = 64; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수
	}

	render() {
		return (
			<div className="contentGroup">
				<div className="slideTypeB_A">
					<div className="title">{this.props.slideInfo.slideTitle} (<span className="count">{this.props.slideInfo.slideItem.length}</span>)</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
								{
									this.state.slideItem.map((data, i) => {
										return(
											<SlideTypeBItem
												image={data.image}
												title={data.title}
												onAir = {data.onAir}
												grade19 = {data.grade19}
												timer = {data.timer}
												favorCh = {data.favorCh}
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

class SlideTypeBItem extends React.Component {
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
					{
						(this.props.title !== undefined ?
							this.props.timer === true ? <span className="programTitle"><span className="iconTimer"></span>{this.props.title}</span>
								:
								this.props.favorCh === true ?
									<span className="programTitle"><span className="iconFavor"></span>{this.props.title}</span>
									:
									<span className="programTitle">{this.props.title}</span>
							:
							'')
					}
					{
						(this.props.onAir === true ? <span className="onAir">ON AIR</span> : '')
					}
					{
						(this.props.grade19 === "" ? '' : <span className="grade19"><span className="gradeText"><span className="gradeCircle">19</span>등급제한</span></span>)
					}
				</div>
			</div>
		)
	}
}

export default SlideTypeB_A;