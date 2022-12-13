import {React, fnScrolling, radioFn } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/my/RecentVod.css';

import SlideTypeB_BJson from '../../../assets/json/routes/myBtv/my/SlideTypeB_B.json';
import SlideTypeB_B from 'components/modules/SlideTypeB_B';

class RecentVodEdit extends React.Component {
	constructor(props) {
		super(props);

        this.state = {
			contentSlide: SlideTypeB_BJson
        }

	}

	render() {
		return (
			<div className="wrap">
				<div className="registWrap vod scrollWrap">
					<h2 className="pageTitle">최근 시청 VOD 삭제</h2>
					<p className="subInfo">최근 시청한 VOD 목록을 편집할 수 있습니다.</p>
					<div className="registerForm">
						{this.state.contentSlide.length === 0 ?
							""
							:
							<SlideTypeB_B
								slideInfo={this.state.contentSlide}
							/>
						}
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
		document.querySelector('.buttonWrap .csFocus:first-child').classList.add('loadFocus');
		fnScrolling();
		radioFn();
	}
}

export default RecentVodEdit;