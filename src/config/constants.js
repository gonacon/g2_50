const constants = {
    IDLE: '/ui5web/v5/idle',
    BASE: '/ui5web/v5/',
    HOME: '/ui5web/v5/home',
    HOME_MOVIE: '/ui5web/v5/homeMovie',
    HOME_TV: '/ui5web/v5/homeTv',
    HOME_ANI: '/ui5web/v5/homeAni',
    HOME_DOCU: '/ui5web/v5/homeDocu',
    HOME_TVAPP: '/ui5web/v5/tvapp',
    DETAIL_GENRE_HOME: '/ui5web/v5/GenreDetails',
    ALL_MENU: '/ui5web/v5/allMenu',
    SYNOPSIS: '/ui5web/v5/synopsis/SynopsisView',
    SYNOPSIS_GATEWAY: '/ui5web/v5/synopsis/SynopGateWay',
    SYNOPSIS_PERSONAL: '/ui5web/v5/synopsis/SynopPersonalInformation',
    // SYNOPSIS_STEEL: '/ui5web/v5/synopsis/SynopShortSteel',
    SYNOPSIS_ENDING: '/ui5web/v5/synopsis/synopEnding',
    SYNOPSIS_VODPRODUCT: '/ui5web/v5/synopsis/synopVodProduct',

    EPG: '/ui5web/v5/liveTv/organization',
    BOX_OFFICE: '/ui5web/v5/liveTv/boxOffice',

    MONTHLY_AFTER: '/ui5web/v5/monthly/HomeJoinAfter',
    MONTHLY_BEFORE: '/ui5web/v5/monthly/HomeJoinBefore',
    MONTHLY_DETAIL: '/ui5web/v5/monthly/MonthlyDetail',

    PURCHASE: '/ui5web/v5/buy/BuyShort',
    PURCHASE_CHANNEL: '/ui5web/v5/buy/BuyChannel',
    PURCHASE_MONTHLY: '/ui5web/v5/buy/BuyMonthly',
    PURCHASE_OKCASHBAG: '/ui5web/v5/buy/BuyBill/OkCashBag',
    PURCHASE_PRICEEND: '/ui5web/v5/buy/BuyBill/PriceEnd',
    PURCHASE_BUYBILL: '/ui5web/v5/buy/BuyBill',
    PURCHASE_BUYBILL_CHANNEL: '/ui5web/v5/buy/BuyBillChannel',
    PURCHASE_BUYBILL_MONTHLY: '/ui5web/v5/buy/BuyBillMonthly',
    PURCHASE_BILLCOUPON: '/ui5web/v5/buy/BillCoupon',
    PURCHASE_BILLCERTIFY: '/ui5web/v5/buy/BillCertify',
    PURCHASE_CERTIFYPOPUP: '/ui5web/v5/buy/CertifyPopup',
    PURCHASE_BILLCERTIFYONE: '/ui5web/v5/buy/BillCertifyOne',
    PURCHASE_BILLPHONECERTIFY: '/ui5web/v5/buy/BillPhoneCertify',
    PURCHASE_BILLDELIVERYPHONE: '/ui5web/v5/buy/BillDeliveryPhone',

    KIDS_HOME: '/ui5web/v5/kids/home',
    KIDS_CHANNEL: '/ui5web/v5/kids/components/Channel',
    KIDS_GENRE_MENU_ALL: '/ui5web/v5/kids/components/GenreAll',
    KIDS_GENRE_MENU_BLOCK: '/ui5web/v5/kids/genremenu/GenreMenuBlock',
    KIDS_GENRE_MENU_LIST: '/ui5web/v5/kids/genremenu/GenreMenuList',
    KIDS_PLAYBLOCK: '/ui5web/v5/kids/play/PlayBlock',
    KIDS_PLAYLIST: '/ui5web/v5/kids/play/PlayList',
    KIDS_PLAYLEARNING: '/ui5web/v5/kids/components/PlayLearning',
    KIDS_MONTHLYHOME: '/ui5web/v5/kids/components/MonthlyHome',
    KIDS_MONTHLYDETAIL: '/ui5web/v5/kids/monthly/KidsMonthlyDetail',
    KIDS_MONTHLY_DETAIL_AFTER: '/ui5web/v5/kids/monthly/KidsMonthlyDetailAfter',
    KIDS_SUBCHARACTER: '/ui5web/v5/kids/character/SubCharacter',
    KIDS_CHARACTER_HOME: '/ui5web/v5/kids/components/CharacterHome',
    KIDS_CHARACTER_LIST: '/ui5web/v5/kids/character/CharacterList',
    KIDS_CHARACTER_EDIT: '/ui5web/v5/kids/character/CharacterEdit',
    KIDS_SYNOP_SHORT: '/ui5web/v5/kids/synop/KidsSynopShort',
    KIDS_SYNOP_SERIES: '/ui5web/v5/kids/synop/KidsSynopSeries',
    KIDS_GUIDE_WATCH_DISTANCE: '/ui5web/v5/kids/playguide/PlayGuideWatchDistance',
    KIDS_GUIDE_WATCH_LIMIT: '/ui5web/v5/kids/playguide/PlayGuideWatchLimit',
    KIDS_GUIDE_WATCH_END: '/ui5web/v5/kids/playguide/PlayGuideWatchEnd',
    KIDS_GUIDE_END: '/ui5web/v5/kids/playguide/PlayGuideEnd',
    KIDS_VIEW_MOVE: '/ui5web/v5/kids/kidsViewMove',

    SEARCH_MAIN: '/ui5web/v5/search/SearchMain',
    SEARCH_RESULT: '/ui5web/v5/search/SearchResult',
    SEARCH_RESULT_NONE: '/ui5web/v5/search/SearchResultNone',
    SEARCH_HOME: '/ui5web/v5/search/SearchHome',

    CERTI_PROTECTION: '/ui5web/v5/certification/JuvenileProtection',
    CERTI_ADULT: '/ui5web/v5/certification/AdultCertification',
    CERTI_WATCH_LIMIT_CHILD: '/ui5web/v5/certification/WatchLimitChild',
    CERTI_PURCHASE: '/ui5web/v5/certification/PurchaseCertification',
    CERTI_RESET: '/ui5web/v5/certification/InitializationCompletionAdultCertification',
    SAMPLE_CERTI_PHONE: '/ui5web/v5/sample/PhoneCertification',

    MYBTV_HOME: '/ui5web/v5/myBtv',
    MYBTV_EDIT_VODLIST: '/ui5web/v5/myBtv/editRecentVodList',
    MYBTV_DELETE_VODLIST: '/ui5web/v5/myBtv/ConfirmDeleteAllRecentVodList',
    MYBTV_MYVOD_LIST: '/ui5web/v5/myBtv/myVodList',
    MYBTV_MYVOD_DETAIL: '/ui5web/v5/myBtv/myVodDetail',
    MYBTV_MYVOD_SEASON_DETAIL: '/ui5web/v5/myBtv/myVodSeasonDetail',
    MYBTV_MYVOD_RECOMMEND_LIST: '/ui5web/v5/myBtv/recommendVodList',
    MYBTV_COUPON_DETAIL: '/ui5web/v5/myBtv/coupon/CouponDetail',
    MYBTV_COUPON_REGIST: '/ui5web/v5/myBtv/coupon/CouponRegist',
    MYBTV_BPOINT_HISTORY: '/ui5web/v5/myBtv/bPoint/BpointHistory',
    MYBTV_BPOINT_DETAIL: '/ui5web/v5/myBtv/bPoint/BpointDetail',
    MYBTV_TMEMBERSHIP: '/ui5web/v5/myBtv/tmembership',
    MYBTV_OKCASHBAG_MANAGE: '/ui5web/v5/myBtv/okcash/OkCashbagManage',
    MYBTV_PURCHASE_LIST: '/ui5web/v5/myBtv/purchaseList',
    MYBTV_PURCHASE_PACKAGE: '/ui5web/v5/myBtv/purchaseList/package',
    MYBTV_PURCHASE_COMMERCE: '/ui5web/v5/myBtv/purchaseList/commerce',
    MYBTV_NOTICE_LIST: '/ui5web/v5/myBtv/notice/NoticeList',
    MYBTV_NOTICE_DETAIL: '/ui5web/v5/myBtv/notice/ListTextDetail',
    MYBTV_USE_GUIDE_LIST: '/ui5web/v5/myBtv/notice/UseGuideList',
    MYBTV_USE_GUIDE_DETAIL: '/ui5web/v5/myBtv/notice/UseGuideItemPop',
    MYBTV_BOOKMARK_LIST: '/ui5web/v5/myBtv/bookmarkList',
    MYBTV_EDIT_BOOKMART_LIST: '/ui5web/v5/myBtv/editBookmarkList',
    MYBTV_CONFIRM_DELETE_ALL_BOOKMART: '/ui5web/v5/myBtv/ConfirmDeleteAllBookmark',
    STB_TEST: '/ui5web/v5/stbtest',
    DEADTV_CHART: '/ui5web/v5/deadTv',
    TESTCASE: '/ui5web/v5/testcase',

    CODE: {
        GNB_MYBTV: 'U5_01',
        GNB_MONTHLY: 'U5_02',
        GNB_HOME: 'U5_03',
        GNB_MOVIE: 'U5_04',
        GNB_TV: 'U5_05',
        GNB_ANI: 'U5_06',
        GNB_KIDS: 'U5_07',
        GNB_DOCU: 'U5_08',
        GNB_TVAPP: 'U5_09',
        GNB_SENIOR: 'U5_10',
        GNB_SEARCH: 'U5_11',
        GNB_VIEWALL: 'VIEW_ALL',
        GNB_EPG: 'btv011',
    },

    MENU_NAVI: {
        HOME: 'home', // 홈 메뉴 연동 (Home key)
        MENU: 'allMenu', // 특정 메뉴 이동(메뉴 ID)
        SYNOPSIS_ENDING: 'synopsisEnding', // 엔딩 시놉시스 페이지 연동
        SYNOPSIS: 'synopsis', // 특정 콘텐츠 시놉시스 페이지 연동
        SYNOPSIS_NUGU: 'synopsisNugu', // Nugu를 통해서 시놉시스 페이지 연동
        SYNOPSIS_POSSESSION: 'synopsisPossession', // 소장용 시놉시스 페이지 이동
        SYNOPSIS_DIRECT: 'synopsisDirect', // 바로 특정 콘텐츠 시놉시스 페이지 연동
        SYNOPSIS_PACKAGE: 'synopsisPackage', // 패키지 시놉시스 페이지 연동
        SEARCH: 'search', // 검색 페이지 연동 (검색 key)
        SEARCHPERSONDETAIL: 'searchPersonDetail', // 인물정보 팝업 연동
        EPG: 'liveTvSchedule', // 전체편성표 메뉴 연동 (전체편성표 key)
        EPG_GNERE: 'epgGenre', // 장르편성표
        MOVIE: 'movie', // 영화 핫키에 의한 이동
        TV: 'replayTv', // TV 다시보기 핫키에 의한 이동
        SHOPPING: 'shopping', // shopping 핫키에 의한 이동
        KIDS_ZONE_HOME: 'kidsZoneHome', // 키즈존 홈 이동
        KIDS_ZONE_CHANNEL_LIST: 'kidsZoneChannelList', // 키즈존 채널 리스트 이동
        MY_BTV: 'myBtv',  //  마이 Btv 이동
        FAVORITE_VOD_LIST: 'favoriteVodList',  //  VOD 찜 목록 이동

        ANIMATION_HOME: 'animationHome',  // - 홈 애니메이션 메뉴 이동
        MONTHLY_HOME: 'monthlyHome',  //- 월정액 홈 이동
        TV_APP_HOME: 'tvAppHome',  //- TV App 홈 이동

        COUPON: 'coupon',  //  쿠폰함으로 이동
        POINT: 'Point',  //  포인트함으로 이동

        RECENT_VOD: 'recentVod',  //  - 최근 시청 VOD 메뉴
        POSSESSION_VOD: 'possessionVod',  //  - 소장용 VOD 메뉴

        FAVORITE_CHANNEL_LIST: 'favoriteChannelList',  //  찜 채널(선호채널) 목록으로 이동

        SYNOPSIS_GATEWAY: 'synopsisGateway',  //  - 게이트웨이 시놉시스
        SYNOPSIS_GATEWAY_PRODUCT: 'synopsisGatewayProduct',  //  - 게이트웨이 시놉시스 (상품 패키지)
        SMART_NOTICE: 'smartNotice',  //  - 스마트 알림 이동, jump 필드 참조 , jump 안의 필드 정의 필요.

        KIDS_ZONE: 'KIDS_ZONE',  //   - 키즈존
        MULTI_VIEW: 'MULTI_VIEW',  //   - 멀티뷰
        SETTING: 'SETTING',  //   - 설정
    },

    MENU_ID: {
        DEFAULT: 'DEFAULT',  //   설정 메인,  멀티뷰,  키즈존 실행
        SETTING_CONNECTION_OKSUSU: 'SETTING_CONNECTION_OKSUSU',  //   기기연결 설정 > oksusu 연결하기
        SETTING_CONNECTION_BTV_PLUS: 'SETTING_CONNECTION_BTV_PLUS',  //   기기연결 설정 > Btv plus 연결하기
        SETTING_CONNECTION_BLUE_TOOTH: 'SETTING_CONNECTION_BLUE_TOOTH',  //   기기연결 설정 > blue tooth 연결하기
        SETTING_CONNECTION_NUGU: 'SETTING_CONNECTION_NUGU',  //   기기연결 설정 > NUGU 연결하기
        SETTING_AUTHENTICATION: 'SETTING_AUTHENTICATION',  //   설정 > 인증번호 설정
        SETTING_CHILD_LIMIT: 'SETTING_CHILD_LIMIT',  //   설정 > 자녀안심 설정
        SETTING_USER_CUSTOMIZE: 'SETTING_USER_CUSTOMIZE',  //   설정 > 사용자 맞춤 설정
        SETTING_KIDS_ZONE: 'SETTING_KIDS_ZONE',  //   설정 > 키즈존 설정
        SETTING_LIVE_CHANNEL: 'SETTING_LIVE_CHANNEL',  //   설정 > 실시간 채널 설정
        SETTING_SOUND: 'SETTING_SOUND',  //  설정 > 화면 사운드 설정

        MULTI_VIEW_SETTING: 'MULTI_VIEW_SETTING',  //  멀티뷰 설정
        KIDS_ZONE_FIRST_INTRO: 'KIDS_ZONE_FIRST_INTRO'
    },

    STB_PROP: {
        STB_ID: 'STBID',  // STB 고유 아이디
        HASH_ID: 'PROPERTY_HASH_ID',  // stbId를 SHA-256으로 암호화한 데이터
        MAC: 'STB_MAC',  // STB MAC 주소
        STB_MODEL: 'STB_MODEL',  // STB 모델
        SW_VERSION: 'STB_SW_VERSION',  // STB SW 버전
        USER_ID: 'MOBILE_USER_ID',  // Mobile(OKSUSU) 아이디
        USER_PW: 'MOBILE_USER_PASSWORD',  // Mobile(OKSUSU) 패스워드
        USER_ID_SAVED: 'USER_ID_SAVED',  //  사용자 ID 저장 여부(저장:Y, 저장안함:N)
        USER_NUMBER: 'USER_NUMBER',     // Mobile(OKSUSU) 고객 번호
        BPOINT_PER_MONTH_DEDUCT: 'PROPERTY_B_POINT_PER_MONTH_DEDUCT',  // B포인트 월정액 차감 사용여부
        TOKEN_GW: 'GW_TOKEN',  // API GW 연동 토큰 값
        WEBUI_VERSION: 'WEBUI_VERSION',  // Web UI version 정보
        API_KEY: 'API_KEY',  // server-list.conf 에 저장된 apiKey
        HDR_SUPPORT: 'HDR_SUPPORT',  //  HDR 지원 여부(true - 지원함, false - 지원 안함)
        BLUETOOTH_CONNECT: 'PROPERTY_BLUETOOTH_USING',  //  블루투스 연결 상태(true - 연결, false - 연결 해제)
        USER_SEX: 'TMEMBERSHIP_USER_GENDER',  //  T-membership 고객 성별
        USER_BIRTH: 'TMEMBERSHIP_USER_BIRTH',  // T-membership 고객 생년 월일
        PSS_USE_AGREE: 'PSS_USE_AGREE',  // 1: 동의, 2: 미동의, 3: 선택안함
        LIST_VIEW_OPTION: 'LIST_VIEW_OPTION',  //  텍스트/이미지|최신/이름  (TEXT:텍스트, IMAGE:이미지, NEW:최신, TITLE:가나다) => IMAGE|TITLE, TEXT|NEW 형태로 전달
        CONSECUTIVE_PLAY: 'CONSECUTIVEPLAY',  //  시리즈 연속 시청 사용여부(Y/N)

        PROPERTY_CHILDREN_SEE_LIMIT_SETTING: 'PROPERTY_CHILDREN_SEE_LIMIT_SETTING',  //  자녀안심 시청 적용 범위 (Value - btv 전체 : btv, 키즈존만 : KIDS)
        CHILDREN_SEE_LIMIT_TIME_SET: 'CHILDRENSEELIMITTIMESET',  //  Kidszone 시간 제한 시간 직접 설정, 저장 형식 : HH,mm,HH,mm 으로 저장 앞에 HH,mm 시작시간 뒤에 HH,mm 종료시간
        BLUE_LIGHT: 'BLUELIGHT',  //  시력보호(블루스크린) 사용 여부,  value - 사용안함 : 0, 사용함 : 1
        KIDS_MODE_ENTRY_VIRGIN: 'KIDS_MODE_ENTRY_VIRGIN',  //  kidszone 최초 진입 여부,  value 0 - 사용안함, 1 - 사용함
        PROPERTY_CHILDREN_SEE_LIMIT_TYPE: 'PROPERTY_CHILDREN_SEE_LIMIT_TYPE',  // kidszone 제한 모드,  시간으로 제한 - TIME, 시간대로 제한 -  CUSTOM_TIME, 편수 제한 -  VOD_COUNT, 사용안함 - BTV
        PROPERTY_CHILDREN_SEE_LIMIT_VOD_CONUNT: 'PROPERTY_CHILDREN_SEE_LIMIT_VOD_CONUNT',  // Kidszone 제한  편수
        CHILDREN_SEE_LIMIT_TIME: 'CHILDRENSEELIMITTIME',  // Kidszone 시간대 제한 시간, value : 사용안함 - 0, 사용함 - 시간값 (1 ~ 6)
        PROPERTY_CHILDREN_SEE_LIMIT_VOD_WATCH_CONUNT: 'PROPERTY_CHILDREN_SEE_LIMIT_VOD_WATCH_CONUNT',  // Kidzone 현재 진행 편수, 추가 예정
        PROPERTY_KIDS_CHARACTER: 'PROPERTY_KIDS_CHARACTER',  // Kidszone 가이드 캐릭터, value (pororo, pinkfong, octonauts, kongsuni, carrie)

        PROPERTY_KIDS_CHARACTER_VOICE: 'PROPERTY_KIDS_CHARACTER_VOICE',	//  Kidszone캐릭터 음성가이드 사용 여부,	캐릭터 음성가이드 사용 여부 value : 0 - 사용안함, 1 사용함
        PROPERTY_KIDS_PROFILE_NAME_1: 'PROPERTY_KIDS_PROFILE_NAME_1',  //  	프로필 이름	
        PROPERTY_KIDS_PROFILE_BIRTHDAY_1: 'PROPERTY_KIDS_PROFILE_BIRTHDAY_1',  // 프로필 생일 	(YYYY.MM) 형식으로 저장
        PROPERTY_KIDS_PROFILE_SEX_1: 'PROPERTY_KIDS_PROFILE_SEX_1',  //  프로필 성별,	여자 : G, 남자 : M
        PROPERTY_KIDS_PROFILE_NAME_2: 'PROPERTY_KIDS_PROFILE_NAME_2',  //  	프로필 이름	
        PROPERTY_KIDS_PROFILE_BIRTHDAY_2: 'PROPERTY_KIDS_PROFILE_BIRTHDAY_2',  // 프로필 생일  	(YYYY.MM) 형식으로 저장
        PROPERTY_KIDS_PROFILE_SEX_2: 'PROPERTY_KIDS_PROFILE_SEX_2',  //  	프로필 성별  여자 : G, 남자 : M
        PROPERTY_KIDS_PROFILE_NAME_3: 'PROPERTY_KIDS_PROFILE_NAME_3',  //  	프로필 이름
        PROPERTY_KIDS_PROFILE_BIRTHDAY_3: 'PROPERTY_KIDS_PROFILE_BIRTHDAY_3',  // 프로필 생일 	(YYYY.MM) 형식으로 저장
        PROPERTY_KIDS_PROFILE_SEX_3: 'PROPERTY_KIDS_PROFILE_SEX_3',  // 프로필 성별 	여자 : G, 남자 : M
        PROPERTY_KIDS_ALARM_TYPE_1: 'PROPERTY_KIDS_ALARM_TYPE_1',  // 알람 타입	 	알람 타입 ( value : 0 : 유치원/어린이집 가는 시간, 1 : 식사시간, 2 : 휴식시간, 3 : 잘 시간)
        PROPERTY_KIDS_ALARM_TYPE_TIME_1: 'PROPERTY_KIDS_ALARM_TYPE_TIME_1',  // 알람 시간 	알람 시간 (HHmm 형식 저장)
        PROPERTY_KIDS_ALARM_WEEK_1: 'PROPERTY_KIDS_ALARM_WEEK_1',  // 알람 요일, 	알람 요일 (1 : 일, 2 : 월, 3 : 화, 4 : 수, 5 : 목, 6 : 금, 7 : 토, 0 : 매일, 요일복수 선택시 : 1^2^3 형식으로 저장)
        PROPERTY_KIDS_ALARM_USE_1: 'PROPERTY_KIDS_ALARM_USE_1',  // 알람 사용 여부, 	알람 사용여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_SEVERAL_1: 'PROPERTY_KIDS_ALARM_SEVERAL_1',  // 반복 알림 여부, 	반복 알림 여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_TYPE_2: 'PROPERTY_KIDS_ALARM_TYPE_2',  // 알람 타입, 	알람 타입 ( value : 0 : 유치원/어린이집 가는 시간, 1 : 식사시간, 2 : 휴식시간, 3 : 잘 시간)
        PROPERTY_KIDS_ALARM_TYPE_TIME_2: 'PROPERTY_KIDS_ALARM_TYPE_TIME_2',  // 알람 시간, 	알람 시간 (HHmm 형식 저장)
        PROPERTY_KIDS_ALARM_WEEK_2: 'PROPERTY_KIDS_ALARM_WEEK_2',  // 알람 요일, 	알람 요일 (1 : 일, 2 : 월, 3 : 화, 4 : 수, 5 : 목, 6 : 금, 7 : 토, 0 : 매일, 요일복수 선택시 : 1^2^3 형식으로 저장)
        PROPERTY_KIDS_ALARM_USE_2: 'PROPERTY_KIDS_ALARM_USE_2',  // 알람 사용 여부, 	알람 사용여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_SEVERAL_2: 'PROPERTY_KIDS_ALARM_SEVERAL_2',  // 반복 알림 여부, 	반복 알림 여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_TYPE_3: 'PROPERTY_KIDS_ALARM_TYPE_3',  // 알람 타입, 	알람 타입 ( value : 0 : 유치원/어린이집 가는 시간, 1 : 식사시간, 2 : 휴식시간, 3 : 잘 시간)
        PROPERTY_KIDS_ALARM_TYPE_TIME_3: 'PROPERTY_KIDS_ALARM_TYPE_TIME_3',  // 알람 시간, 	알람 시간 (HHmm 형식 저장)
        PROPERTY_KIDS_ALARM_WEEK_3: 'PROPERTY_KIDS_ALARM_WEEK_3',  //  알람 요일,	알람 요일 (1 : 일, 2 : 월, 3 : 화, 4 : 수, 5 : 목, 6 : 금, 7 : 토, 0 : 매일, 요일복수 선택시 : 1^2^3 형식으로 저장)
        PROPERTY_KIDS_ALARM_USE_3: 'PROPERTY_KIDS_ALARM_USE_3',  // 알람 사용 여부, 	알람 사용여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_SEVERAL_3: 'PROPERTY_KIDS_ALARM_SEVERAL_3',  // 반복 알림 여부, 	반복 알림 여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_TYPE_4: 'PROPERTY_KIDS_ALARM_TYPE_4',  // 알람 타입, 	알람 타입 ( value : 0 : 유치원/어린이집 가는 시간, 1 : 식사시간, 2 : 휴식시간, 3 : 잘 시간)
        PROPERTY_KIDS_ALARM_TYPE_TIME_4: 'PROPERTY_KIDS_ALARM_TYPE_TIME_4',  //  알람 시간,	알람 시간 (HHmm 형식 저장)
        PROPERTY_KIDS_ALARM_WEEK_4: 'PROPERTY_KIDS_ALARM_WEEK_4',  //  알람 요일,	알람 요일 (1 : 일, 2 : 월, 3 : 화, 4 : 수, 5 : 목, 6 : 금, 7 : 토, 0 : 매일, 요일복수 선택시 : 1^2^3 형식으로 저장)
        PROPERTY_KIDS_ALARM_USE_4: 'PROPERTY_KIDS_ALARM_USE_4',  //  알람 사용 여부,	알람 사용여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_KIDS_ALARM_SEVERAL_4: 'PROPERTY_KIDS_ALARM_SEVERAL_4',  //  반복 알림 여부,	반복 알림 여부 (0 : 사용안함, 1 : 사용함)
        PROPERTY_REMOCON_KEYPAD_SETTING: 'PROPERTY_REMOCON_KEYPAD_SETTING',  // 키패드(신규/ 기존), 	"키패드 유형 신형: PROPERTY_NEW_REMOCON_KEYPAD,  구형: PROPERTY_OLD_REMOCON_KEYPAD"
        PURCHASE_CERTIFICATION: 'PURCHASECERTIFICATION',  //  구매인증		구매인증 설정 기능 여부 //설정값 (사용:1, 사용안함:0)
        CHILDREN_SEE_LIMIT: 'CHILDRENSEELIMIT',  // 등급제한 	시청연령제한 (0, 7, 12, 15, 19)
        ADULT_MOVIE_MENU: 'ADULTMOVIEMENU',  //  	19영화
        EROS_MENU: 'EROSMENU',  //  	19플러스
        AUTO_SLEEP: 'AUTOSLEEP',  //  	자동취침기능
        AUTO_HOMEMODE: 'AUTOHOMEMODE',  //  	자동홈모드
        HEARING_IMPAIRED: 'HEARINGIMPAIRED',  //  	청각장애인용 자막방송
        HEARING_IMPAIRED_LANGUAGE: 'HEARINGIMPAIRED_LANGUAGE',  //  	청각장애인용 자막방송 – 언어
        HEARING_IMPAIRED_FONTSIZE: 'HEARINGIMPAIRED_FONTSIZE',  //  	청각장애인용 자막방송 – 글자크기
        VISION_IMPAIRED: 'VISIONIMPAIRED',  //  	시각장애인용 해설방송	
        VISION_IMPAIRED_LANGUAGE: 'VISIONIMPAIRED_LANGUAGE',  //  	시각장애인용 해설방송 - 언어	
        PROPERTY_HOME_PLAY_TYPE: 'PROPERTY_HOME_PLAY_TYPE',  //  	홈 화면 영상설정
        // PROPERTY_IP_SETTING: 'PROPERTY_IP_SETTING',  //  	IP설정	사용 안함.
        KIDS_SAFETY_MODE: 'KIDS_SAFETY_MODE',  //  	키즌존 바로가기 설정
        PROPERTY_NUGU_CONNECT: 'PROPERTY_NUGU_CONNECT',  //  	NUGU 연결 여부	
        PROPERTY_POST_CODE: 'PROPERTY_POST_CODE',  //  	우편번호 저장	
        PROPERTY_SUPPORTED_RESOLUTION: 'PROPERTY_SUPPORTED_RESOLUTION',  //  	티비 지원 해상도
        PROPERTY_AUDIO_SETTING: 'PROPERTY_AUDIO_SETTING',  //  	미세배속 중 자동으로 설정 변경되기 전의 정보
        PROPERTY_HASH_ID: 'PROPERTY_HASH_ID',  //  	비식별화 코드, Hash ID(STB ID SHA - 256)
        PROPERTY_NADS_SETTING: 'PROPERTY_NADS_SETTING',  //  	맞춤형 광고 설정 여부
        PROPERTY_NADS_ID_SETTING: 'PROPERTY_NADS_ID_SETTING',  //  	맞춤형 광고 ID 저장
        PROPERTY_VOICE_INPUT_VOL: 'PROPERTY_VOICE_INPUT_VOL',  //  	음성검색 진입 볼륨
        PROPERTY_REMOTE_BATTERY: 'PROPERTY_REMOTE_BATTERY',  //  	배터리값 저장 0: Empty, 1: Low, 2: Normal
        PROPERTY_OKSUSU_ID: 'PROPERTY_OKSUSU_ID',  //  	OKSUSU id 저장
        PROPERTY_SEGMENTED_HOME: 'PROPERTY_SEGMENTED_HOME',  //  	홈 세그먼트 저장
        PROPERTY_SEGMENTED_MENU: 'PROPERTY_SEGMENTED_MENU',  //  	메뉴 세그먼트 저장	
        PROPERTY_SEGMENTED_HOME_START: 'PROPERTY_SEGMENTED_HOME_START',  //  	홈 세그먼트 적용 시작 시간 저장
        PROPERTY_SEGMENTED_MENU_START: 'PROPERTY_SEGMENTED_MENU_START',  //  	메뉴 세그먼트 적용 시작 시간 저장
        PROPERTY_SEGMENTED_HOME_END: 'PROPERTY_SEGMENTED_HOME_END',  //  	홈 세그먼트 적용 종료 시간 저장
        PROPERTY_SEGMENTED_MENU_END: 'PROPERTY_SEGMENTED_MENU_END',  //  	메뉴 세그먼트 적용 종료 시간 저장
        PROPERTY_AUTO_RESET: 'PROPERTY_AUTO_RESET',  //  	AutoReset 팝업으로 리부팅 되었는지 확인 값 저장
        PROPERTY_SUB_TITLE_FONT_SIZE: 'PROPERTY_SUB_TITLE_FONT_SIZE',  //  	VOD 자막 폰트 사이즈 저장
        PROPERTY_SUB_TITLE_LANGUAGE: 'PROPERTY_SUB_TITLE_LANGUAGE',  //  	VOD 자막 언어 저장
        PROPERTY_HDCP: 'PROPERTY_HDCP',  //  	HDCP 값 저장
        KIDS_SAFETY_PASSWORD: 'KIDS_SAFETY_PASSWORD',  //  	키즈존 비밀번호 설정(키즈존에서 설정가능)  value : 사용안함 - 0, 사용함 - 1 (값이 없는 경우 사용안함)
        KIDS_VIRGIN_ENTRY: 'KIDS_VIRGIN_ENTRY',  //  	패치 후 업데이트 알림 팝업 노출 여부
        PROPERTY_MULTIVIEW_SCREEN_TYPE: 'PROPERTY_MULTIVIEW_SCREEN_TYPE',  //  	멀티뷰 화면 타입 설정
        PROPERTY_MY_CHANNEL_1: 'PROPERTY_MY_CHANNEL_1',  //  	마이 멀티뷰 1 설정 값
        PROPERTY_MY_CHANNEL_2: 'PROPERTY_MY_CHANNEL_2',  //  	마이 멀티뷰 2 설정 값	
        LAST_FRAME: 'LASTFRAME',  //  	라스트 프레임 저장
        PROPERTY_MOUSE_POINTER_VISIBLE: 'PROPERTY_MOUSE_POINTER_VISIBLE',  //  	마우스 포인터 노출 여부 저장
        USER_NAME: 'USERNAME',  //  	사용자 이름 저장
        USER_ADDR: 'USERADDR',  //  	사용자 주소 저장
        SEARCH_HISTORY: 'SEARCH_HISTORY_NEW_REAL',    //      검색기록
        SEARCH_HISTORY_LIST: 'SEARCH_HISTORY_LIST',

        REGION_CODE: 'regionCode', ////////////////////////////// 임의 사용중 native에서 받아서 수정필요
        // AREA_CODE: 'areaCode', /////////////////////////////  4.0에서 사용하던 값
        // WHATHER_WIDGET: 'PROPERTY_WEATHER_WIDGET', ///////////////////////////  4.0에서 사용하던 값
        // UTIL_WIDGET: 'PROPERTY_UTIL_WIDGET', ///////////////////////////////  4.0에서 사용하던 값
        // HOME_MYBTV_MENU: 'homeMyBtvMenu', /////////////////////////////////  4.0에서 사용하던 값
        // HOME_ALLMENU: 'homeAllMenu', //////////////////////////////////  4.0에서 사용하던 값
        // WEATHER_INFO: 'weatherInfo', ////////////////////////////////  4.0에서 사용하던 값
        // SCREEN_BRIGHTNESS: 'PROPERTY_SCREEN_BRIGHTNESS', //////////////////////////  4.0에서 사용하던 값
        KIDS_MODE_ENTRY: 'KIDS_MODE_ENTRY', //  Kidszone 진입 상태 값, value : 0 - 미진입, 1 - 진입
        PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD: 'PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD', //  KidsZone 남은 편수
        PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME: 'PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME', //  KidsZone 남은 시간

        // 메뉴 가이드 유무 플레그
        TOOLTIPGUIDE_FLAG_SCHEDULECHART_MENU: 'TOOLTIPGUIDE_FLAG_SCHEDULECHART_MENU',   // 편성표 메뉴 가이드 
        TOOLTIPGUIDE_FLAG_PURCHASE: 'TOOLTIPGUIDE_FLAG_PURCHASE',                       // 구매 툴팁 가이드 
        TOOLTIPGUIDE_FLAG_HOME: 'TOOLTIPGUIDE_FLAG_HOME',                               // 홈 툴팁 가이드 
        TOOLTIPGUIDE_FLAG_SYNOPSIS: 'TOOLTIPGUIDE_FLAG_SYNOPSIS',                       // 시놉시스 툴팁 가이드 
        TOOLTIPGUIDE_FLAG_SEARCH: 'TOOLTIPGUIDE_FLAG_SEARCH',                           // 검색 툴팁 가이드 
        TOOLTIPGUIDE_FLAG_MOVIE: 'TOOLTIPGUIDE_FLAG_MOVIE',                             // 영화/시리즈
        TOOLTIPGUIDE_FLAG_TV: 'TOOLTIPGUIDE_FLAG_TV',                                   // TV다시보기
        TOOLTIPGUIDE_FLAG_ANI: 'TOOLTIPGUIDE_FLAG_ANI',                                 // 애니
        TOOLTIPGUIDE_FLAG_SENIOR: 'TOOLTIPGUIDE_FLAG_SENIOR',                           // 시니어
        TOOLTIPGUIDE_FLAG_DOCU: 'TOOLTIPGUIDE_FLAG_DOCU',                               // 다큐/라이프/교육
        TOOLTIPGUIDE_FLAG_TVAPP: 'TOOLTIPGUIDE_FLAG_TVAPP',                             // TV APP

        SOUND_TOOLTIPGUIDE_COUNT_SYNOPSIS: 'SOUND_SEARCH_TOOLTIPGUIDE_SYNOPSIS_PEOPLE', //시놉시스 인물 음성검색 가이드)

        PROPERTY_PSS_URL: 'PROPERTY_PSS_URL', // PSS URL 정보

        COUPONS_POINT_REQUEST_TIME: 'COUPONS_POINT_REQUEST_TIME', // 쿠폰 포인트 요청했던 시간
    },

    // kidszone 제한 모드 타입, PROPERTY_CHILDREN_SEE_LIMIT_TYPE 하위 type 값
    CHILDREN_LIMIT_TYPE: {
        TIME: 'TIME',
        CUSTOM_TIME: 'CUSTOM_TIME',
        VOD_COUNT: 'VOD_COUNT',
        BTV: 'BTV',
    },

    STB_TYPE: {
        REQUEST: 'request',
        RESPONSE: 'response',
        NOTIFY: 'notify'
    },

    STB_COMMAND: {
        // Data(Web->Native) 조회								
        STB_INFO: 'StbInfo',
        RECENT_VOD_LIST: 'RecentVodList',
        CHANNEL_LIST: 'ChannelList',
        RESERVATION_INFO: 'ReservationInfo',
        PLAY_INFO: 'PlayInfo',
        KIDS_ZONE_CHANNEL_INFO: 'KidsZoneChannelInfo',
        HOME_OAP_INFO: 'HomeOapInfo',
        FAVORITE_VOD_INFO: 'FavoriteVodInfo',
        DEVICE_INFO: 'DeviceInfo',
        REQUEST_COUPON_POINT: 'RequestCouponPoint',
        MONTHLY_PURCHASE: 'MonthlyPurchase',
        OKSUSU_PURCHASE_INFO: 'OksusuPurchaseInfo',

        // Action(Web->Native)								
        MENU_NAVIGATION_NATIVE: 'MenuNavigationNative',
        LIVETV_SERVICE: 'LiveTvService',
        PLAY_VOD: 'PlayVod',
        STOP_VOD: 'StopVod',
        PLAY_PIP: 'PlayPip',
        PLAY_OAP: 'PlayOap',
        REQUEST_TOKEN: 'RequestToken',
        OPEN_POPUP: 'OpenPopup',
        LAUNCH_APP: 'LaunchApp',
        DELETE_RECENT_VOD: 'DeleteRecentVod',
        SET_FAVORITE: 'SetFavorite',
        RELOAD: 'Reload',
        PLAY_KIDSZONE_GUIDE: 'PlayKidszoneGuide',
        ENCRYPT_DATA: 'EncryptData',
        OPEN_POPUP_TV: 'OpenPopupTvCommerce',
        RESIZE_MAIN_PLAYER: 'ResizeMainPlayer',
        OPEN_TOAST: 'OpenToast',
        // SHOW_CHANNEL_JOIN: 'ShowChannelJoin',

        // Action(Native -> Web)								
        MENU_NAVIGATION_WEB: 'MenuNavigationWeb',  //  Web 메뉴 이동 요청
        PREPARE_VOD_PLAY: 'PrepareVodPlay',  //  VOD 재생을 위한 사전 시나리오 처리 요청
        SET_CHANNEL_JOIN_STATE: 'SetChannelJoinState',  //  실시간 채널 가입/해지 요청
        SHOW_KIDS_ZONE_ALARM_WIDGET: 'ShowKidsZoneAlarmWidget',  //  키즈존 알림시간 안내 위젯 노출
        MENU_HOT_KEY_NAVIGATION_WEB: 'MenuHotKeyNavigationWeb',  //  Web HotKey 메뉴 이동 요청 (리모컨 Hot key 를 통한 메뉴 이동)
        REFRESH_VOD_OTP: 'RefreshVodOtp',  // VOD OTP 갱신 요청
        DIRECT_MENU: 'DirectMenu',  // 메뉴이동요청
        SET_MONTHLY_PRODUCT_JOIN_STATE: 'SetMonthlyProductJoinState',  // 월정액 가입/해지 요청

        // Data 전달(Notify)								
        KEY_INFO: 'KeyInfo',
        ISQMS_INFO: 'IsqmsInfo',
        WEB_HIDE_NOTI: 'WebHideNoti',
        DELIVERY_TEXT: 'DeliveryText',
        OAP_PLAY_STATE: 'OapPlayState',
        PIP_PLAY_STATE: 'PipPlayState',
        KIDSZONE_STATE: 'KidszoneState',
        WEB_SHOW_NOTI: 'WebShowNoti',
        WEB_MENU_STATE: 'WebMenuState',
        SEND_TV_APP_LIST: 'SendTvAppList',
        TAS_LOG: 'TasLog',
        KIDS_ZONE_EXIT_STATE: 'KidsZoneExitState',

        NOTIFY_CLEAR_SCREEN: 'NotifyClearScreen',
        PPM_CANCEL_NOTI: 'PPMCancelNoti',
    },

    PRD_TYP_CD: {
        PPV: '10',              // 단편 구매 상품
        PPS: '20',              // 시즌 구매 상품
        PPM: '30',              // VOD 월정액
        COMPLX_VOD_PPM: '34',   // 복합 VOD 월정액
        COMPLX_PPM: '35',       // 복합 월정액
        PPP: '41'               // 패키지(게이트 시놉시스 대상)
    },

    RESOLUTION_TYPE_CD: {
        SD: '10',
        HD: '20',
        FHD: '25',
        UHD: '30',
        UHD_HDR: '35'
    },

    LANGUAGE_TYPE_CD: {
        KOREAN: '01',           // 우리말
        CAPTION_KR: '02',       // 한글자막
        CAPTION_UK: '03',       // 영어자막
        ENGLISH: '04',          // 영어더빙
        CHINESE: '05',          // 중국어더빙
        LYLICS_FOREIGN: '15',   // 외국어 자막서비스
        ETC: '13'               // 기타
    },

    PAYMENT_TYPE_CD: {
        BILL: '90',           // 청구서
        PHONE: '10',       // 휴대폰
        CREDIT: '2',       // 신용카드
    },
    CERT_TYPE: {
        PROTECTION: 'PROTECTION',
        KIDS_ZONE: 'KIDS_ZONE',
        CHILD_SAFETY: 'CHILD_SAFETY',
        CERT_NUMBER: 'CERT_NUMBER',
        AGE_LIMIT: 'AGE_LIMIT',
        ADULT_SELECT: 'ADULT_SELECT',
        ADULT_PLAYPURCHASE: 'ADULT_PLAYPURCHASE',
        WATCH_LIMIT: 'WATCH_LIMIT',
        PURCHASE: 'PURCHASE'
    },
    CALL_URL: {
        CS: 'btv004',
        PURCHASE_LIST: 'btv005',
        NOTICE_EVENT: 'btv006',
        USE_GUIDE: 'btv007',
        NOTICE: 'btv018',
        EVENT: 'btv019',
        REGISTERED_MONTHLY: 'btv020',
        RECENT_WATCH_VOD: 'btv021'
    },
    CALL_TYPE_CD: {
        BROWSER: '2',           // 브라우저 호출
        SHORT_CUT: '501',       // 메뉴바로가기
        // APP: '502',	        // UI App(UI5.0)
        SYNOPSIS: '503',	    // 시놉시스 이동
        APP: '504',             // TV앱(VAS) 실행
        LIVE_CH: '505',	        // 실시간채널
        VIRTUAL_CH: '506'	    // 가상채널
    }
};

const PATH = constants;
const GNB_CODE = constants.CODE;
const MENU_NAVI = constants.MENU_NAVI;
const STB_PROP = constants.STB_PROP;
const STB_TYPE = constants.STB_TYPE;
const STB_COMMAND = constants.STB_COMMAND;
const MENU_ID = constants.MENU_ID;
const CERT_TYPE = constants.CERT_TYPE;
const CHILDREN_LIMIT_TYPE = constants.CHILDREN_LIMIT_TYPE;
const CALL_URL = constants.CALL_URL;

export { PATH, GNB_CODE, MENU_NAVI, STB_PROP, STB_TYPE, STB_COMMAND, MENU_ID, CERT_TYPE, CHILDREN_LIMIT_TYPE, CALL_URL };

export default constants;