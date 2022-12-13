import React, { Component } from 'react';
import PropsTypes from 'prop-types';


const log = function() { console.error(...arguments); }
// const log = function () { }

const wrapperStyle = {
    height: 1080,
    //  overflowY: 'hidden',
    // border: 'solid 1px #F00',
};

// 테스트용 viewport offsetTop 
const viewOffsetTop = 80;
const viewMargin = 250; // 제일 큰 슬라이더나 contentGroup 의 사이즈로 정해야됨.

const scrollAnimationDuration = 180;

class ContentContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fakeTop: 0,
            animation: false,
            isProcessing: false,
        };

        // 실제 스크롤 높이는 숨겨진 높이 + 가상 top 이다.
        // realTop = hiddenTopHeight + fakeTop
        // realTop === scrollTop
        this.realTop = 0;
        this.marginTop = 0;
        this.hiddenTopHeight = 0; // viewport 상단에 hidden 된 height
        this.hiddenBottomHeight = 0; // viewport 하단에 hidden 된 height

        // 모든 자식 ContentGroup은 mount시 숨겨진 높이를 더해서 실제 rect로 등록된다.
        this.contentList = new Map();

        // 현재 화면에 랜더된 contentGroup 리스트
        this.viewContentList = new Map();
    }

    static childContextTypes = {
        ContentContainer: PropsTypes.object
    }

    getChildContext() {
        return {
            ContentContainer: this
        };
    }

    isLineCollided(a1, a2, b1, b2) {
        return a2 >= b1 && b2 > a1;
    }

    // 하위 콤포넌트에서 포커스 발생시 스크롤중인지 체크해서 포커스 자체를 막아야됨.
    isBusy = () => {
        const { isProcessing } = this.state;
        return isProcessing;
    }

    // 신규로 didMount 된 ContentGroup 이 didMount 시점에 자신의 rect를 등록
    addRect = ({content, rect, idx}) => {
        // TODO: viewport 상단과 하단에 위치하느냐에 따라  realTop 을 계산해야됨 
        const realRect = rect;
        realRect.top = this.hiddenTopHeight + rect.top; // 현재 hiddenHeight 반영한 실제 rect 로 보정
        this.contentList.set(content, realRect);
    }

    // 렌더 시점에 삭제된 contentGroup의 rect를 삭제
    deleteRect = (content) => {
        this.contentList.delete(content);
    }

    // culling 된 화면에서 삽입이 일어나므로 어느위치에 삽입이 일어났는지 계산하기 어려움. 
    // 그래서 동적인 삽입 이후에 호출되어야 하고, 호출시 삽입위치의 content를 넘겨 주어야 함.
    // 넘겨받은 콘텐츠 바로 위에 삽입이 일어났다고 가정하고 전체 위치 재계산.
    adjustBy = (contentAtInsert) => {
        console.error('adjustBy', contentAtInsert);
        if (!contentAtInsert) {
            this.adjust();
            return;
        }
        // 삽입 위치의 content 위치를 계산.
        let insertingRect = this.contentList.get(contentAtInsert);
        if (!insertingRect) {
            console.error('삽입 기준 content를 찾을 수 없습니다');
            return;
        }
        const insertingTop = insertingRect.top;

        const addedContents = new Map();
        let insertedHeight = 0;
        for (let [key, value] of this.contentList) {
            if (!value.added) { // 신규로 추가된 Group 
                value.added = true;
                addedContents.set(key, value);
                insertedHeight += value.height;
                this.contentList.set(key, value);
            }
        }

        if (addedContents.size === 0) {
            console.error('삽입된 content 가 없습니다');
            return;
        }
        
        // 현재 view 에서 삽입이 일어난 top 위치 계산
        let insertedTop = Array.from(addedContents)[0][1].top;
        
        // 1. 추가된 content 를 삽입위치 기준으로 보정
        // 2. 기존에 content 중 삽입위치 보다 하단(큰)것들은 삽입된 height 를 추가해서 보정. 
        for (let [content, rect] of this.contentList) {
            const bAdded = addedContents.get(content)? true: false;
            if (bAdded) {
                rect.top = rect.top - insertedTop + insertingTop;
                rect.bottom = rect.bottom - insertedTop + insertingTop;
                this.contentList.set(content, rect);
            } else if (rect.top >= insertingTop) {
                rect.top += insertedHeight;
                rect.bottom += insertedHeight;
                this.contentList.set(content, rect);
            }
        }

        const rectList = [];
        for (const [content, rect] of this.contentList) {
            rectList.push(Math.round(rect.top));
        }
        // log(`[adjustBy] `, rectList, this.contentList);

        // 전체 위치 보정후 culling
        this.culling();
    }

    // 스크롤전에 didMount 시점에 정적인 랜더링시 호출됨. 
    adjust = () => {
        const { fakeTop } = this.state;
        const tops = [];
        const addedContent = new Map();
        let insertedHeight = 0; // 삽입되어서 추가된 height 를 구함.
        for (let [key, value] of this.contentList) {
            if (!value.added) { // 신규로 추가된 Group 
                const realRect = {
                    left: value.left,
                    top: value.top,
                    right: value.right,
                    bottom: value.bottom,
                    width: value.width,
                    height: value.height,
                    added: true
                };
                tops.push(realRect.top);
                addedContent.set(key, value);
                insertedHeight += realRect.height;
                this.contentList.set(key, realRect);
            }
        }

        const minTop = Math.min(...tops)
        const insertedTop = minTop;
        // viwe 의 하단에 위치했던 group들에 삽입된 height 반영.
        // 위에서 새로 삽입된 엘리먼트들은 제외해야됨.
        //log(`fakeTop: ${fakeTop}, minTop: ${minTop}, insertedTop: ${insertedTop}, insertedHeight: ${insertedHeight}`);
        
        
        // log('current view rect list', viewRectList);
        // 기존중에 viewRectList 에 있던것들은 어디로 갔는지 체크야됨.

        for (const [content, rect] of this.contentList) {
            const bAdded = addedContent.get(content)? true: false;
            const bInView = this.viewContentList.get(content)? true: false;
            if (rect.top >= insertedTop && !bAdded) {
                if (!this.viewContentList.get(content)) {
                    rect.top += insertedHeight;
                    rect.bottom += insertedHeight;
                    log('하단 Group 위치 조정:', content.contentElement, rect.top, insertedTop);
                }
            }
            // } else if (bAdded) {
            //     log('추가되서 위치조정 안됨:', content.contentElement, `[${rect.top}-${Math.round(rect.top + rect.height)}]` , insertedTop);
            // } else {
            //     log('기존중에 위치조정 안됨:', content.contentElement, rect.top, insertedTop);
            // }
        }

        
        const rectList = [];
        for (const [content, rect] of this.contentList) {
            rectList.push(Math.round(rect.top));
        }
        console.error(`[adjust] `, rectList, this.contentList);
        this.culling();
    }

    // 현재 보여지는 viewport 영역밖의 contentGroup은 제외처리( display: none) 
    // realScrollTop 을 기준으로 fakeScrollTop 을 재 계산.
    // 스크롤 이후 호출되거나, 동적인 엘리먼트 삽입 이후 parent(홈)으로 부터 호출된다. 
    culling = () => {
        // console.error('culling');
        // 스크롤 이후, viewport 위치 변경
        // 변경된 viewport 기준으로 contentGroup 들을  culling 처리
        // 변경된 viewport 및 contentGroup 의 hidden 처리를 animation 없이 변경.
        const containerRect = this.wrapper.getBoundingClientRect();
        const viewContentList = new Map();
        
        // 현재 화면영역 + 상하단 예비 공간이 합쳐진 영역. 이 영역밖의 contentGroup들은 display: none 처리된다.
        const viewportTop = this.realTop - viewMargin < 0? 0: this.realTop - viewMargin;
        const viewportBottom = this.realTop + containerRect.height + viewMargin;
        const viewport = { 
            left: containerRect.left,
            top: viewportTop,
            bottom: viewportBottom,
            right: containerRect.right,
            width: containerRect.width,
            height: viewportBottom - viewportTop
        }

        // hidden 처리할 child 필터링
        const filteredChild = [];
        const filteredRect = [];
        let hiddenTopHeight = 0;
        for (const [content, rect] of this.contentList) { 

            if (!this.isLineCollided(viewport.top, viewport.bottom, rect.top, rect.top + rect.height)) {
                filteredChild.push(content);
                filteredRect.push(rect);
                if (viewport.top > rect.top + rect.height) {
                    hiddenTopHeight += rect.height;
                }
                content.hide();
            } else {
                content.show();
                viewContentList.set(content, rect);
            }
        }
        this.viewContentList = viewContentList;

        
        
        const fakeTop = this.realTop - hiddenTopHeight;
        this.hiddenTopHeight = hiddenTopHeight;
        log(`culling:: fakeTop[${fakeTop}] = realTop[${this.realTop}] - hiddenHeight[${this.hiddenTopHeight}]`);;
        
        // log(`[culling] viewport: [${viewport.top}, ${viewport.bottom}], fakeTop: ${fakeTop}, realTop: ${this.realTop}, hiddenHeight: ${hiddenTopHeight}`);
        // log('[culling] viewList', this.viewContentList);

        // 여기서 culling 된 child를 실제 hidden 처리할때
        // 1. ProxyComponent 일경우 render에서 처리
        // 2. Component 의 instance 일 경우 직접 인스턴스 억세스로 반영.

        this.setState({
            isProcessing: false,
            fakeTop
        });
    }

    // 
    scrollTo = (content, marginTop = 0) => {
        log('scrollTo', content, marginTop);
        const contentElement = content.getContentElement();
        const { isProcessing } = this.state;
        if (isProcessing) {
            // 스크롤 프로세스 중이면 리턴
            return;
        }

        let contentRect = null;
        for (const[key, rect] of this.contentList) {
            if (key.contentElement === contentElement) {
                contentRect = rect;
            }
        }
        if (!contentRect) {
            console.error('scrollTo 의 엘리먼트가 없음');
            return;
        }

        

        // 일단 스크롤
        this.marginTop = marginTop;
        this.realTop = contentRect.top - marginTop;

        log(`scrollTo:: realTop[${this.realTop}] = contentTop[${contentRect.top}] - marginTop[${marginTop}]`);


        const fakeTop = this.realTop - this.hiddenTopHeight; // 테스트용 뷰포트 offset 을 추가
        log(`scrollTo:: fakeTop[${fakeTop}] = -(realTop[${this.realTop}] - hiddenHeight[${this.hiddenTopHeight}])`);;
        
        // log(`[scrollTo] fakeTop: ${fakeTop}, realTop: ${this.realTop}, scrollTo: ${this.hiddenTopHeight}`);
        this.setState({
            isProcessing: true,
            animation: true,
            fakeTop
        }, () => {
            setTimeout(() => {
                this.setState({
                    animation: false
                });
                this.culling(); // 스크롤 이후 컬링
            }, scrollAnimationDuration);
        })
    }

    // 애니메이션 없이 해당 컨텐츠 위치로 이동.
    warpTo = (content, marginTop = 0) => {
        if (!content) {
            return;
        }

        const contentRect = this.contentList.get(content);
        this.marginTop = marginTop;
        this.realTop = contentRect.top + marginTop;
        this.setState({
            animation: true,
            fakeTop: this.realTop,
            isProcessing: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    animation: false
                });
            }, scrollAnimationDuration);
        })
        this.culling();
    }

    componentDidMount() {
        // log('cotainer.mounted');
        const { innerRef } = this.props;
        if (innerRef) {
            innerRef(this.scrollContainer);
        }
    }

    render() {
        const { children } = this.props;
        const { 
            fakeTop,
            animation
        } = this.state;

        const scrollStyle = {
            transition: `transform ${animation? scrollAnimationDuration: 0}ms ease-in-out `,
            transform: `translateY(${-fakeTop}px)`
        }

        return (
            <div style={wrapperStyle} ref={r=>this.wrapper=r}>
                <div className="home scrollWrap" style={scrollStyle} ref={r=>this.scrollContainer=r}>
                    {children}
                </div>
            </div>
        );
    }
}

export default ContentContainer;