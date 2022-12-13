// commons
import React from 'react';
import PageView from '../../../supporters/PageView';
import constants from 'Config/constants';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import { Core } from 'Supporters';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/bPoint/BpointHistory.css';

// network
import { EPS } from 'Network';

// util
// import { isEmpty } from 'lodash';

// components
import HistoryTable from './HistoryTable';
import NumberFormat from '../../../components/modules/UI/NumberFormat';
import BpointRegist from './BpointRegist';
import appConfig from '../../../config/app-config';

const { Keymap: { ENTER } } = keyCodes;
const { MYBTV_BPOINT_DETAIL } = constants;
// const merge = Object.assign;

let focusOpts = {
  historyTable: {
    id: 'historyTable',
    type: 'ELEMENT',
    focusSelector: '.innerContentInfo',
    row: 1,
    col: 1,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 0,
  },
  btnGroup: {
    id: 'btnGroup',
    moveSelector: '.btnBlock',
    focusSelector: '.csFocus',
    row: 2,
    col: 1,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  },
  autoMonthly: {
    id: 'autoMonthly',
    containerSelector: '.optionWrap',
    focusSelector: '.csFocus',
    row: 1,
    col: 2,
    focusIdx: 0,
    startIdx: 0,
    lastIdx: 1,
  }
}

class BpointHistory extends PageView {
  constructor(props) {
    super(props);

    this.state = {
      // data
      usablePoint: 0,
      historyList: [],
      useBpointRun: false,

      // UI
      btns: [
        { name: '충전하기', action: 'charge' },
        // {name: '선물하기', action: 'gift'},
        { name: 'B포인트 등록', action: 'point_regist' }
      ],
      scrollVisible: false,
      scrollHandle: false
    }

    this.defaultFM = {
      btnGroup: new FM({
        ...focusOpts.btnGroup,
        onFocusKeyDown: this.moveToPage,
      }),
      autoMonthly: new FM({
        ...focusOpts.autoMonthly,
        onFocusKeyDown: this.autoMonthlyAmount,
      }),
      historyTable: new FM({
        ...focusOpts.historyTable,
        onFocusContainer: this.onTableFocusOn,
        onBlurContainer: this.onTableFocusOut
      }),
    }

    const focusList = [
      { key: 'btnGroup', fm: null, link: { DOWN: 'autoMonthly', LEFT: 'historyTable' } },
      { key: 'autoMonthly', fm: null, link: { DOWN: null } },
      { key: 'historyTable', fm: null, link: { RIGHT: 'btnGroup', UP: null } },
    ];
    this.declareFocusList(focusList);
  }

  innerRefs = (ref, name) => {
    this[name] = ref;
  }

  onTableFocusOn = () => {
    const { id, focusSelector } = focusOpts.historyTable
    // let target = document.querySelector(`#${id}${focusSelector}`);
    let target = this.innerContentInfo;
    this.setState({
      scrollHandle: true,
    }, () => {
      target.focus();
    });
  }

  onTableFocusOut = () => {
    const { id, focusSelector } = focusOpts.historyTable;
    // let target = document.querySelector(`#${id}${focusSelector}`);
    let target = this.innerContentInfo;
    this.setState({
      scrollHandle: false,
    }, () => {
      target.blur();
    })
  }

  moveToPage = (evt, idx) => {
    if (evt.keyCode === ENTER) {
      switch (idx) {
        case 0:                          // 충전하기
          this.movePage(MYBTV_BPOINT_DETAIL);
          break;
        case 1:                    // B포인트 등록
          Core.inst().showPopup(<BpointRegist />, {}, () => { })
          break;
        default:    // no event
          break;
      }
    }
  }

  autoMonthlyAmount = (evt, idx) => {
    const { useBpointRun } = this.state;
    if (evt.keyCode === ENTER) {
      if (idx === 0 && !useBpointRun) {          // 사용함 (사용함으로 설정되있는 경우 처리 안함)
        // EPS-461
        EPS.request461({})
          .then(data => {
            if (data.result === '0000') {
              this.setState({ useBpointRun: true });
              this.setFocus(1, idx);
            }
          })
      } else if (idx === 1 && useBpointRun) {   // 사용안함 (사용안함으로 설정되있는 경우 처리 안함)
        // EPS-481
        EPS.request481({})
          .then(data => {
            if (data.result === '0000') {
              this.setState({ useBpointRun: false });
              this.setFocus(1, idx);
            }
          })
      }
    }
  }

  initFocus = () => {
    const { btnGroup, autoMonthly, historyTable } = this.defaultFM;
    this.setFm('btnGroup', btnGroup);
    this.setFm('autoMonthly', autoMonthly);
    this.setFm('historyTable', historyTable);
    this.setFocus(0);
  }

  componentDidUpdate() {
  }

  componentDidMount() {
    this.props.showMenu(false);
    this.initFocus();
    
    // 등록된 B포인트 목록
    EPS.request451({ transactionId: 'Inquiry_of_registered_BPoints_list' })
      .then(data => {
        let usablePoint = data.usableBpoints;
        let historyList = data.bpoints.bpoint.map((item, idx) => {
          return {
            date: item.confirmDate,     // 필드 없음
            title: item.title,
            remains: item.balance,
            expiryDate: item.expireMessage,
            actualPurchasePrice: item.saleAmount,
          }
        });

        this.setState({
          usablePoint,
          historyList,
          scrollVisible: historyList.length > 6
        }, () => {
          if ( historyList.length < 7 ) {
            this.setFm('historyTable', null);
          }
        });
      });

    // 보유 포인트 통합 정보 조회 ( B포인트 자동 차감 여부 확인 )
    EPS.request300({ transactionId: 'mypoint_all_info' })
    .then(data => {
      let { useBpointRun } = data;
      this.setState({ useBpointRun });
    })

    window.AA = this;
  }

  render() {
    const { usablePoint, historyList, scrollVisible, useBpointRun, btns, scrollHandle } = this.state;
    const bpointRun = useBpointRun ? ['select', ''] : ['', 'select'];
    const btnTag = btns.map((item, idx) => (
      <div className="btnBlock" key={idx}>
        <div className="csFocus btnStyle">
          <span className="wrapBtnText">{item.name}</span>
        </div>
      </div>
    ));

    return (
      <div className="wrap">
        <div className="myBtvLayout">
          <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
          <div className="BpointHistory">
            <h2 className="pageTitle">B포인트 이용내역</h2>
            <p className="subInfo">
              사용가능한 B포인트는
                            <strong><NumberFormat value={usablePoint} />P</strong>입니다.
                        </p>
            <div className="wrapper">
              <div className="left">
                <HistoryTable historyList={historyList}
                  scrollVisible={scrollVisible}
                  scrollHandle={scrollHandle}
                  innerRefs={this.innerRefs} />
              </div>
              <div className="right" id="btnGroup">{btnTag}</div>
            </div>
            <div className="bottomWrap" id="autoMonthly">
              <div className="textWrap">
                <p className="textInfo">B포인트로 월정액 요금 자동 차감하기</p>
                <p className="subDesc">매월 2~3일 전월요금 계산시점에 B포인트 잔액이 남아있는 경우, 월정액 사용요금으로 자동 차감됩니다. </p>
              </div>
              <div className="optionWrap">
                <span className={`csFocus radioStyle ${bpointRun[0]}`}>
                  사용함
                                </span>
                <span className={`csFocus radioStyle ${bpointRun[1]}`}>
                  사용 안 함
                                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default BpointHistory;