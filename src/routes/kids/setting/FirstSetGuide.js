import {React, createMarkup} from '../../../utils/common';

import '../../../assets/css/routes/kids/setting/FirstSetGuide.css';

// 설정 시작 안내
import FirstSetGuideData from '../../../assets/json/routes/kids/setting/FirstSetGuideData.json';
// 설정 단계 미완료 가이드
import FirstSetGuideData2 from '../../../assets/json/routes/kids/setting/FirstSetGuideData2.json';
// 설정 완료 가이드
import FirstSetGuideData3 from '../../../assets/json/routes/kids/setting/FirstSetGuideData3.json';

class FirstSetGuide extends React.Component {
	constructor(props) {
		super(props);

		let guideData;

		if( this.props.data === "start"){
			guideData = FirstSetGuideData;
		} else if( this.props.data === "incomplete" ){
			guideData = FirstSetGuideData2;
		} else if( this.props.data === "end" ){
			guideData = FirstSetGuideData3;
		}


		this.state = {
			contents : guideData
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="mainBg"><img src={this.state.contents.mainBg} alt="" /></div>
				<div className="firstSetGuideWrap">
					<div className="SetGuideWrap">
						<img src={this.state.contents.mainCharacter} alt=""/>
						<div className="speechBubbleArea">
							<div className="textArea">
								<span dangerouslySetInnerHTML={createMarkup(this.state.contents.guideText)}></span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
	}

}

export default FirstSetGuide;

