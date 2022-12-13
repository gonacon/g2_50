import {React, createMarkup} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/MyBtvLayout.css';
import '../../../assets/css/routes/myBtv/coupon/CouponDetailNone.css';
import CouponDetailNoneJson from '../../../assets/json/routes/myBtv/coupon/CouponDetailNone.json';

class CouponDetailNone extends React.Component {
    constructor(props) {
        super(props);

        let JsonData = CouponDetailNoneJson;
        this.state = {
            contentSlides: JsonData,
        }

    }

    render() {
       return(
           <div className="wrap">
               <div className="myBtvLayout">
                   <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                   <div className="CouponWrap none">
                       <h2 className="pageTitle">쿠폰함</h2>
                       <p className="subInfo">{this.state.contentSlides.pageDescription}</p>
                       <div className="CouponItemWrap">
                           <div className="CouponItem">
                               <span className="card csFocus CouponRegist">
                                   <span className="registText">쿠폰 등록</span>
                               </span>
                           </div>
                       </div>
                       <div className="bottomWrap">
                           <div className="eventDesc" dangerouslySetInnerHTML={createMarkup(this.state.contentSlides.caution)}></div>
                           <div className="eventDescSub">{this.state.contentSlides.cautionInfo}</div>
                       </div>
                   </div>
               </div>
           </div>
       )
    }

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.CouponRegist').classList.add('loadFocus');
	}

}

export default CouponDetailNone;
