// commons
import React, { Component } from 'react';
import keyCodes from 'Supporters/keyCodes';
// import { Core } from 'Supporters';

// style
import 'Css/myBtv/purchase/CommerceProductClausePop.css';

// utils
import { newlineToBr } from 'Util/utils';
import appConfig from 'Config/app-config';

const { Keymap: { UP, DOWN, BACK_SPACE, PC_BACK_SPACE } } = keyCodes;

class TermsPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollPosY: 0,
            scrollBarHeight: 0,
            scrollVisible: true,
        };
    }

    setScrollBarHeight = () => {
        const { scrollHeight, clientHeight: height } = this.innerContentInfo;
        const barHeight = this.barBg.clientHeight;
        const scrollBarHeight = Math.floor((barHeight * height) / scrollHeight);
        console.log('%c scrollBarHeight', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', scrollBarHeight);
        // const scrollVisible = barHeight < height ? true : false;

        this.setState({
            scrollBarHeight,
            // scrollVisible
        });
    }

    scrollKeyDown = (evt) => {
        if ( evt.keyCode === UP || evt.keyCode === DOWN ) {
            const { scrollTop, scrollHeight } = this.innerContentInfo;
            const barBgHeight = this.barBg.clientHeight;
            const barHeight = this.bar.clientHeight;
            
            // 스크롤 위치 오차
            let diff = 0;
            if ( evt.keyCode === DOWN ) diff = +80;
            else if ( evt.keyCode === UP ) diff = -80;
            
            let scrollPosY = Math.floor(((scrollTop + diff) * barBgHeight) / scrollHeight);

            if ( scrollPosY >= (barBgHeight - barHeight) ) {
                // 최대값
                scrollPosY = barBgHeight - barHeight;
            } else if ( scrollPosY <= 0 ) {
                // 최소값
                scrollPosY = 0;
            }
            this.setState({ scrollPosY });
        }
    }

    componentDidMount() {
        this.innerContentInfo.focus();
        this.setScrollBarHeight();
    }

    render() {
        const { scrollPosY, scrollBarHeight, scrollVisible } = this.state;
        const { clause } = this.props;
        let text = newlineToBr(clause.exps_phrs_ctsc);
		const title = clause.exps_phrs_title;
        const scrollBarStyle = {height: `${scrollBarHeight}px`, minHeight: '60px', top: `${scrollPosY}px`};

        return (
            <div className="contentPop CommerceProduct">
				<div className="mainBg"><img src="/assets/images/common/bg/bg_popup.png" alt="배경"/></div>
                <div className="innerContentPop">
                    <div className="innerContentInfo"
                         tabIndex="0"
                         onKeyDown={this.scrollKeyDown}
                         ref={r => this.innerContentInfo = r}
                    >
                        <div className="contentInfo">
                            <span className="contentText">
                                {title}<br/><br/>{text}
                            </span>
                        </div>
                    </div>
                    <span className="scrollBarBox" style={{ display: scrollVisible ? 'block' : 'none' }}>
                        <div className="innerScrollBarBox">
                            <span className="scrollBar"
                                  ref={r => this.bar = r}
                                  style={scrollBarStyle}
                            />
                            <span className="scrollBarBG" ref={r => this.barBg = r} />
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

export default TermsPopup;