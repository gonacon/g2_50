import React, { Component } from 'react';
import Utils from './../../../../../utils/utils';
import { isEmpty, isEqual } from 'lodash';
import appConfig from './../../../../../config/app-config';
import { kidsConfigs } from '../../../config/kids-config';

// const KIDS_HOME_FLAG_IMAGE = {
//     BTV: {
//         fIn: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-btv-full-nor.png',
//         fout: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-btv-nor.png'
//     },
//     EVENT: {
//         fIn: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-event-full-nor.png',
//         fout: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-event-nor.png'
//     },
//     NEW: {
//         fIn: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-new-full-nor.png',
//         // fout: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-new.png' // img-tag-new.nor 이미지 없음
//         fout: '' // img-tag-new.nor 이미지 없음
//     },
//     UP: {
//         fIn: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-up-full-nor.png',
//         fout: appConfig.headEnd.LOCAL_UPDATE_URL + '/img-tag-up-nor.png'
//     }
// }

const CHART_DEFAULT_IMAGE = {
    CHART: {
        fin: appConfig.headEnd.LOCAL_URL + '/common/default/kids_character_foc_default.png',
        fout: appConfig.headEnd.LOCAL_URL + '/common/default/kids_character_default_nor_default.png'
    },
    CHART_ALL: {
        fin: appConfig.headEnd.LOCAL_URL + '/common/default/kids_character_foc_default.png',
        fout: appConfig.headEnd.LOCAL_URL + '/common/default/kids_character_default_nor_default.png'
    }
}

class G2SlideCharaterHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bAnimation: false,
        };

        this.timer = 0;
    }

    static defaultProps = {
        idx: -1,
        focused: false,
        characterInfo: null,
        height: 633
    };

    getFlagImageInfo = (image, type) => {
        let resultInfo = { image: '', class: '' };

        if (image.toUpperCase().indexOf('BTV') > -1) {
            // resultInfo.image = KIDS_HOME_FLAG_IMAGE.BTV[type];
            resultInfo.class = 'btv';
        } else if (image.toUpperCase().indexOf('EVENT') > -1) {
            // resultInfo.image = KIDS_HOME_FLAG_IMAGE.EVENT[type];
            resultInfo.class = 'event';
        } else if (image.toUpperCase().indexOf('NEW') > -1) {
            // resultInfo.image = KIDS_HOME_FLAG_IMAGE.NEW[type];
            resultInfo.class = 'new';
        } else if (image.toUpperCase().indexOf('UP') > -1) {
            // resultInfo.image = KIDS_HOME_FLAG_IMAGE.UP[type];
            resultInfo.class = 'update';
        }
        resultInfo.image = appConfig.headEnd.LOCAL_UPDATE_URL + '/' + image;
        return resultInfo;
    }

    render() {
        const { content, focused, idx, clone } = this.props;
        const flagFinInfo = this.getFlagImageInfo(content.chrtrflagInImg, 'fIn');
        const flagFoutInfo = this.getFlagImageInfo(content.chrtrflagOutImg, 'fout');

        const focusInImg = content.callTypCd !== 'All' ? Utils.getImageUrl(Utils.IMAGE_KIDS.CHARACTER_HOME_FOCUS_IN) + `${content.chrtrFinImg}` : appConfig.headEnd.LOCAL_URL + '/kids/character/img-character-all-foc.png';
        const focusOutImg = content.callTypCd !== 'All' ? Utils.getImageUrl(Utils.IMAGE_KIDS.CHARACTER_HOME_FOCUS_OUT) + `${content.chrtrFoutImg}` : appConfig.headEnd.LOCAL_URL + '/kids/character/img-character-all-nor.png';

        let default_finImg = isEmpty(content.callTypCd) ? CHART_DEFAULT_IMAGE.CHART.fin :
            isEqual(content.chrtrNm, '캐릭터전체보기') ? CHART_DEFAULT_IMAGE.CHART_ALL.fin : CHART_DEFAULT_IMAGE.CHART.fin;
        let default_foutImg = isEmpty(content.callTypCd) ? CHART_DEFAULT_IMAGE.CHART.fout :
            isEqual(content.chrtrNm, '캐릭터전체보기') ? CHART_DEFAULT_IMAGE.CHART_ALL.fout : CHART_DEFAULT_IMAGE.CHART.fout;

        const className = {
            slide: `slide${focused ? ' active' : ''}${clone ? ' clone' : ''}`,
            csFocusCenter_defaultFocus: `${idx === (kidsConfigs.SLIDE_TO.CHARACTER * 2) - 4 ? ' defaultFocus' : ''}`,
            csFocusCenter_focusOn: `${focused ? ' focusOn' : ''}`
        }

        return (
            <div className={className.slide} data-index={idx}>
                <div className={`csFocusCenter${className.csFocusCenter_defaultFocus}${className.csFocusCenter_focusOn}`}>
                    <img src={focusOutImg} alt="" onError={e => e.target.src = default_foutImg} />
                    {content.callTypCd !== 'All' ? <img src={flagFoutInfo.image} className={flagFoutInfo.class} alt="" /> : ''}

                    <div className="focusContent">
                        <img src={focusInImg} alt="" onError={e => e.target.src = default_finImg} />
                        {content.callTypCd !== 'All' ? <img src={flagFinInfo.image} className={flagFinInfo.class} alt="" /> : ''}

                        {
                            !isEmpty(content.lastWatchInfo) &&
                                <div className="follwUp">
                                    <img src={`${appConfig.headEnd.LOCAL_URL}/kids/character/img-bottom-gradient.png`} alt="" />
                                    <div className="follwUpCon">
                                        <img src={Utils.getImageUrl(Utils.IMAGE_KIDS.CHARACTER_LASTWATCH) + `${content.lastWatchInfo.thumbnail}`} alt="" />
                                        <div className="follwUpText">
                                            <span>이어보기</span>
                                            <div className="title">{content.lastWatchInfo.title}</div>
                                            <span className="follwUpGo">바로가기</span>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default G2SlideCharaterHome;