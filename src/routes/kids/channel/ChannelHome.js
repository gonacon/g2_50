import { React } from '../../../utils/common';
import PageView from './../../../supporters/PageView';
import appConfig from 'Config/app-config';

// navigator
import { fm } from '../../../supporters/navigator';
import keyCodes from "../../../supporters/keyCodes";
import { gFocusInfo } from './../components/focusInfo';

// Json Files
import ChannelHomeJson from '../../../assets/json/routes/kids/channel/ChannelHome.json';

import { WEPG } from '../../../supporters/network/WEPG';

// Component Files

// CSS Files
import '../../../assets/css/routes/kids/channel/ChannelHome.css';

// Plugin
import _ from 'lodash';

export default class ChannelHome extends PageView {
	constructor(props) {
		super(props);
		
		this.itemWidth = 360; // 슬라이드 가로 폭
		this.slideTo = 3; // 이전 다음 clone 개수

		this.lastFocusIndex = -1;

		if (_.isEmpty(this.historyData)) {
			// [NAVIGATOR][BEGIN]---------------------

			this.VIEW_NAME = "ChannelHome"			// 포커스 식별자
			this.focusList = [];							// FM list
			this.lastFmIndex = 0;							// FM index
			this.lastFmElemIndex = -1;						// element index
			this.isFocused = false;

			// [NAVIGATOR][END]-----------------------

			this.domEl = {
				main: '.channelSlideWrap.scrollWrap'
			}
			this.state = {
				channelList: [],
				channelListTotalCount: 0
			}
		} else {
			console.log('historydata:', this.historyData);
			this.state = this.historyData
		}
	}

	componentWillMount() {
		if (this.historyData) {
			this.setState(this.historyData);
		} else {
			if (appConfig.runDevice) {
				this.requestChannelHomeAPI(); // H/E
			} else {
				this.requestChannelHome_Local();	// LOCAL
			}
		}
	}

	componentDidMount() {
		// [NAVIGATOR]
		if (this.historyData) {
			this.recoverFocus();
		} else {
			this.initFocusList();
		}
	}

	requestChannelHomeAPI = () => {
		// STB Interface 연동 필요
	}

	requestChannelHome_Local = () => {
		this.setResponseData(ChannelHomeJson);
	}

	setResponseData = (responseData) => {
		console.log(responseData);

		if (!_.isEmpty(responseData.slideItem)) {
			// 결과 값이 있다면 데이터 필터 후 저장, 포커스 매니져 생성을 합니다.
			let slideItemLength = responseData.slideItem.length;
			let data = [];
			
			data[0] = JSON.parse(JSON.stringify(responseData.slideItem));
			for(let i = 0; i < this.slideTo; i++){
				data[0].push(data[0][i]);
			}
			for(let i = 0; i < this.slideTo; i++){
				data[0].unshift(data[0][slideItemLength - 1]);
			}

			this.setState({
				channelList: data[0],
				channelListTotalCount: data[0].length
			}, () => {
				this.getElementByString('.channelSlideWrap.scrollWrap', false).classList.add('focus');
 				this.initFocusList();
			})
		}
	}

	requestChannelInfo = () => {
		// 채널 리스트 API Request Parameter 구성 --- (#1)
		const fw = (v) => {
			const s = '00' + v;
			return s.substr(s.length - 2, 2);
		}
		const getDate = () => {
			const newDate = new Date();
			const yyyy = newDate.getFullYear();
			const mm = fw(newDate.getMonth() + 1);
			const dd = fw(newDate.getDate());
			return `${yyyy}${mm}${dd}`;
		}

		const requestParam = {
			svc_ids: '14|24|36|21|44|18|27',
			o_date: getDate()
		}

		// 채널 리스트 API 요청 후 결과 값을 받습니다. --- (#2)
		WEPG.requestV5001(requestParam).then(({ status, data, transactionId }) => {
			console.log('requestV5001 result is success');
			console.log(data);

			this.setState({ channelInfo: [1, 2, 3] });

		}).catch(({ status, data, transactionId }) => {
			console.log('requestV5001 result is fail');
		});
	}

	initFocusList = () => {
		console.log('>>>> ' + this.VIEW_NAME + '==== [initFocusList]');

		const { channelList } = this.state;
		let lastIndex = channelList && channelList.length > 0 ? channelList.length - 1 : 0;
		this.focusList = [];

		// Array 로 FM 등록
		this.focusList.push(
			fm.createFocus({
				id: 'channelHome',
				moveSelector: '.slideWrapper .slide',
				focusSelector: '.csFocusCenter',
				row: 1,
				col: channelList.length,
				focusIdx: 3, // default
				startIdx: 0,
				lastIdx: lastIndex
			})
		);

		const selector = gFocusInfo.getSelectorFromFm(this.focusList[this.lastFmIndex]);
		const focusTarget = document.querySelector(selector);
		if (focusTarget) {
			this.isFocused = true;
			this.focusList[this.lastFmIndex].addFocus();
			this.setFocusActive(this.lastFmIndex);

			gFocusInfo.setFocusInfo(this.VIEW_NAME);
		}
	}

	// KeyDown 이벤트 처리 함수
	onKeyDown = (e) => {
		// [NAVIGATOR][BEGIN]---------------------

		// 포커스 대상이 없을때, GNB 로 보냄
		const selector = gFocusInfo.getSelectorFromFm(this.focusList[this.lastFmIndex]);
		const focusTarget = document.querySelector(selector);
		if (!focusTarget) {
			gFocusInfo.setFocusInfo(gFocusInfo.KIDS_GNB.VIEW_NAME);
			return false;
		}

		let targetFocus = this.focusList[this.lastFmIndex];

		// 포커스 전환
		if (!gFocusInfo.checkFocus(this.VIEW_NAME)) {
			this.isFocused = false;
			return false;
		}
		this.isFocused = true;

		let currentIndex = targetFocus.getFocusedIndex();
		gFocusInfo.setLastFocusInfo(this.VIEW_NAME, this.lastFmIndex, currentIndex);

		// [NAVIGATOR][END]---------------------		

		switch (e.keyCode) {
			case keyCodes.Keymap.LEFT:
				console.log("[" + this.VIEW_NAME + "]==============>[LEFT]");
				// targetFocus.moveFocus('LEFT');
				break;
			case keyCodes.Keymap.RIGHT:
				console.log("[" + this.VIEW_NAME + "]==============>[RIGHT]");
				// targetFocus.moveFocus('RIGHT');
				break;
			case keyCodes.Keymap.UP:
				console.log("[" + this.VIEW_NAME + "]==============>[UP]");
				this.getElementByString('.channelSlideWrap.scrollWrap', false).classList.remove('focus');
				targetFocus.removeFocus();

				gFocusInfo.setFocusInfo(gFocusInfo.KIDS_GNB.VIEW_NAME);
				break;
			case keyCodes.Keymap.DOWN:
				console.log("[" + this.VIEW_NAME + "]==============>[DOWN]");
				// targetFocus.moveFocus('DOWN');
				break;
			case keyCodes.Keymap.ENTER:
				if (this.lastFmElemIndex > -1) {																				// [NAVIGATOR] : if
					console.log("[" + this.VIEW_NAME + "]==============>[ENTER]");
					this.getElementByString('.channelSlideWrap.scrollWrap', false).classList.add('focus');
					targetFocus.addFocus();
				}
				break;
			// 서브 화면을 변경합니다. --- (#1)
			default:

		}

		this.lastFmElemIndex = currentIndex;
	}

	setFocusActive = (fmIndex) => {
		// 회전목마 적용 시 수정 필요
		const focusM = this.focusList[fmIndex];
		const curIdx = focusM.listInfo.curIdx;
		
		focusM.getFocusElementByIndex(curIdx).classList.add('defaultFocus');
		focusM.getFocusElementByIndex(curIdx).parentElement.classList.add('active');
	}

	getElementByString = (str, bAll) => {
		return bAll ? document.querySelectorAll(str) : document.querySelector(str)
	}

	render() {
		const { channelList, channelListTotalCount } = this.state;
		const mapToChannelList = channelList.map((item, index) => {
			return (<ChannelHomeItem
				channelItem={item} 
				totalCount={channelListTotalCount}
				index={index}
				slideTo={this.slideTo}
				key={index}/>)
		});
		const styles = {
			transform: 'translate(0px, 0px)'
		}

		return (
			<div id="channelHome" className="channelWrap">
				<div className="bgWrap"><img src={`${appConfig.headEnd.LOCAL_URL}/kids/channel/bg.png`} alt="" /></div>
				<div className="channelSlideWrap scrollWrap" style={styles}> {/* 포커스시 focus 추가*/}
					<div className="contentGroup">
						<div className="slideWrap">
							<div className="slideCon">
							<div className="slideWrapper" style={{'--page':this.slideTo,'width':(channelList.length) * this.itemWidth}}>
									{mapToChannelList}
								</div>
							</div>
							<span className="icRocket"></span>
							<div className="leftArrow"></div>
							<div className="rightArrow"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class ChannelHomeItem extends React.Component {
	render() {
		const { channelItem, index, totalCount, slideTo, focusIdx } = this.props;
		const classNames = {
			slide: index < 3 || index >= totalCount - slideTo ? "slide clone" : "slide",
			left: index < 3 ? ' left' : '', // 회전목마 적용 후 수정 필요
			right: index > 3 ? ' right' : '' // 회전목마 적용 후 수정 필요
		}
		return (
			<div className={`${classNames.slide}${classNames.left}${classNames.right}`}>
				<div className="csFocusCenter">
					<div className="nor">
						<span className="wrapImg">
							<img src={channelItem.imageN} alt="" />
						</span>
						<p className="vodTitle"><span className="num">{channelItem.channel}</span><span className="title">{channelItem.vodTitle}</span></p>
						<p className="channelInfo"><span className="state">{channelItem.state}</span>{channelItem.channelTitle}</p>
					</div>
					<div className="foc">
						<span className="wrapImg">
							<img src={channelItem.imageF} alt="" />
						</span>
						<p className="vodTitle"><span className="num">{channelItem.channel}</span><span className="title">{channelItem.vodTitle}</span></p>
						<p className="channelInfo"><span className="state">{channelItem.state}</span>{channelItem.channelTitle}</p>
					</div>
				</div>
			</div>
		)
	}
}