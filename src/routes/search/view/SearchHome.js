import React from 'react';
import PageView from "Supporters/PageView";
import { SearchContents } from 'Module/Search';
import { CSS, NXPG } from 'Network';
import { G2NaviSlider, G2NaviSlideSearchMain, SlideType } from 'Module/G2Slider';
import { isEmpty, isEqual } from 'lodash';
import routePath, {STB_PROP} from '../../../config/constants';
import Utils from '../../../utils/utils';
import StbInterface from 'Supporters/stbInterface';
import { Core } from 'Supporters';

import 'Css/search/SlideTypeSearch.css';
import 'Css/search/SearchResult.css';
										 

class SearchHome extends PageView {
    constructor(props) {
        super(props);
        
        this.state = {
            recommendList: [],
            appKeyWord: null,
            kizYn: null,
            kidsMode: null
        };

        const focusList = [
            { key: 'recommendVods', fm: null }
        ];
        this.declareFocusList(focusList);
    }
    deliveryText = (text) => {
     
        this.setState({
            appKeyWord: text
        })
    }

    updateRecommendVods = async () => {
        const result004 = await CSS.request004({
            searchType: 4,
            doc_page: 28
        });
        let recommendList = [];
        const { results_vod: list } = result004; 
        if (list) {
										   
            recommendList = list.map((vod, idx) => {
                return {
                    title: vod.title,
                    image: vod.poster,
                    epsdId: vod.epsd_id,
                    synopTypeCode: vod.synon_typ_cd,
                    epsd_rslu_id: vod.epsd_rslu_id,
                    level: vod.level
                };
            });
        }

        this.setState({
            recommendList
        }, () => {
            // this.setFocus('recommendVods');
            setTimeout(() => {
                this.setFocus('search');
            }, 1)
            
            
        });
    }

    webShowNoti = async () => {
        setTimeout(()=> {
                this.setFocus('searchInput');
        }, 500)
    }
    onSelctVod = (vod) => {
        console.log('vod 선택 : ',vod);
    }

    onSelectVod = (synopData, idx) => {
        
        const slideInfo = this.state.recommendList;
        const vodSynopData = { epsd_rslu_id: slideInfo[idx].epsd_rslu_id };
        // console.log("시놉 데이터 : ",slideInfo[idx]);
        // console.log("시놉 데이터2 : ",synopData);
        const kidsMode = isEqual(StbInterface.getProperty(STB_PROP.KIDS_MODE_ENTRY), '1');
        
        // appConfig.runDevice ? StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID) : this.callBackChannelID(KIDS_CHANNEL);
        // 키즈 채널 조회
        StbInterface.requestKidsZoneChannelInfo(this.callBackChannelID);
        // 키즈 종료 비번
        const fnCallback = null;
        
        this.setState({
            kidsMode: kidsMode
        });

        // 키즈존 VOD 체크
        const param = {
            menu_id: this.menuId,
            epsd_id: slideInfo[idx].epsdId,
            sris_id: slideInfo[idx].epsd_rslu_id,
            search_type: 1 // 1: epsd_id 기준, 2: epsd_rslu_id
        };

        this.checkKiz(param).then(response => {
            // 키즈 상품 여부 체크
            const kizCheck = response;
            // 키즈 모드 여부 체크
            const kizMode = this.state.kidsMode;
            // console.log(">>> 키즈존이다1! : ",  kizCheck); // N
            // console.log(">>> 키즈존이다2! : ", this.state.kidsMode); // null 키즈 모드
            if(kizMode){
                if(kizCheck !== 'Y'){
                    // 키드 이탈 화면
                    Core.inst().webkidsExit(null, () => { this.synopGo(idx, slideInfo) });
                }else{
                    // console.log("키즈 모드, 키즈 상품 임");
                }
            }else{
                // 시놉실행
                // Core.inst().webkidsExit(null, this.synopGo(idx, slideInfo));
                this.synopGo(idx, slideInfo)
            }
        })
    }

    // 키즈존 VOD 체크
    checkKiz = async (param) => {
        const details = await NXPG.request010(param);
        const kidsYn = details.contents.kids_yn;
        return kidsYn
    }



    synopGo = (idx, slideInfo) =>{

        const vodSynopData = { epsd_rslu_id: slideInfo[idx].epsd_rslu_id };
        // console.log("시놉 펑션 에서 시놉 ㄱ : ",slideInfo);
        // console.log("시놉 펑션 에서 시놉 ㄱ : ",vodSynopData, slideInfo[idx].level);
        Utils.movePageAfterCheckLevel(routePath.SYNOPSIS, vodSynopData, slideInfo[idx].level);
    }


    callBackChannelID = async (data) => {
        // console.log(">>>> 키즈존? : ",data);
        const result = data.channel.map((item, index) => {
            const {
              channel_name: chName,
              service_id: svcId,
              channel_no: chNo
            } = item;
      
            // const channel = allChannels.get(chNo);
            // const isNotFree = channel && channel.pay && !includes(registeredChannels.join, chNo);
      
            return { chName, svcId, chNo /*, isNotFree*/ };
        });
        console.log("KIZ result : ", result);
    }
    componentDidMount() {
        const { showMenu } = this.props;
        if (showMenu) {
            showMenu(false);
        }

        this.updateRecommendVods();
        window.SEARCH = this;
    }

    onSearchContentsFocused = (container) => {

    }

    // shouldComponentUpdate(nextProps) {
    //     return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    // }

    render() {
        const { recommendList, appKeyWord } = this.state;
        return (
            <div className="wrap">
                <div className="searchMainWrap scrollWrap">
                    <div className="searchRecommendContent">
                        <p>검색 인기 콘텐츠</p>
                        <RecommendVodList
                            list={recommendList}
                            onSelect={this.onSelectVod}
                            setFm={this.setFm}
                            onVodSelect={this.onVodSelect}
                        />
                        
                    <SearchContents
                        alwaysActive={true}
                        setFm={this.setFm}
                        addFocusList={this.addFocusList}
                        setFocus={this.setFocus}
                        focusPrev={this.focusPrev}
                        scrollTo={this.onSearchContentsFocused}
                        movePage={this.movePage}
                        innerRef={(r)=>{ this.input = r; }}
                        active={true}
                        appKeyWord={appKeyWord}
                    />
                    </div>
                </div>
            </div>
        )
    }
}

class RecommendVodList extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }
    
    renderSlider() {
        const { list } = this.props;
        return list.map((vod, idx) => {
            return <G2NaviSlideSearchMain
                key={idx}
                idx={idx}
                title={vod.title}
                espdId={vod.espdId}
                imgURL={vod.image}
                bAdult={vod.bAdult}
                synopTypeCode={vod.synopTypeCode}
                />
        });
    }

    render() {
        const {
            setFm,
            onSelect,
        } = this.props;
        const slideList = this.renderSlider();

        return (
            <G2NaviSlider
                id="recommendVods"
                bShow={true}
                type={SlideType.SEARCH_MAIN}
                onSelectChild={onSelect}
                rotate={true}
                setFm={setFm}
            >
                {slideList}
            </G2NaviSlider>
        )
    }
}

export default SearchHome;