import { React, fnScrolling } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/VOD/OwnVODRecommendList.css';

import RecommendSlide from './RecommendSlide.js';
import recommendSlideJson from '../../../assets/json/routes/myBtv/VOD/recommendSlide.json';
import appConfig from 'Config/app-config';

class OwnVODRecommendList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			slideTo: 0,
			slideItem: recommendSlideJson.slideItem,
			contents: recommendSlideJson
		}
	}

	componentWillMount() {
		if (this.props.allView) {
			let data = [];
			let first = {
				"title": "전체보기",
				"link": "/"
			};
			data[0] = JSON.parse(JSON.stringify(this.state.slideItem));
			data[0].unshift(first);

			this.setState({
				slideItem: data[0]
			});
		}
	}

	focusOn(index, _this) {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;

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
			slideTo: slideIndex
		});

		document.querySelector('.slideCon').scrollLeft = 0;
	}

	focusOut() {
		if (document.querySelectorAll('.contentGroup.activeSlide').length !== 0) {
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

		if (targetIndex === slideLength - 1 && direction === 39) {
			slideIndex = 0;
			activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		} else if (targetIndex === 0 && direction === 37) {
			slideIndex = slideLength - thisItems;
			activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
		}

		this.setState({
			slideTo: slideIndex
		});
	}

	render() {
		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/bg-own-vod-recommend.png`} alt="" /></div>
				<div className="ownRecommendWrap">
					<div className="recommendTitleWrap">
						<p className="title">소장용 VOD 추천목록</p>
						<p className="subTitle"><strong>{this.state.contents.actorMovie}</strong>의 <strong>{this.state.contents.actor}</strong> 배우가 출연한 작품이에요</p>
					</div>
					<RecommendSlide slideItem={this.state.slideItem} contents={this.state.contents} />
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.recommendSlide .slide:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
	}

}
export default OwnVODRecommendList;

