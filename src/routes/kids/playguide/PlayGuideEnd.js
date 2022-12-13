import { React, createMarkup } from '../../../utils/common';
import PopupPageView from '../../../supporters/PopupPageView';
import Core from '../../../supporters/core';

// STB
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';
import '../../../assets/css/routes/kids/playguide/PlayGuide.css';
import appConfig from './../../../config/app-config';
import { isEmpty } from 'lodash/isEmpty';

const CHAR_COMMENT = '잘가~!<br/>우리 또 만나자!';

export default class PlayGuideEnd extends PopupPageView {
	constructor(props) {
		super(props);

		this.state = {};

		this.noState = {
			character : '',
			isVoiceUse : false
		}
	}

	componentWillMount() {
		this.noState.character = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);			// 캐릭터명
		const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE);				// 음성사용유무
		this.noState.isVoiceUse = Number(voiceUse) === 1 ? true : false;
	}

	componentDidMount() {
		// 상단 General GNB
		const { showMenu, callback } = this.props;
		if (showMenu && typeof showMenu === 'function') showMenu(false);

		setTimeout(() => {
			if(callback && typeof callback === 'function') {
				callback({ result : '0000' });
			}
		}, 4300);
	}

	onErrored = (e, type) => {
		if(e.target) {
			if(type === 'character') e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-character-pororo-end.png';
			if(type === 'bubble')	e.target.src = appConfig.headEnd.LOCAL_URL + '/kids/playguide/img-kids-guide-bubble-pororo-end.png';
		}
	} 

	render() {
		const { character, isVoiceUse } = this.noState;
		console.log('[RENDER][POPUP]', this.noState);
		
		if(isVoiceUse) {
			setTimeout(() => {
				StbInterface.playKidszoneGuide(character+'_10_guide_good-bye.mp3');
			}, 300);
		}
		return (
			<div className="wrap">
				<div className="playGuideWrap">
					<div className="playGuide">
						<div className="playGuideEndWrap">
							<div className="imageWrap">
								<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-character-${character}-end.png`} onError={(e) => this.onErrored(e, 'character')} alt=""/>
							</div>
							<div className="playGuideBubbleArea">
								<div className="bubbleWrap">
									<div className="textArea">
										<span dangerouslySetInnerHTML={createMarkup(CHAR_COMMENT)}></span>
									</div>
									<img src={`${appConfig.headEnd.LOCAL_URL}/kids/playguide/img-kids-guide-bubble-${character}-end.png`} onError={(e) => this.onErrored(e, 'character')} alt=""/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}