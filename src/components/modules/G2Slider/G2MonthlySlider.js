import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';

import Utils from 'Util/utils';

import { SlideType } from './SlideInfo';

class G2MonthlySlider extends Component {
  constructor(props) {
    super(props);

    this.slideType = SlideType[this.props.type];

    this.state = {
      focused: false
    };
  }

  renderMenuContents() {
    const { title, bFirst, bLast, imgs } = this.props;
    const { focused } = this.props;
    const { width, height } = SlideType.MONTHLY;
    let norImg = `${Utils.getImageUrl(Utils.IMAGE_SIZE_MONTHLY_BLOCK)}${imgs.off}`;
    let focImg = `${Utils.getImageUrl(Utils.IMAGE_SIZE_MONTHLY_BLOCK)}${imgs.on}`;
    let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
    if (bFirst) {
      focusClass += ' left';
    } else if (bLast) {
      focusClass += ' right';
    }
    const imageJsx = (
      <div className={focusClass}>
        <img className="norImg" src={norImg} alt="" width={width} height={height} />
        <img className="focImg" src={focImg} alt="" width={width} height={height} />
        <div className="detailInfo"></div>
      </div>
    );
    const textJsx = (
      <div className={focusClass}>
        <span style={{ WebkitBoxOrient: 'vertical' }}>{title}</span>
        <div className="detailInfo"></div>
      </div>
    );

    if (isEmpty(imgs.off) && isEmpty(imgs.on)) {
      return textJsx;
    } else {
      return imageJsx;
    }
  }

  render() {
    let display = 'block';  //  idx > 6 ? 'none' : 'block';
    let style = { display };

    return (
      <div className={`slide${this.props.allMenu ? ' first' : ''}`} style={style}>
        {this.renderMenuContents()}
      </div>
    );
  }
}

export default G2MonthlySlider;