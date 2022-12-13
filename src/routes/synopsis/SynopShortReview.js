// common
import React from 'react';
import PropTypes from 'prop-types';
import Core from '../../supporters/core';
import appConfig from 'config/app-config.js';
import FM from 'Supporters/navi';
import { SlideType, G2NaviSlider, G2NaviSlideReview } from 'Module/G2Slider';

// utils
import _ from 'lodash';
import synopAPI from './api/synopAPI';

// component
import SynopContentAssessment from "./popup/SynopContentAssessment";
import SynopReviewDetail from "./popup/SynopReviewDetail";
import SynopShortAwardPop from "./popup/SynopShortAwardPop";

// style
import '../../assets/css/routes/synopsis/SynopShortReview.css';


class SynopShortReview extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			slideTo:0,
			reviews: []
		}
		this.anchor = null;
	}

	componentDidMount() {
		this.setAPIcall(this.props);
	}

	setAPIcall = async (data) => {
		const { synopInfo } = data;
		const param = {
			series_id: synopInfo.sris_id
		}
		const rate = await synopAPI.smd005(param).then(result => {
			if (result.result === 'OK') {
				let like = '0';
				if (result.like === '1') {
					like = 'up';
				}
				if (result.dislike === '1') {
					like = 'down';
				}
				return ({like: like});
			}
		}).catch((error) => {
			return 'error';
		});
		
		let rateLike = '0'
		if (rate !== 'error') {
			rateLike = rate.like;
		}
		
		const reviews = this.setSiteReviewData(synopInfo.site_review, rateLike);
		this.setState({
			reviews: reviews
		});
	}

	setSiteReviewData = (review, like) => {
		let reviews = [];
		if (review.prize_history.length !== 0) {
			let prizeItem = [];
			for (let item of review.prize_history) {
				if (item.rep_yn === 'Y') {
					prizeItem = item;
					break;
				}
			}
			// 예외처리 문구 대표수상Y가 없으면 0번째 인덱스로 처리 -_-;
			if (prizeItem.length === 0) {
				prizeItem = review.prize_history[0];
			}
			reviews.push({
				type: 'history',
				site_cd: null,
				awrdc_nm: prizeItem.awrdc_nm,
				prize_yr: prizeItem.prize_yr,
				prize_dts_cts: prizeItem.prize_dts_cts,
				prizeLen: review.prize_history.length
			});
		}
		reviews.push({
			type: 'rate',
			site_cd: null,
			like: like
		});
		reviews.push({
			type: 'btv',
			site_cd: 'btv',
			btv_pnt_info: review.btv_pnt_info,
			site_nm: 'Btv고객호감도'
		});
		review.sites.map((item) => {
			reviews.push({
				type: 'grade',
				site_cd: item.site_cd,
				bas_pnt: item.bas_pnt,
				review_cnt: item.review_cnt,
				avg_pnt: item.avg_pnt,
				site_nm: item.site_nm + '평점'
			});
		});
		review.sites.map((item) => {
			if (item.reviews.length !== 0) {
				reviews.push({
					type: 'review',
					site_cd: item.site_cd,
					prs_nm: item.reviews[0].prs_nm,
					pnt: item.reviews[0].pnt,
					review_ctsc: item.reviews[0].review_ctsc,
					site_nm: item.site_nm + '리뷰'
				});
			}
		});

		return reviews;
	}

	onFocusKeyDownReview = (slideIdx, chlidIdx) => {
		const { synopInfo } = this.props;
		let obj = {
			title: synopInfo.title,
			sris_id: synopInfo.sris_id,
			site_cd: this.state.reviews[chlidIdx].site_cd,
			type: this.state.reviews[chlidIdx].type,
			totalReviews: this.state.reviews,
			btv_pnt_info: synopInfo.site_review.btv_pnt_info,
			bg_img_path: synopInfo.bg_img_path,
			dark_img_yn: synopInfo.dark_img_yn,
		}
		switch(obj.type) {
			case 'history':
				Core.inst().showPopup(<SynopShortAwardPop />, obj, null);
			break;
			case 'rate':
				obj.like = this.state.reviews[chlidIdx].like;
				Core.inst().showPopup(<SynopContentAssessment />, obj, this.callbackAssessment);
			break;
			case 'btv': case 'grade': case 'review':
				Core.inst().showPopup(<SynopReviewDetail />, obj, this.callbackReviewDetail);
			break;
		}
	}

	// 리뷰 콜백
	callbackReviewDetail = (reviewNm) => {
		const { setFocus } = this.props;
		let idx = 0;
		for (const [index, value] of this.state.reviews.entries()) {
			if (value.site_nm === reviewNm) {
				idx = index;
			}
		}
		setFocus({id: 'review', childIdx: idx});
	}
	
	// 평가하기 콜백
	callbackAssessment = (rate) => {
		const { synopInfo, setFm } = this.props;
		const reviews = this.setSiteReviewData(synopInfo.site_review, rate);
		this.setState({
			reviews: reviews
		}, () => {
			this.slideFm.addFocus();
		});
	}

	setFm = (key, fm) => {
		const { setFm } = this.props;
		this.slideFm = fm;
		setFm(key, this.slideFm);
	}

	render() {
		const { reviews } = this.state;
		const { synopInfo, setFm, scrollTo } = this.props;
		return (
			<G2NaviSlider
				id={`review`}
				key={0}
				title={'평점 & 리뷰'}
				type={SlideType.SYNOPSHORT_REVIEW}
				scrollTo={scrollTo}
				onSelectMenu={null}
				onSlideFocus={null}
				onSelectChild={this.onFocusKeyDownReview}
				rotate={true}
				bShow={true}
				setFm={this.setFm}
				isShowCount={false}
			>
			{
				reviews.map((slide, idx2) => {
					return (
						<G2NaviSlideReview
							key={idx2} idx={idx2}
							item={slide}
							slideType={slide.type}
							espdId={slide.epsd_id}
							srisId={null}
							menuId={null}
							onSelect={null}
							onClick={null}
						/>
					)
				})
			}
			</G2NaviSlider>
		)
	}

};

export default SynopShortReview;