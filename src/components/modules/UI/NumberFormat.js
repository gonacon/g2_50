import React, { Fragment } from 'react';
import _ from 'lodash';

class NumberFormat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0,
            unit: this.props.unit
        }
    }

    componentWillMount() {
        if ( this.props.value) {
            let parts = this.props.value.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (_.isEmpty(parts[0])) {
                parts[0] = 0;
            }
            this.setState({ value: parts[0] });
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.value !== this.props.value && nextProps.value !== null) {
            if (nextProps.value !== null) {
                let parts = nextProps.value.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                this.setState({ value: parts[0] });
            }
        }
    }

    render() {
        return (
            <Fragment>{this.state.value}{this.state.unit}</Fragment>
        )
    }
}

export default NumberFormat;