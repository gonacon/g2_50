import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';

import 'Css/myBtv/my/ListClientService.css';
import FM from 'Supporters/navi';
import constants from 'Config/constants';
import { Core } from 'Supporters';
import appConfig from './../../../config/app-config';

const { MYBTV_PURCHASE_LIST, MYBTV_NOTICE_LIST, MYBTV_USE_GUIDE_LIST } = constants;

const callUrlMap = {
  [constants.CALL_URL.PURCHASE_LIST]: {
    route: MYBTV_PURCHASE_LIST,
    imageS: appConfig.headEnd.LOCAL_URL + "/myBtv/block-purchaselist-nor.png",
    imageB: appConfig.headEnd.LOCAL_URL + "/myBtv/block-purchaselist-foc.png"
  },
  [constants.CALL_URL.NOTICE_EVENT]: {
    route: MYBTV_NOTICE_LIST,
    imageS: appConfig.headEnd.LOCAL_URL + "/myBtv/block-notice-event-nor.png",
    imageB: appConfig.headEnd.LOCAL_URL + "/myBtv/block-notice-event-foc.png",
  },
  [constants.CALL_URL.USE_GUIDE]: {
    route: MYBTV_USE_GUIDE_LIST,
    imageS: appConfig.headEnd.LOCAL_URL + "/myBtv/block-userguide-nor.png",
    imageB: appConfig.headEnd.LOCAL_URL + "/myBtv/block-userguide-foc.png",
  }
};

class CSMenuItem extends Component {
  constructor(props){
    super(props);

    this.state = {
      focused: false
    }
  }

  static defaultProps = {
    imageS: '',
    imageB: '',
    title: '',
    isNew: false
  }

  onFocused = () => {
    this.setState({focused: true});
    const { onFocusChanged, idx } = this.props;
    onFocusChanged(idx);
  }

  onBlured = () => {
    this.setState({focused: false, bTitleUp: false});
  }

  onSelect = () => {
    const { onSelect, idx } = this.props;
    onSelect(idx);
  }

  render() {
    const { imageS, imageB, isNew } = this.props;
    const { focused } = this.state;
    const focusClass = `csFocus inner${focused?' focusOn':''}`;
    return(
      <div className="list">
        <div className={focusClass}>
          <img src={imageS} alt=""/>
          <img src={imageB} alt=""/>
        </div>
        {(isNew && <span className="new">N</span>)}
      </div>
    );
  }
}

class CSMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bTitleUp: false,
      focused: false,
      newInfo: [false, false, false, false, false],
    };

    this.anchor = null;
  }

  static defaultProps = {
  }

  onFocused = () => {
    this.setState({focused: true});
    const { scrollTo } = this.props;
		if (scrollTo && typeof scrollTo === 'function' ) {
			scrollTo(this.anchor);
		}
  }

  onBlured = () => {
    this.setState({focused: false, bTitleUp: false});
  }

  onSelectMenu = (idx) => {
    const { callUrl, menuId } = this.props.list[idx];

    Core.inst().move(callUrlMap[callUrl].route, { callUrl, menuId });
  }

  onFocusChanged = (idx) => {
    this.setState({bTitleUp: (idx === 0)});
  }

  onFocusKeyDown = (event, idx) => {
    if (event.keyCode === 13) {
      this.onSelectMenu(idx);
    }
  }

  initFm = (props) => {
    const { setFm } = props;
    const fm = new FM({
      type: 'BLOCK',
      id : 'csMenu',
      moveSelector : '.listWrapper .list',
      focusSelector : '.csFocus',
      row : 1,
      col : props.list.length,
      maxItem: 5,
      page: 0,
      focusIdx : 0,
      startIdx : 0,
      lastIdx : props.list.length -1,
      bRowRolling: false,
      onFocusContainer: this.onFocused,
      onBlurContainer: this.onBlured,
      onFocusChild: this.onFocusChanged,
      onFocusKeyDown: this.onFocusKeyDown
    });
    this.fm = fm;
    setFm('csMenu', fm);
  }

  componentDidMount() {
    const { list } = this.props;
    if (list && list.length !== 0) {
      this.initFm(this.props);
    } else {
      const { setFm } = this.props;
      setFm('csMenu', null);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { list } = nextProps;
    const { prevList } = this.props;
    if (list && list.length !== 0) {
      if (isEmpty(prevList)) {
        this.initFm(nextProps);
      } else {
        this.fm.setListInfo({
          col: list.length,
          lastIdx: list.length - 1
        })
      }
      
    } else {
      const { setFm } = this.props;
      setFm('csMenu', null);
    }
  }

  render(){
    if (this.props.list && this.props.list.length === 0) {
      return null;
    }
    const { newInfo, bTitleUp } = this.state;
    const menus = this.props.list && this.props.list.map((item, idx) => {
      const isNew = newInfo[idx];

      return (
        <CSMenuItem 
          title={item.name}
          menuId={item.menuId}
          imageS={callUrlMap[item.callUrl].imageS} 
          imageB={callUrlMap[item.callUrl].imageB}
          isNew={isNew}
          idx={idx} 
          key={idx} 
          onFocusChanged={this.onFocusChanged}
        />
      );
    });

    return (
      <div id="csMenu" className={`contentGroup${bTitleUp?' activeSlide':''}`} ref={r=>this.anchor=r}>
        <div className="listClientService">
          <div className="title">{this.props.title}</div>
          <div className="listWrapper">
            {menus}
          </div>
        </div>
      </div>
    );
  }
}

export default CSMenu;
