import {React, fnScrolling } from '../../../utils/common';

import '../../../assets/css/routes/liveTv/channelplus/ChannelPlus.css';
import channelplus from '../../../assets/json/routes/liveTv/channelplus/channelplus.json';

const ITEMS = 3; // 메뉴별 아이템 개수

class ChannelPlus extends React.Component {
	constructor(props) {
		super(props);

		this.itemWidth = 504; // 슬라이드 가로 폭
		this.itemMargin = 56; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		this.state = {
			channelplus :channelplus,
			slideTo:0,
			slideItem:channelplus.channelplusConts
		};

		this.arrowKeyDown = this.arrowKeyDown.bind(this);
	}
	focusOn(index, _this){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;

		if(document.querySelectorAll('.slideWrap.activeSlide').length !== 0){
			document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
		}
		activeSlide.closest('.slideWrap').classList.add('activeSlide');

		if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else{
			activeSlide.closest('.contentGroup').classList.remove('activeSlide');
		}

		if(activeSlide.classList.contains('right')){
			slideIndex += 1;
			if(slideIndex + thisItems > slideLength - 1){
				slideIndex = slideLength - thisItems;
			}
		}else if(activeSlide.classList.contains('left')){
			slideIndex -= 1;
			if(this.state.slideTo === 0){
				slideIndex = 0;
			}
		}

		this.setState({
			slideTo: slideIndex
		});

		document.querySelector('.slideCon').scrollLeft = 0;
	}

	focusOut(){
		if(document.querySelectorAll('.contentGroup.activeSlide').length !== 0){
			document.querySelector('.contentGroup.activeSlide').classList.remove('activeSlide');
		}
	}

	keyDown(_this, i, keyCode) {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;
		let direction = i;
		let targetIndex = _this;

		if(targetIndex === slideLength - 1 && direction === 39){
			slideIndex = 0;
			activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else if(targetIndex === 0 && direction === 37){
			slideIndex = slideLength - thisItems;
			activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
		}

		this.setState({
			slideTo: slideIndex
		});
	}

	arrowKeyDown(_this, event) {
		if( event.keyCode === 13){
			if( document.querySelector('.channelPlusArea').classList.contains('on') ){
				document.querySelector('.channelPlusArea').classList.remove('on');
			} else {
				document.querySelector('.channelPlusArea').classList.add('on');
			}
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="mainBg">
					<img src={this.state.channelplus.channelplusMainBg} alt="" />
				</div>
				<div className="channelPlusWrap scrollWrap">
					<div className="channelPlusArea">
						<span type="button" className="csFocus btnChannelPlus" onKeyDown={this.arrowKeyDown.bind(this,this.event)}>채널 플러스 <span>열기</span></span>
						<div className="channelPlusConts">
							<div className="contentGroup">
								<div className="channelPlusSlide">
									<div className="slideWrap">
										<div className="slideCon">
											<div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
												{this.state.channelplus.channelplusConts.map((data,i) => {
													return(
														<ChannelPlusList
															data={data}
															channelNum={data.channelNum}
															broadcasterLogo={data.broadcasterLogo}
															watching={data.watching}
															live={data.live}
															airTime={data.airTime}
															baseball={data.baseball}
															homeshopping={data.homeshopping}
															key = {i}
															index = {i}
															items={this.items}
															maxLength={this.state.slideItem.length}
															slideTo={this.state.slideTo}
															event1={this.focusOn.bind(this, i)}
															event2={this.focusOut.bind(this, i)}
															event3={this.keyDown.bind(this, i)}
														/>
													)
												})}
											</div>
										</div>
										<div className="leftArrow"></div>
										<div className="rightArrow"></div>
									</div>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.channelPlusArea .btnChannelPlus').classList.add('loadFocus');
		fnScrolling();
	}

}

class ChannelPlusList extends React.Component {
	focusOn(...args){
		this.props.event1(this, ...args);
	}

	focusOut(...args){
		this.props.event2(this, ...args);
	}

	keyDown(event){
		this.props.event3(event.keyCode);
	}

	render() {
		return (
			<div className={this.props.index < this.props.items || this.props.index >= this.props.maxLength - this.props.items ? "slide":"slide"}>
				<span className={this.props.index === ITEMS + this.props.slideTo - 1 ? "csFocus right": this.props.index === this.props.slideTo ? "csFocus left" : "csFocus"} tabIndex="-1" onFocus={this.focusOn.bind(this)} onBlur={this.focusOut.bind(this)} onKeyDown={this.keyDown.bind(this)}>
					<span className="channelTitleArea">
						<span className="channelInfo">
							<span className="channelNum">{this.props.channelNum}</span>
							<span className="broadcasterLogo">
								<span className="logoWrap">
									<span className="logoImg">
										<img src={this.props.broadcasterLogo} alt="" />
									</span>
								</span>
							</span>
							{ this.props.watching === true ? <span className="watching">시청중</span> : ''}
						</span>
						<span className="timeInfo">
							{ this.props.live === true ? <span className="live">LIVE</span> : ''}
							<span className="airTime">{this.props.airTime}</span>
						</span>
					</span>
					<span className="broadcastInfoArea">
						{(() => {
							if( this.props.baseball ){
								return (
									<span className="baseballScoreInfo">
										<span className="teamInfo">
											<span className="logoImg">
												<img src={this.props.baseball.teamLogo1} alt=""/>
											</span>
											<span className="teamName">{this.props.baseball.teamName1}</span>
										</span>
										{ this.props.baseball.start === true ?
											<span className="scoreInfo">
												<span className="score">
													<span className="teamScore1">{this.props.baseball.teamScore1}</span>
													<span>:</span>
													<span className="teamScore2">{this.props.baseball.teamScore2}</span>
												</span>
												<span className="ing">{this.props.baseball.ing}</span>
											</span>
											:
											<span className="scoreInfo">
												<span className="score vs">
													<span className="vs">VS</span>
												</span>
											</span>
										}
										<span className="teamInfo">
											<span className="logoImg">
												<img src={this.props.baseball.teamLogo2} alt=""/>
											</span>
											<span className="teamName">{this.props.baseball.teamName2}</span>
										</span>
									</span>
								);
							} else if(this.props.homeshopping ){
								return (
									<span className="homeshoppingInfo">
										<span className="productImg">
											<img src={this.props.homeshopping.productImg} alt=""/>
										</span>
										<span className="productInfo">
											<span className="productTitle">{this.props.homeshopping.productTitle}</span>
											<span className="costInfo">
												<span className="productCost">{this.props.homeshopping.productCostMonth}<span className="num">{this.props.homeshopping.productCost}</span>원</span>
												<span className="state">{this.props.homeshopping.state}</span>
											</span>
										</span>
									</span>
								);
							}
						})()}
					</span>
				</span>
			</div>
		)
	}
}

export default ChannelPlus;