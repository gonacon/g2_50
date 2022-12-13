import React, { Component } from 'react';
import Utils from 'Util/utils';
import appConfig from 'Config/app-config';
import StbInterface from 'Supporters/stbInterface';
import constants, { STB_PROP } from 'Config/constants';
import { SlideInfo } from 'Module/G2Slider';

const defaultProps = {
    className: '',
    style: '',
    src: '',
    alt: '',
    //type 'vrt' vertical / horizontal
}

class Img extends Component {
    constructor(props) {
        super(props);

        this.state = {
            className: this.props.className,
            style: this.props.style,
            src: this.props.src,
            width: this.props.width,
            height: this.props.height,
            alt: this.props.alt,
            type: this.props.type,
            adultLevelCode: this.props.adultLevelCode   // 핑크,에로스 코드
        }
    }

    componentWillMount() {
        
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps) !== JSON.stringify(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            this.setState({
                className: nextProps.className,
                style: nextProps.style,
                src: nextProps.src,
                width: nextProps.width,
                height: nextProps.height,
                alt: nextProps.alt,
                type: nextProps.type,
                adultLevelCode: nextProps.adultLevelCode
            });
        }
    }


    render() {
        const {
            className, style, src, width, height, alt, type, adultLevelCode
        } = this.state;
        // console.log('셋톱 시청연령 셋팅', StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT));
        // const stbLevel = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);
        // console.log('%$%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',src, adultLevelCode);
        // let blockType = '';
        let blockType = 'vrt';
        if(type) {
            const slideType = SlideInfo[type];
            const slideHeight = slideType.height;
            const slideWidth = slideType.width;

            if(slideWidth > slideHeight){
                blockType = 'hzr';
            }
        }
        
        const level = appConfig.STBInfo.level
        const defaultImage = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-${blockType === 'vrt' ? 'land':'port'}.png`;
        const ageLimitImage = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-protection.png`;
        let isAdult = (adultLevelCode === '03' || adultLevelCode === '01' || adultLevelCode === 'Y' || adultLevelCode === true);

        return (
            <img
                className={className}
                style={style}
                src={isAdult ? ageLimitImage : src}
                width={width}
                height={height}
                onError={(e) => e.target.src = defaultImage}
                alt={alt}
            />
        );
    }
}

export default Img; 
