import React, { Component, Fragment } from 'react';
import isNil from 'lodash/isNil';

import { SlideInfo, SlideType } from './SlideInfo';
import 'ComponentCss/modules/SlideTypeA.css';
import 'ComponentCss/modules/SlideTypeB.css';
import 'ComponentCss/modules/SlideTypeC.css';
import 'ComponentCss/modules/SlideTypeCircle.css';
import 'ComponentCss/modules/SlideTypeBD.css';
import 'ComponentCss/modules/SlideGenreBlock.css';
import 'Css/synopsis/SynopShortAppearanceNone.css';
import 'Css/synopsis/SynopSeriesSpecialMovie.css';
import 'ComponentCss/modules/EventSlideTypeA.css';
import 'ComponentCss/modules/EventSlideTypeB.css';
import 'ComponentCss/modules/EventSlideTypeC.css';
import 'ComponentCss/modules/SlideTypeAC.css';
import 'ComponentCss/modules/SlideTypeAB.css';
import 'Css/monthly/SlideVoucher.css';
import FM from '../../../supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import ToolGuide from '../GuideTooltip';
import StbInterface from 'Supporters/stbInterface';
import constants from 'Config/constants';
import _ from 'lodash';

const { 
    Keymap: { 
        ENTER, 
        FAV, 
        FAV_KEY,
        NEXT_JUMP_KEY,
        PRE_JUMP_KEY,
        SKIP_NEXT,
        SKIP_PREV
    } 
} = keyCodes;

class G2NaviPeopleSlider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            currentIdx: -1,
            page: 0,
            peopleFocused: 0,
        };

        this.anchor = null;
        this.fm = null;
        this.synopCount = Number(StbInterface.getProperty(constants.STB_PROP.SOUND_TOOLTIPGUIDE_COUNT_SYNOPSIS));
        
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
        console.error('?????????');
    }

    onFocusChanged = (idx, dontSlide) => {
        // console.error('onFocusCHanged.dontSlide:', dontSlide);
        const { type, children } = this.props;
        const { maxItem } = SlideInfo[type];
        const { page } = this.state;
        const totalItem = children ? children.length : 0;
        let startIndex = page;
        let endIndex = page + (maxItem - 1);

        if (maxItem === 2) { // 2???????????? ????????? ????????? ?????? ??????.
            const nextStart = Math.floor( idx / 2);
            if (startIndex !== nextStart) {
                startIndex = nextStart;
            }
        } else {
            // ???????????? ?????? ???????????? ??????????????? ???????????? ??????
            if (idx < startIndex) {
                startIndex = idx;
                if (startIndex < 0) {
                    startIndex = 0;
                }
                endIndex = startIndex + (maxItem - 1);
            } else if (idx > endIndex) { // ???????????? ?????? ???????????? ??????????????? ??????????????????
                endIndex = idx;
                if (endIndex > (maxItem - 1)) {
                    startIndex = endIndex - (maxItem - 1);
                    endIndex = maxItem - 1;
                }
            } else { // ???????????? ?????? ???????????? Set ?????? ????????????
                if (idx === endIndex && (maxItem !== 1)) {
                    if (endIndex < totalItem) { // ????????? ????????? + 1 ?????? totalItem ?????? ?????? ?????? ?????????
                        endIndex++;
                        startIndex++;
                    }
                    if (startIndex + maxItem > totalItem) {
                        startIndex = totalItem - maxItem;
                        endIndex = startIndex + maxItem - 1;
                    }
                } else if (idx === startIndex && (maxItem !== 1)) {
                    if (startIndex >= 1) { // ??? ???????????? 1??? ?????????
                        startIndex--;
                        endIndex--;
                    }
                    if (startIndex < 0) {
                        startIndex = 0;
                        endIndex = maxItem - 1;
                    }
                }
            }
        }

        const changedPage = startIndex;
        if (!dontSlide) {
            this.setState({
                currentIdx: idx,
                page: changedPage
            });
            if (this.fm) {
                this.fm.setListInfo({
                    page: changedPage
                });
            }
        } else {
            this.setState({
                currentIdx: idx,
            });
        }
        
        const { onFocusChanged } = this.props;
        if (onFocusChanged && typeof onFocusChanged === 'function') {
            onFocusChanged(idx);
        }
    }

    componentWillUnmount() {
        const { id, idx, setFm } = this.props;
        const fmId = Number.isInteger(idx)? `${id}_${idx}` : id;
        if (typeof setFm === 'function') {
            setFm(fmId, null);
        }
    }

    componentDidMount() {
        const { id, idx, setFm, children, rotate, type } = this.props;
        const childList = React.Children.toArray(children);

        const fmId = Number.isInteger(idx)? `${id}_${idx}` : id;
        if (typeof setFm === 'function') {
            const fm = new FM({
                type: 'BLOCK',
                id: fmId,
                containerSelector: '.slideWrapper',
                focusSelector: '.csFocus',
                row: 1,
                col: childList.length,
                focusIdx: 0,
                page: 0, // ????????? ??????????????? ???????????? ?????? ??????. 
                maxItem: SlideInfo[type].maxItem,
                startIdx: 0,
                lastIdx: childList.length - 1,
                bRowRolling: rotate,
                anchor: this.anchor,
                onFocusContainer: this.onFocusContainer,
                onBlurContainer: this.onBlurContainer,
                onFocusChild: this.onFocusChild,
                onFocusKeyDown: this.onFocusKeyDown
            });
            setFm(id, fm);
            this.fm = fm;
        }
    }

    componentWillReceiveProps(nextProps) {
        const { children } = nextProps;
        const childList = React.Children.toArray(children);
        
        if (this.fm) {
            this.fm.setListInfo({
                col: childList.length,
                lastIdx: childList.length - 1
            })
        }
    }

    onFocusKeyDown = (event, childIdx) => {
        const { maxItem } = SlideInfo[this.props.type];
        const { keyCode } = event;
        const {
            idx,
            onKeyDown,
            onSelectChild,
            onSelectFavorite,
        } = this.props;
        const { page } = this.state;
        
        if (typeof onKeyDown === 'function') {
            onKeyDown(event, childIdx);
        }

        switch(keyCode) {
            case ENTER:
                if (typeof onSelectChild === 'function') {
                    onSelectChild(idx, childIdx);
                }
                break;
            case FAV:
            case FAV_KEY:
                if ( onSelectFavorite && typeof onSelectFavorite === 'function' ) {
                    onSelectFavorite(idx, childIdx);
                }
                break;
            case NEXT_JUMP_KEY:
            case SKIP_NEXT:
                if (this.fm) {
                    let nextIdx = this.fm.listInfo.curIdx + maxItem;
                    if (nextIdx > this.fm.listInfo.lastIdx) {
                        nextIdx = this.fm.listInfo.lastIdx
                    }
                    
                    let nextPage = page + maxItem;
                    if (nextPage > this.fm.listInfo.col - maxItem) {
                        nextPage = this.fm.listInfo.col - maxItem;
                    }
                    this.setState({
                        page: nextPage
                    }, () => {
                        this.fm.setFocusByIndex(nextIdx);
                    });
                }
                break;
            case PRE_JUMP_KEY:
            case SKIP_PREV:
                if (this.fm) {
                    let nextIdx = this.fm.listInfo.curIdx - maxItem;
                    if (nextIdx < 0) {
                        nextIdx = 0;
                    }

                    let prevPage = page - maxItem;
                    if (prevPage < 0) {
                        prevPage = 0;
                    }
                    this.setState({
                        page: prevPage
                    }, () => {
                        this.fm.setFocusByIndex(nextIdx);
                    })
                }
                break;
            default: break;
        }
    }

    onFocusContainer = (direction) => {
        const { onSlideFocus, scrollTo, type} = this.props;
        const { peopleFocused } = this.state;
        if (onSlideFocus && this.container) {
            onSlideFocus(this.container, direction);
        }
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
        let peopleFocusCount = peopleFocused;
        
        if(this.synopCount <= 3){
            peopleFocusCount += 1;
        }
        this.setState({
            focused: true,
            peopleFocused : peopleFocusCount
        });
    }

    onBlurContainer = () => {
        this.setState({
            focused: false
        });
    }

    onFocusChild = (idx, dontSlide) => {
        // console.error('onFocusChild.dontSlide', dontSlide);
        if ( this.props.onSlideFocusChild && typeof this.props.onSlideFocusChild === 'function' ) {
            this.props.onSlideFocusChild(idx);
        }
        this.onFocusChanged(idx);
    }

    onChildKeyDown = (event) => {
        // console.error('onChildKeyDown:', event);
        const { onKeyDown } = this.props;
        if (onKeyDown && typeof onKeyDown === 'function') {
            onKeyDown(event);
        }
    }

    render() {
        // console.log('%c SLIDE CONTAINER getFm', 'color: red; background: yellow', );
        const { id, idx } = this.props;
        const { title, type, children, bShow, allMenu, isShowCount, menuBlockClass, isHome, btnPurchase } = this.props;
        const { currentIdx, page, focused, peopleFocused } = this.state;        
        const isShowCnt = isShowCount !== undefined ? isShowCount : true;
        const totalItem = children ? children.length : 0;
        const { maxItem, margin, width } = SlideInfo[type];
        const childrenWithProps = React.Children.map(children, (child, childIdx) => 
            React.cloneElement(child, { 
                onFocusChanged: this.onFocusChanged, 
                onKeyDown: this.onChildKeyDown, 
                type: type, currentIdx, 
                parentFocused: focused,
                bFirst: childIdx === page,
                bLast: childIdx === (page + maxItem - 1),
                focused: currentIdx === childIdx,
            })
        );

        let isLast = ( totalItem - maxItem ) === page;
        let bLeftAffordance = page !== 0;
        let bRightAffordance = (page + maxItem) < totalItem;
        if( totalItem <= maxItem ) isLast = true;
        const isLastItem = (currentIdx - page ) === ( maxItem - 1 );
        //const isLastItemOfguide = (currentIdx - page ) >= ( maxItem - 2 ); //??????????????? ???????????? ???????????? 'VOD ?????????'(SlideType.BOOKMARK_VOD)
        const isFirst = page === 0;
        let wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' firstActive' : ''}${!isLast ? ' lastActive' : ''}${bLeftAffordance? ' leftActive': ''}${bRightAffordance? ' rightActive': ''}`;

        let wrapperStyle = {
            '--page': page,
            'width': totalItem * width + totalItem * margin
        };

        let leftArrowClass = 'leftArrow';
        let rightArrowClass = 'rightArrow';

        // ?????????, ????????? ???????????? ???????????? ????????? ???
        const isTitleUp = ((currentIdx === page || currentIdx === (page + 1)) && focused);
        let groupClass = `contentGroup${isTitleUp ? ' activeSlide' : ''}`;
        // let menuBlockGroupClass = '';
        let slideTypeClass = '';
        let containerClass = '';
        let titleClass = 'title';
        
        switch (type) {           
            // case SlideType.ACTOR_TEXT:
            //     slideTypeClass = 'slideTypeG';
            //     containerClass = ' listStyle3 type5';
            //     break;
            // case SlideType.ACTOR_IMAGE: slideTypeClass = 'slideTypeF'; break;
            case SlideType.SYNOPSHORT:
                slideTypeClass = 'slideTypeE';
                containerClass = ' listStyle2 type3';
                titleClass = 'titleStyle2';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                break;
            case SlideType.PEOPLE:
                slideTypeClass = 'slideTypeF';
                containerClass = ' listStyle3 type5';
                titleClass = 'titleStyle2';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                break;
            case SlideType.PEOPLE_NONE: case SlideType.PEOPLESERIES_NONE:
                slideTypeClass = 'slideShortAppearanceNone';
                containerClass = ' listStyle2 type4';
                leftArrowClass = 'slideLeft';
                rightArrowClass = 'slideRight';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                break;
            
            default: break;
        }
        let tooltipTop = 60;
        if(type === 'PEOPLESERIES_NONE') {
            tooltipTop = -10;
        }
        const fmId = isNil(idx) ? id : `${id}_${idx}`;

        let possn = 'N';
        if (!_.isEmpty(btnPurchase)) {
            for (const item of btnPurchase.purchase) {
                if (item.possn_yn === 'Y') {
                    possn = 'Y';break;
                }
            }
        }
        return (
            <div id={fmId} className={`${groupClass}`} style={{ display: bShow ? 'block' : 'none' }} ref={r => this.anchor = r}>
                <div className={slideTypeClass}>
                    {/* {
                        (type === SlideType.EVENT || type === SlideType.EVENT_COUPLE || type === SlideType.SYNOPGATEWARY || type === SlideType.SYNOPSERIES_INFO_NONE) ? 
                        null : <div className={titleClass}>{title}</div>
                    } */}
                    <div className={titleClass}>{title}
                        {
                            (title === '???????????????' && possn === 'N') &&
                            <Fragment>
                                <span className="bar"></span>
                                <span className="subText">
                                    ?????? ????????? ????????? ?????? ??? ?????? ???????????????.
                                </span>
                            </Fragment>
                        }
                    </div>
                    {
                        // (this.synopCount <= 3 && focused && peopleFocused === 1 && (type === SlideType.PEOPLE || type === SlideType.PEOPLE_NONE || type === SlideType.PEOPLESERIES_NONE))?
                        this.synopCount <= 3 && focused && peopleFocused === 1 ?
                        <ToolGuide guideTitle="??????????????? ????????? ???????????? ????????? ????????? ?????? ????????? ?????????." top={tooltipTop} left="200" aniTime="3" delayTime="0" arrowClass="none" />  : null
                    }
                    <div className={wrapperClass}>
                        <div className={`slideCon${containerClass}`}>
                            <div className="slideWrapper" style={wrapperStyle} ref={r => this.container = r}>
                                {childrenWithProps}
                            </div>
                        </div>
                        {/* {
                            ( (type === SlideType.RECENT_VOD || type === SlideType.BOOKMARK_VOD) && !isHome )// || type === SlideType.
                                ? <span className="keyGuideWrap"><span className="btnKey"><span className="btnKeyBlue"></span> / <span className="btnKeyOption"></span>????????????</span></span>
                                : null
                        } */}
                        {isShowCnt && !(allMenu && currentIdx === 0) && <div className="slideCount">
                            <span className="current">
                                {currentIdx + (allMenu ? 0 : 1)}
                            </span>
                            &nbsp;/&nbsp;
                            {totalItem - (allMenu ? 1 : 0)}
                        </div>}
                        <div className={leftArrowClass}></div>
                        <div className={rightArrowClass}></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default G2NaviPeopleSlider;