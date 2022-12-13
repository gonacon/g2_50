import React, { Fragment, Component } from 'react';
import PageView from 'Supporters/PageView';
import appConfig from 'Config/app-config';
import constants from 'Config/constants';
import FM from 'Supporters/navi';
import STB from 'Supporters/stbInterface';
import Utils, { scroll } from 'Util/utils';
import keyCodes from 'Supporters/keyCodes';

import AEDSlider, { AEDSlideTest } from 'Module/AEDSlider';

const CODE = constants.CODE;
const KEY = keyCodes.Keymap;

const random = () => Math.floor(Math.random() * 256);

class AEDSliderTest extends PageView {
    constructor(props) {
        console.error('여기')
        super(props);

        this.state = {
            isScrollDown: false,

            points: null,
            blocks: [],
        };

        this.gnbTypeCode = null;
        this.menuId = null;

        this.declareFocusList([
            { key: 'gnbMenu', fm: null },
            { key: 'testSlide', fm: null },
            { key: 'topButton', fm: null },
        ]);

        this.colorList = [];
        for (let i = 0; i < 30; i++) {
            this.colorList.push(`rgb(${random()}, ${random()}, ${random()})`);
        }
    }

    static defaultProps = {

    }

    initFocus = () => {
        const topFm = new FM({
            id: 'topButton',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onBtnTopKeydown
        });
        this.setFm('topButton', topFm);
    }

    setDefaultFocus = () => {
        // 일단  gnb 로 설정.
        setTimeout(() => {
            this.setFocus('gnbMenu', 2);
        }, 1);
    }

    onBtnTopKeydown = (event) => {
        if (event.keyCode === KEY.ENTER) {
            this.loadNextBlockPage();
        }
    }

    componentDidMount() {
        document.querySelector('#root > .wrapper').style = 'position: absolute; width: 1920px; height: 1080px;';
        window.SWEAT = this;

        this.initFocus();
        const {
            data: {
                menuId,
                // gnbTypeCode,
                gnbFm
            }
        } = this.props;

        // gnb fm이 있으면 설정.
        if (gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        // menuId 가 있으면 block 정보 업데이트.
        if (menuId) {
            this.update(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            data: {
                menuId: prevMenuId,
                gnbTypeCode: prevGnbTypeCode
            }
        } = this.props;
        const {
            data: {
                menuId,
                gnbTypeCode,
                gnbFm
            }
        } = nextProps;

        // gnb fm이 있으면 설정.
        const prevGnbFm = this.getFocusInfo('gnbMenu');
        if (!prevGnbFm && gnbFm) {
            this.setFm('gnbMenu', gnbFm);
            this.setDefaultFocus();
        }

        if (menuId && (prevMenuId !== menuId || prevGnbTypeCode !== gnbTypeCode)) {
            this.update(nextProps);
        }
    }

    render() {
        const {
            isScrollDown,
        } = this.state;

        const contentContainerStyle = {
            height: 500,
            //overflowY: 'hidden'
            //  border: 'solid 1px #F00',
        }

        return (
            <div className="wrap" ref={r => this.wrapper = r}>
                <div className="mainBg">
                    {/* <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver${(isScrollDown || this.gnbTypeCode !== CODE.GNB_HOME) ? '' : '_pip'}.png`} alt="배경이미지"/> */}
                    <img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} alt="배경이미지" />
                </div>
                <div style={{ width: '100%', height: 300 }} />
                <div style={contentContainerStyle} >
                    <div ref={r => this.scrollContainer = r} className="home scrollWrap">
                        <AEDSlider
                            id="testSlide"
                            setFm={this.setFm}
                            maxItem={4}
                            type={'AEDSlideTest'}
                        >
                            {new Array(30).fill(0).map((n, idx) => {
                                return <AEDSlideTest key={idx} title={`타이틀_${idx}`} color={this.colorList[idx]} />
                            })}
                        </AEDSlider>
                    </div>
                </div>

                <div className="contentGroup" >
                    <div className="btnTopWrap">
                        <span id="topButton" className="csFocus btnTop" >
                            <span>맨 위로</span>
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}

export default AEDSliderTest;