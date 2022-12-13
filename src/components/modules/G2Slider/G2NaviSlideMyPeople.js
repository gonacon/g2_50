import React, { Component, Fragment } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import appConfig from 'Config/app-config';
// import _ from 'lodash';
import Utils from '../../../utils/utils';
import Img from '../../modules/UI/Img';


class G2NaviSlideMyPeople extends Component {
    constructor(props) {
        super(props);

        this.slideType = SlideType[this.props.type];

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

    render() {
        const { imgURL, bFirst, allMenu, bLast, name, cast, part, type } = this.props;
        const { width, height } = SlideInfo[this.slideType];
        const { focused } = this.props;
        const focusClass = `csFocus${focused? ' focusOn':''}${bFirst? ' left':''}${bLast? ' right': ''}`;
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;

        return (
            <div className={`slide ${focusClass}${allMenu ? ' first' : ''}`} onClick={this.onFocused}>
                
                    {
                        (type === SlideType.PEOPLE_NONE || type === SlideType.PEOPLESERIES_NONE) ?
                            <Fragment>
                                <div className="personInfo">
                                    <div className="infoArea">
                                        <span className="infoName" style={{'WebkitBoxOrient':'vertical'}}>{this.props.name}</span>
                                        <span className="infoCast"><span>{this.props.part}</span></span>
                                    </div>
                                </div>
                                <div className="partArea">{this.props.cast}</div>
                            </Fragment>
                            :
                            <Fragment>
                                {/* <img src={img} width={width} height={height} alt="" /> */}
                                <Img src={img} width={width} height={height} />
                                <div className="titleArea">
                                    <span className="actorName">{name}</span>
                                    <span className="subTitle">{part}</span>
                                    <span className="subTitle2">{cast}</span>
                                </div>
                            </Fragment>
                    }
                
            </div>
        );
    }

}

export default G2NaviSlideMyPeople;