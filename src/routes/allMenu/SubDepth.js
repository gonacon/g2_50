// commons
import React, { Component } from 'react'
// import { VerticalList, Focusable } from 'Navigation';

// utils
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

// components
import AllMenuDepth from './AllMenuDepth';

class SubDepth extends Component {

    static defaultProps = {
        idx: 0,
        data: {}, 
        enterDown: () => { 
			// console.log('%c Doesn\'t recieved "enterDown" props', 'color: yellow, background: red'); 
		},
    }

    static propTypes = {
        idx: PropTypes.number.isRequired,
		data: PropTypes.object.isRequired,		
    }

	constructor(props) {
		super(props);

		this.state = {
			isRolling: false
		}
	}

	setTxtSlide(){
		if(!this.spanElement) return;
		const txtWitdh = this.spanElement.clientWidth;
		//console.error("txtWitdh:", txtWitdh);
		const { isRolling } = this.state;
		let isR = false;
		if( txtWitdh >= 390){
			isR = true;
		}
		if( isR !== isRolling){
			this.setState({ isRolling: isR });
		}
	}

	// componentDidMount(){
	// 	this.setTxtSlide();
	// }

	// componentDidUpdate(){
	// 	this.setTxtSlide();
	// }

	render() {
		const { idx, data, focusIdx/*enterDown*/ } = this.props;
		
		let isRolling = false;
		let focus = false;
		
		if(data.title.length >= 15) {
			focus = true;
			isRolling = true;
		}
		if(idx === focusIdx) {
			focus = false;
		}
		
		const classname = `csFocusMenu ${(idx+1)%10 === 0 ? 'up' : ''} ${(idx+1)%10 === 1 ? 'down' : ''} ${isEmpty(data.depth) ? 'okIcon' : ''} ${isRolling ? 'slideAni':''}`;
		const menuNameClassName = `menuName ${focus ? 'ellip': ''}`;
		return (
			<li>
				<div className={classname}>
					<span className={menuNameClassName}>
						{/* <span ref={ (spanElement) => this.spanElement = spanElement} >{data.title}, ( {data.gnbTypeCode} )</span> */}
						<span ref={ (spanElement) => this.spanElement = spanElement} data-text={data.title}>{data.title}</span>
					</span>
				</div>
				{/* {console.log('%c data.depth', 'color: green', data.depth)} */}
				{ !isEmpty(data.depth) && <AllMenuDepth data={data.depth} /> }
			</li>
		)
	}
}

export default SubDepth;