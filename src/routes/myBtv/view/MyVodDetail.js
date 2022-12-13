import React, { Component } from 'react';
import PageView from 'Network/../PageView.js';
// import { Focusable, HorizontalList, VerticalList } from 'Navigation';
import { G2NaviSlider, G2SlideMovie, G2SlideActorImage, G2SlideActorText, SlideType } from 'Module/G2Slider';
import { newlineToBr } from '../../../utils/utils';
// import { NXPG } from 'Network';
// import appConfig from 'Config/app-config';
import 'Css/myBtv/VOD/PossessionVODDetail.css';
import 'Css/synopsis/SynopShort.css';
// import { NXPG010 } from '../testData/myVodDetail';
import Core from 'Supporters/core';
import { NXPG } from 'Network';
// import { createDummyPromise } from 'Util/utils';
import Utils from 'Util/utils';
import FM from 'Supporters/navi';
import keyCodes from 'Supporters/keyCodes';
import constants from 'Config/constants';
import { CTSInfo } from 'Supporters/CTSInfo';
import appConfig from 'Config/app-config';

// let playInfo = {
//     synopsis_type: '01',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
//     playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
//     ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
//     ynSpecial: 'N',         //스페셜영상 재생 여부 (Y/N)
//     playOption: 'normal',   //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
//                             //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
//     kids_yn: 'N',           //키즈 시놉 여부(Y/N)
//     ynSerise: 'N',          //시리즈 여부(Y/N)
//     isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
//     isAll: 'N',             //전편 구매 여부(Y/N)    
//     epsd_id: '',            //에피소드ID
// };

const KEY = keyCodes.Keymap;
// const request010 = createDummyPromise( NXPG010 );

// const log = console.log;
const log = function(){}

class MyVodDetail extends PageView {
    constructor(props) {
        super(props);
        this.state = {
            menuId: 'play',
            specialMovieList: [], //new Array(12).fill(0),
            cornerMovieList: [], //new Array(8).fill(0),
            actorList: [], //new Array(8).fill(0),

            bg: '',
            imageTitle: '',
            textTitle: '',
            story: ''
        }
        this.vodInfo = null;

        this.nxpg010 = null;
    }

    componentDidMount() {
        const { showMenu } = this.props;
        showMenu(false);

        const { match: { params } } = this.props;
        const vod = {...params };
        this.update(vod);

        // set fm
        const focusList = [
            { key: 'specialMovieList', fm: null },
            { key: 'cornerMovieList', fm: null },
            { key: 'actorList', fm: null },
            { key: 'bottomButtons', fm:null }
        ];
        this.declareFocusList(focusList);
        
        const bottomButtons = new FM({
            id: 'bottomButtons',
            containerSelector: '.contentBtn',
            focusSelector: '.csFocus',
            row: 1,
            col: 2,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 1,
            onFocusChild: this.onFocusButton,
            onFocusKeyDown: this.onFocusKeyDownBottomButtons
        });
        
        this.setFm('bottomButtons', bottomButtons);
        this.buttonMenuIdList = [];
    }

    onFocusKeyDownBottomButtons = (event) => {
        const { menuId } = this.state;
        switch(event.keyCode) {
            case KEY.UP:
                if (menuId === 'play' || menuId === 'synopsis') {
                    return true;
                }
                break;
            case KEY.ENTER:
                if (menuId === 'play') {
                    this.onSelectPlay();
                } else if (menuId === 'synopsis') {
                    this.onDetailView();
                }
                break;
            default:
                break;
        }
    }

    // 단편이므로 
    onSelectPlay = async () => {
        console.log('재생하기 버튼선택', this.nxpg010);
        let playInfo = {
            synopsis_type: '05',    // 05 기타
            playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
            ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
            ynSpecial: 'N',         //스페셜영상 재생 여부 (Y/N)
            playOption: 'normal',   //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
                                    //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
            kids_yn: 'N',           //키즈 시놉 여부(Y/N)
            ynSerise: 'N',          //시리즈 여부(Y/N)
            prd_prc_id: this.vodInfo.prodId,
            seeingPath: '21',         // 소장용 VoD를 통한 시청
        };

        const playResult = await new Promise((res, rej) => {
            CTSInfo.requestWatchVOD( {nxpg010: this.nxpg010, playInfo}, (result)=> {
                res(result);
            })
        });
    }

    onDetailView = () => {
        // console.log('상세보기 버튼선택', this.vodInfo);
        this.movePage(constants.SYNOPSIS, {
            epsd_id: this.vodInfo.epsdId,
            sris_id: this.vodInfo.srisId,
            epsd_rslu_id: null,
            menuId: ''
        });
    }

    onSelectActor = (containerIdx, idx) => {
        const { actorList, bg } = this.state;
        const actor = actorList[idx];
        if (actor) {
            // console.log('배우선택', actor);
            if (actor.actorId && actor.actorId.length !== 0) {
                this.movePage(constants.SYNOPSIS_PERSONAL, {
                    prs_id: actor.actorId,
                    bg_img_path: bg
                });
            } else {
                Core.inst().showToast('인물정보 없음');    
            }
            
        } else {
            Core.inst().showToast('인물정보 없음');
        }
        
    }

    onSelectSpecialMovie = (containerIdx, idx) => {
        const { specialMovieList } =  this.state;
        const specialMovie = specialMovieList[idx];
        if (specialMovie) {
            console.log('특별영상 선택:', specialMovie);
            const playInfo = {
                synopsis_type: '05',    //진입한 시놉시스 유형(01 : 단편 시놉, 02 : 시즌 시놉, 03 : 게이트웨이 시놉, 04 : 커머스 시놉)
                playType: CTSInfo.PLAYTYPE.VOD_PLAY,    //VOD_PLAY : 일반, VOD_CORNER : 코너별 보기, VOD_ALL_CORNER : 코너별 모아보기
                ynTeaser: 'N',          //예고편 재생 여부 (Y/N)
                playOption: 'normal',   //normal : 일반 시놉에서 재생할 경우, next : 재생 종료 후 다음 회차 재생
                                        //other : 재생 중 playbar를 통한 다른 회차 재생, smartRcu : SmartRCU를 통한 이어보기
                ynSerise: 'N',          //시리즈 여부(Y/N)
                isCatchUp: 'N',         //시리즈 인 경우, MeTV의 isCatchUp 전달
                isAll: 'N',             //전편 구매 여부(Y/N)    
                epsd_id: '',            //에피소드ID
                epsd_rslu_id: '',        //에피소드 해상도ID
                ynSpecial: 'Y',
                special_start_index: idx,
                seeingPath: '21',         // 소장용 VoD를 통한 시청
            }
            var obj = {
                nxpg010: this.nxpg010,
                playInfo: playInfo
            };
            CTSInfo.requestWatchVOD(obj, ()=>{
                console.log('스페셜무비 시청 종료 콜백');
            })
        }
    }

    onSelectCornerMovie = (containerIdx, idx) => {
        const { cornerMovieList } = this.state;
        const cornerMovie = cornerMovieList[idx];
        if (cornerMovie) {
            console.log('코너영상 선택:', cornerMovie);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { match: { params }} = nextProps;
        const { match: { params: before } } = this.props;
        if (JSON.stringify(before) === JSON.stringify(params)) {
            return;
        }
        const vod = { ...params };
        this.update(vod);
    }

    update = async ({epsdId, srisId, prodId}) => {
        log('vodDetail.update');
        this.vodInfo = {
            epsdId,
            srisId,
            prodId
        };
        const param = {
            epsd_id: epsdId,
            sris_id: srisId,
            search_type: 1 // epsd_id 기준이면 1, rslu 기준이면 2
        };
        const result010 = await NXPG.request010(param);
        this.nxpg010 = result010;
        // const result010 = await request010(param);
        console.log('단편 result010:', result010);

        const {
            // epsd_id: _epsdId,
            // sris_id: _srisId,
            bg_img_path: bg,
            sris_snss_cts: story,
            title: textTitle,
            title_img_path: imageTitle,
            special,
            corners,
            peoples
        } = result010.contents;

        console.log('special', special);

        const specialMovieList = (Array.isArray(special) && special.length !== 0)? special.map((movie, idx) => {
            return {
                title: movie.title,
                epsdRsluId: movie.spsd_rslu_id,
                img: movie.img_path,
                typeName: movie.pcim_addn_typ_nm
            };
        }): null;

        const cornerMovieList = (Array.isArray(corners) && corners.length !== 0)? corners.map((movie, idx) => {
            return {
                id: movie.cnr_id,
                name: movie.cnr_name,
                epsdRsluId: movie.epsd_rslu_id,
                img: movie.img_path,
            };
        }): null;

        const actorList = (Array.isArray(peoples) && peoples.length !== 0)? peoples.map((people, idx) => {
            return {
                actorId: people.prs_id,
                img: people.img_path,
                name: people.prs_nm,
                role: people.prs_role_nm,// 역할( 감독, 주연... )
                part: people.prs_plrl_nm // 배역( 극중 누구 )
            }
        }): null;

        this.buttonMenuIdList.push('play');
        if (specialMovieList) {
            this.buttonMenuIdList.push('special');
        } 
        if (cornerMovieList) {
            this.buttonMenuIdList.push('corner');
        }
        if (actorList) {
            this.buttonMenuIdList.push('actors');
        }
        this.buttonMenuIdList.push('synopsis');

        // 하단 fm 설정 
        const fm = this.getFm('bottomButtons');
        if (fm) {
            fm.setListInfo({row:1, col:this.buttonMenuIdList.length, curIdx:0, firstIdx:0, lastIdx:this.buttonMenuIdList.length-1, focusIdx:0});
            this.setFocus('bottomButtons');
        }

        const newState = {
            bg,
            textTitle,
            imageTitle,
            story,
            specialMovieList,
            cornerMovieList,
            actorList
        };
        this.setState(newState, () => {
            this.setFocusEnable('specialMovieList', false);
            this.setFocusEnable('cornerMovieList', false);
            this.setFocusEnable('actorList', false);
        });
    }

    // onSelectButton = (key) => {
    //     console.log( '선택:', key);
    // }

    onFocusButton = (btnIdx) => {
        const id = this.buttonMenuIdList[btnIdx];
        if (id === this.state.menuId) {
            return;
        }

        switch(this.state.menuId) {
            case 'special': this.setFocusEnable('specialMovieList', false); break;
            case 'corner': this.setFocusEnable('cornerMovieList', false); break;
            case 'actors': this.setFocusEnable('actorList', false); break;
            default: break;
        }
        
        this.setState({
            menuId: id,
        }, () => {
            switch(id) {
                case 'play': this.focusIndex = 0; break;
                case 'special': this.setFocusEnable('specialMovieList', true); break;
                case 'corner': this.setFocusEnable('cornerMovieList', true); break;
                case 'actors': this.setFocusEnable('actorList', true); break;
                case 'synopsis': this.focusIndex = 0; break;
                default: break;
            }
        })
    }

    getSpecialMovieList = () => {
        const { specialMovieList: list } = this.state;
        if (!list) return null;
        return (
            <G2NaviSlider
                id="specialMovieList"
                setFm={this.setFm}
                type={SlideType.MOVIE}
                bShow={list.length!==0}
                onSelectChild={this.onSelectSpecialMovie}
            >
            {
                list.map((vod, idx) => {
                    return (
                        <G2SlideMovie 
                            title={vod.title}
                            imgURL={vod.img}
                            idx={idx}
                        />
                    )
                })
            }
            </G2NaviSlider>
        );
    }

    getCornerMovieList = () => {
        const { cornerMovieList: list } = this.state;
        if (!list) return null;
        return (
            <G2NaviSlider 
                id="cornerMovieList"
                setFm={this.setFm}
                type={SlideType.MOVIE} 
                bShow={list.length!==0}
                onSelectChild={this.onSelectCornerMovie}
            >
            {
                list.map((vod, idx) => {
                    return (
                        <G2SlideMovie 
                            title={`코너영상${idx}`}
                            imgURL={""}
                            idx={idx}
                        />
                    )
                })
            }
            </G2NaviSlider>
        );
    }

    getActorList = () => {
        const { actorList: list } = this.state;
        if (!list) return null;
        const bImage = false;
        return (
            <G2NaviSlider 
                id="actorList"
                setFm={this.setFm}
                type={SlideType.ACTOR_TEXT}
                bShow={list.length!==0}
                onSelectChild={this.onSelectActor}
            >
            {
                bImage
                ? list.map((actor, idx) => {
                    return (
                        <G2SlideActorImage
                            key={idx}
                            imgURL={actor.img}
                            name={actor.name}
                            cast={actor.role}
                            part={actor.part}
                            idx={idx}
                        />
                    );
                }) 
                : list.map((actor, idx) => {
                    return (
                        <G2SlideActorText 
                            key={idx}
                            name={actor.name}
                            part={actor.part}
                            role={actor.role}
                            idx={idx}
                        />
                    );
                })
            }
            </G2NaviSlider>
        );
    }

    getButtonList = () => {
        const { specialMovieList, cornerMovieList, actorList, menuId } = this.state;
        const buttonList = [];
        let buttonIndex = 0;
        buttonList.push( 
            <Button 
                label="재생하기"
                className="csFocus playBtn btnStyle"
                menuId="play"
                key="play"
                onSelect={this.onSelectButton}
                onFocus={this.onFocusButton}
                isCurrentMenu={menuId === "play"}
                focused={menuId === "play"}
                idx={buttonIndex++}
                navDefault
            />
        );
        if (specialMovieList && specialMovieList.length !== 0) {
            buttonList.push(
                <Button
                    label="스페셜영상"
                    className="csFocus btnStyle arrow"
                    menuId="special"
                    key="special"
                    isCurrentMenu={menuId === "special"}
                    focused={menuId === "special"}
                    onSelect={this.onSelectButton}
                    onFocus={this.onFocusButton}
                    idx={buttonIndex++}
                    arrow={true}
                />
            );
        }
        if (cornerMovieList && cornerMovieList.length !== 0) {
            buttonList.push(
                <Button
                    label="코너별영상"
                    className="csFocus btnStyle arrow"
                    menuId="corner"
                    key="corner"
                    isCurrentMenu={menuId === "corner"}
                    focused={menuId === "corner"}
                    onSelect={this.onSelectButton}
                    onFocus={this.onFocusButton}
                    idx={buttonIndex++}
                    arrow={true}
                />
            )
        }
        if (actorList && actorList.length !== 0) {
            buttonList.push(
                <Button
                    label="제작/출연진"
                    className="csFocus btnStyle arrow"
                    menuId="actors"
                    isCurrentMenu={menuId === "actors"}
                    focused={menuId === "actors"}
                    onSelect={this.onSelectButton}
                    onFocus={this.onFocusButton}
                    key="actors"
                    idx={buttonIndex++}
                    arrow={true}
                />
            )
        }
        
        buttonList.push(
            <Button 
                label="상세보기"
                className="csFocus btnStyle"
                menuId="synopsis"
                focused={menuId === "synopsis"}
                onSelect={this.onSelectButton}
                onFocus={this.onFocusButton}
                key={"synopsis"}
                idx={buttonIndex++}
            />
        )
        return buttonList;
    }

    render() {
        const buttonList = this.getButtonList();
        const { bg, imageTitle, textTitle, story, menuId } = this.state;
        const imgBg = `${Utils.getImageUrl(Utils.IMAGE_SIZE_HERO)}${bg}`;
        const imgTitle = `${Utils.getIipImageUrl(481, 158)}${imageTitle}`;
        const bNotDark = menuId === 'play' || menuId === 'synopsis';
        return (
            <div className="wrap">
				<div className="possessionVOD scrollWrap">
					<div className="mainBg">
						<img src={imgBg} alt="" className="vodBg" />
								{bNotDark && <img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-tone-01.png`} alt="" className="vodBgTone01" />}
                                {!bNotDark &&
                                    <span>
                                        <img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-tone-02.png`} alt="" className="vodBgTone02" />
                                        <img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-shape.png`} alt="" className="vodBgBox" />
                                    </span>
                                }
					</div>
					<div className="contentWrap">
						<div className="contentTop">
                            { imageTitle.length !== 0 && <img src={imgTitle} alt="" /> }
                            { imageTitle.length === 0 && <div className="logoTitle">{textTitle}</div>}
                            <div className="vodText" style={{'WebkitBoxOrient':'vertical'}} >{newlineToBr(story)}</div>
						</div>
						<div className="synopShortContent">
							<div className="synopBot">
                                { menuId === 'special' && this.getSpecialMovieList() }
                                { menuId === 'corner' && this.getCornerMovieList() }
                                { menuId === 'actors' && this.getActorList() }
							</div>
						</div>
						<div id="bottomButtons" className="contentBtn">
                                {buttonList}
						</div>
					</div>
				</div>
			</div>
        )
    }
}

class Button extends Component {
    constructor(props){
        super(props);

        this.state = {
            focused: false,
        };
    }

    static defaultProps = {
        label: '',
        bImg: false,
        menuId: '',
        isCurrentMenu: false,
        focused: false,
        arrow: false,
    }

    onSelect = () => {
        const { onSelect, menuId } = this.props;
        if( onSelect && typeof onSelect === 'function') {
            onSelect(menuId);
        }
    }

    render() {
        const { label, className, isCurrentMenu, focused, arrow } = this.props;
        const bImg = focused && arrow;
        // const { focused } = this.state;
        const focusClassName = `${className}${focused? ' focusOn':''}${isCurrentMenu?' loadFocus on':''}`;
        return (
            <span>
                <span className={focusClassName}>{label}</span>
                {bImg && <img src={`${appConfig.headEnd.LOCAL_URL}/myBtv/vod-bg-shape-arrow.png`} alt=""/>}
            </span>
        )
    }
}

export default MyVodDetail;

