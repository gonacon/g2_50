import React, { Component } from 'react';
import IMG from 'react-image';
import PageView from 'Network/../PageView.js';
// import { Focusable, HorizontalList } from 'Navigation';
import { MeTV, NXPG } from 'Network';
import 'Css/myBtv/VOD/PossessionVODTotalList.css';
import _ from 'lodash';
import appConfig from 'Config/app-config';
// import moment from 'moment';
import { getCodeName } from '../../../utils/code';
import Utils, { newlineToBr } from '../../../utils/utils';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import { PATH } from 'Config/constants';
import Img from 'Module/UI/Img';

const KEY = keyCodes.Keymap;

const MAX_PAGE_ITEM = 6;

class MyVodList extends PageView {
    constructor(props) {
        super(props);
        if (this.historyData) {
            this.state = this.historyData;
        } else {
            this.state = {
                totalPage: 1, // 전체 페이지 개수
                currentPage: 1, // 현재 페이지
                totalvod: 1, // 모든 소장 vod 개수
                vodList: [], // 현재 페이지의 vod 리스트
                myVodInfo: this.paramData.myVodInfo,
                
                focusedIdx: -1, // 포커스 ON 중인 vod
                vodDetailInfo: null,
                menuFocused: false,
    
                noHeroImg: true,
                isDark: false,
            }
        }

        this.menuId = null;
    }

    async componentDidMount() {
        // document.querySelector('#root .wrapper').classList.add('dark');
        const { currentPage } = this.state;
        const { showMenu } = this.props;
        showMenu(false);
        const menuInfo = await NXPG.request001();
        const menuList = menuInfo.menus;
        let menuId = null;
        for (let menu of menuList) {
            if (menu.gnb_typ_cd && menu.gnb_typ_cd === 'U5_01')
                menuId = menu.menu_id;
        }
        this.menuId = menuId;
        this.update({ page : currentPage });
        // this.updateDetail();

        const focusList = [
            { key: 'myVodList', fm: null }
        ];
        this.declareFocusList(focusList);
        const myVodList = new FM({
            id: 'myVodList',
            type: 'FAKE',
            onFocusKeyDown: this.onFocusKeyDown
        });
        this.setFm('myVodList', myVodList);
        this.setFocus('myVodList');
    }

    // componentWillUnmount() {
    //    // document.querySelector('#root .wrapper').classList.remove('dark');
    // }

    onFocusKeyDown = (evt) => {
        // this.container.onKeyDown(evt);
        this.handleKeyDown(evt);
    }

    handleKeyDown = (evt) => {
        const { vodList: list } = this.state;
        const { focusedIdx, vodList } = this.state;
        let idx = focusedIdx;
        // let movePage = page;
        const row = Math.floor( focusedIdx / 3 );
        switch(evt.keyCode) {
        case KEY.UP: // up
            if (row === 0) {
                this.upPage();
            } else {
                idx -= 3;
                this.setState({
                    focusedIdx: idx
                });
                this.onFocusChanged(idx);
            }
            break;
        case KEY.DOWN: // down
            if (row === 1) {
                this.downPage();
            } else {
                // 다음 row의 포커스갈 item 이 있거나 +1 일 경우
                // console.log('list', list, focusedIdx);
                if (list[focusedIdx + 3] || focusedIdx + 3 === list.length) {
                    idx = focusedIdx +3;
                } else {
                    if (list && list.length <= 3) {
                        return;
                    } else {
                        idx = list.length - 1;
                    }
                }
                this.setState({
                    focusedIdx: idx
                })
                this.onFocusChanged(idx);
            }
            break;
        case KEY.LEFT: // left
            idx = focusedIdx - 1;
            if (idx <= 0) {
                idx = 0;
            }
            if (idx !== focusedIdx) {
                this.setState({
                    focusedIdx: idx
                })
                this.onFocusChanged(idx);
            }
            break;
        case KEY.RIGHT: // right
            const lastIdx = this.isMenuAdded? list.length: list.length - 1;
            idx = focusedIdx + 1;
            
            if (idx > lastIdx) {
                idx = lastIdx;
            }
            if (idx !== focusedIdx) {
                this.setState({
                    focusedIdx: idx
                })
                this.onFocusChanged(idx);
            }
            break;
        case KEY.ENTER:
            const vod = vodList[focusedIdx];
            if (!vod) {
                return;
            }
            this.onSelectVod(vod);
            break;
        default:
            break;
        }
    }

    onFocusChanged = (idx) => {
        const { vodList, focusedIdx } = this.state;
        const vod = vodList[focusedIdx];
        if (!vod) {
            return;
        }
        if (vod.isRecommend) {
            this.setState({
                menuFocused: true
            })
        } else {
            this.setState({
                menuFocused: false
            });
            this.updateDetail(idx);
        }
    }

    update = async ({ page, isDown }) => {
        // console.log('update', page);

        let vodList = [];

        const { 
            totalPage: prevTotalPage, 
            totalVod: prevTotalVod,
            focusedIdx: currentIdx,
            currentPage
        } = this.state;
        if (page > prevTotalPage) {
            console.log(' page > prevTotalPage');
            const realTotalVod = prevTotalVod + 1;  
            const realTotalPage = Math.ceil(realTotalVod / MAX_PAGE_ITEM);    
            if (realTotalPage === page) {
                vodList.push({
                    isRecommend: true
                });
                this.setState({
                    menuFocused: true,
                    currentPage: page,
                    vodList,
                    focusedIdx: 0,
                    noHeroImg: true
                })
            }
        } else {
            console.log(' page <= prevTotalPage');
            const result = await MeTV.request035({page_no: page, entry_no: MAX_PAGE_ITEM});
            let { 
                page_tot: totalPage, 
                page_no: currentPage, 
                purchase_tot: totalVod, 
                purchaseList: list
            } = result;

            vodList = list? list.map((vod, idx) => {
                const {
                    title,
                    poster: imgURL,
                    epsd_id: epsdId,
                    sris_id: srisId,
                    prod_id: prodId,
                    epsd_rslu_id: epsdRsluId,
                    adult,
                    level
                }  = vod;
                console.log('vod:', vod);
                const bAdult = adult === 'Y';
                return {
                    title,
                    imgURL,
                    epsdId,
                    srisId,
                    prodId,
                    bAdult,
                    epsdRsluId,
                    level: Number(level)
                }
            }): [];
            // 최대개수가 아닐경우 recommend 추가
            if (vodList.length !== MAX_PAGE_ITEM) { 
                vodList.push({
                    isRecommend: true
                });
            }

            let focusedIdx = -1;
            if (isDown === undefined) {
                focusedIdx = currentIdx < 0 ? 0 : currentIdx;
            } else if (isDown) {
                focusedIdx = currentIdx % 3;
            } else if(!isDown) {
                focusedIdx = (currentIdx % 3) + 3;
                if (focusedIdx > vodList.length - 1) {
                    focusedIdx = vodList.length -1;
                }
            }

            const vod = focusedIdx !== -1? vodList[focusedIdx]: null;
            if (!vod || vod.isRecommend) {
                return;
            }

            const param = {
                menu_id: this.menuId,
                epsd_id: vod.epsdId,
                sris_id: vod.srisId,
                search_type: 1 // 1: epsd_id 기준, 2: epsd_rslu_id
            };
            const details = await NXPG.request010(param);
            // console.log('vod 디테일 정보', details);

            // vod 디테일 정보 
            const defaultInfo = {
                heroImg: '',
                actors: '',
                openYear: '',
                playTime: '',
                title: '',
                age: '',
                res: '',
                sound: '',
                director: '',
                multiLang: false,
                series: false,
            }
            const vodDetailInfo = details.contents? {
                heroImg: details.contents.bg_img_path,
                actors: details.contents.actor,
                openYear: details.contents.open_yr,
                playTime: details.contents.play_tms_val,
                title: details.contents.title,
                age: details.contents.wat_lvl_cd,
                res: details.contents.rslu_typ_cd,
                sound: details.contents.snd_typ_cd,
                director: details.contents.director,
                multiLang: details.contents.epsd_rslu_info.mtx_capt_yn === 'Y',
                series: details.contents.sris_typ_cd === '01'
            }: defaultInfo;
    
            const noHeroImg = !vodDetailInfo.heroImg;
            const isDark = details.contents.dark_img_yn === 'Y';
           
            this.setState({
                totalPage: parseInt(totalPage, 10),
                currentPage: parseInt(page, 10),
                totalVod: parseInt(totalVod, 10),
                vodList,
                focusedIdx,
                vodDetailInfo,
                noHeroImg,
                isDark
            });
            // console.log('update.vodlist', vodList);
            // console.log('defaultInfo:', details);
        }
    }

    updateDetail = async (idx) => {
        const { vodList } = this.state;
        if (idx === -1 || !vodList[idx]) {
            return;
        }
        const vod = vodList[idx];
        
        const param = {
            menu_id: this.menuId,
            epsd_id: vod.epsdId,
            sris_id: vod.srisId,
            search_type: 1 // 1: epsd_id 기준, 2: epsd_rslu_id
        };
        const details = await NXPG.request010(param);

        const defaultInfo = {
            heroImg: '',
            actors: '',
            openYear: '000000',
            playTime: '',
            title: '',
            age: '',
            res: '',
            sound: '',
            director: '',
            multiLang: false,
            series: false
        }

        const vodDetailInfo = details.contents? {
            heroImg: details.contents.bg_img_path,
            actors: details.contents.actor,
            openYear: details.contents.open_yr,
            playTime: details.contents.play_tms_val,
            title: details.contents.title,
            age: details.contents.wat_lvl_cd,
            res: details.contents.rslu_typ_cd,
            sound: details.contents.snd_typ_cd,
            director: details.contents.director,
            multiLang: details.contents.epsd_rslu_info.mtx_capt_yn === 'Y',
            series: details.contents.sris_typ_cd === '01'
        }: defaultInfo;

        const noHeroImg = !vodDetailInfo.heroImg;
        const isDark = details.contents.dark_img_yn === 'Y';

        this.setState({
            vodDetailInfo,
            noHeroImg,
            isDark
        });
    }

    goPage = (page, isDown) => {
        console.log('page, isDown', page, isDown);
        this.update({page, isDown});
    }

    downPage = () => {
        console.log('downPage');
        const { 
            currentPage, 
            totalPage, 
            vodList, 
            totalVod 
        } = this.state;
        const realTotalPage = Math.ceil((totalVod + 1) / MAX_PAGE_ITEM);
        console.log('curPage', currentPage, 'realtTotalPage', realTotalPage);
        let movePage = currentPage + 1;
        
        if (movePage > realTotalPage) {
            movePage = realTotalPage;
            console.log('못내려감', currentPage, movePage, totalPage);
        } else {
            console.log('movePage', movePage);
            this.goPage(movePage, true);
        }
    }

    upPage = () => {
        const { 
            currentPage 
        } = this.state;
        let movePage = currentPage;
        movePage = currentPage - 1;
        if (movePage < 1) {
            console.log('못올라감');
            movePage = 1;
        } else {
            this.goPage(movePage, false);
        }
    }

    onSelectVod = (vod) => {
        // console.log('vod', vod);
        if (vod.isRecommend) {
            const { myVodInfo } = this.state;
            this.movePage(PATH.MYBTV_MYVOD_RECOMMEND_LIST, {myVodInfo: myVodInfo});
        } else {
            const { vodDetailInfo } = this.state;
            if (!vodDetailInfo) {
                console.log('시즌/단편 정보 없음');
                return;
            }
            
            let path = `${PATH.MYBTV_MYVOD_DETAIL}/${vod.epsdId}/${vod.srisId}/${vod.prodId}`;
            if (vodDetailInfo.series) {
                path = `${PATH.MYBTV_MYVOD_SEASON_DETAIL}/${vod.epsdId}/${vod.srisId}/${vod.prodId}`
            }

            const param = {
                espd_id: vod.epsdId,
                sris_id: vod.srisId,
                epsd_rslu_id: vod.epsdRsluId,
                menuId: ''
            };
            console.log('param', param, vod.level);
            Utils.movePageAfterCheckLevel(path, param, vod.level);

            // if (vodDetailInfo.series) {
            //     this.movePage(`${PATH.MYBTV_MYVOD_SEASON_DETAIL}/${vod.epsdId}/${vod.srisId}/${vod.prodId}`);

            // } else {
            //     this.movePage(`${PATH.MYBTV_MYVOD_DETAIL}/${vod.epsdId}/${vod.srisId}/${vod.prodId}`);
            // }
        }

        
    }

    render() {
        const { 
            vodList, 
            totalPage, 
            totalVod, 
            currentPage, 
            focusedIdx,
            vodDetailInfo, 
            menuFocused,
            noHeroImg,
            isDark
        } = this.state;

        const realTotalPage = Math.ceil((totalVod + 1) / MAX_PAGE_ITEM);

        const heroImg = vodDetailInfo? vodDetailInfo.heroImg: '';
        const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HERO)}${heroImg}`;
        const bgClass = `wrap${(noHeroImg || menuFocused)?' default':''}${isDark?' dark':''}`;
        console.log('bgClass', img, bgClass);
        return (
            <div className={bgClass}>
                <div className="mainBg">
                    {
                        // heroImg && !menuFocused &&
                        <IMG 
                            src={img}
                            alt=""
                            loader={
                                <div style={{backgroundImage: `url(${appConfig.headEnd.LOCAL_URL}/synopsis/bg-synopsis-default.png)`,height:'100%',width:'100%',position:'fixed',zIndex:'1'}}>
                                </div>
                            }
                        />
                    }
                </div>
                <div className="possessionTotalList">
                    <p className="title">나의 소장용 VOD</p>
                    <div className="possessionListWrap">
                        <MyVodListContainer 
                            list={vodList}
                            totalPage={realTotalPage}
                            page={currentPage}
                            totalVod={totalVod}
                            ref={r=>this.container=r}
                            focusedIdx={focusedIdx}
                        />
                        { 
                            !menuFocused
                            ? <VodDetailInfo vod={vodDetailInfo}/> 
                            : (
                                <div className="recommendCon">
                                    <p className="recommendTitle">함께 볼만한 VOD</p>
                                    <p className="recommendInfo">고객님께서 구매하신 소장용 VOD를 기반으로<br/>함께 감상하면 좋을만한 콘텐츠를 추천해 드립니다.</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

class MyVodListContainer extends Component {
    constructor(props){
        super(props);
        this.state = {
            currentIdx: -1,
            page: 1
        }
        this.isMenuAdded = false;
    }

    static defaultProps = {
        page: 0,
        list: []
    }

    componentDidMount() {
        const { list } = this.props;
        const currentIdx = list.length === 0? -1: 0;
        this.setState({currentIdx});
    }

    componentWillReceiveProps(nextProps) {
        const { page: nextPage, list: nextList } = nextProps;
        const { page: curPage, list: curList } = this.props;
        if ( parseInt(nextPage, 10) !== parseInt(curPage, 10) || JSON.stringify(nextList) !== JSON.stringify(curList)) {
            const isDown = nextPage >= curPage;
            const currentIdx = nextList.length === 0? -1: isDown? 0: nextList.length -1;
            this.setState({
                currentIdx
            });
        }
    }

    renderVodList = () => {
        const { focusedIdx } = this.props;
        const { list } = this.props;
        if (!list || list.length === 0) {
            return null;
        }
        const chunkList = _.chunk(list, 3);
        const rows = [];
        let added = false;
        for (let i=0; i<2; i++ ) {
            const row = chunkList[i]? chunkList[i]: [];
            rows.push(
                <div className="listTotalWrapper" key={`row_${i}`}>
                {
                    row.map((vod, idx) => {
                        const index = i * 3 + idx;
                        if (!vod.isRecommend) {
                            return <Vod 
                                        key={`${i}_${idx}`}
                                        imgURL={vod.imgURL}
                                        focused={focusedIdx===index}
                                        bAdult={vod.bAdult}
                                    />
                        } else {
                            return <Vod
                                        key={`${i}_${idx}`}
                                        isMenu={true}
                                        imgURL={''}
                                        focused={focusedIdx===index}
                                        bAdult={vod.bAdult}
                                    />
                        }
                    })
                }
                </div>
            );
        }
        this.isMenuAdded = added;
        return rows;
    }

    render() {
        const rows = this.renderVodList();
        const { list, totalVod } = this.props;
        const { page } = this.props;
        const { focusedIdx } = this.props;
        const vod = list[focusedIdx];

        const realTotalPage = Math.ceil((totalVod + 1) / MAX_PAGE_ITEM);
        let downAffordance = false;
        if (page < realTotalPage) {
            downAffordance = true;
        }

        let isRecommend = false;
        if (vod && vod.isRecommend) {
            isRecommend = true;
        }
        let index = focusedIdx;
        if (index >= list.length) {
            index = list.length -1;
        }
        return (
            <div className={`listWrap${focusedIdx===2?' lastActive':''}`}>
                {rows}
                {list && list.length !== 0 && !isRecommend && <div className="slideCount"><span className="current">{(page - 1) * 6 + index + 1}</span> / {totalVod}</div>}
                {downAffordance && <span className="arrow"></span>}
            </div>
        )
    }
}

const Vod = ({imgURL, focused, isMenu, bAdult}) => {
    const focusClass = `csFocus${focused?' focusOn':''}`;
    const img = `${Utils.getImageUrl(Utils.IMAGE_SIZE_VER)}${imgURL}`;
    return (
        <div className={`list${isMenu?' addition': ''}`} key={0}>
            <div className={focusClass} >
                <span className="imgWrap">
                    <Img src={img} adultLevelCode={bAdult} />
                </span>
            </div>
			{/* 포스터 뒷쪽 하이라이트 */}
            <span className="imgS"></span>
        </div>
    )
}

const VodDetailInfo = ({vod}) => {
    let defaultInfo = {
        actors: '',
        openYear: '',
        playTime: null,
        title: '',
        age: null,
        res: '',
        sound: '',
        director: '',
        multiLang: false
    }
    let openYear = '';
    if (vod) {
        defaultInfo = vod;
        defaultInfo.res = getCodeName('RSLU_TYP_CD', defaultInfo.res);
        defaultInfo.sound = getCodeName('SND_TYP_CD', defaultInfo.sound);
        // openYear = defaultInfo.openYear.length !==0? moment(defaultInfo.openYear, 'YYMMDD').format('YYYY'): '';
        openYear = defaultInfo.openYear;        

    }
    const {
        actors,
        playTime,
        title,
        age,
        res,
        sound,
        director,
        multiLang
    } = defaultInfo;
    return (
        !_.isEmpty(vod) ? 
        <div className="possessionInfo">
            <p className="vodTitle">{newlineToBr(title)}</p>
            <div className="vodInfo">
				{/* 연령정보 BG처리 클래스 추가 */}
                <span className={`iconAge age${age}`}></span>
                <span className="resolution">{res}</span>
                {openYear.length !== 0 && <span className="year">{openYear}</span>}
                <span className="time">{playTime}</span>
                <span className="sound">{sound}</span>
                { multiLang && <span className="language">{"다국어"}</span> }
            </div>
            <dl className="personInfo">
                <dt>감독</dt>
                <dd>{director}</dd>
                <dt>주연</dt>
                <dd>
                    {actors}
                </dd>
            </dl>
        </div>
        :
        <div/>
    );
}



export default MyVodList;