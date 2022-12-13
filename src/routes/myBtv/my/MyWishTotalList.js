import {React, fnScrolling} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/my/MyWishTotalList.css';
import ListItemType from './ListItemType.js';
import ListItemTypeJson from '../../../assets/json/routes/myBtv/my/ListItemType.json';
import appConfig from './../../../config/app-config';

class MyWishTotalList extends React.Component {
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
			_target.closest('.wishTotalListWrap').querySelector('.listWrapper .item:first-child .csFocus').focus();
		}
	}

	render() {
		let count = 0;

		this.state.contentSlides.slideItem.map((data) => {
			count += data.length;
		});

		return (
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <div className="wishTotalListWrap scrollWrap">
                    <h2 className="pageTitle">VOD 찜 전체목록</h2>
                    <p className="subInfo">총 <strong className="count">{count}</strong>개의 찜한 VOD 콘텐츠가 있습니다. 찜 목록은 최대 50개까지만 저장됩니다.</p>
                    <div className="btnListWrap">
                        <span tabIndex="-1" className="csFocus btnStyleLight1" onKeyDown={this.focusMove.bind(this)}>
                            <span className="wrapBtnText">목록 삭제</span>
                        </span>
                    </div>
                    <ListItemType slideInfo={this.state.contentSlides}/>
                </div>
            </div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.listItemType .item:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
	}

}

export default MyWishTotalList;
