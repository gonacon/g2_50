import React, { Component } from 'react';
import IME, { IME_MODE } from './IME';
import FM from 'Supporters/navi';
import 'ComponentCss/modules/SearchContent.css';
import keyCodes from 'Supporters/keyCodes';
import StbInterface from 'Supporters/stbInterface';
import PATH, { STB_PROP } from 'Config/constants';
import { CSS } from 'Network';
import { Core } from 'Supporters';
import getTextWidth from 'text-width';

// const log = function() { console.error(...arguments); }
const log = function () { }

const ImeModeText = ['한글', '영대', '영소', '숫자', '특1', '특2'];
const keypadButtonLabels = [
    ["ㅣ", "•","ㅡ","ㄱㅋ","ㄴㄹ","ㄷㅌ","ㅂㅍ","ㅅㅎ","ㅈㅊ","문자지움","ㅇㅁ ","문자변환", "완료"],
    [".QZ","ABC","DEF","GHI","JKL","MNO","PRS","TUV","WXY","문자지움","@ ","문자변환", "완료"],
    [".qz","abc","def","ghi","jkl","mno","prs","tuv","wxy","문자지움","@ ","문자변환", "완료"],
    ["1","2","3","4","5","6","7","8","9","문자지움","0 ","문자변환", "완료"],
    ["- ~","/ ?","( )",". ,","^ =","< >","! *","@ #",": ;","문자지움","' \" ","문자변환", "완료"],
    ["_ |","+ -","% &","[ ]","{ }","÷ ×","￥ €","￡ ￠","＄ ￦","문자지움","≪ ≫ ","문자변환", "완료"]
];
const KEY = keyCodes.Keymap;
const STB = StbInterface;

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputMode: IME_MODE.HANGUL,
            inputText: '',
            lenseText: '',
            inputTextWidth: 0,
            bLenseOpen: false,

            searchHistorys: [],
            recommendKeywords: [],
            autoCompletes: [],
            searchPage: 0,
            searchIdx: 0,
            recommendPage:0,
            recommendIdx:0,
            pageIdxs:0,
            isCompositioning: false,
            compositionTimer: null
        };

        this.searchHistory = [];
        this.inputSource = 'NONE'; // 'NONE', 'INPUTBOX', 'KEYPAD'

        IME.onOKEvent = this.onOk.bind(this);
        IME.onSearchMode = this.onSearchMode.bind(this);
        
    }

    // let isCompositioning = false;
    // let compositionTimer = null;
    setOffCompositMode()
    {
        this.setState({
            isCompositioning : false,
            compositionTimer : false
        })
        // this.state.isCompositioning = false;
    }
    
    compositionStart()
    {
        clearTimeout(this.state.compositionTimer);
        if (this.state.inputMode == IME_MODE.HANGUL)
        {
            this.setState({
                isCompositioning : true
            })
            // this.state.isCompositioning = true;
        }
    }
    
    compositionEnd()
    {
        console.log("compositionEnd : ",this.state.isCompositioning);
        if (this.state.isCompositioning == true){
            clearTimeout(this.state.compositionTimer);
            this.state.compositionTimer = 
            setTimeout(() => {
                this.setOffCompositMode();
            }, 300);
        }
            // setTimeout(this.setOffCompositMode, 200);
    }

    componentWillMount (){
        this.setState({
            recommendKeywords: this.props.recommendKeywords
        })
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.appKeyWord){
            this.input.value = this.input.value + nextProps.appKeyWord;
        }
    }

    setSearchMode = (bSearchMode) => {
        log('setSearchMode:', bSearchMode);
        IME.setSearchMode(bSearchMode);
    }

    setNumkeyEnable = (bEnable) => {
        log('setNumkeyEnable:', bEnable);
        STB.keyInfo({ numKeyUse: bEnable }); 
    }

    setInputSource = (inputSource) => {
        log('setInputSource:', inputSource);
        this.inputSource = inputSource;
    }
    setPreventEvent = (bEnable) => {
        const inputText = document.getElementById("searchInput");
        log('setPreventEvent:', bEnable);
        if (bEnable) {
            document.addEventListener("keydown", this.handleEvent);
            document.addEventListener("keyup", this.handleEvent);
        } else {
            document.removeEventListener("keydown", this.handleEvent);
            document.removeEventListener("keyup", this.handleEvent);
        }

        if (inputText.addEventListener)
        {
            document.addEventListener("compositionstart", this.compositionStart()); 
            document.addEventListener("compositionend", this.compositionEnd()); 
        }
    }

    preventDefault = (event) => {
        log('preventDefault', event);
        if(event) {
            event.preventDefault();
        }
    }

    handleEvent = (event) => {
        // console.log(" 핸들 이벤트 ");
        let { inputMode: mode } = this.state;
        const isKeydown = event.type === 'keydown';
        let preventKey = false;
        // 입력 소스에 따라서 prevent default 설정.
        if ((event.keyCode === KEY.UP
            || event.keyCode === KEY.DOWN
            || event.keyCode === KEY.LEFT
            || event.keyCode === KEY.RIGHT)
            && this.inputSource !== 'INPUTBOX') {
                this.preventDefault(event);
        }
        
        // 키패드 번쩍임 효과
        let keyIdx = event.keyCode - 49;
        if (event.keyCode === 48) {
            keyIdx = 10;
        }
            //this.keypad.click(keyIdx);
        
        switch (this.inputSource) {
            
            case 'NONE':
                this.preventDefault(event);
                break;
            case 'INPUTBOX':
                // 숫자패드키일 경우 => 입력모드가 숫자가 아닐경우 up, down 둘다 막고
                // 입력모드가 숫자일경우는 up, down 둘중 하나만 막는다.
                if (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey) {
                    console.log("인풋박스로 가는 경우?");
                    this.compositionStart();
            this.compositionEnd();
                    if (mode === IME_MODE.NUMBER) {
                        if (!isKeydown) {
                            this.preventDefault(event);    
                        } else {
                            this.keypad.click(keyIdx);
                        }
                    } else {
                        this.preventDefault(event);
                        if(!isKeydown) {
                            this.keypad.click(keyIdx); 
                        }
                        
                    }
                    
                } else if (event.keyCode === KEY.N8 && event.shiftKey) { // 삭제키 처리(리모컨)
                    if (isKeydown) { // 키 다운일 경우만 액션
                        preventKey = true;
                        if (this.state.isCompositioning == false){
                        IME.sendKeyEvent(IME.IME_KEYCODE_DEL); // DEL
                        }
                        this.keypad.click(9);
                        this.preventDefault(event);
                    }
                } else if (event.keyCode === KEY.N3 && event.shiftKey) { // 문자전환 키처리
                    // debugger;
                    this.preventDefault(event);
                    if (isKeydown) { // 키 다운일 경우만 액션
                        mode ++;
                        if (mode > 5) {
                            mode = 0;
                        }
                        log('문자전환', mode);
                        this.changeIMEMode(mode);
                        this.keypad.click(11);
                    }
                }else if(event.keyCode === KEY.ENTER){
                    if(this.input.value){
                        this.search(this.input.value);
                    }

                }
                break;
            case 'KEYPAD':
                if (event.keyCode === KEY.LEFT 
                        || event.keyCode === KEY.RIGHT 
                        || event.keyCode === KEY.UP 
                        || event.keyCode === KEY.DOWN) {
                    this.preventDefault(event);
                } else if (event.keyCode >=48 && event.keyCode <=57 && !event.shiftKey) {
                    console.log("여긴 어딘가.");
                    if (mode !== IME_MODE.NUMBER) {
                        if (isKeydown) {
                            this.keypad.click(keyIdx);
                        }
                        this.preventDefault(event);
                        
                    } else {
                        if (isKeydown) {
                            this.keypad.click(keyIdx);
                        }
                        
                    }
                    
                } else if (event.keyCode === KEY.N8 && event.shiftKey) {
                    this.preventDefault(event);
                    if (isKeydown) {
                        IME.sendKeyEvent(IME.IME_KEYCODE_DEL);
                        this.keypad.click(9);
                    }
                } else if (event.keyCode === KEY.N3 && event.shiftKey) {
                    this.preventDefault(event);
                    if (isKeydown) {
                        mode++;
                        if (mode > 5) {
                            mode = 0;
                        }
                        this.changeIMEMode(mode);
                        this.keypad.click(11);
                    }
                }
                break;
            default: 
                this.preventDefault(event);
                break;
        }
    }

    changeIMEMode = (mode) => {
        log('changeIMEMode', mode);
        this.setState({
            inputMode: mode
        });
        IME.setKeyboardMode(mode);
    }

    onSelectRecommendKeyword = (keyword) => {
        log('추천검색어', keyword);
        this.search(keyword);
    }

    onSelectSearchHistory = (keyword) => {
        log('onSelectSearchHistory', keyword);
        this.search(keyword);
    }

    onDeleteSearchHistory = (idx) => {
        log('onDeleteSearchHistory', idx);
        this.delSearchHistory(idx);
    }

    onSelectAutoCompleteKeyword = (keyword) => {
        this.search(keyword);
    }

    onSearchMode = (mode) => {
        log('onSearchMode', mode);
        if(mode) {
            const { inputMode } = this.state;
            this.changeIMEMode(inputMode);
        }
    }

    onOk = (action) => {
        if (this.inputSource === 'KEYPAD' && action === IME.OK_KEY_DOWN) {
            const keyIdx = this.keypad.getCurrentKeyIdx();
            if (keyIdx !== -1) {
                this.onSelectKeypad(keyIdx);
            }
        } else if(this.inputSource === 'INPUTBOX' && action === IME.OK_KEY_UP) {
            // 인풋박스에서 입력중 OK키 눌럿을경우 
            this.search(this.input.value);
        }
    }

    onSelectKeypad = (keyIdx) => {
        log('키패드 입력', keyIdx);
        let imeKeyCode = null;
        switch(keyIdx) {
            case 12: // OK 완료키
                if (this.input) {
                    this.search(this.input.value);
                }
                return;
            case 11: // 문자전환
                // 이미 처리되어서 여기 안올듯....
                let { inputMode: mode } = this.state;
                mode ++;
                if (mode > 5) {
                    mode = 0;
                }
                this.changeIMEMode(mode);
                this.keypad.onChangeMode();
                return;
            case 9: // 문지자움
                imeKeyCode = IME.IME_KEYCODE_DEL;
                break;
            case 10:
                imeKeyCode = 0;
                break;
            default: 
                // 0 ~ 8 => + 1
                imeKeyCode = keyIdx + 1;
            break;
        }
        // log('sendKeyEvent', imeKeyCode);
        IME.sendKeyEvent(imeKeyCode);
    }

    onInputFocused = () => {
        // log('input[FM] focused');
        let value = null;
        if(this.input){
            setTimeout(() => {
                value = this.input.value;
                this.input.value = '';
                this.input.value = value;
                this.input.focus();
            }, 1);
        }        
    }

    onInputBlured = () => {
        // log('input[FM] blured');
        this.setState({
            bLenseOpen: false
        })
        if(this.input){
            setTimeout(() => {
                this.input.blur();
            }, 1);
        }
        this.setInputSource('NONE');
        this.setNumkeyEnable(true);
    }

    onFocusInput = () => {
        log('onFocusInput');
        this.setInputSource('INPUTBOX');
        this.setSearchMode(true);
        this.setNumkeyEnable(false);
    }

    onBlurInput = () => {
        log('onBlurInput');
        this.setSearchMode(false);
    }

    search = async (keyword) => {
        if (!keyword) {
            Core.inst().showToast('텍스트를 입력하지 않으셨습니다.', '', 3000);
            return;
        } 
        
        const result = await CSS.request002({
            keyword,
            doc_page: '100^100^100^100^100^100',
            tag_yn: 'N'
        });

        const { total_result_no: resultCnt } = result;
        const { movePage } = this.props;

        if (!movePage) {
            return;
        }

        this.addSearchHistory(keyword);
        if (result && resultCnt && resultCnt.length !== 0) {
            movePage(PATH.SEARCH_RESULT, { data: keyword, list:result, tagYn:'N', searchType:'searchHome' });
        } else {
            movePage(PATH.SEARCH_RESULT_NONE, { data: keyword });
        }
        // movePage(PATH.SEARCH_RESULT, { data: keyword });

    }

    openLense = (LenseYn) => {
        this.setState({
            bLenseOpen: LenseYn
        });
        if (this.lenseTimer) {
            clearTimeout(this.lenseTimer);
        }
        this.lenseTimer = setTimeout(() => {
            this.setState({
                bLenseOpen: false
            })
        }, 3000);
    }

    onChangeInput = () => {
        // log('onChangeInput', this.input.value);
        const fontWeight = this.inputSource === 'INPUTBOX'? 700: 100;
        const fontSize = this.inputSource === 'INPUTBOX'? 56: 38;
        const inputText = this.input.value;
        const inputTextWidth = getTextWidth(inputText, {
            family: 'SK Btv',
			size: `${fontSize}px`,
			weight: fontWeight
        });
        const lenseText = inputText.charAt(inputText.length - 1);
        this.setState({
            inputText,
            lenseText,
            inputTextWidth
        });
        if(this.input.value.length !== 0){
            this.openLense(true);
        }else{
            this.openLense(false);
        }
        if (this.input.value !== '') {
            this.updateAutoCompletes(this.input.value);
            
        } else {
            this.setState({
                autoCompletes: []
            });
        }
    }

    // 포커스 매니져를 통해 호출
    onInputKeyDown = (event, idx) => {
        if (event.keyCode === KEY.DOWN) {
            const { autoCompletes, searchHistorys } = this.state;
            if (autoCompletes.length !== 0) {
                return;
            } else if(searchHistorys.length !== 0) {
                const { pageIdx } = this.SearchHistoryComponent.getFocusInfo();
                this.props.setFocus('searchHistory', pageIdx);
                return true;
            }
        }
    }

    // 인풋박스의 onKeyDown을 통해 호출
    onKeyDownInput = (event) => {
        // log( 'input.onKeyDown:', event);
        // 입력모드가 숫자키일 경우를 제외하고는 preventDefault
        // 문자변환 키 입력시 처리
        // 전체 영역에서 체크되도록 수정해야됨
        if (event.keyCode === KEY.N3) { 
            let { inputMode } = this.state;
            inputMode++;
            if (inputMode > 5)
                inputMode = 0;
            this.changeIMEMode(inputMode);
            this.preventDefault(event);
        } else if (event.keyCode === KEY.N8) { // 문자지움?
            IME.sendKeyEvent(IME.IME_KEYCODE_DEL);
        }
        this.preventDefault(event);
    }

    // 키패드 포커스 시
    onFocusedKeypad = () => {
        this.setSearchMode(true);
        this.setNumkeyEnable(false);
        this.input.focus();
        this.setInputSource('KEYPAD');
        // log('onFocusedKeypad.inputSource:', this.inputSource);
    }

    // 키패드 블러 시
    onBluredKeypad = () => {
        this.setState({
            bLenseOpen: false
        })
        this.setSearchMode(false);
        this.setNumkeyEnable(true);
        this.setInputSource('NONE');
        // log('onBluredKeypad.inputSource:', this.inputSource);
        this.input.blur();
    }

    onMoveFocus = (id, keyCode) => {
        const { setFocus, recommendKeywords } = this.props;
        const { searchHistorys, autoCompletes } = this.state;
        switch(id) {
            case 'searchHistory':
                const { focusedIdxOnPage: searchFocusIdxOnPage } = this.SearchHistoryComponent.getFocusInfo();
                if (keyCode === KEY.LEFT) {
                    return;
                } else if (keyCode === KEY.RIGHT) {
                    if (recommendKeywords.length) {
                        const { pageIdx } = this.RecommendKeywordListComponent.getFocusInfo();
                        const focusIdx = pageIdx + searchFocusIdxOnPage;
                        setFocus('recommendKeywords', focusIdx);
                    } else {
                        const focusIdx = searchFocusIdxOnPage * 3;
                        setFocus('keypad', focusIdx);
                    }
                }
            break;
            case 'recommendKeywords':
                const { focusedIdxOnPage: recommendFocusIdxOnPage } = this.RecommendKeywordListComponent.getFocusInfo();
                if (keyCode === KEY.LEFT) {
                    if (searchHistorys.length) {
                        const { pageIdx } = this.SearchHistoryComponent.getFocusInfo();
                        const focusIdx = pageIdx + recommendFocusIdxOnPage;
                        setFocus('searchHistory', focusIdx);
                    }
                } else if (keyCode === KEY.RIGHT) {
                    const focusIdx = (recommendFocusIdxOnPage + 1) * 3;
                    setFocus('keypad', focusIdx);
                }
            break;
            case 'autoCompletes':
            const { focusedIdxOnPage: autoFocusIdxOnPage } = this.AutoCompleteListComponent.getFocusInfo();
                if (keyCode === KEY.LEFT) {
                    return;
                } else if (keyCode === KEY.RIGHT) {
                    const focusIdx = autoFocusIdxOnPage * 3;
                    setFocus('keypad', focusIdx);
                }
            break;
            case 'keypad':
                const moveIndexTable = {
                    0: 0,
                    1: 0,
                    2: 1,
                    3: 2,
                    4: 3
                };
                const keypadFocusIdxOnPage = this.keypad.getCurrentKeyIdx() / 3;
                const keypadIndex = moveIndexTable[keypadFocusIdxOnPage];
                if (keyCode === KEY.LEFT) {
                    if (autoCompletes.length !== 0) {
                        const { pageIdx } = this.AutoCompleteListComponent.getFocusInfo();
                        const focusIdx = pageIdx + keypadFocusIdxOnPage;
                        setFocus('autoCompletes', focusIdx);
                    } else {
                        const { pageIdx } = this.RecommendKeywordListComponent.getFocusInfo();
                        const focusIdx = pageIdx + keypadIndex;
                        setFocus('recommendKeywords', focusIdx);
                    }
                } else if (keyCode === KEY.RIGHT) {
                    return;
                }
            break;
            default: break;
        }
    }

    addSearchHistory = (keyword) => {
        const { searchHistorys } = this.state;
        let newList = [ ...searchHistorys ];

        newList.map((newList2, idx) => {
            if(newList2 === keyword){
                newList.splice(idx, 1)
            }
        });

        newList.unshift(keyword);
        newList = newList.slice(0, 10);
        this.setState({ 
            searchHistorys: newList 
        });

        STB.setProperty(STB_PROP.SEARCH_HISTORY_LIST, JSON.stringify(newList));
    }

    delSearchHistory = (idx) => {
        const { searchHistorys } = this.state;
        let newList = [ ...searchHistorys ];
        newList.splice(idx, 1);
        this.setState({
            searchHistorys: newList
        });
        STB.setProperty(STB_PROP.SEARCH_HISTORY_LIST, JSON.stringify(newList));

        if(newList.length === 0){
            this.props.setFocus('searchInput');
        }
    }

    // 검색 히스토리 업데이트
    updateSearchHistory = () => {
        let searchHistorys = [];
        const jsonSearchHistory = STB.getProperty(STB_PROP.SEARCH_HISTORY_LIST);
        if (jsonSearchHistory) {
            searchHistorys = JSON.parse(jsonSearchHistory);
        } else {
            STB.setProperty(STB_PROP.SEARCH_HISTORY_LIST, JSON.stringify([]));
        }
        this.setState({
            searchHistorys
        });
    }

    // 추천 키워드 리스트 업데이트(랜더 호출 -> 홈에서 보여질때 호출로 변경)
    updateRecommendKeywords = async () => {
        const result = await CSS.request004({
            searchType: 2,
            doc_page: 10
        });
        let recommendKeywords = [];
        if (result.result === '0000') {
            const { results_keyword: list } = result;
            recommendKeywords = list.map((item, idx) => {
                return item.keyword;
            });
        }
        this.setState({
            recommendKeywords
        });
    }

    // 입력텍스트로 자동완성 리스트 업데이트
    updateAutoCompletes = async (text) => {
        if (!text) {
            return;
        }

        const result = await CSS.request001({
            keyword: text,
            doc_page: 10
        });
        const { results: list } = result;

        let autoCompletes = [];
        if (list && list.length) {
            autoCompletes = list.map((item, idx) => {
                return item.title;
            });
        }
        this.setState({
            autoCompletes
        });
    }

    componentDidMount() {
        const { inputRef, setFm } = this.props;
        if (inputRef) {
            setTimeout(() => {
                inputRef(this.input);
                const searchInput = new FM({
                    id: 'searchInput',
                    type: 'ELEMENT',
                    containerSelector: '',
                    focusSelector: '.csFocus',
                    row: 1,
                    col: 1,
                    focusIdx: 0,
                    startIdx: 0,
                    lastIdx: 0,
                    onFocusContainer: this.onInputFocused,
                    onBlurContainer: this.onInputBlured,
                    onFocusKeyDown: this.onInputKeyDown
                });
                setFm('searchInput', searchInput);
            }, 1);
        }
        this.updateSearchHistory();
    }

    componentWillUnmount() {
        this.setPreventEvent(false);
    }

    render() {
        const {
            setFm,
            setFocus,
            recommendKeywords
        } = this.props;

        const {
            lenseText,
            inputTextWidth,
            inputMode,
            bLenseOpen,

            searchHistorys,
            autoCompletes,
            pageIdxs
        } = this.state;

        const inputModeText = ImeModeText[inputMode];
        const isRecommendListOnly = searchHistorys.length === 0;
        const lenseTextWidth = inputTextWidth + 130;
        return (
            <div className="searchArea">
                <span className="inputSearchStyle">
                    <input 
                        className="inputText csFocus"
                        id="searchInput"
                        onFocus={this.onFocusInput}
                        onBlur={this.onBlurInput}
                        onChange={this.onChangeInput}
                        // onKeyDown={this.onKeyDownInput}
                        ref={r=>this.input=r}
                        placeholder="무한도전 → ㅁㅎㄷㅈ"
                        autoComplete="off"
                    />
                    <label htmlFor="input">
                        <span className="textLang">{inputModeText}</span>
                        <span className="icOk">OK</span>
                    </label>
                    <div className="expansion" style={{ 'top': '-29px', 'left': (lenseTextWidth), 'display':`${bLenseOpen? 'block': 'none'}` }}>
                        <span className="expansionInput">{lenseText}</span>
                        <span className="expansionLabel"></span>
                    </div>
                </span>
                <div className="listAndKey">
                    {autoCompletes.length === 0 && searchHistorys.length !== 0 && 
                    <SearchHistoryList
                        setFm={setFm}
                        list={searchHistorys}
                        onSelect={this.onSelectSearchHistory}
                        onDelete={this.onDeleteSearchHistory}
                        onMoveFocus={this.onMoveFocus}
                        ref={r=>this.SearchHistoryComponent=r}
                    />}
                    {autoCompletes.length === 0 &&  
                    <RecommendKeywordList
                        setFm={setFm}
                        list={recommendKeywords}
                        onSelect={this.onSelectRecommendKeyword}
                        onMoveFocus={this.onMoveFocus}
                        isOnly={isRecommendListOnly}
                        pageIdxs={pageIdxs}
                        ref={r=>this.RecommendKeywordListComponent=r}
                    />}
                    {autoCompletes && autoCompletes.length !== 0 && 
                    <AutoCompleteList
                        setFm={setFm}
                        list={autoCompletes}
                        onSelect={this.onSelectAutoCompleteKeyword}
                        onMoveFocus={this.onMoveFocus}
                        ref={r=>this.AutoCompleteListComponent=r}
                    />}
                    <Keypad 
                        ref={r=>this.keypad=r}
                        setFm={setFm}
                        setFocus={setFocus}
                        mode={inputMode}
                        onSelect={this.onSelectKeypad}
                        onMoveFocus={this.onMoveFocus}
                        changeMode={this.changeIMEMode}
                        onFocused={this.onFocusedKeypad}
                        onBlured={this.onBluredKeypad}
                    />
                </div>
                <p className="mesSearch">리모콘의 <span className="iconSpeak"></span> 버튼을 눌러 음성으로 검색해보세요</p>
            </div>
        );
    }
}

// 추천 검색어
class RecommendKeywordList extends Component {
    constructor(props) {
        super(props);
        this.state = {

            focused: false,
            focusedIdx: 0,
        };

        this.pageIdx = 0;
        this.maxPageItem = 4;
    }
    onItemKeyDown = (event, idx) => {
        const { onMoveFocus } = this.props;
        switch(event.keyCode) {
            case KEY.LEFT:
                if (onMoveFocus) {
                    onMoveFocus('recommendKeywords', KEY.LEFT);
                }
                return true;
            case KEY.RIGHT:
                if (onMoveFocus) {
                    onMoveFocus('recommendKeywords', KEY.RIGHT);
                }
                return true;
            case KEY.ENTER:
                const { onSelect, list } = this.props;
                const keyword = list[idx];
                onSelect(keyword);
                break;
            default: break;
        }
    }

    changePage = (pageIdx) => {
        // console.error('changePage:', pageIdx);
        this.container.scrollTop = pageIdx * 78.5;
        this.pageIdx = pageIdx;
    }

    getPage = () => this.pageIdx;

    getFocusInfo = () => {
        return {
            pageIdx: this.pageIdx,
            focusedIdx: this.state.focusedIdx,
            focusedIdxOnPage: this.state.focusedIdx - this.pageIdx
        };
    }

    onItemFocused = (idx) => {
        const { list } = this.props;
        const totalItem = list.length;
        const pageIdx = this.pageIdx;
        
        let nextPageIdx = pageIdx;
        // 페이지를 벗어나는 경우 체크 -
        
        // 스크롤 방식 1 
        if (idx < pageIdx) {
            nextPageIdx--;
            if (nextPageIdx < 0) {
                nextPageIdx = 0;
            }
        } else if (idx > (pageIdx + this.maxPageItem - 1)) {
            nextPageIdx++;
            if (nextPageIdx > (totalItem - this.maxPageItem)) {
                nextPageIdx = totalItem - this.maxPageItem;
            }
        }

        // 스크롤 방식 2
        // if (idx === pageIdx) {
        //     nextPageIdx--;
        //     if (nextPageIdx < 0) {
        //         nextPageIdx = 0;
        //     }
        // } else if (idx === pageIdx + this.maxPageItem - 1) {
        //     nextPageIdx++;
        //     if (nextPageIdx > (totalItem - this.maxPageItem)) {
        //         nextPageIdx = totalItem - this.maxPageItem;
        //     }
        // }

        if (nextPageIdx !== pageIdx) { // 페이지 이동이 일어난 경우
            this.changePage(nextPageIdx);
        }

        this.state.focusedIdx = idx;
    }

    componentDidMount() {
        const { list, setFm } = this.props;
        if(list){
        const fm = new FM({
            id: 'recommendKeywords',
            containerSelector: '.searchList',
            focusSelector: '.csFocus',
            row: list.length,
            col: 1,
            focusIdx: 0,
            lastIdx: list.length - 1,
            onFocusChild: this.onItemFocused,
            onFocusKeyDown: this.onItemKeyDown
        });
        this.fm = fm;
        setTimeout(() => {
            setFm('recommendKeywords', fm);
        }, 1);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { list } = nextProps;
        const { list: prevList } = this.props;
        if (JSON.stringify(list) !== JSON.stringify(prevList)) {
            this.fm.setListInfo({
                row: list.length,
                curIdx: 0,
                lastIdx: list.length - 1,
            });
        }
    }

    componentWillUnmount() {
        const { setFm } = this.props;
        if (setFm) {
            setFm('recommendKeywords', null);
        }
    }

    render() {
        const { list, isOnly } = this.props;
        const keywordList = list? list.map((keyword, idx) => {
            return (
                <li key={idx}>
                    <span className="searchListItem csFocus">{keyword}</span>
                </li>
            );
        }): null;
        return (
            <div id="recommendKeywords" className={`listRecommend${isOnly? ' single':''}`}>
                <p className="listTitle">추천 검색어</p>
                <ul className="searchList" ref={r=>this.container=r}>
                    {keywordList}
                </ul>
            </div>
        );
    }
}

// 검색 기록
class SearchHistoryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'VIEW', // 'VIEW', 'EDIT'
            focused: false,
            focusedIdx: 0,
        };

        this.pageIdx = 0;
        this.maxPageItem = 4;
    }

    onFocusContainer = () => {
        this.setState({
            focused: true,
        });
    }

    onBlurContainer = () => {
        this.setState({
            focused: false
        });
    }

    onItemKeyDown = (event, idx) => {
        const { mode } = this.state;
        switch(event.keyCode) {
            case KEY.LEFT:
            case KEY.RIGHT:
                if (mode === 'EDIT') {
                    return true;
                }
                const { onMoveFocus } = this.props;
                onMoveFocus('searchHistory', event.keyCode, this.state.focusedIdxs, this.state.focusedIdx,this.state.pageIdxs);
                break;
            case KEY.ENTER:
                const { onSelect, onDelete, list } = this.props;
                if (idx === list.length) { // 삭제버튼
                    if (mode === 'VIEW') { // 노멀모드 일때는 삭제모드로 변경.
                        this.setState({
                            mode: 'EDIT'
                        });
                    } else {
                        this.setState({
                            mode: 'VIEW'
                        });
                    }
                } else { // 검색기록 항목일 경우
                    if (mode === 'VIEW') {
                        const keyword = list[idx];
                        onSelect(keyword); // 노멀 모드일 경우 검색
                    } else {
                        onDelete(idx); // 삭제모드일 경우 해당항목 삭제
                    }
                }
                break;
            case KEY.UP:
                if (mode === 'EDIT' && idx === 0) {
                    return true;
                }
                break;
            case KEY.DOWN: 
                break;
                
            default: break;
        }
    }

    changePage = (pageIdx) => {
        // console.error('changePage:', pageIdx);
        this.container.scrollTop = pageIdx * 78.5;
        this.pageIdx = pageIdx;
    }

    getPage = () => this.pageIdx;

    getFocusInfo = () => {
        return {
            pageIdx: this.pageIdx,
            focusedIdx: this.state.focusedIdx,
            focusedIdxOnPage: this.state.focusedIdx - this.pageIdx
        };
    }

    onItemFocused = (idx) => {
        const { list } = this.props;
        const totalItem = list.length + 1; // 삭제버튼
        const pageIdx = this.pageIdx;
        
        let nextPageIdx = pageIdx;
        // 페이지를 벗어나는 경우 체크 -
        
        // 스크롤 방식 1 
        if (idx < pageIdx) {
            nextPageIdx--;
            if (nextPageIdx < 0) {
                nextPageIdx = 0;
            }
        } else if (idx > (pageIdx + this.maxPageItem - 1)) {
            nextPageIdx++;
            if (nextPageIdx > (totalItem - this.maxPageItem)) {
                nextPageIdx = totalItem - this.maxPageItem;
            }
        }

        // 스크롤 방식 2
        // if (idx === pageIdx) {
        //     nextPageIdx--;
        //     if (nextPageIdx < 0) {
        //         nextPageIdx = 0;
        //     }
        // } else if (idx === pageIdx + this.maxPageItem - 1) {
        //     nextPageIdx++;
        //     if (nextPageIdx > (totalItem - this.maxPageItem)) {
        //         nextPageIdx = totalItem - this.maxPageItem;
        //     }
        // }

        if (nextPageIdx !== pageIdx) { // 페이지 이동이 일어난 경우
            this.changePage(nextPageIdx);
        }

        this.state.focusedIdx = idx;
    }

    componentDidMount() {
        const { list, setFm } = this.props;
        const fm = new FM({
            id: 'searchHistory',
            containerSelector: '.searchList',
            focusSelector: '.csFocus',
            row: list.length + 1,
            col: 1,
            focusIdx: 0,
            lastIdx: list.length,
            onFocusChild: this.onItemFocused,
            onFocusKeyDown: this.onItemKeyDown,
            onFocusContainer: this.onFocusContainer,
            onBlurContainer: this.onBlurContainer
        });
        this.fm = fm;
        setTimeout(() => {
            setFm('searchHistory', fm);
        }, 1);
    }

    componentWillReceiveProps(nextProps) {
        const { list } = nextProps;
        const { list: prevList } = this.props;
        if (JSON.stringify(list) !== JSON.stringify(prevList)) {
            this.fm.setListInfo({
                row: list.length + 1, // 
                lastIdx: list.length, 
            });
        }
    }

    componentWillUnmount() {
        const { setFm } = this.props;
        if (setFm) {
            setFm('searchHistory', null);
        }
    }

    render() {
        const { list } = this.props;
        const { mode, focusedIdx, focused } = this.state;
        const itemClass= `searchListItem csFocus${mode === 'EDIT'? ' active':''}`;
        const buttonClass = `searchListItem csFocus searchDel${mode === 'EDIT'? ' close': ''}`;

        const keywordList = list? list.map((keyword, idx) => {
            return (
                <li key={idx} idx={idx}>
                    <span className={`${itemClass}${focused && focusedIdx === idx? ' focusOn':''}`}>{keyword}</span>
                </li>
            );
        }): [];
        const delButtonClass = `${buttonClass}${focused && focusedIdx === list.length? ' focusOn':''}`;
        keywordList.push((
            <li key={list.length}>
                <span className={delButtonClass}>
                    <span className="delBtnText">검색기록 삭제</span>
                    <span className="closeBtnText">닫기</span>
                </span>
            </li>
        ))
        return (
            <div id="searchHistory" className="listRecommend">
                <p className="listTitle">검색 기록</p>
                <ul className="searchList" ref={r=>this.container=r}>
                    {keywordList}
                </ul>
            </div>
        );
    }
}

// 자동 완성
class AutoCompleteList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            focusedIdx: 0,
        };

        this.pageIdx = 0;
        this.maxPageItem = 5;
    }

    changePage = (pageIdx) => {
        this.container.scrollTop = pageIdx * 70;
        this.pageIdx = pageIdx;
    }

    getPage = () => this.pageIdx;

    getFocusInfo = () => {
        return {
            pageIdx: this.pageIdx,
            focusedIdx: this.state.focusedIdx,
            focusedIdxOnPage: this.state.focusedIdx - this.pageIdx
        };
    }

    onItemKeyDown = (event, idx) => {
        switch(event.keyCode) {
            case KEY.LEFT:
            case KEY.RIGHT:
                const { onMoveFocus } = this.props;
                onMoveFocus('autoCompletes', event.keyCode);
                return true;
            case KEY.ENTER:
                const { onSelect, list } = this.props;
                const keyword = list[idx];
                onSelect(keyword);
                break;
            default: break;
        }
    }

    onItemFocused = (idx) => {
        const { list } = this.props;
        const totalItem = list.length + 1; // 삭제버튼
        const pageIdx = this.pageIdx;
        
        let nextPageIdx = pageIdx;
        // 페이지를 벗어나는 경우 체크 -
        
        // 스크롤 방식 1 
        if (idx < pageIdx) {
            nextPageIdx--;
            if (nextPageIdx < 0) {
                nextPageIdx = 0;
            }
        } else if (idx > (pageIdx + this.maxPageItem - 1)) {
            nextPageIdx++;
            if (nextPageIdx > (totalItem - this.maxPageItem)) {
                nextPageIdx = totalItem - this.maxPageItem;
            }
        }

        // 스크롤 방식 2
        // if (idx === pageIdx) {
        //     nextPageIdx--;
        //     if (nextPageIdx < 0) {
        //         nextPageIdx = 0;
        //     }
        // } else if (idx === pageIdx + this.maxPageItem - 1) {
        //     nextPageIdx++;
        //     if (nextPageIdx > (totalItem - this.maxPageItem)) {
        //         nextPageIdx = totalItem - this.maxPageItem;
        //     }
        // }

        if (nextPageIdx !== pageIdx) { // 페이지 이동이 일어난 경우
            this.changePage(nextPageIdx);
        }

        this.state.focusedIdx = idx;
    }

    componentDidMount() {
        const { list, setFm } = this.props;
        const fm = new FM({
            id: 'autoCompletes',
            containerSelector: '.searchList',
            focusSelector: '.csFocus',
            row: list.length,
            col: 1,
            focusIdx: 0,
            lastIdx: list.length - 1,
            onFocusChild: this.onItemFocused,
            onFocusKeyDown: this.onItemKeyDown
        });
        this.fm = fm;
        setTimeout(() => {
            setFm('autoCompletes', fm);
        }, 1);
    }

    componentWillReceiveProps(nextProps) {
        const { list } = nextProps;
        const { list: prevList } = this.props;
        if (JSON.stringify(list) !== JSON.stringify(prevList)) {
            this.fm.setListInfo({
                row: list.length,
                curIdx: 0,
                lastIdx: list.length - 1,
            });
        }
    }

    componentWillUnmount() {
        const { setFm } = this.props;
        if (setFm) {
            setFm('autoCompletes', null);
        }
    }

    render() {
        const { list } = this.props;
        const keywordList = list? list.map((keyword, idx) => {
            return (
                <li key={idx}>
                    <span className="searchListItem csFocus">{keyword}</span>
                </li>
            );
        }): null;
        return (
            <div id="autoCompletes" className="listRecommend single">
                <ul className="searchList" ref={r=>this.container=r}>
                    {keywordList}
                </ul>
            </div>
        );
    }
}

class Keypad extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModeSelectorActive: false,
            focusedIdx: -1,
            activeIdx: -1,
            focused: false,
        }
    }

    static defaultProps = {
        mode: IME_MODE.HANGUL
    }

    getCurrentKeyIdx = () => {
        return this.state.focusedIdx;
    }

    onBlurModeSelector = () => {
        const { setFm } = this.props;
        setFm('ImeModeSelect', null);
        this.setState({
            isModeSelectorActive: false
        });
    }

    onKeyDownModeSelector = (event, modeIdx) => {
        if (event.keyCode === KEY.ENTER) {
            const { changeMode, setFocus } = this.props;
            log('모드선택', modeIdx);
            this.setState({
                isModeSelectorActive: false
            });
            setFocus('keypad', 11);
            changeMode(modeIdx);
        }
    }

    onFocused = () => {
        const { onFocused } = this.props;
        if (onFocused) {
            onFocused();
        }
        this.setState({
            focused: true
        });
    }

    onBlured = () => {
        const { onBlured } = this.props;
        if (onBlured) {
            onBlured();
        }
        this.setState({
            focused: false
        });
    }

    onFocusChild = (idx) => {
        if (idx !== 11) { // 문자변환키가 아니면 모드선택 비활성화
            this.setState({
                isModeSelectorActive: false,
            });
        }
        this.setState({
            focusedIdx: idx
        });
    }

    onChangeMode = () => {
        let { setFm } = this.props;
        this.setState({
            isModeSelectorActive: true
        });
        const fm = new FM({
            id: 'ImeModeSelect',
            containerSelector: '.inputSet',
            focusSelector: '.list',
            row: 6,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 5,
            onBlurContainer: this.onBlurModeSelector,
            onFocusKeyDown: this.onKeyDownModeSelector
        });
        setFm('ImeModeSelect', fm);
    }

    onKeyDown = (event, idx) => {
        const { onMoveFocus, setFm, setFocus } = this.props;
        switch(event.keyCode) {
            case KEY.LEFT: // grid 기본동작인 최좌측에서 왼쪽 이동시 최우측으로 이동 막기.
                const isLeft = !(idx % 3); 
                if (isLeft) {
                    onMoveFocus('keypad', event.keyCode);
                    return true;
                }
                return false;
            case KEY.RIGHT: // grid 기본동작인 최우측에서 오른쪽 이동시 최좌측으로 이동 막기.
                const isRight = !((idx+1) %3);
                const { isModeSelectorActive } = this.state;
                if (isRight) {
                    if (idx !== 11 && isModeSelectorActive) {
                        onMoveFocus('keypad', event.keyCode);
                    } else {
                        const { mode: modeIdx } = this.props;
                        setFocus('ImeModeSelect', modeIdx);
                    }
                    return true;
                }
                return false;
            case KEY.ENTER:
                // ==> IME 의 search mode 가 true 일 경우는 이쪽으로 이벤트가 안옴
                // PC 에서만 처리
                console.log("PC 엔터키");
                if (this.inputSource === 'INPUTBOX') {
                    this.search(this.input.value);
                }
            break;
            default: break;
        }
    }

    click = (keyIdx) => {
        this.setState({
            activeIdx: keyIdx
        });
        setTimeout(() => {
            this.setState({
                activeIdx: -1
            });
        }, 200);
    }

    componentDidMount() {
        const { setFm } = this.props;
        const fm = new FM({
            id: 'keypad',
            containerSelector: '.buttonKey',
            focusSelector: '.buttonKeyItem',
            row: 5,
            col: 3,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 12,
			bRowRolling: false,
            onFocusKeyDown: this.onKeyDown,
            onFocusChild: this.onFocusChild,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured
        });
        this.fm = fm;
        setTimeout(() => {
            setFm('keypad', fm);
        }, 1);
    }

    componentWillUnmount() {
        const { setFm } = this.props;
        if (setFm) {
            setFm('keypad', null);
        }
    }

    renderButtonList = () => {
        const { isModeSelectorActive, focusedIdx, focused, activeIdx } = this.state;
        const { mode } = this.props;
        const labels = keypadButtonLabels[mode];
        return labels.map((label, idx) => {
            const isLast = idx === labels.length -1;
            const isMode = idx === 11;
            const additionalProps = {};
            if (isLast) {
                additionalProps.className="endKey"
            }
            const buttonClass = `buttonKeyItem ${isLast? ' lastRow':''}${(isMode && isModeSelectorActive)? ' depthFocus':''}${(focusedIdx === idx && focused)? ' focusOn':''}${activeIdx === idx? ' active':''}${idx === 11? ' lastLow':''}`;
            const modeSelectorClass = `inputSet${isModeSelectorActive? ' block active': ''}`;
            
            let str0 = null;
            let str1 = null;
            let classNameLast = null;
            
            if (idx === 10 && this.props.mode !== 3) {
                str0 = <span className="buttonKeyItemLine">|</span>;
                str1 = <span className="textControl"> 공백</span>;
            
            }else if(idx === 9){
                label = <span className="textControl">{label}</span>;
            }else if(idx === 11){
                label = <span className="textControl">{label}</span>;
            }
            
            return (
                <li key={idx} {...additionalProps}>
                    <span className={buttonClass}>{label}{str0}{str1}</span>
                    {isMode && 
                    <div id="ImeModeSelect" className={modeSelectorClass}>
                        {ImeModeText.map((modeText, idx) => {
                            const className = `list${idx === mode?' active':''}`;
                            return <span key={`item_${idx}`} className={className}>{modeText}</span>;
                        })}
                    </div>}
                </li>
            );
        });
    }

    render() {
        const buttonList = this.renderButtonList();
        const className  = `buttonKey scrollWrap ${this.props.mode === 3? ' onlyNum':''}`;
        
        return (
            <div id="keypad" className={className}>
                <ul>
                    {buttonList}
                </ul>
            </div>
        )
    }
}

export default Search;