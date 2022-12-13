import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';

import '../KidsSliderCSS/SlideTypeAD.css'
import '../KidsSliderCSS/SlideTypeBC.css'
import '../KidsSliderCSS/SlideGenreBlock.css'
// import 'ComponentCss/modules/slideTypeA_D.css';
// import 'ComponentCss/modules/SlideTypeB.css';
// import 'ComponentCss/modules/SlideTypeBD.css';
import FM from './../../../../../supporters/navi';

class G2SliderDefault extends Component {
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
        console.log('옵션키');
    }

    onFocusChanged = (idx) => {
        const { slideType, children } = this.props;
        const { maxItem } = SlideInfo[slideType];
        const { page } = this.state;
        const totalItem = children? children.length: 0;
        let startIndex = page;
        let endIndex = page + (maxItem - 1);

        // 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
        if (idx < startIndex) {
            startIndex = idx;
            if (startIndex < 0) {
                startIndex = 0;
            }
            endIndex = startIndex + (maxItem-1);
        } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
            endIndex = idx;
            if (endIndex > (maxItem - 1)) {
                startIndex = endIndex - (maxItem-1);
                endIndex = maxItem - 1;
            }
        } else { // 포커스가 현재 보여지는 Set 안에 있는경우
            if (idx === endIndex) {
                if (endIndex < totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
                    endIndex++;
                    startIndex++;
                }
                if (startIndex + maxItem > totalItem) {
                    startIndex = totalItem - maxItem;
                    endIndex = startIndex + maxItem - 1;
                }
            } else if (idx === startIndex) {
                if (startIndex >= 1 ) { // 첫 인덱스가 1이 아니면
                    startIndex--;
                    endIndex--;
                }
                if (startIndex < 0) {
                    startIndex = 0;
                    endIndex = maxItem -1;
                }
            }
        }

        const changedPage = startIndex;
        this.setState({
            curIdx: idx,
            page: changedPage
        });
        
        // const { onFocusChanged } = this.props;
        // if (onFocusChanged && typeof onFocusChanged === 'function') {
        //     onFocusChanged(idx);
        // }
    }

    componentDidMount() {
        const { id, idx, setFm, children, rotate } = this.props;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0) {
            const fm = new FM({
                id : fmId,
                containerSelector : '.slideCon .slideWrapper',
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
            
            this.setState({
                curIdx: this.props.focusIndex
            }, () => {
                const { onInitFocus } = this.props;
                if (onInitFocus && typeof onInitFocus === 'function') {
                    onInitFocus(fmId, idx);    
                }
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        // const { id, idx, setFm, children, rotate } = nextProps;
        // const childList = React.Children.toArray(children);
        
        // const fmId = idx? `${id}_${idx}`: id;
        // if (childList.length !== 0) {
        //     const fm = new FM({
        //         id : fmId,
        //         containerSelector: '.slideCon .slideWrapper',
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
        //         onInitFocus(id, idx);    
        //     }
        // }

    }
    onFocusContainer = () => {
        const { idx, onSlider } = this.props;
        if (onSlider && this.container) {
            onSlider(idx, this.containder);
        }

        this.setState({ focused: true });
    }

    onBlurContainer = (dir) => {
        this.setState({ focused: false }, () => {
            const { idx, offSlider } = this.props;
            if (offSlider && typeof offSlider === 'function') {
                offSlider(idx, dir);
            }
        });
    }

    onFocusChild = (childIdx) => {
        this.onFocusChanged(childIdx);
        
        const { idx, onFocus } = this.props;
        if (onFocus && typeof onFocus === 'function') {
            onFocus(idx, childIdx);
        }
    }

    onFocusKeyDown = (event, childIdx) => {
        const { idx, onKeyDown } = this.props;
        if (typeof onKeyDown === 'function') {
            onKeyDown(event, idx, childIdx);
        }
    }

    onChildKeyDown = (event) => {
        const { idx, onChildKeyDown } = this.props;
        if (onChildKeyDown && typeof onChildKeyDown === 'function') {
            onChildKeyDown(idx, event);
        }
    }

    render() {
        const { curIdx, page, focused } = this.state; 
        const { id, idx, title, slideType, children } = this.props; // props 정보
        // console.log('[this.children] : ', children);

        const totalItem = children ? children.length : 0; // 아이템 개수
        const {
            width: itemWidth,
            margin: itemMargin,
            maxItem: itemMax
        } = SlideInfo[slideType]; // 슬라이드 정보

        //children에 propr를 추가
        const childrenWithProps = React.Children.map(children, (child, childIdx) => {
            return React.cloneElement(child, {
                onFocusChanged: this.onFocusChanged,
                onKeyDown: this.onChildKeyDown,
                slideType,
                bFirst: childIdx === page,
                bLast: childIdx === (page + itemMax - 1),
            });
        })

        const isLastIdx = ((curIdx - page) === (itemMax - 1)); // 체크 마지막 인덱스
        const isFirstIdx = (curIdx === 0); // 체크 첫번째 인덱스
        
        const isShowCount = totalItem - 1 >= SlideInfo[slideType].maxItem;
        let isCountPage = true;
        switch(slideType) {
            case SlideType.KIDS_MONTHLY_HOME: 
                isCountPage = false;
            break;
            case SlideType.KIDS_PLAY_LEARNING: 
                isCountPage = false;
            break;
            default:
            break;
        }

        let isShowTitle = true;
        switch(slideType) {
            case SlideType.KIDS_BANNER_SLIDE_A:
            case SlideType.KIDS_BANNER_SLIDE_B:
            case SlideType.KIDS_BANNER_SLIDE_C:
                isShowTitle = false;
                break;
            default:
                break;
        }

        const isTitleUp = ((curIdx === page || curIdx === (page + 1)) && focused);
        const classNames = {
            //slideWrawp 
            contentGroup: `contentGroup${SlideInfo[slideType].className === 'slideGenreBlock' ? ' kidsGenre' : ''}${isTitleUp? ' activeSlide': ''}`,
            slide: SlideInfo[slideType].className, // 차후 데이터 로직 필요, 
            title: title ? 'title' : '', // 차후 데이터 로직 필요, 
            slideWrap: `slideWrap${focused && isShowCount ? ' activeSlide' : ''}${isFirstIdx ? ' firstActive' : ''}${isLastIdx ? ' lastActive' : ''}`,
            leftActive: `${focused && isShowCount && page > 0 ? ' leftActive' : ''}`,
            rightActive: `${focused && isShowCount && page !== totalItem - SlideInfo[slideType].maxItem ? ' rightActive' : ''}`,
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

        // rightActive leftActive
        return (
            // contentGrup
            <div id={fmId} className={classNames.contentGroup} ref={r=>this.anchor=r}>

                <div className={classNames.slide}> {/* { view + slide } */}
                    <div className={classNames.title}>{isShowTitle ? title : ''}</div> {/* { title } */}
                    
                    <div className={`${classNames.slideWrap}${classNames.leftActive}${classNames.rightActive}`}> {/* { slideWrap } */}
                        <div className={`slideCon${classNames.slideCon}`}> {/* { slideCon } */}
                            <div className="slideWrapper" style={styles.slideWrapper} ref={r=>this.container=r}>
                                {childrenWithProps}
                            </div>
                        </div>
                        
                        {
                            isShowCount && isCountPage ?
                            <div className="slideCount"><span className="current">{curIdx + 1}/</span>{totalItem}</div> : null
                        }
                        <div className="leftArrow"></div>
                        <div className="rightArrow"></div>
                    </div>
                </div>                
            </div>
        );
    }
}

export default G2SliderDefault;
