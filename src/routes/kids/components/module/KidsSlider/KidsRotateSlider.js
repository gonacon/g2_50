import React, { Component } from 'react';
import { SlideInfo, SlideType } from './SlideInfo';
import 'ComponentCss/modules/SlideTypeA.css';
import 'ComponentCss/modules/SlideTypeB.css';
import 'ComponentCss/modules/SlideTypeBD.css';
import FM from './../../../../../supporters/navi';
import appConfig from './../../../../../config/app-config';

class KidsRotateSlider extends Component {
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
        console.log('옵션키');
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
            currentIdx: idx,
            page: changedPage
        });
        
        const { onFocusChanged } = this.props;
        if (onFocusChanged && typeof onFocusChanged === 'function') {
            onFocusChanged(idx);
        }
    }

    componentDidMount() {
        /* const { id, idx, setFm, children, rotate } = this.props;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0) {
            const fm = new FM({
                id : fmId,
                moveSelector : '.slideWrapper .slide',
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
        } */
    }

    componentWillReceiveProps(nextProps) {
        const { id, idx, setFm, children, rotate } = nextProps;
        const childList = React.Children.toArray(children);
        
        const fmId = idx? `${id}_${idx}`: id;
        if (childList.length !== 0) {
            const fm = new FM({
                id : fmId,
                moveSelector : '.characterSlide .slide',
                focusSelector : '.csFocusCenter',
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
        const { onSelect } = this.props
        if (typeof onSelect === 'function') {
            onSelect(event, childIdx);
        }
    }

    onFocusContainer = () => {
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

    onBlurContainer = () => {
        this.setState({
            focused: false
        });
    }

    onFocusChild = (idx) => {
        this.onFocusChanged(idx);
    }

    onChildKeyDown = (event) => {
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
    }

    render() {
        const { id, idx } = this.props;
        const { type, children, bShow } = this.props;
        const childrenWithProps = React.Children.map(children, child => React.cloneElement(child, { onFocusChanged: this.onFocusChanged, onKeyDown: this.onChildKeyDown, type: type}));

        const { currentIdx, page, focused } = this.state;
        // const wrapperClass = `slideWrap${focused? ' activeSlide': ''}${isFirst?' firstActive':''}${isLast?' lastActive':''}`;
        // const wrapperStyle = {
        //     '--page': page,
        //     'width': totalItem * itemWidth + totalItem * margin
        // };
        
        // 첫번째, 두번째 아이템에 포커스시 타이틀 업
        const isTitleUp = ((currentIdx === page || currentIdx === (page + 1)) && focused);
        const groupClass = `contentGroup${isTitleUp? ' activeSlide': ''}`;
        
        let slideTypeClass = '';
        switch(type) {
            case SlideType.KIDS_CHARACTER_HOME: slideTypeClass = 'characterSlide'; break;
            default: break;
        }

        const fmId = idx?`${id}_${idx}`: id;

        return (
            <div id={fmId} className={groupClass} style={{display: bShow? 'block': 'none'}} ref={r=>this.anchor=r}>
                <div className={slideTypeClass}>
                   {childrenWithProps}
                </div> 
                <img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-left.png`} className="leftArrow" alt=""/>
                <img src={`${appConfig.headEnd.LOCAL_URL}/kids/button/arrow-right.png`} className="rightArrow" alt=""/>
                <div className="keyWrap">
                    <span className="btnKeyOption">캐릭터 전체보기</span>
                </div>               
            </div>
        );
    }
}

export default KidsRotateSlider;