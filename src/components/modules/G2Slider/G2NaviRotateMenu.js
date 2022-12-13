import React, { Component } from 'react';
import { DIR } from './SlideInfo.js';
import 'Css/kids/character/CharacterHome.css';
import FM from 'Supporters/navi.js';
//import '../../../../src/assets/css/routes/kids/character/CharacterHome.css';
import appConfig from './../../../config/app-config';

class G2NaviRotateMenuItem extends Component {
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

    render() {
        const defaultInfo = {
            bg: '',
            focusBg: '',
            new: false,
            btv: false,
            event: false,
            newImg: '',
            newFocusImg: '',
            btvImg: '',
            btvFocusImg: '',
            eventImg: '',
            eventFocusImg: '',
            followUp: false,
            followUpImg: '',
            followUpTitle: ''
        };
        const { characterInfo, idx, height, pos } = this.props;
        const info = characterInfo ? characterInfo : defaultInfo;

        const { focused } = this.props;
        // const focusClass = `csFocus${focused ? ' focusOn' : ''}`;
        const focusActiveClass = `slide${focused ? ' active' : ''}`;
        const focusContentClass = `focusContent${focused ? 'focusOn' : ''}`;

        const {
            bg,
            focusBg,
            new: isNew,
            btv,
            event,
            newImg,
            newFocusImg,
            btvImg,
            btvFocusImg,
            eventImg,
            eventFocusImg,
            followUp,
            followUpImg,
            followUpTitle
        } = info;

        const itemStyle = {
            flexShrink: 0,
        };

        return (
            <div className={focusActiveClass} style={itemStyle}> {/* clone 이 붙는 경우?*/}
                <div className="csFocusCenter" style={{ backgroundColor: '#888', height }}>
                    {`[포커스OFF]메뉴${idx}[${pos}]`}
                    <img src={bg} alt="" />
                    {isNew && <img src={newImg} className="new" alt="" />}
                    {btv === true && <img src={btvImg} className="btv" alt="" />}
                    {event === true && <img src={eventImg} className="event" alt="" />}
                    <div className={focusContentClass}>
                        {`[포커스ON]메뉴${idx}[${pos}]`}
                        <img src={focusBg} alt="" />
                        {isNew === true && <img src={newFocusImg} className="new" alt="" />}
                        {btv === true && <img src={btvFocusImg} className="btv" alt="" />}
                        {event === true && <img src={eventFocusImg} className="event" alt="" />}
                        {followUp === true &&
                            <div className="follwUp">
                                <img src={`${appConfig.headEnd.LOCAL_URL}/kids/character/img-bottom-gradient.png`} alt="" />
                                <div className="follwUpCon">
                                    <img src={followUpImg} alt="" />
                                    <div className="follwUpText">
                                        <span>이어보기</span>
                                        <div className="title">{followUpTitle}</div>
                                        <span className="follwUpGo">바로가기</span>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class G2NaviRotateMenu extends Component {
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
        onSelect: null,
        slideDuration: 200,
        bAnimation: false,
        width: 1830, // 1920,
        height: 633, // 792,
        itemWidth: 365,
        itemHeight: 633,
        maxSlideMenu: 5
    }

    onFocused = () => {
        this.setState({ focused: true }, () => {
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
            case 13:
                this.onSelect();
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
        const { currentIdx, focused: containerFocused } = this.state;
        const childList = children ? React.Children.toArray(children) : null;
        const cloneList = React.Children.map(childList, (child, idx) => {
            const focused = (containerFocused && idx === currentIdx);
            return React.cloneElement(child, { focused, pos: idx, idx, key: idx });
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
        const { setFm, id } = this.props;
        setFm(id, new FM({
            id,
            type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
            onFocusKeyDown: this.onKeyDown,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
        }));

        this.createFakeElements();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.children !== this.props.children) {
            this.createFakeElements();
        }
        // this.createFakeElements();
    }

    getSlideStyle = () => {
        const { slideDuration, itemWidth, maxSlideMenu } = this.props;
        const neededFakes = Math.ceil(maxSlideMenu / 2);
        const { currentIdx, bAnimation } = this.state;
        const fakeIdx = currentIdx + neededFakes;
        const x = -(fakeIdx * itemWidth);

        const style = {
            transition: `transform ease-in-out ${bAnimation ? slideDuration : 0}ms`,
            transform: `translateX(${x}px)`,
            paddingLeft: 730 // Math.floor( width / 2 ) <== ( item 수가 작은 경우 처리해줘야됨 )
        }
        return style;
    }

    render() {
        const { id } = this.props;
        const { fakeChildren, focused } = this.state;
        const focusClass = `characterSlideWrap scrollWrap${focused ? ' focus' : ''}`;
        const slideStyle = this.getSlideStyle();

        return (
            <div id={id} className={focusClass} style={{ transform: 'translate(0px, 0px)', backgroundColor: '#F88' }}> {/* 포커스시 focus 추가*/}
                <div className="dim" />
                <div className="characterSlideInner">
                    <div className="contentGroup">
                        <div className="characterSlide" style={slideStyle}>
                            {fakeChildren}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export { G2NaviRotateMenu, G2NaviRotateMenuItem };