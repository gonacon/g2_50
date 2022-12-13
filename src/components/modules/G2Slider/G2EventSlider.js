import React, { Component } from 'react';
import { SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
import appConfig from './../../../config/app-config';

class G2EventSlider extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType[this.props.type];
        this.errorImageFlag = true;

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

    imageError = (e) => {
        let imageNames = {
            [SlideType.EVENT]: '1',
            [SlideType.EVENT_COUPLE]: '2',
            [SlideType.EVENT_TRIPLE]: '3',
        }

        if ( this.errorImageFlag ) {
            this.errorImageFlag = false;
            e.target.src = `${appConfig.headEnd.LOCAL_URL}/common/default/event_block_${imageNames[this.slideType]}set_default.png`;
        }
    }

    render() {
        const { title, bFirst, bLast, allMenu, image } = this.props;
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }

        const src = '';  //  appConfig.headEnd.LOCAL_URL + '/tmp/home/event-banner-3.png';

        return (
            <div className={`slide${allMenu ? ' first' : ''} ${focusClass}`}>
                <span className="imgWrapper">
                    <img src={image} alt={title} onError={this.imageError} />
                </span>
            </div>
        );
    }

}

export default G2EventSlider;