import React, { Component } from 'react';
import { SlideType } from './SlideInfo';
// import { Focusable } from 'Navigation';
// import appConfig from 'Config/app-config';

import 'Css/synopsis/SynopShortAppearance.css';


class G2SlideActorText extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType.ACTOR_IMAGE;

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
        const { name, role1, part, bFirst, bLast } = this.props;
        // const { width, height } = SlideInfo[this.slideType];
        // const { focused } = this.state;
        const { focused } = this.props;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }
        return (
            <div className="slide" onClick={this.onFocused}>
                <div className={focusClass}>
                    <div className="personInfo">
                        <div className="infoArea">
                            <span className="infoName">{name}</span> 
                            <span className="infoCast">{role1}</span>
                        </div>
                    </div>
                    <span className="part">{part}</span>
                </div>
            </div>
        );
    }

}

export default G2SlideActorText;