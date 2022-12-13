import React, { Component } from 'react';
import styled from 'styled-components';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';

const KEY = keyCodes.Keymap;

const SlideType = {
    AEDSlideTest: 'AEDSlideTest'
};

const SlideInfo = {
    AEDSlideTest: {
        width: 200,
        height: 400,
        viewSize: 4,
    }
}

const DIR = {
    LEFT: 0,
    RIGHT: 1
};

const animationDuration = 80;

const Container = styled.div`
    display: flex;
    // overflow-x: hidden;
    width: 800px;
    height: 400px;
    margin: 0 auto;
`;

const Slide = styled.div`
    width: 200px;
    height: 400px;
    line-height: 400px;
    font-size: 25px;
    flex-shrink: 0;
    text-align: center;
    border: 8px solid #000;

    &.focusOn {
        border: 8px solid #FFF;
        font-size: 40px;
    }
`;

class AEDSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageIdx: 0,

            viewIdx: 0,
            focused: false,
            focusedIdx: -1,

            fakeChildren: null,

            animation: false,
            offsetX: 0
        };
    }

    static defaultProps = {
        maxItem: 5,
    }

    onFocused = () => {
        this.setState({
            focused: true
        });
    }

    onBlured = () => {
        this.setState({
            focused: false
        });
    }

    onKeyDown = (event) => {
        const { animation } = this.state;
        if (animation) {
            return;
        }
        const { 
            children,
            maxItem
         } = this.props;
        const list = React.Children.toArray(children);
        const totalItem = list.length;
        
        const { 
            focusedIdx,
            viewIdx: viewStartIdx,
        } = this.state;
        const viewEndIdx = viewStartIdx + maxItem - 1;
        let nextViewStart = viewStartIdx;
        let nextFocusIdx = focusedIdx;

        switch(event.keyCode) {
            case KEY.LEFT:
                nextFocusIdx --;
                if (nextFocusIdx < 0) {
                    nextFocusIdx = 0;
                }

                // view 가 이동해야되는지 체크해서 slideTo 로 view 이동
                if (nextFocusIdx === viewStartIdx) {
                    if (viewStartIdx >= 1) {
                        nextViewStart--;
                        if (nextViewStart < 0) {
                            nextViewStart = 0;
                        }
                    }
                }

                this.setState({
                    focusedIdx: nextFocusIdx
                });

                if (viewStartIdx !== nextViewStart) {
                    this.slideByDirection(DIR.LEFT, nextViewStart);
                }
                return true;

            case KEY.RIGHT:
                nextFocusIdx ++;
                if (nextFocusIdx >= totalItem) {
                    nextFocusIdx = totalItem -1;
                }

                // view 가 이동해야되는지 체크해서  slideTo로 view 이동
                if (nextFocusIdx === viewEndIdx) {
                    if (viewEndIdx< totalItem) {
                        nextViewStart ++;    
                        if (nextViewStart + maxItem > totalItem) {
                            nextViewStart = totalItem - maxItem;
                        }
                    }
                }

                this.setState({
                    focusedIdx: nextFocusIdx
                });

                if (viewStartIdx !== nextViewStart) {
                    this.slideByDirection(DIR.RIGHT, nextViewStart);
                }

                return true;
            default: break;
        }
    }

    // 애니메이션 없이 뷰 이동
    slideTo = (nextStartViewIdx) => {
        this.setState({
            viewIdx: nextStartViewIdx,
            animation: false,
        });
    }

    // 애니메이션 적용해서 뷰 이동.
    slideByDirection = (dir, nextViewIdx) => {
        const { type } = this.props;
        const slideInfo = SlideInfo[type];
        if (dir === DIR.LEFT) {
            const offsetX = slideInfo.width;
            this.setState({
                offsetX,
                animation: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        animation: false,
                        offsetX: 0,
                        viewIdx: nextViewIdx
                    })
                }, animationDuration)
            })
        } else if (dir === DIR.RIGHT) {
            const offsetX = -(slideInfo.width);
            this.setState({
                offsetX,
                animation: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        animation: false,
                        offsetX: 0,
                        viewIdx: nextViewIdx
                    })
                }, animationDuration);
            });
        }
    }

    componentDidMount() {
        const { id, setFm, children } = this.props;

        const fm = new FM({
            id,
            type: 'FAKE',
            onFocusKeyDown: this.onKeyDown,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
        });
        setFm(id, fm);
        this.setState({
            focusedIdx: 0
        });
    }

    componentWillReceiveProps(nextProps) {
        const { id, setFm, children } = this.props;
        const childList = React.Children.toArray(children);
        
    }

    static defaultProps = {
        page: 1,
        totalPage: 1,
        chunkSize: 30,
        fetch: function() {}
    };

    render() {
        const { 
            children,
            maxItem,
            type
         } = this.props;

        const { 
            viewIdx,
            focused, 
            focusedIdx,
            animation,
            offsetX
        } = this.state;
        const slideInfo = SlideInfo[type];
        let totalOffsetX = offsetX;

        const childList = children? React.Children.toArray(children): null;

        if (!childList) {
            this.setState({ fakeChildren: null });
        }

        const headIdx = viewIdx - 1;
        let head = null;
        if (headIdx >= 0) {
            head = React.cloneElement(children[headIdx], {
                idx: headIdx,
                focused: focusedIdx === headIdx && focused
            });
        }

        if (head) {
            totalOffsetX -= slideInfo.width;
        }

        let viewList = null;
        const views = childList.slice(viewIdx, viewIdx + maxItem);
        viewList = React.Children.map(views, (child, index) => {
            const idx = viewIdx + index;
            return React.cloneElement(child, { 
                idx,
                focused: focusedIdx === idx && focused
            });
        })

        const tailIdx = viewIdx + maxItem;
        let tail = null;
        if (tailIdx < childList.length) {
            tail = React.cloneElement(children[tailIdx], {
                idx: tailIdx,
                focused: focusedIdx === tailIdx && focused
            });
        }
        
        const fakeChildren = [];
        fakeChildren.push(head);
        fakeChildren.push(viewList);
        fakeChildren.push(tail);

        const containerStyle = {
            transition: `transform ${animation? animationDuration: 0}ms ease-in-out `,
            transform: `translateX(${totalOffsetX}px)`
        }

        return(
            <Container style={containerStyle}>
                {fakeChildren}
            </Container>
        );
    }
}

class AEDSlideTest extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(nextProps) !== JSON.stringify(this.props);
    }

    render() {
        const { title, focused, color } = this.props;
        return <Slide className={`${focused?'focusOn':''}`} style={{backgroundColor: color}}>
            {title}
        </Slide>
    }
}

export {
    AEDSlider as default,
    AEDSlideTest
}