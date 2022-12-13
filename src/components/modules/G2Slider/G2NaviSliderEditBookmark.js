import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import 'ComponentCss/modules/SlideTypeAC.css';
import FM from '../../../supporters/navi';
// import _ from 'lodash';

class G2NaviSliderEditBookmark extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            currentIdx: -1,
            page: 0
        };

        this.anchor = null;
    }

    static defaultProps = {
        title: '',
        type: SlideType.TALL,
    };

    onFocused = () => {
        const { onSlideFocus, scrollTo } = this.props;
        if (onSlideFocus && this.container) {
            onSlideFocus(this.container);
        }
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
        this.setState({
            focused: true
        });
    }

    onBlured = () => {
        this.setState({
            focused: false
        });
    }

    onOptionKeyDown = () => {
        console.error('옵션키');
    }

    onFocusChanged = (idx) => {
        const { type, children } = this.props;
        const { maxItem } = SlideInfo[type];
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
                endIndex = maxItem - 1; // 쏘: 여기 삭제 하면 안되나?
            }
        } else { // 포커스가 현재 보여지는 Set 안에 있는경우
            if (idx === (endIndex)) {
                if ((endIndex) < totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
                    endIndex++;
                    startIndex++;
                }
                if (startIndex + maxItem > totalItem) {
                    startIndex = totalItem - maxItem;
                    endIndex = startIndex + maxItem - 1;
                }
            } else if( idx < endIndex){ //삭제 시 우측에 빈 공백이 생기는 경우
                if( idx >= (maxItem - 1)){
                    startIndex--;
                    endIndex--;
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
            currentIdx: idx,
            page: changedPage
        });
        
        const { onFocusChanged } = this.props;
        if (onFocusChanged && typeof onFocusChanged === 'function') {
            onFocusChanged(idx);
        }
    }

    componentDidMount() {
        const { id, idx, setFm, children, rotate } = this.props;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0 && typeof setFm === 'function') {
            const fm = new FM({
                id : fmId,
                containerSelector: '.slideWrapper',
                // moveSelector : '.slideWrapper .slide',
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
        }
    }

    componentWillReceiveProps(nextProps) {
        const { id, idx, setFm, children, rotate } = nextProps;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0 && typeof setFm === 'function') {
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
        }
    }

    onFocusKeyDown = (event, childIdx) => {
        const { onKeyDown } = this.props;
        if (typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
        if (event.keyCode === 13) {
            const { idx, onSelectChild } = this.props;
            if (typeof onSelectChild === 'function') {
                onSelectChild(idx, childIdx);
            }
        }
    }

    onFocusContainer = (direction) => {
        const { onSlideFocus, scrollTo } = this.props;
        if (onSlideFocus && this.container) {
            onSlideFocus(this.container, direction);
        }
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
        this.setState({
            focused: true
        });
    }

    onBlurContainer = () => {
        this.setState({
            focused: false
        });
    }

    onFocusChild = (idx) => {        
        this.onFocusChanged(idx);
    }

    onChildKeyDown = (event) => {
        console.error('onChildKeyDown:', event);
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
    }

    render() {
        const { id, idx } = this.props;
        const { title, type, children, bShow, allMenu, isShowCount, menuBlockClass } = this.props;
        const isShowCnt = isShowCount !== undefined ? isShowCount : true;
        const totalItem = children? children.length: 0;
        const { currentIdx, page, focused } = this.state;
        const { maxItem, margin, width } = SlideInfo[type];
        //console.log('children : ', children)
        const childrenWithProps = React.Children.map(children, ( child, childIdx ) => 
            React.cloneElement(child, { 
                onFocusChanged: this.onFocusChanged,
                onKeyDown: this.onChildKeyDown,
                bFirst: childIdx === page,
                bLast: childIdx === (page + maxItem - 1),
                type: type,
                parentFocused: focused,
                focused: currentIdx === childIdx
            })
        );

        //console.log('childrenWithProps : ', childrenWithProps)

        let isLastPage = ( totalItem - maxItem ) === page;
        if( totalItem <= maxItem ) isLastPage = true;
        const isLastItem = (currentIdx - page ) === ( maxItem -1 );
        const isFirstPage = page === 0;
        let wrapperClass = `slideWrap${focused? ' activeSlide': ''}${!isFirstPage?' leftActive':''}${!isLastPage?' rightActive':''}${isLastItem ? ' lastActive' : ''}`;
        let wrapperStyle = {
            '--page': page,
            'width': totalItem * width + totalItem * margin
        };
        
        // 첫번째, 두번째 아이템에 포커스시 타이틀 업
        const isTitleUp = ((currentIdx === page || currentIdx === (page + 1)) && focused);
        let groupClass = `contentGroup${isTitleUp? ' activeSlide': ''}`;
        // let menuBlockGroupClass = '';
        let slideTypeClass = 'slideTypeAC';
        let containerClass = '';
        let titleClass = 'title';        

        const fmId = idx?`${id}_${idx}`: id;

        return (
            <div id={fmId} className={`${groupClass}`} style={{display: bShow? 'block': 'none'}} ref={r=>this.anchor=r}>
                <div className={slideTypeClass}>
                    { (type !== SlideType.EVENT) && <div className={titleClass}>{title}</div> }
                    <div className={wrapperClass}>
                        <div className={`slideCon${containerClass}`}>
                            <div className="slideWrapper" style={wrapperStyle} ref={r=>this.container=r}>
                                {childrenWithProps}
                            </div>
                        </div>
                        { 
                            (type === SlideType.RECENT_VOD || type === SlideType.BOOKMARK_VOD)// || type === SlideType.
                            ? <span className="keyGuideWrap"><span className="btnKey"><span className="btnKeyBlue"></span> / <span className="btnKeyOption"></span>목록삭제</span></span>
                            : null
                        }
                        { isShowCnt && !(allMenu && currentIdx === 0) && <div className="slideCount">
                            <span className="current">
                                {currentIdx + (allMenu? 0: 1)}
                            </span>
                            &nbsp;/&nbsp;
                            {totalItem - (allMenu? 1: 0)}
                        </div>}
                        <div className="leftArrow"></div>
                        <div className="rightArrow"></div>
                    </div>
                </div>                
            </div>
        );
    }
}

export default G2NaviSliderEditBookmark;