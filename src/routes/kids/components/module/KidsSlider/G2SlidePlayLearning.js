import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import appConfig from 'Config/app-config';
import Utils from './../../../../../utils/utils';


class G2KidsPlayLearning extends Component {
    constructor(props) {
        super(props);
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
        const { focImage, norImage, slideType, focused, bFirst, bLast } = this.props;
        const { width, height } = SlideInfo[slideType];
        const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.PLAYLEARNING_LIST);
        
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
          focusClass += ' left';
        } else if (bLast) {
          focusClass += ' right';
        }

        const defaultImg = {
            focImage: appConfig.headEnd.LOCAL_URL + '/common/default/kids_play_nor_default.png',
            norImage: appConfig.headEnd.LOCAL_URL + '/common/default/kids_play_foc_default.png'
        }

        return (
            <div className="slide">
				<div className={`${focusClass}`}>
					<img src={imgUrl + norImage} width={width} height={height} onError={e => e.target.src = defaultImg.norImage} alt="" className="nor"/>
					<img src={imgUrl + focImage} width={width} height={height} onError={e => e.target.src = defaultImg.focImage} alt="" className="foc"/>
				</div>
			</div>
        );
    }
    
}

export default G2KidsPlayLearning;