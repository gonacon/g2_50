import React, { Component } from 'react';
import { HorizontalList, Focusable } from 'Navigation';
import { DIR } from './SlideInfo.js';
// import 'Css/kids/character/CharacterHome.css';
import '../../../../src/assets/css/routes/kids/channel/ChannelHome.css';
import ChannelHomeJson from '../../../assets/json/routes/kids/channel/ChannelHome.json';
import appConfig from './../../../config/app-config';

class G2RotateMenuItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bAnimation: false,
            data: ChannelHomeJson,
        };

        this.timer = 0;
    }

    static defaultProps = {
        idx: -1,
        focused: false,
        characterInfo: null,
        height: 633
    };

    render() {
        const defaultInfo = {
            bg: '',
            focusBg: '',
        };
        const { data } = this.state;
        const { characterInfo, currentIdx, idx, height, pos } = this.props;
        const info = characterInfo ? characterInfo : defaultInfo;

        const { focused } = this.props;
        const focusClass = `csFocus${focused ? ' focusOn' : ''}`;
        const focusActiveClass = `slide${focused ? ' active' : ''}`;
        const focusContentClass = `focusContent${focused ? 'focusOn' : ''}`;
        const csFocusClass = `csFocusCenter${idx === currentIdx ? focused ? ' defaultFocus focusOn' : ' defaultFocus' : ''}`;
        const {
            bg,
            focusBg,
        } = info;

        const itemStyle = {
            flexShrink: 0
        };
        const styles = {
            flexShrink: 0
        }

        if(focused || idx === currentIdx) {
            styles.paddingLeft = 380;
            styles.paddingRight = 380;
        }
        return (
            <div className={focusActiveClass} style={styles}> {/* clone 이 붙는 경우?*/}
                <div className={csFocusClass}>
                    <div className="nor">
                        <span className="wrapImg">
                            <img src={data.slideItem[0].imageN} alt="" />
                        </span>
                        <p className="vodTitle"><span className="num">{idx}</span><span className="title">{data.slideItem[0].vodTitle}</span></p>
                        <p className="channelInfo"><span className="state">{data.slideItem[0].state}</span>{data.slideItem[0].channelTitle}</p>
                    </div>

                    <div className={focusContentClass}>
                        <div className="foc">
                            <span className="wrapImg">
                                <img src={data.slideItem[0].imageF} alt="" />
                            </span>
                            <p className="vodTitle"><span className="num">{data.slideItem[0].channel}</span><span className="title">{data.slideItem[0].vodTitle}</span></p>
                            <p className="channelInfo"><span className="state">{data.slideItem[0].state}</span>{data.slideItem[0].channelTitle}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class KidsRotateSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            currentIdx: 0,
            fakeChildren: null
        };

        this.fakeChildrenList = new Map(); // ref 저장용
    }

    static defaultProps = {
        defaultFocus: 0,
        onSelect: null,
        slideDuration: 100,
        bAnimation: false,
        width: 1830, // 1920,
        height: 633, // 792,
        itemWidth: 332,
        itemHeight: 633,
        maxSlideMenu: 3
    }

    onFocused = (idx) => {
        this.setState({ 
            focused: true, 
            currentIdx: idx
        }, () => {
            this.createFakeElements();
        });
        clearInterval(this.timer);
    }

    onBlured = () => {
        this.setState({ focused: false }, () => {
            this.createFakeElements();
        });
        const { autoPlay } = this.props;
        if (autoPlay) {
            this.timer = setInterval(() => {
                this.slide(DIR.RIGHT);
            }, 3000);
        }
    }

    onEnterDown = () => {
        this.onSelect();
    }

    onKeyDown = (evt) => {
        switch (evt.keyCode) {
            case 39:
                this.slide(DIR.RIGHT);
                break;
            case 37:
                this.slide(DIR.LEFT);
                break;
            default:
                break;
        }
    }

    slide = (dir) => {
        if (dir === DIR.LEFT) {
            const { currentIdx } = this.state;
            const { children } = this.props;
            const realChildren = React.Children.toArray(children);
            let index = currentIdx - 1;
            let bSkipped = false;
            if (index === -1) {
                index = realChildren.length - 1;
                bSkipped = true;
            }
            if (bSkipped) {
                this.setState({
                    currentIdx: realChildren.length,
                    bAnimation: false
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            currentIdx: index,
                            bAnimation: true
                        }, () => {
                            this.createFakeElements();
                        });
                    }, 1);
                });
            } else {
                this.setState({
                    currentIdx: index,
                    bAnimation: true
                }, () => {
                    this.createFakeElements();
                });
            }
        } else {
            const { currentIdx } = this.state;
            const { children } = this.props;
            const realChildren = React.Children.toArray(children);
            let index = currentIdx + 1;
            let bSkipped = false;
            if (index === realChildren.length) {
                index = 0;
                bSkipped = true;
            }
            if (bSkipped) {
                this.setState({
                    currentIdx: -1,
                    bAnimation: false
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            currentIdx: index,
                            bAnimation: true
                        }, () => {
                            this.createFakeElements();
                        });
                    }, 1)
                })
            } else {
                this.setState({
                    currentIdx: index,
                    bAnimation: true
                }, () => {
                    this.createFakeElements();
                });
            }
        }
    }

    onSelect = () => {
        const { onSelect } = this.props;
        if (typeof onSelect === 'function') {
            onSelect(this.state.currentIdx);
        }
    }

    createFakeElements = () => {
        const { children } = this.props;
        const {
            currentIdx,
            focused: containerFocused
        } = this.state;

        const childList = children ? React.Children.toArray(children) : null;
        const cloneList = React.Children.map(childList, (child, idx) => {
            const focused = (containerFocused && idx === currentIdx);
            return React.cloneElement(child, {
                focused,
                currentIdx,
                pos: idx,
                idx,
                key: idx
            });
        });

        if (!childList) {
            this.setState({ fakeChildren: null });
            return;
        }

        // TODO: item 수가 max보다 작은경우 처리
        const { maxSlideMenu } = this.props;
        const neededFakes = Math.ceil(maxSlideMenu / 2);
        const lastIdx = childList.length - 1;
        // head : needed ~ last
        // tail : 0 ~ needed
        const heads = childList.slice(lastIdx - neededFakes, lastIdx);
        const headList = React.Children.map(heads, (child, index) => {
            const pos = -(neededFakes - index);
            const key = -(neededFakes - index);
            const idx = childList.length - (neededFakes - index);
            return React.cloneElement(child, { pos, key, idx });
        });
        const tails = childList.slice(0, neededFakes);
        const tailList = React.Children.map(tails, (child, index) => {
            const pos = childList.length + index;;
            const key = pos;
            const idx = index;
            return React.cloneElement(child, { pos, key, idx });
        });

        const fakeChildren = [];
        fakeChildren.push(...headList);
        fakeChildren.push(...cloneList);
        fakeChildren.push(...tailList);

        this.setState({ fakeChildren });
    }

    componentDidMount() {
        this.createFakeElements();
    }

    componentWillReceiveProps(nextProps) {
        // children 을 JSON.parse 하면 순환구조 오류로 인해 체크 불가.
        // const { children } = this.props;
        // const { children: prevChildren } = nextProps;
        // console.log( 'receive props:', children);
        // if (JSON.stringify(children) !== JSON.stringify(prevChildren)) {
        //     this.createFakeElements();
        // }
        this.createFakeElements();
    }

    getSlideStyle = () => {
        const { width, slideDuration, itemWidth, maxSlideMenu } = this.props;
        const neededFakes = Math.ceil(maxSlideMenu / 2);
        const { currentIdx, bAnimation } = this.state;
        const fakeIdx = currentIdx + neededFakes;
        const x = -(fakeIdx * itemWidth) + -(currentIdx * 28);

        const style = {
            transition: `transform ease-in-out ${bAnimation ? slideDuration : 0}ms`,
            transform: `translateX(${x}px)`,
            paddingLeft: 300// Math.floor( width / 2 ) <== ( item 수가 작은 경우 처리해줘야됨 )
        }
        return style;
    }

    render() {
        const { fakeChildren, focused } = this.state;
        const focusClass = `channelSlideWrap scrollWrap${focused ? ' focus' : ''}`;
        const slideStyle = this.getSlideStyle();

        return (
            <div className="channelWrap">
                <div className="bgWrap"><img src={`${appConfig.headEnd.LOCAL_URL}/kids/channel/bg.png`} alt="" /></div>
                <div className={focusClass} style={{ transform: 'translate(0px, 0px)' }}> {/* 포커스시 focus 추가*/}
                    <div className="contentGroup">
                        <div className="slideWrap">
                            <div className="slideCon">
                                <HorizontalList>
                                    <Focusable onFocus={this.onFocused} onBlur={this.onBlured} onKeyDown={this.onKeyDown} onEnterDown={this.onEnterDown}>
                                        <div className="slideWrapper" style={slideStyle}>
                                            {fakeChildren}
                                        </div>
                                    </Focusable>
                                </HorizontalList>
                            </div>
                            <span className="icRocket"></span>
                            <div className="leftArrow"></div>
                            <div className="rightArrow"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export { KidsRotateSlider, G2RotateMenuItem };