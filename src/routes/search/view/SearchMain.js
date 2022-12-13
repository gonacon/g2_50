import { React } from '../../../utils/common';
//import { VerticalList } from 'Navigation';
import PageView from '../../../supporters/PageView';
import { CSS } from 'Network';
import routePath, { STB_PROP } from '../../../config/constants';
import appConfig from "../../../config/app-config";
import Core from '../../../supporters/core';
import FM from '../../../supporters/navi';

import SlideTypeSearch from '../components/SlideTypeSearch';
import SearchContentItem from  'Module/SearchContentItem';
import StbInterface from 'Supporters/stbInterface';

const RUN_DEVICE = appConfig.runDevice;

const DirectionTable = {
    37: 'LEFT',
    39: 'RIGHT',
    38: 'UP',
    40: 'DOWN'
};

class SearchMain extends PageView {
    constructor(props) {
        super(props);
        this.state = {
            contentSlides: [],
            slideInfo: [],
            update: false,
            selectionStart: null
        }

        const focusList = [
            { key: 'searchSlideList', fm: null },
            { key: 'inputKeyword', fm: null },
            { key: 'searchRecord', fm: null },
            { key: 'recommKeyword', fm: null },

            { key: 'keypadList', fm: null },
            { key: 'keypadLangegeList', fm: null },
        ];
        this.declareFocusList(focusList);

        if (RUN_DEVICE)
            window.tvExt.utils.ime.setEnableSoftKeyboard(false);

        this.isSearchRecordDeleteMode = false;
    }

    setSearchRecordDeleteMode = (isDeleteMode) => {
        this.isSearchRecordDeleteMode = isDeleteMode;
    }

    webShowNoti = async () => {
        setTimeout(()=> {
            if (this.innerInputBox) {
                this.setFocus(1,-1);
                this.innerInputBox.focus();
            }
        }, 500)
    }

    handleRequestAPI() {
        let searchList = {};

        let searchHistoryList = [];
        let recommendKeywordList = [];
        
        if (StbInterface.getProperty(STB_PROP.SEARCH_HISTORY)) {
            searchHistoryList = JSON.parse(StbInterface.getProperty(STB_PROP.SEARCH_HISTORY));
        }

        if (searchHistoryList.length > 0) {
            //검색 기록 순(Index)순으로 정렬
            searchHistoryList.sort(function (a, b) {
                return ((a['index'] < b['index']) ? -1 : ((a['index'] > b['index']) ? 1 : 0));
            })

            recommendKeywordList.slideType = "SEARCH";
            recommendKeywordList.listItem = [];

            let searchMap = [];
            searchMap.title = "검색기록";
            searchMap.type = "searchHistory";
            searchMap.wordItem = [];

            let maxCount = 10;
            if (searchHistoryList.length < maxCount)
                maxCount = searchHistoryList.length;

            for (let i = 0; i < maxCount; i++) {
                searchMap.wordItem.push(searchHistoryList[i].keyword);
            }
            recommendKeywordList.listItem.push(searchMap);
        }

        //인기 VOD List I/F
        const vodList = CSS.request004({ searchType: 4, doc_page: 28 }); // searchType 4: 추천vod, 2: 추천 키워드
        //추천 검색어 List
        const keywordList = CSS.request004({ searchType: 2, doc_page: 10 });

        Promise.all([vodList, recommendKeywordList, keywordList]).then((value) => {
            console.log('promise.all.result', value);

            let vodResult = [];

            if (!value[0].results_vod) {
                //인기 VOD 데이터가 없을시 tmp.json 으로 처리
                //vodResult = tmp;
            } else {
                vodResult.slideType = "SlideTypeSearch"
                vodResult.slideItem = [];

                value[0].results_vod.map((result, i) => {
                    const vodMap = {};
                    if (i < 28) {
                        vodMap.idx = result.idx;
                        vodMap.title = result.title;
                        vodMap.image = result.poster;
                        vodMap.epsd_id = result.epsd_id;
                        vodMap.synon_typ_cd = result.synon_typ_cd;
                        vodResult.slideItem.push(vodMap);
                    }
                    return null;
                })

            }

            if (value[2].result === "0000") {
                const keywordMap = [];
                keywordMap.title = "추천검색어";
                keywordMap.type = "RECOMM";
                keywordMap.wordItem = value[2].results_keyword.map((result, i) => {
                    return result.keyword;
                })

                if (!recommendKeywordList.listItem) {
                    recommendKeywordList.slideType = "SEARCH";
                    recommendKeywordList.listItem = [];
                }

                if (recommendKeywordList.listItem.length < 2)
                    recommendKeywordList.listItem.push(keywordMap);
            }

            this.setState({
                contentSlides: [vodResult, recommendKeywordList]
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

    //예외 사항들로 키 이벤트 Override 처리
    handleKeyEvent(event) {
        console.log('키코드:', event.keyCode);
        if (this.focusIndex === -1) {
            return;
        }

        const direction = DirectionTable[event.keyCode];

        if (this.arrangedFocusList.length - 1 < this.focusIndex) {
            this.focusIndex = this.arrangedFocusList.length - 1;
        }
        const focusInfo = this.arrangedFocusList[this.focusIndex];
        const currentFm = focusInfo.fm;
        
        let idx;
        if ((direction && direction === 'UP' && currentFm.listType !== "V" && currentFm.id !== "keypadList")
            || (currentFm.listType === 'V' && direction === 'LEFT')) { 
                console.log('UP1');

            idx = this.focusIndex - 1;
            if (idx < 0) {
                idx = 0;
            }
            if(currentFm.id === "numberFirst"){ // input 박스에서 '상' 키 눌렀을 때.
                this.setFocus(0,0);
            }else if(currentFm.id === "keypadLangegeList"){ // 키패드 우측 입력문자 변화에서 '상' 키 눌렀을 때.
                this.setFocus(idx,11);
            }else if(currentFm.id === "recommKeyword"){ // 추천 검색어에서 '상'키 눌럿을 때.
                this.setFocus(idx);
            }
            
        } else if ((direction && direction === 'DOWN' && currentFm.listType !== "V" && currentFm.id !== "keypadList")
            || (currentFm.listType === 'V' && direction === 'RIGHT')) {
                console.log('right==================');
                if (this.isSearchRecordDeleteMode && direction === 'RIGHT') {
                    return;
                }
                idx = this.focusIndex + 1;
                if (idx >= this.arrangedFocusList.length - 1) {
                    idx = this.arrangedFocusList.length - 1;
                }

            if (currentFm.id === "keypadLangegeList") {

            } else if (idx === this.arrangedFocusList.length - 1) {
                this.setFocus(idx, 0);
            } else {
                this.setFocus(idx);
            }

        } else if (direction) {
            if (direction === 'UP' && currentFm.listInfo.curIdx === 0 && currentFm.id !== "keypadLangegeList") {
                console.log('up2.1');
                if (this.isSearchRecordDeleteMode) {
                    console.log('삭제모드라 return')
                    return;
                }
                this.setFocus(1,-1);

            } else if (currentFm.id === "keypadList") {
                if (direction === 'UP' && currentFm.listInfo.curIdx < 3) {
                    console.log('up2.2');
                    this.setFocus(1);
                } else if (direction === "LEFT" && currentFm.listInfo.curIdx % 3 === 0) {
                    console.log('left.1');
                    idx = this.focusIndex - 1;
                    if (idx < 0) {
                        idx = 0;
                    }
                    this.setFocus(idx);
                } else if (direction === 'RIGHT' && currentFm.listInfo.curIdx % 3 === 2) {
                    if (this.focusIndex !== this.arrangedFocusList.length - 1) {
                        idx = this.focusIndex + 1;
                        if (idx >= this.arrangedFocusList.length - 1) {
                            idx = this.arrangedFocusList.length - 1;
                        }
                        this.setFocus(idx);
                        console.log('right.1');
                    }
                    console.log('right.2');
                } else {
                    currentFm.moveFocus(direction, this.onFocusMoveUnavailable);
                    console.log('right.3');
                }
            }
            else {
                console.log('up2.6');
                currentFm.moveFocus(direction, this.onFocusMoveUnavailable);
            }
        } else {
            console.log('up2.7');
            currentFm.handleKeyDown(event);

        }

    }

    setMaxFocusMove = () => {
        const maxlength = this.arrangedFocusList.length;
        if (maxlength - 1 > this.focusIndex && this.focusIndex === 3) {
            this.setFocus(maxlength - 1, this.arrangedFocusList[maxlength - 1].curIdx);
        }
    }


    onVodSelect = (synopData) => {
        this.setHistoryFocusIndex();
        this.props.history.push(routePath.SYNOPSIS, synopData);
    }

    componentWillMount() {
        //H/E 호출
        this.handleRequestAPI();
    }

    componentDidMount() {
        this.props.showMenu(false);
        // this.setHistoryFocusIndex();
    }

    componentDidUpdate() {
        // let inputSet2 = (this.historyData.currentFmIdx === 1 ? -1 : this.historyData.currentFmIdx)
        // this.setFocus(1,-1);
        // return;

        if (this.historyData.currentFmIdx !== undefined && this.historyData.currentFmIdx !== null && this.historyData.currentFmIdx > -1) {
            let inputSet = (this.historyData.currentFmIdx === 1 ? -1 : this.historyData.currentFmIdx)
            this.setFocus(inputSet, this.historyData.currentFocusIdx);
            
        }
        // else{
        //     this.setFocus(1,-1);
        // }
    }

    //Input Field Event
    onSelectSearch = (keyword) => {
        let recordJson = "";

        if (keyword === "") {
            Core.inst().showToast('텍스트를 입력하지 않으셨습니다.', '', 3000);
        } else {

            if (StbInterface.getProperty(STB_PROP.SEARCH_HISTORY))
                recordJson = JSON.parse(StbInterface.getProperty(STB_PROP.SEARCH_HISTORY));

            const searchRecordJson = [];
            let inputMap = new Map();
            inputMap.index = 0;
            inputMap.keyword = keyword;

            searchRecordJson.push(inputMap);

            if (recordJson.length > 0) {

                recordJson.sort(function (a, b) {
                    return ((a['index'] < b['index']) ? -1 : ((a['index'] > b['index']) ? 1 : 0));
                })
                recordJson.map((data, i) => {
                    if (i < 10) {
                        let recordMap = new Map();
                        recordMap.index = i + 1;
                        recordMap.keyword = data.keyword;
                        searchRecordJson.push(recordMap);
                    }
                })
            }

            StbInterface.setProperty(STB_PROP.SEARCH_HISTORY, JSON.stringify(searchRecordJson));

            const searchResult = CSS.request002({ keyword: keyword, transactionId: 'search_result_list', doc_page: '100^100^100^100^100^100', tag_yn: 'N' });

            Promise.all([searchResult]).then((value) => {

                this.setHistoryFocusIndex();

                if (!value[0].total_result_no || value[0].total_result_no < 1) {
                    this.props.history.push(routePath.SEARCH_RESULT_NONE, { data: keyword });
                } else {
                    this.props.history.push(routePath.SEARCH_RESULT, { data: keyword });
                }
            })

        }
    }


    render() {
        return (
            <div className="wrap">
                <div className="searchMainWrap scrollWrap">
                    <div className="searchRecommendContent">
                        <p>검색 인기 콘텐츠</p>
                        {this.state.contentSlides.map((data, i) => {
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
                                case 'SEARCH':
                                    return (
                                        <SearchContentItem
                                            slideInfo={data}
                                            key={i}
                                            onSelectSearch={this.onSelectSearch}
                                            setFm={this.setFm}
                                            setFocus={this.setFocus}
                                            setMaxFocusMove={this.setMaxFocusMove}
                                            innerRef={(r)=>{ this.innerInputBox = r; }}
                                            setSearchRecordDeleteMode={this.setSearchRecordDeleteMode}
                                        />
                                    );
                                default:
                                    return (
                                        <div
                                            key={i}
                                        />
                                    );
                            }
                        })}
                    </div>
                </div>
            </div>
        )
    }



}

export default SearchMain;