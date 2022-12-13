import React, { Component } from 'react';
import find from 'lodash/find';
import appConfig from 'Config/app-config';
import FM from 'Supporters/navi';
//import Core from 'Supporters/core';
import 'Css/myBtv/my/MyBtvHome.css';
import StbInterface from 'Supporters/stbInterface';
import { STB_PROP } from 'Config/constants';

class CouponInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		}
	}

	static defaultProps = {
		info: null,
		onSelect: null
	}

	onSelect = () => {
		const { onSelect } = this.props;
		if (onSelect && typeof onSelect === 'function') {
			onSelect('coupon');
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	render() {
		const { info } = this.props;
		const isNew = info ? info.isNew : false;
		const count = info ? info.count : 0;

		// const { focused } = this.state;
		const { focused } = this.props;

		const focusClass = focused ? 'csFocus focusOn' : 'csFocus';
		return (
			<li className="coupon">
				<div tabIndex="-1" className={focusClass} >
					<div className="title">
						<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-coupon.png`} alt="" />
						<span className="text">쿠폰함</span>
						{isNew ? <span className="new">N</span> : null}
					</div>
					<div className="detail">
						<span className="number">{count}</span>
						<span className="check"></span>
					</div>
				</div>
			</li>
		);
	}
}

class BPointInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		}
	}

	static defaultProps = {
		info: null,
	}

	onSelect = () => {
		const { onSelect } = this.props;
		if (onSelect && typeof onSelect === 'function') {
			onSelect('bpoint');
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	render() {
		const { info, isProduct } = this.props;
		const isNew = info ? info.isNew : false;
		let balance = info ? info.balance : 0;
		if (balance === undefined) {
			balance = 0;
		}
		if (!isProduct) {
			const { focused } = this.props;
			const focusClass = focused ? 'csFocus focusOn' : 'csFocus';
			return (
				<li className="bpoint">
					<div className={focusClass}>
						<div className="title">
							<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-bpoint.png`} alt="" />
							<span className="text">포인트</span>
							{isNew ? <span className="new">N</span> : null}
						</div>
						<div className="detail">
							<span className="number">{`${balance.toLocaleString()} P`}</span>
							<span className="check"></span>
						</div>
					</div>
				</li>
			);
		} else {
			const { focused } = this.props;
			const focusClass = focused ? 'csFocus focusOn' : 'csFocus';
			return (
				<li className="bpoint">
					<div className={focusClass}>
						<div className="title">
							<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-btv.png`} alt="" />
							<span className="text">가입상품</span>
						</div>
						<div className="detail">
							<span className="check">조회</span>
						</div>
					</div>
				</li>
			);
		}
		
	}
}

class TMembershipInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		}
	}

	static defaultProps = {
		info: null,
	}

	onSelect = () => {
		const { onSelect } = this.props;
		if (onSelect && typeof onSelect === 'function') {
			onSelect('tmembership');
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	render() {
		const { info } = this.props;
		const cardNo = info ? info.cardNo.toString().substr(0, 4) : 0;
		const desc = info ? '' : '카드 등록하기';

		const { focused } = this.state;
		// const focusClass = focused? 'csFocus focusOn': 'csFocus';
		return (
			<li className="tMembership">
				<div className={focused ? 'csFocus focusOn' : 'csFocus'}>
					<div className="title">
						<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-tmembership.png`} alt="" />
					</div>
					<div className="detail">
						{info && <span className="number">{cardNo}</span>}
						{!info && < span className="check">{desc}</span>}
					</div>
				</div>
			</li>
		);
	}
}

class OKCashInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		}
	}

	static defaultProps = {
		info: null,
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	onSelect = () => {
		const { onSelect } = this.props;
		if (onSelect && typeof onSelect === 'function') {
			onSelect('okcash');
		}
	}

	render() {
		const { info } = this.props;
		const cardNo = info ? info.cardNo.toString().substr(0, 4) : '';
		const desc = info ? '' : '카드 등록하기';

		// const { focused } = this.state;
		const { focused } = this.props;
		const focusClass = focused ? 'csFocus focusOn' : 'csFocus';
		return (
			<li className="okCash">
				<div className={focusClass}>
					<div className="title">
						<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-okcashbag.png`} alt="" />
						<span className="text"></span>
					</div>
					<div className="detail">
						{info && <span className="number">{cardNo}</span>}
						{!info && <span className="check">{desc}</span>}
					</div>
				</div>
			</li>
		);
	}
}

class TvPointInfo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			focused: false
		}
	}

	static defaultProps = {
		info: null,
	}

	onSelect = () => {
		const { onSelect } = this.props;
		if (onSelect && typeof onSelect === 'function') {
			onSelect('tvpoint');
		}
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}

	render() {
		const { info } = this.props;
		const desc = (info && info.isUse) ? '조회하기' : '가입하기';

		// const { focused } = this.state;
		const { focused } = this.props;
		const focusClass = focused ? 'csFocus focusOn' : 'csFocus';
		return (
			<li className="tvPoint">
				<div className={focusClass}>
					<div className={"title"}>
						<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/item-tvpoint.png`} alt="" />
						<span className="text">tvPoint</span>
					</div>
					<div className="detail">
						<span className="number"></span>
						<span className="check">{desc}</span>
					</div>
				</div>
			</li>
		);
	}
}

class PointList extends Component {
	constructor(props) {
		super(props);

		this.anchor = null;
		this.childs = new Array(6);

		this.state = {
			focused: false,
			focusedIdx: -1,
			page: 0,
		};

		this.maxItem = 5; // 한 화면에 보여지는 메뉴갯수
		this.totalItem = 6; // 메뉴 갯수
	}

	onFocused = () => {
		const { scrollTo } = this.props;
		if (scrollTo && typeof scrollTo === 'function') {
			scrollTo(this.anchor);
		}

		this.setState({
			focused: true
		});
	}

	onBlured = () => {
		this.setState({
			focused: false
		});
	}

	onFocusChild = (idx) => {
		this.setState({
			focusedIdx: idx
		})

		const { page } = this.state;
		//const totalItem = this.itemCount;
		let startIndex = page;
		let endIndex = page + (this.maxItem - 1);

		// 포커스가 현재 보여지는 슬라이드를 벗어나는 경우
		if (idx < startIndex) {
			startIndex = idx;
			if (startIndex < 0) {
				startIndex = 0;
			}
			endIndex = startIndex + (this.maxItem - 1);
		} else if (idx > endIndex) { // 포커스가 현재 보여지는 슬라이드를 벗어나는경우
			endIndex = idx;
			if (endIndex > (this.maxItem - 1)) {
				startIndex = endIndex - (this.maxItem - 1);
				endIndex = this.maxItem - 1;
			}
		} else { // 포커스가 현재 보여지는 Set 안에 있는경우
			if (idx === endIndex && (this.maxItem !== 1)) {
				if (endIndex < this.totalItem) { // 마지막 인덱스 + 1 값이 totalItem 범위 보다 크지 않으면
					endIndex++;
					startIndex++;
				}
				if (startIndex + this.maxItem > this.totalItem) {
					startIndex = this.totalItem - this.maxItem;
					endIndex = startIndex + this.maxItem - 1;
				}
			} else if (idx === startIndex && (this.maxItem !== 1)) {
				if (startIndex >= 1) { // 첫 인덱스가 1이 아니면
					startIndex--;
					endIndex--;
				}
				if (startIndex < 0) {
					startIndex = 0;
					endIndex = this.maxItem - 1;
				}
			}
		}

		const changedPage = startIndex;
		this.setState({
			focusedIdx: idx,
			page: changedPage
		});
		
		if (this.fm) {
			this.fm.setListInfo({
				page: changedPage
			});
		}
	}

	onKeyDown = (evt, childIdx) => {
		if (evt.keyCode === 13) {
			const child = this.childs[childIdx];
			if (child) {
				child.onSelect();
			}
		}
	}

	componentDidMount() {
		const fm = new FM({
			type: 'BLOCK',
			id: 'pointInfo',
			moveSelector: '.listWrapper li',
			focusSelector: '.csFocus',
			row: 1,
			col: 6,
			page: 0,
			maxItem: 5,
			focusIdx: 0,
			startIdx: 0,
			lastIdx: 5,
			bRowRolling: true,
			onFocusContainer: this.onFocused,
			onBlurContainer: this.onBlured,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onKeyDown
		});
		const { setFm } = this.props;
		setFm('pointInfo', fm);
		this.fm = fm;
	}

	onSelectProductInfo = () => {
		const url = StbInterface.getProperty(STB_PROP.PROPERTY_PSS_URL);
      	StbInterface.openPopup('url', url);
	}

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextProps.pointInfo) !== JSON.stringify(this.props.pointInfo)
      || nextProps.ocbMasterSequence !== this.props.ocbMasterSequence
      || JSON.stringify(nextState) !== JSON.stringify(this.state);
  }

	componentWillReceiveProps(nextProps) {
	}

	render() {
		const {
			focused,
			focusedIdx,
			page
		} = this.state;

		const leftAffordance = page !== 0;
		const rightAffordance = (page + this.maxItem) < this.totalItem;

		const { pointInfo, onSelect } = this.props;
		const couponInfo = pointInfo.couponInfo;
		const bPointInfo = pointInfo.bPointInfo;
		const tMembershipInfo = pointInfo.tMembershipInfo ? pointInfo.tMembershipInfo : null;
		const okCashInfo = pointInfo.okCashInfo.length ? find(pointInfo.okCashInfo, { sequence: this.props.ocbMasterSequence }) : null;
		const tvPointInfo = pointInfo.tvPointInfo.length ? pointInfo.tvPointInfo[0] : null;

		const list = [
			<CouponInfo info={couponInfo} onSelect={onSelect} key={0} ref={r => this.childs[0] = r} focused={focusedIdx === 0} />,
			<BPointInfo info={bPointInfo} onSelect={onSelect} key={1} ref={r => this.childs[1] = r} focused={focusedIdx === 1} />,
			<TMembershipInfo info={tMembershipInfo} onSelect={onSelect} key={2} ref={r => this.childs[2] = r} focused={focusedIdx === 2} />,
			<OKCashInfo info={okCashInfo} onSelect={onSelect} key={3} ref={r => this.childs[3] = r} focused={focusedIdx === 3} />,
			<TvPointInfo info={tvPointInfo} onSelect={onSelect} key={4} ref={r => this.childs[4] = r} focused={focusedIdx === 4} />,
			<BPointInfo isProduct={true} info={bPointInfo} onSelect={this.onSelectProductInfo} key={5} ref={r => this.childs[5] = r} focused={focusedIdx === 5} />
		];

		const wrapperStyle = {
			'--page': page,
			'width': 6 * 306 + 6 * 40
		};

		const activeClass = `myBtvList${focused?' activeSlide':''}${leftAffordance? ' leftActive':''}${rightAffordance? ' rightActive':''}`;

		return (
			<div className="contentGroup">
				<div id="pointInfo" className={activeClass} ref={r => this.anchor = r}>
					<div className="myBtvListWrap">
						<ul className="listWrapper" style={wrapperStyle}>
							{list}
						</ul>
					</div>
					<div className="leftArrow"></div>
					<div className="rightArrow"></div>
				</div>
			</div>
		)
	}
}

export {
	CouponInfo,
	BPointInfo,
	TMembershipInfo,
	OKCashInfo,
	TvPointInfo,
	PointList as default
};