import { React, Moment } from '../../../utils/common';
import '../../../assets/css/routes/liveTv/organization/Organization.css';
import appConfig from "../../../config/app-config";
import EpgData from './epgData';

import { MeTV, NXPG, RVS, WEPG } from 'Network';
// import OrganizationAPIs from './OrganizationAPIs';
import {
    dummyDataMapping, genre_sort, fav_sort, fav_mapping,  getChannelByPage, getMaxPage,
    getChannelsByPageNumber, channelUpDownAdjacencyMove, __channelUpDownAdjacencyMove
} from './OrganizationUtils'

//TODO: 화면별 다른 JSON 연결 추후 삭제
import dummyMenu from './menu.json'
// import dummyBookmark from './bookmark.json'

//TODO: 화면별 다른 JSON 연결 추후 삭제
import orgMenu from '../../../assets/json/routes/liveTv/organization/OrgMenu.json';
// import { HorizontalList, VerticalList } from 'Navigation';
import PageView from '../../../supporters/PageView';

import Menu from './Menu';
import ProgramList from './ProgramList';
import ProgramTimeList from './ProgramTimeList';
// import { stringify } from 'postcss';

// import { fm } from '../../../supporters/navigator';

import Core from '../../../supporters/core';
import STB_IF from '../../../supporters/stbInterface';


//STATIC 변수
const TIMEUNIT = 1800; //30min
const TIME2PIXEL = 1425 / 5400; //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기
const PROGRAMOFFSET = 5400;     //90 minutes unixtime
// const TIMEUNIT = 300; //5min
//width / (TIME2PIXEL) = time
//const TIMELINEVIEWBIG = 490; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈
//const TIMELINEVIEWMINI = 250; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈

const MAXROWCOUNT = 6;     // 전체편성표 ROW 

// 상용, 개발 전환
const DEVICEMODE_STB = appConfig.runDevice
const stbID = appConfig.STBInfo.stbId
const menuID = appConfig.STBInfo.menu_id
const hashID = appConfig.STBInfo.hashId

class Organization extends PageView {
    focus = [];
    indexInList = 0;
    indexInTable = 0;
    menuIdxInTable = 6; // static 
    lastFocusIndex = 0;
    maxRight = 1426;
    change_contentW = 0;
    left_contentw = 0;
    totalProgramLength = 0;
    programsTime = 0;
    nowChannel = false;
    scrollValue = 0;
    item_programs = null;
    current_channel = null;
    scrollLeft = 0;
    focusableProgramsIdx = 0;
    currentEndTime = 0;
    result = null;
    endTime = 0;
    startTime = 0;
    bLastPage = false;
    curPageNo = -1;

    constructor(props) {
        super(props);
        this.epgData = []
        this.epgResult = []
        this.epgData_fav = []
        this.epgData_rvs = []
        this.menuList = []

        this.state = {
            menus: orgMenu,
            items: this.epgData,
            now: Date.now() / 1000,
            nowChannel: true,
            programsTime: Date.now() / 1000,
            focusRow: 0,
            pageRow: 0,
            scrollLeft: 0,
            showMenu: false,
            totalWidth: 0,
            totalTimeCount: 0,
            nextFoucsProgramIdx: 0,
            type: this.props.type === undefined ? 'all' : this.props.type,
            maxPageNo: 0
        };

        const focusList = [
            // { key: 'orgMenuTopId', fm: null },
            { key: 'orgPWId0', fm: null },
            { key: 'orgPWId1', fm: null },
            { key: 'orgPWId2', fm: null },
            { key: 'orgPWId3', fm: null },
            { key: 'orgPWId4', fm: null },
            { key: 'orgPWId5', fm: null },
            { key: 'orgMenuWrapId', fm: null }
        ];
        this.declareFocusList(focusList);

        // TODO : 시청중인 채널을 셋탑에서 받아와야 함. 
        // (this.props.history.location.state.lastchannelId)
        // {{
        // this.props.history.location.state, 시청중인 채널
        // if( this.props.history.location.state.lastchannelId )
        //     this.channelNo = this.props.history.location.state.lastchannelId;
        // else 
        this.channelNo = 15; // 현재는 채널 15번으로 강제 지정함.
        // }}
    }

    unixToUtc(unixtime) {
        var t = new Date(unixtime);
        var formatted = t.format("yyyy-mm-ddThh:MM:ss");
        return formatted;
    }

    /* svc_ids : ex) 15|45|56|67 (10개 미만), now : ex) 20180423 */
    WEPGTest(svc_ids, now) {
        let param = {
            m: 'getProgramImageUrls',
            svc_ids: svc_ids,
            poc: 'STB',
            o_date: now
        }

        WEPG.requestV5001(param, (status, resData, tid) => {
            let result;
            if (status === 200) {
                try {
                    result = JSON.parse(resData)
                    console.log('result :: ', result)
                }
                catch (err) {
                    console.log('JSON DATA ERRROR  :: ', resData)
                }
                finally {
                    //result.reason
                    //if (result.IF === 'IF-ME-013' && result.result === '0000') {
                    console.log('a')
                }
            }
        })
    }

    RVSTest(method) {

        let contents = {
            sid: "18",
            channelNo: "18",
            channelName: "채널A",
            programName: "관찰카메라 24(32회)",
            startTime: "2018-04-20T20:20:00",
            endTime: "2018-04-20T20:20:00",
            reservationTime: "2018-04-20T13:20:00",
        }
        let param = {
            method: method === "add" ? 'addReservation' : 'delReservation',
            deviceType: '0',
            count: "1",
            contents: [contents]
        }

        if (method === "add") {
            RVS.request501(param, (status, resData, tid) => {
                let result;
                if (status === 200) {
                    try {
                        result = JSON.parse(resData)
                        console.log('result :: ', result)
                    }
                    catch (err) {
                        console.log('JSON DATA ERRROR  :: ', resData)
                    }
                    finally {
                        //result.reason
                        //if (result.IF === 'IF-ME-013' && result.result === '0000') {
                        console.log('a')
                    }
                }
            })
        }
        else {
            RVS.request502(param, (status, resData, tid) => {
                let result;
                if (status === 200) {
                    try {
                        result = JSON.parse(resData)
                        console.log('result :: ', result)
                    }
                    catch (err) {
                        console.log('JSON DATA ERRROR  :: ', resData)
                    }
                    finally {
                        //result.reason
                        //if (result.IF === 'IF-ME-013' && result.result === '0000') {
                        console.log('a')
                    }
                }
            })
        }
    }

    bookMarkTest() {
        //register
        let addParam = {
            'group': 'IPTV',
            'svc_id': 67,
            'ch_type': 1,
            'yn_kzone': 'N',
            'hash_id': hashID
        }
        MeTV.requestME012(addParam, (status, resData, tid) => { })

        let addParam2 = {
            'group': 'IPTV',
            'svc_id': 68,
            'ch_type': 1,
            'yn_kzone': 'N',
            'hash_id': hashID
        }
        MeTV.requestME012(addParam2, (status, resData, tid) => { })

        //delete
        let delParam = {
            'group': 'IPTV',
            'isAll_type': 0,
            'deleteList': ["69", "70"],
            'hash_id': hashID
        }
        MeTV.requestME013(delParam, (status, resData, tid) => { })

        //delete ALL
        let delParam2 = {
            'group': 'IPTV',
            'isAll_type': 1,
            'deleteList': [],
            'hash_id': hashID
        }
        MeTV.requestME013(delParam2, (status, resData, tid) => { })
    }

    componentWillMount() {
        try {
            // API (RVS) 테스트
            this.RVSTest("add");

            // yn_block : 'N',
            const METV011Param = {
                group: 'IPTV',
                ch_type: 1,
                hash_id: hashID
            }

            const RVS503Param =
                {
                    method: 'getReservation',
                    count: 'MAX',
                    sort: 'startTime',
                    order: 'Asc'
                }

            const request017 = NXPG.request017()
            const request011 = MeTV.request011(METV011Param)
            const request503 = RVS.request503(RVS503Param)
            // ##########################################################################
            // RVS Error !!
            // console.log(request503)
            // Promise.all([request017, request011, request503]).then((value) => {  
            // ##########################################################################
            // Promise.all([request017, request011]).then((value) => {
            Promise.all([request017]).then((value) => {
                //console.log(type(value[2]))

                let watchall = '0'

                let bookmark_list = []
                let reserve_list = []
                this.menuList.push({
                    'category_id': "1",
                    'menu': '인기채널'
                })
                this.menuList.push({
                    'category_id': "2",
                    'menu': '선호채널'
                })
                if (value[0].result === '0000') {

                    for (let i = 0; i < dummyMenu.channel.length; i++) {
                        this.menuList.push({
                            category_id: dummyMenu.channel[i].category_id,
                            menu: dummyMenu.channel[i].category_name
                        })
                    }
                }
                // if (value[1].result === '0000') {
                //     bookmark_list = dummyBookmark.bookmarkList.slice()
                // }
                // this.epgData_fav = bookmark_list

                // if (value[2].result === '0000') {
                //     reserve_list = value[2].result.item
                // }
                // this.epgData_rvs = reserve_list

                this.getChannelLIst()   // Set 첫화면 channel data 

                ////////////////////////
                // defualt focus
                ////////////////////////
                this.indexInTable = this.getChannelIdxByChannelNo(this.epgResult, this.channelNo) % MAXROWCOUNT;    // index 개념이 없어서... 채널번호로 채널 인덱스를 구함.
                this.setFocus(this.indexInTable, 0, 'default');
                // this.indexInList = 0;
                // this.setTblFocus(this.indexInTable, this.indexInList);

                // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> EPGDATA : ", this.epgData);
            })

        } catch (error) {
            console.error('getChannelLIst error : ' + error);
        }
        this.getProgramTimeTotalCount()
    }

    componentDidMount() {
        this.props.showMenu(false); // gnb block
    }
    componentWillUnmount() {
    }

    removeTblFocus(chIdx, pgIdx) {
        let id = "orgPWId" + chIdx + "_" + pgIdx
        const element = document.getElementById(id)
        element.classList.remove('focusOn')
    }

    setTblFocus(chIdx, pgIdx) {
        let id = "orgPWId" + chIdx + "_" + pgIdx
        const element = document.getElementById(id)
        element.classList.add("focusOn")
    }

    getDate() {
        var date = new Date()

        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();

        return [date.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
        ].join('');
    }

    getChannelLIst() {
        // const startTimeP = new Date();
        //var gap = endTime.getTime() - startTime.getTime(); 
        let PageNo;
        let maxPageNo = 0
        let genereCode = 210 //homeshopping 210
        var nowTime;
        let focusChannelIdx = 0

        if (DEVICEMODE_STB) { //셋톱박스 연결했을때
            nowTime = Date.now() / 1000; //for production
            this.epgResult = EpgData.slice()    /// Set all channel data

            // 6개 채널에 대한 프로그램 셋팅.  
            const pageno = this.getPageNoByChannelNo(this.epgResult, this.channelNo);
            const rowCount = pageno * MAXROWCOUNT;
            if (pageno === getMaxPage(this.epgResult.length))
                STB_IF.getEpgDataByChannel(rowCount, rowCount + (this.epgResult.length - rowCount)); // 마지막 페이지, 잔여개수 계산 
            else
                STB_IF.getEpgDataByChannel(rowCount, rowCount + MAXROWCOUNT);
        }
        else { //pc 연결했을때

            nowTime = 1522142211629 / 1000
            let epgdummy = []
            epgdummy = dummyDataMapping(nowTime, this.channelNo, PageNo, focusChannelIdx) //pc 연결 dummy 데이터 매핑 
            this.epgResult = epgdummy.slice()
        }
        //favorite init channel mapping
        this.epgResult = fav_mapping(this.epgData_fav, this.epgResult) //선호 채널일 경우 this.epgResult[i].favorite = true

        if (this.props.type === "fav") { //선호
            this.epgResult = fav_sort(this.epgResult)
        }
        else if (this.props.type === "genre") { //장르
            this.epgResult = genre_sort(genereCode, this.epgResult)
        }

        maxPageNo = getMaxPage(this.epgResult.length)
        let channelData = getChannelByPage(this.epgResult, this.props.type, this.channelNo)
        this.epgData = channelData.getChannelList //첫화면에 뿌리는 채널

        /////////////////////////////
        // WEPG API Test
        /////////////////////////////
        let svc_ids = this.epgData[0].svc_id + "|" + this.epgData[1].svc_id + "|" + this.epgData[2].svc_id + "|" + this.epgData[3].svc_id + "|" + this.epgData[4].svc_id + "|" + this.epgData[5].svc_id
        this.WEPGTest(svc_ids, this.getDate())

        // console.log("getChannelLIst ===========================> ", this.epgData);
        // console.log("channelData ===========================> ", channelData);

        PageNo = channelData.PageNo
        focusChannelIdx = channelData.focusChannelIdx

        //setState
        this.dataUpdate(this.menuList, nowTime, focusChannelIdx, PageNo, maxPageNo)

        //var endTimeP = new Date();
        //var gapP = endTimeP.getTime() - startTimeP.getTime();
        //console.log('ch=' + count + '개 ' + gap + ' ms' + ' pro=' + gapP + ' ms');
    };

    dataUpdate(orgMenu, nowTime, focusChannelIdx, PageNo, maxPageNo) {
        //setState
        if (this.props.type === "none") {
            this.setState({
                menus: orgMenu,
                items: this.epgData,
                now: nowTime,
                nowChannel: true,
                programsTime: nowTime,
                focusRow: 0,
                pageRow: 0,
                scrollLeft: 0,
                showMenu: false,
                totalWidth: 0,
                totalTimeCount: 0,
                type: this.props.type ? this.props.type : "none",
                maxPageNo: maxPageNo
            })
        }
        else if (this.props.type === "fav") {
            this.setState({
                menus: orgMenu,
                items: this.epgData,
                now: nowTime,
                nowChannel: true,
                programsTime: nowTime,
                focusRow: 0,
                pageRow: 0,
                scrollLeft: 0,
                showMenu: false,
                totalWidth: 0,
                totalTimeCount: 0,
                nextFoucsProgramIdx: 0,
                type: this.props.type ? this.props.type : "fav",
                maxPageNo: maxPageNo
            })
        }
        else if (this.props.type === "genre") {
            this.setState({
                menus: orgMenu,
                items: this.epgData,
                now: nowTime,
                nowChannel: true,
                programsTime: nowTime,
                focusRow: focusChannelIdx,
                pageRow: 0,
                scrollLeft: 0,
                showMenu: false,
                totalWidth: 0,
                totalTimeCount: 0,
                nextFoucsProgramIdx: 0,
                type: this.props.type ? this.props.type : "genre",
                maxPageNo: maxPageNo
            })
        }
        else {
            this.setState({
                menus: orgMenu,
                items: this.epgData,
                now: nowTime,
                nowChannel: true,
                programsTime: nowTime,
                focusRow: focusChannelIdx,
                pageRow: PageNo,
                scrollLeft: 0,
                showMenu: false,
                totalWidth: 0,
                totalTimeCount: 0,
                nextFoucsProgramIdx: 0,
                type: this.props.type === undefined ? 'all' : this.props.type,
                maxPageNo: maxPageNo
            })
        }
    }

    getChannelIdxByChannelNo(arr, channelNo) {
        for (let i = 0; i < arr.length; i++)
            if (arr[i].channel === channelNo)
                return arr[i].channelIdx;
        return -1;
    }

    getPageNoByChannelNo(arr, channelNo) {
        for (let i = 0; i < arr.length; i++)
            if (arr[i].channel === channelNo)
                return arr[i].channelPage;
        return -1;
    }

    pageMove(type, chIdx, pgIdx) {
        let maxchannelPageNo = this.state.maxPageNo
        let minChannelPageNo = 0
        let setPageNo;
        // focusRow: focusChannelIdx,
        // pageRow: PageNo,
        // let prev_scrollLeft = this.state.scrollLeft;
        this.epgData = []
        var nowTime;

        if (DEVICEMODE_STB) {
            nowTime = Date.now() / 1000; //for production
            if (type === 'next') {
                this.state.pageRow === maxchannelPageNo ? setPageNo = 0 : setPageNo = this.state.pageRow + 1

                // 6개 채널에 대한 프로그램 셋팅.
                const rowCount = setPageNo * MAXROWCOUNT;
                if (setPageNo === maxchannelPageNo) {
                    STB_IF.getEpgDataByChannel(rowCount, rowCount + (this.epgResult.length - rowCount)) // 마지막 페이지, 잔여개수 계산 
                    this.bLastPage = true
                }
                else {
                    STB_IF.getEpgDataByChannel(rowCount, rowCount + MAXROWCOUNT);
                    this.bLastPage = false
                }

                // 페이지 이동시, 인접위치 계산 & 포커스 처리
                this.result = __channelUpDownAdjacencyMove(this.epgResult, this.state.items[chIdx].programs[pgIdx], this.state.items[chIdx].channel, this.state.now)

                this.indexInTable = 0
                this.arrangedFocusList[this.state.items.length - 1].fm.removeFocus()
                this.arrangedFocusList[this.indexInTable].fm.setFocusByIndex(this.result.nextFoucsProgramIdx)
                // this.removeTblFocus(this.state.items.length -1, this.arrangedFocusList[this.state.items.length -1].fm.getFocusedIndex())
                // this.indexInList = this.result.nextFoucsProgramIdx
                // this.setTblFocus(this.indexInTable, this.indexInList)


                // TODO : rvs_mapping ... // 예약 프로그램 맵핑.
                // this.epgResult = rvs_mapping(this.epgData_rvs, this.epgResult, setPageNo) // 예약 프로그램일 경우 this.epgResult[].programs[].reservation = true
                this.epgData = getChannelsByPageNumber(this.epgResult, setPageNo)

                // console.log("pageMove ===========================> ", this.epgData);
                // console.log("this.state.pageRow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", setPageNo, " this.state.maxPageNo ", maxchannelPageNo)

                this.setState({
                    // menus : orgMenu,
                    items: this.epgData,
                    now: nowTime,
                    nowChannel: true,
                    programsTime: nowTime,
                    focusRow: 0,
                    pageRow: setPageNo,
                    scrollLeft: this.result.scrollLeft,
                    showMenu: false,
                    totalWidth: 0,
                    totalTimeCount: 0,
                    type: this.props.type === undefined ? 'all' : this.props.type
                })
            }
            else {//prev
                this.state.pageRow === minChannelPageNo ? setPageNo = maxchannelPageNo : setPageNo = this.state.pageRow - 1

                // 6개 채널에 대한 프로그램 셋팅.
                const rowCount = setPageNo * MAXROWCOUNT;
                if (setPageNo === maxchannelPageNo) {
                    STB_IF.getEpgDataByChannel(rowCount, rowCount + (this.epgResult.length - rowCount)) // 마지막 페이지, 잔여개수 계산
                    this.bLastPage = true
                }
                else {
                    STB_IF.getEpgDataByChannel(rowCount, rowCount + MAXROWCOUNT)
                    this.bLastPage = false
                }

                // 페이지 이동시, 인접위치 계산 & 포커스 처리
                this.result = __channelUpDownAdjacencyMove(this.epgResult, this.state.items[chIdx].programs[pgIdx], this.state.items[chIdx].channel, this.state.now)

                this.epgData = getChannelsByPageNumber(this.epgResult, setPageNo)

                // console.log("pageMove ===========================> ", this.epgData)
                // console.log("this.state.pageRow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", setPageNo, " this.state.maxPageNo ", maxchannelPageNo)

                this.setState({
                    menus: orgMenu,
                    items: this.epgData,
                    now: nowTime,
                    programsTime: nowTime,
                    focusRow: this.bLastPage ? (this.epgResult.length - rowCount) : 5,
                    pageRow: setPageNo,
                    scrollLeft: this.result.scrollLeft,
                    showMenu: false,
                    totalWidth: 0,
                    totalTimeCount: 0,
                    type: this.props.type === undefined ? 'all' : this.props.type

                })

                // 페이지 이동시, 인접위치 계산 & 포커스 처리 (호출 위치주의)
                this.indexInTable = this.state.items.length - 1
                this.arrangedFocusList[0].fm.removeFocus()
                this.arrangedFocusList[this.indexInTable].fm.setFocusByIndex(this.result.nextFoucsProgramIdx)
                // this.removeTblFocus(0, this.arrangedFocusList[0].fm.getFocusedIndex())
                // this.indexInList = this.result.nextFoucsProgramIdx
                // this.setTblFocus(this.indexInTable, this.indexInList)
            }
        }
        else { //develop
            nowTime = 1522142211629 / 1000
            if (type === 'next') {
                this.state.pageRow === maxchannelPageNo ? setPageNo = 0 : setPageNo = this.state.pageRow + 1

                if (setPageNo === maxchannelPageNo)
                    this.bLastPage = true
                else
                    this.bLastPage = false

                // 페이지 이동시, 인접위치 계산 & 포커스 처리
                this.result = __channelUpDownAdjacencyMove(this.epgResult, this.state.items[chIdx].programs[pgIdx], this.state.items[chIdx].channel, this.state.now)

                this.indexInTable = 0
                this.arrangedFocusList[this.state.items.length - 1].fm.removeFocus()
                this.arrangedFocusList[this.indexInTable].fm.setFocusByIndex(this.result.nextFoucsProgramIdx)
                // this.removeTblFocus(this.state.items.length -1, this.arrangedFocusList[this.state.items.length -1].fm.getFocusedIndex())
                // this.indexInList = this.result.nextFoucsProgramIdx
                // this.setTblFocus(this.indexInTable, this.indexInList)

                this.epgData = getChannelsByPageNumber(this.epgResult, setPageNo)
                // console.log("this.state.pageRow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", setPageNo, " this.state.maxPageNo ", maxchannelPageNo)

                this.setState({
                    menus: orgMenu,
                    items: this.epgData,
                    now: nowTime,
                    programsTime: nowTime,
                    focusRow: 0,
                    pageRow: setPageNo,
                    scrollLeft: this.result.scrollLeft,
                    showMenu: false,
                    totalWidth: 0,
                    totalTimeCount: 0,
                    type: this.props.type === undefined ? 'all' : this.props.type
                })
            }
            else {//prev
                this.state.pageRow === minChannelPageNo ? setPageNo = maxchannelPageNo : setPageNo = this.state.pageRow - 1
                const rowCount = setPageNo * MAXROWCOUNT

                if (setPageNo === maxchannelPageNo)
                    this.bLastPage = true
                else
                    this.bLastPage = false

                // 페이지 이동시, 인접위치 계산 & 포커스 처리
                this.result = __channelUpDownAdjacencyMove(this.epgResult, this.state.items[chIdx].programs[pgIdx], this.state.items[chIdx].channel, this.state.now)

                this.epgData = getChannelsByPageNumber(this.epgResult, setPageNo)
                // console.log("this.state.pageRow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", setPageNo, " this.state.maxPageNo ", maxchannelPageNo)

                this.setState({
                    menus: orgMenu,
                    items: this.epgData,
                    now: nowTime,
                    programsTime: nowTime,
                    focusRow: this.bLastPage ? (this.epgResult.length - rowCount) : 5,
                    pageRow: setPageNo,
                    scrollLeft: this.result.scrollLeft,
                    showMenu: false,
                    totalWidth: 0,
                    totalTimeCount: 0,
                    type: this.props.type === undefined ? 'all' : this.props.type
                })

                // 페이지 이동시, 인접위치 계산 & 포커스 처리 (호출 위치주의)
                this.indexInTable = this.state.items.length - 1
                this.arrangedFocusList[0].fm.removeFocus()
                this.arrangedFocusList[this.indexInTable].fm.setFocusByIndex(this.result.nextFoucsProgramIdx)
                // this.removeTblFocus(0, this.arrangedFocusList[0].fm.getFocusedIndex())
                // this.indexInList = this.result.nextFoucsProgramIdx
                // this.setTblFocus(this.indexInTable, this.indexInList)
            }
        }
    }

    onFocus(chIndex, pgIndex) {
    }

    onBlur(chIndex, pgIndex) {
    }

    rightNavigation = () => {
        if (true === this.state.showMenu) {
            this.indexInTable = this.lastFocusIndex;
            this.setFocus(this.indexInTable, null, 'RIGHT');
            // this.indexInList = 0;
            // this.setTblFocus(this.indexInTable, this.indexInList);
            this.setState({ showMenu: false });
        }
        else {
            const channelNo = this.state.items[this.indexInTable].channel;
            if (channelNo === 1 || channelNo === 50)
                return;

            /// Move Action
            this.arrangedFocusList[this.indexInTable].fm.moveFocus('RIGHT', () => {
                console.log('RIGHT End');
            });

            const chIdx = this.indexInTable;
            const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();
            this.indexInList = pgIdx + 1;

            this.scrollValue = this.state.scrollLeft;

            // 오른쪽 이동시
            const STARTTIMELINE = TIMEUNIT * Math.floor(this.state.now / TIMEUNIT)
            this.change_contentW = 0
            this.left_contentw = 0
            this.totalProgramLength = this.state.items[chIdx].programs.length
            this.nowChannel = false
            this.item_programs = null;

            if (pgIdx >= this.totalProgramLength) {
            }
            else {

                for (let j = 0; j <= pgIdx; j++) {
                    this.item_programs = this.state.items[chIdx].programs[j]
                    if (j === pgIdx) {
                        this.change_contentW = (this.item_programs.endTime - this.item_programs.startTime) * TIME2PIXEL
                        this.programsTime = this.item_programs.startTime
                    }
                    else {
                        if (j === 0) {
                            this.left_contentw += (this.item_programs.endTime - STARTTIMELINE) * TIME2PIXEL           // Remove junk 
                        }
                        else {
                            this.left_contentw += (this.item_programs.endTime - this.item_programs.startTime) * TIME2PIXEL
                        }
                    }
                }

                if (this.left_contentw + this.change_contentW < this.maxRight) {
                    this.scrollValue = 0
                }
                else if (this.left_contentw + this.change_contentW >= this.maxRight) {
                    this.scrollValue = this.left_contentw
                }
                else {
                    if (this.left_contentw >= this.maxRight) {
                        this.scrollValue = this.left_contentw
                    }
                }

                if (this.programsTime > this.state.now) {
                    this.nowChannel = false
                }

                this.setState({
                    scrollLeft: this.scrollValue,
                    programsTime: this.programsTime,
                    nowChannel: this.nowChannel
                })
            }
        }
    }


    leftNavigation = () => {

        const chIdx = this.indexInTable;
        const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();
        this.indexInList = pgIdx === 0 ? 0 : pgIdx - 1;

        {
            const channelNo = this.state.items[this.indexInTable].channel;
            if (channelNo === 1 || channelNo === 50)
                return;

            this.scrollValue = 0
            const STARTTIMELINE = TIMEUNIT * Math.floor(this.state.now / TIMEUNIT)
            this.change_contentW = 0
            this.nowChannel = false
            this.current_channel = this.state.items[chIdx]
            this.scrollLeft = 0
            this.focusableProgramsIdx = pgIdx - 1

            for (let i = 0; i < pgIdx; i++) {
                if (this.focusableProgramsIdx === i) {
                    if (i === 0) {
                        this.change_contentW = (this.current_channel.programs[i].endTime - STARTTIMELINE) * TIME2PIXEL
                        this.programsTime = this.current_channel.programs[i].startTime
                        this.currentEndTime = this.current_channel.programs[i].endTime
                        if (this.programsTime <= this.state.now && this.state.now <= this.currentEndTime) {
                            this.nowChannel = true
                        }
                    }
                    else {
                        this.change_contentW = (this.current_channel.programs[i].endTime - this.current_channel.programs[i].startTime) * TIME2PIXEL
                        this.programsTime = this.current_channel.programs[i].startTime
                        this.currentEndTime = this.current_channel.programs[i].endTime
                        if (this.programsTime <= this.state.now && this.state.now <= this.currentEndTime) {
                            this.nowChannel = true
                        }
                    }
                }
                else {
                    if (i === 0) {
                        this.scrollLeft += (this.current_channel.programs[i].endTime - STARTTIMELINE) * TIME2PIXEL
                    }
                    else {
                        this.scrollLeft += (this.current_channel.programs[i].endTime - this.current_channel.programs[i].startTime) * TIME2PIXEL
                    }

                }
            }

            if (this.programsTime === undefined) {
                this.programsTime = this.state.now
            }

            if (this.scrollLeft < this.maxRight) {
                if (this.maxRight - this.scrollLeft < 5) {
                    this.scrollValue = this.scrollLeft
                    this.setState({
                        scrollLeft: this.scrollValue,
                        programsTime: this.programsTime,
                        nowChannel: this.nowChannel
                    })
                }
                else {
                    this.setState({
                        scrollLeft: 0,
                        programsTime: this.programsTime,
                        nowChannel: this.nowChannel
                    })
                }

            }
            else {
                if (this.scrollLeft > this.maxRight) {
                    if (this.change_contentW >= this.maxRight - 5) {
                        this.scrollValue = this.scrollLeft + 300 - this.change_contentW
                    }
                    else {
                        this.scrollValue = this.scrollLeft - this.change_contentW
                    }
                }

                this.setState({
                    scrollLeft: this.scrollValue,
                    programsTime: this.programsTime,
                    nowChannel: this.nowChannel
                })
            }

            /// show Left Menu
            this.arrangedFocusList[this.indexInTable].fm.moveFocus('LEFT', () => {
                this.lastFocusIndex = this.indexInTable;
                this.arrangedFocusList[this.indexInTable].fm.removeFocus();
                // this.removeTblFocus(this.indexInTable, this.indexInList);
                this.arrangedFocusList[this.menuIdxInTable].fm.setFocusByIndex(1);
                this.setState({ showMenu: true });
            });
        }
    }

    downNavigation = () => {
        if (true === this.state.showMenu) {
            this.arrangedFocusList[this.menuIdxInTable].fm.moveFocus("DOWN", () => {
                console.log('MENU DOWN End');
            });
        }
        else {
            const chIdx = this.indexInTable;
            const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();

            if (chIdx === (this.state.items.length - 1)) { /// (this.state.items.length -1) === MAXROWCOUNT (6)
                this.pageMove('next', chIdx, pgIdx)
            }
            else {
                {
                    if (this.indexInTable < (this.state.items.length - 1)) {    // this.indexInTable === row index
                        this.arrangedFocusList[this.indexInTable].fm.removeFocus()
                        // this.removeTblFocus(this.indexInTable, this.indexInList);
                        this.indexInTable += 1
                    } else {
                        this.indexInTable = (this.state.items.length - 1)
                    }

                    this.result = channelUpDownAdjacencyMove(this.state.items, chIdx, pgIdx, (chIdx + 1), this.state.now)
                    this.setFocus(this.indexInTable, this.result.nextFoucsProgramIdx, 'DOWN');
                    // this.indexInList = this.result.nextFoucsProgramIdx;
                    // this.setTblFocus(this.indexInTable, this.indexInList);

                    if (this.result.currentTimeFocusable) {
                        this.setState({
                            nextFoucsProgramIdx: this.result.nextFoucsProgramIdx,
                            focusRow: this.result.focusRow,
                            nowChannel: this.result.currentTimeFocusable
                        })
                    }
                    else {
                        this.setState({
                            nextFoucsProgramIdx: this.result.nextFoucsProgramIdx,
                            focusRow: this.result.focusRow,
                            scrollLeft: this.result.scrollLeft,
                            programsTime: this.result.programsTime,
                            nowChannel: this.result.currentTimeFocusable
                        })
                    }
                }
            }
        }
    }

    upNavigation = () => {
        if (true === this.state.showMenu) {
            this.arrangedFocusList[this.menuIdxInTable].fm.moveFocus("UP", () => {
                console.log('MENU UP End');
            });
        }
        else {
            const chIdx = this.indexInTable;
            const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();

            if (chIdx === 0) {
                this.pageMove('prev', chIdx, pgIdx)
            }
            else {
                if (this.indexInTable > 0) {    // this.indexInTable === row index
                    this.arrangedFocusList[this.indexInTable].fm.removeFocus()
                    // this.removeTblFocus(this.indexInTable, this.indexInList);
                    this.indexInTable -= 1
                }
                else
                    this.indexInTable = 0

                this.result = channelUpDownAdjacencyMove(this.state.items, chIdx, pgIdx, (chIdx - 1), this.state.now)
                this.setFocus(this.indexInTable, this.result.nextFoucsProgramIdx, 'UP');
                // this.indexInList = this.result.nextFoucsProgramIdx;
                // this.setTblFocus(this.indexInTable, this.indexInList);

                if (this.result.currentTimeFocusable) {
                    this.setState({
                        nextFoucsProgramIdx: this.result.nextFoucsProgramIdx,
                        focusRow: this.result.focusRow,
                        nowChannel: this.result.currentTimeFocusable
                    })
                }
                else {
                    this.setState({
                        nextFoucsProgramIdx: this.result.nextFoucsProgramIdx,
                        focusRow: this.result.focusRow,
                        scrollLeft: this.result.scrollLeft,
                        programsTime: this.result.programsTime,
                        nowChannel: this.result.currentTimeFocusable
                    })
                }
            }
        }
    }

    // TODO : 블루 키 선택 시 선호채널 등록 구현 부... 
    setBookMark = () => {
        const chIdx = this.indexInTable;
        // const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();

        this.current_channel = this.state.items[chIdx]
        console.info('setBookMark=' + this.current_channel);

        //현재 채널이 favorite true 일 경우는 삭제 api / false 등록 api 연결
        if (this.current_channel.favorite === true) {
            //delete
            let delParam = {
                'group': 'IPTV',
                'isAll_type': 1,
                'deleteList': [this.current_channel.svc_id]
            }
            this.bookMarkDelete(chIdx, delParam)
        }
        else {
            let param = {
                'group': 'IPTV',
                'svc_id': this.current_channel.svc_id,
                'ch_type': 1,
                'yn_kzone': 'N'
            }
            this.bookMarkRegister(chIdx, param)
        }
    }

    // TODO : Enter 키 선택 시 예약채널 등록 구현 부... 
    setReservation = () => {
        const chIdx = this.indexInTable;
        const pgIdx = this.arrangedFocusList[this.indexInTable].fm.getFocusedIndex();

        this.current_program = this.state.items[chIdx].programs[pgIdx];
        console.info('this.current_program =', this.current_program);

        //현재 프로그램이 favorite true 일 경우는 삭제 api / false 등록 api 연결
        // if (this.current_program. === true){
        //     //delete
        //     let delParam = {
        //         'group' : 'IPTV',
        //         'isAll_type': 1,
        //         'deleteList' : [this.current_channel.svc_id]
        //     }
        //     this.bookMarkDelete(chIdx, delParam)
        // } 
        // else {
        //     let param = {
        //         'group' : 'IPTV',
        //         'svc_id' : this.current_channel.svc_id,
        //         'ch_type' : 1,
        //         'yn_kzone' : 'N'
        //     }
        //     this.bookMarkRegister(chIdx, param)
        // }

        // TODO : Toast Popup...
    }

    onKeyDown = (e) => {
        console.log('onKeyDown :: %s', e.keyCode)
        switch (e.keyCode) {
            case 39: // 'right' 
                this.rightNavigation();
                break;
            case 37: // 'left'
                this.leftNavigation();
                break;
            case 40: // 'down'
                this.downNavigation();
                break;
            case 38: // 'up'
                this.upNavigation();
                break;
            case 926: // 'next'
                this.pageMove('next');
                break;
            case 927: // 'prev'
                this.pageMove('prev');
                break;
            //case 923: blue key 임시로 enter 키로 event test 선호 채널 등록/해제
            case 923:   // blue key
            case 48:    // N0
                this.setBookMark();
                break;
            case 13: // 'enter'
                this.setReservation();
                break;
            default:
                break
        }
    }

    bookMarkRegister = (chIdx, param) => {
        //선호 채널 등록 
        console.log('param ::: ', param)
        MeTV.requestME012(param, (status, resData, tid) => {

            if (status === 200) {
                try {
                    this.result = JSON.parse(resData)
                    console.log('result :: ', this.result)
                } catch (err) {
                    console.log('JSON DATA ERRROR  :: ', resData)
                } finally {
                    //result.reason
                    if (this.result.IF === 'IF-ME-012' && this.result.result === '0000') {
                        const { items } = this.state
                        const newItems = items.slice()
                        newItems[chIdx].favorite = true;
                        this.setState({
                            items: newItems
                        });

                    }
                }
            }
        });
    }

    bookMarkDelete = (chIdx, param) => {
        //선호 채널 삭제
        MeTV.requestME013(param, (status, resData, tid) => {

            if (status === 200) {
                try {
                    this.result = JSON.parse(resData)
                    console.log('result :: ', this.result)
                }
                catch (err) {
                    console.log('JSON DATA ERRROR  :: ', resData)
                }
                finally {
                    //result.reason
                    //if (result.IF === 'IF-ME-013' && result.result === '0000') {
                    if (this.result.result === '0000') {
                        const { items } = this.state
                        const newItems = items.slice()
                        newItems[chIdx].favorite = false
                        this.setState({
                            items: newItems
                        });
                    }
                }
            }
        });
    }

    getProgramTotalWidth = () => {
        /* 채널당 프로그램 전체 넓이 */
        //const startTime = TIMEUNIT*(Math.floor(this.state.now/TIMEUNIT));
        this.endTime = 0;
        this.startTime = 0;

        this.state.items.map((data, index) => {
            if (this.endTime < data.programs[data.programs.length - 1].endTime) {
                this.endTime = data.programs[data.programs.length - 1].endTime;
            }
            if (this.startTime > data.programs[data.programs.length - 1].startTime) {
                this.startTime = data.programs[data.programs.length - 1].startTime;
            }
            return false;
        });

        this.endTime = TIMEUNIT * (this.endTime / TIMEUNIT)
        return (this.endTime - this.startTime) * TIME2PIXEL
    };

    getProgramTimeTotalCount = () => {
        /* programs width / 30min -> count */
        this.startTime = TIMEUNIT * (this.state.now / TIMEUNIT)

        this.endTime = 0
        let totalTimeCount = 0

        this.state.items.map((data, index) => {
            if (this.endTime < data.programs[data.programs.length - 1].endTime) {
                this.endTime = data.programs[data.programs.length - 1].endTime

            }
            return false;
        });

        var date1 = new Date(this.startTime * 1000)
        var date2 = new Date(this.endTime * 1000)

        var diff = (date2.getTime() - date1.getTime()) / (1000 * 60)
        totalTimeCount = Math.floor((diff) / 30)
        return totalTimeCount
    };

    // TEST CODE : 랜더링 될 영역의 프로그램들의 인덱스를 구함.
    makeRenderIndex(itemPrograms) {
        let visibleLeft = this.state.programsTime
        let visibleRight = this.state.programsTime + PROGRAMOFFSET
        let startIndex = -1, endIndex = -1

        for (let j = 0; j < itemPrograms.length; j++) {
            if (itemPrograms[j].endTime > visibleLeft) {           // 프로그램 끝점이 보이는 부분 시작점 보다 오른쪽.
                if (itemPrograms[j].startTime <= visibleLeft) {     // 프로그램 시작점이 가 보이는 부분 시작점 보다 왼쪽.
                    startIndex = j;
                }
            }
            if (startIndex !== -1) {                                 // 프로그램 시작점이 인덱스를 찾았으면... 프로그램 끝점 인덱스 찾기
                if (itemPrograms[j].endTime >= visibleRight) {      // 프로그램 끝점이 보이는 부분 끝점 보다 오른쪽.
                    endIndex = j;
                    return {
                        startIndex: startIndex,
                        endIndex: endIndex + 1      // slice ...
                    };
                }
            }
        }
        return {
            startIndex: 0,
            endIndex: 1
        };
    }

    render() {
        const DATA = this.state.now
        const STARTTIMELINE = TIMEUNIT * Math.floor(DATA / TIMEUNIT)

        // let timelineList = [];
        // // if (this.state.items.type !== "preferenceNone") {
        // if (this.state.type === 'fav' && this.epgData_fav.length !== 0){
        //     const ENDTIMELINE = STARTTIMELINE + (this.getProgramTotalWidth() / TIME2PIXEL);
        //     for (let i=0; ; i++) {
        //         let val = STARTTIMELINE + (TIMEUNIT * i)
        //         if (val < ENDTIMELINE) {
        //             timelineList.push(STARTTIMELINE + (TIMEUNIT * i));
        //         } else {
        //             break;
        //         }
        //     }
        // }

        let nowTimeLeft = -(this.state.scrollLeft) + ((this.state.now - STARTTIMELINE) * TIME2PIXEL);

        /*program 시간표 */
        let programTimeList = [];
        let totalCount = this.getProgramTimeTotalCount();
        let timeValue = 0;
        for (var i = 0; i <= totalCount; i++) {
            // console.log("ProgramTimeTotalCount =====================> ", totalCount);
            if (i === 0) {
                timeValue = STARTTIMELINE
            } else {
                timeValue = STARTTIMELINE + (TIMEUNIT * i)
            }
            // console.log("timvValue =====================> ", timeValue);
            programTimeList.push(
                // <ProgramTimeList
                //     key={i}
                //     idx = {i}                   
                //     value = {timeValue}
                // />
                <Moment className="currentDate" unix format="HH:mm">{timeValue}</Moment>
            )
        }

        let programList = []

        for (let i = 0; i < this.state.items.length; i++) {

            programList.push(
                <ProgramList
                    key={i}
                    num={i}
                    channel={this.state.items[i]}
                    programs={this.state.items[i].programs}
                    focusRow={this.state.focusRow === i ? "true" : "false"}
                    focusRowIdx={this.state.focusRow}
                    startTime={STARTTIMELINE}
                    nowTime={this.state.now}
                    scrollLeft={this.state.scrollLeft}
                    totalWidth={this.getProgramTotalWidth()}
                    nextFoucsProgramIdx={this.state.nextFoucsProgramIdx}
                    setFm={this.setFm}
                    focusList={this.focus}
                />
            )
        }

        /* channel List */
        let channelList = []
        let data = null
        for (let i = 0; i < this.state.items.length; i++) {
            data = this.state.items[i]
            channelList.push(
                <div className={this.state.focusRow === i ? "channel active" : "channel"} key={i}>
                    {data.favorite === true ? <span className="fav"></span> : ""}
                    {data.favorite === false && data.rating === 21 ? <span className="adult"></span> : ""}
                    {data.favorite === false && data.adult !== 21 && data.isPay === "true" ? <span className="charge"></span> : ""}

                    {data.channel}
                    <img src={data.logoImage} alt="" />
                </div>
            )
        }

        /* program */
        let orgProgramCon
        //if (this.state.items.type === "preferenceNone") {
        if (this.state.type === 'fav' && this.epgData_fav.length === 0) {
            orgProgramCon =
                <div className="orgProgramCon programNone" key={0}>
                    <div className="orgChannel">
                        <ProgramTimeList />
                        <div className="channel"></div>
                    </div>
                    <div className="orgProgram">
                        <div className="orgProgramWrap">
                            <span className="timeTop">
                                <Moment className="currentDate" unix format="HH:mm">{STARTTIMELINE}</Moment>
                                <Moment className="currentDate" unix format="HH:mm">{STARTTIMELINE + TIMEUNIT}</Moment>
                                <Moment className="currentDate" unix format="HH:mm">{STARTTIMELINE + (TIMEUNIT * 2)}</Moment>
                            </span>
                            <div className="wrapProgramNone">
                                <div className="noneCon">
                                    <p className="textInfo">등록하신 선호채널이 없습니다.</p>
                                    <span tabIndex="-1" className="csFocus btnStyle type03 loadFocus" >선호채널 등록하기</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        } else {
            orgProgramCon =
                <div className="orgProgramCon" key={1}>
                    <div className="orgChannel">
                        <span className="timeTop"><Moment className="currentDate" unix format="M월D일" >{this.state.programsTime}</Moment></span>
                        {channelList}
                    </div>

                    <div className="orgProgram">
                        <div className="orgProgramWrap" style={{ width: this.getProgramTotalWidth() + 'px', transform: 'translate(-' + this.state.scrollLeft + 'px,0)' }}>
                            <span className="timeTop">
                                {programTimeList}
                            </span>
                            <div>
                                {programList}
                            </div>
                        </div>
                    </div>
                    {nowTimeLeft < 0 ? <div className="timeNow" style={{ display: 'none' }}>NOW</div> : <div className="timeNow" style={{ transform: 'translate(' + nowTimeLeft + 'px,0)' }}>NOW</div>}
                </div>
        }

        let showMenu;// = this.state.showMenu
        //console.log('this.state.showMenu -::-   ', this.state.showMenu)
        if (this.state.showMenu) {
            showMenu = 'orgCon menuOpen'
        }
        else {
            showMenu = 'orgCon'
        }

        let remoteButton;
        if (this.state.nowChannel) {
            remoteButton = (<div className="keyWrap">
                <span className="btnKeyOK">채널이동</span>
                <span className="btnKeyBlue">선호채널등록 / 해제</span>
            </div>)
        }
        else {
            remoteButton = (<div className="keyWrap">
                <span className="btnKeyOK">시청예약/취소</span>
                <span className="btnKeyBlue">선호채널등록 / 해제</span>
            </div>)
        }

        return (
            <div className="orgWrap">
                <div className={showMenu}>
                    <h2 className="pageTitle">
                        {this.props.pageTitle}
                        <Moment className="currentDate" unix format="YYYY.M.D (dd) H:mm">{DATA}</Moment>
                    </h2>

                    {/* 메뉴 */}
                    <Menu
                        key={i}
                        idx={i}
                        menus={this.state.menus}
                        selectType={this.state.type}
                        setFm={this.setFm}
                        focusList={this.focus}
                    />

                    {/* 채널 정보*/}
                    {orgProgramCon}

                    {remoteButton}
                </div>
            </div>
        )
    }
}
export default Organization;