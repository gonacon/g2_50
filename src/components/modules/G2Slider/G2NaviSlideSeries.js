import React, { Component, Fragment } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';

// component
import NumberFormat from '../UI/NumberFormat';
import Utils from '../../../utils/utils';
import Img from '../../modules/UI/Img';
import _ from 'lodash';


class G2NaviSlideSeries extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType[this.props.type];

        this.state = {
            focused: false
        };
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps) !== JSON.stringify(this.props);
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
        const { synopInfo, vodInfo, title, imgURL, bFirst, allMenu, bLast, cacbro_yn, espdId } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.props;
        const { seriesPurchase } = synopInfo; // 시리즈 구매여부
        let focusClass = focused? 'csFocus focusOn': 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        let style = null;
        if (this.slideType === 'SYNOPSERIES_INFO_NONE') {
            style = {'WebkitBoxOrient': 'vertical'}
        }
        const img = `${Utils.getIipImageUrl(248, 140)}${imgURL}`;

        let activeText = false;
        if (espdId === synopInfo.epsd_id) {
            activeText = true;
        }
        return (
            <div className={`slide${allMenu? ' first':''}`}>
                <div className={focusClass}>
                    <span className="innerFocus">
                    {
                      this.slideType !== 'SYNOPSERIES_INFO_NONE' &&  
                    //   <img src={img} width={width} height={height} alt=""/>
                        <Img src={img} width={width} height={height} alt="" />
                    }
                    <span className="programTitle">
                        <span className="numText" style={style}>{title}회 {cacbro_yn === 'Y' ? '- 결방':''}</span>
                        {
                            (vodInfo.result === '0000' && espdId === vodInfo.epsd_id && (synopInfo.gstn_yn === 'Y' || seriesPurchase.free.length !== 0 || seriesPurchase.purchase.length !== 0)) &&
                            <span className="progessBar">
                                <span className="proceed" style={{width: vodInfo.watch_rt+'%'}}></span>
                            </span>
                        }
                    </span>
                    
                    <div className="activeText">
                        {   
                            activeText ? (
                                _.isEmpty(synopInfo.products) ?
                                <span className="onlyText">{title}회</span>
                                :
                                cacbro_yn === 'Y' ?
                                <span className="onlyText">결방</span>
                                :
                                synopInfo.gstn_yn === 'Y' || seriesPurchase.free.length !== 0 || Number(synopInfo.products[0].sale_prc_vat) === 0 ?
                                <span className="onlyText">무료보기</span>
                                :
                                seriesPurchase.purchase.length !== 0 ?
                                <span className="onlyText">바로보기</span>
                                :
                                <Fragment>
                                    <span className="buyText">구매</span>
                                    <span className="buyCost">
                                        {/*6/11 '원' span으로 감싸줌*/}
                                        <NumberFormat value={synopInfo.products[0].sale_prc_vat} /><span>원</span>
                                    </span>
                                </Fragment>)
                            :
                            <span className="onlyText">{title}회 {cacbro_yn === 'Y' ? '- 결방':''}</span>
                        }
                    </div>
                    
                    </span>
                </div>
            </div>
        );
    }
    
}

export default G2NaviSlideSeries;