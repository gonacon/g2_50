import React, { Component } from 'react';
import PageView from 'Network/../PageView.js';
import 'Css/myBtv/MyBtvLayout.css';
import 'Css/myBtv/my/RecentVod.css';
import { G2SlideEditableRecentVOD, SlideType, G2NaviSlider } from 'Module/G2Slider';
import { MeTV } from 'Network';
// import PATHS from '../../../config/app-config';
import PATHS from 'Config/constants';
import keyCodes from 'Supporters/keyCodes';

import '../../../assets/css/components/modules/SlideTypeBB.css';
import FM from 'Supporters/navi';
import Utils from 'Util/utils';
import ConfirmDeleteAllRecentVodList from './ConfirmDeleteAllRecentVodList';
import { Core } from 'Supporters';

const KEY = keyCodes.Keymap;

class EditRecentVodList extends PageView {
    constructor(props) {
        super(props);

        this.state = {
            vods: [],
            isLoading: false,
            currentVodIdx: 0
        }

        const focusList = [
            { key: 'editRecentVodSlider', fm: null },
            { key: 'bottomButtons', fm: null}
        ];
        this.declareFocusList(focusList);
    }

    componentDidMount() {
        const { showMenu } = this.props;
        showMenu(false);
        this.update();

        const bottomButtons = new FM({
            id: 'bottomButtons',
            containerSelector: '.buttonWrap',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusKeyDown: this.onFocusKeyDownBottomButtons
        });
        this.setFm('bottomButtons', bottomButtons);
    }

    update = async () => {
        this.setState({
            isLoading: true
        });

        let watchedList = [];
        let result = null;
        try {
            result = await MeTV.request021();
        } catch(err) {
            console.error('err:', err);
        } finally {
            const filtered = result.watchList.filter(vod => vod.adult === 'N');
            //watchedList = result.watchList? result.watchList.map((vod, idx) => {
            watchedList = filtered ? filtered.map((vod, idx) => {
                const { 
                    title,
                    thumbnail: imgURL,
                    watch_rt,
                    adult,
                    espd_id: espdId,
                    sris_id: srisId
                } = vod;
                const rate = parseInt(watch_rt, 10);//Math.floor((watch_time / total_time) * 100);
                const bAdult = adult === 'Y';
                return {
                    title,
                    imgURL,
                    rate,
                    bAdult,
                    espdId,
                    srisId
                };
            }): [];

            if (watchedList.length === 0) {
                this.moveBack();
            }

            this.setState({ 
                vods: watchedList,
                isLoading: false
            }, ()=> {
                setTimeout(()=> {
                    this.setFocus('editRecentVodSlider');
                },1);
            });
        }
    }

    onFocusKeyDownBottomButtons = (event, childIdx) => {
        if (event.keyCode === KEY.ENTER) {
            if (childIdx === 0) { // 전체삭제
                const { vods } = this.state;
                if (vods.length !== 0) {
                    const { showMenu } = this.props;
                    showMenu(false);
                    const vod = vods[0];
                    Core.inst().showPopup(<ConfirmDeleteAllRecentVodList />, {title: vod.title, count: vods.length-1}, (info) => {
                       if (info.result) {
                           this.moveBack();
                       }
                    });
                }
                
            } else { // 닫기
                this.moveBack();
                // this.movePage(PATHS.MYBTV_HOME);
            }
        }
    }

    onSelectVod = async (idx, vodIdx) => {
        const { vods } = this.state;
        const vod = vods[vodIdx];
        const bSuccess = Utils.deleteRecentVod({ isAll: 'N', srisId: vod.srisId, epsdId: vod.epsdId });
        if (bSuccess) {
            this.update();
        }

        // try {
        //     const param = { isAll: 'N', deleteList: [vod.srisId] };
        //     console.error('param:', param);
        //     await MeTV.request022(param);
        // } catch (err){
        //     console.error('최근시청 VOD 단편 삭제실패', err);
        // } finally {
        //     this.update();
        // }
    }

    onFocusChangedOnVodList = (idx) => {
        this.setState({ currentVodIdx: idx});
    }

    render() {
        const { vods } = this.state;
        return (
            <div className="wrap">
				<div className="registWrap vod scrollWrap">
					<h2 className="pageTitle">최근 시청 VOD 삭제</h2>
					<p className="subInfo">최근 시청한 VOD 목록을 편집할 수 있습니다.</p>
                    <div className="registerForm">
                        <EditableVodList vods={vods} setFm={this.setFm} onSelectVod={this.onSelectVod}/>
                    </div>
					<div id="bottomButtons" className="buttonWrap">
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">전체삭제</span>
                        </span>
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">닫기</span>
                        </span>
					</div>
				</div>
			</div>
        );
    }
}

class EditableVodList extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.vods) !== JSON.stringify(this.props.vods);
    }

    render() {
        const { vods, setFm, onSelectVod } = this.props;
        const vodList = vods.map((vod, idx) => {
            const { title, imgURL, rate, espdId, srisId, bAdult } = vod;
            return ( 
                <G2SlideEditableRecentVOD
                    key={idx}
                    idx={idx}    
                    title={title}
                    imgURL={imgURL}
                    bAdult={bAdult}
                    rate={rate}
                    espdId={espdId}
                    srisId={srisId}
                    onSelect={this.onSelectVod}
                />
            );
        });

        return (
            <G2NaviSlider
                id="editRecentVodSlider"
                type={SlideType.EDITABLE_RECENT_VOD} 
                onFocusChanged={this.onFocusChangedOnVodList}
                onSelectChild={onSelectVod}
                bShow={true}
                setFm={setFm}
                rotate={true}
            >
                {vodList}
            </G2NaviSlider>
        );       
    }
}

export default EditRecentVodList;