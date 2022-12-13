import React, { Component } from 'react';
import FM from 'Supporters/navi';
import { MeTV } from 'Network';
import Utils from 'Util/utils';

import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/my/RecentVod.css';
import keyCodes from 'Supporters/keyCodes';
import PopupPageView from 'Supporters/PopupPageView';

const KEY = keyCodes.Keymap;
const merge = Object.assign;

let focusOpts = {
    btnGroup:{
        id: 'btnGroup',
        containerSelector: '.buttonWrap',
        focusSelector: '.csFocus',
        row: 1,
        col: 2,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 1
    }
}

class ConfirmDeleteAllBookmark extends PopupPageView {
    constructor(props){
        super(props);
        this.state = {
            isLoading: false,
            vods: []
        }

        const focusList = [
            {key: 'btnGroup', fm: null}
        ];

        this.defaultFM = {
            btnGroup: new FM(merge(focusOpts.btnGroup, {
				onFocusKeyDown: this.onKeyDownBtnGroup
			}))
        }

        this.declareFocusList(focusList);
    }

    componentDidMount() {
        this.update();
        document.querySelector('.wrapper').classList.add('dark');
    }

	componentWillUnmount() {
        super.componentWillUnmount();
		document.querySelector('.wrapper').classList.remove('dark');
    }

    initFocus = () => {
        const {btnGroup} = this.defaultFM;        
        this.setFm('btnGroup', btnGroup );
        this.setFocus('btnGroup');
    }

    update = async () => {
        this.setState({
            isLoading: true
        });

        let bookmarkList = [];
        let result = null;
        try {            
            result = await MeTV.request011({ group: 'VOD', entry_no: 60 });
        } catch(err) {
            console.error('err:', err);
        } finally {            
            bookmarkList = result.bookmarkList? result.bookmarkList.map((vod, idx) => {
                const { 
                    title,
                    poster: imgURL,
                    epsd_id: epsdId,
                    sris_id: srisId,
                    adult,
                    epsd_rslu_id: epsdRsluId
                } = vod;
                const bAdult = adult === 'Y';
                return {
                    title,
                    imgURL,
                    epsdId,
                    srisId,
                    bAdult,
                    epsdRsluId
                };
            }): [];
            
            this.setState({ 
                ...this.state,
                vods: bookmarkList,
                isLoading: false
            });
        }
        this.initFocus();
    }

    onKeyDownBtnGroup = (evt, focusIdx) => {
		if ( evt.keyCode === KEY.ENTER ) {
			if ( focusIdx === 0 ) {			// 삭제
				this.onSelectDelete();
            } else if ( focusIdx === 1 ) {	// 취소
				this.onSelectCancel();
			}
		}
	}

    onSelectDelete = () => {
        this.bookmarkAllDelete();
    }

    onSelectCancel = () => {
        this.props.callback({ result: false });
    }

    // 1 : 그룹별 전체삭제
    // isAll_type > 0 이면, deleteList=null 또는 deleteList=[]로 요청해야함
    bookmarkAllDelete = () => {
        const actionType = 'A'; // 전체삭제
        let param = {
            group: 'VOD',
            isAll_type: '1',
            deleteList: [],
            sris_id: '' // 전체삭제인 경우 공백으로 전달
        }
        
        Utils.bookmarkDelete(param, actionType).then((result) => {
            if (result.result === "0000") {
                this.props.callback({ result: true });
            }
        });
    }

    render() {
        const { vods } = this.state;
        let title = '';
        let totalNum = 0;
        console.log('---------vods:', vods[0]);
        if( vods[0] !== undefined){
            title = vods[0].title;
            totalNum = vods.length - 1;
        }
        
        return (
            <div className="wrap">
				<div className="registWrap vodPop">
					<h2 className="pageTitle">찜 VOD 전체삭제</h2>
					<div className="registerAllDel">
						<p className="textAllDel">찜 해놓으신 {title} 외 {totalNum}편의 VOD 콘텐츠 목록을<br/>모두 삭제 하시겠습니까?</p>
					</div>
                    <div id="btnGroup">
                        <div className="buttonWrap">
                            <Button label="삭제" onSelect={this.onSelectDelete} />
                            <Button label="취소" onSelect={this.onSelectCancel} />
                        </div>
                    </div>
				</div>
			</div>
        );
    }
}

class Button extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused : false
        }
    }
    
    render() {
        const { focused } = this.state;
        const { label } = this.props;
        const focusClass = `csFocus btnStyle${focused? ' focusOn':''}`;
        return(
            <span className={focusClass}>
                <span className="wrapBtnText">{label}</span>
            </span>
        )
    }
}

export default ConfirmDeleteAllBookmark;