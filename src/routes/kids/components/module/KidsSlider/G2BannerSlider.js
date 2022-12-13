import React, { Component } from 'react';
// import { HorizontalList, Focusable } from 'Navigation';
import saveRefs from 'react-save-refs';
import { DIR } from './SlideInfo.js';
import 'ComponentCss/modules/MainSlide.css';
import FM from 'Supporters/navi.js';

class G2Banner extends Component {
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
        height: 340,
        onSelect: null,
        idx: -1,
        focused: false,
        link: ''
    };

    render() {
        const { width, height, imgURL, focused } = this.props;
        const focusClass = `csFocus${focused? ' focusOn':''}`;
        const focusActiveClass = `slide${focused? ' activeSlide':''}`;
        return (
            <div className={focusActiveClass} style={{flexShrink:0}}>
                <div className={focusClass} tabIndex="-1">
                    {/* {focused? `[${idx}]포커스 ON`: `[${idx}]포커스 OFF`} */}
                    <img src={imgURL} width={width} height={height} alt="" />
                </div>
            </div>
        );
    }
}

class G2BannerSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            currentIdx: 0,
            fakeChildren: null
        };

        this.fakeChildrenList = new Map(); // ref 저장용

        console.log('%c G2BannerSlider props check', 'color: green', this.props);
    }

    static defaultProps = {
        autoPlay: false,
        onSelect: null,
        duration: 200,
        width: 1920
    }

    componentDidMount() {
        const { id,  setFm, children } = this.props;
        const childList = React.Children.toArray(children);

        this.createFakeElements();
        const { autoPlay } = this.props;
        if (autoPlay) {
            this.timer = setInterval(()=> {
                this.slide(DIR.RIGHT);
            }, 3000);
        }
        setFm(id, new FM({
            id : this.props.id,
            containerSelector: '.slideCon',
            moveSelector : '.slideCon .slideWrapper .slide',
            focusSelector : '.csFocus',
            row : 1,
            col : childList.length,
            focusIdx : 0,
            startIdx : 0,
            lastIdx : childList.length -1,
            bRowRolling: true,
            onFocusKeyDown: this.onKeyDown
        }));
    }

    componentWillUnmount() {
        clearInterval(this.timer);
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

    onFocused = () => {
        this.setState({focused: true}, () => {
            this.createFakeElements();
        });
        clearInterval(this.timer);
        const { onFocusSlider } = this.props;
        if (onFocusSlider && typeof onFocusSlider === 'function') {
            onFocusSlider(this.container);
        }
    }

    onBlured = () => {
        this.setState({focused: false}, () => {
            this.createFakeElements();
        });
        const { autoPlay } = this.props;
        if (autoPlay) {
            this.timer = setInterval(()=> {
                this.slide(DIR.RIGHT);
            }, 3000);
        }
    }

    onEnterDown = () => {
        this.onSelect();
    }

    onKeyDown = (evt, a) => {
        console.log('%c evt, a', 'color: green', evt, a);
        switch(evt.keyCode) {
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
        const { currentIdx, focused: containerFocused } = this.state;
        const childList = children? React.Children.toArray(children): null;
        const cloneList = React.Children.map(childList, (child, idx) => {
            const focused = (containerFocused && idx === currentIdx);
            return React.cloneElement(child, {focused, pos: idx, idx, key: idx, ref: r=>saveRefs(this.fakeChildrenList, idx)});
        });
        
        if (!childList) {
            this.setState({fakeChildren: null});
            return;
        }

        const fakeChildren = [];
        const lastIdx = childList.length - 1;
        const head = React.cloneElement(childList[lastIdx], {pos: childList.length, idx: lastIdx, key: 'head', ref: r=>saveRefs(this.fakeChildrenList, childList.length)});
        const tail = React.cloneElement(childList[0], {pos:-1, idx: 0, ref: r=>saveRefs(this.fakeChildrenList, -1)});
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
            transitionDuration: bAnimation? `${duration}ms`: '0s',
            transform: `translateX(${x}px`
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
        // console.log( 'transition end : ', evt );
    }

    render() {
        const { fakeChildren, focused } = this.state;
        const slideStyle = this.getSlideStyle();
        const focusClass = `mainSlide ${focused ? 'focus' : ''}`;
        const containerFocusClass = `slideWrap ${focused ? 'activeSlide' : ''}`;
        return(
            // <HorizontalList>
                // {/* <Focusable onFocus={this.onFocused} onBlur={this.onBlured} onKeyDown={this.onKeyDown} onEnterDown={this.onEnterDown}> */}
                    <div className="contentGroup" id={this.props.id}>
                        <div className={focusClass}>
                            <div className={containerFocusClass}>
                                <div className="slideCon">
                                    <div className="slideWrapper" style={slideStyle} onTransitionEnd={this.onTransitionEnd} ref={r=>this.container=r}>
                                        {fakeChildren}
                                    </div>
                                </div>
                                <div className="slideLeft"/>
                                <div className="slideRight"/>
                                { this.renderPage() }
                            </div>
                        </div>
                    </div>
                // {/* </Focusable> */}
            // {/* </HorizontalList> */}
        );
    }
}

export { G2Banner, G2BannerSlider };