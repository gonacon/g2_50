import React, { Component } from 'react';
import { kidsConfigs } from '../config/kids-config';
import { NXPG } from 'Network';
import { isEmpty } from 'lodash';
import constants from 'Config/constants';
import { SlideType, G2SliderDefault, G2SlidePlayLearning } from './module/KidsSlider';
import keyCode from 'Supporters/keyCodes';
import 'Css/kids/playlearning/PlayLearning.css';

const DEFAULT_INDEX = 0;

class PlayLearning extends Component {
    constructor(props) {
        super(props);

        this.state = {
            listIndex: -1,
            playListInfo: []
        };

        this.menuId = '';
    }
    
    /*********************************** Component Lifecycle Methods ***********************************/
    componentDidMount() {
        const { menuId } = this.props;
        if (menuId !== '') {
            console.log('didMount.menuId:', menuId);
            this.menuId = menuId;
            this.handleRequestAPI();
        }
    }

    /*********************************** H/E Request Methods ***********************************/
    handleRequestAPI = () => {
        this.handleRequestPlayInfo();
    }

    handleRequestPlayInfo = async () => {
        const result = await NXPG.request007({ menu_id: this.menuId });
        let playListInfo = result.banners ? result.banners : [];

        playListInfo = playListInfo.map((item, index) => {
            let tempInfo = {
                shcurMenuId: item.shcut_menu_id,
                menuId: item.menu_id,
                menuNm: item.menu_nm, 

                bnrExpsMthdCd: item.bnr_exps_mthd_cd,    // 메뉴 노출 속성 코드
                blkTypCd: item.blk_typ_cd,  // 블록 유형 코드
                gnbTypCd: item.gnb_typ_cd,
           
                focImage: item.bnr_on_img_path,
                norImage: item.bnr_off_img_path
            }
            return tempInfo;
        });
        console.log('[PLAYLIST INFO] : ', playListInfo);

        this.setState({ 
            playListInfo,
            listIndex: DEFAULT_INDEX 
        });
    }

    /*********************************** FocusManager KeyEvent Methods ***********************************/
    // 블록 포커스셋 이벤트 함수 (onInitFocus)
	handleOnInitFocus = (fmId, idx) => {
        console.log('[KEY EVENT][onInitFocus]');

        const { getHistory, setFocus } = this.props;
        const historyInfo = getHistory();
        
        if(historyInfo.isOnHistory) {
            setFocus('contents', getHistory().childIndex);
        }
            
	}

	// 블록 포커스온 이벤트 함수 (onSlider)
	handleOnSlider = (idx, container) => {
        console.log('[KEY EVENT][onSlider]');
	} 

	// 블록 포커스오프 이벤트 함수 (offSlider)
	handleOffSlider = (index, dir) => {
        const { getHistory, resetHistory, setFocus } = this.props;
        const historyInfo = getHistory();
        
        if(historyInfo.isOnHistory) {
            resetHistory();
            return null;
            
        } else {
            if(dir === 'UP' && typeof setFocus === 'function') {
                this.props.setFocus(1, 4);
            }
        }
	}

	// 콘텐츠 포커스 이동 이벤트 함수 (onFocus)
	handleOnFocusMove = (childIdx) => {
		console.log('[KEY EVENT][onFocus] childIdx : ', childIdx);
	}
    
    // 콘텐츠 키 이벤트 함수 (onKeyDown)
	handleOnKeyDown = (event, parentIdx = null, childIdx) => {
		console.log('[KEY EVENT][onKeyDown]');
        console.log(`event : ${event.keyCode} childIdx : ${childIdx}`);

        const param = { pathName: '', state: '' }
        switch (event.keyCode) {
            case keyCode.Keymap.ENTER:
                let { playListInfo } = this.state;
                const contentInfo = playListInfo[childIdx];

                if (contentInfo.blkTypCd === kidsConfigs.BLOCK.CONTENTS_BLOCK_CD) {
                    // 목록 유형 진입
                    param.pathName = constants.KIDS_PLAYLIST;
                    param.state = {
                        menu_id: contentInfo.menuId,
                        menu_nm: contentInfo.menuNm
                    }
                } else {
                    // 블록 유형 진입

                    // H/E 변경됨
                    // if(isEmpty(contentInfo.menus)) return;

                    if(contentInfo.blkTypCd === kidsConfigs.BLOCK.MENU_BLOCK_CD) { 
                        param.pathName = constants.KIDS_PLAYBLOCK;
                        param.state = {
                            menu_id: contentInfo.menuId,
                            menu_nm: contentInfo.menuNm
                        }
                    } else {
                        return null;
                    }
                }
                this.props.setHistory({
                    comptName: 'PlayLearning',
                    focusKey: 'contents',
                    childIndex: childIdx,
                    isInitKidsHome: false
                });
                this.props.onMovePage(param.pathName, param.state);
                break;
            default:
                break;
        }
    }

    /*********************************** Etc Methods ***********************************/

    /*********************************** Render ***********************************/
    render() {
        const { playListInfo } = this.state;
        const { setFm } = this.props;
        
        // history 데이터가 있다면, 인덱스 가져오기
        const getHistoryData = this.props.getHistory();
        this.childIndex = isEmpty(getHistoryData.childIndex) ? 0 : getHistoryData.childIndex;

        const bShow = !isEmpty(playListInfo) && (playListInfo && playListInfo.length > 0);
        return (
            <div className="playLearningListWrap scrollWrap">
                {
                    bShow ?  <G2SliderDefault
                                id={'contents'}
                                bShow={bShow}
                                rotate={true}
                                slideType={SlideType.KIDS_PLAY_LEARNING}
                                setFm={setFm}
                                onInitFocus={this.handleOnInitFocus}
                                onSlider={this.handleOnSlider}
                                offSlider={this.handleOffSlider}
                                onFocus={this.handleOnFocusMove}
                                onKeyDown={this.handleOnKeyDown}
                                focusIndex={this.childIndex}>
                                {
                                    playListInfo.map((item, index) => {
                                        return <G2SlidePlayLearning
                                            focImage={item.focImage}
                                            norImage={item.norImage}
                                            index={index}
                                            lastIndex={playListInfo.length}
                                            key={index}
                                        />       
                                    })
                                }
                            </G2SliderDefault> : null
                }
                <div className="mesPlayLearning">
                    <p className="mesInfo">스마트폰만 보는 우리아이, TV 보기만 좋아하는 우리아이에게 연령에 맞는 교육 VOD, 앱을 이용해보세요.<br/>즐겁게 잘 노는 것도 우리아이에게 좋은 교육이 됩니다</p>
                </div>
			</div>
        )
    }
}

export default PlayLearning;