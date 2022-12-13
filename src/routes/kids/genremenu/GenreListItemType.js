import {React } from '../../../utils/common';
import '../../../assets/css/routes/myBtv/my/ListItemType.css';
import appConfig from 'Config/app-config';
import Utils from 'Util/utils';
import { SlideInfo } from '../components/module/KidsSlider';
import FM from 'Supporters/navi';

const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class GenreListItemType extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {}
	}

	render() {
		const { slideInfo } = this.props;
		return (
			<div className="listItemType">
				<div id="grids" className="listWrapper">
                    {
                        slideInfo.map((data, i) => {
							return(
								<div className="contentGroup" key={i}>
									<div className="slideWrap">
										<div className="slideCon">
											{
												data.map((content, cnt_index) => {
													return(
														<WishListItem
															index={cnt_index}
															lastIndex={slideInfo.length}
															title={content.title}
															imgV={content.imgV}
															epsdId={content.epsdId}
															srisId={content.srisId}
															key={cnt_index}
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

class WishListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isTextOver: false
		}
	}

	setTextOver() {
		const { width } = SlideInfo[this.props.slideType];
		let { isTextOver } = this.state;
		if (!this.titBox) return;
	
		if (this.titBox.clientWidth > width && isTextOver !== true) {
		  this.setState({ isTextOver: true });
		}
	}

    render() {
		const { isTextOver } = this.state;
		const { imgV, title, slideType } = this.props;
        // const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_VER);
		const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
		let image = imgUrl + imgV;

		let textOver = isTextOver ? ' textOver' : '';
		let focusClass = '';
		
        return (
			<div className={`slide csFocus${textOver}`}>
				<span className="imgWrap">
					<img src={image} width={246} height={354} alt="" onError={e => e.target.src = defaultImg} />
				</span>
				<span className="itemTitle" ref={r => this.titBox = r}>{title}</span>
			</div>
		)
    }

}


export default GenreListItemType;