// commons
import React, { Fragment } from 'react';
import FM from 'Supporters/navi';
import PageView from 'Supporters/PageView';
import appConfig from 'Config/app-config';
import keyCodes from 'Supporters/keyCodes';
import { Core } from 'Supporters';
import StbInterface from 'Supporters/stbInterface';
import { CTSInfo } from 'Supporters/CTSInfo';
import constants, { STB_PROP, CERT_TYPE } from 'Config/constants';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/purchase/PurchaseGeneralList.css';

// util
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import Utils, { deepCopy, capitalize } from 'Util/utils';

// network
import { MeTV } from 'Network';

// component
import PurchaseGeneralSlide from './components/PurchaseGeneralSlide';
import AdultCertification from '../../../popup/AdultCertification';
import DisableButton from './components/PLReadingDisableButton';
import OksusuConnectButton from './components/OksusuConnectButton';
import { TabMenu, BackgroundImage, OksusuSettingGuide, GuideDescription } from './components/Parts';

// 일반VOD 리스트 중 "패키지", "VOD관련상품" 상품정보 페이지 테스트 용
// import generalVODDummy from '../testData/generalVOD.json';

const { SYNOPSIS_VODPRODUCT, SYNOPSIS, SYNOPSIS_GATEWAY, MYBTV_PURCHASE_PACKAGE, MYBTV_PURCHASE_COMMERCE, MYBTV_MYVOD_DETAIL, MYBTV_MYVOD_SEASON_DETAIL } = constants;

const { Keymap: { ENTER } } = keyCodes;

let focusOpts = {
    tab: {
        id : 'tab',
        moveSelector : '.tabStyle > li',
        focusSelector : '.csFocus',
        row : 1,
        col : 4,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 3
    },
    slide: {
        id : 'slide',
        moveSelector : '.slideCon .slideWrapper',
        focusSelector : '.csFocus',
        row : 1,
        col : 10,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 9,
        bRowRolling: false,
    },
    button: {
        id : 'button',
        moveSelector : '.bottomLeft',
        focusSelector : '.csFocus',
        row : 1,
        col : 1,
        focusIdx : 0,
        startIdx : 0,
        lastIdx : 0,
    }
}

class PurchaseList extends PageView {

    defaultData = [
        {
            pageType: 'PurchaseGeneralList',
            pageTitle: '구매내역 - 일반',
            defaultSub : '일반 VOD 구매내역은 구매일로부터 90일까지만 제공해 드립니다.',
            noneText: '일반 VOD 구매내역이 없습니다.',
            defaultInfo: '',
        }, {
            pageType: 'PurchaseGeneralList',
            pageTitle: '구매내역 - vod',
            defaultInfo: '소장용 VOD 구매내역은 B tv 서비스 해지 전까지 제공해 드립니다.',
            defaultSub: '소장용 VOD 구매내역에 365일 시청 VOD도 포함되어 있습니다.',
            noneText: '소장용 VOD 구매내역이 없습니다.',
        }, {
            pageType: 'PurchaseMonthlyList',
	        pageTitle: '구매내역 - 월정액',
            caution: '쿠폰이나 T멤버십을 이용해 월정액을 가입하신 경우 청구서/홈페이지를 통해 상세 할인 내역을 확인해 주세요.',
	        defaultInfo: '월정액 구매내역은 전월 1일부터 당일까지의 내역을 제공하고 있습니다.',
            defaultSub: '일부 월정액의 경우 가입 첫 달에만 T멤버십 50% 할인 혜택이 적용됩니다.\n(교육장르, 성인장르, 부가서비스 상품 및 일부 제휴 월정액 상품은 할인 대상에서 제외)',
            noneText: '월정액 구매내역이 없습니다.',
        }, {
            pageType: 'PurchaseOksusuList',
	        pageTitle: '구매내역 - oksusu',
            defaultInfo: 'oksusu 구매내역은 구매일로부터 90일까지만 제공해 드립니다.',
            defaultSub: '셋톱박스와 연결된 1개의 oksusu 계정으로만 콘텐츠 시청이 가능하며, 연결된 oksusu 계정을 해제 후 다른 계정으로 재연결 시\n기존 계정의 ‘oksusu 구매내역 열람’ 및 ‘B tv소장용 VOD 영구 시청 권한 동의’ 설정값은 자동 초기화됩니다.\n(연결중인 스마트 기기가 교체된 경우 셋톱박스와 oksusu를 다시 연결해 주세요.)',
            noneText: 'oksusu 구매내역이 없습니다.',
        }
    ]

    items = 6; // 한 화면의 슬라이드 개수
    slidePageToFirst = false;
    nextCallIndex = 8;
    pagingIndex = 10;
    ADULT_MOVIE_MENU = StbInterface.getProperty(STB_PROP.ADULT_MOVIE_MENU);            //19영화 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
    EROS_MENU = StbInterface.getProperty(STB_PROP.EROS_MENU);                          //19플러스 ( 0: 청소년 보호, 1: 메뉴표시, 2: 메뉴숨김 )
    CHILDREN_SEE_LIMIT = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);        //등급제한 	시청연령제한 (0, 7, 12, 15, )

	constructor(props) {
		super(props);
        
		this.state = isEmpty(this.historyData) ? {
			slideItem: [],
            
            // default
            pageType: '',
            pageTitle: '',
            defaultInfo: '',
            defaultSub: '',
            oksusuConnect: '',
	        autoUse: false,

            // tab
            tabMenu: ['일반 VOD', '소장용 VOD', '월정액', 'oksusu'],
            activeTab : 0,

            // slide
            curFocus: null,
            slideCurIdx: 0,
            slideTo: 0,
            activeSlide: false,
            headEndCallYN: [false, false, false, false],
            slideType: 'general',                           // general(일반), possesion(소장용), monthly(월정액), oksusu(nscreen)

            // slide total length
            generalLength: 0,
            possesionLength: 0,
            monthlyLength: 0,
            oksusuLength: 0,

            // caching data
            slideItemGeneral: [],
            slideItemPossesion: [],
            slideItemMonthly: [],
            slideItemOksusu: [],

            // focus
            listIdx: 0,
            itemIdx: 0,
        } : this.historyData;

        this.defaultFM = {
            tab: new FM({
                ...focusOpts.tab,
                onFocusChild: this.onTabFocus,
                onFocusContainer: this.onTabFocusContainer,
            }),
            slide: new FM({
                ...focusOpts.slide,
                onFocusChild: this.onSlideItemFocus,
                onFocusContainer: this.onSlideFocus,
                onFocusKeyDown: this.onSlideItemKeyDown,
                onBlurContainer: this.onSlideBlur,
            }),
            button: new FM({
                ...focusOpts.button,
                onFocusChild: this.onBtnFocusChild,
                onFocusKeyDown: this.onBtnKeyDown,
                onFocusContainer: this.onBtnFocusContainer,
            })
        }

        const focusList = [
			{ key: 'tab', fm: null, link: { RIGHT: 'disableButton' } },
			{ key: 'slide', fm: null },
            { key: 'button', fm: null },
            { key: 'disableButton', fm: null, link: { LEFT: 'tab' } }
		];
		this.declareFocusList(focusList);
    }

    webShowNoti = () => {
        this.getDeviceInfo();
    }

    // 포커스 초기화, 세팅
    initFocus = flag => {
        const { tab, slide, button  } = this.defaultFM;
        const { slideType } = this.state;

        const type = { 'general': 0, 'possesion': 1, 'monthly': 2, 'oksusu': 3 };

        tab.setListInfo({ focusIdx: type[slideType] });
        this.setFm('tab', tab);
        this.setFm('slide', slide);
        this.setFm('button', button);
        if ( !flag ) this.setFocus('tab', 0);
    }

    // 포커스 복구
    restoreFocus = () => {
        const { listIdx, itemIdx, slideItem } = this.state;
        const { slide } = this.defaultFM;

        slide.setListInfo({
            col: slideItem.length,
            lastIdx: slideItem.length -1
        });

        this.initFocus(true);
        this.setFocus(listIdx, itemIdx);
    }

    vodPlay = info => {
        const {
            fromCommerce = 'N', seeingPath = '99', playOption = 'normal', playType = 'default', search_type = '2',
            cnr_id = '', groupId = '', startTime = '',
            epsd_id, epsd_rslu_id
        } = info;
        const playInfo = {
            fromCommerce, seeingPath, playOption, playType,
            search_type, cnr_id, groupId, startTime, epsd_id, epsd_rslu_id,
        };
        CTSInfo.prepareVOD(playInfo);
    }

    // 버튼 container에 포커스가 올 때
    onBtnFocusContainer = () => {
        this.setState({ listIdx: 'button' });
    }

    // 버튼 item 한개에 포커스가 올 때
    onBtnFocusChild = (idx) => {
        this.setState({ itemIdx: idx });
    }

    // 버튼 ENTER시 action (여기서 버튼의 index 번호는 필요가 없음)
    onBtnKeyDown = (evt, focusIdx) => {
        if ( evt.keyCode !== ENTER ) return ;

        const { slideItem, slideCurIdx, slideType } = this.state;
        const {
            period, prod_type_cd, sris_id, prod_id, epsd_id, epsd_rslu_id,
            prod_code, subs_id, method_pay_code, itemTitleFull, selling_price, yn_mchdse,
            amt_price
        } = slideItem[slideCurIdx];
        const { mac, stbId } = appConfig.STBInfo;

        if ( slideType === 'general' || slideType === 'possesion' || slideType === 'oksusu' ) { // 일반VOD 또는 소장용 VOD

            if ( yn_mchdse === 'N' || isUndefined(yn_mchdse) ) {

                if ( (Number(period) > -1 || period === '') &&
                    (prod_type_cd === '10' || prod_type_cd === '20' || prod_type_cd === '110' || prod_type_cd === '120') ) {

                    // 바로재생
                    const playInfo = { epsd_id, epsd_rslu_id, };
                    this.vodPlay(playInfo);
    
                } else if ( period === '-1' ) {
                    // 재구매
                    let purchaseData = {
                        //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
                        synopsis_type: (() => {
                            if ( prod_type_cd === '10' || prod_type_cd === '110' ) return '01'; // 단편
                            else if ( prod_type_cd === '20' || prod_type_cd === '120' ) return '02'; // 시즌
                        })(),
                        sris_id,
                        epsd_id,
                        prd_prc_id: prod_id,
                        prod_type_cd,
                    };

                    const purchaseCallback = () => {
                        //재구매 팝업
                    };
                    CTSInfo.purchaseContentOthers(purchaseData, purchaseCallback);
    
                } else if ( prod_type_cd === '41' ) {
    
                    // 패키지형(GW)
                    this.movePage(MYBTV_PURCHASE_PACKAGE, { srisId: sris_id,  epsdId: epsd_id });

                }

            } else if ( yn_mchdse === 'Y' ) {
                // 커머스형(VOD관련 상품)
                this.movePage(MYBTV_PURCHASE_COMMERCE, { srisId: sris_id,  epsdId: epsd_id });
            }

        } else if ( slideType === 'monthly' ) { // 월정액
            if (amt_price !== '해지') {               // 가입해지
                // 월정액 해지 웹브라우저 URL 가이드
                // https://confluence.skbroadband.com/pages/viewpage.action?pageId=26786886
                StbInterface.openPopup(
                    'url',
                    Utils.getPPMCancelUrl() + '?' +
                    [`stb_id=${encodeURIComponent(stbId)}`,
                    `mac_address=${encodeURIComponent(mac)}`,
                    `pid=${prod_id}`,
                    `prod_code=${prod_code}`,
                    `subs_id=${subs_id}`,
                    `price=${encodeURIComponent(selling_price)}`,
                    `period=${encodeURIComponent(period)}`,
                    `method_pay_cd=${method_pay_code}`,
                    `title=${encodeURIComponent(itemTitleFull)}`].join('&')
                );
            } else {        // 재가입(Y)
                const arrEndDate = (slideItem[slideCurIdx].end_date).split('.');
                const endDate = new Date(arrEndDate[0], arrEndDate[1] - 1, arrEndDate[2]).getTime();
                const curDate = new Date().getTime();
                if (curDate < endDate) {
                    // [BTVQ-1726] 해지된 월정액이어도, 이용기간이 남은 경우는 Toast팝업만 발생한다. (시나리오)
                    Core.inst().showToast('이용기간이 남은 월정액 상품입니다. 이용기간 이후 재가입 해주세요.');
                } else {
                    CTSInfo.purchasePPMByHome({ pid: prod_id }, () => {});
                }
            }
        }
    }

    // 가입해지 웹뷰에서 앱으로 전달된 데이터를 전달 받는다. ( IF-STV-V5-412 )
    onPPMCancelNoti = (arg) => {
        this.monthlyListCall(true);
        this.setState({
            itemIdx: 2,
            slideType: 'monthly'
        });
    }

    // tab container에 포커스가 올 때
    onTabFocusContainer = () => {
        this.setState({ listIdx: 'tab' });
    }

    // 탭에 포커스 될 때
    onTabFocus = idx => {
        const { headEndCallYN, oksusuConnect, autoUse } = this.state;
        const headEndCall = [
            this.generalListCall,
            this.possesionListCall,
            this.monthlyListCall,
            this.oksusuListCall,
        ];
        const slideType = ['general', 'possesion', 'monthly', 'oksusu'] ;
        
        headEndCall[idx]();

        this.setState({
            itemIdx: idx,
            slideType: slideType[idx],
            noneText: this.defaultData[idx].noneText
        });
    }

    // 시놉시스로 이동
    toSynopsis = (param) => {
        let path = {
            '10': SYNOPSIS,             // 단편
            '20': SYNOPSIS,             // 시즌
            '110': SYNOPSIS,
            '120': SYNOPSIS,
            '41': SYNOPSIS_GATEWAY,     // GW시놉(패키지 형)
            '04': SYNOPSIS_VODPRODUCT,  // VOD관련상품 시놉 (커머스형)
        };
        const { sris_id, epsd_id, adult } = param;
        const synopParam = { sris_id, epsd_id, adult };
        let settingAge = !appConfig.runDevice ? appConfig.STBInfo.level : StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);

        if ( param.adult === 'Y' && Number(param.level) >= 19 && settingAge !== '0') {
            Core.inst().showPopup(<AdultCertification />, {
                certification_type: CERT_TYPE.ADULT_SELECT,
                age_type: ''
            }, res => {
                if ( res.result === '0000' ) {
                    synopParam.adult_flag = res.adult_flag;
                    this.movePage(path[param.prod_type_cd], synopParam);
                }
            });
        } else {
            Utils.movePageAfterCheckLevel(path[param.prod_type_cd], synopParam, param.level);
        }

    }

    toPossesionSynopsis = (data) => {
        const { epsd_id, sris_id, prod_type_cd, prod_id } = data;
        const path = { '10': MYBTV_MYVOD_DETAIL, '20': MYBTV_MYVOD_SEASON_DETAIL };
        this.movePage(`${path[prod_type_cd]}/${epsd_id}/${sris_id}/${prod_id}`);
    }

    // slide 아이템 하나에 keyDown 될 때
    onSlideItemKeyDown = (evt, idx) => {
        const { slideItem, slideType } = this.state;
        const targetItem = slideItem[idx];

        if ( evt.keyCode === ENTER ) {
            if ( targetItem ) {
                if ( slideType === 'monthly' ) {
                    // 월정액은 처리 안함
                } else if ( slideType === 'possesion' ) {
                    this.toPossesionSynopsis(targetItem);
                } else {
                    this.toSynopsis(targetItem);
                }
            }
        }
    }

    // slide 아이템 하나에 포커스 될 때
    onSlideItemFocus = (idx) => {
        const { slideItem, slideTo, slideCurIdx } = this.state;

		let to = slideTo;
		let slideItemLength = slideItem.length;

		if ( Math.abs(slideCurIdx - idx) > 1 && slideItemLength >= this.items ) {
			if ( slideCurIdx > idx ) {
				to = 0;
			} else if ( slideCurIdx < idx ) {
				to = slideItemLength - this.items;
			}
		} else {

			if ( slideCurIdx < idx ) {		// RIGHT
				
				if ( idx === this.items + to -1 ) {
					to += 1;
					if( to + this.items > slideItemLength - 1){
						to = slideItemLength - this.items;
					}
				}
	
			} else if ( slideCurIdx > idx ) {	// LEFT

				if ( idx === to ) {
					to -= 1;
					if ( to <= 0 ) to = 0;
				}

			}
        }

        this.setState({
            slideTo: to,
            slideCurIdx: idx,
            itemIdx: idx
        });

        this.nextPageCall();
    }

    // slide 컨테이너에 포커스 될 때
    onSlideFocus = (dir) => {
        this.setState({ listIdx: 'slide', activeSlide: true, });
    }

    // slide 컨테이너에 포커스가 나갔을 때
    onSlideBlur = direction => {
		if ( direction === 'UP' ) {
			this.setState({
				activeSlide: false,
			});
		} else if ( direction === 'DOWN' ) {

		}
    }

    // 다음 페이지 호출
    nextPageCall = () => {
        const { slideType, slideCurIdx } = this.state;
        const idx = slideCurIdx + 1;
        const curPage = Math.ceil( idx / this.pagingIndex );
        let slideInfo = {
            totalPage: Math.ceil( this.state[`${slideType}Length`] / this.pagingIndex ),
            listCallFunc: this[`${slideType}ListCall`]
        };

        if ( (idx % this.pagingIndex) === this.nextCallIndex && curPage < slideInfo.totalPage ) {
            slideInfo.listCallFunc();
        }
    }

    // page_no 계산
    calculateNextPageNo = (slideType) => {
        let cacheState = this.state[`slideItem${capitalize(slideType)}`];
        return Math.ceil( cacheState.length / this.pagingIndex ) + 1;
    }

    initSlideTo = type => {
        const { slideType } = this.state;
        // state 초기화
        if ( slideType !== type ) {
            this.setState({
                slideTo: 0,
                slideCurIdx: 0,
                slideItem: [],
            });
            this.defaultFM.slide.setListInfo({focusIdx: 0});
        }
    }

    // slide의 총 페이지 수를 반환
    getTotalPage = slideType => {
        return Math.ceil(this.state[`${slideType}Length`] / this.pagingIndex );
    }
    
    // data 를 state에 저장하고 포커스 재설정
    saveData = (items, idx, slideType) => {
        const { slideType: slideTypeState, oksusuConnect, autoUse } = this.state;
        let defaultData = this.defaultData[idx];
        let state = { activeTab: idx, slideItem: items, ...defaultData };       // state 만들기
        let fm = { slide: null, button: null };
        let cacheStates = ['slideItemGeneral', 'slideItemPossesion', 'slideItemMonthly', 'slideItemOksusu'];
        
        // OKSUSU 연동 시 설정이 안되어있는 경우
        if ( slideType === 'oksusu' ) {
            state = {
                ...deepCopy(state),
                pageType: Number(oksusuConnect) > 0 ? 'PurchaseOksusuList' : 'PurchaseOksusuUnConnect' // OKSUSU 연동 설정 여부에 따른 pageType
            };
        }

        state = { ...deepCopy(state), [cacheStates[idx]]: items, slideType };
        

        // 포커스 data setting
        let setListInfoData = {
            col: items.length,
            lastIdx: items.length -1,
        };

        // 현재 slide와 이동 한 slide 가 다르면 focusIdx를 처음으로 초기화
        if ( slideTypeState !== slideType ) {
            setListInfoData = { ...setListInfoData, focusIdx: 0, };
        }

        // slideItem이 있을 때 
        if ( !isEmpty(items) ) {
            this.defaultFM.slide.setListInfo(setListInfoData);
            fm.slide = this.defaultFM.slide;
            fm.button = this.defaultFM.button;
        }

        this.setState(state, () => {
            if ( slideType === 'oksusu' ) {
                if ( !(Number(oksusuConnect) > 0) ) {
                } else if ( !(Number(autoUse) > 0) ) {
                } else {
                    this.setFm('slide', fm.slide);    
                }
            } else {
                this.setFm('slide', fm.slide);
            }
            this.setFm('button', fm.button);
        });
    }

    // 일반 구매내역 조회
    generalListCall = async () => {
        const { slideItemGeneral } = this.state;
        const listIdx = 0;
        const slideType = 'general';
        const nextPageNo = this.calculateNextPageNo(slideType);     // 다음 페이지
        const totalPage = this.getTotalPage(slideType);
        let slideItem = [];
        this.items = 6;

        this.initSlideTo(slideType);

        // 캐싱 데이터 있으면 다시 조회 안함.
        if ( !isEmpty(slideItemGeneral) && totalPage !== 0 && nextPageNo > totalPage ) {
            slideItem = slideItemGeneral;
            this.saveData(slideItem, listIdx, slideType);
            return ;
        }
        
        // 다음에 호출될  page_no 가 총 page_no 보다 크면 더이상 호출 하지 않음
        if ( totalPage !== 0 && nextPageNo > totalPage ){ 
            return ;
        }

        const MeTV_031 = await MeTV.request031({ page_no: `${nextPageNo}` });

        console.log('%c 031 일반 구매내역 조회', 'color: red', MeTV_031);
        if ( MeTV_031.reason === 'Success' && MeTV_031.result === '0000' ) {
            const { purchaseList, purchase_tot } = MeTV_031;

            slideItem = !purchaseList ? [] : slideItemGeneral.concat(purchaseList);

            this.setState({ generalLength: Number(purchase_tot) });
            this.saveData(slideItem, listIdx, slideType);
        } else {
            this.saveData(slideItem, listIdx, slideType);
        }
    }

    // 소장용 VOD 구매내역 조회
    possesionListCall = async () => {
        const { slideItemPossesion } = this.state;
        const listIdx = 1;
        const slideType = 'possesion';
        const nextPageNo = this.calculateNextPageNo(slideType);     // 다음 페이지
        const totalPage = this.getTotalPage(slideType);
        let slideItem = [];
        this.items = 6;

        this.initSlideTo(slideType);

        // 캐싱 데이터 있으면 다시 조회 안함.
        if ( !isEmpty(slideItemPossesion) && totalPage !== 0 && nextPageNo > totalPage ) {
            slideItem = slideItemPossesion;
            this.saveData(slideItem, listIdx, slideType);
            return ;
        }

        // 다음에 호출될  page_no 가 총 page_no 보다 크면 더이상 호출 하지 않음
        if ( totalPage !== 0 && nextPageNo > totalPage ){ 
            return ;
        }

        const MeTV_032 = await MeTV.request032({ page_no: `${nextPageNo}` });

        // 035 365/소장용 VOD 조회
        if ( MeTV_032.reason === 'Success' && MeTV_032.result === '0000' ) {
            const { purchaseList, purchase_tot } = MeTV_032;
            
            slideItem = !purchaseList ? [] : slideItemPossesion.concat(purchaseList);;

            this.setState({ possesionLength: Number(purchase_tot) });
            this.saveData(slideItem, listIdx, slideType);
        } else {
            this.saveData(slideItem, listIdx, slideType);
        }
    }

    // 월정액 구매내역 조회
    monthlyListCall = async (isCacheDisable) => {
        const { slideItemMonthly } = this.state;
        const listIdx = 2;
        const slideType = 'monthly';
        //const nextPageNo = this.calculateNextPageNo(slideType);     // 다음 페이지
        //const totalPage = this.getTotalPage(slideType);
        let slideItem = [];
        this.items = 4;

        this.initSlideTo(slideType);

        // 캐싱 데이터 있으면 다시 조회 안함.
        //if (!isCacheDisable && !isEmpty(slideItemMonthly) && totalPage !== 0 && nextPageNo > totalPage) {
        if (!isCacheDisable && !isEmpty(slideItemMonthly)) {
            slideItem = slideItemMonthly;
            this.saveData(slideItem, listIdx, slideType);
            return ;
        }

        /*
        // 다음에 호출될  page_no 가 총 page_no 보다 크면 더이상 호출 하지 않음
        if ( totalPage !== 0 && nextPageNo > totalPage ){ 
            console.log('=== nextPage가 크다', totalPage, nextPageNo);
            return ;
        }
        */

        //MeTV.request033({ page_no: `${nextPageNo}` })
        const MeTV_033 = await MeTV.request033();
        
        console.log('%c 033 월정액 구매내역 조회', 'color: green', MeTV_033);
        const { purchaseList, purchase_tot } = MeTV_033;
        slideItem = !purchaseList ? [] : purchaseList;

        this.setState({ slideItemMonthly: slideItem, monthlyLength: Number(purchase_tot) });
        this.saveData(slideItem, listIdx, slideType);
    }

    // 옥수수(N-screen) 구매내역 조회
    oksusuListCall = async () => {
        const { slideItemOksusu, oksusuConnect, autoUse, userId: user_id, muser_num } = this.state;
        const listIdx = 3;
        const slideType = 'oksusu';
        const nextPageNo = this.calculateNextPageNo(slideType);     // 다음 페이지
        const totalPage = this.getTotalPage(slideType);
        let slideItem = [];
        this.items = 6;

        this.initSlideTo(slideType);

        // 캐싱 데이터 있으면 다시 조회 안함.
        if ( !isEmpty(slideItemOksusu) && totalPage !== 0 && nextPageNo > totalPage ) {
            slideItem = slideItemOksusu;
            this.saveData(slideItem, listIdx, slideType);
            return ;
        }

        // 다음에 호출될  page_no 가 총 page_no 보다 크면 더이상 호출 하지 않음
        if ( totalPage !== 0 && nextPageNo > totalPage ){ 
            return ;
        }

        // oksusu 연결, 구매내역 열람 설정이 되어 있으면 H/E 조회
        if ( !(Number(oksusuConnect) > 0) ) {
            this.saveData([], listIdx, slideType);
            return ;
        }
        if ( !(Number(autoUse) > 0) ) { 
            this.saveData([], listIdx, slideType);
            return ;
        }

        const MeTV_034 = await MeTV.request034({
            user_id, muser_num, // real

            //test
            // user_id: 'oksusuQA3',
            // muser_num: '590BDE744FCD6B9FB17A24834B3648EA'
        });

        console.log('%c @@@ 034 옥수수(N-screen) 구매내역 조회', 'color: green', MeTV_034);
        if ( MeTV_034.reason === 'Success' && MeTV_034.result === '0000' ) {
            const { purchaseList, purchase_tot } = MeTV_034;
            slideItem = !purchaseList ? [] : slideItemOksusu.concat(purchaseList);
            this.setState({ oksusuLength: Number(purchase_tot) });
            this.saveData(slideItem, listIdx, slideType);
        } else {
            if ( MeTV_034.result === '6002' ) {
                Core.inst().showToast('사용자인증에 실패 하였습니다.', '', 3000);
            }
            this.saveData([], listIdx, slideType);
        }
    }

    initOksusuList = () => {
        this.setState({
            slideItem: [],
            slideItemOksusu: [],
            autoUse: '0',
        })
    }

    deviceInfoCallback = data => {
        const { oksusu, purchaseList, userId, muser_num, unlimitedVod } = data;
        const { slideType } = this.state;
        console.log('기기연결정보', data);

        this.setState({
            oksusuConnect: Number(oksusu) > 0,
            autoUse: Number(purchaseList) > 0,
            userId,
            muser_num,
            unlimitedVod,
            slideItemOksusu: [],
        }, () => {
            if ( Number(oksusu) > 0 && slideType === 'oksusu' ) {
                this.setFm('slide', null);
                this.setFocus('tab', 3);
            }
        })
    }

    // 기기 연결 정보
    getDeviceInfo = callback => {
        StbInterface.requestDeviceInfo(this.deviceInfoCallback);
    }

    renderNoneText = () => {
        const { autoUse, oksusuConnect, slideType, noneText } = this.state;
        let text = noneText;
        if ( slideType === 'oksusu' ) {
            if ( !(Number(oksusuConnect) > 0) ) {
                text = <Fragment>B tv와 oksusu 앱을 연결하면<br/>oksusu 구매내역을 열람할 수 있습니다.</Fragment>
            } else if ( !(Number(autoUse) > 0) ) {
                text = <OksusuSettingGuide />;
            }
        }
        return text;
    }
    
    componentDidMount() {
        // GNB사용 안함
        this.props.showMenu(false);
        // historyData 존재 여부에 따른 Focus복구 또는 초기화
        isEmpty(this.historyData) ? this.initFocus() : this.restoreFocus();
        this.getDeviceInfo();
        // this.setState({
        //     oksusuConnect: 1,
        //     autoUse: 1
        // })

        // 테스트
        window.PURCHASE = this;
    }
    

	render() {
        const { slideCurIdx, slideTo, pageType, defaultInfo, defaultSub, oksusuConnect, autoUse, slideItem, caution, activeSlide, slideType, tabMenu, activeTab, listIdx, unlimitedVod } = this.state;
        let monthlyType = `${(/PurchaseMonthlyList/gi).test(pageType) ? ' monthly':''}`;
        let oksusuType = `${(/PurchaseOksusu/gi).test(pageType) ? ' oksusu':''}`;
        const slideProps = { slideInfo: slideItem, activeItem: slideCurIdx, setFocus: this.setFocus, pageType, activeSlide, slideTo, defaultInfo, defaultSub, caution };
        const noneItemClass = pageType === 'PurchaseOksusuUnConnect' ? 'noneWrap unConnect' : 'noneWrap';
        const totalLength = this.state[`${slideType}Length`];
        const oksusuConnected = Number(oksusuConnect) > 0;
        const autoUseFlag = Number(autoUse) > 0;

		return(
            <div className="wrap">
                <div className="myBtvLayout scrollWrap">
                    <BackgroundImage />
                    <div className={`purchaseGerneralList${monthlyType}${oksusuType}`}>
                        <h2 className="pageTitle">구매내역</h2>
                        <div className="tabWrap" id="tab">
                            <ul className="tabStyle">
                                { tabMenu.map((menu, idx) =>
                                    <TabMenu key={idx} idx={idx}
                                             activeTab={activeTab}
                                             listIdx={listIdx}
                                             tabText={menu} />
                                )}
						    </ul>
						    { (slideType === 'oksusu' && oksusuConnected && autoUseFlag ) && 
                                <DisableButton setFm={this.setFm}
                                               setFocus={this.setFocus}
                                               stbData={unlimitedVod}
                                               initOksusuList={this.initOksusuList} />
						    }
					    </div>
					    { isEmpty(slideItem) ?
                            <div className={noneItemClass}>
                                <p className="noneText">{ this.renderNoneText() }</p>
                                { ( pageType === 'PurchaseOksusuUnConnect' && !oksusuConnected) && <OksusuConnectButton setFm={this.setFm} /> }
                                <GuideDescription info={defaultInfo}
                                                  sub={defaultSub} />
                            </div>
                            :
                            <PurchaseGeneralSlide data={slideProps}
                                                  slideType={slideType}
                                                  totalLength={totalLength}
                                                  items={this.items} />
                        }
				   </div>
			   </div>
		   </div>
	   )
	}

}

export default PurchaseList;