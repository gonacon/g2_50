import React, { Component, Fragment } from 'react';
import { Route } from 'react-router-dom';
import PageView from 'Supporters/PageView';

import Slider from './Slider';
import Home from './Home';

const componentWithProps = (WrappedComponent, props) => class extends Component {
    render() {
        return <WrappedComponent {...props} />;
    }
}

class TestCase extends PageView {
    render() {
        const { match } = this.props;
        return (
            <Fragment>
                <Route path={`${match.url}/slider`} component={componentWithProps(Slider, this.props)} />
                <Route path={`${match.url}/home`} component={componentWithProps(Home, this.props)} />
            </Fragment>
        );
    }
}

export default TestCase;