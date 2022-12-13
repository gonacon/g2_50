import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/my/MyWishTotalList.css';
import 'Css/myBtv/my/MyWishTotalDelete.css';
import 'Css/myBtv/my/ListItemType.css';

import React from 'react';

import Core from 'Supporters/core';
import keyCodes from "Supporters/keyCodes";
import FM from 'Supporters/navi';
import PageView from 'Supporters/PageView';

import { MeTV } from 'Network';

import { PATH, CERT_TYPE, STB_TYPE, STB_PROP } from 'Config/constants';

import Utils, { scroll } from 'Util/utils';
import { isEmpty } from 'lodash';

import GridBookmarkList from '../component/GridBookmarkList';
import appConfig from 'Config/app-config';
import AdultCertification from '../../../popup/AdultCertification';
import StbInterface from './../../../supporters/stbInterface';
import ConfirmDeleteAllBookmark from './ConfirmDeleteAllBookmark';

const KEY = keyCodes.Keymap;
const MAX_COUNT = 60;
const COL_COUNT = 6;
const EDIT_BUTTON_ID = 'editButton';
const BOOKMARK_ID = 'bookmarkList';
const TOP_BUTTON_ID = 'topButton';

class BookmarkList extends PageView {
    constructor(props) {
        super(props);

        if(isEmpty(this.historyData)) {
            this.state = {
                editState: false,
                bookmarkList: [],
                curColIdx: 0,
                curRowIdx: 0
            }
            this.bRecover = false;
        } else {
            this.state = this.historyData;
            this.bRecover = true;
        }
        
        this.totalItem = 0;
		const focusList = [
			{ key: EDIT_BUTTON_ID, fm: null },
			{ key: BOOKMARK_ID, fm: null },
			{ key: TOP_BUTTON_ID, fm: null }
		];
		this.declareFocusList(focusList);
    }

    componentDidMount() {
        const { showMenu } = this.props;
        showMenu(false);
        this.updateVodInfo();

        const editButtonFm = new FM({
            id: EDIT_BUTTON_ID,
            containerSelector : '.btnListWrap',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onKeyDownEditBtn
        });

        const bookmarkListFm = new FM({
            id : BOOKMARK_ID,
            containerSelector : '.listWrapper',
            moveSelector : '.slide',
            focusSelector : '.csFocus',
            row : 0,
            col : COL_COUNT,
            focusIdx : 0,
            startIdx : 0,
            lastIdx : 0,
            onFocusChild: this.onFocusChanged,
            onFocusKeyDown: this.onKeyDownContents
        });

        const topButtonFm = new FM({
			id: TOP_BUTTON_ID,
			type: 'ELEMENT',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onKeyDownTopBtn,
        });
        
        this.setFm(EDIT_BUTTON_ID, editButtonFm);
        this.setFm(BOOKMARK_ID, bookmarkListFm);
        this.setFm(TOP_BUTTON_ID, topButtonFm);
        this.setFocusEnable(EDIT_BUTTON_ID, this.state.editState);
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.state.editState !== prevState.editState) {
            this.controlEditBtn();
        }
    }

    controlEditBtn = () => {
        let focusId = this.state.editState? EDIT_BUTTON_ID : BOOKMARK_ID;
        this.setFocusEnable(EDIT_BUTTON_ID, this.state.editState);
        this.setFocus(focusId, 0);
        this.scrollTo(0);
    }

    updateVodInfo = async () => {
		const bookedVods = await MeTV.request011({ group: 'VOD', page: 1, entry_no: MAX_COUNT });
        const bookedkList = bookedVods.bookmarkList ? bookedVods.bookmarkList : [];
        this.totalItem = bookedVods.bookmark_tot ? bookedVods.bookmark_tot : 0;
        let lastIndex = this.totalItem > 0 ? this.totalItem - 1 : 0;
        let rowCnt = Math.ceil(this.totalItem / COL_COUNT);

        let parsingList = bookedkList.map((vod, idx) => {
			const {
				title,
				poster: imgURL,
				epsd_id: epsdId,
				sris_id: srisId,
                adult,
                level,
                epsd_rslu_id: epsdRsluId,
                catchup, // VOD 컨텐츠의 신규 회차 배포 Y/N,
                material_cd: materialCode //즐겨찾기한 컨텐츠의 소재상태코드(65:배포승인, 80:배포만료 등)
			} = vod;
			const bAdult = adult === 'Y';
            const bCatchup = catchup === 'Y';
			return {
				title,
				imgURL,
				epsdId,
				srisId,
                bAdult,
                level,
                epsdRsluId,
                materialCode,
                flag: {
                    flagNew: bCatchup
                }
			};
        });

        let bookmarkList = [];

        for(let i = 0; i < rowCnt; i++) {
            bookmarkList[i] = parsingList.splice(0, COL_COUNT);
        }
        
		this.setState({
            ...this.state,
			bookmarkList
        });
        const bookmarkListFm = this.getFm(BOOKMARK_ID);
        bookmarkListFm.setListInfo({
            row: rowCnt,
            lastIdx: lastIndex
        });

        if (bookmarkList.length === 0) {
            this.setFocus(TOP_BUTTON_ID);
            this.bRecover = false;
            return;
        }

        // 현재 리커버되는 경우가 두가지 밖에 없음(일반모드<->시놉시스, 편집모드<->전체삭제)
        // 만약 리커버되는 경우의 수가 많아지면 마지막 포커스의 정보를 저장해야할 것 같음,,
        if( this.state.editState && this.bRecover) { // 편집모드에서 리커버
            this.setFocus(EDIT_BUTTON_ID, 0);
        } else {
            const { curColIdx, curRowIdx } = this.state;
            const curIdx = this.bRecover ? (curRowIdx * COL_COUNT) + curColIdx : bookmarkListFm.getFocusedIndex(); // 일반모드에서 리커버
            this.setFocus(BOOKMARK_ID, (curIdx > lastIndex) ? lastIndex : curIdx);
        }
        this.bRecover = false; // 리커버되고나면 초기화
    }

    onKeyDownEditBtn = (event, idx) => {
        switch(event.keyCode) {
            case KEY.ENTER:
                if(idx === 0) {
                    // 전체삭제
                    const { showMenu } = this.props;
                    showMenu(false);
                    Core.inst().showPopup(<ConfirmDeleteAllBookmark />, {}, () => {
                        this.moveBack();
                    })
                } else if(idx === 1) {
                    // 편집모드 종료
                    this.setState({
                        ...this.state,
                        editState: false
                    });
                }
                break;
            case KEY.DOWN:
                this.setFocus(BOOKMARK_ID, 0); // 컨텐츠 리스트로 포커스 이동
                this.getFm(EDIT_BUTTON_ID).listInfo.curIdx = 0; // 편집모드 버튼 인덱스 초기화
                return true;
            default:
                break;
        }
    }

    onKeyDownContents = (event, idx) => {
        switch(event.keyCode) {
            case KEY.ENTER:
                if(this.state.editState) {
                    this.bookmarkDelete();
                } else {
                    this.onSelectVOD(idx);
                }
                break;
            case KEY.FAV:
                if(!this.state.editState) {
                    this.bookmarkDelete();
                }
                break;
            case KEY.BLUE:
            case KEY.BLUE_KEY:
            case KEY.OPTION:
            case KEY.OPTION_KEY:
                this.setState({
                    ...this.state,
                    editState: true
                });
                break;
            default:
                break;            
        }
    }

    onKeyDownTopBtn = (event) => {
        switch(event.keyCode) {
            case KEY.ENTER:
                this.setFocus(BOOKMARK_ID, 0);
                break;
            case KEY.BLUE:
            case KEY.BLUE_KEY:
            case KEY.OPTION:
            case KEY.OPTION_KEY:
                this.setState({
                    ...this.state,
                    editState: true
                });
                break;
            default:
                break;            
        }
    }

    onFocusChanged = (idx) => {
        const curRowIdx = Math.floor(idx / COL_COUNT);
        const curColIdx = idx % COL_COUNT;
        this.setState({
            ...this.state,
            curColIdx: curColIdx,
            curRowIdx: curRowIdx
        });
        
        this.textOver();
        this.scrollTo(curRowIdx);
    }

    onSelectVOD = () => {
        const { bookmarkList, curColIdx, curRowIdx } = this.state;
        let vod = bookmarkList[curRowIdx][curColIdx];
		if (vod) {
            if(vod.materialCode === '65') { // 배포승인
                const param = {
                    epsd_id: vod.epsdId,
                    sris_id: vod.srisId,
                    epsd_rslu_id: vod.epsdRsluId,
                    menuId: ''
                };
                let settingAge;
                if (!appConfig.runDevice) {
                    settingAge = appConfig.STBInfo.level;
                } else {
                    settingAge = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);
                }
                if ( vod.adult === 'Y' && Number(vod.level) >= 19 && settingAge !== '0') {
                    Core.inst().showPopup(<AdultCertification />, {
                        certification_type: CERT_TYPE.ADULT_SELECT,
                        age_type: ''
                    }, res => {
                        if ( res.result === '0000' ) {
                            this.movePage(PATH, param);
                        }
                    });
                } else {
                    Utils.movePageAfterCheckLevel(PATH.SYNOPSIS, param, vod.level);
                }
            } else if(vod.materialCode === '80') { // 배포만료
                // Btv 서비스 종료 콘텐츠 팝업 구현해야 함(확인 버튼 있는 팝업), 일단 토스트 팝업 넣음
                Core.inst().showToast('알림', '서비스가 종료된 콘텐츠입니다.', 2000)
            }
		}
    }

    // 0 : 단건 또는 복수건 삭제(deleteList는 반드시 설정하여야 함)
    // isAll_type = 0 deleteList 의 항목값 필수(deleteList=null 또는 deleteList=[] 이면 error)
    bookmarkDelete = () => {
        const { bookmarkList, curColIdx, curRowIdx } = this.state;
        const actionType = 'D';
        let param = {};

        let vod = bookmarkList[curRowIdx][curColIdx];
        if (vod) {
            param = {
                group: 'VOD',
                isAll_type: '0',
                deleteList: [vod.srisId],
                sris_id: vod.srisId
            }
            Utils.bookmarkDelete(param, actionType).then((result) => {
                if (result.result === "0000") {
                    Core.inst().showToast(vod.title, '찜 등록 해제되었습니다.', 2000);
                    if(this.totalItem > 1) {
                        this.updateVodInfo();
                    } else {
                        this.movePage(PATH.MYBTV_HOME);
                    }
                }
            });
        }
    }
    
    scrollTo = (curRowIdx) => {
        const scrollHeightVal = 1080;
        const contentGroup = document.querySelectorAll('.contentGroup');
        const eachVal = contentGroup[curRowIdx];
        if (!eachVal) {
            return;
        }

        const wrapCon = document.querySelector('.wrap');
        let scrollTopValue = eachVal.offsetTop;

        if(((scrollTopValue + eachVal.offsetHeight) <= scrollHeightVal)) {
            scrollTopValue = 0;
        } else if((wrapCon.offsetHeight - scrollHeightVal <= scrollTopValue)) {
            scrollTopValue = wrapCon.offsetHeight - scrollHeightVal;
        }
        scroll(-scrollTopValue);
    }

    textOver = () => {
        const { bookmarkList } = this.state;
        if (bookmarkList.length === 0) {
            return;
        }
        const focusEl = this.getFm(BOOKMARK_ID).getFocusElement();
		if(focusEl.querySelector('.itemTitle').clientWidth >= focusEl.clientWidth && (focusEl.classList.contains('left') || focusEl.classList.contains('right'))){
			focusEl.classList.add('textOver');
		}
    }
    
    render() {
		return (
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <div className={`${this.state.editState ? 'wishDeleteTotalWrap' : 'wishTotalListWrap'} scrollWrap`}>
                    <h2 className="pageTitle">VOD 찜 {this.state.editState ? '목록 삭제' : '전체목록'}</h2>
                    {
                        this.state.editState ? <p className="subInfo">고객님이 찜해놓으신 VOD 목록을 삭제할 수 있습니다.</p>
                        : <p className="subInfo">총 <strong className="count">{this.totalItem}</strong>개의 찜한 VOD 콘텐츠가 있습니다. 찜 목록은 최대 60개까지만 저장됩니다.</p>
                    }
                    {
                        this.state.editState ? 
                        <div id={EDIT_BUTTON_ID} className="btnListWrap">
                            <span tabIndex="-1" className="csFocus btnStyle">
                                <span className="wrapBtnText">전체삭제</span>
                            </span>
                            <span tabIndex="-1" className="csFocus btnStyle">
                                <span className="wrapBtnText">닫기</span>
                            </span>
                        </div>
                        : <span className="keyGuideWrap"><span className="btnKey"><span className="btnKeyBlue"></span> / <span className="btnKeyOption"></span>목록삭제</span></span>
                    }
                    <GridBookmarkList slideItem={this.state.bookmarkList} fmId={BOOKMARK_ID} editState={this.state.editState}/>
					<div className="btnTopWrap">
						<span id={TOP_BUTTON_ID} className="csFocus btnTop" tabIndex="-1"><span>맨 위로</span></span>
					</div>
                </div>
            </div>
		)
    }
}

export default BookmarkList;