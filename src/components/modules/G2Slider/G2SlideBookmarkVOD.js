import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';
import 'ComponentCss/modules/SlideTypeAE.css';
import appConfig from './../../../config/app-config';


class G2SlideBookmarkVOD extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.BOOKMARK_VOD;

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
        this.state.focused = true;
        const { idx, onFocusChanged } = this.props;
        onFocusChanged(idx);
    }

    onBlured = () => {
        this.state.focused = false;
    }


    onSelect = () => {
        const { onSelect, epsdId, title, allMenu, onSelectMenu, srisId, epsdRsluId } = this.props;
        if (allMenu) {
            onSelectMenu();
        } else {
            onSelect({epsdId, title, srisId, epsdRsluId});
        }
    }

    render() {
        const { title, imgURL, allMenu, bFirst, bLast, rate: watchingRate, variable, bAdult } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused? 'csFocus focusOn': 'csFocus';

        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const programTitle = title? title: '';

        let img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        if (bAdult) {
            img = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-protection.png`
        }

        const defaultImg = allMenu? '': appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';

        return (
            <div className={`slide${allMenu? ' first': ''}`} onClick={this.onFocused}>
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

export default G2SlideBookmarkVOD;