import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';

import '../../../assets/css/components/modules/SlideTypeBB.css';
import appConfig from './../../../config/app-config';
import Img from 'Module/UI/Img';

class G2SlideEditableRecentVod extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.EDITABLE_RECENT_VOD;

        this.state = {
            focused: false
        };
    }

    static defaultProps = {
        title: '',
        imgURL: '',
        bAdult: false,
        rate: 0,
        espdId: ''
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps) !== JSON.stringify(this.props);
    }

    // onFocused = () => {
    //     this.setState({
    //         focused: true
    //     }, () => {
    //         const { idx, onFocusChanged } = this.props;
    //         onFocusChanged(idx);
    //     })
    // }

    // onBlured = () => {
    //     this.setState({
    //         focused: false
    //     });
    // }

    // onSelect = () => {
    //     const { onSelect, espdId, title, srisId, menuId } = this.props;
    //     onSelect({espdId, title, srisId, menuId});
    // }

    render() {
        const { title, imgURL, bFirst, bLast, rate: watchingRate, bAdult } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.state;
        let focusClass = focused? 'csFocus focusOn': 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
        const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
        const programTitle = title? title: '';
        return (
                <div className="slide" onClick={this.onFocused}>
                    <div className={focusClass}>
                        {/* <img src={img} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/> */}
                        {/* <img src={`${appConfig.headEnd.LOCAL_URL}/tmp/home_B_01.png`} width={width} height={height} alt=""/> */}
                        <Img src={img} width={width} height={height} adultLevelCode={bAdult} type={this.slideType}/>
                        { title? <span className="programTitle">{programTitle}</span>: ''}
                        { 
                            watchingRate? (
                                <div className="loadingBar">
                                    <div className="currentState" style={{width: `${watchingRate}%`}}></div>
                                </div>
                            ): null
                        }
                    </div>
                    <span className="icDelete"></span>
                </div>
        );
    }
}

export default G2SlideEditableRecentVod;