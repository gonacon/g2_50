import React from 'react';

import { Focusable, HorizontalList } from '../../supporters/navigation';

// import './Sample2.css';

class ToogleItem extends React.Component {
  constructor() {
    super();

    this.state = {
      active: false
    }
  }

  render() {
    return (
      <Focusable onFocus={() => this.setState({active: true})}
                 onBlur={() => this.setState({active: false})}>
        <div className={'item ' + (this.state.active ? 'item-focus' : '')}></div>
      </Focusable>
    );
  }
};

export default class List extends React.Component {
  constructor() {
    super();
    this._lastFocus = null;
  }

  componentDidMount() {
    const width = (Math.floor(this.content.scrollWidth /  this.content.clientWidth ) * this.content.clientWidth) + this.content.clientWidth + 20;
    if (this.content.getElementsByClassName('hz-list')[0]) {
      this.content.getElementsByClassName('hz-list')[0].style.width = width + 'px';
    }
  }

  onFocus(index) {
    console.log(index, this._lastFocus);
    if (this._lastFocus === index) {
      return;
    }

    if (this.props.onFocus) {
      this.props.onFocus();
    }

    if (this.content) {
      const items = this.content.getElementsByClassName('item');
      const offsetWidth = items[0].offsetWidth + 20;
      this.content.scrollLeft = offsetWidth * index;
    }

    this._lastFocus = index;
  }

  render() {
    return (
      ///-- <div className={"contentgroup " + (this.props.visible ? '' : 'fading-out')}>
      <div className={"contentgroup "}>
        <h1>{this.props.title}</h1>
        <div className="content" ref={(content) => { this.content = content}}>
          <HorizontalList className="hz-list"
                          style={{overflow: 'hidden', display: 'block'}}
                          onFocus={(index) => this.onFocus(index)}
                          onBlur={() => { this._lastFocus = null }}>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
            <ToogleItem></ToogleItem>
          </HorizontalList>
        </div>
      </div>
    );
  }
}
