import { React } from '../../../utils/common';
import '../../../assets/css/routes/liveTv/boxOffice/BoxOffice.css';
import PageView  from '../../../supporters/PageView';
//network
import { NXPG } from '../../../supporters/network';
//component
import ChannelList from './ChannelList';
import Menu from './Menu';

//dummy data
//import orgMenu from '../../../assets/json/routes/liveTv/organization/OrgMenu.json';
//import boxOffice from '../../../assets/json/routes/liveTv/boxOffice/BoxOffice.json';
//import dummyMenu from '../organization/menu.json';
import channelData from './channelData.json';
import nxpg018Rs from './nxpg018.json';
import programsData from './programsData.json';

//utils
import {channelDataMaaping, getChannelNoList, realtimeProgramMapping, channelDataMaapingDev } from './BoxOfficeManager';
import Utils, { scroll } from '../../../utils/utils.js'
import keyCodes from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import appConfig from 'Config/app-config';
import StbInterface, { CHManager } from 'Supporters/stbInterface';
import { isEmpty } from 'lodash';
import constants, { STB_PROP } from 'Config/constants';
import { Core } from 'Supporters';
import Clock from './Clock';

const KEY = keyCodes.Keymap;
const SCROLLVAL = 370;

const DEVELOPMENT = !appConfig.runDevice;


const PIP_PLAY_SIZE = {
	'0': { x: '228', y: '235', width: '360', height: '210'},
	'1': { x: '645', y: '235', width: '360', height: '210'},
	'2': { x: '1060', y: '235', width: '360', height: '210'},
	'3': { x: '1477', y: '235', width: '360', height: '210'},
	'4': { x: '228', y: '235', width: '360', height: '210'},
	'5': { x: '645', y: '235', width: '360', height: '210'},
	'6': { x: '1060', y: '235', width: '360', height: '210'},
	'7': { x: '1477', y: '235', width: '360', height: '210'},
	'8': { x: '228', y: '235', width: '360', height: '210'},
	'9': { x: '645', y: '235', width: '360', height: '210'},
	'10': { x: '1060', y: '235', width: '360', height: '210'},
	'11': { x: '1477', y: '235', width: '360', height: '210'},
	'12': { x: '228', y: '235', width: '360', height: '210'},
	'13': { x: '645', y: '235', width: '360', height: '210'},
	'14': { x: '1060', y: '235', width: '360', height: '210'},
	'15': { x: '1477', y: '235', width: '360', height: '210'},
	'16': { x: '228', y: '605', width: '360', height: '210'},
	'17': { x: '645', y: '605', width: '360', height: '210'},
	'18': { x: '1060', y: '605', width: '360', height: '210'},
	'19': { x: '1475', y: '605', width: '360', height: '210'},
}

class BoxOffice extends PageView {
	constructor(props) {
		super(props);

		let nowTime = Date.now() / 1000;
		this.menuList = []
		this.timeout = '';
		this.state = {
			contentGroupActive : 0,
			focusProgram : 0,
			menuOpened : false,
			menuClosed : false,
			error: false,
			boxOffice: [],
			categorys : [],
			now: nowTime,
			ageLimit: 99,
			pageNo: 0,
			bgStatus : 0, //0 : 초기화면 1: pip 화면
			pipStatus: false
		};

		const focusList = [
			{ key: 'topButtons', FM: null, link: null},
			{ key: 'categoryMenu', FM: null, link: {RIGHT: 'boxOfficeChannel', DOWN: null}},
			{ key: 'boxOfficeChannel', fm: null, link: {UP: null, LEFT: 'categoryMenu', DOWN: null }},		
		]
		this.declareFocusList(focusList);

		 // 카테고리별 채널리스트
		 this.categoryChannels = [];
		 //this.allChannelList;
	}

	componentDidMount() {
		this.props.showMenu(false);
		var boxOfficeList = [];
		let ageLimit = null;
		let error = false;

				
		let categorys = [];
		let categoryChannels = [];
		const realChannelRq = NXPG.request018(); //인기채널 목록
		const result017 = NXPG.request017(); //장르정보
		
		if (DEVELOPMENT) {
			Promise.all([realChannelRq, result017]).then((response) => {
				response[0] = nxpg018Rs;
				let realtimeChannel = channelDataMaapingDev(channelData, response[0].rating, null, null);
				boxOfficeList = realtimeProgramMapping(realtimeChannel, programsData);
				ageLimit = appConfig.STBInfo.level;

				if(boxOfficeList.length !== 20) {
					error = true;
				}
				
				try {
					const {channel: categoryInfos} = response[1];
					categorys = categoryInfos? categoryInfos.map((category, idx) => {
						const chChannel = category.channels.map((ch, chIdx)=>{
							return {
								num: ch.channel_no,
								name: ch.channel_name,
								svcId: ch.service_id
							}
						})
						categoryChannels.push(chChannel);
						const { category_name: label, category_id: id } = category;
						return {
							id,
							label
						};
					}) : [];
				} catch (err) {
					console.error(err);
				} finally {
					this.categorys = categorys;
					this.categoryChannels = categoryChannels;
				}
				
				this.setState({
					boxOffice: boxOfficeList,
					ageLimit: ageLimit,
					categorys: this.categorys,
					error: error
				})
				
				this.registerFM(error);
				setTimeout(() => {
					this.setFocus('boxOfficeChannel', 0);
				}, 1);
			})
		} else {		
			Promise.all([realChannelRq, result017]).then((response) => {
				this.allChannelList = CHManager.getAllList();
				StbInterface.requestChannelList((data) => {
					const {favoriteChannel, blockChannel, joinChannel} = data;
					let favList = [];
					let blockList = [];
					let joinList = [];
					
					favList = favoriteChannel.split('|');
					blockList = blockChannel.split('|');
					joinList = joinChannel.split('|');
					let realtimeChannel = channelDataMaaping(this.allChannelList, response[0].rating, favList, blockList, joinList); //channelData
					const channelNoLists = getChannelNoList(realtimeChannel);
					const programsResult = StbInterface.getListByRealTime(channelNoLists);
					boxOfficeList = realtimeProgramMapping(realtimeChannel, programsResult);

					ageLimit = StbInterface.getProperty(STB_PROP.CHILDREN_SEE_LIMIT);
					if(boxOfficeList.length !== 20) {
						error = true;
					}
					try {
						const {channel: categoryInfos} = response[1];
						categorys = categoryInfos? categoryInfos.map((category, idx) => {
							const chChannel = category.channels.map((ch, chIdx)=>{
								return {
									num: ch.channel_no,
									name: ch.channel_name,
									svcId: ch.service_id
								}
							})
							categoryChannels.push(chChannel);
							const { category_name: label, category_id: id } = category;
							return {
								id,
								label
							};
						}) : [];
					} catch (err) {
						console.error(err);
					} finally {
						this.categorys = categorys;
						this.categoryChannels = categoryChannels;
					}
					
					this.setState({
						boxOffice: boxOfficeList,
						ageLimit: ageLimit,
						categorys : this.categorys,
						error : error
					})

					this.registerFM(error);
					setTimeout(() => {
						this.setFocus('boxOfficeChannel', 0)
					}, 1);
					});
			})
		}
	}

	componentWillUnmount(){
		this.setState({
			bgStatus : 0
		})
		let channelNo = this.state.boxOffice[this.state.focusProgram].channel_no;
		const data = { chNum: channelNo, playState: 1};
		StbInterface.requestPlayPip(data);
	}
	
	registerFM = (error) => {
		let boxOfficeChannel;
		if(!error){
			boxOfficeChannel = new FM({
				id : "boxOfficeChannel",
				containerSelector : '.scrollWrap',
				moveSelector : '',
				focusSelector: '.csFocus',
				col : 4,
				row : 5,
				focusIdx: 0,
				startIdx: 0,
				lastIdx : 19,
				onFocusContainer : this.onFocusBoxOfficeChannel,
				onFocusChild : this.onFocusChildChannel,
				onFocusKeyDown : this.onFocusKeyDownChannel
			})
		}else{
			boxOfficeChannel = new FM({
				id : "boxOfficeChannel",
				onFocusContainer : this.onFocusBoxOfficeChannel,
			})
		}
		this.setFm('boxOfficeChannel', boxOfficeChannel);
	}
	
	onFocusBoxOfficeChannel = () => {
		this.openMenu(false);
	}

	onFocusChildChannel = (idx) => {
		let focusPageNo = Math.floor(idx / 4);
		let menuClosed = this.state.menuClosed;
		this.setState({
			focusProgram : idx,
			contentGroupActive : focusPageNo,
			bgStatus : 1,
			menuClosed : false,
			pipStatus : false
		})
		
		if (!menuClosed){
			if (this.state.boxOffice[idx]) {
				const channelData = this.state.boxOffice[idx];
				const channelNo = channelData.channelNo;
				const channelBLock = channelData.channelBLock;
				const channelRating = channelData.channelRating;
				//const programRating = channelData.program.rating;
				const channelIsPay = channelData.channelIsPay;
				const channelSvcID = channelData.channelSvcID;
				const videoResolution = channelData.resolution;
				const channelVirtual = channelData.channelVirtual;
				const ageLimit = this.state.ageLimit;
				
				let pipPlay = true;
				if (channelBLock || Number(channelRating) >= 21 || (Number(ageLimit) !== 0 && Number(channelRating) >= ageLimit) ||channelIsPay || videoResolution === 2 || channelVirtual || channelSvcID === 105) {
					pipPlay = false;
				}
				const data = { chNum: channelNo, playState: 1};
				Object.assign(data, PIP_PLAY_SIZE[idx]);
				StbInterface.requestPlayPip(data);
				
				if (isEmpty(this.timeout)) {
					clearTimeout(this.timeout);
				}
				
				if(pipPlay) {				
					this.timeout = setTimeout(() => {
						data.playState = 0;
						StbInterface.requestPlayPip(data, this.callbackRequestPlayPip);
					}, 0);
				}
			}
		}
	}

	callbackRequestPlayPip = (response) => {
		if(response && response.state === 'PLAY') {
			setTimeout(() => {
				this.setState({
					pipStatus : true
				})				
			}, 1);

		}
	}

	onFocusKeyDownChannel = (evt, idx) => {
		let rowIdx = 0;
		let scrollValue;
		let boxOfficeLength = this.state.boxOffice.length;

		let channelNo;

		//console.log('keyCode', evt.keyCode)
		switch (evt.keyCode) {
			case KEY.UP:			
				if (4 <= idx ){
					rowIdx = Math.trunc(idx / 4) - 1;
					scrollValue = - rowIdx * SCROLLVAL;
					scroll(scrollValue);
				}
				break;
			case KEY.DOWN:
				if(idx < boxOfficeLength - 8 ){
					rowIdx = Math.trunc(idx / 4) + 1;
					scrollValue = - rowIdx * SCROLLVAL
					scroll(scrollValue);
				}
				break;
			case KEY.RIGHT:
				if(idx % 4 === 3 && idx < (boxOfficeLength - 5)){
					rowIdx = Math.trunc(idx / 4) + 1;
					scrollValue = - rowIdx * SCROLLVAL;
					scroll(scrollValue);
				}
				break;
			case KEY.LEFT:
				if(idx % 4 === 0){
					//메뉴 이동
					this.openMenu(true);
					this.setFocus(1, 0);
					return true;
				}
				break;
			case KEY.ENTER:
				channelNo = this.state.boxOffice[idx].channelNo;
				const actionType = 'M';
				const data = {	
					channelNo : channelNo,
					//entryPath : 'WING_UI',
					entryPath : 'EPG_GENRE',
					fromMenu : ''
				}
				StbInterface.requestLiveTvService(actionType, data, null); //채널이동
				break;
			case KEY.BLUE_KEY:
				this.bookMark(idx);
				break;
			case KEY.FAV_KEY:
				this.bookMark(idx);
				break;
			default:
				break;
		}
	}
	bookMark = (idx) => {
	//선호채널 등록/해제
		const channelName = this.state.boxOffice[idx].channelName;
		const channelNo = this.state.boxOffice[idx].channelNo;
		const channelFavorite = this.state.boxOffice[idx].channelFavorite;
		const channelSvcId = this.state.boxOffice[idx].channelSvcID;
		const {boxOffice} = this.state;
		let originBoxOffice = [...boxOffice];
		if (channelFavorite) {
			const param = {
				group: 'IPTV',
				yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				isAll_type : 0,
				sris_id : channelSvcId,
				deleteList: [channelSvcId],
				ch_type : "1",
			}
			Utils.bookmarkDelete(param, 'D').then((result) => {
				originBoxOffice[idx] = {
					...boxOffice[idx],
					channelFavorite: false
				};
				this.setState({
					boxOffice: originBoxOffice
				});
			});
		} else {
			const param = {
				group: 'IPTV',
				yn_kzone: 'N',    //StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				sris_id : channelSvcId, // StbInterface.setFavorite parameter
				svc_id : channelSvcId, //MeTv H/E parameter
				ch_type : "1",
			};
			Utils.bookmarkCreate(param).then((result) => {
				originBoxOffice[idx] = {
					...boxOffice[idx],
					channelFavorite: true
				};
				this.setState({
					boxOffice: originBoxOffice
				});
			});
		}
		Core.inst().showToast(`${channelNo} ${channelName}`, channelFavorite? '선호채널이 해제되었습니다.': '선호채널로 등록되었습니다.');
	};

	openMenu = (openYn) =>{
		if(openYn){
			this.setState({
				menuOpened : openYn,
				menuClosed : openYn
			});
		} else {
			this.setState({
				menuOpened : openYn
			});
		}
		
	};

	onSelectCategory = (category) => {
		this.openMenu(false);
		
		let channelNo = this.state.boxOffice[this.state.focusProgram].channel_no;
		const data = { chNum: channelNo, playState: 1};
		StbInterface.requestPlayPip(data);
		this.setState({
			bgStatus : 0
		})
		if (category === 0) {
			this.setFocus('boxOfficeChannel')
            this.movePage(constants.BOX_OFFICE);
        } else {
			this.movePage(`${constants.EPG}/${category}`)        
        }
	}

	render() {
		const { categorys, now, menuOpened, boxOffice, focusProgram, pipStatus, ageLimit, bgStatus, contentGroupActive } = this.state;
		
		let itemRow = boxOffice.length/4;
		let rowItemNum = 4;
		let boxOfficeData = [];
		
		for(let i = 0; i < itemRow; i++){
			boxOfficeData[i] = [];
			for(let k = 0; k < rowItemNum; k++){
				if(boxOffice[(i*rowItemNum) + k] !== undefined){
					boxOfficeData[i][k] = boxOffice[(i*rowItemNum) + k];
				}
			}
		}
		
		//좌측 메뉴
		const containerClass = `orgCon${menuOpened?' menuOpen':''}`;
		//상하 표시키
		let boxOfficeWrapClass = 'boxOfficeWrap';
		if (0 <= focusProgram && focusProgram < 4) {
			boxOfficeWrapClass = 'boxOfficeWrap first';
		} else if (16 <= focusProgram && focusProgram < 20) {
			boxOfficeWrapClass = 'boxOfficeWrap last';
		}

		let boxOfficeClassName = '';
		if (bgStatus === 1) {
			boxOfficeClassName = 'orgWrap boxOffice active wrap';
		} else {
			boxOfficeClassName = 'orgWrap boxOffice wrap';
		}
		return (
			<div className={boxOfficeClassName}>	
				<div className={containerClass}>
					<h2 className="pageTitle">
						인기채널
						<Clock />
					</h2>
					<Menu
						list={categorys}
						setFm={this.setFm}
						openMenu={this.openMenu}
						onSelectCategory={this.onSelectCategory}
					/>
					
					{this.state.error ? '' :
						<div className={boxOfficeWrapClass}>
							<span className='arrowTopIcon'></span>
							<div className="boxOfficeHidden">
								<div className="scrollWrap" id="boxOfficeChannel" style={{transition: 'none'}}>
									{boxOfficeData.map((data, i) => {
										return (
											<div className={`contentGroup ${i === contentGroupActive ? 'active' : ''}`} key={i}>
												{data.map((dataCon, k) => {
													return (
														<ChannelList
															idx={dataCon.channelIdx}
															key={k}
															now={now}
															boxOffice={boxOffice[dataCon.channelIdx]}
															ageLimit={ageLimit}
															focusProgram={focusProgram}
															pipStatus={pipStatus}
														/>
													)
												})}
											</div>
										)
									})}
								</div>
							</div>
							<span className='arrowBottomIcon'></span>
						</div>
					}
					<div className="keyWrap">
						<span className="btnKeyOK">채널이동</span>
						<span className="btnKeyBlue">선호채널등록 / 해제</span>
					</div>
				</div>
			</div>
		)
	}
}

export default BoxOffice;
