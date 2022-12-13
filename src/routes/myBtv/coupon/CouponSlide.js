// commons
import React, { Component } from 'react';

// utils
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

// components
import CouponSlideItem from './CouponSlideItem';
import CouponBottomItem from './CouponBottomItem';
// import { Moment } from 'Util/common';

class CouponSlide extends Component {

  static defaultProps = {
    contents: {
      pageType: 'couponDetail',
      pageTitle: '쿠폰함',
      couponEnable: 0,
      slideItem: [],
      activeCoupon: -1,
    }
  }

  static propTypes = {
    contents: PropTypes.object.isRequired,
    defaultMsgTrigger: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);

    this.items = 4;
    this.itemWidth = 431; // 슬라이드 가로 폭
    this.itemMargin = 0; // 슬라이드 간격

    this.state = {}

  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.contents, this.state.contents)) {
      this.setState({
        contents: nextProps.contents,
        slideItem: nextProps.contents.slideItem,
      });
    }
  }

  render() {
    const { defaultMsgTrigger, activeSlide, curIdx, slideTo, contents, couponUseButtonSetting } = this.props;
    const { slideItem } = contents;
    const slideLength = slideItem.length;
    const { itemWidth/*, itemMargin*/ } = this;
    const cautionMsg = { caution: contents.caution, cautionDetail: contents.cautionDetail };
    const slideWrapperStyle = { '--page': slideTo, 'width': slideLength * itemWidth };
    const couponDetailData = slideLength > 0 && curIdx > -1 ? slideItem[curIdx] : {};
    const slideWrapClass1 = activeSlide ? ' activeSlide' : '';
    let slideWrapClass2 = slideTo > 0 ? ' leftActive' : '';
    slideWrapClass2 = slideTo < slideLength - this.items ? `${slideWrapClass2} rightActive` : slideWrapClass2;

    return (
      <div className="contentGroup">
        <div className="CouponSlide">
          <div className={`slideWrap${slideWrapClass1}${slideWrapClass2}`}>
            <div className="slideCon" id="slide">
              <div className="slideWrapper CouponItemWrap"
                style={slideWrapperStyle}>
                {slideItem.map((data, i) => (
                  <CouponSlideItem key={i}
                    endDate={data.applyEndDate}
                    isDisable={data.disable}
                    dDay={data.dDay}
                    title={data.couponTitle}
                    price={data.price}
                    couponValid={data.couponValid}
                  />
                ))}
              </div>
            </div>
            <div className="leftArrow" />
            <div className="rightArrow" />
          </div>
          <CouponBottomItem cautionMsg={cautionMsg}
            defautMsgTrigger={defaultMsgTrigger}
            couponDetailData={couponDetailData}
            couponUseButtonSetting={couponUseButtonSetting}
          />
        </div>
      </div>
    );
  }
}

export default CouponSlide;