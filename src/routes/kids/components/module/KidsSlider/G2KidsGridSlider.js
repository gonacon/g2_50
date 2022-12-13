import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import 'ComponentCss/modules/SlideTypeA.css';
import 'ComponentCss/modules/SlideTypeB.css';
import 'ComponentCss/modules/SlideTypeBD.css';
import FM from './../../../../../supporters/navi';


class G2KidsGridSlider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            curIdx: 0,
            page: 0
        };
        this.anchor = null;
    }

    static defaultProps = {
        title: '',
        type: SlideType.TALL,
    };

    onOptionKeyDown = () => {
        console.error('옵션키');
    }

    onFocusChanged = (idx) => {
        // const { slideType, children } = this.props;
        // const { maxItem } = SlideInfo[slideType];
        // const { page } = this.state;

        // const totalItem = children? children.length: 0;
        
        // let startIndex = page;
        // let endIndex = page + (maxItem - 1);

        // 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
        // if (idx < startIndex) {
        //     startIndex = idx;
        //     if (startIndex < 0) {
        //         startIndex = 0;
        //     }
        //     endIndex = startIndex + (maxItem-1);
        // } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
        //     endIndex = idx;
        //     if (endIndex > (maxItem - 1)) {
        //         startIndex = endIndex - (maxItem-1);
        //         endIndex = maxItem - 1;
        //     }
        // } else { // 포커스가 현재 보여지는 Set 안에 있는경우
        //     if (idx === endIndex) {
        //         if (endIndex < totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
        //             endIndex++;
        //             startIndex++;
        //         }
        //         if (startIndex + maxItem > totalItem) {
        //             startIndex = totalItem - maxItem;
        //             endIndex = startIndex + maxItem - 1;
        //         }
        //     } else if (idx === startIndex) {
        //         if (startIndex >= 1 ) { // 첫 인덱스가 1이 아니면
        //             startIndex--;
        //             endIndex--;
        //         }
        //         if (startIndex < 0) {
        //             startIndex = 0;
        //             endIndex = maxItem -1;
        //         }
        //     }
        // }

        // const changedPage = startIndex;
        // this.setState({
        //     curIdx: idx,
        //     page: changedPage
        // });
        
        // const { onFocusChanged } = this.props;
        // if (onFocusChanged && typeof onFocusChanged === 'function') {
        //     onFocusChanged(idx);
        // }
    }

    componentDidMount() {
        // const { id, idx, setFm, children, rotate } = this.props;
        // const childList = React.Children.toArray(children);
        
        // const fmId = idx? `${id}_${idx}`: id;
        // if (childList.length !== 0) {
        //     const fm = new FM({
        //         id : fmId,
        //         containerSelector : '.slideCon .slideWrapper',
        //         focusSelector : '.csFocus',
        //         row : 1,
        //         col : childList.length,
        //         focusIdx : 0,
        //         startIdx : 0,
        //         lastIdx : childList.length -1,
        //         bRowRolling: rotate,
        //         onFocusContainer: this.onFocusContainer,
        //         onBlurContainer: this.onBlurContainer,
        //         onFocusChild: this.onFocusChild,
        //         onFocusKeyDown: this.onFocusKeyDown
        //     });
        //     setFm(id, fm);
            
        //     const { onInitFocus } = this.props;
        //     if (onInitFocus && typeof onInitFocus === 'function') {
        //         onInitFocus(fmId, idx);    
        //     }
        // }
    }

    componentWillReceiveProps(nextProps) {
        const { id, idx, setFm, children, rotate } = nextProps;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0) {
            const fm = new FM({
                id : fmId,
                containerSelector: '.slideCon .slideWrapper',
                focusSelector : '.csFocus',
                row : 1,
                col : childList.length,
                focusIdx : 0,
                startIdx : 0,
                lastIdx : childList.length -1,
                bRowRolling: rotate,
                onFocusContainer: this.onFocusContainer,
                onBlurContainer: this.onBlurContainer,
                onFocusChild: this.onFocusChild,
                onFocusKeyDown: this.onFocusKeyDown
            });
            setFm(id, fm);
            
            const { onInitFocus } = this.props;
            if (onInitFocus && typeof onInitFocus === 'function') {
                onInitFocus(fmId, idx);    
            }
        }

    }
    onFocusContainer = () => {
        const {idx, onSlider, onScroll } = this.props;

        if (onSlider && this.container) {
            onSlider(idx, this.containder);
        }

        if (onScroll && typeof onScroll === 'function') {
            onScroll(this.anchor);
        }

        this.setState({ focused: true });
    }

    onBlurContainer = () => {
        this.setState({ focused: false });
        
        const { offSlider } = this.props;
        if (offSlider && typeof offSlider === 'function') {
            offSlider();
        }
    }

    onFocusChild = (idx) => {
        this.onFocusChanged(idx);
        
        const { onFocus } = this.props;
        if (onFocus && typeof onFocus === 'function') {
            onFocus(idx);
        }
    }

    onFocusKeyDown = (event, childIdx) => {
        console.log('this.props :', this.props);
        const { idx, onKeyDown } = this.props;
        if (typeof onKeyDown === 'function') {
            onKeyDown(event, idx, childIdx);
        }
    }

    onChildKeyDown = (event) => {
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
    }

    render() {
        const { curIdx, page, focused } = this.state; 
        const { id, idx, bShow, title, slideType, children } = this.props; // props 정보
        const totalItem = children ? children.length : 0; // 아이템 개수
        const {
            width: itemWidth,
            margin: itemMargin,
            maxItem: itemMax
        } = SlideInfo[slideType]; // 슬라이드 정보

        //children에 propr를 추가
        const childrenWithProps = React.Children.map(children, child => {
            return React.cloneElement(child, {
                onFocusChanged: this.onFocusChanged,
                onKeyDown: this.onChildKeyDown,
                slideType
            });
        })

        const isLastIdx = ((curIdx - page) === (itemMax - 1)); // 체크 마지막 인덱스
        const isFirstIdx = (curIdx === 0); // 체크 첫번째 인덱스

        const isTitleUp = ((curIdx === page || curIdx === (page + 1)) && focused);
        const classNames = {
            //slideWrawp 
            contentGroup: `contentGroup${isTitleUp? ' activeSlide': ''}`,
            slide: SlideInfo[slideType].className, // 차후 데이터 로직 필요, 
            title: title ? 'title' : '', // 차후 데이터 로직 필요, 
            slideWrap: `slideWrap${focused ? ' activeSlide' : ''}${isFirstIdx ? ' firstActive' : ''}${isLastIdx ? ' lastActive' : ''}`,
            slideCon: '',
            container: '', // 차후 데이터 로직 필요,
        }
        const styles = {
            slideWrapper: {
                '--page': page,
                'width': (totalItem * itemWidth) + (totalItem * itemMargin)
            }
        }
        const fmId = idx ? `${id}_${idx}` : id;

        return (
            // contentGrup
            <div id={fmId} className={classNames.contentGroup} style={{display: bShow? 'block': 'none'}} ref={r=>this.anchor=r}>
                    <div className={classNames.slideWrap}> {/* { slideWrap } */}
                        <div className={`slideCon${classNames.slideCon}`}> {/* { slideCon } */}
                            {/* <div className="slideWrapper" style={styles.slideWrapper} ref={r=>this.container=r}> */}
                                {childrenWithProps}
                            {/* </div> */}
                        </div>
                    </div>
                </div>                
        );
    }
}

export default G2KidsGridSlider;