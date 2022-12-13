import React from 'react';
import PageView from '../../../supporters/PageView';
import { CSS } from 'Network';
import routePath from '../../../config/constants';
import FM from '../../../supporters/navi';

import '../../../assets/css/routes/search/SearchResultNone.css';

import SlideTypeSearch from '../components/SlideTypeSearch';
import appConfig from 'Config/app-config';
import Utils from 'Util/utils';

class SearchResultNone extends PageView {
    constructor(props) {
        super(props);

        let SEARCH_KEYWORD = "";
        if (this.props.location.state)
            SEARCH_KEYWORD = this.props.location.state.data;

        let contentData = [];

        this.state = {
            searchWord: SEARCH_KEYWORD,
            contentSlides: contentData,
            focused: false
        }


        const focusList = [
            { key: 'reSearch', fm: null },
            { key: 'searchSlideList', fm: null }
        ];
        this.declareFocusList(focusList);

    }

    componentDidMount() {
        // 상단 General GNB
        this.props.showMenu(false);

        const reSearch = new FM({
            id: 'reSearch',
            type: 'ELEMENT',
            focusSelector: '.csFocus',
            row: 1,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 0,
            onFocusKeyDown: this.onSelect,
        });
        this.setFm('reSearch', reSearch);

        this.setFocus(0);
    }


    onVodSelect = (synopData) => {
        this.setHistoryFocusIndex();
        Utils.movePageAfterCheckLevel(routePath.SYNOPSIS, synopData, synopData.level);
    }

    componentWillMount() {

        //인기 VOD List I/F
        const vodList = CSS.request004({ searchType: 4, transactionId: 'seaarch_vod_list', doc_page: 28 })

        Promise.all([vodList]).then((value) => {
            let vodResult = [];
            if (!value[0].results_vod) {
                //인기 VOD 데이터가 없을시 tmp.json 으로 처리
                //vodResult = tmp;
            } else {
                vodResult.slideType = "SlideTypeSearch"
                vodResult.slideItem = [];

                value[0].results_vod.map((result, i) => {
                    const vodMap = [];
                    if (i < 28) {
                        vodMap.idx = result.idx;
                        vodMap.title = result.title;
                        vodMap.image = result.poster;
                        vodMap.epsd_id = result.epsd_id;
                        vodMap.synon_typ_cd = result.synon_typ_cd;
                        vodMap.level = result.level;
                        vodResult.slideItem.push(vodMap);
                    }
                })

            }

            this.setState({
                contentSlides: [vodResult]
            })

        }, () => {
            console.log("error");
        })

    }

    setHistoryFocusIndex() {
        this.setState({
            currentFocusIdx: this.arrangedFocusList[this.focusIndex].fm.listInfo.curIdx
            , currentFmIdx: this.focusIndex
        })
    }

    componentDidUpdate() {
        if (this.historyData.currentFmIdx !== undefined && this.historyData.currentFmIdx !== null && this.historyData.currentFmIdx > -1) {
            this.setFocus(this.historyData.currentFmIdx, this.historyData.currentFocusIdx);
        }
    }

    //다시 검색
    onSelect = (event) => {
        if (event.keyCode === 13) {
            this.movePage(routePath.SEARCH_HOME);
        }
    }


    render() {
        const focused = this.state.focused ? "csFocus btnStyle loadFocus focusOn" : "csFocus btnStyle loadFocus";
        return (
            <div className="wrap scrollWrap">
                <div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/search/bg-search.png`} alt="" /></div>
                <div className="searchResultNoneWrap">
                    <div className="resultNoneTitleArea">
                        <p className="resultTitle"><strong>“{this.state.searchWord}”</strong>에 대한 검색 결과가 없습니다.</p>
                        <span className="resultSubText">검색어의 띄어쓰기나 철자가 정확한지 확인해주세요.</span>
                        <div className="resultBtnArea">
                            <span id="reSearch" tabIndex="-1" className={focused}>
                                <span className="wrapBtnText">다시 검색</span>
                            </span>
                            {/* 
                                * Phase2 개발범위 : UI검색 p.22
                                <span tabIndex="-1" className="csFocus btnStyle">
                                    <span className="wrapBtnText">콘텐츠 요청하기</span>
                                </span> 
                                */}
                        </div>
                    </div>

                    <div className="searchRecommendContent">
                        <p>검색 인기 콘텐츠</p>
                        {this.state.contentSlides.map((data, i) => {
                            { data.slideType }
                            switch (data.slideType) {
                                case 'SlideTypeSearch':
                                    return (
                                        <SlideTypeSearch
                                            slideInfo={data}
                                            key={i}
                                            setFm={this.setFm}
                                            onVodSelect={this.onVodSelect}
                                        />
                                    );
                                default:
                                    break;
                            }
                        })}
                    </div>
                </div>
            </div>
        )
    }



}

export default SearchResultNone;