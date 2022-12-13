import React, { Component } from 'react';

import '../../assets/css/components/modules/SearchContent.css';

import keypadJson from '../../assets/json/routes/search/keypad.json';

import Keypad from './Keypad';
import saveRef from 'react-save-refs';
import { CSS } from 'Network';
import { STB_PROP } from '../../config/constants';
import appConfig from "../../config/app-config";
import StbInterface from '../../supporters/stbInterface';
import FM from 'Supporters/navi';

import KEYCODE from 'Supporters/keyCodes';
import getTextWidth from 'text-width';

const RUN_DEVICE = appConfig.runDevice;
let preventKey = false;
let searchMode = false;
let okInputMode = false;
let inputSetTimer;

class SearchContentItem extends Component {
	constructor(props) {
        super(props);
        this.state = {
		  active: null,
		  keypadData : keypadJson,
		  keypadListIdx : 0,
		  inputCharText : keypadJson.listItem[0].type,
		  searchDelActive : false,
		  resultItem : this.props.slideInfo,
		  //okInputMode : false,
		  keypadCurrentIdx : null,
		  utilsIME : null,
		  Dsizes: null,
		  DText: null
		}
		
		this.itemList = new Map();
		this.containers = new Array(2);

		this.inputContainer = "";

		this.searchHistory = null;
		this.recommKeyword = null;

		//RUN_DEVICE(true : STB, false : PC)
		if(RUN_DEVICE){
			this.state.utilsIME = window.tvExt.utils.ime;
		}else{
			this.state.utilsIME = {
				IME_CHUNJIIN_MODE_1: 1,
				IME_CHUNJIIN_MODE_2: 2,
				IME_KEYCODE_0: 0,
				IME_KEYCODE_1: 1,
				IME_KEYCODE_2: 2,
				IME_KEYCODE_3: 3,
				IME_KEYCODE_4: 4,
				IME_KEYCODE_5: 5,
				IME_KEYCODE_6: 6,
				IME_KEYCODE_7: 7,
				IME_KEYCODE_8: 8,
				IME_KEYCODE_9: 9,
				IME_KEYCODE_DEL: 10,
				KEYBOARD_MODE_ENGLISH_LOWER: 2,
				KEYBOARD_MODE_ENGLISH_UPPER: 1,
				KEYBOARD_MODE_KOREAN: 0,
				KEYBOARD_MODE_NUMBER: 3,
				KEYBOARD_MODE_SYMBOL_1: 4,
				KEYBOARD_MODE_SYMBOL_2: 5,
				OK_KEY_DOWN: 0,
				OK_KEY_UP: 1,
				setSearchMode: function (mode) {return true},
				setKeyboardMode: function (mode) {return true},
				switchKeyboardMode: function (mode) {return true},
				sendKeyEvent: function (mode) {return true},
				setEnableSoftKeyboard: function (mode) {return true},
				setChunjiinMode: function (mode) {return true}
			};
		}

		//this.state.utilsIME.getKeyboardMode();
		//this.state.utilsIME.getChunjiinMode();

		//IME callback function
		this.state.utilsIME.onSearchMode = this.onSearchMode.bind(this);
		this.state.utilsIME.onKeyboardMode = this.onKeyboardMode.bind(this);
		this.state.utilsIME.onOKEvent = this.onOKEvent.bind(this);
		this.state.utilsIME.onChunjiinMode = this.onChunjiinMode.bind(this);
		

		//IME 초기설정 
		this.state.utilsIME.setEnableSoftKeyboard(false);	//가상키보드 설정(반드시 false)
		this.state.utilsIME.setSearchMode(false);	//IME(STB I/F) 사용 여부(INPUT , KEYPAD 영역에서만 true)
		this.state.utilsIME.setKeyboardMode(0);	//IME 키보드 모드 설정 요청 (0 : 한글, 1 : 영대, 2 : 영소, 3 : 숫자, 4 : 특1, 5 : 특2)
		this.state.utilsIME.setChunjiinMode(2);	//기본 천지인 모드 (현재 2만 씀)
	}


	componentDidMount = () => {
		const { setFm, setFocus, innerRef } = this.props;
		if(innerRef){
			innerRef(this.inputContainer);
		}
		
		const { resultItem } = this.state;
		const inputKeyword = new FM({
			id : 'numberFirst',
			type: 'ELEMENT',
			focusSelector : '.csFocus',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusContainer: this.onInputFocused,
			onBlurContainer: this.onInputBlured,
			//onFocusKeyDown: this.onInputEnterDown,
		});
		setFm('inputKeyword', inputKeyword);

		let historyCnt , recommCnt = 0;
		if ( resultItem !== undefined && resultItem !== null ) {
			if(resultItem.listItem[0].type !== "searchHistory"){
				historyCnt = 0;
				recommCnt = resultItem.listItem[0].wordItem.length;
			}else if(resultItem.listItem[1] !== null && resultItem.listItem[1] !== undefined && resultItem.listItem[1].type !== "RECOMM"){
				historyCnt = resultItem.listItem[0].wordItem.length;
				recommCnt = 0;
			}else{
				historyCnt = resultItem.listItem[0].wordItem.length;
				if(resultItem.listItem[1]){
					recommCnt = resultItem.listItem[1].wordItem.length;
				}else{
					recommCnt = 1;
				}
			}
		}

		if(historyCnt > 0){
			this.searchHistory = new FM({
				id: 'searchHistory',
				moveSelector: '.searchList li',
				focusSelector: '.csFocus',
				row: historyCnt + 1,
				col: 1,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: historyCnt,
				bRowRolling: true,
				onFocusChild: this.onHistoryFocused,
				onFocusKeyDown: this.onHistoryEnterDown
			});
			setFm('searchRecord', this.searchHistory);
		}
		if(recommCnt > 0){
			this.recommKeyword = new FM({
				id: 'recommKeyword',
				moveSelector: '.searchList li',
				focusSelector: '.csFocus',
				row: recommCnt,
				col: 1,
				focusIdx: 0,
				startIdx: 0,
				lastIdx: recommCnt - 1,
				bRowRolling: true,
				onFocusChild: this.onRecommFocused,
				onFocusKeyDown: this.onRecommEnterDown
			});
			setFm('recommKeyword', this.recommKeyword);
		}

		const keypadList = new FM({
			id: 'keypadList',
            moveSelector: '.keypadItem li',
            focusSelector: '.csFocus',
            row: 5,
            col: 3,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 12,
			bRowRolling: false,
			onFocusContainer: this.onKeypadFocused,
			onFocusChild: this.onKeypadChanged,
			onBlurContainer: this.onKeypadBlured
        });
		setFm('keypadList', keypadList);
		if(this.props.focusIdx){
			setFocus(this.props.focusIdx);
		}else{
			setFocus(1);
		}
		
		this.inputContainer.focus();
	}


	componentWillUpdate(){
		
	}

	
	componentWillMount(){
		this.setState({
			resultItem : this.props.slideInfo
		})
	}

	componentWillUnmount() {
		//다른 화면 이동시 IME 설정 반드시 false로 해줘야 함
		this.state.utilsIME.setSearchMode(false);        

		StbInterface.keyInfo({
			numKeyUse: true
		});
	}

	/**
	 * 검색 기록 영역
	 */
	onHistoryFocused = (idx) => {
		if (!this.containers) {
			return;
		}
		document.querySelector('#recommKeyword .searchList').classList.remove('active');
		document.querySelector('#searchHistory .searchList').classList.add('active');
		
		if(idx !== 0){
			this.containers[0].scrollTop = (idx*75)-45; 
		}else{
			this.containers[0].scrollTop = 0;
		}
	}
	
	onHistoryEnterDown = (event, idx) => {
		if(this.containers[0].children.length - 1 === idx){
			const searchDelActive = !this.state.searchDelActive;
			this.setState({ searchDelActive });
			const { setSearchRecordDeleteMode } = this.props;
			if (setSearchRecordDeleteMode) {
				setSearchRecordDeleteMode(searchDelActive);
			}
		}else if(this.state.searchDelActive){
			this.recordDelete(idx);
		}else{
			const { onSelectSearch } = this.props;
			if (onSelectSearch && typeof onSelectSearch === 'function') {
				onSelectSearch( this.containers[0].children[idx].innerText.replace(/\n/g, ''));
			}
		}
	}

	//검색기록 삭제
	recordDelete = (idx) => {
		let { resultItem } = this.state;
		const { setFm, setFocus } = this.props;

		let resultMaxLength = resultItem.listItem[0].wordItem.length;
		let recordJson = resultItem.listItem[0].wordItem;		
		const resultJson = [];
		const searchRecordJson = [];

        recordJson.map((data, i) => {
			let recordMap = new Map();
            if(idx !== i){
                if(idx > i){
					recordMap.index = i;
                    resultJson.push(data);
                }else{
					recordMap.index = i-1;
                    resultJson.push(data);
				}
				
				recordMap.keyword = data;
				searchRecordJson.push(recordMap);
			}
		})

		StbInterface.setProperty(STB_PROP.SEARCH_HISTORY, JSON.stringify(searchRecordJson));
		
		resultItem.listItem[0].wordItem = resultJson;
		if(resultItem.listItem[0].wordItem.length < 1){
			resultItem.listItem.shift();

			this.setState({
				resultItem: resultItem,
				searchDelActive: !this.state.searchDelActive
			})
			setFm('searchRecord', null);
			setFocus(1);
		}else{
			this.setState({
				resultItem: resultItem
			})
			if(idx === resultMaxLength-1)
				setFocus(2, idx-1);
		}
		
	}


	/**
	 * 추천 검색어 영역
	 */
	onRecommFocused = (idx) => {
		if (!this.containers) {
			return;
		}		

		let containerIndex = 1;
		if(!this.containers[1])
			containerIndex = 0;
		let historyCount = this.state.resultItem.listItem[0].title;
		if(historyCount === "검색기록"){
			document.querySelector('#searchHistory .searchList').classList.remove('active');
		}
		document.querySelector('#recommKeyword .searchList').classList.add('active');
		if(idx !== 0){
			this.containers[containerIndex].scrollTop = (idx*75)-45; 
		}else{
			this.containers[containerIndex].scrollTop = 0;
		}
	}

	onRecommEnterDown = (event, idx) => {
		let containerIndex = 1;
		if(this.containers[1] === null || this.containers[1] === undefined){
			containerIndex = 0;
		}

		const { onSelectSearch } = this.props;
		if (onSelectSearch && typeof onSelectSearch === 'function') {
			onSelectSearch( this.containers[containerIndex].children[idx].innerText.replace(/\n/g, ''));
		}
	}

	/**
	 * Input 영역
	 */
	onInputFocused= (event, idx) => {
		console.error('IME 검색모드 ON');
		this.state.utilsIME.setSearchMode(true);
		this.inputContainer.focus();

		StbInterface.keyInfo({
			numKeyUse: false
		});
		let historyCount = this.state.resultItem.listItem[0].title;

		document.querySelector('#searchSlideList .slideWrap ').classList.remove('rightActive');
		document.querySelector('#searchSlideList .slideWrap ').classList.remove('leftActive');
		document.querySelector('#recommKeyword .searchList').classList.remove('active');
		if(historyCount === "검색기록"){
			document.querySelector('#searchHistory .searchList').classList.remove('active');
		}
		document.addEventListener("keydown", this.onKeyDown);
		document.addEventListener("keypress", this.onKeyPress);
		document.addEventListener("keyup", this.onKeyUp);
	}

	onInputBlured = (event, idx) => {
		console.error('IME 검색모드 OFF');
		this.state.utilsIME.setSearchMode(false);
		this.inputContainer.blur();
		this.onDClose();
		StbInterface.keyInfo({
			numKeyUse: true
		});
		//document.querySelector('.searchList').classList.add('active');
		document.removeEventListener("keydown", this.onKeyDown);
		document.removeEventListener("keypress", this.onKeyPress);
		document.removeEventListener("keyup", this.onKeyUp);
	}

	getInputWordWidth = (itemTitle, px, weight) => {
		const titleWidth = getTextWidth( itemTitle, {
			family: 'SK Btv',
			size: px+'px',
			weight: weight
		});
		return titleWidth;
	}

	getKeypadWordWidth = (itemTitle) => {
		const titleWidth = getTextWidth( itemTitle, {
			family: 'SK Btv',
			size: '56px',
			weight: '700'
		});
		return titleWidth;
	}

	// 돋보기 열기
	onDOpen(){
		try {
			document.querySelector('.expansion').style.display = '';
		}catch(error){
			console.log("에러 돋보기 열기 없음.");
		}
		if (this.settime) {
			clearTimeout(this.settime);
		}
		this.settime = setTimeout(() => {
			try{
				document.querySelector('.expansion').style.display = 'none';
			}catch(error){
				console.log("돋보기 안닫고 나감.");
			}
		}, 3000);
	}

	// 돋보기 닫기
	onDClose(){

		try {
			document.querySelector('.expansion').style.display = 'none';
		}catch(error){
			console.log("돋보기 안닫고 나감.");
		}
	}

	//INPUT 자동완성 Event
	onChanged = () => {

		// 돋보기 열기
		this.onDOpen();
		
		let Dsize = "";
		if(okInputMode){
			Dsize = this.getInputWordWidth(this.inputContainer.value,38, 100);
		}else{
			Dsize = this.getInputWordWidth(this.inputContainer.value,56, 700);
		}
		
		//자동완성 H/E 연동
		const autoKeywordList = CSS.request001({keyword:this.inputContainer.value, transactionId : 'search_auto_complete_list', doc_page : 10})
		
		let arrTm = this.inputContainer.value;
		let arrTmS = arrTm.charAt(arrTm.length - 1);
		
		this.setState({
			DText: arrTmS
			,Dsizes: Dsize
		})

		Promise.all([autoKeywordList]).then((value) => {
			let contents = [];
			contents.listItem = [];

			const { setFm, setMaxFocusMove } = this.props;
			// if(value[0].result_no === 0){
			// 	console.log("><<<<<<<<<><><><><><><><><<<<<< : ");
			// 	contents.slideType = "SEARCH";
			// 	let listItem = [];
			// 	listItem.wordItem = " ";
			// 	contents.listItem.push(listItem);
			// 	setFm('searchRecord', null);
			// }else{
			//자동완성 result가 있고 input field가 공백이 아닐때만
			if(value[0].results && value[0].results.length > 0 && this.inputContainer.value){
				contents.slideType = "SEARCH";
				let listItem = [];
				listItem.title = "";
				listItem.wordItem = value[0].results.map((data,i) => {
					return data.title;
				})
				contents.listItem.push(listItem);
				setFm('searchRecord', null);
			}else{
				let listItem = [];
				contents = this.props.slideInfo;
				setFm('searchRecord', this.searchHistory);

				if (setMaxFocusMove && typeof setMaxFocusMove === 'function') {
					setMaxFocusMove();
				}
				
			}
		// }
		    this.setState({
                resultItem: contents
            })

		}, () => {
			console.log("error");
		})
	}

	/**
	 * Keypad 영역
	 */
	onKeypadFocused= (event, idx) => {
		okInputMode = true;
		this.state.utilsIME.setSearchMode(true);
		this.inputContainer.focus();

		StbInterface.keyInfo({
			numKeyUse: false
		});
		let historyCount = this.state.resultItem.listItem[0].title;

		document.addEventListener("keydown", this.onKeyDown);
		document.addEventListener("keypress", this.onKeyPress);
		document.addEventListener("keyup", this.onKeyUp);
		document.querySelector('#recommKeyword .searchList').classList.remove('active');
		if(historyCount === "검색기록"){
		document.querySelector('#searchHistory .searchList').classList.remove('active');
		}
	}

	onKeypadBlured = () => {
		okInputMode = false;
		this.state.utilsIME.setSearchMode(false);
		this.inputContainer.blur();
		this.onDClose();
		StbInterface.keyInfo({
			numKeyUse: true
		});

		document.removeEventListener("keydown", this.onKeyDown);
		document.removeEventListener("keypress", this.onKeyPress);
		document.removeEventListener("keyup", this.onKeyUp);
	}


	onKeypadChanged = (index) => {
		const { setFm } = this.props;
		this.setState({ 
			keypadCurrentIdx : index
		});
		
		if(index !== 11){
			this.setState({
				charActive: false
			});
			setFm('keypadLangegeList', null);
		}
	}

	onKeypadLangFocused = () => {

	}


	onKeypadLangBlured = () => {
		const { setFm } = this.props;
		
		this.setState({
			charActive: false
		});

		setFm("keypadLangegeList", null);
	}


	onKeypadLangEnterDown = (event, idx) => {
		let { keypadData } = this.state;
		this.setState({
			charActive: true
			,keypadListIdx: idx
			,inputCharText : keypadData.listItem[idx].type
		});

		this.state.utilsIME.setKeyboardMode(idx);

	}

	
	

	/**
	 * IME 및 공용 Contoroll영역
	 */

	//searchMode 변경시 callback 함수 
	onSearchMode = (mode) => {
		searchMode = mode;
		const { keypadListIdx } = this.state;
		
		if(searchMode){
			if(keypadListIdx !== null && keypadListIdx !== undefined && keypadListIdx > -1){
				this.state.utilsIME.setKeyboardMode(keypadListIdx);
			}else{
				this.state.utilsIME.setKeyboardMode(0);
			}
		}
		
	}
	
	//keyboardMode 변경 시 callback 함수
	onKeyboardMode = (mode) => {
		//console.log("onKeyboardMode : ", mode);
	}

	//onChunjiinMode 변경 시 callback 함수
	onChunjiinMode = (mode) => {
		//console.log("onChunjiinMode : ", mode);
	}


	//searchMode true일 경우 OK키 누르면 여기로 옴
	onOKEvent = (action) => {
		if (action === this.state.utilsIME.OK_KEY_UP) {
			//Keypad Focus 상태
            if(okInputMode) {
				this.sendKeyCode();
			} else { //Input Focus 상태
				const { onSelectSearch } = this.props;
				if (onSelectSearch && typeof onSelectSearch === 'function') {
					onSelectSearch( this.inputContainer.value);
				}
			}
		}
	}
	
	//KeyPad에서 OK 버튼 눌렀을 때
    sendKeyCode() {
		const { keypadCurrentIdx } = this.state;
		const { setFm } = this.props;

		if(keypadCurrentIdx !== null && keypadCurrentIdx !== undefined && keypadCurrentIdx > -1){
			switch (keypadCurrentIdx) {
				case 0:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_1);
					return;
				case 1:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_2);
					return;
				case 2:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_3);
					return;
				case 3:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_4);
					return;
				case 4:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_5);
					return;
				case 5:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_6);
					return;
				case 6:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_7);
					return;
				case 7:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_8);
					return;
				case 8:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_9);
					return;
				case 10:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_0);
					return;			
					

				case 9:
					this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_DEL);
					break;
				case 11:
					let { keypadListIdx, keypadData } = this.state;
					let keyDataSize = keypadData.listItem.length-1;
					if(keyDataSize < keypadListIdx+1) 
						keypadListIdx = 0;
					else keypadListIdx += 1;
					this.setState({
						charActive: true
						,keypadListIdx: keypadListIdx
						,inputCharText : keypadData.listItem[keypadListIdx].type
					});


					this.keypadLangegeList = new FM({
						id: 'keypadLangegeList',
						moveSelector: '.inputSet',
						focusSelector: '.csFocus',
						row: 6,
						col: 1,
						focusIdx: 0,
						startIdx: 0,
						lastIdx: 5,
						bRowRolling: true,
						onFocusContainer: this.onKeypadLangFocused,
						onBlurContainer: this.onKeypadLangBlured,
						onFocusKeyDown: this.onKeypadLangEnterDown
					});
					setFm('keypadLangegeList', this.keypadLangegeList);					
					
					this.state.utilsIME.setKeyboardMode(keypadListIdx);
					break;
				case 12:
					const { onSelectSearch } = this.props;
					if (onSelectSearch && typeof onSelectSearch === 'function') {
						onSelectSearch( this.inputContainer.value);
					}
					break;
				default: break;
			}

		let Dsize = "";
		if(this.inputContainer.value){
			Dsize = this.getInputWordWidth(this.inputContainer.value,43);
		}
		
		this.setState({
			Dsizes: Dsize
		})

		}
	}	

	isKeyNumber(keycode) {
		switch (keycode) {
			case KEYCODE.Keymap.N1:
			case KEYCODE.Keymap.N2:
			case KEYCODE.Keymap.N3:
			case KEYCODE.Keymap.N4:
			case KEYCODE.Keymap.N5:
			case KEYCODE.Keymap.N6:
			case KEYCODE.Keymap.N7:
			case KEYCODE.Keymap.N8:
			case KEYCODE.Keymap.N9:
			case KEYCODE.Keymap.N0:
				return true;
			default: break;
		}
		
		return false;
	}

	processKeyNumber = (keycode) => {
		if (this.state.keypadListIdx === this.state.utilsIME.KEYBOARD_MODE_NUMBER)
			return false;
			
		return true;
	}
	
	// 리모컨 키 입력시
	onKeyDown = (event) => {
		preventKey = false;

		if(okInputMode && (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40 ) ) {
			event.preventDefault();
		}else{
			if(searchMode){

				//Input 안에서 키 Down 시 키패드 active toggle 처리를 위한 변수
				let keyIdx = 0;
				if(event.keyCode === 48){
					keyIdx = 10;
				}else if(event.keyCode === 49){
					keyIdx = 0;
				}else if(event.keyCode === 50){
					keyIdx = 1;
				}else if(event.keyCode === 51){
					keyIdx = 2;
				}else if(event.keyCode === 52){
					keyIdx = 3;
				}else if(event.keyCode === 53){
					keyIdx = 4;
				}else if(event.keyCode === 54){
					keyIdx = 5;
				}else if(event.keyCode === 55){
					keyIdx = 6;
				}else if(event.keyCode === 56){
					keyIdx = 7;
				}else if(event.keyCode === 57){
					keyIdx = 8;
				}

				if (this.isKeyOK(event.keyCode)) {
					this.processKeyOK();
					preventKey = true;
					event.preventDefault();
				}

				if (this.isKeyNumber(event.keyCode) && !event.shiftKey) {
					if (this.processKeyNumber(event.keyCode)) {
						preventKey = true;
						event.preventDefault();
					}
					
					document.querySelectorAll("#keypadLangegeList")[keyIdx].children[0].classList.add('active');
					setTimeout(() => {
						document.querySelectorAll("#keypadLangegeList")[keyIdx].children[0].classList.remove('active');
					}, 200);
				}else if (event.shiftKey && event.keyCode === KEYCODE.Keymap.N3) { //문자변환
					preventKey = true;
					event.preventDefault();

					let { keypadListIdx, keypadData } = this.state;
					let keyDataSize = keypadData.listItem.length-1;
					if(keyDataSize < keypadListIdx+1) 
						keypadListIdx = 0;
					else keypadListIdx += 1;
					
					this.setState({
						//charActive: true,
						keypadListIdx: keypadListIdx,
						inputCharText : keypadData.listItem[keypadListIdx].type
					});
					this.state.utilsIME.setKeyboardMode(keypadListIdx);

					if(this.inputContainer !== undefined && this.inputContainer !== null){
						if(this.inputContainer.classList.contains('focusOn')){
							clearTimeout(inputSetTimer);

							let target = document.querySelector('.inputSearchStyle');
							let classTarget = document.querySelectorAll('.inputSearchStyle .inputSet .list.active');
							for(let i = 0; i < classTarget.length; i++){
								classTarget[i].classList.remove('active');			
							}
							document.querySelector(".inputSearchStyle .inputSet").children[keypadListIdx].classList.add('active');					
							target.classList.add('active');
							
							inputSetTimer = setTimeout(function(){
								target.classList.remove('active');
							},3000);
						}
					}

					document.querySelectorAll("#keypadLangegeList")[11].children[0].classList.add('active');
					setTimeout(() => {
						document.querySelectorAll("#keypadLangegeList")[11].children[0].classList.remove('active');
					}, 200);

				} else if (event.shiftKey && event.keyCode === KEYCODE.Keymap.N8) { // 특수키: 
					preventKey = true;
					event.preventDefault();
					//this.state.utilsIME.sendKeyEvent(this.state.utilsIME.IME_KEYCODE_DEL);

					document.querySelectorAll("#keypadLangegeList")[9].children[0].classList.add('active');
					setTimeout(() => {
						document.querySelectorAll("#keypadLangegeList")[9].children[0].classList.remove('active');
					}, 200);
				}

				return;
			}
		}
	}


	isKeyOK = (keycode) => {
		if (keycode === 13)
			return true;
		
		return false;
	}

	processKeyOK = () => {
		this.sendKeyCode();
		return true;
	}
	

	onKeyUp = (event) => {
		if (searchMode) {
			this.processKeyUp(event);
			return;
		}
	}

	processKeyUp = (event) => {
		if (preventKey)
			event.preventDefault();
	}

	onKyePress = (event) =>{			
		this.processKeyPress(event);
		return;
		
	}

	processKeyPress = (event) => {
		if (preventKey)
			event.preventDefault();
	}

	onCheckInputBlur = () =>{
		if(document.querySelector("#numberFirst").className.indexOf("focusOn") < 0
			&& document.querySelectorAll(".buttonKeyItem.focusOn").length < 1){
			document.querySelector("#numberFirst").blur();
		}

	}

	scrollShow(_this){
		_this.target.closest('.searchList').classList.add('active');
	}
	
	scrollHide(_this){
		if(document.querySelectorAll('.searchList.active').length){
			document.querySelector('.searchList.active').classList.remove('active');
		}
	}

	render() {
		const {keypadListIdx, keypadData, resultItem, charActive, inputCharText, DText, Dsizes} = this.state;
		const listItem = resultItem? resultItem.listItem: null;

		let totalItem = 13;
		let rowCnt = Math.ceil(totalItem / 3);

		let grid = new Array(rowCnt);
		for (let i = 0; i < rowCnt; i++) {
			grid[i] = new Array(3);
		}

		keypadData.listItem[keypadListIdx].keyItem.map((data, i) => {
			const rowIdx = Math.floor(i / 3);
			const colIdx = i % 3;
			grid[rowIdx][colIdx] = <Keypad key={i} colIdx={colIdx} content={data} idx={i} charActive={charActive} keypadListIdx={keypadListIdx} enterDown={this.enterDown} length={keypadData.listItem[keypadListIdx].keyItem.length}/>
		})

		const Dpx = "px";
		let Dwidth = "";
		if (this.inputContainer.value) {
			
			Dwidth = 130 + Dsizes ;
		} else {
			Dwidth = 130;
		}
		const Dwidths = Dwidth + Dpx;

		return (
			<div className="searchArea">
				<span className="inputSearchStyle">	
						<input key="numberFirst" 
							onFocus={this.onCheckInputBlur} 
							ref={r => this.inputContainer = r} 
							onChange={this.onChanged} 
							type="tel" 
							id="numberFirst" 
							className={this.state.active ? "inputText csFocus focusOn" : "inputText csFocus"} 
							placeholder="무한도전 → ㅁㅎㄷㅈ"
						/>
						<label htmlFor="numberFirst">
							<span className="textLang">{inputCharText}</span>
							<span className="icOk">OK</span>
						</label>
						<div className="inputSet">
							<span className="list">한글</span>
							<span className="list">영대</span>
							<span className="list">영소</span>
							<span className="list">숫자</span>
							<span className="list">특1</span>
							<span className="list">특2</span>
						</div>
						{/*돋보기효과 추가*/}
						<div className="expansion" style={{ 'top': '-29px', 'left': (Dwidths), 'display':'none' }}>
							<span className="expansionInput">{DText}</span>
							<span className="expansionLabel"></span>
						</div>
				</span>
				<div className="listAndKey">
						{
							listItem && resultItem.listItem.map((data, containerIdx) => {
								let fmId = `${data.type === "searchHistory" ? data.type : "recommKeyword"}`
								let listData = data.wordItem.map((wordData,i) => {
									return (
											<SearchListItem key={i} content={wordData} innerRef={saveRef(this.itemList, i)} idx={i} onFocused={this.onFocused} containerIdx={containerIdx} lastFlag={false} onSelect={this.onSelect} recordDelete={this.recordDelete} searchDelActive={this.state.searchDelActive}/>
											);
								});

								if(data.type === "searchHistory"){
									listData.push(
										<SearchListItem key={listData.length+1} innerRef={saveRef(this.itemList, listData.length)} idx={listData.length} onFocused={this.onFocused} containerIdx={containerIdx} lastFlag={true} delDown={this.delDown} searchDelActive={this.state.searchDelActive}/>
									)
								}

								return(

										<div id={fmId} className={resultItem.listItem.length === 1 ? "listRecommend single" : "listRecommend"} key={containerIdx}>
 											
 											{(data.type)
 											? <p className="listTitle"  >{data.title}</p>
 											: null
 											}
											<ul className="searchList" ref={r=>this.containers[containerIdx]=r}>
												{listData}
											</ul>
										</div>
								)
							})
						}

						<div id="keypadList" className="buttonKey scrollWrap">
							<ul className="keypadItem">
								{grid}
							</ul>
						</div>					
				</div>
				
				<p className="mesSearch">리모콘의 <span className="iconSpeak"></span> 버튼을 눌러 음성으로 검색해보세요</p>
			</div>
		)
	}

}

class SearchListItem extends Component {
	constructor(props) {
        super(props);
    
        this.state = {
		  active: null,
        }
	}
	
	onFocused = () => {
		const { idx, onFocused, containerIdx } = this.props;
		if (onFocused && typeof onFocused === 'function') {
			onFocused({containerIdx, idx});
		}
		this.setState({active: true});
	}

	onBlured = () => {
        this.setState({
            active: false
        });
	}

	delDown = () => {
		const { delDown } = this.props;
		
		if (delDown && typeof delDown === 'function') {
			delDown();
		}
	}
	
	//Input Field Event
    enterDown = (idx) => {
        
		//삭제 상태이면서 검색 기록을 선택했을때 삭제 처리
		if(this.props.searchDelActive && this.props.containerIdx === 0){
			const { recordDelete } = this.props;
			if (recordDelete && typeof recordDelete === 'function') {
				recordDelete(idx);
			}
			
		}else{	//삭제 상태가 아닐때 검색하도록
			const { onSelect } = this.props;
			if (onSelect && typeof onSelect === 'function') {
				onSelect( this.props.content);
			}
		}
    }
	
	
	render() {
		const { innerRef, lastFlag, searchDelActive, containerIdx} = this.props;
		const {active} = this.state;
		const focusClass = `searchListItem csFocus ${active ? 'focusOn' : ""} ${containerIdx === 0 && searchDelActive ? 'active' : ""}`;
		const delFocusClass = `searchListItem csFocus searchDel ${active ? 'focusOn' : ""}`;
		return (
				lastFlag ? 
					<li>
						<span className={delFocusClass}>
							{!searchDelActive ? 
								<span className="delBtnText">검색기록 삭제</span>
								:<span className="delBtnText">닫기</span>
							}
						</span>
					</li>
					: <li ref={r=>innerRef(r)}>
						<span className={focusClass} >{this.props.content}</span>
					</li>
		)
	}

}

export default SearchContentItem;