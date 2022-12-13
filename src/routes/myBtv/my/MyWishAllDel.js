import {React } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/my/RecentVod.css';

class MyWishAllDel extends React.Component {
	constructor(props) {
		super(props);

        this.state = {
        }

	}

	render() {
		return (
			<div className="wrap">
				<div className="registWrap vod">
					<h2 className="pageTitle">최근 시청 VOD 전체삭제</h2>
					<div className="registerAllDel">
						<p className="textAllDel">찜 해놓으신 마션 외 28편의 VOD 콘텐츠 목록을<br/>모두 삭제 하시겠습니까?</p>
					</div>
					<div className="buttonWrap">
						<button className="csFocus btnStyleLight1_2">
							<span className="wrapBtnText">삭제</span>
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
	}
}

export default MyWishAllDel;