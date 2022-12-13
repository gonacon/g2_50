import React, { Component } from 'react';
import '../../../assets/css/routes/kids/monthly/MonthlyHome.css';
import { NXPG, MeTV } from 'Network';
import { isEmpty, isEqual } from 'lodash';
import { SlideType, G2SliderDefault, G2SlideMonthlyHome } from './module/KidsSlider';
import constants from 'Config/constants';
import keyCode from 'Supporters/keyCodes';

class MonthlyHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listIndex: -1,
      menuInfo: []
    };

    this.menuId = '';
  }

  /*********************************** Component Lifecycle Methods ***********************************/
  componentDidMount() {
    const { menuId } = this.props;
    if (menuId !== '') {
      this.menuId = menuId;
      this.handleRequestAPI();
    }
  }

  /*********************************** H/E Request Methods ***********************************/
  handleRequestAPI = () => {
    this.handleRequestMenuInfo();

  }

  handleRequestMenuInfo = async () => {
    const bannersInfo = NXPG.request007({ menu_id: this.menuId }); // 월정액 메뉴정보
    const purchaseInfo = MeTV.request033({ svc_code: 'KZONE' }); // 구매정보

    Promise.all([bannersInfo, purchaseInfo]).then(responseData => {
      // console.log('%c[purchaseInfo] ===>','color:#0000ff ', purchaseInfo);
      // 월정액 메뉴 정보 가져오기
      const bannerData = responseData[0].banners.filter(block => { return block.lim_lvl_yn === 'N' }) || [];
      const purchaseData = responseData[1].purchaseList || [];

      this.handleResponseAPI({
        bannerData,
        purchaseData
      });

    }).catch(error => { console.error('[ERROR][XPG007,ME033]', error) });
  }

  handleResponseAPI = (contentsData) => {
    let { bannerData, purchaseData } = contentsData;

    // 메뉴 정보 필터
    bannerData = bannerData.map((banner, index) => {
      return {
        parMenuId: banner.par_menu_id, // 필드 사라짐..
        menuId: banner.menu_id,
        menuNm: banner.menu_nm,

        salePrc: banner.sale_prc, // 판매 가격
        salePrcVat: banner.sale_prc_vat, // 판매 가격 부가세 포함 
        prdPrc: banner.prd_prc, // 상품 가격
        prdPrcVat: banner.prd_prc_vat, // 상품 가격 부가세 포함
        prdPrcId: banner.prd_prc_id, // 상품 ID

        bnrOnImgPath: banner.bnr_on_img_path,
        bnrOffImgPath: banner.bnr_off_img_path,

        gnbTypCd: banner.gnb_typ_cd, // 상영 방식 코드
        blkTypCd: banner.blk_typ_cd, // 블록 유형 코드
        bnrExpsMthdCd: banner.bnr_exps_mthd_cd, // 배너 노출 방식 코드 (10 : 텍스트, 20: 이미지)
      }
    })

    // 구매 정보 필터
    if (!isEmpty(bannerData)) {
      bannerData.forEach(banner => {
        banner.isJoined = false;
        banner.purchaseInfo = {};

        purchaseData.forEach(item => {
          if (isEqual(banner.prdPrcId, item.prod_id)) banner.isJoined = true;

          banner.purchaseInfo = {
            amtPrice: purchaseData.amt_price,
            price: purchaseData.price,
            sellingPrice: purchaseData.selling_price,
            expired: purchaseData.expired,
            period: purchaseData.period,
          };
        });
      });

      this.setState({ menuInfo: bannerData });
    }
  }

  /*********************************** FocusManager KeyEvent Methods ***********************************/
  // 블록 포커스셋 이벤트 함수 (onInitFocus)
  handleOnInitFocus = (fmId, idx) => {
    console.log('[KEY EVENT][onInitFocus]');

    const { getHistory, setFocus } = this.props;
    const historyInfo = getHistory();

    if (historyInfo.isOnHistory) {
      setFocus('contents', getHistory().childIndex);
    }

  }

  // 블록 포커스온 이벤트 함수 (onSlider)
  handleOnSlider = (idx, container) => {
    console.log('[KEY EVENT][onSlider]');
  }

  // 블록 포커스오프 이벤트 함수 (offSlider)
  handleOffSlider = (idx = null, dir) => {
    const { setFocus } = this.props;
    if (typeof setFocus === 'function') {
      if (dir === "UP") {
        setFocus(1, 0);
      }
    }
  }

  // 콘텐츠 포커스 이동 이벤트 함수 (onFocus)
  handleOnFocusMove = (childIdx) => {
    console.log('[KEY EVENT][onFocus] childIdx : ', childIdx);
  }

  // 콘텐츠 키 이벤트 함수 (onKeyDown)
  handleOnKeyDown = (event, parentIdx = null, childIdx) => {
    console.log('[KEY EVENT][onKeyDown]');
    console.log(`event : ${event.keyCode} childIdx : ${childIdx}`);

    const { menuInfo } = this.state;
    let param = { pathName: '', state: '' }

    switch (event.keyCode) {
      case keyCode.Keymap.UP:
        break;
      case keyCode.Keymap.DOWN:
        break;

      case keyCode.Keymap.ENTER:
        const curMenuInfo = menuInfo[childIdx];
        // curMenuInfo.isJoined = true;
        param.pathName = constants.KIDS_MONTHLYDETAIL;
        param.state = {
          menu_id: curMenuInfo.menuId,
          menu_nm: curMenuInfo.menuNm,
          prdPrcId: curMenuInfo.prdPrcId,
          prdPrcVat: curMenuInfo.prdPrcVat,
          isJoined: curMenuInfo.isJoined
          //refreshFunc: this.handleRequestAPI
        }

        this.props.setHistory({
          comptName: 'MonthlyHome',
          focusKey: 'contents',
          parentIndex: parentIdx,
          childIndex: childIdx,
          isInitKidsHome: false
        });
        this.props.onMovePage(param.pathName, param.state);
        break;
      default:
        break;
    }
  }

  /*********************************** Etc Methods ***********************************/
  // 할게 없음

  /*********************************** Render ***********************************/
  render() {
    console.log('[menuInfo] : ', this.state.menuInfo);
    const { menuInfo } = this.state;
    const { setFm } = this.props;
    const bShow = (!isEmpty(menuInfo) && menuInfo.length > 0);

    // history 데이터가 있다면, 인덱스 가져오기
    const getHistoryData = this.props.getHistory();
    this.childIndex = isEmpty(getHistoryData.childIndex) ? 0 : getHistoryData.childIndex;

    return (
      <div className="kidsMonthlyHomeWrap scrollWrap">
        {
          bShow ? <G2SliderDefault
            id={'contents'}
            bShow={bShow}
            rotate={true}
            slideType={SlideType.KIDS_MONTHLY_HOME}
            setFm={setFm}
            onInitFocus={this.handleOnInitFocus}
            onSlider={this.handleOnSlider}
            offSlider={this.handleOffSlider}
            onFocus={this.handleOnFocusMove}
            onKeyDown={this.handleOnKeyDown}
            focusIndex={this.childIndex}>
            {
              menuInfo.map((item, index) => {
                return (<G2SlideMonthlyHome
                  focImage={item.bnrOnImgPath}
                  norImage={item.bnrOffImgPath}
                  isJoined={item.isJoined}
                  index={index}
                  lastIndex={menuInfo.length}
                  key={index} />)
              })
            }
          </G2SliderDefault> : null
        }
      </div>
    )
  }
}

export default MonthlyHome;