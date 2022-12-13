import React, { Component } from 'react';

class Keypad extends Component {
	constructor(props) {
		super(props);

		this.state = {
			active: null,
			charActive: null,
		}

	}

	onFocused = () => {
		this.setState({ active: true });
	}

	onBlured = () => {
		this.setState({
			active: false,
			charActive: false,
		});
	}

	componentDidUpdate = () => {
		const { keypadListIdx } = this.props;

		let classTarget = document.querySelectorAll('.inputSet.block .list.active');
		for (let i = 0; i < classTarget.length; i++) {
			classTarget[i].classList.remove('active');
		}
		document.querySelector(".inputSet.block").children[keypadListIdx].classList.add('active');
	}

	render() {
		const { content, idx, length, charActive } = this.props;
		const { active } = this.state;

		let lastlow, lastCol = false;
		if (length - 1 === idx) {
			// lastlow, 
			lastCol = true;
		} else if (length - 2 === idx) {
			lastlow = true;
		}

		let str = null;
		let str0 = null;
		if (idx === 10) {

			str = <span className='buttonKeyItemLine' >|</span>;
			str0 = " 공백";

		}


		const focusClass = `buttonKeyItem csFocus ${active ? 'focusOn' : ''} ${lastlow ? 'lastLow' : ''}`;

		return (
			<li id="keypadLangegeList" className={lastCol ? "endKey" : ""}>
				<span className={focusClass}>
					{content}{str}{str0}
				</span>
				{idx === 11 &&
					<div>
						<div className={charActive ? "inputSet block active" : "inputSet block"}>
							<span className="list csFocus" >한글</span>
							<span className="list csFocus" >영대</span>
							<span className="list csFocus" >영소</span>
							<span className="list csFocus" >숫자</span>
							<span className="list csFocus" >특1</span>
							<span className="list csFocus" >특2</span>
						</div>
					</div>
				}
			</li>
		)
	}

}
export default Keypad;