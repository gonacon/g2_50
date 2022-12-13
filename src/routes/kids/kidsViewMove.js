import { kidsConfigs } from './config/kids-config';
import { NXPG } from 'Supporters/network';
import constants from 'config/constants';

const { KIDS_HOME } = constants;
class KidsViewMove {
    constructor() {

        this.kidsHome = false;
        this.menuIndex = -1;
        this.movePath = '';
        this.moveParam = '';
    }

    setMoveParam(path, pathInObj) {
        this.movePath = path;
        this.moveParam = pathInObj;
    }

    getMenuIndex() {
        return this.menuIndex;
    }

    // async getKidsHomePath() {
    //     const param = this.moveParam;
    //     const kidsGnbCd = param.kidsGnbCd;
        
    //     const result = await NXPG.request102();
    //     let menuInfo = result.menus ? result.menus : [];
    //     let menuIndex = -1;

    //     // kidsz_gnb_cd 코드가 없는 메뉴는 삭제
    //     menuInfo = menuInfo.filter((item, index) => {
    //         menuIndex = item.kidsz_gnb_cd === kidsGnbCd ? index : -1;
    //         return item.kidsz_gnb_cd.length !== 0
    //     });
    //     return menuIndex;
    // }

    async getMoveParam() { 
        const param = this.moveParam;
        const kidsGnbCd = param.kidsGnbCode;
        
        const result = await NXPG.request102();
        let menuInfo = result.menus ? result.menus : [];

        // gnbCode가 일치하면 menuIndex 값 리턴
        menuInfo = menuInfo.some((item, index) => {
            // console.log('%c[getMoveParam] ===>','color:#0000ff ', item.kidsz_gnb_cd === kidsGnbCd, index);
            this.menuIndex = index;
            return item.kidsz_gnb_cd === kidsGnbCd;
        });
        
        const requestParam = { path: '', pathParam: '' }
        
        // home ?
        if(this.moveParam.blkTyCode === null) {
            requestParam.path = KIDS_HOME;
            requestParam.pathParam = {
                menuIndex : this.menuIndex,
                menu_id: Number(kidsGnbCd) === 30 ? this.moveParam.menu_id : ''
            } 
        // !home ?
        } else {
            if(this.moveParam.blkTyCode === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
                // [TODO] H/E 데이터 확인 후 작업 필요 (그리드 유형)

            } else if(this.moveParam.blkTyCode === kidsConfigs.BLOCK.MENU_BLOCK_CD) {
                switch(kidsGnbCd) {
                    case kidsConfigs.KIDS_MENU_CODE.MONTHLY:
                        requestParam.path = constants.KIDS_MONTHLYDETAIL;
                        break;
                    case kidsConfigs.KIDS_MENU_CODE.GENRE:
                        requestParam.path = constants.KIDS_GENRE_MENU_BLOCK;
                        break;
                    case kidsConfigs.KIDS_MENU_CODE.LEARNING:
                        requestParam.path = constants.KIDS_PLAYBLOCK;
                        break;
                    default:
                        break;
                }
                requestParam.pathParam = {
                    menu_id: this.moveParam.menu_id,
                    menu_nm: this.moveParam.prevTitle
                }
            }
        }
        return requestParam;
    }
}

export default (new KidsViewMove);