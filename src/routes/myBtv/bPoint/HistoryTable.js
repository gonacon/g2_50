import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

// components
import NumberFormat from 'Module/UI/NumberFormat';
import keyCodes from 'Supporters/keyCodes';
//import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';

const { Keymap: { UP, DOWN } } = keyCodes;

class HistoryTable extends Component {

  static defaultProps = {
    historyList: [],
    scrollVisible: false,
    innerRefs: () => { },
  }

  static propTypes = {
    historyList: PropTypes.array.isRequired,
    scrollVisible: PropTypes.bool.isRequired,
    innerRefs: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      thArea: [
        { title: "구매일", width: "180px" },
        { title: "구매내역", width: "453px" },
        { title: "잔여포인트", width: "181px" },
        { title: "유효기간", width: "241px" },
        { title: "실제구매가격", width: "207px" },
      ],
      colgroup: ["180px", "453px", "181px", "241px", "207px"],
      scrollPosY: 0,
      scrollBarHeight: 0, // 스크롤 바 길이
    }
  }
  setScrollBarHeight = () => {
    const { scrollHeight, clientHeight: height } = this.innerContentInfo;
    const barHeight = this.barBg.clientHeight;
    let scrollBarHeight = Math.floor((barHeight * height) / scrollHeight);
    this.setState({
      scrollBarHeight,
      colgroup: ["180px", "453px", "181px", "241px", this.props.historyList.length <= 6 ? '207px' : '189px'],
    });
  }

  scrollKeyDown = (evt) => {
    console.log('scroll handle', document.activeElement);
    if ((evt.keyCode === UP || evt.keyCode === DOWN) && document.activeElement.id === 'historyTable') {
      const { scrollTop, scrollHeight } = this.innerContentInfo;
      const barBgHeight = this.barBg.clientHeight;
      const barHeight = this.bar.clientHeight;

      // 스크롤 위치 오차
      let diff = 0;
      if (evt.keyCode === DOWN) diff = +80;
      else if (evt.keyCode === UP) diff = -80;

      let scrollPosY = Math.floor(((scrollTop + diff) * barBgHeight) / scrollHeight);

      if (scrollPosY >= (barBgHeight - barHeight)) {
        scrollPosY = barBgHeight - barHeight;       // 최대값
      } else if (scrollPosY <= 0) {
        scrollPosY = 0;     // 최소값
      }
      this.setState({ scrollPosY });
    }
  }

  componentDidMount() {
    this.setScrollBarHeight();
  }

  componentWillReceiveProps(nextProps) {
    this.setScrollBarHeight();
  }

  renderHistoryGrid = () => {
    let history = this.props.historyList;
    const isOnlyNumber = str => /^[0-9]*$/.test(str);
    // const historyList = history.concat(testData);

    return !isEmpty(history) ?
      history.map((data, i) => {
        let { date, title, remains, expiryDate, actualPurchasePrice } = data;
        let expDate = expiryDate;
        if (expiryDate.trim().length === 8 && isOnlyNumber(expiryDate)) {
          let str = expiryDate.trim();
          expDate = str;
        }
        return (
          <tr key={i}>
            <td>
              <Moment format="YYYY.MM.DD">{date}</Moment>
            </td>
            <td className="alignL important">{title}</td>
            <td className={`important ${remains !== undefined ? 'point' : ''}`}>
              {remains !== undefined ? <NumberFormat value={remains} unit="P" /> : '-'}
            </td>
            <td>
              { /[0-9]/.test(expDate) ? <Moment format="YYYY.MM.DD">{expDate}</Moment> : expDate }
            </td>
            <td className={actualPurchasePrice ? 'alignR' : ''}>
              {actualPurchasePrice ? <NumberFormat value={actualPurchasePrice} unit="원" /> : '-'}
            </td>
          </tr>
        )
      })
      :
      <tr className="rowSpan">
        <td colSpan="5" className="none">B포인트 이용내역이 없습니다.</td>
      </tr>
  }

  render() {
    const { innerRefs, scrollVisible, scrollHandle } = this.props;
    const { thArea, colgroup, scrollBarHeight, scrollPosY } = this.state;
    const thTag = thArea.map((item, idx) => <th style={{ width: item.width }} key={idx}>{item.title}</th>);
    const colTag = colgroup.map((width, idx) => <col style={{ width }} key={idx} />);
    const scrollBarStyle = { height: `${scrollBarHeight}px`, minHeight: '60px', top: `${scrollPosY}px`, display: scrollVisible ? 'block' : 'none' };

    return (
      <div className="tableWrap">
        <div className="tableHead">
          <table><thead><tr>{thTag}</tr></thead></table>
        </div>
        <div className="innerContentPop">
          {/* 조건에 따라 클래스 추가 */}
          <div id="historyTable"
            className={`innerContentInfo ${this.props.historyList.length > 6 ? 'csFocus' : ''}`}
            onKeyDown={this.scrollKeyDown}
            ref={r => { innerRefs(r, 'innerContentInfo'); this.innerContentInfo = r }}
            tabIndex="-1"
            style={{overflowY: scrollHandle ? 'auto' : 'hidden'}}
          >
            <div className="contentInfo">
              <table>
                <colgroup>{colTag}</colgroup>
                <tbody>{this.renderHistoryGrid()}</tbody>
              </table>
            </div>
          </div>
          <span className="scrollBarBox type02">
            <div className="innerScrollBarBox">
              <span className="scrollBar"
                hidden={scrollVisible}
                style={scrollBarStyle}
                ref={r => { innerRefs(r, 'scrollBar'); this.bar = r }} />
              <span className="scrollBarBG" ref={r => { innerRefs(r, 'barBg'); this.barBg = r }}></span>
            </div>
          </span>
        </div>
      </div>
    )
  }
}

export default HistoryTable;