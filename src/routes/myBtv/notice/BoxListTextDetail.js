import {React} from "../../../utils/common";

import '../../../assets/css/routes/myBtv/notice/ListTextDetail.css';

import ListTextDetailData from "../../../assets/json/routes/myBtv/notice/BoxListTextDetail.json";
import appConfig from './../../../config/app-config';

class ListTextDetail extends React.Component {
	constructor() {
		super();

		this.state = {
			content : ListTextDetailData
		}

	}

	keyDown(event){
	
	}

	render() {
		let detailText = this.state.content.listTextDetail.detail;
		if (detailText !== undefined) {
			detailText = detailText.split('\n').map( (line,i) => {
				return (<div key={i}>{line}</div>)
			});
		}

		let detailContent = this.state.content.listTextDetail;

		return(
			<div className="contentPop listTextDetail box">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="innerContentPop">
					<div className="detailTitleWrap">
						<p className="detailTitle">{detailContent.title}</p>
					</div>
					<div className="popupScrollWrap">
						<div className="contScrollWrap">
							<div className="innerContentInfo">
								<div className="contentInfo">
									<div className="contentText">
										<div>
											<div className="text">{detailText}</div>
										</div>
									</div>
								</div>
							</div>
							<span className="scrollBarBox">
								<div className="innerScrollBarBox">
									<span className="scrollBar"></span>
									<span className="scrollBarBG"></span>
								</div>
							</span>
						</div>
					</div>
					<div className="btnWrap">
						{
							detailContent.btns.map((data, i) => {
								return(
									<a className={i === 0 ? "csFocus btnStyle loadFocus" : "csFocus btnStyle"} href="" key={i}><span className="wrapBtnText">{data}</span></a>
								)
							})
						}
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
	}

}


export default ListTextDetail;