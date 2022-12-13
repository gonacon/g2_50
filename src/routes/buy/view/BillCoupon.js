import { React, createMarkup } from '../../../utils/common';
import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BillCoupon.css';
import { EPS } from '../../../supporters/network';
import PopupPageView from '../../../supporters/PopupPageView';
import FM from '../../../supporters/navi';
import keyCodes from '../../../supporters/keyCodes';
import Core from '../../../supporters/core';
import _ from 'lodash';
// import dateFormat from 'dateformat';
import appConfig from './../../../config/app-config';
import StbInterface from './../../../supporters/stbInterface';

const ITEMS = 4; // 메뉴별 아이템 개수

class BillCoupon extends PopupPageView {
    constructor(props) {
        super(props);
        console.log('paramdata: ', this.paramData);

        const focusList = [
            { key: 'couponList', fm: null }
        ];
        this.declareFocusList(focusList);

        this.state = {
            DATA_EPS401: null,
            pid: this.paramData.pid,
            selectedCouponNo: this.paramData.selectedCouponNo,
        };
    }

    componentWillMount = () => {
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: false
		});
        EPS.requestEPS401(
            { transactionId: 'AAA', productId: this.state.pid },
            (status, resData, transactionId) => {
                const data = JSON.parse(resData);
                console.log('data:', data);
                if (data.result === '0000') {
                    const coupon = data.coupons.coupon;
                    if (coupon.length > 0) {
                        this.setState({ DATA_EPS401: coupon });
                        this.setFocus(0);
                    } else {
                        Core.inst().showToast('사용할 수 있는 쿠폰이 없습니다.');
                        this.props.callback();
                    }
                } else {
                    Core.inst().showToast(data.result, data.reason);
                }
            }
        );
    }

	componentWillUnmount() {
		super.componentWillUnmount();
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: true
		});
    }
    
    onCouponKeyDown = (evt, idx) => {
        const { selectedCouponNo, DATA_EPS401 } = this.state;
        if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
            this.props.callback({ couponNo: selectedCouponNo });
        } else if (evt.keyCode === keyCodes.Keymap.ENTER) {
            this.props.callback({ couponNo: DATA_EPS401[idx].couponNo });
        }
    }

    render() {
        if (_.isEmpty(this.state.DATA_EPS401)) {
            return null;
        }
        return (
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <div className="popWrap coupon">
                    <div className="popTop">
                        <div className="pageTitle">쿠폰 변경</div>
                        <div className="subInfo">할인받을 쿠폰을 선택해주세요.</div>
                    </div>
                    <div className="buyBill">
                        <BillCouponSlide onCouponKeyDown={this.onCouponKeyDown} DATA_EPS401={this.state.DATA_EPS401} selectedCouponNo={this.state.selectedCouponNo} setFm={this.setFm} />
                    </div>
                    <div className="keyWrap"><span className="btnKeyPrev">이전</span></div>
                </div>
            </div>
        )
    }
}

class BillCouponSlide extends React.Component {
    constructor(props) {
        super(props);
        this.itemWidth = 416; // 슬라이드 가로 폭
        this.itemMargin = 0; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        const { DATA_EPS401, setFm } = this.props;

        this.state = {
            slideTo: 0,
            DATA_EPS401: DATA_EPS401,
            activeCoupon: 0
        }

        const couponListFM = new FM({
            id: 'couponList',
            moveSelector: '.CouponItem',
            focusSelector: '.csFocus',
            row: 1,
            col: DATA_EPS401.length,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: DATA_EPS401.length - 1,
            onFocusKeyDown: this.onFocusKeyDown,
            onFocusChild: this.onFocusChild
        });
        setFm('couponList', couponListFM);
    }

    focusOn(idx) {
        const { slideTo, DATA_EPS401 } = this.state;
        let slideIndex = slideTo;
        let slideLength = DATA_EPS401.length;
        let thisItems = this.items;
        let element = document.querySelector('.slideWrap');

        if (document.querySelectorAll('.slideWrap.activeSlide').length !== 0) {
            document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
        }
        element.classList.add('activeSlide');

        if (idx === slideIndex || idx === slideIndex + 1 || idx === slideIndex - 1) {
            document.querySelector('.contentGroup').classList.add('activeSlide');
        } else {
            document.querySelector('.contentGroup').classList.remove('activeSlide');
        }

        const ele = document.querySelectorAll('.CouponItem > div')[idx];
        if (ele.classList.contains('right')) {
            slideIndex += 1;
            if (slideIndex + thisItems > slideLength - 1) {
                slideIndex = slideLength - thisItems;
            }
        } else if (ele.classList.contains('left')) {
            slideIndex -= 1;
            if (slideIndex < 0) {
                slideIndex = 0;
            }
        }

        this.setState({
            slideTo: slideIndex
        });

        document.querySelector('.slideCon').scrollLeft = 0;
    }

    focusOut() {
        if (document.querySelectorAll('.contentGroup.activeSlide').length !== 0) {
            document.querySelector('.contentGroup.activeSlide').classList.remove('activeSlide');
        }
    }

    onFocusKeyDown = (evt, idx) => {
        this.props.onCouponKeyDown(evt, idx);
    }
    keyDown(targetIndex, evt) {
        //추후 navigation rotate해결되면 주석 해제하여 사용

        // let slideIndex = this.state.slideTo;
        // let slideLength = this.state.slideItem.length;
        // let thisItems = this.items;

        // if(targetIndex === slideLength - 1 && evt.keyCode === keyCodes.Keymap.RIGHT){
        //     slideIndex = 0;
        //     document.querySelector('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
        //     document.querySelector('.contentGroup').classList.add('activeSlide');
        // }else if(targetIndex === 0 && evt.keyCode === keyCodes.Keymap.LEFT){
        //     slideIndex = slideLength - thisItems;
        //     if(slideIndex < 0) slideIndex = 0;
        //     document.querySelector('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
        // }

        // this.setState({
        //     slideTo: slideIndex
        // });
    }

    render() {
        const { DATA_EPS401, slideTo } = this.state;
        return (
            <div className="contentGroup">
                <div className="CouponSlide">
                    <div className="slideWrap">
                        <div className="slideCon">
                            <div id="couponList" className="slideWrapper CouponItemWrap" style={{ '--page': slideTo, 'width': (DATA_EPS401.length * this.itemWidth) + (DATA_EPS401.length * this.itemMargin) }}>
                                {
                                    DATA_EPS401.map((data, i) => {
                                        return (
                                            <CouponSlideItem
                                                key={i}
                                                index={i}
                                                data={data}
                                                selectedCouponNo={this.props.selectedCouponNo}
                                                maxLength={DATA_EPS401.length}
                                                slideTo={this.state.slideTo}
                                                event1={this.focusOn.bind(this, i)}
                                                event2={this.focusOut.bind(this, i)}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </div>
                        <div className="leftArrow"></div>
                        <div className="rightArrow"></div>
                    </div>
                </div>
            </div>
        );
    }
}

class CouponSlideItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            dDay: ''
        }
    }
    componentWillMount = () => {
        const { data } = this.props;

        EPS.request402({ couponNo: data.couponNo })
            .then(data => {
                console.log("402 data: ", data);
                if (data.result === '0000') {
                    const applyEndDate = data.coupon.applyEndDate;
                    const year = applyEndDate.substring(0, 4);
                    let dDay = '';
                    if (year === '9999') {
                        dDay = '무제한';
                    } else {
                        const month = applyEndDate.substring(4, 6);
                        const day = applyEndDate.substring(6, 8);
                        const date = new Date(year, month - 1, day);
                        const curDate = new Date();
                        const t2 = date.getTime();
                        const t1 = curDate.getTime();
                        dDay = Number((t2 - t1) / (24 * 3600 * 1000));
                    }
                    this.setState({ dDay: dDay })
                }
            });
    }

    onEnter = (idx) => {
        console.log('idx=', idx);
    }
    focusOn = (idx) => {
        console.log('focus idx=', idx);
        // this.props.event1(this, ...args);
        this.setState({ active: true, index: idx })
        this.props.event1(idx);
    }
    focusOut = (idx) => {
        this.setState({ active: false })
        // this.props.event2(this, ...args);
    }
    render() {
        const { index, slideTo, data } = this.props;
        const { dDay } = this.state;
        let cssList = index === ITEMS + slideTo - 1
            ? "csFocus right" : index === slideTo
                ? "csFocus left" : "csFocus"

        // if (active) {
        //     cssList += ' focusOn';
        // }
        // confirmDate
        // :
        // "20170601"
        // couponNo
        // :
        // "00000000000027564298"
        // couponType
        // :
        // "구입"
        // expireMessage
        // :
        // "무제한"
        // masterNo
        // :
        // "A1SA1020171000008123"
        // title
        // :
        // "쿠폰판매소_PPV_PPS_PPP"

        let couponValid = "사용가능";
        console.log('dDay: ' + dDay);
        return (
            <div className="CouponItem slide">
                <div className={cssList}>
                    <div className="dDay"><span>{dDay}</span></div>
                    <div className="inner">
                        <div className="title" style={{ "WebkitBoxOrient": "vertical" }} dangerouslySetInnerHTML={createMarkup(data.title)}></div>
                        <div className="valid"><span>{couponValid}</span></div>
                    </div>
                    {
                        this.props.selectedCouponNo === data.couponNo ? <div className="currentState">현재 적용중인 쿠폰</div> : ''
                    }
                </div>
            </div>
        )
    }
}

export default BillCoupon;