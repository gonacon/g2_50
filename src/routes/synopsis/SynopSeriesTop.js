import React, { Fragment } from 'react';
// import appConfig from 'config/app-config.js';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';
import Core from '../../supporters/core';
import { SlideType, G2NaviSlider, G2NaviSlideSeries } from 'Module/G2Slider';

// utils
import _ from 'lodash';
// import synopAPI from './api/synopAPI';
import { getCodeName } from '../../utils/code';
import Utils, { scroll } from '../../utils/utils';

// components
import SynopPurchares from './components/SynopPurchares';
// import NumberFormat from '../../components/modules/UI/NumberFormat';
import SynopDescriptionPop from './popup/SynopDescriptionPop';
import appConfig from 'Config/app-config';
// import SynopSeriesCancelSlide from "./SynopSeriesCancelSlide";
import GuideTooptip from 'Module/GuideTooltip';

class SynopSeriesTop extends React.Component {
	constructor(props) {
		super(props);

		this.state = {

		}
	}

	onSeriesChanged = (idx) => {
		this.props.onSeriesChanged(idx);
	}

	render() {
		const { synopInfo, metvDirectview, purchares, vodInfo, scrollTo, setFm, onSelect, isBookmark, buttonObj, isGuided  } = this.props;

		return (
			<div className="synopTop">

				<SeriesDescription
					synopInfo={synopInfo}
					setFm={setFm}
				/>

				<div className="contentGroup">
					<SynopPurchares
						contents={synopInfo}
						purchares={purchares}
						metvDirectview={metvDirectview}
						setFm={this.props.setFm}
						isBookmark={isBookmark}
						buttonObj={buttonObj}
					/>
				</div>

				<SeriesDetailInfo
					synopInfo={synopInfo}
					metv={metvDirectview}
					vodInfo={vodInfo}
					onSeriesChanged={this.onSeriesChanged}
					scrollTo={scrollTo}
					setFm={setFm}
					onSelect={onSelect}
				/>

				<div className="seasonInfoWrap">
					<SeriesSlideInfo
						series={synopInfo}
						scrollTo={scrollTo}
						setFm={setFm}
					/>
				</div>
				{ isGuided ? '' :
                    <GuideTooptip guideTitle="아래 방향 버튼을 눌러 콘텐츠의 상세 정보를 확인해 보세요." top="900" left="570" aniTime="3" delayTime="2" arrowClass="down" />
                }
				<div className="pageArr" id="pageArr"></div>
			</div>
		)
	}
};

class SeriesDescription extends React.Component {

	componentDidMount() {
		const { synopInfo, setFm } = this.props;
		let topCtsLength = _.isEmpty(synopInfo.sris_sales_comt_cts) ? 100 : 40;
		if (synopInfo.sris_snss_cts.length < topCtsLength) {
			setFm('description', null);
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props.synopInfo.series_info) !== JSON.stringify(nextProps.synopInfo.series_info);
	}

	componentWillReceiveProps(nextProps) {
		const { synopInfo, setFm } = nextProps;
		let topCtsLength = _.isEmpty(synopInfo.sris_sales_comt_cts) ? 100 : 40;
		if (synopInfo.sris_snss_cts.length < topCtsLength) {
			setFm('description', null);
		}
	}

	render() {
		const { synopInfo } = this.props;
		let sris_snss_cts = synopInfo.sris_snss_cts;
		let topCtsLength = _.isEmpty(synopInfo.sris_sales_comt_cts) ? 100 : 40;
		if (sris_snss_cts.length > topCtsLength) {
			sris_snss_cts = synopInfo.sris_snss_cts.substr(0, topCtsLength) + '...';
		}
		return (
			<Fragment>
				<div className="logo">
					{
						!_.isEmpty(synopInfo.title_img_path) ?
							// <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_VER) + synopInfo.title_img_path} alt=""/>
							<img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_SERIES_TITLE) + '/' + synopInfo.title_img_path} alt="" />
							:
							<p className="logoText" style={{ 'WebkitBoxOrient': 'vertical' }}>{synopInfo.title}</p>
					}
				</div>

				<div className="subText">
					<div className="commont" id="description">
						<div className="contentTextBox">
							{
								!_.isEmpty(synopInfo.sris_sales_comt_cts) ?
									<div className="noticeMent">[{synopInfo.sris_sales_comt_cts}]</div>
									:
									null
							}
							<div className="csFocus linkSynopcomment">
								{sris_snss_cts}
								{
									sris_snss_cts.length > topCtsLength &&
									<span className="commentMore">더보기</span>
								}
							</div>
						</div>
					</div>
				</div>
			</Fragment>
		)
	}
}

class SeriesDetailInfo extends React.Component {
	constructor(props) {
		super(props);

		this.seriesSlideIdx = -1;
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props.synopInfo) !== JSON.stringify(nextProps.synopInfo)
			|| JSON.stringify(this.props.metv) !== JSON.stringify(nextProps.metv);
	}

	onSlideFocus = () => {
		const { synopInfo } = this.props;

		document.getElementById('synopsisMainBg').classList.remove('full');
		document.getElementById('pageArr').classList.remove('on');
		if (!_.isEmpty(synopInfo.bg_img_path)) {
			document.getElementById('bgHero').style.display = 'block';
        	document.getElementById('bgBlur').style.display = 'none';
		}
		scroll(0);

		// if (synopInfo.cacbro_yn === 'Y') {
		// 	document.getElementById('synopsisMainBg').classList.remove('full');
		// 	if (!_.isEmpty(synopInfo.bg_img_path)) {
		// 		document.getElementById('bgHero').style.display = 'block';
		// 		document.getElementById('bgBlur').style.display = 'none';
		// 	}
		// 	scroll(0);
		// }
	}

	onSeriesChanged = (idx) => {
		const { synopInfo } = this.props;
		synopInfo.epsd_id !== synopInfo.series_info[idx].epsd_id && this.props.onSeriesChanged(idx);
		// if (this.seriesSlideIdx !== idx) {
		// 	this.seriesSlideIdx = idx;
		// 	this.props.onSeriesChanged(idx);
		// }
	}

	onFocusKeyDown = (slideIndx, chlidIndx) => {
		this.props.onSelect('series', slideIndx, chlidIndx);
	}

	render() {
		const { synopInfo, vodInfo, setFm, scrollTo, metv } = this.props;
		let slideType = SlideType.SYNOPSERIES_INFO;
		if (_.isEmpty(synopInfo.series_info[0].poster_filename_h)) {
			slideType = SlideType.SYNOPSERIES_INFO_NONE;
		}
		// console.log('시리즈 앞에 이벤트 붙여야되는데', synopInfo);
		let seriesList = synopInfo.series_info.map((slide, idx2) => {
			return (
				<G2NaviSlideSeries
					key={idx2} idx={idx2}
					synopInfo={synopInfo}
					metv={metv}
					vodInfo={vodInfo}
					title={slide.brcast_tseq_nm}
					imgURL={slide.poster_filename_h}
					espdId={slide.epsd_id}
					cacbro_yn={slide.cacbro_yn}
					srisId={null}
					menuId={null}
					onSelect={null}
					onClick={null}
				/>
			)
		});		
		// if (!_.isEmpty(synopInfo.sris_evt_comt_call_typ_cd) && !_.isEmpty(synopInfo.sris_evt_comt_call_url)) {
		// 	seriesList.unshift(
		// 		<G2NaviSlideSeries
		// 			key={0} idx={0}
		// 			synopInfo={synopInfo}
		// 			title={`타이틀 뭘로 해야됨?`}
		// 			imgURL={synopInfo.sris_evt_comt_img_path}
		// 		/>
		// 	)
		// }
		return (
			<G2NaviSlider
				id={`series`}
				key={0}
				title={''}
				type={slideType}
				data={synopInfo}
				scrollTo={null}
				onSelectMenu={null}
				// onSelectChild={null}
				// onFocusContainer={null}
				onSlideFocus={this.onSlideFocus}
				onFocusChanged={this.onSeriesChanged}
				onSelectChild={this.onFocusKeyDown}
				rotate={true}
				bShow={true}
				setFm={setFm}
				isShowCount={false}
			>
				{seriesList}
			</G2NaviSlider>
		)
	}
}

class SeriesSlideInfo extends React.Component {
	constructor(props) {
		super(props)

		this.state = {

		}
	}

	componentDidMount() {
		const { series, setFm } = this.props;
		if (series.cacbro_yn === 'N') {
			const fm = new FM({
				id: 'seriesDescription',
				type: 'ELEMENT',
				focusSelector: '.csFocus',
				row: 1,
				col: 1,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: 0,
				onFocusKeyDown: this.onFocusKeyDownTop,
				onFocusContainer: this.onFocusDescription
			})
			setFm('seriesDescription', fm);
		} else {
			setFm('seriesDescription', null);
		}
	}

	componentWillReceiveProps(nextProps) {
		const { series, setFm } = this.props;
		// 결방이 아닐때 포커스 셋팅해줌
		if (nextProps.series.cacbro_yn === 'N' && (nextProps.series.cacbro_yn !== series.cacbro_yn)) {
			const fm = new FM({
				id: 'seriesDescription',
				type: 'ELEMENT',
				focusSelector: '.csFocus',
				row: 1,
				col: 1,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: 0,
				onFocusKeyDown: this.onFocusKeyDownTop,
				onFocusContainer: this.onFocusDescription
			})
			setFm('seriesDescription', fm);
		}
		let seriesDescriptionFlag = false;
		const maxCtsLength = _.isEmpty(series.tpcc_comt) ? 250 : 195;
		if (series.epsd_snss_cts.length < maxCtsLength) {
			seriesDescriptionFlag = true;
		}
		if (nextProps.series.cacbro_yn === 'Y' || seriesDescriptionFlag) {
			setFm('seriesDescription', null);
		}
	}

	onFocusDescription = () => {
		document.getElementById('synopsisMainBg').classList.remove('full');
		document.getElementById('pageArr').classList.remove('on');
		if (!_.isEmpty(this.props.series.bg_img_path)) {
			document.getElementById('bgHero').style.display = 'block';
        	document.getElementById('bgBlur').style.display = 'none';
		}
		scroll(0);
	}

	onFocusKeyDownTop = (e) => {
		if (e.keyCode === keyCode.Keymap.ENTER) {
			const { series } = this.props;
			const obj = {
				title_img_path: series.title_img_path,
				title: series.brcast_tseq_nm + '화 - ' + series.sub_title,
				content: series.epsd_snss_cts,
				bg_img_path: series.bg_img_path,
				season: series.title,
				movieNum: series.sson_choic_nm
			}
			Core.inst().showPopup(<SynopDescriptionPop />, obj, null);
		}
	}

	render() {
		const { series } = this.props;
		let epsd_snss_cts = series.epsd_snss_cts;
		const maxCtsLength = _.isEmpty(series.tpcc_comt) ? 250 : 195;
		if (series.epsd_snss_cts.length > maxCtsLength) {
			epsd_snss_cts = series.epsd_snss_cts.substring(0, maxCtsLength) + '...';
		}

		// 최상위 화질스펙 이런걸 왜 프론트에서 해야되는지 이해가 안간다 진짜...
		let rslu_typ_cd = null;
		if (_.isEmpty(series.epsd_rslu_info)) {
			rslu_typ_cd = series.rslu_typ_cd;
		} else {
			let sortInfo = _.sortBy(series.epsd_rslu_info, 'rslu_typ_cd').reverse()[0];
			rslu_typ_cd = sortInfo.rslu_typ_cd;
		}

		return (
			<div className="infoContents">
				<div className="left">
					<div className="innerInfo">
						<ul>
							<li>
								<span className="seriesNum">{series.brcast_tseq_nm}회</span>
								{
									!_.isEmpty(series.brcast_dy) &&
									<Fragment>
										<span className="bar"></span>
										<span className="seriesDate">
										{`${series.brcast_dy.substring(2,4)}.${series.brcast_dy.substring(4,6)}.${series.brcast_dy.substring(6,8)}`}
										</span>
									</Fragment>
								}
								<span className="bar"></span>
								<span className="movieLength">{series.play_tms_val}분</span>
							</li>
							<li>
								<span className="subTitle" style={{ 'WebkitBoxOrient': 'vertical' }}>{series.sub_title}</span>
							</li>
							{
								series.cacbro_yn === 'Y' &&
								<li>
									<span className="cancelMes">본 회차는 방송사의 사정으로 인해 결방 되었습니다. 고객님의 양해 부탁드립니다.</span>
								</li>	
							}
						</ul>
						
					</div>
					{
						series.cacbro_yn === 'N' &&
						<div className="commonSeasonInfo">
							<div className="commonSeasonInfo">
								<ul>
									<li>
										<span className={`iconAge age${series.wat_lvl_cd}`}></span>
										{
											(rslu_typ_cd === '30' || rslu_typ_cd === '35') &&
											getCodeName('RSLU_TYP_CD', rslu_typ_cd)
										}
										{
											series.snd_typ_cd !== '1' &&
											<Fragment>
												<span className="bar"></span>
												<span>{getCodeName('SND_TYP_CD', series.snd_typ_cd)}</span>
											</Fragment>
										}
										{
											series.epsd_rslu_info[0].mtx_capt_yn === 'Y' &&
											<Fragment>
												<span className="bar"></span>다국어
											</Fragment>
										}
										{
											series.nscrn_yn === 'Y' &&
											<Fragment>
												<span className="bar"></span>
												{/*6/11 이미지 명 수정*/}
												<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/logo-oksusu.png`} alt=""/>
											</Fragment>
										}
									</li>
									{/*6/11 inline style 추가*/}
									<li style={{'WebkitBoxOrient':'vertical'}}>
										<span className="title">감독</span>
										<span>{series.director}</span>
										<span className="bar"></span>
										<span className="title">출연</span>
										<span>{series.actor}</span>
										{
											!_.isEmpty(series.guest) &&
											<span>
												<span className="bar"></span>
												<span className="title">게스트</span>
												<span>{series.guest}</span>
											</span>
										}
										{
											!_.isEmpty(series.chrtr) &&
											<span>
												<span className="bar"></span>
												<span className="title">등장 캐릭터</span>
												<span>{series.chrtr}</span>
											</span>
										}
									</li>
								</ul>
							</div>
						</div>
					}
				</div>
				
				{
					series.cacbro_yn === 'N' &&
					<div className="right">
						<div className="contentTextBox contentGroup" id="seriesDescription">
							<div className="seriesComment" style={{ 'color': 'rgb(97, 98, 177)' }}>
								{series.tpcc_comt}
							</div>
							<div className="csFocus seriesText">
								<div>
									{epsd_snss_cts}
								</div>
								{
									series.epsd_snss_cts.length > maxCtsLength &&
									<span className="commentMore">더보기</span>
								}
							</div>
						</div>
					</div>
				}
			</div>
		)
	}
}


export default SynopSeriesTop;