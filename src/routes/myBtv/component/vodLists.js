import React, { Component } from 'react';
import {
	SlideType,
	G2SlideRecentVOD,
	G2SlideMyVOD,
	G2SlideBookmarkVOD,
	G2NaviSlider,
	G2NaviSlideMyVOD
} from 'Module/G2Slider';

// import { HorizontalList } from 'Navigation';
import 'Css/myBtv/my/RecommendVOD.css';
import { isEmpty } from 'lodash';

class RecentVODList extends Component {
	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)
	}

	onSelectVOD = (slideIdx, idx) => {
		const { onSelect } = this.props;
		if (typeof onSelect === 'function') {
			onSelect('recentVod', idx);
		}
	}

	render() {
		const { bShow, list, onSelect, scrollTo, onKeyDown, setFm, id, idx, title, isHome } = this.props;

		return (
			bShow ? <G2NaviSlider
				id={ isEmpty(id) ? 'recentVod' : id}
				idx={idx}
				title={title ? title : `최근시청 VOD`}
				type={SlideType.RECENT_VOD}
				rotate={true}
				bShow={bShow}
				scrollTo={scrollTo}
				onKeyDown={onKeyDown}
				setFm={setFm}
				onSelectChild={this.onSelectVOD}
				isHome={isHome}
			>
				{
					list.map((vod, idx) => {
						return (
							<G2SlideRecentVOD
								idx={idx}
								title={vod.title}
								imgURL={vod.imgURL}
								bAdult={vod.bAdult}
								rate={vod.rate}
								epsdId={vod.epsdId}
								srisId={vod.srisId}
								epsdRsluId={vod.epsdRsluId}
								onSelect={onSelect}
								key={idx}
							/>
						);
					})
				}
			</G2NaviSlider> : null
		);
	}
}

class MyVODList extends Component {
	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)
	}

	onSelectVOD = (slideIdx, vodIdx) => {
		const { onSelect, onSelectMenu } = this.props;
		if (vodIdx === 0 && typeof onSelectMenu === 'function') {
			onSelectMenu();
		} else if (typeof onSelect === 'function') {
			onSelect('myVod', vodIdx);
		}
	}

	render() {
		const { bShow, list, onSelect, onSelectMenu, scrollTo, allMenu, setFm } = this.props;
		const offsetIndex = allMenu ? 1 : 0;
		const slideList = list.map((vod, idx) => {
			return (
				<G2NaviSlideMyVOD
					idx={idx + offsetIndex}
					title={vod.title}
					imgURL={vod.imgURL}
					bAdult={vod.bAdult}
					epsdId={vod.epsdId}
					srisId={vod.srisId}
					epsdRsluId={vod.epsdRsluId}
					onSelect={onSelect}
					key={idx + offsetIndex}
				/>
			);
		});
		if (allMenu) {
			slideList.unshift(<G2NaviSlideMyVOD allMenu={true} title="전체보기" idx={0} key={0} onSelectMenu={onSelectMenu} />);
		}
		return (
			bShow ? <G2NaviSlider
				id="myVod"
				title="나의 소장용 VOD"
				type={SlideType.TALL}
				onSelectMenu={onSelectMenu}
				rotate={true}
				bShow={bShow}
				scrollTo={scrollTo}
				allMenu={true}
				setFm={setFm}
				onSelectChild={this.onSelectVOD}
			>
				{slideList}
			</G2NaviSlider> : null
		);
	}
}

class BookmarkVODList extends Component {
	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)
	}

	onSelectVOD = (slideIdx, vodIdx) => {
		const { onSelect, onSelectMenu } = this.props;
		if (vodIdx === 0 && typeof onSelectMenu === 'function') {
			onSelectMenu();
		} else if (typeof onSelect === 'function') {
			onSelect('bookedVod', vodIdx);
		}
	}

	render() {
		const { bShow, list, onSelect, onSelectMenu, scrollTo, allMenu, setFm, onKeyDown } = this.props;
		const offsetIndex = allMenu ? 1 : 0;
		const slideList = list.map((vod, idx) => {
			return (
				<G2SlideBookmarkVOD
					idx={idx + offsetIndex}
					title={vod.title}
					imgURL={vod.imgURL}
					bAdult={vod.bAdult}
					epsdId={vod.epsdId}
					srisId={vod.srisId}
					epsdRsluId={vod.epsdRsluId}
					onSelect={onSelect}
					key={idx + offsetIndex}
				/>
			);
		});
		if (allMenu) {
			slideList.unshift(<G2NaviSlideMyVOD allMenu={true} title="전체보기" idx={0} key={0} onSelectMenu={onSelectMenu} />);
		}
		return (
			bShow ? <G2NaviSlider
				id="bookedVod"
				title="VOD 찜 목록"
				type={SlideType.BOOKMARK_VOD}
				onSelectMenu={onSelectMenu}
				rotate={true}
				bShow={bShow}
				scrollTo={scrollTo}
				allMenu={true}
				setFm={setFm}
				onSelectChild={this.onSelectVOD}
				onKeyDown={onKeyDown}
			>
				{slideList}
			</G2NaviSlider> : null
		);
	}
}

export { RecentVODList, MyVODList, BookmarkVODList };