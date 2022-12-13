import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import Utils from '../../../utils/utils';
import appConfig from './../../../config/app-config';
import Img from '../../modules/UI/Img';


class G2NaviSlideSearchMain extends Component {
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
        rate: 0
    }

    render() {
        const { title, imgURL, bFirst, allMenu, bLast, rate: watchingRate } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.props;
        
        const focusClass = `slide csFocus${focused? ' focusOn':''}${bFirst? ' left':''}${bLast? ' right':''}`;
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        // console.log("img : ",img);
        const programTitle = title? title: '';
        const defaultImg = allMenu? '': appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';

        return (
            // <div className="slide csFocus" >
                <div className={focusClass}>
                    {/* <img src={img} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/> */}
                    <Img src={img} width={width} height={height} alt="" />
                    { title? <span className="slideTitle">{programTitle}</span>: ''}
                </div>
            // </div>
        );
    }
    
}

export default G2NaviSlideSearchMain;