import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
// import { HorizontalList } from 'Navigation';
import 'ComponentCss/modules/SlideTypeA.css';
import 'ComponentCss/modules/SlideTypeB.css';
import 'ComponentCss/modules/SlideTypeBD.css';

class G2Slider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            currentIdx: 0,
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
        // console.error( 'start:', startIndex, 'end:', endIndex, 'idx:', idx);

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
                endIndex = maxItem - 1;
                startIndex = endIndex - (maxItem-1);
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
            currentIdx: idx,
            page: changedPage
        });
        
        const { onFocusChanged } = this.props;
        if (onFocusChanged && typeof onFocusChanged === 'function') {
            onFocusChanged(idx);
        }
    }

    componentDidMount() {
        // console.error('slider.props:', this.props);
    }

    onChildKeyDown = (event) => {
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
    }

    render() {
        const { title, type, children, bShow, allMenu } = this.props;
        const totalItem = children? children.length: 0;
        const { maxItem, width: itemWidth, margin } = SlideInfo[type];
        const childrenWithProps = React.Children.map(children, child => React.cloneElement(child, { onFocusChanged: this.onFocusChanged, onKeyDown: this.onChildKeyDown}));

        const { currentIdx, page, focused } = this.state;
        const isLast = (currentIdx - page) === (maxItem -1);
        const isFirst = currentIdx === 0;
        const wrapperClass = `slideWrap${focused? ' activeSlide': ''}${isFirst?' firstActive':''}${isLast?' lastActive':''}`;
        const wrapperStyle = {
            '--page': page,
            'width': totalItem * itemWidth + totalItem * margin
        };
        
        // 첫번째, 두번째 아이템에 포커스시 타이틀 업
        const isTitleUp = ((currentIdx === page || currentIdx === (page + 1)) && focused);
        const groupClass = `contentGroup${isTitleUp? ' activeSlide': ''}`;
        
        let slideTypeClass = '';
        let containerClass = '';
        switch(type) {
            case SlideType.TALL: slideTypeClass = 'slideTypeA'; break;
            case SlideType.WIDE: slideTypeClass = 'slideTypeB'; break;
            case SlideType.WATCHING_VOD: slideTypeClass = 'slideTypeB'; break;
            case SlideType.RECENT_VOD: slideTypeClass = 'slideTypeBD'; break;
            case SlideType.EDITABLE_RECENT_VOD: slideTypeClass = 'slideTypeB_B'; break;
            case SlideType.MOVIE: 
                slideTypeClass = 'slideTypeE';
                containerClass = ' listStyle2 type3';
                break;
            case SlideType.ACTOR_TEXT:
                slideTypeClass = 'slideTypeG';
                containerClass = ' listStyle3 type5';
                break;
            case SlideType.ACTOR_IMAGE: slideTypeClass = 'slideTypeF'; break;
            case SlideType.RECOMMEND_VOD: slideTypeClass = 'recommendSlide'; break;
            case SlideType.EDITABLE_BOOKMARK_LIST: slideTypeClass = 'slideTypeAC'; break;
            default: break;
        }

        return (
            // <HorizontalList onFocus={this.onFocused} onBlur={this.onBlured} rotatefocus={this.props.rotate} {...this.props} newEl={this.props.count} navTail={this.props.tail} onKeyDown={this.onKeyDown}>
            <div className={groupClass} style={{display: bShow? 'block': 'none'}} ref={r=>this.anchor=r}>
                <div className={slideTypeClass}>
                    <div className="title">{title}</div>
                    <div className={wrapperClass}>
                        <div className={`slideCon${containerClass}`}>
                            <div className="slideWrapper" style={wrapperStyle} ref={r=>this.container=r}>
                                {childrenWithProps}
                            </div>
                        </div>
                        { 
                            type === SlideType.RECENT_VOD
                            ? <span className="keyGuideWrap"><span className="btnKey"><span className="btnKeyBlue"></span> / <span className="btnKeyOption"></span>목록삭제</span></span>
                            : null
                        }
                        { !(allMenu && currentIdx === 0) && <div className="slideCount">
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
            // </HorizontalList>
        );
    }
}

export default G2Slider;