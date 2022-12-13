// common
import React from 'react';
import keyCodes from 'Supporters/keyCodes';

// utils
import PropTypes from 'prop-types';

// css
import 'Css/myBtv/notice/NoticeList.css';

const ITEM_HEIGHT = 90;
const ITEM_MARGIN = 18;
const ITEM_COUNT_PER_SCREEN = 7;
const { Keymap: { UP, DOWN/*, ENTER*/ } } = keyCodes;

class BoardTab extends React.PureComponent {
  static propTypes = {
    listData: PropTypes.array.isRequired,
    focusIndex: PropTypes.number
  }

  constructor(props) {
    super(props);

    this.currentFocusIndex = this.props.focusIndex || 0;

    this.state = {
      slideTo: 0,
      slideToPage: 0
    }
  }

  componentDidMount() {
    this.listArea = document.querySelector('.menuListWrap');
  }

  setArrow = () => {
    const pageCount = Math.ceil(this.props.listData.length / ITEM_COUNT_PER_SCREEN);
    const currentPage = this.state.slideToPage;

    if (currentPage > 0) {
      this.listArea.classList.add('leftActive');
    } else {
      this.listArea.classList.remove('leftActive');
    }

    if (currentPage + 1 < pageCount) {
      this.listArea.classList.add('rightActive');
    } else {
      this.listArea.classList.remove('rightActive');
    }
  }

  drawActiveItemClass = index => {
    const node = this.listArea.firstChild.childNodes[index];

    if (node) {
      node.firstChild.classList.add('active', 'loadFocus');
    }
  }

  eraseActiveItemClass = index => {
    const node = this.listArea.firstChild.childNodes[index];

    if (node) {
      node.firstChild.classList.remove('active', 'loadFocus');
    }
  }

  getCurrentFocusIndex() {
    return this.currentFocusIndex;
  }

  onFocusItem = index => {
    //console.log('Tab focus:', index);
    this.currentFocusIndex = index;
  }

  onFocus = () => {
    //console.log('onFocus in Tab');
    this.listArea.classList.add('activeSlide');
    //console.log('Focus elem:', this.listArea.childNodes[this.currentFocusIndex]);
    this.eraseActiveItemClass(this.currentFocusIndex);
    this.setArrow();
  }

  onBlur = () => {
    //console.log('onBlur in Tab');
    //this.listArea.classList.remove('activeSlide');
    this.drawActiveItemClass(this.currentFocusIndex);
  }

  onNaviKeyDown = (index) => {
    let slideTo = Math.floor(index / ITEM_COUNT_PER_SCREEN) * ITEM_COUNT_PER_SCREEN;
    let slideToPage = slideTo / ITEM_COUNT_PER_SCREEN;

    if (slideTo > this.props.listData.length - 1 || slideTo < 0) {
      return;
    }

    this.setState({ slideTo, slideToPage });
    this.setArrow();
  }

  onKeyDown = (event, index) => {
    //console.log('onKeyDown in BoardTab:', event, index);
    switch (event.keyCode) {
      case UP:
        this.onNaviKeyDown(--index);
        break;
      case DOWN:
        this.onNaviKeyDown(++index);
        break;
      default:
        //console.log('Not supported:', event, keyCodes.DOWN);
        break;
    }
  }

  renderNew = (isNew) => (
    isNew ? <span className="new">N</span> : null
  )

  renderItem = (data, index) => {
    //console.log('renderItem():', index, this.state.slideTo, this.state.slideToPage);

    return (
      <li key={index}>
        <div className="csFocus">
          <span>{data.title}</span>
          {this.renderNew(data.new)}
        </div>
      </li>
    );
  }

  renderItems = () => {
    return this.props.listData.map(this.renderItem);
  }

  render() {
    const style = {
      //'--page': this.state.slideTo,
      '--page': this.state.slideToPage,
      'height': (ITEM_HEIGHT + ITEM_MARGIN) * this.props.listData.length
    };

    //console.log('render() BoardTab:', this.state.slideToPage);

    return (
      <div className="menuListWrap">
        <ul className="tabStyle2" style={style} id="boardTab">
          {this.renderItems()}
        </ul>
        <div className="topArrow"></div>
        <div className="bottomArrow"></div>
      </div>
    );
  }
}

export default BoardTab;