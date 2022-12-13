import React, { Component } from 'react';
import { isEmpty } from 'lodash';

import appConfig from 'Config/app-config';
//import { STB_PROP } from 'Config/constants';
//import StbInterface from 'Supporters/stbInterface';
import Utils from 'Util/utils';

import { SlideInfo, SlideType } from './SlideInfo';
import Img from '../UI/Img';

class G2NaviSlideMyVOD extends Component {
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
    this.setTextOver();
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
      bAdult, // 마이Btv 의 소장용 VOD에서는 성인물 판정후 데이터를 내려줌.
      isDetailedGenreHome, // 홈에서 세부장르홈 인지 여부를 판단
    } = this.props;

    const { width, height } = SlideInfo[this.slideType];
    const { isTextOver } = this.state;
    const { focused } = this.props;
    // let focusClass = focused ? 'csFocus focusOn' : 'csFocus';
    let focusClass = 'csFocus';
    let textOver = isTextOver ? ' textOver' : '';
    if (bFirst) {
      focusClass += ' left';
    } else if (bLast) {
      focusClass += ' right';
    }
    focusClass = focused ? `${focusClass} focusOn` : focusClass;
    // const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HOR)}${imgURL}`;
    // const img = `${appConfig.headEnd.IMAGE.url + appConfig.headEnd.IMAGE.hor_pre_size}${imgURL}`;
    // const img = `${appConfig.headEnd.IMAGE.url + width+'_'+ height}${imgURL}`;
    const img = (() => {
      switch (this.slideType) {
        case SlideType.TALL:
          return `${Utils.getIipImageUrl(292, 421)}${imgURL}`;
        case SlideType.HORIZONTAL:
          return `${Utils.getIipImageUrl(449, 292)}${imgURL}`;
        case SlideType.SYNOPSERIES: case SlideType.SYNOPSERIES_INFO:
          return `${Utils.getIipImageUrl(248, 140)}${imgURL}`;
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

    // 사용자 뱃지
    let userBadge = '';
    let userBadgeSize = '';
    switch (this.slideType) {
      case SlideType.TALL:
        userBadge = userBadgeImgPath;
        userBadgeSize = '292_90';
        break;
      case SlideType.HORIZONTAL:
        userBadge = userBadgeWidthImgPath;
        userBadgeSize = '449_89'
        break;
      default: break;
    }
    // console.log('img=', img);

    // console.log('%c isDetailedGenreHome', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', isDetailedGenreHome);

    return (
      <div className={`slide${allMenu ? ' first' : ''} ${focusClass} ${textOver}`} style={style}>
        <span className="imgWrap">
          {
            // isDetailedGenreHome ? 
            // <img src={img} width={width} height={height} alt="" onError={(e) => e.target.src = errorImage} />
            // :
            // <img src={isAdult ? ageLimitImage : img} width={width} height={height} alt="" onError={(e) => e.target.src = errorImage} />
            <Img src={img} width={width} height={height} adultLevelCode={isDetailedGenreHome ? '' : bAdult} />
          }
          <span className="flagWrap" style={{ width: '100%' }}>
            {isEmpty(this.getBadgeImage(badge)) ? '' :
              // <img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-${this.getBadgeImage(badge)}.png`} alt="뱃지" />
              <Img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-${this.getBadgeImage(badge)}.png`} alt="뱃지" />
            }
            {userBadge &&
              // <img src={`${Utils.getIipImageUrl(...userBadgeSize.split('_'))}_A20${userBadge}`}
              //   className="flagImg"
              //   style={{ width: '100%' }}
              //   alt="사용자 정의 뱃지" />
              <Img src={`${Utils.getIipImageUrl(...userBadgeSize.split('_'))}_A20${userBadge}`}
                className="flagImg"
                style={{ width: '100%' }}
                alt="사용자 정의 뱃지" />
            }
          </span>
          {
            watchingRate ? (
              <div className="loadingBar">
                <div className="currentState" style={{ width: `${watchingRate}%` }}></div>
              </div>
            ) : null
          }
        </span>
        {title ? <span ref={r => this.titBox = r} className={slideTitle}>{programTitle}</span> : ''}
        {lang && <span className="langMark">{lang}</span>}
      </div>
    );
  }

}

export default G2NaviSlideMyVOD;