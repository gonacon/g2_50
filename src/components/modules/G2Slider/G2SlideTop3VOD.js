import React, { Component } from 'react';
import { SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
import Utils from 'Util/utils';

class G2SlideTop3VOD extends Component {
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
        const { onSelect, espdId, title } = this.props;
        onSelect({espdId, title});
    }

    render() {
        const { title, imgURL } = this.props;
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused? 'csFocus focusOn': 'csFocus';
        const programTitle = title? title: '';
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
        // const img = imgURL;
        return (
            <div className="slide">
				<div className={focusClass} tabIndex="-1">
					<img src={img} alt=""/>
					<span className="slideTitle">{programTitle}</span>
				</div>
			</div>
        )
    }
}

export default G2SlideTop3VOD;