import {React, fnScrolling } from '../../utils/common';
import Common from 'components/common/Common';

class CommonView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		return (
			<div className="wrap">
		    	<Common></Common>
            </div>
        )
	}

    componentDidMount() {
        document.querySelector('.topMenu').style.display = 'none';
        fnScrolling();
    }

}

export default CommonView;