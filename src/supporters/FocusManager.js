import { Component } from 'react';
import isNil from 'lodash/isNil';

const DirectionTable = {
    37: 'LEFT',
    39: 'RIGHT',
    38: 'UP',
    40: 'DOWN'
};

const log = function() { console.log(...arguments); }
// const log = function () { }

const FOCUSING_TYPE = {
    INDEX: 0,
    CLOSEST: 1
};



class FocusManager extends Component {
    constructor(props) {
        super(props);

        this.focusingType = FOCUSING_TYPE.INDEX;

        this.focusList = [];
        this.arrangedFocusList = [];
        this.focusIndex = -1;

        this.setFm = this.setFm.bind(this);
        this.declareFocusList = this.declareFocusList.bind(this);
        this.addFocusList = this.addFocusList.bind(this);
        this.setFocus = this.setFocus.bind(this);
        this.setFocusEnable = this.setFocusEnable.bind(this);
        this.handleKeyEvent = this.handleKeyEvent.bind(this);
        this.onFocusMoveUnavailable = this.onFocusMoveUnavailable.bind(this);
        this.setFocusOnArrangedListByKey = this.setFocusOnArrangedListByKey.bind(this);
        this.getFocusInfo = this.getFocusInfo.bind(this);
        this.setFocusingType = this.setFocusingType.bind(this);
        this.focusPrev = this.focusPrev.bind(this);
        this.focusNext = this.focusNext.bind(this);
    }

    setFocusingType(type) {
        this.focusingType = type;
    }

    declareFocusList(focusList) {
        const list = [];
        for (let menu of focusList) {
            menu = { ...menu, enable: true };
            list.push(menu);
        }
        this.focusList = list;
    }

    addFocusList(focusList) {
        const list = this.focusList;
        for (let menu of focusList) {
            menu = { ...menu, enable: true };
            list.push(menu);
        }
        this.focusList = list;
    }

    setFocusEnable(key, enable) {
        for (let menu of this.focusList) {
            if (menu.key === key) {
                menu.enable = enable;
            }
        }
        this.arrangeFocusList();
    }

    resetFmList(key) {
        let bFound = false;
        for (let focus of this.focusList) {
            if (focus.key === key) {
                bFound = true;
                if (Array.isArray(focus.fm)) {
                    focus.fm = [];
                }
            }
        }
        if (!bFound) {
        }
        this.arrangeFocusList(); // ????????? ??????
    }

    setFm(key, fm) {
        // log(`view: setFm[${key}] fm:`, fm);
        let bFound = false;
        for (let focus of this.focusList) {
            if (focus.key === key) {
                bFound = true;
                if (Array.isArray(focus.fm)) {
                    focus.fm.push(fm);
                } else {
                    focus.fm = fm;
                }
            }
        }
        // log('a-list', this.focusList, this.arrangedFocusList);
        if (!bFound) {
            // console.error('????????? ????????? ???????????? ??????:', key);
            return;
        }
        this.arrangeFocusList(); // ????????? ??????
    }

    getFm(key) {
        for (let focus of this.focusList) {
            if (focus.key === key) {
                return focus.fm;
            }
        }
        //  console.log('????????? ????????? ????????? ????????????');
        return null;
    }

    setLink(key, link) {
        let bFound = false;
        for (let focus of this.focusList) {
            if (focus.key === key) {
                bFound = true;
                focus.link = link;
            }
        }
        this.arrangeFocusList(); // ????????? ??????
        if (!bFound) {
            //  console.log('setLink:: key??? ?????? ??? ??????', key);
        }
    }

    focusPrev() {
        console.error('prev focus');
        let focusIndex = this.focusIndex;
        focusIndex--;
        if (focusIndex < 0) {
            focusIndex = 0
        }
        this.focusIndex = focusIndex;
        this.setFocus(this.focusIndex);
    }

    focusNext() {
        let focusIndex = this.focusIndex;
        if (focusIndex >= this.arrangedFocusList.length) {
            focusIndex = this.arrangedFocusList.length - 1;
        }
        this.focusIndex = focusIndex;
        this.setFocus(this.focusIndex);
    }

    setFocus(ContainerIdx, childIdx, direction) {
        // console.log(`setFocus[${ContainerIdx}]`, childIdx );
        // console.log('arrangedFocusList', this.arrangedFocusList);

        let focusInfo = null;
        let focusIndex = -1;
        if (typeof ContainerIdx === 'string') { // string ???: this.setFocus('recommendVods', 2);
            for (let i = 0; i < this.arrangedFocusList.length; i++) {
                const focus = this.arrangedFocusList[i];
                if (focus.key === ContainerIdx) {
                    focusInfo = focus;
                    focusIndex = i;
                    break;
                }
            }
        } else if ( typeof ContainerIdx === 'object') { // ???: this.setFocus({ id: 'blocks', idx: 3, childIdx: 4 });
            const { 
                id,
                idx,
                childIdx: childrenIdx,
                direction: dir
            } = ContainerIdx;
            
            const cnt = this.arrangedFocusList.length;
            for (let i=0; i < cnt; i++) {
                const focus = this.arrangedFocusList[i];
                if (focus.key === id && (!idx || (idx && idx === focus.idx))) {
                    focusInfo = focus;
                    focusIndex = i;
                    childIdx = childrenIdx;
                    direction = dir;
                    break;
                }
            }
        } else if ( !Array.isArray(ContainerIdx) && typeof ContainerIdx === 'object' ) {    // object
            for (let i = 0; i < this.arrangedFocusList.length; i++) {
                const focus = this.arrangedFocusList[i];
                if (focus.key === ContainerIdx.key && focus.idx === ContainerIdx.childIdx ) {
                    focusInfo = focus;
                    focusIndex = i;
                    break;
                }
            }
        } else { // number ???: this.setFocus(0);
            focusInfo = this.arrangedFocusList[ContainerIdx];
            if (focusInfo) {
                focusIndex = ContainerIdx;
            }
        }

        if (focusIndex === -1) {
            log('[setFocus] ?????? focusInfo??? ????????? ??????', ContainerIdx, childIdx, direction);
            return false;
        }

        // remove prev
        let prevChildIdxOnPage = -1;
        let prevPage = -1;
        let prevMaxItem = -1;
        if (this.focusIndex !== -1) {
            const focusInfo = this.arrangedFocusList[this.focusIndex];
            if (focusInfo && focusInfo.fm) {
                // ????????? 'BLOCK'????????? 'FAKE'??? ?????? ?????? ?????????????????? 'page'?????? 'page'???????????? index??? ?????????.
                if (focusInfo.fm.type === 'BLOCK' || focusInfo.fm.type === 'FAKE') {
                    // console.error('prev::focusInfo.fm.listInfo.curIdx', focusInfo.fm.listInfo.curIdx);
                    prevChildIdxOnPage = focusInfo.fm.listInfo.curIdx - focusInfo.fm.listInfo.page
                    prevPage = focusInfo.fm.listInfo.page;
                    prevMaxItem = focusInfo.fm.listInfo.maxItem;
                }
                focusInfo.fm.removeFocus(direction);
            }
        }
        log('prevPage', prevPage, 'prevChildIdxOnPage', prevChildIdxOnPage, 'prevMaxItem', prevMaxItem);

        // add next
        this.focusIndex = focusIndex;
        if (childIdx !== undefined && childIdx !== null && childIdx > -1 ) {
            focusInfo.fm.setFocusByIndex(childIdx, direction);
            return true;
        } else if (focusInfo && (focusInfo.fm.type === 'BLOCK' || focusInfo.fm.type === 'FAKE') && prevChildIdxOnPage !== -1) {
            // ?????? ????????? ????????? ???????????? ?????????.
            let curIdxOnPage = Math.round(focusInfo.fm.listInfo.maxItem * prevChildIdxOnPage / prevMaxItem);
            // ????????????
            if (curIdxOnPage > (focusInfo.fm.listInfo.maxItem - 1) ) { 
                curIdxOnPage = focusInfo.fm.listInfo.maxItem - 1;
            }

            console.error('curIdxPage', curIdxOnPage);

            if (isNaN(curIdxOnPage)) {
                focusInfo.fm.addFocus(direction);
                return true;
            } else {
                focusInfo.fm.setFocusByIndexOnPage(curIdxOnPage, focusInfo.fm.listInfo.page, direction);
                return true;
            }
        }  else if(childIdx === undefined || childIdx === null || childIdx > -1 || childIdx > focusInfo.fm.listInfo.lastIdx || childIdx < 0){ 
            // ????????? ????????? ????????? ????????? idx ??? child ??? ???????????? ????????? ????????? ?????? ??????.
            log('????????????');
            focusInfo.fm.addFocus(direction); 
            return true;
        }
        return false;
    }

    arrangeFocusList() {
        let prevKey = null;
        let afterIndex = null;
        if (this.focusIndex !== -1) {
            const prevFocus = this.arrangedFocusList[this.focusIndex]
            if (prevFocus) {
                prevKey = prevFocus.key;
            }
        }

        this.arrangedFocusList = [];
        let focusIndex = -1;
        for (let focus of this.focusList) {
            if (Array.isArray(focus.fm) && focus.fm.length !== 0 && focus.enable) {
                const focusInfoList = focus.fm.map((fm, idx) => {
                    let rect = {};
                    if (this.focusingType === FOCUSING_TYPE.CLOSEST) {
                        rect = fm.getContainerRect();
                    }
                    return {
                        key: focus.key,
                        idx: idx,
                        fm: fm,
                        rect: rect ? rect : null
                    };
                });
                this.arrangedFocusList.push(...focusInfoList);
                focusIndex += focusInfoList.length;
            } else if (!Array.isArray(focus.fm) && focus.fm && focus.enable) {
                focusIndex++;
                if (prevKey && focus.key === prevKey) {
                    afterIndex = focusIndex;
                }
                let rect = {};
                if (this.focusingType === FOCUSING_TYPE.CLOSEST) {
                    rect = focus.fm.getContainerRect();
                }
                this.arrangedFocusList.push({ ...focus, rect });
            }
        }
        
        if (prevKey && afterIndex) {
            this.focusIndex = afterIndex;
            log(`?????? focusIndex[${prevKey}]??? arrange ?????? -> `, afterIndex, '?????? ?????????');
        }
    }

    handleKeyEvent(event) {
        if (this.focusIndex === -1) {
            //  console.log(this.__proto__.constructor.name, `?????? ???????????? ???????????? ??????[????????? ?????????:${this.focusIndex}]`);
            return;
        }

        const direction = DirectionTable[event.keyCode];
        const focusInfo = this.arrangedFocusList[this.focusIndex];
        const currentFm = focusInfo.fm;
        if (currentFm.handleKeyDown(event)) { // ?????? keydown ???????????? ????????? ???, ?????? ?????? ?????? ??????????????? ???????????? fm.moveFocus ??? ??????
            return;
        } else {
            if (direction) {
                currentFm.moveFocus(direction, this.onFocusMoveUnavailable);
            }
        }
    }

    getFocusInfo(key) {
        for (let focusInfo of this.arrangedFocusList) {
            if (focusInfo.key === key) {
                return focusInfo;
            } else if (!isNil(focusInfo.idx) && key === `${focusInfo.key}_${focusInfo.idx}`) {
                return focusInfo;
            }
        }
        return null;
    }

    getCurrentFocusInfo() {
        if (this.focusIndex !== -1) {
            return this.arrangedFocusList[this.focusIndex];
        }
        return null;
    }

    setFocusOnArrangedListByKey(key) {
        const cnt = this.arrangedFocusList.length;
        for (let i = 0; i < cnt; i++) {
            const focus = this.arrangedFocusList[i];
            if (focus.key === key) {
                this.setFocus(i);
                return;
            }
        }
        //  console.log('setFocusOnArrangedListByKey:: key??? ?????? ??? ??????', key);
    }

    getDistance(srcRect, targetRect, isTab, direction) {
        if (isTab) {
            if (direction === 'LEFT' || direction === 'RIGHT') {
                return Math.abs(srcRect.x + srcRect.width / 2 - targetRect.y + targetRect.height / 2);
            } else if (direction === 'UP' || direction === 'DOWN') {
                return Math.abs(srcRect.y + srcRect.height / 2 - targetRect.y + targetRect.height / 2);
            }
        } else {
            const srcCenter = { x: srcRect.x + (srcRect.width / 2), y: srcRect.y + (srcRect.height / 2) };
            const targetCenter = { x: targetRect.x + (targetRect.width / 2), y: targetRect.y + (targetRect.height / 2) }
            // if(!x2) x2=0; 
            // if(!y2) y2=0;
            return Math.sqrt((targetCenter.x - srcCenter.x) * (targetCenter.x - srcCenter.x) + (targetCenter.y - srcCenter.y) * (targetCenter.y - srcCenter.y));
        }
    }

    isLineCollided(a1, a2, b1, b2) {
        return a2 >= b1 && b2 > a1;
    }

    isRectCollided(a, b) {
        return !(
            ((a.top + a.height) < (b.top)) ||
            (a.top > (b.top + b.height)) ||
            ((a.left + a.width) < b.left) ||
            (a.left > (b.left + b.width))
        );
    }

    getClosestFm(direction) {
        const currentFocus = this.arrangedFocusList[this.focusIndex];
        // const rect = currentFocus.fm.getContainerRect();
        const currentRect = currentFocus.fm.getContainerRect();
        const rect = {
            left: currentRect.left,
            x: currentRect.x,
            right: currentRect.right,
            top: currentFocus.rect.top,
            y: currentFocus.rect.y,
            bottom: currentFocus.rect.bottom,
            height: currentFocus.rect.height,
            width: currentRect.width,
        };
        //  console.// log('??????????????? ??????:', rect);

        //  console.log('curFocus.rect', currentFocus.fm.focusedElement, rect.top, rect.left);
        const originalIndexList = [];
        let distanceList = [];
        let searchList = [];
        if (!rect) {
            return null;
        }
        switch (direction) {
            case 'RIGHT':
                searchList = this.arrangedFocusList.filter((focus, idx) => {
                    if (focus.key === currentFocus.key && focus.idx === currentFocus.idx) {
                        return false;
                    }
                    const containerRect = focus.fm ? focus.fm.getContainerRect() : null;
                    if (!containerRect) {
                        return false;
                    }
                    const targetRect = {
                        left: containerRect.left,
                        right: containerRect.right,
                        width: containerRect.width,
                        height: containerRect.height,
                        top: focus.rect.top,
                        bottom: focus.rect.bottom,
                    };
                    //  console.// log('?????? ??????:', focus.idx ? `${focus.key}_${focus.idx}` : focus.key, targetRect, focus.rect);
                    if (!targetRect) {
                        //  console.// log('this.arrangedFocusList ??? fm ??? ????????? ???????????? element??? ?????? focus????????? ??????:', idx, this.arrangedFocusList[idx]);
                        return false;
                    }

                    const isRight = (targetRect.left + targetRect.width) / 2 > (rect.left + rect.width) / 2;
                    const isCollided = this.isLineCollided(rect.top, rect.bottom, targetRect.top, targetRect.bottom);
                    const bIn = isRight && isCollided;
                    if (bIn) {
                        originalIndexList.push(idx);
                    }
                    return bIn;
                });
                break;
            case 'LEFT':
                searchList = this.arrangedFocusList.filter((focus, idx) => {
                    if (focus.key === currentFocus.key && focus.idx === currentFocus.idx) {
                        return false;
                    }
                    const containerRect = focus.fm ? focus.fm.getContainerRect() : null;
                    if (!containerRect) {
                        return false;
                    }
                    const targetRect = {
                        left: containerRect.left,
                        right: containerRect.right,
                        width: containerRect.width,
                        height: containerRect.height,
                        top: focus.rect.top,
                        bottom: focus.rect.bottom,
                    };
                    //  console.// log('?????? ??????:', focus.idx ? `${focus.key}_${focus.idx}` : focus.key, targetRect, focus.rect);
                    if (!targetRect) {
                        //  console.// log('this.arrangedFocusList ??? fm ??? ????????? ???????????? element??? ?????? focus????????? ??????:', idx, this.arrangedFocusList[idx]);
                        return false;
                    }

                    const isLeft = targetRect.right < rect.left;
                    const isCollided = this.isLineCollided(rect.top, rect.bottom, targetRect.top, targetRect.bottom);
                    const bIn = isLeft && isCollided;

                    if (bIn) {
                        originalIndexList.push(idx);
                    }
                    return bIn;
                });
                break;
            case 'UP':
                searchList = this.arrangedFocusList.filter((focus, idx) => {
                    if (focus.key === currentFocus.key && focus.idx === currentFocus.idx) {
                        return false;
                    }
                    const containerRect = focus.fm ? focus.fm.getContainerRect() : null;
                    if (!containerRect) {
                        return false;
                    }
                    const targetRect = {
                        left: containerRect.left,
                        right: containerRect.right,
                        width: containerRect.width,
                        height: containerRect.height,
                        top: focus.rect.top,
                        bottom: focus.rect.bottom,
                    };
                    //  console.// log('?????? ??????:', focus.idx ? `${focus.key}_${focus.idx}` : focus.key, targetRect, focus.rect);
                    if (!targetRect) {
                        //  console.// log('this.arrangedFocusList ??? fm ??? ????????? ???????????? element??? ?????? focus????????? ??????:', idx, this.arrangedFocusList[idx]);
                        return false;
                    }

                    const isUp = (targetRect.top + targetRect.height) / 2 < (rect.top + rect.height) / 2
                    const isCollided = this.isLineCollided(rect.left, rect.right, targetRect.left, targetRect.right);
                    const bIn = isUp && isCollided;

                    if (focus.key === 'settingMenu') {
                        //  console.// log('isUp', isUp, 'isCollided', isCollided);
                    }

                    if (bIn) {
                        originalIndexList.push(idx);
                    }
                    return bIn;
                });
                break;
            case 'DOWN':
                searchList = this.arrangedFocusList.filter((focus, idx) => {
                    if (focus.key === currentFocus.key && focus.idx === currentFocus.idx) {
                        return false;
                    }
                    const containerRect = focus.fm ? focus.fm.getContainerRect() : null;
                    if (!containerRect) {
                        return false;
                    }

                    const targetRect = {
                        left: containerRect.left,
                        right: containerRect.right,
                        width: containerRect.width,
                        height: containerRect.height,
                        top: focus.rect.top,
                        bottom: focus.rect.bottom,
                    };

                    //  console.// log('?????? ??????:', focus.idx ? `${focus.key}_${focus.idx}` : focus.key, targetRect, focus.rect);
                    if (!targetRect) {
                        //  console.// log('this.arrangedFocusList ??? fm ??? ????????? ???????????? element??? ?????? focus????????? ??????:', idx, this.arrangedFocusList[idx]);
                        return false;
                    }

                    const isDown = (targetRect.top + targetRect.height) / 2 > (rect.top + rect.height) / 2
                    const isCollided = this.isLineCollided(rect.left, rect.right, targetRect.left, targetRect.right);
                    const bIn = isDown && isCollided;

                    if (bIn) {
                        originalIndexList.push(idx);
                    }
                    return bIn;
                });
                break;
            default:
                break;
        }
        //  console.// log('???????????????', searchList);

        distanceList = searchList.map((fm, idx) => {
            const { rect: targetRect } = fm;
            return this.getDistance(rect, targetRect, fm.tab, direction);
        })
        //  console.// log('???????????????', distanceList);
        const index = distanceList.indexOf(Math.min(...distanceList));

        return originalIndexList[index];
    }

    onFocusMoveUnavailable({ id, type, direction, curIdx }) {
        const focusInfo = this.getFocusInfo(id);
        if (!focusInfo) {
            console.log(`key?????? ${id}??? ????????? ????????? ????????? ????????????. id ??? key??? ????????? ?????????`);
        }

        if (this.focusingType === FOCUSING_TYPE.CLOSEST) {
            if (focusInfo && focusInfo.link) {
                const nextKey = focusInfo.link[direction];
                if (nextKey) {
                    this.setFocusOnArrangedListByKey(nextKey);
                    return;
                } else if (nextKey === null) {
                    return;
                }
            }
            if (focusInfo) {
                const index = this.getClosestFm(direction);

                if (index !== null && index >= 0) {
                    //  log(`${index}??? ???????????? ?????? ?????????, focusInfo:${index}`, this.arrangedFocusList[index]);
                    this.setFocus(index);
                    return;
                } else {
                    // log('????????? ???????????? ?????????');
                }
            }
        } else if (this.focusingType === FOCUSING_TYPE.INDEX) {
            // ????????? ????????????????????? ????????? ??????
            if (focusInfo && focusInfo.link) {
                const nextKey = focusInfo.link[direction];
                if (nextKey) {
                    this.setFocusOnArrangedListByKey(nextKey);
                    return;
                } else if (nextKey === null) { // null ?????? ???????????? ??????(????????????)
                    return;
                }
            }

            // ?????? ????????? ????????? ????????? ?????? ????????? ?????? ?????? ??????
            let idx;
            if (direction === 'UP') {
                idx = this.focusIndex - 1;
                if (idx < 0) {
                    idx = 0;
                }
                this.setFocus(idx, null, direction);
            } else if (direction === 'DOWN') {
                idx = this.focusIndex + 1;
                const lastIdx = this.arrangedFocusList.length - 1;
                if (idx >= lastIdx) {
                    idx = lastIdx;
                }
                this.setFocus(idx, null, direction);
            }
        }



    }
}

export { FOCUSING_TYPE, FocusManager as default };