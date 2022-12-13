import Core from './core';
import FocusManager, { FOCUSING_TYPE } from './FocusManager';
// import keyCodes from 'Supporters/keyCodes';

class PopupPageView extends FocusManager {
    constructor(props) {
        super(props);
        // console.log('props', props);

        /**
         * back 됐을때 이전 page의 this.state 값을 넣어준다.
         */
        this.historyData = props.location.historyData;
        /**
         * movePage 됐을때 넘겨받은 parameter(object) 값을 넣어준다.
         */
        this.paramData = props.data;
        this.keyPathname = this.props.location.pathname + '_' + new Date().getTime()
        Core.inst().addKeyListener('keydown', this.onKeyDown, this);
    }

    componentGoBack(data) {
        // console.log('pageView componentGoBack', data);
    }

    componentWillMount() {

        // console.log('pageView componentWillMount', this.props);
    }

    componentDidMount() {
        // console.log('pageView componentDidMount', this.props);
    }

    componentWillUnmount() {
        try {
            window.tvExt.utils.ime.setSearchMode(false);
        } catch (error) {
        }
        this.props.setHistory(this.props.location.pathname, this.state);
        Core.inst().removeKeyListener('keydown', this.onKeyDown, this);
    }

    onKeyDown(evt) {
        console.error('popup.keydown', evt, this.arrangedFocusList, 'focusedIdx:', this.focusIndex);
        
        this.handleKeyEvent(evt);
    }

    moveBack() {
        Core.inst().back();
    }

    movePage = (path, obj) => {
        Core.inst().move(path, obj);
    }
}

export { FOCUSING_TYPE, PopupPageView as default };