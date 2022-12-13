// commons
import React from 'react';

// utils
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { newlineToBr } from '../../../utils/utils';
// import { Moment } from 'Util/common';

class CouponSlideItem extends React.Component {
  /*
  static defaultProps = {
    isDisable: true,
    dDay: '',
    title: '',
    // price: 0,
    couponValid: '',
  }

  static propTypes = {
    isDisable: PropTypes.bool.isRequired,
    dDay: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    // price: PropTypes.number,
    couponValid: PropTypes.string,
  }
  */

  /*
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  */

  render() {
    const { isDisable, dDay, title, /*price,*/ couponValid } = this.props;
    const couponType = isDisable ? ' disable' : '';
    const noRibbon = isEmpty(dDay) && !isDisable ? ' dDayNone' : '';

    return (
      <div className={`slide CouponItem${couponType}${noRibbon}`}>
        <div className="csFocus" tabIndex="-1">
          <div className="dDay">
            <span>{dDay}</span>
          </div>
          <div className="inner">
            <div className="title" style={{ WebkitBoxOrient: "vertical" }}>
              {newlineToBr(title)}
            </div>
            <p className="desc">
              {/*couponDesc*/}
            </p>
            <div className="valid"><span>{couponValid}</span></div>
          </div>
        </div>
      </div>
    )
  }
}

CouponSlideItem.defaultProps = {
  isDisable: false,
  dDay: '',
  title: '',
  // price: 0,
  couponValid: '',
};

CouponSlideItem.propTypes = {
  isDisable: PropTypes.bool.isRequired,
  dDay: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  // price: PropTypes.number,
  couponValid: PropTypes.string,
};

export default CouponSlideItem;