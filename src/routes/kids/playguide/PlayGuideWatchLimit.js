import { React, createMarkup } from '../../../utils/common';

// new navigator
// import FM from '../../../supporters/navi';
// import keyCodes from "../../../supporters/keyCodes";
import Core from '../../../supporters/core';

import PopupPageView from '../../../supporters/PopupPageView';
import { isEmpty } from 'lodash';

// STB
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';
import '../../../assets/css/routes/kids/playguide/PlayGuide.css';
import appConfig from '../../../config/app-config';

const CHAR_COMMENT = '이번 편만 보고<br/>오늘은 그만보는거야~';

/**
 * [호출방법]
 *   Core.inst().showPopup(<PlayGuideWatchLimit/>, {time:10000, title:'뽀로로 시즌1', brcast_tseq_nm:'4'}, this.onClosePopup);
 * [전달PROPS]
 * 	 1. title : 재생할 VOD 타이틀
 *   2. brcast_tseq_nm : 회차
 * 
 * [호출조건]
 *   1. 시청편수 1편 이하 / 제한시간대 5분이내 남은경우
 */
export default class PlayGuideWatchLimit extends PopupPageView {
	constructor(props) {
		super(props);

		this.state = {};

		this.noState = {
			title: '',
			brcast_tseq_nm: '',
			char_name: '',
			kidsNames: '',
			isVoiceUse: false
		}
	}

	componentWillMount() {
		const { title, brcast_tseq_nm } = this.props.data;

		this.noState.title = title;
		this.noState.brcast_tseq_nm = brcast_tseq_nm;
		this.noState.char_name = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);			// 캐릭터명

		// 아이이름
		const kidsName1 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_1);
		const kidsName2 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_2);
		const kidsName3 = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_PROFILE_NAME_3);

		let kidsNames = kidsName2 ? kidsName1 + ',' + kidsName2 : kidsName1;
		kidsNames = kidsName3 ? kidsNames + ',' + kidsName3 : kidsNames;
		this.noState.kidsNames = kidsNames;

		const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE);				// 음성사용유무
		this.noState.isVoiceUse = Number(voiceUse) === 1 ? true : false;
	}

	componentDidMount() {
		const { showMenu } = this.props;
		const { time } = this.props.data;

		// 상단 General GNB
		if (showMenu && typeof showMenu === 'function') {
			showMenu(false);
		}

		Core.inst().hideKidsWidget();																	// 위젯 숨김 p.152 정책참조
		
		if (time) {
			setTimeout(() => {
				Core.inst().cancelPopup();
			}, time);
		} else {
			setTimeout(() => {
				Core.inst().cancelPopup();
			}, 3000);
		}
	}

	onErrored = (e, type) => {
		if (e.target) {
			if (type === 'character') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-character-pororo-basic.png';
			if (type === 'bubble') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-bubble-pororo-basic.png';
		}
	}

	render() {
		const { title, brcast_tseq_nm, kidsNames, char_name } = this.noState;
		console.log('[RENDER][POPUP]', this.noState);

		return (
			<div className="wrap">
				<div className="playGuideWrap">
					<div className="playGuide">
						<div className="playGuideWatchLimitWrap">
							<div className="imageWrap">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-character-${char_name}-basic.png`} onError={(e) => this.onErrored(e, 'character')} alt="" />
							</div>
							<div className="playGuideBubbleArea">
								<div className="bubbleWrap">
									<div className="textArea">
										<div className="textWrap">
											{kidsNames && <span>{kidsNames} 친구야,</span>}
											<span dangerouslySetInnerHTML={createMarkup(CHAR_COMMENT)}></span>
										</div>
									</div>
									<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-bubble--${char_name}-basic.png`} onError={(e) => this.onErrored(e, 'bubble')} alt="" />
								</div>
							</div>
							{
								!isEmpty(title) &&
								<div className="watchInfoPop">
									<div className="playInfoWrap">
										<p className="playTitle">
											<span className="title">{title}</span>
											{
												!isEmpty(brcast_tseq_nm) && <span className="num">{brcast_tseq_nm}</span>
											}
										</p>
									</div>
								</div>
							}
						</div>
					</div>
				</div>
			</div>
		)
	}
}

