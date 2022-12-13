import React, { Component } from 'react';
import HistoryManager from 'Supporters/history';

class Idle extends Component {
    // class HomeOther extends HomeDynamic {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { showMenu } = this.props;
        if (showMenu) {
            showMenu(false, false);
        }
    }

    componentDidMount(){
        HistoryManager.clear();
        
    }

    render() {
        return (
            <div>
            </div>
        )
    }
}

export default Idle;