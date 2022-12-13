import React, { Fragment } from 'react';
import { MeTV, NXPG, AMS } from 'Network';
import StbInterface from './../supporters/stbInterface';
import appConfig from '../config/app-config';
import { Core } from '../supporters';
import AdultCertification from '../popup/AdultCertification';
import constants, { STB_PROP, GNB_CODE, MENU_NAVI, MENU_ID } from 'Config/constants';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import last from 'lodash/last';
import includes from 'lodash/includes';
import Axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import { CTSInfo } from 'Supporters/CTSInfo';
import kidsViewMove from '../routes/kids/kidsViewMove';
import dateFormat from 'dateformat';
import { isObject } from 'util';

const { GNB_ANI, GNB_DOCU, GNB_SENIOR, GNB_HOME, GNB_KIDS, GNB_MONTHLY, GNB_MOVIE, GNB_MYBTV, GNB_TV, GNB_TVAPP, GNB_VIEWALL, GNB_SEARCH } = GNB_CODE;
const { HOME, MYBTV_HOME, HOME_TVAPP, ALL_MENU, SEARCH_HOME, KIDS_HOME, DETAIL_GENRE_HOME/*, SEARCH_MAIN*/ } = constants;
const { MONTHLY_AFTER, CALL_TYPE_CD, PRD_TYP_CD, SYNOPSIS, SYNOPSIS_GATEWAY, SYNOPSIS_VODPRODUCT } = constants;
const { CERT_TYPE, STB_PROP: { ADULT_MOVIE_MENU, EROS_MENU } } = constants;

export function scroll(pos, callback) {
    const wrapper = document.querySelector('#root > .wrapper');
    if (wrapper) {
        wrapper.scrollTop = 0;
    }

    const target = document.querySelector('.scrollWrap');
    const endEvent = () => {
        // console.log('transitionend !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        if (callback) {
            callback();
            // console.log('callback !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }

        if (target) {
            target.removeEventListener('transitionend', endEvent, false)
        }
    };

    if (target) {
        target.addEventListener('transitionend', endEvent, false);
        target.style.transform = `translate(0px, ${pos}px)`;
        // target.style.transform = `translateY(${pos}px)`;
    }
}

export const toLocalePrice = str => {
    let toNumber = Number(str);
    if (!Number.isNaN(toNumber)) {
        return toNumber.toLocaleString('ko-KR');
    } else {
        return toNumber;
    }
}

export const newlineToBr = txt => {
    const split = txt.split('\n');
    return split.map((sentence, idx) => {
        return <Fragment key={idx}>{sentence}{idx !== split.length - 1 && <br />}</Fragment>
    });
}

/**
 * 
 * @param {String} str 
 * @desc 문자열을 받아 첫글자를 대문자로 만든다.
 */
export const capitalize = str => {
    if (typeof str !== 'string') return str;
    const firstLetter = str.slice(0, 1);
    if (!(/^[A-Za-z]*$/).test(firstLetter)) return str;
    const remainder = str.substr(1);
    return `${firstLetter.toUpperCase()}${remainder}`;
}

/**
 * @param {Object} obj
 * @desc deep copy
 */
export const deepCopy = obj => JSON.parse(JSON.stringify(obj));

/**
 * @param {String} str 
 * @desc 문자열의 length를 체크
 */
export const getByteLength = (str) => {
    let codeByte = 0;
    for (let idx = 0; idx < str.length; idx++) {
        let oneChar = escape(str.charAt(idx));

        if (oneChar.length === 1) codeByte++;
        else if (oneChar.indexOf("%u") !== -1) codeByte += 2;
        else if (oneChar.indexOf("%") !== -1) codeByte++;
    }
    return codeByte;
}

/**
 * @desc 배열을 원하넌 길이 만큼 잘라 2차 배열로 만들어 줌
 * @param {Array} arr 
 * @param {Number} n 
 */
export const divisionArray = (arr, n) => {
    let len = arr.length;
    let cnt = Math.floor(len / n) + (Math.floor(len % n) > 0 ? 1 : 0);
    let tmp = [];

    for (let i = 0; i < cnt; i += 1) {
        tmp.push(arr.splice(0, n));
    }

    return tmp;
}

/**
 * @memberof utils
 * @function numberWithCommas
 * @params {number} x
 * @desc 숫자 3자리 수 마다 콤마 찍기
 */
export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * @memberof utils
 * @function Convert space to something
 * @params {number} txt, maxLength
 * @desc 숫자에 원하는 크기만큼 0 추가
 */
export const convertSpaceToNum = (txt, maxLength) => {
    var i = 0, zero = '';
    if (txt.length < maxLength) {
        for (; i < maxLength - txt.length; i++)
            zero += '0';
    }
    return zero + txt;
};

/**
 * 
 * @param {Object} dummyData
 * @desc 더미데이터를 넘겨받아서 더미데이터를 넘겨주는 Promise 생성후 리턴함  
 */
export const createDummyPromise = (dummyData, timer = 10) => () => new Promise((resolve, reject) => {
    setTimeout(() => resolve(dummyData), timer);
});

// export const bookmarkCreate = (data) => {
//     const result = await MeTV.request012(data);
//     return true;
// };

export default class Utils {

    static tasStartData = '';
    static tasLogData = '';
    static cwCacheData = {};
    static nxpgCacheData = {};
    static IMAGE_SIZE_VER = 'image_size_vertical';   //포스터 이미지 세로사이즈
    static IMAGE_SIZE_HOR = 'image_size_horizontal';   //포스터 이미지 가로사이즈
    static IMAGE_SIZE_BIGBANNER = 'image_size_bigbanner';   //포스터 이미지 빅베너사이즈
    static IMAGE_SIZE_SYNOP_TITLE = 'image_size_synop_short_title';   //시놉시스 타이틀 이미지 사이즈
    static IMAGE_SIZE_SYNOP_SERIES_TITLE = 'image_size_synop_series_title';   //시놉시스 시리즈 타이틀 이미지 사이즈
    static IMAGE_SIZE_SYNOP_BANNER = 'image_size_synop_short_banner';   //시놉시스 배너 이미지 사이즈
    static IMAGE_SIZE_SYNOP_DETAIL_SLIDE = 'image_size_synop_detail_slide'; //시놉시스 상세 슬라이드 이미지 사이즈
    static IMAGE_SIZE_SYNOP_STILLCUT = 'image_size_synop_stillcut'; //시놉시스 스틸컷 상세 이미지 사이즈
    static IMAGE_SIZE_MONTHLY_BLOCK = 'image_size_monthly_block';
    static IMAGE_SIZE_MONTHLY_BANNER_BIG = 'image_size_monthly_monthly_banner_big';
    static IMAGE_SIZE_MONTHLY_BANNER_SMALL = 'image_size_monthly_monthly_banner_small';
    static IMAGE_SIZE_SYNOP_VOD_CONTENT_SIZE = 'image_size_synop_vod_content'; //VOD시놉시스 CONTENT 이미지 사이즈
    static IMAGE_SIZE_SYNOP_SHORT_HERO_NONE = 'image_size_synop_short_hero_none'; //시놉시스 단편 히어로 이미지 없을때
    static IMAGE_SIZE_SYNOP_SERIES_HERO_NONE = 'image_size_synop_series_hero_none'; //시놉시스 시리즈 히어로 이미지 없을때

    /* 키즈존 */
    static IMAGE_KIDS = {
        KIDS_IMAGE_SIZE_VER: 'kids_ver_size',
        KIDS_IMAGE_SIZE_HOR: 'kids_hor_size',
        KIDS_IMAGE_SIZE_CW: 'kids_cw_size',
        KIDS_IMAGE_SIZE_CIRCLE: 'kids_circle_size',
        KIDS_BANNER_SIZE_C: 'kids_banner_size_c',
        KIDS_BANNER_SIZE_B: 'kids_banner_size_b',
        KIDS_BANNER_SIZE_A: 'kids_banner_size_a',
        CHARACTER_LIST: 'CHARACTER_LIST',
        CHARACTER_LASTWATCH: 'CHARACTER_LASTWATCH',
        MONTHLY_HOME: 'MONTHLY_HOME',
        MONTHLY_BANNER_BIG: 'MONTHLY_BANNER_BIG',
        MONTHLY_BANNER_SMALL: 'MONTHLY_BANNER_SMALL',
        CHARACTER_HOME_FOCUS_OUT: 'CHARACTER_HOME_FOCUS_OUT',
        CHARACTER_HOME_FOCUS_IN: 'CHARACTER_HOME_FOCUS_IN',
        PLAYLEARNING_LIST: 'PLAYLEARNING_LIST',
        SUB_CHARACTER: 'SUB_CHARACTER',
        SUB_CHARACTER_BLOCK: 'SUB_CHARACTER_BLOCK',
        SUB_CHARACTER_APP: 'SUB_CHARACTER_APP'
    }

    static IMAGE_SIZE_HERO = 'image_size_full';   //시놉시스 이미지 가로사이즈

    static EVENT = {
        SINGLE: 'single',
        COUPLE: 'couple',
        TRIPLE: 'triple',
    }

    static MENU_BLOCK_IMAGE = 'MENU_BLOCK_IMAGE';
    static PURCHASE_PPM_IMAGE = 'purchase_ppm_image';   //구매 월정액 이미지

    static getIipImageUrl = (width, height, option = '') => {
        return appConfig.headEnd.IMAGE.url + '/' + width + '_' + height + (option ? '_' + option : '');
    }

    static getImageUrl = (type) => {
        const IMAGE_PNG = '_A20';   //png로 요청할때 넣는다. (배경 투명)
        const IMAGE_BLUR = '_B20';  // blur 이미지
        switch (type) {
            case Utils.IMAGE_SIZE_HOR:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hor_size;
            case Utils.IMAGE_SIZE_VER:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.ver_size;
            case Utils.IMAGE_SIZE_BIGBANNER:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.bigbanner_size;
            case Utils.IMAGE_SIZE_SYNOP_TITLE:  //투명
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_short_title + IMAGE_PNG;
            case Utils.IMAGE_SIZE_SYNOP_SERIES_TITLE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_series_title + IMAGE_PNG;
            case Utils.IMAGE_KIDS.CHARACTER_LIST:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.character_list;
            case Utils.IMAGE_KIDS.CHARACTER_LASTWATCH:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.character_watch;
            case Utils.IMAGE_KIDS.MONTHLY_BANNER_BIG:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.monthly_banner_big;
            case Utils.IMAGE_KIDS.MONTHLY_BANNER_SMALL:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.monthly_banner_small;
            case Utils.IMAGE_KIDS.MONTHLY_HOME:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.monthly_home;
            case Utils.IMAGE_KIDS.SUB_CHARACTER:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.sub_character;
            case Utils.IMAGE_KIDS.SUB_CHARACTER_BLOCK:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.sub_character_block;
            case Utils.IMAGE_KIDS.SUB_CHARACTER_APP:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.sub_character_app;
            case Utils.IMAGE_SIZE_HERO_BLUR:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hero_size + IMAGE_BLUR;
            case Utils.IMAGE_KIDS.CHARACTER_HOME_FOCUS_OUT:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.character_home_focusOut;
            case Utils.IMAGE_KIDS.CHARACTER_HOME_FOCUS_IN:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.character_home_focusIn;
            case Utils.IMAGE_KIDS.PLAYLEARNING_LIST:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.playlearning_list;
            case Utils.IMAGE_SIZE_HERO:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hero_size;
            case Utils.IMAGE_SIZE_SYNOP_BANNER:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_short_banner;
            case Utils.IMAGE_SIZE_SYNOP_DETAIL_SLIDE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_detail_slide;
            case Utils.IMAGE_SIZE_SYNOP_STILLCUT:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.stiilcut_size;
            case Utils.IMAGE_SIZE_MONTHLY_BLOCK:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.monthly_block;
            case Utils.IMAGE_SIZE_MONTHLY_BANNER_BIG:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.monthly_banner_big;
            case Utils.IMAGE_SIZE_MONTHLY_BANNER_SMALL:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.monthly_banner_small;
            case Utils.IMAGE_SIZE_SYNOP_VOD_CONTENT_SIZE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_vod_content;
            case Utils.IMAGE_SIZE_SYNOP_SHORT_HERO_NONE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_short_hero_none;
            case Utils.IMAGE_SIZE_SYNOP_SERIES_HERO_NONE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.synop_series_hero_none;
            case Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_VER:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_ver_size;
            case Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_HOR:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_hor_size;
            case Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_CW:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_cw_size;
            case Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_CIRCLE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_circle_size;
            case Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_C:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_banner_c_size;
            case Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_B:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_banner_b_size;
            case Utils.IMAGE_KIDS.KIDS_BANNER_SIZE_A:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.kids.kids_banner_a_size;
            case Utils.EVENT.SINGLE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.event.single;
            case Utils.EVENT.COUPLE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.event.couple;
            case Utils.EVENT.TRIPLE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.event.triple;
            case Utils.MENU_BLOCK_IMAGE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.menu_block_image;
            case Utils.PURCHASE_PPM_IMAGE:
                return appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.purchase_ppm_image;
            default:
                return '';
        }
    }

    /**
     * bookmarkCreate 찜 등록
     * @param {*} data  group (VOD 콘텐츠: "VOD", TV App: "VAS", Live Channel: "IPTV")
     *                  sris_id (VOD 콘텐츠: epsd_id, TV App: content_id, Live Channel: serviceId)
     */
    static async bookmarkCreate(data) {
        let result = await MeTV.request012(data);
        console.log('찜등록 로직 완료', result);
        if (result.result === "0000") {
            StbInterface.setFavorite('R', data.group, data.sris_id);
        }
        return result;
    }

    /**
     * bookmarkDelete 찜 해제(전체 삭제, 부분삭제 가능)
     * @param {*} data  group (VOD 콘텐츠: "VOD", TV App: "VAS", Live Channel: "IPTV")
     *                  sris_id (VOD 콘텐츠: epsd_id, TV App: content_id, Live Channel: serviceId)
     * @param {*} actionType D: 해제, A: 전체삭제
     */
    static async bookmarkDelete(data, actionType = 'D') {
        const result = await MeTV.request013(data);
        console.log('찜해지 로직 완료', result);
        if (result.result === "0000") {
            StbInterface.setFavorite(actionType, data.group, data.sris_id);
        }
        return result;
    }

    /**
     * 최근 시청 VOD 목록 삭제
     * H/E 를 통해 삭제후 네이티브에 정보 갱신
     * @param 
     * {    
     *      isAll: 'Y' or 'N' 전체삭제 , 개별삭제
     *      deleteList: [
     *          {
     *             sris_id,
     *             epsd_id 
     *          }
     *      ]
     * }
     * @return
     *  삭제 성공 여부 : bool
     */
    static async deleteRecentVod({ isAll = 'N', srisId, epsdId }) {
        const param = {
            isAll,
            deleteList: [srisId]
        };
        let result = null;
        try {
            result = await MeTV.request022(param);
        } catch (err) {
            return false;
        } finally {
            const isSuccessed = (result && result.result === '0000');
            if (isSuccessed) {
                const actionType = isAll === 'Y' ? 'A' : 'D';
                StbInterface.deleteRecentVod(actionType, epsdId);
                return true;
            }
            return false;
        }
    }

    /**
     * 시놉시스 데이터 조회후 반환
     * IF-NXPG-010
     */
    static async requestSynopsisData(data) {
        let xpg010Param = {};
        xpg010Param.search_type = data.search_type;
        if (xpg010Param.search_type === '1') {
            xpg010Param.sris_id = data.sris_id;
            xpg010Param.epsd_id = data.epsd_id;
        } else {
            xpg010Param.epsd_rslu_id = data.epsd_rslu_id;
        }
        const xpg010 = await NXPG.request010(xpg010Param);

        return xpg010
    }

    /**
     * movePageAfterCheckLevel
     * 특정 화면으로 진입시, 성인인증 팝업이 필요한 경우 팝업 발생
     * @param {*} movePage 화면 이동 path
     * @param {*} param 화면에 넘겨줄 데이터
     * @param {*} level 시청연령가능 레벨
     */
    static movePageAfterCheckLevel(movePage, param, level) {
        let settingAge;
        if (!appConfig.runDevice) {
            settingAge = appConfig.STBInfo.level;
        } else {
            settingAge = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);
        }
        if (!isEmpty(settingAge) && settingAge !== '0' && (Number(level)) >= Number(settingAge)) {
            let obj = {
                certification_type: constants.CERT_TYPE.AGE_LIMIT,
                age_type: level
            };
            Core.inst().showPopup(<AdultCertification />, obj, (data) => {
                if (data && data.result === '0000') {
                    param.adult_flag = data.adult_flag;
                    Core.inst().move(movePage, param);
                }
            });
        } else {
            Core.inst().move(movePage, param);
        }
    }

    /**
     * moveMonthlyPage
     * 월정액 상세 화면으로 이동
     * @param {String} movePage 화면 이동 path. constants.MONTHLY_AFTER를 사용
     * @param {Object} param 해당 블럭의 menu info
     * @param {Boolean} [isRegisteredPPM = false] 이동하려는 월정액 상세 화면이 가입된 상품의 상세 화면인지 여부. default는 false.
     */
    static moveMonthlyPage(movePage, param, isRegisteredPPM) {
        const { call_url, prd_prc_id, prd_typ_cd, shcut_menu_id, title } = param;
        const price = { prdPrc: param.prd_prc, prdPrcVat: param.prd_prc_vat, salePrc: param.sale_prc, salePrcVat: param.sale_prc_vat };
        const callUrlObj = Utils.parseCallUrl(call_url);
        let { gnbTypeCode } = param;
        let menuId = shcut_menu_id;
        let propsData;

        console.log('[moveMonthlyPage()]:', movePage, param, isRegisteredPPM);

        if (isEmpty(gnbTypeCode)) {
            gnbTypeCode = callUrlObj.gnbTypeCode;
        }

        if (isEmpty(menuId)) {
            menuId = callUrlObj.menuId;
        }

        propsData = {
            gnbTypeCode,
            menuId,
            prd_prc_id,
            price,
            title,
            isDetail: true,
            isRegisteredPPM: isRegisteredPPM || false
        };

        if (prd_typ_cd === PRD_TYP_CD.COMPLX_VOD_PPM) {         // '34'만 바로 결재. '35'는 일반과 똑같이. (from 조영선M)
            console.log('복합 VOD PPM 상품 prd_typ_cd:', prd_typ_cd);
            CTSInfo.purchasePPMByHome({ pid: prd_prc_id }, () => { });
        } else if (isEmpty(menuId)) {
            Core.inst().showToast('shcut_menu_id가 없습니다. H/E 이슈', '', 3000);
        } else {
            propsData.genreGnbTypeCode = callUrlObj.gnbTypeCode;
            Core.inst().move(`${MONTHLY_AFTER}/${gnbTypeCode}/${menuId}`, propsData);
        }
    }
    /*
     * getRegisteredMonthlyProducts
     * 가입된 월정액 상품 ID 목록 반환
     */
    static getRegisteredMonthlyProducts = async () => {
        return await MeTV.request036();
    }

    /**
     * parseCallUrl
     * call_url을 parsing하여 결과를 반환.
     * 기존에는 GNB_TYP_CD/MENU_ID 였으나, GNB_TYP_CD/KIDSZ_GNB_CD/BLK_TYP_CD/MENU_ID로 변경되어,
     * routing을 위한 GNB_TYP_CD와 MENU_ID를 얻어올 때 문제가 있음.
     * 이 함수를 통해 parsing 후 gnbTypeCode와 menuId를 이용하면 됨.
     * @param {String} callUrl call url
     * @return {Object}
     *   {
     *     gnbTypeCode,
     *     menuId,
     *     kidsGnbCode,
     *     blockTypeCode
     *   }
     */
    static parseCallUrl(callUrl) {
        let parsed;
        const obj = {
            gnbTypeCode: '',
            menuId: '',
            kidsGnbCode: '',
            blockTypeCode: ''
        };

        if (isEmpty(callUrl)) {
            console.error('callUrl이 없습니다.');
        } else {
            parsed = callUrl.split('/');
        }

        if (Array.isArray(parsed)) {
            obj.gnbTypeCode = parsed[0];
            obj.menuId = last(parsed);
            if (includes(obj.menuId, '|')) {
                const arr = obj.menuId.split('|');
                obj.menuId = last(arr);
            }

            if (parsed.length === 4) {
                obj.kidsGnbCode = parsed[1];
                obj.blockTypeCode = parsed[2];
            }
        }

        return obj;
    }

    static getGnbTypeCodeToPageMove(gnbTypeCode, menuId) {
        let gnbTypeCodeToPageMove = {
            [GNB_MONTHLY]: `${MONTHLY_AFTER}/${gnbTypeCode}/${menuId}`,
            [GNB_MYBTV]: MYBTV_HOME,
            [GNB_KIDS]: KIDS_HOME,
            [GNB_HOME]: HOME,
            [GNB_MOVIE]: `${HOME}/${gnbTypeCode}/${menuId}`,
            [GNB_TV]: `${HOME}/${gnbTypeCode}/${menuId}`,
            [GNB_ANI]: `${HOME}/${gnbTypeCode}/${menuId}`,
            [GNB_DOCU]: `${HOME}/${gnbTypeCode}/${menuId}`,
            [GNB_SENIOR]: `${HOME}/${gnbTypeCode}/${menuId}`,
            [GNB_TVAPP]: HOME_TVAPP,
            [GNB_VIEWALL]: ALL_MENU,
            [GNB_SEARCH]: SEARCH_HOME
        };
        let path = gnbTypeCodeToPageMove[gnbTypeCode];

        if (isEmpty(path)) {
            path = `${HOME}/${gnbTypeCode}/${menuId}`;
        }
        return path;
    }

    static getlocalFile = (fileName, callback = {}) => new Promise((resolve, reject) => {
        let verPath = '/ui5web/v5/' + fileName;
        if (!appConfig.runDevice) {
            verPath = 'http://localhost:3000/' + fileName;
        }
        Axios.get(verPath).then(function (response) {
            resolve(response);
        });
    });


    static toSynopsis = (synon_typ_cd, param, isDetailedGenreHome) => {
        let path = SYNOPSIS;
        if (synon_typ_cd === '01' || synon_typ_cd === '02') {		//시즌/단편
            // console.log('%c JUST SYNOPSIS', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', );
            console.log('JUST SYNOPSIS');
            path = SYNOPSIS;
        } else if (synon_typ_cd === '03') {			// GW시놉(패키지 형)
            path = SYNOPSIS_GATEWAY;
        } else if (synon_typ_cd === '04') {			// VOD관련상품 시놉 (커머스형)
            path = SYNOPSIS_VODPRODUCT;
        }
        // console.log('%c 시놉시스 이동 path=%s synon_typ_cd=%s', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', path, synon_typ_cd);
        console.log('시놉시스 이동 path=%s synon_typ_cd=%s', path, synon_typ_cd);
        // this.movePage(path, param);
        //Utils.movePageAfterCheckLevel(path, param, param.wat_lvl_cd);
        // 인증(05.28)시나리오 P.14, P35 시놉시스 진입시 컨텐츠 제한 19세 이상일 경우만 인증팝업 호출
        if (param.wat_lvl_cd === '19' && !isDetailedGenreHome) {
            Utils.movePageAfterCheckLevel(path, param, param.wat_lvl_cd);
        } else {
            Core.inst().move(path, param);
        }

    }


    // call_type_cd 를 기반으로 다음 행동을 결정한다.
    static moveToCallTypeCode = async (data, isDetailedGenreHome, fromKids) => {
        const { callUrl, callTypeCode, /*bannerDetailTypeCode, vasItemId, */shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasServiceId } = data;
        console.log('callUrl=', callUrl);
        switch (callTypeCode) {
            case CALL_TYPE_CD.SHORT_CUT:	// 메뉴바로가기
                const gnbTypeCode = callUrl.split('/')[0];
                const kidsCode = callUrl.split('/')[1];
                const menuPath = callUrl.split('/')[2].split('|');
                let menuId = menuPath[menuPath.length - 1];

                if (isEmpty(kidsCode)) {
                    let len = menuPath.length;

                    if (len > 1) {
                        // 2개 이상일때는 detail 또는 스크롤 이동 필요
                        menuId = menuPath[len - 2];
                        // menuId = menuPath[0];
                        const result003 = await NXPG.request003({ menu_id: menuId });
                        const gnb = StbInterface.getGnbMenuList(gnbTypeCode);
                        console.log('result003', result003);
                        console.log('gnb', gnb);
                        menuId = menuPath[len - 1];
                        console.log('menuId', menuId);

                        if (isEmpty(result003.blocks)) {
                            Core.inst().move(`${HOME}/${gnbTypeCode}/${menuId}`, { gnbTypeCode, menuId });
                        } else {

                            for (const iterator of result003.blocks) {
                                console.log('iterator', iterator);

                                if (Utils.checkAndMovePage(menuId, iterator, gnb, menuPath, len)) {
                                    break;
                                }
                                // menus가 있으면 하위 뎁스 조회
                                if (isObject(iterator.menus)) {
                                    for (const menu of iterator.menus) {
                                        if (Utils.checkAndMovePage(menu.menu_id, menu, gnb, menuPath, len)) {
                                            return;
                                        }
                                    }
                                }
                            }  // end for
                            menuId = menuPath[len - 2];
                            const listMenuId = menuPath[len - 1];
                            console.log('menuId=%s, listMenuId=%s', menuId, listMenuId);
                            Core.inst().move(`${HOME}/${gnbTypeCode}/${menuId}`, { gnbTypeCode, menuId, listMenuId });
                        }

                        // Core.inst().move(`${DETAIL_GENRE_HOME}`, { gnbTypeCode, menuId });
                    } else {
                        // 1개 일때는 무조건 장르홈 이동
                        Core.inst().move(`${HOME}/${gnbTypeCode}/${menuId}`, { gnbTypeCode, menuId });
                    }

                } else {
                    // 키즈존 이동
                    let pathInfoObj = {
                        menu_id: menuId,
                        prevTitle: '',
                        kidsGnbCode: kidsCode,
                        blkTyCode: ''
                    }
                    kidsViewMove.setMoveParam('', pathInfoObj);
                    const kidsParam = await kidsViewMove.getMoveParam();
                    pathInfoObj = kidsParam.pathParam;
                    let isFirstKidsEntry = StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN);

                    if (isFirstKidsEntry === '0' || isEmpty(isFirstKidsEntry)) { // 키즈존 최초 진입 시 값은 0 또는 undefined
                        StbInterface.menuNavigationNative(MENU_NAVI.KIDS_ZONE, { menuId: MENU_ID.KIDS_ZONE_FIRST_INTRO });  // 키즈존 최초 설정 이동
                        appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN, '1'); // 키즈존 최초 진입 시 1로 셋팅 필요
                        return;
                    } else {
                        StbInterface.kidszoneState('enter');  // 키즈존 진입 전달
                        !appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '1');
                    }
                    Core.inst().move(KIDS_HOME, pathInfoObj);
                    // this.movePage(path, pathInfoObj);
                    // Core.inst().move(`${KIDS_HOME}/${gnbTypeCode}/${menuId}`, { gnbTypeCode, menuId });
                }
                break;
            case CALL_TYPE_CD.SYNOPSIS:		// 시놉시스 이동
                const synopParam = { sris_id: shortcutSeriesId, epsd_id: shortcutEpisodeId };
                Utils.toSynopsis(synopsisTypeCode, synopParam, isDetailedGenreHome);
                break;
            case CALL_TYPE_CD.LIVE_CH:		// 실시간 채널
                let channelNo = callUrl.split('=')[1];
                const data = { channelNo, entryPath: 'WING_UI', fromMenu: fromKids ? 'KIDS_ZONE' : '' }
                StbInterface.requestLiveTvService('M', data, null); //채널이동
                break;
            case CALL_TYPE_CD.VIRTUAL_CH:	// 가상 채널
                Core.inst().showToast('가상채널로 이동 할 수 없습니다.', '', 3000);
                break;
            case CALL_TYPE_CD.BROWSER:		// 브라우저
                StbInterface.openPopup('url', callUrl);
                break;
            case CALL_TYPE_CD.APP:
                let AMS_applistData = await AMS.appList_r();
                const appList = AMS_applistData.BIZ_CD.DATA.ITEM_LIST.ITEM_INFO;
                let appLaunchData = {};
                let title = '';
                let contentId = '';
                //let packageName = '';
                let inquiryFlag = false;
                for (let item of appList) {
                    if (item.VASS_ID === vasId) {
                        title = item.TITLE;
                        contentId = item.CON_ID;
                        inquiryFlag = true;
                        appLaunchData = {
                            title,  //	App 이름
                            serviceId: vasServiceId,  // App 서비스 아이디
                            vassId: vasId,  // App 고유 아이디
                            contentId,  //	App 콘텐츠 아이디
                            packageName: '',  // "앱 데이터에 PackageName 이 존재 할 경우 추가해서 내려준다. (만약 hasVaasId 가 Y 인경우 필수)"
                            entryPath: 'HOME',  // "HOME" - 홈 > TV앱 실행 시
                        }
                        break;
                    }
                }
                if (inquiryFlag) {
                    StbInterface.launchApp(appLaunchData);
                } else {
                    Core.inst().showToast('AMS App list 에서 일치하는 앱이 없습니다. H/E 이슈', '', 3000);
                }
                break;
            default: break;
        }
    }

    static checkAndMovePage(menuId, iterator, gnb, menuPath, len) {
        let rs = false;
        if (menuId === iterator.menu_id) {
            console.log('iterator.blk_typ_cd', iterator.blk_typ_cd);
            // 해당하는 블럭이 30이면 detail 이동,  아니면 장르홈 이동.
            if (iterator.blk_typ_cd === '30') {
                const param = {
                    gnbTypeCode: gnb.gnbTypeCode, menuId, depth1Title: gnb.menuText, depth2Title: iterator.menu_nm, isDetailedGenreHome: true,
                };
                Core.inst().move(`${DETAIL_GENRE_HOME}`, param);
            } else {
                menuId = menuPath[len - 2];
                const listMenuId = menuPath[len - 1];
                console.log('menuId=%s, listMenuId=%s', menuId, listMenuId);
                Core.inst().move(`${HOME}/${gnb.gnbTypeCode}/${menuId}`, { gnbTypeCode: gnb.gnbTypeCode, menuId, listMenuId });
            }
            rs = true;
        }
        return rs;
    }

    // 페이지 이동 시 인증처리
    static goToPageCertification({ menuExpsPropCode = 0, path = '', param = {}, level = '0' }) {
        const adult = StbInterface.getProperty(ADULT_MOVIE_MENU);
        const eros = StbInterface.getProperty(EROS_MENU);
        let certificationType;
        if (menuExpsPropCode === '29' || menuExpsPropCode === '30') {
            if (this.CHILDREN_SEE_LIMIT === '0' && ((menuExpsPropCode === '29' && adult === '1') || (menuExpsPropCode === '30' && eros === '1'))) {
                //나이제한 없음 && 성인영화(성인메뉴보기) || 성인플러스(성인메뉴보기) 일경우 인증없이 이동
                Core.inst().move(path, param);
            } else {
                if (menuExpsPropCode === '29') {
                    certificationType = adult === '0' ? CERT_TYPE.PROTECTION : CERT_TYPE.ADULT_SELECT;
                } else {
                    certificationType = eros === '0' ? CERT_TYPE.PROTECTION : CERT_TYPE.ADULT_SELECT;
                }

                if (certificationType) {
                    Core.inst().showPopup(
                        <AdultCertification />,
                        {
                            certification_type: certificationType,
                            age_type: '',
                        },
                        response => {
                            if (certificationType === CERT_TYPE.PROTECTION) {
                                const ADULTMOVIEMENU = isNil(StbInterface.getProperty(ADULT_MOVIE_MENU)) ? '0' : StbInterface.getProperty(ADULT_MOVIE_MENU);
                                const EROSMENU = isNil(StbInterface.getProperty(EROS_MENU)) ? '0' : StbInterface.getProperty(EROS_MENU);

                                if (menuExpsPropCode === '29' && ADULTMOVIEMENU === '1') {
                                    Core.inst().move(path, param);
                                } else if (menuExpsPropCode === '30' && EROSMENU === '1') {
                                    Core.inst().move(path, param);
                                }
                            } else {
                                if (response.result === "0000") {
                                    Core.inst().move(path, param)
                                }
                            }
                        }
                    )
                }
            }
        } else {
            if (this.CHILDREN_SEE_LIMIT === '0') {
                Core.inst().move(path, param);
                return;
            } else {
                // 시청연령제한 체크
                Utils.movePageAfterCheckLevel(path, param, level);
            }
        }
    }


    // 쿠폰 정보 및 bpoint 조회 
    static requestCouponsPointInfo(callback) {
        let date = StbInterface.getProperty(STB_PROP.COUPONS_POINT_REQUEST_TIME);
        console.log('StbInterface.getProperty date', date);
        if (isEmpty(date)) {
            // console.log('isEmpty');
            date = new Date().getTime();
        }
        // console.log('date', date);
        let nowDate = new Date().getTime();
        // console.log('nowDate', nowDate);
        let lapseTime = parseInt((nowDate - (Number(date))) / 1000, 10);
        console.log('lapseTime=', lapseTime);
        // 시간 비교, 조회 시간이 5분이 넘었는지
        if (lapseTime > 300) {
            StbInterface.requestCouponPoint(callback);
            StbInterface.setProperty(STB_PROP.COUPONS_POINT_REQUEST_TIME, nowDate);
        } else {

            if (appConfig.STBInfo.couponNew === '' || appConfig.STBInfo.couponNew === 'Y' || appConfig.STBInfo.couponNew === 'N') {
                appConfig.STBInfo.couponNew = appConfig.STBInfo.couponNew === 'Y' ? true : false;
            }
            if (appConfig.STBInfo.newBpoint === '' || appConfig.STBInfo.newBpoint === 'Y' || appConfig.STBInfo.newBpoint === 'N') {
                appConfig.STBInfo.newBpoint = appConfig.STBInfo.newBpoint === 'Y' ? true : false;
            }
            const data = {
                coupon_count: appConfig.STBInfo.coupon,
                coupon_new: appConfig.STBInfo.couponNew,
                bpoint_count: appConfig.STBInfo.bPoint,
                bpoint_new: appConfig.STBInfo.newBpoint
            }
            console.log('requestCouponsPointInfo data', data);

            callback(data);
        }
    }

    // cw 009캐싱 데이터 가져오기
    static getCWNxpg009Cache(key) {

        let rs = '', data = this.cwCacheData[key], nowDate = new Date().getTime();
        // console.log('this.cwCacheData[key]=' + this.cwCacheData[key]);

        // 데이터가 있는 경우
        if (!isEmpty(data)) {
            let lapseTime = parseInt((nowDate - (Number(data.time))) / 1000, 10);
            // console.log(' getCWNxpg009Cache lapseTime=', lapseTime);

            // 시간 비교, 조회 시간이 10분이 넘었는지
            if (lapseTime > 600) {
                this.cwCacheData[key] = undefined;
                rs = '';
            } else {
                rs = this.cwCacheData[key].val;
                // console.log('it has cw cache data ');
            }
        }
        // console.log('cw rs=', rs);
        return rs;
    }

    // cw 009캐싱 데이터 저장오기
    static setCWNxpg009Cache(key, val) {
        // console.log('setCWNxpg009Cache [[[[[set]]]]] key=', key);
        // console.log('setCWNxpg009Cache val=', val);

        let time = new Date().getTime();
        this.cwCacheData[key] = { val, time };
    }

    static getNxpgCache(key) {

        let rs = '', data = this.nxpgCacheData[key];
        // console.log('this.nxpgCacheData[key]=' + this.nxpgCacheData[key]);

        // 데이터가 있는 경우
        if (!isEmpty(data)) {
            rs = cloneDeep(data);
        }
        // console.log('cw rs=', rs);
        return rs;
    }

    static setNxpgCache(key, val) {
        // console.log('setNxpgCache [[[[[set]]]]] key=', key);
        this.nxpgCacheData[key] = val;
    }

    /**
     * 상품 시작일부터 상품 시청일까지의 데이터만 노출하도록 변경
     * @param nxpg010(nxpg010 Raw Data)
     */
    static checkValidDataNXPG010(nxpg010) {
        // const dateFormat = require('dateformat');
        let i, result = cloneDeep(nxpg010);
        const curDate = dateFormat(new Date(), 'yyyymmddHHMMss');
        if (nxpg010.contents.prodcuts !== undefined && nxpg010.contents.prodcuts !== null) {
            result.contents.prodcuts = [];
            for (i = 0; i < nxpg010.contents.prodcuts.length; i++) {
                if (curDate >= Number(nxpg010.contents.prodcuts[i].prd_prc_fr_dt)
                    && curDate <= Number(nxpg010.contents.prodcuts[i].purc_wat_to_dt)) {
                    result.contents.prodcuts.push(nxpg010.contents.prodcuts[i]);
                }
            }
        }
        if (nxpg010.purchares !== undefined && nxpg010.purchares !== null) {
            result.purchares = [];
            for (i = 0; i < nxpg010.purchares.length; i++) {
                if (curDate >= Number(nxpg010.purchares[i].prd_prc_fr_dt)
                    && curDate <= Number(nxpg010.purchares[i].purc_wat_to_dt)) {
                    result.purchares.push(nxpg010.purchares[i]);
                }
            }
        }

        return result;
    }


    /**
     *  로컬에 저장되어 있는 이미지를 pre Load 해준다.
     */
    static localImagePreLoad() {
        let key, i, imageArray = [];
        // preLoadImages은 WepApp화면 이동중 Live 나타나는 현상 개선을 위해 bg에 해당하는 것들만 포함시킴(180609 sophia)
        let preLoadImages = {
            home: ['bg_silver.png'],
            common: ['bg/bg.png', 'bg/bg_popup.png', 'bg/img-bigbaner-dim.png', 'bg/layered-bg.png', 'default/kids_character_sub_default.png'],
            allMenu: ['menu-bg-left.png', 'menu-bg-right2.png'],
            buy: ['bg-purchase-bottom.png', 'bg-purchase-top.png'],
            // certification: [],
            kids: ['genremenu/bg-genremenu-all.png', 'genremenu/bg-genremenu-title.png', 'monthly/bg-monthly.png'],
            liveTv: ['bg.png', 'bg-boxoffice.png', 'bg-live.png', 'bg-popup.png', 'bg-topchannel.png', 'img-channelplus-slide-bg.png'],
            // monthly:        [],
            myBtv: ['vod-bg-shape.png', 'bg-own-vod-02.png', 'bg-own-vod-recommend.png', 'vod-bg-tone-02.png', 'bg-own-vod-03.png'],
            search: ['bg-search.png'],
            synopsis: ['bg-synopsis-default.png'],
            // tmp:            [],
            vod: ['bg_vod_ending_center.png', 'bg_vod_ending_left.png']
        };
        /*
        // preLoadImagesAll은 배경 이미지 이외의 것이 포함 됨. 프리로드 시간 단축을 위해 사용하지 않음(180609 sophia)
        let preLoadImagesAll = {
            allMenu: ['menu-bg-left.png', 'menu-bg-right.png', 'menu-bg-right2.png'],
            buy: ['arrow-current.png', 'bg-purchase-bottom.png', 'bg-purchase-top.png', 'focus-bg.png', 'ic-bill-foc.png', 'ic-bill-nor.png', 'ic-bill-sel.png', 'ic-credit-foc.png', 'ic-credit-nor.png', 'ic-credit-sel.png', 'ic-mobile-foc.png', 'ic-mobile-nor.png', 'ic-mobile-sel.png', 'ic_bill_foc.png', 'ic_bill_nor.png', 'ic_bill_sel.png', 'ic_credit_foc.png', 'ic_credit_nor.png', 'ic_credit_sel.png', 'ic_mobile_foc.png', 'ic_mobile_nor.png', 'ic_mobile_sel.png', 'logo.png', 'normal-bg.png', 'path-8.png'],
            certification: ['ic-12.png', 'ic-15.png', 'ic-19.png', 'ic-7.png', 'ic-childsafe.png', 'ic-error-certification.png', 'ic-safety-settings.png'],
            common: ['bg/arrow-gradient-l.png', 'bg/arrow-gradient-r.png', 'bg/bg-tooptip-c.png', 'bg/bg-tooptip-down-arr.png', 'bg/bg-tooptip-l.png', 'bg/bg-tooptip-r.png', 'bg/bg-tooptip-up-arr.png', 'bg/bg.png', 'bg/bg_popup.png', 'bg/home-banner-oap-bg-test-test.png', 'bg/home-banner-oap-n-test.png', 'bg/img-banner-oap-bg.png', 'bg/img-bigbaner-dim.png', 'bg/layered-bg.png'],
            home: ['bg_silver_pip.png', 'bg_silver.png'],
            kids: ['genremenu/bg-genremenu-all.png', 'genremenu/bg-genremenu-title.png'],
            liveTv: ['arrow-bri-scroll-down.png', 'arrow-bri-scroll-up.png', 'arrow-menu-up.png', 'arrow-menu.png', 'arrow-multiview-down.png', 'arrow-multiview-up.png', 'bg-boxoffice-all-mask.png', 'bg-boxoffice.png', 'bg-live.png', 'bg-popup.png', 'bg-topchannel-mask-1.png', 'bg-topchannel-mask-2.png', 'bg-topchannel-mask-3.png', 'bg-topchannel-mask-4.png', 'bg-topchannel-mask-5.png', 'bg-topchannel-mask-6.png', 'bg-topchannel-mask-7.png', 'bg-topchannel-mask-8.png', 'bg-topchannel.png', 'bg.png', 'channel-default-img-audio.png', 'channel-default-img-block.png', 'channel-default-img-btv.png', 'channel-default-img-notjoin.png', 'channel-default-img-protection.png', 'channel-default-img-restrict.png', 'channel-default-img-uhd.png', 'channel_default_img_audio.png', 'channel_default_img_block.png', 'channel_default_img_notjoin.png', 'channel_default_img_protection.png', 'channel_default_img_restrict.png', 'channel_default_img_uhd.png', 'combined-shape.png', 'combined-shape1.png', 'combined-shape2.png', 'flag-ch-favorite-gray.png', 'flag-ch-favorite-nor.png', 'flag-ch-not-included.png', 'flag-ch-protection.png', 'flag-dar-age-12.png', 'flag-dar-age-15.png', 'flag-dar-age-19.png', 'flag-dar-age-7.png', 'flag-dar-age-all.png', 'flag-fav-channel-n.png', 'group-12.png', 'ic-alarm-foc.png', 'ic-alarm-nor.png', 'ic-block.png', 'ic-chsetting-f.png', 'ic-chsetting-n.png', 'ic-menu-arrow.png', 'ic-mutiview-f.png', 'ic-mutiview-n.png', 'ic-star.png', 'icon-channelplus-colse.png', 'icon-channelplus-open.png', 'img-channelplus-slide-bg.png', 'multiview-check-sel-foc.png', 'multiview-check-sel.png', 'multiview-chn-bg-sel.png', 'multiview-chn-bg.png', 'nor1.png', 'nor2.png', 'nor3.png', 'tooltip-arr.png'],
            // monthly:        [],
            myBtv: ['arrow-menu-active.png', 'arrow-menu-vod-down.png', 'arrow-menu-vod-up.png', 'arrow-menu-vod.png', 'arrow-menu.png', 'arrow-recommend-left.png', 'arrow-recommend-right.png', 'bPoint-bg.png', 'bPoint-card-01-f.png', 'bPoint-card-01.png', 'bPoint-card-02-f.png', 'bPoint-card-02.png', 'bPoint-card-03-f.png', 'bPoint-card-03.png', 'bPoint-card-04-f.png', 'bPoint-card-04.png', 'bPoint-card-05-f.png', 'bPoint-card-05.png', 'bPoint-list-01-f.png', 'bPoint-list-01.png', 'bPoint-list-02-f.png', 'bPoint-list-02.png', 'bPoint-list-03-f.png', 'bPoint-list-03.png', 'bPoint-list-04-f.png', 'bPoint-list-04.png', 'bPoint-list-05-f.png', 'bPoint-list-05.png', 'bg-oksusu-event.png', 'bg-own-vod-02.png', 'bg-own-vod-03.png', 'bg-own-vod-recommend.png', 'block-notice-event-foc.png', 'block-notice-event-nor.png', 'block-purchaselist-foc.png', 'block-purchaselist-nor.png', 'block-userguide-foc.png', 'block-userguide-nor.png', 'bpoint-bottom-bg.png', 'btv-logo-active.png', 'btv-logo.png', 'card-regist-active.png', 'card-regist-inactive.png', 'card-tmem.png', 'coupon-active.png', 'coupon-disable-focus.png', 'coupon-disable.png', 'coupon-focus.png', 'coupon-plus-active.png', 'coupon-plus.png', 'coupon.png', 'delete-btn-nor.png', 'ic-bell-active.png', 'ic-bell-notice-foc.png', 'ic-bell-notice-nor.png', 'ic-bell.png', 'ic-bluetooth-active.png', 'ic-bluetooth.png', 'ic-btv-active.png', 'ic-btv.png', 'ic-change-end.png', 'ic-channel-active.png', 'ic-channel.png', 'ic-checked-major.png', 'ic-contents-active.png', 'ic-contents.png', 'ic-guide-active.png', 'ic-guide.png', 'ic-kids-active.png', 'ic-kids.png', 'ic-movie-del-on.png', 'ic-movie-del.png', 'ic-multiview-active.png', 'ic-multiview.png', 'ic-nugu-active.png', 'ic-nugu.png', 'ic-oksusu-active.png', 'ic-oksusu.png', 'ic-pairing-foc.png', 'ic-pairing.png', 'ic-pay-active.png', 'ic-pay.png', 'ic-play-none.png', 'ic-play-play.png', 'ic-plus-foc.png', 'ic-plus-nor.png', 'ic-safety-settings-active.png', 'ic-safety-settings.png', 'ic-service-settings-active.png', 'ic-service-settings.png', 'ic-settop-active.png', 'ic-settop.png', 'ic-smartphone-active.png', 'ic-smartphone.png', 'ic-sound-active.png', 'ic-sound.png', 'ic-system-settings-active.png', 'ic-system-settings.png', 'ic-text-arr-active.png', 'ic-text-arr.png', 'ic-verification-active.png', 'ic-verification.png', 'img-bpoint-gift.png', 'img-oksusu-event-gift.png', 'img-oksusu-menu.png', 'img-oksusu-setting.png', 'img-recommend-back-effect-bottom.png', 'img-recommend-back-effect.png', 'img-recommend-case-foc.png', 'img-recommend-case-nor.png', 'img-recommend-cover-foc.png', 'img-recommend-cover.png', 'img-shelf-half-01.png', 'img-shelf-half.png', 'item-bpoint.png', 'item-coupon.png', 'item-okcashbag.png', 'item-tmembership.png', 'item-tvpoint.png', 'logo-box.png', 'logo-okcashbag.png', 'logo-oksusu-app.png', 'logo-oksusu-foc.png', 'logo-oksusu-nor.png', 'logo-oksusu-sel.png', 'logo-premier-purchase-cancel.png', 'okcash-focus.png', 'okcash-selected.png', 'okcash.png', 'recommend-layered.png', 'tmem.png', 'vod-bg-shape-arrow.png', 'vod-bg-shape.png', 'vod-bg-tone-01.png', 'vod-bg-tone-02.png'],
            search: ['KeyPad-space-icon-active.png', 'KeyPad-space-icon-foc.png', 'KeyPad-space-icon-nor.png', 'bg-search.png', 'ic-key-ok.png', 'ic-search-del-foc.png', 'ic-search-del-nor.png', 'ic-voice.png', 'icon-favor.png', 'icon-timer.png', 'ime-cha-change-tooltip-hor-bg.png', 'ime-cha-change-tooltip.png', 'input-set-h.png', 'input-set-w.png'],
            synopsis: ['arrow-season-l-on.png', 'arrow-season-l.png', 'arrow-season-r-on.png', 'arrow-season-r.png', 'arrow-shorttop-dark.png', 'arrow-shorttop.png', 'bg-synopsis-default.png', 'detail-feeling-dislike.png', 'detail-feeling-like.png', 'detail-grade-logo-01-light.png', 'detail-grade-logo-01.png', 'detail-grade-logo-02-light.png', 'detail-grade-logo-02.png', 'detail-review-logo-01.png', 'feeling-btv-logo-light.png', 'feeling-btv-logo.png', 'flag-bri-age-12.png', 'flag-bri-age-15.png', 'flag-bri-age-18.png', 'flag-bri-age-19.png', 'flag-bri-age-7.png', 'flag-bri-age-all.png', 'flag-dar-2-age-12.png', 'flag-dar-2-age-15.png', 'flag-dar-2-age-18.png', 'flag-dar-2-age-19.png', 'flag-dar-2-age-7.png', 'flag-dar-2-age-all.png', 'flag.png', 'goodwill-btv-logo.png', 'grade-line-bg-light.png', 'grade-line-bg.png', 'ic-bri-dislike-sel.png', 'ic-bri-like-nor.png', 'ic-bri-like-sel.png', 'ic-btv-logo-light.png', 'ic-btv-logo-on.png', 'ic-btv-logo.png', 'ic-combined-shape-light.png', 'ic-combined-shape-mini-light.png', 'ic-combined-shape-mini-on.png', 'ic-combined-shape-mini.png', 'ic-combined-shape-on-downsel.png', 'ic-combined-shape-on-upsel.png', 'ic-combined-shape-on.png', 'ic-combined-shape.png', 'ic-dar-dislike-sel.png', 'ic-dar-like-nor.png', 'ic-dar-like-sel.png', 'ic-dislike-sel-foc.png', 'ic-like-foc.png', 'ic-like-sel-foc.png', 'ic-monthlyfixedamount-none.png', 'ic-monthlyfixedamount-on.png', 'ic-play-none.png', 'ic-play-play.png', 'ic-reviewstar-mini-light.png', 'ic-reviewstar-mini-on.png', 'ic-reviewstar-mini.png', 'ic-scorestar-mini-light.png', 'ic-scorestar-mini-on.png', 'ic-scorestar-mini.png', 'ic-sn21-logo-light.png', 'ic-sn21-logo-mini-light.png', 'ic-sn21-logo-mini-on.png', 'ic-sn21-logo-mini.png', 'ic-sn21-logo-on.png', 'ic-sn21-logo-review.png', 'ic-sn21-logo.png', 'ic-star-none.png', 'ic-star-on.png', 'ic-star-restar.png', 'ic-watcha-logo-light.png', 'ic-watcha-logo-mini-light.png', 'ic-watcha-logo-mini-on.png', 'ic-watcha-logo-mini.png', 'ic-watcha-logo-on.png', 'ic-watcha-logo.png', 'ic_dislike_bri_nor.png', 'ic_dislike_bri_nor_sel.png', 'ic_dislike_dark_nor.png', 'ic_dislike_dark_nor_sel.png', 'ic_dislike_nor_foc.png', 'ic_dislike_sel_foc.png', 'ic_like_bri_nor.png', 'ic_like_bri_nor_sel.png', 'ic_like_dark_nor.png', 'ic_like_dark_nor_sel.png', 'ic_like_nor_foc.png', 'ic_like_sel_foc.png', 'icon-award-light.png', 'icon-award-on.png', 'icon-award.png', 'icon-check-my-assessment-on.png', 'icon-check-my-assessment.png', 'icon-detail-arrow-l.png', 'icon-detail-arrow-r.png', 'icon-prize-light.png', 'icon-prize.png', 'img-assessment-down-light.png', 'img-assessment-down-on.png', 'img-assessment-down-sel-light.png', 'img-assessment-down-sel-on.png', 'img-assessment-down-sel.png', 'img-assessment-down.png', 'img-assessment-up-light.png', 'img-assessment-up-on.png', 'img-assessment-up-sel-light.png', 'img-assessment-up-sel-on.png', 'img-assessment-up-sel.png', 'img-assessment-up.png', 'img-cancal.png', 'img-grade-grade-bg.png', 'img-grade-grade.png', 'img-review-grade-bg.png', 'img-review-grade.png', 'logo-oksusu-dark.png', 'logo-oksusu-light.png', 'logo-oksusu.png', 'review-pop-logo-sn21-light.png', 'review-pop-logo-sn21.png', 'review-pop-logo-watcha-light.png', 'review-pop-logo-watcha.png'],
            // tmp:            [],
            vod: ['bg_vod_ending_center.png', 'bg_vod_ending_left.png', 'ic-vodending-dislike-foc.png', 'ic-vodending-dislike-nor.png', 'ic-vodending-dislike-sel-foc.png', 'ic-vodending-dislike-sel-nor.png', 'ic-vodending-like-foc.png', 'ic-vodending-like-nor.png', 'ic-vodending-like-sel-foc.png', 'ic-vodending-like-sel-nor.png']
        };*/

        for (key in preLoadImages) {
            for (i = 0; i < preLoadImages[key].length; i++) {
                if (preLoadImages[key][i] !== undefined) {
                    preLoadImages[key][i] = appConfig.headEnd.LOCAL_URL + '/' + key + '/' + preLoadImages[key][i];
                    imageArray.push(preLoadImages[key][i]);
                }
            }
            this.imgPreLoad(imageArray);
        }
    }

    /**
     * 이미지 pre load 할 이미지를 받아서 pre load 시켜줌
     * @param {array} imgSrcs - pre load 할 이미지 배열
     */
    static imgPreLoad(imgSrcs) {
        let imgPreLoadEl = document.querySelector('#imgPreLoad');
        let innerHtmlStr = '', i;

        if (!isEmpty(imgSrcs)) {
            for (i = 0; i < imgSrcs.length; i++) {
                innerHtmlStr += '<img src="' + imgSrcs[i] + '" width="1px" height="1px" style="display: none">'
            }
            imgPreLoadEl.innerHTML = innerHtmlStr;
        }
    }

    /**
     * 월정액 해지 popup을 위한 URL 가져오는 함수
     * @return {String} 월정액 해지 popup URL
     */
    static getPPMCancelUrl() {
        //   const obj = appConfig.CANCEL[appConfig.runMode];
        const server = appConfig.headEnd.PPM_CANCEL.Live;
        //   http://175.113.214.98:8080/constant/UI5/PPMcancel/main.jsp
        let url = server.protocol + '://' + server.ip + ':' + server.port + server.path;

        // console.log('runMode:', appConfig.runMode);
        console.log('해지팝업:', server);
        // if (obj) {
        //     url = obj.url;
        // } else {
        //     console.error('해지 팝업을 위한 URL 정보가 없습니다.');
        // }

        return url;
    }

    static fileLoad(url = null) {

        let verPath = url ? url : '/token.txt?update=' + new Date().getTime();
        let rs = '';
        try {
            Axios.get(verPath).then(function (response) {
                console.log('response.data=', response.data);
                rs = response.data;
            });
        }
        catch (error) {
        }
    }

    // 19영화, 19플러스 필터링
    static hideMenuCheck = (gridData, isDetailedGenreHome, adultMenuProperty) => {
        const ADULTMOVIEMENU = StbInterface.getProperty(ADULT_MOVIE_MENU);
        const EROSMENU = StbInterface.getProperty(EROS_MENU);
        const adultText = '청소년 보호(영화)';
        const erosText = '청소년 보호(기타)';
        let refactory = [];
        if (gridData) {

            // 메뉴 숨김 처리
            refactory = gridData.filter((grid, idx) => {
                // console.log('%c 블록 필터링', 'color: red; background: yellow; font-size: 30px', grid);
                if (Number(ADULTMOVIEMENU) === 2 && (grid.adlt_lvl_cd === '03' || grid.menu_exps_prop_cd === '29')) { // 19영화 ( 2: 메뉴숨김 )
                    return false;
                }

                if (Number(EROSMENU) === 2 && (grid.adlt_lvl_cd === '01' || grid.menu_exps_prop_cd === '30')) { // 19플러스 영화 ( 2: 메뉴숨김 )
                    return false;
                }

                return true;
            });

            // 청소년보호 처리 : 19영화
            refactory = refactory.map((grid, idx) => {

                if (isDetailedGenreHome) return grid;

                if (Number(ADULTMOVIEMENU) === 0) {
                    if ('adlt_lvl_cd' in grid && grid.adlt_lvl_cd === '03') {
                        grid.maskingTitle = adultText;
                        // grid.title = adultText;
                        grid.isProtection = false;
                        return grid;
                    }

                    if ('menu_exps_prop_cd' in grid && grid.menu_exps_prop_cd === '29') {
                        grid.maskingTitle = adultText;
                        // grid.menu_nm = adultText;
                        grid.isProtection = false;
                        return grid;
                    }
                }

                if (Number(EROSMENU) === 0) {
                    if ('adlt_lvl_cd' in grid && grid.adlt_lvl_cd === '01') {
                        grid.maskingTitle = erosText;
                        // grid.title = erosText;
                        grid.isProtection = false;
                        return grid;
                    }

                    if ('menu_exps_prop_cd' in grid && grid.menu_exps_prop_cd === '30') {
                        grid.maskingTitle = erosText;
                        // grid.menu_nm = erosText;
                        grid.isProtection = false;
                        return grid;
                    }

                }

                delete grid.maskingTitle;
                grid.title = grid.originTitle || grid.title;
                return grid;
            })

        }

        return refactory;
    }

    // tas 로그 저장
    static setTas(data) {
        // console.log('data=', data);

        if (TasData.sequence === 0) {
            this.tasStartData = data.actionTime;
            this.tasLogData += data.getLog();
        } else {
            this.tasLogData += ',' + data.getLog();
        }
        // console.log('this.tasLogData=', this.tasLogData);

        // dateFormat(Utils.tasStartData.split('.')[0])

        // tas 로그 전달해야 되는 시점 체크, 날짜 체크 해야 되는지 검토 필요.
        if (this.tasLogData.length > 1024) {
            StbInterface.tasLog(this.tasLogData);
            TasData.sequence = 0;
            this.tasLogData = '';
        }
    }

}

export class TasData {
    static sequence = 0;
    constructor(gnpCode = '', bluckMenuId = '', location = '', menuId = '', epsdId = '', url = '', value = '', playId = '', purchaseId = '', productId = '', search = '') {
        this.logId = 'IF-NAVI-005';
        this.stbId = appConfig.STBInfo.stbId;
        this.webuiVersion = appConfig.STBInfo.uiVersion;
        this.fwVersion = appConfig.STBInfo.swVersion;
        this.sequenceNo = TasData.sequence++;
        this.actionTime = dateFormat(new Date(), 'yyyymmddHHMMss.sss');  //  "메뉴 클릭 시간(형식: "YYYYMMDDHHMMSS.SSS")  예: 20140624212830.243"
        this.actionCode = '';  //  시스템 or 리모콘 key 정보
        this.actionFunction = '';  //  "Menu_Code가 정의된 코드(xpg의 menu_id가 존재하지 않는 메뉴는 코드를 정의)  예: OARD, BLCB"
        this.segmentId = gnpCode;  //  "선택된 GNB메뉴 정보 ""메뉴ID""  예:NM0000001"
        this.trackId = bluckMenuId;  //  "선택된 블럭 정보 "메뉴ID"  예:NM0000002"
        this.trackLocation = location;  //  "Track 컨텐츠 위치의 화면 Data  예: #|12"
        this.menuCode = '';  //  "segment_id, track_id 이외 메뉴의 메뉴ID 예: NM0000001"
        this.menuClCd = '';  //  "cid / mid / muid / mvid / url / vid / lang / pid / chid 구분  예: cid"
        this.mid = menuId;  // "menu id ""메뉴ID"" 예:NM0000002"
        this.cid = epsdId;  // "메뉴에서 콘텐츠를 선택할 경우, 시놉시스 진입할 경우에 에피소드ID 기록 예: {5461284D-EB6F-11E7-A9EA-C9B7786CCDC1}"
        this.url = url;  //  "url 값 예: file:///data/btv_home/tmp/dsmcc/27764/12338//index.html"
        this.value = value;  //  "muid의 extra value ([회차]@[가격정보]) 와 ui40의 value값중 필드가 분리 안된 항목들 예: 11@무료"
        this.playCid = playId;  //  "재생 관련 정보로 실시간채널 또는 VOD 재생 시에는 필수 값으로 서버로 전송되어야 한다. sid: 실시간채널 재생 시 채널 식별정보(Service ID) cid: VOD 재생 시 컨텐츠 식별정보(Content ID)"
        this.purchaseId = purchaseId;  //  상품을 구매 할 경우 구매 id
        this.productId = productId;  //  상품을 구매 할 경우 상품 id
        this.search = search;  //  검색어 데이터
    }

    getLog = () => {
        const rs = this.logId + ',' + this.stbId + ',' + this.webuiVersion + ',' + this.fwVersion + ',' + this.sequenceNo + '^' +
            this.actionTime + '^' + this.actionCode + '^' + this.actionFunction + '^' + this.segmentId + '^' + this.trackId + '^' +
            this.trackLocation + '^' + this.menuCode + '^' + this.menuClCd + '^' + this.mid + '^' + this.cid + '^' + this.url + '^' +
            this.value + '^' + this.playCid + '^' + this.purchaseId + '^' + this.productId + '^' + this.search;
        return rs;
    }

}


window.cwData = Utils.cwCacheData;
window.nxpgData = Utils.nxpgCacheData;