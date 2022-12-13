import {React, fnScrolling} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/notice/NoticeList.css';
import NoticeBoxListData from '../../../assets/json/routes/myBtv/notice/NoticeBoxListData.json';
import NoticeBoxListDataNone from '../../../assets/json/routes/myBtv/notice/NoticeBoxListDataNone.json';
import appConfig from 'Config/app-config';

class NoticeBoxList extends React.Component {
    constructor(props) {
        super(props);

        let ListData;
        if( this.props.data !== "none" ){
            ListData = NoticeBoxListData;
        } else {
            ListData = NoticeBoxListDataNone;
        }

        this.state = {
            contentSlides: ListData
        }

    }

    keyScroll(_this, i, event){
        event.preventDefault();
        if(event.keyCode === 40 && event.target.classList.contains('down')){
            event.stopPropagation();
            document.querySelector('.listScrollWrap').scrollTop = event.target.closest('li').offsetHeight * (_this + 1);
            document.querySelectorAll('.listScrollWrap li')[_this+1].querySelector('.csFocus').focus();
        }else if(event.keyCode === 38 && event.target.classList.contains('up')){
            event.stopPropagation();
            document.querySelector('.listScrollWrap').scrollTop = event.target.closest('li').offsetHeight * (_this - 9);
            document.querySelectorAll('.listScrollWrap li')[_this-1].querySelector('.csFocus').focus();
        }
    }

    render() {
        return(
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
                <div className="noticeListWrap">
                    <div className="contsArea">
                        <div className="menuArea">
                            <p className="pageTitle">공지/알림/이벤트</p>
                            <ul>
                                <li>
                                    <div className="csFocus">공지사항</div>
                                </li>
                                <li>
                                    <div className="csFocus loadFocus sel">알림 보관함 <span className="new">N</span></div>
                                </li>
                                <li>
                                    <div className="csFocus">진행중인 이벤트</div>
                                </li>
                            </ul>
                        </div>
						{ this.state.contentSlides.noticeListData.length === 0 ?
                            <div className="listArea none">
                                <span className="noticeNone">고객님께서 받으신 알림이 없습니다.</span>
                            </div>
							:
                            <div className="listArea">
                                <div className="listScrollWrap">
                                    <ul className="textList">
										{this.state.contentSlides.noticeListData.map((data,i) => {
											return(
                                                <NoticeBoxListItem
                                                    num={data.num}
                                                    title={data.title}
                                                    date={data.date}
                                                    new={data.new}
                                                    keyScroll={this.keyScroll.bind(this)}
                                                    index={i}
                                                    key={i}
                                                />
											)
										})}
                                    </ul>
                                </div>
                            </div>
						}
                    </div>
                </div>
            </div>
        )
    }

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		fnScrolling();
	}

}

class NoticeBoxListItem extends React.Component {
    keyScroll(_this, i, event){
        this.props.keyScroll(_this, i, event);
    }

    render() {
        return (
            <li className={this.props.new === true ? "new" : ""}>
                <div className={((this.props.index + 1) % 9) === 0 ? "csFocus down" : ((this.props.index) % 9) === 0 && this.props.index !== 0 ? "csFocus up" : "csFocus"} onKeyDown={this.keyScroll.bind(this, this.props.index, this.event)}>
                    <span className="listItemWrap">
                        <span className="num"><span className="txt">{this.props.num}</span></span>
                        {this.props.new === true ?
                            <span className="title">
                                <span className="txt">{this.props.title}</span>
                                <span className="new">N</span>
                            </span>
                            :
                            <span className="title">
                                <span className="txt">{this.props.title}</span>
                            </span>
                        }
                        <span className="date"><span className="txt">{this.props.date}</span></span>
                    </span>
                </div>
            </li>
        )
    }
}


export default NoticeBoxList;

