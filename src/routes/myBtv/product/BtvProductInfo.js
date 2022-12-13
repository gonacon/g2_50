import {React, fnScrolling, createMarkup } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/product/BtvProductInfo.css';
import BtvProductSlide from './BtvProductSlide.js';
import BtvProductInfoJson from '../../../assets/json/routes/myBtv/product/BtvProductInfo.json';
import BtvProductSlideJson from '../../../assets/json/routes/myBtv/product/BtvProductSlide.json';
import appConfig from 'Config/app-config';

class BtvProductInfo extends React.Component {
    constructor(props) {
        super(props);

        let JsonData = [BtvProductInfoJson, BtvProductSlideJson];
        this.state = {
            contentSlides: JsonData,
        }

    }

    render() {
        return(
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <BtvProductCon
                    contentSlides={this.state.contentSlides}
                    detailCaution={this.state.contentSlides[0].detailCaution}
                    priceDetail = {this.state.contentSlides[0].priceDetail}
                    logoItem = {this.state.contentSlides[0].logoItem}/>
                {this.state.contentSlides.map((data, i) => {
                    switch (data.slideType) {
                        case 'btvProductSlide' :
                            return(
                                <BtvProductSlide
                                    slideInfo={data}
                                    key={i}
                                />
                            );
                        default :
                            return (<div key={i}/>)
                    }
                })}
            </div>
        )
    }

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.btvProductSlide .slide:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
	}
}

class BtvProductCon extends React.Component {
    render() {
	return (
        <div className="btvProductInfo">
            <div className="ProductInfoCon">
                {/*<div className="topBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/layered-bg.png`} alt="" /></div>*/}
                <div className="productTitleWrap">
                    <h2 className="productTitle">{this.props.contentSlides[0].productTitle}</h2>
                    {
                        (this.props.contentSlides[0].usedProduct === true
                            ? <span className="mark">현재 이용중인 상품</span>
                            : <span></span>)
                    }

                </div>
                <p className="productInfo">{this.props.contentSlides[0].productInfo}</p>
                <div className="conLeft">
                    <ul className="detailCaution">
                        {
                            this.props.detailCaution.map((data, i) => {
                                return(
                                    <li key={i} dangerouslySetInnerHTML={createMarkup(data)}></li>
                                )
                            })
                        }
                    </ul>
                    <p className="costPrice"><span><strong className="number">{this.props.priceDetail.price}</strong>{this.props.priceDetail.value}</span><span><strong className="number">{this.props.priceDetail.Count}</strong>채널 이용 중</span></p>
                    <p className="costInfo">({this.props.priceDetail.info})</p>
                </div>
                <div className="conRight">
                    <ul className="productLogoList">
                        {
                            this.props.logoItem.map((data,i) => {
                                return(
                                    <li key={i}><span className="imgLogo"><img src={data.imgSrc} alt=""/></span></li>
                                )
                            })
                        }
                    </ul>
                </div>

            </div>
        </div>
		)
	}
}

export default BtvProductInfo;
