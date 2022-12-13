// common
import React, { Fragment } from 'react';
import PageView from '../../supporters/PageView.js';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';
import constants, { STB_PROP } from '../../config/constants';
import StbInterface from 'Supporters/stbInterface';

// utils
import _ from 'lodash';
import synopAPI from './api/synopAPI';
import Utils from '../../utils/utils';

// css
import '../../assets/css/routes/synopsis/SynopEnding.css';

const GUILDE_TEXT = {
	0 : '',
	1 : '‘좋아요’로 평가하셨어요. 앞으로 비슷한 작품으로 추천해 드릴게요.',
	2 : '‘별로에요’로 평가하셨어요. 앞으로 이 작품과 비슷한 작품은 추천해 드리지 않을게요.',
	3 : '고객님의 선호도를 표현해 주세요. 평가내용을 바탕으로 맞춤 추천 서비스를 제공합니다.'
};

class SynopEnding extends PageView {
	constructor(props) {
		super(props);


		this.state = {
			time: 10,
			cwSlide: [],
			cwType: '',
			ratingActive: '',
			guildeIdx: 3
		}

		this.focusList = [
			{ key: 'rating', fm: null, link: {RIGHT: 'slides'} },
            { key: 'slides', fm: null, link: {LEFT: 'rating'} },
		];
		this.declareFocusList(this.focusList);
    }
    
    componentWillMount() {
        const { showMenu } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
		}
	}

	componentDidMount() {
		synopAPI.xpg012(this.paramData, 'ending').then(result => {
			let cwType = null;
			if (result.result !== '0000') {
				result = [];
			} else {
				if (result.related_info.length !== 0) {
					cwType = 'info';
					result = result.related_info;
				} else {
					cwType = 'contents';
					result = result.relation_contents
				}
			}

			let resizeMain = {
				fullSize: 'N',
				x: '0',
				y: '0',
				width: '1440',
				height: '810'
			}
			if (result.length === 0) {
				resizeMain.x = '240';
			}
			StbInterface.resizeMainPlayer(resizeMain);

			this.setDefaultFm(result);
			this.setState({
				cwType: cwType,
				cwSlide: result
			},() => {
				this.startTimer();
				this.setFocus(0);
			});
		});
	}

	componentWillUnmount() {
		StbInterface.resizeMainPlayer({fullSize: 'Y'});
		clearInterval(this.state.intervalId);
	}

	setDefaultFm = (cwSlide) => {
		for (let item of this.focusList) {
			let containerSelector = '';
            let row = 1;
            let col = 1;
            let focusIdx = 0;
            let startIdx = 0;
			let lastIdx = 0;
			let onFocusKeyDown = function () { };
			switch(item.key) {
				case 'rating':
					containerSelector = '.optionWrap';
					col = 2;
					lastIdx = 1;
				break;
				case 'slides':
					containerSelector = '.recommendContent';
					row = 2;
					lastIdx = 1;
				break;
			}
			let option = {
                id: item.key,
                containerSelector,
                moveSelector: '',
                focusSelector: '.csFocus',
                row: row,
                col: col,
                focusIdx: focusIdx,
                startIdx: startIdx,
                lastIdx: lastIdx,
                onFocusKeyDown: this.onFocusKeyDown.bind(this, item.key),
			}
			let fm = new FM(option);
			if (cwSlide.length === 0 && item.key === 'slides') {
				fm = null;
			}
			this.setFm(item.key, fm);
		}
	}

	timer = () => {
		let newCount = this.state.time - 1;
		if (newCount >= 0) {
			this.setState({
				time: newCount
			});	
		} else {
			clearInterval(this.state.intervalId);
			console.log('화면 back!!!!!!!');
			this.moveBack();
		}
	}
	
	startTimer = () => {
		let intervalId = setInterval(()=> {
			this.timer();
		}, 1000);
		this.setState({
			intervalId: intervalId
		});
	}

	registerLikeHate(idx, ratingActive){
		let like_action = 0;
		
		if(this.state.ratingActive === ratingActive) {
			like_action = 0;
		} else {
            if(idx === 0) {
                like_action = 1;
            } else {
                like_action = 2;
            };
        };
        
        let param = {
            series_id : this.series_id,
            like_action : like_action
		};
		
		synopAPI.smd004(param).then(res => {
            if(res.result === 'OK'){
                switch(res.like_action) {
                    case '1': ratingActive = 'up'; break;
                    case '2': ratingActive = 'down'; break;
                    default: ratingActive = res.like_action; break;
				}
				
				this.setState({
					ratingActive : ratingActive,
					guildeIdx : like_action
				},() => {
					if(ratingActive === '0'){
						this.setFocus(0, idx)
					}	
				});
            };
        });
	}
	onFocusKeyDown = (key, e, idx) => {
		if (e.keyCode === keyCode.Keymap.ENTER) {
			const { cwSlide, cwtype } = this.state;
			switch(key) {
				case 'rating':
					let ratingActive = this.state.ratingActive;
					if (idx === 0) {
						ratingActive = 'up';
					} else {
						ratingActive = 'down';
					}
					this.registerLikeHate(idx, ratingActive);
					
				break;
				case 'slides':
					const { menu_id } = this.paramData;
					const { sris_id, epsd_id } = this.cwList[idx];
					const synopParam = { menu_id, sris_id, epsd_id };
					this.movePage(constants.SYNOPSIS, synopParam);
				break;
				default:break;
			}
		}
	}

	render() {
		const { cwSlide, cwType, time, ratingActive, guildeIdx } = this.state;

		return (
			<div className={cwSlide.length !== 0 ? "synopEndingWrap" : "synopEndingWrap rightNone"}>
				<div className="conWrap">
					<div className="leftWrap">
						<div className="videoWrap" ref={r => this.videoWrap = r}>
							<video src=""></video>
							<span className="moveMent"><strong>{time}</strong> 후 자동으로 이동합니다.</span>
						</div>
						<div className="evaluateWrap" id="rating">
							<div className="optionWrap">
								<span className={`csFocus radioStyleLike radioRelease${ratingActive==='up'? ' select focusOn': ''}`}></span>
								<span className={`csFocus radioStyleDisLike radioRelease${ratingActive==='down'? ' select focusOn': ''}`}></span>
							</div>
							<p className="guideText">{GUILDE_TEXT[guildeIdx]}</p>
						</div>
					</div>
					{
                        cwSlide.length !== 0 &&
						<div className="rightWrap" id="slides">
							<div className="recommendTitle">이어서 볼만한 컨텐츠</div>
							<div className="recommendContent">
								<RecommendItem
									cwSlide={cwSlide}
									cwType={cwType}
									innerCwData={(data)=>this.cwList=data}
								/>
							</div>
						</div>
					}
				</div>
				<div className="keyWrap">
					<span className="btnKeyExit">시청종료</span>
					<span className="btnKeyPrev">계속 시청하기</span>
				</div>
			</div>
		);
	}
}

class RecommendItem extends React.Component {
	constructor(props) {
		super(props);
		
		this.cwList = [];
	}

	componentDidMount() {
		const { innerCwData } = this.props;
        if (typeof innerCwData === 'function') {
            innerCwData(this.cwList);
        }
	}

	shouldComponentUpdate(nextProps) {
		return JSON.stringify(nextProps) !== JSON.stringify(this.props);
	}

	render() {
		const { cwSlide, cwType } = this.props;
		if (cwSlide.length !== 0) {
			breakOut:
			for (const [idx, item] of cwSlide.entries()) {
				if (idx === 0) {
					if (cwType === 'info') {
						for (const [bIdx, block] of item.block.entries()) {
							if (bIdx < 2) {
								this.cwList.push(block);
							} else {
								break breakOut;
							}
						}
					} else {
						this.cwList.push(item);
					}
				}
			}
		}

		return (
			<Fragment>
				{
					this.cwList.map((item, i) => {
						return (
							<div className="item" key={i}>
								<span className="csFocus">
									<img src={`${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${item.poster_filename_v}`} alt=""/>
									<span className="itemTitle">{item.title}</span>
								</span>
							</div>
						)
					})
				}
			</Fragment>
		)
		
		// const { title, image } = this.props;
		// const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${image}`;
		// return(
		// 	<div className="item">
		// 		<span className="csFocus">
		// 			<img src={img} alt=""/>
		// 			<span className="itemTitle">{title}</span>
		// 		</span>
		// 	</div>
		// )
	}
}

export default SynopEnding;