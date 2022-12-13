import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';
import appConfig from './../../../config/app-config';


class G2SlideMyVOD extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.TALL;

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
        const { onKeyDown} = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(evt);
        }
    }

    onSelect = () => {
        const { onSelect, epsdId, title, srisId, menuId, allMenu, onSelectMenu, epsdRsluId } = this.props;
        if (allMenu) {
            onSelectMenu();
        } else {
            onSelect({epsdId, title, srisId, menuId, epsdRsluId});
        }
    }

    render() {
        const { title, imgURL, bFirst, allMenu, bLast, rate: watchingRate } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused? 'csFocus focusOn': 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        const programTitle = title? title: '';

        const defaultImg = allMenu? '': appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';

        return (
            <div className={`slide${allMenu? ' first':''}`} >
                <div className={focusClass}>
                    <img src={img} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/>
                    { title? <span className="slideTitle">{programTitle}</span>: ''}
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

export default G2SlideMyVOD;