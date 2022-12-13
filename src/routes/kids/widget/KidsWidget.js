import { React, createMarkup } from '../../../utils/common';
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP, PATH } from 'Config/constants';
import { isEmpty, isEqual } from 'lodash';
import { kidsConfigs } from '../config/kids-config';
import '../../../assets/css/routes/kids/widget/KidsWidget.css';
import update from 'react-addons-update';
import appConfig from 'Config/app-config';
import Core from 'Supporters/core';

const KIDS_WIDGET_NO_ANIMATION = 11000; // 알림, 인터렉션에 대한 애니메이션 후 위젯을 닫는 시간
const TICK_DURATION_MILLIS = 60000;			// 셋탑에서 내려주는 시간이 분단위이므로, 1분마다 한번씩 갱신되어야 하므로
const TEXT_TRANS_MILLIS = 5000;				// Text A -> Text B 전환시간
const KIDS_VISIT_DATE = 'KIDS_VISIT_DATE';
const EVERY_INTERACTION_MIN = 10;			// 10분마다 1번씩 캐릭터 인터랙션 (단위:분)
const ALARM_AFTER_INTERACTION_MIN = 5;			// 알람 후 5분간격 캐릭터 인터렉션 (단위:분)
const ALARM_AFTER_INTERACTION_COUNT = 2; // 5분간격 2번 호출
let TICK_INTER_MIN = 0;
let TICK_ALARM_AFTER_INTER_MIN = 0;
let TICK_ALARM_AFTER_INTER_COUNT = 0;

let KIDS_WIDGET_TIMER_ID = ''; // 키즈 위젯 1분 타이머 ID
let KIDS_WIDGET_CUSTOM_TIMER_ID = ''; // 키즈 위젯 설정시간대 1분 타이머 ID
let KIDS_WIDGET_ALARM_AFTER_ID = ''; // 키즈 위젯 알람 후 5분 타이머 ID

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.isInitKidsHome = false;
        this.state = {
            widgetInfo: { // 키즈위젯 설정 정보
                modeType: null, // 설정 모드 타입
                character: null, // 가이드 캐릭터
                guideTextA: null, // 가이드 문구 A
                guideTextB: null, // 가이드 문구 B

                motion: null, // 동작 모션
                voiceFileName: null,
                
                isKidsVigin: false, // 키즈 최초 시작 여부
                isKidsMode: false, // 키즈 모드 여부
                isKidsHome: false, // 키즈 홈 여부
                isSearchView: false, // 검색 화면 여부
                isAllMenuView: false, // 전체메뉴 화면 여부
                isKidsSetting: false, // 키즈 설정 여부
                
                isAnimation: false, // 애니메이션 사용 여부
                isVoiceUse: false, // 음성 사용 여부

                remainedTime: null, // 남은 시간
                remainedTimeSlot: null, // 남은 시간대
                remainedEpisode: null, // 남은 편수
                remainedAlarmTime: null, // 알림 시간

                showCompt: null, // 위젯 컴포넌트
                isWidgetShow: false
            },       
            alarmInfo: {
                alarmType: null, // 알림 타입
                alarmKindType: null, // 알람 종료별 타입
                alarmRemaindTime: null,
                alarmCharacter: null,
                alarmGuideTextA: null// 알람 문구
            }
        }
        Core.inst().setKidsWidget(this);
    }

    dummyData = () => {
        /*************************************** dummy Data TEST 용도 ***************************************/
        const widgetInfo =  { // 키즈위젯 설정 정보
            modeType: 'CUSTOM_TIME', // 설정 모드 타입
            character: 'pororo', // 가이드 캐릭터
            guideTextA: null, // 가이드 문구 A
            guideTextB: null, // 가이드 문구 B

            motion: null, // 동작 모션
            voiceFileName: null,
            
            isKidsVigin: false, // 키즈 최초 시작 여부
            isKidsMode: true, // 키즈 모드 여부
            isLocation: null,
            isKidsHome: window.location && window.location.href.indexOf('/kids/home') > -1, // 키즈 홈 여부
            isSearchView: false,
            isAllMenuView: false,
            isKidsSetting: true, // 키즈 설정 여부
            
            isAnimation: false, // 애니메이션 사용 여부
            isVoiceUse: false, // 음성 사용 여부

            remainedTime: '10,50,13,10', // 남은 시간
            remainedTimeSlot: null, // 남은 시간대
            remainedEpisode: null, // 남은 편수
            remainedAlarmTime: null, // 알림 시간 

            showCompt: null // 위젯 컴포넌트
        }
        return widgetInfo;
    }

    /*********************************** Component Lifecycle Methods ***********************************/
    shouldComponentUpdate(nextProps, nextState) {
        let updateFlag = true;
        if (JSON.stringify(this.state.alarmInfo) !== JSON.stringify(nextState.alarmInfo)) {
            updateFlag = false;
        }
        return updateFlag;
    }

    /**
	 * 24시간내 최초진입여부 확인
	 */
    checkFirstVisitOfDay() {
        let isFirst = false;

        if (typeof (Storage) !== 'undefined') {
            let currentDate = new Date().toISOString().substring(0, 10);
            let storedDate = localStorage.getItem(KIDS_VISIT_DATE);

            if (storedDate !== currentDate) {
                isFirst = true;
                localStorage.setItem(KIDS_VISIT_DATE, currentDate);
            }
        }
        return isFirst;
    }

    /*********************************** STB Interface Request Methods ***********************************/
    currentSTBInfo = () => {
        console.log('[SAVE currentSTBInfo]');
        // console.log('%c[SHOW WIDGET data] ===>', 'color:#0000ff ', alramInfo);

        let widgetInfo =  { // 키즈위젯 설정 정보
            modeType: StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_TYPE), // 제한 모드: [시간으로 제한 - TIME, 시간대로 제한 -  CUSTOM_TIME, 편수 제한 -  VOD_COUNT, 사용안함 - BTV]
            character: StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER), // 가이드 캐릭터
            guideTextA: null, // 가이드 문구 A
            guideTextB: null, // 가이드 문구 B

            motion: null, // 동작 모션
            voiceFileName: null,
            
            isKidsVigin: this.checkFirstVisitOfDay(), // 키즈 최초 시작 여부
            // isKidsVigin: true, // 키즈 최초 시작 여부
            isKidsMode: isEqual(StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY), '1'), // 키즈 모드 여부
            isLocation: appConfig.runDevice ? Core.inst().location.getPath() : null,
            isKidsHome: false,
            isSearchView: false,
            isAllMenuView: false,
            isKidsSetting: !isEqual(StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_TYPE), 'BTV'), // 키즈 설정 여부
            
            isAnimation: false, // 애니메이션 사용 여부
            isVoiceUse: false, // 음성 사용 여부

            remainedTime: null, // 남은 시간
            remainedTimeSlot: null, // 남은 시간대
            remainedEpisode: null, // 남은 편수
            remainedAlarmTime: null, // 알림 시간

            showCompt: null // 위젯 컴포넌트
        }

        // 설정 모드에 따라서 남은 시간, 시간대, 편수 저장
        let remainedValue = null;
        switch(widgetInfo.modeType) {
            case kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME : // 시간
                remainedValue = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME);
                widgetInfo.remainedTime = remainedValue;
                break;
            case kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME : // 시간대
                remainedValue = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT_TIME_SET);
                widgetInfo.remainedTimeSlot = remainedValue
                break;
            case kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT : // 편수
                remainedValue = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD);
                widgetInfo.remainedEpisode = remainedValue;
                break;
            case kidsConfigs.KIDS_WIDGET_SETTING_MODE.BTV : // 미설정
                break;
            default :
                break;
        }
        console.log('%c[KIDS_WIDGET ModeType / RemaindValue] ===>', 'color:#0000ff ',widgetInfo.modeType, remainedValue);
        remainedValue = null;
        
        // widgetInfo = !appConfig.runDevice && this.dummyData(); // 테스트 용도

        // 키즈 홈, 검색, 전체메뉴 화면 구분
        if(appConfig.runDevice) {
            widgetInfo.isKidsHome = !isEmpty(widgetInfo.isLocation) && widgetInfo.isLocation === PATH.KIDS_HOME;
            widgetInfo.isSearchView = !isEmpty(widgetInfo.isLocation) && widgetInfo.isLocation.indexOf('search') > -1;
            widgetInfo.isAllMenuView = !isEmpty(widgetInfo.isLocation) && widgetInfo.isLocation === PATH.ALL_MENU;
        }
        
        return widgetInfo;
    }

    currentSTBAlarmInfo = (alarmEvent, modeType) => {
        console.log('[SAVE currentSTBAlarmInfo]');
        let alarmInfo = { // 키즈알람 정보
            alarmType: alarmEvent.type, // 알림 타입
            alarmKindType: alarmEvent.alarmType, // 알람 종료별 타입
            alarmRemaindTime: null,
            alarmCharacter: alarmEvent.character,
            alarmGuideTextA: alarmEvent.text // 알람 문구
        }

        // 알람 모드에 따라서 위젯에 보여줄 시간 설정
        const curTime = new Date();
        let remainedValue = null;
        switch (alarmInfo.alarmType) {
            case kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_BEFORE: // 알람 전
                remainedValue = '5';
                break;
            case kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AT_TIME: // 알람 정각
                remainedValue = (curTime.getHours() * 60) + curTime.getMinutes();
                break;
            case kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AFTER: // 알람 후
                remainedValue = (curTime.getHours() * 60) + curTime.getMinutes();
                break;
            case kidsConfigs.KIDS_WIDGET_ALARM_MODE.SEE_LIMIT_TIME:
                if (modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME) { // 시간
                    remainedValue = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME);
                } else if (modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT) { // 편수
                    remainedValue = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD);;
                } else if (modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME) { // 시간대
                    remainedValue = '5';
                }
                break;
            default:
                break;
        }
        alarmInfo.alarmRemaindTime = remainedValue;
        return alarmInfo;
    }

    setPropertyInfo = (widgetInfo, alarmInfo) => {
        clearInterval(KIDS_WIDGET_CUSTOM_TIMER_ID);
        console.log('%c[KIDS_WIDGET widgetInfo / alarmInfo] ===>', 'color:#0000ff ',widgetInfo, alarmInfo);

        let widgetOption = null;
        let eventIndex = null;

        // 검색, 전체메뉴 화면 인경우 위젯 노출 안함
        if(widgetInfo.isSearchView || widgetInfo.isAllMenuView) {
            clearInterval(KIDS_WIDGET_TIMER_ID);
            widgetInfo.isKidsMode = false;

            console.log('%c[검색, 전체메뉴] ===>', 'color:#0000ff ', widgetInfo);
            this.setWidgetInfo(widgetInfo, eventIndex);
            return;
        }

        if(isEmpty(alarmInfo.alarmType)) {
            // 1. 최초진입
            if(widgetInfo.isKidsVigin) {
                clearInterval(KIDS_WIDGET_TIMER_ID);
                eventIndex = '1';
                widgetOption = this.setInterationOption(widgetInfo); // GET 인터렉션 옵션

                switch (widgetInfo.modeType) {
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME: // 시간
                        widgetInfo.showCompt = (<DefaultWidget remainedTime={widgetInfo.remainedTime} onChangeFormatTime={this.formatMinuteAsTime} />)
                        break;

                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME: // 시간대
                        widgetInfo.showCompt = (<DefaultWidget remainedTime={widgetInfo.remainedTime} onChangeFormatTime={this.formatMinuteAsTime} />)
                        break;

                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT: // 편수
                        widgetInfo.showCompt = <EpisodeWidget remainedEpisode={widgetInfo.remainedEpisode} />
                        break;
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.BTV:
                        if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME && !this.checkCustomTimeZone(widgetInfo.remainedTimeSlot)) { 
                            widgetInfo.showCompt = <NoSettingWidget isSetting={widgetInfo.isKidsSetting} isNoTimeSetting={true} />
                        } else {
                            widgetInfo.showCompt = <NoSettingWidget isSetting={widgetInfo.isKidsSetting}/>
                        }    
                    break;
                    default:
                        break;
                }
                
                widgetInfo = update(widgetInfo, {
                    character: { $set: widgetOption.character },
                    guideTextA: { $set: widgetOption.guideTextA },
                    guideTextB: { $set: widgetOption.guideTextB },
                    motion: { $set: widgetOption.motion },
                    isAnimation: { $set: widgetOption.isAnimation },
                    isVoiceUse: { $set: widgetOption.isVoiceUse },
                    voiceFileName: { $set: widgetOption.voiceFileName }
                });

                console.log('%c[최초진입] ===>', 'color:#0000ff ', widgetInfo);
                this.setWidgetInfo(widgetInfo, eventIndex);
                return;
            }

            // 2. 홈 & 키즈 설정 Off
            if(!widgetInfo.isKidsVigin && widgetInfo.isKidsHome && !widgetInfo.isKidsSetting) {
                clearInterval(KIDS_WIDGET_TIMER_ID);
                if(this.isInitKidsHome) widgetOption = this.setInterationOption(widgetInfo);

                widgetInfo.showCompt = <NoSettingWidget isSetting={widgetInfo.isKidsSetting}/>

                if(this.isInitKidsHome) {
                    widgetInfo = update(widgetInfo, {
                        character: { $set: widgetOption.character },
                        guideTextA: { $set: widgetOption.guideTextA },
                        guideTextB: { $set: widgetOption.guideTextB },
                        motion: { $set: widgetOption.motion },
                        isAnimation: { $set: widgetOption.isAnimation },
                        isVoiceUse: { $set: widgetOption.isVoiceUse },
                        voiceFileName: { $set: widgetOption.voiceFileName }
                    });
                }

                console.log('%c[홈 & 키즈 설정 off] ===>', 'color:#0000ff ', widgetInfo);
                this.setWidgetInfo(widgetInfo, eventIndex);
                return;
            }

            // 3. 홈 & 상세 & 키즈 설정 On
            if(widgetInfo.isKidsSetting) {
                clearInterval(KIDS_WIDGET_TIMER_ID);
                eventIndex = '2';

                if(this.isInitKidsHome) widgetOption = this.setInterationOption(widgetInfo);

                // 3-1. 5분이하, 1편 이하 (이조건에는 보여주지 않음)
                if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME && Number(widgetInfo.remainedTime) > 5) {
                    widgetInfo.showCompt = (<DefaultWidget remainedTime={widgetInfo.remainedTime} onChangeFormatTime={this.formatMinuteAsTime} />)
                } else if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT && Number(widgetInfo.remainedEpisode) > 1) {
                    widgetInfo.showCompt = <EpisodeWidget remainedEpisode={widgetInfo.remainedEpisode} />
                } else if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME) {
                    const checkCustomTime = this.checkCustomTimeZone(widgetInfo.remainedTimeSlot);
                    if(checkCustomTime) {
                        widgetInfo.showCompt = (<DefaultWidget remainedTime={this.getRemainMinFromCustomTime(widgetInfo.remainedTimeSlot)} onChangeFormatTime={this.formatMinuteAsTime} />)
                    } else {
                        if(widgetInfo.isKidsHome) {
                            widgetInfo.showCompt = <NoSettingWidget isSetting={widgetInfo.isKidsSetting} isNoTimeSetting={true} />
                        } else {
                            widgetInfo.isKidsMode = false;
                        }
                        // 1분씩 setInterVal를 실행하다가 설정시간대로 진입 하는 경우
                        KIDS_WIDGET_CUSTOM_TIMER_ID = setInterval(() => {
                            let remainedValue = appConfig.runDevice && StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT_TIME_SET);
                            if(this.checkCustomTimeZone(remainedValue)) {
                                clearInterval(KIDS_WIDGET_CUSTOM_TIMER_ID);
                                this.show();
                            } 
                        }, TICK_DURATION_MILLIS);
                        // }, 1000);
                    }
                } 
            } else {
                eventIndex = null;
                widgetInfo.isKidsMode = false;
            }

            if(this.isInitKidsHome) {
                widgetInfo = update(widgetInfo, {
                    character: { $set: widgetOption.character },
                    guideTextA: { $set: widgetOption.guideTextA },
                    guideTextB: { $set: widgetOption.guideTextB },
                    motion: { $set: widgetOption.motion },
                    isAnimation: { $set: widgetOption.isAnimation },
                    isVoiceUse: { $set: widgetOption.isVoiceUse },
                    voiceFileName: { $set: widgetOption.voiceFileName }
                });
            }

            console.log('%c[홈 & 상세 & 키즈 설정 On] ===>', 'color:#0000ff ', widgetInfo);
            this.setWidgetInfo(widgetInfo, eventIndex);
            return;
        }
        
        // 4. 알림 이벤트
        if(!isEmpty(alarmInfo.alarmType)) {
            // 4-1. 시청만료 이벤트
            if(alarmInfo.alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.SEE_LIMIT_TIME) {
                clearInterval(KIDS_WIDGET_TIMER_ID);
                eventIndex = '3';
                widgetOption = this.setInterationOption(widgetInfo, alarmInfo); // GET 인터렉션 옵션
                if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME) {
                    widgetInfo.showCompt = (<DefaultWidget remainedTime={alarmInfo.alarmRemaindTime} onChangeFormatTime={this.formatMinuteAsTime} />)
                } else if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT) {
                    widgetInfo.showCompt = <EpisodeWidget remainedEpisode={alarmInfo.alarmRemaindTime} />
                } else if(widgetInfo.modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME) {
                    widgetInfo.showCompt = (<DefaultWidget remainedTime={alarmInfo.alarmRemaindTime} onChangeFormatTime={this.formatMinuteAsTime} />)
                }

                widgetInfo = update(widgetInfo, {
                    character: { $set: widgetOption.character },
                    guideTextA: { $set: widgetOption.guideTextA },
                    guideTextB: { $set: widgetOption.guideTextB },
                    motion: { $set: widgetOption.motion },
                    isAnimation: { $set: widgetOption.isAnimation },
                    isVoiceUse: { $set: widgetOption.isVoiceUse },
                    voiceFileName: { $set: widgetOption.voiceFileName }
                });

                console.log('%c[알림 이벤트 > 시청만료 이벤트] ===>', 'color:#0000ff ', widgetInfo);
                this.setWidgetInfo(widgetInfo, eventIndex);
                return;
            }
            // 4-2. 알림 이벤트
            if(alarmInfo.alarmType !== kidsConfigs.KIDS_WIDGET_ALARM_MODE.SEE_LIMIT_TIME) {
                if(alarmInfo.alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AFTER) this.setState({ alarmInfo });

                eventIndex = '4';
                widgetOption = this.setInterationOption(widgetInfo, alarmInfo); // GET 인터렉션 옵션
                widgetInfo.showCompt = (<DefaultWidget remainedTime={alarmInfo.alarmRemaindTime} alarmType={alarmInfo.alarmType} onChangeFormatTime={this.formatMinuteAsTime} />)
                
                widgetInfo = update(widgetInfo, {
                    character: { $set: widgetOption.character },
                    guideTextA: { $set: widgetOption.guideTextA },
                    guideTextB: { $set: widgetOption.guideTextB },
                    motion: { $set: widgetOption.motion },
                    isAnimation: { $set: widgetOption.isAnimation },
                    isVoiceUse: { $set: widgetOption.isVoiceUse },
                    voiceFileName: { $set: widgetOption.voiceFileName }
                });

                console.log('%c[알림 이벤트 > 알림 이벤트] ===>', 'color:#0000ff ', widgetInfo);
                this.setWidgetInfo(widgetInfo, eventIndex);
                return;
            }
        }
    }

    setInterationOption = (widgetInfo, alarmInfo = {}) => {
        let resultInfo = {
            character : null,
            guideTextA: null,
            guideTextB: null,
            motion: '',
            isAnimation: false,
            isVoiceUse: false,
            voiceFileName: null,
        }

        // 아이이름
        let userNameA = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_1);
        let userNameB = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_2);
        let userNameC = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_3);
        // userNameA = '은가';
        // userNameB = '은나';
        // userNameC = '은다';
        if(isEmpty(alarmInfo)) {
            // 최초 진입
            if (widgetInfo.isKidsVigin) {
                resultInfo.guideTextA = `${userNameA ? userNameA + ', ' : ''}${userNameB ? userNameB + ', ' : ''}${userNameC ? userNameC + ', ' : ''}친구야`;
                resultInfo.guideTextB = '오늘도 나랑 재밌게 놀자';
                switch (widgetInfo.modeType) {
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME: // 시간
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME: // 시간대
                        resultInfo.voiceFileName = '_03_widget_limit_time.mp3';
                        break;
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT: // 편수
                        resultInfo.voiceFileName = '_04_widget_limit_episode.mp3'; // 시청편수 안내
                        break;
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.BTV : // 미설정
                        resultInfo.guideTextA = '친구야 어서와~';
                        resultInfo.guideTextB = '한 번 볼 때 20분 이내,<br />하루2시간 이내로 보여주세요!';
                        resultInfo.voiceFileName = '_02_widget_welcome.mp3';
                        break;
                    default:
                        break;
                }
                resultInfo.character = widgetInfo.character;
                resultInfo.motion = 'balloonMotion';
                resultInfo.isAnimation = !this.state.widgetInfo.isAnimation;
                resultInfo.isVoiceUse = !this.state.widgetInfo.isVoiceUse;
            
            // Btv > 키즈 홈 진입
            } else if(widgetInfo.isKidsHome && this.isInitKidsHome) {
                resultInfo.character = widgetInfo.character;
                resultInfo.voiceFileName = '_01_guide_welcome.mp3';
                resultInfo.isVoiceUse = true;
            }

        } else {
            // 시청만료 이벤트
            if(alarmInfo.alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.SEE_LIMIT_TIME) {
                switch (widgetInfo.modeType) {
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME:
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME:
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT:
                        resultInfo.character = alarmInfo.alarmCharacter;
                        resultInfo.guideTextA = alarmInfo.alarmGuideTextA;
                        resultInfo.guideTextB = null;
                        resultInfo.motion = 'balloonMotion';
                        resultInfo.isAnimation = !this.state.widgetInfo.isAnimation;
                        resultInfo.isVoiceUse = !this.state.widgetInfo.isVoiceUse;
                        resultInfo.voiceFileName = '_08_widget_imminence.mp3';
                        break;
                    case kidsConfigs.KIDS_WIDGET_SETTING_MODE.BTV:
                        break;
                    default:
                        break;
                }
            }
            // 알림 이벤트
            if(alarmInfo.arlamType !== kidsConfigs.KIDS_WIDGET_ALARM_MODE.SEE_LIMIT_TIME) {
                resultInfo.character = alarmInfo.alarmCharacter;
                resultInfo.guideTextA = alarmInfo.alarmGuideTextA;
                resultInfo.guideTextB = null;
                resultInfo.motion = widgetInfo.isKidsHome || (!widgetInfo.isKidsHome && isEmpty(widgetInfo.showCompt))? 'scroll fullMotion' : 'balloonMotion';
                resultInfo.isAnimation = !this.state.widgetInfo.isAnimation;
                resultInfo.isVoiceUse = !this.state.widgetInfo.isVoiceUse;
                resultInfo.voiceFileName = this.getAlarmKindType(alarmInfo.alarmType, alarmInfo.alarmKindType); // 알람 종류 별 문구 (유치원,어린이집 가는 시간, 식사 시간, 휴식 시간, 잘 시간)
            }
        }

        resultInfo = update(widgetInfo, {
            character: { $set: resultInfo.character },
            guideTextA: { $set: resultInfo.guideTextA },
            guideTextB: { $set: resultInfo.guideTextB },
            motion: { $set: resultInfo.motion },
            isAnimation: { $set: resultInfo.isAnimation },
            isVoiceUse: { $set: resultInfo.isVoiceUse },
            voiceFileName: { $set: resultInfo.voiceFileName }
        })
        console.log('%c[setInterationOption] ===>', 'color:#0000ff ', resultInfo);
        return resultInfo;
    }

    show = (data = null, animation = null, kidsHomeState=null) => {
        console.log('[show] ', data);
        this.isInitKidsHome = !isEmpty(kidsHomeState) && kidsHomeState.state.historyInfo.isInitKidsHome;
        
        let widgetInfo = this.currentSTBInfo(); // 위젯 정보 저장
        let alarmInfo = !isEmpty(data) ? this.currentSTBAlarmInfo(data, widgetInfo.modeType) : { alarmType: null, alarmKindType: null, alarmRemaindTime: null, alarmCharacter: null, alarmGuideTextA: null } // 위젯 알림 정보 저장

        this.setPropertyInfo(widgetInfo, alarmInfo); // 위젯 및 알림 상황 별 모든 정보를 저장 (가장중요!)
    }

    hide = (animation = true) => {
        console.log('[KIDS_WIDGET HIDE] : ', this.state.widgetInfo, StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY));
        clearInterval(KIDS_WIDGET_TIMER_ID);
        clearInterval(KIDS_WIDGET_ALARM_AFTER_ID);
        this.setState({
            widgetInfo: update(this.state.widgetInfo, {
                isKidsMode: { $set: false }
            })
        });
    }

    /*********************************** Etc Methods ***********************************/
    setWidgetInfo = (info, eventNum = null) => {
        let tempWidgetInfo = this.state.widgetInfo;

        for (let prop in info) {
            tempWidgetInfo = update(info, {
                [prop]: { $set: info[prop] }
            })
        }
        this.setState({
            widgetInfo: tempWidgetInfo
        }, () => {
            // 1. 최초진입
            // 2. 일반 case 인터렉션
            // 3. 시청만료 이벤트
            // 4. 알림 이벤트

            if(eventNum === '1') { // [TODO] string 값 상수로 변경해야함
                // 3초 후 문구 변경 & 초기화
                setTimeout(() => {
                    this.setState({
                        widgetInfo: update(this.state.widgetInfo, {
                            guideTextA: { $set: info.guideTextB }
                        })
                    }, () => {
                        setTimeout(() => {
                            this.show();
                        }, KIDS_WIDGET_NO_ANIMATION - TEXT_TRANS_MILLIS);
                    });
                }, TEXT_TRANS_MILLIS);
            }

            if(eventNum === '2') {
                // 1. 1분 마다 setInterVal 남은 시간 변경, 시청만료 이벤트 호출 시 clearInterVal
                // 2. 10분이 되는 경우, 일반 case 인터렉션 발생
                // 3. 일반 case 인터렉션 발생 후 초기화
                // this.setRemaindTimeInteraction();
                if(!this.state.widgetInfo.isKidsMode) return;

                KIDS_WIDGET_TIMER_ID = setInterval(() => {
                    const { modeType } = this.state.widgetInfo;

                    if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME && Number(this.state.widgetInfo.remainedTime) === 6) {
                        TICK_INTER_MIN = 0;
                        clearInterval(KIDS_WIDGET_TIMER_ID);
                    } else if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT && Number(this.state.widgetInfo.remainedEpisode) === 1) {
                        TICK_INTER_MIN = 0;
                        clearInterval(KIDS_WIDGET_TIMER_ID);
                    } else if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME && Number(this.state.widgetInfo.remainedTime) === 6) {
                        TICK_INTER_MIN = 0;
                        clearInterval(KIDS_WIDGET_TIMER_ID);
                    }

                    if(TICK_INTER_MIN === EVERY_INTERACTION_MIN) this.setNormalCaseInteraction(modeType); // 일반 case 인터렉션 호출
                    TICK_INTER_MIN++;

                    let remainedValue = null;
                    if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME) {
                        remainedValue = appConfig.runDevice ? StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME) : this.state.widgetInfo.remainedTime - 1;
                        this.setState({
                            widgetInfo: update(this.state.widgetInfo, {
                                remainedTime: { $set: remainedValue },
                                showCompt: { $set: <DefaultWidget remainedTime={remainedValue} onChangeFormatTime={this.formatMinuteAsTime} /> }
                            })
                        });
                    } else if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.CUSTOM_TIME) {
                        remainedValue = appConfig.runDevice && StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT_TIME_SET);
                        this.setState({
                            widgetInfo: update(this.state.widgetInfo, {
                                remainedTimeSlot: { $set: remainedValue },
                                showCompt: { $set: <DefaultWidget remainedTime={this.getRemainMinFromCustomTime(remainedValue)} onChangeFormatTime={this.formatMinuteAsTime} /> }
                            })
                        });
                    }
                }, TICK_DURATION_MILLIS);
            }

            if(eventNum === '3') { // 시청만료 이벤트
                setTimeout(() => {
                    this.show();
                }, KIDS_WIDGET_NO_ANIMATION);
            }

            if(eventNum === '4') { // 알림 이벤트,
                const { alarmInfo } = this.state;
                console.log('[alarmInfo] : ', alarmInfo);
                setTimeout(() => { this.show() }, KIDS_WIDGET_NO_ANIMATION);
                
                if(alarmInfo.alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AFTER) {
                    clearInterval(KIDS_WIDGET_ALARM_AFTER_ID);

                    if(TICK_ALARM_AFTER_INTER_COUNT === ALARM_AFTER_INTERACTION_COUNT) {
                        TICK_ALARM_AFTER_INTER_COUNT = 0;
                        return;
                    }

                    KIDS_WIDGET_ALARM_AFTER_ID = setInterval(() => {
                        console.log('[KIDS_WIDGET_ALARM_AFTER_ID] : ', KIDS_WIDGET_ALARM_AFTER_ID);
                        TICK_ALARM_AFTER_INTER_MIN++;
    
                        if (TICK_ALARM_AFTER_INTER_MIN === ALARM_AFTER_INTERACTION_MIN) {
                            TICK_ALARM_AFTER_INTER_COUNT++;
                            TICK_ALARM_AFTER_INTER_MIN = 0;
                            this.show({
                                alarmType: alarmInfo.alarmKindType,
                                type: alarmInfo.alarmType,
                                text: alarmInfo.alarmGuideTextA,
                                character: alarmInfo.alarmCharacter
                            });
                        }
                    }, TICK_DURATION_MILLIS);
                    // }, 3000);
                } 
            }
        });
    }

    /**
     * 일반 case 인터렉션
     * (시청시간/편수/시간대 많이 남은 경우)
     *  10분 마다 캐릭터 등장
     *  캐릭터 인터렉션 후 위젯 상태 원래대로 돌아감.
     *  단, 시청종료 case에서는 발생하지 않음
     *      - 실시간 채널, VOD 재생 중에는 인터렉션 발생하지 않음
     */
    setNormalCaseInteraction = (modeType) => {
        const { widgetInfo } = this.state;
        let showInteraction = false;
        if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME) {
            if(Number(widgetInfo.remainedTime) >= 5) {
                showInteraction = true; // [시간] 조건 : 5분 초과
            }
            
        } else if(modeType === kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT) { 
            if(Number(widgetInfo.remainedEpisode) > 1) {
                showInteraction = true; // [편수] 조건 : 편수 1편 초과
            }
                
        } else { // [시간대] 조건 : 무조건
            showInteraction = true;
        }

        if(showInteraction) { // 조건 만족 시 일반 case 인터렉션 발생
            TICK_INTER_MIN = 0;
        
            this.setState({
                widgetInfo: update(widgetInfo, {
                    character: {$set: appConfig.runDevice ? StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER) : 'pororo'},
                    motion: { $set: 'characterMotion' },
                    isAnimation: { $set: true },
                    isVoiceUse: { $set: false },
                    voiceFileName: { $set : null }
                })
            }, () => {
                setTimeout(() => {
                    this.setState({ // 일반 case 인터렉션 제거
                        widgetInfo: update(this.state.widgetInfo, {
                            motion: { $set: '' },
                            isAnimation: { $set: false }
                        })
                    })
                }, 3000);
            });
        }
    }

    /**
     * 위젯 알람 종류별 문구 타입 지정
     */
    getAlarmKindType = (alarmType, alarmKindType) => {
        let fileName = '';

        if (alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AFTER) { // 알림 5분 후
            switch (alarmKindType) {
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.KINDERGARTEN: // 유치원, 어린이집 가는 시간
                    fileName = '_11-1_widget_alarm_kindergarten.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.MEAL: // 식사 시간
                    fileName = '_11-1_widget_alarm_meal.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.REST: // 휴식 시간
                    fileName = '_11-1_widget_alarm_rest.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.SLEEP: // 자는 시간
                    fileName = '_11-1_widget_alarm_sleep.mp3';
                    break;
                default:
                    break;
            }
        } else {  // 알림 5분 전, 알림 정각
            switch (alarmKindType) {
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.KINDERGARTEN: // 유치원, 어린이집 가는 시간
                    fileName = '_12-1_widget_post-alarm_kindergarten.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.MEAL: // 식사 시간
                    fileName = '_12-2_widget_post-alarm_meal.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.REST: // 휴식 시간
                    fileName = '_12-3_widget_post-alarm_rest.mp3';
                    break;
                case kidsConfigs.KIDS_WIDGET_ALARM_KIND_TYPE.SLEEP: // 자는 시간
                    fileName = '_12-4_widget_post-alarm_sleep.mp3';
                    break;
                default:
                    break;
            }
        }
        return fileName;
    }

    /**
	 * 표시할 시간 변환 : 분 -> 00:40 or 00시 40분
	 * min : 변환할 분 ex) 150
	 * type : 'kr' => 00시 40분
	 */
    formatMinuteAsTime = (min, type) => {
        let formatTimeStr = '';
        let remainMin = 0;
        if (min !== undefined && min !== null) {
            let hour = Math.floor(Number(min) / 60);
            if (hour >= 1) {
                remainMin = min - (hour * 60);
                remainMin = Number(remainMin) >= 10 ? remainMin : '0' + remainMin;

                formatTimeStr = hour < 10 ? '0' + hour : hour;

                if (type === 'kr') formatTimeStr += '시 ' + remainMin + '분';
                else formatTimeStr += ':' + remainMin;
            } else {
                if (type === 'kr') formatTimeStr = min + '분';
                else formatTimeStr = Number(min) >= 10 ? '00:' + min : '00:0' + min;
            }
        }
        return formatTimeStr;
    }

    /**
	 * 시간대 설정시, 현재 진입시간이 설정 시간대인지 체크
	 */
    checkCustomTimeZone = (timeSet) => {
        let isTimeZone = false;
        if (timeSet && timeSet.indexOf(',') > -1) {
            let startHour = timeSet.split(',')[0];
            let startMin = timeSet.split(',')[1];
            let endHour = timeSet.split(',')[2];
            let endMin = timeSet.split(',')[3];

            let d = new Date();
            let startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startHour, startMin);
            let endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHour, endMin);

            if (d >= startDate && d <= endDate) {
                console.log('>> 설정한 시간대 : success');
                isTimeZone = true;
            } else {
                console.log('>> 설정한 시간대 : failure');
            }
        }
        return isTimeZone;
    }

    /**
	 * 시간대 설정으로 부터 남은시간(분) 구하기
	 */
    getRemainMinFromCustomTime = (timeSet) => {
        let timeLeft = 0;

        if (timeSet && timeSet.indexOf(',') > -1) {
            let endHour = timeSet.split(',')[2];
            let endMin = timeSet.split(',')[3];
            endHour = endHour ? Number(endHour) : 0;
            endMin = endMin ? Number(endMin) : 0;

            let d = new Date();
            let nowDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
            let endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endHour, endMin);

            timeLeft = Math.floor(((endDate - nowDate) / 1000) / 60);
        }
        return timeLeft;
    }

    checkRemaindTimeAndEpisode = (bShow) => {
        const { widgetInfo } = this.state;
        if (bShow) {
            switch (widgetInfo.modeType) {
                case kidsConfigs.KIDS_WIDGET_SETTING_MODE.TIME:
                    if (Number(widgetInfo.remainedTime) <= 5) {
                        bShow = false;
                    }
                    break;
                case kidsConfigs.KIDS_WIDGET_SETTING_MODE.VOD_COUNT:
                    if (Number(widgetInfo.remainedEpisode) <= 1) {
                        bShow = false;
                    }
                    break;
                default:
                    break;
            }
        }
        return bShow;
    }

    /*********************************** Render ***********************************/
    render() {
        const {
            isKidsMode,
            isKidsHome,
            character,
            isVoiceUse,
            voiceFileName,
            motion,
            isAnimation,
            remainedEpisode,
            guideTextA,
            showCompt

        } = this.state.widgetInfo;

        let bShow = false;
        if(isKidsMode) {
            bShow = true;

            if(isVoiceUse) {
                setTimeout(() => {
                    const chrtrSoundYn = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE) === '1'; 
                    if(chrtrSoundYn) StbInterface.playKidszoneGuide(character + voiceFileName);
                }, 300);
            }
        } else {
            bShow = false;
        }

        const showWidget = (
            <div className={`kidsWidget ${isKidsHome ? '' : 'subCharacter'} ${!isEmpty(motion) ? motion : ''} ${isAnimation ? "" : "aniNone"}`}>
                {
                    !isEmpty(remainedEpisode) ?
                        <img src={`${appConfig.headEnd.LOCAL_URL}/kids/widget/img-kids-widget-blue-l.png`} alt="편수제한 bg" />
                        :
                        <img src={`${appConfig.headEnd.LOCAL_URL}/kids/widget/img-kids-widget-yell-l.png`} alt="시간제한 bg" />
                }

                <div className="widgetMotion">
                    <div className="balloon">
                        <img src={`${appConfig.headEnd.LOCAL_URL}/kids/widget/img-kids-widget-bubble-${character}.png`} alt="" />

                        <span className="balloonText" dangerouslySetInnerHTML={createMarkup(guideTextA)}></span>
                    </div>
                    <img src={`${appConfig.headEnd.LOCAL_URL}/kids/widget/img-kids-widget-character-${character}.png`} alt="" />
                </div>
                {showCompt}
            </div>
        );
        const blankWidget = (<div></div>);

        console.log('%c[WIDGET render widgetInfo] ===>', 'color:#0000ff ', bShow, this.state.widgetInfo);

        return (
            bShow ? showWidget : blankWidget
        )
    }
}

// 위젯 종류 정의
// type: [DefaultWidget, EpisodeWidget, NoSettingWidget, EndWidget]
const DefaultWidget = (props) => {
    // console.log('%c[WIDGET DefaultWidget] ===>', 'color:#0000ff ', props);
    return (
        <div className="widgetText time">
            <div className="textCon">
                <span>남은시간</span>
                <div style={(!isEmpty(props.alarmType) && props.alarmType === kidsConfigs.KIDS_WIDGET_ALARM_MODE.ALARM_AFTER) ? {color: '#ea2623'} : {}}>
                    {props.onChangeFormatTime(props.remainedTime)}
                </div>
            </div>
        </div>
    )
}

const EpisodeWidget = (props) => {
    // console.log('%c[WIDGET EpisodeWidget] ===>', 'color:#0000ff ', props);
    return (
        <div className="widgetText episode">
            <div className="textCon"><span>남은편수</span>{props.remainedEpisode}</div>
        </div>
    )
}

const NoSettingWidget = (props) => {
    // console.log('%c[WIDGET NoSettingWidget] ===>', 'color:#0000ff ', props);
    const noSettingView = (
        <div className="widgetText">
            <span>시청제한이<br />없어요.</span>
        </div>
    )
    const noTimeSlotView = (
        <div className={`widgetText${props.isNoTimeSetting ? ' fontType2' : ''}`}>
            <span>설정한 시간대가<br />아니에요.</span>
        </div>
    )

    return (
        !props.isSetting ? noSettingView : noTimeSlotView
    )
}

const EndWidget = (props) => {
    // console.log('%c[WIDGET EndWidget] ===>', 'color:#0000ff ', props);
    return (
        props.isSetting ?
            !isEmpty(props.remainedEpisode) ?
                <div className="widgetText episode">
                    <div className="textCon"><span>남은편수</span>{props.remainedEpisode}</div>
                </div>
                :
                !isEmpty(props.remainedTime) &&
                <div className="widgetText time">
                    <div className={Number(props.remainedTime) <= 300 ? "textCon red" : "textCon"}>
                        <span>남은시간</span>
                        {props.onChangeFormatTime(props.remainedTime)}
                    </div>
                </div>
            :
            !isEmpty(props.remainedTime) ?
                <div className="widgetText time">
                    <div className={Number(props.remainedTime) <= 300 ? "textCon red" : "textCon"}>
                        <span>남은시간</span>
                        {props.onChangeFormatTime(props.remainedTime)}
                    </div>
                </div>
                :
                <div className="widgetText">
                    <span>시청제한이<br />없어요</span>
                </div>
    )
}