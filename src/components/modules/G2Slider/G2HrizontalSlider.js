import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';
import { isEmpty } from 'lodash';
import appConfig from './../../../config/app-config';


class G2NaviSlideMyVOD extends Component {
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

    getBadgeImage = badgeCode => {
        switch (badgeCode) {
            case 'sale': return 'sale';
            case 'event': return 'event-nor';
            case 'new': return 'new';
            case 'free': return 'free';
            case 'up': return 'up';
            case 'rest': return 'cancel';
            case 'monopoly': return 'monopoly';
            case 'hdr': return 'uhd-hdr';
            case 'uhd': return 'uhd';
            default: break;
        }
    }



    render() {
        const { title, imgURL, bFirst, allMenu, bLast, rate: watchingRate, badge } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.state;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        // const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
        // const img = `${appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hor_pre_size}${imgURL}`;
        // const img = `${appConfig.headEnd.IMAGE.url + width+'_'+ height}${imgURL}`;
        const img = `${Utils.getIipImageUrl(width, height)}${imgURL}`;
        const programTitle = title ? title : '';
        let slideTitle = `${this.props.type === 'SYNOPSHORT' || this.props.type === 'SYNOPSERIES' ? 'videoText' : 'slideTitle'}`;
        let display = 'block';  //  idx > 7 ? 'none' : 'block';
        let style = { display };
        return (
            <div className={`slide${allMenu ? ' first' : ''}`} onClick={this.onFocused} style={style}>
                <div className={focusClass}>
                    <span className="imgWrap">
                        <img src={img} width={width} height={height} alt="" onError={(e) => e.target.src=`${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-land.png'`} />
                        { isEmpty(this.getBadgeImage(badge)) ? '' : 
                            <span className="flagWrap">
                                <img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-${this.getBadgeImage(badge)}.png`} alt="뱃지" />
                            </span>
                        }
                        {
                            watchingRate ? (
                                <div className="loadingBar">
                                    <div className="currentState" style={{ width: `${watchingRate}%` }}></div>
                                </div>
                            ) : null
                        }
                    </span>
                    {title ? <span className={slideTitle}>{programTitle}</span> : ''}
                </div>
            </div>
        );
    }

}

export default G2NaviSlideMyVOD;