import React, { Component, Fragment } from 'react';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';
import keyCodes from 'Supporters/keyCodes';
import 'Css/liveTv/organization/Organization.css';

const STB = StbInterface;

class TotalScheduleMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIdx: 0,
            opened: false,
            page: 0,
            categoryListFocused: false
        };
    }

    componentDidMount() {
        // FM 2개 생성 ( top 버튼 / 메뉴 리스트 )
        this.setMenuFm(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)) {
            this.setMenuFm(nextProps);
        }
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)
    //         || this.state.page !== nextState.page;
    // }

    setMenuFm = (props) => {
        const { setFm, list } = props;

        const topButtons = new FM({
            id: 'topButtons',
            containerSelector: '.orgMenuTop',
            focusSelector: '.orgFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onFocusKeyDownTopButtons
        });

        const categoryMenu = new FM({
            id: 'categoryMenu',
            containerSelector: '.orgMenuList',
            focusSelector: '.categoryMenu .orgFocus',
            row: list.length + 3,
            col: 1,
            focusIdx: 2,
            startIdx: 0,
            lastIdx: list.length + 2,
            onFocusKeyDown: this.onFocusKeyDownMenuItem,
            onFocusContainer: this.onFocusCategoryMenu,
            onBlurContainer: this.onBlurCategoryMenu,
            onFocusChild: this.onFocusMenuItem
        });

        setFm('topButtons', topButtons);
        setFm('categoryMenu', categoryMenu);
    }

    onFocusCategoryMenu = () => {
        const { openMenu } = this.props;
        this.setState({ categoryListFocused: true });
        openMenu(true);
    }

    onBlurCategoryMenu = () => {
        this.setState({ categoryListFocused: false });
    }

    onFocusMenuItem = (idx) => {
        const page = Math.floor( idx / 6);
        this.setState({ page });
    }

    onFocusKeyDownMenuItem = (event, childIdx) => {
        if (event.keyCode === keyCodes.Keymap.ENTER) {
            const { onSelectCategory } = this.props;
            onSelectCategory(childIdx);
        }
    }

    onFocusKeyDownTopButtons = (event, idx) => {
        const { openMenu } = this.props;
        if (event.keyCode === 13) {
            if (idx === 0) {
                openMenu(false);
                STB.menuNavigationNative('MULTI_VIEW', {menuId: 'DEFAULT'});
            } else if(idx === 1) {
                openMenu(false);
                STB.menuNavigationNative('SETTING', {menuId: 'SETTING_LIVE_CHANNEL'});
            }
        }
        
        // console.log('openMenu : ', openMenu)
        // if (typeof openMenu === 'function') {
        //     openMenu(false);
        // }
    }

    renderMenuList = () => {
        const { list } = this.props;
        const menuList = list.map((menu, idx) => {
            return <MenuItem label={menu.label} idx={idx+3} key={idx+3}/>
        });

        const defaultMenuList = [
            <MenuItem label="인기채널" idx={0} key={0}/>,
            <MenuItem label="선호채널" idx={1} key={1}/>,
            <MenuItem label="전체편성표" idx={2} key={2}/>
        ];

        menuList.unshift(...defaultMenuList);

        return (
            <Fragment>
                {menuList}
            </Fragment>
        );
    }

    render() {
        const { list } = this.props;
        const { page, categoryListFocused } = this.state;

        const menuList = this.renderMenuList();
        const pageClass = `orgMenu${page===0?' next':' prev'}`;
        const hideTopMenu = page !== 0;
        const maxPage = Math.ceil(list.length / 6);
        const isNextPage = page < maxPage;
        const isPrevPage = page !== 0;
        const wrapperClass = `orgMenuWrap${categoryListFocused?' activeSlide':''}${isNextPage? ' rightActive':''}${isPrevPage? ' leftActive':''}`;

        return (
            <div className={pageClass} id="topButtons">
                <ul className={`orgMenuTop${hideTopMenu?' hide':''}`}>
                    <li>
                        <span className="multi orgFocus">
                            <span className="ic"></span>
                            <span className="text">멀티뷰</span>
                        </span>
                    </li>
                    <li>
                        <span className="setting orgFocus">
                            <span className="ic"></span>
                            <span className="text">채널설정</span>
                        </span>
                    </li>
                </ul>
                <div id="categoryMenu" className={wrapperClass} style={{'--page': 0}}>
                    <div className="orgMenuListWrap">
                        <ul className="orgMenuList" style={{'--page': page}}>
                            {menuList}
                        </ul>
                        <div className="topArrow"></div>
                        <div className="bottomArrow"></div>
                    </div>
                    <div className="orgMenuArr" style={{'left':'calc(130% + 24px)'}}>메뉴보기</div>
                </div>
            </div>
        );
    }

}

class MenuItem extends Component {
    render() {
        const { label, idx } = this.props
        const className = `orgFocus${idx===6? ' up': idx===7? ' down':''}`;
        return (
            <li className="categoryMenu">
                <span className={className}>{label}</span>
            </li>
        );
    }
}

export { MenuItem, TotalScheduleMenu as default };