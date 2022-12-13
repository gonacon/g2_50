import React, { Component } from 'react';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';


class TopButton extends Component {

    // 맨 위로 버튼 enter 일때
	onKeyDownTopButton = (evt) => {
        const { keyCode } = evt;
        const { Keymap: { ENTER, DOWN } } = keyCodes;
        const { setFocus } = this.props;

		// ENTER
		if (keyCode === ENTER) {
			setFocus('blocks', 0);
		}

		// DOWN
		if (keyCode === DOWN) {
			// console.log('%c this.focusList', 'color: red; background: yellow', this.focusList);
		}
	}

	// 맨 위로 버튼 Focus 될 때
	onFocusChildTopButton = () => {
        const { scrollTo, searchTrigger, setSearchTrigger} = this.props;
		scrollTo('topButton');

		if (searchTrigger) {
			setSearchTrigger(false);
			const scrollWrap = document.querySelector('.scrollWrap');
			const searchWrapper = document.querySelector('.searchWrapper');
			const searchWrapperHeight = searchWrapper.clientHeight;
			let curStyle = scrollWrap.style.transform;
			let posX = +curStyle.replace(/translate\(|\)|px|\s/gi, '').split(',')[1];
			searchWrapper.classList.remove('active');
			// console.log('top sum = ' + (posX + searchWrapperHeight));

			scrollWrap.style.transform = `translate(0px, ${posX + searchWrapperHeight}px)`;
		}
    }
    
    componentDidMount = () => {
        const { setFm } = this.props;
        const fm = new FM({
            id: 'topButton',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onKeyDownTopButton,
            onFocusChild: this.onFocusChildTopButton
        });
        setFm('topButton', fm);
    }
    

    render() {
        const { bShow } = this.props;
        return (
            bShow ?
            <div className="contentGroup">
                <div className="btnTopWrap">
                    <span className="csFocus btnTop" id="topButton" >
                        <span>맨 위로</span>
                    </span>
                </div>
            </div>
            : 
            null
        )
    }

}

export default TopButton;