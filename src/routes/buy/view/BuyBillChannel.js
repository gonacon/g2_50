import React from 'react'

import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BuyBill.css';

import { EPS } from '../../../supporters/network/EPS';

import {CTSInfo} from '../../../supporters/CTSInfo';
import Core from '../../../supporters/core';
import AdultCertification from '../../../popup/AdultCertification';
import BillCertify from './BillCertify';
import BillCoupon from './BillCoupon';
import constants, { STB_PROP } from '../../../config/constants';
import keyCodes from '../../../supporters/keyCodes';
import FM from '../../../supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView';
import { numberWithCommas } from '../../../utils/utils';
import _ from 'lodash';
import StbInterface from './../../../supporters/stbInterface';
import { CouponRegist } from './../../index.async';
import TmembershipRegist from '../../myBtv/tmembership/TmembershipRegist';
import appConfig from './../../../config/app-config';
import PopupConfirm from './../../../components/popup/PopupConfirm';
import Tmembership from './../../myBtv/tmembership/Tmembership';
import BillPhoneCertify from './BillPhoneCertify';

const VIEW_BTN = '0';
const VIEW_LIST = '1';

// 할인 수단
const DISCOUNT_COUPON = "01";
const DISCOUNT_TMS = "02";	// T membership

let conuntOptionList;

class BuyBillChannel extends PopupPageView {
	constructor(props) {
		super(props);

		console.log('props: ', props);
		if (this.historyData == null) {
			let DATA_CHANNEL = this.paramData;
			let mode = CTSInfo.MODE_CHANNEL;
			
			this.state = {
				mode: mode,
				bRecoverMode: false,
				focusIdx: 0,
				focusView: 0,
				bShowOptionView: true,
				DATA_CHANNEL: DATA_CHANNEL,
				DATA_DISCOUNT: {
					bLoaded: false,
					COUPON_INFO: {
						bLoaded: false,
						COUPON_LIST: []
					},
					TMS_INFO: {
						TMS_SAVED_CARD_YN: DATA_CHANNEL.PROD_INFO_LIST.TMS_SAVED_CARD_YN,
						bLoaded : false,
					},
					TVPAY_INFO: {}
				},
				typeSelected: "90",
				activeView: VIEW_LIST,
				selectedInfo: {
					"01": 0,
					"02": 0,	// T membership
					// "03": 0,
					// "04": 0,	// OK cashbag
					// "05": 0	// TV Point
				},
				optionData: [],
				selectedCouponNo: '',	//설정되는 쿠폰 넘버
				discountInfo: {
					couponInfo: {},
					tmsInfo: {}
				},
				tvPayInfo: {}
			};
		} else {
			this.historyData.bRecoverMode = true;
			this.state = this.historyData;
		}

	const focusList = [
			{ key: 'billType', fm: null },
			{ key: 'optionList', fm: null },
			{ key: 'btnListBuyBill', fm: null }
		];
		this.declareFocusList(focusList);
	}

	componentWillMount = async() => {
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: false
		});

		const { bRecoverMode, DATA_CHANNEL } = this.state;
		if (bRecoverMode === false) {

			const requestEPS401 = EPS.request401({
				productId: DATA_CHANNEL.PROD_INFO_LIST.PID
			});
			const requestEPS300 = EPS.request300({});

			Promise.all([requestEPS401, requestEPS300]).then((value) => {
				let selectedCouponNo = "";
				let { DATA_DISCOUNT, selectedInfo, discountInfo } = this.state;
				
				DATA_DISCOUNT.bLoaded = true;
				// T Membership
				DATA_DISCOUNT.TMS_INFO.bLoaded = false;
				if (value[1].tmembership !== null) {
					DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "Y";
					DATA_DISCOUNT.TMS_INFO.cardNo = value[1].tmembership.cardNo;
				} else {
					DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "N";
					DATA_DISCOUNT.TMS_INFO.cardNo = "";
				}

				// TV PAY
				DATA_DISCOUNT.TVPAY_INFO = value[1].tvpay;

				// Coupon
				DATA_DISCOUNT.COUPON_INFO = {};
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
				if (value[0].result === '0000') {
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					const price = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE);
					for (let i = 0; i < value[0].coupons.coupon.length; i++) {
						const couponData = {
							couponNo: value[0].coupons.coupon[i].couponNo,
							couponType: value[0].coupons.coupon[i].couponType,
							masterNo: value[0].coupons.coupon[i].masterNo,
							title: value[0].coupons.coupon[i].title
						}
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.push(couponData);
						if (i === 0) {
							selectedCouponNo = value[0].coupons.coupon[i].couponNo;
							selectedInfo[DISCOUNT_COUPON] = 1;
							discountInfo.couponInfo = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i];
						}
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i] = {};
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo = value[0].coupons.coupon[i].couponNo;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponType = value[0].coupons.coupon[i].couponType;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].masterNo = value[0].coupons.coupon[i].masterNo;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title = value[0].coupons.coupon[i].title;
					}

					if (value[0].coupons.coupon.length > 0) {
						EPS.request402({ couponNo : selectedCouponNo })
						.then(data => {
							if (data.result === '0000') {
								let resultOk = false;
								for (let i = 0; i < DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length; i++) {
									if (data.coupon.couponNo === DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo) {
										DATA_DISCOUNT.COUPON_INFO.bLoaded = true;
										resultOk = true;
										DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount = data.coupon.discountAmount;
										DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title = data.coupon.title;
										DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType = data.coupon.discountType;
										const discountAmount = Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount);
										let discount = 0;
										if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType === '10') {
											// 정율 할인
											discount = price * (discountAmount / 100);
										} else {	//discountType === '20'
											// 정액 할인
											discount = price - discountAmount;
										}
										DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discount = discount;
										discountInfo.couponInfo.discount = discount;
										break;
									}
								}
								if (!resultOk) {
									selectedCouponNo = "";
									DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
								}
								
								this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo,selectedCouponNo: selectedCouponNo });
							} else {
								Core.inst().showToast(data.result, data.reason);
								selectedCouponNo = "";
								DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
								DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
								this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo,selectedCouponNo: selectedCouponNo });
								
							}
						});
					} else {
						DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
						this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo, selectedCouponNo: selectedCouponNo });
					}
				} else {
					DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, });
				}
			}, () => {
				Core.inst().showToast("잠시후 다시 시도해주세요.");
				CTSInfo.requestPurchaseAllCancel();
			});
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: true
		});
	}

	componentDidMount = () => {
		const btnListBuyBillFm = new FM({
			id : 'btnListBuyBill',
			containerSelector : '.btnWrap',
			moveSelector : '',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onKeyDownbtnListBuyBill
		});
		this.setFm('btnListBuyBill', btnListBuyBillFm);
		this.setFocus(this.arrangedFocusList.length - 1);
	}
	
	onFocusMoveUnavailable = (data) => {
		const { typeSelected, DATA_CHANNEL } = this.state;
		let idx = 0;
		if (data.id === 'billType' && data.direction === "RIGHT") {
			// 결제하기 버튼으로 이동
			if (typeSelected === constants.PAYMENT_TYPE_CD.BILL) {
				this.state.focusView = 2;
				this.state.focusIdx = 0;
				this.setFocus(this.state.focusView, this.state.focusIdx);
			} else {
				this.state.focusView = 1;
				this.state.focusIdx = 0;
				this.setFocus(this.state.focusView, this.state.focusIdx);
			}
		} else if (data.id === 'optionList' && data.direction === "RIGHT") {
			// 결제하기 버튼으로 이동
			if (typeSelected === constants.PAYMENT_TYPE_CD.BILL) {
				this.state.focusView = 2;
				this.state.focusIdx = 0;
				this.setFocus(this.state.focusView, this.state.focusIdx);
			} else {
				this.state.focusView = 1;
				this.state.focusIdx = 0;
				this.setFocus(this.state.focusView, this.state.focusIdx);
			}
		} else if (data.id === 'btnListBuyBill' && data.direction === "LEFT") {
			// 결제 탭으로 이동
			const arrTargetpayment = DATA_CHANNEL.TARGET_PAYMENT.split(",");
			for (let i = 0; i < arrTargetpayment.length; i++) {
				if (typeSelected === arrTargetpayment[i]) { 
					this.state.focusView = 0;
					this.state.focusIdx = i;
					this.setFocus(this.state.focusView, this.state.focusIdx);
				}
			}
		} else if (data.id === 'btnListBuyBill' && data.direction === "UP") {
			// Do nothing
		} else if (data.id === 'optionList' && data.curIdx === 0 && data.direction === 'PREV') {
			this.state.focusView = 0;
			this.state.focusIdx = 0;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		} else if (data.id === 'optionList' && data.curIdx === 0 && data.direction === 'UP') {
			this.state.focusView = 0;
			const targetpayment = DATA_CHANNEL.TARGET_PAYMENT.split(",");
			for (let i = 0; i < targetpayment.length; i++) {
				if (typeSelected === targetpayment[i]) {
					idx = i;
				}
			}
			this.state.focusIdx = idx;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		} else {
			idx = 0;
			if (data.direction === 'UP') {
				idx = this.focusIndex - 1;
				if (idx < 0) {
					idx = 0;
				}

				this.state.focusView = idx;
				this.state.focusIdx = 0;
				this.setFocus(idx, null, data.direction);
			} else if (data.direction === 'DOWN') {
				idx = this.focusIndex + 1;
				const lastIdx = this.arrangedFocusList.length - 1;
				if (idx >= lastIdx) {
					idx = lastIdx;
				}
				this.state.focusView = idx;
				this.state.focusIdx = 0;
				this.setFocus(idx, 0, data.direction);
			}
		}
	}

	onKeyDown(evt) {
		console.log('evt: ' + evt.keyCode);
		if (evt.keyCode === keyCodes.Keymap.BACK_SPACE || evt.keyCode === keyCodes.Keymap.PC_BACK_SPACE) {
			if (this.state.DATA_CHANNEL.enterance === 1) {
				// 마지막 남은 구매 화면이면 구매 취소 팝업 호출(시나리오)
				// 구매 취소
				const param = {
					title: '구매 취소 확인',
					desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
					btns: ["확인", "취소"]
				}
				Core.inst().showPopup(<PopupConfirm />, param, (info) => {
					if (info.result) {
						CTSInfo.requestPurchaseAllCancel();
					}
				});
			} else {
				this.props.callback();
			}
			return true;
		} else {
			super.onKeyDown(evt);
		}
	}

	onKeyDownbtnListBuyBill = (evt, idx) => {
		console.log(idx);
		console.log(this.state);
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const {typeSelected } = this.state;
			if (idx === 0) {
				// // 결제하기
				if (typeSelected === constants.PAYMENT_TYPE_CD.CREDIT) {
					// 신용카드 결제
					this.goToPurchaseTvPay();
				} else if (typeSelected === constants.PAYMENT_TYPE_CD.PHONE) {
					// 휴대폰 결제
					this.goToPurchasePhone();
				} else {
					Core.inst().showPopup(<BillCertify />, { mode: 'mode_ppm' }, (info) => {
						if (info.result) {
							// 구매 사용 여부 확인 후, 팝업 호출 1:사용, 0:사용안함
							if (StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION) === '0') {
								this.purchaseCallBack({result: '0000'});
							} else {
								let param = {
									certification_type: constants.CERT_TYPE.PURCHASE,
									age_type : ''
								}
								Core.inst().showPopup(<AdultCertification />, param, this.purchaseCallBack);
							}
						}
					});
				}
			} else {
				// 구매 취소
				const param = {
					title: '구매 취소 확인',
					desc: '구매를 취소하고 이전화면으로 돌아가시겠어요?',
					btns: ["확인", "취소"]
				}
				Core.inst().showPopup(<PopupConfirm />, param, (info) => {
					if (info.result){
						CTSInfo.requestPurchaseAllCancel();
					}
				});
			}
		}
	}
	callbackTVPay = (info) => {
		console.log('callbackTVPay', info);
		//resultCode : temp[0], // 0-결제성공, 8900-사용자취소, 이외 미결제
		//seqNo : temp[1]
		if (info.closed === 'Y' && info.resultCode === '0') {
			const { DATA_CHANNEL } = this.state;
			const tvPayInfo = {
				seqNo: info.seqNumber
			}
			this.state.tvPayInfo = tvPayInfo;
			
			let discount = {};
			// TV페이 인 경우
			discount.useCoupon = false;
			discount.useTmembership = false;
			discount.useOcb = false;
			discount.useTvpoint = false;
			discount.useBpoint = false;

			discount.useTvpay = true;
			discount.ifSequence = tvPayInfo.seqNo;
			const price = Number( DATA_CHANNEL.PROD_INFO_LIST.PRICE );
			const tax = ( Number( DATA_CHANNEL.PROD_INFO_LIST.PRICE ) * 0.1 );
			discount.tvpayAmount = price + tax;
			discount.usePhone = false;

			CTSInfo.requestPurchaseEPS111({ mode: CTSInfo.MODE_CHANNEL, data: DATA_CHANNEL, discountInfo: discount });
		} else if (info.resultCode === '8900') {
			Core.inst().showToast("결제를 취소하였습니다.");
		} else {
			Core.inst().showToast("결제를 실패하였습니다.");
		}
	}

	purchaseCallBack = (info) => {
		if (info !== undefined && info.result === '0000') {
			let funcPurchase;
			const { typeSelected, discountInfo, DATA_CHANNEL, tvPayInfo } = this.state;

			let discount = {};
			if (typeSelected === constants.PAYMENT_TYPE_CD.CREDIT) {
				// TV페이 인 경우
				funcPurchase = CTSInfo.requestPurchaseEPS111;
				discount.useCoupon = false;
				discount.useTmembership = false;
				discount.useOcb = false;
				discount.useTvpoint = false;
				discount.useBpoint = false;

				discount.useTvpay = true;
				discount.ifSequence = tvPayInfo.seqNo;
				discount.tvpayAmount = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) * 1.1;
				discount.usePhone = false;
				discount.totalPrice = discount.tvpayAmount;
			} else {
				if (!_.isEmpty(discountInfo.tmsInfo) && !_.isEmpty(discountInfo.couponInfo)) {
					// T멤버쉽 Coupon 모두 사용하는 경우 (T멤버쉽이 포함되면 EPS111 호출)
					funcPurchase = CTSInfo.requestPurchaseEPS111;

					discount.useCoupon = true;
					discount.couponNo = discountInfo.couponInfo.couponNo;
					discount.useTmembership = true;
					discount.tmembershipGrade = discountInfo.tmsInfo.grade;
					
					// default data
					discount.useOcb = false;
					discount.useTvpoint = false;
					discount.useBpoint = false;
					discount.useTvpay = false;
					discount.usePhone = false;
					discount.totalPrice = (Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) + discountInfo.totalDiscount) * 1.1;
				} else if (!_.isEmpty(discountInfo.tmsInfo)) {
					// T멤버쉽 사용 하는 경우 (T멤버쉽이 포함되면 EPS111 호출)
					funcPurchase = CTSInfo.requestPurchaseEPS111;

					discount.useTmembership = true;
					discount.tmembershipGrade = discountInfo.tmsInfo.grade;

					// default data
					discount.useOcb = false;
					discount.useTvpoint = false;
					discount.useBpoint = false;
					discount.useTvpay = false;
					discount.usePhone = false;
					discount.useCoupon = false;
					discount.totalPrice = (Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) + discountInfo.totalDiscount) * 1.1;
				} else if (!_.isEmpty(discountInfo.couponInfo)) {
					// 쿠폰만 사용하는 경우(쿠폰만 있거나 할인 옵션 없는 경우, IOS-002호출)
					funcPurchase = CTSInfo.requestPurchaseChannel;
					discount.yn_coupon = 'y';
					discount.no_coupon = discountInfo.couponInfo.couponNo;
					let totalDiscount = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE);
					totalDiscount = totalDiscount - discountInfo.couponInfo.discount;
					discount.amt_discount = totalDiscount;
					discount.totalPrice = (totalDiscount) * 1.1;
				} else {
					// 할인 옵션 사용하지 않는 경우(쿠폰만 있거나 할인 옵션 없는 경우, IOS-002호출)
					funcPurchase = CTSInfo.requestPurchaseChannel;
					discount.yn_coupon = 'n';
					discount.totalPrice = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) * 1.1;;
				}
			}

			funcPurchase({mode: CTSInfo.MODE_CHANNEL, data: DATA_CHANNEL, paymethod: this.state.typeSelected, discountInfo: discount});
		}
	}

	billTypeKeyDown = (keyCode, targetPayment, tpIndex) => {
		const { DATA_CHANNEL } = this.state;
		let bShowOptionView, arrTargetpayment = DATA_CHANNEL.TARGET_PAYMENT.split(",");
		if (keyCode === keyCodes.Keymap.ENTER) {
			bShowOptionView = targetPayment === constants.PAYMENT_TYPE_CD.BILL ? true : false;
			if (!bShowOptionView) {
				// 화면이 변경되지 않는 경우, optionList reset하지 않음.
				this.setFm('optionList', null);
			}
			this.setState({
				typeSelected: targetPayment,
				bShowOptionView: bShowOptionView
			});
			
			// 결제하기 버튼으로 이동
			this.setFocus('btnListBuyBill');
		} else if (keyCode === keyCodes.Keymap.LEFT) {
			tpIndex--;
			if (tpIndex >= 0) {
				this.setFm('optionList', null);
				
				bShowOptionView = arrTargetpayment[tpIndex] === constants.PAYMENT_TYPE_CD.BILL ? true : false;
				this.setState({
					typeSelected: arrTargetpayment[tpIndex],
					bShowOptionView: bShowOptionView
				});
			}
		} else if (keyCode === keyCodes.Keymap.RIGHT) {
			tpIndex++;
			if (tpIndex < arrTargetpayment.length) {
				this.setFm('optionList', null);
				
				bShowOptionView = arrTargetpayment[tpIndex] === constants.PAYMENT_TYPE_CD.BILL ? true : false;
				this.setState({
					typeSelected: arrTargetpayment[tpIndex],
					bShowOptionView: bShowOptionView
				});
			}
		}
	}

	cbCouponRegist = (info) => {
		console.log("cbCouponRegist: ", info);
		this.updateDiscountInfo();
	}
	 
	cbTmembership = (info) => {
		console.log("cbTmembership: ", info);
		this.updateDiscountInfo();
	}

	updateDiscountInfo = () => {
		const { DATA_CHANNEL, focusView, focusIdx } = this.state;
		
		const requestEPS401 = EPS.request401({
			productId: DATA_CHANNEL.PROD_INFO_LIST.PID
		});
		const requestEPS300 = EPS.request300({});

		Promise.all([requestEPS401, requestEPS300]).then((value) => {
			let selectedCouponNo = "";
			let { DATA_DISCOUNT } = this.state;
			let discountInfo = {
				totalDiscount: 0,
				couponInfo: {},
				tmsInfo: {}
			};
			let selectedInfo = {	//선택된 데이터 초기화
				"01": 0,
				"02": 0,	// T membership
			};

			DATA_DISCOUNT.bLoaded = true;
			// T Membership
			DATA_DISCOUNT.TMS_INFO.bLoaded = false;
			if (value[1].tmembership !== null) {
				DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "Y";
				DATA_DISCOUNT.TMS_INFO.cardNo = value[1].tmembership.cardNo;
			} else {
				DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "N";
				DATA_DISCOUNT.TMS_INFO.cardNo = "";
			}

			// TV PAY
			DATA_DISCOUNT.TVPAY_INFO = value[1].tvpay;

			// Coupon
			DATA_DISCOUNT.COUPON_INFO = {};
			DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
			if (value[0].result === '0000') {
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
				const price = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE);
				for (let i = 0; i < value[0].coupons.coupon.length; i++) {
					const couponData = {
						couponNo: value[0].coupons.coupon[i].couponNo,
						couponType: value[0].coupons.coupon[i].couponType,
						masterNo: value[0].coupons.coupon[i].masterNo,
						title: value[0].coupons.coupon[i].title
					}
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.push(couponData);
					if (i === 0) {
						selectedCouponNo = value[0].coupons.coupon[i].couponNo;
						selectedInfo[DISCOUNT_COUPON] = 1;
						discountInfo.couponInfo = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i];
					}
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i] = {};
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo = value[0].coupons.coupon[i].couponNo;
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponType = value[0].coupons.coupon[i].couponType;
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].masterNo = value[0].coupons.coupon[i].masterNo;
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title = value[0].coupons.coupon[i].title;
				}

				if (value[0].coupons.coupon.length > 0) {
					EPS.request402({ couponNo : selectedCouponNo })
					.then(data => {
						if (data.result === '0000') {
							let resultOk = false;
							for (let i = 0; i < DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length; i++) {
								if (data.coupon.couponNo === DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo) {
									DATA_DISCOUNT.COUPON_INFO.bLoaded = true;
									resultOk = true;
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount = data.coupon.discountAmount;
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title = data.coupon.title;
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType = data.coupon.discountType;
									const discountAmount = Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount);
									let discount = 0;
									if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType === '10') {
										// 정율 할인
										discount = price * (discountAmount / 100);
									} else {	//discountType === '20'
										// 정액 할인
										discount = price - discountAmount;
									}
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discount = discount;
									discountInfo.couponInfo.discount = discount;
									break;
								}
							}
							if (!resultOk) {
								selectedCouponNo = "";
								DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
								DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
							}
							
							this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo,selectedCouponNo: selectedCouponNo });
						} else {
							Core.inst().showToast(data.result, data.reason);
							selectedCouponNo = "";
							DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
							DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
							this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo,selectedCouponNo: selectedCouponNo });
							
						}
					});
				} else {
					DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo, selectedCouponNo: selectedCouponNo });
				}
			} else {
				DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
				this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, });
			}
			this.setFocus(focusView, focusIdx);
		}, () => {
			Core.inst().showToast("잠시후 다시 시도해주세요.");
			CTSInfo.requestPurchaseAllCancel();
		});
	}

	/**
	 * type
	 * view
	 * idx
	 */
	optionListKeyDown = async (obj) => {
		const activeView = obj.activeView;
		let { DATA_DISCOUNT }  = this.state;
		let param;
		if (obj.activeView === VIEW_BTN) {
			// Select Button
			this.state.activeView = activeView;
			this.state.focusIdx = obj.idx;
			switch (obj.type) {
				case "01":
					if (Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length) < 1) {
						//쿠폰 등록 팝업
						param = {
                            title: '할인수단 초기화 안내',
							desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
                            btns: ["확인", "취소"]
                        }
                        Core.inst().showPopup(<PopupConfirm />, param, (info) => {
                            if (info.result) {
								Core.inst().showPopup(<CouponRegist/>, {}, this.cbCouponRegist);
							}
						});
					} else {
						//쿠폰 변경 팝업
						param = {
                            title: '할인수단 초기화 안내',
							desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
                            btns: ["확인", "취소"]
                        }
                        Core.inst().showPopup(<PopupConfirm />, param, (info) => {
                            if (info.result) {
								const { DATA_CHANNEL, selectedCouponNo } = this.state;
								Core.inst().showPopup(<BillCoupon />, { pid: DATA_CHANNEL.PROD_INFO_LIST.PID, selectedCouponNo: selectedCouponNo }, this.callbackBillCoupon);
							}
						});
					}
					break;
				case "02":
					// T멤버쉽 변경 팝업으로 이동
					param = {
						title: '할인수단 초기화 안내',
						desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
						btns: ["확인", "취소"]
					}
					Core.inst().showPopup(<PopupConfirm />, param, (info) => {
						if (info.result) {
							Core.inst().showPopup(<Tmembership />, {}, this.cbTmembership);
						}
					});
					break;
				// BPoint, OKB와 TV포인트는 버튼 지원하지 않음.
				default:
					break;
			}
		} else {
			// Select List
			const { DATA_CHANNEL } = this.state;
			let { selectedInfo, discountInfo } = this.state;
			if (!obj.disabled) {
				selectedInfo[obj.type] = selectedInfo[obj.type] === 0 ? 1 : 0;
			}

			switch (obj.type) {
				case DISCOUNT_COUPON:
					if (Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length) > 0) {
						if (selectedInfo[obj.type] === 1) {
							// 할인 적용
							if (Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) + discountInfo.totalDiscount <= 0) {
								selectedInfo[obj.type] = 0;
								Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
							} else {
								for (let i = 0; i < DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length; i++) {
									if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo === this.state.selectedCouponNo) {
										discountInfo.couponInfo = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i];
										break;
									}
								}
							}
						} else {
							// 할인 해제
							discountInfo.couponInfo = {};
						}
					}
					break;
				case DISCOUNT_TMS:
					if (DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN === "N" || DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN === "") {
						// My BTV의 T멤버십 설정화면으로 이동
						param = {
							title: '할인수단 초기화 안내',
							desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
							btns: ["확인", "취소"]
						}
						Core.inst().showPopup(<PopupConfirm />, param, (info) => {
							if (info.result) {
								Core.inst().showPopup(<TmembershipRegist/>, {}, this.cbTmembershipRegist);
							}
						});
					} else if (!DATA_DISCOUNT.TMS_INFO.bLoaded) {
						const data = await EPS.request501({ productId: DATA_CHANNEL.PROD_INFO_LIST.PID });
						if (data.result === '0000' && data.discountRate !== undefined) {
							DATA_DISCOUNT.TMS_INFO.bLoaded = true;
							DATA_DISCOUNT.TMS_INFO.discountRate = Number(data.discountRate);
							DATA_DISCOUNT.TMS_INFO.balance = Number(data.tmembership.balance);
							DATA_DISCOUNT.TMS_INFO.cardNo = data.tmembership.cardNo;
							DATA_DISCOUNT.TMS_INFO.grade = data.tmembership.grade;
	
							// 멤버십 등급 V: VIP, G: Gold, S: Silver, A: 일반
							switch (data.tmembership.grade) {
								case "V":
									DATA_DISCOUNT.TMS_INFO.grade_str = "VIP";
									break;
								case "G":
									DATA_DISCOUNT.TMS_INFO.grade_str = "GOLD";
									break;
								case "S":
									DATA_DISCOUNT.TMS_INFO.grade_str = "Silver";
									break;
								case "A":
									DATA_DISCOUNT.TMS_INFO.grade_str = "일반";
									break;
								default:
									break;
							}

							if (selectedInfo[obj.type] === 1 && Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) + discountInfo.totalDiscount <= 0) {
								selectedInfo[obj.type] = 0;
								Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
							} else {
								discountInfo.tmsInfo.discountRate = DATA_DISCOUNT.TMS_INFO.discountRate;
								discountInfo.tmsInfo.balance = DATA_DISCOUNT.TMS_INFO.balance;
								discountInfo.tmsInfo.cardNo = DATA_DISCOUNT.TMS_INFO.cardNo;
								discountInfo.tmsInfo.grade = DATA_DISCOUNT.TMS_INFO.grade;
							}
						} else if (data.discountRate === undefined) {
							Core.inst().showToast('잠시후 다시 시도해 주세요.');
						} else {
							Core.inst().showToast(data.result, data.reason);
						}
					} else {
						// 할인 추가
						if (selectedInfo[obj.type] === 1) {
							if (selectedInfo[obj.type] === 1 && Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE) + discountInfo.totalDiscount <= 0) {
								selectedInfo[obj.type] = 0;
								Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
							} else {
								discountInfo.tmsInfo.discountRate = DATA_DISCOUNT.TMS_INFO.discountRate;
								discountInfo.tmsInfo.balance = DATA_DISCOUNT.TMS_INFO.balance;
								discountInfo.tmsInfo.cardNo = DATA_DISCOUNT.TMS_INFO.cardNo;
								discountInfo.tmsInfo.grade = DATA_DISCOUNT.TMS_INFO.grade;
							}
						} else {
							// 할인 해제
							discountInfo.tmsInfo = {};
						}
					}
					break;
				default:
					break;
			}
			this.setState({
				selectedInfo: selectedInfo, discountInfo: discountInfo, DATA_DISCOUNT: DATA_DISCOUNT, activeView: activeView,
				focusIdx: obj.idx
			});
		}
	}

	callbackBillCoupon = (info) => {
		console.log('info: ' + info);
		// this.state.selectedCouponNo

		let couponNo = info.couponNo;
		EPS.request402({ couponNo: couponNo })
		.then(data => {
			const { DATA_CHANNEL } = this.state;
			let { DATA_DISCOUNT } = this.state;
			if (data.result === '0000') {
				let resultOk = false;
				const price = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE);
				for (let i = 0; i < DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length; i++) {
					if (data.coupon.couponNo === DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo) {
						resultOk = true;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount = data.coupon.discountAmount;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title = data.coupon.title;
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType = data.coupon.discountType;
						const discountAmount = Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountAmount);
						let discount = 0;
						if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discountType === '10') {
							// 정율 할인
							discount = price * (discountAmount / 100);
						} else {	//discountType === '20'
							// 정액 할인
							discount = price - discountAmount;
						}
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].discount = discount;
						break;
					}
				}
				if (!resultOk) {
					DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					couponNo = "";
				}

				this.state.selectedCouponNo = couponNo;
				this.state.DATA_DISCOUNT.COUPON_INFO = DATA_DISCOUNT.COUPON_INFO;
				this.setState({ selectedCouponNo: couponNo, DATA_DISCOUNT: DATA_DISCOUNT });
			} else {
				Core.inst().showToast(data.result, data.reason);
				DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
				this.setState({ selectedCouponNo: "", DATA_DISCOUNT: DATA_DISCOUNT });
			}
		});
	}

	goToPurchaseTvPay() {
		// 신용카드 결제
		Core.inst().showPopup(<BillCertify />, { mode: 'mode_ppm' }, (info) => {
			if (info.result) {
				const { DATA_CHANNEL, DATA_DISCOUNT } = this.state;
				const paramData = {
					PRICE: DATA_CHANNEL.PROD_INFO_LIST.PRICE,
					PNAME: DATA_CHANNEL.PROD_INFO_LIST.PNAME,
					tvpayId: DATA_DISCOUNT.TVPAY_INFO.tvpay.id,
					tvpayUrl: DATA_DISCOUNT.TVPAY_INFO.tvpay.url
				}
				CTSInfo.callTVPayForPurchase(paramData, this.callbackTVPay);
			}
		});
	}

	goToPurchasePhone() {
		// 휴대폰 결제
		Core.inst().showPopup(<BillCertify />, { mode: 'mode_all' }, (info) => {
			if (info.result) {
				const { DATA_CHANNEL } = this.state;
				const data = {
					mode: CTSInfo.MODE_CHANNEL,
					PID: DATA_CHANNEL.PROD_INFO_LIST.PID,
					V_PRICE: Number( DATA_CHANNEL.PROD_INFO_LIST.PRICE ) * 1.1 
				}
				Core.inst().showPopup(<BillPhoneCertify />, { data: data, DATA_API: DATA_CHANNEL });
			}
		});
	}
	checkdiscountInfo() {
		const { DATA_CHANNEL, typeSelected } = this.state;
		let discountInfo;
		if (typeSelected !== constants.PAYMENT_TYPE_CD.BILL) {
			discountInfo = {
				totalDiscount: 0,
				couponInfo: {},
				tmsInfo: {}
			}
		} else {
			// 결제 적용 순서
			// 쿠폰 > T멤버쉽 > OCB > TVP > Bpoint
			const PRICE = Number(DATA_CHANNEL.PROD_INFO_LIST.PRICE);
			discountInfo = this.state.discountInfo;
			let totalDiscount = 0;
			if (!_.isEmpty(discountInfo.couponInfo)) {
				totalDiscount = totalDiscount - discountInfo.couponInfo.discount;
				discountInfo.couponInfo.appliedDiscount = discountInfo.couponInfo.discount;
			}

			if (!_.isEmpty(discountInfo.tmsInfo)) {
				discountInfo.tmsInfo.appliedDiscount = PRICE * (discountInfo.tmsInfo.discountRate / 100);
				totalDiscount = totalDiscount - discountInfo.tmsInfo.appliedDiscount;
			}

			this.state.discountInfo = discountInfo;
			discountInfo.totalDiscount = totalDiscount;
		}
		return discountInfo;
	}

	render() {
		const { DATA_CHANNEL, DATA_DISCOUNT } = this.state;

		const totalDiscountInfo = this.checkdiscountInfo();
		let optionData = [], appliedDiscount;

		conuntOptionList = DATA_CHANNEL.PROD_INFO_LIST.TARGET_DISCOUNT.split(",");
		for (let i = 0; i < conuntOptionList.length; i++) {

			let data = {
				type: conuntOptionList[i],
				title: "",
				desc: "",
				discountPrice: 0,
				selected: false,

			}

			switch (conuntOptionList[i]) {
				case DISCOUNT_COUPON:
					data.title = "쿠폰";
					if (Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length) <= 0) {
						data.disabled = true;
						data.btnTitle = "등록";
						data.desc = "이용 가능한 쿠폰이 없습니다.";
						data.discount = "0";
					} else {
						data.disabled = false;
						data.btnTitle = "변경";
						for (let i = 0; i < DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length; i++) {
							if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].couponNo === this.state.selectedCouponNo) {
								//지정된 쿠폰과 일치한 쿠폰 설정
								data.desc = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i].title;
								appliedDiscount = totalDiscountInfo.couponInfo.appliedDiscount > 0 ?totalDiscountInfo.couponInfo.appliedDiscount : 0;
								data.discount = numberWithCommas(Number(appliedDiscount));
								break;
							}
						}
					}
					break;
				case DISCOUNT_TMS:
					data.disabled = false;
					data.btnTitle = "설정";
					data.title = "T 멤버십";
					if (DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN === "N" || DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN === "") {
						data.disabled = true;
						data.desc = "선택하여 카드 등록";
						data.discount = 0;
					} else if (DATA_DISCOUNT.TMS_INFO.bLoaded) {
						appliedDiscount = totalDiscountInfo.tmsInfo.appliedDiscount > 0 ? totalDiscountInfo.tmsInfo.appliedDiscount : 0;
						data.discount = numberWithCommas(Number(appliedDiscount));
						data.v_discount = Number(appliedDiscount) + Math.round(Number(appliedDiscount) * 0.1);
						data.v_discount = numberWithCommas(Number(data.v_discount));
						data.desc = "-" + data.v_discount + "P (" + DATA_DISCOUNT.TMS_INFO.grade_str + " " + DATA_DISCOUNT.TMS_INFO.discountRate + "%)";
					} else {
						data.desc = "선택하여 할인율 조회";
						data.discount = 0;
					}
					break;
				default:
					break;
			}
			optionData.push(data);
		}

		this.state.optionData = optionData;

		let paymentType = [];
		let targetpayment = DATA_CHANNEL.TARGET_PAYMENT.split(",");
		for (let i = 0; i < targetpayment.length; i++) {
			switch (targetpayment[i]) {
				case constants.PAYMENT_TYPE_CD.BILL:
					paymentType.push({
						'index': i,
						"targetPayment": targetpayment[i],
						"payClass": "bill",
						"payType": "청구서"
					});
					break;
				case constants.PAYMENT_TYPE_CD.PHONE:
					paymentType.push({
						'index': i,
						"targetPayment": targetpayment[i],
						"payClass": "mobile",
						"payType": "휴대폰"
					});
					break;
				case constants.PAYMENT_TYPE_CD.CREDIT:
					paymentType.push({
						'index': i,
						"targetPayment": targetpayment[i],
						"payClass": "credit",
						"payType": "신용카드"
					});
					break;
				default:
					break;
			}
		}


		const { mode, activeView, focusIdx, selectedInfo, typeSelected } = this.state;
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>채널 구매</span>
					<div>{DATA_CHANNEL.PROD_INFO_LIST.PNAME}</div>
					{DATA_CHANNEL.enterance === 2 &&
						<div className="progress">
							<span>1</span>
							<img src={`${appConfig.headEnd.LOCAL_URL}/buy/path-8.png`} alt="" />
							<span className="on">2</span>
						</div>
					}
				</div>
				<div className="buyContent buyBill">
					{optionData.length !== 0 &&
					<div className="left">
						<PaymentTypeList data={paymentType} setFm={this.setFm} typeSelected={typeSelected} billTypeKeyDown={this.billTypeKeyDown} />
						{/* 6/12 detailCon, select class 추가 */}
						{ this.state.bShowOptionView &&
						<div id="optionList" className="detailCon optionWrap select">
							<OptionList data={optionData} activeView={activeView} focusIdx={focusIdx} selectedInfo={selectedInfo} optionListKeyDown={this.optionListKeyDown} setFm={this.setFm} />
							<p className="payCaution">결제 후에는 취소/환불이 되지 않습니다. 단, 콘텐츠가 광고된 내용과 다른
							경우 구매일로부터 3개월 이내 취소가 가능합니다. 콘텐츠 시청 시 광고를
							포함할 수 있습니다.<br/>
							T멤버십 할인은 월정액 상품구매시 최초 1회 첫달 50% 할인됩니다.
							(월정액 교육 장르, 성인장르, 부가서비스 상품 및 일부제휴월정액 상품은
							제외됩니다.)<br/>
							B포인트는 월정액 자동 차감 설정여부에 따라 차감이 매월 2~3일 전월요금 계산 시 점에 잔액이 남아있는 경우만 차감됩니다.</p>
						</div>
						}
						{/* 6/5-신용카드,휴대폰 시 나오는 문구 변경 */}
						<div className={`detailCon imgInfoWrap ${typeSelected === constants.PAYMENT_TYPE_CD.CREDIT ? 'select' : ''}`}>
							<div className="tabMes">
								<p className="mes">신용카드 결제 시에는 할인 혜택을 적용할 수 없습니다.<span className="sub">신용카드 결제를 이용하시려면, 리모컨 [OK]키를 눌러주세요.</span></p>
							</div>
						</div>
						<div className={`detailCon imgInfoWrap ${typeSelected === constants.PAYMENT_TYPE_CD.PHONE ? 'select' : ''}`}>
							<div className="tabMes">
								<p className="mes">휴대폰 결제 시에는 할인 혜택을 적용할 수 없습니다.<span className="sub">휴대폰 결제를 이용하시려면, 리모컨 [OK]키를 눌러주세요.</span></p>
							</div>
						</div>
					</div>
					}
					<div className="right">
						<PurchaseDetailView mode={mode} data={DATA_CHANNEL} totalDiscount={totalDiscountInfo.totalDiscount} selectedInfo={selectedInfo} />
						<div id="btnListBuyBill"><PurchaseBtnView /></div>
						{ !this.state.bShowOptionView &&
						<p>결제 후에는 취소/환불이 되지 않습니다. 단, 콘텐츠가 광고된 내용과 다른 경우 구매일로부터 3개월 이내 취소가 가능합니다. 콘텐츠 시청 시 광고를 포함할 수 있습니다.</p>
						}
					</div>
				</div>
			</div>
		)
	}
}

class PaymentTypeList extends React.Component {
	constructor(props) {
		super(props);
		const selected = this.props.selected;
		this.state = {
			selected: selected
		};
	}
	
	componentDidMount = () => {
		const { data, setFm } = this.props;
		const billTypeFm = new FM({
			id : 'billType',
			moveSelector : '.optionWrap',
			focusSelector : '.csFocus',
			row : 1,
			col : data.length,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : data.length - 1,
			onFocusKeyDown: this.onFocusKeyDown,
			onFocusChild: this.onFocused
		});
		setFm('billType', billTypeFm);
	}
	onFocusKeyDown = (evt, idx) => {
		const { data, billTypeKeyDown } = this.props;
		billTypeKeyDown(evt.keyCode, data[idx].targetPayment, data[idx].index);
	}
	render() {
		const { data, typeSelected } = this.props;
		const list = data.map((data, i) => {
			let focusClass = typeSelected === data.targetPayment ? 'csFocus radioStyle4 select ' + data.payClass : 'csFocus radioStyle4 ' + data.payClass;
			return (
				<span className={focusClass} key={i} >
				{data.payType}
				</span>
			);
		})
		
		return (
			<div id="billType" className="paymentType">
				<div className="optionWrap">
				{list}
				</div>
			</div>
		);
	}
}

class OptionList extends React.Component {
	constructor(props) {
		super(props);
		console.log('props: ' + props);
		this.state = {
			active: false,
			activeView: this.props.activeView,	// 0:btn, 1: list
			focusIdx: this.props.focusIdx
		};
	}

	componentDidMount = () => {
		console.log('cmd');
		const { data, setFm } = this.props;

		const optionListFm = new FM({
			id: 'optionList',
			moveSelector: 'div',
			focusSelector: '.csFocusList',
			row: data.length,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: data.length - 1,
			bRowRolling: false,
			onFocusContainer: this.onFocusContainer,
			onBlurContainer: this.onBlurContainer,
			onFocusKeyDown: this.onFocusKeyDown,
			onFocusChild: this.onFocused
		});
		setFm('optionList', optionListFm);
	}
	onFocusContainer = (direction) => {
		const { activeView, focusIdx } = this.state;
		this.setState({ active: true, activeView: activeView, focusIdx: focusIdx });
	}
	onBlurContainer = (direction) => {
		this.setState({ active: false, activeView: VIEW_LIST, focusIdx: 0 });
	}
	onFocusChild = (idx) => {
		this.setState({ activeView: VIEW_LIST });
	}
	onFocusKeyDown = (evt, idx) => {
		const { optionListKeyDown, data } = this.props;
		const { activeView } = this.state;
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			const param = {
				type: data[idx].type,
				activeView: activeView,
				idx: idx,
				disabled: data[idx].disabled
			}
			optionListKeyDown(param);
		} else if (evt.keyCode === keyCodes.Keymap.LEFT && activeView === VIEW_LIST) {
			if (data[idx].type !== "04" && data[idx].type !== "05") {
				this.setState({ activeView: VIEW_BTN });
			}
			return true;
		} else if (evt.keyCode === keyCodes.Keymap.RIGHT && activeView === VIEW_BTN) {
			this.setState({ activeView: VIEW_LIST });
			return true;
		} else {
			this.setState({ activeView: VIEW_LIST });
		}
	}

	onFocused = (idx) => {
		this.setState({ idx: idx });
	}

	render() {
		const { data, selectedInfo } = this.props;

		const list = data.map((data, i) => {
			let discountWrapClass = this.state.active && this.state.idx === i ? 'csFocusList discountWrap focus' : 'csFocusList discountWrap';
			let btnClass = this.state.active && this.state.idx === i && this.state.activeView === VIEW_BTN ? 'btnStyle type03 changeBtn focusOn' : 'btnStyle type03 changeBtn';
			let listClass = this.state.active && this.state.idx === i && this.state.activeView === VIEW_LIST ? 'checkStyle1 focusOn' : 'checkStyle1';
			if (data.disabled) {
				listClass += " disable";
			}

			if (selectedInfo[data.type] === 1) {
				listClass += " select";
			}
			return (
				<div className={discountWrapClass} key={i}>
					{data.btnTitle !== "" &&
						<div className={btnClass} >{data.btnTitle}</div>
					}
					<div className={listClass} select={selectedInfo[data.type] === 1 ? 'true' : ''} >
						<span className="title">{data.title}</span>
						<span className="text">{data.desc}</span>
						<span className="discount">{data.discount > 0 ? `-${data.discount}원` : `${data.discount}원`}</span>
					</div>
				</div>
			)
		})

		return (
			<div> {list} </div>
		);
	}
}

class PurchaseDetailView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		};
	}
	render() {
		const { data, idx, totalDiscount } = this.props;
		console.log('data=', data);
		console.log('idx=', idx);

		const leftPrice = Number(data.PROD_INFO_LIST.PRICE) + totalDiscount;
		return (
			<div className="optionView">
				<ul>
					<li>
						<span>채널</span>
						<span className="optionList">{data.PROD_INFO_LIST.PNAME}</span>
					</li>
					<li>
						<span>이용기간</span>
						<span className="optionList">{data.PROD_INFO_LIST.DUETIME_STR}</span>
					</li>
				</ul>
				<div className="priceConWrap">
					<div className="priceWrapper">
						<div className="priceInner">
							<div className="subPrice">
								<span>상품원가</span>
								<span className="priceValue">{numberWithCommas(Number(data.PROD_INFO_LIST.PRICE))}<em>원</em></span>
							</div>
							<div className="subPrice">
								<span>할인</span>
								<span className="priceResult">{numberWithCommas(totalDiscount)}<em>원</em></span>
							</div>
						</div>
						<div className="priceInner">
							<div className="subPrice">
								<span>할인적용가</span>
								<span className="priceValue">{numberWithCommas(leftPrice)}<em>원</em></span>
							</div>
							<div className="subPrice">
								<span>부가세</span>
								<span className="priceValue">{numberWithCommas(leftPrice * 0.1)}<em>원</em></span>
							</div>
						</div>
					</div>
					<div className="priceCon">
						<span>실제 구매금액 <em>(부가세 포함)</em></span>
						<span className="priceResult">{numberWithCommas(leftPrice + (leftPrice * 0.1))}<em>원</em></span>
					</div>
				</div>
			</div>
		)
	}
}

class PurchaseBtnView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		}
	}
	render() {
		return (
			<div className="btnWrap">
				<span className='csFocus btnStyle nextBtn'>결제하기</span>
				<span className='csFocus btnStyle'>취소</span>
			</div>
		);
	}
}

export default BuyBillChannel;