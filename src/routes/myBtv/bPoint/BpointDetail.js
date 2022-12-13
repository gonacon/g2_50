// commons
import React from 'react';
import PageView from 'Supporters/PageView';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';

// style
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/bPoint/BpointDetail.css';

// network
import { EPS } from 'Network';
import { CTSInfo } from 'Supporters/CTSInfo';

// components 
import NumberFormat from 'Module/UI/NumberFormat';
import appConfig from './../../../config/app-config';

const { Keymap: { ENTER } } = keyCodes;
const merge = Object.assign;

let focusOpts = {
    chargeList: {
        id : 'chargeList',
		moveSelector : '.listWrapper li',
        focusSelector : '.csFocus',
        row : 1,
        col : 5,
        focusIdx : 0,
        startIdx : 0,
		lastIdx : 4,
    },
}

class BpointDetail extends PageView {

    constructor(props) {
        super(props);

        this.state = {
            slideItem : [],
        };

        this.defaultFM = {
			chargeList: new FM(merge(focusOpts.chargeList, {
				onFocusKeyDown: this.pointCharge,
            }))
        };
        
        const focusList = [
            { key: 'chargeList', fm: null },
		];
		this.declareFocusList(focusList);
    }

    pointCharge = (evt, idx) => {
        if ( evt.keyCode !== ENTER ) return;
        const { slideItem } = this.state;
        // 구매 팝업 띄우기
        const callback = (a, b, c) => {
            console.log('%c abc', 'color: red; background: yellow', a, b, c);
            // TODO: 구매 완료 후 처리할 부분 들...
        };
        console.log('%c B포인트 구매팝업 호출시 넘기는 DATA', 'color: red; background: yellow', slideItem[idx]);
        CTSInfo.purchaseBPoint(slideItem[idx], callback);
    }

    initFocus = () => {
        this.setFm('chargeList', this.defaultFM.chargeList);
        this.setFocus(0);
    }

    componentDidMount() {
        this.props.showMenu(false);
        EPS.request100({ transactionId: 'List_of_points_available_for_purchase' })
        .then(data => {
            let slideItem = data.bpoints.bpoint.map((item, idx) => ({
                title: item.title,
                supplyAmount: item.supplyAmount,
                totalAmount: item.totalAmount,
                masterNo: item.masterNo,
                expireMessage: item.expireMessage
            }));

            this.setState({ slideItem }, () => {
                this.defaultFM.chargeList.setListInfo({
                    col: this.state.slideItem.length,
                    lastIdx: this.state.slideItem.length - 1,
                })
                this.initFocus();
            });
        })
        .catch(err => new Error(err));
    }

    sendRegistInfo = (idx) => {
        const { slideItem } = this.state;
        console.log('%c bpoint_masterNo', 'color: green', slideItem[idx].masterNo);
        // 아직 라우트가 없음
    }

    renderDetailItem = () => {
        let { slideItem } = this.state;
        return (slideItem.map((data, idx) => (
            <li className={"type0" + (idx+1)} key={idx}>
                <div className="csFocus">
                    <span className="point">
                        <NumberFormat value={data.supplyAmount} unit="P"/>
                    </span>
                    <span className="text">충전하기</span>
                    <span className="price">
                        <span className="number">
                            <NumberFormat value={data.totalAmount}/>
                        </span>
                        <span className="value">원</span>
                    </span>
                </div>
            </li>
        )));
    }

    render() {
        return(
            <div className="wrap">
                <div className="myBtvLayout">
                    <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                    <div className="BpointDetail">
                        <h2 className="pageTitle">B포인트 충전</h2>
                        <p className="subInfo">원하시는 B포인트를 선택해주세요.</p>
                        <div className="bPointList" id="chargeList">
                            <ul className="listWrapper">{ this.renderDetailItem() }</ul>
                        </div>
                        {/* 하단영역 구조 수정 */}
                        <div className="bottomWrap">
                            <div className="defaultWrap">
                                <p className="infoText">
                                    B포인트는 B tv 유료 콘텐츠를 구매하실 때 현금처럼 사용할 수 있으며,<br/>
                                    선물로 받으신 B포인트는 ‘B포인트 등록’ 메뉴를 통해 등록번호를 입력하시면 사용하실 수 있어요.
                                </p>
                            </div>
                        </div>
                    </div>
					<div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
                </div>
            </div>
        )
    }

}

export default BpointDetail;
