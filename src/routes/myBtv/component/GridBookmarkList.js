import 'Css/myBtv/my/ListItemType.css';
import React, { Component } from 'react';
import Utils from 'Util/utils';
import appConfig from '../../../config/app-config';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class GridBookmarkList extends Component {
	render() {
		return (
			<div id={this.props.fmId} className="listItemType">
				<div className="listWrapper">
                    {
                        this.props.slideItem.map((data, i) => {
							return(
								<div className="contentGroup" key={i}>
									<div className="slideWrap">
										<div className="slideCon">
											{
												data.map((item, k) => {
													return(
														<BookmarkListItem
															data={item}
															flag={item.flag}
															key={k}
															index={k}
															editState={this.props.editState}
														/>
													);
												})
											}
										</div>
									</div>
								</div>
							);
                        })
                    }
				</div>
			</div>
		);
	}
}

class BookmarkListItem extends Component {
    render() {
		const img = this.props.data.bAdult ? `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-protection.png` : `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${this.props.data.imgURL}`;
		const defaultImg = `${appConfig.headEnd.LOCAL_URL}/common/img/thumbnail-default-land.png`;
		
        return (
			<div className="slide">
				<div className={this.props.index === 0 ? "csFocus left" : this.props.index === ITEMS -1 ? "csFocus right" : "csFocus"}>
					<span className="imgWrap">
						<img src={img} width={IMG_WIDTH} height={IMG_HEIGHT} alt="" onError={e=>e.target.src=defaultImg}/>
						{this.props.flag.flagFree ?
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
										<img src={this.props.flag.flagImg} className="flagImg" alt="" />
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
						}
					</span>
					<span className="itemTitle">{this.props.data.title}</span>
				</div>
				{
					this.props.editState === true && <span className="icDelete"></span>
				}
			</div>
        )
    }
}

export default GridBookmarkList;