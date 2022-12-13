import {React, fnScrolling} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/my/MyWishTotalDelete.css';
import ListItemType from './ListItemType.js';
import ListItemTypeJson from '../../../assets/json/routes/myBtv/my/ListItemType.json';
import appConfig from './../../../config/app-config';

class MyWishTotalDelete extends React.Component {
    constructor(props) {
        super(props);

        let JsonData = ListItemTypeJson;
        this.state = {
            contentSlides: JsonData
        }

    }

	focusMove(e){
		if(e.keyCode === 40) {
			let _target = e.target;
			_target.closest('.wishDeleteTotalWrap').querySelector('.listWrapper .item:first-child .csFocus').focus();
		}
	}

	render() {
		// let count = 0;
		// {
			// this.state.contentSlides.slideItem.map((data) => {
			// 	count += data.length;
			// });
		// }


		return (
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <div className="wishDeleteTotalWrap scrollWrap">
                    <h2 className="pageTitle">VOD 찜 목록 삭제</h2>
                    <p className="subInfo">고객님이 찜해놓으신 VOD 목록을 삭제할 수 있습니다.</p>
                    <div className="btnListWrap">
                        <span tabIndex="-1" className="csFocus btnStyleLight1" onKeyDown={this.focusMove.bind(this)}>
                            <span className="wrapBtnText">전체삭제</span>
                        </span>
                        <span tabIndex="-1" className="csFocus btnStyleLight1" onKeyDown={this.focusMove.bind(this)}>
                            <span className="wrapBtnText">닫기</span>
                        </span>
                    </div>
                    <ListItemType slideInfo={this.state.contentSlides}/>
                </div>
            </div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.btnListWrap .csFocus:first-child').classList.add('loadFocus');
		fnScrolling();
	}

}
export default MyWishTotalDelete;
