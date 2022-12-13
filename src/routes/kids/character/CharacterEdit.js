import { React } from '../../../utils/common';
import { NXPG, MeTV } from '../../../supporters/network';
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';

// new navigator
import FM from '../../../supporters/navi';
import keyCodes from '../../../supporters/keyCodes';
import Core from '../../../supporters/core';
import { scroll } from '../../../utils/utils';

import PageView from '../../../supporters/PageView';
import { kidsConfigs } from '../config/kids-config';
import Utils from '../../../utils/utils';
import { isEmpty, isEqual } from 'lodash';

import '../../../assets/css/routes/kids/character/CharacterEdit.css';
import '../../../assets/css/routes/kids/character/CharacterListEdit.css';

/* Local Json to Test */
import XPG101Json from './static/XPG101CharacterList.json';								// 캐릭터전체보기 리스트 아이템
import appConfig from 'Config/app-config';


const { EVENT_BLOCK_CD } = kidsConfigs.BLOCK;						// 블럭유형
const { CHAR_SORT_TYPE, CHAR_SETTING_TYPE } = kidsConfigs;								// 캐릭터 정렬순서, 캐릭터 숨김정보 등록 구분
const LIMIT_VISIBLE_CNT = 10;															// 숨김처리 제한값
const ITEMS = 7; 																		// 메뉴별 아이템 개수

export default class CharacterEdit extends PageView {
	constructor(props) {
		super(props);

		this.state = isEmpty(this.historyData) ? {
			contentsListInfo: [],
			hiddenIdListInfo: [],
			focusHistory : {
				id: null,
				childIdx: 0
			}
		} : this.historyData;

		this.failedHiddenIdList = [];
		this.isChanged = false;

		const focusList = [
			{ key: 'characterListBlock', fm: null },
			{ key: 'scrollTopBtn', fm: null }
		];
		this.declareFocusList(focusList);
	}


	/*********************************** Component Lifecycle Methods ****************************************/

	componentWillMount() {
		const { showMenu } = this.props;
		if (showMenu && typeof showMenu === 'function') {
			showMenu(false);
		}

		// [2018.06.07 일자로 dummy 데이터 삭제하겠습니다.]
		// if (IS_RUNDEVICE_MODE) {
		// } else {
		// 	this.requestCharacterListLocal();										// LOCAL
		// }

		if (isEmpty(this.paramData)) {
			this.moveBack();
		} else {
			console.log('%c[paramData] ==================>', 'color:#0000ff;', this.paramData);
			console.log('%c[historyData] ==================>', 'color:#0000ff;', this.historyData);
			this.requestCharacterList();						// H/E
		}
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

	componentWillUnmount() {
		document.querySelector('.wrapper').classList.remove('dark');

		// 뒤로가기 키 누르면, 저장 실패된 캐릭터 숨김 설정값 저장
		if (this.failedHiddenIdList && this.failedHiddenIdList > 0) {
			console.log('[componentWillUnmount]==============> failedHiddenIdList=' + this.failedHiddenIdList.length);
			this.failedHiddenIdList.map((data, idx) => {
				return this.requestSetHiddenSettings(data.is_hidden, data.char_id);
			})
		}
		if (this.isChanged) Core.inst().showToast('캐릭터 숨기기 변경사항이 저장되었어요.');
	}


	/*********************************** Other Methods ****************************************/

	/**
	 * 인덱스값으로 리트스의 RowNum 찾기 (스크롤을 위한 현재 RowNum 계산을 위해 사용)
	 */
	getListRowNumFromIndex(data, colNum, idx) {
		let rowIndex = -1;
		try {
			if (data && data.length > 0 && colNum > 1) {
				const totalItems = data.length;
				const rowCnt = Math.ceil(totalItems / colNum);
				for (let r = 1; r <= rowCnt; r++) {
					let startIndex = (r * colNum) - colNum;
					let lastIndex = startIndex + (colNum - 1);
					if (r === rowCnt) lastIndex = totalItems - 1;

					if (idx >= startIndex && idx <= lastIndex) {
						rowIndex = r - 1;
						break;
					}
				}
			} else {
				console.error('[ERROR][getListRowNumFromIndex] no data');
			}
		} catch (e) { console.error('[ERROR][getListRowNumFromIndex]', e); }

		return rowIndex;
	}


	/**
	 * 숨김처리가 제한 값을 초과하였는지 체크.
	 */
	isExceededHidden() {
		const { contentsListInfo } = this.state;
		let cntVisibleChar = 0;
		let isExceededHidden = false;

		if (contentsListInfo) {
			contentsListInfo.forEach((item, idxItem) => {
				if (!item.isHidden) cntVisibleChar++;
			});

			if (cntVisibleChar > LIMIT_VISIBLE_CNT) {
				isExceededHidden = false;
			} else {
				isExceededHidden = true;
			}
		}
		return isExceededHidden;
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

		this.handleResponseData({
			contentsData : contentsData,
			hiddenData : respME048
		});
	}

	/**
	 * [H/E] 숨김 캐릭터ID값 저장
	 */
	requestSetHiddenSettings = (is_hidden, char_id) => {
		let reqParam = {
			transactionId: 'ME049_reg_hiddenId',
			hiddenchar_type: CHAR_SETTING_TYPE.CHAR
		};

		if (is_hidden !== undefined && is_hidden !== null && char_id) {
			reqParam.hiddenchar_id = char_id;

			if (is_hidden) {
				reqParam.event_type = 'ADD';
				Core.inst().showToast('캐릭터가 숨김처리 되었어요.');
			} else {
				reqParam.event_type = 'DEL';
				Core.inst().showToast('캐릭터가 숨김이 해제되었어요.');
			}

			// 1. MeTV 에 숨김캐릭터ID 정렬값 저장
			MeTV.request049(reqParam).then(data => {
				console.log("=========== ME049(ADD) ===========");
				if (data) console.log(">> SUCCESS : ", data);
				else console.log(">> FAILURE");
				console.log("==============================");
			}).catch(error => {
				// 숨김캐릭터ID 저장 실패시, 화면이탈전 다시 저장시도하기 위해
				this.failedHiddenIdList.push({
					is_hidden: is_hidden,
					char_id: char_id
				});
				console.error('[ERROR][ME049]', error);
			});
		}
	}

	/**
	 * [H/E] 로컬 테스트용 [2018.06.07 일자로 dummy 데이터 삭제하겠습니다.]
	 */
	// requestCharacterListLocal = () => {
	// 	this.handleResponseData({ contentsData: XPG101Json });
	// }

	/**
	 * [H/E] 요청 데이터 가공 & state 등록 
	 * [TODO] 순서정렬 order_type 을 xpg 에서 제공하지 않을경우 array 정렬코드 만들어야함.
	 */
	handleResponseData = (responseData) => {
		if (responseData) {
			const { contentsData, hiddenData } = responseData;
			let contentsListInfo = [];

			if (!isEmpty(contentsData)) {
				// 1. ME048 숨김캐릭터, 정렬타입
				const { hiddencharList } = hiddenData ? hiddenData : { hiddencharList: [] };

				contentsData.filter(item => { return item.blk_typ_cd !== EVENT_BLOCK_CD && item.chrtr_nm }).forEach((data, idx) => {
					// 2. XPG101 에서, 컨텐츠 블럭만 추출 
					data.isHidden = false;

					if(!isEmpty(hiddencharList)) {
						hiddencharList.forEach((hiddenCharId, idxHidden) => {
							if (data.menu_id === hiddenCharId) {										// ME048 에 저장된 숨김캐릭터ID(hiddencharList) 와 비교하여 hidden 속성 추가
								data.isHidden = true;
							}
						})
					}
					contentsListInfo.push(data);
				});

				this.setState({
					contentsListInfo: contentsListInfo ? contentsListInfo : [],							/* 캐릭터 블럭정보 */
					hiddenIdListInfo: hiddencharList													/* 숨김캐릭터ID */
				}, () => {
					this.initFmList();
				});
			}
		} else {
			console.log('>> NO RESPONSE DATA');
		}
	}

	/**
	 * state 값에 불러온 값으로, 숨김캐릭터 상태 UI 변경
	 */
	initHiddenCharacterList = () => {
		const { contentsListInfo } = this.state;

		if (!isEmpty(contentsListInfo)) {
			contentsListInfo.forEach((data, index) => {
				const target = document.querySelector('#characterListBlock ul li:nth-child(' + Number(index + 1) + ') .csFocus');
				if (target) {
					target.setAttribute('select', (data.isHidden).toString());
				}
			});
		}
	}

	initFmList = () => {
		const { contentsListInfo } = this.state;

		// 맨위로 버튼
		const scrollTopBtnFm = new FM({
			id: 'scrollTopBtn',
			type: 'ELEMENT',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onSelectScrollTop
		});

		this.setFm('scrollTopBtn', scrollTopBtnFm);

		// 캐릭터 블록 리스트
		const gridSize = 7;
		let totalItem = contentsListInfo ? contentsListInfo.length : 0;
		let lastIndex = totalItem > 0 ? totalItem - 1 : 0;
		let rowCnt = Math.ceil(totalItem / gridSize);

		const characterListBlockFm = new FM({
			id: 'characterListBlock',
			moveSelector: 'ul li',
			focusSelector: '.csFocus',
			row: rowCnt,
			col: gridSize,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: lastIndex,
			onFocusChild: this.onListFocusChanged,
			onFocusKeyDown: this.onSelectCharacterList
		});
		this.setFm('characterListBlock', characterListBlockFm);

		this.initHiddenCharacterList();

		// HistoryData 있을경우, 포커스 복구
		if(!isEmpty(this.historyData)) {
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
			this.setFocus('characterListBlock');
		}
	}

	/*********************************** FocusManager KeyEvent Methods ****************************************/

	// 캐릭터 리스트
	onSelectCharacterList = (e, childIdx) => {
		if (e.keyCode === keyCodes.Keymap.ENTER) {
			this.setState({focusHistory: {id:'characterListBlock', childIdx:childIdx}});

			const { contentsListInfo } = this.state;
			if (contentsListInfo) {
				const data = contentsListInfo[childIdx];
				if (data && data.menu_id) {
					if (data.isHidden === false && this.isExceededHidden()) {										// 숨김캐릭터 제한갯수를 초과했는데, 계속 숨김처리 하려고 할때
						Core.inst().showToast('캐릭터를 더 이상 숨길 수 없습니다.\n다른 캐릭터 숨김을 해제하신 후 다시 시도해주세요.');
					} else {																					// 숨김캐릭터 제한갯수를 초과하였을 경우
						data.isHidden = !data.isHidden;															// 숨김여부 Toggle (state 값 변경)
						this.requestSetHiddenSettings(data.isHidden, data.menu_id);							// 숨김처리할 캐릭터구분ID(menu_id) 를 저장
						const target = document.querySelector('#characterListBlock ul li:nth-child(' + Number(childIdx + 1) + ') .csFocus');
						if (target) target.setAttribute('select', (data.isHidden).toString());

						this.isChanged = true;
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
		const scrollOffset = -80;
		let rowNum = this.getListRowNumFromIndex(contentsListInfo, 7, childIdx) + 1;
		
		if (rowNum < scrollPerRow) {
			scroll(0);
		} else if (rowNum % scrollPerRow === 0) {
			let targetTop = document.querySelector('#characterListBlock ul li:nth-child(' + Number(childIdx + 1) + ') .csFocus').offsetTop;
			if (targetTop) {
				targetTop = (targetTop + scrollOffset) * -1;
				scroll(targetTop);
			}
		}
	}

	// 맨위로 버튼
	onSelectScrollTop = (e) => {
		if (e.keyCode === keyCodes.Keymap.ENTER) {
			this.setFocus(0, 0);
			scroll(0);
		}
	}

	render() {
		const { contentsListInfo } = this.state;

		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="characterEdit scrollWrap">
					<h2 className="pageTitle">캐릭터 숨기기</h2>
					<p className="subInfo">캐릭터를 숨기면 키즈존 홈화면에서 표시되지 않습니다.</p>
					<CharacterListEdit
						data={contentsListInfo}
						setFm={this.setFm}
					/>
					<div className="btnTopWrap" id="scrollTopBtn">
						<div className="csFocus btnTop"><span>맨 위로</span></div>
					</div>
				</div>
			</div>
		)
	}
}



class CharacterListEdit extends React.Component {

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

		return (<div className="characterListEdit" id="characterListBlock">
			<div className="listWrapper">
				<div className="contentGroup">
					<div className="slideWrap">
						<ul className="slideCon" style={gridStyle}>{gridList}</ul>
					</div>
				</div>
			</div>
		</div>);
	}
}



/**
 * 캐릭터 전체보기 - 캐릭터 숨기기 ListItem
 * index : ListItem 의 인덱스 번호
 * data : 데이터
 */
class CharacterListItem extends React.Component {

	render() {
		const { index, data } = this.props;
		const { tot_chrtr_fout_img, chrtr_nm, isHidden } = data;
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.CHARACTER_LIST);
		const gridStyle = { float: 'left', display: 'block', marginLeft: '71px', marginBottom: '82px' };
		const itemStyle = { width:'180px', height:'180px' };

		let className = 'csFocus checkStyleList';
		if (isHidden === undefined || isHidden === false) {
			className += ' csFocus';

			if(index === 0) 				className += ' left';
			else if(index === ITEMS - 1) 	className += ' right';
		}

		let norImg = tot_chrtr_fout_img ? imgUrl + tot_chrtr_fout_img : tot_chrtr_fout_img;
		const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/default/kids_chatacter_block_nor_default.png';
		return (<li style={gridStyle}>
			<div className="item" style={itemStyle}>
				<div className={className} select={isHidden === true ? "true" : "false"}>
					<span className="norImg"><img src={norImg} width="180" height="180" alt="" onError={e=>e.target.src=defaultImg}/></span>
					<span className="itemTitle">{chrtr_nm}</span>
				</div>
			</div>
		</li>);
	}

}