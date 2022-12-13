import { React } from '../../../utils/common';
import { NXPG, MeTV } from '../../../supporters/network'; 
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';

// new navigator
import FM from '../../../supporters/navi';
import keyCodes from "../../../supporters/keyCodes";
import Core from '../../../supporters/core';
import { scroll } from '../../../utils/utils';

import PageView from '../../../supporters/PageView';
import PopupPageView from '../../../supporters/PopupPageView';
import { kidsConfigs } from '../config/kids-config';
import constants from '../../../config/constants'
import Utils from '../../../utils/utils';
import { isEmpty, isEqual } from 'lodash';

import '../../../assets/css/routes/kids/character/CharacterList.css';
import '../../../assets/css/routes/kids/character/CharacterListBlock.css';
import appConfig from 'Config/app-config';

const { MENU_BLOCK_CD } = kidsConfigs.BLOCK;											// 블럭유형
const { CHAR_SORT_TYPE, CHAR_SETTING_TYPE } = kidsConfigs;								// 캐릭터 정렬순서, 캐릭터 숨김정보 등록 구분


export default class CharacterList extends PageView {
    constructor(props) {
        super(props);

		this.state = isEmpty(this.historyData) ? {
			contentsListInfo : [],
			hiddenIdListInfo : [],
			sortRadioIndex: 0,											/* 정렬순서 : Radio Index */
			focusHistory : {
				id: null,
				childIdx: 0
			}
		} : this.historyData;

		this.isRecoverFocus = true;

		const focusList = [
			{ key: 'topBtns', fm: null },
			{ key: 'characterListBlock', fm: null },
			{ key: 'scrollTopBtn', fm: null }
		];
		this.declareFocusList(focusList);
    }

	/*********************************** Component Lifecycle Methods ****************************************/

	componentWillMount() {
		// Core.inst().showKidsWidget();
		
		// 숨김처리후 상태반영을 위해 historyData 를 사용하지 않음.
		console.log('%c[paramData] ==================>','color:#0000ff;', this.paramData);
		console.log('%c[historyData] ==================>','color:#0000ff;', this.historyData);
		this.requestCharacterList();									// H/E
	}

	componentDidMount() {
		// 상단 General GNB
		const { showMenu } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
		}

		this.initFmList();
		
		Core.inst().hideKidsWidget();				// 위젯 숨김 p.152 정책참조
	}

	/*********************************** H/E Request Methods ****************************************/
	
	/**
	 * [H/E] 캐릭터 리스트 정보, 설정정보 조회
	 */
	requestCharacterList = async () => {
		const respME048 = await MeTV.request048({ transactionId : 'ME048_select', hidden_type : CHAR_SETTING_TYPE.ALL });									// 숨김캐릭터, 정렬조건 조회
		let sortType = respME048.hiddenchar_sort;																											// MeTV 의 정렬값 (date, string)
		let sortIndex = kidsConfigs.getCharSortIndexByKey('meKey', sortType);
		const contentsData = (await NXPG.request101({ transactionId : 'XPG101', order_type: CHAR_SORT_TYPE[sortIndex].xpgKey })).menus;						// 캐릭터리스트 정보 조회

		// sort_seq 에 따라 정렬 필요시 아래 주석해제
		// kidsConfigs.sortArrayByKey(contentsData, 'sort_seq', 'number', 'asc');

		this.handleResponseData({
			contentsData : contentsData,
			hiddenData : respME048,
			radioIndex : sortIndex
		});
	}

	/**
	 * [H/E] 캐릭터 정렬조건 등록 -> 화면갱신을 위해, XPG 캐릭터 리스트 재요청
	 */
	requestSetCharSettings = (radioIndex) => {
		let reqParam = { 
			transactionId : 'ME049_reg_sort', 
			hiddenchar_type : CHAR_SETTING_TYPE.SORT,
			event_type : 'ADD'
		};

		if(radioIndex !== undefined && radioIndex !== null && radioIndex > -1) {
			reqParam.hiddenchar_sort = CHAR_SORT_TYPE[radioIndex].meKey;
			this.setState({ 
				sortRadioIndex : radioIndex 
			}, () => {

				// 1. MeTV 에 정렬값 저장
				MeTV.request049(reqParam).then(data => {
					console.log("=========== ME049 ===========");

					if(data) {
						console.log(">> SUCCESS : ", data);
						this.requestCharacterList();						// 2. XPG 캐릭터 리스트 조회
					} else {
						console.log(">> NO DATA");
					}
					
					console.log("==============================");
				}).catch(error => {
					console.error('[ERROR][ME049]', error);
				});					
			});
		}
	}

	/**
	 * [H/E] 요청 데이터 가공 & state 등록
	 */
	handleResponseData = (responseData) => {
		if(responseData) {
			const { contentsData, hiddenData, radioIndex } = responseData;
			let contentsListInfo = [];
			let hiddenContents = [];

			if(!isEmpty(contentsData)) {
				// 1. ME048 숨김캐릭터, 정렬타입
				const { hiddencharList, hiddenchar_sort } = hiddenData ? hiddenData : { hiddencharList: [], hiddenchar_sort : '' };
				let sortRadioIndex = (radioIndex !== undefined && radioIndex !== null) ? radioIndex : kidsConfigs.getCharSortIndexByKey('meKey', hiddenchar_sort);			// 정렬순서(ME-048) : rank, string, date => radioIndex 로 변환

				// 2. XPG101 에서, 컨텐츠 블럭만 추출 [TODO] 임시 : 데이터를 자꾸 이상하게 줘서 아래처럼 필터링함
				contentsData.filter(item => { return item.blk_typ_cd === MENU_BLOCK_CD && item.chrtr_nm }).forEach((data, idx) => {
					data.isHidden = false;

					if(!isEmpty(hiddencharList)) {
						hiddencharList.forEach((hiddenCharId, idxHidden) => {
							if(data.menu_id === hiddenCharId) {											// ME048 에 저장된 숨김캐릭터ID(hiddencharList) 와 비교하여 hidden 속성 추가
								data.isHidden = true;
								
								hiddenContents.push(data);
								contentsData.splice(idx, 1);
							}
						})
					}
					!data.isHidden && contentsListInfo.push(data);
				});

				contentsListInfo = contentsListInfo.concat(hiddenContents);
	
				this.setState({
					contentsListInfo: contentsListInfo ? contentsListInfo : [],							/* 캐릭터 블럭정보 */
					hiddenIdListInfo: hiddencharList,													/* 숨김캐릭터ID */
					sortRadioIndex:  sortRadioIndex  		
				}, () => {
					this.initFmList();
				});
			}
		} else {
			console.log('>> NO RESPONSE DATA');
		}
	}

	/*********************************** Other Methods ****************************************/

	initFmList = () => {
		const { contentsListInfo } = this.state;

		// 상단버튼(최신순 / 캐릭터숨기기)
		const topBtnsFm = new FM({
			id : 'topBtns',
			type: 'LIST',
			containerSelector : '.btnWrap',
			focusSelector : '.csFocus',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			bRowRolling: false,
			onFocusKeyDown: this.onSelectTopBtns
		});

		// 맨위로 버튼
		const scrollTopBtnFm = new FM({
			id : 'scrollTopBtn',
			type : 'ELEMENT',
			focusSelector : '.csFocus',
			row : 1,
			col : 1,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 0,
			onFocusKeyDown: this.onSelectScrollTop
		});

		this.setFm('topBtns', topBtnsFm);
    if (contentsListInfo && contentsListInfo.length > 14) {
		  this.setFm('scrollTopBtn', scrollTopBtnFm);
    }

		const gridSize = 7;
		let totalItem = contentsListInfo ? contentsListInfo.length : 0;
		let lastIndex = totalItem > 0 ? totalItem - 1 : 0;
		let rowCnt = Math.ceil(totalItem / gridSize);

		const characterListBlockFm = new FM({
			id : 'characterListBlock',
			moveSelector : 'ul li',
			focusSelector : '.csFocus',
			row : rowCnt,
			col : gridSize,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : lastIndex,
			onFocusChild: this.onListFocusChanged,
			onFocusKeyDown: this.onSelectCharacterList
		});
		this.setFm('characterListBlock', characterListBlockFm);

		// HistoryData 있을경우, 포커스 복구
		if(!isEmpty(this.historyData) && this.isRecoverFocus) {
			// H/E 없을경우를 위해, try/catch 로 방어코드 적용
			try {
				const { focusHistory } = this.historyData;
				
				if(focusHistory !== undefined) {
					this.setFocus(focusHistory.id, focusHistory.childIdx);
				}
			} catch(e) {
				console.error('[ERROR][initFmList] previous focus cannot recover!');
			}
		} else {
			this.setFocus('characterListBlock', 0);
		}
	}

	// 팝업 Callback : 팝업 닫힐때 호출
	onPopupSortClose = (sortRadioIdx) => {
		// 적용 버튼 누를경우
		if(sortRadioIdx > -1) {
			this.requestSetCharSettings(sortRadioIdx);															// 팝업에서 선택한 정렬값을 MeTV 에 저장 -> XPG 캐릭터리스트 재요청
			this.resetFmList('characterListBlock');

			try {
				// 팝업 닫힐때, 정렬버튼에 남아있는 포커스를 removeFocus() 를 통해서도, focusOn 을 없앨수 없어서 처리함
				const target = document.querySelectorAll('#topBtns .csFocus');
				if(target) {
					for(let i=0; i<target.length; i++) {
						target[i].classList.remove('focusOn');
					}
				}
			} catch(e) {}
			
			this.isRecoverFocus = false;
			this.setFocus('characterListBlock', 0);
		}
	}

	/**
	 * 인덱스값으로 리트스의 RowNum 찾기 (스크롤을 위한 현재 RowNum 계산을 위해 사용)
	 */
	getListRowNumFromIndex(data, colNum, idx) {
		let rowIndex = -1;
		try{
			if(data && data.length > 0 && colNum > 1) {
				const totalItems = data.length;
				const rowCnt = Math.ceil(totalItems / colNum);
				for (let r = 1; r <= rowCnt; r++) {
					let startIndex = (r * colNum) - colNum;
					let lastIndex = startIndex + (colNum - 1);
					if(r === rowCnt)	lastIndex = totalItems - 1;
					
					if(idx >= startIndex && idx <= lastIndex) {
						rowIndex = r - 1;
						break;
					}
				}
			} else {
				console.error('[ERROR][getListRowNumFromIndex] no data');
			}
		} catch(e) { console.error('[ERROR][getListRowNumFromIndex]', e); }

		return rowIndex;
	}


	/*********************************** FocusManager KeyEvent Methods ****************************************/


	// 캐릭터 정렬 / 캐릭터 숨기기 버튼
	onSelectTopBtns = (e, childIdx) => {
		if(e.keyCode === keyCodes.Keymap.ENTER) {
			const { sortRadioIndex } = this.state;

			if(childIdx === 0) {
				//console.log('===============>> [캐릭터 정렬](팝업)');
				Core.inst().showPopup(<PopupSort/>, { sortRadioIndex: sortRadioIndex }, this.onPopupSortClose);									// 팝업 호출
				
			} else if(childIdx === 1) {
				//console.log('===============>> [캐릭터 숨기기]');
				this.movePage(constants.KIDS_CHARACTER_EDIT, { sortRadioIndex: sortRadioIndex });
			}
		}
	}

	// 캐릭터 리스트
	onSelectCharacterList = (e, childIdx) => {
		if(e.keyCode === keyCodes.Keymap.ENTER) {
			this.setState({focusHistory: {id:'characterListBlock', childIdx:childIdx}});
			
			const { contentsListInfo } = this.state;
			if(contentsListInfo) {
				const data = contentsListInfo[childIdx];	// XPG101
				if(data && data.menu_id) {
					if(!data.isHidden) {
						let paramData = {
							menu_id: data.menu_id,
							chrtr_zon_sub_img: data.chrtr_zon_sub_img,
							block_types: data.block_types,
							cnts_typ_cd: data.cnts_typ_cd,
							blk_typ_cd: data.blk_typ_cd
						};
						this.movePage(constants.KIDS_SUBCHARACTER, paramData);		// 캐릭터 서브 페이지 이동
					}
				} else {
					console.error('[ERROR][CharacterList] No menu_id');
				}
			}
		}
	}
	

	// 캐릭터 리스트 포커스 이동 (페이징 스크롤) [TODO] 스크롤 로직 수정 필요
	onListFocusChanged = (childIdx) => {
		this.setState({focusHistory: {id:'characterListBlock', childIdx:childIdx}});

		const { contentsListInfo } = this.state;
		const scrollPerRow = 3;
		const target = document.querySelector('#characterListBlock ul li:nth-child('+ Number(childIdx+1) +') .csFocus');
		if(!target) return;

		let rowNum = this.getListRowNumFromIndex(contentsListInfo, 7, childIdx) + 1;
		let scrollOffset = -80;
		
		if(rowNum < scrollPerRow) {
			scroll(0);
		} else if(rowNum % scrollPerRow === 0) { 
			if(target) {
				let targetTop = (target.offsetTop + scrollOffset) * -1;
				scroll(targetTop);
			}
		}
	}

	// 맨위로 버튼
	onSelectScrollTop = (e) => {
		if(e.keyCode === keyCodes.Keymap.ENTER) {
			this.setFocus('characterListBlock', 0);
			scroll(0);
		}
	}

	render() {
		const { contentsListInfo, sortRadioIndex } = this.state;
		let sortName = sortRadioIndex !== undefined ? CHAR_SORT_TYPE[sortRadioIndex].name : '';
		
		return (<div className="wrap">
					<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
					<div className="characterList scrollWrap">
						<h2 className="pageTitle">캐릭터 전체보기</h2>
						<p className="subInfo">B tv 키즈존에서 만날 수 있는 친구들이에요. </p>
						<div className="btnWrap" id="topBtns">
							<span className="csFocus btnStyle type03 btnSort">
								<span className="wrapBtnText">{sortName}</span>
							</span>
							<span className="csFocus btnStyle type03">
								<span className="wrapBtnText">캐릭터 숨기기</span>
							</span>
						</div>
						<CharacterListBlock
							data={contentsListInfo} 
							setFm={this.setFm}
						/>
            {
              contentsListInfo && contentsListInfo.length > 14 &&
						  <div className="btnTopWrap" id="scrollTopBtn">
							  <div className="csFocus btnTop"><span>맨 위로</span></div>
						  </div>
            }
					</div>
				</div>)
	}
}

/**
 * 캐릭터 전체보기 블럭리스트
 * contents : 데이터
 * onMovePage : 페이지전환 Callback
 */
class CharacterListBlock extends React.Component {

	shouldComponentUpdate(nextProps) {
		return !isEqual(this.props.data, nextProps.data);
	}

	render() {
		const { data } = this.props;
		const gridStyle = { marginLeft: '-68px' };
		const gridList = data && data.map((item, i) => {
			return (
				<CharacterListItem 
					key={i} 
					index={i} 
					data={item}
				/>
			)
		});
		
		return (
			<div className="characterListBlock" id="characterListBlock">
				<div className="listWrapper">
					<div className="contentGroup">
						<div className="slideWrap">
							<ul className="slideCon" style={gridStyle}>{gridList}</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

/**
 * 캐릭터 전체보기 Grid 의 ListItem
 * index : ListItem 의 인덱스 번호
 * data : 데이터
 */
class CharacterListItem extends React.Component {

	getFlagImageByCd = (flagCd) => {
		let chkFlagCd = flagCd.toLowerCase();
		let flagImg = '';

		if(chkFlagCd.indexOf('btv') > -1) {
			//flagImg = appConfig.headEnd.LOCAL_URL + "/kids/character/img-tag-btv.png";
			flagImg = appConfig.headEnd.LOCAL_UPDATE_URL + "/kids_flag_btv_s.png";
		} else if(chkFlagCd.indexOf('event') > -1) {
			//flagImg = appConfig.headEnd.LOCAL_URL + "/kids/character/img-tag-event.png";
			flagImg = appConfig.headEnd.LOCAL_UPDATE_URL + "/kids_flag_event_s.png";
		} else if(chkFlagCd.indexOf('new') > -1) {
			//flagImg = appConfig.headEnd.LOCAL_URL + "/kids/character/img-tag-new.png";
			flagImg = appConfig.headEnd.LOCAL_UPDATE_URL + "/kids_flag_new_s.png";
		} else if(chkFlagCd.indexOf('update') > -1) {
			//flagImg = appConfig.headEnd.LOCAL_URL + "/kids/character/img-tag-update.png";
			flagImg = appConfig.headEnd.LOCAL_UPDATE_URL + "/kids_flag_up_s.png";
		}
		
		return flagImg && <span className="tag"><img src={flagImg} alt="" /></span> 
	}

    render() {
		const { index, data } = this.props;
		const { flag_fin_img, tot_chrtr_fout_img, chrtr_nm, isHidden } = data;
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.CHARACTER_LIST);
		const gridSize = 7;
		const gridStyle = { float:'left', display:'block', marginLeft:'71px', marginBottom:'92px' };
		const itemStyle = { width:'180px', height:'180px' };

		let className = 'itemEl';
		className += ' csFocus';

		if(isHidden === undefined || isHidden === false) {
			if(index === 0) 				className += ' left';
			else if(index === gridSize -1) 	className += ' right';
		}

		let flagImg = this.getFlagImageByCd(flag_fin_img);
		let norImg = tot_chrtr_fout_img ? imgUrl + tot_chrtr_fout_img : tot_chrtr_fout_img;
		const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/default/kids_chatacter_block_nor_default.png';

		return (<li style={gridStyle}>
					<div className={isHidden === true ? "item dis" : "item"} data-hidden={isHidden}>
						<div className={className} style={itemStyle}>
							<span className="norImg"><img src={norImg} width="180" height="180" alt="" onError={e=>e.target.src=defaultImg}/></span>
							<span className="itemTitle">{isHidden === true ? '' : chrtr_nm}</span>
							{flagImg}
						</div>
					</div>
				</li>);
    }

}

/**
 * 순서바꾸기 팝업
 */
class PopupSort extends PopupPageView {
	constructor(props) {
		super(props);

		const focusList = [
			{ key: 'popupRadioBtns', fm: null },
			{ key: 'popupConfirmBtns', fm: null }
		];
		this.declareFocusList(focusList);
		this.radioBtnIndex = 0;
	}
	
	componentDidMount() {
		const curRadioIndex = this.getCurRadioIndex();

		// [NEW_NAVI][FM] 최신순/가나다순 라디오 버튼
		const popupRadioBtnsFm = new FM({
			id : 'popupRadioBtns',
			containerSelector : '.radioBtnWrap',
			focusSelector : '.csFocusPop',
			row : 1,
			col : 2,
			focusIdx : curRadioIndex,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onSelectPopupRadioBtns
		});

		// [NEW_NAVI][FM] 적용/취소 버튼
		const popupConfirmBtnsFm = new FM({
			id : 'popupConfirmBtns',
			containerSelector : '.btnWrap',
			focusSelector : '.csFocusPop',
			row : 1,
			col : 2,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : 1,
			onFocusKeyDown: this.onSelectPopupConfirmBtns
		});

		this.setFm('popupRadioBtns', popupRadioBtnsFm);
		this.setFm('popupConfirmBtns', popupConfirmBtnsFm);
		this.setFocus('popupRadioBtns');
	}

	// 정렬 설정값 Radio Index 불러오기
	getCurRadioIndex() {
		const { sortRadioIndex } = this.props.data;
		this.radioBtnIndex = sortRadioIndex !== undefined && sortRadioIndex > -1 ? sortRadioIndex : 0;
		
		try {
			const radioList = document.querySelectorAll('#popupRadioBtns .csFocusPop');
			if(radioList && this.radioBtnIndex > -1) {
				for(let i=0; i<radioList.length; i++) {
					if(this.radioBtnIndex === i) 	radioList[i].classList.remove('select');
				}
				radioList[this.radioBtnIndex].classList.add('select');
			}
		} catch(e) { console.error('[ERROR][getCurRadioIndex]', e)}
			
		return this.radioBtnIndex;
	}

	// [NEW_NAVI][KEY] 라디오 버튼 : 선택시 => this.radioBtnIndex
	onSelectPopupRadioBtns = (e, childIdx) => {
		if(e.keyCode === keyCodes.Keymap.ENTER) {
			try {
				const radioList = document.querySelectorAll('#popupRadioBtns .csFocusPop');
				if(radioList) {
					let curIdx = Number(childIdx);
					for(let i=0; i<radioList.length; i++) {
						if(this.radioBtnIndex === i) 	radioList[i].classList.remove('select');
					}

					if(radioList[curIdx]) {
						radioList[curIdx].classList.add('select');
						this.radioBtnIndex = curIdx;
					}
				}
				this.setFocus(1, 0);
			} catch(e) { console.error('[ERROR][onSelectPopupRadioBtns]', e)}
		}
	}
	
	// [NEW_NAVI][KEY] 적용/취소 버튼
	onSelectPopupConfirmBtns = (e, childIdx) => {
		if(e.keyCode === keyCodes.Keymap.ENTER) {
			const { callback } = this.props;
			if(childIdx === 0) {
				callback(this.radioBtnIndex);	
			} else {
				callback(-1);	
			}
		}
	}

	render() {
		return (
			<div className="popupWrap">
				<div className="popupCon changeOrder">
					<div className="title">순서 바꾸기</div>
					<div className="changeOrderWrap">
						<div className="optionWrap">
							<div className="radioBtnWrap" id="popupRadioBtns">
								<span className="csFocusPop radioStyle1">{CHAR_SORT_TYPE[0].name}</span>
								<span className="csFocusPop radioStyle1">{CHAR_SORT_TYPE[1].name}</span>
							</div>
						</div>
						<div className="btnWrap" id="popupConfirmBtns">
							<span className="btnStyle type02 csFocusPop">적용</span>
							<span className="btnStyle type02 csFocusPop">취소</span>
						</div>
					</div>
				</div>
			</div>
		)
	}
}