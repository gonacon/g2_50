import React, { Component } from 'react';
// import { HorizontalList, Focusable } from 'Navigation';
import saveRefs from 'react-save-refs';
import { DIR } from './SlideInfo.js';
import 'ComponentCss/modules/MainSlide.css';
import FM from 'Supporters/navi.js';
import { isEmpty } from 'lodash';
import StbInterface from 'Supporters/stbInterface.js';
import appConfig from 'Config/app-config.js';

class G2NaviBanner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bAnimation: false,
        };

        this.timer = 0;
        this.container = null;
        this.errorImageFlag = true;
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

    imageError = (e) => {
        if (this.errorImageFlag) {
            this.errorImageFlag = false;
            e.target.src = `${appConfig.headEnd.LOCAL_URL}/common/default/banner_big_default.png`;
        }
    }

    render() {
        const { width, height, imgs, focused, isSingle, isOAP } = this.props;
        const focusClass = `csFocus${focused ? ' focusOn' : ''}`;
        const focusActiveClass = `slide${focused ? ' active' : ''}`;
        return (
            <div className={focusActiveClass} style={{ flexShrink: 0 }}>
                <div className={focusClass}
                //  tabIndex="-1"
                >
                    {isSingle ?
                        <span className="imgWrap onlyImg">
                            <img src={imgs.imageN} width={width} height={height} alt="" className="nor" onError={this.imageError} />
                        </span>
                        :
                        <span className="imgWrap">
                            <img src={imgs.imageN} width={width} height={height} alt="" className="nor" onError={this.imageError} />
                            <img src={imgs.imageS} width={width} height={height} alt="" className="sel" onError={this.imageError} />
                        </span>
                    }
                </div>
            </div>
        );
    }
}

class G2NaviBannerSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            currentIdx: 0,
            fakeChildren: null,
            isOAP: false,
        };
        this.fakeChildrenList = new Map(); // ref 저장용
        this.videoContent = '';
        this.slideArrow = '';
        this.INTERVAL_TIME = 3000;
        this.OapPlayDelayTime = 100;
        this.isOapPlay = false;
    }

    static defaultProps = {
        autoPlay: false,
        onSelect: null,
        duration: 200,
        width: 1920
    }

    componentDidMount() {
        const { id, setFm, children, isHome } = this.props;
        const childList = React.Children.toArray(children);

        this.createFakeElements();
        const { autoPlay } = this.props;
        if (autoPlay) {
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                this.slide(DIR.RIGHT);
            }, this.INTERVAL_TIME);
        }

        if (childList.length !== 0) {
            if (childList.length > 1) {
                this.slideArrow.style.display = 'block';
            }
            setFm(id, new FM({
                id: this.props.id,
                type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
                onFocusKeyDown: this.onKeyDown,
                onFocusContainer: this.onFocused,
                onBlurContainer: this.onBlured,
            }));
        } else {
            setFm(id, null);
        }

        this.onOapPlayState(false);
    }

    componentWillUnmount() {
        clearInterval(this.timer);

        const { id, setFm } = this.props;
        if (typeof setFm === 'function') {
            setFm(id, null);
        }
        if (this.props.isHome) {
            this.stopOapPlay();  // pip 종료
        }
    }

    stopOapPlay() {
        const data = {
            item_id: this.props.dataList[this.state.currentIdx].item_id, playState: 1
        };
        this.isOapPlay = false;
        this.onOapPlayState(false);  // pip 감추기
        this.playOap(data);
    }

    componentWillReceiveProps(nextProps) {
        const { id, setFm, children } = nextProps;
        const childList = React.Children.toArray(children);

        // this.createFakeElements();
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
            // this.createFakeElements();
        });
        // clearInterval(this.timer);   // BMT_UI_체크리스트 수정
        const { onFocusSlider } = this.props;
        if (onFocusSlider && typeof onFocusSlider === 'function') {
            onFocusSlider(this.container, this.state.currentIdx);
        }
    }

    onBlured = () => {
        const { onBlureSlider } = this.props;
        if (onBlureSlider && typeof onBlureSlider === 'function') {
            onBlureSlider(this.container, this.state.currentIdx);
        }

        this.setState({ focused: false }, () => {
            // this.createFakeElements();
        });
        const { autoPlay } = this.props;
        if (autoPlay) {
            // this.timer = setInterval(() => {
            //     this.slide(DIR.RIGHT);
            // }, 3000);
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
                this.onSelect();
                break;
            default:
                break;
        }
    }

    slide = (dir) => {
        const { currentIdx } = this.state;
        const { children, dataList } = this.props;
        const realChildren = React.Children.toArray(children);
        let bSkipped = false;

        // console.log('slide dir=', dir);

        // 현재 배너를 가져와서  oap 재생중이면 정지
        if (!isEmpty(dataList) && !isEmpty(dataList[currentIdx]) && !isEmpty(dataList[currentIdx].file_name)) {

            this.stopOapPlay();  // pip 종료  // pip 플레이 종료
            clearInterval(this.timer);  // 타이머 종료
        }

        if (dir === DIR.LEFT) {
            let index = currentIdx - 1;
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
            let index = currentIdx + 1;
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
        const { children, dataList } = this.props;
        const { currentIdx, focused: containerFocused } = this.state;

        // console.log('createFakeElements currentIdx=', currentIdx);
        // console.log('dataList[%s] file_name=%s ', currentIdx, dataList[currentIdx].file_name, dataList[currentIdx]);
        // if (this.timer) {
        clearInterval(this.timer);
        // }
        // console.log(!isEmpty(dataList[currentIdx]), !isEmpty(dataList[currentIdx].file_name));

        // 현재 oap 재생할 콘텐츠가 있으면 재생
        // if (!isEmpty(dataList[currentIdx]) && dataList[currentIdx].file_name) {
        if (!isEmpty(dataList) && !isEmpty(dataList[currentIdx]) && !isEmpty(dataList[currentIdx].file_name)) {
            this.startOapPlay(dataList, currentIdx);  // pip 플레이 요청
            // callback을 기다렸다가 다시 시작
        } else {
            this.timer = setInterval(() => {
                this.slide(DIR.RIGHT);
            }, this.INTERVAL_TIME);
            // console.log('setInterval', this.timer);
        }

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

    // 홈 OAP 재생 요청 callback
    callbackPlayOap = (state) => {
        // console.log('callbackPlayOap ', state);
        // if ('재생 시작 되면 ') {
        if (state === 'PLAY') {
            this.isOapPlay = true;
            this.onOapPlayState(true);  // pip 보이기
            // } else if ('재생 끝나면') {
        } else if (state === 'FAIL') {
            this.isOapPlay = false;
            // 재생 실패 일때
            this.onOapPlayState(false);  // pip 감추기
            this.slide(DIR.RIGHT);
        } else if (state === 'COMPLETE') {
            this.isOapPlay = false;
            this.onOapPlayState(false);  // pip 감추기
            // 다음 슬라이더 이동
            this.slide(DIR.RIGHT);
        } else {
            this.isOapPlay = false;
            // console.log(' oap play stop');
        }
    }

	/**
	 * 홈 OAP 재생 요청, data 구조
	 * {
	 * 	item_id,  	//  item_id 사용으로 변경 예정
	 * 	playState,  //  재생 상태 값 (play : 0, stop : 1, resize : 2)
	 *  fullSize,  	//  전체 화면 여부(Y/N)
	 *  x,  		//  play, resize만 필수
	 *  y,  		//  play, resize만 필수
	 *  width,  	//  play, resize만 필수
	 *  height,  	//  play, resize만 필수
	 * }
	 */
    playOap = (data) => {
        // 홈 OAP 재생 요청
        setTimeout(() => {
            StbInterface.requestPlayOap(data, this.callbackPlayOap);
        }, this.OapPlayDelayTime);
    }

    onTransitionEnd = (evt) => {
    }

    startOapPlay() {
        const { dataList } = this.props;
        const { currentIdx, focused } = this.state;

        const data = {
            item_id: dataList[currentIdx].item_id, playState: 0, fullSize: 'N', x: '1390', y: '113',
            width: '415', height: '236', soundSetting: focused ? '1' : '0'
        };
        this.playOap(data);
    }

    isOapPlayState() {
        return this.isOapPlay;
    }

    // bool = {true : pip 보이기,  false : pip 감추기}
    onOapPlayState(bool) {

        // console.log('this.props.isHome=', this.props.isHome, bool);
        if (this.props.isHome) {
            const state = bool ? 'block' : 'none';
            // console.log('bool=%s, state=%s', bool, state);
            try {
                this.props.onOapPlayState(bool);
                this.videoContent.style.display = state;
            } catch (error) {

            }
        }

        this.setState({ isOAP: bool });
    }

    render() {
        const { fakeChildren, focused, isOAP } = this.state;
        const { isHome } = this.props;
        const slideStyle = this.getSlideStyle();
        const focusClass = `mainSlide ${focused ? 'focus autoPlayStop' : ''}`;
        const containerFocusClass = `slideWrap ${focused ? 'activeSlide' : ''}`;
        // console.log('G2NaviBannerSlider render', isOAP, isHome);

        return (
            <div className="contentGroup" id={this.props.id}>
                <div className={focusClass}>
                    <div className={containerFocusClass}>
                        <div className="slideCon">
                            {(isHome && isOAP) ?
                                <span className="videoContentWrap" ref={r => this.videoContent = r} style={{ background: 'none' }}>
                                    <span className="videoWrap">
                                        <span className="keyWrap">
                                            <span className="keyOk">
                                                <span className="iconOk" />전체화면 보기
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                :
                                <span className="keyWrap">
                                    <span className="keyOk">
                                        <span className="iconOk"></span>상세화면 보기
                                    </span>
                                </span>
                            }
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

export { G2NaviBanner, G2NaviBannerSlider };