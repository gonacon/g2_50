// commons
import React, { Component } from 'react';

// utils
import PropTypes from 'prop-types';

const MAX_NUM = 9;
class AllMenuDepth extends Component {

    static defaultProps = {
        data: []
    }

    static propTyps = {
        data: PropTypes.array.isRequired,
    }

	render(){
		const { data } = this.props;
		return(
			<ul>
				{data.map((item,i) => {
					if(i<=MAX_NUM){
					return(
						<li key={i} index={i}>{item.title}</li>
					)}
				})}
			</ul>
		)
	}

}

export default AllMenuDepth;