// common
import React, { Fragment } from 'react';
import IMG from 'react-image';
import appConfig from 'Config/app-config';
// import Core from '../../supporters/core';
import FM from 'Supporters/navi';
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD, G2NaviSlideMyPeople, G2NaviPeopleSlider, G2NaviSlideSynopVOD } from 'Module/G2Slider';

// utils
import _ from 'lodash';
import synopAPI from './api/synopAPI';
import Utils from '../../utils/utils';

// style
import '../../assets/css/routes/synopsis/SynopShort.css';

// component
import SynopShortTop from './SynopShortTop.js';
import SynopShortReview from './SynopShortReview.js';
import SynopCwSlides from './components/SynopCwSlides';

class SynopShort extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cwRelation: !_.isEmpty(this.props.data.cwRelation) ? this.props.data.cwRelation : []
		}
	}

	componentDidMount() {
		const { param, data, setFm } = this.props;
		const fm = new FM({
			id: 'top',
			type: 'ELEMENT',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onFocusKeyDownTop,
		})
		setFm('top', fm);
		if (_.isEmpty(this.state.cwRelation)) {
			this.setSynopAPI(param, data);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.data.synopsis.contents.cw_call_id_val !== this.props.data.synopsis.contents.cw_call_id_val) {
			const { param, data } = nextProps;
			this.setSynopAPI(param, data);
		}
	}

	setSynopAPI = (param, data) => {
		let paramData = {
			menu_id: param.menu_id,
			cw_call_id_val: data.synopsis.contents.cw_call_id_val,
			type: 'all',
			epsd_rslu_id: !_.isEmpty(data.synopsis.contents.epsd_rslu_info) ? data.synopsis.contents.epsd_rslu_info[0].epsd_rslu_id : '',
			epsd_id: data.synopsis.contents.epsd_id
		}

		synopAPI.xpg012(paramData).then(result => {
			if (!_.isEmpty(result) && (!_.isEmpty(result.related_info) || !_.isEmpty(result.relation_contents))) {

			} else {
				result = [];
			}
			this.props.setCwHistory(result);
			this.setState({
				cwRelation: result
			})
		});
	}

	onFocusKeyDownTop = (evt) => {
		const { onSelectTop } = this.props;
		if (typeof onSelectTop === 'function') {
			onSelectTop(evt);
		}
	}

	onSelect = (sildeKey, slideIdx, chlidIdx) => {
		// const { onSelect } = this.props;
		this.props.onSelect(sildeKey, slideIdx, chlidIdx);
	}

	render() {
		const { data: { synopsis, metvDirectview }, setFm, scrollTo, isBookmark, buttonObj, setFocus, isGuided } = this.props;
		let peopleList = [];
		let people_type = null;
		let slideContents = [];
		if (!_.isEmpty(synopsis.contents)) {
			if (!_.isEmpty(synopsis.contents.peoples)) {
				for (let item of synopsis.contents.peoples) {
					if (!_.isEmpty(item.img_path)) {
						people_type = SlideType.PEOPLE;
						break;
					} else {
						people_type = SlideType.PEOPLE_NONE;
					}
				}
				// 인물 이미지 없는거 제거
				if (people_type === SlideType.PEOPLE_NONE) {
					peopleList = synopsis.contents.peoples;
				} else {
					for (let item of synopsis.contents.peoples) {
						if (!_.isEmpty(item.img_path)) {
							peopleList.push(item);
						}
					}
				}
			}

			// 슬라이더데이터 합치기
			!_.isEmpty(synopsis.contents.preview) && slideContents.push({ 'preview': synopsis.contents.preview });
			!_.isEmpty(synopsis.contents.stillCut) && slideContents.push({ 'stillCut': synopsis.contents.stillCut });
			!_.isEmpty(synopsis.contents.special) && slideContents.push({ 'special': synopsis.contents.special });
			!_.isEmpty(synopsis.contents.peoples) && slideContents.push({ 'peoples': peopleList });

			if (!_.isEmpty(synopsis.contents.preview) && !_.isEmpty(synopsis.contents.stillCut)) {
				// 예고편,스틸컷 모두있는경우는 데이터 합쳐서 하나의 slide로 처리
				slideContents.splice(0, 2);
				slideContents.unshift({ 'preStill': _.union(synopsis.contents.preview, synopsis.contents.stillCut) });
			}
		}

		const style = { overflow: "hidden" };
		let darkClass = _.isEmpty(synopsis.contents.bg_img_path) ? " default" : "";
        darkClass += synopsis.contents.dark_img_yn === 'N' ? "" : " dark";
		return (
			<div className={`wrap${darkClass}`} style={style}>
				<MainBg
					mainImg={synopsis.contents}
				/>
				<div className="synopShortContent scrollWrap">
					<SynopShortTop
						synopInfo={synopsis.contents}
						purchares={synopsis.purchares}
						metvDirectview={metvDirectview}
						isBookmark={isBookmark}
						setFm={setFm}
						buttonObj={buttonObj}
						isGuided={isGuided}
					/>
					<div className="synopBot">
						{/* <div className="synopTitle">{synopContents.title}</div> */}
						{/* 평점&리뷰 */}
						<SynopShortReview
							synopInfo={synopsis.contents}
							setFm={setFm}
							scrollTo={scrollTo}
							setFocus={setFocus}
						/>

						{/* 예고편,스틸컷,스페셜영상,인물 */}
						<SynopShortSlides
							slideContents={slideContents}
							onSelect={this.onSelect}
							setFm={setFm}
							scrollTo={scrollTo}
							people_type={people_type}
							btnPurchase={synopsis.contents.btnPurchase}

						/>

						{/* 연관콘텐츠 추천 */}
						<SynopCwSlides
							cwRelation={this.state.cwRelation}
							slideContents={slideContents}
							onSelect={this.onSelect}
							setFm={setFm}
							scrollTo={scrollTo}
							synopType="short"
						/>
					</div>
					<div className="btnTopWrap" id="top">
						<div className="csFocus btnTop"><span>맨 위로</span></div>
					</div>
				</div>
			</div>
		)
	}
}

class MainBg extends React.Component {

	render() {
		const { mainImg } = this.props;
		return (
			<div id="synopsisMainBg" className="mainBg">
				{
					_.isEmpty(mainImg.bg_img_path) ?
					<div className="postImg">
						{/* <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_SHORT_HERO_NONE) + mainImg.sris_poster_filename_v} alt="" /> */}
						<IMG 
							src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_SHORT_HERO_NONE) + mainImg.sris_poster_filename_v}
							alt=""
							loader={
								<div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}>
								</div>
							}
						/>
					</div>
					:
					<Fragment>
						<div className="bgImg" id="bgHero">
							{/* <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + mainImg.bg_img_path} alt="" /> */}
							<IMG 
								src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + mainImg.bg_img_path}
								alt=""
								loader={
									<div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}>
									</div>
								}
							/>
						</div>
						<div className="bgImg" id="bgBlur" style={{display: "none"}}>
							{/* <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + mainImg.bg_img_path} alt="" /> */}
							<IMG 
								src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + mainImg.bg_img_path}
								alt=""
								loader={
									<div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}>
									</div>
								}
							/>
						</div>
					</Fragment>
				}
			</div>
		)
	}
}

class SynopShortSlides extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isChange: false
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.slideContents) !== JSON.stringify(this.props.slideContents);
	}

	onSelect = (sildeKey, slideIdx, chlidIdx) => {
		this.props.onSelect(sildeKey, slideIdx, chlidIdx);
	}

	render() {
		const { slideContents, setFm, scrollTo, people_type, btnPurchase } = this.props;
		return (
			slideContents.map((item, i) => {
				let key = Object.keys(item)[0];
				let title, type = '';
				switch (key) {
					case 'preStill':
						title = '예고편/스틸컷';
						type = SlideType.SYNOPSHORT;
						break;
					case 'preview':
						title = '예고편';
						type = SlideType.SYNOPSHORT;
						break;
					case 'stillCut':
						title = '스틸컷';
						type = SlideType.SYNOPSHORT;
						break;
					case 'special':
						title = '스페셜영상';
						type = SlideType.SYNOPSHORT;
						break;
					case 'peoples':
						title = '제작/출연진';
						type = people_type;
						break;
					default: break;
				}
				
				return (
					key === 'peoples' ?
					<G2NaviPeopleSlider
						id={`slides`}
						idx={i}
						key={i}
						title={title}
						type={type}
						scrollTo={scrollTo}
						onSelectMenu={null}
						onSlideFocus={null}
						onSelectChild={this.onSelect.bind(this, key)}
						rotate={true}
						bShow={true}
						setFm={setFm}
					>
						{
							item[key].map((slide, idx2) => {
								return (
									<G2NaviSlideMyPeople
										key={idx2} idx={idx2}
										name={slide.prs_nm}
										cast={slide.prs_role_nm}
										part={slide.prs_plrl_nm}
										type={type}
										imgURL={slide.img_path}
										espdId={slide.epsd_rslu_id}
										srisId={null}
										menuId={null}
										onClick={null}
									/>
								)
							})
						}
					</G2NaviPeopleSlider>
					:
					<G2NaviPeopleSlider
						id={`slides`}
						idx={i}
						key={i}
						title={title}
						btnPurchase={btnPurchase}
						type={type}
						scrollTo={scrollTo}
						onSelectMenu={null}
						onSlideFocus={null}
						onSelectChild={this.onSelect.bind(this, key)}
						rotate={true}
						bShow={true}
						setFm={setFm}
					>
						{
							item[key].map((slide, idx2) => {
								return (
									<G2NaviSlideSynopVOD
										key={idx2} idx={idx2}
										title={slide.title}
										imgURL={slide.img_path}
										espdId={slide.epsd_rslu_id}
										srisId={null}
										menuId={null}
										onSelect={null}
										onClick={null}
									/>
								)
							})
						}
					</G2NaviPeopleSlider>
				)
			})
		)
	}
}


export default SynopShort;