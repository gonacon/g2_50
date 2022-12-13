import { NXPG, MeTV } from "Network";
import Utils from "Util/utils";
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { gridDataPromiseCW, gridDataPromise } from "./homeUtils";
import { GNB_CODE } from "Config/constants";
import { Core } from "Supporters";


export const homeLegacy = {
    async setBlock(menuId, gnbTypeCode) {
		gnbTypeCode = gnbTypeCode || this.gnbTypeCode;
		const result003 = await NXPG.request003({ menu_id: menuId });

		// 빅배너 설정
		let { banners } = result003;
		const imgPath = Utils.getImageUrl(Utils.IMAGE_SIZE_BIGBANNER);
		let bigBanner = isEmpty(banners) ? [] : banners.map(banner => {
			let imageN = `${imgPath}${banner.bss_img_path}`;	// 기본 이미지
			let imageS = `${imgPath}${banner.ext_img_path}`;	// 확장 이미지
			const imgs = (() => {
				if (isEmpty(banner.ext_img_path)) {
					return { imageN };
				} else {
					return { imageS, imageN };
				}
			})();
			return {
				isSingle: Object.keys(imgs).length < 2,		// 이미지가 한장인지 여부
				imgs,
				callUrl: banner.call_url,
				bannerDetailTypeCode: banner.bnr_det_typ_cd,	// 배너 상세 유형 코드
				callTypeCode: banner.call_typ_cd,
				shortcutEpisodeId: banner.shcut_epsd_id,
				shortcutSeriesId: banner.shcut_sris_id,
				synopsisTypeCode: banner.synon_typ_cd,
				vasId: banner.vas_id,
				vasItemId: banner.vas_itm_id,
				vasServiceId: banner.vas_svc_id,
			}
		});

		// 블록 리스트
		this.blocksList = isEmpty(result003.blocks) ? [] : result003.blocks.map(item => {
			let refactoryData = {
				blk_typ_cd: item.blk_typ_cd,
				menu_id: item.menu_id,
				gnb_typ_cd: item.gnb_typ_cd,
				title: item.menu_nm,
				scn_mthd_cd: item.scn_mthd_cd || '',
				cw_call_id_val: item.cw_call_id_val,
				menus: item.menus,
				call_url: item.call_url,
				pst_exps_typ_cd: item.pst_exps_typ_cd,
				menu_nm: item.menu_nm,
				exps_rslu_cd: item.exps_rslu_cd,
				exps_mthd_cd: item.exps_mthd_cd,
				menu_nm_exps_yn: item.menu_nm_exps_yn
			};
			return refactoryData;
		});

		// 성인인증/청소년보호 property
		const adultProperty = {
			ADULT_MOVIE_MENU: this.ADULT_MOVIE_MENU,
			EROS_MENU: this.EROS_MENU,
		};


		this.contentList = [];
		let cnt = this.blocksList.length < this.VIEW_ROW ? this.blocksList.length : this.VIEW_ROW;

		for (let i = 0; i < cnt; i++) {
			const block = this.blocksList[i];
			let content = null;
			// 조건문 수정 해야함 (headEnd 정상적으로 되면 로직 다시 만들어야함)
			if (!isUndefined(block) && block.scn_mthd_cd === '501') {
				content = await gridDataPromiseCW(block, gnbTypeCode, this.isDetailedGenreHome, adultProperty);
				if (!isEmpty(content)) {
					let isContent = (() => {
						if (Array.isArray(content)) {
							return content.length > 0;
						} else if (!isEmpty(content.slideItem)) {
							return true;
						} else {
							return false;
						}
					})();
					if (!isContent) {
						this.blocksList.splice(i, 1);  // block 정보가 없으면 제거
						i -= 1;
					} else {
						for (let idx = 0; idx < content.length; idx += 1) {
							const element = content[idx];
							let index = idx === 0 ? i : ++i;
							this.contentList[index] = element;
							cnt += 1;
						}
					}
				}
			} else {
				content = await gridDataPromise(block, gnbTypeCode, this.isDetailedGenreHome, adultProperty);
				if (content) {
					if (isEmpty(content.slideItem)) {
						this.blocksList.splice(i, 1);  // block 정보가 없으면 제거
						i -= 1;
					} else {
						this.contentList[i] = content;
					}
				}
			}
		}

		// 보유 쿠폰 및 포인트 정보 호출
		if (gnbTypeCode === GNB_CODE.GNB_HOME) {
			this.setState({ isHome: true });
		}
		// let EPS300 = await EPS.request300();
		// console.log('%c EPS-300', 'color: red; background: pink', EPS300);

		// setState
		this.setState({
			contentSlides: this.contentList,
			bigBanner,
			headEndCallEnd: true
		}, () => {
			this.restoreFocus();

			// this.requestHomeOapInfo();  //  @ 기능 제거
			setTimeout(() => {
				this.getRemainingBlockList();
			}, 50);
		});
	},
    
    // block list의 남아 있는 개수를 가져 온다.
	async getRemainingBlockList() {

		const cnt = this.blocksList.length < this.VIEW_ROW ? this.blocksList.length : this.VIEW_ROW;
		let block;

		// 성인인증/청소년보호 property
		const adultProperty = {
			ADULT_MOVIE_MENU: this.ADULT_MOVIE_MENU,
			EROS_MENU: this.EROS_MENU,
		};

		for (let i = cnt; i < this.blocksList.length; i++) {
			block = this.blocksList[i];
			let content = null;
			// content = this.getBlockData(i);
			content = await gridDataPromise(block, this.gnbTypeCode, this.isDetailedGenreHome, adultProperty);

			if (isEmpty(content.slideItem)) {
				this.blocksList.splice(i, 1); // block 정보가 없으면 제거
				i -= 1;
			} else {
				this.contentList[i] = content;
			}
		}

		this.setState({
			contentSlides: this.contentList
		});
	},

	// 찜(즐겨찾기) 목록 확인
	async inquiryFavorit(sris_id, epsd_id) {
		// const bookmark = await StbInterface.reqeustFavoriteVodInfo({
		//     type: 'select',
		//     seriesId: sris_id
		// });
		// return bookmark.isFavorite
		let flag = false;
		const bookmark = await MeTV.request011({ group: 'VOD' });

		for (let item of bookmark.bookmarkList) {
			if (item.epsd_id === epsd_id && item.sris_id === sris_id) {
				flag = true;
			}
		}

		return flag;
	},
	
	// 찜키 선택 시
	async onSelectFavorite(slideIdx, idx) {
		const { contentSlides } = this.state;
		const slideItem = contentSlides[slideIdx].slideItem[idx];
		const { sris_id, epsd_id, menu_id, title } = slideItem;
		const isFavorite = await this.inquiryFavorit(sris_id, epsd_id);
		const xpg010 = await NXPG.request010({
			menu_id,
			sris_id,
			epsd_id,
			search_type: '1',
		});

		if (isFavorite) {
			// 해제
			const param = {
				group: 'VOD',
				yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				isAll_type: '0',
				deleteList: [sris_id],
				sris_id: sris_id,
			};
			let bookmarkDelete = await Utils.bookmarkDelete(param, 'D');
			if (bookmarkDelete.result === '0000') {
				Core.inst().showToast(title, '찜 등록 해제되었습니다.', 3000);
			} else {
				Core.inst().showToast('찜 등록에 실패 하였습니다.', '', 3000);
			}
		} else {
			// 등록
			// group (VOD 콘텐츠: "VOD", TV App: "VAS", Live Channel: "IPTV")
			// sris_id (VOD 콘텐츠: epsd_id, TV App: content_id, Live Channel: serviceId)
			let bookmarkAdd = await Utils.bookmarkCreate({
				group: 'VOD',
				yn_kzone: 'N',  //  StbInterface.getProperty(STB_PROP.IS_KIDS_ZONE),
				sris_id: sris_id,
				epsd_id: epsd_id,
				epsd_rslu_id: xpg010.contents.epsd_rslu_info[0].epsd_rslu_id
			});

			if (bookmarkAdd.result === '0000') {
				Core.inst().showToast(title, '찜 등록 되었습니다.', 3000);
			} else {
				Core.inst().showToast('찜 등록에 실패 하였습니다.', '', 3000);
			}

		}

	}
}