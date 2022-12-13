import React from 'react'
import Core from './../supporters/core';

export default class PopupContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      component: null,
      path: '',
      param: {},
    };
    this.popupList = [];
    this.callBack = null;
    //this.showPopup = this.showPopup.bind(this);
    Core.inst().setPopupContainer(this);
  }

  showPopup = (component, param = {}, callBack) => {
    const path = param.className + this.makeid();
    this.popupList.push({ component, param, callBack, path, historyData: null });
    this.callBack = callBack;
    //console.log('====================================');
    //console.log('classname=%s this.popupList.length=%s', param.className, this.popupList.length);
    //console.log('====================================');
    this.setState({ display: true, component, param, path });
  }

  callbackFn = (obj) => {
    const prevCpt = this.popupList.pop();
    const cpt = this.popupList[this.popupList.length - 1];

    if (this.hasPopup()) {
      // if (this.callBack) {
      if (prevCpt.callBack) {
        // this.callBack(obj);
        this.callBack = cpt && cpt.callBack;
        prevCpt.callBack(obj);
      }

      if (cpt) {
        this.callBack = cpt && cpt.callBack;
        this.setState({ display: true, component: cpt.component, param: cpt.param, path: cpt.path });
      } else {
        this.setState({ display: true, component: null, param: null, path: null });
      }
      //const path = cpt.param.className + this.makeid();
    } else {
      this.setState({ display: false, component: null });
      if (this.callBack) {
        this.callBack(obj);
      }
    }
  }

  cancelPopup = () => {
    this.popupList = [];
    this.callBack = null;
    this.setState({ display: false, component: null });
  }

  setHistory = (path, historyData) => {
    if (this.popupList.length > 0) {
      for (let index = 0; index < this.popupList.length; index++) {
        const cmt = this.popupList[index];
        if (cmt.path === path) {
          this.popupList[index].historyData = historyData;
        }
      }
    }
    // console.log('====================================');
    // console.log('setHistory %s', path, historyData);
    // console.log(this.popupList);
    // console.log('====================================');
  }

  hasPopup = () => {
    //console.log('hasPopup length=%s', this.popupList.length);

    return this.popupList.length > 0 ? true : false;
  }

  makeid() {
    var text = '_' + new Date().getTime();
    return text;
  }

  renderPopups() {
    const popups = this.popupList.map((item, index) => {
      const style = { position: 'absolute', zIndex: '' + (500 + index) }
      const historyData = this.popupList[index].historyData;
      const fakeLocation = {
        pathname: this.popupList[index].path,
        historyData
      };
      const popup = React.cloneElement(this.popupList[index].component, {
        callback: this.callbackFn,
        data: this.popupList[index].param,
        location: fakeLocation,
        setHistory: this.setHistory
      });

      return (
        <div className='popupContainer' style={style} key={index}>{popup}</div>
      );
    });

    return popups;
  }

  render() {
    return (
      <div>
        {this.renderPopups()}
      </div>
    );
  }
}