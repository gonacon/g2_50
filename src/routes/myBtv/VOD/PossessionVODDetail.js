// import {React, Link, createMarkup, fnScrolling } from '../../../utils/common';
// import '../../../assets/css/routes/myBtv/VOD/PossessionVODDetail.css';
// import '../../../assets/css/routes/synopsis/SynopShort.css';
// import DataVOD from '../../../assets/json/routes/myBtv/VOD/PossessionVODDetail.json';
// import DataVODMovie from '../../../assets/json/routes/myBtv/VOD/PossessionVODDetail2.json';

// import SynopShortSpecialMovie from '../../synopsis/SynopShortSpecialMovie.js';
// import SynopShortAppearance from '../../synopsis/SynopShortAppearance.js';
// import SynopShortAppearanceBlock from '../../synopsis/SynopShortAppearanceBlock.js';

// let DATA;

// class PossessionVOD extends React.Component {
// 	constructor(props) {
// 		super(props);

// 		if( this.props.data === "movie") {
// 			DATA = DataVODMovie;
// 		}else {
// 			DATA = DataVOD;
// 		}
		
// 		this.state = {
// 			type: DATA.type,
// 			special: this.props.special,
// 			corner: this.props.corner,
// 			appearance: this.props.appearance
// 		};
// 	}
	
// 	focusOn(event){
// 		let viewPage = ["hidden","hidden","hidden"];
		
// 		switch (event.target.getAttribute("data-target")) {
// 			case '스페셜영상' :
// 				viewPage = ["view","hidden","hidden"];
// 				break;
// 			case '코너별영상' :
// 				viewPage = ["hidden","view","hidden"];
// 				break;
// 			case '제작/출연진' :
// 				viewPage = ["hidden","hidden","view"];
// 				break;
// 		}
		
// 		this.setState({
// 			special: viewPage[0],
// 			corner: viewPage[1],
// 			appearance: viewPage[2]
// 		});
// 	}

// 	render() {
// 		return (
// 			<div className="wrap">
// 				<div className="possessionVOD scrollWrap">
// 					<div className="mainBg">
// 						<img src={DATA.bg} alt="" className="vodBg" />
// 						{
// 							this.state.special === "hidden" && this.state.corner === "hidden" && this.state.appearance === "hidden" ?
// 								<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-tone-01.png`} alt="" className="vodBgTone01" />
// 								:
// 								<span>
// 									<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-tone-02.png`} alt="" className="vodBgTone02" />
// 									<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-shape.png`} alt="" className="vodBgBox" />
// 								</span>
// 						}
// 					</div>
// 					<div className="contentWrap">
// 						<div className="contentTop">
// 							<img src={DATA.logo} alt="" />
// 							<div dangerouslySetInnerHTML={createMarkup(DATA.text)}></div>
// 						</div>
						
// 						<div className="synopShortContent">
// 							<div className="synopBot">
// 							{
// 								DATA.menu.map((data,i) => {
// 									return(
// 										<div key={i}>
// 											{data.slideTitle === "스페셜영상" && this.state.special !== "hidden" &&
// 												<SynopShortSpecialMovie
// 													slideInfo={data.slideItem[0]}
// 												/>
// 											}
// 											{data.slideTitle === "코너별영상" && this.state.corner!== "hidden" &&
// 												<SynopShortSpecialMovie
// 													slideInfo={data.slideItem[0]}
// 												/>
// 											}
// 											{data.slideTitle === "제작/출연진" && this.state.appearance!== "hidden" ?
// 												(DATA.vodType === "movie" ?
// 													<SynopShortAppearance
// 														slideInfo={data.slideItem[0]}
// 													/>
// 													:
// 													<SynopShortAppearanceBlock
// 														slideInfo={data.slideItem[0]}
// 													/>)
// 												: ''
// 											}
// 										</div>
// 									);
// 								})
// 							}
// 							</div>
// 						</div>
						
						
// 						<div className="contentBtn">
// 							<span className="csFocus playBtn btnStyleLight1" onFocus={this.focusOn.bind(this)}>재생하기</span>
// 							{
// 								DATA.menu.map((data,i) => {
// 									return(
// 										<span key={i}>
// 											<span className={this.state.special !== "hidden" && data.slideTitle === "스페셜영상" ? "csFocus btnStyleLight1 loadFocus on arrow" : this.state.corner !== "hidden" && data.slideTitle === "코너별영상" ? "csFocus btnStyleLight1 loadFocus on arrow" : this.state.appearance !== "hidden" && data.slideTitle === "제작/출연진" ? "csFocus btnStyleLight1 loadFocus on arrow" : "csFocus btnStyleLight1 arrow"} onFocus={this.focusOn.bind(this)} data-target={data.slideTitle}>{data.slideTitle}</span>
// 											<img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-shape-arrow.png`} alt=""/>
// 										</span>
// 									);
// 								})
// 							}
// 							<span className="csFocus btnStyleLight1" onFocus={this.focusOn.bind(this)}>시놉시스</span>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		)
// 	}
	
// 	componentDidUpdate() {
// 		if(document.querySelectorAll('.slideTypeE .titleStyle2').length !== 0){
// 			document.querySelector('.slideTypeE .titleStyle2').remove();
// 			for(let i = 0; i < document.querySelectorAll('.slideTypeE .csFocus').length; i++){
// 				document.querySelectorAll('.slideTypeE .csFocus')[i].addEventListener('keydown',(e) => {
// 					if(e.keyCode === 40) document.querySelector('.contentBtn .csFocus.on').focus();
// 				});
// 			}
// 		}
		
// 		if(document.querySelectorAll('.slideTypeF .titleStyle2').length !== 0){
// 			document.querySelector('.slideTypeF .titleStyle2').remove();
// 			for(let i = 0; i < document.querySelectorAll('.slideTypeF .csFocus').length; i++){
// 				document.querySelectorAll('.slideTypeF .csFocus')[i].addEventListener('keydown',(e) => {
// 					if(e.keyCode === 40) document.querySelector('.contentBtn .csFocus.on').focus();
// 				});
// 			}
// 		}
// 		fnScrolling();
// 	}

// 	componentDidMount() {
// 		document.querySelector('.topMenu').setAttribute('style','display:none');
// 		if(document.querySelectorAll('.loadFocus').length === 0){
// 			document.querySelector('.playBtn').classList.add('loadFocus');
// 		}
		
// 		if(document.querySelectorAll('.slideTypeE .titleStyle2').length !== 0){
// 			document.querySelector('.slideTypeE .titleStyle2').remove();
// 			for(let i = 0; i < document.querySelectorAll('.slideTypeE .csFocus').length; i++){
// 				document.querySelectorAll('.slideTypeE .csFocus')[i].addEventListener('keydown',(e) => {
// 					if(e.keyCode === 40) document.querySelector('.contentBtn .csFocus.on').focus();
// 				});
// 			}
// 		}
		
// 		if(document.querySelectorAll('.slideTypeF .titleStyle2').length !== 0){
// 			document.querySelector('.slideTypeF .titleStyle2').remove();
// 			for(let i = 0; i < document.querySelectorAll('.slideTypeF .csFocus').length; i++){
// 				document.querySelectorAll('.slideTypeF .csFocus')[i].addEventListener('keydown',(e) => {
// 					if(e.keyCode === 40) document.querySelector('.contentBtn .csFocus.on').focus();
// 				});
// 			}
// 		}
// 		fnScrolling();
// 	}

// }

// export default PossessionVOD;