import React from 'react';
import 'ComponentCss/toolguide/ToolGuide.css';

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
			top:TOP,
			left:LEFT,
			aniTime:ANITIME,
			delay:DELAYTIME,
			arrowClass:ARROWClASS
		};
	}

	render() {
		return (
			<div onAnimationEnd={this.props.onAnimationEnd} className={`${this.state.aniTime > 0 ? 'toolGuideWrap' : 'toolGuideWrap aniNone'} ${this.state.arrowClass}`} style={{"top":this.state.top + "px","left":this.state.left + "px","--aniTime":this.state.aniTime,"--delayTime":this.state.delay}}>
					<span className="toolguide">
						<span className="text">{this.state.title}</span>
					</span>
			</div>
		)
	}

	componentDidMount() {

	}
}

export default ToolGuide;