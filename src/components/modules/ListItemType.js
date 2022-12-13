// common
import React from 'react';

// style
import 'Css/myBtv/my/ListItemType.css';

// util
import { isEmpty } from 'lodash';
import appConfig from './../../config/app-config';
import Utils from 'Util/utils';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class ListItemType extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 246; // 슬라이드 가로 길이
		this.itemHeight = 354;// 슬라이드 세로 길이
		this.itemMargin = 42; // 슬라이드 간격
		this.items = 6; // 한 화면의 슬라이드 개수

		this.state = {
			editState: this.props.edit
		}
	}

	componentDidMount() {

	}

	render() {
		const { slideInfo, injectRefs, curFocus } = this.props;
		
		return (
			<div className="listItemType">
				<div className="listWrapper" id="grids">
					{!isEmpty(slideInfo) && slideInfo.map((data, idx1) => (
						<div className="contentGroup" key={idx1} id={`contentGroupId_${idx1}`} ref={r => injectRefs(r, idx1)}>
							<div className="slideWrap">
								<div className="slideCon">
									{data.map((data2, k) => (
										<WishListItem key={k} index={k} listIdx={idx1} data={data2} flag={data2} curFocus={curFocus} />
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

class WishListItem extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			textOver: '',
		}
	}

	getBadgeImage = badgeCode => {
        switch (badgeCode) {
            case 'sale': return 'sale';
            case 'event': return 'event-nor';
            case 'new': return 'new';
            case 'free': return 'free';
            case 'up': return 'up';
            case 'rest': return 'cancel';
            case 'monopoly': return 'monopoly';
            case 'hdr': return 'uhd-hdr';
            case 'uhd': return 'uhd';
            default: break;
        }
	}
	
	addTextOver() {
		const { index } = this.props;
		if (!this.titBox) return '';
		if (this.titBox.clientWidth > IMG_WIDTH && (index === 0 || index === ITEMS-1) ) {
			return 'textOver';
		} else {
			return '';
		}
	}

	getFocusOn = () => {
		const { curFocus, listIdx, index } = this.props;
		let klass = (listIdx * ITEMS) + index;
		return klass === curFocus ? 'focusOn' : '';
	}

	onError = (evt) => {
		evt.target.src = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
	}

	componentDidMount() {
		const { index } = this.props;
		const { textOver } = this.state;
		if ( ( index === 0 || index === ITEMS-1 ) && this.addTextOver() && !textOver ) {
			let textOver = this.addTextOver();
			this.setState({ textOver });
		}
	}
	

	render() {
		const { textOver } = this.state;
		const { index, data } = this.props;
		const { image, adlt_lvl_cd, badge, userBadgeImgPath, userBadgeWidthImgPath } = data;

		// 사용자 뱃지
		const userBadge = userBadgeImgPath;
		const userBadgeSize = '292_90';
		const directionClass = index === 0 ? "csFocus left" : index === ITEMS - 1 ? "csFocus right" : "csFocus";
		const focusClass = `${directionClass} ${this.getFocusOn()}`;

		return (
			<div className={`slide ${focusClass} ${textOver}`}>
				<span className="imgWrap">
					<img src={image}
						width={IMG_WIDTH}
						height={IMG_HEIGHT}
						onError={this.onError}
						alt=""
					/>
					<span className="flagWrap" style={{width: '100%'}}>
						{ isEmpty(this.getBadgeImage(badge)) ? '' : 
							<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-${this.getBadgeImage(badge)}.png`} alt="뱃지" />
						}
						{ userBadge &&
							<img src={`${Utils.getIipImageUrl(...userBadgeSize.split('_'))}_A20${userBadge}`}
									className="flagImg"
									style={{width: '100%'}}
									alt="사용자 정의 뱃지" />
						}
					</span>
				</span>
				<span className="itemTitle"
						ref={r => this.titBox = r}>
					{this.props.data.title}
				</span>
				{ this.props.editState === true && <span className="icDelete"></span> }
			</div>
		)
	}

}


export default ListItemType;