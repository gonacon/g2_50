import React from 'react';
import { HorizontalList, Focusable } from 'Navigation';
import '../../../assets/css/components/modules/SlideTypeCircle.css';

const SlideInfo = {
    GenreHome: { width: 384, height: 250, margin: 0, maxItem: 4 },
    MenuBlock: { width: 384, height: 250, margin: 0, maxItem: 4 },
    ContentBlock: { width: 384, height: 250, margin: 0, maxItem: 4 },
    EvnetBlock: { width: 384, height: 250, margin: 0, maxItem: 4 },

    // 장르메뉴 블록유형
    SlideTypeBC: { width: 384, height: 250, margin: 50, maxItem: 4 },
    SlideTypeAD: { width: 246, height: 354, margin: 40, maxItem: 6 }
}

const SlideType = {
    GENRE_HOME: "GenreHome",
    MENU_BLOCK: "MenuBlock",
    CONTENT_BLOCK: "ContentBlock",
    EVNET_BLOCK: "EvnetBlock",

    // 장르메뉴 블록유형
    SlideTypeBC: "SlideTypeBC",
    SlideTypeAD: "SlideTypeAD"
};

class KidsSlider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            listIndex: 0, 
            currentIdx: 0,
            page: 0
        };
        this.resetStateObj = this.state;
    }

    static defaultProps = {
        title: '',
        type: SlideType.TALL,
    };

    onFocused = () => {
        const { children } = this.props;
        const totalItem = children ? children.length : 0;

        // const target = document.querySelector('.genreMenuAllList.scrollWrap');
		// const x = 0, y = -850;
        // target.style.transform = `translate(${x}px, ${-850}px)`;

        this.setState({
            focused: true,
            isShowIndicator: totalItem > 4
        });

        // 각 SlideList 에 포커스 했을때, 화면 중앙으로 스크롤
        let targetSlider = document.querySelector('.detailWrapper .contentGroup.activeSlide');
        if (targetSlider) {
            let targetTop = targetSlider.offsetTop;
            document.querySelector('.wrap').scroll({ top: targetTop, left: 0, behavior: 'smooth' });
        }

        this.props.onFocus();
    }

    onBlured = () => {
        this.setState({
            focused: false,
            isShowIndicator: false
        });
    }

    onFocusChanged = (idx) => {
        const { type, children } = this.props;
        const { maxItem } = SlideInfo[type];
        const { page } = this.state;
        const totalItem = children ? children.length : 0;
        let startIndex = page;
        let endIndex = page + (maxItem - 1);
        console.log('start:', startIndex, 'end:', endIndex, 'idx:', idx);

        // 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
        if (idx < startIndex) {
            startIndex = idx;
            if (startIndex < 0) {
                startIndex = 0;
            }
            endIndex = startIndex + (maxItem - 1);
        } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
            endIndex = idx;
            if (endIndex > (maxItem - 1)) {
                endIndex = maxItem - 1;
                startIndex = endIndex - (maxItem - 1);
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
                if (startIndex >= 1) { // 첫 인덱스가 1이 아니면
                    startIndex--;
                    endIndex--;
                }
                if (startIndex < 0) {
                    startIndex = 0;
                    endIndex = maxItem - 1;
                }
            }
        }

        const changedPage = startIndex;
        this.setState({
            currentIdx: idx,
            page: changedPage
        });
    }

    componentDidMount() {

    }

    resetSlide = () => {
        console.log('==========> [RESET FOCUS]');
        this.resetStateObj.focused = true;
        this.setState(this.resetStateObj);
        //document.querySelector('.slideWrapper .slide:first-child').focus();
    }

    render() {
        const { title, type, children, index } = this.props;
        // const ref = "`block_${index}`";
        const totalItem = children ? children.length : 0;
        const { width: itemWidth, margin } = SlideInfo[type];
        const childrenWithProps = React.Children.map(children, child => React.cloneElement(child, { onFocusChanged: this.onFocusChanged }));

        const { currentIdx, page, focused, isShowIndicator } = this.state;
        const isLast = currentIdx === (totalItem - 1);
        const isFirst = currentIdx === 0;

        const wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${isFirst ? ' firstActive' : ''}${isLast ? ' lastActive' : ''}${isShowIndicator ? ' activeSlide' : ''}`;
        const wrapperStyle = {
            '--page': page,
            'width': totalItem * itemWidth + totalItem * margin
        };

        // 첫번째, 두번째 아이템에 포커스시 타이틀 업
        const isTitleUp = ((currentIdx === page || currentIdx === (page + 1)) && focused);
        const groupClass = `contentGroup${isTitleUp ? ' activeSlide' : ''}`;

        let slideTypeClass = '';
        switch (type) {
            case SlideType.CONTENT_BLOCK: slideTypeClass = 'slideTypeB_C'; break;
            
            case SlideType.SlideTypeAD: slideTypeClass = 'slideTypeAD'; break;
            case SlideType.SlideTypeBC: slideTypeClass = 'slideTypeBC'; break;
            default: break;
        }

        return (
            <HorizontalList onFocus={this.onFocused} onBlur={this.onBlured} rotatefocus={true}>
                <div className={groupClass} data-index={index}>
                    <div className={slideTypeClass}>
                        <div className="title">{title}</div>
                        <div className={wrapperClass}>
                            <div className="slideCon listStyle3 type5">
                                <div className="slideWrapper" style={wrapperStyle}>
                                    {childrenWithProps}
                                    <Focusable onFocus={() => this.resetSlide()}><span></span></Focusable>
                                </div>
                            </div>
                            {
                                isShowIndicator ? 
                                <span>
                                    <div className="leftArrow"></div>
                                    <div className="rightArrow"></div>
                                </span> : ''
                            }
                        </div>
                    </div>
                </div>
            </HorizontalList>
        );
    }
}

export {
    SlideInfo,
    SlideType,
    KidsSlider as default
};