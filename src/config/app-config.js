import Axios from "axios";
import { Core } from "Supporters";

// let runMode = '-dev';
let runMode = '-stg';
// let runMode = ''; //prd
let runDevice = (navigator.userAgent.indexOf('TVStorm ') > -1) ? true : false;  // true is STB, false is PC
let headEndMode = 'live';  //  // live, test
let appConfig = {
    runDevice: runDevice,
    runMode: runMode,
    // CS 환경 체크
    isCS: (navigator.userAgent.indexOf('CloudStreaming') > -1) ? true : false,
    // UI Core 환경변수 설정
    uicore: {
        maxHistoryLimit: 10, // 0일 경우 무한대로 히스토리를 쌓음
        consoleLog: true, // 기본값 true
        errorLog: true // 기본값 true
    },

    // 앱 설정 ---------------------
    //stg와 dev로 나누어 deploy 되므로 runMode에 따라 TestURL을 변경한다
    app: {
        apiDebugMode: '',
        id: 'skbb', 	// 프로젝트명 (영문 소문자)
        runMode: runMode, 		// 작동모드 (dev:개발, stage:스테이지, live:라이브모드)
        headEndMode: headEndMode,	// live, test
        proxyMode: 'off',		// live, test, off
        version: 'Ver. 1.0.0',		//
        lastModified: '2018-03-02',
        csInterfaceVersion: '1.0'
    },
    tasLog: {
        sendLen: 1000
    },
    debug: {
        mode: 'off',
        log: false,
    },
    useKey: {
        number: 'off',
        red: 'off'
    },
    headEnd: {
        cancelTimeout: 3000,
        retry: 3,
        MeTV: {
            Live: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/metv/v5'
            },
            Test: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/metv/v5'
            }
        },
        NXPG: {
            Live: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/xpg/v5'
            },
            Test: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/xpg/v5'
            }
        },
        SCS: {
            retry: 0,
            cancelTimeout: 5000,
            Live: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/scs/v5/'
            },
            Test: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/scs/v5/'
            }
        },
        // V5SCH: {
        //     Live: {
        //         protocol: 'http',
        //         ip: 'agw' + runMode + '.sk-iptv.com',
        //         port: '8080',
        //         path: '/css/v5/v5sch/'
        //     },
        //     Test: {
        //         protocol: 'http',
        //         ip: 'agw' + runMode + '.sk-iptv.com',
        //         port: '8080',
        //         path: '/css/v5/v5sch/'
        //     }
        // },
        IGS: {
            Live: {
                url: 'http://stimage.hanafostv.com:8080/igs/thumb_',
                bigSize: '_326x184.png',
                smallSize: '_282x158.png'
            }
        },
        AMS: {
            Live: {
                protocol: 'http',
                ip: '175.113.214.40',
                // ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/ServiceAction',
                // path: '/vswu/v5/ServiceAction/menuInfo701',
            },
            Test: {
                protocol: 'http',
                ip: 'vswu.hanafostv.com',
                // ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/ServiceAction',
                // path: '/vswu/v5/ServiceAction/menuInfo701',
            },
            PocCode: 'UHD2V5'
            //PocCode: 'UHDSTB2'
            // PocCode: 'BTVUH2V500'
        },
        EPS: {
            retry: 0,
            cancelTimeout: 5000,
            Live: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/eps/v5'
            },
            Test: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/eps/v5'
            }
        },
        PNS: {
            Live: {
                protocol: 'http',
                ip: runMode === '-dev' ? '1.255.85.68' : '175.113.214.95',
                port: '8090',
                path: '/v5'
            },
            Test: {
                protocol: 'http',
                ip: '1.255.85.68',
                port: '8090',
                path: '/v5'
            }
        },
        SMD: {
            retry: 0,
            cancelTimeout: 5000,
            Live: {
                protocol: 'http',
                // ip: 'agw' + runMode + '.sk-iptv.com',
                ip: runMode === '-dev' ? '1.255.85.159' : '175.113.214.119',
                port: '8080',
                // path: '/smd/v5'
                path: ''
            },
            Test: {
                protocol: 'http',
                // ip: 'agw' + runMode + '.sk-iptv.com',
                ip: '1.255.85.159',
                port: '8080',
                // path: '/smd/v5'
                path: ''
            }
        },
        OPMS: {     // ADS
            retry: 0,
            cancelTimeout: 5000,
            Live: {
                protocol: 'http',
                ip: runMode === '-dev' ? 'agw-dev.sk-iptv.com' : '175.113.214.33',
                port: '8080',
                path: '/opms/v5'
            },
            Test: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/opms/v5'
            }
        },
        DIS: {
            Live: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/dis/v5/'
            },
            Test: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/dis/v5/'
            }
        },
        CSS: {
            retry: 0,
            cancelTimeout: 5000,
            Live: {
                protocol: 'Http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/css/v5'
            },
            Test: {
                protocol: 'Http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/css/v5'
            }
        },
        RVS: {
            Live: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/rvs/v5'
            },
            Test: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/rvs/v5'
            }
        },
        WEPG: {
            Live: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/wepg/v5/epg-stbservice'
            },
            Test: {
                protocol: 'http',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8080',
                path: '/wepg/v5/epg-stbservice'
            }
        },
        IOS: {
            Live: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/ios/v5'
            },
            Test: {
                protocol: 'https',
                ip: 'agw' + runMode + '.sk-iptv.com',
                port: '8443',
                path: '/ios/v5'
            }
        },
        PPM: {
            Live: {
                protocol: 'https',
                ip: 'promotion.hanafostv.com',
                port: '8443',
                path: '/constant/UI5/pw_reset/reset_main.jsp'
            },
            Test: {
                protocol: 'https',
                ip: 'promotion.hanafostv.com',
                port: '8443',
                path: '/constant/UI5/pw_reset/reset_main.jsp'
            }
        },
        PPM_CANCEL: {
            Live: {
                protocol: 'https',
                ip: 'promotion.hanafostv.com',
                port: '8443',
                path: '/constant/UI5/PPMcancel/main.jsp'
            },
            Test: {
                protocol: 'https',
                ip: 'promotion.hanafostv.com',
                port: '8443',
                path: '/constant/UI5/PPMcancel/main.jsp'
            }
        },
        IMAGE: {
            // url: 'http://stimage.hanafostv.com:8080'
            // url: 'http://175.113.214.190:8080/thumbnails/iip',  // stage용
            url: runMode === '-dev' ? 'http://stimageqa.hanafostv.com:8080/thumbnails/iip' : 'http://175.113.214.190:8080/thumbnails/iip', //  stbInfo 에서 받은 값 사용
            //url: 'http://1.255.144.56:8080/thumbnails/iip',
            // url: 'https://stimageqa.hanafostv.com/thumbnails/iip',
            ver_size: '/293_422',
            hor_size: '/384_250',
            hor_pre_size: '/306_172',
            bigbanner_size: '/1920_360',
            synop_vod_content: '/188_270',
            synop_short_title: '/750_250',
            synop_series_title: '/450_150',
            synop_short_banner: '/824_220',
            synop_detail_slide: '/1315_618',
            synop_short_hero_none: '/378_540',
            synop_series_hero_none: '/242_350',
            monthly_banner_big: '/1920_400',
            monthly_banner_small: '/1920_360',
            kids: {
                kids_ver_size: '/248_354',
                kids_hor_size: '/306_180',
                kids_cw_size: '/384_250',
                kids_circle_size: '/180_180',
                kids_banner_c_size: '/1690_220',
                kids_banner_b_size: '/824_220',
                kids_banner_a_size: '/536_212',
                character_list: '/180_180',
                character_watch: '/208_117',
                sub_character: '/1920_1080',
                sub_character_block: '/306_172',
                sub_character_app: '/200_200',
                monthly_home: '/340_637_A20',
                monthly_banner_big: '/1920_400',
                monthly_banner_small: '/1920_360',
                character_home_focusOut: '/330_630_A20',
                character_home_focusIn: '/720_767_A20',
                playlearning_list: '/410_553_A20'
            },
            hero_size: '/1920_1080',
            stiilcut_size: '/1920_1080_30',
            monthly_block: '/438_288',
            event: {
                // single: '/1774_231',
                // couple: '/865_231',
                // triple: '/579_229',
                single: '/0_0',
                couple: '/0_0',
                triple: '/0_0',
            },
            menu_block_image: '/306_198',
            purchase_ppm_image: '/384_250',
        },
        LOCAL_URL: runDevice ? 'file:///data/btv_home/DATA/epg/menu_image/web' : '/assets/images',
        LOCAL_UPDATE_URL: runDevice ? 'file:///data/btv_home/DATA/epg/menu_image/update' : '/update',
        // LOCAL_URL: '/assets/images',

        IGSIMAGE: {
            url: 'http://stimage.hanafostv.com:8080/igs/thumb_'
        },
        NEXTUI: {
            url: '' // index.html의 현재 url 위치 기준으로 값 가져옴
        }
    },
    path: { //index.html 기준 경로
        name: 'skbb', 			// 프로젝트명 (영문 소문자)
        app: '../../js/', 		// 앱 개발 경로
        core: '../../cs-framework/',		// 프레임워크 코어 경로
        imageServer: 'http://stimage.hanafostv.com:8080',
        imageDefault: 'http://ost' + runMode + '.sk-iptv.com:8080/v1/AUTH_' + getImageKey(),
        swiftServer: 'http://ost' + runMode + '.sk-iptv.com:8080/v1/AUTH_',
    },
    STBInfo: {
        // SmartSTB: {
        //     stbId: '', //'{5F49081C-7BDD-11E7-AEAA-05066B5ECC13}',//'{649527D6-16D1-11E4-865F-7FC7676D350F}', {5AB04618-7BDD-11E7-AEAA-05066B5ECC13}
        //     stbModel: 'BKO-UH400',//'BKO-S200',
        //     swVersion: '10.300.5',
        //     ui_ver: '5.3.35',
        //     cug: '0',
        //     idPackage: '20',
        //     mac: '',//'94:3b:b1:1e:a2:e9' '80:8c:97:c:46:67' '80:8c:97:8:7:aa'
        //     PROPERTY_HASH_ID: 'ab2f7e1a692f55a4cee3d65e319a061ca114a314d434a01a7502435ec77e3bed'
        // },
        // testSTB: {
        //     stb_id: "{5F49081C-7BDD-11E7-AEAA-05066B5ECC13}",
        //     mac_address: "80:8c:97:8:7:aa"
        // },
        /* Smart Box
         stbId : '{E2317C54-17B9-11E4-B1D5-73FC0F8888C7}',
         stbModel : 'BKO-S200',
         swVersion : '5.23.66',
         ui_ver : '5.23.66',
         cug : '0',
         id_package : '20',
         */
        adultFlag: '1', 						//성인인증 설정 기능 여부 //설정값 (사용:1, 사용안함:0)
        // areaCode: '',							//지역코드
        bluetoothIcon: 'N',					//홈화면 상단 설정 버튼에 블루투스 아이콘 출력 여부(출력:Y, 출력안함:N)
        cloudVersion: '',						//Cloud 서비스 버전 (필수 옵션으로 반드시 존재해야함)
        bPoint: '0', 							//B포인트
        newBpoint: 'N',						//홈화면 또는 마이 Btv화면에서 B포인트 NEW 아이콘 출력 여부(출력:Y, 출력안함:N)
        coupon: '0', 							//쿠폰 갯수
        couponNew: 'Y',						//홈화면 또는 마이 Btv화면에서 쿠폰 NEW 아이콘 출력 여부(출력:Y, 출력안함:N)
        cug: '0',								//CUG 코드
        serverList: '',
        serverListMap: {},
        favChannelList: '',					//채널정보를 "서비스아이디^채널번호^채널이름"으로 구성하고 구분자('|')를 통해 복수개의 목록을 전달
        favChannelListMap: [],
        favVodList: '',						//VOD의 contentId를 구분자('|')를 통해 복수개의 목록을 전달 (id1|id2|id3)
        favVodListMap: [],						//전달된 favVodList를 Array로 저장
        favAppList: '',						//vass_id를 구분자('|')를 통해 복수개의 목록을 전달 (id1|id2|id3)
        favAppListMap: [],
        // homeAllMenu: '', 						//(Home)전체메뉴 순서 STB에 저장되어 있는 메뉴ID ('111'|'222'|'333') 4.0에서 사용하던 값
        // homeMyBtvMenu: [],						//(Home)마이Btv 메뉴 순서STB에 저장되어 있는 메뉴ID ('111'|'222'|'333') 4.0에서 사용하던 값
        ppmList: '',							//(Home)월정액 메뉴 리스트 prod_id ('111'|'222'|'333')
        ppmListMap: [],
        idPackage: '20',						//  PACKAGE_ID_NONE,  //< 초기값
        //  PACKAGE_ID_ECONOMY,  //< 10 : 경제형
        //  PACKAGE_ID_INTEGRATED, //< 15 : 통합형
        //  PACKAGE_ID_BASIC,  //< 20 : 기본형
        //  PACKAGE_ID_PREMIUM  //< 30 : 고급형
        informationNew: 'Y', 					//홈화면 상단 고객센터 버튼에 NEW 아이콘 출력 여부(출력:Y, 출력안함:N)
        ispType: '1',							//네트워크 회선 종류 (1 : SKB, 2 : KT, 3 : LGU+, 4 : 기타)
        keyPadType: 'PROPERTY_OLD_REMOCON_KEYPAD', 						//키패드 유형 신형: PROPERTY_NEW_REMOCON_KEYPAD / 구형: PROPERTY_OLD_REMOCON_KEYPAD
        level: '19', 							//시청연령제한
        CHILDRENSEELIMIT: "7",
        postcode: '',					//사용자 우편번호 (날씨위젯에서 사용) 현재 임의의값 사용 중 : 중구 명동7질 14-7
        purchaseFlag: '1', 					//구매인증 설정 기능 여부 //설정값 (사용:1, 사용안함:0)
        adultMovieMenu: '', // 19 영화 표기 여부 //설정값 (표기함:1, 표기안함:0, 메뉴삭제 : 2)
        erosMenu: '', // 19 플러스 표기 여부 // 설정값 (표기함:1, 표기안함:0, 메뉴삭제 : 2)
        purchaseCertification: "0",
        regionCode: 'mbc=1^kbs=41^sbs=61',
        regionCode2: 'mbc=1;kbs=41;sbs=61',
        MBC: '1',								//mbc region_code
        KBS1: '41',							//kbs region_code
        SBS: '61',								//sbs region_code
        seriesPlay: '1', 						//시리즈 연속 시청
        /* UHD STB */ // 20161201_YD : uhd 주석 품
        ui_name: 'BTVUH2V500',  //  POC
        stbId: '{DB083944-25A9-11E8-AD34-21E42E7495CA}',
        hashId: '6ef6b671745159550731c0a159901a3eb37e1bf714a6cfeace61e95190874b5e',
        mac: 'cc:4e:ec:cd:4:2e',  //  '0:2:14:12:76:2e',  //'80:8c:97:8:7:aa',
        //stbId: '{FBBF02AA-25A9-11E8-AD34-21E42E7495CA}',  // 조영선M STB
        //stbId: '{E86EB46D-25A9-11E8-AD34-21E42E7495CA}',    // #8 STB
        //hashId: 'c1a4c25cc27b60c385aff3324f5dddba39465e476dac1e1a2b7ffb2bb835c175',   // #8 STB
        //mac: '34:38:b7:0:d:7d',
        tokenGW: '',  // '5c867a36-2e2e-4fed-93da-dbc65adcb7fe', 
        //token: 'cab9a827-3f26-4e3b-ae0e-a6fad8e99324',
        Api_key: runMode === '-dev' ? 'l7xx4fa00822f3b34d04baa103b3a80d466b' : 'l7xx159a8ca72966400b886a93895ec9e2e3',
        // Api_key: 'l7xx4fa00822f3b34d04baa103b3a80d466b', // dev
        // Api_key: 'l7xx159a8ca72966400b886a93895ec9e2e3', // stage
        hdrSupport: 'false', // HDR 지원 여부(true - 지원함, false - 지원 안함)
        blueToothConnect: 'false', // 블루투스 연결 상태(true - 연결, false - 연결 해제)
        Trace: 'IPTV',
        Client_IP: '192.168.0.8',
        stbModel: 'BHX-UH400', // gslee BHX-S100 -> BHX-UH400
        swVersion: '10.500.31',
        userSex: '', // T-membership 고객 성별
        userBirth: '', // T-membership 고객 생년 월일
        uiVersion: '1.0.0',
        useBpoint: 'Y', 						//B포인트 월정액 차감 사용여부(Y/N)
        childrenSeeLimit: '', // 시청연령제한 (0, 7, 12, 15, 19)
        consecutivePlay: '', // 시리즈 연속 시청 사용여부(Y/N)
        remoconKeyPadSetting: '', // 키패드 유형 신형: PROPERTY_NEW_REMOCON_KEYPAD 구형: PROPERTY_OLD_REMOCON_KEYPAD
        userId: '',
        bPointPerMonthDeduct: '', // B포인트 월정액 차감 사용여부(Y/N)
        userIdSaved: '',						//사용자 ID 저장 여부(저장:Y, 저장안함:N)
        userPw: '',
        listViewOption: 'IMAGE|TITLE',			//텍스트/이미지|최신/이름  (TEXT:텍스트, IMAGE:이미지, NEW:최신, TITLE:가나다) IMAGE|TITLE, TEXT|NEW 형태로 전달
        listViewType: 'IMAGE',					//TEXT:텍스트, IMAGE:이미지
        listViewSort: 'NEW',					//NEW:최신, TITLE:가나다

        pssUseAgree: '1',						//이런영화 어때요? 1: 동의, 2: 미동의, 3: 선택안함
        giftServiceFlag: 'Y',	                //VOD 선물하기 등록 여부
        newVODGift: 'N',	                    // 새로 받은 VOD 선물 여부

        // For Test after checking valid, it will be deleted.
        T_MEMBERSHIP_BIRTH: '19900122',
        T_MEMBERSHIP_CARD_NO: '2833116196601320',
        T_MEMBERSHIP_GENDER: 'male',

        OCB_CARD_1: "171127",
        OCB_CARD_2: "",
        OCB_CARD_3: "",
        // For Test after checking valid, it will be deleted.

        tvpUseStatus: 'N',
        currentVodContentId: '',
        currentLiveServiceId: '',
        currentLiveChannelNum: '',
        searchKeywordHistory: '', //검색어 기록

        blockChList: '',//'901|332|12|321',        //차단 채널
        //  MeTV 서버와 마이그레이션 여부  //  UI 4.0 에서 UI 5.0 에서 업데이트 시 MeTV 서버 데이터와 마이그레이션 완료 여부 
        //  value : 마이그레이션 미완료 - 0, 마이그레이션 완료 - 1 (값이 없는 경우 미완료)
        // 체크가되서 사용한 경우 Property Key String (MIGRATION_ME_TV_DATA) 값을 1로 변경하여야 됨.
        migrationMeTv: '',

        blockChListMap: [],//['901','332','12','321'],      //차단 채널 배열

        ADULTMOVIEMENU: 0,     // 19 영화 표기 여부 ( 0 : 표기안함 , 1 : 표기함 , 2 : 메뉴 삭제 )
        EROSMENU: 0,           // 19 플러스 표기 여부 ( 0 : 표기안함 , 1 : 표기함 , 2 : 메뉴 삭제 )

        PROPERTY_B_POINT_PER_MONTH_DEDUCT: "", //(Y / N) 비포인트 월정액 자동 차감
        swiftServerId: getSwiftKey(),

        HDRsupport: false,
        keyUse: false,
    },
    // CANCEL: {
    //     '-dev': {
    //         url: 'https://1.255.231.162:8443/Test/constant/UI5/PPMcancel/main.jsp?ui_name=nxuhdstb'
    //     },
    //     '-stg': {
    //         url: 'http://175.113.214.98:8080/constant/UI5/PPMcancel/main.jsp'
    //     }
    // }
}

function getImageKey() {
    if (runMode === '-dev')
        return '4bba8feaf103463a87138dee46a804a2' +
            '/bff';
    else if (runMode === '-stg')
        return 'd266563b2cdd411b9e48f7acb52d848b' +
            '/bff';
    else
        return 'b588a2f7a77a4d7694995b135d0e498f' +
            '/bff/menu_image';
}

function getSwiftKey() {
    if (runMode === '-dev')
        return '4bba8feaf103463a87138dee46a804a2'
    else if (runMode === '-stg')
        return 'd266563b2cdd411b9e48f7acb52d848b'
    else
        return 'b588a2f7a77a4d7694995b135d0e498f'
}

export default appConfig;

window.AC = appConfig;

// for (item in AC.headEnd) {
//     if (AC.headEnd[item] !== undefined && AC.headEnd[item].Live !== undefined && AC.headEnd[item].Live.protocol !== undefined) {
//         console.log(item + '=' + AC.headEnd[item].Live.protocol + '://' + AC.headEnd[item].Live.ip + ':' + AC.headEnd[item].Live.port + AC.headEnd[item].Live.path);
//     }
// }

appConfig.STBInfo.tokenGW = '5c867a36-2e2e-4fed-93da-dbc65adcb7fe';
// if (!runDevice) {

//     let tokenGW = document.location.href.split('?')[1];
//     appConfig.STBInfo.tokenGW = tokenGW;
//     console.log('tokenGW', tokenGW);

//     if (!tokenGW) {
//         let verPath = '/token.txt';
//         try {
//             Axios.get(verPath).then(function (response) {
//                 console.log('tokenGW.data=', response.data);
//                 tokenGW = response.data;
//                 appConfig.STBInfo.tokenGW = tokenGW;
//                 Core.inst().initCallback();
//             });
//         }
//         catch (error) {
//             console.log('tokenGW.data', error);
//         }
//     }
// }
