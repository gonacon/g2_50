// commons
import React, { Fragment } from 'react';
import PageView from 'Supporters/PageView';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import { Core } from 'Supporters';

// network
import { EPS } from 'Network'; // 현재 사용 안함

// utils
import { /*isEmpty, */ isUndefined } from 'lodash';
import moment from 'moment';
import Utils from 'Util/utils';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/coupon/CouponDetail.css';
import 'Css/myBtv/coupon/CouponDetailNone.css';

// components
import CouponSlide from './CouponSlide';
import CouponRegist from './CouponRegist';
//import { Moment } from 'Util/common';

// data resource
//import dummyData from './dummyData';
import appConfig from './../../../config/app-config';
import constants from 'Config/constants';
//import StbInterface from 'Supporters/stbInterface';

const { MONTHLY_AFTER } = constants;
const { Keymap: { ENTER } } = keyCodes;

let focusOpts = {
  button: {
    id: 'button',
    moveSelector: '',
    focusSelector: '.csFocus',
    row: 1,
    col: 1,
    type: 'ELEMENT',
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 0
  },
  slide: {
    id: 'slide',
    moveSelector: '.slideWrapper .slide',
    focusSelector: '.csFocus',
    row: 1,
    col: 10,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 9,
    bRowRolling: true,
  },
  bottom: {
    id: 'bottom',
    moveSelector: '.bottomLeft',
    focusSelector: '.csFocus',
    row: 1,
    col: 1,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 0
  }
}

class CouponDetail extends PageView {
  constructor(props) {
    super(props);
    this.items = 4; // 한 화면의 슬라이드 개수

    this.state = {
      contentSlides: {
        pageType: 'couponDetail',
        pageTitle: '쿠폰함',
        couponEnable: 0,
        slideItem: [],
        caution: '',
        cautionDetail: '',
      },
      usableCount: 0,
      expiredCount: 0,
      totalCount: 0,
      headeEndCallComplete: false,
      // slide
      slideTo: 0,
      activeSlide: false,
      slideCurIdx: 0,
    };

    this.defaultFm = {
      button: new FM({
        ...focusOpts.button,
        onFocusKeyDown: this.onRegistEnter
      }),
      slide: new FM({
        ...focusOpts.slide,
        onFocusChild: this.onSlideFocus,
        onFocusKeyDown: this.onSlideKeyDown,
        onBlurContainer: this.onSlideBlur
      }),
      bottom: new FM({
        ...focusOpts.bottom,
        onFocusKeyDown: this.onUseCoupon
      })
    }

    const focusList = [{
      key: 'button',
      fm: null
    },
    {
      key: 'slide',
      fm: null
    },
    {
      key: 'bottom',
      fm: null
    }
    ];
    this.declareFocusList(focusList);

  }

  // 방향키 외에 키처리
  // onFocusKeyDown = evt => {
  // 	console.log('%c evt', 'color: green', evt);
  // }

  onUseCoupon = (evt, focusIdx) => {
    if (evt.keyCode !== ENTER) return;

    const {
      monthlyInfo
    } = this.props;
    const {
      contentSlides,
      slideCurIdx
    } = this.state;
    const data = contentSlides.slideItem[slideCurIdx].useRange[0];

    console.log('%c 쿠폰사용하기 버튼', 'color: green', );

    if (data.productType === '월정액') {
      // 월정액 홈으로
      console.log('월정액', monthlyInfo);
      Core.inst().move(`${MONTHLY_AFTER}/${monthlyInfo.gnbTypeCode}/${monthlyInfo.menuId}`, {});
    } else {
      switch (data.productType) {
        case '단건':
          Utils.toSynopsis('01', {
            epsd_rslu_id: data.targetId
          })
          break;
        case '시리즈':
          Utils.toSynopsis('02', {
            epsd_rslu_id: data.targetId
          })
          break;
        case '패키지':
          // 패키지는 넘길수 없음(data 부족)
          break;
        default:
          break;
      }
    }

		/**
		 * % ㅠ.ㅠ
		 * 1. 월정액, 채널팩 => 월정액 홈으로?
		 * 2. 시놉시스: 단편, 시리즈, 패키지(GW)
		 */
  }

  // 쿠폰등록하기 버튼
  onRegistEnter = (evt, idx) => {
    const callback = () => {
      this.couponListCall();
    };

    if (evt.keyCode === ENTER) {
      Core.inst().showPopup(<CouponRegist />, {
        setWrapperClass: this.props.setWrapperClass
      }, callback);
    }
  }

  onSlideFocus = (idx) => {
    const { contentSlides, slideTo, slideCurIdx } = this.state;
    const { slideItem } = contentSlides;

    let to = slideTo;
    let slideItemLength = slideItem.length;

    if (Math.abs(slideCurIdx - idx) > 1) {
      if (slideCurIdx > idx) {
        to = 0;
      } else if (slideCurIdx < idx) {
        to = slideItemLength - this.items;
      }
    } else {
      if (slideCurIdx < idx) { // RIGHT
        if (idx === this.items + to - 1) {
          to += 1;
          if (to + this.items > slideItemLength - 1) {
            to = slideItemLength - this.items;
          }
        }
      } else if (slideCurIdx > idx) { // LEFT
        if (idx === to) {
          to -= 1;
          if (to <= 0) to = 0;
        }
      }
    }

    if ( slideItem.length <= this.items ) {
    	to = 0;
    }

    // 쿠폰 사용하기 버튼 포커스 설정
    if (isUndefined(slideItem[idx].dDay)) {
      this.setFm('bottom', null);
    } else {
      this.setFm('bottom', this.defaultFm.bottom);
    }

    this.setState({
      slideTo: to,
      activeSlide: true,
      slideCurIdx: idx,
    });
  }

  onSlideBlur = direction => {
    //console.log('%c onSlideBlur -> direction', 'color: green', direction);
    if (direction === 'UP') {
      this.setState({ activeSlide: false });
    }
  }

  couponListCall = () => {
    const EPS402Call = (couponNo) => {
      return EPS.request402({
        transactionId: 'List_your_vouchers_detail',
        couponNo
      });
    }

    EPS.request401({ transactionId: 'List_your_vouchers' }).then(data => {
      let { usableCount, expiredCount, totalCount } = data;

      let contentSlidesDetailPromise = data.coupons.coupon.map((item, idx) => {
        return EPS402Call(item.couponNo)
      });

      Promise.all(contentSlidesDetailPromise).then(datas => {
        let dDay = '';
        let disable = false;
        let couponValid = '';
        let restrictPeriod = '';
        let restrictDate = '';
        let endDate = '';
        let start;
        let end;
        let expired;
        let leftDay;
        let contentSlides = {
          pageType: "couponDetail",
          pageTitle: "쿠폰함",
          couponEnable: usableCount,
          caution: '쿠폰은 B tv에서 진행되고 있는 이벤트에 참여하시면 받으실 수 있으며,<br/>받으신 쿠폰은 ‘쿠폰 등록’ 메뉴를 통해 쿠폰번호를 입력하시면 유료 콘텐츠 구매 시 사용하실 수 있어요.',
          cautionDetail: '단, 쿠폰은 한 번에 1장씩만 사용하실 수 있으며, 사용한 쿠폰은 즉시 소멸됩니다.',
          slideItem: datas.map((item, idx) => {
            let couponItem = item.coupon;
            let discount;
            let {
              //expireMessage,
              discountType,
              discountAmount,
              title: couponTitle,
              couponType,
              confirmDate,
              applyEndDate,
              usageRange: useRange
            } = couponItem;

            //applyEndDate = '20180620';    // 만료
            //applyEndDate = '20180622';    // 0일
            //applyEndDate = '20180623';    // 1일
            //applyEndDate = '20180722';    // 30일
            //applyEndDate = '20180723';    // 30일 이상

            start = moment();
            end = moment(applyEndDate);
            expired = moment(end).add(1, 'days');
            endDate = end.format('YYYY.MM.DD');
            leftDay = Math.floor(expired.diff(start, 'days', true));

            /*
            console.log('end:', end.toString());
            console.log('expired:', expired.toString());
            console.log('leftDay:', leftDay);
            */

            if (applyEndDate.slice(0, 4) === '9999') {      // 무제한
              couponValid = '사용가능';
              restrictPeriod = '사용가능';
              restrictDate = 'B tv 해지 전까지';
            } else if (start.isAfter(expired)) {
              couponValid = '기간만료';
              restrictPeriod = '기간만료';
              restrictDate = `${endDate} 까지`;
              disable = true;
            } else if (leftDay > 30) {
              couponValid = '사용가능';
              restrictPeriod = '사용가능';
              restrictDate = `${endDate} 까지`;
            } else if (leftDay === 0) {
              dDay = '만료임박';
              couponValid = '만료임박';
              restrictPeriod = '만료임박';
              restrictDate = `${endDate} 까지`;
            } else {
              dDay = 'D-' + leftDay;
              couponValid = `기간만료 ${leftDay}일전`;
              restrictPeriod = `만료 ${leftDay}일 전`;
              restrictDate = `${endDate} 까지`;
            }

            if (discountType === '10') {                // 정률 할인
              discount = `${discountAmount}% 할인`;
            } else if (discountType === '20') {         // 정액 할인
              discount = `${discountAmount}원 할인`;
            }

            let couponData = {
              applyEndDate,
              disable,
              couponValid,
              dDay,
              couponTitle,
              couponTitleFull: couponTitle,
              couponType: couponType,
              discount,
              registDate: confirmDate, // 등록일 - 현재 H/E 없음/
              restrictPeriod,
              //restrictPeriod: expireMessage, // 
              restrictDate,
              useRange, // 사용 범위
              useRangeCaution: [] // 사용범위에 대한 안내 리스트
            };

            return couponData;
          })
        };

        // 테스트 용
        // contentSlides.slideItem = contentSlides.slideItem.concat(contentSlides.slideItem).concat(contentSlides.slideItem);

        this.setState({
          usableCount,
          expiredCount,
          totalCount,
          contentSlides,
          headeEndCallComplete: true
        });

        // focus setting
        const {
          button,
          slide,
          bottom
        } = this.defaultFm;

        slide.setListInfo({
          col: contentSlides.slideItem.length,
          lastIdx: contentSlides.slideItem.length - 1
        });

        this.setFm('button', button);
        this.setFm('slide', slide);
        this.setFm('bottom', bottom);
        if (usableCount) {
          this.setFocus(1, 0);
        } else {
          this.setFocus(0);
        }
      });
    });
  }

  couponUseButtonSetting = (flag) => {
    const { bottom } = this.defaultFm;
    if (flag) {
      this.setFm('bottom', null);
    } else {
      this.setFm('bottom', bottom);
    }
  }

  componentDidMount() {
    this.props.showMenu(false);
    this.couponListCall();
  }

  componentWillReceiveProps(nextProps) {
    // console.log('@@@ monthlyData', nextProps.monthlyData);
  }

  componentDidUpdate(prevProps, prevState) { }

  render() {
    const {
      contentSlides,
      usableCount,
      // expiredCount,
      totalCount,
      headeEndCallComplete,
      activeSlide,
      slideTo,
      slideCurIdx
    } = this.state;
    const CouponWrapClass = `CouponWrap${totalCount === 0 ? ' none' : ''}`;

    return (
      <div className="wrap" >
        <div className="myBtvLayout scrollWrap">
          <div className="mainBg" >
            <img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" />
          </div>
          <div className={CouponWrapClass}>
            <h2 className="pageTitle" >쿠폰함</h2>
            <UsableCount count={usableCount} />
            {headeEndCallComplete &&
              <Fragment>
                {totalCount ?
                  <Fragment>
                    <span id="button" className="csFocus btnCouponRegist btnStyle type03">
                      <span className="wrapBtnText">쿠폰 등록</span>
                    </span>
                    <CouponSlide contents={contentSlides}
                      defaultMsgTrigger={!activeSlide}
                      activeSlide={activeSlide}
                      slideTo={slideTo}
                      curIdx={slideCurIdx}
                      couponUseButtonSetting={this.couponUseButtonSetting} />
                  </Fragment>
                  :
                  <Fragment>
                    <div className="CouponItemWrap">
                      <div className="CouponItem">
                        <span className="card csFocus CouponRegist focusOn" >
                          <span className="registText" > 쿠폰 등록 </span>
                        </span>
                      </div>
                    </div>
                    <div className="bottomWrap">
                      <div className="defaultWrap">
                        <div className="eventDesc">
                          쿠폰은 B tv에서 진행되고 있는 이벤트에 참여하면 받을 수 있습니다.
												<br />‘쿠폰 등록’ 버튼을 눌러 받은 쿠폰번호를 입력하면 유료 콘텐츠 구매 시 사용할 수 있습니다.
											</div>
                        <div className="eventDescSub">단, 쿠폰은 한 번에 1 장씩 사용할 수 있으며, 사용한 쿠폰은 즉시 소멸됩니다. </div>
                      </div>
                    </div>
                  </Fragment>
                }
              </Fragment>
            }
          </div>
        </div>
      </div>
    )
  }
}

const UsableCount = props => (
  <p className="subInfo">
    사용 가능한 쿠폰은
		<strong className="count" >{props.count}개 </strong>
    입니다.
	</p>
)

export default CouponDetail;