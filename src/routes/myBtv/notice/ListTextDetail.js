import { React } from "../../../utils/common";

import FM from 'Supporters/navi';
import PageView from 'Supporters/PageView';
import keyCodes from 'Supporters/keyCodes';
import { PNS } from 'Supporters/network';
import { CALL_URL } from 'Config/constants';

import 'Css/myBtv/notice/ListTextDetail.css';
import appConfig from "Config/app-config";

const { Keymap: { UP, DOWN } } = keyCodes;
const TEXT_SCROLL_STEP = 100;

class ListTextDetail extends PageView {
  constructor(props) {
    super(props);

    //console.log('ListTextDetail this.paramData:', this.paramData);
    this.state = {
      title: '',
      desc: '',
      scrollBarHeight: 0
    }

    this.prevScrollTop = 0;

    const focusList = [
      { key: 'textContent', fm: null, link: null }
    ];

    this.declareFocusList(focusList);
  }

  componentDidMount() {
    this.loadDetail(this.paramData.id, this.paramData.callUrl);
  };

  setScrollBar = () => {
    let scrollBarHeight = 0;

    this.props.showMenu(false);
    this.textBox = document.querySelector('.innerContentInfo');
    this.scrollBar = document.querySelector('.scrollBar');
    this.scrollBarBG = document.querySelector('.scrollBarBG');
    this.scrollBarBGHeight = parseInt(window.getComputedStyle(this.scrollBarBG).height, 10);
    this.textContentHeight = parseInt(window.getComputedStyle(document.querySelector('.contentInfo')).height, 10);
    //this.scrollBarBGHeight = document.querySelector('.scrollBarBG').offsetHeight;
    //this.textContentHeight = document.querySelector('.contentInfo').offsetHeight;
    //this.barScrollStep = TEXT_SCROLL_STEP * this.scrollBarBGHeight / this.textContentHeight;
    if (this.scrollBarBGHeight < this.textContentHeight) {
      //this.noScroll = false;
      scrollBarHeight = this.scrollBarBGHeight * this.scrollBarBGHeight / this.textContentHeight;
    } else {
      //this.noScroll = true;
      this.scrollBar.classList.add('noScrollBar');
      this.scrollBar.classList.remove('scrollBar');
      this.scrollBarBG.classList.add('noScrollBarBG');
      this.scrollBarBG.classList.remove('scrollBarBG');
    }

    //console.log('this.scrollBarBGHeight:', this.scrollBarBGHeight);
    //console.log('this.textContentHeight:', this.textContentHeight);
    //console.log('scrollBarHeight:', scrollBarHeight);
    //console.log('noScroll:', this.noScroll, this.scrollBarBGHeight, this.textContentHeight);
    this.setState({
      scrollBarHeight: scrollBarHeight
    });

    //console.log('this.scrollBarBGHeight:', this.scrollBarBGHeight);
    //console.log('this.textContentHeigth:', this.textContentHeight);
    //console.log('this.scrollBarHeight:', this.state.scrollBarHeight);

    this.setFm('textContent', new FM({
      id : 'textContent',
      type: 'FAKE', // onFocus 이벤트와 onFocusKeyDown 이벤트만 받음.
      onFocusKeyDown: this.onKeyDown,
      onFocusContainer: this.onFocus
    }))

    this.setFocus('textContent');
  }

  loadDetail = async (id, callUrl) => {
    //console.log('Request 502 detail:', id);
    /*
    let result = await PNS.request502(id);

    // TODO: 예외 처리
    //console.log('Response 502 detail:', id, result);
    this.setState({
      title: result && result.customer_notice && result.customer_notice.title,
      desc: result && result.customer_notice && result.customer_notice.desc
    });
    */
    let result;

    // TODO: 예외 처리
    switch (callUrl) {
      case CALL_URL.NOTICE:
        result = await PNS.request502(id);
        this.setState({
          title: result && result.customer_notice && result.customer_notice.title,
          desc: result && result.customer_notice && result.customer_notice.desc
        });

        break;
      case CALL_URL.EVENT:
        result = await PNS.request504(id);
        this.setState({
          title: result && result.event_info && result.event_info.title,
          desc: result && result.event_info && result.event_info.desc
        });

        break;
      case CALL_URL.USE_GUIDE:
        console.warn('Not supported yet');
        return result;
      default:
        console.log('Not supported call_url', callUrl);
        return result;
    }

    this.setScrollBar();

    return result;
  }

  calculateScrollBarTop = scrollTopDiff => {
    let top = parseFloat(window.getComputedStyle(this.scrollBar).top);
    const barScrollStep = scrollTopDiff * (this.scrollBarBGHeight - this.state.scrollBarHeight) / (this.textContentHeight - this.scrollBarBGHeight);

    //console.log('prev scroll bar top:', top);
    top += barScrollStep;

    //console.log('barScrollStep', barScrollStep);
    //console.log('next scroll bar top:', top);
    return top + 'px';
  }

  onScroll = () => {
    //console.log('onScroll:', event.detail, event.view, event);
    if (appConfig.runDevice) {
      this.scrollBar.style.top = this.calculateScrollBarTop(this.textBox.scrollTop - this.prevScrollTop);
      //console.log('prevScrollTop:', this.prevScrollTop);
      //console.log('this.textBox.scrollTop:', this.textBox.scrollTop);
      //console.log('this.scrollBar.style.top:', this.scrollBar.style.top);
      this.prevScrollTop = this.textBox.scrollTop;
    }
  }

  onKeyDown = (event) => {
    //console.log('onKeyDown:', event);

    if (!appConfig.runDevice) {
      this.prevScrollTop = this.textBox.scrollTop;

      switch (event.keyCode) {
        case UP:
          this.textBox.scrollTop -= TEXT_SCROLL_STEP;
          break;
        case DOWN:
          this.textBox.scrollTop += TEXT_SCROLL_STEP;
          break;
        default:
          break;
      }

      this.scrollBar.style.top = this.calculateScrollBarTop(this.textBox.scrollTop - this.prevScrollTop);
      //console.log('prevScrollTop:', this.prevScrollTop);
      //console.log('this.textBox.scrollTop:', this.textBox.scrollTop);
      //console.log('this.scrollBar.style.top:', this.scrollBar.style.top);
      this.prevScrollTop = this.textBox.scrollTop;
    }
  }

  onFocus = () => {}

  render() {
    //console.log('render() notice detail');

    let desc = this.state.desc && this.state.desc.split('\n').map((line, index) => {
      return (<div key={index}>{line}</div>)
    });

    return(
      <div className="contentPop listTextDetail">
        <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
        <div className="innerContentPop">
          <div className="detailTitleWrap">
            <p className="detailTitle">
            <span>{this.state.title}</span>
            </p>
          </div>
          <div className="popupScrollWrap">
            <div className="contScrollWrap">
              <div className="innerContentInfo csFocus loadFocus" tabIndex="-1" onScroll={this.onScroll}>
                <div className="contentInfo">
                  <div className="contentText">
                    <div>
                      <div className="text">{desc}</div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="scrollBarBox">
                <div className="innerScrollBarBox">
                  <span className="scrollBar" style={{ height: this.state.scrollBarHeight + 'px' }}></span>
                  <span className="scrollBarBG"></span>
                </div>
              </span>
            </div>
          </div>
        </div>
        <div className="keyWrap"><span className="btnKeyPrev">닫기</span></div>
      </div>
    )
  }
}

export default ListTextDetail;
