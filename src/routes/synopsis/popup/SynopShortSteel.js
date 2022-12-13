// common
import React from 'react';
import PopupPageView from 'Supporters/PopupPageView';
import keyCode from 'Supporters/keyCodes';
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD, G2NaviSlideSynopVOD } from 'Module/G2Slider';

// utils
import Utils from '../../../utils/utils';

// css
import '../../../assets/css/routes/synopsis/SynopShortSteel.css';

class SynopShortSteel extends PopupPageView {
	constructor(props) {
		super(props);

		this.state = {
			// stillCut: this.props.data.stillCut,
			idx: 0,
			choice: this.props.data.choice,
		}
		const focus = [
			{ key: 'stillCut', fm: null },
		]
		this.declareFocusList(focus);
	}

	componentDidMount() {
		const { data } = this.props;
		let focusIdx = 0;
		for (const [i, item] of data.stillCut.entries()) {
			if (data.choice.img_path === item.img_path) {
				focusIdx = i;
				break;
			}
		}
		this.setFocus(0, focusIdx);
	}

	onKeyDown(e) {
		this.handleKeyEvent(e);
		if (e.keyCode === keyCode.Keymap.PC_BACK_SPACE || e.keyCode === keyCode.Keymap.BACK_SPACE) {
			this.props.callback(this.state.idx);
			return true;
        }
	}

	onFocusChange = (idx) => {
		this.setState({
			idx: idx,
			choice: this.props.data.stillCut[idx]
		});
	}


	render() {
		const { data: {stillCut} } = this.props;
		const { choice } = this.state;
		return (
			<div className="steelWrap scrollWrap">
				<div className="mainBg"><img src={Utils.getImageUrl(Utils.IMAGE_SIZE_SYNOP_STILLCUT) + choice.img_path} alt="" /></div>
				<div className="steelSlideWrap">
					<div className="steelSlidePosition">
						<SynopShortSteelItem
							stillCut={stillCut}
							onFocusChange={this.onFocusChange}
							setFm={this.setFm}
						/>
					</div>
				</div>
			</div>
		)
	}
};

class SynopShortSteelItem extends React.Component {

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.stillCut) !== JSON.stringify(this.props.stillCut);
	}

	onFocusChange = (idx) => {
		this.props.onFocusChange(idx);
	}

	render() {
		const { stillCut, setFm } = this.props;
		return (
			<G2NaviSlider
				id={`stillCut`}
				idx={0}
				key={0}
				title={null}
				type={SlideType.SYNOPSHORT_STEEL}
				scrollTo={null}
				onSelectMenu={null}
				onSlideFocus={null}
				onFocusChanged={this.onFocusChange}
				rotate={true}
				bShow={true}
				setFm={setFm}
			>
				{
					stillCut.map((slide, idx2) => {
						return (
							<G2NaviSlideSynopVOD
								key={idx2} idx={idx2}
								title={null}
								imgURL={slide.img_path}
								espdId={null}
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
}

export default SynopShortSteel;