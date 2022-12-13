import { NXPG, MeTV, SMD } from '../../../supporters/network';
import _ from 'lodash';

var synopAPI = {
    // XPG010, METV061
    xpgMetv : async(paramData, watchall, synopsis_type, settingKey, yn_season_watch_all) => {
        let synopInfo = {};

        try {
            let xpg010Param = {
                menu_id: !_.isEmpty(paramData.menu_id) ? paramData.menu_id : '',
                sris_id: !_.isEmpty(paramData.sris_id) ? paramData.sris_id : '',
                epsd_id: !_.isEmpty(paramData.epsd_id) ? paramData.epsd_id : '',
                epsd_rslu_id: !_.isEmpty(paramData.epsd_rslu_id) ? paramData.epsd_rslu_id : '',
                search_type: !_.isEmpty(paramData.search_type) ? paramData.search_type : '',
                yn_recent: !_.isEmpty(paramData.yn_recent) ? paramData.yn_recent : ''
            }
            
            const xpg010 = await NXPG.request010(xpg010Param);
            // const epsd_id = xpg010.contents.epsd_id;    // 시놉시스 epsd_id

            let sris_typ_cd = null;
            if (_.isEmpty(synopsis_type)) {
                sris_typ_cd = xpg010.contents.sris_typ_cd === '01' ? '3' : '1'; // 시놉타입
            } else {
                sris_typ_cd = synopsis_type;
            }

            // MeTV(바로보기)
            let ppv = [];
            let pps = [];
            if (!_.isEmpty(xpg010.purchares)) {
                for (const item of xpg010.purchares) {
                    ppv.push({
                        prd_prc_id: item.prd_prc_id,
                        epsd_id: item.epsd_id,
                        yn_prd_nscreen: item.nscrn_yn,
                        // asis_prd_typ_cd: item.asis_prd_typ_cd,
                        prd_typ_cd: item.asis_prd_typ_cd,
                        purc_pref_rank: item.purc_pref_rank,
                        possn_yn: item.possn_yn
                    });
                    pps.push({
                        prd_prc_id: item.prd_prc_id,
                        yn_prd_nscreen: item.nscrn_yn,
                        // asis_prd_typ_cd: item.asis_prd_typ_cd,
                        prd_typ_cd: item.asis_prd_typ_cd,
                        purc_pref_rank: item.purc_pref_rank,
                        possn_yn: item.possn_yn
                    });
                }
            }
            if (settingKey === 'series' || xpg010.contents.sris_typ_cd === '01') {
                ppv = [];
                const { contents } = xpg010;
                for (const item of contents.products) {
                    ppv.push({
                        prd_prc_id: item.prd_prc_id,
                        epsd_id: contents.epsd_id,
                        yn_prd_nscreen: item.nscrn_yn,
                        // asis_prd_typ_cd: item.asis_prd_typ_cd,
                        prd_typ_cd: item.asis_prd_typ_cd,
                        purc_pref_rank: item.purc_pref_rank,
                        possn_yn: !_.isEmpty(contents.epsd_rslu_info) ? contents.epsd_rslu_info[0].possn_yn : ''
                    });
                }
            }
            if (watchall === 'N' || sris_typ_cd === '1') {
                pps = null;
            }

            let metv061Param = {
                // muser_num: '',
                sris_id: xpg010.contents.sris_id,
                synopsis_type: sris_typ_cd,
                ppv_products: ppv,
                pps_products: pps
            }
            let metv061 = [];
            if (yn_season_watch_all === 'N') {
                metv061 = await MeTV.request061(metv061Param);
            }
            const xpg012 = [];
            paramData.yn_season_watchall = watchall;

            // let metv011Param = {
            //     group: 'VOD'
            // }
            // const metv011 = await MeTV.request011(metv011Param);
            const metv011 = metv061.is_bookmark;

            let metv024 = null;
            if (xpg010.contents.sris_typ_cd === '01') { // 시즌일때는 vod정보도 호출함
                const metv024Param = {
                    epsd_id: xpg010.contents.epsd_id
                }
                metv024 = await MeTV.request024(metv024Param)
            }
            // console.log('metv024', metv024);
            synopInfo = {
                param: paramData,
                metvDirectview: metv061,    // 바로보기 ME061
                synopsis: xpg010,           // 시놉시스 NXPG010
                cwRelation: xpg012,         // 연관콘텐츠 NXPG012
                bookmark: metv011,          // 찜 리스트
                vodInfo: metv024,           // 재생정보
            }
            
        } catch(error) {
            console.log(error);
            return 'error';
        } finally {
            return synopInfo;
        }
    },

    xpg003 : (param) => {
        // let paramData = {}
        let result = null;
        try {
            result = NXPG.request003(param)
        }catch(error) {
            return 'errror';
        } finally {
            return result;
        }
    },

    xpg011 : (param) => {
        let person = null;
        let paramData = {
            // menu_id: param.menu_id,
            // prs_id: param.prs_id
        }
        try {
            paramData = {
                menu_id: param.menu_id,
                prs_id: param.prs_id
            }
            const result = NXPG.request011(paramData);
            person = result;
        } catch(error) {
            return 'error';
        } finally {
            return person;
        }
    },

    
    xpg008 : (param) => {
        let rating = null;
        try {
            let paramData = {
                sris_id: param.sris_id,
                page_no: param.page_no,
                page_cnt: param.page_cnt,
                site_cd: param.site_cd
            }
            rating = NXPG.request008(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return rating;
        }
    },

    xpg012 : (param, route) => {
        let cwRelation = null;
        
        try {
            let paramData = {
                menu_id: param.menu_id !== undefined ? param.menu_id : '',
                cw_call_id: param.cw_call_id_val,
                type: 'all',
                epsd_rslu_id: param.epsd_rslu_id,
                epsd_id: param.epsd_id
            }
            if (route === 'ending') {
                paramData.cw_call_id = param.ending_cw_call_id_val
            }
            cwRelation = NXPG.request012(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return cwRelation;
        }
    },

    xpg014 : (param) => {
        let gateWay = null;
        try {
            let paramData = {
                menu_id: param.menu_id,
                sris_id: param.sris_id,
                // epsd_id: param.epsd_id,
                // pid: param.pid
            }
            gateWay = NXPG.request014(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return gateWay;
        }
    },

    xpg015 : (param) => {
        let vodRelation = null;
        try {
            let paramData = {
                menu_id : param.menu_id,
                sris_id : param.sris_id,
                epsd_id : param.epsd_id,
                pid : param.pid
            }
            vodRelation = NXPG.request015(paramData)
        } catch(error) {
            return 'error';
        } finally {
            return vodRelation;
        }
    },

    metv062 : (param) => {
        let result = null;
        try {
            let paramData = {
                req_pidList: [param.prd_prc_id]
            }
            result = MeTV.request062(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return result;
        }
        
    },

    smd004 : (param) => {
        let result = null;
        try{
            let paramData = {
                series_id : param.series_id,
                like_action : param.like_action, //0. 미등록상태 1. 좋아요 2. 별루예요
            }
            result = SMD.request004(paramData);
        } catch(err) {
            console.error(err);
            return 'error';
        } finally {
            return result;
        }
    },

    smd005 : (param) => {
        let result = null;
        try {
            let paramData = {
                series_id : param.series_id,
            }
            result = SMD.request005(paramData);
        } catch(error) {
            console.error(error);
            return 'error';
        } finally {
            return result;
        }
    },

    metv011 : (param) => {
        let result = null;
        try {
            let paramData = {
                group: 'VOD'
            }
            result = MeTV.request011(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return result;
        }
    },

    metv023 : (param) => {
        let result = null;
        try {
            let paramData = {
                sris_id: param.sris_id
            }
            result = MeTV.request023(paramData);
        } catch(error) {
            return 'error';
        } finally {
            return result;
        }
    }











    // xpgMetv(paramData, watchall) {
    //     let synopInfo = [];
    //     const synopPromise = new Promise((res, rej) => {
    //         let param = {
    //             menu_id: paramData.menu_id,
    //             sris_id: paramData.sris_id,
    //             epsd_id: paramData.epsd_id,
    //             // yn_recent: 'N',
    //             // epsd_rslu_id: '{039A8711-022E-11E8-ABC1-93204C75BC8A}'
    //         }

    //         NXPG.requestNXPG010(param, (status, data, transactionId) => {
    //             if (status === 200) {
    //                 let result = JSON.parse(data);
    //                 res(result);
    //             } else {
    //                 rej();
    //             }
    //         })
    //     });

    //     const metvPromise = new Promise((res, rej) => {

    //         synopPromise.then((val) => {
    //             let synopData = val.contents;
    //             let purchase = val.purchase;

    //             let sris_id = null;
    //             let pps = null;
    //             switch(watchall) {
    //                 case 'Y': break;
    //                 case 'N': 
    //                     pps = [{
    //                         prd_grp_id: 'pg0001',
    //                         prd_prc_id: 'p0001',
    //                         yn_prd_nscreen: 'Y',
    //                         prd_typ_cd: '10',
    //                         purc_pref_rank: '1000',
    //                         rel_prd_grp_id: 'PG1234^PG1542',
    //                         possn_yn: 'Y'
    //                     }]
    //                 break;
    //             }

    //             let param = {
    //                 sris_id: synopData.sris_id,
    //                 yn_season_synopsis: 'Y', // 현재 시놉시즌만 테스트중
    //                 ppv_products: [{
    //                     prd_grp_id: 'pg0001',
    //                     prd_prc_id: 'p0001',
    //                     epsd_id: 'e1234568',
    //                     yn_prd_nscreen: 'Y',
    //                     prd_typ_cd: '10',
    //                     purc_pref_rank: '1000',
    //                     rel_prd_grp_id: 'PG1234^PG1542',
    //                     possn_yn: 'Y'
    //                 }],
    //                 pps_products: pps
    //             }
    
    //             MeTV.requestME061(param, (status, data, transactionId) => {
    //                 if (status === 200) {
    //                     let result = JSON.parse(data);
    //                     res(result);
    //                 } else {
    //                     rej();
    //                 }
    //             })
    //         });
            
            
    //     });

    //     return Promise.all([metvPromise, synopPromise]).then((val) => {
    //         // console.log('synopView value', val);
    //         paramData.yn_season_watchall = watchall;
    //         synopInfo = {
    //             param: paramData,
    //             metvDirectview: val[0], // 바로보기 ME061
    //             synopsis: val[1]   // 시놉시스 NXPG010
    //         }
    //         return synopInfo;
    //     }).catch(error => {
    //         console.error('Promise All error', error);
    //         return 'error';
    //     });
    // }
}
export default synopAPI;