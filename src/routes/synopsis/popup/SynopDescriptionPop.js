import { React } from '../../../utils/common';
import '../../../assets/css/routes/synopsis/SynopDescriptionPop.css';
import PopupPageView from 'Supporters/PopupPageView';
// import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';

// utils
import _ from 'lodash';
import Utils from '../../../utils/utils';
import appConfig from 'Config/app-config';

const { Keymap: { UP, DOWN, BACK_SPACE, PC_BACK_SPACE } } = keyCode;

class SynopDescriptionPop extends PopupPageView {
    constructor(props) {
        super(props);

        this.state = {
            scrollTop: 0,
            scrollBarHeight: 0,
            ynScroll: true
        };
    }

    componentDidMount() {
        const contentHeight = this.innerContentInfo.clientHeight; // content 보여지는 높이
        const bgContentHeight = this.contentInfo.clientHeight; // 전체 content 높이
        if (bgContentHeight < contentHeight) { // 스크롤바 없애기
            this.setState({
                ynScroll: false
            });
        }
    }

    onKeyDown(e) {
        if (e.keyCode === BACK_SPACE || e.keyCode === PC_BACK_SPACE) {
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
        const { data } = this.props;
        const { scrollTop, ynScroll } = this.state;
        const scrollbarStyle = { minHeight: '60px', top: `${scrollTop}px` };
        const bgImg = `${_.isEmpty(data.bg_img_path) ? appConfig.headEnd.LOCAL_URL + '/synopsis/bg-synopsis-default.png' : Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + data.bg_img_path}`;
        let darkClass = _.isEmpty(data.bg_img_path) ? " default" : "";
        darkClass += data.dark_img_yn === 'N' ? "" : " dark";
        console.log('data.movieNum', data.movieNum);
        return (
			// 6/12 popBgBlur class 추가
            <div className={`contentPop${darkClass} popBgBlur`}>
                <div className="mainBg"><img src={bgImg} alt="" /></div>
                <div className="innerContentPop">
                    <div className="innerContentInfo" tabIndex="0" ref={r => this.innerContentInfo = r}>
                        <div className="contentInfo" ref={r => this.contentInfo = r}>
                            <span className="title">
                                <span className="subtitle">
                                    {data.season}
                                </span>
                                {data.title}
                            </span>
                            <span className="contentText">{data.content}</span>
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

export default SynopDescriptionPop;