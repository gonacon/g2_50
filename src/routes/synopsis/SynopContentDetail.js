import {React, Link, popupScroll, createMarkup} from '../../utils/common';
import '../../assets/css/routes/synopsis/SynopContentDetail.css';

class SynopContentDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            slideIndex : this.props.popIndex - 1,
            gradeLike : this.props.reviewContent.gradeLike
        }
    }

    focusOn(index, _this){
        this.setState({
           slideIndex : index - 2
        });
        if(_this.target.classList.contains('reviewCon')){
        	_this.target.querySelector('.reviewContentsWrap').focus();
		}
    }

	keyUp(event){
		if(event.keyCode === 37){
			event.target.closest('.reviewCon').previousSibling.focus();
		}
	}

	keyDown(event){
		if(event.keyCode === 39) {
			event.target.closest('.reviewCon').nextSibling.focus();
		}
	}

    starWidth(data){
        let starWidths = Math.ceil(data.gradeLike*10)/20;

        return 'calc(' + (data.gradeLike*10) + '% - ' + starWidths + ' * 17px + ' + starWidths * 20 + 'px)';
    }

	starWidth2(data){
		let starWidths = Math.ceil(data.gradeLike*10)/20;

		return 'calc(' + (data.gradeLike*10) + '% - ' + starWidths + ' * 9px + ' + starWidths * 9 + 'px)';
	}

    render() {
        let slideIndex = this.state.slideIndex;

        let style = {
            backgroundImage: "url(" + this.props.popBg + ")",
            width: (this.props.reviewContent.length - 1) * 1920 + "px"
        };

        return (
            <div className="contentDetail popContents" style={style}>
                <div className="slideWrap" style={{'--page':this.state.slideIndex}}>
                    {this.props.reviewContent.map((data, i) => {
                        switch( data.detailContent ){
                            case "feeling" :
                                return(
                                    <Link to="/" className="innerContents csFocusPop" key={i} onFocus={this.focusOn.bind(this,i)}>
                                        <div className="detailTitleArea">
                                            <p className="detailTitle"><img src={data.detailTitleImg} alt="" />{data.detailTitle}</p>
                                            <p className="allParticipant">총 평가 {data.participant}명</p>
                                        </div>
                                        <ul className="goodFeelingBox">
                                            <li>
                                                <div className="appraisal">
                                                    <span className="imgBox">
                                                        <span className="like"></span>
                                                    </span>
                                                    <p className="likeState">좋아요</p>
                                                    <p className="percent"><span className="num">{data.gradeLike}</span>%</p>
                                                    <p className="user"><span className="num">{data.participantLike}</span>명</p>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="appraisal">
                                                    <span className="imgBox">
                                                        <span className="dislike"></span>
                                                    </span>
                                                    <p className="likeState">별로예요</p>
                                                    <p className="percent"><span className="num">{data.gradeDislike}</span>%</p>
                                                    <p className="user"><span className="num">{data.participantDislike}</span>명</p>
                                                </div>
                                            </li>
                                        </ul>
                                        {this.props.reviewContent.length-1 !== i &&
                                            this.props.reviewContent[i+1].detailContent === "grade" && <span className="rightContent">{this.props.reviewContent[i+1].logo.alt} 평점</span>
                                        }
                                        {this.props.reviewContent.length-1 !== i &&
                                            this.props.reviewContent[i+1].detailContent === "review" && <span className="leftContent">{this.props.reviewContent[i+1].detailTitle}</span>
                                        }

                                    </Link>
                                );
                            case "grade" :
                                return(
                                    <Link to="/" className="innerContents csFocusPop" key={i} onFocus={this.focusOn.bind(this,i)}>
                                        <div className="detailTitleArea">
                                            <p className="detailTitle"><img src={data.detailTitleImg} alt="" /></p>
                                            <div className="gradeGrade">
                                                <span className="gradeText">
                                                    <span className="num">{data.gradeLike}</span> / 10
                                                </span>
                                                <span className="starGradeWrap">
                                                    <span className="starGrade">
                                                        <span className="starImg" style={{'width':this.starWidth(data)}}></span>
                                                    </span>
                                                </span>
                                                <span className="participantText"><span className="num">{data.participant}</span>의 평균평점</span>
                                            </div>
                                        </div>
                                        <div className="detailGradeGraph">
                                            <span className="gradeGraphWrap">
                                                <ul>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'5px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'20px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'28px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'1px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'40px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'70px'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'139px','opacity':'0.35'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'192px','opacity':'0.45'}}></span>
                                                        <span className="perNum"><span className="num">32</span>%</span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'95px','opacity':'0.2'}}></span>
                                                    </li>
                                                    <li>
                                                        <span className="gradeGraph" style={{'height':'70px'}}></span>
                                                    </li>
                                                </ul>
                                            </span>
                                            <span className="gradeNumWrap">
                                                <ul>
                                                    <li><span className="num">1점</span></li>
                                                    <li><span className="num">2점</span></li>
                                                    <li><span className="num">3점</span></li>
                                                    <li><span className="num">4점</span></li>
                                                    <li><span className="num">5점</span></li>
                                                    <li><span className="num">6점</span></li>
                                                    <li><span className="num">7점</span></li>
                                                    <li><span className="num">8점</span></li>
                                                    <li><span className="num">9점</span></li>
                                                    <li><span className="num">10점</span></li>
                                                </ul>
                                            </span>
                                        </div>
                                        {this.props.reviewContent[i-1].detailContent === "feeling" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt}{this.props.reviewContent[i-1].detailTitle}</span>}
                                        {this.props.reviewContent[i-1].detailContent === "grade" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt} 평점</span>}
                                        {this.props.reviewContent.length-1 !== i &&
                                            this.props.reviewContent[i+1].detailContent === "grade" && <span className="rightContent">{this.props.reviewContent[i+1].logo.alt} 평점</span>
                                        }
                                        {this.props.reviewContent.length-1 !== i &&
                                            this.props.reviewContent[i+1].detailContent === "sn21Review" && <span className="rightContent">{this.props.reviewContent[i+1].sn21[i].logo.alt} 리뷰</span>
                                        }
										{this.props.reviewContent.length-1 !== i &&
										this.props.reviewContent[i+1].detailContent === "watchaReview" && <span className="rightContent">{this.props.reviewContent[i+1].watcha[i].logo.alt} 리뷰</span>
										}
                                    </Link>
                                );
                            case "sn21Review" :
								return(
									<Link to="/" className="innerContents reviewCon csFocusPop" key={i} onFocus={this.focusOn.bind(this,i)}>
										<div className="popConWrap">
											<div className="reviewContentsWrap innerContentInfo" onKeyUp={this.keyUp.bind(this)} onKeyDown={this.keyDown.bind(this)} tabIndex="0">
												<p className="reviewTitle">전문가 리뷰</p>
												<p className="reviewSubTitle">별점 높은 순으로 표시됩니다</p>
												<div className="reviewWrap">
													{data.sn21.map((data,k) => {
														return(
															<div className="contentText" key={k}>
																<span className="textIndex">{data.who}</span>
																<span className="bar"></span>
																<span className="reviewGrade">
																			<span className="starGradeWrap">
																				<span className="starGrade">
																					<span className="starImg" style={{'width':this.starWidth2(data)}}></span>
																				</span>
																			</span>
																			<span className="num">{data.gradeLike}</span> / 10
																			<span className="logoImg">
																				<img src={data.logo.reviewDetailImg} alt=""/>
																			</span>
																		</span>
																<div className="text" dangerouslySetInnerHTML={createMarkup(data.review)}></div>
															</div>
														)
													})}
												</div>
											</div>
											<span className="scrollBarBox">
												<div className="innerScrollBarBox">
													<span className="scrollBar"></span>
													<span className="scrollBarBG"></span>
												</div>
											</span>
										</div>
										{this.props.reviewContent[i-1].detailContent === "feeling" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt}{this.props.reviewContent[i-1].detailTitle}</span>}
										{this.props.reviewContent[i-1].detailContent === "grade" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt} 평점</span>}
										{this.props.reviewContent[i-1].detailContent === "sn21Review" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].sn21[0].logo.alt} 리뷰</span>}
										{this.props.reviewContent.length-1 !== i &&
										this.props.reviewContent[i+1].detailContent === "watchaReview" && <span className="rightContent">{this.props.reviewContent[i+1].watcha[0].logo.alt} 리뷰</span>}
									</Link>
								);
							case "watchaReview" :
								return(
									<Link to="/" className="innerContents reviewCon csFocusPop" key={i} onFocus={this.focusOn.bind(this,i)}>
										<div className="popConWrap">
											<div className="reviewContentsWrap innerContentInfo" onKeyUp={this.keyUp.bind(this)} tabIndex="0">
												<p className="reviewTitle">전문가 리뷰</p>
												<p className="reviewSubTitle">별점 높은 순으로 표시됩니다</p>
												<div className="reviewWrap">
													{data.watcha.map((data,j) => {
														return(
															<div className="contentText" key={j}>
																<span className="textIndex">{data.who}</span>
																<span className="bar"></span>
																<span className="reviewGrade">
																			<span className="starGradeWrap">
																				<span className="starGrade">
																					<span className="starImg" style={{'width':this.starWidth2(data)}}></span>
																				</span>
																			</span>
																			<span className="num">{data.gradeLike}</span> / 10
																			<span className="logoImg">
																				<img src={data.logo.reviewDetailImg} alt=""/>
																			</span>
																		</span>
																<div className="text" dangerouslySetInnerHTML={createMarkup(data.review)}></div>
															</div>
														)
													})}
												</div>
											</div>
											<span className="scrollBarBox">
												<div className="innerScrollBarBox">
													<span className="scrollBar"></span>
													<span className="scrollBarBG"></span>
												</div>
											</span>
										</div>
										{this.props.reviewContent[i-1].detailContent === "feeling" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt}{this.props.reviewContent[i-1].detailTitle}</span>}
										{this.props.reviewContent[i-1].detailContent === "grade" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].logo.alt} 평점</span>}
										{this.props.reviewContent[i-1].detailContent === "sn21Review" && i !== 0 && <span className="leftContent">{this.props.reviewContent[i-1].sn21[0].logo.alt} 리뷰</span>}
									</Link>
								);
                            }
                        }
                    )
                }
                </div>
                <div className="btnBeforeArea" tabIndex="0">
                    <span className="btnBefore"><span className="iconCloseDark"></span>닫기</span>
                </div>
            </div>
        )
    }

    componentDidMount() {
        document.querySelectorAll('.csFocusPop')[this.props.popIndex - 1].focus();
		popupScroll();
    }
}



export default SynopContentDetail;