import {React, fnScrolling, Link } from '../../../utils/common';

import '../../../assets/css/routes/liveTv/setting/SetMultiView.css';
import '../../../assets/css/routes/liveTv/setting/SetFavorChn.css';

// TODO: Json 내용만 알맞게 교체되면 되므로 개발 완료 후 import는 favorChn2 삭제
// 선호채널 설정 Default
import favorChn from '../../../assets/json/routes/liveTv/setting/favorChn.json';
// 선호채널 설정 선호채널 보기, 등록한 선호채널 없음
import favorChn2 from '../../../assets/json/routes/liveTv/setting/favorChn2.json';
// 선호채널 설정 선호채널 보기, 등록한 선호채널 있음
import favorChn3 from '../../../assets/json/routes/liveTv/setting/favorChn3.json';
import appConfig from './../../../config/app-config';


class SetFavorChn extends React.Component {
	constructor(props) {
		super(props);
		
		let favorChnJson;
		
		if(this.props.chn === "have"){
			favorChnJson = favorChn;
		}else if(this.props.chn === "none"){
			favorChnJson = favorChn2;
		}else if(this.props.chn === "favor"){
			favorChnJson = favorChn3;
		}
		
		this.state = {
			contentSlides : favorChnJson,
			totalFav : favorChnJson.totalFav
		};
	}
	
	keyDown(i,event){
		if(event.keyCode === 39 && event.target.classList.contains('right')){
			document.querySelector('.innerChnMultiView button').focus();
		}
		
		if(event.keyCode === 13){
			event.preventDefault();
			
			let totalFav = Number(this.state.totalFav);
			
			if(event.target.querySelector('.textConts').classList.contains('favor')){
				event.target.querySelector('.textConts').classList.remove('favor');
				totalFav -= 1;
			}else{
				event.target.querySelector('.textConts').classList.add('favor');
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
							<p>선호채널 설정</p>
							<span>원하시는 선호 채널을 선택해 등록해주세요.</span>
						</div>
						<div className="multiViewContents">
							<div className="slideMultiView line2">
								<ul>
									{
										this.state.contentSlides.favorChn.length !== 0 ?
											this.state.contentSlides.favorChn.map((data,i) => {
												return(
													<li key={i}>
														<SetFavorChnList
															index={i}
															totalNum={this.state.contentSlides.favorChn.length}
															chnNum={data.chnNum}
															chnName={data.chnName}
															favor={data.favor}
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
										<button type="button" className={this.state.contentSlides.favorView === "true" && this.state.contentSlides.favorChn.length !== 0 ? "csFocus btnStyleDark1 loadFocus" : "csFocus btnStyleDark1"}>
											{
												this.state.contentSlides.favorView === "true" ?
													<span className="loadFocus">전체채널 보기</span>
													:
													<span className=""><img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/ic-star.png`} alt="" /><em>등록한 선호채널만 보기</em></span>
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
										this.state.contentSlides.favorChn.length !== 0 ?
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

class SetFavorChnList extends React.Component {
	keyDown(_this, i){
		this.props.event1(_this, i);
	}
	
	render() {
		return (
			<Link to="/" className={this.props.index === 0 ? "csFocus multiViewListItem loadFocus" : this.props.totalNum - 8 < this.props.index ? "csFocus multiViewListItem right" : "csFocus multiViewListItem"} onKeyDown={this.keyDown.bind(this, this.props.index)}>
				<span className={this.props.favor === "true" ? "textConts favor" : "textConts"}>
					<span className="textChn">{this.props.chnNum}</span>
					<span className="textName">{this.props.chnName}</span>
				</span>
			</Link>
		)
	}
}

export default SetFavorChn;