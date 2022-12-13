// common
import React from 'react';
import constants, { STB_PROP } from '../../config/constants';
import { Moment } from '../../utils/common';
import PageView from '../../supporters/PageView.js';
import keyCode from 'Supporters/keyCodes';
import FM from 'Supporters/navi';
import { SlideInfo, SlideType, G2NaviSlider, G2NaviSlideMyVOD } from 'Module/G2Slider';

// utils
import synopAPI from './api/synopAPI';
import _ from 'lodash';
import Utils from '../../utils/utils';

// css
import '../../assets/css/routes/synopsis/SynopPersonalInformation.css';
import '../../assets/css/routes/synopsis/SlideFilmography.css';
import appConfig from 'Config/app-config';

import getTextWidth from 'text-width';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class SynopPersonalInformation extends PageView {
	constructor(props) {
		super(props);

		this.items = ITEMS;

		this.state = _.isEmpty(this.historyData) ? {
			page: 0,
			currentIdx: 0,
			bg_img_path: this.paramData.bg_img_path,
			dark_img_yn: this.paramData.dark_img_yn,
			personInfo: {
				menus: null
			}
		} : this.historyData

		this.flimoList = [];
		this.yearIdx = 0;
		this.startIndex = 0;
		this.totalLength = 0;
		this.focusList = [
			{ key: 'filmogrps', fm: null }
		]
		this.declareFocusList(this.focusList);
	}

	componentWillMount(){
		const { showMenu, setWrapperClass } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
        }
		let paramData = this.paramData;
		// console.log('synopPerson Param', this.historyData);
		if (!_.isEmpty(this.historyData)) {
			const { personInfo, currentIdx } = this.historyData;
			this.setFlimoList(personInfo);
			this.setDefaultFm(personInfo);
			this.setState({
				personInfo
			},() => {
				this.setFocus(0, currentIdx);
			});
		} else {
			synopAPI.xpg011(paramData).then(result => {
				if (result === 'error') {
					this.moveBack();
				} else {
					this.setFlimoList(result);
					this.setDefaultFm(result);
                    this.setState({
                        personInfo: result
					},() => {
						this.setFocus(0);
					});
				}
			});
		}
	}

	componentDidMount() {

	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this.props.setWrapperClass('');
	}

	setFlimoList = (result) => {
		for (let item of result.menus.filmogrps) {
			for (let item2 of item.contents) {
				item2.year = item.manuf_yr;
				this.flimoList.push(item2);
			}
		}
	}

	setDefaultFm = (person) => {
		// console.log('menus', person.menus);
		let totalLength = 0;
		for (let item of person.menus.filmogrps) {
			for (let item2 of item.contents) {
				totalLength++;
			}
		}
		this.totalLength = totalLength;
		const fm = new FM({
			id: 'filmogrps',
			containerSelector: '.slideWrapper',
			moveSelector: '',
			focusSelector: '.csFocus',
			row: 1,
			col: totalLength,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: totalLength - 1,
			bRowRolling: true,
			onFocusKeyDown: this.onFocusKeyDownFilmogrp,
			onFocusChild: this.onFocusChanged
		})
		this.setFm('filmogrps', fm);
	}

	onFocusKeyDownFilmogrp = (e, idx) => {
		if (e.keyCode === keyCode.Keymap.ENTER) {
			const { menu_id } = this.paramData;
			const { sris_id, epsd_id, wat_lvl_cd } = this.flimoList[idx];
			const synopParam = { menu_id, sris_id, epsd_id, wat_lvl_cd, };
			Utils.movePageAfterCheckLevel(constants.SYNOPSIS,synopParam, wat_lvl_cd )
			//this.movePage(constants.SYNOPSIS, synopParam);
		}
	}

	onFocusChanged = (idx) => {
		const maxItem = this.items;
		const { page } = this.state;
		const totalItem = this.totalLength;
		let startIndex = page;
		let endIndex = page + (maxItem - 1);

		// 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
		if (idx < startIndex) {
			startIndex = idx;
			if (startIndex < 0) {
				startIndex = 0;
			}
			endIndex = startIndex + (maxItem - 1);
		} else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
			endIndex = idx;
			if (endIndex > (maxItem - 1)) {
				startIndex = endIndex - (maxItem - 1);
				endIndex = maxItem - 1;
			}
		} else { // 포커스가 현재 보여지는 Set 안에 있는경우
			if (idx === endIndex) {
				if (endIndex < totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
					endIndex++;
					startIndex++;
				}
				if (startIndex + maxItem > totalItem) {
					startIndex = totalItem - maxItem;
					endIndex = startIndex + maxItem - 1;
				}
			} else if (idx === startIndex) {
				if (startIndex >= 1) { // 첫 인덱스가 1이 아니면
					startIndex--;
					endIndex--;
				}
				if (startIndex < 0) {
					startIndex = 0;
					endIndex = maxItem - 1;
				}
			}
			this.startIndex = startIndex;
		}
		// console.log('flimoList', this.flimoList[idx]);
		const changedPage = startIndex;
		this.setState({
			currentIdx: idx,
			page: changedPage
		});
	}

	render() {
		const { personInfo: { menus }, page, currentIdx, bg_img_path, dark_img_yn } = this.state;
		const bgImg = `${_.isEmpty(bg_img_path) ? appConfig.headEnd.LOCAL_URL + '/synopsis/bg-synopsis-default.png' : Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + bg_img_path}`;
		let style = {
			backgroundImage: "url(" + bgImg + ")"
		};

		// console.log('현재인덱스', currentIdx)
		// console.log('현재페이지', page);
		// console.log('시작인덱스', this.startIndex);

		let filmogrops = [];
		let childIdx = 0;
		if (!_.isEmpty(menus)) {
			let filmoLength = [];
			filmogrops = menus.filmogrps.map((item, i) => {
				return (
					<div className={"filmographyWrap" + (this.flimoList[currentIdx].year === item.manuf_yr ? " focus" : "")} key={i}>
						{
							item.contents.map((subItem, j) => {
								return (
									<SlideFilmography
										key={j}
										page={page}
										year={item.manuf_yr}
										imgURL={subItem.poster_filename_v}
										title={subItem.title}
										part={subItem.prs_role_nm}
										prize={subItem.prize_dts_cts}
										itemIndex={i}
										yearIndex={j}
										currentIdx={currentIdx}
										startIndex={this.startIndex}
										bFirst={childIdx === page}
										focused={childIdx === currentIdx}
										bLast={childIdx++ === page + 5}
									/>
								)
							})
						}
					</div>
				)
			})
		}

		const wrapperStyle = {
			'--page': page,
			'width': this.totalLength * IMG_WIDTH + this.totalLength * 40
		};
		let darkClass = _.isEmpty(bg_img_path) ? " default" : "";
		darkClass += dark_img_yn === 'N' ? "" : " dark";

		let detailInfoLength = 0;

		if (!_.isEmpty(menus)) {
			!_.isEmpty(menus.brth_ymd) && detailInfoLength ++;
			!_.isEmpty(menus.dbu_cts) && detailInfoLength ++;
			(!_.isEmpty(menus.hght_val) && !_.isEmpty(menus.blood_nm)) && detailInfoLength ++;
			!_.isEmpty(menus.mngco_nm) && detailInfoLength ++;
		}

		return (
			<div className={`personInformationWrap${darkClass}`} style={style}>
				{
					!_.isEmpty(menus) &&
					<div className="innerContents">
						<div className="personInfoTextWrap">
							<p className="personName">{menus.prs_nm}{!_.isEmpty(menus.rnm) && ` (${menus.rnm})`}</p>
							<p className="personJob">{menus.job_nm}</p>
							<ul className={`detailInfo ${detailInfoLength === 1 ? 'single': ''}`}>
								{
									!_.isEmpty(menus.brth_ymd) &&
									<li>
										<div className="detailTextWrap">
											<span className="detailtInfoTitle">출생</span>
											<span className="personBirth"><Moment format="YYYY년 MM월 DD일">{menus.brth_ymd}</Moment></span>
										</div>
									</li>
								}
								
								{
									!_.isEmpty(menus.dbu_cts) &&
									<li>
										<div className="detailTextWrap">
											<span className="detailtInfoTitle">데뷔</span>
											<span className="personDebut">{menus.dbu_cts}</span>
										</div>
									</li>
								}
								
								{
									(!_.isEmpty(menus.hght_val) && !_.isEmpty(menus.blood_nm)) &&
									<li>
										<div className="detailTextWrap">
											<span className="detailtInfoTitle">신체</span>
											<span className="personBodyHeight">{menus.hght_val} {menus.blood_nm}</span>
										</div>
									</li>
								}
								
								{
									!_.isEmpty(menus.mngco_nm) &&
									<li>
										<div className="detailTextWrap">
											<span className="detailtInfoTitle">소속</span>
											<span className="personBloodType">{menus.mngco_nm}</span>
										</div>
									</li>
								}
							</ul>
						</div>
						<div className="slideFilmographyWrap">
							<div className="contentGroup">
								<div className="slideFilmography">
									<div className="slideWrap">
										<div className="slideCon" id="filmogrps">
											<div className="slideWrapper" style={wrapperStyle}>
												{filmogrops}
											</div>
										</div>
										<div className="leftArrow"></div>
										<div className="rightArrow"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				}

				<div className="keyWrap">
					<span className="btnKeyPrev">닫기</span>
				</div>
			</div>
		)
	}
}


class SlideFilmography extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			focused: false
		};

		this.titleWidth = 0;
	}

	static defaultProps = {
		title: '',
		imgURL: '',
		bAdult: false,
		rate: 0,
		espdId: '',
		allMenu: false
	}

	componentDidMount() {
		const { title } = this.props;
		this.titleWidth = getTextWidth( title, {
			family: 'SK Btv',
			size: '30px',
			weight: '700'
		});
		// console.error('width', this.titleWidth);
	}

	render() {
		const {
			title, imgURL, bFirst, allMenu, bLast, rate: watchingRate,
			yearIndex, page, year, part, prize, currentIdx, startIndex, itemIndex
		} = this.props;
		const { focused } = this.props;
		const focusClass = `csFocus${focused? ' focusOn':''}${bFirst? ' left':''}${bLast? ' right': ''}`;
		const img = `${Utils.getIipImageUrl(IMG_WIDTH, IMG_HEIGHT)}${imgURL}`;

		let textWrapStyle = {};
		// if (bFirst && this.titleWidth > 290) {
		if (bFirst) {
			textWrapStyle = {
				left: 0,
				transform: 'translateX(0)',
				textAlign: 'left',
			}
		// } else if (bLast && this.titleWidth > 290) {
		} else if (bLast) {
			textWrapStyle = {
				left: 'auto',
				right: 0,
				transform: 'translateX(-0)',
				textAlign: 'right'
			}
		}
		return (
			<div className={`slide${allMenu ? ' first' : ''}`}>
				{
					((yearIndex === 0) || bFirst) &&
					<span className="productionYear">{year}</span>
				}
				<div className={focusClass}>
					<span className="scaleContentWrap">
						<img src={img} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" />
						<span className="slideTextWrap" style={textWrapStyle}>
							<span className="slideTitle">{title}</span>
							{
								this.props.prize === "" ?
									<span className="slideSubTitle" style={{WebkitBoxOrient:"vertical"}}>
										<span className="personPart">{part}</span>
									</span>
									:
									<span className="slideSubTitle" style={{WebkitBoxOrient:"vertical"}}>
										<span className="personPart">{part}</span>
										<span className="bar"></span>
										<span className="personPrize">{prize}</span>
									</span>
							}
						</span>
					</span>
				</div>
			</div>
		)
	}
}

export default SynopPersonalInformation;