import React, { Component } from 'react';
import styled from 'styled-components';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import { SlideInfo, SlideType, DIR } from './SlideInfo';

const KEY = keyCodes.Keymap;

const animationDuration = 0;
const keyDelayTime = 1;

class G2AEDSlider extends Component {
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

    // 추후 적용 예정인 페이징기능을 위한 props;
    static defaultProps = {
        page: 1,
        totalPage: 1,
        chunkSize: 30,
        fetch: function() {}
    };

    onFocused = (dir) => {
        const { onSlideFocus, scrollTo } = this.props;
        if (onSlideFocus && this.container) {
            onSlideFocus(this.container, dir);
        } 
        if (scrollTo) {
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

    // 특정 idx 로 포커스를 변경할때 호출됨.
    onFocusChanged = (idx, page) => {
        const { animation } = this.state;
        if (animation) {
            console.error('on animation => return');
            return;
        }
        // console.error(`[${this.props.id}${this.props.idx? `_${this.props.idx}`:''}]AEDSlider.onFocusChanged`, idx, page);

        if (isNaN(idx) || idx === undefined) {
            console.error('isNan', idx);
            idx = this.fm.listInfo.focusIdx;
        }

        if (isNaN(page) || page === undefined) {
            page = 0;
            idx = this.fm.listInfo.focusIdx;
            console.error(' ===> page', page);
        }
        
        let focusedIdx = idx;
        if (page !== undefined) { // setFocusByIndexOnPage 로 호출된 경우
            const maxItem = this.fm.listInfo.maxItem;
            // console.error('maxItem', maxItem);
            if (idx - page === maxItem - 1) { // 마지막 슬라이드로 포커스가 간경우
                
                focusedIdx = idx;
                if (focusedIdx !== this.fm.listInfo.lastIdx) {
                    this.slideByDirection(DIR.RIGHT, page+1);
                    
                }
            } else if (idx - page === 0 && page !== 0) { // 왼쪽에 슬라이드공간이 있는데 첫번째
                this.slideByDirection(DIR.LEFT, page-1);
            }
        } else { // setFocus 로 호출된 경우
            // TODO: idx 가 page 를 벗어나는경우 처리
        }
        // console.error('AEDSlider.onFocusChanged:',idx);
        // TODO: 화면을 벗어나는 경우 체크해서 슬라이드해줘야됨.
        // console.error('================= page:', page);
        
        const { focusedIdx: prevIdx } = this.state;
        if (prevIdx !== focusedIdx) {
            this.setState({
                focusedIdx
            });
        }
    }

    onKeyDown = (event) => {
        const { 
            focusedIdx,
            viewIdx: viewStartIdx,
        } = this.state;
        const { onKeyDown } = this.props;
        if (onKeyDown) {
            onKeyDown(event, focusedIdx);
        }

        const { animation } = this.state;
        if (animation) {
            return;
        }

        const {
            id,
            idx,
            children,
            type
         } = this.props;
        const maxItem = SlideInfo[type].maxItem;
        const list = React.Children.toArray(children);
        const totalItem = list.length;
        
        
        const viewEndIdx = viewStartIdx + maxItem - 1;
        let nextViewStart = viewStartIdx;
        let nextFocusIdx = focusedIdx;

        switch(event.keyCode) {
            case KEY.LEFT:
                nextFocusIdx --;
                if (nextFocusIdx < 0) {
                    nextFocusIdx = 0;
                }

                // view 가 이동해야되는지 체크해서 slideByDirection를 사용해서 view 이동
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
                if (this.fm) {
                    // console.error('AEDSlider.onKeyDown => fm의 curIdx 변경', nextFocusIdx);
                    this.fm.setListInfo({
                        curIdx: nextFocusIdx
                    });
                }

                if (viewStartIdx !== nextViewStart) {
                    // console.error('G2AEDSlider.slideTo', nextViewStart);
                    this.slideByDirection(DIR.LEFT, nextViewStart);
                    if (this.fm) {
                        this.fm.setListInfo({
                            page: nextViewStart
                        });
                    }
                }
                return true;

            case KEY.RIGHT:
                nextFocusIdx ++;
                if (nextFocusIdx >= totalItem) {
                    nextFocusIdx = totalItem -1;
                }

                // view 가 이동해야되는지 체크해서 slideByDirection를 사용해서 view 이동
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
                if (this.fm) {
                    // console.error('AEDSlider.onKeyDown => fm의 curIdx 변경', nextFocusIdx);
                    this.fm.setListInfo({
                        curIdx: nextFocusIdx
                    });
                }

                if (viewStartIdx !== nextViewStart) {
                    // console.error('G2AEDSlider.slideTo', nextViewStart);
                    this.slideByDirection(DIR.RIGHT, nextViewStart);
                    if (this.fm) {
                        this.fm.setListInfo({
                            page: nextViewStart
                        });
                    }
                }
                return true;
            case KEY.ENTER:
                const { onSelectChild } = this.props;
                if (onSelectChild) {
                    onSelectChild(idx, focusedIdx);
                }
                break;
            case KEY.FAV:
            case KEY.FAV_KEY:
                const { onSelectFavorite } = this.props;
                if (onSelectFavorite) {
                    onSelectFavorite(idx, focusedIdx);
                }
                break;
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
        // console.error('AEDSlider.slideByDirection', dir, nextViewIdx);
        const { type } = this.props;
        const slideInfo = SlideInfo[type];
        if (dir === DIR.LEFT) {
            const offsetX = slideInfo.width + slideInfo.margin;
            this.setState({
                offsetX,
                animation: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        animation: false,
                        offsetX: 0,
                        viewIdx: nextViewIdx
                    });
                    if (this.fm) {
                        this.fm.setListInfo({
                            page: nextViewIdx
                        })
                    }
                }, animationDuration + keyDelayTime)
            });
        } else if (dir === DIR.RIGHT) {
            const offsetX = -(slideInfo.width + slideInfo.margin);
            this.setState({
                offsetX,
                animation: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        animation: false,
                        offsetX: 0,
                        viewIdx: nextViewIdx
                    });
                    if (this.fm) {
                        this.fm.setListInfo({
                            page: nextViewIdx
                        })
                    }
                }, animationDuration + keyDelayTime);
            });
        }
    }

    componentDidMount() {
        const { id, idx, setFm, type, children, rotate } = this.props;
        const maxItem = SlideInfo[type].maxItem;
        const childList = React.Children.toArray(children);
        const fmId = Number.isInteger(parseInt(idx, 10))? `${id}_${idx}`: id;
        const fm = new FM({
            id: fmId,
            type: 'FAKE',
            row: 1,
            col: childList.length,
            focusIdx: 0,
            page: 0,
            maxItem,
            curIdx: 0,
            startIdx: 0,
            lastIdx: childList.length - 1,
            bRowRolling: rotate,
            onFocusKeyDown: this.onKeyDown,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
            onFocusChild: this.onFocusChanged
        });
        setFm(id, fm);
        this.fm = fm;
        this.setState({
            focusedIdx: 0
        });
    }

    componentWillReceiveProps(nextProps) {
        const { children} = this.props;
        const childList = React.Children.toArray(children);
        if (this.fm) {
            this.fm.setListInfo({
                col: childList.length,
                lastIdx: childList.length - 1
            })
        }
        
    }

    componentWillUnmount() {
        const { id, idx, setFm } = this.props;
        const fmId = Number.isInteger(parseInt(idx, 10))? `${id}_${idx}`: id;
        if (setFm) {
            setFm(fmId, null);
        }
    }
    
    render() {
        const { 
            children,
            type,

            id,
            idx,
            title,
            bShow,
            allMenu,

            isHome,
            isShowCount,
            menuBlockClass
         } = this.props;

        const { 
            viewIdx,
            focused, 
            focusedIdx,
            animation,
            offsetX,
        } = this.state;
        
        const isShowCnt = isShowCount === undefined? true: isShowCount;
        
        let totalOffsetX = offsetX;

        const childList = children? React.Children.toArray(children): null;
        const totalItem = childList.length;
        const { maxItem, margin, width } = SlideInfo[type];

        if (!childList) {
            this.setState({ fakeChildren: null });
        }

        const headIdx = viewIdx - 1;
        
        let head = null;
        
        if (headIdx >= 0) {
            head = React.cloneElement(children[headIdx], {
                idx: headIdx,
                focused: focusedIdx === headIdx && focused,
                type,
                bFirst: headIdx === viewIdx,
                bLast: headIdx === viewIdx + maxItem - 1
            });
        }

        if (head) {
            totalOffsetX -= (width + margin);
        }

        let viewList = null;
        const views = childList.slice(viewIdx, viewIdx + maxItem);
        viewList = React.Children.map(views, (child, index) => {
            const idx = viewIdx + index;
            return React.cloneElement(child, { 
                idx,
                type,
                focused: focusedIdx === idx && focused,
                bFirst: idx === viewIdx,
                bLast: idx === viewIdx + maxItem - 1
            });
        });

        const tailIdx = viewIdx + maxItem;
        let tail = null;
        if (tailIdx < childList.length) {
            tail = React.cloneElement(children[tailIdx], {
                idx: tailIdx,
                focused: focusedIdx === tailIdx && focused,
                type,
                bFirst: tailIdx === viewIdx,
                bLast: tailIdx === viewIdx + maxItem - 1
            });
        }

        // 각종 플레그 체크
        const isTitleUp = ((focusedIdx === viewIdx || focusedIdx === (viewIdx + 1)) && focused);
        let bLeftAffordance = viewIdx !== 0;
        let bRightAffordance = (viewIdx + maxItem) < totalItem;

        let leftArrowClass = 'leftArrow';
        let rightArrowClass = 'rightArrow';

        let groupClass = `contentGroup${isTitleUp ? ' activeSlide' : ''}`;

        const isFirst = viewIdx === 0;
        // let isLast = ( totalItem - maxItem ) === viewIdx;
        let isLast = !(focusedIdx === viewIdx + maxItem - 1 || focusedIdx === viewIdx + maxItem - 2);
        const isLastItem = (focusedIdx - viewIdx) === (maxItem -1);
        const isLastItemOfguide = (focusedIdx - viewIdx) >= (maxItem - 2);
        if( totalItem <= maxItem ) isLast = true;

        let slideTypeClass = '';
        let containerClass = '';
        let titleClass = 'title';
        let isTitle = true;

        let wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' firstActive' : ''}${!isLast ? ' lastActive' : ''}${bLeftAffordance? ' leftActive': ''}${bRightAffordance? ' rightActive': ''}`;

        switch (type) {
            case SlideType.TALL: 
                slideTypeClass = 'slideTypeA';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${!isLast ? ' lastActive' : ''}`;
                //ToDo 180514 쏘/좌우 화살표 인디케이터 표시를 위해 첫페이지와 마지막페이지 확인하여 수정 필요
            break;
            case SlideType.BOOKMARK_VOD: 
                slideTypeClass = 'slideTypeAE'; 
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' firstActive' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItemOfguide ? ' lastActive' : ''}`;
                break;
            case SlideType.WIDE: slideTypeClass = 'slideTypeB'; break;
            case SlideType.EVENT:
                slideTypeClass = 'eventSlideTypeC';
                isTitle = false;
                break;
            case SlideType.EVENT_COUPLE:
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' firstActive' : ''}${isLastItem ? ' lastActive' : ''}${bLeftAffordance? ' leftActive': ''}${bRightAffordance? ' rightActive': ''}`;
                slideTypeClass = 'eventSlideTypeB';
                isTitle = false;
                break;
            case SlideType.EVENT_TRIPLE:
                slideTypeClass = 'eventSlideTypeA';
                isTitle = false;
                break;
            case SlideType.MENU_BLOCK:
                slideTypeClass = 'slideGenreBlock';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}`;
                groupClass = `${groupClass} ${menuBlockClass}`;
                break;
            case SlideType.WATCHING_VOD: slideTypeClass = 'slideTypeB'; break;
            case SlideType.RECENT_VOD: slideTypeClass = 'slideTypeBD'; break;
            case SlideType.EDITABLE_RECENT_VOD: slideTypeClass = 'slideTypeBB'; break;
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
            case SlideType.SYNOPSHORT:
                slideTypeClass = 'slideTypeE';
                containerClass = ' listStyle2 type3';
                titleClass = 'titleStyle2';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${isFirst ? ' firstActive' : ''}${isLast ? ' lastActive' : ''}${bLeftAffordance? ' leftActive': ''}${bRightAffordance? ' rightActive': ''}`;
                break;
            case SlideType.PEOPLE:
                slideTypeClass = 'slideTypeF';
                containerClass = ' listStyle3 type5';
                titleClass = 'titleStyle2';
                break;
            case SlideType.PEOPLE_NONE: case SlideType.PEOPLESERIES_NONE:
                slideTypeClass = 'slideShortAppearanceNone';
                containerClass = ' listStyle2 type4';
                leftArrowClass = 'slideLeft';
                rightArrowClass = 'slideRight';
                break;
            case SlideType.SYNOPSERIES_INFO:
                slideTypeClass = 'slideTypeG';
                containerClass = ' type3';
                leftArrowClass = 'slideLeft';
                rightArrowClass = 'slideRight';
                break;
            case SlideType.KIDS_MONTHLY:
                slideTypeClass = 'kidsMonthlySlide';
                containerClass = '';
                titleClass = '';
                break;
            case SlideType.KIDS_TYPE_CIRCLE:
                slideTypeClass = 'slideTypeCircle';
                containerClass = ' listStyle3 type5';
                break;
            case SlideType.KIDS_TYPE_B:
                slideTypeClass = 'slideTypeB';
                containerClass = '';
                break;
            case SlideType.KIDS_TYPE_C:
                slideTypeClass = 'slideTypeC';
                containerClass = '';
                break;
            case SlideType.SYNOPSHORT_REVIEW:
                slideTypeClass = 'shortReviewSlide';
                containerClass = '';
                titleClass = 'titleStyle2';
                leftArrowClass = 'slideLeft';
                rightArrowClass = 'slideRight';
                break;
            case SlideType.SYNOPSERIES:
                slideTypeClass = 'slideSpecialMovie';
                containerClass = '';
                titleClass = 'titleStyle1';
                break;
            case SlideType.SYNOPSHORT_STEEL:
                slideTypeClass = 'steelSlide';
                titleClass = '';
                break;
            case SlideType.EDITABLE_BOOKMARK_LIST:
                slideTypeClass = 'slideTypeAC'; break;
            case SlideType.MONTHLY:
                slideTypeClass = 'SlideVoucher';
                titleClass = 'slideTitle';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                break;
            case SlideType.HORIZONTAL:
                slideTypeClass = 'slideTypeC';
                titleClass = 'title';
                break;
            case SlideType.SYNOPGATEWARY:
                slideTypeClass = 'slideTypeAB';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                isTitle = false;
                break;
            case SlideType.RECOMMEND:
                slideTypeClass = 'packageProductSlide';
                break;
            case SlideType.SYNOPSERIES_INFO_NONE:
                slideTypeClass = 'slideTypeG noneType';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${isFirst ? ' firstActive' : ''}${bLeftAffordance ? ' leftActive' : ''}${bRightAffordance ? ' rightActive' : ''}${isLastItem ? ' lastActive' : ''}`;
                containerClass = ' type3';
                leftArrowClass = 'slideLeft';
                rightArrowClass = 'slideRight';
                isTitle = false;
                break;
            case SlideType.SEARCH_MAIN:
                slideTypeClass = 'slideTypeSearch';
                wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' firstActive' : ''}${!isLast ? ' lastActive' : ''}${bLeftAffordance? ' leftActive': ''}${bRightAffordance? ' rightActive': ''}`;
                break;
            default: break;
        }

        const bKeyGuide = (type === SlideType.RECENT_VOD || type === SlideType.BOOKMARK_VOD) && !isHome;
        const fmId = idx === undefined? id: `${id}_${idx}`;
        
        const fakeChildren = [];
        fakeChildren.push(head);
        fakeChildren.push(viewList);
        fakeChildren.push(tail);

        const containerStyle = {
            justifyContent: 'flex-start',
            transition: `transform ${animation? animationDuration: 0}ms ease-in-out `,
            transform: `translateX(${totalOffsetX}px)`
        }

        return(
            <div id={fmId} className={groupClass} style={{display: bShow? 'block': 'none'}} ref={r=>this.anchor=r}>
                <div className={slideTypeClass}>
                    {isTitle && <div className={titleClass}>{title}</div>}
                    <div className={wrapperClass}>
                        <div className={`slideCon${containerClass}`}>
                            <div className="slideWrapper" style={containerStyle} ref={r=>this.container=r}>
                                {fakeChildren}
                            </div>
                        </div>
                        {bKeyGuide && <span className="keyGuideWrap">
                            <span className="btnKey">
                                <span className="btnKeyBlue"></span> / 
                                <span className="btnKeyOption"></span>목록삭제
                            </span>
                        </span>}
                        {isShowCnt && !(allMenu && focusedIdx === 0) && <div className="slideCount">
                            <span className="current">
                                {focusedIdx + (allMenu? 0: 1)}
                            </span>
                            &nbsp;/&nbsp;
                            {totalItem - (allMenu? 1: 0)}
                        </div>}
                        <div className={leftArrowClass}></div>
                        <div className={rightArrowClass}></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default G2AEDSlider;