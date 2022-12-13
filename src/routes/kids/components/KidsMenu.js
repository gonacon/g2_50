import React from 'react';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import '../../../assets/css/routes/kids/menu/KidsMenu.css';
import appConfig from './../../../config/app-config';
import { isEmpty } from 'lodash';

let menuData = [];
	// '10': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001000-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001000-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001000-sel.png",
	// },
	// '20': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001100-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001100-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001100-sel.png",
	// },
	// '30': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001200-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001200-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001200-sel.png",
	// },
	// '40': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001300-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001300-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001300-sel.png",
	// },
	// '50': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001400-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001400-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001400-sel.png",
	// },
	// '60': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001500-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001500-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001500-sel.png",
	// },
	// '70': {
	// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001600-def.png",
	// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001600-foc.png",
	// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001600-sel.png",
	// }


const KIDS_MENU_CODE = {
    MONTHLY: '10',
    GENRE: '20',
    CHARACTER: '30',
    LEARNING: '40',
	CHANNEL: '50',
	HABIT: '60',
	FAIRYTALE: '70'
};

class KidsMenu extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			focused: false,
			focusedIdx: -1,
			isShowGnbInfo: true,
		};
	}

	// [NEW_NAVI][FM] 초기 포커스 설정
	handleOnInitFocus = () => {
		const { getHistory, setFocus, menuIndex } = this.props;
		if(setFocus && typeof setFocus === 'function') {
			const historyData = getHistory();
			if (historyData.isOnHistory) {
				if (historyData.childIndex === null) {
					// TODO 원전임 idx 값 확인 필요
					let idx = historyData && historyData.menu && historyData.menu.idx;
					if (isEmpty(idx)) {
						idx = 2;
					}
					console.log('historyData idx=%s', idx, historyData);
					setFocus('kidMenu', idx);
				}
			} else {
				setFocus('kidsMenu', menuIndex);		
			}
		}
	} 

	// [NEW_NAVI][FM] 블록 포커스 온 이벤트
	handleOnSlider = (idx, container) => {
		this.setState({ 
			focused: true ,
			isShowGnbInfo: true
		});

		const { onFocus } = this.props;
		if(onFocus && typeof onFocus === 'function') onFocus();

		// this.kidsMenuFm.setFocusByIndex(0);

	} 

	// [NEW_NAVI][FM] 블록 포커스 오프 이벤트
	handleOffSlider = () => {
		this.setState({ focused: false });
	}

	// [NEW_NAVI][FM] 콘텐츠 포커스 이동 이벤트
	handleOnFocusMove = (idx) => {
		console.log('[handleOnFocusMove focusedIdx] ', idx);
		this.setState({ focusedIdx: idx })
	}
    
    // [NEW_NAVI][FM] 콘텐츠 KeyDown 이벤트
	handleOnKeyDown = (event, idx) => {
		switch(event.keyCode) {
			case keyCodes.Keymap.ENTER:
				const { onSelect } = this.props;
				if(onSelect && typeof onSelect === 'function') onSelect(idx);
				break;
			case keyCodes.Keymap.UP:
				this.props.showMenu(true, true);
				this.setState({
					isShowGnbInfo: !this.state.isShowGnbInfo
				});
				break;
			default:
				break;
		}
	}

	createFm = (props) => {
		const { id, setFm, menus, menuIndex } = props;
		const fm = new FM({
			id : id,
			containerSelector : '.kidsMenuWrap ul',
			focusSelector : '.csFocusKids',
			row : 1, 
			col : menus.length,
			bRowRolling: true,
			focusIdx : menuIndex,
			startIdx : 0,
			lastIdx : menus.length - 1,
			onFocusContainer: this.handleOnSlider,
			onBlurContainer: this.handleOffSlider,
			onFocusChild: this.handleOnFocusMove,
			onFocusKeyDown: this.handleOnKeyDown
		});
		setFm(id, fm);
		this.handleOnInitFocus();
	}

	componentWillMount() {
		console.log('[menus] ', this.props.menus);
	}

	componentDidMount() {
		const { menus } = this.props;
		if (menus.length !== 0) {
			this.createFm(this.props);
		}
	}

	componentWillReceiveProps(nextProps) {
		const { menus: prev } = this.props;
		const { menus: cur } = nextProps;

		// '10': {
		// 	defaultImg: appConfig.headEnd.LOCAL_URL + "/kids/menu/kids-menu-NM1000001000-def.png",
		// 	focusImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001000-foc.png",
		// 	activeImg: appConfig.headEnd.LOCAL_URL 	+ "/kids/menu/kids-menu-NM1000001000-sel.png",
		// },
		if(prev.length === 0 && cur.length !== 0) {
			this.createFm(nextProps);
		}
	}

	render() {
		const { menus, menuIndex } = this.props;
		const { focused, focusedIdx } = this.state;
		let classNames = {
			active: '',
			focus: ''
		}

		// menus.sort((a, b) => {
		// 	const gnbA = Number(a.gnbCd);
		// 	const gnbB = Number(b.gnbCd);
		// 	return gnbA < gnbB ? -1 : gnbA > gnbB ? 1 : 0;

		// })
		
		menus.forEach((item, index) => {	
			menuData[item.gnbCd] = {
				defaultImg: appConfig.headEnd.LOCAL_URL + `/kids/menu/kids-menu-${item.menuId}-def.png`,
				focusImg: appConfig.headEnd.LOCAL_URL 	+ `/kids/menu/kids-menu-${item.menuId}-foc.png`,
				activeImg: appConfig.headEnd.LOCAL_URL 	+ `/kids/menu/kids-menu-${item.menuId}-sel.png`,
			}
		});

		const isHistory = this.props.getHistory().isOnHistory;
		const mapToMenus = menus.map((item, idx) => {
			const { gnbCd: code } = item;
			const imgs = menuData[code];
			// console.log('[focusIdx] , ', focusedIdx);
			classNames.active = menuIndex === idx ? ' active' : '';
			classNames.focus = (focused && !isHistory && focusedIdx === idx) ? ' focusOn' : '';

			return (
				<li key={idx}>
					<span className={`csFocusKids${classNames.active}${classNames.focus}`}> 
						<img src={imgs.defaultImg} className="default" alt="" />
						<img src={imgs.activeImg} className="active" alt="" />
						<img src={imgs.focusImg} className="focus" alt="" />
						{item.menuNm}
					</span>
				</li>
			);
		});
		const focusClass = `kidsMenuWrap${focused ? ' menuFocus': ''}`;
		return (
			<div id="kidsMenu" className="kidsMenu">
				<div className="gnbInfo" style={{display: this.state.isShowGnbInfo? 'block': 'none'}}>메뉴</div>
				<div className={focusClass}>
					<div className="kidsMenuCon">
						<ul>{mapToMenus}</ul>
					</div>
					<span className="leftArrow"></span>
					<span className="rightArrow"></span>
				</div>
				{/* <KidsWidget/> */}
			</div>
		)
	}
}

export { KIDS_MENU_CODE, KidsMenu as default };