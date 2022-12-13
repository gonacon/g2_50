import { React, createMarkup } from '../../../utils/common';
import Core from '../../../supporters/core';
import PopupPageView from '../../../supporters/PopupPageView';
import { isEmpty } from 'lodash';

// STB
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP, CHILDREN_LIMIT_TYPE } from 'Config/constants';
import '../../../assets/css/routes/kids/playguide/PlayGuide.css';
// import { SSL_OP_LEGACY_SERVER_CONNECT } from 'constants';
import appConfig from './../../../config/app-config';

const CHAR_COMMENT = '눈 나빠지니까<br/>조금만 뒤로 가서 보자!';

/**
 * [호출방법]
 *   Core.inst().showPopup(<PlayGuideWatchDistance/>, {time:10000, title:'뽀로로 시즌1', brcast_tseq_nm:'4'}, this.onClosePopup);
 * [전달PROPS]
 * 	 1. title : 재생할 VOD 타이틀
 *   2. brcast_tseq_nm : 회차
 * 	 3. 기타 : 재생시 필요한 param ( CTSInfo.requestWatchVODForOthers() 참조 )
 * 
 * [호출조건]
 *   1. 시청제한 미설정시
 *   2. 시청편수 2편이상 / 제한시간대 5분이상 남은경우
 */
export default class PlayGuideWatchDistance extends PopupPageView {
	constructor(props) {
		super(props);

		this.state = {};

		this.noState = {
			title : '',
			brcast_tseq_nm : '',
			character : '',
			kidsNames : '',
			isVoiceUse : false
		}
	}

	componentWillMount() {
		const { title, brcast_tseq_nm } = this.props.data; 

		this.noState.title = title;
		this.noState.brcast_tseq_nm = brcast_tseq_nm;
		this.noState.character = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);			// 캐릭터명

		// 아이이름
		const kidsName1 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_1);
		const kidsName2 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_2);
		const kidsName3 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_3);

		let kidsNames = kidsName2 ? kidsName1 +','+ kidsName2 : kidsName1;
			kidsNames = kidsName3 ? kidsNames +','+ kidsName3 : kidsNames;
		this.noState.kidsNames = kidsNames;

		const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE);				// 음성사용유무
		this.noState.isVoiceUse = Number(voiceUse) === 1 ? true : false;
		
		// 키즈존 제한모드 : 시간으로 제한(TIME), 시간대로 제한(CUSTOM TIME), 편수제한(VOD_COUNT), 사용안함(BTV)
		const limitType = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_TYPE);

		let remainTime = '';
		let remainVod = 0;

		// 시청제한 되어있을 경우
		if(limitType && limitType !== CHILDREN_LIMIT_TYPE.BTV) {
			const { data, callback } = this.props;

			// 편수제한일경우 (남은 편수)
			if (limitType === CHILDREN_LIMIT_TYPE.VOD_COUNT) {
				remainVod = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_VOD);
				remainVod = remainVod ? Number(remainVod) : 0;

				if(remainVod < 2) {
					console.log('시청제한팝업 취소 : remainVod=', remainVod);
					if(callback && typeof callback === 'function') {
						if(!isEmpty(data)) callback(data);
					}
					Core.inst().cancelPopup();
				}

			// 시간대 제한일경우 (남은시간)
			} else {
				remainTime = StbInterface.getProperty(STB_PROP.PROPERTY_CHILDREN_SEE_LIMIT_REMAIN_TIME);			// 분단위로 넘겨준다고 답변받음
				remainTime = remainTime ? Number(remainTime) : 0;

				// 5분 미만
				if(remainTime < 5) {
					console.log('시청제한팝업 취소 : remainTime=', remainTime);
					if(callback && typeof callback === 'function') {
						if(!isEmpty(data)) callback(data);
					}
					Core.inst().cancelPopup();
				}
			}
		}
	}

	componentDidMount() {
		const { showMenu } = this.props;
		const { data, callback } = this.props;
		
		// 상단 General GNB
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
		}

		Core.inst().hideKidsWidget();																	// 위젯 숨김 p.152 정책참조

		if(!isEmpty(data.time)) {
			setTimeout(() => {
				if(callback && typeof callback === 'function') {
					if(data.title !== undefined) delete data.title;
					if(data.brcast_tseq_nm !== undefined) delete data.brcast_tseq_nm;
					if(!isEmpty(data)) callback(data);
				}
				Core.inst().cancelPopup();
			}, data.time);
		} else {
			setTimeout(() => {
				if(callback && typeof callback === 'function') {
					if(data.title !== undefined) delete data.title;
					if(data.brcast_tseq_nm !== undefined) delete data.brcast_tseq_nm;
					if(!isEmpty(data)) callback(data);
				}
				Core.inst().cancelPopup();
			}, 3000);
		}
	}

	onErrored = (e, type) => {
		if(e.target) {
			if(type === 'character') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-character-pororo-basic.png';
			if(type === 'bubble')	e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-bubble-pororo-basic.png';
		}
	} 

	render() {
		const { title, brcast_tseq_nm, kidsNames, character, isVoiceUse } = this.noState;

		if(isVoiceUse) {
			setTimeout(() => {
				StbInterface.playKidszoneGuide(character+'_05_guide_viewing_distance.mp3');
			}, 300);
		}
		return (
			<div className="wrap">
				<div className="playGuideWrap">
					<div className="playGuide">
						<div className="playGuideWatchLimitWrap">
							<div className="imageWrap">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-character-${character}-basic.png`} onError={(e) => this.onErrored(e, 'character')} alt=""/>
							</div>
							<div className="playGuideBubbleArea">
								<div className="bubbleWrap">
									<div className="textArea">
										<div className="textWrap">
											{ kidsNames && <span>{kidsNames} 친구야,</span> }
											<span dangerouslySetInnerHTML={createMarkup(CHAR_COMMENT)}></span>
										</div>
									</div>
									<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-bubble-${character}-basic.png`} onError={(e) => this.onErrored(e, 'bubble')} alt=""/>
								</div>
							</div>
							{
								!isEmpty(title) &&
								<div className="watchInfoPop">
									<div className="playInfoWrap">
										<p className="playTitle">
											<span className="title">{title}</span>
											{
												!isEmpty(brcast_tseq_nm) && <span className="num">{brcast_tseq_nm + '화'}</span>
											}
										</p>
									</div>
									<p className="playState">잠시 후 재생</p>
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		)
	}

}
