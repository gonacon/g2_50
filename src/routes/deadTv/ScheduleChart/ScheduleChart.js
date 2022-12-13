import React, { Component } from 'react';
import PageView from "Supporters/PageView";
import Moment from 'react-moment';
import moment from 'moment';
import { NXPG, RVS } from 'Network';
import 'Css/liveTv/organization/Organization.css';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import TotalScheduleMenu from './components/Menu';
import ChannelInfoList from './components/ChannelInfoList';
import Timeline from './components/Timeline';
import ChannelScheduleList from './components/ChannelScheduleList';
import StbInterface, { CHManager } from 'Supporters/stbInterface';
import constants from 'Config/constants';
import { Core } from 'Supporters';
import GuideTooptip from 'Module/GuideTooltip';


const PROPERTY = constants.STB_PROP;

const STB = StbInterface;

const MAX_CHANNELLIST_IN_VIEW = 6; // 한 화면에 보여지는 채널 리스트 수
const KEY = keyCodes.Keymap;

// 시간관련 상수값 정의
const TIME = {
    UNIT: 1800,
    MIN: 60,
    HOUR: 3600,
    CHUNK: 60 * 60 * 4, // 4시간
    TOPIXEL: 0.2638888888888889, // 1425 / 5400
    MAX_CHUNK: 18 // ==> 72 / 4
};

// 한구간 타임라인의 픽셀 width
const TIMEWIDTH = 3800; // CHUNK * TOPIXEL

// 페이지 이동발생시 포커스 처리를 위한 방향.
const DIR = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

class ScheduleChart extends PageView {
    static CATEGORY = {
        ALL: 1,
        FAVORITE: 0
    };

    constructor(props) {
        super(props);

        this.category = 1;
        this.sourceChannels = null;
        this.filteredChannels = null;

        this.state = {
            // 페이지 타이틀
            pageTitle: '',

            // 카테고리 정보
            categorys: [],

            // 채널정보
            filteredChannels: null,

            // 현재시간 기준의 시작시간 ( 타임라인 시작, 끝 )
            startTime: 0,
            endTime: 0,

            // 시작시간에서 우측으로 스크롤된 픽셀
            scrollLeft: 0,

            // 현재 페이지 index
            page: 0,
            // 시작 시간 기준으로 시간 CHUNK index
            timechunk: 0,

            // 현재 페이지의 채널 정보 리스트
            channels: [], // MAX_CHANNELLIST_IN_VIEW 갯수
            // 프로그램 정보 리스트
            programs: [], 

            // 현재 채널 인덱스
            channelIdx: 0,
            // 현재 프로그램 인덱스
            programIdx: 0,

            focused: true,

            // 모든 선호 채널 리스트 
            fav: [],
            // 모든 가입 채널
            join: [],
            
            // 보여지는 채널의 예약 시청 프로그램 리스트
            reservations: [],

            // 모든 예약 정보
            allReservations: new Map(),

            // 가이드 툴팁 표시 여부
            isTooltipGuided: true,
        };

        this.timechunk = 0;

        // didMount 나 receive 시점에 갱신되는 등록채널
        this.favoriteChannels = []; // 선호채널
        this.blockChannels = []; // 차단채널
        this.joinChannels = []; // 가입채널

        // 전체 예약시청 프로그램 리스트 정보
        this.allReservedPrograms = new Map();

        // 현재 빌드된 채널의 시청예약 정보
        this.reservations = 

        // 카테고리별 채널리스트
        this.categoryChannels = [];

        // 현재 채널정보
        this.currentChannel = null;
        // 현재 채널번호
        this.currentChannelNumber = 0;

        this.initFocus();

        this.isGuided = true;

        if (this.paramData) {
            this.targetCategory = this.paramData.category && Number(this.paramData.category);
            this.paramData = null;
            console.error('targetCategory', this.targetCategory);
        } else {
            this.targetCategory = null;
        }
    }

    componentDidMount() {
        // GNB 메뉴 hide, 포커싱
        const { showMenu } = this.props;
        showMenu(false, false);
        this.setFocus('chart');
        
        // 카테고리 설정 => 1: 선호채널, 2: 전체, 
        // 2~ 부터: 카테고리..목록에 채널정보 있음.(idx는 NXPG017 의 id + 2)
        let category = 2; 
        const { match } = this.props;
        if (match.params.category) {
            category = parseInt(match.params.category, 10);
        }

        if (this.targetCategory) {
            category = this.targetCategory;
            this.targetCategory = null;
        }

        this.category = category;
        this.initPage(category);

        this.isGuided = STB.getProperty(PROPERTY.TOOLTIPGUIDE_FLAG_SCHEDULECHART_MENU);
        this.isGuided = !this.isGuided? this.isGuided: false;
        console.error('isGuided', this.isGuided);
    }

    componentWillReceiveProps(nextProps) {
        let category = 2;

        let nextCategory = 2;
        if (nextProps.history.location.state.category) {
            nextCategory = Number(nextProps.history.location.state.category);
            console.error('nextCategory:', nextCategory);
            category = nextCategory;
        }

        if (this.paramData && this.paramData.category) {
            category = Number(this.paramData.category);
            this.paramData = null;
        }
        console.error('receive => category', category, this.paramData);
        this.setPage(category);
    }

    webShowNoti = async () => {
        
        this.openMenu(false);
        const playInfo = await new Promise((res, rej) => {
            STB.requestPlayInfo((result) => {
                res(result);
            });
        });
        this.currentChannelNumber = 1;
        if (playInfo && playInfo.isPlayType === 'Live') {
            const chNum = playInfo.contentId.split('|')[1];
            this.currentChannelNumber = chNum? parseInt( chNum, 10): 1;
        }

        this.currentChannel = CHManager.getCurrentInfo();
        this.now = this.currentChannel.now / 1000;
        this.startTime = this.now - this.now % TIME.UNIT;
        this.timechunk = 0;

        //this.setPage(this.category);
        // console.error('webShowNoti => category', this.category);
        //this.setPage(this.category); // 
    }

    initFocus = () => {
        // 포커스 설정
        const focusList = [
            { key: 'topButtons', FM: null, link: {RIGHT: 'chart'} },
            { key: 'categoryMenu', FM: null, link: {RIGHT: 'chart', DOWN: null} },
            { key: 'chart', FM: null, link: {LEFT: 'categoryMenu', UP: null} }
        ];
        this.declareFocusList(focusList);

        // 포커스 설정 : 편성표 FM 생성
        const fmChart = new FM({
            id: 'chart',
            type: 'FAKE',
            onFocusContainer: this.onFocusChart,
            onFocusKeyDown: this.onFocusKeyDownChart
        });
        this.setFm('chart', fmChart);
    }

    // 최초 진입시점 초기화 작업
    initPage = async (category) => {
        console.error(`[initPage] 카테고리: ${category}`);

        // 카테고리 정보 업데이트
        await this.updateCategory();

        const playInfo = await new Promise((res, rej) => {
            STB.requestPlayInfo((result) => {
                res(result);
            });
        });
        
        this.currentChannelNumber = 1;
        if (playInfo && playInfo.isPlayType === 'Live') {
            const chNum = playInfo.contentId.split('|')[1];
            this.currentChannelNumber = chNum? parseInt( chNum, 10): 1;
        }

        // 현재 채널정보 설정
        this.currentChannel = CHManager.getCurrentInfo();
        // this.currentChannelNumber = this.currentChannel.num;
        
        // 시간관련 설정.
        // pc 와 device 를 동시에 동작하게 하기위해서 now를 채널메니져로 부터 얻어옴.
        this.now = this.currentChannel.now / 1000;
        // console.error(`     => 현재시간 설정: ${moment.unix(this.now).format('MM-DD HH:mm')}`);
        
        // 타임라인 시작시간 설정 ( endTime = startTime + TIME.CHUNK, width =>  TIMEWIDTH 상수정의 )
        this.startTime = this.now - this.now % TIME.UNIT;
        // console.error(`     => 타임라인 시작시간 설정: ${moment.unix(this.startTime).format('HH:mm')}`);

        this.sourceChannels = CHManager.getAllList();
        console.error(`     => 전체 채널정보 설정: 전체 ${this.sourceChannels.size}개`, this.sourceChannels);
        
        // 현재 페이지 데이터 설정. 
        this.setPage(category, true);
    }

    // 카테고리 변경
    setPage = async (category, isLive) => {
        await this.updateRegisteredChannels();
        await this.updateReservations();

        console.error(`[setPage] 카테고리: ${category}`);
        let filteredChannels = new Map();
        switch(category) {
            case 0: break;
            case 1: // 선호채널 -> 임시로 가입채널 데이터 사용
                for(const ch of this.favoriteChannels) {
                    const channelInfo = this.sourceChannels.get(ch);
                    if (channelInfo) {
                        if (this.blockChannels.indexOf(ch) === -1) {
                            filteredChannels.set(ch, channelInfo);
                        }
                    }
                }

                break;
            case 2: // 전체 편성표
                const allList = Array.from(this.sourceChannels.keys());
                
                // 차단 채널 필터링
                if (this.sourceChannels && this.sourceChannels.size) {
                    for(const ch of allList) {
                        if (this.blockChannels.indexOf(ch) === -1) {
                            const channelInfo = this.sourceChannels.get(ch);
                            filteredChannels.set(ch, channelInfo)
                        }
                    }
                }
                // filteredChannels = this.sourceChannels;
                break;
            default:
                const categoryChannels = this.categoryChannels[category-3];
                console.error('카테고리 채널 리스트:', categoryChannels);
                if (this.sourceChannels && this.sourceChannels.size) {
                    for(const ch of categoryChannels) {
                        const channelInfo = this.sourceChannels.get(ch.num);
                        if (channelInfo) {
                            if (this.blockChannels.indexOf(ch.num) === -1) {
                                filteredChannels.set(ch.num, channelInfo);
                            }
                        }
                    }
                }
                break;
        };


        this.filteredChannels = filteredChannels;
        console.error('     => 필터링 채널:', this.filteredChannels);

        let totalCount = 0;
        let totalPage = 0;
        let currentPageIndex = 0;
        let foundChannelIndex = 0; // 전체 MAP 의 리스트중 현재 채널이 있는 배열 인덱스 번호
        let currentChannelIndex = 0;

        totalCount = this.filteredChannels.size;
        totalPage = Math.ceil(totalCount / MAX_CHANNELLIST_IN_VIEW);

        const chList = Array.from(this.filteredChannels.keys());
        foundChannelIndex = chList.indexOf(this.currentChannelNumber);
        if (foundChannelIndex === -1) {
            foundChannelIndex = 0;
        }
        
        currentPageIndex = Math.floor(foundChannelIndex / MAX_CHANNELLIST_IN_VIEW);
        currentChannelIndex = foundChannelIndex % MAX_CHANNELLIST_IN_VIEW;
        // console.error('채널인덱스:', currentChannelIndex)

        this.totalChannelCount = totalCount;
        this.totalPage = totalPage;
        this.page = currentPageIndex;
        this.channelIdx = currentChannelIndex;
        this.programIdx = 0;
        
        // console.error('         => 젠체 채널 수 ', this.totalChannelCount);
        // console.error('         => 전체 패이지 수', this.totalPage);
        // console.error('         => 현재 페이지:', this.page);
        // console.error('         => 현재채널 인덱스', this.channelIdx);

        // 일단 타이틀만 변경 
        let pageTitle = '';
        switch (category) {
            case 0: break;
            case 1: // 선호채널
                pageTitle = '선호채널';
                break;
            case 2: // 전체편성표
                pageTitle = '전체편성표';
                break;
            default: 
                const { categorys: list } = this.state;
                const categoryInfo = list[category-3];
                pageTitle = categoryInfo.label;
                break;
        }
        this.category = category;
        this.pageTitle = pageTitle;

        if (!this.isGuided) {
            setTimeout(() => {
                this.isGuided = true;
                STB.setProperty(PROPERTY.TOOLTIPGUIDE_FLAG_SCHEDULECHART_MENU, true);
                this.setState({isTooltipGuided: true});
            }, 6000);
            this.setState({isTooltipGuided: this.isGuided})
        }

        this.setState({
            pageTitle
        });

        console.error('setPage.channelIdx', this.channelIdx)

        this.buildList(isLive);
    }

    buildList = (dir, isLive) => { // 방향, 라이브 프로그램에서 이동
        // startTime : 타임라인 시작시간, endTime : 타임라인 끝시간
        const startTime = this.startTime + this.timechunk * TIME.CHUNK;
        const endTime = startTime + TIME.CHUNK;
        let channels = [];
        let programs = [];

        const sourceChannels = Array.from(this.filteredChannels);
        const startPage = this.page * MAX_CHANNELLIST_IN_VIEW;
        const channelList = sourceChannels.slice(startPage, startPage + MAX_CHANNELLIST_IN_VIEW);
        // console.error('     => 타임라인', moment.unix(startTime).format('HH:mm'), '~', moment.unix(endTime).format('HH:mm'));
        // console.error('     => timechunk', this.timechunk);
        // console.error('     => page', this.page);
        // console.error('     => sourceChannels', sourceChannels);
        // console.error('     => page channels:', channelList);
        
        const channelNumberList = [];
        channels = channelList.map((channelArray, idx) => {
            channelNumberList.push(channelArray[0]);
            if (channelArray[0] === 50) {
                console.error('50', channelArray[1])
            }
            return channelArray[1];
        });

        // 예약정보 설정
        const reservations = [];
        programs = channelNumberList.map((ch, idx) => {
            const channelReservationPrograms = this.allReservedPrograms.get(ch);
            reservations.push(channelReservationPrograms);
            if (ch === 1 || ch === 50) {
                return [{
                    name: 'B tv 전용채널',
                    startTime,
                    endTime
                }];
            } else {
                const list = CHManager.getProgramList(ch, startTime, endTime);
                if (channelReservationPrograms) { // 해당 채널에 예약정보가 있으면...
                    for (let program of list) {
                        let found = false;
                        for(const reservedProgram of channelReservationPrograms) {
                            if( program.startTime *1000 === parseInt(reservedProgram.startTime, 10) ) {
                                found = true;
                                break;
                            }
                        }
                        program.reserved = found;
                    }
                }

                if (list && list.length === 0) { // 프로그램 정보없을 경우
                    return [{
                        name: '프로그램 정보없음',
                        startTime,
                        endTime,
                        noInfo: true
                    }];
                } else {
                    // TODO : 마지막 프로그램이 타임라인 보다 작을경우.. 마지막 짜투리 영역을
                    // 프로그램 정보 없음으로 처리해줘야됨.
                    const lastProgram = list[list.length-1];
                    if (lastProgram.endTime < endTime) {// 마지막 프로그램의 종료시간이 타임라인의 끝시간보다작으면
                        list.push({
                            name: '프로그램 정보없음',
                            startTime: lastProgram.endTime + 1,
                            endTime: endTime,
                            noInfo: true
                        });
                    }
                    return list;
                }
            }
        });

        this.reservations = reservations; // 현재 보여지는 채널들의 시청예약정보
        console.error('현재 보여지는 채넏들의 예약정보', this.reservations);
        this.channels = channels; // 현재 보여지는 채널들의 정보
        this.programs = programs; // 현재 보여지는 채널들의 프로그램 리스트 정보
        console.error('현재 보여지는 채널의 프로그램정보:', this.programs);
        let channelIdx = this.channelIdx; // 현재 포커스 채널 인덱스
        let programIdx = 0; // 현재 채널의 프로그램 인덱스 

        switch(dir) {
            case DIR.UP: channelIdx = channels.length - 1; break;
            case DIR.DOWN: channelIdx = 0; break;
            case DIR.LEFT: programIdx = programs[channelIdx]? programs[channelIdx].length - 1: 0; break;
            case DIR.RIGHT: programIdx = 0; break;
            default: break; // 방향 입력이 없을때는 현재 채널정보로 세팅됨.
        }

        if (channelIdx >= this.channels.length) {
            channelIdx = this.channels.length - 1;
        }

        console.error('buildList.채널idx', channelIdx);

        if (isLive) {
            let found = false;
            const targetList = programs[channelIdx];
            const cnt = targetList.length;
                
            for (let i = 0; i < cnt; i++) {
                const target = targetList[i];
                const isLive = target? this.now >= target.startTime && this.now <= target.endTime: false;
                if (isLive) {
                    programIdx = i;
                    found = true;
                    break;
                }
            }

            if (!found) {
                programIdx = 0;
            }
        }

        this.setState({
            channels,
            programs,
            startTime: startTime,
            endTime: endTime,
            channelIdx,
            programIdx,
            now: this.now,
            filteredChannels: this.filteredChannels,
            reservations: this.reservations
        }, () => {
            setTimeout(()=> {
                this.scrollToFocusProgram();
            }, 1);
        })
    }

    updateRegisteredChannels = async () => {
        // 채널 필터 리스트 세팅
        const result = await CHManager.getRegisteredList();
        let { fav, block, join } = result;

        // 정렬
        fav.sort((a, b) => a - b);
        block.sort((a, b) => a - b);
        join.sort((a, b) => a - b);

        console.error('fav:', fav);
        console.error('join:', join);
        // TODO: native 에서 결과값을 채널번호로 내려주면 수정해야됨.
        this.favoriteChannels = fav;
        this.blockChannels = block;
        this.joinChannels = join;
        
        this.setState({
            fav: this.favoriteChannels,
            join: this.joinChannels
        });
    }

    updateReservations = async () => {
        const param = {
            isAll: 'Y',
        };

        const result = await new Promise((res, rej) => {
            STB.requestReservationInfo( param, (result) => {
                res(result);
            });
        });

        console.error('예약정보result', result);
        if (!result || !result.channelList) {
            this.allReservedPrograms = new Map();
            console.error('예약정보없음', this.allReservedPrograms);
            return;
        }
        const reservedPrograms = new Map();
        const { channelList } = result;
        for(const channel of channelList) {
            const {
                startTime,
                reserveYN,
                joinYN,
                blockYN
            } = channel.channelInfo;
            const chNum = parseInt(channel.channelNum, 10);
            let list = reservedPrograms.get(chNum);
            const reserveInfo = { // 예약 정보의 유니크키 값은 startTime 임;;;;;;
                startTime,
                joinYN,
                blockYN
            };
            if(!list) {
                list = [reserveInfo]; // 새로 추가
            } else {
                list.push(reserveInfo); 
            }
            reservedPrograms.set(chNum, list);
        }
        this.allReservedPrograms = reservedPrograms;
        console.error('updateReservations', this.allReservedPrograms);

        this.setState({
            allReservations: this.allReservedPrograms
        });
    }

    // 카테고리별 체널리스트와 메뉴정보 설정.
    updateCategory = async () => {
        let categorys = [];
        let categoryChannels = [];
        try {
            const result017 = await NXPG.request017();
            const { channel: categoryInfos } = result017;
            categorys = categoryInfos? categoryInfos.map((category, idx) => {
                const chChannel = category.channels.map((ch, chIdx)=>{
                    return {
                        num: ch.channel_no,
                        name: ch.channel_name,
                        svcId: ch.service_id
                    }
                })
                categoryChannels.push(chChannel);
                const { category_name: label, category_id: id } = category;
                return {
                    id,
                    label
                };
            }) : [];
        } catch (err) {
            console.error('카테고리 정보 fetch 오류:', err);
        } finally {
            this.categorys = categorys;
            // 메뉴 정보 설정 & 랜더
            this.setState({
                categorys
            });
            // 카테고리별 채널 리스트 설정
            this.categoryChannels = categoryChannels;
        }
        console.error('[updateCategory]', categorys, categoryChannels);
    }

    openMenu = (bOpen) => {
        this.setState({
            menuOpened: bOpen,
            focused: !bOpen
        });
    }

    onSelectCategory = (category) => {
        if (category === this.category) {
            return;
        }
        this.openMenu(false);
        this.setFocus('chart');

        if (category === 0) { // 인치채널
            this.movePage(constants.BOX_OFFICE);
        } else {
            this.setPage(category);
        }
    }

    onFocusChart = () => {
        console.error('onFocusChart');
        this.openMenu(false);
    }

    onFocusKeyDownChart = (event) => {
        const { 
            programs,
            channelIdx,
            programIdx,
            channels,
            now
        } = this.state;
        const program = programs[channelIdx][programIdx];
        const isLive = program? now >= program.startTime && now <= program.endTime: false;
        switch (event.keyCode) {
            case KEY.UP:
            case KEY.DOWN:
                return this.moveChannel(event.keyCode);
            case KEY.LEFT:
            case KEY.RIGHT:
                return this.moveProgram(event.keyCode);
            case KEY.ENTER:
                if (this.category === 1 && this.favoriteChannels.length === 0) {
                    this.onMoveRegisterFavoriteChannel();
                    return;
                }
                console.error('프로그램 정보:', program);
                if (program) {
                    this.onSelectProgram(program);
                }
                break;
            case KEY.OPTION:
            case KEY.OPTION_KEY:
            case KEY.BLUE:
            case KEY.BLUE_KEY:
            case KEY.FAV:
            case KEY.FAV_KEY:
                this.onRegisterFavorite();
                // program = programs[channelIdx][programIdx];
                // if (program) {
                //     this.onReserveProgram(program);
                // }
                break;
            case KEY.SKIP_NEXT:
            case KEY.NEXT_JUMP_KEY:
                let nextPage = this.page;
                if (this.page === this.totalPage - 1) {
                    nextPage = 0;
                } else {
                    nextPage += 1;
                }

                if (this.page !== nextPage) {
                    this.page = nextPage;
                    this.buildList(undefined, isLive);
                }
                return;
            case KEY.SKIP_PREV:
            case KEY.PRE_JUMP_KEY:
                let prevPage = this.page;
                if (this.page === 0) {
                    prevPage = this.totalPage - 1;
                } else {
                    prevPage -= 1;
                }

                if (this.page !== prevPage) {
                    this.page = prevPage;
                    this.buildList(undefined, isLive);
                }
                return;
            default: break;
        }
    }

    onMoveRegisterFavoriteChannel = () => {
        console.error('선호채널 등록하기 선택');
        STB.menuNavigationNative('SETTING', {menuId: 'SETTING_FAVORITE_CHANNEL'});
    }

    onSelectProgram = (program) => {
        if (!program) {
            console.error('프로그램 정보 없음');
            return;
        }

        // 프로그램 정보 없음일 경우 걍 리턴!!
        if (program.noInfo) {
            return;
        }

        const { channels, channelIdx, programIdx, now, allReservations } = this.state;
        const reservations = [];
        for (let i=0; i<channels.length; i++ ) {
            reservations.push(allReservations.get(channels[i].num));
        }
        const channel = channels[channelIdx]
        console.error('프로그램', program, '채널:', channel);

        let isLive = false;
        isLive = now >= program.startTime && now <= program.endTime;

        if (isLive) { // 현재 방영중인 경우 채널이동
            STB.requestLiveTvService('M', {channelNo: channel.num});
        } else { // 미래 시간일 경우 시청 예약.
            if (!channel) {
                console.error('프로그램 예약시 채널정보 없음:', channel);
                return;
            }

            const reservationList = reservations[channelIdx];
            let reserved = false;
            if (reservationList && reservationList.length !== 0) {
                for(const reserveInfo of reservationList) {
                    if (program.startTime*1000 === parseInt(reserveInfo.startTime, 10)) {
                        reserved = true;
                        break;
                    }
                }
            }
            
            const actionType = reserved? 'D': 'R';
            // const startTime = moment(program.startTimeOrigin).format('YYYYMMDDHHMMSS');
            // const endTime = moment(program.endTimeOrigin).format('YYYYMMDDHHMMSS');
            
            let param = {
                channelNo: channel.num,
                channelName: channel.name,
                programName: program.name,
                // startTime: program.startTimeOrigin,
                //endTime: program.endTimeOrigin
                startTime: program.startTime * 1000,
                endTime: program.endTime * 1000
            };
            console.error('예약 파리미터', param);
            STB.requestLiveTvService(actionType, param, (result) => {
                console.error(`시청예약 ${program.reserved?'등록':'삭제'}결과`, result);
                this.updateReservations();
            });
        }
    }

    onRegisterFavorite = () => {
        const { fav, channels, channelIdx } = this.state;
        const channel = channels[channelIdx];
        // console.error('선호채널 => 채널정보', fav, channel );
        let isFav = false;
        if (fav && fav.indexOf(channel.num) !== -1) {
            isFav = true;
        }

        const action = isFav? 'D': 'R';
        STB.setFavorite(action, 'IPTV', channel.id, (result) => {
            // console.error('reuslt', result);
            this.updateRegisteredChannels();
            Core.inst().showToast(`${channel.num} ${channel.name}`, isFav? '선호채널이 해제되었습니다': '선호채널로 등록되었습니다');
        });
    }

    onReserveProgram = (program) => {
        console.error('프로그램 예약', program);
    }

    // 현재 채널과 포커스 프로그램정보를 바탕으로 화면의 srollLeft 변경
    scrollToFocusProgram = () => {
        const { 
            programIdx,
            channelIdx,
            programs,
            channels,
        } = this.state;
        if (channels.length === 0) {
            return;
        }
        const program = programs[channelIdx][programIdx];
        if (!program) {
            return;
        }

        let scrollLeft = (program.startTime - (this.startTime + this.timechunk * TIME.CHUNK)) * TIME.TOPIXEL;
        if (scrollLeft < 0) {
            scrollLeft = 0;
        }
        this.setState({ scrollLeft });

        // let stateThis = this;
		// let activeElement = document.activeElement;
        // setTimeout(function(){
        //     activeElement.querySelector('.toolTip').classList.remove('left','right');
        //     activeElement.querySelector('.toolTip').setAttribute('style','margin-left:0');
        //     activeElement.querySelector('.toolTip img').setAttribute('style','left:50%');
        //     let scrollLeft = stateThis.state.scrollLeft;
        //     let maxRight = document.querySelector('.orgProgram').offsetWidth + scrollLeft;
        //     let targetOffsetLeft = (activeElement.offsetLeft + activeElement.querySelector('.toolTip').offsetLeft) - (activeElement.querySelector('.toolTip').offsetWidth / 2);
        //     let targetOffsetRight = (activeElement.offsetLeft + activeElement.querySelector('.toolTip').offsetLeft) + (activeElement.querySelector('.toolTip').offsetWidth / 2);
        //     if(0 + scrollLeft > targetOffsetLeft){
        //         activeElement.querySelector('.toolTip').classList.add('left');
        //         activeElement.querySelector('.toolTip').setAttribute('style', 'margin-left:' + (-targetOffsetLeft + scrollLeft + 20) + 'px;');
        //         activeElement.querySelector('.toolTip img').setAttribute('style', 'left:' + (activeElement.offsetLeft - scrollLeft + 10) + 'px;');
        //     }
            
        //     if(maxRight < targetOffsetRight){
        //         activeElement.querySelector('.toolTip').classList.add('right');
        //         activeElement.querySelector('.toolTip').setAttribute('style', 'margin-left:' + -(targetOffsetRight - maxRight + 20) + 'px;');
        //         activeElement.querySelector('.toolTip img').setAttribute('style', 'right:' + (maxRight - (activeElement.offsetLeft + activeElement.offsetWidth) + 20) + 'px;');
        //     }
        // },300);
    }

    // 프로그램 시간이 겹치는지 체크해서 겹치면 얼마나 겹치는지를 구함.
    isLineCollided(a1, a2, b1, b2) {
        return (a2 >= b1 && b2) > a1 ? this.getCollidedLength(a1, a2, b1, b2) : 0;
    }

    // 프로그램 시간이 얼마나 겹치는지를 구함. 
    getCollidedLength(a1, a2, b1, b2) {
        const min = Math.min(a1, a2, b1, b2);
        const max = Math.max(a1, a2, b1, b2);
        return ((a2 - a1) + (b2 - b1)) - (max - min);
    }

    moveChannel = (key) => {
        const { 
            programs,
            channels,
            programIdx,
            channelIdx,
            now
        } = this.state;

        if (channels && channels.length ===0) {
            return;
        }

        if (key === KEY.UP) { // UP
            const src = programs[channelIdx][programIdx];
            const isLive = src? now >= src.startTime && now <= src.endTime: false;

            if (channelIdx === 0) {
                if (this.page === 0) {
                    this.page = this.totalPage - 1;
                } else {
                    this.page -= 1;
                }
                this.buildList(DIR.UP, isLive);
                return true;
            }

            const nextChannelIdx = channelIdx - 1;
            let nextProgramIdx = -1;

            if (!isLive) { // 현재 프로그램이 live가 아닐경우
                const targetList = programs[nextChannelIdx];
                const cnt = targetList.length;

                const originalIndexList = [];
                const distanceList = [];

                for (let i = 0; i < cnt; i++) {
                    const target = targetList[i];
                    const distance = this.isLineCollided(src.startTime, src.endTime, target.startTime, target.endTime);
                    if (distance > 0) {
                        originalIndexList.push(i);
                        distanceList.push(distance);
                    }
                }
                
                if (distanceList.length !== 0) {
                    const maxIndex = distanceList.indexOf(Math.max(...distanceList))
                    if (maxIndex !== -1) {
                        nextProgramIdx = originalIndexList[maxIndex];
                    } else {
                        console.error('걸치는 프로그램 없음');
                    }
                    
                }
                if (nextProgramIdx === -1) {
                    return;
                    // console.error('걸치는 프로그램이 없습니다, 가장 가까운 프로그램으로 이동해야됨, 일단 0번으로 이동');
                    // nextProgramIdx = 0;
                }
            } else { // 현재 프로그램이 live 일 경우
                const targetList = programs[nextChannelIdx];
                const cnt = targetList.length;
                
                for (let i = 0; i < cnt; i++) {
                    const target = targetList[i];
                    const isLive = target? now >= target.startTime && now <= target.endTime: false;
                    if (isLive) {
                        nextProgramIdx = i;
                        break;
                    }
                }

                if (nextProgramIdx === -1) {
                    nextProgramIdx = 0;
                }
            }

            this.channelIdx = nextChannelIdx;
            this.setState({ 
                channelIdx: nextChannelIdx,
                programIdx: nextProgramIdx
            }, () => {
                this.scrollToFocusProgram();
            });
            return true;

        } else { // DOWN
            const src = programs[channelIdx][programIdx];
            const isLive = src? now >= src.startTime && now <= src.endTime: false;

            if (channelIdx === (channels.length - 1)) {
                if (this.page === this.totalPage - 1) {
                    this.page = 0;
                } else {
                    this.page += 1;
                }
                this.buildList(DIR.DOWN, isLive);
                return true;
            }
            
            const nextChannelIdx = channelIdx + 1;
            let nextProgramIdx = -1;
            if (!isLive) { // 현재 프로그램이 live가 아닐경우
                const targetList = programs[nextChannelIdx];
                const cnt = targetList.length;

                const originalIndexList = [];
                const distanceList = [];

                for (let i = 0; i < cnt; i++) {
                    const target = targetList[i];
                    const distance = this.isLineCollided(src.startTime, src.endTime, target.startTime, target.endTime);
                    if (distance > 0) {
                        originalIndexList.push(i);
                        distanceList.push(distance);
                    }
                }

                if (distanceList.length !== 0) {
                    const maxIndex = distanceList.indexOf(Math.max(...distanceList))
                    if (maxIndex !== -1) {
                        nextProgramIdx = originalIndexList[maxIndex];
                    } else {
                        console.error('걸치는 프로그램 없음');
                    }
                }

                if (nextProgramIdx === -1) {
                    return;
                    // console.error('걸치는 프로그램이 없습니다, 가장 가까운 프로그램으로 이동해야됨, 일단 0번으로 이동');
                    // nextProgramIdx = 0;
                }
            } else {
                const targetList = programs[nextChannelIdx];
                const cnt = targetList.length;
                
                for (let i = 0; i < cnt; i++) {
                    const target = targetList[i];
                    const isLive = target? now >= target.startTime && now <= target.endTime: false;
                    if (isLive) {
                        nextProgramIdx = i;
                        break;
                    }
                }

                if (nextProgramIdx === -1) {
                    nextProgramIdx = 0;
                }
            }

            this.channelIdx = nextChannelIdx;
            this.setState({ 
                channelIdx: nextChannelIdx,
                programIdx: nextProgramIdx
            }, () => {
                this.scrollToFocusProgram();
            });
            return true;
        }
    }

    moveProgram = (key) => {
        // console.error('movePRogram.this.channelIdx', this.channelIdx);
        // console.error('moveProgram.state.channelIdx', this.state.channelIdx);
        const { 
            programIdx,
            channelIdx,
            programs,
            channels,
            startTime,
            endTime
        } = this.state;

        if (channels && channels.length ===0) {
            return;
        }

        const programList = programs[channelIdx];
        const cnt = programList? programList.length: 0;

        if (key === KEY.LEFT) {
            if (programIdx === 0) {
                if (this.timechunk === 0) {
                    return false;
                } else {
                    this.timechunk -= 1;
                    this.buildList(DIR.LEFT);
                    return true;
                }
            }

            let nextIndex = -1;
            for (let i=programIdx -1; i>=0; i--) {
                const program = programList[i];
                if (program && program.endTime > this.now) { // 현재시간 이전에 끝난 프로그램으로는 포커스 이동 불가.
                    console.error('이동할 프로그램정보 : ', program);
                    nextIndex = i;
                    break;
                }
            }

            if (nextIndex !== -1) {
                this.setState({ programIdx: nextIndex });
                this.scrollToFocusProgram();
                return true;
            } else {
                // console.error('포커스 가능한 이전 프로그램 없음');
                return false; // 처음
            }
        } else { // 오른쪽
            const currentProgram = programList[programIdx];
            const isLastProgram = programIdx === programList.length -1;
            if (isLastProgram) {
                if (currentProgram.endTime < endTime - 1000) {
                    console.error('우측에 프로그램 정보 없음');
                    return false; // 우측에 프로그램 정보 없음
                }
            }

            let nextIndex = -1;
            if (programIdx + 1 > cnt - 1) {
                // 마지막 프로그램.
                if (this.timechunk === TIME.MAX_CHUNK -1) {
                    return false;
                } else {
                    this.timechunk += 1;
                    this.buildList(DIR.RIGHT);
                }
            }

            for (let i=programIdx + 1; i<cnt; i++) {
                const program = programList[i];
                // 포커스 가능한지 체크
                if (program) {
                    console.error('이동할 프로그램정보:', program);
                    nextIndex = i;
                    break;
                }
            }

            if (nextIndex !== -1) {
                this.setState({ programIdx: nextIndex });
                this.scrollToFocusProgram();
                return true;
            } else {
                return false; // 마지막
            }
        }
    }
    
    render() {
        const { 
            menuOpened,
            pageTitle,
            now,
            categorys,
            startTime,
            endTime,
            channels, // 현제 페이지의 채널정보 리스트
            programs,
            channelIdx,
            programIdx,
            scrollLeft,
            focused,
            fav,
            join,
            reservations,
            allReservations,
            isTooltipGuided,
            filteredChannels
        } = this.state;

        if (!filteredChannels) {
            return null;
        }

        const nowLeft = (now - startTime) * TIME.TOPIXEL - scrollLeft;
        const containerClass = `orgCon${menuOpened?' menuOpen':''}`;
        const noFavoriteChannel = this.category === 1 && channels.length === 0;
        const noCategoryChannel = this.category >= 3 && channels.length === 0;
        const noChannel = this.category === 2 && channels.length ===0;
        
        // console.error('category:', this.category);
        // console.error('channels', channels);
        // console.error('nofav:', noFavoriteChannel);
        // console.error('noCate', noCategoryChannel);
        // console.error('startTime', startTime, 'endTime', endTime);
        // console.error('now', now);
        // console.error('channels', channels);
        let isLive = false;
        let program = null;
        let channel = null;
        if (programs) {
            program = programs[channelIdx]? programs[channelIdx][programIdx]: null;
        }

        if (channels) {
            channel = channels[channelIdx];
        }

        isLive = program? (now >= program.startTime && now <= program.endTime) || program.endTime < now: false;
        isLive = channel? isLive || (channel.num === 1 || channel.num === 40): isLive;

        return (
            <div className="orgWrap">
                <div className={containerClass}>
                    <h2 className="pageTitle">
                        {pageTitle}
                        <Clock/>
                    </h2>
                    <TotalScheduleMenu 
                        list={categorys}
                        setFm={this.setFm}
                        openMenu={this.openMenu}
                        onSelectCategory={this.onSelectCategory}
                    />
                    {/* -----프로그램이 없는 경우----- */}
                    { (noFavoriteChannel|| noCategoryChannel || noChannel) &&
                        <div className="orgProgramCon programNone">
                            <div className="orgChannel">
                                <span className="timeTop"></span>
                                <div className="channel"></div>
                            </div>
                            <div className="orgProgram">
                                <div className="orgProgramWrap">
                                    <span className="timeTop">
                                        <Moment className="currentDate" unix format="HH:mm">{startTime}</Moment>
                                        <Moment className="currentDate" unix format="HH:mm">{startTime + TIME.UNIT}</Moment>
                                        <Moment className="currentDate" unix format="HH:mm">{startTime + (TIME.UNIT * 2)}</Moment>
                                    </span>
                                    <div className="wrapProgramNone">
                                        <div className="noneCon">
                                            <p className="textInfo">{ noFavoriteChannel?'등록하신 선호채널이 없습니다.': noCategoryChannel? '해당 장르의 채널이 없습니다.': noChannel? '채널 정보가 없습니다': '' }</p>
                                            { noFavoriteChannel&& <span className={`orgCsFocus btnStyle type03 loadFocus${focused? ' focusOn': ''}`}>선호채널 등록하기</span> }
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div> 
                    }
                    {/* -----프로그램이 있는 경우 ---*/}
                    { !noFavoriteChannel && !noCategoryChannel && !noChannel && <div className="orgProgramCon">
                        <div className="orgChannel">
                            <span className="timeTop"></span>
                            <ChannelInfoList
                                list={channels}
                                favoriteList={fav}
                                joinedList={join}
                                focusedIdx={channelIdx}
                            />
                        </div>
                        <div className="orgProgram">
                            <div className="orgProgramWrap" style={{width: TIMEWIDTH, transform: `translate(-${scrollLeft}px,0)`}}>
                                <Timeline 
                                    startTime={startTime}
                                    endTime={endTime}
                                    now={now}
                                />
                                {/* VirtualChannelScheduleList */}
                                <ChannelScheduleList
                                    startTime={startTime}
                                    endTime={endTime}
                                    now={now}
                                    width={TIMEWIDTH}
                                    channels={channels}
                                    programs={programs}
                                    reservations={reservations}
                                    allReservations={allReservations}
                                    channelIdx={channelIdx}
                                    programIdx={programIdx}
                                    scrollLeft={scrollLeft}
                                />
                            </div>
                        </div>
                        {(nowLeft > 0 && !noCategoryChannel && !noFavoriteChannel)&& <div className="timeNow" style={{ transform: `translate(${nowLeft}px, 0)` }}>NOW</div>}
                    </div> }
                    <div className="keyWrap">
                        <span className="btnKeyOK">{isLive?'채널이동': '예약시청/취소'}</span>
                        <span className="btnKeyBlue">선호채널 / 해제</span>
                    </div>
                </div>
                {!isTooltipGuided && <GuideTooptip guideTitle="왼쪽 방향키로 다양한 장르별 편성표를 확인하세요." top="623" left="48" aniTime="3" delayTime="2" arrowClass="up leftleft" />}
            </div>
        );
    }
}

export default ScheduleChart;

class Clock extends Component{
	constructor(props){
		super(props);
		const timeInfo = this.getTime();
		
		this.state = {
			nowTime : timeInfo.timeStamp,
			minute : timeInfo.nowMinute
		}
	}

	componentDidMount() {
		let intervalId = setInterval(e => {
			this.timeCheck()
		}, 1000);

		this.setState({
			intervalId: intervalId
		});
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	getTime() {
		let now = new Date();
		let current = now / 1000;
		const nowMinute = now.getMinutes();

		return {timeStamp: current, nowMinute : nowMinute}
	}

	timeCheck() {
		const timeInfo = this.getTime();
		
		if(this.state.minute !== timeInfo.nowMinute){
			this.setState({
				nowTime : timeInfo.timeStamp,
				minute : timeInfo.nowMinute
			});
		}
	}

	render(){
        const {nowTime} = this.state;
        
		return(
			<Moment className="currentDate" unix format="YYYY.M.D (dd) H:mm">{nowTime}</Moment>
		)
	}
}


