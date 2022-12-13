// commons
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import constants, { GNB_CODE, STB_PROP, MENU_NAVI, MENU_ID } from 'Config/constants';
import keyCodes from 'Supporters/keyCodes';

// utils
import PropTypes from 'prop-types';
import { isEmpty, isEqual } from 'lodash';

// style
import 'ComponentCss/gnb/Menu.css';

// components
import MenuItem from './MenuItem';

import { Core } from 'Supporters';
import StbInterface from 'Supporters/stbInterface';
import appConfig from 'Config/app-config';
// import ConfirmPopup from '../../popup/ConfirmPopup';
// import AdultCertification from '../../popup/AdultCertification';
import { isUndefined } from 'util';
import { KidsEndCertification } from '../../routes/kids/playguide';
import Utils from 'Util/utils';

const { /*MONTHLY_BEFORE, MONTHLY_AFTER, HOME_MOVIE, HOME_ANI, HOME_DOCU, HOME_TV,*/
	HOME, MYBTV_HOME, HOME_TVAPP, KIDS_HOME, ALL_MENU, SEARCH_MAIN, MONTHLY_BEFORE, MONTHLY_AFTER } = constants;
const { GNB_ANI, GNB_DOCU, GNB_HOME, GNB_KIDS, GNB_MONTHLY, GNB_MOVIE, GNB_MYBTV, GNB_TV, GNB_TVAPP, GNB_SEARCH, GNB_VIEWALL } = GNB_CODE;
const { Keymap: { ENTER } } = keyCodes;

class Menu extends PureComponent {

	static defaultProps = {
		gnbTypeCode: '',
		changeMenuTrigger: false
	}

	static propTypes = {
		gnbTypeCode: PropTypes.string.isRequired,
		changeMenuTrigger: PropTypes.bool.isRequired,
	}

	constructor(props) {
		super(props);
		this.name = '[Menu]';
		this.state = {
			focusClass: '',
			menulist: [],
			currentGnbTypeCode: 'U5_03',
			currentMenuId: '',
			gnbPage: 0,
			bShow: true,
			bScrollDown: false,
		};

		this.fm = null;
		this.idx = null;
		this.oldGnbTypeCode = '';

		this.gnbMenuList = '';
		this.gnbMenuContainer = '';
		this.gnbMenuArrow = '';
		this.oldIndex = 0;

		// console.log('%c MENU constructor', 'color: red; background: yellow', this.props);
		Core.inst().setGnbMenu(this);
	}

	show = (bShow, bScrollDown = false) => {
		console.log(this.name + 'show', bShow, bScrollDown);
		if (bScrollDown) {
			this.setState({ bScrollDown: !bShow, bShow });
		} else {
			this.setState({ bShow, bScrollDown: !bShow });
		}
	}

	activeMenu = (gnbTypeCode, menuId) => {
		console.log(this.name + 'activeMenu', gnbTypeCode, menuId);
		this.setState({
			currentGnbTypeCode: gnbTypeCode,
			currentMenuId: menuId,
		})
	}

	popupCallback = (data) => {
		// 키즈존 안심설정에서, 비밀번호 맞게 입력시 이탈
		if (data.resule === true) {
			this.enterDown(this.idx, true);
		}
	}

	// [2018.05.25 키즈존 이탈 시나리오 적용]
	// 1. 키즈존 진입 상태인 경우 Btv관련 화면 이동 시, 종료가이드 또는 인증 팝업 처리
	// 2. 키즈존 진입 상태인 경우 키즈존은 초기 설정하지 않도록 처리
	// 3. 키즈존 진입 상태가 아닌 경우 키즈존 화면 진입 시 초기 설정 유지
	// 이외에 조건은 모두 정상 작동하도록 구현

	enterDown = (idx, directMove) => {
		this.idx = idx;
		let { menuId, gnbTypeCode } = this.state.menulist[idx];
		let path = Utils.getGnbTypeCodeToPageMove(gnbTypeCode, menuId);
		const isKidsMode = isEqual(StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY), '1');

		// console.log('%c gnbTypeCode', 'color: red; background: yellow', gnbTypeCode);

		// 화면 이동 시 callBack funcation
		const fnCallback = () => {
			// home 진입시 마다 stb에 GNB 진입 정보 전달, TODO 검토 필요 ( back일때 맞는지, 정상적으로 보내고 있는지(native에서 원하는 형태인지) 등 )
			Core.inst().hideKidsWidget();
			StbInterface.webMenuState(gnbTypeCode);
			this.activeMenu(gnbTypeCode, menuId);
			Core.inst().move(path, { menuId, gnbTypeCode });
		}

		if (gnbTypeCode === GNB_KIDS) { // 키즈 진입
			this.kidszoneExecute(gnbTypeCode, menuId);
		} else if (gnbTypeCode === GNB_VIEWALL || gnbTypeCode === GNB_SEARCH) { // 전체메뉴 & 검색 진입
			fnCallback();
		} else {  // 그 외 진입
			isKidsMode ? Core.inst().webkidsExit(null, fnCallback) : fnCallback();
		}
		this.oldGnbTypeCode = gnbTypeCode;
	}

	onFocusChild = (idx) => {

		const targetClass = this.state.menulist[idx].htmlClass;
		const _this = this.gnbMenuList[idx];
		// console.log('_this', _this);

		if (isEmpty(_this)) {
			return;
		}
		// console.log('this.state.menulist[=%s]', idx, this.state.menulist[idx]);

		document.querySelector('.topMenu').classList.add('active');

		document.querySelector('.topMenu .menuWrap').scrollLeft = 0;


		if (this.state.gnbPage > 0) {
			document.querySelector('.topMenu .menuArrow').classList.add('leftActive');
		} else {
			document.querySelector('.topMenu .menuArrow').classList.remove('leftActive');
		}
		// gnb 좌우 화살표
		let offsetVal = _this.closest('ul').offsetWidth;
		let targetDom = _this.closest('ul').querySelector('li:last-child');

		if (this.state.gnbPage < (targetDom.offsetLeft + targetDom.offsetWidth) - offsetVal) {
			document.querySelector('.topMenu .menuArrow').classList.add('rightActive');
		} else {
			document.querySelector('.topMenu .menuArrow').classList.remove('rightActive');
		}

		// gnb 활성화된 메뉴에 포커스 되었을때 화면에서 벗어나있는경우 위치 잡기
		if (_this.classList.contains('active')) {
			let offsetVal = _this.closest('ul').offsetWidth;
			let _thisLeft = _this.closest('li').offsetLeft;
			let _thisRight = _thisLeft + _this.closest('li').offsetWidth;
			let _target = _this.closest('li');

			if (this.state.gnbPage > _thisLeft) {
				if (_target.previousSibling !== null) {
					this.setState({
						gnbPage: this.state.gnbPage - (this.state.gnbPage - _target.previousSibling.offsetLeft)
					});
				} else {
					this.setState({
						gnbPage: 0
					});
				}
			}

			if (offsetVal < _thisRight - this.state.gnbPage) {
				if (_target.nextSibling !== null) {
					this.setState({
						gnbPage: (_target.nextSibling.offsetLeft + _target.nextSibling.offsetWidth) - offsetVal
					});
				} else {
					let targetDom = _this.closest('ul').querySelector('li:last-child');
					this.setState({
						gnbPage: (targetDom.offsetLeft + targetDom.offsetWidth) - offsetVal
					});
				}
			}
		}

		// 좌우 끝에 포커스 됬을때 처리
		if (idx === 0) {
			document.querySelector('.topMenu .menuArrow').classList.add('rightActive');
			document.querySelector('.topMenu .menuArrow').classList.remove('leftActive');
			this.setState({
				gnbPage: 0
			});
		} else if (idx === this.state.menulist.length - 1) {
			document.querySelector('.topMenu .menuArrow').classList.add('leftActive');
			document.querySelector('.topMenu .menuArrow').classList.remove('rightActive');
			let targetDom = _this.closest('ul').querySelector('li:last-child');
			this.setState({
				gnbPage: (targetDom.offsetLeft + targetDom.offsetWidth) - offsetVal
			});
		}

	}
	// setGnbPage = (idx) => {
	// 	this.setState({ gnbPage: idx });
	// }

	onFocusKeyDown = (event, menuItemIdx) => {
		if (event.keyCode === ENTER) {
			this.enterDown(menuItemIdx);
		}

		const target = this.gnbMenuList[menuItemIdx];

		if (event.keyCode === 37 && target.classList.contains('firstMenu')) {
			let offsetVal = target.closest('ul').offsetWidth;
			let targetDom = target.closest('ul').querySelector('li:last-child');
			if (document.querySelector('.topMenu').classList.contains('menuOver')) {
				this.setState({
					gnbPage: (targetDom.offsetLeft + targetDom.offsetWidth) - offsetVal
				});
			}
		}
		if (event.keyCode === 39 && target.classList.contains('lastMenu')) {
			if (document.querySelector('.topMenu').classList.contains('menuOver')) {
				this.setState({
					gnbPage: 0
				});
			}
		}

		// gnb 좌우 키입력시 다음 메뉴들에 따른 gnb슬라이드 수치 및 위치 잡기
		if (event.keyCode === 37 && target.closest('li').previousSibling !== null) {
			let targetDom = target.closest('li').previousSibling.previousSibling;

			if (targetDom !== null && this.state.gnbPage > targetDom.offsetLeft) {
				this.setState({
					gnbPage: this.state.gnbPage - (this.state.gnbPage - targetDom.offsetLeft)
				});
			}
		}

		if (event.keyCode === 39 && target.closest('li').nextSibling !== null) {
			let offsetVal = target.closest('ul').offsetWidth;
			let targetDom = target.closest('li').nextSibling.nextSibling;

			if (targetDom !== null && offsetVal < (targetDom.offsetLeft + targetDom.offsetWidth) - this.state.gnbPage) {
				this.setState({
					gnbPage: (targetDom.offsetLeft + targetDom.offsetWidth) - offsetVal
				});
			}
		}

	}

	onFocusContainer = () => {
		console.log(this.name + 'onFocusContainer');
		this.setState({ focusClass: 'active' });
	}

	onBlurContainer = () => {
		console.log(this.name + 'onBlurContainer');

		this.setState({ focusClass: '' });
	}

	kidszoneExecute = (gnbTypeCode, menuId) => {
		this.fm.removeFocus();
		let idx = 0;
		for (const iterator of this.state.menulist) {
			if (iterator.gnbTypeCode === gnbTypeCode) { break; }
			idx++;
		}
		this.fm.setFocusByIndex(idx);
		const isFirstKidsEntry = StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN);
		// 최초 진입 시
		if (isFirstKidsEntry === '0' || isEmpty(isFirstKidsEntry)) {
			StbInterface.menuNavigationNative(MENU_NAVI.KIDS_ZONE, { menuId: MENU_ID.KIDS_ZONE_FIRST_INTRO }); // 키즈존 최초 설정 이동
			StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY_VIRGIN, '1');
			// 일반 진입 시
		} else {
			StbInterface.kidszoneState('enter'); // 키즈존 진입 전달
			!appConfig.runDevice && StbInterface.setProperty(STB_PROP.KIDS_MODE_ENTRY, '1');
			this.activeMenu(gnbTypeCode, menuId);
			Core.inst().move(KIDS_HOME);
			setTimeout(() => {
				const voiceUse = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER_VOICE) === '1';
				if (voiceUse) {
					const chrtrName = StbInterface.getProperty(STB_PROP.PROPERTY_KIDS_CHARACTER);
					StbInterface.playKidszoneGuide(`${chrtrName}_01_guide_welcome.mp3`);
				}
			}, 1000);
		}
	}

	componentDidMount() {
		// const { currentGnbTypeCode, currentMenuId } = this.state;
		const { location } = this.props;

		// ref 설정
		const { innerRef } = this.props;
		if (innerRef && typeof innerRef === 'function') {
			innerRef(this);
		}

		if (!isUndefined(location.state) && !isEmpty(location.state.menuPage)) {
			this.setState({ gnbPage: this.props.menuPage });
		}
		this.gnbMenuContainer = document.querySelectorAll('#gnbMenu ul');
		this.gnbMenuArrow = document.querySelectorAll('#gnbMenu .menuArrow div');
	}

	componentWillReceiveProps(nextProps) {
		if (!isEqual(this.props, nextProps)) {
			const { menulist, menuId } = nextProps;
			this.setState({
				menulist,
				currentMenuId: menuId,
			}, () => {
				this.gnbMenuList = document.querySelectorAll('#gnbMenu ul li span');
			});

			if (!this.fm) this.fm = nextProps.gnbFm;
			// console.log('%c menu receive', 'color: red; background: yellow', nextProps);
			if (nextProps.history.location.state && nextProps.history.location.state.menuNavi) {
				// console.log('%c menu receive', 'color: red; background: yellow', this.fm);
				if (this.gnbFm) this.gnbFm.removeFocus();
			}
		}
	}

	render() {

		// console.log('gnb Menu render');

		const { focusClass, menulist, bShow, bScrollDown, gnbPage, /*currentMenuId,*/ currentGnbTypeCode } = this.state;
		const display = bShow ? 'block' : 'none';
		const style = { '--page': gnbPage };

		let menuItems = menulist.map((item, i) => {
			let activeClass = item.gnbTypeCode === currentGnbTypeCode ? ' active' : '';
			let directClass = i <= 2 ? ' left ' : '';
			directClass += i >= 7 ? ' right ' : '';
			directClass += i === 0 ? ' firstMenu ' : '';
			directClass += i === menulist.length - 1 ? ' lastMenu ' : '';
			return <MenuItem key={i} index={i}
				htmlClass={`${item.htmlClass}${activeClass}${directClass}`}
				menuText={isEmpty(item.imgs) ? item.menuText : ''}
				imgs={item.imgs} />
		});

		return (
			<div className={`topMenu ${focusClass}`} id="gnbMenu" style={{ display }} >
				<div className="menuWrap" style={style}>
					<ul>{menuItems}</ul>
				</div>
				<div className="menuArrow">
					<div className="left">
						<img src={`${appConfig.headEnd.LOCAL_UPDATE_URL}/gnbmenu_arrow_left_l.png`} alt="왼쪽" />
					</div>
					<div className="right">
						<img src={`${appConfig.headEnd.LOCAL_UPDATE_URL}/gnbmenu_arrow_right_l.png`} alt="오른쪽" />
					</div>
				</div>
			</div >
		)
	}

}

export default withRouter(Menu);