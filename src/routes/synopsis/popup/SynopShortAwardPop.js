// common
import React from 'react';
import { createMarkup } from '../../../utils/common';
import PopupPageView from 'Supporters/PopupPageView';
import keyCode from 'Supporters/keyCodes';

// utils
import synopAPI from '../api/synopAPI';
import _ from 'lodash';
import Utils from '../../../utils/utils';

// css
import '../../../assets/css/routes/synopsis/SynopShortAwardPop.css';
import appConfig from 'Config/app-config';

const { Keymap: { UP, DOWN, BACK_SPACE, PC_BACK_SPACE } } = keyCode;
class SynopShortAwardPop extends PopupPageView {
    constructor(props) {
        super(props);

        this.state = {
            reviewInfo: {
                menus: {
                    prize_history: []
                }
            },
            scrollTop: 0,
            scrollBarHeight: 0,
            ynScroll: true
        }
    }

    componentWillMount() {

    }


    componentDidMount() {
        const { data } = this.props;
        this.setAPIcall(data).then(result => {
            this.setState({
                reviewInfo: result
            });

            const contentHeight = this.innerContentInfo.clientHeight; // content 보여지는 높이
            const bgContentHeight = this.contentInfo.clientHeight; // 전체 content 높이
            let ynScroll = true;
            if (bgContentHeight < contentHeight) { // 스크롤바 없애기
                this.setState({
                    ynScroll: false
                });
            }
        });
    }

    setAPIcall = (param) => {
        let paramData = {
            sris_id: param.sris_id,
            site_cd: param.site_cd,
            page_no: '1',
            page_cnt: '2',
            type: param.type
        }
        return synopAPI.xpg008(paramData).then(result => {
            if (_.isEmpty(result)) {
                this.props.callback(this);
            } else {
                return result;
            }
        });
    }

    onKeyDown(e) {
        if (e.keyCode === PC_BACK_SPACE || e.keyCode === BACK_SPACE) {
            this.props.callback(this);
            return true;
        }
        if ((e.keyCode === UP || e.keyCode === DOWN) && this.state.ynScroll) {
            const { scrollTop } = this.state;
            const contentHeight = this.innerContentInfo.clientHeight; // content 보여지는 높이
            const bgContentHeight = this.contentInfo.clientHeight; // 전체 content 높이
            const barBgHeight = this.barBg.clientHeight; // 전체 스크롤바 높이
            const barHeight = this.bar.clientHeight; // 스크로바 높이

            let diff = 0;
            if (e.keyCode === UP) diff = -80;
            else if (e.keyCode === DOWN) diff = +80;

            this.innerContentInfo.scrollTop += diff;

            let scrollCount = (bgContentHeight - contentHeight) / diff;
            let scrollHeight = (barBgHeight - barHeight) / scrollCount;
            let scrollY = scrollTop + scrollHeight;
            if ((barBgHeight - barHeight) > scrollY) {
                scrollY = scrollY < 0 ? 0 : scrollY;
            } else {
                scrollY = (barBgHeight - barHeight);
            }
            if (this.innerContentInfo.scrollTop !== 0 || scrollY === 0) {
                this.setState({
                    scrollTop: scrollY
                });
            }
        }
    }

    render() {
        const { reviewInfo, scrollTop, ynScroll } = this.state;
        const { data } = this.props;
        const scrollbarStyle = { minHeight: '60px', top: `${scrollTop}px` };
        const bgImg = `${_.isEmpty(data.bg_img_path) ? appConfig.headEnd.LOCAL_URL + '/synopsis/bg-synopsis-default.png' : Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + data.bg_img_path}`;
        let style = {
            backgroundImage: "url(" + bgImg + ")",
            width: '1920px',
            top: '0'
        };
        let darkClass = _.isEmpty(data.bg_img_path) ? " default" : "";
        darkClass += data.dark_img_yn === 'N' ? "" : " dark";

        return (
			// 6/12 popBgBlur class 추가
            <div className={`contentPop award${darkClass} popBgBlur`} style={style} id="SynopShortAwardPop">
                {/* <div className="mainBg"><img src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + this.props.data.bg_img_path} alt="" /></div> */}
                <div className="innerContentPop award">
                    <div className="innerContentInfo" tabIndex="0" ref={r => this.innerContentInfo = r}>
                        <div className="contentInfo" ref={r => this.contentInfo = r}>
                            <span className="title">수상내역</span>
                            <span className="contentText">
                                {
                                    reviewInfo.menus.prize_history.map((item, i) => {
                                        return (
                                            <div className="awardList" key={i}>
                                                <span className="awardTitle">{item.awrdc_nm} ({item.prize_yr})</span>
                                                <div className="awardInfo" dangerouslySetInnerHTML={createMarkup(item.prize_dts_cts)}></div>
                                            </div>
                                        )
                                    })
                                }
                            </span>
                        </div>
                    </div>
                    {
                        ynScroll &&
                        <span className="scrollBarBox">
                            <div className="innerScrollBarBox">
                                <span className="scrollBar" style={scrollbarStyle} ref={r => this.bar = r}></span>
                                <span className="scrollBarBG" ref={r => this.barBg = r}></span>
                            </div>
                        </span>
                    }
                </div>
                <div className="keyWrap">
                    <span className="btnKeyPrev">닫기</span>
                </div>
            </div>
        )
    }

}

export default SynopShortAwardPop;