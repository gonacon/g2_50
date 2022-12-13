import { React } from '../../utils/common';
import { getByteLength } from "../../utils/UI";
import '../../assets/css/components/modules/SlideTypeA.css';
import PropTypes from 'prop-types';
// import _ from 'lodash';

// import { HorizontalList, Focusable } from '../../supporters/navigation';

// const IMG_WIDTH = 246; // 이미지 가로
// const IMG_HEIGHT = 354; // 이미지 세로
// const ITEMS = 6; // 메뉴별 아이템 개수

class SlideTypeA extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			slideTo: 0,
			activeSlide: 1,
			slideItem: this.props.slideInfo.slideItem,
			slideTitle: this.props.slideInfo.slideTitle,
			itemWidth: 246, // 슬라이드 가로 폭
			itemMargin: 40, // 슬라이드 간격
			IMG_WIDTH: 246, // 이미지 가로
			IMG_HEIGHT: 354, // 이미지 세로
			ITEMS: 6 // 메뉴별 아이템 개수, 한 화면의 슬라이드 개수
		}

		// this.throttleKeyDown = _.throttle(this.keyDown, 500);
	}

	componentWillReceiveProps(nextProps) {
		if (JSON.stringify(nextProps) === JSON.stringify(this.props)) {
			this.setState({
				slideItem: nextProps.slideInfo.slideItem,
				slideTitle: nextProps.slideInfo.slideTitle
			});
		}
	}

	componentWillMount() {
		if (this.props.allView) {
			let data = [];
			let first = {
				"title": "전체보기"
			};
			data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
			data[0].unshift(first);

			this.setState({
				slideItem: data[0]
			});
		}
	}

	focusOn(index, _this) {
		// 메뉴상태 저장
		const { menuIdx, saveMenuState } = this.props;
		saveMenuState(menuIdx, index + 1);
		console.log(`[포커스] ${menuIdx}번 슬라이더의 ${index + 1}아이템`);

		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.state.ITEMS;
		let activeSlide = document.activeElement;
		let activeIndex = index + 1;

		if (document.querySelectorAll('.slideWrap.activeSlide').length !== 0) {
			document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
		}
		activeSlide.closest('.slideWrap').classList.add('activeSlide');

		if (index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1) {
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		} else {
			activeSlide.closest('.contentGroup').classList.remove('activeSlide');
		}

		if (activeSlide.classList.contains('right')) {
			slideIndex += 1;
			if (slideIndex + thisItems > slideLength - 1) {
				slideIndex = slideLength - thisItems;
			}
		} else if (activeSlide.classList.contains('left')) {
			slideIndex -= 1;
			if (this.state.slideTo === 0) {
				slideIndex = 0;
			}
		}

		this.setState({
			slideTo: slideIndex,
			activeSlide: activeIndex
		});

		document.querySelector('.slideCon').scrollLeft = 0;
	}

	keyDown = (i, synopsisData, event) => {
		// let e = event || window.event;
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.state.ITEMS;
		let activeSlide = document.activeElement;
		let direction = event.keyCode;
		let targetIndex = i;

		let x = this.props.gridFocus;
		let y = this.props.loadFocus;

		if (direction === 39) {		// right
			x = this.state.activeSlide + 1;
			if (x === this.state.slideItem.length + 1) {
				x = 1;
			}
		} else if (direction === 37) {	// left
			x = this.state.activeSlide - 1;
			if (x === 0) {
				x = this.state.slideItem.length;
			}
		} else

			if (direction === 38) {// up
				y -= 1;
				if (y === 2) {
					y = 3;
				}
			} else if (direction === 40) {// down
				y += 1;
				if (y === this.props.blocksLength + 3) {
					y = this.props.blocksLength + 2
				}
			}

		if (direction === 39) {
			x += 1;
			if (targetIndex === slideLength - 1) {
				slideIndex = 0;
				x = 0;
				activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
			}
		} else if (direction === 37) {
			x -= 1;
			if (targetIndex === 0) {
				slideIndex = slideLength - thisItems;
				x = slideLength;
				activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
			}
		} else if (direction === 38) {		// up
			y -= 1
		} else if (direction === 40) {		// down
			y += 1
		}

		this.setState({ slideTo: slideIndex });
		if (event.key === 'Enter') {
			this.props.moveToSynopsis(synopsisData);
		}
	}

	renderslideItem() {
		let { slideItem, slideTo, ITEMS, IMG_WIDTH, IMG_HEIGHT } = this.state;
		let slideItemLength = slideItem.length;

		return slideItem.map((data, i) => {
			let titleLength = getByteLength(data.title);
			let style = { textAlign: i === 0 && titleLength >= 20 ? 'left' : i === slideItemLength - 1 && titleLength >= 20 ? 'right' : 'center' }
			// 슬라이드 ITEM
			return (
				<div className={this.props.allView && i === 0 ? "slide first" : "slide"} key={i}>
					<div ref="slideItem"
						className={i === ITEMS + slideTo - 1 ? "csFocus right" : i === slideTo ? "csFocus left" : "csFocus"}
						tabIndex="-1"
						onFocus={this.focusOn.bind(this, i)}
						onKeyDown={
							this.keyDown.bind(null, i, { menu_id: data.menu_id, sris_id: data.sris_id, epsd_id: data.epsd_id })
						}
						style={style}>
						<img src={data.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" />
						<span className="slideTitle">{data.title}</span>
					</div>
				</div>
			)
		});
	}

	render() {

		let { slideTo, slideItem, itemWidth, itemMargin, slideTitle } = this.state;

		return (
			<div className="contentGroup">
				<div className="slideTypeA">
					<div className="title">{slideTitle}</div>
					<div className="slideWrap">
						<div className="slideCon">
							<div className="slideWrapper" style={{ '--page': slideTo, 'width': (slideItem.length * itemWidth) + (slideItem.length * itemMargin) }}>
								{this.renderslideItem()}
							</div>
						</div>
						<div className="slideCount">
							<span className="current">
								{this.state.activeSlide}
							</span>
							&nbsp;/&nbsp;
							{this.state.slideItem.length}
						</div>
						<div className="leftArrow"></div>
						<div className="rightArrow"></div>
					</div>
				</div>
			</div>
		);
	}
}

SlideTypeA.propTypes = {
	loadFocus: PropTypes.number
};

export default SlideTypeA;