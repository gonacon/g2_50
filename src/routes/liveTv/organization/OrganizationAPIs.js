import { NXPG, MeTV, RVS } from '../../../supporters/network'
import menu from './menu.json'

var OrganizationAPIs = {
    
    initAPI : async(paramData, watchall) => {
        console.log('init api')
        let bookmark_list = []
        let METV011Rs
        let NXPG017Rs
        try {
            let NXPG017Param = {

            }
            let METV011Param = {
                group : paramData[0].METV011Param.group,
                ch_type : paramData[0].METV011Param.ch_type,
                yn_block : paramData[0].METV011Param.yn_block
            }
            NXPG017Rs = await NXPG.request017(NXPG017Param)
            METV011Rs = await MeTV.request011(METV011Param)
            // console.log('NXPG017Rs :: ', NXPG017Rs)
            // console.log('METV011Rs :: ', METV011Rs)
            // NXPG017Rs = await NXPG.request017({NXPG017Param}, (status, resData, tid) => {
            //     let MenuList = []
            //     console.log('NXPG017Rs ~')
            //     try {
            //         let NXPG017Result = JSON.parse(resData)
            //         console.log('NXPG017Result :: ', NXPG017Result)
            //     } catch(err) {
            //         console.log('error :: ', err)
            //     } finally {
            //         console.log('finally ~')
            //         // for (let i=0; i < menu.length; i++) {
            //         //     console.log(menu.channel[i].category_name)
            //         // }
            //     }
            // })
            
            // METV011Rs = await MeTV.requestME011(METV011Param, (status, resData, tid) => {
            //     if (status === 200) {
            //         let result
            //         try {
            //             result = JSON.parse(resData)
            //             console.log(result)
            //         } catch(err) {
            //             console.log('JSON DATA format is incorrect !!\n', resData)
            //         } finally {
                       
            //             // if (result.result === '0000'){
            //             //     //bookmark_total = result.bookmark_tot // 즐겨찾기 전체 개수
            //             //     //bookmark_length = result.bookmarkList.length
            //             //     // 실제 데이터
            //             //     // for (let i=0; i <bookmark_length; i++){
            //             //     //     bookmark_list.push({
            //             //     //         'svc_id' : result.bookmarkList[i].svc_id,
            //             //     //         'title' : result.bookmarkList[i].title,
            //             //     //         'ch_no' : result.bookmarkList[i].ch_no,
            //             //     //         'yn_kzone' : result.bookmarkList[i].yn_kzone
            //             //     //     })
            //             //     // }
                       
            //             //     //dummy 데이터
            //             //     bookmark_list = [
            //             //         {
            //             //             'svc_id' : 322,
            //             //             'title' : 'NS홈쇼핑',
            //             //             'ch_no' : 14,
            //             //             'yn_kzone' : 'N'
            //             //         },
            //             //         {
            //             //             'svc_id' : 872,
            //             //             'title' : 'tvN',
            //             //             'ch_no' : 17,
            //             //             'yn_kzone' : 'N'
            //             //         },
            //             //         {
            //             //             'svc_id' : 183,
            //             //             'title' : '플레이보이TV',
            //             //             'ch_no' : 320,
            //             //             'yn_kzone' : 'N'
            //             //         },
            //             //     ];
                            
            //             // }
                      
            //         }
            //     }
            // })

        } catch(error) {
            console.log('error : ', error)
        } finally {
            return {
                "NXPG017Rs" : NXPG017Rs,
                "METV011Rs": METV011Rs
            }
        }
    },
    RVS501 : async(paramData, watchall) => {
        let RVS501Rs
        
        try {
            RVS501Rs = await RVS.request501(paramData)
            
        } catch (error) {

        } finally {
            return RVS501Rs
        }
        
    },
    RVS502 : async(paramData, watchall) => {
        let RVS502Rs
        
        try {
            RVS502Rs = await RVS.request502(paramData)
        } catch (error) {

        } finally {
            return RVS502Rs
        }
        
    },
    RVS503 : async(paramData, watchall) => {
        let RVS503Rs
       
        try {
            RVS503Rs = await RVS.request503(paramData)
        } catch (error) {

        } finally {
            return RVS503Rs
        }
        
    },

    
}
export default OrganizationAPIs