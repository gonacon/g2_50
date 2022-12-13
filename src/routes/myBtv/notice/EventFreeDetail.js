import {React, fnScrolling, createMarkup, phoneNumFn, SpatialNavigation, focusClass} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/notice/EventFreeDetail.css';
import '../../../assets/css/routes/myBtv/bPoint/BpointGift.css';

import BpointGiftJson from '../../../assets/json/routes/myBtv/notice/EventFreeDetail.json';
import appConfig from 'Config/app-config';

const ITEMS = 3; // 메뉴별 아이템 개수

class EventFreeDetail extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 411; // 슬라이드 가로 폭
		this.itemMargin = 19; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		let JsonData = BpointGiftJson;
		this.state = {
			contentSlides: JsonData,
		}

	}

	valueRequire(_this){
		let targetInput = _this.target.closest('.gridWrap').querySelector('#phoneNumber');
		let button = document.querySelector('.btnCoupon');
		if( phoneNumFn(targetInput.value) ){
			button.setAttribute('data-disabled', false);
			button.classList.add('csFocus');
		} else {
			button.setAttribute('data-disabled', true);
			button.classList.remove('csFocus');
		}
		SpatialNavigation.makeFocusable();
		focusClass();
	}

	render() {
		return(
			<div className="wrap">
				<div className="myBtvLayout">
					<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/mybtv/bg-oksusu-event.png`} alt="" /></div>

					<div className="EventFreeDetail">
						<span className="wrapGiftImg"><img src={this.state.contentSlides.img} alt=""/></span>
						<h2 className="pageTitle">{this.state.contentSlides.titleText}</h2>
						<div className="subInfo" dangerouslySetInnerHTML={createMarkup(this.state.contentSlides.subText)}></div>
						<div className="gridWrap">
							<span className="gridStyle">
								<input type="text" id="phoneNumber" className="inputText csFocus" maxLength="11" placeholder="숫자만 입력" onChange={this.valueRequire.bind(this)}/>
								<label htmlFor="phoneNumber"></label>
							</span>
						</div>

						<div className="bottomWrap">
							<div className="btnBttomWrap">
								<span className="csFocus btnStyle btnCoupon" data-disabled={true}>
									<span className="wrapBtnText">쿠폰받기</span>
								</span>
								<span className="csFocus btnStyle">
									<span className="wrapBtnText">닫기</span>
								</span>
							</div>
							<div className="textDesc" dangerouslySetInnerHTML={createMarkup(this.state.contentSlides.caution)}></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.gridWrap input').classList.add('loadFocus');
		fnScrolling();
	}

}

export default EventFreeDetail;
