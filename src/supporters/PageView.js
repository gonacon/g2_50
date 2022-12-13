import HistoryManager from './history';
import Core from './core';
import FocusManager, { FOCUSING_TYPE } from './FocusManager';
import { scroll } from 'Util/utils';

class PageView extends FocusManager {
    constructor(props) {
        super(props);
        /**
         * back 됐을때 이전 page의 this.state 값을 넣어준다.
         */
        this.historyData = '';
        /**
         * movePage 됐을때 넘겨받은 parameter(object) 값을 넣어준다.
         */
        this.paramData = '';

        if (props.history) {
            if (props.history.action === HistoryManager.POP) {
                try {
                    this.historyData = HistoryManager.pop();
                } catch (error) {
                    this.historyData = '';
                }
                this.componentGoBack(this.historyData);
            } else if (props.history.action === HistoryManager.PUSH) {
                this.paramData = props.history.location.state;
            }
        }
        this.keyPathname = this.props.location.pathname + '_' + new Date().getTime()
        Core.inst().addKeyListener('keydown', this.onKeyDown, this);

        this.restorePreviousFocus = this.restorePreviousFocus.bind(this);
    }

    componentGoBack(data) {
    }

    componentWillMount() {
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        Core.inst().removeKeyListener('keydown', this.onKeyDown, this);
        try {
            window.tvExt.utils.ime.setSearchMode(false);
        } catch (error) {
        }
        if (this.props.history) {
            // console.log('pageView componentWillUnmount this.props.location.pathname=%s action=%s', this.props.location.pathname, this.props.history.action);
            if (this.props.history.action === HistoryManager.PUSH) {
                const currentFocusInfo = this.getCurrentFocusInfo();
                let focusInfo = null;
                if (currentFocusInfo) {
                    focusInfo = {
                        key: currentFocusInfo.key,
                        idx: currentFocusInfo.idx,
                        focusedIdx: currentFocusInfo.fm.listInfo.curIdx
                    };
                };
                if (this.state) {
                    this.state.__FOCUSINFO__ = focusInfo;
                }
                
                HistoryManager.push(this.props.location.pathname, this.state);
            }
        }
    }

    restorePreviousFocus() {
        const prevFocusInfo = this.historyData.__FOCUSINFO__;
        if (prevFocusInfo) {
            const { key: id, idx, focusedIdx: childIdx } = prevFocusInfo;
            return this.setFocus({id, idx, childIdx});
        } else {
            console.error('이전 포커스 정보가 없습니다');
            return false;
        }
        
    }

    onKeyDown(evt) {
        this.handleKeyEvent(evt);
    }

    moveBack() {
        Core.inst().back();
    }

    //movePage = (path, obj) => {       // NOTE: 이 방식의 경우 상속받은 class가 super.movePage() 형식으로 사용할 때 오류 발생
    movePage(path, obj) {
        Core.inst().move(path, obj);
    }

    scrollTo = (anchor, marginTop) => {
		let top = 0;
		let offset = 0;
		if (anchor) {
			top = anchor.offsetTop;
		}
		const margin = marginTop ? marginTop : 0;
		let bShowMenu = true;
		if (top > 500) {
			offset = -(top - 60) + margin;
			bShowMenu = false;
		} else {
			offset = 0;
		}
		scroll(offset);
		const { showMenu } = this.props;
		showMenu(bShowMenu, true);
	}

}

export { FOCUSING_TYPE, PageView as default };