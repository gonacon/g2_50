import React, { Component } from 'react'

import { MeTV, EPS, NXPG, SCS, IOS } from "./network";
import constants, { STB_PROP } from "../config/constants";
import Core from "./core";
import { cloneDeep } from 'lodash';
import _ from 'lodash';
import PurchaseFinish from './../routes/buy/popup/PurchaseFinish'
import BuyBill from './../routes/buy/view/BuyBill'
import BuyBillChannel from './../routes/buy/view/BuyBillChannel'
import BuyShort from './../routes/buy/view/BuyShort'
import BuyChannel from './../routes/buy/view/BuyChannel'
import BuyMonthly from './../routes/buy/view/BuyMonthly'
import StbInterface from './stbInterface';
import VODContinuePopup from './../popup/VODContinuePopup';
import appConfig from './../config/app-config';
import PopupConfirm from './../components/popup/PopupConfirm';
import AdultCertification from './../popup/AdultCertification';
import Utils from '../utils/utils';

export class CTSInfo extends Component {
    static MODE_PPV = "mode_ppv";
    static MODE_PPS = "mode_pps";
    static MODE_PPM = "mode_ppm";
    static MODE_PPM_HOME = 'mode_ppm_home';
    static MODE_PPP = 'mode_ppp';
    static MODE_VODPLUS = 'mode_vodplus';
    static MODE_BPOINT = 'mode_bpoint';
    static MODE_CHANNEL = 'mode_channel';

    static PPV = "10";
    static PPS = "20";
    static PPM = "30";
    static PPP = "41";

    static BILL_NORMAL = "bill_normal";
    static BILL_BPOINT = 'bill_bpoint';

    static purchase_data;
    static purchase_callback;

    static bRequestPrepareVOD = false;   //true:PrepareVOD
    static callbackCancel; // For native
    /**
     * 구매 전체 취소
     */
    static requestPurchaseAllCancel(bCallCB) {
        console.log('callbackCancel: ', CTSInfo.callbackCancel);
        if (bCallCB && typeof CTSInfo.callbackCancel === 'function') {
            CTSInfo.callbackCancel();
            CTSInfo.callbackCancel = undefined;
        }
        Core.inst().cancelPopup();
    }

    /**
     * 홈 월정액 구매
     * data = {
     *  pid: 상품 아이디
     * }
     */
    static purchasePPMByHome(data, callback) {
        CTSInfo.purchase_data = cloneDeep(data);
        CTSInfo.purchase_callback = callback;

        const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
        const param = {
            //에피소드 ID(xpg에 epsd_id)
            //(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
            //진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
            pid: data.pid, //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
            adult_flag: !_.isEmpty(data.adult_flag) ? data.adult_flag : '0',
            purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
        };
        SCS.request005(param)
            .then(data => {
                if (data.result === '0000') {
                    if (data.PREPAID === '1') {
                        Core.inst().showToast('이미 구매하신 상품입니다. 바로 시청해 주세요.');
                        CTSInfo.purchase_callback({ result: '1111' });  // 이미가입되어 있음
                    } else {
                        data.enterance = 1;
                        data.mode = CTSInfo.MODE_PPM_HOME;
                        data.PID = param.pid;
                        data.PTYPE = constants.PRD_TYP_CD.PPM;
                        if (typeof data.PROD_INFO.PROD_DTL === 'object') {
                            const temp = cloneDeep(data.PROD_INFO.PROD_DTL);
                            data.PROD_INFO.PROD_DTL = [];
                            data.PROD_INFO.PROD_DTL.push(temp);
                        }
                        Core.inst().showPopup(<BuyMonthly />, data, () => {
                            CTSInfo.requestPurchaseAllCancel(true);
                        });
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                    CTSInfo.purchase_callback({ result: null });
                    CTSInfo.requestPurchaseAllCancel(true);
                }
            });
    }

    /**
     * VOD 바로보기 (NXPG-010이 있는 경우 사용, NXPG-010데이터 없는 경우, requestVODOthers)
     * @param {*} data, callback 
     * data = {
     *   nxpg010,
     *   playInfo = {
     *      synopsis_type: '',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
     *      playType: '',   //default : 일반, corner : 코너별 보기, allCorner : 코너별 모아보기
     *      - cornerStartIndex: '', // 선택한 코너의 index, playType이 corner, allCorner인 경우 필수
     *      playOption: '', //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
     *                   //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
     *      prd_prc_id (시놉 바로보기, 시놉 외 진입인 경우 필수): 상품 아이디     
     *      ynSerise: 'N',   //시리즈 여부(Y/N)
     *      - isCatchUp(시리즈인 경우 조건형필수): '',  //시리즈 인 경우, MeTV의 isCatchUp 전달 (찜목록 등)
     *      - isAll(시리즈인 경우 필수): ''     //전편 구매 여부(Y/N)
     *      - epsd_id(시리즈인 경우 필수): ''   // 재생할 해당 회차의 epsd_id
     * 
     *      ynTeaser: '',   //예고편 재생 여부 (Y/N)
     *      - preview_start_index: 선택한 예고편 index
     *      ynSpecial: '',  //스페셜 재생 여부(Y/N)
     *      - special_start_index: 선택한 스페셜 index
     *  }
     * }
     */
    // 바로 재생인 경우
    // bShouldClose이 true인 경우, 전체 팝업 종료해야함.
    static requestWatchAfterPurchase(bShouldClose, pid) {
        if (!CTSInfo.bRequestPrepareVOD) {
            // PrepareVOD인 경우는 데이터 차이가 있어, 따로 재생하도록 한다.
            if (pid !== undefined && pid !== "") {
                CTSInfo.purchase_data.playInfo.prd_prc_id = pid;
            }
            CTSInfo.requestWatchVOD(CTSInfo.purchase_data, CTSInfo.purchase_callback, false, bShouldClose);
        }
        CTSInfo.purchase_data = "";
        CTSInfo.purchase_callback = "";
    }
    static requestWatchCorenr(data, callback) {
        if (data.playInfo.type === 'synopsis') {
            CTSInfo.requestWatchVOD(data, callback, true);
        } else {
            // VOD 재생 유형	playType			문자	필수	"default : 일반
            // corner : 코너별 보기
            // allCorner : 코너별 모아보기
            // preview : 예고편"
            // VOD 재생 옵션	playOption			문자	필수	"normal : 일반 시놉에서 재생할 경우
            // next : 재생 종료 후 다음 회차 재생
            // other : 재생 중 playbar를 통한 다른 회차 재생
            // smartRcu : SmartRCU를 통한 이어보기"
            //     search_type			문자	필수	"1 : epsd_id 기준 조회
            // 2 : epsd_rslu_id 기준 조회(con_id)"
            // 시리즈 아이디	sris_id			문자	필수	"재생할 VOD 시리즈 아이디
            // (search_type 이 1인 경우 필수)"
            // 에피소드 아이디	epsd_id			문자	필수	"재생할 VOD 에피소드 아이디
            // (search_type 이 1인 경우 필수)"
            // 에피소드 해상도 아이디	epsd_rslu_id			문자	필수	"재생할 VOD 에피소드 해상도 아이디
            // search_type 이 2인 경우 필수"
            // 콘텐츠 재생 시점	startTime			문자	필수	이어보기 시간 
            // 시청 경로	seeingPath			문자	필수	시청경로
            // 코너별 시청	groupId			문자	옵션	VOD_ALL_CORNER 요청 시 groupId 추가하여 전달
            //     fromCommerce			문자	필수	"T 커머스에서 진입한 요청하였는지 여부 (Y/N)
            // - Y 인 경우 재생 요청 시 fromCommerce 값을 Y 로 설정하여야 한다."
            // 예고편 요청 index	previewIndex			문자	선택	예고편인 경우 요청 index
            // 코너 아이디	cnr_id			문자	선택	코너별 보기, 코너별 모아보기인 경우 필수
            // 그룹 아이디	group_id			문자	선택	코너별 모아보기인 경우 필수
            const paramData = {
                playType: data.playInfo.playType,
                playOption: data.playInfo.playOption,
                search_type: data.playInfo.search_type,
                epsd_id: data.apiData.epsd_id,
                fromCommerce: 'N',
                cnr_id: data.apiData.cnr_id,
                group_id: data.apiData.group_id
            }

            CTSInfo.prepareVOD(paramData);
        }
    }

    static async requestWatchVODForUseGuide(epsd_rslu_id) {
        let xpg010Param = {};
        xpg010Param.search_type = '2';
        xpg010Param.epsd_rslu_id = epsd_rslu_id;
        let nxpg010 = await NXPG.request010(xpg010Param);
        if (nxpg010.result !== '0000') {
            Core.inst().showToast(nxpg010.result, nxpg010.reason);
            return;
        }
        let prd_prc_id;
        for (let i = 0; i < nxpg010.purchares.length; i++) {
            if (xpg010Param.epsd_rslu_id === nxpg010.purchares[i].epsd_rslu_id) {
                prd_prc_id = nxpg010.purchares[i].prd_prc_id;
            }
        }
        const playInfo = {
            synopsis_type: '05',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            seeingPath: '49',  //동영상 가이드를 통한 VOD 시청(마이Btv-동영상가이드-목록)
            playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
            ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
            playOption: 'normal',
            ynSerise: 'N',          //시리즈 여부(Y/N)
            isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
            isAll: 'N',             //전편 구매 여부(Y/N)    
            ynSpecial: 'N',
            epsd_rslu_id: xpg010Param.epsd_rslu_id,        //에피소드 해상도ID
            prd_prc_id: prd_prc_id
        }
        CTSInfo.requestWatchVOD({ playInfo: playInfo, nxpg010: nxpg010 }, null, true);
    }

    /**
     * VOD 바로보기 (NXPG-010이 없는 경우, 특히 시놉시스가 아닌, 키즈존 등 다른 화면에서 진입)
     * @param {*} data 
     *      synopsis_type: '',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
     *      search_type // 1:sris_id, epsd_id필수, 2: epsd_rslu_id 필수
     *      - sris_id(search_type가 1인 경우 필수)
     *      - epsd_id(search_type가 1인 경우 필수)
     *      - epsd_rslu_id(search_type가 2인 경우 필수): 재생하려는 해당 컨텐츠 해상도 아이디
     *      kidschar_id: '',    //키즈존에서 캐릭터 재생인 경우, menu_id값을 사용
     *      seeingPath
     */
    static async requestWatchVODForOthers(data) {
        let xpg010Param = {};
        xpg010Param.search_type = data.search_type;
        if (xpg010Param.search_type === '1') {
            xpg010Param.epsd_id = data.epsd_id;
            xpg010Param.sris_id = data.sris_id;
        } else {
            xpg010Param.epsd_rslu_id = data.epsd_rslu_id;
        }
        
        let nxpg010 = await NXPG.request010(xpg010Param);
        if (nxpg010.result !== '0000') {
            Core.inst().showToast(nxpg010.result, nxpg010.reason);
            return;
        }
        
        let products, prd_prc_id;
        if (nxpg010.contents.sris_typ_cd === '01') {
            products = nxpg010.contents.products;
        } else {
            products = nxpg010.purchares;
        }
        for (let i = 0; i < products.length; i++) {
            if (xpg010Param.search_type === '1') {
                if (nxpg010.contents.rslu_typ_cd === products[i].rslu_typ_cd) {
                    prd_prc_id = products[i].prd_prc_id;
                    xpg010Param.epsd_rslu_id = products[i].epsd_rslu_id;
                }
            } else {
                if (xpg010Param.epsd_rslu_id === products[i].epsd_rslu_id) {
                    prd_prc_id = products[i].prd_prc_id;
                }
            }
        }
        let playInfo = {
            synopsis_type: '05',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            seeingPath: data.seeingPath,  //동영상 가이드를 통한 VOD 시청(마이Btv-동영상가이드-목록)
            playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
            ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
            playOption: 'normal',
            ynSerise: nxpg010.contents.sris_typ_cd === '01' ? 'Y' : 'N',          //시리즈 여부(Y/N)
            isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
            isAll: 'N',             //전편 구매 여부(Y/N)    
            ynSpecial: 'N',
            epsd_rslu_id: xpg010Param.epsd_rslu_id,        //에피소드 해상도ID
            prd_prc_id: prd_prc_id
        }
        if (data.kidschar_id) {
            //키즈존 menu_id데이터
            playInfo.kidschar_id = data.kidschar_id;
        }
        CTSInfo.requestWatchVOD({ playInfo: playInfo, nxpg010: nxpg010 }, null, true);
    }

    static async requestWatchVOD(data, callback, bAdultCheck, bShouldClose) {
        console.log('requestWatchVOD');
        const nxpg010 = data.nxpg010
        const playInfo = data.playInfo;
        let products;

        if (nxpg010.contents.cacbro_yn === 'Y') {
            Core.inst().showToast('결방 회차입니다. 다른 회차를 선택해주세요.');
            return;
        }

        // 성인인증 팝업 발생
        if (bAdultCheck !== false && (data.bCheckedAdultLevel === undefined || data.bCheckedAdultLevel)) {
            const callbackData = { data: data, callback: null, };
            CTSInfo.checkLevelAndAdult(false, nxpg010.contents.adlt_lvl_cd, nxpg010.contents.wat_lvl_cd, CTSInfo.requestWatchVOD, callbackData, bShouldClose);
            return;
        }

        let synopInfo = {};
        try {
            const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
            let param = {
                pid: '',
                cid: '',
                ptype: '',
                synopsis_type: playInfo.synopsis_type, //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
                adult_flag: !_.isEmpty(playInfo.adult_flag) ? playInfo.adult_flag : '0',
                purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
            };
            if (playInfo.ynTeaser === 'Y') {
                playInfo.playType = CTSInfo.PLAYTYPE.VOD_PREVIEW;
                const preview_start_index = Number(playInfo.preview_start_index);
                param.pid = nxpg010.contents.preview[preview_start_index].prd_prc_id;
                param.cid = nxpg010.contents.preview[preview_start_index].epsd_rslu_id;
                param.ptype = '10';

                synopInfo.productInfo = {};
                synopInfo.productInfo.prd_prc_id = nxpg010.contents.preview[preview_start_index].prd_prc_id;
                synopInfo.productInfo.epsd_rslu_id = nxpg010.contents.preview[preview_start_index].epsd_rslu_id;

                if (nxpg010.contents.sris_typ_cd === '01') {
                    products = nxpg010.contents.products;
                } else {
                    products = nxpg010.purchares;
                }
                for (let i = 0; i < products.length; i++) {
                    if (products[i].rslu_typ_cd === nxpg010.contents.rslu_typ_cd) {
                        synopInfo.productInfo.ori_epsd_rslu_id = products[i].epsd_rslu_id;
                    }
                }
            } else if (playInfo.ynSpecial === 'Y') {
                playInfo.playType = CTSInfo.PLAYTYPE.VOD_SPECIAL;
                const special_start_index = Number(playInfo.special_start_index);
                param.pid = nxpg010.contents.special[special_start_index].prd_prc_id;
                param.cid = nxpg010.contents.special[special_start_index].epsd_rslu_id;
                param.ptype = '10';

                synopInfo.productInfo = {};
                synopInfo.productInfo.prd_prc_id = nxpg010.contents.special[special_start_index].prd_prc_id;
                synopInfo.productInfo.epsd_rslu_id = nxpg010.contents.special[special_start_index].epsd_rslu_id;
                if (nxpg010.contents.sris_typ_cd === '01') {
                    products = nxpg010.contents.products;
                } else {
                    products = nxpg010.purchares;
                }
                for (let i = 0; i < products.length; i++) {
                    if (products[i].rslu_typ_cd === nxpg010.contents.rslu_typ_cd) {
                        synopInfo.productInfo.ori_epsd_rslu_id = products[i].epsd_rslu_id;
                    }
                }
            } else if (nxpg010.contents.sris_typ_cd === '01') {
                if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER) {   // 코너별 모아보기 인 경우
                    if (_.isEmpty(data.nxpg016)) {
                        const nxpg016Param = {
                            cnr_grp_id: nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].cnr_grp_id
                        }
                        const nxpg016 = await NXPG.request016(nxpg016Param);
                        console.log('nxpg016: ', nxpg016);
                        if (nxpg016.result === '0000') {
                            synopInfo.nxpg016 = nxpg016;
                        } else {
                            Core.inst().showToast(nxpg016.result, nxpg016.reason);
                            return;
                        }
                    } else {
                        synopInfo.nxpg016 = data.nxpg016;
                    }

                    products = nxpg010.contents.products;
                    const epsd_rslu_id = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].epsd_rslu_id;

                    synopInfo.productInfo = {};
                    synopInfo.productInfo.epsd_id = nxpg010.contents.epsd_id;
                    for (let i = 0; i < products.length; i++) {
                        if (epsd_rslu_id === products[i].epsd_rslu_id) {
                            param.cid = products[i].epsd_rslu_id;
                            param.pid = products[i].prd_prc_id;
                            param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                            synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                            synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                            synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                            synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                            synopInfo.productInfo.sale_prc = products[i].sale_prc;
                            synopInfo.productInfo.possn_yn = products[i].possn_yn;
                        }
                    }
                } else if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_CORNER) {         //코너 보기 인 경우
                    const selectedCorner = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)];
                    synopInfo.productInfo = {};
                    synopInfo.productInfo.epsd_rslu_id = selectedCorner.epsd_rslu_id;
                    synopInfo.productInfo.epsd_id = nxpg010.contents.epsd_id;

                    products = nxpg010.contents.products;
                    const epsd_rslu_id = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].epsd_rslu_id;
                    for (let i = 0; i < products.length; i++) {
                        if (epsd_rslu_id === products[i].epsd_rslu_id) {
                            param.cid = products[i].epsd_rslu_id;
                            param.pid = products[i].prd_prc_id;
                            param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                            synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                            synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                            synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                            synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                            synopInfo.productInfo.sale_prc = products[i].sale_prc;
                            synopInfo.productInfo.possn_yn = products[i].possn_yn;
                        }
                    }
                } else {
                    products = nxpg010.contents.products;
                    synopInfo.productInfo = {};
                    synopInfo.productInfo.epsd_id = nxpg010.contents.epsd_id;
                    if (playInfo.prd_prc_id !== undefined) {
                        for (let i = 0; i < products.length; i++) {
                            if (playInfo.prd_prc_id === products[i].prd_prc_id) {
                                param.cid = products[i].epsd_rslu_id;
                                param.pid = products[i].prd_prc_id;
                                param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
    
                                synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                                synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                                synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                                synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                                synopInfo.productInfo.sale_prc = products[i].sale_prc;
                                synopInfo.productInfo.possn_yn = products[i].possn_yn;
                            }
                        }
                    } else {
                        for (let i = 0; i < products.length; i++) {
                            if (nxpg010.contents.rslu_typ_cd === products[i].rslu_typ_cd) {
                                param.cid = products[i].epsd_rslu_id;
                                param.pid = products[i].prd_prc_id;
                                param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                                synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                                synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                                synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                                synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                                synopInfo.productInfo.sale_prc = products[i].sale_prc;
                                synopInfo.productInfo.possn_yn = products[i].possn_yn;
                            }
                        }
                    }
                }
            } else {
                // epsd_id 에피소드 아이디
                // prd_prc_id 상품 가격 아이디
                // asis_prd_typ_cd 상품 유형 코드
                // epsd_rslu_id 해상도 아이디
                // rslu_typ_cd 해상도 유형 코드
                // sale_prc 가격정보
                // possn_yn 소장용 여부
                products = nxpg010.purchares;

                for (let i = 0; i < products.length; i++) {
                    if (products[i].prd_prc_id === playInfo.prd_prc_id) {
                        param.cid = products[i].epsd_rslu_id;
                        param.pid = products[i].prd_prc_id;
                        param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                        synopInfo.productInfo = {};
                        synopInfo.productInfo.epsd_id = products[i].epsd_id;
                        synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                        synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                        synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                        synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                        synopInfo.productInfo.sale_prc = products[i].sale_prc;
                        synopInfo.productInfo.possn_yn = products[i].possn_yn;
                    }
                }
            }

            synopInfo.nxpg010 = nxpg010;
            synopInfo.playInfo = data.playInfo;

            const requestSCS001 = await SCS.request001(param);
            if (requestSCS001.result !== '0000') {
                Core.inst().showToast(requestSCS001.result, requestSCS001.reason);
                return;
            }
            switch (requestSCS001.POPUP) {
                case '0':   // 이미 구매된 상품
                case '5':   //맛보기 상품
                case '8':   // 무료
                case '10':  // 선물 받은 상품
                    // OPT발급
                    const requestGWSVC001 = await SCS.requestGWSVC001({ cnt_url: requestSCS001.CTS_INFO.CNT_URL });
                    if (requestGWSVC001.result !== '0000') {
                        Core.inst().showToast(requestGWSVC001.result, requestGWSVC001.reason);
                        return;
                    }

                    if (requestSCS001.epsd_id === undefined) {
                        synopInfo.watch_time = "0";
                    } else {
                        const request024 = await MeTV.request024({ epsd_id: requestSCS001.epsd_id });
                        synopInfo.watch_time = request024.watch_time !== undefined ? request024.watch_time : "0";
                    }
                    synopInfo.wscsInfo = requestSCS001;
                    synopInfo.gwsvc001 = requestGWSVC001;

                    const resultData = CTSInfo.convertData(synopInfo);
                    CTSInfo.requestPlayVODToNative(resultData);
                    break;
                case '1':   // 유료 구매창 팝업
                case '2':   // 시청만료 구매창
                    // 시청 만료, 혹은 유료 구매창이므로 유료 팝업 발생
                    // 미구매시 해당 PID의 구매 프로세스 진행
                    if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER) {
                        if (_.isEmpty(data.nxpg016)) {
                            const nxpg016Param = {
                                cnr_grp_id: nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].cnr_grp_id
                            }
                            const nxpg016 = await NXPG.request016(nxpg016Param);
                            console.log('nxpg016: ', nxpg016);
                            if (nxpg016.result === '0000') {
                                synopInfo.nxpg016 = nxpg016;
                            } else {
                                Core.inst().showToast(nxpg016.result, nxpg016.reason);
                                return;
                            }
                        } else {
                            synopInfo.nxpg016 = data.nxpg016;
                        }

                        CTSInfo.checkCornerAllPlay(data, synopInfo, requestSCS001, callback);
                    } else {
                        synopInfo.playInfo.epsd_id = requestSCS001.epsd_id;
                        if (data.playInfo.prd_prc_id !== undefined) {
                            synopInfo.playInfo.prd_prc_id = data.playInfo.prd_prc_id;
                        } else {
                            synopInfo.playInfo.prd_prc_id = requestSCS001.PROD_INFO[0].PROD_DTL[0].PID;
                        }
                        CTSInfo.purchaseContent(synopInfo, callback);
                    }
                    break;
                // 아래 정보들은 따로 처리하지 않는다.(H/E에서 데이터가 내려올 일이 없다고 함. by.김응균 매니저님)
                case '3':   // 추가광고 시청 할인 구매창(금액)
                case '4':   // 추가 광고 무료 시청
                case '6':   // 상품 변경 유도
                case '7':   // 추가 광고 할인 & 시청 기간 만료
                case '9':   // 예약
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error);
            Core.inst().showToast("잠시후 다시 시도해 주세요.");
        }
    }

    static requestPlayVODToNative(resultData) {
        if (!appConfig.runDevice) {
            // 웹앱에서 테스트를 위한 코드임.
            // 코너 바로보기, 코너별 모아보기, 구간 반복재생은 이어보기 팝업을 제공하지 않는다.
            if ((resultData.playType !== CTSInfo.PLAYTYPE.VOD_CORNER
                && resultData.playType !== CTSInfo.PLAYTYPE.VOD_ALL_CORNER
                && resultData.startTime !== "0")
                && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEAT && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEATVOD && resultData.useStartTime !== 'Y') {
                Core.inst().showPopup(<VODContinuePopup />, resultData, CTSInfo.callbackVODContinue);
            } else {
                resultData.cnt_url = resultData.cnt_url + '&rp=' + resultData.startTime;    //Content URL + OPT조합하여 사용
                CTSInfo.requestPurchaseAllCancel(false);
                StbInterface.requestPlayVod(resultData, null);
            }
        } else {
            // VOD 반복 재생의 경우, 현재 재생중인 컨텐츠 판단하지 않음.
            if (resultData.playType === CTSInfo.PLAYTYPE.VOD_REPEATVOD) {
                // 코너 바로보기, 코너별 모아보기, 구간반복재생은 이어보기 팝업을 제공하지 않는다.
                if ((resultData.playType !== CTSInfo.PLAYTYPE.VOD_CORNER && resultData.playType !== CTSInfo.PLAYTYPE.VOD_ALL_CORNER
                    && resultData.startTime !== "0") && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEAT && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEATVOD && resultData.useStartTime !== 'Y') {
                    Core.inst().showPopup(<VODContinuePopup />, resultData, CTSInfo.callbackVODContinue);
                } else {
                    resultData.cnt_url = resultData.cnt_url + '&rp=' + resultData.startTime;    //Content URL + OPT조합하여 사용
                    CTSInfo.requestPurchaseAllCancel(false);
                    StbInterface.requestPlayVod(resultData, null);
                }
            } else {
                CTSInfo.getCurrentPlayVOD((info) => {
                    let epsd_rslu_id = resultData.synopsisInfo.epsd_rslu_id;
                    if (!_.isEmpty(resultData.synopsisInfo.org_epsd_rslu_id)) {
                        if (resultData.playType === CTSInfo.PLAYTYPE.VOD_PREVIEW || resultData.playType === CTSInfo.PLAYTYPE.VOD_SPECIAL) {
                            epsd_rslu_id = resultData.synopsisInfo.preview[resultData.synopsisInfo.preview_start_index].epsd_rslu_id;
                        }
                    }
                    if (info.isPlayType === 'VOD' && info.contentId === epsd_rslu_id) {
                        Core.inst().showToast('현재 시청 중인 콘텐츠입니다.');
                    } else {
                        // 코너 바로보기, 코너별 모아보기, 구간반복재생은 이어보기 팝업을 제공하지 않는다.
                        if ((resultData.playType !== CTSInfo.PLAYTYPE.VOD_CORNER && resultData.playType !== CTSInfo.PLAYTYPE.VOD_ALL_CORNER
                            && resultData.startTime !== "0") && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEAT && resultData.playType !== CTSInfo.PLAYTYPE.VOD_REPEATVOD && resultData.useStartTime !== 'Y') {
                            Core.inst().showPopup(<VODContinuePopup />, resultData, CTSInfo.callbackVODContinue);
                        } else {
                            resultData.cnt_url = resultData.cnt_url + '&rp=' + resultData.startTime;    //Content URL + OPT조합하여 사용
                            CTSInfo.requestPurchaseAllCancel(false);
                            StbInterface.requestPlayVod(resultData, null);
                        }
                    }
                });
            }

        }

    }
    static callbackVODContinue(info) {
        console.log('info: ', info);
        if (info === undefined) {
            CTSInfo.requestPurchaseAllCancel(true);
        } else {
            if (Number(info.startTime) > 0) {
                //이어보기 팝업에서 확인을 받았을 때 Y로 설정 (Y/N), 로딩광고 재생을 하지 않음
                info.data.seamless = 'Y';
            } else {
                info.data.seamless = 'N';
            }
            info.data.startTime = info.startTime;
            info.data.cnt_url = info.data.cnt_url + '&rp=' + info.data.startTime;    //Content URL + OPT조합하여 사용
            CTSInfo.requestPurchaseAllCancel(false);
            StbInterface.requestPlayVod(info.data, null);
        }
    }

    // Prepare VOD
    //     playType,			//  VOD_CORNER : 코너별 보기
    //                         //  VOD_ALL_CORNER : 코너별 모아보기
    //                         //  VOD_PLAY : 일반
    //                          // preview
    //     playOption,			//  NORMAL : 일반 시놉에서 재생할 경우
    //                         //  NEXT : 재생 종료 후 다음 회차 재생
    //                         //  OTHER : 재생 중 playbar를 통한 다른 회차 재생
    //                         //  SMART_RCU : SmartRCU를 통한 이어보기
    //      search_type,        //1 : epsd_id 기준 조회
    //                          //2 : epsd_rslu_id 기준 조회(con_id)
    //     sris_id
    //      epsd_id
    //     epsd_rslu_id	,  //  재생할 VOD 해상도 ID
    //     startTime	,  //  이어보기 시간 
    //     seeingPath	,  //  시청경로
    //     groupId		,  //  VOD_ALL_CORNER 요청 시 groupId 추가하여 전달
    static async prepareVOD(paramData, callbackCancel) {
        console.log('prepareVOD: ', paramData);

        CTSInfo.bRequestPrepareVOD = true;
        CTSInfo.callbackCancel = callbackCancel;

        let xpg010Param = {};
        xpg010Param.search_type = paramData.search_type;
        if (xpg010Param.search_type === '1') {
            xpg010Param.sris_id = paramData.sris_id;
            xpg010Param.epsd_id = paramData.epsd_id;
        } else {
            xpg010Param.epsd_rslu_id = paramData.epsd_rslu_id;
        }

        let synopInfo = {}, nxpg010;
        if (!_.isEmpty(paramData.nxpg010)) {
            nxpg010 = paramData.nxpg010;
        } else {
            nxpg010 = await NXPG.request010(xpg010Param);
            paramData.nxpg010 = nxpg010;
            if (nxpg010.result !== '0000') {
                Core.inst().showToast(nxpg010.result, nxpg010.reason);
                if (paramData.playOption === CTSInfo.PALYOPTION.NEXT) {
                    // 다음화 재생을 실패한 경우 VOD STOP을 호출해준다.
                    StbInterface.requestStopVod();
                }
                CTSInfo.requestPurchaseAllCancel(true);
                return;
            }
        }

        if (paramData.bCheckedAdultLevel === undefined || paramData.bCheckedAdultLevel) {
            const callbackData = { data: paramData, callback: CTSInfo.callbackCancel };
            CTSInfo.checkLevelAndAdult(true, nxpg010.contents.adlt_lvl_cd, nxpg010.contents.wat_lvl_cd, CTSInfo.prepareVOD, callbackData);
            return;
        }

        //시리즈 VOD 또는 코너별 모아보기 시청 중 다음 회차가 결방인 경우, 다음 회차 재생
        if (paramData.playOption === 'NEXT' && nxpg010.contents.cacbro_yn === 'Y') {
            // 시리즈 VOD 시청 중 다음 회차가 결방인 경우, 다음 회차 재생
            const series_info = nxpg010.contents.series_info;
            let checkIdx = -1;
            for (let i = 0; i < series_info.length; i++) {
                if (series_info[i].epsd_id === nxpg010.contents.epsd_id) {
                    checkIdx = i + 1;
                    if (series_info[i].cacbro_yn === 'N') {
                        xpg010Param.search_type = '1';
                        paramData.sris_id = series_info[checkIdx].sris_id;
                        paramData.epsd_id = series_info[checkIdx].epsd_id;
                        CTSInfo.prepareVOD(paramData, CTSInfo.callbackCancel);
                        return;
                    }
                } else if (checkIdx > 0 && checkIdx >= i) {
                    if (series_info[checkIdx].cacbro_yn === 'N') {
                        xpg010Param.search_type = '1';
                        paramData.sris_id = series_info[checkIdx].sris_id;
                        paramData.epsd_id = series_info[checkIdx].epsd_id;
                        CTSInfo.prepareVOD(paramData, CTSInfo.callbackCancel);
                        return;
                    } else {
                        checkIdx++;
                    }
                }
            }
        } else if (paramData.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER && nxpg010.contents.cacbro_yn === 'Y') {
            //코너별 모아보기 시청 중 다음 회차가 결방인 경우, 다음 회차 재생
            const corners = nxpg010.contents.corners;
            let checkIdx = -1;
            for (let i = 0; i < corners.length; i++) {
                if (corners[i].cnr_id === paramData.cnr_id) {
                    checkIdx = i + 1;
                    if (corners[i].cacbro_yn === 'N') {
                        xpg010Param.search_type = '2';
                        paramData.epsd_id = corners[checkIdx].epsd_rslu_id;
                        CTSInfo.prepareVOD(paramData, CTSInfo.callbackCancel);
                        return;
                    }
                } else if (checkIdx > 0 && checkIdx >= i) {
                    if (corners[i].cacbro_yn === 'N') {
                        xpg010Param.search_type = '2';
                        paramData.epsd_id = corners[checkIdx].epsd_rslu_id;
                        CTSInfo.prepareVOD(paramData, CTSInfo.callbackCancel);
                        return;
                    } else {
                        checkIdx++;
                    }
                }
            }
        }
        let cornerStartIndex = 0;
        if (paramData.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER || paramData.playType === CTSInfo.PLAYTYPE.VOD_CORNER) {
            if (_.isEmpty(nxpg010.contents.corners)) {
                Core.inst().showToast('코너 정보가 없어 재생할 수 없습니다.');
                return;
            } else {
                for (let i = 0; i < nxpg010.contents.corners.length; i++) {
                    if (nxpg010.contents.corners[i].cnr_id === paramData.cnr_id) {
                        cornerStartIndex = i;
                    }
                }
            }
        }

        const playInfo = {
            // [2018.05.17][김응균매니저님 확인]
            // 시놉시스 타입의 경우, PrepareVOD는 알 수가 없어서, 시리즈인 경우, 02 그외에는 01로 전달한다.
            synopsis_type: nxpg010.contents.sris_typ_cd === '01' ? '02' : '01',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            playType: paramData.playType,   //default : 일반, corner : 코너별 보기, allCorner : 코너별 모아보기
            playOption: paramData.playOption, //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
            //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
            ynTeaser: paramData.playType === CTSInfo.PLAYTYPE.VOD_PREVIEW ? 'Y' : 'N',   //예고편 재생 여부 (Y/N)
            ynSpecial: paramData.playType === CTSInfo.PLAYTYPE.VOD_SPECIAL ? 'Y' : 'N',   //스페셜 재생 여부 (Y/N)
            cnr_id: paramData.cnr_id,
            cornerStartIndex: cornerStartIndex,
            ynSerise: nxpg010.contents.sris_typ_cd === '01' ? 'Y' : 'N',   //시리즈 여부(Y/N)
            isCatchUp: 'N',  //시리즈 인 경우, MeTV의 isCatchUp 전달
            preview_start_index: paramData.previewIndex,
            special_start_index: paramData.previewIndex,
            startTime: paramData.startTime,
            endTime: paramData.endTime,
            seeingPath: paramData.seeingPath,
            groupId: paramData.groupId,
            fromCommerce: paramData.fromCommerce,
            useStartTime: paramData.useStartTime,
            repeatIndex: paramData.repeatIndex,
            adult_flag: paramData.adult_flag
        }

        let products;
        if (nxpg010.contents.sris_typ_cd === '01') {    //시리즈
            for (let i = 0; i < nxpg010.contents.products.length; i++) {
                if (nxpg010.contents.products[i].rslu_typ_cd === nxpg010.contents.rslu_typ_cd) {
                    products = nxpg010.contents.products[i];
                }
            }
        }

        if (!_.isEmpty(products) && nxpg010.contents.sris_typ_cd === '01' && (nxpg010.contents.gstn_yn === 'Y' || products.prd_prc === 0)) {
            // 시리즈의 맛보기 혹은 무료 상품이므로 재생을 한다.
            let resultInfo = {};
            resultInfo.epsd_id = products.epsd_id;
            resultInfo.prd_prc_id = products.prd_prc_id;
            resultInfo.asis_prd_typ_cd = products.asis_prd_typ_cd;
            resultInfo.epsd_rslu_id = products.epsd_rslu_id;
            resultInfo.rslu_typ_cd = products.rslu_typ_cd;
            resultInfo.sale_prc = products.sale_prc;
            resultInfo.possn_yn = products.possn_yn;

            synopInfo.nxpg010 = nxpg010;
            synopInfo.productInfo = resultInfo;
            synopInfo.playInfo = playInfo;
            console.log('productInfo : ', synopInfo);
            CTSInfo.prepareVODPlayVOD(paramData, synopInfo);
        } else if (paramData.playType === CTSInfo.PLAYTYPE.VOD_PREVIEW || playInfo.ynTeaser === 'Y') {
            // 예고편 재생인 경우, 
            const preview_start_index = Number(playInfo.preview_start_index);
            let products;
            if (nxpg010.contents.sris_typ_cd === '01') {
                products = nxpg010.contents.products;
            } else {
                products = nxpg010.purchares;
            }
            let resultInfo = {};
            for (let i = 0; i < products.length; i++) {
                if (products[i].rslu_typ_cd === nxpg010.contents.rslu_typ_cd) {
                    resultInfo.epsd_id = products[i].epsd_id;
                    resultInfo.ori_epsd_rslu_id = products[i].epsd_rslu_id;
                    resultInfo.prd_prc_id = nxpg010.contents.preview[preview_start_index].prd_prc_id;
                    resultInfo.epsd_rslu_id = nxpg010.contents.preview[preview_start_index].epsd_rslu_id;
                    resultInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                    resultInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                    resultInfo.sale_prc = products[i].sale_prc;
                    resultInfo.possn_yn = products[i].possn_yn;
                }
            }

            synopInfo.nxpg010 = nxpg010;
            synopInfo.productInfo = resultInfo;
            synopInfo.playInfo = playInfo;
            CTSInfo.prepareVODPlayVOD(paramData, synopInfo);
        } else {
            let purchares;
            let pid = "";
            if (nxpg010.contents.sris_typ_cd === '01') {                //시리즈 상품
                purchares = nxpg010.contents.products;
                for (let i = 0; i < nxpg010.contents.products.length; i++) {
                    if (pid === "") {
                        pid = nxpg010.contents.products[i].prd_prc_id;
                    } else {
                        pid = pid + "," + nxpg010.contents.products[i].prd_prc_id;
                    }
                }
            } else {
                purchares = nxpg010.purchares;
                for (let i = 0; i < purchares.length; i++) {
                    if (pid === "") {
                        pid = purchares[i].prd_prc_id;
                    } else {
                        pid = pid + "," + purchares[i].prd_prc_id;
                    }
                }
            }
            const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
            const param = {
                //에피소드 ID(xpg에 epsd_id)
                //(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
                //진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
                synopsis_type: playInfo.synopsis_type, //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
                epsd_id: nxpg010.contents.epsd_id,
                sris_id: nxpg010.contents.sris_id,    //시리즈 ID(시놉에서 진입한 시리즈 ID, xpg에 sris_id)
                pid: pid, //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
                ptype: '10',          //상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
                adult_flag: !_.isEmpty(playInfo.adult_flag) ? playInfo.adult_flag : '0',
                purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
            };
            SCS.request004(param)
                .then(async data => {
                    if (data.result === '0000') {
                        if (data.PREPAID_PID !== "") {
                            //기구매 상품 혹은 무료인 경우는 재생을 한다.
                            const PREPAID_PID_LIST = data.PREPAID_PID.split(',');

                            let resultInfo = {};
                            if (!_.isEmpty(nxpg010.contents.products)) {
                                resultInfo.epsd_id = nxpg010.contents.epsd_id;
                                for (let i = 0; i < PREPAID_PID_LIST.length; i++) {
                                    for (let j = 0; j < purchares.length; j++) {
                                        if (PREPAID_PID_LIST[i] === purchares[j].prd_prc_id) {
                                            purchares = nxpg010.contents.products;
                                            resultInfo.prd_prc_id = purchares[j].prd_prc_id;
                                            resultInfo.asis_prd_typ_cd = purchares[j].asis_prd_typ_cd;
                                            resultInfo.epsd_rslu_id = purchares[j].epsd_rslu_id;
                                            resultInfo.rslu_typ_cd = purchares[j].rslu_typ_cd;
                                            resultInfo.sale_prc = purchares[j].sale_prc;
                                            resultInfo.possn_yn = purchares[j].possn_yn;
                                        }
                                    }
                                }
                            } else {
                                for (let i = 0; i < PREPAID_PID_LIST.length; i++) {
                                    for (let j = 0; j < purchares.length; j++) {
                                        if (PREPAID_PID_LIST[i] === purchares[j].prd_prc_id) {
                                            if (_.isEmpty(resultInfo) || Number(resultInfo.rslu_typ_cd) < Number(purchares[j].rslu_typ_cd)) {
                                                resultInfo.epsd_id = purchares[j].epsd_id;
                                                resultInfo.prd_prc_id = purchares[j].prd_prc_id;
                                                resultInfo.asis_prd_typ_cd = purchares[j].asis_prd_typ_cd;
                                                resultInfo.epsd_rslu_id = purchares[j].epsd_rslu_id;
                                                resultInfo.rslu_typ_cd = purchares[j].rslu_typ_cd;
                                                resultInfo.sale_prc = purchares[j].sale_prc;
                                                resultInfo.possn_yn = purchares[j].possn_yn;
                                            }
                                        }
                                    }
                                }
                            }

                            synopInfo.nxpg010 = nxpg010;
                            synopInfo.productInfo = resultInfo;
                            synopInfo.playInfo = playInfo;
                            console.log('productInfo : ', synopInfo);
                            CTSInfo.prepareVODPlayVOD(paramData, synopInfo);
                        } else {
                            if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER) {
                                if (_.isEmpty(paramData.nxpg016)) {
                                    const nxpg016Param = {
                                        cnr_grp_id: nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].cnr_grp_id
                                    }
                                    const nxpg016 = await NXPG.request016(nxpg016Param);
                                    console.log('nxpg016: ', nxpg016);
                                    if (nxpg016.result === '0000') {
                                        synopInfo.nxpg016 = nxpg016;
                                    } else {
                                        Core.inst().showToast(nxpg016.result, nxpg016.reason);
                                        return;
                                    }
                                } else {
                                    synopInfo.nxpg016 = paramData.nxpg016;
                                }
                                synopInfo.nxpg010 = nxpg010;
                                synopInfo.playInfo = playInfo;
                                data.PID = param.pid;
                                data.synopsis_type = param.synopsis_type;
                                data.PTYPE = param.ptype;
                                CTSInfo.checkCornerAllPlaySCS004(paramData, synopInfo, data, callbackCancel);
                            } else {
                                // 구매 완료 후, 사용할 데이터 저장
                                synopInfo.nxpg010 = nxpg010;
                                synopInfo.playInfo = playInfo;
                                const saveDate = {
                                    paramData: paramData,
                                    synopInfo: synopInfo
                                };
                                CTSInfo.purchase_data = cloneDeep(saveDate);
                                CTSInfo.purchase_callback = CTSInfo.callbackPrepaidVOD;

                                let products;
                                for (let i = 0; i < data.PROD_INFO.length; i++) {
                                    for (let j = 0; j < data.PROD_INFO[i].PROD_DTL.length; j++) {
                                        if (nxpg010.contents.sris_typ_cd === '01') {
                                            products = nxpg010.contents.products;
                                        } else {
                                            products = nxpg010.purchares;
                                        }
                                        for (let k = 0; k < products.length; k++) {
                                            if (data.PROD_INFO[i].PROD_DTL[j].PID === products[k].prd_prc_id) {
                                                data.PROD_INFO[i].PROD_DTL[j].prd_prc_to_dt = products[k].prd_prc_to_dt;
                                                data.PROD_INFO[i].PROD_DTL[j].ORI_PRICE = products[k].prd_prc_vat;
                                                if (nxpg010.contents.sris_typ_cd === '01' && constants.PRD_TYP_CD.PPV === products[k].asis_prd_typ_cd) {
                                                    // 시즌이고 회차 구매인 경우 타이틀에 회차정보 붙여서 사용한다.
                                                    data.PROD_INFO[i].PROD_DTL[j].PNAME = nxpg010.contents.title + " " + nxpg010.contents.brcast_tseq_nm + "회";
                                                }
                                            }
                                        }
                                    }
                                }

                                // 구매 상품이 없으므로 구매를 한다.
                                if (data.PROD_INFO.length === 1 && data.PROD_INFO[0].PROD_DTL.length === 1) {
                                    data.enterance = 1;
                                    data.PID = param.pid;
                                    data.synopsis_type = param.synopsis_type;
                                    data.PTYPE = param.ptype;
                                    data.PROD_INFO[0].PROD_DTL = data.PROD_INFO[0].PROD_DTL[0];
                                    data.PROD_INFO = data.PROD_INFO[0];
                                    Core.inst().showPopup(<BuyBill />, data, () => {
                                        CTSInfo.requestPurchaseAllCancel(true);
                                    });
                                } else {
                                    data.enterance = 1;
                                    data.PID = param.pid;
                                    data.synopsis_type = param.synopsis_type;
                                    data.PTYPE = param.ptype;
                                    Core.inst().showPopup(<BuyShort />, data, () => {
                                        CTSInfo.requestPurchaseAllCancel(true);
                                    });
                                }
                            }
                        }
                    } else {
                        if (paramData.playOption === CTSInfo.PALYOPTION.NEXT) {
                            // 다음화 재생을 실패한 경우 VOD STOP을 호출해준다.
                            StbInterface.requestStopVod();
                        }
                        Core.inst().showToast(data.result, data.reason);
                        CTSInfo.requestPurchaseAllCancel(true);
                    }
                }, () => {
                    if (paramData.playOption === CTSInfo.PALYOPTION.NEXT) {
                        // 다음화 재생을 실패한 경우 VOD STOP을 호출해준다.
                        StbInterface.requestStopVod();
                    }
                    Core.inst().showToast("잠시후 다시 시도해주세요.");
                    CTSInfo.requestPurchaseAllCancel(true);
                });
        }
    }
    static async prepareVODPlayVOD(paramData, synopInfo) {
        try {
            const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
            const param = {
                cid: synopInfo.productInfo.epsd_rslu_id,
                pid: synopInfo.productInfo.prd_prc_id,
                synopsis_type: synopInfo.playInfo.synopsis_type,    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
                ptype: CTSInfo.PPV,   // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
                adult_flag: !_.isEmpty(synopInfo.playInfo.adult_flag) ? synopInfo.playInfo.adult_flag : '0',
                purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
            };

            const playInfo = synopInfo.playInfo;
            let nxpg010 = synopInfo.nxpg010;

            if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER) {   // 코너별 모아보기 인 경우
                if (_.isEmpty(synopInfo.nxpg016)) {
                    const nxpg016Param = {
                        cnr_grp_id: nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].cnr_grp_id
                    }
                    const nxpg016 = await NXPG.request016(nxpg016Param);
                    console.log('nxpg016: ', nxpg016);
                    if (nxpg016.result === '0000') {
                        synopInfo.nxpg016 = nxpg016;
                    } else {
                        Core.inst().showToast(nxpg016.result, nxpg016.reason);
                        CTSInfo.requestPurchaseAllCancel(true);
                        return;
                    }
                }

                let products = nxpg010.contents.products;
                synopInfo.productInfo = {};
                const epsd_rslu_id = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].epsd_rslu_id;
                for (let i = 0; i < products.length; i++) {
                    if (epsd_rslu_id === products[i].epsd_rslu_id) {
                        param.cid = products[i].epsd_rslu_id;
                        param.pid = products[i].prd_prc_id;
                        param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                        synopInfo.productInfo.epsd_id = products[i].epsd_id;
                        synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                        synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                        synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                        synopInfo.productInfo.rslu_typ_cd = nxpg010.contents.rslu_typ_cd;
                        synopInfo.productInfo.sale_prc = products[i].sale_prc;
                        synopInfo.productInfo.possn_yn = products[i].possn_yn;
                    }
                }
            } else if (playInfo.playType === CTSInfo.PLAYTYPE.VOD_CORNER) {         //코너 보기 인 경우
                const selectedCorner = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)];
                synopInfo.productInfo = {};
                synopInfo.productInfo.epsd_rslu_id = selectedCorner.epsd_rslu_id;

                let products = nxpg010.contents.products;
                const epsd_rslu_id = nxpg010.contents.corners[Number(playInfo.cornerStartIndex)].epsd_rslu_id;
                for (let i = 0; i < products.length; i++) {
                    if (epsd_rslu_id === products[i].epsd_rslu_id) {
                        param.cid = products[i].epsd_rslu_id;
                        param.pid = products[i].prd_prc_id;
                        param.ptype = products[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                        synopInfo.productInfo.epsd_id = products[i].epsd_id;
                        synopInfo.productInfo.prd_prc_id = products[i].prd_prc_id;
                        synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                        synopInfo.productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                        synopInfo.productInfo.rslu_typ_cd = nxpg010.contents.rslu_typ_cd;
                        synopInfo.productInfo.sale_prc = products[i].sale_prc;
                        synopInfo.productInfo.possn_yn = products[i].possn_yn;
                    }
                }
            } else if (playInfo.ynTeaser === 'Y') { //예고편 인 경우
                playInfo.playType = CTSInfo.PLAYTYPE.VOD_PREVIEW;
                const preview_start_index = Number(playInfo.preview_start_index);
                param.pid = nxpg010.contents.preview[preview_start_index].prd_prc_id;
                param.cid = nxpg010.contents.preview[preview_start_index].epsd_rslu_id;
                param.ptype = '10'; //test

                synopInfo.productInfo = {};
                synopInfo.productInfo.brcast_tseq_nm = playInfo.brcast_tseq_nm;

                let products;
                if (nxpg010.contents.sris_typ_cd === '01') {
                    products = nxpg010.contents.products;
                } else {
                    products = nxpg010.purchares;
                }
                for (let i = 0; i < products.length; i++) {
                    if (products[i].rslu_typ_cd === nxpg010.contents.rslu_typ_cd) {
                        synopInfo.productInfo.epsd_id = products[i].epsd_id;
                        synopInfo.productInfo.ori_epsd_rslu_id = products[i].epsd_rslu_id;
                        synopInfo.productInfo.prd_prc_id = nxpg010.contents.preview[preview_start_index].prd_prc_id;
                        synopInfo.productInfo.epsd_rslu_id = nxpg010.contents.preview[preview_start_index].epsd_rslu_id;
                        synopInfo.productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                        synopInfo.productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                        synopInfo.productInfo.sale_prc = products[i].sale_prc;
                        synopInfo.productInfo.possn_yn = products[i].possn_yn;
                    }
                }
            } else if (playInfo.ynSpecial === 'Y') {
                playInfo.playType = CTSInfo.PLAYTYPE.VOD_SPECIAL;
                const special_start_index = Number(playInfo.special_start_index);
                param.pid = nxpg010.contents.special[special_start_index].prd_prc_id;
                param.cid = nxpg010.contents.special[special_start_index].epsd_rslu_id;
                param.ptype = '10';

                synopInfo.productInfo = {};
                synopInfo.productInfo.brcast_tseq_nm = playInfo.brcast_tseq_nm;
                synopInfo.productInfo.prd_prc_id = nxpg010.contents.special[special_start_index].prd_prc_id.prd_prc_id;
                synopInfo.productInfo.epsd_rslu_id = synopInfo.productInfo.epsd_rslu_id;// nxpg010.contents.special[special_start_index].epsd_rslu_id;
            } else if (nxpg010.contents.sris_typ_cd === '01') {
                param.cid = synopInfo.productInfo.epsd_rslu_id;
                param.pid = synopInfo.productInfo.prd_prc_id;
            } else {
                // epsd_id 에피소드 아이디
                // prd_prc_id 상품 가격 아이디
                // asis_prd_typ_cd 상품 유형 코드
                // epsd_rslu_id 해상도 아이디
                // rslu_typ_cd 해상도 유형 코드
                // sale_prc 가격정보
                // possn_yn 소장용 여부
                const purchares = nxpg010.purchares;

                for (let i = 0; i < nxpg010.purchares.length; i++) {
                    if (nxpg010.purchares[i].prd_prc_id === playInfo.prd_prc_id) {
                        param.cid = nxpg010.purchares[i].epsd_rslu_id;
                        param.pid = nxpg010.purchares[i].prd_prc_id;
                        param.ptype = nxpg010.purchares[i].asis_prd_typ_cd;    // 상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)

                        synopInfo.productInfo = {};
                        synopInfo.productInfo.epsd_id = purchares[i].epsd_id;
                        synopInfo.productInfo.prd_prc_id = purchares[i].prd_prc_id;
                        synopInfo.productInfo.asis_prd_typ_cd = purchares[i].asis_prd_typ_cd;
                        synopInfo.productInfo.epsd_rslu_id = purchares[i].epsd_rslu_id;
                        synopInfo.productInfo.rslu_typ_cd = purchares[i].rslu_typ_cd;
                        synopInfo.productInfo.sale_prc = purchares[i].sale_prc;
                        synopInfo.productInfo.possn_yn = purchares[i].possn_yn;
                    }
                }
            }

            const requestSCS001 = await SCS.request001(param);
            if (requestSCS001.result !== '0000') {
                Core.inst().showToast(requestSCS001.result, requestSCS001.reason);
                CTSInfo.requestPurchaseAllCancel(true);
                return;
            }
            // OPT발급
            const requestGWSVC001 = await SCS.requestGWSVC001({ cnt_url: requestSCS001.CTS_INFO.CNT_URL });
            if (requestGWSVC001.result !== '0000') {
                Core.inst().showToast(requestGWSVC001.result, requestGWSVC001.reason);
                CTSInfo.requestPurchaseAllCancel(true);
                return;
            }
            synopInfo.wscsInfo = requestSCS001;
            if ((synopInfo.playInfo.startTime === '0' && playInfo.playType !== CTSInfo.PLAYTYPE.VOD_ALL_CORNER && playInfo.playType !== CTSInfo.PLAYTYPE.VOD_ALL_CORNER)
                || synopInfo.playInfo.startTime === undefined || synopInfo.playInfo.startTime === "") {
                const request024 = await MeTV.request024({ epsd_id: paramData.epsd_id });
                synopInfo.watch_time = request024.watch_time !== undefined ? request024.watch_time : "0";
            } else {
                synopInfo.watch_time = synopInfo.playInfo.startTime;
            }
            synopInfo.gwsvc001 = requestGWSVC001;
            const resultData = CTSInfo.convertData(synopInfo);
            CTSInfo.requestPlayVODToNative(resultData);
        } catch (error) {
            Core.inst().showToast("잠시후 다시 시도해 주세요.");
            CTSInfo.requestPurchaseAllCancel(true);
        }

        CTSInfo.bRequestPrepareVOD = false;
    }

    static callbackPrepaidVOD(data) {
        console.log('data: ' + data);

        if (data.result === '0000') {
            // paramData: paramData,
            // synopInfo: synopInfo
            // synopInfo.nxpg010 = nxpg010;
            // synopInfo.playInfo = playInfo;
            let paramData = cloneDeep(CTSInfo.purchase_data.paramData);
            let synopInfo = cloneDeep(CTSInfo.purchase_data.synopInfo);
            let purchares, resultInfo = {};
            if (synopInfo.nxpg010.contents.sris_typ_cd === '01') {
                purchares = synopInfo.nxpg010.contents.products;
                for (let i = 0; i < purchares.length; i++) {
                    if (data.prd_prc_id === purchares[i].prd_prc_id) {
                        resultInfo.epsd_id = purchares[i].epsd_id;
                        resultInfo.prd_prc_id = purchares[i].prd_prc_id;
                        resultInfo.asis_prd_typ_cd = purchares[i].asis_prd_typ_cd;
                        resultInfo.epsd_rslu_id = purchares[i].epsd_rslu_id;
                        resultInfo.rslu_typ_cd = purchares[i].rslu_typ_cd;
                        resultInfo.sale_prc = purchares[i].sale_prc;
                        resultInfo.possn_yn = purchares[i].possn_yn;
                    }
                }
            } else {
                purchares = synopInfo.nxpg010.purchares;
                for (let i = 0; i < purchares.length; i++) {
                    if (data.prd_prc_id === purchares[i].prd_prc_id) {
                        if (_.isEmpty(resultInfo) || Number(resultInfo.rslu_typ_cd) < Number(purchares[i].rslu_typ_cd)) {
                            resultInfo.epsd_id = purchares[i].epsd_id;
                            resultInfo.prd_prc_id = purchares[i].prd_prc_id;
                            resultInfo.asis_prd_typ_cd = purchares[i].asis_prd_typ_cd;
                            resultInfo.epsd_rslu_id = purchares[i].epsd_rslu_id;
                            resultInfo.rslu_typ_cd = purchares[i].rslu_typ_cd;
                            resultInfo.sale_prc = purchares[i].sale_prc;
                            resultInfo.possn_yn = purchares[i].possn_yn;
                        }
                    }
                }
            }

            synopInfo.productInfo = resultInfo;
            console.log('productInfo : ', synopInfo);
            CTSInfo.prepareVODPlayVOD(paramData, synopInfo);
        } else {
            Core.inst().showToast("잠시후 다시 시도해 주세요.");
            CTSInfo.requestPurchaseAllCancel(true);
        }
        CTSInfo.purchase_data = '';
        CTSInfo.purchase_callback = '';
        return;
    }


    /**
     * VOD 구매 (시놉 진입이 아닌 경우)
     * @param {*} data, callback 
     *      synopsis_type
     *      sris_id
     *      epsd_id
     *      prd_prc_id
     *      prod_type_cd
     *      
     */
    static async purchaseContentOthers(paramData, callback) {
        const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
        const param = {
            //에피소드 ID(xpg에 epsd_id)
            //(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
            //진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
            synopsis_type: paramData.synopsis_type, //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            epsd_id: paramData.epsd_id,
            sris_id: paramData.sris_id,    //시리즈 ID(시놉에서 진입한 시리즈 ID, xpg에 sris_id)
            pid: paramData.prd_prc_id, //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
            ptype: paramData.prod_type_cd,          //상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
            adult_flag: !_.isEmpty(paramData.adult_flag) ? paramData.adult_flag : '0',
            purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
        };
        SCS.request004(param)
            .then(data => {
                if (data.result === '0000') {
                    if (data.PREPAID_PID !== "") {
                        // 기구매 상품이므로 재생을 한다.
                        Core.inst().showToast('이미 구매하신 상품입니다. 바로 시청해 주세요.');
                    } else {
                        if (data.PROD_INFO.length === 1 && data.PROD_INFO[0].PROD_DTL.length === 1) {
                            data.enterance = 1;
                            data.PID = param.pid;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            data.PROD_INFO[0].PROD_DTL = data.PROD_INFO[0].PROD_DTL[0];
                            data.PROD_INFO = data.PROD_INFO[0];
                            Core.inst().showPopup(<BuyBill />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        } else {
                            data.enterance = 1;
                            data.PID = param.pid;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            data.prd_prc_vat = '';  //test 데이터찾아서 넣어야함!!
                            Core.inst().showPopup(<BuyShort />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        }
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            }, () => {
                Core.inst().showToast("잠시후 다시 시도해주세요.");
                CTSInfo.requestPurchaseAllCancel(true);
            });
    }

    /**
     * VOD 구매 요청
     * @param {*} data, callback 
     * data = {
     *   nxpg010,
     *   playInfo = {
     *      synopsis_type: '',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
     *      playType: '',   //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
     *      ynTeaser: '',   //예고편 재생 여부 (Y/N)
     *      - teaserInfo: '',   //예고편 재생 시, 재생하는 예고편의 Object 전달
     *      playOption: '', //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
     *                   //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
     * 
     *      prd_prc_id: 재생하려는 해당 상품 아이디     
     *      kids_yn: '',    //키즈 시놉 여부(Y/N)
     *      ynSerise: '',   //시리즈 여부(Y/N)
     *      - isCatchUp: '',  //시리즈 인 경우, MeTV의 isCatchUp 전달 (찜목록 등)
     *      - isAll: ''     //전편 구매 여부(Y/N)
     *      - epsd_id: ''   // 해당회차 구매 인 경우, 해당 회차의 epsd_id
     *      ynSpecial: '',  //스페셜 재생 여부(Y/N)
     *      - special_start_index: 선택한 스페셜 index
     *  }
     * }
     */
    static async purchaseContent(data, callback) {
        console.log('playInfo: ', data.playInfo);
        let cur_asis_prd_typ_cd = "";

        data.nxpg010 = Utils.checkValidDataNXPG010(data.nxpg010);

        if (!_.isEmpty(data.playInfo.prd_prc_id)) {
            for (let i = 0; i < data.nxpg010.purchares.length; i++) {
                if (data.playInfo.prd_prc_id === data.nxpg010.purchares[i].prd_prc_id) {
                    cur_asis_prd_typ_cd = data.nxpg010.purchares[i].asis_prd_typ_cd;
                    if (constants.PRD_TYP_CD.PPP === cur_asis_prd_typ_cd) {
                        // 패캐지 상품의 경우, 게이트웨이 시놉시스로 이동
                        const synopParam = {
                            menu_id: data.nxpg010.contents.menu_id,
                            sris_id: data.nxpg010.purchares[i].sris_id, epsd_id: 'npEpsdId'
                        };
                        Core.inst().move(constants.SYNOPSIS_GATEWAY, synopParam);
                        return;
                    }
                }
            }
        }
        CTSInfo.purchase_data = cloneDeep(data);
        CTSInfo.purchase_callback = callback;

        let nxpg010 = CTSInfo.purchase_data.nxpg010;
        let playInfo = CTSInfo.purchase_data.playInfo;

        let bPurcahseSeriesVOD = false;
        if ((cur_asis_prd_typ_cd === constants.PRD_TYP_CD.PPV || cur_asis_prd_typ_cd === "")
            && (nxpg010.contents.sris_typ_cd === '01' && playInfo.isAll !== 'Y')) {
            // 시리즈 전편 구매가 아닌 경우, 즉 시리즈 회차 구매인 경우
            bPurcahseSeriesVOD = true;
        }

        if (nxpg010.contents.cacbro_yn === 'Y' && bPurcahseSeriesVOD) {
            Core.inst().showToast('결방 회차입니다. 다른 회차를 선택해주세요.');
            return;
        }

        let productInfo = {};
        if (bPurcahseSeriesVOD || playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER
            || CTSInfo.PLAYTYPE.playType === CTSInfo.PLAYTYPE.VOD_CORNER) {
            // 시리즈이고 전편 구매가 아닌 경우는, products정보를 사용하여 데이터 채움
            const products = nxpg010.contents.products;
            for (let i = 0; i < products.length; i++) {
                if (nxpg010.contents.rslu_typ_cd === products[i].rslu_typ_cd) {
                    productInfo.epsd_id = playInfo.epsd_id;
                    playInfo.prd_prc_id = products[i].prd_prc_id;
                    productInfo.asis_prd_typ_cd = products[i].asis_prd_typ_cd;
                    productInfo.epsd_rslu_id = products[i].epsd_rslu_id;
                    productInfo.rslu_typ_cd = products[i].rslu_typ_cd;
                    productInfo.sale_prc = products[i].sale_prc;
                    productInfo.possn_yn = 'N';
                }
                if (bPurcahseSeriesVOD) {
                    //소장/유형의 경우는 시즌인 경우에만 옵션 노출한다.(구매옵션 화면 및 옵션 노출 정책 참고)
                    if (_.isEmpty(productInfo.prd_prc_id)) {
                        productInfo.prd_prc_id = products[i].prd_prc_id;
                    } else {
                        productInfo.prd_prc_id = productInfo.prd_prc_id + ',' + products[i].prd_prc_id;
                    }
                } else {
                    productInfo.prd_prc_id = playInfo.prd_prc_id;
                }
            }
        } else {
            const purchares = nxpg010.purchares;
            for (let i = 0; i < purchares.length; i++) {
                if (playInfo.prd_prc_id === purchares[i].prd_prc_id) {
                    productInfo.asis_prd_typ_cd = purchares[i].asis_prd_typ_cd;
                    productInfo.epsd_rslu_id = purchares[i].epsd_rslu_id;
                    productInfo.rslu_typ_cd = purchares[i].rslu_typ_cd;
                    productInfo.sale_prc = purchares[i].sale_prc;
                    productInfo.possn_yn = purchares[i].possn_yn;
                }
            }
            for (let i = 0; i < purchares.length; i++) {
                //소장/유형의 경우는 시즌인 경우에만 옵션 노출한다.(구매옵션 화면 및 옵션 노출 정책 참고)
                if ((productInfo.possn_yn === purchares[i].possn_yn || cur_asis_prd_typ_cd === constants.PRD_TYP_CD.PPS) && cur_asis_prd_typ_cd === purchares[i].asis_prd_typ_cd) {
                    if (_.isEmpty(productInfo.epsd_id)) {
                        productInfo.epsd_id = purchares[i].epsd_id;
                    } else {
                        productInfo.epsd_id = productInfo.epsd_id + ',' + purchares[i].epsd_id;
                    }
                    if (_.isEmpty(productInfo.prd_prc_id)) {
                        productInfo.prd_prc_id = purchares[i].prd_prc_id;
                    } else {
                        productInfo.prd_prc_id = productInfo.prd_prc_id + ',' + purchares[i].prd_prc_id;
                    }
                }
            }
        }
        const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
        let synopsis_type = "", epsd_id = productInfo.epsd_id;
        switch (productInfo.asis_prd_typ_cd) {
            case "10":
                synopsis_type = '01';
                break;
            case "20":
                synopsis_type = '02';
                break;
            case "30":
                if (nxpg010.contents.sris_typ_cd === '01') {
                    synopsis_type = '02';
                    epsd_id = "npEpsdId";
                } else {
                    synopsis_type = '01';
                }
                break;
            case "41":
                synopsis_type = '03';
                epsd_id = "npEpsdId";
                break;
            default:
                break;
        }
        const param = {
            //에피소드 ID(xpg에 epsd_id)
            //(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
            //진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
            epsd_id: epsd_id,
            sris_id: nxpg010.contents.sris_id,    //시리즈 ID(시놉에서 진입한 시리즈 ID, xpg에 sris_id)
            pid: productInfo.prd_prc_id, //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
            synopsis_type: synopsis_type,  //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
            ptype: productInfo.asis_prd_typ_cd,          //상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
            adult_flag: !_.isEmpty(playInfo.adult_flag) ? playInfo.adult_flag : '0',
            purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
        };
        SCS.request004(param)
            .then(data => {
                if (data.result === '0000') {
                    if (productInfo.possn_yn !== '' && productInfo.asis_prd_typ_cd !== constants.PRD_TYP_CD.PPS) {
                        // 시리즈가 아닌 경우, 소장/일반 선택여부에 따라 필요 없는 데이터 삭제
                        // 시나리오 15.[UI5.0]UI_구매_v1.4_0524.pdf 25page 참고
                        let temp = [];
                        for (let i = 0; i < data.PROD_INFO.length; i++) {
                            if (productInfo.possn_yn === data.PROD_INFO[i].CLTYN) {
                                temp.push(data.PROD_INFO[i]);
                            }
                        }
                        data.PROD_INFO = temp;
                    }

                    let products;
                    for (let i = 0; i < data.PROD_INFO.length; i++) {
                        for (let j = 0; j < data.PROD_INFO[i].PROD_DTL.length; j++) {
                            if (bPurcahseSeriesVOD) {
                                products = nxpg010.contents.products;
                            } else {
                                products = nxpg010.purchares;
                            }
                            for (let k = 0; k < products.length; k++) {
                                if (data.PROD_INFO[i].PROD_DTL[j].PID === products[k].prd_prc_id) {
                                    data.PROD_INFO[i].PROD_DTL[j].prd_prc_to_dt = products[k].prd_prc_to_dt;
                                    data.PROD_INFO[i].PROD_DTL[j].ORI_PRICE = products[k].prd_prc_vat;
                                    if (bPurcahseSeriesVOD) {
                                        // 시즌이고 회차 구매인 경우 타이틀에 회차정보 붙여서 사용한다.
                                        data.PROD_INFO[i].PROD_DTL[j].PNAME = nxpg010.contents.title + " " + nxpg010.contents.brcast_tseq_nm + "회";
                                    }
                                }
                            }
                        }
                    }

                    let bPrepaid = false, selectedPid;
                    if (data.PREPAID_PID !== "") {
                        const arrPid = data.PREPAID_PID.split(",");
                        for (let i = 0; i < arrPid.length; i++) {
                            if (playInfo.prd_prc_id === arrPid[i]) {
                                bPrepaid = true;
                                selectedPid = arrPid[i];
                            }
                        }
                    }
                    if (bPrepaid) { // 기구매 상품이므로 재생을 한다.
                        Core.inst().showToast('이미 구매하신 상품입니다. 바로 시청해 주세요.');

                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: data.result, prd_prc_id: productInfo.prd_prc_id });
                        }
                        if (productInfo.asis_prd_typ_cd === constants.PRD_TYP_CD.PPV) {
                            // 단편 컨텐츠인 경우 바로 재생
                             CTSInfo.requestWatchAfterPurchase(false, selectedPid);
                        }
                    } else {
                        if (data.PROD_INFO.length === 1 && data.PROD_INFO[0].PROD_DTL.length === 1) {
                            data.enterance = 1;
                            data.PID = playInfo.prd_prc_id;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            data.PROD_INFO[0].PROD_DTL = data.PROD_INFO[0].PROD_DTL[0];
                            data.PROD_INFO = data.PROD_INFO[0];
                            Core.inst().showPopup(<BuyBill />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        } else {
                            data.enterance = 1;
                            data.PID = playInfo.prd_prc_id;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            Core.inst().showPopup(<BuyShort />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        }
                    }
                } else if (data.result === '0062') {
                    // CIMODE 상태입니다. 바로보기를 호출해주세요
                    // 바로보기 호출한다.
                    if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                        CTSInfo.purchase_callback({ result: data.result, prd_prc_id: productInfo.prd_prc_id });
                    }
                    const arrPid = productInfo.prd_prc_id.split(',');
                    if (productInfo.asis_prd_typ_cd === constants.PRD_TYP_CD.PPV) {
                        // 단편 컨텐츠인 경우 바로 재생
                        CTSInfo.requestWatchAfterPurchase(false, arrPid[0]);
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            }, () => {
                Core.inst().showToast("잠시후 다시 시도해주세요.");
                CTSInfo.requestPurchaseAllCancel(true);
            });
    }

    /**
     * 패키지&VOD상품패키지 구매 요청
     * @param {*} data, callback 
     * data = {
     *  epsd_id
     *  sris_id
     *  prd_prc_id
     *  prd_prc_vat
     *  synopsis_type
     *  ptype
     * }
     */
    static async purchasePackage(info, callback) {
        CTSInfo.purchase_callback = callback;
        const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
        const param = {
            //에피소드 ID(xpg에 epsd_id)
            //(단편 시놉에 단편 구매, 월정액 구매, 시즌 시놉에 단편 구매, 커머스 시놉의 경우 시놉에서 
            //진입한 에피소드 ID, 값이 없어 못넘길경우 noEpsdId 문자열을 넘긴다.)
            epsd_id: info.epsd_id,
            sris_id: info.sris_id,    //시리즈 ID(시놉에서 진입한 시리즈 ID, xpg에 sris_id)
            pid: info.prd_prc_id,   //상품 가격 ID(여러 개일 경우 , 단위로 넣는다. Xpg에 prd_prc_id)
            synopsis_type: info.synopsis_type,
            ptype: info.ptype,     //상품 Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
            adult_flag: !_.isEmpty(info.adult_flag) ? info.adult_flag : '0',
            purchase_flag: _.isEmpty(purchase_flag) ? '1' : purchase_flag
        };

        SCS.request004(param)
            .then(data => {
                if (data.result === '0000') {
                    if (data.PREPAID_PID !== "") {
                        Core.inst().showToast('이미 구매하신 상품입니다. 바로 시청해 주세요.');
                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: '0000', prd_prc_id: info.prd_prc_id });
                        }
                    } else {
                        if (data.PROD_INFO.length === 1 && data.PROD_INFO[0].PROD_DTL.length === 1) {
                            data.enterance = 1;
                            data.PID = param.pid;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            data.PROD_INFO[0].PROD_DTL = data.PROD_INFO[0].PROD_DTL[0];
                            data.PROD_INFO = data.PROD_INFO[0];
                            Core.inst().showPopup(<BuyBill />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        } else {
                            data.enterance = 1;
                            data.PID = param.pid;
                            data.synopsis_type = param.synopsis_type;
                            data.PTYPE = param.ptype;
                            Core.inst().showPopup(<BuyShort />, data, () => {
                                CTSInfo.requestPurchaseAllCancel(true);
                            });
                        }
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            }, () => {
                Core.inst().showToast("잠시후 다시 시도해주세요.");
                CTSInfo.requestPurchaseAllCancel(true);
            });
    }

    /**
     * 채널 구매요청
     * @param {*} data
     * data = {
     *      state			,  //  가입 : join / 해지 : close
     *      serviceId		,  //  서비스 아이디
     *      channelNumber	,  //  채널 번호
     *      channelName		,  //  채널 명
     * }
     */
    static async purchaseChannel(data, callbackCancel) {
        console.log('purchaseChannel');
        
        CTSInfo.callbackCancel = callbackCancel;

        if (data.state === 'join') {
            const param = {
                id_svc: data.serviceId,
                ch_no: data.channelNumber,
                title: data.channelName
            }
            IOS.requestWIPTV001(param)
                .then(data => {
                    console.log("data : " + data);
                    if (data.result === '0000') {
                        if (Number(data.POPUP) === -1) { // error
                            Core.inst().showToast('잠시후 다시 시도해 주세요');
                            CTSInfo.requestPurchaseAllCancel(true);
                        } else if (Number(data.POPUP) === 0) {  //이미 구매한 상품
                            // Response CSI
                            // 구매 완료 후 결과여부 전달 cis.STB_TYPE_SERVICE호출
                            const info = {
                                state: 'joined',
                                serviceId: param.id_svc,
                                channelNumber: param.ch_no,
                                result: 'success'
                            };
                            StbInterface.setChannelJoinState(info);
                            Core.inst().showToast('이미 구매하신 상품입니다. 바로 시청해 주세요.');
                            CTSInfo.requestPurchaseAllCancel(true);
                        } else {
                            data.CH_NO = param.ch_no;
                            data.TITLE = param.title;

                            if (Number(data.PCNT) === 1) {
                                data.enterance = 1;
                                data.PROD_INFO_LIST = data.PROD_INFO_LIST[0];
                                Core.inst().showPopup(<BuyBillChannel />, data, () => {
                                    CTSInfo.requestPurchaseAllCancel(true);
                                });
                            } else {
                                data.enterance = 1;
                                Core.inst().showPopup(<BuyChannel />, data, () => {
                                    CTSInfo.requestPurchaseAllCancel(true);
                                });
                            }
                        }
                    } else {
                        Core.inst().showToast(data.result, data.reason);
                        CTSInfo.requestPurchaseAllCancel(true);
                    }
                });
        } else if (data.state === 'close') {
            // 채널 해지는 웹브라우저이므로 웹앱에서 처리하지 않는다.
            CTSInfo.requestPurchaseAllCancel(true);
        }
    }

    /**
     * BPoint 구매
     * data = {
     *   title: '',    //B포인트 정책명
     *   masterNo: '',  //B포인트 정책번호
     *   supplyAmount: '',  //공급가액
     *   totalAmount: '',   //총결제금액
     *   expireMessage: ''  //만료일 문구
     * }
     */
    static purchaseBPoint(data, callback) {
        // data = {
        //     billMode: CTSInfo.BILL_BPOINT,
        //     title: '5000포인트',
        //     masterNo: 'SA102018010000000001',
        //     supplyAmount: '5000',
        //     totalAmount: '5500',
        //     expireMessage: '구매 후 1년'
        // }   //test
        data.billMode = CTSInfo.BILL_BPOINT;
        Core.inst().showPopup(<BuyBill />, data, callback, () => {
            CTSInfo.requestPurchaseAllCancel(true);
        });
    }

    // 일반구매 SCS-002사용
    static requestPurchaseSCS(data, callback) {
        const dataInfo = cloneDeep(data.data);
        const discountInfo = cloneDeep(data.discountInfo);

        if (CTSInfo.checkNotFinishedSupportVOD(dataInfo.PROD_INFO.PROD_DTL.prd_prc_to_dt)) {
            Core.inst().showToast('서비스 제공이 중단된 콘텐츠입니다.');
            CTSInfo.requestPurchaseAllCancel(true);
            return true;
        }

        let param = {
            pid: dataInfo.PROD_INFO.PROD_DTL.PID,
            price: dataInfo.PROD_INFO.PROD_DTL.PRICE,
            ptype: dataInfo.PTYPE,
            yn_coupon: 'n',
            yn_bpoint: 'n',
        }

        dataInfo.mode = data.mode;
        dataInfo.totalPrice = discountInfo.totalPrice;

        if ('yn_coupon' in discountInfo) param.yn_coupon = discountInfo.yn_coupon;
        if ('yn_bpoint' in discountInfo) param.yn_bpoint = discountInfo.yn_bpoint;
        if ('no_coupon' in discountInfo) param.no_coupon = discountInfo.no_coupon;
        if ('amt_discount' in discountInfo) param.amt_discount = discountInfo.amt_discount;
        if ('amt_bpoint' in discountInfo) param.amt_bpoint = discountInfo.amt_bpoint;
        if ('amt_sale' in discountInfo) param.amt_sale = discountInfo.amt_sale;

        if ('id_mchdse' in discountInfo) param.id_mchdse = discountInfo.id_mchdse;
        if ('fir_ecrt_num' in discountInfo) param.fir_ecrt_num = discountInfo.fir_ecrt_num;
        if ('snd_ecrt_num' in discountInfo) param.snd_ecrt_num = discountInfo.snd_ecrt_num;

        SCS.request002(param)
            .then(data => {
                console.log('data: ', data);
                if (data.result === '0000') {
                    if (param.yn_coupon === 'y' || param.yn_bpoint === 'y') {
                        //셋탑에 쿠폰 포인트 정보 업데이트 요청
                        StbInterface.requestCouponPoint();
                    }
                    if (dataInfo.mode === CTSInfo.MODE_PPM || dataInfo.mode === CTSInfo.MODE_PPM_HOME) {
                        StbInterface.informationMonthlyPurchase();
                    }
                    Core.inst().showPopup(<PurchaseFinish />, dataInfo, () => {
                        // 바로 재생하도록 한다.
                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: data.result, prd_prc_id: param.pid });
                        }
                        if (dataInfo.PTYPE === constants.PRD_TYP_CD.PPV) {
                            // 단편 컨텐츠인 경우 바로 재생
                            CTSInfo.requestWatchAfterPurchase(true, param.pid);
                        } else {
                            CTSInfo.requestPurchaseAllCancel(true);
                        }
                    });
                } else if (data.result === '0054') {
                    // 기구매
                    Core.inst().showToast(data.result, data.reason);

                    if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                        CTSInfo.purchase_callback({ result: '0000', prd_prc_id: param.pid });
                    }
                    if (dataInfo.PTYPE === constants.PRD_TYP_CD.PPV) {
                        // 단편 컨텐츠인 경우 바로 재생
                        CTSInfo.requestWatchAfterPurchase(true, param.pid);
                    } else {
						CTSInfo.requestPurchaseAllCancel(true);
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            });
    }

    // T멤버쉽이 포함된 컨텐츠 가입 요청
    static requestPurchaseEPS111(data, callback) {
        const dataInfo = data.data;
        const discountInfo = data.discountInfo;
        let param = discountInfo;

        dataInfo.mode = data.mode;
        dataInfo.totalPrice = discountInfo.totalPrice;

        let prd_prc_to_dt;
        switch (dataInfo.mode) {
            case CTSInfo.MODE_PPV:
            case CTSInfo.MODE_PPS:
            case CTSInfo.MODE_PPP:
            case CTSInfo.MODE_VODPLUS:
                param.productId = dataInfo.PROD_INFO.PROD_DTL.PID;
                if (!_.isEmpty(dataInfo.PROD_INFO.PROD_DTL.CID)) {
                    param.contentId = dataInfo.PROD_INFO.PROD_DTL.CID;
                }
                prd_prc_to_dt = dataInfo.PROD_INFO.PROD_DTL.prd_prc_to_dt;
                break;

            case CTSInfo.MODE_CHANNEL:
                param.productId = dataInfo.PROD_INFO_LIST.PID;
                prd_prc_to_dt = dataInfo.PROD_INFO_LIST.prd_prc_to_dt;
                break;
            case CTSInfo.MODE_PPM:
            case CTSInfo.MODE_PPM_HOME:
                param.productId = dataInfo.PROD_INFO.PROD_DTL.PID;
                prd_prc_to_dt = dataInfo.PROD_INFO.PROD_DTL.prd_prc_to_dt;
                break;
            default:
                break;
        }

        if (CTSInfo.checkNotFinishedSupportVOD(prd_prc_to_dt)) {
            Core.inst().showToast('서비스 제공이 중단된 콘텐츠입니다.');
            return true;
        }

        EPS.request111(param)
            .then(data => {
                console.log('data: ', data);
                if (data.result === '0000' || data.result === 'OK') {
                    Core.inst().showPopup(<PurchaseFinish />, dataInfo, () => {
                        if (param.useBpoint === true || param.useCoupon === true) {
                            //셋탑에 쿠폰 포인트 정보 업데이트 요청
                            StbInterface.requestCouponPoint();
                        }
                        if (dataInfo.mode === CTSInfo.MODE_CHANNEL) {
                            // Response CSI
                            // 채널 구매인 경우, 구매 완료 후 결과여부 전달 cis.STB_TYPE_SERVICE호출
                            const info = {
                                state: 'join',
                                serviceId: dataInfo.ID_SVC,
                                channelNumber: dataInfo.CH_NO,
                                result: 'success'
                            };
                            StbInterface.setChannelJoinState(info);
                        } else if (dataInfo.mode === CTSInfo.MODE_PPM || dataInfo.mode === CTSInfo.MODE_PPM_HOME) {
                            StbInterface.informationMonthlyPurchase();
                        }

                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: data.result, prd_prc_id: param.productId });
                        }
                        if (dataInfo.PTYPE === constants.PRD_TYP_CD.PPV) {
                            // 단편 컨텐츠인 경우 바로 재생
                            CTSInfo.requestWatchAfterPurchase(true, param.productId);
                        } else {
                            CTSInfo.requestPurchaseAllCancel(false);
                        }
                    });
                } else if (data.result === '4412') {
                    // 기구매
                    Core.inst().showToast(data.result, data.reason);

                    if (dataInfo.mode === CTSInfo.MODE_CHANNEL) {
                        // Response CSI
                        // 채널 구매인 경우, 구매 완료 후 결과여부 전달 cis.STB_TYPE_SERVICE호출
                        const info = {
                            state: 'joined',
                            serviceId: dataInfo.ID_SVC,
                            channelNumber: dataInfo.CH_NO,
                            result: 'success'
                        };
                        StbInterface.setChannelJoinState(info);
                    } else if (dataInfo.mode === CTSInfo.MODE_PPM || dataInfo.mode === CTSInfo.MODE_PPM_HOME) {
                        StbInterface.informationMonthlyPurchase();
                    }

                    if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                        CTSInfo.purchase_callback({ result: '0000', prd_prc_id: param.productId });
                    }
                    if (dataInfo.PTYPE === constants.PRD_TYP_CD.PPV) {
                        // 단편 컨텐츠인 경우 바로 재생
                        CTSInfo.requestWatchAfterPurchase(true, param.productId);
                    } else {
                        CTSInfo.requestPurchaseAllCancel(false);
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            });
    }

    // T멤버쉽 혹인 TV페이, 휴대폰 결제가 포함된 월정액 가입 요청
    static requestPurchaseEPS112(data, callback) {
        const dataInfo = data.data;
        const discountInfo = data.discountInfo;
        let param = discountInfo;
        param.productId = dataInfo.PROD_INFO.PROD_DTL.PID;
        if (!_.isEmpty(dataInfo.PROD_INFO.PROD_DTL.CID)) {
            param.contentId = dataInfo.PROD_INFO.PROD_DTL.CID;
        }

        if (CTSInfo.checkNotFinishedSupportVOD(dataInfo.PROD_INFO.PROD_DTL.prd_prc_to_dt)) {
            Core.inst().showToast('서비스 제공이 중단된 콘텐츠입니다.');
            return true;
        }
        dataInfo.totalPrice = discountInfo.totalPrice;

        EPS.request112(param)
            .then(data => {
                console.log('data: ', data);
                if (data.result === '0000') {
                    if (param.useBpoint === true || param.useCoupon === true) {
                        //셋탑에 쿠폰 포인트 정보 업데이트 요청
                        StbInterface.requestCouponPoint();
                    }
                    if (dataInfo.mode === CTSInfo.MODE_PPM || dataInfo.mode === CTSInfo.MODE_PPM_HOME) {
                        StbInterface.informationMonthlyPurchase();
                    }
                    Core.inst().showPopup(<PurchaseFinish />, dataInfo, () => {
                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: data.result, prd_prc_id: param.productId });
                        }
						CTSInfo.requestPurchaseAllCancel(false);
                    });
                } else if (data.result === '4412') {
                    // 기구매
                    Core.inst().showToast(data.result, data.reason);

                    if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                        CTSInfo.purchase_callback({ result: '0000', prd_prc_id: param.productId });
                    }
                    CTSInfo.requestPurchaseAllCancel(false);
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            });
    }

    // 채널 결제
    static requestPurchaseChannel(data, callback) {
        const dataInfo = data.data;
        let param = {
            id_svc: dataInfo.ID_SVC,
            ch_no: dataInfo.CH_NO,
            paymethod: data.paymethod,
            pid: dataInfo.PROD_INFO_LIST.PID,
            price: dataInfo.PROD_INFO_LIST.PRICE,
            ptype: dataInfo.PROD_INFO_LIST.PTYPE,
            yn_coupon: data.discountInfo.yn_coupon,
        }

        if (param.yn_coupon === 'y') {
            param.no_coupon = data.discountInfo.no_coupon;
            param.amt_discount = data.discountInfo.amt_discount;
        }

        dataInfo.mode = data.mode;
        dataInfo.totalPrice = data.discountInfo.totalPrice;

        IOS.requestWIPTV002(param)
            .then(data => {
                console.log('data: ', data);
                if (data.result === '0000') {
                    if (param.yn_coupon === 'y' || param.yn_bpoint === 'y') {
                        //셋탑에 쿠폰 포인트 정보 업데이트 요청
                        StbInterface.requestCouponPoint();
                    }
                    Core.inst().showPopup(<PurchaseFinish />, dataInfo, () => {
                        // Response CSI
                        // 구매 완료 후 결과여부 전달 cis.STB_TYPE_SERVICE호출
                        const info = {
                            state: 'join',
                            serviceId: dataInfo.ID_SVC,
                            channelNumber: dataInfo.CH_NO,
                            result: 'success'
                        };
                        StbInterface.setChannelJoinState(info);
						CTSInfo.requestPurchaseAllCancel(false);
                    });
                } else if (data.result === '0054') {    //기구매
                    Core.inst().showToast(data.result, data.reason);
                    // Response CSI
                    // 구매 완료 후 결과여부 전달 cis.STB_TYPE_SERVICE호출
                    const info = {
                        state: 'joined',
                        serviceId: dataInfo.ID_SVC,
                        channelNumber: dataInfo.CH_NO,
                        result: 'success'
                    };
                    StbInterface.setChannelJoinState(info);
                    CTSInfo.requestPurchaseAllCancel(false);
                } else {
                    Core.inst().showToast(data.result, data.reason);

                    // Response CSI
                    const info = {
                        state: 'join',
                        serviceId: dataInfo.ID_SVC,
                        channelNumber: dataInfo.CH_NO,
                        result: 'fail'
                    };
                    StbInterface.setChannelJoinState(info);
                    CTSInfo.requestPurchaseAllCancel(true);
                }
            });
    }

    // 홈 월정액 결제
    static requestPurchaseHomePPM(data, callback) {
        const dataInfo = data.data;
        const discountInfo = data.discountInfo;

        if (CTSInfo.checkNotFinishedSupportVOD(dataInfo.PROD_INFO.PROD_DTL.prd_prc_to_dt)) {
            Core.inst().showToast('서비스 제공이 중단된 콘텐츠입니다.');
            return true;
        }

        let param = {
            pid: dataInfo.PROD_INFO.PROD_DTL.PID,
            price: dataInfo.PROD_INFO.PROD_DTL.PRICE,
            ptype: dataInfo.PROD_INFO.PROD_DTL.PTYPE,
            yn_coupon: 'n',
        }

        if ('yn_coupon' in discountInfo) param.yn_coupon = discountInfo.yn_coupon;
        if ('no_coupon' in discountInfo) param.no_coupon = discountInfo.no_coupon;
        if ('amt_discount' in discountInfo) param.amt_discount = discountInfo.amt_discount;

        dataInfo.mode = data.mode;
        dataInfo.totalPrice = discountInfo.totalPrice;

        SCS.request006(param)
            .then(data => {
                console.log('data: ', data);
                if (data.result === '0000') {
                    Core.inst().showPopup(<PurchaseFinish />, dataInfo, () => {
                        if (param.yn_coupon === 'y' || param.yn_bpoint === 'y') {
                            //셋탑에 쿠폰 포인트 정보 업데이트 요청
                            StbInterface.requestCouponPoint();
                        }
                        if (dataInfo.mode === CTSInfo.MODE_PPM || dataInfo.mode === CTSInfo.MODE_PPM_HOME) {
                            StbInterface.informationMonthlyPurchase();
                        }
                        if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                            CTSInfo.purchase_callback({ result: data.result });
                        }
						CTSInfo.requestPurchaseAllCancel(false);
                    });
                } else {
                    Core.inst().showToast(data.result, data.reason);
                    if (CTSInfo.purchase_callback !== undefined && CTSInfo.purchase_callback !== null && CTSInfo.purchase_callback !== "") {
                        CTSInfo.purchase_callback({ result: data.result });
                    }
                    CTSInfo.requestPurchaseAllCancel(true);
                }
            });
    }

    /**
     * BPoint 결제
     */
    static requestPurchaseBPoint(paramData, param) {
        EPS.request110(param)
        .then(data => {
            console.log('data: ', data);
            if (data.result === '0000') {
                StbInterface.requestCouponPoint();
                paramData.mode = CTSInfo.MODE_BPOINT;
                Core.inst().showPopup(<PurchaseFinish />, paramData, () => {
                    CTSInfo.requestPurchaseAllCancel(false);
                });
            } else {
                Core.inst().showToast(data.result, data.reason);
            }
        });
    }


    /**
     * VOD_CORNER : 코너별 보기
     *  VOD_ALL_CORNER : 코너별 모아보기
     *  VOD_PLAY : 일반,
     * VOD_PREVIEW: 예고편
     * VOD_REPEAT: 구간반복재생
     * VOD_REPEATVOD: 반복재생(반복재생인 경우, 현재 재생중인 컨텐츠 판단하지 않는다.)
    */
    static PLAYTYPE = {
        VOD_PLAY: 'default',
        VOD_CORNER: 'corner',
        VOD_ALL_CORNER: 'allCorner',
        VOD_PREVIEW: 'preview',
        VOD_SPECIAL: 'special',
        VOD_REPEAT: 'repeat',
        VOD_REPEATVOD: 'repeatVod'
    }
    static PALYOPTION = {
        NORMAL: 'normal',
        NEXT: 'next',
        other: 'other',
        SMART_RCU: 'smartRcu'
    }

    // const playInfo = {
    //     playType: '',   //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기, VOD_PREVIEW:예고편, VOD_REPEAT: 구간반복
    //     ynTeaser: '',   //예고편 재생 여부 (Y/N)
    //     playOption: '', //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
    //                     //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
    //     kids_yn: '',    //키즈 시놉 여부(Y/N)
    //     ynSerise: '',   //시리즈 여부(Y/N)
    //     isCatchUp: '',  //시리즈 인 경우, MeTV의 isCatchUp 전달
    // }
    // synopInfo.wscsInfo = requestSCS001;
    //         synopInfo.metv024 = request024;
    //         synopInfo.playInfo = data.playInfo;
    static convertData(synopInfo) {
        // cnt_url_opt 이어보기 팝업까지 완료 후, rp를 붙여서 전달
        let cnt_url_opt = synopInfo.wscsInfo.CTS_INFO.CNT_URL + '?ci=' + synopInfo.productInfo.epsd_rslu_id
            + '&oi=' + synopInfo.gwsvc001.id + '&op=' + synopInfo.gwsvc001.password;
        cnt_url_opt = cnt_url_opt.replace('tvsrtsp', 'skbvod');

        const epsd_rslu_info = synopInfo.nxpg010.contents.epsd_rslu_info;
        let openg_tmtag_tmsc = "", endg_tmtag_tmsc = "", mtx_capt_yn = "", mtx_capt_svc_file_path = "";
        for (let i = 0; i < epsd_rslu_info.length; i++) {
            if (synopInfo.productInfo.epsd_rslu_id === epsd_rslu_info[i].epsd_rslu_id) {
                openg_tmtag_tmsc = epsd_rslu_info[i].openg_tmtag_tmsc;
                endg_tmtag_tmsc = epsd_rslu_info[i].endg_tmtag_tmsc;
                mtx_capt_yn = epsd_rslu_info[i].mtx_capt_yn;
                mtx_capt_svc_file_path = epsd_rslu_info[i].mtx_capt_svc_file_path;
            }
        }

        let trailerTitle = "";
        if (synopInfo.playInfo.ynTeaser === 'Y') {  // 예고편 제목
            const preview_start_index = Number(synopInfo.playInfo.preview_start_index);
            trailerTitle = synopInfo.nxpg010.contents.preview[preview_start_index].title;
        } else if (synopInfo.playInfo.ynSpecial === 'Y') {
            const special_start_index = Number(synopInfo.playInfo.special_start_index);
            trailerTitle = synopInfo.nxpg010.contents.special[special_start_index].title;
        }

        let title = synopInfo.wscsInfo.PROD_INFO[0].PROD_DTL[0].PNAME;
        if (synopInfo.nxpg010.contents.sris_typ_cd === '01' && synopInfo.productInfo.asis_prd_typ_cd === constants.PRD_TYP_CD.PPV) {
            // 시즌이고 회차 구매인 경우 타이틀에 회차정보 붙여서 사용한다.
            title = synopInfo.nxpg010.contents.title + " " + synopInfo.nxpg010.contents.brcast_tseq_nm + "회";

        }

        let resultData = {
            playType: synopInfo.playInfo.playType,   //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
            playOption: synopInfo.playInfo.playOption, //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
            //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
            cnt_url: cnt_url_opt,    //Content URL + OPT조합하여 사용
            type: '2',   // 2로 하드코딩하여 사용(디지캡과 확인완료)   //요청 타입 (ftp:1, rtsp:2, hls:3, 기타:99) (IF-SCS-GWSVC-UI5-001)
            repeatIndex: '',        //playType 이 repeat 인 경우 필수, IF-STB-V5-302 에서 전달받은 값
            useStartTime: synopInfo.playInfo.useStartTime === 'Y' ? 'Y' : '',
            kids_yn: synopInfo.nxpg010.contents.kids_yn,    //키즈 시놉여부 (Y/N)
            synopType: synopInfo.nxpg010.purchares.possn_yn === 'Y' ? 'collection' : 'normal',  //collection :  소장용, normal : 일반
            seamless: 'N',   //이어보기 팝업에서 확인을 받았을 때 Y로 설정 (Y/N), 로딩광고 재생을 하지 않음
            seeingPath: synopInfo.playInfo.seeingPath !== undefined ? synopInfo.playInfo.seeingPath : '99',   //test //시청경로
            gCode: '',      //test //시청경로에 따라 장르 코드 또는 menu ID(XPG st_mid)를 설정함, cur_menu
            iptvSetProdBuyFlag: synopInfo.wscsInfo.PROD_INFO[0].PROD_DTL[0].IPTV_SET_PROD_FLAG !== undefined
                && synopInfo.wscsInfo.PROD_INFO[0].PROD_DTL[0].IPTV_SET_PROD_FLAG === '1' ? 'Y' : 'N', // demand상품인 경우 Y
            trailerTitle: trailerTitle,     // 예고편 제목
            menuId: synopInfo.nxpg010.contents.menu_id,     //XPG에서 받은 menu_id(null로도 올 수 있음.)
            fromCommerce: synopInfo.playInfo.fromCommerce === undefined ? "" : synopInfo.playInfo.fromCommerce,   //T 커머스에서 진입한 시놉시스에서 재생 요청 여부 (Y/N) menunavi에서 전달 받은 값 그대로 사용
            trackId: synopInfo.nxpg010.track_id,    //트랙아이디(CW 관리정보)
            session_id: synopInfo.nxpg010.session_id, //세션아이디(CW 관리정보)
            uxReference: '',    //uxReference 아이디
            kidschar_id: synopInfo.playInfo.kidschar_id === undefined ? "" : synopInfo.playInfo.kidschar_id,    //키즈존 캐릭터 아이디 (LGS 로그용)
            synopsisInfo: {
                title: title,      //타이틀
                sris_id: synopInfo.nxpg010.contents.sris_id,   //통합 아이디(sris_id)
                epsd_id: synopInfo.productInfo.epsd_id,         //재생할 epsd_id
                epsd_rslu_id: synopInfo.productInfo.epsd_rslu_id,  //재생할 해상도 아이디(epsd_rslu_id)
                kids_yn: synopInfo.nxpg010.contents.kids_yn,
                genreCode: '',  //프로그램 장르 코드(XPG : g_code)  //생성방법 4.0전달(디지캡 -> cot) ?
                // IF-STB-V5-203 인터페이스의 genreCode 생성 방법을 4.0 기준으로 전달해 드립니다.
                // SeeingPath값이 1, 30, 31인 경우 g_code 사용, 이외의 경우 시놉시스의 genreCode의 값을
                // Pattern pattern = Pattern.compile("[a-zA-z]");

                currentMenu: '',    //컨텐츠 메뉴코드(cur_menu) ?
                rslu_typ_cd: synopInfo.productInfo.rslu_typ_cd,    //해상도 유형 코드 (10 : SD, 20 : HD, 30 : UHD)
                openg_tmtag_tmsc: openg_tmtag_tmsc,    //앞 부분 건너뛰기 시간(openg_tmtag_tmsc)
                endg_tmtag_tmsc: endg_tmtag_tmsc,       //다음화 바로보기 노출 시간 (endg_tmtag_tmsc)
                org_epsd_rslu_id: synopInfo.productInfo.ori_epsd_rslu_id,   //예고편 재생 요청 시 시놉시스의 epsd_rslu_id
                isMovie: synopInfo.nxpg010.contents.meta_typ_cd === '000' ? 'Y' : 'N',        //영화 콘텐츠 여부 (meta_typ_cd가 000일경우 Y)
                isFree: synopInfo.productInfo.sale_prc === '0' ? 'Y' : 'N',         //무료 콘텐츠 여부 (가격정보가 0원일 경우 Y)
                linkType: synopInfo.playInfo.ynTeaser,       //예고편 여부 (예고편 재생일 경우 Y)
                isSample: synopInfo.nxpg010.contents.gstn_yn,       //맛보기 콘텐츠 여부 (XPG : yn_sam)
                isAdult: synopInfo.nxpg010.contents.meta_typ_cd === '009' ? 'Y' : 'N',        //성인 콘텐츠 여부 meta_typ_cd가 009일경우 Y
                poster: synopInfo.nxpg010.contents.title_img_path,         //포스터 이미지 URL
                mediaType: '',      //미디어타입, 10 : 2D, 20 : 3D (XPG : media_type) ?
                wat_lvl_cd: synopInfo.nxpg010.contents.wat_lvl_cd,         //시청등급(level)
                play_tms_val: synopInfo.nxpg010.contents.play_tms_val,   //러닝타임 (단위 : 분, play_tms_val)
                ending_cw_call_id_val: synopInfo.nxpg010.contents.ending_cw_call_id_val,    //엔딩시놉시스 CW CALL ID
                isSeries: synopInfo.nxpg010.contents.sris_typ_cd === '01' ? 'Y' : 'N',       //시리즈 여부
                mtx_capt_yn: mtx_capt_yn,    //다국어지원 여부(다중자막여부) (Y/N)
                meta_typ_cd: synopInfo.nxpg010.contents.meta_typ_cd, //메타 유형 코드(콘텐츠 유형)
                cornerList: synopInfo.nxpg010.contents.corners  //[2018.06.05][디지캡요청] corners 데이터 있는 경우 무조건 내림.(코너)
            },
            wscsInfo: { //WSCS결제정보
                chargePeriod: synopInfo.wscsInfo.CHARGE_PERIOD,   //시청에 대한 기준 시점, ROOT/CHARGE_PERIOD/
                contentId: synopInfo.wscsInfo.CTS_INFO.CID,  //ROOT/CID/
                contentUrl: synopInfo.wscsInfo.CTS_INFO.CNT_URL, //ROOT/CNT_URL/
                productType: synopInfo.wscsInfo.PROD_INFO[0].PTYPE,    //상품의 종류
                productId: synopInfo.wscsInfo.PROD_INFO[0].PROD_DTL[0].PID,  //상품 식별자
                wmUseFlag: synopInfo.wscsInfo.CTS_INFO.YN_WATER_MARK,  //워터마크 사용 유/무 (cts_info_rtsp_21:YN_WATER_MARK)
                wmExtension: synopInfo.wscsInfo.CTS_INFO.EXTENSION,    //워터마크 관련 내용 (cts_info_rtsp_21:EXTENSION)
                wmMode: synopInfo.wscsInfo.CTS_INFO.WM_MODE,      //워터마크 모드 (cts_info_rtsp_21:WM_MODE)
                id: synopInfo.gwsvc001.id,                          //OPT ID
                password: synopInfo.gwsvc001.password               //OPT PASSWORD
            },
            // 추후 확인필요
            // epiInfoList: {  //인기에피소드 정보 리스트 (에피&에피)
            //     epiInfo: '',   //if-xpg-124 응답 항목 참조
            //     epiTitle: '',   //epi 타이틀
            //     epiImg: '',     //epi 이미지
            //     startTime: '',  //영상 시작 시간
            //     endTime: '',    //영상 종료 시간
            //     epiScrImg: ''   //epi 장면 탐색용 이미지
            // },
        }
        if (resultData.synopsisInfo.mtx_capt_yn === 'Y') {
            //자막 파일 경로 (mtx_capt_yn) 가 Y일 경우 전달
            resultData.synopsisInfo.mtx_capt_svc_file_path = mtx_capt_svc_file_path;
        }

        resultData.startTime = synopInfo.watch_time;  //이어보기와 코너별 보기일 경우에만 설정

        if (synopInfo.nxpg010.contents.sris_typ_cd === '01') {
            resultData.synopsisInfo.isCatchUp = '';      //시리즈인경우 새로 올라온 회차 여부(Y/N) - MeTV조회
            const series_info = synopInfo.nxpg010.contents.series_info;
            for (let i = 0; i < series_info.length; i++) {
                if (series_info[i].epsd_id === synopInfo.productInfo.epsd_id) {
                    if (_.isEmpty(resultData.synopsisInfo.seriesNo)) {
                        resultData.synopsisInfo.seriesNo = synopInfo.nxpg010.contents.series_info[i].brcast_tseq_nm;       //시리즈 순차번호(ser_no)
                    }
                    resultData.synopsisInfo.seriesNo = series_info[i].brcast_tseq_nm;       //시리즈 순차번호(ser_no)
                    resultData.synopsisInfo.seriesIndex = i;    //seriesList에서 현재 콘텐츠의 index 값
                }
            }
            resultData.synopsisInfo.seriesList = []; //시리즈 정보
            resultData.synopsisInfo.seriesList = series_info;
        }

        if (synopInfo.playInfo.playType === CTSInfo.PLAYTYPE.VOD_REPEAT) {
            // 구간 반복재생인 경우, 필요 데이터 설정
            resultData.repeatIndex = synopInfo.playInfo.repeatIndex;
            resultData.startTime = synopInfo.playInfo.startTime;
            resultData.endTime = synopInfo.playInfo.endTime;
        } else if (synopInfo.playInfo.playType === CTSInfo.PLAYTYPE.VOD_CORNER) {
            // resultData.synopsisInfo.cornerList = {  //코너별 보기의 코너정보 목록(스마트시놉의 장면별 보기 포함)
            // corners: {  //코너목록
            //     cnr_id: '',
            //     cnr_nm: '',
            //     epsd_rslu_id: '',
            //     img_path: '',
            //     wat_fr_byte_val: '',
            //     tmtag_fr_tmsc: '',
            //     sort_seq: '',
            //     cnr_grp_id: '',
            // },
            // };
            //코너별, 코너 모아보기인 경우, 코너아이디와 해상도 아이디 필요.
            resultData.cnr_id = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].cnr_id;
            resultData.epsd_rslu_id = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].epsd_rslu_id;

            resultData.startTime = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].tmtag_fr_tmsc;
        } else if (synopInfo.playInfo.playType === CTSInfo.PLAYTYPE.VOD_ALL_CORNER) {
            // resultData.cornerGroupList = {  //코너별 모아보기 일 경우에만 설정
            //     corners: {  //코너 목록 (IF-NXPG-016) 참고
            //         cnr_id: '',
            //         tmtag_to_tmsc: '',  //타임태크종료시간초
            //         cnr_nm: '',         //코너 명
            //         epsd_rslu_id: '',   //시리즈ID
            //         img_path: '',       //이미지 경로
            //         wat_fr_byte_val: '',    //시청시작바이트값
            //         tmtag_fr_tmsc: '',      //타임태크시작시간초
            //         sort_seq: '',           //메뉴정렬순서
            //         cnr_grp_id: '',         //종료시간(sec)
            //     },
            // };

            //코너별, 코너 모아보기인 경우, 코너아이디와 해상도 아이디 필요.
            resultData.cnr_id = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].cnr_id;
            resultData.epsd_rslu_id = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].epsd_rslu_id;

            const corners = synopInfo.nxpg016.corners;
            resultData.cnr_grp_id = synopInfo.nxpg016.cnr_grp_id;
            const selectedCnrId = synopInfo.nxpg010.contents.corners[synopInfo.playInfo.cornerStartIndex].cnr_id;
            let selectedIndex = 0;
            // 선택된 corner index를 찾는다.
            for (let i = 0; i < corners.length; i++) {
                if (selectedCnrId === corners[i].cnr_id) {
                    selectedIndex = i;
                }
            }
            resultData.cornerStartIndex = selectedIndex;    //cornerStartIndex: 처음 재생할 코너의 index (코너별 모아보기 일 경우에만 설정)

            resultData.cornerGroupList = corners;
            resultData.startTime = corners[resultData.cornerStartIndex].tmtag_fr_tmsc;
            resultData.endTime = corners[resultData.cornerStartIndex].tmtag_to_tmsc; //코너별 모아보기는 endTIme 필요
        } else if (synopInfo.playInfo.ynTeaser === 'Y') {
            resultData.synopsisInfo.epsd_rslu_id = synopInfo.productInfo.ori_epsd_rslu_id;
            resultData.synopsisInfo.preview_start_index = synopInfo.playInfo.preview_start_index;
            resultData.synopsisInfo.preview = synopInfo.nxpg010.contents.preview;
        } else if (synopInfo.playInfo.ynSpecial === 'Y') {
            resultData.synopsisInfo.epsd_rslu_id = synopInfo.productInfo.ori_epsd_rslu_id;
            resultData.synopsisInfo.preview_start_index = synopInfo.playInfo.special_start_index;
            resultData.synopsisInfo.preview = synopInfo.nxpg010.contents.special;
        }

        console.log('resultData: ', resultData);
        return resultData;
    }

    static getCurrentPlayVOD(callback) {
        // 현재 재생중인 영상 정보 가져옴.
        StbInterface.requestPlayInfo(callback);
    }

    static checkLevelAndAdult(bCheckLevel, adult, strLevel, callback, callbackData, bShouldClose) {
        let settingAge;
        if (!appConfig.runDevice) {
            settingAge = Number(appConfig.STBInfo.level);
        } else {
            settingAge = Number(StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT));
        }
        const level = Number(strLevel);
        if (!bCheckLevel && ((adult === '01' || adult === '03') && level >= 19) && settingAge > 0) {
            //성인 등급코드가 Adult거나 Pink무비일 때, 인증팝업 발생
            let obj = {
                certification_type: constants.CERT_TYPE.ADULT_PLAYPURCHASE,
                age_type: ''
            };
            Core.inst().showPopup(<AdultCertification />, obj, (data) => {
                if (data && data.result === '0000') {
                    callbackData.data.bCheckedAdultLevel = false;
                    callback(callbackData.data, callbackData.callback);
                }
                if (bShouldClose) {
                    CTSInfo.requestPurchaseAllCancel(false);
                }
            });
        } else if (settingAge > 0 && settingAge <= level) {    // 설정연령보다 레벨이 크면, 연령제한 인증팝업 발생
            if ((adult === '01' || adult === '03') && level >= 19 && settingAge > 0) {    //성인컨텐츠 인증팝업 발생
                //성인 등급코드가 Adult거나 Pink무비일 때, 인증팝업 발생
                let obj = {
                    certification_type: constants.CERT_TYPE.ADULT_PLAYPURCHASE,
                    age_type: ''
                };
                Core.inst().showPopup(<AdultCertification />, obj, (data) => {
                    if (data && data.result === '0000') {
                        callbackData.data.bCheckedAdultLevel = false;
                        callback(callbackData.data, callbackData.callback);
                    }
                    if (bShouldClose) {
						CTSInfo.requestPurchaseAllCancel(false);
                    }
                });
            } else if (level < 19) {
                let obj = {
                    certification_type: constants.CERT_TYPE.AGE_LIMIT,
                    age_type: level
                };
                Core.inst().showPopup(<AdultCertification />, obj, (data) => {
                    if (data && data.result === '0000') {
                        callbackData.data.bCheckedAdultLevel = false;
                        callback(callbackData.data, callbackData.callback);
                    }
                    if (bShouldClose) {
						CTSInfo.requestPurchaseAllCancel(false);
                    }
                });
            } else {
                callbackData.data.bCheckedAdultLevel = false;
                callback(callbackData.data, callbackData.callback);
                if (bShouldClose) {
                    CTSInfo.requestPurchaseAllCancel(false);
                }
            }
        } else {
            callbackData.data.bCheckedAdultLevel = false;
            callback(callbackData.data, callbackData.callback);
            if (bShouldClose) {
                CTSInfo.requestPurchaseAllCancel(false);
            }
        }
    }

    static async getNewOTP(cnt_url) {
        /** IF-STB-V5-307 VOD OTP 갱신 요청
        * Response: result			문자	필수	성공 여부 (success, fail)
        *          otpUrl			문자	필수	OTP URL
        *          otpId			문자	필수	OTP 아이디
        *          otpPassword			문자		OTP 패스워드
        */
        let data;
        const requestGWSVC001 = await SCS.requestGWSVC001({ cnt_url: cnt_url });
        if (requestGWSVC001.result === '0000') {
            data = {
                result: 'success',
                optUrl: cnt_url,
                otpId: requestGWSVC001.id,
                otpPassword: requestGWSVC001.password
            };
        } else {
            data = {
                result: 'fail',
                optUrl: '',
                otpId: '',
                otpPassword: ''
            };
        }
        StbInterface.responseOptData(data);
        Core.inst().webVisible(false, true);  //  webHide 요청
    }

    /**
     * 신용카드 결제 공용 모듈
     * @param {*} data = {
     *      PRICE,
     *      PNAME,
     *      tvpayId,
     *      tvpayUrl
     * }
     * @param {*} callback
     */
    static callTVPayForPurchase(data, callback) {
        const price = Number(data.PRICE);
        const tax = (Number(data.PRICE) * 0.1);
        let url = data.tvpayUrl;
        url = url + '?';
        url += 'storeId=SKITVBV001&';
        url += 'goodsName=' + encodeURIComponent(data.PNAME) + '&';
        url += 'tvpayId=' + encodeURIComponent(data.tvpayId) + '&';
        url += 'orgAmount=' + price + '&';
        url += 'vatAmount=' + tax + '&';
        url += 'amount=' + (price + tax) + '&';
        url += 'autoBillYn=N&';
        url += 'onPaymentCompleted=tvHubCallback.expi_tvpayCallback&';
        url += 'modelResolution=1920&';
        url += 'modelAddress=' + appConfig.STBInfo.mac + '&';
        url += 'modelName=' + appConfig.STBInfo.stbModel;
        StbInterface.openPopupTV('tvPay', url, callback);
    }

    /**
     * 구매 가능일 체크
     * false 인 경우, 구매할 수 없다. 
     */
    static checkNotFinishedSupportVOD(prd_prc_to_dt) {
        const dateFormat = require('dateformat');
        const curDate = dateFormat(new Date(), 'yyyymmddHHMMss');
        let bResult = false;
        if (Number(prd_prc_to_dt) < Number(curDate)) {
            bResult = true;
        }
        return bResult;
    }

    /**
     * 코너 모아보기 건너뛰기 팝업 기능
     */
    static checkCornerAllPlay(data, synopInfo, SCS001, callback) {
        let cornerStartIndex = Number(synopInfo.playInfo.cornerStartIndex);
        const corners = synopInfo.nxpg016.corners;
        const epsd_rslu_id = synopInfo.nxpg010.contents.corners[cornerStartIndex].epsd_rslu_id;
        
        let cornerAllIdx = 0;
        for (let i = 0; i < corners.length; i++) {
            if (epsd_rslu_id === corners[i].epsd_rslu_id) {
                cornerAllIdx = i;
            }
        }
        
        const brcast_tseq_nm = synopInfo.nxpg016.corners[cornerAllIdx].brcast_tseq_nm;
        const param = {
            title: synopInfo.nxpg010.contents.title + " " + brcast_tseq_nm + "회",
            desc: '구매 후 이용 가능합니다.\n구매하시곘어요?',
            btns: ["구매", "건너뛰기"]
        }
        Core.inst().showPopup(<PopupConfirm />, param, async (info) => {
            if (info.result) {
                synopInfo.playInfo.epsd_id = SCS001.epsd_id;
                synopInfo.playInfo.prd_prc_id = SCS001.PROD_INFO[0].PROD_DTL[0].PID;
                CTSInfo.purchaseContent(synopInfo, callback);
            } else {
                let firstIdx;
                if (synopInfo.playInfo.firstIdx === undefined || synopInfo.playInfo.firstIdx === "") {
                    firstIdx = cloneDeep(cornerAllIdx);
                } else {
                    firstIdx = Number(synopInfo.playInfo.firstIdx);
                }
                if (cornerAllIdx === (corners.length - 1) && firstIdx > 0) {
                    cornerAllIdx = 0;
                } else {
                    cornerAllIdx++;
                }
                if (firstIdx === cornerAllIdx) {
                    // 종료
                    return;
                } else {
                    // 건너뛰기
                    synopInfo.playInfo.firstIdx = firstIdx;
                    let xpg010Param = {};
                    xpg010Param.search_type = '2';
                    xpg010Param.epsd_rslu_id = corners[cornerAllIdx].epsd_rslu_id;
                    data.nxpg010 = await NXPG.request010(xpg010Param);
                    if (data.nxpg010.result !== '0000') {
                        Core.inst().showToast(data.nxpg010.result, data.nxpg010.reason);
                        return;
                    }
                    data.nxpg016 = synopInfo.nxpg016;
                    CTSInfo.requestWatchVOD(data, callback, true);
                }
            }
        });
    }

    /**
     * 코너 모아보기 건너뛰기 팝업 기능
     */
    static checkCornerAllPlaySCS004(paramData, synopInfo, SCS004, callback) {
        let cornerStartIndex = Number(synopInfo.playInfo.cornerStartIndex);
        const corners = synopInfo.nxpg016.corners;
        const epsd_rslu_id = synopInfo.nxpg010.contents.corners[cornerStartIndex].epsd_rslu_id;
        
        let cornerAllIdx = 0;
        for (let i = 0; i < corners.length; i++) {
            if (epsd_rslu_id === corners[i].epsd_rslu_id) {
                cornerAllIdx = i;
            }
        }
        
        const brcast_tseq_nm = synopInfo.nxpg016.corners[cornerAllIdx].brcast_tseq_nm;
        const param = {
            title: synopInfo.nxpg010.contents.title + " " + brcast_tseq_nm + "회",
            desc: '구매 후 이용 가능합니다.\n구매하시곘어요?',
            btns: ["구매", "건너뛰기"]
        }
        Core.inst().showPopup(<PopupConfirm />, param, async (info) => {
            if (info.result) {
                // 구매 완료 후, 사용할 데이터 저장
                const saveDate = {
                    paramData: paramData,
                    synopInfo: synopInfo
                };
                CTSInfo.purchase_data = cloneDeep(saveDate);
                CTSInfo.purchase_callback = CTSInfo.callbackPrepaidVOD;

                let products;
                for (let i = 0; i < SCS004.PROD_INFO.length; i++) {
                    for (let j = 0; j < SCS004.PROD_INFO[i].PROD_DTL.length; j++) {
                        if (synopInfo.nxpg010.contents.sris_typ_cd === '01') {
                            products = synopInfo.nxpg010.contents.products;
                        } else {
                            products = synopInfo.nxpg010.purchares;
                        }
                        for (let k = 0; k < products.length; k++) {
                            if (SCS004.PROD_INFO[i].PROD_DTL[j].PID === products[k].prd_prc_id) {
                                SCS004.PROD_INFO[i].PROD_DTL[j].prd_prc_to_dt = products[k].prd_prc_to_dt;
                                SCS004.PROD_INFO[i].PROD_DTL[j].ORI_PRICE = products[k].prd_prc_vat;
                                if (synopInfo.nxpg010.contents.sris_typ_cd === '01' && constants.PRD_TYP_CD.PPV === products[k].asis_prd_typ_cd) {
                                    // 시즌이고 회차 구매인 경우 타이틀에 회차정보 붙여서 사용한다.
                                    SCS004.PROD_INFO[i].PROD_DTL[j].PNAME = synopInfo.nxpg010.contents.title + " " + synopInfo.nxpg010.contents.brcast_tseq_nm + "회";
                                }
                            }
                        }
                    }
                }

                // 구매 상품이 없으므로 구매를 한다.
                if (SCS004.PROD_INFO.length === 1 && SCS004.PROD_INFO[0].PROD_DTL.length === 1) {
                    SCS004.enterance = 1;
                    SCS004.PROD_INFO[0].PROD_DTL = SCS004.PROD_INFO[0].PROD_DTL[0];
                    SCS004.PROD_INFO = SCS004.PROD_INFO[0];
                    Core.inst().showPopup(<BuyBill />, SCS004, () => {
                        CTSInfo.requestPurchaseAllCancel(true);
                    });
                } else {
                    SCS004.enterance = 1;
                    Core.inst().showPopup(<BuyShort />, SCS004, () => {
                        CTSInfo.requestPurchaseAllCancel(true);
                    });
                }
            } else {
                let firstIdx;
                if (paramData.firstIdx === undefined || paramData.firstIdx === "") {
                    firstIdx = cloneDeep(cornerAllIdx);
                } else {
                    firstIdx = Number(paramData.firstIdx);
                }
                if (cornerAllIdx === (corners.length - 1) && firstIdx > 0) {
                    cornerAllIdx = 0;
                } else {
                    cornerAllIdx++;
                }
                if (firstIdx === cornerAllIdx) {
                    // 종료
                    return;
                } else {
                    // 건너뛰기
                    let xpg010Param = {};
                    xpg010Param.search_type = '2';
                    xpg010Param.epsd_rslu_id = corners[cornerAllIdx].epsd_rslu_id;
                    const nxpg010 = await NXPG.request010(xpg010Param);
                    if (nxpg010.result !== '0000') {
                        Core.inst().showToast(nxpg010.result, nxpg010.reason);
                        if (paramData.playOption === CTSInfo.PALYOPTION.NEXT) {
                            // 다음화 재생을 실패한 경우 VOD STOP을 호출해준다.
                            StbInterface.requestStopVod();
                        }
                        CTSInfo.requestPurchaseAllCancel(true);
                        return;
                    }
                    
                    for (let i = 0; i < nxpg010.contents.corners.length; i++) {
                        if (paramData.group_id === nxpg010.contents.corners[i].cnr_grp_id) {
                            paramData.cnr_id = nxpg010.contents.corners[i].cnr_id;
                        }
                    }

                    const newParamData = {
                        playType: paramData.playType,
                        playOption: paramData.playOption,
                        search_type: '2',
                        epsd_rslu_id: corners[cornerAllIdx].epsd_rslu_id,
                        fromCommerce: 'N',
                        cnr_id: paramData.cnr_id,
                        group_id: paramData.group_id,
                        firstIdx: firstIdx
                    }
                    newParamData.nxpg010 = nxpg010;
                    CTSInfo.prepareVOD(newParamData, CTSInfo.callbackCancel);
                }
            }
        });
    }
}
// }) (CTSInfo);

// export function CTSInfo() {
//     return CTSInfo;
// }