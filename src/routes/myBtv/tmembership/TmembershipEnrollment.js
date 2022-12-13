// commons
import React, { PureComponent } from 'react';
// import PageView from '../../../supporters/PageView';

// components
import TmembershipRegist from './TmembershipRegist';

const viewType = {
    change: {
        pageTitle: '변경',
		subInfo: '변경하실',
    },
    regist: {
        pageTitle: '등록',
		subInfo: '',
    }
}

class TmembershipEnrollment extends PureComponent {

    constructor(props) {
        super(props);

        this.state = Object.assign({}, {
            ...viewType[this.props.action]
        });
    }

    render() {
        return <TmembershipRegist viewType={this.state} {...this.props} />
    }

}

export default TmembershipEnrollment;