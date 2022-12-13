import React, { Component } from 'react';
// import { HorizontalList, Focusable } from 'Navigation';
import 'Css/myBtv/my/SlideTypeSetting.css';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';
import { MENU_ID, MENU_NAVI, STB_PROP } from 'Config/constants';
import appConfig from './../../../config/app-config';

const menuInfoList = [
    {
        title: "oksusu 연결",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-oksusu.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-oksusu-active.png",
        menuId: MENU_ID.SETTING_CONNECTION_OKSUSU,
        type: 'oksusu'
    },
    {
        title: "B tv Plus 연결",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-btv.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-btv-active.png",
        menuId: MENU_ID.SETTING_CONNECTION_BTV_PLUS,
        type: 'btv'
    },
    {
        title: "블루투스 연결",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-bluetooth.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-bluetooth-active.png",
        menuId: MENU_ID.SETTING_CONNECTION_BLUE_TOOTH,
        type: 'bluetooth'
    },
    {
        title: "NUGU 연결",
        imageS:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-nugu.png",
        imageB:  appConfig.headEnd.LOCAL_URL + "/myBtv/ic-nugu-active.png",
        menuId: MENU_ID.SETTING_CONNECTION_NUGU,
        type: 'nugu'
    }
];

class ConnectMenuItem extends Component {
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
        connect: 0
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
        const { imageS, imageB, title, connect, type } = this.props;
        const { focused } = this.state;
        const focusClass = `csFocus ${focused ? ' focusOn' : ''}`;

        let label = '';
        switch(type) {
            case 'oksusu': 
                label = connect? '연결됨': '연결하기';
                break;
            case 'btv':
                label = connect? `${connect}개 연결됨`: '연결하기';
                break;
            case 'bluetooth':
                label = connect? `${connect}개 연결됨`: '연결하기';
                break;
            case 'nugu':
                label = connect? '연결됨': '연결하기';
                break;
            default: break;
        }
        const connectClass = `option${connect? ' connect':''}`;

        return (
            <div className="slide">
                <div className={focusClass} tabIndex="-1">
                    <span className="wrapImg">
                        <img src={imageS} alt="" />
                        <img src={imageB} alt="" />
                    </span>
                    <div className="slideTitle">
                        <p className="text">{title}</p>
                        <span className={connectClass}>{label}</span>
                    </div>
                </div>
            </div>
        );
    }
}

class ConnectMenuList extends Component {
    constructor(props) {
        super(props);

        // TODO 옥수수 연결, B tv Plus 연결 property 확인 필요
        this.state = {
            focused: false,
            connectInfo: [0, 0,
                StbInterface.getProperty(STB_PROP.BLUETOOTH_CONNECT) === 'true' ? 1 : 0,
                StbInterface.getProperty(STB_PROP.PROPERTY_NUGU_CONNECT) === 'true' ? 1 : 0],
            bTitleUp: false
        }
        this.anchor = null;
        this.onFocusKeyDown = this.onFocusKeyDown.bind(this);
    }

    static defaultProps = {
        info: [0, 0, 0, 0]
    }

    onFocused = () => {
        this.setState({ focused: true });
        const { scrollTo } = this.props;
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
    }

    onBlured = () => {
        this.setState({ focused: false, bTitleUp: false });
    }

    onFocusChanged = (idx) => {
        this.setState({ bTitleUp: (idx === 0) });
    }

    onSelectMenu = (idx) => {
        console.log('connect menu 선택:', menuInfoList[idx].menuId);
        StbInterface.menuNavigationNative(MENU_NAVI.SETTING, { menuId: menuInfoList[idx].menuId });  // 설정 이동
    }

    onFocusKeyDown = (event, idx) => {
        if (event.keyCode === 13) {
            this.onSelectMenu(idx);
        }
    }

    componentDidMount() {
        const { setFm } = this.props;
        const fm = new FM({
            type: 'BLOCK',
            id: 'connectMenu',
            containerSelector: '.slideCon .slideWrapper',
            focusSelector: '.csFocus',
            row: 1,
            col: menuInfoList.length,
            page: 0,
            maxItem: 5,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: menuInfoList.length - 1,
            bRowRolling: false,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
            onFocusChild: this.onFocusChanged,
            onFocusKeyDown: this.onFocusKeyDown
        });
        setFm('connectMenu', fm);
    }

    render() {
        const { bTitleUp } = this.state;
        const { info: connectInfo } = this.props;
        const menus = menuInfoList.map((item, idx) => {
            const connect = connectInfo[idx];
            const { title, imageS, imageB, type } = item;
            return (
                <ConnectMenuItem
                    title={title}
                    imageS={imageS}
                    imageB={imageB}
                    type={type}
                    connect={connect}
                    idx={idx}
                    key={idx}
                    onSelect={this.onSelect}
                    onFocusChanged={this.onFocusChanged}
                />
            );
        });
        const slideListWidth = menuInfoList.length * 298 + menuInfoList.length * 50;

        return (
            <div id="connectMenu" className={`contentGroup${bTitleUp ? ' activeSlide' : ''}`} ref={r => this.anchor = r}>
                <div className={"slideTypeSetting"}>
                    <div className="title">기기연결</div>
                    <div className="slideWrap activeSlide">
                        <div className="slideCon">
                            <div className="slideWrapper" style={{ '--page': 0, 'width': slideListWidth }}>
								{menus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ConnectMenuList;