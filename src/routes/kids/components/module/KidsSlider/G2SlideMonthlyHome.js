import React, { Component } from 'react';
import { SlideInfo } from './SlideInfo';
import appConfig from 'Config/app-config';
import Utils from './../../../../../utils/utils';


class G2SlideMonthlyHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
  }

  render() {
    const { focImage, norImage, isJoined, slideType } = this.props;
    const { width, height } = SlideInfo[slideType];
    const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.MONTHLY_HOME);

    const defaultImg = {
      focImage: appConfig.headEnd.LOCAL_URL + '/common/default/kids_monthly_foc_default.png',
      norImage: appConfig.headEnd.LOCAL_URL + '/common/default/kids_monthly_nor_default.png',
    }

    return (
      <div className="slide">
        <div className="csFocus">
          <img src={imgUrl + norImage} width={width} height={width} alt="" className="nor" onError={e => e.target.src = defaultImg.norImage} />
          <img src={imgUrl + focImage} width={height} height={height} alt="" className="foc" onError={e => e.target.src = defaultImg.focImage} />
          {
            isJoined && <span className="joined"></span>
          }
        </div>
      </div>
    );
  }
}

export default G2SlideMonthlyHome;