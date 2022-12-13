import React, { Component } from 'react';
import { SlideType } from './SlideInfo';
import Utils from 'Util/utils';
// import appConfig from 'Config/app-config';

class G2MenuBlockSlider extends Component {
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
        const { title, bFirst, allMenu, bLast, images } = this.props;
        const { focused } = this.props;
        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';

        if (bFirst) focusClass += ' left';
        else if (bLast) focusClass += ' right';
        
        let isImg = false;
        // console.log('%c IMAGE', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', images);
        for ( let imgKey in images ) {
            if ( images[imgKey] !== '' ) isImg = true;
        }
        
        return (
            <div className={`slide${allMenu ? ' first' : ''} ${focusClass}`}>
                { isImg ? 
                    <span className="imgWrap">
                        <img src={`${Utils.getImageUrl(Utils.MENU_BLOCK_IMAGE)}${images.on}`} width="100%" height="100%" className="onImage" alt={title} />
                        <img src={`${Utils.getImageUrl(Utils.MENU_BLOCK_IMAGE)}${images.off}`} width="100%" height="100%" className="offImage" alt={title} />
                    </span>
                    :
                    <span className="genreBlockTitle">
                        <span style={{ WebkitBoxOrient: 'vertical' }}>{title}</span>
                    </span>
                }
            </div>
        );
    }

}

export default G2MenuBlockSlider;