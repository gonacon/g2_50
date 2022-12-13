import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
import Utils from 'Util/utils';
import appConfig from '../../../config/app-config';

class G2SlideRecommendVOD extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.RECOMMEND_VOD;

        this.state = {
            focused: false
        };
    }

    static defaultProps = {
        title: '',
        imgURL: '',
        bAdult: false,
        espdId: '',
        srisId: ''
    }

    render() {
        const { title, imgURL, bFirst, bLast } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.props;
        const focusClass = `csFocus${focused? ' focusOn': ''}${bFirst? ' left':''}${bLast? ' right': ''}`;
        
        const slideTitle = title? title: '';
        // const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        return (
            <div className="slide">
                <div className={focusClass}>
                    <span className="imgWrap">
                        <img src={img} width={width} height={height} alt="" />
                    </span>
                    <span className="slideTitle">{slideTitle}</span>
                </div>
            </div>
        );
    }
    
}

export default G2SlideRecommendVOD;