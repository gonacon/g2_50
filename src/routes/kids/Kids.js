import React from 'react';
import PageView from 'Supporters/PageView';
import { NXPG } from 'Network';
import 'Css/kids/character/CharacterHome.css';
import {
    KIDS_MENU_CODE,
    KidsMenu,
    CharacterHome,
    GenreAll,
    PlayLearning,
    Channel,
    MonthlyHome
} from './components';
import { kidsConfigs } from './config/kids-config';
import StbInterface from 'Supporters/stbInterface';
import { MENU_NAVI, MENU_ID, STB_PROP, GNB_CODE, PATH } from 'Config/constants';
import { Core } from 'Supporters';
import keyCodes from 'Supporters/keyCodes';
import { isEmpty } from 'lodash';
import update from 'react-addons-update';
import FM from 'Supporters/navi';


const KIDS_VIEW_INFO = {
    10: { viewName: 'MonthlyHome', className: 'kidsMonthlyHome', index: 0 },
    20: { viewName: 'GenreAll', className: 'genreMenuAll', index: 1 },
    30: { viewName: 'CharacterHome', className: 'characterHome', index: 2 },
    40: { viewName: 'PlayLearning', className: 'playLearning', index: 4 },
    50: { viewName: 'Channel', className: 'channelHome', index: 5 },
    60: { viewName: '', className: '', index: 6 },
    70: { viewName: '', className: '', index: 3 }
}

class KidsHome extends PageView {
    constructor(props) {
        super(props);
        console.log('[KID HOME CONSTRUCTOR]');
        if (!isEmpty(this.historyData)) {
            this.state = {
                menuInfo: !isEmpty(this.historyData.menuInfo) ? this.historyData.menuInfo : [],
                menuId: !isEmpty(this.historyData.historyInfo.menu) ? this.historyData.historyInfo.menu.id : null,
                menuIndex: !isEmpty(this.historyData.historyInfo.menu) ? this.historyData.historyInfo.menu.index : -1,
                historyInfo: {
                    menu: this.historyData.historyInfo.menu,
                    comptName: this.historyData.historyInfo.comptName,
                    focusKey: this.historyData.historyInfo.focusKey,
                    parentIndex: this.historyData.historyInfo.parentIndex,
                    childIndex: this.historyData.historyInfo.childIndex,
                    isInitKidsHome: this.historyData.historyInfo.isInitKidsHome,
                    isOnHistory: true
                }
            }
            StbInterface.kidszoneState('enter');  // 키즈존 진입 전달
            this.props.activeMenu(GNB_CODE.GNB_KIDS, this.state.menuId);
        } else {
            this.state = {
                menuInfo: [],
                menuId: null,
                menuIndex: -1,    // GNB 인덱스
                historyInfo: {
                    menu: null,
                    comptName: null,
                    focusKey: null,
                    parentIndex: null,
                    childIndex: null,
                    isOnHistory: false,
                    isInitKidsHome: true // 키즈 진입 여부 판단(키즈 진입과 키즈 상세 화면 back 시 구분을 위한 값)
                }
            }
        }

        this.declareFocusList([
            { key: 'gnb', fm: null },
            { key: 'kidsMenu', fm: null },
            { key: 'contents', fm: [] },
            { key: 'topButton', fm: null }
        ]);

        Core.inst().setKidsHome(this);
    }

    // 맨위로 버튼 엔터
    onKeyDownTopButton = (evt) => {
        const { keyCode: key } = evt;

        // ENTER
        if (key === keyCodes.Keymap.ENTER) {
            this.setFocus('contents', 0);
            this.scrollTo(0, 0);
        }
    }

    // 맨위로 버튼 포커스
    onFocusChildTopButton = () => {

    }

    /*********************************** Component Lifecycle Methods ***********************************/
    componentWillMount() {
        if (!isEmpty(this.paramData)) {
            this.setState({
                chrtr_menu_id: this.paramData.menu_id,
                menuIndex: this.paramData.menuIndex
            })
        }
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log('@@@ KIDS did update', this.focusList, this.topButton);
        console.log('@@@ componentDidUpdate', this.state);
        if (this.state.menuIndex !== 1) {
            this.focusList.splice(3, this.focusList.length - 1);
        } else {
            this.addFocusList([
                { key: 'topButton', fm: null }
            ]);

            this.setFm('topButton', new FM({
                id: 'topButton',
                type: 'ELEMENT',
                focusSelector: '.csFocus',
                row: 1,
                col: 1,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 0,
                onFocusKeyDown: this.onKeyDownTopButton,
                onFocusChild: this.onFocusChildTopButton
            }))
        }
    }

    componentDidMount() {
        const { showMenu, data } = this.props;
        if (typeof showMenu === 'function') {
            showMenu(false);
        }

        if (data.gnbFm) {
            this.setFm('gnb', data.gnbFm);
        }
        this.requestMenuInfo();

        window.KIDS = this;

        Core.inst().showKidsWidget();
    }

    componentWillReceiveProps(nextProps) {
        const { data } = nextProps;
        if (data.gnbFm) {
            this.setFm('gnb', data.gnbFm);
        }

        // [TODO] PROPS로 menuId를 받는 경우, 이 시점에서 데이터 호출 필요
        if (data.menuId) {
            this.setState({ menuId: data.menuId });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let updateFlag = true;
        if (JSON.stringify(this.state.historyInfo) !== JSON.stringify(nextState.historyInfo)) {
            updateFlag = false;
        }
        return updateFlag;
    }

    /*********************************** H/E Request Methods ***********************************/

    requestMenuInfo = async () => {
        const result = await NXPG.request102();

        let defaultMenuIdx = -1;
        let menuInfo = result.menus ? result.menus : [];

        // kidsz_gnb_cd 코드가 없는 메뉴는 삭제
        menuInfo = menuInfo.filter(item => {
            return item.kidsz_gnb_cd.length !== 0
        })

        menuInfo = menuInfo.map((item, index) => {
            // [HISTROTY]
            console.log('[this]', this.state);
            if (this.state.historyInfo.isOnHistory) {
                // TODO 원전임 menuIndex 값 확인 필요
                const menuIndex = this.state.menuIndex < 0 ? 0 : this.state.menuIndex;
                if (item.kidsz_gnb_cd === this.state.menuInfo[menuIndex].gnbCd) {
                    defaultMenuIdx = index;
                }
            } else {
                if (this.state.menuIndex !== -1) {
                    if (item.kidsz_gnb_cd === menuInfo[this.state.menuIndex].kidsz_gnb_cd) {
                        defaultMenuIdx = index;
                    }
                } else if (item.kidsz_gnb_cd === KIDS_MENU_CODE.CHARACTER) {
                    defaultMenuIdx = index;
                }
            }

            const {
                menu_id: menuId,
                menu_nm: menuNm,
                kidsz_gnb_cd: gnbCd,
                lim_lvl_yn: limLvlYn,
                call_typ_cd: callTypCd,
                menu_exps_prop_cd: menuExpsPropCd,
                call_url: callUrl
            } = item
            return {
                menuId, menuNm, gnbCd, limLvlYn, callTypCd, menuExpsPropCd, callUrl
            }
        })

        this.setState({
            menuInfo,
            menuId: menuInfo[defaultMenuIdx].menuId,
            menuIndex: defaultMenuIdx
        });
    }

    /*********************************** FocusManager KeyEvent Methods ***********************************/

    // GNB 포커스온 이벤트 함수
    handleOnFocus = () => {
        // 메뉴에 포커스가 가면 GNB 메뉴를 숨김
        this.props.showMenu(false, true);

        // 현재 컴포넌트와 동일한 GNB영역으로 포커스 이동
        console.log("focusList : ", this.focusList);

        // this.setFocus('menu', this.state.viewStatus.menuIndex);
    }

    // GNB 메뉴 선택 이벤트 함수
    handleOnSelect = (index) => {
        const { menuInfo, menuIndex } = this.state;
        const menuCode = index !== -1 ? menuInfo[index].gnbCd : '';
        const menuId = menuInfo[index].menuId;

        if (menuIndex === index) return;
        // console.log("focusList : ", this.focusList[2].fm.length);
        // console.log("focusList : ", this.focusList);

        // 페이지 변경
        if (menuCode === KIDS_MENU_CODE.HABIT) {
            // 시청습관관리 설정화면 이동
            StbInterface.menuNavigationNative(MENU_NAVI.SETTING, { menuId: MENU_ID.SETTING_KIDS_ZONE });
            return;

        } else if (menuCode === KIDS_MENU_CODE.FAIRYTALE) {
            // 살아있는 동화 앱 실행
            StbInterface.launchApp({
                title: menuInfo[index].menuNm,
                serviceId: '78062',
                vassId: 'kidsbooks_and',
                contentId: '{D69DCC2A-A94F-4806-A981-3F9BBD633168}',
                packageName: 'com.skb.kidsbooks',
                entryPath: 'KIDS',
                hasVassId: 'Y',
            });
            return;
        }

        // 페이지 변경 전 contents 포커스 삭제
        if (this.focusList[2].fm.length > 0) this.resetFmList('contents');
        this.resetHistory();

        this.setState({
            menuIndex: index,
            menuId: menuId
        });

        // () => {
        //     this.setHistory({
        //         comptName: KIDS_VIEW_INFO[menuCode].viewName,
        //         focusKey: 'contents',
        //         parentIndex: 0,
        //         childIndex: 0
        //     });        

    }

    /*********************************** Etc Methods ***********************************/

    // Set 히스토리
    setHistory = (info) => {
        const { menuIndex, menuInfo } = this.state;
        let menuTemp = {
            menu: {
                id: menuInfo[menuIndex].menuId,
                code: menuInfo[menuIndex].gnbCd,
                index: menuIndex,
            }
        }
        info = Object.assign(info, menuTemp);

        let tempHistory = this.state.historyInfo;
        for (let prop in info) {
            tempHistory = update(tempHistory, {
                [prop]: { $set: info[prop] }
            });
        }

        console.log('%c[HISTORY DATA] ===>', 'color:#0000ff ', tempHistory);
        this.setState({ historyInfo: tempHistory });
    }

    // Get 히스토리
    getHistory = (info) => {
        // this.setState(this.state.historyInfo, {
        //     isOnHistory: !this.state.historyInfo.isOnHistory
        // });
        return this.state.historyInfo
    }

    // Reset 히스토리
    resetHistory = () => {
        this.setState({
            historyInfo: {
                menu: null,
                comptName: null,
                focusKey: null,
                parentIndex: null,
                childIndex: null,
                isOnHistory: false
            }
        })
    }

    // 인증 콜백
    certificationCallBack(data) {
        console.log('certificationCallBack data=', data);

        // TODO 비밀번호 성공일때  moveBack 실행
        if (data) {
            // TODO 캐릭터 가이드 표시해야 되면  처리
            StbInterface.playKidszoneGuide('TODO 디지캡에서 코드표 받은 다음 처리');
            super.moveBack();
        }
    }

    onBtSearchKidszone = () => {
        console.log('[onBtSearchKidszone]');

        if (this.channelComp) {
            this.channelComp.onBtSearchKidszone();
        }
    }

    onChannelChanged = (data) => {
        console.log('[onChannelChanged] data:', data);

        if (this.channelComp) {
            this.channelComp.onChannelChanged(parseInt(data, 10));
        }
    }

    injectRef = (name, ref) => {
        this[name] = ref;
    }

    render() {
        const { menuInfo, menuIndex, menuId } = this.state;
        const menuCode = menuIndex !== -1 ? !isEmpty(menuInfo) ? menuInfo[menuIndex].gnbCd : '' : '';
        const pageClassName = menuCode ? KIDS_VIEW_INFO[menuCode].className : 'characterHome';

        const bShow = !isEmpty(menuCode);
        const componentShow = (menuCode) => {
            let view = '';
            switch (menuCode) {
                case KIDS_MENU_CODE.MONTHLY:
                    view = (<MonthlyHome
                        menuId={menuId}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        onMovePage={this.movePage}
                        setHistory={this.setHistory}
                        getHistory={this.getHistory}
                        resetHistory={this.resetHistory} />)
                    break;
                case KIDS_MENU_CODE.GENRE:
                    view = (<GenreAll
                        injectRef={this.injectRef}
                        menuId={menuId}
                        menuInfo={menuInfo}
                        menuIndex={menuIndex}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        showMenu={this.props.showMenu}
                        getFocusInfo={this.getFocusInfo}
                        getCurrentFocusInfo={this.getCurrentFocusInfo}
                        onFocus={this.handleOnFocus}
                        onSelect={this.handleOnSelect}
                        addFocusList={this.addFocusList}
                        focusPrev={this.focusPrev}
                        onMovePage={this.movePage}
                        setHistory={this.setHistory}
                        getHistory={this.getHistory}
                        resetHistory={this.resetHistory} />)
                    break;
                case KIDS_MENU_CODE.CHARACTER:
                    view = (<CharacterHome
                        menuId={menuId}
                        onMovePage={this.movePage}
                        chrtr_menuId={this.state.chrtr_menu_id}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        setHistory={this.setHistory}
                        getHistory={this.getHistory}
                        resetHistory={this.resetHistory} />)
                    break;
                case KIDS_MENU_CODE.LEARNING:
                    view = (<PlayLearning
                        menuId={menuId}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        onMovePage={this.movePage}
                        setHistory={this.setHistory}
                        getHistory={this.getHistory}
                        resetHistory={this.resetHistory} />)
                    break;
                case KIDS_MENU_CODE.CHANNEL:
                    view = (<Channel
                        ref={ref => { this.channelComp = ref; }}
                        menuId={menuId}
                        menuIndex={menuIndex}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        test={this.onChannelChanged}
                        onMovePage={this.movePage}
                        setHistory={this.setHistory}
                        getHistory={this.getHistory}
                        resetHistory={this.resetHistory} />)
                    break;
                default:
                    break;
            }
            return view;
        }

        return (
            <div className={pageClassName} style={{ backgroundColor: 'rgb(217, 219, 222)' }}>
                {
                    !isEmpty(menuInfo) && menuCode !== KIDS_MENU_CODE.GENRE &&
                    <KidsMenu
                        id="kidsMenu"
                        menus={menuInfo}
                        menuIndex={menuIndex}

                        showMenu={this.props.showMenu}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        getFocusInfo={this.getFocusInfo}
                        getCurrentFocusInfo={this.getCurrentFocusInfo}
                        onFocus={this.handleOnFocus}
                        onSelect={this.handleOnSelect}
                        getHistory={this.getHistory} />
                }
                {bShow && componentShow(menuCode)}
            </div>
        );
    }
}

export default KidsHome;