// commons
import React from 'react';
import 'Css/home/tvAppHome.css'
// import TvAppJson from '../../../assets/json/routes/home/TvAppHome.json';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import { scroll } from 'Util/utils';
import { isEmpty } from 'lodash';
// network
import { AMS } from 'Network';
import StbInterface from 'Supporters/stbInterface';
import keyCodes from 'Supporters/keyCodes';
import appConfig from 'Config/app-config';
import constants from 'Config/constants';
import ToolGuide from 'Module/UI/ToolGuide';


const merge = Object.assign;
const LIMIT_HIDE_TOP_BUTTON = 10;

let focusOpts = {
    appList: {
        id: 'appList',
        containerSelector: '.contentGroup',
        focusSelector: '.csFocus',
        row: 0,
        col: 5,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
    },
}

class TvAppHome extends PageView {
    constructor(props) {
        super(props);

        const gnbCode = this.paramData.gnbTypeCode;

        this.TOOLTIP_FLAG = constants.STB_PROP.TOOLTIPGUIDE_FLAG_TVAPP;
        this.isGuided = null;

        this.state = isEmpty(this.historyData) ? {
            apps: [],
            imgUrl: '',
            gnbTypeCode: gnbCode,
            isTooltipGuided: false
        } : this.historyData;

        this.defaultFM = {
            topButton: new FM({
                id: 'topButton',
                type: 'ELEMENT',
                focusSelector: '.csFocus',
                row: 1,
                col: 1,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 0,
                onFocusKeyDown: this.onKeyDownTopButton
            })
        }
        let focusList = [
            { key: 'gnbMenu', fm: null },
            { key: 'appList', fm: null },
            { key: 'topButton', fm: null }
        ];
        this.declareFocusList(focusList);
    }

    toolTipEnd = () => {
		StbInterface.setProperty(this.TOOLTIP_FLAG, true);
		this.setState({ isTooltipGuided: false });
    }
    
    getGnbIndex = (gnbTypeCode) => {
        let gnbIndex = {
            U5_02: 0,
            U5_01: 1,
            U5_03: 2,
            U5_04: 3,
            U5_05: 4,
            U5_06: 5,
            U5_07: 6,
            U5_08: 7,
			U5_10: 8,
            U5_09: 9,
			
        };
        return gnbIndex[gnbTypeCode];
    }

    setKeyFM() {
        const { apps } = this.state;
        if (apps.length > LIMIT_HIDE_TOP_BUTTON) {
            this.setFm('topButton', this.defaultFM.topButton);
        } else {
            this.setFocusEnable('topButton', false);
        }
        this.setGnb();
        const col = 5;
        let appsRow = Math.ceil(apps.length / col);
        let appsLastIdx = apps.length - 1;
        let option = new FM({
            ...focusOpts.appList,
            row: appsRow,
            col: 5,
            lastIdx: appsLastIdx,
            onFocusChild: this.onAppListFocus,
            onFocusKeyDown: this.onKeyDownAppLIst
        });

        this.setFm('appList', option);
        this.setFocus('appList');
    }

    setGnb() {
        const { gnbTypeCode } = this.state;
        const { gnbFm } = this.props.data;
        if (gnbFm) {
            // this.setFm('gnbMenu', new FM(merge(gnbFm,{
            //     onBlurContainer: this.onBlurContainerGnb
            // })) );
            // ToDo gnb ???????????? ?????? ???????????? menu??? ????????? ????????? ????????? ?????? ?????? ???????????????.
            // ??? ????????? gnb ????????? ?????? ???????????? ??? TV?????? ???????????? ????????? ?????? ?????? ??????????????????
            // gnbFm??? ????????? ????????????????????? ???????????? ?????? gnb???????????? ????????? ?????? ?????? ?????????.

            this.setFm('gnbMenu', gnbFm);
            this.props.showMenu(true);
            gnbFm.removeFocus();
            gnbFm.setListInfo({ focusIdx: this.getGnbIndex(gnbTypeCode) });
            //ToDo gnb??? TV?????? 'active' ????????? ?????? ????????? ???????????? ???.

        }
    }

    getApps = async () => {
        let apps = [];
        if (!this.historyData) {
            let result = await this.reqHEforApps();
            StbInterface.sendTvAppList(result.originData);
            let imgUrl = `http://${result.BIZ_CD.DATA.ISER_URL}/`;
            apps = result.BIZ_CD.DATA.ITEM_LIST.ITEM_INFO.concat();
            this.setState({
                apps,
                imgUrl
            })
        } else {
            // console.log("----->>> ????????? TV??? ??????");
        }
        this.setKeyFM();
    }

    reqHEforApps = () => {
        var appListHEData = AMS.appList_r()
        var getData = {};
        if (appListHEData !== undefined) {
            getData = appListHEData;
        } else {
            // ToDo: H/E?????? tvApps ?????? ?????? ?????? ??????
        }
        return getData;
    }

    scroller = (idx) => {
        const byTop = Math.floor(idx / 5);
        let offsetY = 0;
        let gnbShow = true;
        if (byTop > 1) {
            offsetY = -(byTop - 1) * 360 - 154;
            gnbShow = false;
        }
        scroll(offsetY);
        this.props.showMenu(gnbShow, true);
    }

    onAppListFocus = focusIdx => {
        // console.log('%c a, b', 'color: red; background: yellow', focusIdx);
        this.scroller(focusIdx);
    }

    onBlurContainerGnb = () => {
        const { gnbFm } = this.props.data;
        gnbFm.setListInfo({ focusIdx: 8 });
    }

    onKeyDownTopButton = (event) => {
        if (event.keyCode === keyCodes.Keymap.ENTER) {
            this.setFocus('appList', 0);
            scroll(0);
        }
    }

    onKeyDownAppLIst = (event, idx) => {
        // console.log('onKeyDownAppLIst idx%s=', idx, event);
        if (event.keyCode === keyCodes.Keymap.ENTER) {
            // app ?????? (????????????)
            // CON_ID:"{8F821C9C-7623-4728-9CD5-5578DE4919DC}",  DCA_NAME:"????????????",  DCA_NUM:"501",  DESC:" ",            HOVER_IMG:"/DATA/epg/menu_image/update/j_joy_mini_ky_karaoke_and_and.png",  I_IMG:"/DATA/epg/menu_image/update/j_joy_ky_karaoke_and.png",            ITEM_ID:"1000016209",  LEVEL:"0",  LINK_NAME:" ",LINK_TYPE:" ",MENU_CD:"SmartSTB",P_IMG:"/DATA/epg/menu_image/update/j_joy_promotion_ky_karaoke_and.png"            ,PRIORITY:"low",SE_PRI:" ",  SERVICE_ID:"78018"
            // app ?????? (app)
            // ,APP_RES_H:" "  ,APP_RES_W:" "  ,CALL_TYPE:"18"  ,CALL_URL:" "  ,CON_ID:"{3DB9FDDC-72D2-4811-97D3-98B16E62A569}"  ,DESC:" "            ,HOVER_IMG:"/DATA/epg/menu_image/update/j_joy_mini_utop_kidspp_and.png"  ,I_IMG:"/DATA/epg/menu_image/update/j_joy_utop_kidspp_and.png"            ,ITEM_ID:"1000016208"  ,LEVEL:"0"  ,LINK_NAME:" "  ,LINK_TYPE:" "  ,MENU_CD:"SmartSTB"  ,P_IMG:"/DATA/epg/menu_image/update/j_joy_promotion_utop_kidspp_and.png"            ,PRIORITY:"low"  ,SE_PRI:" "  ,SERVICE_ID:"78015"  ,TITLE:"????????????"  ,VASS_ID:"utop_kidspp_and"  ,YN_CHILD:" "
            const app = this.state.apps[idx];
            const data = {
                title: app.TITLE,  //	App ??????
                serviceId: app.SERVICE_ID,  //	App ????????? ?????????
                vassId: app.VASS_ID,  //	App ?????? ?????????
                contentId: app.CON_ID,  //	App ????????? ?????????
                packageName: app.PACKAGE_NAME || '',  //	"??? ???????????? PackageName ??? ?????? ??? ?????? ???????????? ????????????. (?????? hasVaasId ??? Y ????????? ??????)"
                entryPath: 'HOME',  //	"HOME" - ??? > TV??? ?????? ???
                hasVassId: 'Y',  //	vassId??? ?????? ?????? Y (??? ?????? packageName ??? ??????????????? packageName ?????? App ??????)
            }
            StbInterface.launchApp(data);
        }
    }

    keyDirection = (evt) => {
        // console.log('%c evt', 'color: red; background: yellow', evt);
    }

    onFocusMoveUnavailable({ id, type, direction, curIdx }) {
        super.onFocusMoveUnavailable({ id, type, direction, curIdx });
        // console.log('onFocusMoveUnavailable=', { id, type, direction, curIdx });

        if (id === 'appList' && curIdx === 0 && direction === 'LEFT') {
            this.setFocus('appList', this.state.apps.length - 1);
        } else if (id === 'appList' && curIdx === this.state.apps.length - 1 && direction === 'RIGHT') {
            this.setFocus('appList', 0);
        }
    }

    checkLog(str) {
        // console.log('%c???', 'color: pink; background: gray', str);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data.gnbFm !== nextProps.data.gnbFm) {
            const { gnbFm } = nextProps.data;
            if (gnbFm) {
                gnbFm.setListInfo({ focusIdx: 8 });
                this.setFm('gnbMenu', gnbFm);
                this.setFocus('appList');
            }
        }
    }

    componentDidMount() {
        // const { gnbFm } = this.props.data;
        // const { apps } = this.state;
        const { activeMenu, data } = this.props;
        let { gnbTypeCode } = this.state;

        activeMenu(gnbTypeCode);
        this.getApps();

        this.isGuided = StbInterface.getProperty(this.TOOLTIP_FLAG);
		if (!this.isGuided) {
			this.setState({ isTooltipGuided: true });
		}
    }

    componentDidUpdate() {
    }

    render() {
        const { apps, isTooltipGuided } = this.state;
        const appLength = apps.length;
        return (
            <div className="wrap" onKeyDown={this.keyDirection}>
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/home/bg_silver.png`} alt="" /></div>
                <div className="home tvAppHome scrollWrap" id="appList">
                    <div className="contentGroup">
                        {
                            apps.map((dataItem, i) => {
                                let iconImg = dataItem.I_IMG;
                                iconImg = iconImg ? `${this.state.imgUrl}${appConfig.headEnd.AMS.PocCode}${iconImg}` : `${appConfig.headEnd.LOCAL_URL}/common/img/app-thumbnail-default.png`;
                                // 180502 I_IMG ?????? ?????? ?????? ????????? ???????????? ???????????????.
                                return (
                                    <div className="csFocus tvAppItem" key={i} tabIndex="-1">
                                        {/* <span className="imgCon"><img src={`http://stimage.hanafostv.com:8080/SmartSTB/${dataItem.I_IMG}`} width="200" height="200" alt="" /></span> */}
                                        {/* <span className="imgCon"><img src={appConfig.headEnd.IMAGE.url+ '/200_200' + dataItem.I_IMG} width="200" height="200" alt="" /></span> */}
                                        <span className="imgCon"><img src={iconImg} width="200" height="200" alt="" /></span>
                                        <span className="title">{dataItem.DCA_NUM ? <span className="channel"> {dataItem.DCA_NUM}</span> : ''} {dataItem.TITLE}</span>
                                        <span className="text" style={{ 'WebkitBoxOrient': 'vertical' }}>{dataItem.DESC}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                    {
                        appLength > LIMIT_HIDE_TOP_BUTTON &&
                        <div className="btnTopWrap">
                            <span id="topButton" className="csFocus btnTop"><span>??? ??????</span></span>
                        </div>
                    }
                    {isTooltipGuided &&
						<ToolGuide guideTitle={`?????????????????? ???TV??? ???????????? ?????? ??????????????????.`}
							top="110"	// 390 (????????? ?????? ???)
							left="600"
							aniTime="3"
							delayTime="5"
							arrowClass="none"
							onAnimationEnd={this.toolTipEnd}
						/>
					}
                </div>
            </div>
        )
    }
}

export default TvAppHome;
