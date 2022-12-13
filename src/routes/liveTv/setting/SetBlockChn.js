import {React, fnScrolling, Link } from '../../../utils/common';

import '../../../assets/css/routes/liveTv/setting/SetMultiView.css';
import '../../../assets/css/routes/liveTv/setting/SetFavorChn.css';

// TODO: Json 내용만 알맞게 교체되면 되므로 개발 완료 후 import는 blockChn2 삭제
// 선호채널 설정 Default
import blockChn from '../../../assets/json/routes/liveTv/setting/blockChn.json';
// 선호채널 설정 선호채널 보기, 등록한 선호채널 없음
import blockChn2 from '../../../assets/json/routes/liveTv/setting/blockChn2.json';
// 선호채널 설정 선호채널 보기, 등록한 선호채널 있음
import blockChn3 from '../../../assets/json/routes/liveTv/setting/blockChn3.json';
import appConfig from './../../../config/app-config';


class SetBlockChn extends React.Component {
	constructor(props) {
		super(props);
		
		let blockChnJson;
		
		if(this.props.chn === "have"){
			blockChnJson = blockChn;
		}else if(this.props.chn === "none"){
			blockChnJson = blockChn2;
		}else if(this.props.chn === "block"){
			blockChnJson = blockChn3;
		}
		
		this.state = {
			contentSlides : blockChnJson,
			totalFav : blockChnJson.totalFav
		};
	}
	
	keyDown(i,event){
		if(event.keyCode === 39 && event.target.classList.contains('right')){
			document.querySelector('.innerChnMultiView button').focus();
		}
		
		if(event.keyCode === 13){
			event.preventDefault();
			
			let totalFav = Number(this.state.totalFav);
			
			if(event.target.querySelector('.textConts').classList.contains('block')){
				event.target.querySelector('.textConts').classList.remove('block');
				totalFav -= 1;
			}else{
				event.target.querySelector('.textConts').classList.add('block');
				totalFav += 1;
			}
			
			this.setState({
				totalFav : totalFav
			});
		}
	}

	render() {
		return (
			<div className="wrap">
				<div className="setMultiViewWrap">
					<div className="setMultiViewConts">
						<div className="setMultiTitle">
							<p>차단채널 설정</p>
							<span>차단을 원하시는 채널을 선택해 등록해주세요. 기본 채널의 경우 (B tv 프로모션 채널) 차단하실 수 없습니다.</span>
						</div>
						<div className="multiViewContents">
							<div className="slideMultiView line2">
								<ul>
									{
										this.state.contentSlides.blockChn.length !== 0 ?
											this.state.contentSlides.blockChn.map((data,i) => {
												return(
													<li key={i}>
														<SetBlockChnList
															index={i}
															totalNum={this.state.contentSlides.blockChn.length}
															chnNum={data.chnNum}
															chnName={data.chnName}
															block={data.block}
															event1={this.keyDown.bind(this)}
														/>
													</li>
												)
											})
											:
											<li className="noneData">
												<span className="noneDataText">등록하신 선호채널이 없습니다.<br/>전체 채널목록에서 선택해주세요.</span>
											</li>
									}
								</ul>
								<span className="arrowTop"></span>
								<span className="arrowBottom"></span>
							</div>
							<div className="setMultiView">
								<div className="chnMultiView">
									<div className="innerChnMultiView">
										<button type="button" className={this.state.contentSlides.blockView === "true" && this.state.contentSlides.blockChn.length === 0 ? "csFocus btnStyleDark1 loadFocus" : "csFocus btnStyleDark1"}>
											{
												this.state.contentSlides.blockView === "true" ?
													<span className="loadFocus">전체채널 보기</span>
													:
													<span className=""><img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/ic-block.png`} alt="" /><em>차단채널 보기</em></span>
											}
										</button>
										<span className="registrationText">총 <span className="num">{Number(this.state.totalFav).toLocaleString('ko-KR')}</span>개 등록</span>
									</div>
								</div>
								<div className="btnArea">
									<button type="button" className="csFocus btnStyleDark1 btnEnd">
										<span className="wrapBtnText">설정완료</span>
									</button>
									{
										this.state.contentSlides.blockChn.length !== 0 ?
											<button type="button" className="csFocus btnStyleDark1 btnReset">
												<span className="wrapBtnText">초기화</span>
											</button>
											:
											<button type="button" className="csFocus btnStyleDark1 btnReset" disabled="disabled">
												<span className="wrapBtnText">초기화</span>
											</button>
									}
								
								</div>
							
							
							</div>
						</div>
						<div className="keyInfo">
							<span className="keyPage"><span className="iconLeftDark"></span><span className="iconRightDark"></span>페이지 이동</span>
							<span className="keyCancel"><span className="iconCancelDark"></span>설정 취소</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		fnScrolling();
	}

}

class SetBlockChnList extends React.Component {
	keyDown(_this, i){
		this.props.event1(_this, i);
	}
	
	render() {
		return (
			<Link to="/" className={this.props.index === 0 ? "csFocus multiViewListItem loadFocus" : this.props.totalNum - 8 < this.props.index ? "csFocus multiViewListItem right" : "csFocus multiViewListItem"} onKeyDown={this.keyDown.bind(this, this.props.index)}>
				<span className={this.props.block === "true" ? "textConts block" : "textConts"}>
					<span className="textChn">{this.props.chnNum}</span>
					<span className="textName">{this.props.chnName}</span>
				</span>
			</Link>
		)
	}
}

export default SetBlockChn;