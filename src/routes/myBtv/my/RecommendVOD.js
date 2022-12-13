import {React} from '../../../utils/common';
import '../../../assets/css/routes/myBtv/my/RecommendVOD.css';

class RecommendVOD extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			slideTo:0,
			slideItem:this.props.slideInfo.slideItem
		}
	}

	focusOn(_this, index){
		let slideIndex = this.state.slideTo;
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
		this.setState({
			slideTo: slideIndex
		});
	}

	focusOut(){
		if(document.querySelectorAll('.contentGroup.activeSlide').length !== 0){
			document.querySelector('.contentGroup.activeSlide').classList.remove('activeSlide');
		}
	}

	render() {
		return(
			<div className="contentGroup">
				<div className="wrapRecommend">
					<div className="recommendItem">
						<div className="title">{this.props.slideInfo.slideTitle}</div>
						<div className="slideWrap">
							<div className="slideCon">
								<div className="slideWrapper">
									{
										this.props.slideInfo.slideItem.map((data, i ) => {
											return(
												<RecommendItem
													title={data.title}
													image={data.image}
													index={i}
													key={i}
													event1={this.focusOn.bind(this)}
													event2={this.focusOut.bind(this)}
												/>
											)
										})
									}
								</div>
							</div>
						</div>
					</div>
					<div className="recommendCon">
						<p className="contentTitle">고객님만의 VOD 콘텐츠를<br/>쉽고 편하게 즐겨보세요.</p>
						<p className="contentText">
							마이 B tv에서는 고객님의 VOD 콘텐츠 서비스 이용에 따라<br/>
							<strong>최근시청 VOD / 나의 소장용 VOD / VOD 찜목록</strong>영역을 맞춤 제공하여<br/>
							고객님만의 VOD 콘텐츠를 쉽게 관리하고 편리하게 즐길 수 있습니다.
						</p>
					</div>
				</div>
			</div>
		);
	}
}

class RecommendItem extends React.Component {

	focusOn(...args){
		this.props.event1(this, ...args);
	}

	render() {
		return (
			<div className="slide">
				<div className="csFocus" tabIndex="-1" onFocus={this.focusOn.bind(this, this.props.index)}>
					<img src={this.props.image} alt=""/>
					<span className="slideTitle">{this.props.title}</span>
				</div>
			</div>
		);
	}
}

export default RecommendVOD;
