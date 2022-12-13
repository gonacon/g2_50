import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import appConfig from 'Config/app-config';
//import { STB_PROP } from 'Config/constants';
//import StbInterface from 'Supporters/stbInterface';
import Utils from 'Util/utils';

import { SlideInfo, SlideType } from './SlideInfo';
import Img from '../../modules/UI/Img';

class G2NaviSlideSynopVOD extends Component {
  constructor(props) {
    super(props);

    this.slideType = SlideType[this.props.type];

    this.state = {
      focused: false,
      isTextOver: false
    };
  }

  static defaultProps = {
    title: '',
    imgURL: '',
    bAdult: false,
    rate: 0,
    espdId: '',
    allMenu: false
  }

  /*
  shouldProtect = () => {
    const stbProhibitAge = parseInt(StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT), 10);
    const contentProhibitAge = parseInt(this.props.watLevelCode, 10);

    return stbProhibitAge <= contentProhibitAge;
  }
  */

  getBadgeImage = badgeCode => {
    switch (badgeCode) {
      case 'sale': return 'sale';
      case 'event': return 'event-nor';
      case 'new': return 'new';
      case 'free': return 'free';
      case 'up': return 'up';
      case 'rest': return 'cancel';
      case 'monopoly': return 'monopoly';
      case 'hdr': return 'uhd-hdr';
      case 'uhd': return 'uhd';
      default: break;
    }
  }

  setTextOver() {
    const { width } = SlideInfo[this.slideType];
    let { isTextOver } = this.state;
    if (!this.titBox) return;

    if (this.titBox.clientWidth > width && isTextOver !== true) {
      this.setState({ isTextOver: true });
    }
  }

  componentDidMount() {
    this.setTextOver();
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.setTextOver();
    },20);
  }

  render() {
    const {
      title,
      imgURL,
      bFirst,
      allMenu,
      bLast,
      rate: watchingRate,
      badge,
      adultLevelCode,
      parentFocused,
      currentIdx,
      idx,
      userBadgeImgPath,
      userBadgeWidthImgPath,
      lang, // 지원되는 언어별 안내 뱃지 : String
      bAdult // 마이Btv 의 소장용 VOD에서는 성인물 판정후 데이터를 내려줌.
    } = this.props;

    const { width, height } = SlideInfo[this.slideType];
    const { focused, isTextOver } = this.state;
    let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
    let textOver = isTextOver ? ' textOver' : '';
    if (bFirst) {
      focusClass += ' left';
    } else if (bLast) {
      focusClass += ' right';
    }
    focusClass = parentFocused && (currentIdx === idx) ? `${focusClass} focusOn` : focusClass;
    // const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
    // const img = `${appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hor_pre_size}${imgURL}`;
    // const img = `${appConfig.headEnd.IMAGE.url + width+'_'+ height}${imgURL}`;
    const img = (() => {
      switch (this.slideType) {
        case SlideType.TALL:
          return `${Utils.getIipImageUrl(292, 421)}${imgURL}`;
        case SlideType.HORIZONTAL:
          return `${Utils.getIipImageUrl(449, 292)}${imgURL}`;
        case SlideType.SYNOPSHORT:
          return `${Utils.getIipImageUrl(306, 172)}${imgURL}`;
        case SlideType.SYNOPSHORT_STEEL:
          return `${Utils.getIipImageUrl(150, 150)}${imgURL}`;
        default:
          return `${Utils.getIipImageUrl(292, 421)}${imgURL}`;
      }
    })();
    const programTitle = title ? title : '';
    let slideTitle = `${this.props.type === 'SYNOPSHORT' || this.props.type === 'SYNOPSERIES' ? 'videoText' : 'slideTitle'}`;
    let display = 'block';  //  idx > 7 ? 'none' : 'block';
    let style = { display };
    const errorImage = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-${this.slideType === SlideType.TALL ? 'land' : 'port'}.png`;
    const ageLimitImage = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-protection.png`;
    let isAdult = (adultLevelCode === '03' || adultLevelCode === '01') && appConfig.STBInfo.level === '19';
    isAdult = isAdult || bAdult;

    return (
      <div className={`slide${allMenu ? ' first' : ''} ${focusClass} ${textOver}`} style={style}>
        <Img src={img} width={width} height={height} />
        {title ? <span ref={r => this.titBox = r} className={slideTitle}>{programTitle}</span> : <span className="icSteel"></span>}
      </div>
    );
  }

}

export default G2NaviSlideSynopVOD;