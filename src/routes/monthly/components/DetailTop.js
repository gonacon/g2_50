// commons
import React, { PureComponent } from 'react';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import { CTSInfo } from 'Supporters/CTSInfo';
import { toLocalePrice } from 'Util/utils';

// style
import 'Css/monthly/DetailTop.css';

const DEBUG = false;
const { Keymap: { ENTER } } = keyCodes;

const log = DEBUG ? (msg, ...args) => {
  console.log('[DetailTop] ' + msg, ...args);
} : () => {};

const blue = DEBUG ? (msg, ...args) => {
  console.log('%c [DetailTop] ' + msg, 'color: white; background: blue', ...args);
} : () => {};

class DetailTop extends PureComponent {
  constructor(props) {
    super(props);

    blue('this.props:', this.props);

    this.state = {
      focused: false,
    }
  }

  onBtnKeyDown = (evt, focusIdx) => {
    const { keyCode } = evt;

    log('%c 월정액 가입 버튼 KEY DOWN', 'color: red; background: yellow', evt, focusIdx);
    if (keyCode !== ENTER) return;

    // 월정액 구매 페이지로 이동
    CTSInfo.purchasePPMByHome({ pid: this.props.productPriceId }, (data) => {
      blue('구매 callback:', data);

      if (data && data.result === '0000') {
        this.props.refreshPage(true);
      }
    });
  }

  onBtnContainerBlur = (direction) => {
    this.setState({ focused: false });
  }

  onBtnFocus = focusIdx => {
    this.setState({ focused: true })
  }

  componentDidMount() {
    const { id, setFm, bannerData } = this.props;

    log('this.props.bannerData:', bannerData);

    setFm(id, new FM({
      id: this.props.id,
      type: 'ELEMENT',
      containerSelector: '',
      focusSelector: '.csFocus',
      row: 1,
      col: 1,
      focusIdx: 0,
      startIdx: 0,
      lastIdx: 0,
      onFocusKeyDown: this.onBtnKeyDown,
      onFocusChild: this.onBtnFocus,
      onBlurContainer: this.onBtnContainerBlur
    }));
  }

  renderButton = () => {
    const { price, type, surtax, id } = this.props;

    let jsx = null;

    if (this.props.hasButton) {
      jsx = (
        <div className="subText">
          <ul className="listBtnType">
            <li className="listItem">
              <div className={`csFocus${this.state.focused ? ' focusOn' : ''}`} id={id}>
                <p className="selectType">{type}</p>
                <p className="price"><strong>{toLocalePrice(price.salePrcVat)}</strong>원 / 월</p>
              </div>
            </li>
          </ul>
          <p className="surtaxText">{surtax}</p>
        </div>
      );
    }

    return jsx;
  }

  render() {
    return (
      <div className="detailTop">
        <div className="detailBg">
          <img src={this.props.bg} alt="" />
        </div>
        {this.renderButton()}
      </div>
    );
  }
}

export default DetailTop;