import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';
import appConfig from './../../../config/app-config';
import Img from 'Module/UI/Img';


class G2SlideRecentVOD extends Component {
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
        });
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
        const { onSelect, epsdId, title, srisId, epsdRsluId } = this.props;
        onSelect({epsdId, title, srisId, epsdRsluId});
    }

    imgError = (e) => {
        document.querySelector(`#__recentVODerrImg${this.props.idx}`).style.display = 'block';
        e.target.style.display = 'none';
    }

    render() {
        const { title, imgURL, bFirst, bLast, rate: watchingRate, idx, bAdult, focused } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        let focusClass = focused?'csFocus focusOn':'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const programTitle = title? title: '';
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
        const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/default/thumbnail-default-land.png';
        return (
            <div className="slide">
                <div className={focusClass}>
                    {/* <img src={img} width={width} height={height} alt="" onError={this.imgError}/>
                    <img src={defaultImg} width={width} height={height} alt="" id={`__recentVODerrImg${idx}`} style={{display: 'none'}} /> */}
                    <Img src={img} width={width} height={height} adultLevelCode={bAdult} type={this.slideType} />
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

export default G2SlideRecentVOD;