import React from 'react';

// import './Sample2.css';

import { Focusable } from '../../supporters/navigation';

export default class Search extends React.Component {
  constructor() {
    super();

    this.state = {
      active: false
    };
  }

  onBlur() {
    this.setState({active: false});
  }

  onFocus() {
    this.setState({active: true});
  }

  render() {
    return (
      <Focusable onFocus={() => this.onFocus()} onBlur={() => this.onBlur()} navDefault>
        <div className={this.state.active ? 'search-box-placeholder-focus' : ''} id="search-box-placeholder"><i className="fa fa-search"></i></div>
      </Focusable>
    );
  }
}
