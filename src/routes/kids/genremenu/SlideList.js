import React, { Component } from 'react';
import { SlideInfo } from '../components/module/KidsSlider';
import Utils from './../../../utils/utils';

// 추천/인기/신작 콘텐츠 블럭 영역 - 시즌 가로형
// 캐릭터 블럭
// 메뉴 블럭
// 콘텐츠 블럭 - 시즌 가로형
// 콘텐츠 블럭 - 단편 세로형
// 콘텐츠 블럭 - 패키지 세로형
// 키즈존 관련 이벤트 배너 블럭 

class GenreMenuVodList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        }
    }
    render() {
        const { imgV, slideType } = this.props;
        const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_SIZE_VER);
		
		const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
		let image = imgUrl + imgV;
		
        return (
            <div className="slide">
				<div className="csFocus">
					<span className="imgWrap">
						<img src={image} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/>
						{/* H/E 필드 내려오면 작업 필요 */}
						{/* {this.props.flag.flagFree ? 
							<span className="flagWrap">
								<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-free.png`} alt="" />
							</span>
							:
							this.props.flag.flagSale ?
								<span className="flagWrap">
									<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-sale.png`} alt="" />
									<img src={this.props.flag.flagImg} className="flagImg" alt="" />
								</span>
								:
								this.props.flag.flagEvent ?
									<span className="flagWrap">
										<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-event-nor.png`} alt="" />
										<img src={this.props.flag.flagImg} className="flagImg`} alt="" />
									</span>
									:
									this.props.flag.flagNew ?
										<span className="flagWrap">
											<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-new.png`} alt="" />
										</span>
										:
										this.props.flag.flagUp ?
											<span className="flagWrap">
												<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-up.png`} alt="" />
											</span>
											:
											this.props.flag.flagCancel ?
												<span className="flagWrap">
													<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-cancel.png`} alt="" />
												</span>
												:
												this.props.flag.flagMonopoly ?
													<span className="flagWrap">
														<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-monopoly.png`} alt="" />
													</span>
													:
													this.props.flag.flagHdr ?
														<span className="flagWrap">
															<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-uhd-hdr.png`} alt="" />
														</span>
														:
														this.props.flag.flagUhd &&
															<span className="flagWrap">
																<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-uhd.png`} alt="" />
															</span>
						} */}
					</span>
					<span className="programTitle">{this.props.title}</span>
				</div>
			</div>
        )
    }
}

export { GenreMenuVodList };