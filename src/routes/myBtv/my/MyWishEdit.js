import { React, fnScrolling } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/my/RecentVod.css';

import SlideTypeA_CJson from '../../../assets/json/routes/myBtv/my/SlideTypeA_C.json';
import SlideTypeA_C from "components/modules/SlideTypeA_C";

class MyWishEdit extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			contentSlide: SlideTypeA_CJson
		}

	}

	keyDown1(event) {
		if (event === 40) {
			document.querySelector(".btnStyleLight1_2:first-child").focus();
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="registWrap vod scrollWrap">
					<h2 className="pageTitle">VOD 찜 목록 삭제</h2>
					<p className="subInfo">찜 해놓은 VOD 목록을 편집할 수 있습니다.</p>
					<div className="registerWishSlide">
						{this.state.contentSlide.length === 0 ? "" : <SlideTypeA_C slideInfo={this.state.contentSlide} event1={this.keyDown1.bind(this)} />}
					</div>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">전체삭제</span>
						</button>
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">취소</span>
						</button>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		// document.querySelector('.registerForm .gridWrap .gridStyle.card:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
	}

}

export default MyWishEdit;