// common
import React from 'react';
import moment from 'moment';
import constants, { STB_PROP } from '../../config/constants';
import Core from 'Supporters/core';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';
import { CTSInfo } from 'Supporters/CTSInfo';
import StbInterface from 'Supporters/stbInterface';

// util
import _ from 'lodash';
import Utils, { scroll } from '../../utils/utils';
import synopAPI from './api/synopAPI';
import appConfig from 'Config/app-config';

// components
import PageView from '../../supporters/PageView.js';
import SynopShort from './SynopShort.js';
import SynopSeries from './SynopSeries.js';
import SynopDescriptionPop from './popup/SynopDescriptionPop';
import AdultCertification from '../../popup/AdultCertification';
import SynopCornerPop from './popup/SynopCornerPop';
import SynopShortSteel from './popup/SynopShortSteel';
import SynopPlayMovieType from './popup/SynopPlayMovieType';


const { Keymap: { ENTER, UP, DOWN, LEFT, RIGHT, BACK_SPACE, PC_BACK_SPACE, BLUE, BLUE_KEY, FAV_KEY } } = keyCode;
class SynopsisView extends PageView {
    constructor(props) {
        super(props);

        this.shortFm = [
            { key: 'banner', fm: null },
            { key: 'description', fm: null },
            { key: 'purcharseButtons', fm: null },
            { key: 'review', fm: null },
            { key: 'slides', fm: [] },
            { key: 'top', fm: null }
        ]
        this.seriseFm = [
            { key: 'description', fm: null },
            { key: 'purcharseButtons', fm: null },
            { key: 'series', fm: null },
            { key: 'seriesDescription', fm: null },
            { key: 'slides', fm: [] },
            { key: 'top', fm: null }
        ]

        this.state = _.isEmpty(this.historyData) ? {
            synopInfo: {
                param: null,
                metvDirectview: null,
                synopsis: {
                    contents: null,
                    purchares: []
                },
                cwRelation: null,
            },
            focusIdx: {
                key: 'purcharseButtons',
                v: 0,
                h: 1    // ????????????
            },
            isBookmark: false,      // ???
            buttonObj: null,    // ????????????
            defaultSynopsis: null,
            yn_season_watch_all: 'N' // ?????? ???????????? ??????
        } : this.historyData

        !_.isEmpty(this.historyData) ?
            this.historyData.synopInfo.synopsis.contents.sris_typ_cd === '01' ?
            this.focusList = this.seriseFm
            :
            this.focusList = this.shortFm
        : this.focusList = [];

        this.synopType = null;
        this.defaultPlayInfo = {
            synopsis_type: '01',    //????????? ???????????? ??????(01 : ?????? ??????, 02 : ?????? ??????, 03 : ??????????????? ??????, 04 : ????????? ??????)
            playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : ??????, VOD_CORNER : ????????? ??????, VOD_ALL_CORNER : ????????? ????????????
            ynTeaser: 'N',          //????????? ?????? ?????? (Y/N)
            ynSpecial: 'N',         //??????????????? ?????? ?????? (Y/N)
            playOption: 'normal',   //normal : ?????? ???????????? ????????? ??????, next : ?????? ?????? ??? ?????? ?????? ??????
                                    //other : ?????? ??? playbar??? ?????? ?????? ?????? ??????, smartRcu : SmartRCU??? ?????? ????????????
            kids_yn: 'N',           //?????? ?????? ??????(Y/N)
            ynSerise: 'N',          //????????? ??????(Y/N)
            isCatchUp: 'N',         //????????? ??? ??????, MeTV??? isCatchUp ??????
            isAll: 'N',             //?????? ?????? ??????(Y/N)    
            epsd_id: '',            //????????????ID
            epsd_rslu_id: '',        //???????????? ?????????ID
            adult_flag: !_.isEmpty(this.paramData.adult_flag) ? this.paramData.adult_flag : '0'
        };
        this.adultState = false;    // ?????? ????????????
        this.seriesDelay = true;    // ?????? ????????? ?????????
        this.yn_history = false;    // ?????????????????? ?????????
        this.isChange = 0;
        this.btnPurchase = {
            purchase: [],
            unPurchase: [],
            free: [],
            change: false
        }
        this.seriesPurchase = {
            purchase: [],
            unPurchase: [],
            free: []
        }
        this.uiButton = [];
        this.isGuided = true; //???????????? ???????????? false: ?????? // true : ?????????
    }

    componentWillMount() {
        const { showMenu } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
        }

        let paramData = this.paramData;
        if (_.isEmpty(paramData)) {
            if (_.isEmpty(this.historyData)) {
                Core.inst().showToast('???????????? ??????');
                this.moveBack();
            }
        } else {
            let watchall = 'Y'; // yn_seacon_watchall ??????????????? Y ???
            let search_type = '1'; // 1:epsd_id??????, 2:epsd_rslu_id??????
            let synopsis_type = null; // 1:????????????, 2:??????????????????, 3:??????????????????or????????????

            if (!_.isEmpty(paramData.search_type)) {
                search_type = paramData.search_type;
            } else {
                if (_.isEmpty(paramData.epsd_id)) {
                    search_type = '2';
                }
            }
            
            paramData.search_type = search_type;
            
            if (!paramData.yn_recent) {
                paramData.yn_recent = 'Y' // ???????????? ??????????????? ????????????
            }
            const settingKey = 'default'; // ??????????????? ????????? ????????? ?????? ??????
            this.setAPIcall(paramData, watchall, synopsis_type, settingKey);
        }
    }

    componentDidMount() {
        // ????????? ??????
        StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) === '1' && Core.inst().showKidsWidget();

        let synopEnterCount =  StbInterface.getProperty(constants.STB_PROP.SOUND_TOOLTIPGUIDE_COUNT_SYNOPSIS);
        
        if(Number(synopEnterCount) <= 3 || synopEnterCount === undefined){
            if(synopEnterCount === undefined) {
                synopEnterCount = 0;
            }
            StbInterface.setProperty(constants.STB_PROP.SOUND_TOOLTIPGUIDE_COUNT_SYNOPSIS, Number(synopEnterCount) + 1);
        };

        this.isGuided = StbInterface.getProperty(constants.TOOLTIPGUIDE_FLAG_SYNOPSIS) ? StbInterface.getProperty(constants.TOOLTIPGUIDE_FLAG_SYNOPSIS) : false;
        
        if(!this.isGuided || this.isGuided === null ){
            StbInterface.setProperty(constants.TOOLTIPGUIDE_FLAG_SYNOPSIS, true);
        }

        // history
        if (!_.isEmpty(this.historyData)) {
            const historyData = this.historyData.synopInfo;
            const { focusIdx } = this.historyData;
            this.synopType = historyData.synopsis.contents.sris_typ_cd;
            historyData.synopsis.contents.yn_history = true;
            this.declareFocusList(this.focusList);
            this.setDefaultFm(historyData.synopsis, 'history');
            this.setFocus({id: focusIdx.key, idx: focusIdx.v, childIdx: focusIdx.h});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (JSON.stringify(nextState.synopInfo) !== JSON.stringify(this.state.synopInfo)
        || nextState.isBookmark !== this.state.isBookmark
        || JSON.stringify(nextState.buttonObj) !== JSON.stringify(this.state.buttonObj));
    }


    componentWillUnmount() {
        super.componentWillUnmount();
        StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY) !== '1' && Core.inst().hideKidsWidget();
    }

    setAPIcall = (paramData, watchall, synopsis_type, settingKey) => {
        synopAPI.xpgMetv(paramData, watchall, synopsis_type, settingKey, this.state.yn_season_watch_all).then(result => {
            if (result === 'error' || _.isEmpty(result)) {
                Core.inst().showToast('?????? ???????????? ???????????? ??? ????????????. ?????? ????????? ?????????.');
                return this.moveBack();
            } else {
                let cloneResult = _.cloneDeep(result);

                this.synopType = result.synopsis.contents.sris_typ_cd;
                settingKey === 'default' && this.setFocusList(this.synopType);
                if (this.state.yn_season_watch_all === 'N') {
                    if (!_.isEmpty(result.metvDirectview)) {
                        if (!_.isEmpty(result.metvDirectview.yn_season_watch_all)) {
                            this.state.yn_season_watch_all = result.metvDirectview.yn_season_watch_all;
                        }
                    }
                }

                // ???????????? ??????
                if (!_.isEmpty(result.synopsis.purchares)) {
                    this.getPurchares(result, settingKey);
                }
                
                result.synopsis.contents['btnPurchase'] = this.btnPurchase;
                result.synopsis.contents['seriesPurchase'] = this.seriesPurchase;
                result.synopsis.contents['yn_history'] = false;

                // ?????????
                let isBookmark = this.state.isBookmark;
                if (!_.isEmpty(result.bookmark)) {
                    const bookmark = result.bookmark === 'Y' ? true : false;
                    isBookmark = bookmark;
                }

                this.setDefaultFm(result.synopsis);
                this.setState({
                    defaultSynopsis: cloneResult.synopsis, // ???????????? ???????????? ?????? ?????????
                    isBookmark: isBookmark,
                    synopInfo: result
                },() => {
                    setTimeout(() => {
                        const { focusIdx } = this.state;
                        let setting = false;
                        switch(settingKey) {
                            case 'default': case 'season': case 'cw':
                                setting = true;
                            break;
                            default:break;
                        }
                        if (this.synopType === '01') {
                            focusIdx.key = 'series';
                            focusIdx.v = 0;
                            focusIdx.h = 0;
                            for (const [idx, item] of result.synopsis.contents.series_info.entries()) {
                                if (result.synopsis.contents.epsd_id === item.epsd_id) {
                                    focusIdx.h = idx;
                                    break;
                                }
                            }
                            let findSlides = _.find(this.focusList, ['key', 'slides']);
                            if (findSlides.fm.length === 0) {
                                this.setFm('top', null);
                            }
                        } else {
                            if (_.isEmpty(result.synopsis.contents.preview) && this.btnPurchase.purchase.length === 0 && this.btnPurchase.free.length === 0) {
                                focusIdx.h = 0;
                            }
                        }
                        if (paramData.focus) {
                            const { focus } = paramData;
                            focusIdx.key = focus.key;
                            focusIdx.v = focus.v;
                            focusIdx.h = focus.h
                            if (focus.ref) { // ?????????????????????
                                let findFm = _.find(this.focusList, ['key', 'purcharseButtons']);
                                const { lastIdx } = findFm.fm.listInfo;
                                focusIdx.key = 'purcharseButtons';
                                focusIdx.h = lastIdx;
                                if (focus.ref === 'prev') {
                                    focusIdx.h = lastIdx - 1;
                                }
                            }
                        }
                        if (settingKey === 'series') {
                            this.seriesDelay = true;
                        }
                        setting && this.setFocus({id: focusIdx.key, idx: focusIdx.v, childIdx: focusIdx.h});
                    },1);
                });
            }
        });
    }

    setFocusList = (synopType) => {
        if (synopType === '01') {
            this.focusList = this.seriseFm;
        } else {
            this.focusList = this.shortFm;
        }
        this.declareFocusList(this.focusList);
    }

    scrollTo = (anchor, marginTop) => {
        let top = 0;
        let offset = 0;
        if (anchor) {
            top = anchor.offsetTop;
        }
        const margin = marginTop ? marginTop : 0;
        let bShowMenu = true;
        if (top > 500) {
            offset = -(top - 60) + margin;
            bShowMenu = false;
        } else {
            offset = 0;
        }

        if (this.synopType === '01') {
            const slideLeft = document.querySelector('.innerMove')
            let slideTop = (offset + 1046) > 0 ? 0 : offset + 1046;
            slideLeft.style.transform = `translate(0px, ${-slideTop}px)`;
        } else {
            offset !== 0 ? offset += 46 : 0;
        }

        if (offset < 0) {
            this.setMainBgNone('add');
        }

        if (!_.isEmpty(this.state.synopInfo.synopsis.contents.bg_img_path)) {
            if (offset < 0) {
                this.setBgHero('blur');
            }
        }
        if (offset !== 0) {
            document.getElementById('pageArr').classList.add('on');
        }
        scroll(offset);
    }

    setDefaultFm = (data, route) => {
        const { purchase, unPurchase, free, change } = data.contents.btnPurchase;
        // UI ??????
        this.setUIpurchase(data.contents);
        if ((purchase.length !== 0 || free.length !== 0) && !change && this.synopType !== '01' && route !== 'history') {
            this.state.focusIdx.h = 0;
        }

        for (let item of this.focusList) {
            let containerSelector = '';
            let row = 1;
            let col = 1;
            let focusIdx = 0;
            let startIdx = 0;
            let lastIdx = 0;
            let onFocusKeyDown = function () { };
            let onFocusContainer = function () { };
            switch (item.key) {
                case 'banner':
                    onFocusKeyDown = this.onFocusKeyDownBanner;
                    break;
                case 'description':
                    containerSelector = '.contentTextBox'
                    onFocusKeyDown = this.onFocusKeyDownDescription;
                    break;
                case 'purcharseButtons':
                    containerSelector = 'ul';
                    col = this.uiButton.length;
                    lastIdx = this.uiButton.length - 1;
                    onFocusKeyDown = this.onFocusKeyDownPurcahrse;
                    onFocusContainer = this.onFocusButtonList;
                    break;
                default:
                    return;
            }
            let option = {
                id: item.key,
                containerSelector,
                moveSelector: '',
                focusSelector: '.csFocus',
                row: row,
                col: col,
                focusIdx: focusIdx,
                startIdx: startIdx,
                lastIdx: lastIdx,
                bRowRolling: true,
                onFocusKeyDown: onFocusKeyDown,
                onFocusContainer
            }
            const fm = new FM(option);

            if (item.key === 'banner' && _.isEmpty(data.contents.sris_evt_comt_exps_mthd_cd)) { // ?????? ????????? ????????? ??????
                this.setFm('banner', null);
            } else {
                this.setFm(item.key, fm);
            }
        }
    }

    setUIpurchase = (contents) => {
        const { purchase, unPurchase, free, change } = contents.btnPurchase;
        let buttonList = [];
        let first = null;
        first = free.length !== 0 ? 'free' : purchase.length !== 0 ? 'view' : !_.isEmpty(contents.preview) ? 'preview' : null;
        (!_.isEmpty(first) && this.synopType !== '01') && buttonList.push({key: first});

        if ((purchase.length !== 0 || free.length !== 0) && !change) {
            if (unPurchase.length !== 0) {
                buttonList.push({key: 'addPurchase'});
            }
        } else {
            for (const item of unPurchase) {
                item.key = 'purchase';
                buttonList.push(item);
            }
        }
        buttonList.push({key: 'bookmark'});
        if (this.synopType === '01' && !_.isEmpty(contents.sson_choic_nm)) {
            buttonList.push({key: 'seasonPrev'});
            buttonList.push({key: 'seasonNext'});
        }
        this.uiButton = buttonList;
    }

    onKeyDown(e) {
        if (!this.seriesDelay && (e.keyCode === UP || e.keyCode === DOWN)) {
            return;
        }
        this.handleKeyEvent(e);
        if (e.keyCode === BLUE || e.keyCode === BLUE_KEY && this.synopType === '01') {
            const { synopInfo } = this.state;
            synopAPI.metv023({sris_id: synopInfo.synopsis.contents.sris_id}).then((result) => {
                if (result.result === '0000') {
                    for (const [idx, item] of synopInfo.synopsis.contents.series_info.entries()) {
                        if (item.epsd_id === result.epsd_id) {
                            this.setFocus({id: 'series', childIdx: idx});
                            break;
                        }
                    }
                } else {
                    Core.inst().showToast('?????? ?????? ????????? ????????????.');
                }
            })
        } else if (e.keyCode === FAV_KEY) {
            this.setJJim(this.state.synopInfo.synopsis);
        }
    }

    // banner event
    onFocusKeyDownBanner = (e) => {
        if (e.keyCode === ENTER) {
            const { synopInfo } = this.state;
            const bannerTyep = synopInfo.synopsis.contents.sris_evt_comt_call_typ_cd
            const bannerUrl = synopInfo.synopsis.contents.sris_evt_comt_call_url;
            console.log('?????? ??????', bannerTyep, bannerUrl);
            let obj = {};
            switch(bannerTyep) {
                case '2':
                   StbInterface.openPopup('url', bannerUrl);
                break;
                case '501':
                break;
                case '502':
                break;
                case '503': // ????????????
                    let paramData = bannerUrl.split('/');
                    obj.sris_id = !_.isEmpty(paramData[2]) ? paramData[2]:undefined;
                    obj.epsd_id = !_.isEmpty(paramData[3]) ? paramData[3]:undefined;
                    this.movePage(constants.SYNOPSIS, obj);
                break;
                case '504':
                break;
                case '505':
                break;
                case '506':
                break;
                default:break;
            }
        }
    }

    // ????????? event
    onFocusKeyDownDescription = (e) => {
        if (e.keyCode === ENTER) {
            const contents = this.state.synopInfo.synopsis.contents;
            const obj = {
                title_img_path: contents.title_img_path,
                title: contents.title,
                content: contents.sris_snss_cts,
                bg_img_path: contents.bg_img_path,
                dark_img_yn: contents.dark_img_yn
            }
            Core.inst().showPopup(<SynopDescriptionPop />, obj, null);
        }
    }

    // ??????event
    onFocusKeyDownPurcahrse = (e, currentIdx) => {
        const { synopsis } = this.state.synopInfo;
        const { purchase, unPurchase, free, change } = synopsis.contents.btnPurchase;
        if (e.keyCode === ENTER) {
            let playInfo = _.clone(this.defaultPlayInfo);
            let lagList = [];
            playInfo.synopsis_type = this.synopType === '01' ? '02':'01';
            switch(this.uiButton[currentIdx].key) {
                case 'preview': // ?????????
                    playInfo.ynTeaser = 'Y';
                    playInfo.seeingPath = '47';   //???????????? ?????? VOD ??????(??????-?????????)
                    playInfo.preview_start_index = '0';
                    playInfo.prd_prc_id = synopsis.contents.preview[0].prd_prc_id;
                    this.adultCheck('VOD', synopsis, playInfo);
                break;
                case 'free': // ????????????
                    const addPurchase = _.union(free, purchase);
                    lagList = this.getPurchaseLag(addPurchase);
                    if (lagList.length > 1) { // ????????? ???????????? ??????2???????????????
                        this.playMoviePop(lagList);
                    } else {
                        playInfo.prd_prc_id = this.getRsluSort(addPurchase).prd_prc_id; // ??????????????? ?????????
                        this.adultCheck('VOD', synopsis, playInfo);
                    }
                break;
                case 'view': // ????????????
                    lagList = this.getPurchaseLag(purchase);
                    if (lagList.length > 1) { // ???????????? ??????2???????????????
                        this.playMoviePop(lagList);
                    } else {
                        playInfo.prd_prc_id = this.getRsluSort(purchase).prd_prc_id; // ??????????????? ?????????
                        this.adultCheck('VOD', synopsis, playInfo);
                    }
                break;
                case 'addPurchase': // ??????????????????
                    this.purcharesChange();
                break;
                case 'bookmark': // ???
                    this.setJJim(synopsis);
                break;
                case 'seasonPrev': // ????????????
                    this.onSeasonChange(synopsis, 'prev');
                break;
                case 'seasonNext': // ????????????
                    this.onSeasonChange(synopsis, 'next');
                break;
                default:    // ???????????? ??????
                    console.log('????????? ?????? OBJECT', this.uiButton[currentIdx]);
                    if (this.uiButton[currentIdx].prd_typ_cd === '41') {
                        const paramObj = {
                            menu_id: _.isEmpty(this.paramData.menu_id) ? '': this.paramData.menu_id,
                            sris_id: this.uiButton[currentIdx].sris_id
                        }
                        this.movePage(constants.SYNOPSIS_GATEWAY, paramObj);
                    } else {
                        playInfo.prd_prc_id = this.uiButton[currentIdx].prd_prc_id;
                        this.adultCheck('PUR', synopsis, playInfo);
                    }
                break;
            }
        } else if (e.keyCode === LEFT || e.keyCode === RIGHT) {
            let buttonObj = null;
            if (e.keyCode === LEFT) {
                currentIdx --;
                currentIdx = currentIdx === -1 ? this.uiButton.length : currentIdx;
            } else if (e.keyCode === RIGHT) {
                currentIdx ++;
                currentIdx = currentIdx > this.uiButton.length ? 0 : currentIdx;
            }
            if (!_.isEmpty(this.uiButton[currentIdx]) && this.uiButton[currentIdx].key === 'purchase') {
                buttonObj = this.uiButton[currentIdx];
            }
            this.setState({
                buttonObj: buttonObj
            });
        }
    }

    // ??????????????????
    playMoviePop = (purchase) => {
        let obj = {
            synopsis: this.state.synopInfo.synopsis,
            purchase: purchase,
            paramData: this.paramData
        }
        Core.inst().showPopup(<SynopPlayMovieType />, obj);
    }

    // ????????????
    adultCheck = async (route, synopsis, playInfo) => {
        const { contents } = synopsis;
        console.log('?????? ???????????? ??????', StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT));
        const setAge = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT); // ???????????? ??????
        let pinkMove = !_.isEmpty(contents.adlt_lvl_cd); // ????????????
        let data;
        if (route === 'PUR') { // ?????? ??????????????? ??????????????????
            let ageFlag = false;
            if (!_.isEmpty(setAge) && (Number(contents.wat_lvl_cd)) >= Number(setAge)) {
                ageFlag = true;
            }
            data = await new Promise((res, rej) => {
                if ((pinkMove || ageFlag) && !this.adultState && setAge !== '0') {
                    let obj = {
                        certification_type: '',
                        age_type: ''
                    };
                    if (!_.isEmpty(contents.adlt_lvl_cd)) {
                        obj.certification_type = constants.CERT_TYPE.ADULT_PLAYPURCHASE;
                    } else {
                        obj.certification_type = constants.CERT_TYPE.AGE_LIMIT;
                        obj.age_type = contents.wat_lvl_cd;
                    }
                    Core.inst().showPopup(<AdultCertification />, obj, (result) => {
                        res(result);
                    });
                } else {
                    res({result: '0000'});
                }
            });
        }

        switch(route) {
            case 'PUR':
                if (data && data.result === '0000') {
                    this.adultState = true;
                    this.setPurchaseContent(synopsis, playInfo);
                }
            break;
            case 'VOD':
                // if (data && data.result === '0000') {
                    this.adultState = true;
                    this.setVodPlay(synopsis, playInfo);
                // }
            break;
            default:break;
        }
    }

    // VOD??????
    setVodPlay = (synopsis, playInfo) => {
        var obj = {
            nxpg010: synopsis,
            playInfo: playInfo
        }
        // console.log('setVodPlay', obj);
        CTSInfo.requestWatchVOD(obj, this.vodCallback);
    }

    // ????????????
    setPurchaseContent = (synopsis, playInfo) => {
        var obj = {
            nxpg010: this.state.defaultSynopsis,
            playInfo: playInfo
        }
        // console.log('setPurchaseContent', obj);
        CTSInfo.purchaseContent(obj, this.purchaseCallback);
    }

    // ??? ??????
    getJJim = (synopsis) => {
        const { contents } = synopsis;
        // ?????????
        const obj = {
            type: 'select',
            seriesId: contents.sris_id
        }
        const bookmark = StbInterface.requestFavoriteVodInfo(obj);
        // const bookmark = appConfig.STBInfo.favVodListMap;
        // console.log('bookmark!!!!!!!!!!', bookmark);
        return bookmark;
    }

    // ?????????
    setJJim = (synopsis) => {
        // this.isBookmark = true;
        let isBookmark = this.state.isBookmark;
        if (isBookmark) {
            const param = {
                group: 'VOD',
                yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
                isAll_type: '0',
                // deleteList: [synopsis.purchares[0].epsd_rslu_id],
                deleteList: [synopsis.contents.sris_id],
                sris_id: synopsis.contents.sris_id,
                // epsd_rslu_id: synopsis.purchares[0].epsd_rslu_id
            };
            Utils.bookmarkDelete(param, 'D').then((result) => {
                console.log('????????? ?????? ??????', result);
                if (result.result === "0000") {
                    console.log('??? ?????? ??????');
                    isBookmark = false;
                    this.setState({
                        isBookmark: !this.state.isBookmark
                    })
                }
            });
        } else {
            const param = {
                group: 'VOD',
                yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
                sris_id: synopsis.contents.sris_id,
                epsd_id: synopsis.contents.epsd_id,
                epsd_rslu_id: synopsis.contents.epsd_rslu_info[0].epsd_rslu_id
            };
            Utils.bookmarkCreate(param).then((result) => {
                console.log('????????? ?????? ??????', result);
                if (result.result === "0000") {
                    console.log('??? ?????? ??????');
                    isBookmark = true;
                    this.setState({
                        isBookmark: !this.state.isBookmark
                    })
                }
            });
        }
    }

    // ??????????????? on
    onFocusButtonList = (driection) => {
        const { contents } = this.state.synopInfo.synopsis;
        if (this.synopType !== '01') {
            this.setMainBgNone('remove');
            !_.isEmpty(contents.bg_img_path) && this.setBgHero('hero');
            scroll(0);
        }
        document.getElementById('pageArr').classList.remove('on');

        const curIdx = this.getCurrentFocusInfo().fm.listInfo.curIdx;
        let buttonObj = this.uiButton[curIdx];
        if (!_.isEmpty(buttonObj) && buttonObj.key !== 'purchase') {
            buttonObj = null;
        }
        this.setState({
            buttonObj: buttonObj
        });
        if (driection === 'UP' || driection === 'DOWN') {
            this.setFocus({id: 'purcharseButtons', childIdx: 0})
        }
    }

    // top??????
    onSelectTopButton = (e) => {
        if (e.keyCode === keyCode.Keymap.ENTER) {
            const { focusIdx } = this.state;
            if (this.synopType === '01') {
                this.setFocus({id: 'series', childIdx: focusIdx.h});
            } else {
                console.log('focusIdx.h', focusIdx.h);
                this.setFocus({id: 'purcharseButtons', childIdx: focusIdx.h});
            }
            this.setMainBgNone('remove');
            !_.isEmpty(this.state.synopInfo.synopsis.contents.bg_img_path) && this.setBgHero('hero');
            scroll(0);
        }
    }

    // ?????? ???????????? ??????
    onSelect = (slideKey, slideIdx, chlidIdx) => {
        // console.log('synopsisView onSelect',slideKey, slideIdx, chlidIdx);
        const { synopsis, metvDirectview } = this.state.synopInfo;
        let obj = {};
        let playInfo = _.clone(this.defaultPlayInfo);
        if (synopsis.contents.sris_typ_cd === '01') {
            playInfo.synopsis_type = '02';
        } else {
            playInfo.synopsis_type = '01';
        }

        if (slideKey !== 'cwSlide') {
            this.state.focusIdx = {
                key: 'slides',
                v: slideIdx,
                h: chlidIdx
            }
        }

        switch (slideKey) {
            case 'preStill': // ??????????????? & ???????????????
                const preStill = _.union(synopsis.contents.preview, synopsis.contents.stillCut);
                if (preStill[chlidIdx].title) {
                    playInfo.ynTeaser = 'Y';
                    playInfo.seeingPath = '47';   //???????????? ?????? VOD ??????(??????-?????????)
                    playInfo.preview_start_index = chlidIdx;
                    this.adultCheck('VOD', synopsis, playInfo);
                } else {
                    obj.stillCut = synopsis.contents.stillCut;
                    obj.choice = preStill[chlidIdx];
                    Core.inst().showPopup(<SynopShortSteel />, obj, this.stillcutCallback);
                }
                break;
            case 'preview': // ????????? ??????
                playInfo.ynTeaser = 'Y';
                playInfo.seeingPath = '47';   //???????????? ?????? VOD ??????(??????-?????????)
                playInfo.preview_start_index = chlidIdx;
                playInfo.prd_prc_id = synopsis.contents.preview[chlidIdx].prd_prc_id;
                this.adultCheck('VOD', synopsis, playInfo);
                break;
            case 'stillCut': // ????????? ??????
                obj.stillCut = synopsis.contents.stillCut;
                obj.choice = synopsis.contents.stillCut[chlidIdx];
                Core.inst().showPopup(<SynopShortSteel />, obj, this.stillcutCallback);
                break;
            case 'special': // ???????????????
                let possn = 'N';
                for (const item of synopsis.contents.btnPurchase.purchase) {
                    if (item.possn_yn === 'Y') {
                        possn = 'Y';
                        break;
                    }
                }
                if (possn === 'N') {
                    return Core.inst().showToast('?????????????????? ????????? ????????? ???????????????.');
                } else {
                    playInfo.ynSpecial = 'Y';
                    playInfo.seeingPath = '47';   //???????????? ?????? VOD ??????(??????-?????????)
                    playInfo.special_start_index = chlidIdx;
                    playInfo.prd_prc_id = synopsis.contents.special[chlidIdx].prd_prc_id;
                    this.adultCheck('VOD', synopsis, playInfo);
                }
                break;
            case 'corners': // ????????????
                // obj = synopsis.contents.corners[chlidIdx];
                // obj.main_title = synopsis.contents.title;
                // obj.title = synopsis.contents.corners[chlidIdx].cnr_nm;
                // obj.brcast_tseq_nm = synopsis.contents.brcast_tseq_nm; // ??????

                if (_.isEmpty(synopsis.contents.corners[chlidIdx].cnr_grp_id)) {
                    obj = {
                        nxpg010: synopsis,
                        playInfo: playInfo
                    }
                    obj.playInfo.type = 'synopsis';
                    CTSInfo.requestWatchCorenr(obj, this.vodCallback);
                } else {
                    obj = synopsis;
                    obj.index = chlidIdx;
                    obj.type = 'synopsis';
                    Core.inst().showPopup(<SynopCornerPop />, obj, null);
                }
                break;
            case 'peoples': // ????????????
                obj.menu_id = this.paramData.menu_id;
                obj.prs_id = synopsis.contents.peoples[chlidIdx].prs_id;
                obj.bg_img_path = synopsis.contents.bg_img_path;
                obj.dark_img_yn = synopsis.contents.dark_img_yn;
                if (_.isEmpty(obj.prs_id)) {
                    return Core.inst().showToast('????????? ???????????? ????????????.');
                }
                this.movePage(constants.SYNOPSIS_PERSONAL, obj);
                break;
            case 'series': // ?????????????????????
                if (this.seriesDelay) {
                    if (_.isEmpty(synopsis.contents.products)) {
                        return Core.inst().showToast('??? ????????? ?????????????????? ?????? ????????????????????? ??? ????????? ??? ????????????.');
                    }
                    const { seriesPurchase } = synopsis.contents;
                    playInfo.ynSerise = 'Y';
                    playInfo.epsd_id = synopsis.contents.series_info[chlidIdx].epsd_id;
                    playInfo.serIdx = chlidIdx;
                    playInfo.brcast_tseq_nm = synopsis.contents.series_info[chlidIdx].brcast_tseq_nm;

                    const purchaseData = _.sortBy(seriesPurchase, 'rslu_typ_cd').reverse()[0]; // ????????? ??????
                    playInfo.prd_prc_id = purchaseData.prd_prc_id;
                    
                    this.state.focusIdx.key = 'series';
                    if (synopsis.contents.gstn_yn) {    // ???????????? ??????
                        playInfo.seeingPath = '48';   //???????????? ?????? VOD ??????
                    }
                    if (seriesPurchase.purchase.length !== 0 || synopsis.contents.gstn_yn === 'Y' || Number(synopsis.contents.products[0].sale_prc_vat) === 0) {
                        this.adultCheck('VOD', synopsis, playInfo);
                    } else {
                        this.adultCheck('PUR', synopsis, playInfo);
                        // this.setPurchaseContent(synopsis, playInfo);
                    }
                }
                break;
            case 'cwSlide':
                // ?????????????????? chlidIdx ??? ????????? object??? ?????? ??????
                let paramData = {};
                const synopsis_type = chlidIdx.synon_typ_cd === '01' ? '1' : '3';
                let watchall = 'Y'; // yn_seacon_watchall ??????????????? Y ???
                let search_type = '1'; // 1:epsd_id??????, 2:epsd_rslu_id??????
                paramData.sris_id = chlidIdx.sris_id;
                paramData.epsd_id = chlidIdx.epsd_id;
                paramData.search_type = search_type;
                this.state.focusIdx = {
                    key: 'slides',
                    v: slideIdx,
                    h: chlidIdx.childIdx
                }
                Utils.movePageAfterCheckLevel(constants.SYNOPSIS, paramData, chlidIdx.wat_lvl_cd)
                break;
            default: break;
        }
    }

    // ????????????
    onSeasonChange = (synopsis, direction) => {
        let paramData = {};
        let search_type = '1'; // 1:epsd_id??????, 2:epsd_rslu_id??????
        // let synopsis_type = '3'; // 1:????????????, 2:??????????????????, 3:??????????????????or????????????
        // paramData.synopsis_type = synopsis_type;
        paramData.search_type = search_type;

        let epsd_id = null;
        let sris_id = null;
        if (direction === 'prev') {
            epsd_id = synopsis.contents.prev_epsd_id;
            sris_id = synopsis.contents.prev_sris_id;
        } else {
            epsd_id = synopsis.contents.next_epsd_id;
            sris_id = synopsis.contents.next_sris_id;
        }

        if (_.isEmpty(epsd_id) || _.isEmpty(sris_id)) {
            return Core.inst().showToast('????????? ???????????? ????????????.');
        }

        paramData.epsd_id = epsd_id;
        paramData.sris_id = sris_id;
        paramData.focus = {
            key: 'purcharseButtons',
            h: null,
            v: null,
            ref: direction
        }

        // this.resetFmList('slides');
        // const fm = this.getFm('purcharseButtons');
        // fm.removeFocus();
        
        // this.setAPIcall(paramData, watchall, synopsis_type, 'season');
        this.movePage(constants.SYNOPSIS, paramData);
    }

    // ????????? ??????
    onSeriesChanged = (idx) => {
        this.seriesDelay = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            const { synopsis } = this.state.synopInfo;
            const seriesInfo = synopsis.contents.series_info[idx];
            let paramData = _.isEmpty(this.historyData) ? this.paramData : this.historyData.synopInfo.param;
            let watchall = 'N'; // yn_seacon_watchall ??????????????? Y ???
            let search_type = '1'; // 1:epsd_id??????, 2:epsd_rslu_id??????
            let synopsis_type = '2'; // 1:????????????, 2:??????????????????, 3:??????????????????or????????????
            if (_.isEmpty(paramData.epsd_id) && _.isEmpty(seriesInfo.epsd_id)) {
                search_type = '2';
            }
            paramData.search_type = search_type;
            paramData.epsd_id = seriesInfo.epsd_id;
            paramData.yn_recent = 'N';
            this.resetFmList('slides');
            this.setAPIcall(paramData, watchall, synopsis_type, 'series');
        }, 300);
    }

    // ??????????????? ??????
    getPurchares = (synopInfo, settingKey) => {
        const { synopsis: {contents, purchares}, metvDirectview } = synopInfo;
        let purchaseList = [];
        // ?????? ??????
        // ?????? ppv_products
        // ?????????????????? ??? ???????????? pps_products(????????????), ppv_products(?????????)
        // ??????????????? ??????????????? ppv_products(?????????)

        // ????????????????????? ??????
        const now = new Date().getTime();
        for (const [idx, item] of purchares.entries()) {
            if (!_.isEmpty(item.prd_prc_to_dt)) {
                const prd_prc_to_dt = moment(item.prd_prc_to_dt, 'YYYYMMDDhhmmss').format('YYYY/MM/DD/hh:mm:ss');
                if (now < new Date(prd_prc_to_dt).getTime()) {
                    purchaseList.push(item);
                }
            }
        }

        let setting = false;
        switch(settingKey) {
            case 'default': case 'season':
                setting = true;
            break;
            default: setting = false; break;
        }
        // ???????????? ??????
        if (setting) {
            if (this.synopType === '01') {
                // ?????? & ????????????
                this.setPurchaseButton(metvDirectview, purchaseList);
                this.setPurchaseSeries(metvDirectview, contents);
            } else {
                // ??????
                this.setPurchaseButton(metvDirectview, purchaseList);
            }
        } else {
            // ???????????? ??????????????? ????????? ??? (????????? ????????????)
            this.setPurchaseSeries(metvDirectview, contents);
        }

        console.log('??????', this.btnPurchase);
        console.log('?????????', this.seriesPurchase);
    }

    setPurchaseSort = (purchase, unPurchase, free) => {
        for (let i = 0; i < 3; i++) {
            let forData = [];
            let key = '';
            switch(i) {
                case 0: forData = purchase; key = 'purchase'; break;
                case 1: forData = unPurchase; key = 'unPurchase'; break;
                case 2: forData = free; key = 'free'; break;
            }
            let btnPurchase = _.map(_.groupBy(forData, (doc) => {
                let groupBy = null;
                if (this.synopType === '01') {
                    groupBy = `${doc.asis_prd_typ_cd}`;
                } else {
                    if (key === 'unPurchase') {
                        groupBy = `${doc.asis_prd_typ_cd}'#'${doc.possn_yn}`;    
                    } else {
                        groupBy = `${doc.asis_prd_typ_cd}'#'${doc.possn_yn}'#'${doc.lag_capt_typ_cd}`;
                    }
                }
                return groupBy;
            }),(grouped) => {
                // ???????????? ??????
                if (grouped.length === 1) {
                    grouped.isPrc = false;
                } else {
                    grouped = grouped.reduce((prv, crr, idx, arr) => {
                        let isPrc = false
                        if (prv.sale_prc_vat !== crr.sale_prc_vat) {
                            isPrc = true;
                        }
                        arr.isPrc = isPrc;
                        return arr;
                    });
                }
                
                // ?????? ????????? ??? ???????????? sort
                let buttonData = _.uniq(_.sortBy(grouped, 'sale_prc_vat'), true, a => a.sale_prc_vat)[0];
                buttonData.isPrc = grouped.isPrc;
                return buttonData;
            });
    
            let sortData = _.sortBy((btnPurchase), a=>a.prd_typ_cd === '30'); // ????????? ????????? ?????????
            this.btnPurchase[key] = sortData;
        }
    }

    // ?????? ????????????
    setPurchaseButton = (metvDirectview, purchares) => {
        let purchase=[], unPurchase=[], free=[];
        if (metvDirectview.result === '0000') {
            let metv = metvDirectview.ppv_products;
            if (this.synopType === '01') {
                metv = metvDirectview.pps_products;
            }
            for (const item of purchares) {
                for (const item2 of metv) {
                    if (item.prd_prc_id === item2.prd_prc_id) {
                        const isYn = item.prd_typ_cd === '41' ? item2.yn_purchase : item2.yn_directview;
                        if (item.sale_prc_vat === 0) {
                            free.push(item);
                        } else if (isYn === 'Y') {
                            purchase.push(item);
                        } else {
                            unPurchase.push(item);
                        }
                    }
                }
            }
        }
        this.setPurchaseSort(purchase, unPurchase, free);
    }
    // ????????? ????????????
    setPurchaseSeries = (metvDirectview, contents) => {
        this.seriesPurchase = {
            purchase: [],
            unPurchase: [],
            free: []
        }
        if (metvDirectview.result === '0000') {
            for (const item of metvDirectview.ppv_products) {
                for (const item2 of contents.products) {
                    if (item.prd_prc_id === item2.prd_prc_id) {
                        if (item2.sale_prc_vat === 0) {
                            this.seriesPurchase.free.push(item2);
                        } else if (item.yn_directview === 'Y'|| this.state.yn_season_watch_all === 'Y') {
                            this.seriesPurchase.purchase.push(item2);
                        } else {
                            this.seriesPurchase.unPurchase.push(item2);
                        }
                    }
                }
            }
        } else {
            for (const item2 of contents.products) {
                if (item2.sale_prc_vat === 0) {
                    this.seriesPurchase.free.push(item2);
                } else if (this.state.yn_season_watch_all === 'Y') {
                    this.seriesPurchase.purchase.push(item2);
                } else {
                    this.seriesPurchase.unPurchase.push(item2);
                }
            }
        }
    }

    // ????????? ?????? ????????? (?????????????????? ?????? ????????????)
    getRsluSort = (button) => {
        let sortArr = _.sortBy(button, 'rslu_typ_cd', 'possn_yn', (a)=>a.possn_yn ==='N').reverse(); // ????????? ?????? ?????? ?????????(??????????????? ?????? ????????????)
        return sortArr[0];
    }

    // ?????????????????? ???????????????
    getPurchaseLag = (purchase) => {
        let rsluSort = _.sortBy(purchase, 'rslu_typ_cd').reverse();
        let uniqBy = _.uniqBy(rsluSort, 'lag_capt_typ_cd');
        return uniqBy;
    }

    // ??????????????????
    purcharesChange = () => {
        let synopInfo = _.cloneDeep(this.state.synopInfo);
        synopInfo.synopsis.contents.btnPurchase.change = true;
        const fm = this.getFm('purcharseButtons');
        fm.removeFocus();
        if (this.synopType === '01') {
            this.resetFmList('slides');
        }
        this.setDefaultFm(synopInfo.synopsis, 'history');
        this.setState({
            synopInfo,
            buttonObj: this.state.buttonObj
        },() => {
            this.setFocus({id: 'purcharseButtons', childIdx: 0});
        });
    }

    // VOD callback
    vodCallback = (data) => {
        console.log('VOD??????!!! ????????????', this.paramData);
        console.log('VOD??????!!! ?????????', this.state.focusIdx);
        console.log('VOD??????!!!', data);
    }

    // ?????? callback
    purchaseCallback = (data) => {
        if (data.result === '0000') {
            this.movePage(constants.SYNOPSIS, this.paramData);
        }
    }

    // ??????????????? callback
    stillcutCallback = (idx) => {
        const { contents } = this.state.defaultSynopsis;
        let stillIdx = idx;
        if (!_.isEmpty(contents.preview)) {
            stillIdx += contents.preview.length;
        }
        this.setFocus({id: 'slides', idx:0, childIdx: stillIdx});
    }

    // background????????? class??????
    setMainBgNone = (type) => {
        let mainBg = document.getElementById('synopsisMainBg');
        if (type === 'add') {
            mainBg.classList.add('full');
        } else {
            mainBg.classList.remove('full');
        }
    }

    // bg????????? blur??????
    setBgHero = (type) => {
        if (type === 'hero') {
            document.getElementById('bgHero').style.display = 'block';
            document.getElementById('bgBlur').style.display = 'none';
        } else {
            document.getElementById('bgHero').style.display = 'none';
            document.getElementById('bgBlur').style.display = 'block';
        }
    }

    setCwHistory = (data) => {
        this.state.synopInfo.cwRelation = data;
    }

    render() {
        const { synopInfo, isBookmark, buttonObj } = this.state;
        let Component = null;
        if (!_.isEmpty(synopInfo.synopsis.contents)) {
            Component = synopInfo.synopsis.contents.sris_typ_cd === '01' ? SynopSeries : SynopShort;
        }

        // console.log('### synopView ###', synopInfo);
        console.log('focusList', this.focusList);

        return (
            !_.isNull(Component) ?
            <Component
                param={this.paramData}
                data={synopInfo}
                setFm={this.setFm}
                setFocus={this.setFocus}
                scrollTo={this.scrollTo}
                onSelect={this.onSelect}
                onSelectTop={this.onSelectTopButton}
                onSeriesChanged={this.onSeriesChanged}
                resetFm={this.resetFmList}
                isBookmark={isBookmark}
                buttonObj={buttonObj}
                setCwHistory={this.setCwHistory}
                isGuided = {this.isGuided}
            />
            :
            <div className="mainBg">
                <div className="bgImg">
                    <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png`} alt="" />
                </div>
            </div>
        );
    }
}

export default SynopsisView;
