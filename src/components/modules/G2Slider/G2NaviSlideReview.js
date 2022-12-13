import React, { Component } from 'react';
import { SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
import _ from 'lodash';
// import Utils from '../../../utils/utils';
import appConfig from './../../../config/app-config';
import NumberFormat from '../UI/NumberFormat';


class G2NaviSlideReview extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType[this.props.type];

        this.state = {
            focused: false
        };
    }

    static defaultProps = {
        title: '',
        imgURL: '',
        bAdult: false,
        rate: 0,
        espdId: '',
        allMenu: false
    }

    render() {
        const { item, bFirst, allMenu, bLast, slideType } = this.props;
        // const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.props;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        switch (slideType) {
            case 'history': focusClass += ' myAward'; break;
            case 'rate': focusClass += ' myAppraisal award'; break;
            case 'btv': case 'grade': focusClass += ' starLocation award'; break;
            case 'review': focusClass += ' commentBox award'; break;
            default: break;
        }

        return (
            <div className={`slide${allMenu ? ' first' : ''}`} onClick={this.onFocused}>
                <div className={focusClass}>
                    {(slideType === 'history') &&
                        <SynopReviewHistory
                            item={item}
                        />
                    }
                    {(slideType === 'rate') &&
                        <SynopReviewRate
                            item={item}
                        />
                    }
                    {(slideType === 'btv') &&
                        <SynopReviewBtv
                            item={item}
                        />
                    }
                    {(slideType === 'grade') &&
                        <SynopReviewGrade
                            item={item}
                        />
                    }
                    {(slideType === 'review') &&
                        <SynopReviewReview
                            item={item}
                        />
                    }
                </div>
            </div>
        );
    }

}

class SynopReviewHistory extends React.Component {
    render() {
        const { item } = this.props;
        return (
            <div className="reviewBox">
                <div className="reviewLogoArea">
                    <span className="myAwardText">수상내역</span>
                </div>
                <div className="topText">
                    <div className="reviewTextWrap">
                        <p style={{ 'WebkitBoxOrient': 'vertical' }}>
                            <span className="icAward"></span>
                            {item.awrdc_nm}
                        </p>
                    </div>
                </div>
                <div className="botText">
                    <div className="subText">
                        {
                            item.prizeLen > 1 ?
                                '외 ' + (item.prizeLen - 1) + '개'
                                : null
                        }
                        수상
                    </div>
                </div>
            </div>
        )
    }
}

class SynopReviewRate extends React.Component {
    render() {
        const { item } = this.props;
        let dark, light, on, subText = '';
        switch(item.like) {
            case '0':
                dark = "ic-bri-like-nor.png";
                light = "ic-dar-like-nor.png";
                on = "ic-like-foc.png";
                subText = "평가를 남겨주세요";
            break;
            case 'up':
                dark = "ic-bri-like-sel.png";
                light = "ic-dar-like-sel.png";
                on = "ic-like-sel-foc.png";
                subText = "좋아요";
            break;
            case 'down':
                dark = "ic-bri-dislike-sel.png";
                light = "ic-dar-dislike-sel.png";
                on = "ic-dislike-sel-foc.png";
                subText = "별로예요";
            break;
            default:break;
        }
        return (
            <div className="reviewBox">
                <div className="reviewLogoArea">
                    <span className="myAppraisalText">평가하기</span>
                </div>
                <div className="topText">
                    <span className={`iconStar ${item.like}`}>
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/${dark}`} alt="" className="dark" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/${light}`} alt="" className="light" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/${on}`} alt="" className="on" />
                    </span>
                </div>
                <div className="botText">
                    <div className="subText">
                        {subText}
                    </div>
                </div>
            </div>
        )
    }
}

class SynopReviewBtv extends React.Component {
    render() {
        const { btv_pnt_info } = this.props.item;
        const logoOff1 = '/synopsis/ic-btv-logo.png';
        const logoOff2 = '/synopsis/ic-btv-logo-light.png';
        const logoOn = '/synopsis/ic-btv-logo-on.png';
        return (
            <div className="reviewBox">
                <div className="reviewLogoArea">
                    <span className="iconLogo">
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoOff1}`} className="dark" alt="" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoOff2}`} className="light" alt="" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoOn}`} className="on" alt="" />
                    </span>
                </div>
                <div className="topText">
                    <span className="iconStar">
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-combined-shape-mini.png`} alt="" className="dark" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-combined-shape-mini-light.png`} alt=""className="light"  />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-combined-shape-mini-on.png`} className="on" alt="" />
                    </span>
                    <span className="scoreNum">{_.isEmpty(btv_pnt_info.btv_like_rate)?0:btv_pnt_info.btv_like_rate}</span><span className="percent">%</span>
                </div>
                <div className="botText">
                    <div className="subText">
                        <NumberFormat value={btv_pnt_info.btv_like_ncnt} /> 명
                    </div>
                </div>
            </div>
        )
    }
}

class SynopReviewGrade extends React.Component {
    render() {
        const { item } = this.props;
        let logoDark, logoLight, logoOn = null;
        switch (item.site_cd) {
            case '10':
                logoDark = '/synopsis/ic-sn21-logo.png';
                logoLight = '/synopsis/ic-sn21-logo-light.png';
                logoOn = '/synopsis/ic-sn21-logo-on.png';
                break;
            case '20':
                logoDark = '/synopsis/ic-watcha-logo.png';
                logoLight = '/synopsis/ic-watcha-logo-light.png';
                logoOn = '/synopsis/ic-watcha-logo-on.png';
                break;
            default: break;
        }
        return (
            <div className="reviewBox">
                <div className="reviewLogoArea">
                    <span className="iconLogo">
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoDark}`} className="dark" alt="" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoLight}`} className="light" alt="" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoOn}`} className="on" alt="" />
                    </span>
                </div>
                <div className="topText">
                    <span className="iconStar">
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-scorestar-mini.png`} alt="" className="dark" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-scorestar-mini-light.png`} alt=""className="light"  />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-scorestar-mini-on.png`} className="on" alt="" />
                    </span>
                    <span className="scoreNum">{item.avg_pnt}
                        {
                            item.site_cd === '10' || item.site_cd === '20' ?
                                <span className="scoreSmall">/{item.bas_pnt}</span>
                                :
                                <span className="percent">%</span>
                        }
                    </span>
                </div>
                <div className="botText">
                    <div className="subText">
                        <NumberFormat value={item.review_cnt} /> 명
                    </div>
                </div>
            </div>
        )
    }
}

class SynopReviewReview extends React.Component {
    render() {
        const { item } = this.props;
        let logoDark, logoLight, logoOn = null;
        switch (item.site_cd) {
            case '10':
                logoDark = '/synopsis/ic-sn21-logo-mini.png';
                logoLight = '/synopsis/ic-sn21-logo-mini-light.png';
                logoOn = '/synopsis/ic-sn21-logo-mini-on.png';
                break;
            case '20':
                logoDark = '/synopsis/ic-watcha-logo-mini.png';
                logoLight = '/synopsis/ic-watcha-logo-mini-light.png';
                logoOn = '/synopsis/ic-watcha-logo-mini-on.png';
                break;
            default: break;
        }
        return (
            <div className="reviewBox">
                <div className="commentUserArea">
                    <span className="cmtUser">{item.prs_nm}</span>
                    <span className="bar"></span>
                    <span className="scoreNum2">
                        <span className="iconStarSmall">
                            <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-reviewstar-mini.png`} className="dark" alt="" />
                            <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-reviewstar-mini-light.png`} className="light" alt="" />
                            <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/ic-reviewstar-mini-on.png`} className="on" alt="" />
                        </span>
                        {item.pnt}
                    </span>
                </div>
                <div className="topText">
                    <div className="reviewTextWrap">
                        <p style={{ 'WebkitBoxOrient': 'vertical' }}>{item.review_ctsc}</p>
                    </div>
                </div>
                <div className="botText">
                    <span className="iconLogo">
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoDark}`} alt="" className="dark" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoLight}`} alt="" className="light" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${logoOn}`} className="on" alt=""/>
                    </span>
                </div>
            </div>
        )
    }
}

export default G2NaviSlideReview;