// common
import React from 'react';

// utils
import _ from 'lodash';
import { getCodeName } from '../../utils/code';
import Utils from '../../utils/utils';

// components
import SynopPurchares from './components/SynopPurchares';
import appConfig from 'Config/app-config';
import GuideTooptip from 'Module/GuideTooltip';

class SynopShortTop extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            
        }
	}

	componentDidMount() {
		const { synopInfo, setFm } = this.props;
		let topCtsLength = _.isEmpty(synopInfo.sris_sales_comt_cts) ? 128 : 85;
		if (synopInfo.sris_snss_cts.length < topCtsLength) {
			setFm('description', null);
		}
	}
	
    render() {
		const { synopInfo, metvDirectview, purchares, isBookmark, buttonObj, isGuided } = this.props;
		let style = {
			'color' : '#c78f34',
			width: '950px'
    	};
		let maxLengthContent = 128;
		if (!_.isEmpty(synopInfo.sris_sales_comt_cts)) {
			maxLengthContent = 85;
		}
		let content2 = synopInfo.sris_snss_cts;
		if (content2.length > maxLengthContent) {
			content2 = content2.substring(0, maxLengthContent) + '…';
		}


		// 최상위 화질스펙 이런걸 왜 프론트에서 해야되는지 이해가 안간다 진짜...
		let rslu_typ_cd = null;
		if (_.isEmpty(synopInfo.epsd_rslu_info)) {
			rslu_typ_cd = synopInfo.rslu_typ_cd;
		} else {
			let sortInfo = _.sortBy(synopInfo.epsd_rslu_info, 'rslu_typ_cd').reverse()[0];
			rslu_typ_cd = sortInfo.rslu_typ_cd;
		}

		return (
			<div className="synopTop">
				<div className="topTextArea" id="banner">
					{	
						!_.isEmpty(synopInfo.sris_evt_comt_exps_mthd_cd) ?
							synopInfo.sris_evt_comt_exps_mthd_cd === '10' ?
							<div className="csFocus eventOnlyText">
								<span className="eventTitle" style={{'WebkitBoxOrient':'vertical'}}>{synopInfo.sris_evt_comt_cts}</span>
								{/* <span className="eventSubTitle">{this.props.synopContents.eventment.subinfo}</span> */}
							</div>
							:
							<div className="csFocus eventBox">
								<span className="imgWrap">
									<img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_BANNER) + '/' + synopInfo.sris_evt_comt_img_path} alt=""/>
								</span>
							</div>
						:
						<div className="titleText" style={style}>
							{synopInfo.aprc_pt_cts}
						</div>
					}
				</div>
				<div className="logo">
					{
						!_.isEmpty(synopInfo.title_img_path) ?
						<img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_TITLE) + '/' + synopInfo.title_img_path} alt=""/>
						:
						<p className="logoText">{synopInfo.title}</p>
					}
				</div>
				<div className="subText">
					<ul className="synopInfo">
						<li>
							<div>
								<span className={`iconAge age${synopInfo.wat_lvl_cd}`}></span> {/*등급*/}
							</div>
						</li>
						{
							(rslu_typ_cd === '30' || rslu_typ_cd === '35') &&
							<li>
								<div>{getCodeName('RSLU_TYP_CD', rslu_typ_cd)}</div> {/*화질*/}
							</li>
						}
						{
							!_.isEmpty(synopInfo.open_yr) && 
							<li>
								<div><span className="bar"></span>{synopInfo.open_yr}</div> {/*개봉년도*/}
							</li>	
						}
						{
							!_.isEmpty(synopInfo.play_tms_val) && 
							<li>
								<div><span className="bar"></span>{synopInfo.play_tms_val}분</div> {/*러닝타임*/}
							</li>
						}
						{
							synopInfo.snd_typ_cd !== '1' &&
							<li>
								<div><span className="bar"></span>{getCodeName('SND_TYP_CD', synopInfo.snd_typ_cd)}</div> {/*음질*/}
							</li>
						}
						{
							synopInfo.mtx_capt_yn === 'Y' ?
							<li>
								<div><span className="bar"></span>다국어</div> {/*다국어지원 여부*/}
							</li>
							: null
						}
						{
							synopInfo.nscrn_yn === 'Y' ?
							<li>
								<div>
									<span className="bar"></span>
									<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/logo-oksusu-dark.png`} className="dark" alt=""/>
									<img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/logo-oksusu-light.png`} className="light" alt=""/>
								</div> {/*oksusu지원*/}
							</li>
							: null
						}
					</ul>
					<ul className="synopInfo type2" style={{'WebkitBoxOrient':'vertical'}}>
						<li>
							<span className="title">감독</span> {synopInfo.director}
						</li>
						<li>
							<span className="bar"></span><span className="title">출연</span> {synopInfo.actor}
						</li>
						{
							!_.isEmpty(synopInfo.guest) &&
							<li>
								<span className="bar"></span><span className="title">게스트</span>
								<span>{synopInfo.guest}</span>
							</li>
						}
						{
							!_.isEmpty(synopInfo.chrtr) &&
							<li>
								<span className="bar"></span><span className="title">등장 캐릭터</span>
								<span>{synopInfo.chrtr}</span>
							</li>
						}
					</ul>
					<span className="synopcomment" id="description">
						<div className="contentTextBox">
							{!_.isEmpty(synopInfo.sris_sales_comt_cts) &&  <div className="noticeMent">{[synopInfo.sris_sales_comt_cts]}</div>}
							<div className="csFocus linkSynopcomment" style={{width:"1000px"}}>
								<div>{content2}</div>
								{
									content2.length > maxLengthContent &&
									<span className="commentMore">더보기</span>
								}
							</div>
						</div>
                    </span>
				</div>
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
				{isGuided ? '':
					<GuideTooptip guideTitle="아래 방향 버튼을 눌러 콘텐츠의 상세 정보를 확인해 보세요." top="900" left="570" aniTime="3" delayTime="2" arrowClass="down" />
				}
				<div className="pageArr" id="pageArr"></div>
			</div>
		)
    }
};

export default SynopShortTop;