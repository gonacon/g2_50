// common
import React, { Fragment } from 'react';
import { createMarkup, popupScroll } from '../../../utils/common';
import PopupPageView from 'Supporters/PopupPageView';
import FM from 'Supporters/navi';
import keyCode from 'Supporters/keyCodes';

// utils
import synopAPI from '../api/synopAPI';
import _ from 'lodash';
import Utils, { scroll } from '../../../utils/utils';

// style
import '../../../assets/css/routes/synopsis/SynopReviewDetail.css';
import appConfig from 'Config/app-config';

// component
import NumberFormat from '../../../components/modules/UI/NumberFormat';

const { Keymap: { UP, DOWN, LEFT, RIGHT, BACK_SPACE, PC_BACK_SPACE } } = keyCode;
class SynopReviewDetail extends PopupPageView {
    constructor(props) {
        
        super(props);

        this.state = {
            site: this.props.data.site_cd,
            dataIdx: 0,
            slideIndex : 0,
            reviewInfo : [],
            isChange: false,
            reviewScrollTop: 0,
            scrollTop: 0
        }
        this.reviews = _.reject(this.props.data.totalReviews, (a) => a.type === 'rate' || a.type === 'history')
        this.pageList = [
            'Btv고객호감도', 'CINE21평점', '왓챠평점', 'CINE21리뷰', '왓챠리뷰'
        ],
        this.ynScroll = true;
        this.pageNo = 1;
        this.pageCnt = 5;
        this.scrollHeight = 0; // 스크롤이 내려가는 값
        this.scrollHeightArr = [];
        this.flagState = true;
        this.innerContentTop = 0;
    }

    componentWillMount() {
        const { data } = this.props;
        if (data.site_cd === 'btv') {
            this.setState({
                dataIdx: 0,
                reviewInfo: data
            })
        } else {
            this.setAPIcall(data, this.pageNo, this.pageCnt).then(result => {
                const pageName = _.find(this.reviews, (a) => {
                    return a.site_cd === result.menus.sites.site_cd && a.type === data.type;
                });
                const pageIdx = _.indexOf(this.pageList, pageName.site_nm);
                this.setState({
                    dataIdx: pageIdx,
                    reviewInfo: result
                })
            });
        }
    }

    componentDidMount() {
        
    }

    setAPIcall = (param, pageNo, pageCnt) => {
        let paramData = {
            sris_id: param.sris_id,
            site_cd: param.site_cd,
            page_no: pageNo,
            page_cnt: pageCnt,
            type: param.type
        }
        return synopAPI.xpg008(paramData).then(result => {
            if (_.isEmpty(result)) {
                this.props.callback(this);
            } else {
                return result;
            }
        });
    }

    onKeyDown(e) {
        const { data } = this.props;
        if (e.keyCode === LEFT || e.keyCode === RIGHT) {
            this.pageNo = 1;
            this.pageCnt = 5;
            let idx = 0;
            if (e.keyCode === LEFT) {
                idx --;
            } else {
                idx ++;
            }
            const dataIdx = this.state.dataIdx + idx;
            if (dataIdx > -1 && dataIdx < this.reviews.length ) {
                const dataInfo = this.reviews[this.state.dataIdx + idx];
                const param = {
                    sris_id: data.sris_id,
                    site_cd: dataInfo.site_cd
                }
                if (dataInfo.site_cd === 'btv') {
                    this.setState({
                        scrollTop: 0,
                        dataIdx: 0,
                        reviewInfo: data
                    })
                } else {
                    this.setAPIcall(param, this.pageNo, this.pageCnt).then(result => {
                    
                        this.setState({
                            scrollTop: 0,
                            dataIdx: this.state.dataIdx + idx,
                            reviewInfo: result
                        }, () => {
                            if (dataInfo.type === 'review') {
                                this.reviewList.children[0].scrollTop = 0;
                            }
                        })
                    });
                }
            }
        } else if ((e.keyCode === UP || e.keyCode === DOWN) && this.ynScroll) {
            const { reviewInfo } = this.state;
            // 리뷰 page처리
            if (this.reviews[this.state.dataIdx].type === 'review') {
                if (e.keyCode === DOWN) {
                    const param = {
                        sris_id: data.sris_id,
                        site_cd: this.reviews[this.state.dataIdx].site_cd
                    }
                    this.pageNo += 5;
                    if (this.pageNo < reviewInfo.menus.sites.review_cnt) {
                        this.setAPIcall(param, this.pageNo, this.pageCnt).then(result => {
                            let reviews = reviewInfo.menus.sites.reviews.concat(result.menus.sites.reviews);
                            result.menus.sites.reviews = reviews;
                            this.setState({
                                dataIdx: this.state.dataIdx,
                                reviewInfo: result
                            },() => {
                                this.setScrollMove(e.keyCode);
                            })
                        });
                    } else {
                        this.setScrollMove(e.keyCode);
                    }
                } else {
                    this.setScrollMove(e.keyCode);
                }
            } else {
                return;
            }
        } else if (e.keyCode === PC_BACK_SPACE || e.keyCode === BACK_SPACE) {
            this.props.callback(this.pageList[this.state.dataIdx]);
            return true;
        }
    }

    setScrollMove = (direction) => {
        const { scrollTop } = this.state;
        const innerContentInfo = this.reviewList.children[0];
        const innerScrollBarBox = this.reviewList.children[1].children[0];
        const reviewWrap = innerContentInfo.children[2];
        const contentHeight = innerContentInfo.clientHeight;
        const bgContentHeight = reviewWrap.clientHeight + innerContentInfo.children[0].clientHeight + innerContentInfo.children[1].clientHeight;
        const barBgHeight = innerScrollBarBox.children[1].clientHeight;
        const barHeight = innerScrollBarBox.children[0].clientHeight;

        let diff = 0;
        if (direction === UP) diff = -80;
        else if (direction === DOWN) diff = +80;

        let scrollCount = (bgContentHeight - contentHeight) / diff;
        let scrollHeight = (barBgHeight - barHeight) / scrollCount;
        let someFlag = false;
        let arrSome = 0;
        
        if (direction === DOWN && innerContentInfo.scrollTop + diff >= 0) {
            // console.log('같냐', this.scrollHeight, scrollHeight);
            if (this.scrollHeight !== scrollHeight) {
                this.scrollHeightArr.push(scrollHeight);
            } else {
                someFlag = true;
            }
            this.scrollHeight = scrollHeight;
            if (someFlag && this.scrollHeightArr.length !== 0) {
                arrSome = this.scrollHeightArr.reduce((pre, crr) => {
                    return pre+crr;
                })
            }
        }
        

        let scrollY = scrollTop + scrollHeight;
        if ((barBgHeight - barHeight) > scrollY) {
            scrollY = scrollY < 0 ? 0 : scrollY;
        } else {
            scrollY = (barBgHeight - barHeight);
        }
        if (innerContentInfo.scrollTop + diff <= 0) {
            scrollY = 0;
            someFlag = false;
            this.scrollHeightArr = [];
        }
        
        if (someFlag && direction === DOWN) {
            this.tempScroll = arrSome / scrollY;
            scrollY = scrollY - this.tempScroll;
            if (this.innerContentTop === innerContentInfo.scrollTop+diff) {
                scrollY = 540;
            }
            this.innerContentTop = innerContentInfo.scrollTop+diff;
        }
        this.setState({
            scrollTop: scrollY
        },() => {
            innerContentInfo.scrollTop += diff;
        });
    }


    render() {
        const { reviewInfo, scrollTop, ynScroll } = this.state;
        const { data } = this.props;
        let slideIndex = this.state.slideIndex;
        const bgImg = `${_.isEmpty(data.bg_img_path) ? appConfig.headEnd.LOCAL_URL+'/synopsis/bg-synopsis-default.png': Utils.getImageUrl(Utils.IMAGE_SIZE_HERO_BLUR) + data.bg_img_path}`;
        let style = {
            backgroundImage: "url(" + bgImg + ")",
            width: '1920px',
            top: '0'
        };

        this.pageList = [];
        for (let item of this.reviews) {
            let name = '';
            let type = '';
            switch(item.site_cd) {
                case 'btv': name = 'Btv'; break;
                case '10': name = 'CINE21';break;
                case '20': name = '왓챠';break;
                default:break;
            }
            switch(item.type) {
                case 'btv': type = '고객호감도'; break;
                case 'grade': type = '평점'; break;
                case 'review': type = '리뷰'; break;
                default:break;
            }
            this.pageList.push(name+type);
        }
        
        let prevPageName, nextPageName = null;
        let pageIdx = 0;
        if (!_.isEmpty(reviewInfo)) {
            const pageName = this.reviews[this.state.dataIdx];
            pageIdx = _.indexOf(this.pageList, pageName.site_nm);
            prevPageName = this.pageList[pageIdx-1];
            nextPageName = this.pageList[pageIdx+1];
        }

        let Component = null;
        switch(this.pageList[pageIdx]) {
            case 'Btv고객호감도':
                Component = SynopReviewAffinity;
                break;
            case 'CINE21평점': case '왓챠평점':
                Component = SynopReviewGrade;
                break;
            case 'CINE21리뷰': case '왓챠리뷰':
                Component = SynopReviewList;
                break;
            default: Component = SynopReviewAffinity; break;
        }
        let darkClass = _.isEmpty(data.bg_img_path) ? " default" : "";
        darkClass += data.dark_img_yn === 'N' ? "" : " dark";

        return (
            // 6/12 popBgBlur class 추가
            <div className={`contentDetail popContents${darkClass} popBgBlur`} style={style} id="synopReviewDetail">
                <div className="slideWrap" style={{'--page':this.state.slideIndex}}>
                    <div>
                        {
                            !_.isEmpty(reviewInfo) &&
                            <Component
                                reviewInfo={reviewInfo}
                                prevPageName={prevPageName}
                                nextPageName={nextPageName}
                                innerRef={r=>this.reviewList=r}
                                scrollTop={scrollTop}
                                ynScroll={r=>this.ynScroll=r}
                            />
                        }
                    </div>
                </div>
                {/*<div className="btnBeforeArea" tabIndex="0">*/}
                    {/*<span className="btnBefore"><span className="iconCloseDark"></span>닫기</span>*/}
                {/*</div>*/}
                
				<div className="keyWrap">
					<span className="btnKeyPrev csFocus">닫기</span>
				</div>
                
            </div>
        )
    }    
}

class SynopReviewAffinity extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {
        const { reviewInfo: {btv_pnt_info}, nextPageName } = this.props;
        return (
            <div className="innerContents csFocusPop">
                <div className="detailTitleArea">
                    <p className="detailTitle">
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/feeling-btv-logo.png`} className="dark" alt="" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}/synopsis/feeling-btv-logo-light.png`} className="light" alt="" />
                        고객 호감도
                    </p>
                    <p className="allParticipant">총 평가 <NumberFormat value={btv_pnt_info.btv_pnt} />명</p>
                </div>
                <ul className="goodFeelingBox">
                    <li>
                        <div className="appraisal">
                            <span className="imgBox">
                                <span className="like"></span>
                            </span>
                            <p className="likeState">좋아요</p>
                            <p className="percent"><span className="num">{_.isEmpty(btv_pnt_info.btv_like_rate)?0:btv_pnt_info.btv_like_rate}</span>%</p>
                            <p className="user"><span className="num"><NumberFormat value={btv_pnt_info.btv_like_ncnt} /></span>명</p>
                        </div>
                    </li>
                    <li>
                        <div className="appraisal">
                            <span className="imgBox">
                                <span className="dislike"></span>
                            </span>
                            <p className="likeState">별로예요</p>
                            <p className="percent"><span className="num">{_.isEmpty(btv_pnt_info.btv_ngood_rate)?0:btv_pnt_info.btv_ngood_rate}</span>%</p>
                            <p className="user"><span className="num"><NumberFormat value={btv_pnt_info.btv_ngood_ncnt} /></span>명</p>
                        </div>
                    </li>
                </ul>
                
                { !_.isEmpty(nextPageName) && <span className="rightContent">{nextPageName}</span>}
            </div>
        )
    }
}


class SynopReviewGrade extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    starWidth(bas_pnt, pnt){
        let starWidths = pnt * 10;
        if (bas_pnt !== 10) {
            starWidths = starWidths * 2;
        }
        return 'calc('+ starWidths +'%)';
    }

    render() {
        const { menus } = this.props.reviewInfo;
        const maxRate = _.maxBy(menus.sites.dist_info, (a) => a.dist_rate);
        let heightVal = maxRate ? 100 : 1;

        let gradeGraph = [];
        menus.sites.dist_info.map((item, i) => {
            const heightPercent = Math.floor(100 / maxRate.dist_rate);
            const height = item.dist_rate === maxRate.dist_rate ? 100 : heightPercent * item.dist_rate;
            const graphStyle = {height:height + '%', opacity: '0.35'};

            gradeGraph.push(<li key={i}>
                <span className="gradeGraph" style={graphStyle}></span>
                {
                    (item.dist_rate === maxRate.dist_rate) &&
                    <span className="perNum"><span className="num">{item.dist_rate}</span>%</span>
                }
            </li>
            )
        })

        let titleDark, titleLight = null;
        switch (menus.sites.site_cd) {
            case '10':
                titleDark = '/synopsis/detail-grade-logo-01.png';
                titleLight = '/synopsis/detail-grade-logo-01-light.png';
            break;
            case '20':
                titleDark = '/synopsis/detail-grade-logo-02.png';
                titleLight = '/synopsis/detail-grade-logo-02-light.png';
            break;
        }
        return (
            <div className="innerContents csFocusPop">
                <div className="detailTitleArea">
                    <p className="detailTitle">
                        <img src={`${appConfig.headEnd.LOCAL_URL}${titleDark}`} alt="" className="dark" />
                        <img src={`${appConfig.headEnd.LOCAL_URL}${titleLight}`} alt="" className="light" />
                    </p>
                    <div className="gradeGrade">
                        <span className="gradeText">
                            <span className="num">{menus.sites.avg_pnt}</span> / {menus.sites.bas_pnt}
                        </span>
                        <span className="starGradeWrap">
                            <span className="starGrade">
                                <span className="starImg" style={{'width':this.starWidth(menus.sites.bas_pnt, menus.sites.avg_pnt)}}></span>
                            </span>
                        </span>
                        <span className="participantText"><span className="num"><NumberFormat value={menus.sites.review_cnt }/></span>명의 네티즌 평균평점</span>
                    </div>
                </div>
                <div className="detailGradeGraph">
                    <span className="gradeGraphWrap">
                        <ul>
                            {gradeGraph}
                        </ul>
                    </span>
                    <span className="gradeNumWrap">
                        <ul>
                            {
                                menus.sites.dist_info.map((item, i) => 
                                    <li key={i}><span className="num">{i+1}점</span></li>
                                )
                            }
                        </ul>
                    </span>
                </div>

                { !_.isEmpty(this.props.prevPageName) && <span className="leftContent">{this.props.prevPageName}</span>}
                { !_.isEmpty(this.props.nextPageName) && <span className="rightContent">{this.props.nextPageName}</span>}
            </div>
        )
    }
}

class SynopReviewList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ynScroll: true
        }
    }

    componentDidMount() {
        const { innerRef, ynScroll } = this.props;
        if (typeof innerRef === 'function') {
            innerRef(this.reviewList);
        }
        const innerContentInfo = this.reviewList.children[0];
        const contentHeight = innerContentInfo.clientHeight;
        const bgContentHeight = innerContentInfo.children[2].clientHeight + innerContentInfo.children[0].clientHeight + innerContentInfo.children[1].clientHeight;
        if (bgContentHeight < contentHeight) { // 스크롤바 없애기
            if (typeof ynScroll === 'function') {
                ynScroll(false);
            }
            this.setState({
                ynScroll: false
            });
        }
    }

    starWidth(bas_pnt, pnt){		
        let starWidths = pnt * 10;
        if (bas_pnt !== 10) {
            starWidths = starWidths * 2;
        }
        return 'calc('+ starWidths +'%)';
	}

    render() {
        const { menus } = this.props.reviewInfo;
        const scrollbarStyle = {minHeight: '60px', top: `${this.props.scrollTop}px`};

        let titleDark, titleLight = null;
        switch (menus.sites.site_cd) {
            case '10':
                titleDark = '/synopsis/detail-grade-logo-01.png';
                titleLight = '/synopsis/detail-grade-logo-01-light.png';
            break;
            case '20':
                titleDark = '/synopsis/detail-grade-logo-02.png';
                titleLight = '/synopsis/detail-grade-logo-02-light.png';
            break;
        }
        
        return (
            <div className="innerContents reviewCon csFocusPop">
                <div className="popConWrap" ref={r => this.reviewList = r}>
                    <div className="reviewContentsWrap innerContentInfo">
                        <p className="reviewTitle">
                            <img src={`${appConfig.headEnd.LOCAL_URL}${titleDark}`} alt="" className="dark" />
                            <img src={`${appConfig.headEnd.LOCAL_URL}${titleLight}`} alt="" className="light" />
                            리뷰
                        </p>
                        <p className="reviewSubTitle"></p>
                        <div className="reviewWrap">
                        {
                            menus.sites.reviews.map((item, i) => 
                                <div className="contentText" key={i}>
                                    <span className="textIndex">{item.prs_nm}</span>
                                    <span className="bar"></span>
                                    <span className="reviewGrade">
                                        <span className="starGradeWrap">
                                            <span className="starGrade">
                                                <span className="starImg" style={{'width':this.starWidth(menus.sites.bas_pnt, item.pnt)}}></span>
                                            </span>
                                        </span>
                                        <span className="num">{item.pnt}</span> / {menus.sites.bas_pnt}
                                    </span>
                                    <div className="text">{item.review_ctsc}</div>
                                </div>
                            )
                        }
                        </div>
                    </div>
                    {
                        this.state.ynScroll &&
                        <span className="scrollBarBox">
                            <div className="innerScrollBarBox">
                                <span className="scrollBar" style={scrollbarStyle}></span>
                                <span className="scrollBarBG"></span>
                            </div>
                        </span>
                    }
                </div>
                
                { !_.isEmpty(this.props.prevPageName) && <span className="leftContent">{this.props.prevPageName}</span>}
                { !_.isEmpty(this.props.nextPageName) && <span className="rightContent">{this.props.nextPageName}</span>}
            </div>
        )
    }
}

export default SynopReviewDetail;