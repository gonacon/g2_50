// commons
import React, { Component } from 'react';
import appConfig from '../../config/app-config';
import constants, { STB_COMMAND } from '../../config/constants';
import PageView from '../../supporters/PageView';

// utils
import keyCodes from "../../supporters/keyCodes";
import { fm } from '../../supporters/navigator';
import StbInterface from '../../supporters/stbInterface';
import Core from '../../supporters/core';

import dateFormat from 'dateformat';
import { cryptoUtil } from "../../utils/cryptoUtil";

// style
import './testCaseApp.css';
import Utils, { TasData } from 'Util/utils';

// components
class StbTest extends PageView {
	constructor(props) {
		super(props);
		this.data = [
			{
				title: STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {
							"fromCommerce": false,
							"seeingPath": "ETC",
							"epsd_id": "",
							"adultCheck": false,
							"person_id": "",
							"lastchannelId": -1,
							"keyword": "",
							"epsd_rslu_id": "",
							"sris_id": "",
							"search_type": "",
							"mode": "",
							"mst_id": "",
							"product": "",
							"title": "",
						},
						"menuType": "allMenu"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			},
			// 	{
			// 	title: STB_COMMAND.STB_INFO,
			// 	interface: 'IF-STB-V5-101'
			// }, 
			{
				title: '인물정보이동 ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {
							"person_id": "MP0000000001"
						},
						"menuType": "searchPersonDetail"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: '검색 결과 ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {
							"keyword": "런닝맨"
						},
						"menuType": "search"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: '쿠폰 화면  ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"TYPE": "response",
					"COMMAND": "MenuNavigationWeb",
					"CONTENTS": "",
					"DATA": {
						"menuType": "coupon",
						"result": "success"
					}
				}
			}, {
				title: '포인트 화면  ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {},
						"menuType": "Point"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: 'Movie 화면  ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {},
						"menuType": "movie"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: 'TV 화면  ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {},
						"menuType": "tv"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: '엔딩 시놉 화면  ' + STB_COMMAND.MENU_NAVIGATION_WEB,
				interface: 'IF-STB-V5-301',
				obj: {
					"DATA": {
						"extInfo": {
							"product": "",
							"fromCommerce": false,
							"seeingPath": "",
							"epsd_id": "CE0001343198",
							"adultCheck": false,
							"title": "7년의 밤",
							"epsd_rslu_id": "{D6256854-3B9D-11E8-858D-9B85EEC25B2C}",
							"sris_id": "CS01103636",
							"search_type": "1",
							"cw_call_id_val": "TEST.ENDING.SYNOPSIS.PAGE"
						},
						"menuType": "synopsisEnding"
					},
					"CONTENTS": "",
					"COMMAND": "MenuNavigationWeb",
					"TYPE": "request"
				}
			}, {
				title: STB_COMMAND.ENCRYPT_DATA,
				interface: 'IF-STB-V5-214'
				// }, {
				// 	title: STB_COMMAND.MENU_NAVIGATION_WEB,
				// 	interface: 'IF-STB-V5-301',
			}, {
				title: STB_COMMAND.CHANNEL_LIST,
				interface: 'IF-STB-V5-103'
			}, {
				title: STB_COMMAND.RESERVATION_INFO,
				interface: 'IF-STB-V5-104'
			}, {
				title: STB_COMMAND.PLAY_INFO,
				interface: 'IF-STB-V5-105'
			}, {
				title: STB_COMMAND.MENU_NAVIGATION_NATIVE,
				interface: 'IF-STB-V5-201'
			}, {
				title: STB_COMMAND.LIVETV_SERVICE,
				interface: 'IF-STB-V5-202'
			}, {
				title: STB_COMMAND.PLAY_VOD,
				interface: 'IF-STB-V5-203'
			}, {
				title: STB_COMMAND.STOP_VOD,
				interface: 'IF-STB-V5-204'
			}, {
				title: STB_COMMAND.PLAY_PIP,
				interface: 'IF-STB-V5-205'
			}, {
				title: STB_COMMAND.PLAY_OAP,
				interface: 'IF-STB-V5-206'
			}, {
				title: STB_COMMAND.REQUEST_TOKEN,
				interface: 'IF-STB-V5-207'
			}, {
				title: STB_COMMAND.OPEN_POPUP,
				interface: 'IF-STB-V5-208'
			}, {
				title: STB_COMMAND.LAUNCH_APP,
				interface: 'IF-STB-V5-209'
			}, {
				title: STB_COMMAND.DELETE_RECENT_VOD,
				interface: 'IF-STB-V5-210'
			}, {
				title: STB_COMMAND.SET_FAVORITE,
				interface: 'IF-STB-V5-211'
			}, {
				title: STB_COMMAND.RELOAD,
				interface: 'IF-STB-V5-212'
			}, {
				title: STB_COMMAND.PLAY_KIDSZONE_GUIDE,
				interface: 'IF-STB-V5-213'
				// }, {
				// 	title: STB_COMMAND.ENCRYPT_DATA,
				// 	interface: 'IF-STB-V5-214'
			}, {
				title: STB_COMMAND.KEY_INFO,
				interface: 'IF-STB-V5-401'
			}, {
				title: STB_COMMAND.ISQMS_INFO,
				interface: 'IF-STB-V5-402'
			}, {
				title: STB_COMMAND.WEB_HIDE_NOTI,
				interface: 'IF-STB-V5-403'
			}, {
				title: STB_COMMAND.KIDSZONE_STATE,
				interface: 'IF-STB-V5-407'
			}, {
				title: STB_COMMAND.CHANNEL_JOIN_STATE,
				interface: 'IF-STB-V5-408'
			}];

		this.listFocus = undefined;
	}

	componentDidMount() {
		this.listFocus = fm.createFocus({
			id: 'list0',
			moveSelector: 'ul li',
			focusSelector: '',
			row: this.data.length,
			col: 1,
			startIdx: 0,
			focusIdx: 0,
			lastIdx: this.data.length - 1
		});
		this.listFocus.setFocusByIndex(0);
	}

	componentWillUnmount() {
		this.listFocus.removeFocus();
	}

	onKeyDown = (evt) => {
		console.log('StbTest.onkeyDown: ' + evt.keyCode);
		Utils.setTas(new TasData('', evt.keyCode, '#|12', '', '', '', '', '', '', '', ''));
		// Utils.setTas(new TasData('', '', '3|2', 'NM0020', ',,', '','','' ));
		switch (evt.keyCode) {
			case keyCodes.Keymap.LEFT:
				this.listFocus.moveFocus('LEFT');
				break;
			case keyCodes.Keymap.RIGHT:
				this.listFocus.moveFocus('RIGHT');
				break;
			case keyCodes.Keymap.UP:
				this.listFocus.moveFocus('UP');
				break;
			case keyCodes.Keymap.DOWN:
				this.listFocus.moveFocus('DOWN');
				break;
			case keyCodes.Keymap.ENTER:
				console.log('STB I/F StbTest.js: reqeust ' + this.data[this.listFocus.getFocusedIndex()].title);
				this.requestStbInterface(this.data[this.listFocus.getFocusedIndex()]);
				break;
		}
	}

	requestStbInterface(param) {
		// switch (param.title) {
		switch (param.interface) {
			// case STB_COMMAND.MENU_NAVIGATION_WEB:
			case 'IF-STB-V5-301':
				StbInterface.receiveMessageFromNative(param.obj);
				break;
			case STB_COMMAND.STB_INFO:
				StbInterface.requestStbInfo();
				break;
			case STB_COMMAND.ENCRYPT_DATA:
				const req_date = dateFormat(new Date(), 'yyyymmddHHMMss');
				const genderCode = "12345678";
				const birthday = "19991120";
				const cardNo = "4563123678961476";
				let paramData = {
					requestDateTime: req_date,
					genderCode: genderCode,
				};

				paramData.cardNo = cryptoUtil.encryptAESByKeyEPS(req_date, cardNo);
				console.log('return web encrypt cardNo=%s', paramData.cardNo);
				let data = { target: 'eps', cryptType: 'encrypt', text: cardNo, dateTime: req_date };
				paramData.cardNo = StbInterface.requestEncryptData(data);
				console.log('return nat encrypt cardNo=%s', paramData.cardNo);

				// if ('birthday' in param) paramData.birthday = cryptoUtil.encryptAESByKeyEPS(req_date, param.birthday);
				break;
			// case STB_COMMAND.SEARCHPERSONDETAIL:
			// 	StbInterface.receiveMessageFromNative(obj);
			// 	break;
			case STB_COMMAND.RECENT_VOD_LIST:
				StbInterface.requestRecentVodList(this.callback);
				break;
			case STB_COMMAND.CHANNEL_LIST:
				StbInterface.requestChannelList();
				break;
			case STB_COMMAND.RESERVATION_INFO:
				// data 구조 확인 필요
				StbInterface.requestReservationInfo({
					isAll: '',
					channelCount: '',
					channelList: [{
						channelInfo: {
							channelNum: '',
							startTime: ''
						}
					}]
				});
				break;
			case STB_COMMAND.PLAY_INFO:
				StbInterface.requestPlayInfo(this.callback);
				break;
			case STB_COMMAND.MENU_NAVIGATION_NATIVE:
				StbInterface.menuNavigationNative('CO');
				break;
			case STB_COMMAND.LIVETV_SERVICE:
				StbInterface.requestLiveTvService('M', {
					channelNo: '',
					channelName: ''
				});
				break;
			case STB_COMMAND.PLAY_VOD:
				this.notDefined();
				// 아직 정의가 안 되어 있음,,
				//StbInterface.requestPlayVod();
				break;
			case STB_COMMAND.STOP_VOD:
				StbInterface.requestStopVod();
				break;
			case STB_COMMAND.PLAY_PIP:
				StbInterface.requestPlayPip({
					chNum: '',
					playState: '',
					fullSize: '',
					x: '',
					y: '',
					width: '',
					height: ''
				});
				break;
			case STB_COMMAND.PLAY_OAP:
				StbInterface.requestPlayOap({
					uri: '',
					playState: '',
					fullSize: '',
					x: '',
					y: '',
					width: '',
					height: ''
				});
				break;
			case STB_COMMAND.REQUEST_TOKEN:
				StbInterface.requestToken();
				break;
			case STB_COMMAND.OPEN_POPUP:
				StbInterface.openPopup('url', '');
				break;
			case STB_COMMAND.LAUNCH_APP:
				StbInterface.launchApp({
					title: '',
					serviceId: '',
					vassId: '',
					contentId: '',
					packageName: '',
					entryPath: '',
				});
				break;
			case STB_COMMAND.DELETE_RECENT_VOD:
				StbInterface.deleteRecentVod('D', 'contentId');
				break;
			case STB_COMMAND.SET_FAVORITE:
				StbInterface.setFavorite('R', 'V', 'contentId');
				break;
			case STB_COMMAND.RELOAD:
				StbInterface.reload('1');
				break;
			case STB_COMMAND.PLAY_KIDSZONE_GUIDE:
				StbInterface.playKidszoneGuide('code');
				break;
			// case STB_COMMAND.ENCRYPT_DATA:
			// 	StbInterface.reqeustEncryptData('EncryptData', this.callback);
			// 	break;
			case STB_COMMAND.KEY_INFO:
				StbInterface.keyInfo({
					numKeyUse: 'false',
					redKeyUse: 'false',
					greenKeyUse: 'false'
				});
				break;
			case STB_COMMAND.ISQMS_INFO:
				StbInterface.isqmsInfo('SCS', '0', 'msg');
				break;
			case STB_COMMAND.WEB_HIDE_NOTI:
				StbInterface.webHideNoti();
				break;
			case STB_COMMAND.KIDSZONE_STATE:
				StbInterface.kidszoneState('enter');
				!appConfig.runDevice && StbInterface.setProperty(constants.STB_PROP.KIDS_MODE_ENTRY, '1');
				break;
			case STB_COMMAND.CHANNEL_JOIN_STATE:
				StbInterface.channelJoinState('join');
				break;
			default:
				break;
		}

	}

	callback(data) {
		console.log('STB I/F StbTest.js: callback ' + JSON.stringify(data));
	}

	notDefined() {
		document.querySelector('#stbTest #request').innerHTML = '준비중';
	}

	render() {
		Utils.setTas(new TasData('', '', '#|12', '', '', '', '', '', '', '', ''));
		return (
			<div id="stbTest">
				<div className="wrap_menu"></div>
				<div className="wrap_list">
					<div id='list0' className="wrap_api blue">
						<ul className="list_api">
							{this.data.map((item, idx) => (
								<li key={idx}>{`${item.interface}: ${item.title}`}</li>
							))}
						</ul>
					</div>
				</div>
				<div className="wrap_content">
					<div className="content_view">
						<div className="title">WebApp -> Native</div>
						<div id='request' className="txt"></div>
					</div>
					<div className="content_view">
						<div className="title">Native -> WebApp</div>
						<div id='response' className="txt"></div>
					</div>
				</div>
			</div>
		)
	}

}

export default StbTest;