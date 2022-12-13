import React from 'react'

import '../../../assets/css/routes/buy/BuyDefault.css';
import '../../../assets/css/routes/buy/BuyBill.css';

import { SCS } from '../../../supporters/network/SCS';
import { EPS } from '../../../supporters/network/EPS';

import { CTSInfo } from '../../../supporters/CTSInfo';
import Core from '../../../supporters/core';
import BuyBillOkCashBag from '../../../popup/BuyBillOkCashBag';
import AdultCertification from '../../../popup/AdultCertification';
import BillCertify from './BillCertify';
import BillCoupon from './BillCoupon';
import constants, { STB_PROP } from '../../../config/constants';
import keyCodes from '../../../supporters/keyCodes';
import FM from '../../../supporters/navi';
import PopupPageView from '../../../supporters/PopupPageView';
import { getCodeName } from '../../../utils/code';
import { numberWithCommas } from '../../../utils/utils';
import _ from 'lodash';
import StbInterface from './../../../supporters/stbInterface';
import BpointRegist from './../../myBtv/bPoint/BpointRegist';
import OkCashRegist from './../../myBtv/okcash/OkCashRegist';
import CouponRegist from './../../myBtv/coupon/CouponRegist';
import TmembershipRegist from './../../myBtv/tmembership/TmembershipRegist';
import appConfig from './../../../config/app-config';
import OkCashManage from '../../myBtv/okcash/OkCashManage';
import Tmembership from '../../myBtv/tmembership/Tmembership';
import { cloneDeep } from 'lodash';
import PopupConfirm from './../../../components/popup/PopupConfirm';
import BillDeliveryPhone from './BillDeliveryPhone';
import BillPhoneCertify from './BillPhoneCertify';

/**
 * BuyBill 단편, 시리즈, BPoint, 패키지, 상품패키지 상품인 경우만 사용
 */
const MODE_PPV = "mode_ppv";
const MODE_PPS = "mode_pps";
const MODE_PPM = "mode_ppm";
const MODE_PPP = 'mode_ppp';
const MODE_VODPLUS = 'mode_vodplus';
const MODE_BPOINT = 'mode_bpoint';

const VIEW_NO_DISCOUNT = 'view_no_discount';
const VIEW_OTHER = 'view_other';

const VIEW_BTN = '0';
const VIEW_LIST = '1';

// 할인 수단
const DISCOUNT_COUPON = "01";
const DISCOUNT_TMS = "02";	// T membership
const DISCOUNT_B_POINT = "03";
const DISCOUNT_OCB = "04";	// OK cashbag
const DISCOUNT_TVP = "05";	// TV Point

const PWD_FAIL_MSG = '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.';

let conuntOptionList;

class BuyBill extends PopupPageView {
	constructor(props) {
		super(props);

		console.log('props: ', props);

		if (this.historyData == null) {
			let DATA_SCS = this.paramData;
			let mode, viewMode;
			if (DATA_SCS.billMode === CTSInfo.BILL_BPOINT) {
				mode = MODE_BPOINT;
				DATA_SCS.PTYPE_STR = "BPoint";
				viewMode = VIEW_NO_DISCOUNT;
			} else if (!_.isEmpty(DATA_SCS.PROD_INFO.PROD_DTL.ID_MCHDSE)) {
				mode = MODE_VODPLUS;
				DATA_SCS.PTYPE_STR = "VOD+ 상품";
				viewMode = VIEW_NO_DISCOUNT;
			} else {
				viewMode = VIEW_OTHER;
				// for (let i = 0; i < DATA_SCS.length; i++) {
				switch (DATA_SCS.PTYPE) {
					case constants.PRD_TYP_CD.PPV:
						mode = MODE_PPV;
						if (DATA_SCS.PROD_INFO.CLTYN === 'Y') {
							DATA_SCS.PTYPE_STR = "소장";
						} else {
							DATA_SCS.PTYPE_STR = "일반";
						}
						break;
					case constants.PRD_TYP_CD.PPS:
						mode = MODE_PPS;
						DATA_SCS.PTYPE_STR = "시리즈";
						break;
					case constants.PRD_TYP_CD.PPP:
						mode = MODE_PPP;
						DATA_SCS.PTYPE_STR = "패키지";
						viewMode = VIEW_NO_DISCOUNT;
						break;
					case constants.PRD_TYP_CD.PPM:
						mode = MODE_PPM;
						DATA_SCS.PTYPE_STR = "월정액";
						break;
					default:
						break;
				}
				// }
			}

			this.isGuided = StbInterface.getProperty(constants.STB_PROP.TOOLTIPGUIDE_FLAG_PURCHASE);

			this.state = {
				mode: mode,
				viewMode: viewMode,
				bRecoverMode: false,
				focusIdx: 0,
				focusView: 0,
				bShowOptionView: true,
				DATA_SCS: DATA_SCS,
				DATA_DISCOUNT: undefined,
				typeSelected: '90',
				activeView: VIEW_LIST,
				selectedInfo: {
					"01": 0,
					"02": 0,	// T membership
					"03": 0,
					"04": 0,	// OK cashbag
					"05": 0		// TV Point
				},
				optionData: [],
				selectedCouponNo: '',	//설정되는 쿠폰 넘버
				discountInfo: {
					totalDiscount: 0,
					couponInfo: {},
					tmsInfo: {},
					ocbInfo: {},
					bPointInfo: {},
					tvpInfo: {}
				},
				tvPayInfo: {},
				toolTip1: !this.isGuided ? true : false,
				toolTip2: false
			};
		} else {
			this.historyData.bRecoverMode = true;
			this.state = this.historyData;
		}

		const focusList = [
			{ key: 'billType', fm: null },
			{ key: 'optionList', fm: null },
			{ key: 'buyBillBtnList', fm: null }
		];
		this.declareFocusList(focusList);

	}

	componentWillMount() {
		// 구매팝업은 DCA를 지원하지 않는다.(시나리오)
		StbInterface.keyInfo({
			numKeyUse: false
		});

		if (this.state.viewMode !== VIEW_NO_DISCOUNT
			&& this.state.bRecoverMode === false) {
			// BPoint구매는 할인 수단 미노출
			let param = {
				pid: this.state.DATA_SCS.PROD_INFO.PROD_DTL.PID,
				price: this.state.DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE,
				ptype: this.state.DATA_SCS.PTYPE,
				pTargetPayment: '90'
			};
			const requestSCS003 = SCS.request003(param);
			const requestEPS401 = EPS.request401({
				productId: this.state.DATA_SCS.PROD_INFO.PROD_DTL.PID
			});
			const requestEPS300 = EPS.request300({});

			Promise.all([requestSCS003, requestEPS401, requestEPS300]).then((value) => {
				console.log('success', value);

				const { focusIdx } = this.state;
				let DATA_DISCOUNT = value[0];
				if (DATA_DISCOUNT.result !== '0000') {
					Core.inst().showToast(DATA_DISCOUNT.result, DATA_DISCOUNT.reason);
				}

				let i, selectedCouponNo = "";
				let { selectedInfo, discountInfo } = this.state;

				const price = Number(this.state.DATA_SCS.PROD_INFO.PROD_DTL.PRICE);

				// Coupon
				DATA_DISCOUNT.COUPON_INFO = {};
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];

				if (value[1].result === '0000') {
					let resultCoupon = value[1].coupons.coupon;
					if (resultCoupon.length > 0) {
						for (i = 0; i < resultCoupon.length; i++) {
							const couponData = {
								couponNo: resultCoupon[i].couponNo,
								couponType: resultCoupon[i].couponType,
								masterNo: resultCoupon[i].masterNo,
								title: resultCoupon[i].title
							}
							DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.push(couponData);
							if (i === 0) {
								selectedCouponNo = resultCoupon[i].couponNo;
								selectedInfo[DISCOUNT_COUPON] = 1;
								discountInfo.couponInfo = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i];
							}
						}
					}
				}

				// Reset DISCOUNT Info
				DATA_DISCOUNT.BPOINT_INFO = {};
				DATA_DISCOUNT.TMS_INFO = {};
				DATA_DISCOUNT.TMS_INFO.bLoaded = false;
				DATA_DISCOUNT.OCB_INFO = {};
				DATA_DISCOUNT.OCB_INFO.bLoaded = false;
				DATA_DISCOUNT.OCB_INFO.OCB_LIST = {};
				DATA_DISCOUNT.TVP_INFO = {};
				DATA_DISCOUNT.TVP_INFO.bLoaded = false;

				if (value[2].result === '0000') {
					const conuntOptionList = DATA_DISCOUNT.TARGET_DISCOUNT.split(",");
					for (let i = 0; i < conuntOptionList.length; i++) {
						switch (conuntOptionList[i]) {
							case DISCOUNT_B_POINT:
								// BPoint
								DATA_DISCOUNT.BPOINT_INFO.usableBpoints = value[2].usableBpoints;
								if (value[2].usableBpoints > 0) {
									selectedInfo[DISCOUNT_B_POINT] = 1;
									discountInfo.bPointInfo.usablePoints = Number(value[2].usableBpoints);
								}
								break;
							case DISCOUNT_TMS:
								// T Membership
								if (value[2].tmembership !== null) {
									DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "Y";
									DATA_DISCOUNT.TMS_INFO.cardNo = value[2].tmembership.cardNo;
								} else {
									DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "N";
									DATA_DISCOUNT.TMS_INFO.cardNo = "";
								}
								break;
							case DISCOUNT_OCB:
								// OK Cashbag
								for (let i = 0; i < value[2].ocbList.ocb.length; i++) {
									if (value[2].ocbMasterSequence === value[2].ocbList.ocb[i].sequence) {
										DATA_DISCOUNT.OCB_INFO.OCB_LIST = value[2].ocbList.ocb[i];
										break;
									}
								}
								break;
							case DISCOUNT_TVP:
								//TV Point
								DATA_DISCOUNT.TVP_INFO = value[2].tvpoint;
								DATA_DISCOUNT.TVP_INFO.bLoaded = false;
								break;
							default:
								break;
						}
					}

					// TV PAY
					DATA_DISCOUNT.TVPAY_INFO = value[2].tvpay;
				} else {
					// error
					Core.inst().showToast(value[2].result, value[2].reason);
					DATA_DISCOUNT.TARGET_DISCOUNT = "NO";
				}

				// 쿠폰 리스트가 있는 경우, 선택된 쿠폰의 상세를 가져온다.
				if (value[1].result === '0000' && value[1].coupons.coupon.length > 0) {
					EPS.request402({ couponNo: selectedCouponNo })
						.then(data => {
							if (data.result === '0000') {
								let resultOk = false;
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
										discountInfo.couponInfo.discount = discount;
										break;
									}
								}
								if (!resultOk) {
									selectedCouponNo = "";
									DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
									DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
									selectedInfo[DISCOUNT_COUPON] = 0;
									discountInfo.couponInfo = {};
								}
							} else {
								Core.inst().showToast(data.result, data.reason);
								selectedCouponNo = "";
								DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
								DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
								selectedInfo[DISCOUNT_COUPON] = 0;
								discountInfo.couponInfo = {};
							}
							this.setState({
								DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo
								, selectedCouponNo: selectedCouponNo, discountInfo: discountInfo, focusView: this.arrangedFocusList.length - 1
							});
							this.setFocus(this.arrangedFocusList.length - 1, focusIdx);
						});
				} else {
					selectedCouponNo = "";
					DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					selectedInfo[DISCOUNT_COUPON] = 0;
					discountInfo.couponInfo = {};
					this.setState({
						DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo
						, selectedCouponNo: selectedCouponNo, discountInfo: discountInfo, focusView: this.arrangedFocusList.length - 1
					});
					this.setFocus(this.arrangedFocusList.length - 1, focusIdx);
				}
			}, () => {
				Core.inst().showToast("잠시후 다시 시도해주세요.");
				this.props.callback();
			})
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
		if (!this.isGuided) {
			let classThis = this;
			setTimeout(() => {
				StbInterface.setProperty(constants.STB_PROP.TOOLTIPGUIDE_FLAG_PURCHASE, true);
				classThis.setState({
					toolTip2: true
				});
			}, 5000);
		}

		const buyBillBtnListFm = new FM({
			id: 'buyBillBtnList',
			moveSelector: '.btnWrap',
			focusSelector: '.csFocus',
			row: 1,
			col: 2,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 1,
			onFocusKeyDown: this.onKeyDownbuyBillBtnList,
			onFocusChild: this.onFocused
		});
		this.setFm('buyBillBtnList', buyBillBtnListFm);

		if (this.state.viewMode === VIEW_NO_DISCOUNT) {
			this.state.focusView = this.arrangedFocusList.length - 1;
			this.setFocus(this.state.focusView, this.arrangedFocusList.length - 1);
		} else if (this.state.bRecoverMode) {
			const { focusView, focusIdx } = this.state;
			this.setFocus(focusView, focusIdx);
		}
	}

	onFocusMoveUnavailable = (data) => {
		const { typeSelected } = this.state;
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
		} else if (data.id === 'buyBillBtnList' && data.direction === "LEFT") {
			// 결제 탭으로 이동
			const arrTargetpayment = this.state.DATA_SCS.PROD_INFO.TARGET_PAYMENT.split(",");
			for (let i = 0; i < arrTargetpayment.length; i++) {
				if (typeSelected === arrTargetpayment[i]) { 
					this.state.focusView = 0;
					this.state.focusIdx = i;
					this.setFocus(this.state.focusView, this.state.focusIdx);
				}
			}
		} else if (data.id === 'buyBillBtnList' && data.direction === "UP") {
			// Do nothing
		} else if (data.id === 'optionList' && data.curIdx === 0 && data.direction === 'PREV') {
			this.state.focusView = 0;
			this.state.focusIdx = 0;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		} else if (data.id === 'optionList' && data.curIdx === 0 && data.direction === 'UP') {
			this.state.focusView = 0;
			const targetpayment = this.state.DATA_SCS.PROD_INFO.TARGET_PAYMENT.split(",");
			for (let i = 0; i < targetpayment.length; i++) {
				if (typeSelected === targetpayment[i]) {
					idx = i;
				}
			}
			this.state.focusIdx = idx;
			this.setFocus(this.state.focusView, this.state.focusIdx);
		} else {
			const focusView = cloneDeep(this.state.focusView);
			idx = 0;
			if (data.direction === 'UP') {
				idx = focusView - 1;
				if (idx < 0) {
					idx = 0;
				}

				this.state.focusView = idx;
				this.state.focusIdx = 0;
				this.setFocus(idx, null, data.direction);
			} else if (data.direction === 'DOWN') {
				idx = focusView + 1;
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
			if (this.state.DATA_SCS.enterance === 1) {
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

	onKeyDownbuyBillBtnList = (evt, idx) => {
		if (evt.keyCode === keyCodes.Keymap.ENTER) {
			if (idx === 0) {
				if (this.state.mode === MODE_BPOINT) {
					let param = {
						certification_type: constants.CERT_TYPE.PURCHASE,
						age_type: ''
					}
					// 구매 사용 여부 확인 후, 팝업 호출 1:사용, 0:사용안함
					const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
					if (purchase_flag === '0') {
						this.purchaseBpointCallback({ result: '0000' });
					} else {
						Core.inst().showPopup(<AdultCertification />, param, this.purchaseBpointCallback);
					}
				} else {
					const { mode, typeSelected, DATA_SCS } = this.state;
					//지원하지 않는 해상도일 경우 구매하지 못하도록 설정
					const hdr_support = StbInterface.getProperty(STB_PROP.HDR_SUPPORT);
					if (hdr_support === "false" && DATA_SCS.PROD_INFO.PROD_DTL.FGQUALITY === constants.RESOLUTION_TYPE_CD.UHD_HDR) {
						Core.inst().showToast("보유하신 TV가 UHD 또는 HDR 화질을 지원하지 않습니다.\n다른 화질을 선택해 주세요.\n(UHD,HDR 지원 여부는 TV제조사의 서비스센터에 문의해 주세요.)");
						return;
					}

					// 결제하기
					if (mode === MODE_VODPLUS) {
						//VOD+상품의 경우 휴대폰 인증 절차
						let discount = {};
						// Setting default data
						discount.yn_coupon = 'n';
						discount.yn_bpoint = 'n';
						const param = {
							func: CTSInfo.requestPurchaseSCS,
							mode: mode,
							data: DATA_SCS,
							discountInfo: discount
						};
						Core.inst().showPopup(<BillDeliveryPhone />, param, null);
					} else if (typeSelected === constants.PAYMENT_TYPE_CD.CREDIT) {
						// 신용카드 결제
						this.goToPurchaseTvPay();
					} else if (typeSelected === constants.PAYMENT_TYPE_CD.PHONE) {
						// 휴대폰 결제
						this.goToPurchasePhone();
					} else {
						let param = {
							certification_type: constants.CERT_TYPE.PURCHASE,
							age_type: ''
						}
						// 구매 사용 여부 확인 후, 팝업 호출 1:사용, 0:사용안함
						const purchase_flag = StbInterface.getProperty(STB_PROP.PURCHASE_CERTIFICATION);
						if (DATA_SCS.PTYPE === constants.PRD_TYP_CD.PPM) {
							Core.inst().showPopup(<BillCertify />, { mode: 'mode_ppm' }, (info) => {
								if (info.result) {
									if (purchase_flag === '0') {
										this.purchaseCallBack({ result: '0000' });
									} else {
										Core.inst().showPopup(<AdultCertification />, param, this.purchaseCallBack);
									}
								}
							});
						} else {
							if (purchase_flag === '0') {
								this.purchaseCallBack({ result: '0000' });
							} else {
								Core.inst().showPopup(<AdultCertification />, param, this.purchaseCallBack);
							}
						}
					}
				}
			} else {
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
			}
		}
	}
	callbackTVPay = (info) => {
		console.log('callbackTVPay', info);
		//resultCode : temp[0], // 0-결제성공, 8900-사용자취소, 이외 미결제
		//seqNo : temp[1]
		if (info.closed === 'Y' && info.resultCode === '0') {
			const tvPayInfo = {
				seqNo: info.seqNumber
			}
			this.state.tvPayInfo = tvPayInfo;

			const { mode, DATA_SCS } = this.state;
			let discount = {};
			// TV페이 인 경우
			discount.useCoupon = false;
			discount.useTmembership = false;
			discount.useOcb = false;
			discount.useTvpoint = false;
			discount.useBpoint = false;

			discount.useTvpay = true;
			discount.ifSequence = tvPayInfo.seqNo;
			discount.tvpayAmount = DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE;
			discount.usePhone = false;
			
			discount.totalPrice = DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE;
			CTSInfo.requestPurchaseEPS111({ mode: mode, data: DATA_SCS, discountInfo: discount });
		} else if (info.resultCode === '8900') {
			Core.inst().showToast("결제를 취소하였습니다.");
		} else {
			Core.inst().showToast("결제를 실패하였습니다.");
		}
	}

	purchaseBpointCallback = (info) => {
		if (info.result === '0000') {
			let { DATA_SCS } = this.state;
			const param = {
				transactionId: "AAA",
				bpointNumber: DATA_SCS.masterNo,
				useCoupon: "false",
				useTmembership: 'false',
				useOcb: 'false',
				useTvpoint: 'false',
				useBpoint: 'false',
				useTvpay: 'false',
				usePhone: 'false'
			}
			CTSInfo.requestPurchaseBPoint(DATA_SCS, param);
		}
	}
	purchaseCallBack = (info) => {
		if (info !== undefined && info.result === '0000') {
			const { mode, typeSelected, discountInfo, DATA_SCS, tvPayInfo } = this.state;
			let funcPurchase = CTSInfo.requestPurchaseSCS;

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
				discount.tvpayAmount = DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE;
				discount.usePhone = false;
				
				discount.totalPrice = DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE;
			} else {
				// 일반 단편 상품 구입
				if ((!_.isEmpty(discountInfo.tmsInfo) || !_.isEmpty(discountInfo.ocbInfo) || !_.isEmpty(discountInfo.tvpInfo))) {
					// 일반 단편 상품 구입 중 TMS, OCB, TVP 할인이 포함된 경우
					funcPurchase = CTSInfo.requestPurchaseEPS111;
					discount.totalPrice = (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount) * 1.1;
					if (!_.isEmpty(discountInfo.couponInfo)) {
						discount.useCoupon = true;
						discount.couponNo = discountInfo.couponInfo.couponNo;
					} else {
						discount.useCoupon = false;
					}

					if (!_.isEmpty(discountInfo.tmsInfo)) {
						discount.useTmembership = true;
						discount.tmembershipGrade = discountInfo.tmsInfo.grade;
					} else {
						discount.useTmembership = false;
					}

					if (!_.isEmpty(discountInfo.ocbInfo)) {
						discount.useOcb = true;
						discount.ocbAmount = discountInfo.ocbInfo.appliedDiscount > 0 ? discountInfo.ocbInfo.appliedDiscount : 0;
						discount.ocbSequence = discountInfo.ocbInfo.sequence;
						discount.ocbPassword = discountInfo.ocbInfo.password;
					} else {
						discount.useOcb = false;
					}

					if (!_.isEmpty(discountInfo.tvpInfo)) {
						discount.useTvpoint = true;
						discount.tvpointAmount = discountInfo.tvpInfo.appliedDiscount > 0 ? discountInfo.tvpInfo.appliedDiscount : 0;
					} else {
						discount.useTvpoint = false;
					}

					if (!_.isEmpty(discountInfo.bPointInfo)) {
						discount.useBpoint = true;
					} else {
						discount.useBpoint = false;
					}
				} else {
					// 쿠폰, BPoint 할인만 있는 경우

					// Setting default data
					discount.yn_coupon = 'n';
					discount.yn_bpoint = 'n';

					let totalDiscount = Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE);
					if (!_.isEmpty(discountInfo.couponInfo)) {
						discount.yn_coupon = 'y';
						discount.no_coupon = discountInfo.couponInfo.couponNo;
						discount.amt_discount = discountInfo.couponInfo.discount;
						totalDiscount = totalDiscount - discountInfo.couponInfo.discount;
					}

					if (!_.isEmpty(discountInfo.bPointInfo)) {
						const useBpoint = totalDiscount > discountInfo.bPointInfo.usablePoints
							? totalDiscount - discountInfo.bPointInfo.usablePoints : totalDiscount;
						discount.yn_bpoint = 'y';
						discount.amt_bpoint = useBpoint;
						totalDiscount = totalDiscount - useBpoint;
					}

					discount.amt_sale = totalDiscount;
					discount.totalPrice = (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount) * 1.1;
				}
			}

			funcPurchase({ mode: mode, data: DATA_SCS, discountInfo: discount });
		}
	}

	billTypeKeyDown = (keyCode, targetPayment, tpIndex) => {
		let bShowOptionView, arrTargetpayment = this.state.DATA_SCS.PROD_INFO.TARGET_PAYMENT.split(",");
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
			this.setFocus('buyBillBtnList');
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

	cbBPointRegist = (info) => {
		console.log("cbBPointRegist: ", info);
		this.updateDiscountInfo();
	}

	cbOkCashManage = (info) => {
		console.log("cbOkCashManage: ", info);
		this.updateDiscountInfo();

	}

	cbTmembership = (info) => {
		console.log("cbTmembership: ", info);
		this.updateDiscountInfo();
	}

	updateDiscountInfo = () => {
		// BPoint구매는 할인 수단 미노출
		let param = {
			pid: this.state.DATA_SCS.PROD_INFO.PROD_DTL.PID,
			price: this.state.DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE,
			ptype: this.state.DATA_SCS.PTYPE,
			pTargetPayment: '90'
		};
		const requestSCS003 = SCS.request003(param);
		const requestEPS401 = EPS.request401({
			productId: this.state.DATA_SCS.PROD_INFO.PROD_DTL.PID
		});
		const requestEPS300 = EPS.request300({});
		Promise.all([requestSCS003, requestEPS401, requestEPS300]).then((value) => {
			console.log('success', value);

			const { focusView, focusIdx } = this.state;
			let DATA_DISCOUNT = value[0];
			if (DATA_DISCOUNT.result !== '0000') {
				Core.inst().showToast(DATA_DISCOUNT.result, DATA_DISCOUNT.reason);
			}

			let i, selectedCouponNo = "";
			let discountInfo = {
				totalDiscount: 0,
				couponInfo: {},
				tmsInfo: {},
				ocbInfo: {},
				bPointInfo: {},
				tvpInfo: {}
			};
			let selectedInfo = {	//초기화
				"01": 0,
				"02": 0,	// T membership
				"03": 0,
				"04": 0,	// OK cashbag
				"05": 0		// TV Point
			};

			const price = Number(this.state.DATA_SCS.PROD_INFO.PROD_DTL.PRICE);

			// Coupon
			DATA_DISCOUNT.COUPON_INFO = {};
			DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];

			if (value[1].result === '0000') {
				let resultCoupon = value[1].coupons.coupon;
				if (resultCoupon.length > 0) {
					for (i = 0; i < resultCoupon.length; i++) {
						const couponData = {
							couponNo: resultCoupon[i].couponNo,
							couponType: resultCoupon[i].couponType,
							masterNo: resultCoupon[i].masterNo,
							title: resultCoupon[i].title
						}
						DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.push(couponData);
						if (i === 0) {
							selectedCouponNo = resultCoupon[i].couponNo;
							selectedInfo[DISCOUNT_COUPON] = 1;
							discountInfo.couponInfo = DATA_DISCOUNT.COUPON_INFO.COUPON_LIST[i];
						}
					}
				}
			}

			// Reset DISCOUNT Info
			DATA_DISCOUNT.BPOINT_INFO = {};
			DATA_DISCOUNT.TMS_INFO.bLoaded = false;
			DATA_DISCOUNT.OCB_INFO = {};
			DATA_DISCOUNT.OCB_INFO.bLoaded = false;
			DATA_DISCOUNT.OCB_INFO.OCB_LIST = {};

			if (value[2].result === '0000') {
				// BPoint
				DATA_DISCOUNT.BPOINT_INFO.usableBpoints = value[2].usableBpoints;
				if (value[2].usableBpoints > 0) {
					selectedInfo[DISCOUNT_B_POINT] = 1;
					discountInfo.bPointInfo.usablePoints = Number(value[2].usableBpoints);
				}

				// T Membership
				if (value[2].tmembership !== null) {
					DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "Y";
					DATA_DISCOUNT.TMS_INFO.cardNo = value[2].tmembership.cardNo;
				} else {
					selectedInfo[DISCOUNT_TMS] = 0;
					DATA_DISCOUNT.TMS_INFO.TMS_SAVED_CARD_YN = "N";
					DATA_DISCOUNT.TMS_INFO.cardNo = "";
				}

				// OK Cashbag
				for (let i = 0; i < value[2].ocbList.ocb.length; i++) {
					if (value[2].ocbMasterSequence === value[2].ocbList.ocb[i].sequence) {
						DATA_DISCOUNT.OCB_INFO.OCB_LIST = value[2].ocbList.ocb[i];
						break;
					}
				}

				//TV Point
				DATA_DISCOUNT.TVP_INFO = value[2].tvpoint;
				DATA_DISCOUNT.TVP_INFO.bLoaded = false;

				// TV PAY
				DATA_DISCOUNT.TVPAY_INFO = value[2].tvpay;
			} else {
				// error
				Core.inst().showToast(value[2].result, value[2].reason);
				DATA_DISCOUNT.TARGET_DISCOUNT = "NO";
			}

			// 쿠폰 리스트가 있는 경우, 선택된 쿠폰의 상세를 가져온다.
			if (value[1].result === '0000' && value[1].coupons.coupon.length > 0) {
				EPS.request402({ couponNo: selectedCouponNo })
					.then(data => {
						if (data.result === '0000') {
							let resultOk = false;
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
									discountInfo.couponInfo.discount = discount;
									break;
								}
							}
							if (!resultOk) {
								selectedCouponNo = "";
								DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
								DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
								selectedInfo[DISCOUNT_COUPON] = 0;
								discountInfo.couponInfo = {};
							}

							this.setState({
								DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo
								, selectedCouponNo: selectedCouponNo, discountInfo: discountInfo, focusView: this.arrangedFocusList.length - 1
							});
						} else {
							Core.inst().showToast(data.result, data.reason);
							selectedCouponNo = "";
							DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
							DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
							selectedInfo[DISCOUNT_COUPON] = 0;
							discountInfo.couponInfo = {};
							this.setState({
								DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo
								, selectedCouponNo: selectedCouponNo, discountInfo: discountInfo
							});
						}
						this.setFocus(focusView, focusIdx);
					});
			} else {
				selectedCouponNo = "";
				DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
				DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
				selectedInfo[DISCOUNT_COUPON] = 0;
				discountInfo.couponInfo = {};
				this.setState({
					DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo
					, selectedCouponNo: selectedCouponNo, discountInfo: discountInfo
				});
				this.setFocus(focusView, focusIdx);
			}
		});
	}

	/**
	 * type
	 * view
	 * idx
	 */
	optionListKeyDown = async (obj) => {
		const activeView = obj.activeView;
		let param;
		let { DATA_DISCOUNT } = this.state;
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
								Core.inst().showPopup(<CouponRegist />, {}, this.cbCouponRegist);
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
								const { DATA_SCS, selectedCouponNo } = this.state;
								Core.inst().showPopup(<BillCoupon />, { pid: DATA_SCS.PROD_INFO.PROD_DTL.PID, selectedCouponNo: selectedCouponNo }, this.callbackBillCoupon);
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
				case "03":
					//B포인트 등록하기 팝업으로 이동
					param = {
						title: '할인수단 초기화 안내',
						desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
						btns: ["확인", "취소"]
					}
					Core.inst().showPopup(<PopupConfirm />, param, (info) => {
						if (info.result) {
							Core.inst().showPopup(<BpointRegist />, {}, this.cbBPointRegist);
						}
					});
					break;
				case "04":
					// OK캐시백 등록하기 팝업으로 이동
					param = {
						title: '할인수단 초기화 안내',
						desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
						btns: ["확인", "취소"]
					}
					Core.inst().showPopup(<PopupConfirm />, param, (info) => {
						if (info.result) {
							Core.inst().showPopup(<OkCashManage />, {}, this.cbOkCashManage);
						}
					});
					break;
				case "05":
					// TV포인트 화면으로 이동
					const url = DATA_DISCOUNT.TVP_INFO.tvpoint.url + "?termId=" + DATA_DISCOUNT.TVP_INFO.tvpoint.id;
					StbInterface.openPopupTV('tvPoint', url, this.callbackTVPoint);
					break;
				default:
					break;
			}
		} else {
			// Select List
			const { DATA_SCS } = this.state;
			let { selectedInfo, discountInfo } = this.state;

			// 버튼 체크 값 변경
			if (!obj.disabled) {
				selectedInfo[obj.type] = selectedInfo[obj.type] === 0 ? 1 : 0;
			}

			switch (obj.type) {
				case DISCOUNT_B_POINT:
					if (Number(DATA_DISCOUNT.BPOINT_INFO.usableBpoints) > 0) {
						if (selectedInfo[obj.type] === 1) {
							// 할인 적용
							if (selectedInfo[obj.type] === 1 && Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
								selectedInfo[obj.type] = 0;
								Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
							} else {
								discountInfo.bPointInfo.usablePoints = Number(DATA_DISCOUNT.BPOINT_INFO.usableBpoints);
							}
						} else {
							// 할인 해제
							discountInfo.bPointInfo = {};
						}
					}
					break;
				case DISCOUNT_COUPON:
					if (Number(DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length) > 0) {
						if (selectedInfo[obj.type] === 1) {
							// 할인 적용
							if (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
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
								Core.inst().showPopup(<TmembershipRegist />, {}, this.cbTmembership);
							}
						});
					} else if (!DATA_DISCOUNT.TMS_INFO.bLoaded) {
						const data = await EPS.request501({ productId: DATA_SCS.PROD_INFO.PROD_DTL.PID });
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
							
							if (selectedInfo[obj.type] === 1 && Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
								selectedInfo[obj.type] = 0;
								Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
							} else {
								discountInfo.tmsInfo.discountRate = DATA_DISCOUNT.TMS_INFO.discountRate;
								discountInfo.tmsInfo.balance = DATA_DISCOUNT.TMS_INFO.balance;
								discountInfo.tmsInfo.cardNo = DATA_DISCOUNT.TMS_INFO.cardNo;
								discountInfo.tmsInfo.grade = DATA_DISCOUNT.TMS_INFO.grade;
							}
						} else if (data.result !== '0000') {
							selectedInfo[obj.type] = 0;
							Core.inst().showToast(data.result, data.reason);
						} else if (data.discountRate === undefined) {
							selectedInfo[obj.type] = 0;
							Core.inst().showToast('잠시후 다시 시도해 주세요.');
						} else {
							selectedInfo[obj.type] = 0;
							Core.inst().showToast(data.result, data.reason);
						}
					} else {
						// 할인 추가
						if (selectedInfo[obj.type] === 1) {
							if (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
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
				case DISCOUNT_OCB:
					if (!_.isEmpty(DATA_DISCOUNT.OCB_INFO.OCB_LIST)) {
						if (DATA_DISCOUNT.OCB_INFO.bLoaded) {
							// 카드 할인 적용
							if (Number(DATA_DISCOUNT.OCB_INFO.OCB_LIST.point) > 0) {
								if (selectedInfo[obj.type] === 1) {
									if (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
										selectedInfo[obj.type] = 0;
										Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
									} else {
										discountInfo.ocbInfo.usablePoints = Number(DATA_DISCOUNT.OCB_INFO.OCB_LIST.point);
									}
								} else {
									discountInfo.ocbInfo = {};
								}
							}
						} else {
							// 카드 정보 가져오기
							let inquiry = (password, callback) => {
								EPS.request552({
									transactionId: 'Inquiry_of_Ok_cashbag_info',
									sequence: DATA_DISCOUNT.OCB_INFO.OCB_LIST.sequence,
									password
								})
								.then(data => {
									let point = 0;
									if (data.result === '0000') {
										point = Number(data.ocb.balance);
										callback.close({ result: true, point: point });
									} else {
										//callback.show({ result: false, point: point });
										//Core.inst().showToast(data.result, data.reason);
										callback.showErrorMessage(PWD_FAIL_MSG);
									}
								})
							};

							const data = {
								type: 'OkCashBag',
								title: 'OK캐쉬백 할인 적용',
								strDesc: 'OK캐쉬백 비밀번호를 입력해 주세요.',
								checkFailMessage: PWD_FAIL_MSG,
								sequence: DATA_DISCOUNT.OCB_INFO.OCB_LIST.sequence,
								cardNum: DATA_DISCOUNT.OCB_INFO.OCB_LIST.cardNo,
								btns: ['적용', '취소'],
								subTitle: '대표 카드',
								inquiry
							}
							Core.inst().showPopup(<BuyBillOkCashBag />, data, this.callbackOCB);
						}

					} else {
						//OCB 카드 등록 팝업으로 이동(myBtv)
						param = {
							title: '할인수단 초기화 안내',
							desc: '해당 메뉴 실행 시\n고객님의 할인수단 선택 상태가 초기화됩니다.\n계속 진행하시겠습니까?',
							btns: ["확인", "취소"]
						}
						Core.inst().showPopup(<PopupConfirm />, param, (info) => {
							if (info.result) {
								Core.inst().showPopup(<OkCashRegist />, {}, this.cbOkCashManage);
							}
						});
					}
					break;
				case DISCOUNT_TVP:
					if (!_.isEmpty(DATA_DISCOUNT.TVP_INFO) && DATA_DISCOUNT.TVP_INFO.tvpoint.useTvpoint) {
						if (DATA_DISCOUNT.TVP_INFO.bLoaded) {
							if (selectedInfo[obj.type] === 1) {
								// 할인 적용
								if (Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
									selectedInfo[obj.type] = 0;
									Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
								} else {
									discountInfo.tvpInfo.usablePoints = DATA_DISCOUNT.TVP_INFO.tvpoint.balance;
								}
							} else {
								// 할인 취소
								discountInfo.tvpInfo = {};
							}
						} else {
							const eps601 = await EPS.requestEPS601({ transactionId: "AAA" });
							if (eps601.result === '0000') {
								if (eps601.tvpoint.useTvpoint) {
									DATA_DISCOUNT.TVP_INFO.bLoaded = true;
									DATA_DISCOUNT.TVP_INFO.tvpoint = eps601.tvpoint;
									if (DATA_DISCOUNT.TVP_INFO.tvpoint.balance <= 0) {
										selectedInfo[obj.type] = 0;
									} else {
										if (selectedInfo[obj.type] === 1 && Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE) + discountInfo.totalDiscount <= 0) {
											selectedInfo[obj.type] = 0;
											Core.inst().showToast('할인금액이 구매금액보다 큽니다.\n선택되어 있는 다른 할인 수단을 해제해 주세요.');
										} else {
											selectedInfo[obj.type] = 1;
											discountInfo.tvpInfo.usablePoints = DATA_DISCOUNT.TVP_INFO.tvpoint.balance;
										}
									}
								} else {
									DATA_DISCOUNT.TVP_INFO.bLoaded = false;
								}
							} else {
								Core.inst().showToast(eps601.result, eps601.reason);
								selectedInfo[DISCOUNT_TVP] = 0;
							}
						}
					} else {
						// 회원가입
						const url = DATA_DISCOUNT.TVP_INFO.tvpoint.url + "?termId=" + DATA_DISCOUNT.TVP_INFO.tvpoint.id;
						StbInterface.openPopupTV('tvPoint', url, this.callbackTVPoint);
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
		let couponNo = info.couponNo;
		EPS.request402({ couponNo: couponNo })
			.then(data => {
				let DATA_DISCOUNT = cloneDeep(this.state.DATA_DISCOUNT);
				if (data.result === '0000') {
					let resultOk = false;
					const price = Number(this.state.DATA_SCS.PROD_INFO.PROD_DTL.PRICE);
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

					this.setState({ selectedCouponNo: couponNo, DATA_DISCOUNT: DATA_DISCOUNT });
				} else {
					Core.inst().showToast(data.result, data.reason);
					DATA_DISCOUNT.COUPON_INFO = {};	//쿠폰 정보 리셋
					DATA_DISCOUNT.COUPON_INFO.COUPON_LIST = [];
					this.setState({ selectedCouponNo: "", DATA_DISCOUNT: DATA_DISCOUNT });
				}
			});
	}

	callbackOCB = (info) => {
		console.log('result: ' + info.result + ', point: ' + info.point);
		// Update information of OKCashBag 
		const { DATA_DISCOUNT } = this.state;
		let { discountInfo, selectedInfo } = this.state;
		selectedInfo[DISCOUNT_OCB] = 0;
		if (info.result) {
			DATA_DISCOUNT.OCB_INFO.bLoaded = true;
			DATA_DISCOUNT.OCB_INFO.OCB_LIST.point = info.point;

			// point가 0 이상일 시, 체크되도록 기능 추가
			if (DATA_DISCOUNT.OCB_INFO.OCB_LIST.point > 0) {
				selectedInfo[DISCOUNT_OCB] = 1;
				discountInfo.ocbInfo.usablePoints = Number(DATA_DISCOUNT.OCB_INFO.OCB_LIST.point);
			}
		}
		this.setState({ DATA_DISCOUNT: DATA_DISCOUNT, selectedInfo: selectedInfo, discountInfo: discountInfo });
	}

	callbackTVPoint = async (info) => {
		if (info.closed === 'Y') {
			let DATA_DISCOUNT = cloneDeep(this.state.DATA_DISCOUNT);
			let selectedInfo = cloneDeep(this.state.selectedInfo);
			const eps601 = await EPS.requestEPS601({ transactionId: "AAA" });
			if (eps601.result === '0000') {
				if (eps601.tvpoint.useTvpoint) {
					DATA_DISCOUNT.TVP_INFO.bLoaded = true;
					DATA_DISCOUNT.TVP_INFO.tvpoint = eps601.tvpoint;
					if (DATA_DISCOUNT.TVP_INFO.tvpoint.balance <= 0) {
						selectedInfo[DISCOUNT_TVP] = 0;
					} else {
						selectedInfo[DISCOUNT_TVP] = 1;
					}
				} else {
					DATA_DISCOUNT.TVP_INFO.bLoaded = false;
				}
			} else {
				Core.inst().showToast(eps601.result, eps601.reason);
				selectedInfo[DISCOUNT_TVP] = 0;
			}
			this.setState({ selectedInfo: selectedInfo, DATA_DISCOUNT: DATA_DISCOUNT });
		}
	}

	checkdiscountInfo() {
		const { DATA_SCS, typeSelected } = this.state;
		let discountInfo, leftPrice;
		if (typeSelected !== constants.PAYMENT_TYPE_CD.BILL) {
			discountInfo = {
				totalDiscount: 0,
				couponInfo: {},
				tmsInfo: {},
				ocbInfo: {},
				bPointInfo: {},
				tvpInfo: {}
			}
		} else {
			// 결제 적용 순서
			// 쿠폰 > T멤버쉽 > OCB > TVP > Bpoint
			const PRICE = Number(DATA_SCS.PROD_INFO.PROD_DTL.PRICE);
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

			if (!_.isEmpty(discountInfo.ocbInfo)) {
				leftPrice = PRICE + totalDiscount;
				if (leftPrice > 0) {
					const usablePoints = Math.floor(Number(discountInfo.ocbInfo.usablePoints) * 10 / 11);
					const usePoint = leftPrice > usablePoints ? usablePoints : leftPrice;
					totalDiscount = totalDiscount - usePoint;
					discountInfo.ocbInfo.appliedDiscount = usePoint;
				} else {
					discountInfo.ocbInfo = {};
					this.state.selectedInfo[DISCOUNT_OCB] = 0;
				}
			}

			if (!_.isEmpty(discountInfo.tvpInfo)) {
				leftPrice = PRICE + totalDiscount;
				if (leftPrice > 0) {
					const usablePoints = Math.floor(Number(discountInfo.tvpInfo.usablePoints) * 10 / 11);
					const usePoint = leftPrice > usablePoints ? usablePoints : leftPrice;
					totalDiscount = totalDiscount - usePoint;
					discountInfo.tvpInfo.appliedDiscount = usePoint;
				} else {
					discountInfo.tvpInfo = {};
					this.state.selectedInfo[DISCOUNT_TVP] = 0;
				}
			}

			if (!_.isEmpty(discountInfo.bPointInfo)) {
				leftPrice = PRICE + totalDiscount;
				if (leftPrice > 0) {
					const useBpoint = leftPrice > discountInfo.bPointInfo.usablePoints
						? discountInfo.bPointInfo.usablePoints : leftPrice;
					totalDiscount = totalDiscount - useBpoint;
					discountInfo.bPointInfo.appliedDiscount = useBpoint;
				} else {
					discountInfo.bPointInfo = {};
					this.state.selectedInfo[DISCOUNT_B_POINT] = 0;
				}
			}
			this.state.discountInfo = discountInfo;
			discountInfo.totalDiscount = totalDiscount;
		}
		return discountInfo;
	}

	goToPurchaseTvPay() {
		// 신용카드 결제
		const { DATA_SCS, DATA_DISCOUNT } = this.state;
		if (DATA_SCS.PTYPE === constants.PRD_TYP_CD.PPM) {
			Core.inst().showPopup(<BillCertify />, { mode: 'mode_ppm' }, (info) => {
				if (info.result) {
					const paramData = {
						PRICE: DATA_SCS.PROD_INFO.PROD_DTL.PRICE,
						PNAME: DATA_SCS.PROD_INFO.PROD_DTL.PNAME,
						tvpayId: DATA_DISCOUNT.TVPAY_INFO.tvpay.id,
						tvpayUrl: DATA_DISCOUNT.TVPAY_INFO.tvpay.url
					}
					CTSInfo.callTVPayForPurchase(paramData, this.callbackTVPay);
				}
			});
		} else {
			const paramData = {
				PRICE: DATA_SCS.PROD_INFO.PROD_DTL.PRICE,
				PNAME: DATA_SCS.PROD_INFO.PROD_DTL.PNAME,
				tvpayId: DATA_DISCOUNT.TVPAY_INFO.tvpay.id,
				tvpayUrl: DATA_DISCOUNT.TVPAY_INFO.tvpay.url
			}
			CTSInfo.callTVPayForPurchase(paramData, this.callbackTVPay);
		}
	}

	goToPurchasePhone() {
		// 휴대폰 결제
		let { mode, DATA_SCS } = this.state;
		let certifyMode = 'mode_phone';
		if (DATA_SCS.PTYPE === constants.PRD_TYP_CD.PPM) {
			certifyMode = 'mode_all';
		}
		Core.inst().showPopup(<BillCertify />, { mode: certifyMode }, (info) => {
			if (info.result) {
				const data = {
					mode: mode,
					PID: DATA_SCS.PROD_INFO.PROD_DTL.PID,
					V_PRICE: DATA_SCS.PROD_INFO.PROD_DTL.V_PRICE
				}
				Core.inst().showPopup(<BillPhoneCertify />, { data: data, DATA_API: DATA_SCS });
			}
		});
	}

	normalRender() {
		const { DATA_DISCOUNT } = this.state;

		if (DATA_DISCOUNT === undefined) {
			return null;
		}

		const totalDiscountInfo = this.checkdiscountInfo();
		let optionData = [];

		if (!_.isEmpty(DATA_DISCOUNT.TARGET_DISCOUNT) && DATA_DISCOUNT.TARGET_DISCOUNT !== 'NO') {
			let appliedDiscount;
			conuntOptionList = DATA_DISCOUNT.TARGET_DISCOUNT.split(",");
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
						if (DATA_DISCOUNT.COUPON_INFO.COUPON_LIST.length < 1) {
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
									appliedDiscount = totalDiscountInfo.couponInfo.appliedDiscount > 0 ? totalDiscountInfo.couponInfo.appliedDiscount : 0;
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
					case DISCOUNT_B_POINT:
						data.btnTitle = "등록";
						data.title = "B포인트";
						if (Number(DATA_DISCOUNT.BPOINT_INFO.usableBpoints) <= 0) {
							data.disabled = true;
							data.desc = "보유 포인트가 없습니다.";
							data.discount = 0;
						} else {
							data.disabled = false;
							appliedDiscount = totalDiscountInfo.bPointInfo.appliedDiscount > 0 ? totalDiscountInfo.bPointInfo.appliedDiscount : 0;
							data.discount = numberWithCommas(Number(appliedDiscount));
							data.desc = "-" + data.discount + "P / " + numberWithCommas(Number(DATA_DISCOUNT.BPOINT_INFO.usableBpoints)) + "P";
						}
						break;
					case DISCOUNT_OCB:
						data.btnTitle = "설정";
						data.title = "OK 캐쉬백";
						if (!_.isEmpty(DATA_DISCOUNT.OCB_INFO.OCB_LIST)) {
							data.disabled = false;
							if (DATA_DISCOUNT.OCB_INFO.bLoaded) {
								if (Number(DATA_DISCOUNT.OCB_INFO.OCB_LIST.point) <= 0) {
									data.disabled = true;
									data.desc = "보유 포인트가 없습니다.";
									data.discount = 0;
								} else {
									appliedDiscount = totalDiscountInfo.ocbInfo.appliedDiscount > 0 ? totalDiscountInfo.ocbInfo.appliedDiscount : 0;
									data.discount = numberWithCommas(Number(appliedDiscount));
									data.desc = "-" + data.discount + "P / " + numberWithCommas(Number(DATA_DISCOUNT.OCB_INFO.OCB_LIST.point)) + "P";
								}
							} else {
								data.desc = "선택하여 할인 포인트 조회";
								data.discount = "0";
							}
						} else {
							data.disabled = true;
							data.desc = "선택하여 카드 등록";
							data.discount = "0";
						}
						break;
					case DISCOUNT_TVP:
						data.btnTitle = "충전";
						data.title = "TV포인트";
						
						if (!_.isEmpty(DATA_DISCOUNT.TVP_INFO)) {
							if (DATA_DISCOUNT.TVP_INFO.tvpoint.useTvpoint === false) {
								data.disabled = true;
								data.desc = "선택하여 TV포인트 가입";
								data.discount = 0;
							} else if (DATA_DISCOUNT.TVP_INFO.bLoaded) {
								if (Number(DATA_DISCOUNT.TVP_INFO.tvpoint.balance) <= 0) {
									data.disabled = true;
									data.desc = "보유 포인트가 없습니다.";
									data.discount = 0;
								} else {
									appliedDiscount = totalDiscountInfo.tvpInfo.appliedDiscount > 0 ? totalDiscountInfo.tvpInfo.appliedDiscount : 0;
									data.discount = numberWithCommas(Number(appliedDiscount));
									data.desc = "-" + data.discount + "P / " + numberWithCommas(Number(DATA_DISCOUNT.TVP_INFO.tvpoint.balance)) + "P";
								}
							} else {
								data.desc = "선택하여 할인 포인트 조회";
								data.discount = 0;
							}
						} else {
							data.desc = "선택하여 할인 포인트 조회";
							data.discount = 0;
						}
						break;
					default:
						break;
				}
				optionData.push(data);
			}
		}

		this.state.optionData = optionData;

		let paymentType = [];
		let targetpayment = this.state.DATA_SCS.PROD_INFO.TARGET_PAYMENT.split(",");
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

		const { mode, activeView, focusIdx, selectedInfo, DATA_SCS, typeSelected, bShowOptionView } = this.state;
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>{this.state.DATA_SCS.PTYPE_STR}구매</span>
					<div>{this.state.DATA_SCS.PROD_INFO.PROD_DTL.PNAME}</div>
					{DATA_SCS.enterance === 2 &&
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
							<div className="paymentDetail">
								{/* 6/12 detailCon, select class 추가 */}
								{bShowOptionView &&
								<div id="optionList" className="detailCon optionWrap select">
									<OptionList data={optionData} activeView={activeView} focusIdx={focusIdx} selectedInfo={selectedInfo} optionListKeyDown={this.optionListKeyDown} setFm={this.setFm} />
									{DATA_SCS.PTYPE === constants.PRD_TYP_CD.PPM &&
										<p className="payCaution">결제 후에는 취소/환불이 되지 않습니다. 단, 콘텐츠가 광고된 내용과 다른
										경우 구매일로부터 3개월 이내 취소가 가능합니다. 콘텐츠 시청 시 광고를
									포함할 수 있습니다.<br />
											T멤버십 할인은 월정액 상품구매시 최초 1회 첫달 50% 할인됩니다.
											(월정액 교육 장르, 성인장르, 부가서비스 상품 및 일부제휴월정액 상품은
									제외됩니다.)<br />
											B포인트는 월정액 자동 차감 설정여부에 따라 차감이 매월 2~3일 전월요금 계산 시 점에 잔액이 남아있는 경우만 차감됩니다.</p>
									}
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
						</div>
					}
					<div className="right">
						<PurchaseDetailView mode={mode} data={DATA_SCS} totalDiscount={totalDiscountInfo.totalDiscount} selectedInfo={selectedInfo} />
						<div id="buyBillBtnList"><PurchaseBtnView /></div>
						{DATA_SCS.PTYPE !== constants.PRD_TYP_CD.PPM &&
						<p>결제 후에는 취소/환불이 되지 않습니다. 단, 콘텐츠가 광고된 내용과 다른 경우 구매일로부터 3개월 이내 취소가 가능합니다. 콘텐츠 시청 시 광고를 포함할 수 있습니다.</p>
						}
					</div>
				</div>
				{/*arrowClass 는 화살표 위치를 나타내주는 class가 들어감,
				arrowClass="" 빈값일때 default는 down center
				우좌측 여백 25% 남기고 위치할 경우 left, right
				최우측/최좌측의 경우 leftleft, rightright
				화살표가 없으면 none*/}
				{this.state.toolTip1 && <ToolGuide guideTitle="신용카드, 휴대폰 결제가 새롭게 추가되었어요." top="171" left="229" aniTime="3" delayTime="2" arrowClass="" />}
				{this.state.toolTip2 && <ToolGuide guideTitle="TV포인트로 할인 혜택을 받을 수 있어요." top="815" left="160" aniTime="3" delayTime="0" arrowClass="left" />}
			</div>
		)
	}

	noOptionRender() {
		const { mode, DATA_SCS } = this.state;
		let subject = "", title = "";

		switch (mode) {
			case MODE_PPP:
				subject = "패키지 구매";
				title = DATA_SCS.PROD_INFO.PROD_DTL.PNAME;
				break;
			case MODE_VODPLUS:
				subject = "상품 패키지 구매";
				title = DATA_SCS.PROD_INFO.PROD_DTL.PNAME;
				break;
			case MODE_BPOINT:
				subject = "B포인트 충전";
				title = DATA_SCS.title;
				break;
			default:
				break;
		}
		return (
			<div className="buyWrap">
				<div className="buyTop">
					<span>{subject}</span>
					<div>{title}</div>
				</div>
				<div className="buyContent buyBill">
					<div className="right">
						<PurchaseDetailNoOptionView mode={mode} data={DATA_SCS} />
						<div id="buyBillBtnList"><PurchaseBtnView /></div>
						<p>결제 후에는 취소/환불이 되지 않습니다. 단, 콘텐츠가 광고된 내용과 다른 경우 구매일로부터 3개월 이내 취소가 가능합니다. 콘텐츠 시청 시 광고를 포함할 수 있습니다.</p>
					</div>
				</div>
			</div>
		)
	}
	render() {
		console.log('render');

		if (this.state.viewMode === VIEW_NO_DISCOUNT) {
			return this.noOptionRender();
		} else {
			return this.normalRender();
		}

	}
}

class ToolGuide extends React.Component {
	constructor(props) {
		super(props);

		const GUIDETITLE = this.props.guideTitle;
		const TOP = this.props.top;
		const LEFT = this.props.left;
		const ANITIME = this.props.aniTime;
		const DELAYTIME = this.props.delayTime;
		const ARROWClASS = this.props.arrowClass;

		this.state = {
			title: GUIDETITLE,
			top: TOP,
			left: LEFT,
			aniTime: ANITIME,
			delay: DELAYTIME,
			arrowClass: ARROWClASS
		};
	}

	render() {
		return (
			<div className={`${this.state.aniTime > 0 ? 'toolGuideWrap' : 'toolGuideWrap aniNone'} ${this.state.arrowClass}`} style={{ "top": this.state.top + "px", "left": this.state.left + "px", "--aniTime": this.state.aniTime, "--delayTime": this.state.delay }}>
				<span className="toolguide">
					<span className="text">{this.state.title}</span>
				</span>
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
			id: 'billType',
			moveSelector: '.optionWrap',
			focusSelector: '.csFocus',
			row: 1,
			col: data.length,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: data.length - 1,
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
			this.setState({ activeView: VIEW_BTN });
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
		const { active, idx, activeView } = this.state;
		const { data, selectedInfo } = this.props;

		const list = data.map((data, i) => {
			let discountWrapClass = active && idx === i ? 'csFocusList discountWrap focus' : 'csFocusList discountWrap';
			let btnClass = active && idx === i && activeView === VIEW_BTN ? 'btnStyle type03 changeBtn focusOn' : 'btnStyle type03 changeBtn';
			let listClass = active && idx === i && activeView === VIEW_LIST ? 'checkStyle1 focusOn' : 'checkStyle1';
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

class PurchaseDetailNoOptionView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0
		};
	}
	render() {
		const { mode, data } = this.props;

		if (mode === MODE_BPOINT) {
			return (
				<div className="optionView">
					<ul>
						<li>
							<span>상품명</span>
							<span className="optionList">B포인트 {numberWithCommas(Number(data.supplyAmount))}P</span>
						</li>
						<li>
							<span>이용기간</span>
							<span className="optionList">{data.expireMessage}</span>
						</li>
					</ul>
					<div className="priceConWrap">
						<div className="priceWrapper">
							<div className="priceCon">
								<span>실제 구매금액 <em>(부가세 포함)</em></span>
								<span className="priceResult">{numberWithCommas(Number(data.totalAmount))}<em>원</em></span>
							</div>
						</div>
					</div>
					<div className="priceConWrap onlyText">
						<p>본 상품은 청구서로만 결제 가능합니다</p>
					</div>
				</div>
			)
		} else {
			const strCLTYN = data.PROD_INFO.PROD_DTL.CLTYN === 'Y' ? '소장' : '일반';
			const strFGQUALITY = getCodeName('RSLU_TYP_CD', data.PROD_INFO.PROD_DTL.FGQUALITY);
			let strVOC_LAG = "";
			if (data.PROD_INFO.PROD_DTL.VOC_LAG === '01') {
				strVOC_LAG = '/우리말';
			} else if (data.PROD_INFO.PROD_DTL.VOC_LAG === '02') {
				strVOC_LAG = '/한글자막';
			}
			return (
				<div className="optionView">
					<ul>
						<li>
							<span>영상옵션</span>
							<span className="optionList">{strCLTYN}/{strFGQUALITY}{strVOC_LAG}</span>
						</li>
						<li>
							<span>시청기간</span>
							<span className="optionList">{data.PROD_INFO.PROD_DTL.DUETIME_PERIOD}/{data.PROD_INFO.PROD_DTL.DUETIME_STR}</span>
						</li>
					</ul>
					<div className="priceConWrap">
						<div className="priceWrapper">
							<div className="priceCon">
								<span>실제 구매금액 <em>(부가세 포함)</em></span>
								<span className="priceResult">{numberWithCommas(Number(data.PROD_INFO.PROD_DTL.V_PRICE))}<em>원</em></span>
							</div>
						</div>
					</div>
					<div className="priceConWrap onlyText">
						<p>본 상품은 청구서로만 결제 가능합니다</p>
					</div>
				</div>
			)
		}
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

		switch (data.PTYPE) {
			case constants.PRD_TYP_CD.PPV:
				if (data.PROD_INFO.CLTYN === 'Y') {
					data.PTYPE_STR = "소장";
				} else {
					data.PTYPE_STR = "일반";
				}
				break;
			case constants.PRD_TYP_CD.PPS:
				data.PTYPE_STR = "시리즈";
				break;
			case constants.PRD_TYP_CD.PPM:
				data.PTYPE_STR = "월정액";
				break;
			default:
				break;
		}
		let strVOC_LAG = "";
		if (data.PROD_INFO.PROD_DTL.VOC_LAG === '01') {
			strVOC_LAG = '/우리말';
		} else if (data.PROD_INFO.PROD_DTL.VOC_LAG === '02') {
			strVOC_LAG = '/한글자막';
		}
		const leftPrice = Number(data.PROD_INFO.PROD_DTL.PRICE) + totalDiscount;
		return (
			<div className="optionView">
				<ul>
					<li>
						<span>영상옵션</span>
						<span className="optionList">{data.PTYPE_STR}/{getCodeName('RSLU_TYP_CD', data.PROD_INFO.PROD_DTL.FGQUALITY)}{strVOC_LAG}</span>
					</li>
					<li>
						<span>시청기간</span>
						<span className="optionList">{data.PROD_INFO.PROD_DTL.DUETIME_PERIOD}/{data.PROD_INFO.PROD_DTL.DUETIME_STR}</span>
					</li>
				</ul>
				<div className="priceConWrap">
					<div className="priceWrapper">
						<div className="priceInner">
							<div className="subPrice">
								<span>상품원가</span>
								<span className="priceValue">{numberWithCommas(data.PROD_INFO.PROD_DTL.PRICE)}<em>원</em></span>
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
								<span className="priceValue">{numberWithCommas(Math.round(leftPrice * 0.1))}<em>원</em></span>
							</div>
						</div>
					</div>
					<div className="priceCon">
						<span>실제 구매금액 <em>(부가세 포함)</em></span>
						<span className="priceResult">{numberWithCommas(leftPrice + Math.round(leftPrice * 0.1))}<em>원</em></span>
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

export default BuyBill;