import {React} from '../../../utils/common';
import '../../../assets/css/routes/myBtv/my/ListItemType.css';
import appConfig from 'Config/app-config';


const IMG_WIDTH = 246; // 이미지 가로
const IMG_HEIGHT = 354; // 이미지 세로
const ITEMS = 6; // 메뉴별 아이템 개수

class ListItemType extends React.Component {
	constructor(props) {
		super(props);
		this.itemWidth = 246; // 슬라이드 가로 폭
		this.itemMargin = 42; // 슬라이드 간격
		this.items = ITEMS; // 한 화면의 슬라이드 개수

		this.state = {
			slideItem:this.props.slideInfo.slideItem,
			editState : this.props.edit
		}
	}

	textOver(El){
		if(El.querySelector('.itemTitle').clientWidth >= El.clientWidth && (El.classList.contains('left') || El.classList.contains('right'))){
			El.classList.add('textOver');
		}
	}

	focusOn(index, _this){
		let activeSlide = document.activeElement;

		this.textOver(activeSlide);
	}

	keyDown(i, _this) {
		let el = _this.target;
		let closetEl = _this.target.closest('.contentGroup');
		if(el.classList.contains('left')) {
			if(_this.keyCode === 37) {
				closetEl.querySelector('.slide:last-child .csFocus').focus();
			}
		}else if(el.classList.contains('right')) {
			if(_this.keyCode === 39) {
				closetEl.querySelector('.slide:first-child .csFocus').focus();
			}
		}
	}
	
	render() {
		return (
			<div className="listItemType">
				<div className="listWrapper">
                    {
                        this.state.slideItem.map((data, i) => {
							return(
								<div className="contentGroup" key={i}>
									<div className="slideWrap">
										<div className="slideCon">
											{
												data.map((data2, k) => {
													return(
														<WishListItem
															data={data2}
															flag={data2}
															key={k}
															index={k}
															editState={this.state.editState}
															event1={this.keyDown.bind(this, i)}
															event2={this.focusOn.bind(this, i)}
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

	keyDown(event){
		this.props.event1(event);
	}

	focusOn(...args){
		this.props.event2(this, ...args);
	}

    render() {
        return (
			<div className="slide">
				<div className={this.props.index === 0 ? "csFocus left" : this.props.index === ITEMS -1 ? "csFocus right" : "csFocus"}>
					<span className="imgWrap">
						<img src={this.props.data.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/>
						{this.props.flag.flagFree ?
							<span className="flagWrap">
								<img src={`${appConfig.headEnd.LOCAL_URL}/common/img/flag-free.png`} alt="" />
							</span>
							:
							this.props.flag.flagSale ?
								<span className="flagWrap">
									<img src="/assets/images/common/img/flag-sale.png" alt="" />
									<img src={this.props.flag.flagImg} className="flagImg" alt="" />
								</span>
								:
								this.props.flag.flagEvent ?
									<span className="flagWrap">
										<img src="/assets/images/common/img/flag-event-nor.png" alt="" />
										<img src={this.props.flag.flagImg} className="flagImg" alt="" />
									</span>
									:
									this.props.flag.flagNew ?
										<span className="flagWrap">
											<img src="/assets/images/common/img/flag-new.png" alt="" />
										</span>
										:
										this.props.flag.flagUp ?
											<span className="flagWrap">
												<img src="/assets/images/common/img/flag-up.png" alt="" />
											</span>
											:
											this.props.flag.flagCancel ?
												<span className="flagWrap">
													<img src="/assets/images/common/img/flag-cancel.png" alt="" />
												</span>
												:
												this.props.flag.flagMonopoly &&
												<span className="flagWrap">
														<img src="/assets/images/common/img/flag-monopoly.png" alt="" />
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


export default ListItemType;