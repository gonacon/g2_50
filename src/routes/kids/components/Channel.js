import React, { Component } from 'react';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
//import moment from 'moment';

import appConfig from 'Config/app-config';
import constants from 'Config/constants';
//import { WEPG } from 'Network';
import { Core } from 'Supporters';
import keyCodes from 'Supporters/keyCodes';
import StbInterface, { CHManager } from 'Supporters/stbInterface';

import { G2SliderRotateChannel, G2SlideChannel } from './module/KidsSlider';
import { kidsConfigs } from './../config/kids-config';

import { KIDS_CHANNEL, KIDS_CHANNEL_INFO/*, KIDS_CHANNEL_INFO_WEPG*/ } from '../channel/static/ChannelJson'
//import ChannelHomeJson from '../../../assets/json/routes/kids/channel/ChannelHome.json';

const DEBUG = false;
const LOG_DEBUG = false;

const { CODE: { GNB_KIDS } } = constants;

const KIDS_PIP_SIZE = {
  '0': { x: '574', y: '360', width: '774', height: '480' },
  '1': { x: '0', y: '0', width: '0', height: '0' }
};

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  //console.log('[' + moment().format('HH:mm:ss.SSS') + '][Channel] ' + msg, ...args);
  console.log('[Channel] ' + msg, ...args);
} : () => { };

const blue = DEBUG ? (msg, ...args) => {
  //console.log('%c[' + moment().format('HH:mm:ss.SSS') + '][Channel] ' + msg, 'color: white; background: blue', ...args);
  console.log('%c[Channel] ' + msg, 'color: white; background: blue', ...args);
} : () => { };

let PIP_TIMEOUT_ID = '';

class Channel extends Component {
  constructor(props) {
    super(props);

    blue('[constructor() props:', this.props);

    this.channelSlider = null;
    this.shouldFocusPip = false;      // BTVQ-1483: 음성검색으로 키즈존 진입 시, 포커스를 키즈메뉴에 두도록 수정하기 위해서 추가
    //            채널 재생 중 back키 누를 때와 구분해야 함.
    this.enterFromBt = false;         // BTVQ-1568: shouldFocusPip만 사용할 경우 키즈메뉴의 일반적인 변동(ex: 채널 -> 놀이학습 선택)시에도
    //            포커스가 채널로 다시 바뀌는 이슈가 있어서 보강.
    //            블루투스 음성 검색 '키즈존'을 통해서 들어왔을 경우에만 포커스를 채널로 변경

    if (isEmpty(this.historyData)) {
      this.state = {
        //data: ChannelHomeJson,
        //slideItem: ChannelHomeJson.slideItem,
        currentIdx: 0,
        channelInfo: [],
        serviceInfoArray: [], // WEPG에 필요한 데이터 정보 저장용도
      }

      this.menuId = ''
      this.isOnBlur = false;
    } else {
      // console.log('[HISTORY DATA] : ', this.historyData);
      this.state = this.historyData;
    }
  }

  requestChannelID = () => {
    blue('[requestChannelID]');
    log('[IS_RUNDEVICE_MODE]', appConfig.runDevice);

    appConfig.runDevice ? StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID) : this.callBackChannelID(KIDS_CHANNEL);
  }

  callBackChannelID = async (data) => {
    let allChannels;
    let registeredChannels = {};
    let result;

    blue('[callBackChannelID()] data:', data);

    if (appConfig.runDevice) {
      allChannels = CHManager.getAllList();
      registeredChannels = await CHManager.getRegisteredList();

      log('allChannels:', allChannels);
      log('registeredChannels:', registeredChannels);
    }

    result = data.channel.map((item, index) => {
      const {
        channel_name: chName,
        service_id: svcId,
        channel_no: chNo
      } = item;

      const channel = allChannels && allChannels.get(chNo);
      const isNotFree = channel ? (channel.pay && !includes(registeredChannels.join, chNo)) : (chNo % 2 === 1);
      const shouldBlock = channel ? (channel.pay && includes(registeredChannels.block, chNo)) : (chNo % 3 === 1);

      log('channel:', channel);
      log('유료:', isNotFree);
      log('차단:', shouldBlock);

      return { chName, svcId, chNo, isNotFree, shouldBlock };
    });

    log('channels:', result);
    log('Not free channels:', filter(result, 'isNotFree'));
    log('Blocked channels:', filter(result, 'shouldBlock'));

    this.requestProgramList(result); // STB에서 채널의 프로그램, 현재 프로그램 정보 가져옴
  }

  //requestProgramList = async (result) => {
  requestProgramList = (result) => {
    let channelInfo = result;
    let programInfo;
    let programManager;
    let channelInfoJson;

    blue('[requestProgramList] channelInfo:', channelInfo);

    if (appConfig.runDevice) {
      programManager = programInfo = window.tvExt.program.info;
    } else {
      channelInfoJson = KIDS_CHANNEL_INFO;
      programManager = {
        getCurrent: (chNo) => {
          programInfo = find(channelInfoJson, { chNo });
        }
      };
    }

    channelInfo.forEach((ch, index) => {
      //ch.programs = [];
      ch.curProgram = {};

      log('getCurrent(ch, index) start:', ch, index);
      //if (programInfo.getCurrent(ch.chNo)) {
      if (programManager.getCurrent(ch.chNo)) {
        let progress = 0;

        if (Number.isFinite(programInfo.startTime) && Number.isFinite(programInfo.endTime) && (programInfo.endTime - programInfo.startTime > 0)) {
          progress = ((new Date().getTime() - programInfo.startTime) / (programInfo.endTime - programInfo.startTime)) * 100;
        }

        ch.curProgram = {
          id: programInfo.id,
          title: programInfo.name,
          //description: programInfo.description,
          imagePath: programInfo.imagePath,
          progress
          //channelID: programInfo.channelID,
          //startTime: programInfo.startTime / 1000,
          //endTime: programInfo.endTime / 1000
        }

        log('progress:', ch.curProgram.progress);
      }

      log('getCurrent(ch, index) end:', ch, index, ch.curProgram);
    });

    blue('channelInfo:', channelInfo);
    this.setState({ channelInfo });
  }

  // PIP 재생 요청
  handlePlayPip = (index, playState) => {
    if (get(this.state, `channelInfo[${index}].isNotFree`)) {
      blue('유료 채널이므로 PIP 재생 안함');
      return;
    }

    let data = {
      chNum: this.state.channelInfo[index].chNo,
      //isBlocked: this.state.channelInfo[index].shouldBlock,
      //isNotFree: this.state.channelInfo[index].isNotFree,
      fullSize: 'N',
      playState: playState,
    }

    log('[handelPlayPip()] index, playState:', index, playState);

    data = Object.assign(data, KIDS_PIP_SIZE[data.playState]);
    log('data:', data);

    if (appConfig.runDevice) {
      StbInterface.requestPlayPip(data, this.callbackRequestPlayPip);
    } else {
      this.callbackRequestPlayPip();
    }
  }

  callbackRequestPlayPip = () => {
    log('[callbackRequestPlayPip()]');
  }

  // PIP 재생 요청 callback
  callbackPlayPIP = (data) => {
    log('callbackPlayPIP data:', data);
  }

  // 채널 이동 요청 to STB
  handleOnSelect = (index) => {
    blue('[handleOnSelect] index:', index);

    if (this.state.channelInfo[index].shouldBlock) {
      Core.inst().showToast('차단된 채널입니다.');
    } else {
      StbInterface.webMenuState(GNB_KIDS);
      StbInterface.requestLiveTvService('M', {
        channelNo: this.state.channelInfo[index].chNo,
        entryPath: '',
        fromMenu: 'KIDS_ZONE',
      }, this.callbackLiveTvService);

      StbInterface.requestPlayPip({ playState: '1' }, this.callbackRequestPlayPip);
      Core.inst().webVisible(false, true);
    }
  }

  // 채널 이동 요청 callback
  callbackLiveTvService = (data) => {
    log('callbackLiveTvService data:', data);

    if (data.result === 'success') {
      Core.inst().webVisible(false, true);
    }
  }

  handleOnSlider = (idx, container) => {
    this.isOnBlur = false;
    this.handlePlayPip(idx, kidsConfigs.CHANNEL_PIP_STATUS.PLAY);
    clearTimeout(PIP_TIMEOUT_ID);
    PIP_TIMEOUT_ID = setTimeout(() => {
      document.querySelector('.channelHome').style.backgroundColor = "";
    }, 1000);
  }

  handleOffSlider = (idx) => {
    this.isOnBlur = true;
    clearTimeout(PIP_TIMEOUT_ID);
    PIP_TIMEOUT_ID = setTimeout(() => {
      this.handlePlayPip(idx, kidsConfigs.CHANNEL_PIP_STATUS.STOP);
    }, 1000);
  }

  // 콘텐츠 키 이벤트 함수 (onKeyDown)
  handleOnKeyDown = (event, childIdx) => {
    const { channelInfo } = this.state;
    //const backGroundEl = document.querySelector('.channelWrap .bgWrap');

    if (!appConfig.runDevice && event.keyCode === keyCodes.Keymap.MOVIE) {      // live에서 채널 변경 후 back 테스트를 위해
      this.props.test(379);
      return;
    }

    switch (event.keyCode) {
      case keyCodes.Keymap.LEFT:
        //backGroundEl.classList.add('cover');
        this.enableCover(true);
        childIdx = childIdx === 0 ? channelInfo.length - 1 : childIdx - 1;
        this.onUpdateAnimationClass(childIdx, 'on');
        this.state.currentIdx = childIdx;

        clearTimeout(PIP_TIMEOUT_ID);
        StbInterface.requestPlayPip({ playState: '1' }, this.callbackRequestPlayPip);
        PIP_TIMEOUT_ID = setTimeout(() => {
          //backGroundEl.classList.contains('cover') && backGroundEl.classList.remove('cover');
          this.enableCover(false);
          document.querySelector('.channelHome').style.backgroundColor = "";

          this.handlePlayPip(childIdx, kidsConfigs.CHANNEL_PIP_STATUS.PLAY);
        }, 500);

        break;
      case keyCodes.Keymap.RIGHT:
        //backGroundEl.classList.add('cover');
        this.enableCover(true);

        childIdx = childIdx === channelInfo.length - 1 ? 0 : childIdx + 1;
        this.onUpdateAnimationClass(childIdx, 'on');
        this.state.currentIdx = childIdx;

        clearTimeout(PIP_TIMEOUT_ID);
        StbInterface.requestPlayPip({ playState: '1' }, this.callbackRequestPlayPip);
        PIP_TIMEOUT_ID = setTimeout(() => {
          //backGroundEl.classList.contains('cover') && backGroundEl.classList.remove('cover');
          this.enableCover(false);
          document.querySelector('.channelHome').style.backgroundColor = "";

          this.handlePlayPip(childIdx, kidsConfigs.CHANNEL_PIP_STATUS.PLAY);
        }, 500);

        break;
      case keyCodes.Keymap.ENTER:
        // 캐릭터 서브 화면 이동
        this.handleOnSelect(childIdx);

        break;
      default:
        break;
    }
  }

  // 컨테이너 Blur 상태 확인하기
  checkContainerBlur = (dir) => {
    return this.isOnBlur;
  }

  onBtSearchKidszone = () => {
    blue('[onBtSearchKidszone]');

    this.enterFromBt = true;
  }

  onChannelChanged = (svcId) => {
    log('this.state.channelInfo:', this.state.channelInfo);
    log('this.state.currentIdx:', this.state.currentIdx);
    const foundIndex = findIndex(this.state.channelInfo, { svcId });

    blue('[onChannelChanged] svcId, foundIndex:', svcId, foundIndex, this.state.channelInfo);

    this.shouldFocusPip = true;
    this.onUpdateAnimationClass(this.state.currentIdx, 'off');
    this.setState({ currentIdx: foundIndex }, () => {
      this.enableCover(true);
      setTimeout(() => { this.onUpdateAnimationClass(foundIndex, 'on'); }, 1);

      clearTimeout(PIP_TIMEOUT_ID);
      PIP_TIMEOUT_ID = setTimeout(() => {
        this.enableCover(false);
        this.handlePlayPip(foundIndex, kidsConfigs.CHANNEL_PIP_STATUS.PLAY);
      }, 1000);
    });
  }

  enableCover = (enable) => {
    const backGroundEl = document.querySelector('.channelWrap .bgWrap');

    if (enable) {
      backGroundEl.classList.add('cover');
    } else {
      backGroundEl.classList.contains('cover') && backGroundEl.classList.remove('cover');
    }
  }

  // 포커스 이동 시 left, right 애니메이션 변경
  onUpdateAnimationClass = (index, type) => {
    log('[onUpdateAnimationClass()] index, type:', index, type);

    const target = document.querySelectorAll('.channelWrap .slideWrapper .slide:not(.clone)')[index];

    if (!target) {
      log('sliderWrapper가 없습니다.');
      //setTimeout(() => { log('재시도'); this.onUpdateAnimationClass(index, type); }, 1000);
      return;
    }
    // const targetAll = document.querySelectorAll('.characterSlide .slide')[index];

    const prevTarget = target.previousSibling;
    const nextTarget = target.nextSibling;

    if (type === 'on') {
      target.classList.add('defaultFocus');
      prevTarget.classList.add('left');
      prevTarget.previousSibling.classList.add('left');
      nextTarget.classList.add('right');
      nextTarget.nextSibling.classList.add('right');

    } else if (type === 'off') {
      /*
      if (target.classList.contains('left') || target.classList.contains('right')) {
        target.className = 'slide';
      }
      */
      if (target.classList.contains('left')) {
        target.classList.remove('left');
      } else if (target.classList.contains('right')) {
        target.classList.remove('right');
      }

      if (prevTarget.classList.contains('left')) {
        prevTarget.classList.remove('left');
      }

      if (prevTarget.previousSibling.classList.contains('left')) {
        prevTarget.previousSibling.classList.remove('left');
      }

      if (nextTarget.classList.contains('right')) {
        nextTarget.classList.remove('right');
      }

      if (nextTarget.nextSibling.classList.contains('right')) {
        nextTarget.nextSibling.classList.remove('right');
      }
    }
  }

  componentWillUpdate = (nextProps, nextState) => {
    blue('[componentWillUpdate()] nextProp:', nextProps, 'nextState:', nextState);
    log('this.props:', this.props);
    log('this.state:', this.state);
  }

  componentDidUpdate = (prevProps, prevState) => {
    blue('[componentDidUpdate] prevProp:', prevProps, 'prevState:', prevState);
    log('this.props:', this.props);
    log('this.state:', this.state);
    /*
    if (this.shouldFocusPip) {
      this.shouldFocusPip = false;
    } else {
      this.props.setFocus('kidsMenu', this.props.menuIndex);
    }
    */

    if (!this.shouldFocusPip && this.enterFromBt) {
      this.props.setFocus('kidsMenu', this.props.menuIndex);
    } else {
      this.shouldFocusPip = false;
      this.enterFromBt = false;
    }
  }

  render = () => {
    blue('[render]');

    const { channelInfo, currentIdx } = this.state;
    const { setFm } = this.props;
    const bg = `${appConfig.headEnd.LOCAL_URL}/kids/channel/bg.png`;

    const bShow = !isEmpty(channelInfo) && (channelInfo && channelInfo.length !== 0);

    return (
      <div className="channelWrap">
        <div className={`bgWrap${!bShow ? ' cover' : ''}`}><img src={bg} alt="" /></div>
        {
          bShow ? <G2SliderRotateChannel
            id={'contents'}
            ref={ref => { this.channelSlider = ref; }}
            setFm={setFm}
            currentIdx={currentIdx}
            totalIndex={channelInfo.length}
            onInitFocus={this.handleOnInitFocus}
            onSlider={this.handleOnSlider}
            offSlider={this.handleOffSlider}
            onFocus={this.handleOnFocusMove}
            onKeyDown={this.handleOnKeyDown}
            onPlayPIP={this.handlePlayPip}
            onUpdateAnimation={this.onUpdateAnimationClass}>
            {
              this.state.channelInfo.map((data, i) => {
                return (
                  <G2SlideChannel
                    data={data}
                    //checkBlur={this.checkContainerBlur}
                    key={i}
                    onUpdateAnimation={this.onUpdateAnimationClass}
                  />
                )
              })
            }
          </G2SliderRotateChannel> : null
        }
        {/*6/14 channelCaution 문구 수정*/}
        <p className="channelCaution">아이가 자주 보던 채널을 쉽고 빠르게 보여주세요. B tv 키즈에서는 키즈 채널만 시청할 수 있어 올바른 시청 습관을 만들 수 있습니다.</p>
      </div>
    )
  }

  componentDidMount = () => {
    const { menuId } = this.props;

    blue('[componentDidMount()]');

    if (menuId !== '') {
      this.menuId = menuId;
      this.requestChannelID();
    }
  }

  componentWillUnmount = () => {
    blue('[componentWillUnmount()]');

    StbInterface.requestPlayPip({ playState: '1' }, this.callbackRequestPlayPip);
    // const curChannelNo = document.querySelector('.channelWrap .slide.active .num').innerText;
    // StbInterface.requestPlayPip({
    //     chNum: curChannelNo,
    //     fullSize: 'N',
    //     playState: '1'
    // });
  }
}

export default Channel;
