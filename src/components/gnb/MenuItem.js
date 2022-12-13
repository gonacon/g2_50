// commons
import React, { Component } from 'react';

// utils
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

class MenuItem extends Component {

	static defaultProps = {
		index: 0,
		htmlClass: '',
		imgs: [],
		menuText: '',
	}

	static propTypes = {
		htmlClass: PropTypes.string.isRequired,
		imgs: PropTypes.object.isRequired,
		menuText: PropTypes.string.isRequired,
	}

	constructor(props) {
		super(props);
		this.state = {};
	}

	renderImgList = imgs => Object.keys(imgs).map((item, i) => (
		<img src={imgs[item]} className={item} alt="" key={i} />
	))

	render() {
		const { htmlClass, imgs, menuText } = this.props;

		return (
			<li>
				<span className={`csFocus ${htmlClass}`} tabIndex="-1">
					{menuText}
					{!isEmpty(imgs) ? this.renderImgList(imgs) : null}
				</span>
			</li>
		)
	}

}

export default MenuItem;