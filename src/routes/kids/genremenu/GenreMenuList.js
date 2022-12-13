import React from 'react';
import PageView from 'Supporters/PageView';
import { isEmpty } from 'lodash';
import { scroll } from 'Util/utils';
import keyCodes from 'Supporters/keyCodes';
import FM from '../../../supporters/navi';
import '../../../assets/css/routes/kids/genremenu/GenreMenuList.css';
import '../../../assets/css/routes/myBtv/my/ListItemType.css';
import { SlideType, G2KidsGridSlider, G2SlideGenreMenuList } from '../components/module/KidsSlider';
import appConfig from '../../../config/app-config';
import Core from 'Supporters/core';
import { NXPG } from 'Supporters/network';

const GRID_SIZE = 6;

export default class GenreMenuList extends PageView {
	constructor(props) {
		super(props);

		this.el = 'kids_genreMenuList';
		this.menuId = '';
		this.prevTitle = '';

		if (isEmpty(this.historyData)) {
			this.state = {
				blockInfo: []
			};
		} else {
			this.state = this.historyData;
		}

		// [NEW_NAVI][FM]
		this.focusList = [
			{ key: 'blocks', fm: [] },
			{ key: 'bottomBtn', fm: null }
		];
		this.declareFocusList(this.focusList);
	}

	componentWillMount() {
		Core.inst().showKidsWidget();
	}

	handleRequestAPI() {
		this.handleRequestContentInfo();
	}

	handleRequestContentInfo = async () => {
		const result = await NXPG.request006({ menu_id: this.menuId });
		let contents = result.contents ? result.contents : [];

		contents = contents.map((content, index) => {
			return {
				srisId: content.sris_id,
				epsdId: content.epsd_id,

				salePrc: content.sale_prc,
				title: content.title,
				badgeTypNm: content.badge_typ_nm, // 뱃지 유형명
				brcastTseqNm: content.brcast_tseq_nm, // 방송 회차
				imgV: content.poster_filename_v,
				imgH: content.poster_filename_h,
				userBadgeImgPath: content.user_badge_img_path, // 사용자 등록 뱃지 이미지(하단 노출 이벤트 이미지)
				userBadgeWdtImgPath: content.user_badge_wdt_img_path, // 사용자 등록 뱃지 가로 이미지(하단 노출 이벤트 이미지)
				basBadgeImgPath: content.bas_badge_img_path, // 기본 뱃지 이미지(상단 노출 뱃지)

				synonTypCd: content.synon_typ_cd, // 진입 시놉시스 유형 코드
				adltLvlCd: content.adlt_lvl_cd, // 성인 등급 코드
				watLvlCd: content.wat_lvl_cd, // 시청 등급 코드
				metaTypCd: content.meta_typ_cd, // 메타 유형 코드

				sortSeq: content.sort_seq, // 시리즈 정렬 순번
				svcfrDt: content.svc_fr_dt, // 서비스 시작일
				svcToDt: content.svc_to_dt, // 서비스 종료일
				iconExpsFrDt: content.icon_exps_fr_dt, //뱃지(이벤트) 노출 시작 일자
				iconExpsToDt: content.icon_exps_to_dt, //뱃지(이벤트) 노출 종료 일자
				epsdDistFirSvcDt: content.epsd_dist_fir_svc_dt, // 에피소드 동기화 승인일
				srisDistFirSvcDt: content.sris_dist_fir_svc_dt, // 시리즈 동기화 승인일

				rsluTypCd: content.rslu_typ_cd, // 상품 해상도
				kidsYn: content.kids_yn, // 키즈 여부
				cacbroYn: content.cacbro_yn, // 결방 여부
				iImgCd: content.i_img_cd 
			}
		});
		this.setState({ blockInfo: this.pagingContentInfo(contents, GRID_SIZE) });
	}

	// [NEW_NAVI][FM] 초기 포커스 설정
	handleOnInitFocus = () => {
		this.setFocus(0);
	}

	// [NEW_NAVI][FM] 블록 포커스 온 이벤트
	handleOnSlider = (idx, container) => {

	}

	// [NEW_NAVI][FM] 블록 포커스 오프 이벤트
	handleOffSlider = () => {
	}

	// [NEW_NAVI][FM] 콘텐츠 포커스 이동 이벤트
	handleOnFocusMove = (idx) => {
		// this.scrollTo(idx);
		// const currentFm = this.focusList[0]['fm'][idx];
		// const curIdx = currentFm.listInfo.curIdx;

		// this.setFocus(idx + 1, curIdx);
	}

	// [NEW_NAVI][FM] 콘텐츠 KeyDown 이벤트
	handleOnKeyDown = (event, idx) => {
		switch (event.keyCode) {
			case keyCodes.Keymap.ENTER:
				break;
			case keyCodes.Keymap.DOWN:
				break;
			default:
				break;
		}
	}

	scrollTo = (anchor, marginTop) => {
		let top = 0;
		let offset = 0;
		if (anchor) {
			top = anchor.offsetTop;
		}

		const margin = 200;
		let bShowMenu = true;
		if (top > 500) {
			offset = -(top-60) + margin;
			bShowMenu = false;
		} else {
			offset = 0;
		}
		scroll(offset);
		const { showMenu } = this.props;
		showMenu(bShowMenu, true);
	}

	onKeyDownBottomBtn = (event) => {
		if (event.keyCode === keyCodes.Keymap.ENTER) {
			scroll(0);
			this.setFocus(0, 0);
		}
	}

	// 페이징 처리 함수
	pagingContentInfo = (list, colCnt) => {
		let resultArr = [], tempArr = [];
		let totalLen = 0, count = 0;

		totalLen = list.length;
		list.forEach((item, index) => {
			tempArr.push(item);

			if((index + 1) % colCnt === 0 || (item + 1) >= totalLen) {
				resultArr[count] = tempArr;
				count++;
				tempArr = [];
			}
		});
		console.log(resultArr);
		return resultArr;
	}

	render() {
		const { blockInfo } = this.state;
		const menuInfo = {
			prevTitle: this.prevTitle,
			currentTitle: '키즈 목록'
		}

		// const style = {
		// 	scrollWrap: {
		// 		paddingTop: '0px'
		// 	}
		// }
		const bShow = (!isEmpty(blockInfo) && blockInfo.length !== 0);
		return (
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="genreMenuListWrap scrollWrap">
					<div className="menuBlockTitle">
						<p className="highRankTitle">{menuInfo.prevTitle}</p>
						<p className="title">{menuInfo.currentTitle}</p>
					</div>
					<div className="menuBlockList">
						{
							blockInfo.map((block, index) => (
								<G2KidsGridSlider
									id={'blocks'}
									idx={index}
									key={index}
	
									bShow={bShow}
									rotate={true}
									slideType={SlideType.KIDS_SNIPPET_VOD}
	
									setFm={this.setFm}
									setFocus={this.setFocus}
									// getFocusInfo={th}
									focusList={this.focusList}
									onInitFocus={this.handleOnInitFocus}
									onSlider={this.handleOnSlider}
									offSlider={this.handleOffSlider}
									onFocus={this.handleOnFocusMove}
									onKeyDown={this.handleOnKeyDown}
									onScroll={this.scrollTo}>
									{
										block.map((content, cnt_index) =>
											<G2SlideGenreMenuList
												index={cnt_index}
												lastIndex={block.length}
												title={content.title}
												imgV={content.imgV}
												epsdId={content.epsdId}
												srisId={content.srisId}
												key={cnt_index}
											/>
										)
									}
								</G2KidsGridSlider>
							))
						}	
					</div>
					<div id="bottomBtn" className="btnTopWrap">
						<span className="csFocus btnTop"><span>맨 위로</span></span>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		this.props.showMenu(false);
		let locationInfo = this.props.location.state;

		if (!isEmpty(locationInfo)) {
			// H/E 데이터 없음, 장르메뉴 ID 하드코딩
			this.menuId = locationInfo.menu_id;
			this.prevTitle = locationInfo.menu_nm
			this.handleRequestAPI();
		}

		const bottomBtnFm = new FM({
			id: 'bottomBtn',
			type: 'ELEMENT',
			focusSelector: '.csFocus',
			row: 1,
			col: 1,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 0,
			onFocusKeyDown: this.onKeyDownBottomBtn,
		});
		this.setFm('bottomBtn', bottomBtnFm);
	}
}