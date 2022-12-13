import {React } from '../../../utils/common';
import appConfig from './../../../config/app-config';

const IMG_WIDTH = 306; // 이미지 가로
const IMG_HEIGHT = 180; // 이미지 세로

class ChannelList extends React.Component {
	
	// shouldComponentUpdate(prevProps, prevState) {
	// 	return prevProps.focusProgram !== this.props.focusProgram;
	// }

	render() {	
		const {boxOffice, idx, ageLimit, focusProgram, pipStatus} = this.props;
		const channel = boxOffice;
		const program = channel.program;
		const channelBLock = channel.channelBLock;
		const channelSvcID = channel.channelSvcID;
		const channelRating = channel.channelRating;
		const programRating = channel.program.rating;
		const channelIsPay = channel.channelIsPay;
		const videoResolution = channel.channelResolution; 
		// console.log('channelRating: ', channelRating)
		// console.log('ageLimit: ', ageLimit)
		let boxOfficeConClassName = 'boxOfficeCon csFocus bgCover'
		let pipPlay = true;
		if (channelBLock || Number(channelRating) >= 21 || (Number(ageLimit) !== 0 && Number(channelRating) >= ageLimit) ||channelIsPay || videoResolution === 2 || channelSvcID === 105)  {
			pipPlay = false;
		}
		
		let timeLineBarStyle;
		if(program) {
			timeLineBarStyle = {width:(this.props.now - program.startTime)/(program.endTime - program.startTime) * 100 + "%"};
		}else {
			timeLineBarStyle = {width:"0%"};
		}
		const img = channel.channelImg.split('|')[0];
		const showImg = img.length > 0 ? true : false;
		
		const defaultImg = `file:///data/btv_home/DATA/epg/menu_image/default/channel_default_img_loading.png`; //가상채널의 경우 임시로 기본 BTV 로고 img 사용		 
		let imgPath;
		if (img !== "") {
			imgPath = `file:///data/btv_home/DATA/epg/menu_image/update/${focusProgram === idx ? 'white_' : 'gray_'}${img}`;
		}
		
		let channeNo = channel.channelNo;
		let channelLen = channeNo.length;
		channeNo = channelLen === 1 ? '00' + channeNo : channelLen === 2 ? '0' + channeNo : channeNo;
		return (
			<div className={boxOfficeConClassName} key={idx} style={{transition: 'none'}}>
				<div className="topCon">
				
				{channel.program.imagePath === "" || img === ""  || channel.channelVirtual === true ?
					<img src={defaultImg} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
					:
					channelSvcID === 105 ?
						<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel_default_img_audio.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
						:
						channelBLock === true ?
							<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel-default-img-block.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
							:
							Number(channel.channelRating) >= 21 ?
								<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel-default-img-protection.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
								:
								Number(ageLimit) !== 0 && Number(channel.channelRating) >= Number(ageLimit) ?
									<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel-default-img-restrict.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
									:
									channel.channelIsPay === true ?
										<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel-default-img-notjoin.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
										:
										videoResolution === 2 ?
											<img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/channel-default-img-uhd.png`} className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
											:
											//focusProgram === idx && pipStatus === true ? 
											focusProgram === idx ? 
											<img src={channel.program.imagePath}  width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={e=>e.target.src=defaultImg} />
											:
											<img src={channel.program.imagePath}  className="protection" width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={e=>e.target.src=defaultImg}/>
					}
					{focusProgram !== idx ? <span className={Number(channel.channelOrder) < 4 ? "lank top3" : "lank"}>{channel.channelOrder}</span> : pipPlay ? <span></span> : <span className={Number(channel.channelOrder) < 4 ? "lank top3" : "lank"}>{channel.channelOrder}</span>}
					{channel.channelBLock !== "true" && <span className="timeLine"><span style={timeLineBarStyle}></span></span>}
				</div>
				<div className="botCon">
					<span className="channelNum">
						{channel.channelFavorite === true && <span className="fav"></span>}
						{channeNo}
					</span>
					<span className="channelName">
					{showImg ?
						<img src={imgPath} alt="" />
						:
						""
					}
					</span>
					<div>
						<span className="programName">{channel.channelBLock === true ? "차단된 채널입니다" : Number(channel.channelRating) >= 21 ? "청소년 보호 프로그램": program.title ? program.title : "프로그램정보 없음"}</span>
					</div>
				</div>
			</div>
		)
	}
}
export default ChannelList;