// commons
import React, { Component } from 'react';
import { Focusable } from 'Navigation';

// utils
import PropTypes from 'prop-types';

class MainslideItem extends Component {

	static defaultProps = {
	}

	static propTypes = {
		index: PropTypes.number,
		imageS: PropTypes.string.isRequired,
		activeClass: PropTypes.array,
		maxLength: PropTypes.number,
		focusOn: PropTypes.func.isRequired,
		focusOut: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = { width: 1920, height: 340 }
    }
    
    focusOn = (index) => {
        this.props.focusOn(index);
        // this.slide.focus();
    }

    focusOut = (index) => {
        this.props.focusOut(index);
        // this.slide.blur();
    }
	
	render() {
		const { imageS, index, maxLength, activeClass } = this.props;
		const { width, height } = this.state;
		const classnames = index === 0 || index === maxLength - 1 ? "slide clone":"slide";
		return(
            <Focusable onFocus={this.focusOn} onBlur={this.focusOut}>
                <div className={`${classnames} ${activeClass[0] || ''}`}>
                    <div className={`csFocus ${activeClass[1] || ''}`} tabIndex="-1"
                         ref={ref => this.slide = ref}>
                        <img src={imageS} width={width} height={height} alt="이미지" />
                    </div>
                </div>
            </Focusable>
		)
	}
}

export default MainslideItem;