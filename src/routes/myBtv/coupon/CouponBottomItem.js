// commons
import React, { Component } from 'react';
// import { Focusable } from 'Navigation';

// utils
//import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

class CouponBottomItem extends Component {
  static defaultProps = {
    cautionMsg: {
      caution: '',
      cautionDetail: '',
    },
    defautMsgTrigger: true,
    couponDetailData: {}
  }

  static propTypes = {
    cautionMsg: PropTypes.object,
    defautMsgTrigger: PropTypes.bool,
    couponDetailData: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      focused: '',
    }
  }

  renderUseButton = () => {
    const { focused } = this.state;
    const { couponUseButtonSetting } = this.props;
    const { disable, /*dDay, */useRange } = this.props.couponDetailData;
    //const buttonVisible = !isEmpty(dDay);
    const buttonVisible = !disable;

    //console.log('###', useRange);
    if (buttonVisible && useRange[0].synopsysType !== '00') {
      if (useRange.productType !== '패키지') {
        couponUseButtonSetting(false);
        return (
          <span className={`csFocus btnStyle type02 ${focused}`}>
            <span className="wrapBtnText">쿠폰 사용하기</span>
          </span>
        );
      } else {
        couponUseButtonSetting(true);
        return null;
      }
    } else {
      couponUseButtonSetting(true);
      return null;
    }
  }

  render() {
    //const { focused } = this.state;
    const { couponDetailData, cautionMsg, defautMsgTrigger } = this.props;
    const { disable, couponTitleFull, /*dDay, */couponType, discount, registDate, restrictPeriod, restrictDate/*, useRangeCaution*/ } = couponDetailData;
    const { caution, cautionDetail } = cautionMsg;
    const bottomWrapClass = `bottomWrap${defautMsgTrigger ? ' default' : ''}`;
    const buttonVisible = !disable;

    //console.log('@@@', couponDetailData);
    //console.log('buttonVisible:', buttonVisible);

    return (
      <div className={bottomWrapClass}>
        <div className="defaultWrap">
          <div className="eventDesc" dangerouslySetInnerHTML={{ __html: caution }}></div>
          <div className="eventDescSub">{cautionDetail}</div>
        </div>
        <div className="innerDataWrap" id="bottom">
          <div className="bottomLeft">
            <div className="titleFull" dangerouslySetInnerHTML={{ __html: couponTitleFull }} />
            {(buttonVisible) && this.renderUseButton()}
          </div>
          <div className="bottomRight">
            <div className="inner">
              <span className="tblTitle">쿠폰타입</span>
              <div className="tblData">{couponType}</div>
              <span className="tblTitle">할인금액</span>
              <div className="tblData">{discount}</div>
              <span className="tblTitle">등록일자</span>
              <div className="tblData">
                <Moment parse="YYYYMMDD" format="YYYY.MM.DD">{registDate}</Moment>
              </div>
              <span className="tblTitle">이용기간</span>
              <div className="tblData">
                {restrictPeriod}
                {restrictDate && <span className="detail">{`(${restrictDate})`}</span>}
              </div>
            </div>
            {/* <div className="inner">
							<span className="tblTitle">사용범위</span>
							<div className="tblData">
								{this.props.useRange}
								<ul className="exceptList">
									{ useRangeCaution && useRangeCaution.map((data, i) => <li key={i}>{data}</li>) }
								</ul>
							</div>
						</div> */}
          </div>
          <p className="couponCaution">* 쿠폰은 한 번에 1개의 쿠폰만 사용 가능합니다.</p>
        </div>
      </div>
    )
  }
}

export default CouponBottomItem;