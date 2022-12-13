import React, { Component } from 'react';
// import { HorizontalList, Focusable } from 'Navigation';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';
import { MENU_ID, MENU_NAVI } from 'Config/constants';
import appConfig from './../../../config/app-config';

// - DEFAULT : 설정 메인화면
// - CONNECTION_OKSUSU : 기기연결 설정 > oksusu 연결하기
// - CONNECTION_BTV_PLUS : 기기연결 설정 > Btv plus 연결하기
// - CONNECTION_BLUE_TOOTH : 기기연결 설정 > blue tooth 연결하기
// - CONNECTION_NUGU : 기기연결 설정 > NUGU 연결하기

// - AUTHENTICATION : 설정 > 인증번호 설정
// - CHILD_LIMIT : 설정 > 자녀안심 설정
// - USER_CUSTOMIZE : 설정 > 사용자 맞춤 설정
// - KIDS_ZONE : 설정 > 키즈존 설정
// - LIVE_CHANNEL : 설정 > 실시간 채널 설정

const menuInfoList = [
    {
        title: "인증번호 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-verification.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-verification-active.png",
        menuId: MENU_ID.SETTING_AUTHENTICATION,
    },
    {
        title: "자녀안심 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-safety-settings.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-safety-settings-active.png",
        menuId: MENU_ID.SETTING_CHILD_LIMIT,
    },
    {
        title: "사용자 맞춤 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-service-settings.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-service-settings-active.png",
        menuId: MENU_ID.SETTING_USER_CUSTOMIZE,
    },
    {
        title: "키즈존 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-kids.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-kids-active.png",
        menuId: MENU_ID.SETTING_KIDS_ZONE,
    },
    {
        title: "화면/사운드 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-sound.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-sound-active.png",
        menuId: MENU_ID.SETTING_SOUND,
    },
    {
        title: "실시간 채널 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-channel.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-channel-active.png",
        menuId: MENU_ID.SETTING_LIVE_CHANNEL,
    },
    
    {
        title: "멀티뷰 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-multiview.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-multiview-active.png",
        menuId: MENU_ID.MULTI_VIEW_SETTING,
    },
    {
        title: "시스템 설정",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-system-settings.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-system-settings-active.png",
        menuId: MENU_ID.DEFAULT,
    },
    // {
    //     title: "셋톱박스 자가진단",
    //     imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-settop.png",
    //     imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-settop-active.png",
    //     menuId: "LIVE_CHANNEL",
    // }
];

class SettingMenuItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false
        }
    }

    static defaultProps = {
        imageS: '',
        imageB: '',
        title: '',
        bFirst: false,
        bLast: false
    }

    onFocused = () => {
        this.setState({ focused: true });
        const { onFocusChanged, idx } = this.props;
        onFocusChanged(idx);
    }

    onBlured = () => {
        this.setState({ focused: false });
    }

    onSelect = () => {
        const { onSelect, idx } = this.props;
        onSelect(idx);
    }

    render() {
        const { imageS, imageB, title, bFirst, bLast } = this.props;
        const { focused } = this.props;

        let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
        if (bFirst) {
            focusClass += ' left';
        } else if (bLast) {
            focusClass += ' right';
        }

        return (
            <div className="slide">
                <div className={focusClass} tabIndex="-1">
                    <span className="wrapImg">
                        <img src={imageS} alt="" />
                        <img src={imageB} alt="" />
                    </span>
                    <div className="slideTitle">
                        <p className="text">{title}</p>
                    </div>
                </div>
            </div>
        )
    }
}

class SettingMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            bTitleUp: false,
            page: 0,
            currentIdx: -1
        }

        this.anchor = null;

        this.onFocusKeyDown = this.onFocusKeyDown.bind(this);
    }

    static defaultProps = {
    }

    onFocused = () => {
        this.setState({ focused: true });
        const { scrollTo } = this.props;
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor, 200);
        }
    }

    onBlured = () => {
        this.setState({ focused: false, bTitleUp: false });
    }

    onFocusChanged = (idx) => {
        const maxItem = 5;
        const { page } = this.state;
        const totalItem = menuInfoList.length;

        let startIndex = page;
        let endIndex = page + (maxItem - 1);
        // console.log( 'start:', startIndex, 'end:', endIndex, 'idx:', idx);

        if (idx < startIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
            startIndex = idx;
            if (startIndex < 0) {
                startIndex = 0;
            }
            endIndex = startIndex + (maxItem - 1);
        } else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
            endIndex = idx;
            if (endIndex > (maxItem - 1)) {
                startIndex = endIndex - (maxItem - 1);
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
            page: changedPage,
            bTitleUp: (idx === 0)
        });
        if (this.fm) {
            this.fm.setListInfo({
                page: changedPage
            });
            console.log('page:', changedPage);
        }
        
    }

    onSelectMenu = (idx) => {
        console.log('세팅 메뉴 선택:', idx);
        if (idx === 6) {
            StbInterface.menuNavigationNative(MENU_NAVI.MULTI_VIEW, { menuId: menuInfoList[idx].menuId });  // 설정 이동
        } else {
            StbInterface.menuNavigationNative(MENU_NAVI.SETTING, { menuId: menuInfoList[idx].menuId });  // 설정 이동
        }
    }

    onFocusKeyDown(event, childIdx) {
        if (event.keyCode === 13) {
            this.onSelectMenu(childIdx);
        }
    }

    componentDidMount() {
        const { setFm } = this.props;
        const fm = new FM({
            type: 'BLOCK',
            id: 'settingMenu',
            containerSelector: '.slideCon .slideWrapper',
            focusSelector: '.csFocus',
            row: 1,
            col: menuInfoList.length,
            page: 0,
            maxItem: 5,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: menuInfoList.length - 1,
            bRowRolling: true,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
            onFocusChild: this.onFocusChanged,
            onFocusKeyDown: this.onFocusKeyDown
        });
        setFm('settingMenu', fm);
        this.fm = fm;
    }

    render() {
        const maxItem = 5;
        const width = 298;
        const margin = 50;

        const { currentIdx, page, focused, bTitleUp } = this.state;
        // const { children } = this.props;
        const totalItem = menuInfoList.length;
        const slideListWidth = totalItem * width + totalItem * margin;
        // console.log( '슬라이드 width:', slideListWidth );
        let isLast = ( totalItem - maxItem ) === page;
        if( totalItem <= maxItem ) isLast = true;
        const isFirst = page === 0;
        let wrapperClass = `slideWrap${focused ? ' activeSlide' : ''}${!isFirst ? ' leftActive' : ''}${!isLast ? ' rightActive' : ''}`;


        const menus = menuInfoList.map((item, idx) => {
            const { title, imageS, imageB } = item;
            return (
                <SettingMenuItem
                    title={title}
                    imageS={imageS}
                    imageB={imageB}
                    idx={idx}
                    key={idx}
                    onSelect={this.onSelect}
                    onFocusChanged={this.onFocusChanged}
                    focused={currentIdx === idx}
                />
            );
        });
        return (
            <div id="settingMenu" className={`contentGroup${bTitleUp ? ' activeSlide' : ''}`} ref={r => this.anchor = r}>
                <div className={"slideTypeSetting setting"}>
                    <div className="title">설정</div>
                    <div className={wrapperClass}>
                        <div className="slideCon">
                            <div className="slideWrapper" style={{ '--page': page, 'width': slideListWidth }}>
                                {menus}
                            </div>
                        </div>
                        <div>
                            <div className="leftArrow"></div>
                            <div className="rightArrow"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SettingMenu;