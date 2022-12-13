import { createMarkup, React } from '../../../utils/common';
import '../../../assets/css/routes/synopsis/VODProductClausePop.css';
import PopupPageView from '../../../supporters/PopupPageView.js';
import caluseData from './caluseData.json';
import keyCodes from 'Supporters/keyCodes';

const KEY = keyCodes.Keymap;

class SynopVodProductClausePop extends PopupPageView {
    constructor(props) {
        super(props);

        this.state = {
            scrollTop : 0
        };
    }
    
    onKeyDown = (e) => {
        if (e.keyCode === KEY.BACK_SPACE || e.keyCode === KEY.PC_BACK_SPACE) {
            this.props.callback(this);
            return true;
        }
        if (e.keyCode === KEY.UP || e.keyCode === KEY.DOWN) {
            const { scrollTop } = this.state;
            const bgContentHeight = this.contentInfo.clientHeight; //전체 contents 높이
            const contentHeight = this.innerContentInfo.clientHeight; //화면에 보여지는 contennt
            const barBgHeight = this.scrollBarBG.clientHeight;
            const barHeight = this.scrollBar.clientHeight;
            
            let diff = 0;
            if (e.keyCode === KEY.UP) {
                diff = -80;
            } else {
                diff = +80;
            }

            this.innerContentInfo.scrollTop += diff;
            
            let scrollCount = (bgContentHeight - contentHeight) / diff;
            let scrollHeight = (barBgHeight - barHeight) / scrollCount;;
            
            let scrollY = scrollTop + scrollHeight;
            if ((barBgHeight - barHeight) > scrollY) {
                scrollY = scrollY < 0 ? 0 : scrollY;
            } else {
                scrollY = (barBgHeight - barHeight);
            }
            if(this.innerContentInfo.scrollTop !== 0 || scrollY === 0) {
                this.setState({
                    scrollTop : scrollY
                });
            }
        }
    }

    render() {
        const { scrollTop } = this.state;
        const scrollBarStyle = { minHeight: '60px', top: `${scrollTop}px` };
        const contentTextStyle = {color:"#fff"}
        const themeClass = this.paramData.darkTheme === true ? "contentPop VODProduct dark" : "contentPop VODProduct";
        return (
            <div className={themeClass}>
                <div className="mainBg"><span className="bgColor"></span></div>
                <div className="innerContentPop">
                    <div className="innerContentInfo" tabIndex="0" ref={r => this.innerContentInfo = r}>
                        <div className="contentInfo" ref={r => this.contentInfo = r}>
                            <span className="contentText" style={contentTextStyle} dangerouslySetInnerHTML={createMarkup(caluseData.clause)}></span>
                        </div>
                    </div>
                    <span className="scrollBarBox">
                        <div className="innerScrollBarBox">
                            <span className="scrollBar" style={scrollBarStyle} ref={r => this.scrollBar = r}></span>
                            <span className="scrollBarBG" ref={r => this.scrollBarBG = r}></span>
                        </div>
                    </span>
                </div>
                <div className="keyWrap">
                    <span className="btnKeyPrev">닫기</span>
                </div>
            </div>
        )
    }
}

export default SynopVodProductClausePop;