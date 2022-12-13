import React, { PureComponent, Fragment } from 'react';
import { isEmpty } from 'lodash';

class TmembershipCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      btnsFocus: ['focusOn', ''],
      registCardFocus: 'focusOn',
    }

    this.isDeleteType = this.props.type === 'delete';
  }

  renderButtons() {
    const labels = this.isDeleteType ? ['삭제', '취소'] : ['변경', '삭제'];
    let className = 'csFocus btnStyle ';

    if (!this.isDeleteType) {
      className += 'type03 ';
    }

    return (
      <div className="buttonWrap">
        {
          labels.map((label, index) => (
            <span tabIndex="-1" className={className + this.state.btnsFocus[index]} key={index}>
              <span className="wrapBtnText">{label}</span>
            </span>
          ))
        }
      </div>
    );
  }

  render() {
    const { cardInfo } = this.props
    const { cardType, cardLogo, cardNumber } = cardInfo;
    let numberBlock = <span className="numberBlock" />;
    const mask = (key) => {
      return <span className="numberBlock" key={key}>****</span>;
    };

    if (!isEmpty(cardInfo)) {
      numberBlock = cardNumber.map((item, idx, arr) => (<span className="numberBlock" key={idx}>{item}</span>));
      numberBlock.push(mask(2));
      numberBlock.push(mask(3));
    }

    return (
      <div id="card">
        {!isEmpty(cardInfo) ? (
          <Fragment>
            <div className="cardWrap">
              <div className="card">
                <span className="cardBg"><img src={cardType} alt="" /></span>
                <div className="logoWrap">
                  <img src={cardLogo} alt="" />
                </div>
                <div className="cardInfo">
                  <div className="cardNumber">{numberBlock}</div>
                </div>
              </div>
            </div>
            {this.renderButtons()}
          </Fragment>
        ) : (
            <div className="cardWrap cardRegistBtn">
              <span className={`card csFocus ${this.state.registCardFocus}`}>
                <span className="registText">카드등록</span>
              </span>
            </div>
          )
        }
      </div>
    );
  }
}

export default TmembershipCard;
