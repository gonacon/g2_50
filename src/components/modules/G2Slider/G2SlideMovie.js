import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';

import 'Css/synopsis/SynopShortSpecialMovie.css';
// import '../../../assets/css/routes/synopsis/SynopShortSpecialMovie.css';
import appConfig from './../../../config/app-config';
import Utils from 'Util/utils';


class G2SlideMovie extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.MOVIE;

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
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(evt);
        }
    }

    onSelect = () => {
        const { onSelect, espdId, title, srisId, menuId } = this.props;
        onSelect({ espdId, title, srisId, menuId });
    }

    render() {
        const { title, bFirst, bLast, imgURL } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }

        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
        // const img = appConfig.headEnd.LOCAL_URL + '/tmp/synopsis/img-shortmovie-special-01.png'; // H/E 연동안되서 테스트용 이미지
        const programTitle = title ? title : '';

        return (
            // <Focusable alias="G2SlideMovie" onFocus={this.onFocused} onBlur={this.onBlured} onEnterDown={this.onSelect} onKeyDown={this.onKeyDown}>
            <div className="slide">
                <div className={focusClass}>
                    <img src={img} width={width} height={height} alt="" />
                    {programTitle ? <span className="videoText">{programTitle}<span className="blurImg" style={{ backgroundImage: `url({${appConfig.headEnd.LOCAL_URL}/tmp/synopsis/img-shortmovie-special-01.png})`}}></span></span> : ''}
                </div>
            </div>
            /* </Focusable> */
        );
    }

}

export default G2SlideMovie;