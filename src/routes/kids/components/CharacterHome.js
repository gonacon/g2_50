import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import constants from 'Config/constants';
import { NXPG, MeTV } from 'Network';
import keyCodes from 'Supporters/keyCodes';

import { kidsConfigs } from './../config/kids-config';
import { G2SliderRotateCharacter, G2SlideCharaterHome } from './module/KidsSlider';

import 'Css/kids/character/CharacterHome.css';
import { CTSInfo } from 'Supporters/CTSInfo';
import Core from 'Supporters/core';

const DEBUG = false;
const LOG_DEBUG = false;

const log = DEBUG && LOG_DEBUG ? (msg, ...args) => {
  console.log('[CharacterHome] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c[CharacterHome] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class CharacterHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventPromtInfo: null, // 이벤트 프로모션 정보
      characterInfo: null, // 캐릭터 정보
      charaterHiddenInfo: null,
      lastWatchInfo: null,  // 마지막 시청 회차 정보
      charaterHomeList: null
    };

    this.memuId = '';
    this.focusMenuId = '';
    this.childIndex = 2;
    this.chrtrElements = {};
  }

  /*********************************** Component Lifecycle Methods ***********************************/
  componentWillMount() {

  }

  componentDidMount() {
    const { menuId, chrtr_menuId } = this.props;
    if (menuId !== '') {
      this.focusMenuId = chrtr_menuId;
      this.menuId = menuId;
      this.handleRequestInfo();
    }
  }

  componentWillReceiveProps() {

  }

  /*********************************** H/E Request Methods ***********************************/
  handleRequestInfo() {
    this.handleReqestCharacterInfo();
  }

  /**
  * [H/E][NXPG] 캐릭터 전체보기
  * IF : IF-NXPG-101
  */
  handleReqestCharacterInfo = async () => {
    let result = {};
    let resultHiddenChar = [];
    let resultLastWatchChars = [];
    try {
      resultLastWatchChars = await MeTV.request025(); // 캐릭터 별 마지막 시청회차 정보
      resultHiddenChar = (await MeTV.request048({ transactionId: 'ME048_select', hidden_type: kidsConfigs.CHAR_SETTING_TYPE.CHAR })); // 숨김캐릭터 조회
      result = await NXPG.request101({ menuId: this.menuId });
      if (isEmpty(result.menus)) return null;
    } catch (e) {
      console.error("[IF-NXPG-101]: Unexpected error occurred \n", e);
    } finally {
      resultLastWatchChars = resultLastWatchChars.watchList ? resultLastWatchChars.watchList : [];
      resultHiddenChar = resultHiddenChar.hiddencharList ? resultHiddenChar.hiddencharList : [];

      let resultInfo = result.menus ? result.menus : [];
      const filterEvents = (data) => {
        let tempInfo = data.filter((item) => { return item.blk_typ_cd === '70'; });
        tempInfo = tempInfo.map((item, index) => {
          const {
            menu_id: menuId,
            menu_nm: menuNm,

            shcut_epsd_id: shcutEpsdId, // 바로가기 에피소드 ID
            shcut_sris_id: shcutSrisId, // 바로가기 시리즈 ID
            shcut_menu_id: shcutMenuId, // 바로가기 메뉴 ID

            chrtr_fout_img: chrtrFoutImg,
            chrtr_fin1_img: chrtrFinImg,
            flag_fin_img: chrtrflagInImg,
            flag_fout_img: chrtrflagOutImg,

            blk_typ_cd: blkTypCd,  // 블럭 유형 코드
            call_typ_cd: callTypCd, // 호출 유형 코드
            call_url: callUrl,
            synon_typ_cd: synopTypCd, // 진입할 시놉시스 유형코드
            cnts_typ_cd: cntsTypCd // 콘텐츠 유형 코드
          } = item;
          return {
            menuId, menuNm, shcutEpsdId, shcutSrisId, shcutMenuId,
            blkTypCd, synopTypCd, cntsTypCd, callTypCd, callUrl,
            chrtrFoutImg, chrtrFinImg, chrtrflagInImg, chrtrflagOutImg
          }
        });
        return tempInfo;
      }

      const storage = localStorage;
      let getEvents = filterEvents(resultInfo);
      let eventPromt = null;

      let curPromtKey = Number(storage.getItem('KIDS_EVENT_PROMOTION_KEY')); // 로컬 스토리지에 저장되어있는 이벤트 프로모션 key
      let nextPromtKey = null;

      // 로컬스토리지에 저장되어있는 event promotion이 있는 경우
      if (JSON.stringify(curPromtKey)) {
        const getEvents_HeadEnd = getEvents.map((item, index) => { return { key: index, menu_id: item.menuId } }); // H/E 이벤트 정보
        const getEvents_Storage = this.getStorageEventInfo(storage, 'KIDS_EVENT_PROMOTION_INFO'); // LocalStorage 이벤트 정보

        // H/E && LocalStorage 정보 비교
        if (this.arraysEqual(getEvents_HeadEnd, getEvents_Storage)) { // 배열 일치하는 경우

          // 다음 이벤트 프로모션 키 저장
          nextPromtKey = (curPromtKey === getEvents.length - 1) ? 0 : curPromtKey + 1;
          storage.removeItem('KIDS_EVENT_PROMOTION_KEY');
          storage.setItem('KIDS_EVENT_PROMOTION_KEY', nextPromtKey);

          eventPromt = getEvents_Storage[storage.getItem('KIDS_EVENT_PROMOTION_KEY')];

        } else { // 배열 불일치 하는 경우 
          this.setStorageEventInfo(storage, 'KIDS_EVENT_PROMOTION_INFO', getEvents.map((item, index) => {
            return {
              key: index,
              menu_id: item.menuId
            }
          }));
          storage.setItem('KIDS_EVENT_PROMOTION_KEY', 0);
          eventPromt = getEvents[0];
        }

        // 로컬스토리지에 저장되어있는 event promotion이 없는 경우
      } else {
        getEvents = filterEvents(resultInfo);
        this.setStorageEventInfo(storage, 'KIDS_EVENT_PROMOTION_INFO', getEvents.map((item, index) => {
          return {
            key: index,
            menu_id: item.menuId
          }
        }));
        storage.setItem('KIDS_EVENT_PROMOTION_KEY', 0);
        eventPromt = getEvents[0];

        // console.log('[KIDS_EVENT_PROMOTION_INFO]', this.getStorageEventInfo(storage, 'KIDS_EVENT_PROMOTION_INFO'));
        // console.log('[KIDS_EVENT_PROMOTION_KEY]', storage.getItem('KIDS_EVENT_PROMOTION_KEY'));
      }

      // 캐릭터 정보
      let characters = resultInfo.filter((item) => {
        return item.blk_typ_cd === '20' && !isEmpty(item.chrtr_nm)
      });

      characters = characters.map(item => {
        let resultItem;
        const {
          menu_id: menuId,
          chrtr_nm: chrtrNm,
          chrtr_fout_img: chrtrFoutImg, // 캐릭터 이미지(Focus Out)
          chrtr_fin1_img: chrtrFinImg, // 캐릭터 이미지(Focus In)
          flag_fin_img: chrtrflagInImg,
          flag_fout_img: chrtrflagOutImg,
          age_rating_img: ageRatingImg, // 연령등급 아이콘
          chrtr_zon_sub_img: chrtrZonSubImg, // 캐릭터 존 서브 이미지

          sort_seq: sortSeq, // 메뉴정렬순서

          blk_typ_cd: blkTypCd,
          call_typ_cd: callTypeCd,
          synon_typ_cd: synoTypCd, // 진입할 시놉시스 유형 코드
          kids_age_cd: ageCd, // 키즈 연령 코드
          cnts_typ_cd: contsTypCd, // 콘텐츠 유형 코드

          call_url: callUrl

        } = item;


        let checkLastWatch = false;
        let lastWatchInfo = {};
        // 1. 마지막 시청 회차 정보가 있는 캐릭터인 경우 이어보기 어포던스 정보 추가
        if(!isEmpty(resultLastWatchChars)) {
          checkLastWatch = resultLastWatchChars.some((lastVod) => {
            const {
              epsd_id: epsdId,
              epsd_rslu_id: epsdRsluId,
              epsd_title: epsdTitle,
              kids_char_id: kidsCharId,
              level,
              material_cd: materialCd,
              reg_date: regDate,
              series_no: seriesNo,
              sris_id: srisId,
              thumbnail,
              title,
              trans_type: transType,
              watch_rt: watchRt,
              watch_time: watchTime
            } = lastVod

            lastWatchInfo = {
              epsdId, // VOD 컨텐츠의 식별자
              epsdRsluId, // VOD 컨텐츠의 해당도 ID
              epsdTitle, // 에피소드 제목
              kidsCharId, // 캐릭터 ID
              level, // 사용자 등급
              materialCd, // 시즌 ID 별 최근 시청한 컨텐츠의 소재상태코드(65: 배포승인, 80: 배포만료 등)
              regDate, // 시청일(yy.mm.dd)
              seriesNo, // VOD 컨텐츠의 에피소드 회차
              srisId, // VOD 컨텐츠의 시즌 ID
              thumbnail,
              title, // 컨텐츠 이름
              transType, // 컨텐츠 전송 방식(1: D&P, 2: RTSP, 3: HLS)
              watchRt, // 시청비율(%)
              watchTime, // 컨텐츠 최종 시청 타임(second)
            }
            return lastVod.kids_char_id === item.menu_id;
          });
        }
        lastWatchInfo = checkLastWatch ? lastWatchInfo : null;
        
        // 2. 숨김 캐릭터인 경우 리스트에서 제거
        if (!isEmpty(resultHiddenChar)) {
          let isHidden = false;
          resultHiddenChar.forEach((hiddenCharId/*, idxHidden*/) => {
            if (item.menu_id === hiddenCharId) isHidden = true;
          });
          // 숨김 캐릭터 아닌것만 보여줌
          if (!isHidden) {
            resultItem = {
              menuId, chrtrNm, chrtrFoutImg, chrtrFinImg, chrtrflagInImg, chrtrflagOutImg, ageRatingImg, sortSeq,
              chrtrZonSubImg, blkTypCd, callTypeCd, synoTypCd, ageCd, contsTypCd, callUrl, lastWatchInfo
            }
          }
        // 3. 숨김 캐릭터 없을경우 -> 캐릭터 전체다 보여줌
        } else {
          resultItem = {
            menuId, chrtrNm, chrtrFoutImg, chrtrFinImg, chrtrflagInImg, chrtrflagOutImg, ageRatingImg, sortSeq,
            chrtrZonSubImg, blkTypCd, callTypeCd, synoTypCd, ageCd, contsTypCd, callUrl, lastWatchInfo
          }
        }
        return resultItem;
      });

      if (!isEmpty(resultHiddenChar)) {
        characters = characters.filter(item => {
          return !isEmpty(item);
        });
      }

      // 전체메뉴를 통해 진입하는 경우 해당 캐릭터의 포커스 선택
      if (!isEmpty(this.focusMenuId)) {
        characters.some((item, index) => {
          this.childIndex = index;
          log(item.menuId === this.focusMenuId);
          return item.menuId === this.focusMenuId;
        });
      }

      if (characters.length > 0 && !isEmpty(eventPromt)) {
        characters && characters.splice(characters.length - 1, 0, getEvents[eventPromt.key]);
      }

      characters && characters.splice(characters.length - 2, 0, {
        chrtrNm: '캐릭터전체보기',
        callTypCd: 'All',
        chrtrFoutImg: '',
        chrtrFinImg: '',
        chrtrflagInImg: '',
        chrtrflagOutImg: ''
      })
      // console.log('[EVENT PROMOTION] : ', eventPromt);
      // console.log('[CHARATER INFO] : ', characters);

      this.setState({
        eventPromtInfo: eventPromt,
        charaterHomeList: characters
      }, () => {
        setTimeout(() => {
          this.setDomElement('slideWrap', '.characterSlideWrap', '');
          this.setDomElement('slide', '.characterSlide .slide:not(.clone)', 'ALL');
        }, 1);
      });
    }
  }

  /*********************************** FocusManager KeyEvent Methods ***********************************/
  // 블록 포커스셋 이벤트 함수 (onInitFocus)
  handleOnInitFocus = () => {
    log('[KEY EVENT][onInitFocus]');
    const { getHistory, setFocus } = this.props;
    if (getHistory().isOnHistory) {
      setFocus('contents', getHistory().childIndex);
      // resetHistory();
    }
  }

  // 블록 포커스온 이벤트 함수 (onSlider)
  handleOnSlider = (idx) => {
    this.onUpdateAnimationClass(idx, 'on');
  }

  // 블록 포커스오프 이벤트 함수 (offSlider)
  handleOffSlider = (idx) => {
    this.onUpdateAnimationClass(idx, 'off');
    this.props.setFocus('kidsMenu', 2);
  }

  // 콘텐츠 포커스 이동 이벤트 함수 (onFocus)
  handleOnFocusMove = (childIdx) => {
    // console.log('[KEY EVENT][onFocus] childIdx : ', childIdx);
  }

  // 콘텐츠 키 이벤트 함수 (onKeyDown)
  handleOnKeyDown = (event, childIdx) => {
    blue('[handleOnKeyDown()]');
    // console.log(`event : ${event.keyCode} childIdx : ${childIdx}`);

    const { charaterHomeList } = this.state;
    const { onMovePage } = this.props;
    let param = {
      pathName: '',
      state: ''
    }

    if (this.rotator.isAnimating) {
      return;
    }

    switch (event.keyCode) {
      case keyCodes.Keymap.LEFT:
        childIdx = childIdx === 0 ? charaterHomeList.length - 1 : childIdx - 1;
        this.rotator.isAnimating = true;
        this.onUpdateAnimationClass(childIdx, 'on');
        break;
      case keyCodes.Keymap.RIGHT:
        childIdx = childIdx === charaterHomeList.length - 1 ? 0 : childIdx + 1;
        this.rotator.isAnimating = true;
        this.onUpdateAnimationClass(childIdx, 'on');
        break;
      case keyCodes.Keymap.DOWN:
        param.pathName = constants.KIDS_CHARACTER_LIST;
        param.state = {};

        this.props.setHistory({
          comptName: 'CharacterHome',
          focusKey: 'contents',
          childIndex: childIdx,
          isInitKidsHome: false
        });
        onMovePage(param.pathName, param.state);
        break;
      case keyCodes.Keymap.RED_KEY:
        // 이어보기 컨텐츠 재생
			if(!isEmpty(charaterHomeList[childIdx].lastWatchInfo)) {
        const { title, seriesNo, epsdRsluId } = charaterHomeList[childIdx].lastWatchInfo;
				let param = { 
          search_type: '2',
          kids_yn: 'Y',
          seeingPath: '99',
          title: title, 
          brcast_tseq_nm: seriesNo,
          epsd_rslu_id: epsdRsluId
        };
        this.onPlayVod(param);
			}
        break;
      case keyCodes.Keymap.ENTER:
        const curContent = charaterHomeList[childIdx];

        // 1. 콘텐츠 분류 (캐릭터 전체보기, 캐릭터, 이벤트)
        if (isEmpty(curContent.blkTypCd)) {
          param.pathName = constants.KIDS_CHARACTER_LIST;
          param.state = {};

        } else if (curContent.blkTypCd === kidsConfigs.BLOCK.MENU_BLOCK_CD) {
          param.pathName = constants.KIDS_SUBCHARACTER;
          param.state = {
            menu_id: charaterHomeList[childIdx].menuId,
            blk_typ_cd: charaterHomeList[childIdx].blkTypCd,
            call_typ_cd: charaterHomeList[childIdx].callTypCd,
            call_url: charaterHomeList[childIdx].callUrl,
            chrtr_zon_sub_img: charaterHomeList[childIdx].chrtrZonSubImg
          }

        } else if (curContent.blkTypCd === kidsConfigs.BLOCK.EVENT_BLOCK_CD) {
          param.state = {
            menu_id: charaterHomeList[childIdx].shcutMenuId,
            epsd_id: charaterHomeList[childIdx].shcutEpsdId,
            sris_id: charaterHomeList[childIdx].shcutSrisId
          }

          // 2-1. 호출 유형 분류 (시놉시스, 이벤트 상세)
          if (curContent.callTypCd === kidsConfigs.CALL_TYPE.SYNOP) {

            // 2-2. 진입할 시놉시스 분류 (단편, 시즌, 게이트웨이, 커머스) 
            if (curContent.synopTypCd === kidsConfigs.SYNOP_MOVE_MTHD.SHORT_SYNOP) {
              param.pathName = constants.SYNOPSIS;
            } else if (curContent.synopTypCd === kidsConfigs.SYNOP_MOVE_MTHD.SIRES_SYNOP) {
              param.pathName = constants.SYNOPSIS;
            } else if (curContent.synopTypCd === kidsConfigs.SYNOP_MOVE_MTHD.GATEWAY_SYNOP) {
              param.pathName = constants.SYNOPSIS_GATEWAY;
            } else if (curContent.synopTypCd === kidsConfigs.SYNOP_MOVE_MTHD.COMMERCE_SYNOP) {
              param.pathName = constants.SYNOPSIS_VODPRODUCT;
            }

          } else {
            // [TODO] 이벤트 상세 진입 로직 필요(현재 H/E 데이터 없음)
          }
        }

        this.props.setHistory({
          comptName: 'CharacterHome',
          focusKey: 'contents',
          childIndex: childIdx,
          isInitKidsHome: false
        });

        onMovePage(param.pathName, param.state);
        break;
      default:
        break;
    }
  }

  /*********************************** Etc Methods ***********************************/

  setStorageEventInfo = (storage, key, info) => {
    storage.setItem(key, JSON.stringify(info));
  }

  getStorageEventInfo = (storage, key) => {
    const value = storage.getItem(key);
    return value && JSON.parse(value);
  }

  arraysEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // [NEW_NAVI][KEY] 캐릭터 홈
  onSelectCharacter = (event, childIdx) => {
    const { charaterHomeList } = this.state;
    const { onMovePage } = this.props;
    const curMenuId = charaterHomeList[childIdx].menuId;

    if (event) {
      if (event.keyCode === 13) {
        // 캐릭터 서브 페이지 이동
        // console.log("=========== 캐릭터 서브 페이지 이동 ===========");
        // console.log("request MenuId : ", curMenuId);
        // console.log("==============================");
        onMovePage(constants.KIDS_SUBCHARACTER, {
          menu_id: curMenuId
        });
      }
    }
  }

  setDomElement = (prop, classStr, type = null) => {
    log('%c[setDomElement info] ===>', 'color:#0000ff ', classStr);

    if (isEqual(type, 'ALL')) {
      this.chrtrElements[prop] = document.querySelectorAll(classStr);
    } else if (isEqual(type, '')) {
      this.chrtrElements[prop] = document.querySelector(classStr);
    }

    log('%c[chrtrElements] ===>', 'color:#0000ff ', this.chrtrElements);
  }

  // 포커스 이동 시 left, right 애니메이션 변경
  onUpdateAnimationClass = (index, type) => {
    log('[index] ', index);
    const target = document.querySelectorAll('.characterSlide .slide:not(.clone)')[index];
    // const targetAll = document.querySelectorAll('.characterSlide .slide')[index];

    const prevTarget = target.previousSibling;
    const nextTarget = target.nextSibling;

    if (type === 'on') {
      prevTarget.classList.add('left');
      nextTarget.classList.add('right');
    } else if (type === 'off') {
      if (target.classList.contains('left') || target.classList.contains('right')) {
        target.className = 'slide';
      }
      if (prevTarget.classList.contains('left')) {
        prevTarget.classList.remove('left');
      }
      if (nextTarget.classList.contains('right')) {
        nextTarget.classList.remove('right');
      }
    }
  }

  onPlayVod = (vodParam) => {
		if(!isEmpty(vodParam)) {
			CTSInfo.requestWatchVODForOthers(vodParam);
		} else {
			Core.inst().showToast('재생 정보가 없습니다.');
		}
	}

  render() {
    blue('[render()]');

    const { charaterHomeList } = this.state;
    const { setFm } = this.props;
    const bShow = !isEmpty(charaterHomeList) || (charaterHomeList && charaterHomeList.length === 0);
    // [HISTORY] 히스토리인 경우, Focus Index 가져오기
    const getHistoryData = this.props.getHistory();

    this.childIndex = getHistoryData.isOnHistory ? getHistoryData.childIndex : this.childIndex;

    return (
      bShow ?
        <G2SliderRotateCharacter
          id={'contents'}
          setFm={setFm}
          onInitFocus={this.handleOnInitFocus}
          onSlider={this.handleOnSlider}
          offSlider={this.handleOffSlider}
          onFocus={this.handleOnFocusMove}
          onKeyDown={this.handleOnKeyDown}
          onUpdateAnimation={this.onUpdateAnimationClass}
          focusIndex={this.childIndex}
          ref={ref => this.rotator = ref}

          contentList={charaterHomeList}>
          {
            charaterHomeList.map((item, index) => {
              return (item && <G2SlideCharaterHome
                content={item}
                
                lastIdx={charaterHomeList.length}
                key={index} />)
            })
          }

        </G2SliderRotateCharacter> : null
    )
  }
}

export default CharacterHome;
