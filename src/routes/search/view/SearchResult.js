import React, { Component } from 'react';
import PageView from '../../../supporters/PageView';
import { CSS, RVS, MeTV, NXPG } from 'Network';
import { CTSInfo } from 'Supporters/CTSInfo';
import routePath, {STB_PROP} from '../../../config/constants';
import { scroll } from '../../../utils/utils';
import FM from '../../../supporters/navi';
import Core from '../../../supporters/core';
import '../../../assets/css/routes/search/SearchResult.css';
import moment from 'moment';
import StbInterface from 'Supporters/stbInterface';
import { isEmpty, isEqual } from 'lodash';

import MovieVOD from "../components/MovieVOD"
import CornerInfo from "../components/CornerInfo"
import TvProgramVOD from "../components/TvProgramVOD"
import CharacterSearch from "../components/CharacterSearch"
import ApplicationList from "../components/ApplicationList"
import RelationWord from "../components/RelationWord"
import appConfig from 'Config/app-config';
import SynopCornerPop from '../../synopsis/popup/SynopCornerPop';
import Utils from '../../../utils/utils';

//Dummy Data
// import searchResult from '../../../assets/json/routes/search/searchResult.json';
// import slideA_A from '../../../assets/json/routes/search/slideA_A.json';
// import slideA_B from '../../../assets/json/routes/search/slideA_B.json';
// import slideB_A from '../../../assets/json/routes/search/slideB_A.json';
// import slideB_B from '../../../assets/json/routes/search/slideB_B.json';
// import slidePerson from '../../../assets/json/routes/search/slidePerson.json';
// import slideOnlyImg from '../../../assets/json/routes/search/slideOnlyImg.json';
// import slideRelation from '../../../assets/json/routes/search/slideRelation.json';
// import tvApp from '../../../assets/json/routes/search/tvApp.json';

class SearchResult extends PageView {
    constructor(props) {
        super(props);

        let SEARCH_KEYWORD = "";
        let tagYn = null;
        if (this.props.location.state)
            SEARCH_KEYWORD = this.props.location.state.data;
        if(this.props.location.state.tagYn){
            tagYn = this.props.location.state.tagYn;
        }
        this.state = {
            // searchWord: this.props.location.state.data ? this.props.location.state.data : '' ,
            searchWord: SEARCH_KEYWORD,
            searchList: this.props.location.state.list,
            //searchWord: this.paramData.data ? this.paramData.data : '' ,
            tagYn:tagYn,
            searchType:this.props.location.state.searchType,
            active: false,
            totalCnt: 0,
            topShow: false,
            resultInfo: {
                vodInfo: null,
                packageInfo: null,
                cornerInfo: null,
                liveInfo: null,
                characterInfo: null,
                personInfo: null,
                tvAppInfo: null,
                relationInfo: null,
                kizChannelLists: null
            }
        }
        this.scrollPos = 0;
        this.isHeadEndData = false;
        this.isStbData = false;

        const focusList = [
            { key: 'reSearch', fm: null },

            { key: 'vodSlide', fm: null },
            { key: 'pkgSlide', fm: null },
            { key: 'cornerSlide', fm: null },
            { key: 'liveSlide', fm: null },
            { key: 'personSlide', fm: null },
            { key: 'appSlide', fm: null },
            { key: 'relationSlide', fm: null },

            { key: 'onTopFocus', fm: null },
        ];
        this.declareFocusList(focusList);


        const reSearch = new FM({
            id: 'reSearch',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.reSearchEnterDown,
        });
        this.setFm('reSearch', reSearch);


        const onTopFocus = new FM({
            id: 'onTopFocus',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onSelectTop,
        });
        this.setFm('onTopFocus', onTopFocus);

    }

    scrollTo = (anchor, marginTop) => {
        let top = 0;
        let offset = 0;
        if (anchor) {
            top = anchor.offsetTop;
        }
        const margin = marginTop ? marginTop : 0;
        if (top > 500) {
            offset = -(top - 60) + margin;
        } else {
            offset = 0;
        }
        scroll(offset);
    }

    onSelectTop = (event) => {
        if (event.keyCode === 13) {
            scroll(0);
            this.setFocus(1, 0);
        }
    }

    reSearchEnterDown = (event, idx) => {
        if (event.keyCode === 13)
            this.movePage(routePath.SEARCH_HOME);
    }

    relationEnterDown = (keyword) => {
        if (keyword) {
            this.movePage(routePath.SEARCH_RESULT, { data: keyword });
        }
    }

    componentWillReceiveProps(nextProps) {

        const { data: nextKeyword } = nextProps.history.location.state;
        const { keyword } = this.state;
        console.log("componentWillReceiveProps 1 : ",nextKeyword , keyword,this.props.history.location.searchType, this.props.history.location.state.tagYn  );
        console.log("componentWillReceiveProps 1-1 : ", this.historyData );
        let tagYn = 'N';
        if(this.props.history.location.state.tagYn){
            tagYn = this.props.history.location.state.tagYn;
        }else{
            
        }
        if(!keyword){
            this.selectSearchData(nextKeyword, tagYn);
        }

        if (nextKeyword !== keyword && !keyword) {
            // this.handleRequestAPI(nextKeyword);
            // const tag = 'N';
            if(!this.state.searchList){
                console.log("componentWillReceiveProps 2 : ");
                this.selectSearchData(nextKeyword, tagYn);
            }
        }


        // if (nextProps.history.location.state !== null && nextProps.history.location.state !== undefined) {
        //     console.log("?????? ????????? ????????? ???????????? : ",nextProps.history.location.state.data);
        //     let slideInfo = nextProps.history.location.state.data;
        //     let keyword = slideInfo;
        //     let tag = 'N';
                
        //     this.selectSearchDate(keyword, );
            
        //     // this.setState({
        //     //     searchWord: data.history.location.state.data
        //     // })
            
            
        //     this.handleRequestAPI();
        // }
    }

    selectSearchData = async (keyword, tag) => {

        // ?????? ??????????????? ?????? ??????.
        if(this.props.location.state.data === keyword){
            // break;
            // console.log("????????? ?????? : ",this.props.location.state.data, keyword);
            // return false;
        }
        this.props.location.state.data = keyword;
        let redata = null;
        const searchResult2 = await CSS.request002({ keyword: keyword, transactionId: 'search_result_list', doc_page: '100^100^100^100^100^100', tag_yn: tag });
        Promise.all([searchResult2]).then((value) => {
            const result = value[0];
            console.log(result);
            // console.log("result222222 : ",this.props.location.state.data , keyword);
            if(this.state.searchWord !== keyword){  
            const focusList = [
                { key: 'reSearch', fm: null },
    
                { key: 'vodSlide', fm: null },
                { key: 'pkgSlide', fm: null },
                { key: 'cornerSlide', fm: null },
                { key: 'liveSlide', fm: null },
                { key: 'personSlide', fm: null },
                { key: 'appSlide', fm: null },
                { key: 'relationSlide', fm: null },
    
                { key: 'onTopFocus', fm: null },
            ];
            this.declareFocusList(focusList);

            const reSearch = new FM({
                id: 'reSearch',
                type: 'ELEMENT',
                focusSelector: '.csFocus',
                row: 1,
                col: 1,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 0,
                onFocusKeyDown: this.reSearchEnterDown,
            });
            this.setFm('reSearch', reSearch);
    
    
            const onTopFocus = new FM({
                id: 'onTopFocus',
                type: 'ELEMENT',
                focusSelector: '.csFocus',
                row: 1,
                col: 1,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 0,
                onFocusKeyDown: this.onSelectTop,
            });
            this.setFm('onTopFocus', onTopFocus);
        }

            if (!value[0].total_result_no || value[0].total_result_no < 1) {
                this.props.history.push(routePath.SEARCH_RESULT_NONE, { data: keyword });
            } else {

                vodInfo = null;
                packageInfo = null;
                cornerInfo = null;
                liveInfo = null;
                personInfo = null;
                tvAppInfo = null;
                relationInfo = null;

                //VOD ??????
                let vodInfo = [];
                if (result.results_vod) {
                    vodInfo.slideType = "VOD";
                    vodInfo.slideTitle = "VOD";
                    vodInfo.slideItem = result.results_vod.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ???????????? (0:VOD)
                            title: result.title,
                            image: result.poster,
                            price: result.price,
                            level: result.level,
                            synon_typ_cd: result.synon_typ_cd, //????????? ???????????? ??????(??????/??????????????????)
                            hd_flag: result.hd_flag,            //???????????? (10:SD, 20:HD, 30:UHD)
                            epsd_id: result.epsd_id,
                            epsd_rslu_id: result.epsd_rslu_id
                        }
                    })
                }
                //????????? ??????
                let packageInfo = [];
                if (result.results_pkg) {
                    packageInfo.slideType = "pkg";
                    packageInfo.slideTitle = "?????????";
                    packageInfo.slideItem = result.results_pkg.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ????????????(1:?????????)
                            title: result.title,
                            image: result.poster,
                            price: result.price,
                            epsd_id: result.epsd_id,
                            sris_id: result.sris_id,
                            synon_typ_cd: result.synon_typ_cd,  //????????? ???????????? ??????(??????/??????????????????)
                            level: result.level
                        }
                    })
                }

                //?????? ??????
                let cornerInfo = [];
                if (result.results_corner) {
                    cornerInfo.slideType = "corner";
                    cornerInfo.slideTitle = "??????/??????";
                    cornerInfo.slideItem = result.results_corner.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ???????????? (2:??????/??????)
                            cnr_id: result.cnr_id,              //??????/?????? ?????????
                            contants_title: result.main_title,            //????????????
                            group_id: result.group_id,           //?????????????????? ???????????????
                            title: result.title,                 //?????????
                            hd_flag: result.hd_flag,             //???????????? (10:SD, 20:HD, 30:UHD)
                            level: result.level,
                            section_flag: result.section_flag,   //???????????????/???????????? ????????? (1:????????????, 2:????????? ??????)
                            start_time: result.start_time,       //???????????? ?????? (START)
                            image: result.thumb,                  //????????? ????????? ??????
                            epsd_id: result.epsd_id             //???????????? ID
                        }
                    })
                }
                //????????? TV
                let liveInfo = [];
                if (result.results_tv) {
                    liveInfo.slideType = "live";
                    liveInfo.slideTitle = "????????? ??????";

                    let onAir = false;
                    let now_time = moment().format("YYMMDDHHmm");

                    let callBack = "";
                    let allDataCount = result.results_tv.length;

                    let cnt = "0";
                    this.blocksList = [];

                    this.blocksList = result.results_tv.map((results, i) => {

                        return {
                            channelInfo: {
                                channelNum: results.channel_code,
                                startTime: results.start_time
                            }
                        }
                    })

                    liveInfo.slideItem = result.results_tv.map((result, i) => {
                        if (result.start_time < now_time && result.end_time > now_time) {
                            onAir = true; //?????? ?????? onAir = false ?????????
                        }else{
                            onAir = false;
                        }


                        return {
                            idx: result.idx,                     //????????????
                            code: result.code,                   //???????????? ???????????? (3:????????? ??????)
                            con_id: result.con_id,               //???????????? ?????????
                            title: result.title,
                            thumb_live: result.thumb_live,       //????????? ?????????
                            channel_name: result.channel_name,
                            channel_code: result.channel_code,
                            start_time: result.start_time,
                            end_time: result.end_time,
                            hd_flag: result.hd_flag,             //???????????? (10:SD, 20:HD, 30:UHD)
                            level: result.level,
                            image: appConfig.headEnd.IGSIMAGE.url + result.con_id + '.png',
                            onAir: onAir,                         //?????? ????????? ??????
                            timer: "ture"
                        }
                    })
                }

                // ????????? ?????? ??????,
                // Phase2 ?????? ??????

                //????????????
                let personInfo = [];
                if (result.results_people) {
                    personInfo.slideType = "person";
                    personInfo.slideTitle = "??????";
                    personInfo.slideItem = result.results_people.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,           //???????????? ????????????(5:??????)
                            prs_id: result.prs_id,       //?????? ?????????
                            birth: result.birth,
                            job: result.job,
                            name: result.title
                        }
                    })
                }

                //APP
                let tvAppInfo = [];
                if (result.results_app) {
                    tvAppInfo.slideType = "app";
                    tvAppInfo.slideTitle = "APP";
                    tvAppInfo.slideItem = result.results_app.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,               //???????????? ????????????(6:APP)
                            title: result.title,
                            vass_id: result.vass_id,
                            item_id: result.item_id,
                            service_id: result.service_id,
                            image: result.app_img
                        }
                    })
                }

                //?????? ?????????
                let relationInfo = [];
                if (result.results_relation) {
                    relationInfo.slideType = "relation";
                    relationInfo.slideTitle = "???????????????";
                    relationInfo.slideItem = result.results_relation.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,           //???????????? ????????????(99:???????????????)
                            keyword: result.keyword
                        }
                    })
                }

                let vodCount = null;
                let packCount = null;
                let cornerCount = null;
                let liveCount = null;
                let personCount = null;
                let appCount = null;
                let relationCount = null;

                if (!vodInfo.slideItem){ vodInfo = null}else{
                    vodCount = vodInfo.slideItem.length;
                };
                if (!packageInfo.slideItem){ packageInfo = null}else{
                    packCount = packageInfo.slideItem.length;
                };;
                if (!cornerInfo.slideItem){ cornerInfo = null}else{
                    cornerCount = cornerInfo.slideItem.length;
                };
                if (!liveInfo.slideItem){ liveInfo = null}else{
                    liveCount = liveInfo.slideItem.length;
                };
                if (!personInfo.slideItem){ personInfo = null}else{
                    personCount = personInfo.slideItem.length;
                };
                if (!tvAppInfo.slideItem){ tvAppInfo = null}else{
                    appCount = tvAppInfo.slideItem.length;
                };
                if (!relationInfo.slideItem){ relationInfo = null}else{
                    relationCount = relationInfo.slideItem.length;
                };

                const totalCount = vodCount+packCount+cornerCount+liveCount+personCount+appCount+relationCount;

                const resultInfo = {
                    vodInfo,
                    packageInfo,
                    cornerInfo,
                    liveInfo,
                    //characterInfo,
                    personInfo,
                    tvAppInfo,
                    relationInfo,
                    totalCount
                };

                // ????????? 2????????? ????????? ?????? ?????? ??????
                let downShow = true;
                let downShowLenght = Object.keys(result).length;
                let focusListLast = this.focusList.length;
                if(downShowLenght < 12){
                    downShow = false;
                    this.focusList[focusListLast-1].fm = null;
                }
                
                // ???????????? ?????? ??????????????? ?????????
                this.setState({
                    resultInfo,
                    totalCnt: value[0].total_result_no,
                    searchWord: keyword,
                    downShow : downShow,
                    list : searchResult2,
                    searchList : searchResult2,
                    searchWords: keyword,
                    tagYn: 'Y'
                });

                const { movePage } = this.props;
                console.log("????????? ?????? : ",value[0]);
                redata = value[0];
                // scroll(0);
                // this.setFocus(1);
                
                // this.movePage(routePath.SEARCH_RESULT, { data: keyword, list:value[0] });
                return searchResult2;
                
                console.log(">>> focusList ????????? >>> :: ", this.focusList );
            }
            
        })
        // return searchResult2;
    }

    componentDidMount() {
        // ?????? General GNB
        this.props.showMenu(false);
        StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID);
        // console.log("?????? ????????? ?????? ????????? : ",this.kizChannelLists);
        // document.querySelector('.wrapper').classList.add('dark');
    }

    componentWillMount() {
        this.handleRequestAPI();
        // this.handleStbInterface();
        this.updateChannnelInfo();
    }

    MeTVList = async () => {
        // const myVods = await MeTV.request035();
        
        const myVods = await MeTV.request035();

        const purchaseList = myVods.purchaseList ? myVods.purchaseList : [];
        let myList = purchaseList.map((vod, idx) => {
            const {
                title,
                poster: imgURL,
                epsd_id: epsdId,
                sris_id: srisId,
                adult,
                epsd_rslu_id: epsdRsluId,
                prod_id: prodId
            } = vod;
            const bAdult = adult === 'Y';
            return {
                title,
                imgURL,
                epsdId,
                srisId,
                bAdult,
                epsdRsluId,
                prodId
            };
        
        });
    // return myList;

    }

    kizModeCheck = (slideInfo, slideType) => {
        // ????????? VOD ??????
        const param = {
            menu_id: this.menuId,
            epsd_id: slideInfo.epsd_id,
            sris_id: slideInfo.epsd_rslu_id,
            search_type: 1 // 1: epsd_id ??????, 2: epsd_rslu_id
        };
        // ?????? ?????? ??????
        const kidsMode = isEqual(StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY), '1');
        if(kidsMode){
            this.checkKiz(param).then(response => {
    
                // ?????? ?????? ?????? ??????
                const kizCheck = response;
                // ?????? ?????? ?????? ??????
                // const kizMode = this.state.kidsMode;
                // console.log(">>> ???????????????1 ?????? ?????? ??????! : ",  kizCheck); // N
                // console.log(">>> ???????????????2 ?????? ?????? ?????? ! : ", kidsMode); // false ?????? ?????? ??????
                if(kidsMode){
                    if(kizCheck !== 'Y'){
                        // console.log("?????? ??????, ?????? ?????? ??????, ?????? ?????? ");
                        // ?????? ?????? ??????
                        Core.inst().webkidsExit(null, () => { this.synopGo(slideInfo, slideType)});
                    }else{
                        // console.log("?????? ??????, ?????? ?????? ???");
                        this.synopGo(slideInfo, slideType)
                    }
                }else{
                    // ????????????
                    // console.log("?????? ?????? ?????? ?????? ")
                    // Core.inst().webkidsExit(null, this.synopGo(slideInfo, slideType));
                    this.synopGo(slideInfo, slideType);
                }
            })

        }else{
            this.synopGo(slideInfo, slideType)
        }
    }

    synopGo = (slideInfo, slideType) =>{

        const vodSynopData = { epsd_rslu_id: slideInfo.epsd_rslu_id };
        if(slideType === 'VOD'){

            Utils.movePageAfterCheckLevel(routePath.SYNOPSIS, vodSynopData, slideInfo.level);
        }else if(slideType === 'pkg'){
            const { sris_id, epsd_id } = slideInfo;
            const synopParam = { sris_id, epsd_id };
            if(slideInfo.synon_typ_cd === "03"){
                
                Utils.movePageAfterCheckLevel(routePath.SYNOPSIS_GATEWAY, synopParam, slideInfo.level);
            }else{
                Utils.movePageAfterCheckLevel(routePath.SYNOPSIS_VODPRODUCT, synopParam, slideInfo.level);
            }
        }else if(slideType === 'corner'){
            let obj = {};
            obj = slideInfo;
            const playInfo = {
                type: obj.type,
                playType: CTSInfo.PLAYTYPE.VOD_CORNER,
                playOption: 'normal',
                search_type: '1',
                fromCommerce: 'N'
            }
            // ?????? ????????????
            const paramData = {
                apiData: obj,
                playInfo: playInfo
            }
            // console.log("?????? ?????? ?????? ????????? : ",paramData)
            CTSInfo.requestWatchCorenr(paramData, null);

        }else if(slideType === 'person'){
            let obj = {};
            obj.prs_id = slideInfo.prs_id;
            obj.filmogrps = slideInfo.prs_id;
            this.movePage(routePath.SYNOPSIS_PERSONAL, obj);
        }
    }

    // ????????? VOD ??????
    checkKiz = async (param) => {
        const details = await NXPG.request010(param);
        const kidsYn = details.contents.kids_yn;
        return kidsYn
    }

    // ?????? ?????? ??????(????????? ?????? ?????????)
    cornerKizCheck = (slideInfo, slideType) => {
        const param = {
            menu_id: this.menuId,
            epsd_id: slideInfo.epsd_id,
            sris_id: slideInfo.epsd_rslu_id,
            search_type: 1 // 1: epsd_id ??????, 2: epsd_rslu_id
        };

        this.checkKiz(param).then(response => {

        })
        // let obj = {};
        // obj = slideInfo;

        // const playInfo = {
        //     type: obj.type,
        //     playType: CTSInfo.PLAYTYPE.VOD_CORNER,
        //     playOption: 'normal',
        //     search_type: '1',
        //     fromCommerce: 'N'
        // }
        // // ?????? ????????????
        // const paramData = {
        //     apiData: obj,
        //     playInfo: playInfo
        // }
        // CTSInfo.requestWatchCorenr(paramData, null);
    }

    callBackChannelID = async (callBack) => {
        // StbInterface.requestKidsZoneChannelInfo(callBack);

        const listKiz = [];
        const result = callBack.channel.map((item, index) => {
            const {
                channel_name: chName,
                service_id: svcId,
                channel_no: chNo
            } = item;
         
            // const channel = allChannels.get(chNo);
            // const isNotFree = channel && channel.pay && !includes(registeredChannels.join, chNo);
      
            return { chName, svcId, chNo };
            // return { channel_name, service_id, channel_no };
        });
        listKiz.push(result);
        this.setState({
            kizChannelLists: result

        })
        return result;
    }

    // ?????? ?????? ?????????
    kizChannelList = async () => {

        StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID)

    }

    callBackLive(slideInfo){

        // ?????? ???????????? ?????? ?????? ????????? ??????
        if (slideInfo.onAir) {
            slideInfo.channelNo = slideInfo.channel_code;

            //TODO : entryPath ?????? ????????? ???. ?????? SEARCH ??????.
            slideInfo.entryPath = "SEARCH";
            StbInterface.requestLiveTvService("M", slideInfo);

        } else {
            //TODO : ?????? ???????????? ?????? ??????????????? ?????? ?????? ??????
            console.log("slideInfo : ",slideInfo);
            
            // ?????? ???????????? MS??? ?????? ??????
            let startTime = "20" + slideInfo.start_time;
            let endTime = "20" + slideInfo.end_time;
            let msecPerMinute = 1000 * 60;
            let msecPerHour = msecPerMinute * 60;
            let msecPerDay = msecPerHour * 24;

            let startDate = new Date(startTime.substring(0,4)+"-"+startTime.substring(4,6)+"-"+startTime.substring(6,8));
            let startHMS = startTime.substring(8,10) * msecPerHour;
            let startMMS = startTime.substring(10,12) * msecPerMinute;
            let startTimes = startHMS + startMMS;
            let startTimeMS = startDate.getTime() + startTimes -32400000; // Date ?????????????????? ?????? 9????????? ?????????

            let endDate = new Date(endTime.substring(0,4)+"-"+endTime.substring(4,6)+"-"+endTime.substring(6,8));
            let endTimeHMS = endTime.substring(8,10) * msecPerHour;
            let endTimeMMS = endTime.substring(10,12) * msecPerMinute;
            let endTimes = endTimeHMS + endTimeMMS;
            let endTimeMS = endDate.getTime() + endTimes -32400000; // Date ?????????????????? ?????? 9????????? ?????????
            
            const { channelList } = this.state;
            let activeType = "R";
            for (let i = 0; i < channelList.length; i++) {
                let proStartTime = channelList[i].channelInfo.startTime;
                if(channelList[i].channelNum === slideInfo.channel_code && startTimeMS.toString() === proStartTime.toString()){
                    activeType = "D";
                }
            }

            let callBack = '';
            StbInterface.requestLiveTvService(activeType, { channelNo: slideInfo.channel_code, channelName: slideInfo.channel_name, programName: slideInfo.title, startTime: startTimeMS, endTime: endTimeMS, serviceId : slideInfo.con_id }, callBack);
           
            this.updateChannnelInfo();

        }


    }

    //VOD , pkg, corner, live, person, app ?????? Event
    onSelectVod = (slideType, slideInfo) => {
        switch (slideType) {
            case 'VOD': //??????, ?????? ???????????? ??????

                // const TVList = this.MeTVList();
                const synopData = { epsd_rslu_id: slideInfo.epsd_rslu_id };
                this.kizModeCheck(slideInfo,slideType);

                // Utils.movePageAfterCheckLevel(routePath.SYNOPSIS, synopData, slideInfo.level);
                // Utils.movePageAfterCheckLevel(path, param, param.wat_lvl_cd);
                break;
            case 'pkg':
                // TODO : Type??? ?????? ??????????????? ???????????? or VOD+???????????? ???????????? ??????
                // ????????? ID, ?????? ID ????????? ?????? API??? ?????? ?????? ?????? ??????.
                // ??????????????? SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT 2?????? ?????? ?????? ??????
                if (slideInfo.synon_typ_cd === "03") {
                    //[3.5 ??????????????? ????????????]  SYNOPSIS_GATEWAY
                    //this.movePage(routePath.SYNOPSIS_GATEWAY, {data: keyword});

                    const { sris_id, epsd_id } = slideInfo;
                    const synopParam = { sris_id, epsd_id };
                    // this.movePage(routePath.SYNOPSIS_GATEWAY, synopParam, slideInfo.level);
                    const synopData = { epsd_rslu_id: slideInfo.epsd_rslu_id };
                    this.kizModeCheck(slideInfo, slideType);
                    // Utils.movePageAfterCheckLevel(routePath.SYNOPSIS_GATEWAY, synopParam, slideInfo.level);

                    break;
                } else {
                    //[3.6 VOD+???????????? ????????????] SYNOPSIS_VODPRODUCT

                    const { sris_id, epsd_id } = slideInfo;
                    const synopParam = { sris_id, epsd_id };
                    // this.movePage(routePath.SYNOPSIS_VODPRODUCT, synopParam, slideInfo.level);
                    const synopData = { epsd_rslu_id: slideInfo.epsd_rslu_id };
                    this.kizModeCheck(slideInfo, slideType);
                    // Utils.movePageAfterCheckLevel(routePath.SYNOPSIS_VODPRODUCT, synopParam, slideInfo.level);
                    break;
                }


            case 'corner':
                //TODO : VOD ?????? ???????????? ??????(?????? ???????????? ??????)
                // 1 : ????????????, 2 : ???????????????
                // slideInfo.section_flag = ??? 2????????? ???, ???????????? ??????/???????????? ?????? ??????
                if(slideInfo.section_flag === "1"){
                    let obj = {};
                    obj = slideInfo;
                    Core.inst().showPopup(<SynopCornerPop />, obj, null);
                    break;

                } else {
                    // let obj = {};
                    // obj = slideInfo;

                    // const playInfo = {
                    //     // type: obj.type,
                    //     type: 'search',
                    //     playType: CTSInfo.PLAYTYPE.VOD_CORNER,
                    //     playOption: 'normal',
                    //     search_type: '1',
                    //     fromCommerce: 'N'
                    // }
                    // console.log("?????? ?????? ?????? : ",playInfo );
                    // // ?????? ????????????
                    // const paramData = {
                    //     apiData: obj,
                    //     playInfo: playInfo
                    // }
                    // CTSInfo.requestWatchCorenr(paramData, null);
                    //TODO : ????????? ?????? ?????? ?????? -> ???????????? 3.14 ??????
                    this.kizModeCheck(slideInfo, slideType);
                }
                break;
            case 'live':
                // appConfig.runDevice ? StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID) : this.callBackChannelID(KIDS_CHANNEL);
                // console.log("channel_code : ",slideInfo.channel_code);
                const kidsMode = isEqual(StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY), '1');
                // console.log("?????? ?????? ????????? ????????? ?????? ????????? ????????? ?????? : ",kidsMode);

                // ????????? ?????? ????????? ?????? ??? ?????? ????????? ??????
                const kizChannelList = this.state.kizChannelLists
                let kidsChanner = true;
                for (let i = 0; i < kizChannelList.length; i++) {
                    // console.log("kizChannelList : ",kizChannelList[i].chNo);
                    if(kizChannelList[i].chNo !== slideInfo.channel_code){

                        // ????????? ???????????? ????????? ?????? ????????? ???????????? ??????
                        kidsChanner = false;
                    }
                }
                console.log("?????? ?????? ????????? ????????? ?????? ????????? ????????? ?????? ?????? : ",kidsChanner);
                // ????????? ?????? ?????? ?????? ?????? ????????? ?????? ??????
                if(!kidsChanner && kidsMode){
                    Core.inst().webkidsExit(null, () => { this.callBackLive(slideInfo)});
                    // break;
                }else{
                    this.callBackLive(slideInfo)
                }

                // let bbb = null;
                // StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID);
                // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> : ",bbb);

                // // ?????? ???????????? ?????? ?????? ????????? ??????
                // if (slideInfo.onAir) {
                //     slideInfo.channelNo = slideInfo.channel_code;

                //     //TODO : entryPath ?????? ????????? ???. ?????? SEARCH ??????.
                //     slideInfo.entryPath = "SEARCH";
                //     StbInterface.requestLiveTvService("M", slideInfo);

                // } else {
                //     //TODO : ?????? ???????????? ?????? ??????????????? ?????? ?????? ??????
                //     console.log("slideInfo : ",slideInfo);
                    
                //     // ?????? ???????????? MS??? ?????? ??????
                //     let startTime = "20" + slideInfo.start_time;
                //     let endTime = "20" + slideInfo.end_time;
                //     let msecPerMinute = 1000 * 60;
                //     let msecPerHour = msecPerMinute * 60;
                //     let msecPerDay = msecPerHour * 24;

                //     let startDate = new Date(startTime.substring(0,4)+"-"+startTime.substring(4,6)+"-"+startTime.substring(6,8));
                //     let startHMS = startTime.substring(8,10) * msecPerHour;
                //     let startMMS = startTime.substring(10,12) * msecPerMinute;
                //     let startTimes = startHMS + startMMS;
                //     let startTimeMS = startDate.getTime() + startTimes -32400000; // Date ?????????????????? ?????? 9????????? ?????????

                //     let endDate = new Date(endTime.substring(0,4)+"-"+endTime.substring(4,6)+"-"+endTime.substring(6,8));
                //     let endTimeHMS = endTime.substring(8,10) * msecPerHour;
                //     let endTimeMMS = endTime.substring(10,12) * msecPerMinute;
                //     let endTimes = endTimeHMS + endTimeMMS;
                //     let endTimeMS = endDate.getTime() + endTimes -32400000; // Date ?????????????????? ?????? 9????????? ?????????
                    
                //     const { channelList } = this.state;
                //     let activeType = "R";
                //     for (let i = 0; i < channelList.length; i++) {
                //         let proStartTime = channelList[i].channelInfo.startTime;
                //         if(channelList[i].channelNum === slideInfo.channel_code && startTimeMS.toString() === proStartTime.toString()){
                //             activeType = "D";
                //         }
                //     }

                //     let callBack = '';
                //     StbInterface.requestLiveTvService(activeType, { channelNo: slideInfo.channel_code, channelName: slideInfo.channel_name, programName: slideInfo.title, startTime: startTimeMS, endTime: endTimeMS, serviceId : slideInfo.con_id }, callBack);
                   
                //     this.updateChannnelInfo();

                // }
                break;
            case 'person': //?????? ?????? ???????????? ??????
                let obj = {};
                obj.prs_id = slideInfo.prs_id;
                obj.filmogrps = slideInfo.prs_id;
                Utils.movePageAfterCheckLevel(routePath.SYNOPSIS_PERSONAL, obj, slideInfo.level);
                break;
            case 'app':
                /**
                 * app ???????????? : app ?????? ????????????
                 * app ????????? : app ??????
                 * 
                 * app ?????? ????????? ?????? ???????????? ???????
                 */
                break;
            case 'relation':

                let keyword = slideInfo;
                
                // ?????? ??????????????? ?????? ??????.
                if(this.props.location.state.data === keyword){
                    break;
                }
                this.props.location.state.data = keyword;

                
                const tag = 'Y';
                // let selectData = this.selectSearchData(keyword, tag);
                this.movePage(routePath.SEARCH_RESULT, { data: keyword, tagYn:'Y'});
                
            break;
            default:
                break;
        }
    }

    // TODO : ?????? ?????? (?????????)
    handleRvsRequest(data, method) {

        let contents = {
            sid: data.con_id,
            channelNo: data.channel_code,
            channelName: data.channel_name,
            programName: data.title,
            startTime: moment(data.start_time, 'YYMMDDHHmm').format('YYYY-MM-DDTHH:mm:ss'),
            endTime: moment(data.end_time, 'YYMMDDHHmm').format('YYYY-MM-DDTHH:mm:ss'),
            reservationTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
        }
        let param = {
            method: method === "add" ? 'addReservation' : 'delReservation',
            if_no: "IF-RVS-501",
            ver: "5.0",
            ui_name: "10.3.7.6",
            response_format: "json",

            deviceType: "0",
            stbID: "{C850BAA7-A8F2-11DF-BA04-AB3068A21A05}",

            count: "1",
            contents: {
                item: [contents]
            }
        }
        if (method === "add") {
            RVS.request501(param, (status, resData, tid) => {
                let result;
                if (status === 200) {
                    try {
                        result = JSON.parse(resData)
                        document.querySelectorAll("#timerIcon")[data.idx - 1].classList.add("iconTimer");
                        Core.inst().showToast(data.title, '???????????? ???????????????.', 3000);
                    }
                    catch (err) {
                        console.log('JSON DATA ERRROR  :: ', resData)
                    }
                    finally {
                        result.reason
                        if (result.IF === 'IF-ME-013' && result.result === '0000') {
                            console.log('a')
                        }
                    }
                }
            })
        }
        // TODO : ?????? ?????? ?????? ????????? ??? ??????
        // else { 
        //     RVS.request502(param, (status, resData, tid) => {
        //         let result;
        //         if (status === 200) {
        //             try{
        //                 result = JSON.parse(resData)
        //                 console.log('result :: ', result)
        //             } 
        //             catch (err) {
        //                 console.log('JSON DATA ERRROR  :: ', resData)
        //             } 
        //             finally {
        //                 //result.reason
        //                 //if (result.IF === 'IF-ME-013' && result.result === '0000') {
        //                // console.log('a')
        //             }
        //         }
        //     })
        // }

    }

    updateChannnelInfo = () => {
        
        // ?????? ?????? ?????? ??????(???????????? : ?????? ??????)
        StbInterface.requestChannelList((data) => {
            this.setState({
                fChannel: data.favoriteChannel,
                isStbData: !this.isStbData
            });
        });

        // ????????? ?????? ?????? ?????? ??????
        StbInterface.requestReservationInfo({
            isAll: 'Y'
            // channelCount: data.channelCount,
            // channelList: data.channelList
         } , (data) => {
             console.log(">>>> ????????? ?????? ?????? ?????? ::: ",data);
            this.setState({
                channelCount: data.channelCount,
                channelList: data.channelList
            });
        });
    }

    handleRequestAPI() {
        //???????????? H/E ??????
        console.log("?????? ?????? ?????? : ",this.state.searchList);
        console.log("?????? ?????? ?????? state : ",this.state);
        let searchResult = null;
        // ?????? ??????(????????????, ????????????)
        let tagYn = 'Y';
        if(this.state.tagYn){
            tagYn = this.state.tagYn;
        }
        console.log("?????? ?????? !!!! : ",this.state.tagYn, tagYn);
        if(!this.state.searchList){
            console.log("?????? ?????? ?????? ???????????????!!!! ");
            searchResult = CSS.request002({ keyword: this.state.searchWord, transactionId: 'search_result_list', doc_page: '100^100^100^100^100^100', tag_yn: tagYn });
        }else{
            searchResult = this.state.searchList;
        }
        // const searchResult = CSS.request002({ keyword: this.state.searchWord, transactionId: 'search_result_list', doc_page: '100^100^100^100^100^100', tag_yn: 'N' });
        
        console.log("?????? ?????? : ",searchResult);


        Promise.all([searchResult]).then((value) => {
            const result = value[0];
            console.log("result ?????? ?????? ?????? : ",this.state.searchWord ,result);
            
            
            //?????? ?????? ?????????
            if (!value[0].total_result_no || value[0].total_result_no < 1) {
                this.movePage(routePath.SEARCH_RESULT_NONE, { data: this.state.searchWord });

            } else {   //?????? ?????? ?????????
                //VOD ??????

            //     const result = MeTV.request035({page_no: page, entry_no: MAX_PAGE_ITEM});
            //     const { 
            //         page_tot: totalPage, 
            //         page_no: currentPage, 
            //         purchase_tot: totalVod, 
            //         purchaseList: list
            //    } = result;

           

                let vodInfo = [];
                if (result.results_vod) {
                    vodInfo.slideType = "VOD";
                    vodInfo.slideTitle = "VOD";
                    vodInfo.slideItem = result.results_vod.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ???????????? (0:VOD)
                            title: result.title,
                            image: result.poster,
                            price: result.price,
                            level: result.level,
                            synon_typ_cd: result.synon_typ_cd, //????????? ???????????? ??????(??????/??????????????????)
                            hd_flag: result.hd_flag,            //???????????? (10:SD, 20:HD, 30:UHD)
                            epsd_id: result.epsd_id,
                            epsd_rslu_id: result.epsd_rslu_id
                        }
                    })
                }

                //????????? ??????
                let packageInfo = [];
                if (result.results_pkg) {
                    packageInfo.slideType = "pkg";
                    packageInfo.slideTitle = "?????????";
                    packageInfo.slideItem = result.results_pkg.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ????????????(1:?????????)
                            title: result.title,
                            image: result.poster,
                            price: result.price,
                            epsd_id: result.epsd_id,
                            sris_id: result.sris_id,
                            synon_typ_cd: result.synon_typ_cd,  //????????? ???????????? ??????(??????/??????????????????)
                            level: result.level
                        }
                    })
                }

                //?????? ??????
                let cornerInfo = [];
                if (result.results_corner) {
                    cornerInfo.slideType = "corner";
                    cornerInfo.slideTitle = "??????/??????";
                    cornerInfo.slideItem = result.results_corner.map((result, i) => {
                        return {
                            idx: result.idx,                   //????????????
                            code: result.code,                 //???????????? ???????????? (2:??????/??????)
                            cnr_id: result.cnr_id,              //??????/?????? ?????????
                            contants_title: result.main_title,            //????????????
                            group_id: result.group_id,           //?????????????????? ???????????????
                            title: result.title,                 //?????????
                            hd_flag: result.hd_flag,             //???????????? (10:SD, 20:HD, 30:UHD)
                            level: result.level,
                            section_flag: result.section_flag,   //???????????????/???????????? ????????? (1:????????????, 2:????????? ??????)
                            start_time: result.start_time,       //???????????? ?????? (START)
                            image: result.thumb,                  //????????? ????????? ??????
                            epsd_id: result.epsd_id             //???????????? ID
                        }
                    })
                }

                //????????? TV
                let liveInfo = [];
                if (result.results_tv) {
                    liveInfo.slideType = "live";
                    liveInfo.slideTitle = "????????? ??????";

                    let onAir = false;
                    let now_time = moment().format("YYMMDDHHmm");

                    let callBack = "";
                    let allDataCount = result.results_tv.length;

                    let cnt = "0";
                    this.blocksList = [];

                    this.blocksList = result.results_tv.map((results, i) => {

                        return {
                            channelInfo: {
                                channelNum: results.channel_code,
                                startTime: results.start_time
                            }
                        }
                    })

                    liveInfo.slideItem = result.results_tv.map((result, i) => {
                        if (result.start_time < now_time && result.end_time > now_time) {
                            onAir = true; //?????? ?????? onAir = false ?????????
                        }else{
                            onAir = false;
                        }
                        return {
                            idx: result.idx,                     //????????????
                            code: result.code,                   //???????????? ???????????? (3:????????? ??????)
                            con_id: result.con_id,               //???????????? ?????????
                            title: result.title,
                            thumb_live: result.thumb_live,       //????????? ?????????
                            channel_name: result.channel_name,
                            channel_code: result.channel_code,
                            start_time: result.start_time,
                            end_time: result.end_time,
                            hd_flag: result.hd_flag,             //???????????? (10:SD, 20:HD, 30:UHD)
                            level: result.level,
                            image: appConfig.headEnd.IGSIMAGE.url + result.con_id+ '_306x180.png',
                            onAir: onAir,                         //?????? ????????? ??????
                            timer: "ture"
                        }
                    })
                }

                // ????????? ?????? ??????,
                // Phase2 ?????? ??????

                //????????????
                let personInfo = [];
                if (result.results_people) {
                    personInfo.slideType = "person";
                    personInfo.slideTitle = "??????";
                    personInfo.slideItem = result.results_people.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,           //???????????? ????????????(5:??????)
                            prs_id: result.prs_id,       //?????? ?????????
                            birth: result.birth,
                            job: result.job,
                            name: result.title
                        }
                    })
                }

                //APP
                let tvAppInfo = [];
                if (result.results_app) {
                    tvAppInfo.slideType = "app";
                    tvAppInfo.slideTitle = "APP";
                    tvAppInfo.slideItem = result.results_app.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,               //???????????? ????????????(6:APP)
                            title: result.title,
                            vass_id: result.vass_id,
                            item_id: result.item_id,
                            service_id: result.service_id,
                            image: result.app_img
                        }
                    })
                }

                //?????? ?????????
                let relationInfo = [];
                if (result.results_relation) {
                    relationInfo.slideType = "relation";
                    relationInfo.slideTitle = "???????????????";
                    relationInfo.slideItem = result.results_relation.map((result, i) => {
                        return {
                            idx: result.idx,
                            code: result.code,           //???????????? ????????????(99:???????????????)
                            keyword: result.keyword
                        }
                    })
                }

                let vodCount = null;
                let packCount = null;
                let cornerCount = null;
                let liveCount = null;
                let personCount = null;
                let appCount = null;
                let relationCount = null;


                if (!vodInfo.slideItem){ vodInfo = null}else{
                    vodCount = vodInfo.slideItem.length;
                };
                if (!packageInfo.slideItem){ packageInfo = null}else{
                    packCount = packageInfo.slideItem.length;
                };;
                if (!cornerInfo.slideItem){ cornerInfo = null}else{
                    cornerCount = cornerInfo.slideItem.length;
                };
                if (!liveInfo.slideItem){ liveInfo = null}else{
                    liveCount = liveInfo.slideItem.length;
                };
                if (!personInfo.slideItem){ personInfo = null}else{
                    personCount = personInfo.slideItem.length;
                };
                if (!tvAppInfo.slideItem){ tvAppInfo = null}else{
                    appCount = tvAppInfo.slideItem.length;
                };
                if (!relationInfo.slideItem){ relationInfo = null}else{
                    relationCount = relationInfo.slideItem.length;
                };

                const totalCount = vodCount+packCount+cornerCount+liveCount+personCount+appCount+relationCount;
                // console.log("searchResult!!! : ",result);
                const resultInfo = {
                    vodInfo,
                    packageInfo,
                    cornerInfo,
                    liveInfo,
                    //characterInfo,
                    personInfo,
                    tvAppInfo,
                    relationInfo,
                    isHeadEndData: !this.isHeadEndData,
                    totalCount
                };
                // console.log(Object.keys(result).length); // 11 ?????? ??? ?????? ?????????
                let downShow = true;
                let downShowLenght = Object.keys(result).length;
                let focusListLast = this.focusList.length;
                if(downShowLenght < 12){
                    downShow = false;
                    this.focusList[focusListLast-1].fm = null;
                }
                this.setState({
                    resultInfo,
                    totalCnt: value[0].total_result_no,
                    topShow : true,
                    downShow : downShow
                })
                
                // this.movePage(routePath.SEARCH_RESULT, { data: keyWord, list:value[0] });
            }
            //this.setFocus(1);
            console.log(">>> ?????? ?????? ?????? >>> :: ", this.focusList )
        }, () => {
            console.log("error");

        })
    }


    render() {
        const { resultInfo, favorCh, fChannel, channelList, topShow, downShow } = this.state;
        const {
            vodInfo,
            packageInfo,
            cornerInfo,
            liveInfo,
            //characterInfo,
            personInfo,
            tvAppInfo,
            relationInfo
        } = resultInfo;
        console.log(">>> focusList >>> :: ", this.focusList );
        console.log(">>> tagYn >>> :: ", this.state.tagYn );
        return (
            <div className="wrap dark">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/search/bg-search.png`} alt="" /></div>
                <div className="searchResultWrap scrollWrap">
                    {topShow &&
                    <div className="resultTitleArea">
                        <p className="resultTitle"><strong>???{this.state.searchWord}???</strong> ??? ?????? ??????????????? ??? <strong>{resultInfo.totalCount}???</strong> ?????????.</p>
                        <span id="reSearch" tabIndex="-1" className={this.state.active ? "csFocus btnStyle type03 focusOn" : "csFocus btnStyle type03"}>
                            <span className="wrapBtnText">?????? ??????</span>
                        </span>
                    </div>
                    }
                    {/* VOD */}
                    {vodInfo && <MovieVOD 
                        key={`${this.state.searchWord}0`}
                        slideInfo={vodInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }
                    {/* ????????? */}
                    {packageInfo && <MovieVOD
                        key={`${this.state.searchWord}1`}
                        slideInfo={packageInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }
                    {/* ?????? / ?????? */}
                    {cornerInfo && <CornerInfo
                        key={`${this.state.searchWord}2`}
                        slideInfo={cornerInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }
                    {/* ????????? ?????? */}
                    {liveInfo && <TvProgramVOD
                        key={`${this.state.searchWord}3`}
                        slideInfo={liveInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        favorCh={fChannel}
                        onSelectVod={this.onSelectVod}
                        timer={true}
                        channelList={channelList}
                        />
                    }
                    {/* ????????? ?????? ?????? Phase2 ?????? ??????
                        characterInfo */}
                    {/* ?????? */}
                    {personInfo && <CharacterSearch
                        key={`${this.state.searchWord}4`}
                        slideInfo={personInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }
                    {/* tvApp */}
                    {tvAppInfo && <ApplicationList
                        key={`${this.state.searchWord}5`}
                        slideInfo={tvAppInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }
                    {/* ??????????????? */}
                    {relationInfo && <RelationWord
                        key={`${this.state.searchWord}6`}
                        slideInfo={relationInfo}
                        setFm={this.setFm}
                        setFocus={this.setFocus}
                        scrollTo={this.scrollTo}
                        onSelectVod={this.onSelectVod} />
                    }

                    {topShow && downShow && <BtnTop onSelect={this.onSelectTop}
                            topShow={this.state.topShow}
                    />}
                </div>
            </div>
        )
    }
}

class BtnTop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    render() {
        const { focused } = this.state;
        const focusClass = `csFocus btnTop${focused ? ' focusOn' : ''}`;
        return (
            <div className="btnTopWrap black">
                <span id="onTopFocus" className={focusClass}><span>??? ??????</span></span>
            </div>
        );
    }
}

export default SearchResult;