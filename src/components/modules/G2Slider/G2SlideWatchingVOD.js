import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import Utils from 'Util/utils';
// import appConfig from 'Config/app-config';
import appConfig from './../../../config/app-config';

class G2SlideWatchingVOD extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.WIDE;

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

    onFocused = () => {
        this.setState({
            focused: true
        }, () => {
            const { idx, onFocusChanged } = this.props;
            onFocusChanged(idx);
        })
    }

    onBlured = () => {
        this.setState({
            focused: false
        });
    }

    onKeyDown = (evt) => {
        // console.log('evt:', evt);
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(evt);
        }
    }

    onSelect = () => {
        const { onSelect, espdId, title } = this.props;
        onSelect({espdId, title});
    }

    render() {
        const { title, imgURL, bFirst, bLast, rate: watchingRate } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused?'csFocus focusOn':'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const programTitle = title? title: '';
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        // const img = `${Utils.getIipImageUrl(352, 207)}${imgURL}`;
        const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
        //const img = imgURL;
        return (
            <div className="slide">
                <div className={focusClass}>
                    <img src={img} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/>
                    { title? <span className="programTitle">{programTitle}</span>: ''}
                    { 
                        watchingRate? (
                            <div className="loadingBar">
                                <div className="currentState" style={{width: `${watchingRate}%`}}></div>
                            </div>
                        ): null
                    }
                </div>
            </div>
        );
    }
    
}

export default G2SlideWatchingVOD;