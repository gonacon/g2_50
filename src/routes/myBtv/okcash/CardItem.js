// commons
import React, { Component } from 'react';

// utils
import PropTypes from 'prop-types';

// components
import NumberFormat from 'Module/UI/NumberFormat';

class CardItem extends Component {

  static defaultProps = {
    data: {},
    index: 0,
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
  }

  /*
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  */

  render() {
    const { data, index, isSelected, innerRefs } = this.props;
    const cardItemClass = isSelected ? ' selected' : '';

    return (
      <div className="cardItemWrapper" ref={r => innerRefs(r, index)}>
        {( data.isRegisterItem === false ?
          <div className={`cardItem${cardItemClass}`}>
            <div className="csFocus card">
              {data.isMaster && <span className="iconUse">주 이용카드</span>}
              <div>
                <div className="pointWrap">
                { data.hasPoint ?
                  <div>
                    <span className="pointTitle">사용가능 포인트</span>
                    <p className="point">
                      <strong className="pointNumber">
                        <NumberFormat value={data.point}/>
                      </strong>
                      <span className="pointUnit">P</span></p>
                  </div>
                  :
                  <div className="pointCheck">
                    사용가능 포인트를<br/>조회해보세요
                  </div>
                }
                <div className="cardNumber">
                { data.cardNumber && data.cardNumber.map((item, idx, arr) => (
                  <span key={idx}>
                    {item}
                  </span>
                ))}
                 <span>****</span>
                 <span>****</span>
                </div>
                <span className="name">{data.name}</span>
                </div>
              </div>
            </div>
            { isSelected &&
            <div className="buttonWrap" id={`cardBtn`}>
              <span className="csFocus btnStyle type03 checkStyle2" tabIndex="-1" select={`${data.isMaster}`}>
                <span className="wrapBtnText">주 이용카드 설정</span>
              </span>
              <span className="csFocus btnStyle type03">
                <span className="wrapBtnText">삭제</span>
              </span>
            </div>
            }
          </div>
          :
          <div className="cardNone">
            <div className="card csFocus cardRegistBtn">
              <span className="inner">
                <span className="registText">카드등록</span>
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default CardItem;