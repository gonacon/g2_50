// common
import React, { Fragment } from 'react';
import appConfig from 'config/app-config.js';
import IMG from 'react-image';
import FM from 'Supporters/navi';
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD, G2NaviSlideMyPeople, G2NaviPeopleSlider } from 'Module/G2Slider';

// css
import '../../assets/css/routes/synopsis/SynopShort.css';
import '../../assets/css/routes/synopsis/SynopSeries.css';
import '../../common.css';

// util
import _ from 'lodash';
import synopAPI from './api/synopAPI';
import Utils from '../../utils/utils';

// components
import SynopSeriesTop from './SynopSeriesTop.js';
import SynopCwSlides from './components/SynopCwSlides';

class SynopSeries extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cwRelation: !_.isEmpty(this.props.data.cwRelation) ? this.props.data.cwRelation : []
		}
	}

	componentDidMount() {
		this.setFmTop(this.props);
		if (_.isEmpty(this.state.cwRelation)) {
			this.setAPI(this.props);
		}
	}

	// shouldComponentUpdate(nextProps) {
	// 	return JSON.stringify(this.props.data.synopsis) !== JSON.stringify(nextProps.data.synopsis);
	// }

	componentWillReceiveProps(nextProps) {
		if (!nextProps.data.synopsis.contents.yn_history) {
			if (JSON.stringify(this.props.data.synopsis) !== JSON.stringify(nextProps.data.synopsis)) {
				this.setAPI(nextProps);
			}
		}
	}

	setAPI = async (props) => {
		const { param, data, setFm, resetFm } = props;
		let paramData = {
			menu_id: param.menu_id,
			cw_call_id_val: data.synopsis.contents.cw_call_id_val,
			type: 'all',
			epsd_rslu_id: !_.isEmpty(data.synopsis.contents.epsd_rslu_info) ? data.synopsis.contents.epsd_rslu_info[0].epsd_rslu_id : '',
			epsd_id: data.synopsis.contents.epsd_id
		}

		const cwData = await synopAPI.xpg012(paramData).then(result => {
			if (result.result !== '0000') {
				result = [];
			}
			return result;
		});
		this.props.setCwHistory(cwData);
		this.setState({
			cwRelation: cwData
		});
	}

	setFmTop = (props) => {
		const { setFm } = props;
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

	// 시리즈 변경
	onSeriesChanged = (idx) => {
		this.props.onSeriesChanged(idx);
	}

	render() {
		const { data: { synopsis, metvDirectview, vodInfo }, setFm, scrollTo, onSelect, isBookmark, buttonObj, isGuided } = this.props;
		let slideContents = [];
		if (!_.isEmpty(synopsis.contents)) {
			!_.isEmpty(synopsis.contents.peoples) && slideContents.push({ 'peoples': synopsis.contents.peoples });
			!_.isEmpty(synopsis.contents.corners) && slideContents.push({ 'corners': synopsis.contents.corners });
			!_.isEmpty(synopsis.contents.special) && slideContents.push({ 'special': synopsis.contents.special });
		}

		const style = { overflow: "hidden" };
		let darkClass = _.isEmpty(synopsis.contents.bg_img_path) ? " default" : "";
		darkClass += synopsis.contents.dark_img_yn === 'N' ? "" : " dark";
		return (
			<div className={`wrap${darkClass}`} style={style}>
				<MainBg
					mainImg={synopsis.contents}
				/>
				<div className="synopSeriesContent scrollWrap">
					<SynopSeriesTop
						synopInfo={synopsis.contents}
						purchares={synopsis.purchares}
						metvDirectview={metvDirectview}
						vodInfo={vodInfo}
						onSeriesChanged={this.onSeriesChanged}
						scrollTo={scrollTo}
						onSelect={onSelect}
						setFm={setFm}
						isBookmark={isBookmark}
						buttonObj={buttonObj}
						isGuided={isGuided}
					/>
					<div className="synopBot">
						<div className="synopSeriesLayout">
							<div className="synopSeriesInfo">
								<div className="synopSeriesCon on">
									<div className="left">
										<div className="innerMove">
											{/*6/11 inline style 추가*/}
											<div className="seriesNum" style={{'WebkitBoxOrient':'vertical'}}>{synopsis.contents.brcast_tseq_nm}회</div>
										</div>
									</div>
									<div className="right">

										{/* 인물,코너별,스페셜 */}
										<SynopSeriesSlides
											synopInfo={synopsis.contents}
											slideContents={slideContents}
											metv={metvDirectview}
											scrollTo={scrollTo}
											setFm={setFm}
											onSelect={this.onSelect}
											seq={synopsis.contents.brcast_tseq_nm}
										/>

										{
											!_.isEmpty(this.state.cwRelation) &&
											<SynopCwSlides
												synopInfo={synopsis.contents}
												cwRelation={this.state.cwRelation}
												slideContents={slideContents}
												metv={metvDirectview}
												onSelect={this.onSelect}
												setFm={setFm}
												scrollTo={scrollTo}
												synopType="series"
											/>
										}
									</div>
								</div>
							</div>
						</div>

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
			<div id="synopsisMainBg" className={`mainBg synopSeries`}>
				{
					!_.isEmpty(mainImg.series_info[0].poster_filename_h) &&
					<div className="keyWrap">
						{/*6/12 span class명 수정*/}
						<span className="btnKeyBlueS">최근 시청 회차로 이동</span>
					</div>
				}
				{
					_.isEmpty(mainImg.bg_img_path) ?
					<div className="postImg">
						{/* <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_SERIES_HERO_NONE) + mainImg.sris_poster_filename_v} alt="" /> */}
						<IMG 
							src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_SERIES_HERO_NONE) + mainImg.sris_poster_filename_v}
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

class SynopSeriesSlides extends React.Component {

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.synopInfo) !== JSON.stringify(this.props.synopInfo)
			|| JSON.stringify(nextProps.metv) !== JSON.stringify(this.props.metv);
	}

	onSelect = (sildeKey, slideIdx, chlidIdx) => {
		this.props.onSelect(sildeKey, slideIdx, chlidIdx);
	}

	render() {
		const { synopInfo, slideContents, scrollTo, setFm } = this.props;
		return (
			!_.isEmpty(slideContents) &&
			slideContents.map((item, i) => {
				let key = Object.keys(item)[0];
				let title, type = '';
				switch (key) {
					case 'peoples':
						title = '제작/출연진';
						type = SlideType.PEOPLESERIES_NONE;
						break;
					case 'corners':
						title = '코너별영상';
						type = SlideType.SYNOPSERIES;
						break;
					case 'special':
						title = '스페셜영상';
						type = SlideType.SYNOPSERIES;
						break;
					default: break;
				}
				return (
					key === 'peoples' ? 
					<G2NaviPeopleSlider
						id={`slides`}
						idx={i}
						key={`${Math.random()}_${i}`}
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
								let title = slide.title;
								switch (key) {
									case 'corners':
										title = slide.cnr_nm;
										break;
									default: break;
								}
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
					<G2NaviSlider
						id={`slides`}
						idx={i}
						key={`${Math.random()}_${i}`}
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
								let title = slide.title;
								switch (key) {
									case 'corners':
										title = slide.cnr_nm;
										break;
									default: break;
								}
								return (
									<G2NaviSlideMyVOD
										key={idx2} idx={idx2}
										title={title}
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
					</G2NaviSlider>
				)
			})
		)
	}
}

export default SynopSeries;