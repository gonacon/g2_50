import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';
import Utils from '../../../utils/utils';
import appConfig from './../../../config/app-config';

class G2SlideEditableBookmarkVOD extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.TALL;

        this.state = {
            focused: false,
            isTextOver: false
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

    onSelect = () => {        
        const { onSelect, espdId, title, srisId, menuId } = this.props;
        onSelect({espdId, title, srisId, menuId});
    }

    setTextOver(){
        const { width } = SlideInfo[this.slideType];
        let { isTextOver } = this.state;
        let { bFirst, bLast } = this.props;
        if(!this.titBox) return;
        
        if( !bFirst && !bLast ) return;
        if( this.titBox.clientWidth > width && isTextOver !== true ){
            isTextOver = true;
            this.setState({...this.state, isTextOver });
        }
    }

    componentDidMount() {
        this.setTextOver();
    }

    componentDidUpdate() {
        this.setTextOver();
    }

    render() {
        const { title, imgURL, bFirst, bLast, bAdult, rate: watchingRate } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { isTextOver } = this.state;
        const { focused } = this.props;
        let focusClass = focused? 'csFocus focusOn': 'csFocus';
        let textOver = isTextOver ? ' textOver' : '';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        const img =  bAdult ? appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-protection.png' : `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        const programTitle = title? title: '';
        return (
            // <Focusable onFocus={this.onFocused} onBlur={this.onBlured} onEnterDown={this.onSelect}>
                <div className="slide" onClick={this.onFocused}>
                    <div className={`${focusClass} ${textOver}`}>
                        <img src={img} width={width} height={height} alt=""/>
                        {/* <img src={`${appConfig.headEnd.LOCAL_URL}/tmp/home_B_01.png`} width={width} height={height} alt=""/> */}
                        
                        { title? <span ref={r => this.titBox = r} className="slideTitle">{programTitle}</span>: ''}
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
            /* </Focusable> */
        );
    }
}

export default G2SlideEditableBookmarkVOD;