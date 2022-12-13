import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';

class SliderCharacterHome extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType[this.props.type];

        this.state = {
            focused: false
        };
    }

    static defaultProps = {
        imgURL: '',
    }



    render() {
        const { chrtrFoutImg, chrtrFinImg } = this.props;
        const { height } = SlideInfo[this.slideType];
        const { focused } = this.state;

        // let focusClass = focused? 'csFocus focusOn': 'csFocus';
        // if (bFirst) {
        //     focusClass += ' left';
        // } else if (bLast) {
        //     focusClass += ' right';
        // }
        // const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        // const programTitle = title? title: '';
        // let slideTitle = `${this.props.type === 'SYNOPSHORT'? 'videoText':'slideTitle'}`;

        // const focusClass = `csFocus${focused? ' focusOn':''}`;
        const focusActiveClass = `slide${focused? ' active':''}`;
        const focusContentClass = `focusContent${focused? 'focusOn': ''}`;

        return (
            <div className={focusActiveClass}> {/* clone 이 붙는 경우?*/}
                <div className="csFocusCenter" style={{height }}>
                    <img src={chrtrFoutImg} alt="" />
                    <div className={focusContentClass}>
                        <img src={chrtrFinImg} alt="" />
                            <div className="follwUp">
                                <img src={`${appConfig.headEnd.LOCAL_URL}/kids/character/img-bottom-gradient.png`} alt="" />
                                <div className="follwUpCon">
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default SliderCharacterHome;