import React, { Component } from 'react';
import StbInterface from 'Supporters/stbInterface';
import keyCodes from 'Supporters/keyCodes';
import constants, { MENU_NAVI, MENU_ID } from 'Config/constants';
import FM from 'Supporters/navi';



const { Keymap: { ENTER } } = keyCodes;

class OksusuConnectButton extends Component {

    onFocusOksusuConnectButton = () => {
        // console.log('oksusu 연결 버튼 FOCUS');
    }

    onKeyDownOksusuConnectButton = (evt) => {
        if ( evt.keyCode !== ENTER ) return ;
        StbInterface.menuNavigationNative(MENU_NAVI.SETTING, { menuId: MENU_ID.SETTING_CONNECTION_OKSUSU, });
    }

    componentDidMount = () => {
        const { setFm } = this.props;
        const fm = new FM({
            id : 'oksusuConnectButton',
            type: 'ELEMENT',
            focusSelector : '.csFocus',
            row : 1,
            col : 1,
            focusIdx : 0,
            startIdx : 0,
            lastIdx : 0,
            onFocusChild: this.onFocusOksusuConnectButton,
            onFocusKeyDown: this.onKeyDownOksusuConnectButton
        });
        setFm('slide', fm);
    }

    componentWillUnmount() {
        
    }
    
    

    render() {
        return (
            <span className="csFocus btnStyle type03" id="oksusuConnectButton">
                <span className="wrapBtnText">oksusu 연결</span>
            </span>
        )
    }
}

export default OksusuConnectButton;