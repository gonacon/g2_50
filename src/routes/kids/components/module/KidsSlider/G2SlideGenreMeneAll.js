import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import Utils from './../../../../../utils/utils';

import appConfig from './../../../../../config/app-config';
import '../KidsSliderCSS/SlideTypeA.css';
import '../KidsSliderCSS/SlideTypeAD.css';
import '../KidsSliderCSS/SlideTypeB.css';
import '../KidsSliderCSS/SlideTypeC.css';
import '../KidsSliderCSS/SlideTypeBC.css';
import '../KidsSliderCSS/SlideGenreBlock.css';
class G2SlideHorizantalVOD extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_CONTENT_HOR_SLIDE;
		this.state = {
			focused: false,
			isTextOver: false
		}
	}

	setTextOver() {
		const { width } = SlideInfo[this.slideType];
		let { isTextOver } = this.state;
		if (!this.titBox) return;
	
		if (this.titBox.clientWidth > width && isTextOver !== true) {
		  this.setState({ isTextOver: true });
		}
	}

	componentDidMount() {
		this.setTextOver();
	}
	
	componentDidUpdate() {
		this.setTextOver();
	}
	
	render() {
		const { slideType, bFirst, bLast } = this.props;
		const {
			title,
			imgH,
		} = this.props.content
		const { isTextOver } = this.state;
		let textOver = isTextOver ? ' textOver' : '';
		let focusClass = '';

		const { width, height, imgWidth } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_HOR);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-port.png`;
		
		let image = imgUrl + imgH;

		if (bFirst) {
			focusClass += ' left';
		} else if (bLast) {
			focusClass += ' right';
		}

		return (
			<div className={`slide csFocus${textOver}`}>
				<span className="imgWrap">
					<img src={image} width={imgWidth} height={height} alt="" onError={e => e.target.src = defaultImg} />
				</span>
				<span className="programTitle" ref={r => this.titBox = r}>{title}</span>
			</div>
		)
	}
}

class G2SlideVerticalVOD extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_CONTENT_VER_SLIDE;
		this.state = {
			focused: false,
			isTextOver: false
		}
	}

	setTextOver() {
		const { width } = SlideInfo[this.slideType];
		let { isTextOver } = this.state;
		if (!this.titBox) return;
	
		if (this.titBox.clientWidth > width && isTextOver !== true) {
		  this.setState({ isTextOver: true });
		}
	}

	componentDidMount() {
		this.setTextOver();
	}
	
	componentDidUpdate() {
		this.setTextOver();
	}

	render() {
		// console.log('[this.content] : ' , this.props.content);
		// console.log('[this.props] : ' , this.props);
		const { isTextOver } = this.state;
		const { slideType, bFirst, bLast } = this.props;
		const {
			title,
			imgV,
		} = this.props.content
		let textOver = isTextOver ? ' textOver' : '';
		let focusClass = '';

		const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_VER);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-land.png`;
		
		let image = imgUrl + imgV;

		// if (bFirst) {
		// 	focusClass += ' left';
		// } else if (bLast) {
		// 	focusClass += ' right';
		// }

		return (
			<div className={`slide csFocus${textOver}`}>
				<span className="imgWrap">
					<img src={image} width={width} height={height} alt="" onError={e => e.target.src = defaultImg} />
					{
						(title !== undefined ?  <span className="slideTitle" ref={r => this.titBox = r} >{title}</span> : '')
					}
				</span>
			</div>
		)
	}
}

class G2SlideCwVOD extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_CW_SLIDE;
		this.state = {
			focused: false
		}
	}

	render() {
		const { slideType } = this.props;
		const {
			title,
			imgV,
		} = this.props.content

		const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_CW);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-land.png`;
		
		let image = imgUrl + imgV;

		return (
			<div className="slide">
				<div className="csFocus">
					<img src={image} width={width} height={height} alt="" onError={e => e.target.src = defaultImg} />
					{
						(title !== undefined ?  <span className="slideTitle">{title}</span> : '')
					}
				</div>
			</div>
		)
	}
}

class G2SlideMenuVOD extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_MENU_SLIDE;
		this.state = {
			focused: false
		}
	}

	render () {
		const { slideType } = this.props;
		const {
			menuImg,
			menuNm
		} = this.props.content

		const { width, height } = SlideInfo[slideType];
		// const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_HOR);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/default/thumbnail-default-land.png`;
		

		// [TODO] 이미지 또는 텍스트 구분
		let isImage = false;
		

		return (
			<div className="slide csFocus">
					{
						isImage && 
						<span className="imgWrap">
							<img src={menuImg} width={width} height={height} alt="" onError={e => e.target.src = defaultImg}/>
						</span>
					}
					<span className="genreBlockTitle">
						<span style={{'WebkitBoxOrient': 'vertical'}}>{menuNm}</span>
					</span>
			</div>
		)
	}
}

class G2SlideCircle extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_CIRCLE_SLIDE;
		this.state = {
			focused: false
		}
	}

	render() {
		const { slideType } = this.props;
		const {
			title,
			bnrOffImgPath,
		} = this.props.content

		const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_CIRCLE);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/default/kids_chatacter_block_nor_default.png`;
		
		let image = imgUrl + bnrOffImgPath;

		return (
			<div className="slide">
				<div className="csFocus">
				<img src={image} width={width} height={height} alt="" onError={e => e.target.src = defaultImg}/>
					<div className="itemTitle">{title}</div>
				</div>
			</div>
		)
	}
}

class G2SlideBannerC extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_BANNER_SLIDE_C;
		this.state = {
			focused: false
		}
	}

	render() {
		const {
			bnrOffImgPath,
		} = this.props.content
		const { width, height } = SlideInfo[this.slideType];

		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_C);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/default/event_block_1set_default.png`;

		return (
			<div className='slide csFocus'>
				<span className="imgWrapper"><img src={imgUrl + bnrOffImgPath} width={width} height={height} alt="" onError={e => e.target.src = defaultImg}/></span>
			</div>
		)
	}
}

class G2SlideBannerB extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_BANNER_SLIDE_B;
		this.state = {
			focused: false
		}
	}

	render() {
		const {
			bnrOffImgPath,
		} = this.props.content
		const { width, height } = SlideInfo[this.slideType];

		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_B);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/default/event_block_2set_default.png`;

		return (
			<div className='slide csFocus'>
				<span className="imgWrapper"><img src={imgUrl + bnrOffImgPath} width={width} height={height} alt="" onError={e => e.target.src = defaultImg}/></span>
			</div>
		)
	}
}

class G2SlideBannerA extends Component {
	constructor(props) {
		super(props);
		this.slideType = SlideType.KIDS_BANNER_SLIDE_A;
		this.state = {
			focused: false
		}
	}

	render() {
		const {
			bnrOffImgPath,
		} = this.props.content
		const { width, height } = SlideInfo[this.slideType];

		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_A);
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/default/event_block_3set_default.png`;

		return (
			<div className='slide csFocus'>
				<span className="imgWrapper"><img src={imgUrl + bnrOffImgPath} width={width} height={height} alt="" onError={e => e.target.src = defaultImg}/></span>
			</div>
		)
	}
}

export {
	G2SlideHorizantalVOD,
	G2SlideVerticalVOD,
	G2SlideCwVOD,
	G2SlideMenuVOD,
	G2SlideCircle,
	G2SlideBannerA,
	G2SlideBannerB,
	G2SlideBannerC
}