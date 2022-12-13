import {React, createMarkup } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/product/BtvProductDetail.css';
import BtvProductDeatilJson from '../../../assets/json/routes/myBtv/product/BtvProductDetail.json';
import appConfig from 'Config/app-config';

class BtvProductDetail extends React.Component {
    constructor(state) {
        super(state);

        let JsonData = BtvProductDeatilJson;
        this.state = {
            contentSlides: JsonData,
			priceDetail: JsonData.priceDetail,
        }

    }

    render() {
        return(
            <div className="wrap">
                <div className="myBtvProduct">
                    <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                    <div className="btvProductDetail">
                        <h2 className="productTitle">{this.state.contentSlides.productTitle}</h2>
                        <div className="productInfo" dangerouslySetInnerHTML={createMarkup(this.state.contentSlides.productInfo)}></div>
                        <div className="conLeft">
                            <ul className="detailList">
								{
									this.state.contentSlides.detailList.map((data, i) => {
										return(
                                            <li key={i}>{data}</li>
										)
									})
								}
                            </ul>
                            <div className="btnListWrap">
                                <span tabIndex="-1" className="csFocus">
                                    <span className="text">상품변경하기</span>
                                    <span className="price">{this.state.priceDetail.price}<span className="value">{this.state.priceDetail.value}</span></span>
                                </span>
                                <span className="voucherInfo">{this.state.priceDetail.info}</span>
                            </div>
                            <ul className="detailCaution">
								{
									this.state.contentSlides.detailCaution.map((data, i) => {
										return(
                                            <li key={i} dangerouslySetInnerHTML={createMarkup(data)}></li>
										)
									})
								}
                            </ul>
                        </div>
                        <div className="conRight">
                            <ul className="productLogoList">
								{
									this.state.contentSlides.logoItem.map((data,i) => {
										return(
                                            <li key={i}><span className="imgLogo"><img src={data.imgSrc} alt=""/></span></li>
										)
									})
								}
                            </ul>
                        </div>
                    </div>
                    <span to="#" tabIndex="-1" className="btnPrev">닫기</span>
                </div>
            </div>
        )
    }

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.btnListWrap .csFocus').classList.add('loadFocus');
	}

}

export default BtvProductDetail;
