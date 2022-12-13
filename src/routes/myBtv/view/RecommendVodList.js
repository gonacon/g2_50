import React from 'react';
import PageView from 'Supporters/PageView';
import { G2NaviSlider, G2SlideRecommendVOD, SlideType } from 'Module/G2Slider';
// import { RECOMMEND_VOD } from '../testData/homeData';
import 'Css/myBtv/VOD/OwnVODRecommendList.css';
import { NXPG } from 'Network';
import appConfig from 'Config/app-config';
import constants from 'Config/constants';


class RecommendList extends PageView {
    constructor(props) {
        super(props);

        if (this.historyData) {
            this.state = this.historyData;
        } else {
            this.state = {
                myVodInfo: this.paramData.myVodInfo,
                recommendList: [],
                reason: ''
            }
        }

        const focusList = [
            { key: 'recommendVodList', fm: null }
        ];
        this.declareFocusList(focusList);
    }

    update = async () => {
        const { myVodInfo } = this.state;
        const result009 = await NXPG.request009({
            menu_id: myVodInfo.menuId, //NM1000020142
            cw_call_id: myVodInfo.cw_call_id_val,
            type: 'all'
        });

        let list = result009 && result009.grid && result009.grid[0] && result009.grid[0].block;
        const reason = result009 && result009.grid && result009.grid[0] && result009.grid[0].sub_title;
        console.log('추천 VOD 리스트:', list);
        if (!list) {
            list = [];
        }
        let recommendList = list.map((vod, idx) => {
            return {
                epsdId: vod.epsd_id,
                srisId: vod.sris_id,
                title: vod.title,
                adult: vod.adlt_lvl_cd === '19',
                imgURL: vod.poster_filename_v,
                reason: vod.sub_title
            }
        });
        
        recommendList = recommendList.slice(0, 12);

        this.setState({
            recommendList,
            reason
        }, () => {
            setTimeout(() => {
                if ( recommendList.length !== 0) {
                    this.setFocus('recommendVodList');
                }
            }, 1);
        });
    }

    onSelectSlide = (conIdx, idx) => {
        const { recommendList } = this.state;
        const vod = recommendList[idx];
        this.onSelectVOD(vod);
    }

    onFocusChild = (idx) => {
        const { recommendList } = this.state;
        const vod = recommendList[idx];
        this.onFocusVOD(vod);
    }

    onSelectVOD = (vod) => {
        const param = {
            epsd_id: vod.epsdId,
            sris_id: vod.srisId,
            epsd_rslu_id: vod.epsdRsluId,
        };
        this.movePage(constants.SYNOPSIS, param);
    }

    onFocusVOD = (vod) => {
        console.log('vod포커스: ', vod);
        // this.setState({
        //     reason: vod.reason
        // });
    }

    getRecommendList = () => {
        const { recommendList: list } = this.state;
        return list.map((vod, idx) => {
            return <G2SlideRecommendVOD
                idx={idx}
                key={idx}
                imgURL={vod.imgURL}
                bAdult={vod.adult}
                title={vod.title}
                onSelect={this.onSelectVOD}
                onFocused={this.onFocusVOD}
            />
        })
    }

    componentDidMount() {
        const { showMenu } = this.props;
        if (showMenu) {
            showMenu(false);
        }
        this.update();
    }

    render() {
        const { reason } = this.state;
        const recommendList = this.getRecommendList();

        return (
            <div className="wrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/bg-own-vod-recommend.png`} alt="" /></div>
                <div className="ownRecommendWrap">
                    <div className="recommendTitleWrap">
                        <p className="title">소장용 VOD 추천목록</p>
                        <p className="subTitle">{reason}</p>
                    </div>
                    <div className="recommendSlideWrap">
                        <G2NaviSlider
                            id="recommendVodList"
                            bShow={true}
                            type={SlideType.RECOMMEND_VOD}
                            rotate={true}
                            setFm={this.setFm}
                            onSelectChild={this.onSelectSlide}
                            onFocusChanged={this.onFocusChild}
                        >
                            {recommendList}
                        </G2NaviSlider>
                    </div>
                </div>
            </div>
        )
    }
}

export default RecommendList;