import React, { Component } from 'react';
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import StbInterface from 'Supporters/stbInterface';

const { Keymap: { ENTER } } = keyCodes;

class PLReadingDisableButton extends Component {

    onButtonKeyDown = (evt) => {
        console.log('구매내역 열람 해제 버튼 KEYDOWN');
        if ( evt.keyCode !== ENTER ) return ;

        // TOFO 구매내역 열람 해제 기능 STB I/F
        const { stbData, setFocus, initOksusuList } = this.props;
        StbInterface.oksusuPurchaseInfo({
            purchaseList: '0',
            unlimitedVod: stbData
        });

        setFocus('tab', 3);
        initOksusuList();
    }

    onButtonFocus = () => {
        // console.log('구매내역 열람 해제 버튼 FOCUS');
    }

    componentDidMount = () => {
        const { setFm } = this.props;
        const fm = new FM({
            id : 'disableButton',
            type: 'ELEMENT',
            focusSelector : '.csFocus',
            row : 1,
            col : 1,
            focusIdx : 0,
            startIdx : 0,
            lastIdx : 0,
            onFocusChild: this.onButtonFocus,
            onFocusKeyDown: this.onButtonKeyDown
        });
        setFm('disableButton', fm);
    }

    componentWillUnmount = () => {
        const { setFm } = this.props;
        setFm('disableButton', null);
    }
    

    render() {
        return (
            <span className="csFocus btnStyle type03" id="disableButton">
                <span className="wrapBtnText">oksusu 구매내역 열람 해제</span>
            </span>
        )
    }
}

export default PLReadingDisableButton;
