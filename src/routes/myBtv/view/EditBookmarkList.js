import React, { Component } from 'react';
import PageView from 'Network/../PageView.js';
// import Navigation, { HorizontalList, Focusable } from 'Navigation';
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/my/RecentVod.css';
// import { SlideType, G2SlideEditableBookmarkVOD, G2NaviSlider as G2NaviSliderEditBookmark } from 'Module/G2Slider';
import { SlideType, G2SlideEditableBookmarkVOD, G2NaviSliderEditBookmark } from 'Module/G2Slider';
import { MeTV } from 'Network';
import { PATH, GNB_CODE } from 'Config/constants';
import FM from 'Supporters/navi';
import Utils from 'Util/utils';
import Core from 'Supporters/core';
import keyCodes from 'Supporters/keyCodes';
import StbInterface from 'Supporters/stbInterface';
import ConfirmDeleteAllBookmark from './ConfirmDeleteAllBookmark';

const STB = StbInterface;

// import { fav_sort } from '../../liveTv/organization/OrganizationUtils';

const KEY = keyCodes.Keymap;
const merge = Object.assign;

let focusOpts = {
    bookmarkList: {
        id: 'bookmarkList',
        containerSelector: '.registerWishSlide',
        focusSelector: '.csFocus',
        row: 0,
        col: 0,
        focusIdx: 0,
        startIdx: 0,
        lastIdx: 0,
        bRowRolling: true
    },
    btnGroup: {
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
class EditBookmarkList extends PageView {
    constructor(props) {
        super(props);

        this.state = {
            vods: []
        }

        this.defaultFM = {
            btnGroup: new FM(merge(focusOpts.btnGroup, {
                onFocusKeyDown: this.onKeyDownBtnGroup
            }))
        }

        const focusList = [
            { key: 'bookmarkList', fm: null },
            { key: 'btnGroup', fm: null }
        ];

        this.declareFocusList(focusList);
        this.totalItem = 0;
        this.curVodFocIdx = -1;
    }

    static defaultProps = {
    }

    componentDidMount() {
        const { showMenu } = this.props;
        showMenu(false);
        this.update();
        document.querySelector('.wrapper').classList.add('dark');
    }

    componentWillUnmount() {
        document.querySelector('.wrapper').classList.remove('dark');
    }


    update = async () => {
        this.setState({
            isLoading: true
        });

        let bookmarkList = [];
        let result = null;
        try {
            result = await MeTV.request011({ group: 'VOD', entry_no: 60 });
        } catch (err) {
            console.error('err:', err);
        } finally {
            bookmarkList = result.bookmarkList ? result.bookmarkList.map((vod, idx) => {
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
            }) : [];

            this.setState({
                ...this.state,
                vods: bookmarkList,
                isLoading: false
            });
        }
        this.totalItem = bookmarkList.length;
        this.initFocus();
    }

    initFocus = () => {
        let vodCurfocus = this.curVodFocIdx;
        const lastIdx = this.state.vods.length - 1;
        if (lastIdx !== -1 & vodCurfocus !== -1) {
            vodCurfocus = vodCurfocus > this.state.vods.length - 1 ? lastIdx : vodCurfocus;
            this.setFocus('bookmarkList', vodCurfocus);
        } else {
            const { btnGroup } = this.defaultFM;
            this.setFm('btnGroup', btnGroup);
            this.setFocus('btnGroup');
        }
    }

    onKeyDownBtnGroup = (evt, focusIdx) => {
        if (evt.keyCode === KEY.ENTER) {
            if (focusIdx === 0) {
                // 전체 삭제
                const { showMenu } = this.props;
                showMenu(false);
                Core.inst().showPopup(<ConfirmDeleteAllBookmark />, {}, (info) => {
                    if (info.result) {
                        this.moveBack();
                    }
                })
            } else if (focusIdx === 1) {	// 취소
                this.moveBack();
            }
        }
    }

    onSelectBookmarkItem = (slideIdx, idx) => {
        this.curVodFocIdx = idx;
        this.setState({
            ...this.state,
            vodCurFocus: idx
        })
        const { vods } = this.state;
        let vod = vods[idx];
        this.bookmarkDelete(vod);
    }

    // 0 : 단건 또는 복수건 삭제(deleteList는 반드시 설정하여야 함)
    // - isAll_type = 0 deleteList 의 항목값 필수(deleteList=null 또는 deleteList=[] 이면 error)
    bookmarkDelete = (vod) => {
        const actionType = 'D';
        let param = {};
        let vodsNum = this.state.vods.length;
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
                    if (vodsNum > 1) {
                        this.update();
                    } else {
                        const gnb = STB.getGnbMenuList(GNB_CODE.GNB_MYBTV);
                        this.movePage(PATH.MYBTV_HOME, { menuId: gnb.menuId, gnbTypeCode: gnb.gnbTypeCode });
                    }
                }
            });
        }
    }

    render() {
        const { vods } = this.state;
        const vodList = vods.map((vod, idx) => {
            const { title, imgURL, espdId, srisId, bAdult } = vod;
            return (
                <G2SlideEditableBookmarkVOD
                    key={idx}
                    idx={idx}
                    title={title}
                    imgURL={imgURL}
                    espdId={espdId}
                    srisId={srisId}
                    bAdult={bAdult}
                    onSelect={this.onSelectBookmarkItem}
                />
            );
        });
        return (
            <div className="wrap">
                <div className="registWrap vod scrollWrap">
                    <h2 className="pageTitle">VOD 찜 목록 삭제</h2>
                    <p className="subInfo">찜 해놓은 VOD 목록을 편집할 수 있습니다.</p>
                    <div className="registerWishSlide">
                        <G2NaviSliderEditBookmark
                            id="bookmarkList"
                            type={SlideType.EDITABLE_BOOKMARK_LIST}
                            onSelectChild={this.onSelectBookmarkItem}
                            rotate={true}
                            bShow={true}
                            tail={true}
                            /*scrollTo={scrollTo}*/
                            allMenu={false}
                            setFm={this.setFm}
                        >
                            {vodList}
                        </G2NaviSliderEditBookmark>
                    </div>
                    <div id="btnGroup">
                        <div className="buttonWrap">
                            <Btn label="전체삭제" />
                            <Btn label="닫기" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Btn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false
        }
    }

    onFocused = () => {
        this.setState({
            focused: true
        });
    }

    onBlured = () => {
        this.setState({
            focused: false
        })
    }

    onSelect = () => {
        const { onSelect } = this.props;
        if (onSelect && typeof onSelect === 'function') {
            onSelect();
        }
    }

    render() {
        const { focused } = this.state;
        const { label } = this.props;
        const focusClass = `csFocus btnStyle${focused ? ' focusOn' : ''}`;
        return (
            <span className={focusClass}>
                <span className="wrapBtnText">{label}</span>
            </span>
        )
    }
}

export default EditBookmarkList;