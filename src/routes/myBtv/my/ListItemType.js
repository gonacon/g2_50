import {React} from '../../../utils/common';
import '../../../assets/css/routes/myBtv/my/ListItemType.css';

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
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		}
	}

	focusOn(index, _this){
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;

		if(document.querySelectorAll('.slideWrap.activeSlide').length !== 0){
			document.querySelector('.slideWrap.activeSlide').classList.remove('activeSlide');
		}
		activeSlide.closest('.slideWrap').classList.add('activeSlide');

		if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else{
			activeSlide.closest('.contentGroup').classList.remove('activeSlide');
		}
		
		if(activeSlide.classList.contains('right')){
			slideIndex += 1;
			if(slideIndex + thisItems > slideLength - 1){
				slideIndex = slideLength - thisItems;
			}
		}else if(activeSlide.classList.contains('left')){
			slideIndex -= 1;
			if(this.state.slideTo === 0){
				slideIndex = 0;
			}
		}
		
		this.setState({
			slideTo: slideIndex
		});
		
		document.querySelector('.slideCon').scrollLeft = 0;
	}

	keyDown(_this, i, keyCode) {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let thisItems = this.items;
		let activeSlide = document.activeElement;
		let direction = i;
		let targetIndex = _this;
		
		if(targetIndex === slideLength - 1 && direction === 39){
			slideIndex = 0;
			activeSlide.closest('.slideWrapper').querySelector('.slide:first-child .csFocus').focus();
			activeSlide.closest('.contentGroup').classList.add('activeSlide');
		}else if(targetIndex === 0 && direction === 37){
			slideIndex = slideLength - thisItems;
			activeSlide.closest('.slideWrapper').querySelector('.slide:last-child .csFocus').focus();
		}
		
		this.setState({
			slideTo: slideIndex
		});
	}
	
	render() {
		return (
			<div className="listItemType">
				<div className="listWrapper">
                    {
                        this.state.slideItem.map((data, i) => {
							return(
								<div className="contentGroup" key={i}>
									{
                                        data.map((data2, k) => {
                                        	return(
												<WishListItem
													data={data2}
													key={k}
													index={k}
												/>
											);
										})
									}
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
    render() {
        return (
			<div className="item">
				<div className="csFocus" tabIndex="-1"><img src={this.props.data.image} width={IMG_WIDTH} height={IMG_HEIGHT} alt=""/><span className="itemTitle">{this.props.data.title}</span></div>
			</div>
        )
    }

}


export default ListItemType;