import React, { Component } from 'react';
// import { HorizontalList, Focusable } from 'Navigation';
import saveRefs from 'react-save-refs';
import { DIR } from './SlideInfo.js';
import 'ComponentCss/modules/MainSlide.css';
import FM from 'Supporters/navi.js';
import appConfig from './../../../../../config/app-config';
import Utils from 'Util/utils';
import { kidsConfigs } from '../../../config/kids-config';
import { isEqual } from 'lodash';

class G2SlideKidsBanner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bAnimation: false,
        };

        this.timer = 0;
        this.container = null;
    }

    static defaultProps = {
        imgURL: '',
        width: 1920,
        height: 390,
        onSelect: null,
        idx: -1,
        focused: false,
        link: ''
    };

    render() {
        const { width, height, idx, bannerInfo, focused } = this.props;
        const focusActiveClass = `slide${focused ? ' active' : ''}`;
        const focusClass = `csFocus${focused ? ' focusOn' : ''}`;

        const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.MONTHLY_BANNER_SMALL);
        const bannerImg = isEqual(bannerInfo[idx].bnrDetTypCd, kidsConfigs.BANNER_DET_TYPE.EXTEND) ? bannerInfo[idx].extImgPath : bannerInfo[idx].bssImgPath;
        return (
            <div className={focusActiveClass} style={{ flexShrink: 0 }}>
                <div className={focusClass} tabIndex="-1">
                    <span className="imgWrap onlyImg">
                        <img src={imgUrl + bannerImg} width={width} height={height} alt="" className="nor" />
                    </span>
                </div>
            </div>
        );
    }
}

class G2SliderKidsBanner extends Component {
    constructor(props) {
        super(props);
        this.slideArrow = '';
        this.state = {
            focused: false,
            currentIdx: 0,
            fakeChildren: null
        };

        this.fakeChildrenList = new Map(); // ref 저장용

    }

    static defaultProps = {
        autoPlay: false,
        onSelect: null,
        duration: 200,
        width: 1920
    }

    componentDidMount() {
        const { id, setFm, children } = this.props;
        const childList = React.Children.toArray(children);

        this.createFakeElements();
        const { autoPlay } = this.props;
        if (autoPlay) {
            this.timer = setInterval(() => {
                this.slide(DIR.RIGHT);
            }, 3000);
        }

        if (childList.length !== 0) {
            if (childList.length > 1) {
                this.slideArrow.style.display = 'block';
            }
            setFm(id, new FM({
                id: id,
                type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
                onFocusKeyDown: this.onKeyDown,
                onFocusContainer: this.onFocused,
                onBlurContainer: this.onBlured,
            }));
        } else {
            setFm(id, null);
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);

        const { id, setFm } = this.props;
        if (typeof setFm === 'function') {
            setFm(id, null);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { id, setFm, children } = nextProps;
        const childList = React.Children.toArray(children);

        this.createFakeElements();

        if (childList.length !== 0) {
            setFm(id, new FM({
                id: id,
                type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
                onFocusKeyDown: this.onKeyDown,
                onFocusContainer: this.onFocused,
                onBlurContainer: this.onBlured,
            }));
        } else {
            setFm(id, null);
        }
    }

    onFocused = () => {
        this.setState({ focused: true }, () => {
            this.createFakeElements();
        });
        clearInterval(this.timer);   // BMT_UI_체크리스트 수정
        const { onFocusSlider } = this.props;
        if (onFocusSlider && typeof onFocusSlider === 'function') {
            onFocusSlider(this.container);
        }
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

    onKeyDown = (evt, idx) => {
        switch (evt.keyCode) {
            case 39:
                this.slide(DIR.RIGHT);
                break;
            case 37:
                this.slide(DIR.LEFT);
                break;
            case 13:
                this.props.onKeyDown(evt, this.state.currentIdx);
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

    createFakeElements = () => {
        const { children } = this.props;
        const { currentIdx, focused: containerFocused } = this.state;
        const childList = children ? React.Children.toArray(children) : null;
        const cloneList = React.Children.map(childList, (child, idx) => {
            const focused = (containerFocused && idx === currentIdx);
            return React.cloneElement(child, { focused, pos: idx, idx, key: idx, ref: r => saveRefs(this.fakeChildrenList, idx) });
        });

        if (!childList) {
            this.setState({ fakeChildren: null });
            return;
        }

        const fakeChildren = [];
        const lastIdx = childList.length - 1;
        const head = React.cloneElement(childList[lastIdx], { pos: childList.length, idx: lastIdx, key: 'head', ref: r => saveRefs(this.fakeChildrenList, childList.length) });
        const tail = React.cloneElement(childList[0], { pos: -1, idx: 0, ref: r => saveRefs(this.fakeChildrenList, -1) });
        fakeChildren.push(head);
        fakeChildren.push(...cloneList);
        fakeChildren.push(tail);

        this.setState({ fakeChildren });
    }

    getSlideStyle = () => {
        const { width, duration } = this.props;
        const { currentIdx, bAnimation } = this.state;
        const x = -((currentIdx + 1) * width);
        return {
            transitionDuration: bAnimation ? `${duration}ms` : '0s',
            transform: `translateX(${x}px`,
            transition: 'none',
        };
    }

    renderPage = () => {
        const { currentIdx } = this.state;
        const { children } = this.props;
        const childList = React.Children.toArray(children);
        let iterator = new Array(childList.length).fill(0);
        return (
            <div className="slidePage">
                {iterator.map((item, i) => (
                    <span key={i} className={i === currentIdx ? 'on' : ''} />
                ))}
            </div>
        );
    }

    onTransitionEnd = (evt) => {
    }

    render() {
        const { fakeChildren, focused } = this.state;
        const slideStyle = this.getSlideStyle();
        const focusClass = `mainSlide ${focused ? 'focus autoPlayStop' : ''}`;
        const containerFocusClass = `slideWrap ${focused ? 'activeSlide' : ''}`;

        return (
            <div className="contentGroup" id={this.props.id}>
                <div className={focusClass}>
                    <div className={containerFocusClass}>
                        <div className="slideCon">
                            <span className="keyWrap">
                                <span className="keyOk"><span className="iconOk"></span>상세화면 보기</span>
                            </span>
                            <div className="slideWrapper" style={slideStyle} onTransitionEnd={this.onTransitionEnd} ref={r => this.container = r}>
                                {fakeChildren}
                            </div>
                        </div>
                        <div ref={r => this.slideArrow = r} style={{ display: 'none' }}>
                            <div className="slideLeft" />
                            <div className="slideRight" />
                        </div>
                        {this.renderPage()}
                    </div>
                </div>
            </div>
        );
    }
}

export { G2SlideKidsBanner, G2SliderKidsBanner };