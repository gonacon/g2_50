// common
import React, { Fragment } from 'react';
import constants from '../../config/constants';
import keyCode from 'Supporters/keyCodes';
// import Core from '../../supporters/core';
import FM from 'Supporters/navi';
import { SlideType, G2NaviSlider, G2NaviSlideMyVOD } from 'Module/G2Slider';
import { CTSInfo } from '../../supporters/CTSInfo';

// utils
import _ from 'lodash';
import Utils from '../../utils/utils';
import synopAPI from './api/synopAPI';

// css
import '../../assets/css/routes/synopsis/SynopGateWay.css';

// component
import PageView from '../../supporters/PageView.js';
import NumberFomat from 'Module/UI/NumberFormat';
import Core from './../../supporters/core';
import IMG from 'react-image';
import appConfig from 'Config/app-config';

class SynopGateWay extends PageView {
    constructor(props) {
        super(props);

        this.state = _.isEmpty(this.historyData) ? {
            gateWayInfo: {
                bg_img_path: '',
                sale_prc_vat: 0,
                prd_prc_vat: 0,
                contents: [],
                adult_flag: !_.isEmpty(this.paramData.adult_flag) ? this.paramData.adult_flag : '0'
            },
            payState : null
        } : this.historyData

        this.focusList = [
            {key: 'titleArea', fm: null},
            {key: 'slides', fm: null}
        ]
        this.declareFocusList(this.focusList);
    }

    componentWillMount() {
        
    }

    componentDidMount() {
        const { showMenu } = this.props;
        if (showMenu && typeof showMenu === 'function') {
            showMenu(false);
        }
        let paramData = this.paramData;
        let payState = null;
        this.setDefaultFm();
        if (this.historyData) {
            payState = this.historyData.payState;
            if (payState === 'Y') {
                this.setFm('titleArea', null);
            }
            this.declareFocusList(this.focusList);
            this.setFocus(0);
        } else {
            synopAPI.xpg014(paramData).then(xpgInfo => {
                if (!_.isEmpty(xpgInfo) && xpgInfo.result === '0000') {
                    const metvParam = {
                        prd_prc_id: xpgInfo.package.prd_prc_id
                    }
                    this.state.xpgInfo = xpgInfo;
                    synopAPI.metv062(metvParam).then(metvInfo => {
                        if (!_.isEmpty(metvInfo) && metvInfo.result === '0000') {
                            payState = metvInfo.resp_directList[0].resp_direct_result;
                            if (payState === 'Y') {
                                this.setFm('titleArea', null);
                            }
                            this.declareFocusList(this.focusList);
                            this.setState({
                                gateWayInfo: xpgInfo.package,
                                payState: payState
                            },() => {
                                this.setFocus(0);
                            });
                        } else {
                            Core.inst().showToast(metvInfo.result, metvInfo.reason);
                        }
                    })
                } else {
                    Core.inst().showToast(xpgInfo.result, xpgInfo.reason);
                }
            })
        }
    }

    setDefaultFm = () => {
        const option = {
            id: 'titleArea',
            moveSelector: '',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onButton
        }
        this.setFm('titleArea', new FM(option));
    }

    cbPurchase = (result) => {
        console.log('Have to reload this page', result);
        if (result.result === '0000') {
            this.setState({
                payState: 'Y'
            },() => {
                this.setFm('titleArea', null);
                this.setFocus({id: 'slides', childIdx:0});
            })
        }
    }

    onButton = (e) => {
        if (e.keyCode === keyCode.Keymap.ENTER) {
            const { xpgInfo, adult_flag } = this.state;
            const param = {
                //???????????? ID(xpg??? epsd_id)
                //(?????? ????????? ?????? ??????, ????????? ??????, ?????? ????????? ?????? ??????, ????????? ????????? ?????? ???????????? 
                //????????? ???????????? ID, ?????? ?????? ??????????????? noEpsdId ???????????? ?????????.)
                epsd_id: 'noEpsdId',
                sris_id: xpgInfo.package.sris_id,    //????????? ID(???????????? ????????? ????????? ID, xpg??? sris_id)
                prd_prc_id: xpgInfo.package.prd_prc_id, //?????? ?????? ID(?????? ?????? ?????? , ????????? ?????????. Xpg??? prd_prc_id)
                prd_prc_vat: xpgInfo.package.prd_prc_vat, //????????????
                synopsis_type: '03',    //????????? ???????????? ??????(01 : ?????? ??????, 02 : ?????? ??????, 03 : ??????????????? ??????, 04 : ????????? ??????)
                ptype: xpgInfo.package.asis_prd_typ_cd,          //?????? Type(10 : ppv, 20 : pps, 30 : ppm, 41 : ppp)
                adult_flag: adult_flag
            };
            CTSInfo.purchasePackage(param, this.cbPurchase);
        }
    }

    onSelect = (slideIdx, childIdx) => {        
        const gateInfo = this.state.gateWayInfo.contents[childIdx];
        const obj = {
            epsd_id: gateInfo.epsd_id,
            sris_id: gateInfo.sris_id,
            synon_typ_cd: gateInfo.synon_typ_cd,
        }
        this.movePage(constants.SYNOPSIS, obj);
    }

    render() {
        const { gateWayInfo, payState } = this.state;
        // console.log('gateWayInfo', this.focusList);
        const { bg_img_path: mainImg } = gateWayInfo;
        console.log( 'mainImg:', mainImg);
        return(
            <div className="wrap">
                <div className="mainBg">
                    <IMG
                        src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + mainImg}
                        alt=""
                        loader={
                            <div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}></div>
                        }
                    />
                </div>
                {/* <div className="mainBg">
                    {!_.isEmpty(gateWayInfo.bg_img_path) &&
                        <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_HERO) + gateWayInfo.bg_img_path} alt="" />
                    }
                </div> */}
                <div className={payState === 'N' ? "synopGateWayContent scrollWrap" : "synopGateWayContent scrollWrap payout"}>
                    <div className="titleArea" id="titleArea">
                        {
                            payState === 'N' &&
                            <div className="csFocus btnStyle2">
                                <span className="wrapBtnText">
                                    <span className="purchase">
                                        <span className="purchaseTitle">????????????</span>
                                        <span className="productionCost">
                                        {
                                            gateWayInfo.prd_prc_vat !== gateWayInfo.sale_prc_vat &&
                                            <NumberFomat value={gateWayInfo.prd_prc_vat} />
                                        }
                                        </span>
                                        <span className="dc"><NumberFomat value={gateWayInfo.sale_prc_vat} /></span>
                                        ???
                                    </span>
                                </span>
                            </div>
                        }
                    </div>
                    <div className="slideArea">
                        <G2NaviSlider
                            id={`slides`}
                            idx={0}
                            key={0}
                            title={``}
                            type={SlideType.SYNOPGATEWARY}
                            scrollTo={null}
                            onSelectMenu={null}
                            onSlideFocus={null}
                            onSelectChild={this.onSelect}
                            rotate={true}
                            bShow={true}
                            setFm={this.setFm}
                        >
                        {
                            gateWayInfo.contents.map((slide, idx2) => {
                                return (
                                    <G2NaviSlideMyVOD
                                        key={idx2} idx={idx2}
                                        title={slide.title}
                                        imgURL={slide.poster_filename_v}
                                        espdId={slide.epsd_id}
                                        srisId={null}
                                        menuId={null}
                                        onSelect={null}
                                        onClick={null}
                                    />
                                )
                            })
                        }
                        </G2NaviSlider>
                    </div>
                </div>
            </div>
		)
    }
}

export default SynopGateWay;