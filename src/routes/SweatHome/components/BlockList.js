import React, { Component, Fragment } from 'react';
import FM from 'Supporters/navi';
import { ContentGroup } from 'Module/ContentGroup';
import {
    G2AEDContentSlider,
    G2NaviSlideMyVOD,
    G2SlideRecentVOD,
    G2MenuBlockSlider,
    G2EventSlider,
    G2AEDBannerSlider,
    G2NaviBanner,
    SlideType
} from 'Module/G2Slider';
import constants from 'Config/constants';
import { CTSInfo } from 'Supporters/CTSInfo';
import Utils from 'Util/utils';
import { Core } from 'Supporters';
import isEmpty from 'lodash/isEmpty';

const { CODE: GNB_CODE } = constants;
// 메뉴블록에 장르별 클래스 부여
const getMenuBlockClass = (gnbTypeCode) => {
    const classnames = {
        [GNB_CODE.GNB_HOME]: 'homeGenre',
        [GNB_CODE.GNB_MOVIE]: 'movieGenre',
        [GNB_CODE.GNB_TV]: 'tvGenre',
        [GNB_CODE.GNB_ANI]: 'animationGenre',
        [GNB_CODE.GNB_KIDS]: 'kidsGenre',
        [GNB_CODE.GNB_DOCU]: 'lifeGenre',
        [GNB_CODE.GNB_SENIOR]: 'movieGenre',
    }
    return classnames[gnbTypeCode] || '';
}

class BlockList extends Component {
    renderBlockList = (show, blockIdx) => {
        const {
            gnbTypeCode,
            blocks,
            setFm,
        } = this.props;
        const blockList = blocks.map((block, idx) => {
            const {
                title,
                slideType,
                list
            } = block;
            const key = `${blockIdx}_${idx}`;
            switch (slideType) {
                case SlideType.RECENT_VOD:
                    return (
                        <BlockRecentVod
                            title={title}
                            list={list}
                            key={key}
                            id="blocks"
                            idx={idx}
                            setFm={setFm}
                            onFocused={this.props.onFocused}
                        />
                    );
                case SlideType.HORIZONTAL:
                    return (
                        <BlockWide
                            title={title}
                            key={key}
                            list={list}
                            id="blocks"
                            idx={idx}
                            setFm={setFm}
                            onFocused={this.props.onFocused}
                        />
                    );
                case SlideType.TALL:
                    return (
                        <BlockTall
                            title={title}
                            list={list}
                            key={idx}
                            id="blocks"
                            idx={idx}
                            setFm={setFm}
                            onFocused={this.props.onFocused}
                        />
                    );
                case SlideType.MENU_BLOCK:
                    const className = getMenuBlockClass(gnbTypeCode);
                    return (
                        <BlockMenu
                            className={className}
                            title={title}
                            list={list}
                            key={key}
                            id="blocks"
                            idx={idx}
                            setFm={setFm}
                            onFocused={this.props.onFocused}
                        />
                    );
                case SlideType.EVENT:
                case SlideType.EVENT_COUPLE:
                case SlideType.EVENT_TRIPLE:
                    return (
                        <BlockEvent
                            type={slideType}
                            title={title}
                            list={list}
                            key={key}
                            id="blocks"
                            idx={idx}
                            setFm={setFm}
                            onFocused={this.props.onFocused}
                        />
                    );
                default: break;
            }
        });
        return blockList;
    }

    render() {
        let blockList = [];
        blockList.push(...this.renderBlockList(true, 0));
        return <Fragment>
            {blockList}
        </Fragment>
    }
}

class Banner extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    componentDidMount() {
        const {
            innerRef,
        } = this.props;
        if (innerRef) {
            innerRef(this.slider);
        }
    }

    onFocused = (content) => {
        const { onFocused, id, idx } = this.props;
        if (onFocused) {
            onFocused(id, idx, content);
        }
    }

    onSelect = (childIdx) => {
        const bannerInfo = this.props.list[childIdx];
        const { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId } = bannerInfo;
        const data = { callUrl, callTypeCode, bannerDetailTypeCode, shortcutEpisodeId, shortcutSeriesId, synopsisTypeCode, vasId, vasItemId, vasServiceId };
        console.log('bannerInfo', bannerInfo);
        if ((constants.CALL_TYPE_CD.APP !== callTypeCode) && isEmpty(callUrl.trim())) {
            Core.inst().showToast('call_url 필드가 비어 있습니다. H/E 이슈');
        } else {
            const isDetailedGenreHome = true;  // 세부 장르홈이면 true, 아니면 fasle
            Utils.moveToCallTypeCode(data, isDetailedGenreHome);
        }
    }

    render() {
        const {
            list,
            onSelect,
            onBlurSlider,
            onOapPlayState,
            setFm,
            isHome,
            contentRef
        } = this.props;

        return (list && list.length !== 0) ? (
            <G2AEDBannerSlider
                id="banner"
                autoPlay={true}
                duration={80}
                onSelect={this.onSelect}
                onFocusSlider={this.onFocused}
                onBlureSlider={onBlurSlider}
                onOapPlayState={onOapPlayState}
                dataList={list}
                setFm={setFm}
                isHome={isHome}
                contentRef={contentRef}
                ref={r => this.slider = r}
            >
                {list.map((banner, idx) => (
                    <G2NaviBanner key={idx}
                        imgs={banner.imgs}
                        link={banner.link}
                        isSingle={banner.isSingle}
                        isOAP={true} />
                ))}
            </G2AEDBannerSlider>
        ) : null;
    }
}

class BlockRecentVod extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    onFocused = () => {
        const { onFocused, id, idx } = this.props;
        if (onFocused) {
            onFocused(id, idx, this.content);
        }
    }

    onSelect = (idx, childIdx) => {
        let slideItem = this.props.list[childIdx];
        if (!slideItem) {
            return;
        }
        CTSInfo.requestWatchVODForOthers({
            search_type: '2',
            epsd_rslu_id: slideItem.epsdRsluId,
            seeingPath: '13'	 //시청컨텐츠를 통한 VOD 시청(마이Btv-최근시청-최근시청목록)
        });
    }

    render() {
        const {
            title,
            list,
            id,
            idx,
            setFm,
        } = this.props;
        return (
            <G2AEDContentSlider
                id={id}
                idx={idx}
                setFm={setFm}
                type={SlideType.RECENT_VOD}
                rotate={true}
                title={title}
                anchor={r => this.anchor = r}
                content={r => this.content = r}
                onSlideFocus={this.onFocused}
                onSelectChild={this.onSelect}
            >
                {list.map((item, itemIdx) => {
                    return (
                        <G2SlideRecentVOD
                            idx={itemIdx}
                            key={itemIdx}
                            title={item.title}
                            imgURL={item.image}
                            bAdult={item.bAdult}
                            rate={item.rate}
                            epsdId={item.epsdId}
                            srisId={item.srisId}
                            epsdRsluId={item.epsdRsluId}
                            onSelect={() => { }}

                        />
                    );
                })}
            </G2AEDContentSlider>
        )
    }
}

class BlockWide extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    onFocused = () => {
        const { id, idx, onFocused } = this.props;
        if (onFocused) {
            onFocused(id, idx, this.content);
        }
    }

    onSelect = (idx, childIdx) => {
        const isDetailGenre = false; // TODO : 홈에서 받아와야됨.
        const vod = this.props.list[childIdx];
        const { menu_id, sris_id, epsd_id, synon_typ_cd, wat_lvl_cd } = vod;
        Utils.toSynopsis(synon_typ_cd, {
            menu_id,
            sris_id,
            epsd_id,
            wat_lvl_cd
        }, isDetailGenre);
    }

    render() {
        const {
            title,
            list,
            id,
            idx,
            setFm,
        } = this.props;
        return (
            <G2AEDContentSlider
                id={id}
                idx={idx}
                setFm={setFm}
                type={SlideType.HORIZONTAL}
                title={title}
                anchor={r => this.anchor = r}
                content={r => this.content = r}
                onSlideFocus={this.onFocused}
                onSelectChild={this.onSelect}
            >
                {list.map((item, itemIdx) => {
                    return <G2NaviSlideMyVOD
                        key={itemIdx}
                        idx={itemIdx}
                        adultLevelCode={item.adlt_lvl_cd}
                        watLevelCode={item.wat_lvl_cd}
                        title={item.title}
                        imgURL={item.image}
                        espdId={item.epsd_id}
                        srisId={item.sris_id}
                        synopsisTypeCode={item.synon_typ_cd}
                        menuId={item.menu_id}
                        productPriceId={item.prd_prc_id}
                        badge={item.badge}
                        userBadgeImgPath={item.userBadgeImgPath}
                        userBadgeWidthImgPath={item.userBadgeWidthImgPath}
                        isDetailedGenreHome={true}
                        bAdult={item.isProtection}
                    />
                })}
            </G2AEDContentSlider>
        )
    }


}

class BlockTall extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    onFocused = () => {
        const { id, idx, onFocused } = this.props;
        if (onFocused) {
            onFocused(id, idx, this.content);
        }
    }

    onSelect = (idx, childIdx) => {
        const isDetailGenre = false; // TODO : 홈에서 받아와야됨.
        const vod = this.props.list[childIdx];
        const { menu_id, sris_id, epsd_id, synon_typ_cd, wat_lvl_cd } = vod;
        Utils.toSynopsis(synon_typ_cd, {
            menu_id,
            sris_id,
            epsd_id,
            wat_lvl_cd
        }, isDetailGenre);
    }

    render() {
        const {
            title,
            list,
            id,
            idx,
            setFm,
        } = this.props;
        return (
            <G2AEDContentSlider
                id={id}
                idx={idx}
                setFm={setFm}
                type={SlideType.TALL}
                title={title}
                anchor={r => this.anchor = r}
                content={r => this.content = r}
                onSlideFocus={this.onFocused}
                onSelectChild={this.onSelect}
            >
                {list.map((item, itemIdx) => {
                    return <G2NaviSlideMyVOD
                        key={itemIdx}
                        idx={itemIdx}
                        adultLevelCode={item.adlt_lvl_cd}
                        watLevelCode={item.wat_lvl_cd}
                        title={item.title}
                        imgURL={item.image}
                        espdId={item.epsd_id}
                        srisId={item.sris_id}
                        synopsisTypeCode={item.synon_typ_cd}
                        menuId={item.menu_id}
                        productPriceId={item.prd_prc_id}
                        badge={item.badge}
                        userBadgeImgPath={item.userBadgeImgPath}
                        userBadgeWidthImgPath={item.userBadgeWidthImgPath}
                        isDetailedGenreHome={true}
                        bAdult={item.isProtection}
                    />
                })}
            </G2AEDContentSlider>
        )
    }
}

class BlockMenu extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    onFocused = () => {
        const { id, idx, onFocused } = this.props;
        if (onFocused) {
            onFocused(id, idx, this.content);
        }
    }

    onSelect = (idx, childIdx) => {
        const {
            list,
            title
        } = this.props;
        const menu = list[childIdx];
        if (!menu) {
            return;
        }

        const {
            gnbTypeCode,
            menu_id: menuId,
            blockTypeCode,
            limitlevelYN,
            menuExpsPropCode,
            scn_mthd_cd,
            title: menuTitle,
            cwInfo,
            prc_typ_cd
        } = menu;

        const path = blockTypeCode === '30' ? constants.DETAIL_GENRE_HOME : constants.HOME;
        const level = limitlevelYN === 'Y' ? 19 : 0;
        const isCW = scn_mthd_cd === '501' || scn_mthd_cd === '502';

        let param = {
            gnbTypeCode,
            menuId,
            depth1Title: title,
            depth2Title: menuTitle,
            isDetailedGenreHome: true,
            certificate: true,
            cwGridCall: isCW,
            cwInfo: isCW ? cwInfo : ''
        };

        console.error('prc_typ_cd', prc_typ_cd, this.props.list);

        if (prc_typ_cd === constants.PRD_TYP_CD.PPM) {
            Utils.moveMonthlyPage(constants.MONTHLY_AFTER, menu);
        } else {
            Utils.goToPageCertification({ menuExpsPropCode, path, param, level });
        }
    }

    render() {
        const {
            title,
            list,
            id,
            idx,
            setFm,
            className
        } = this.props;

        return (
            <G2AEDContentSlider
                id={id}
                idx={idx}
                setFm={setFm}
                type={SlideType.MENU_BLOCK}
                title={title}
                anchor={r => this.anchor = r}
                content={r => this.content = r}
                onSlideFocus={this.onFocused}
                menuBlockClass={className}
                onSelectChild={this.onSelect}
            >
                {list.map((item, itemIdx) => {
                    return <G2MenuBlockSlider
                        key={itemIdx}
                        idx={itemIdx}
                        title={item.title}
                        images={item.imgs}
                        adultLevelCode={item.adlt_lvl_cd}
                        watLevelCode={item.wat_lvl_cd}
                        menuId={item.menu_id}
                        gnbTypeCode={item.gnbTypeCode}
                        bannerExposure={item.bannerExposure}
                        bAdult={item.isProtection}
                    />
                }
                )}
            </G2AEDContentSlider>
        );
    }
}

class BlockEvent extends Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    onFocused = () => {
        const { id, idx, onFocused } = this.props;
        if (onFocused) {
            onFocused(id, idx, this.content);
        }
    }

    onSelect = (idx, childIdx) => {
        const isDetailGenre = false;
        const event = this.props.list[childIdx];
        if (!event) {
            return;
        }

        const { callUrl } = event;
        if (!callUrl.trim()) {
            Core.inst().showToast('H/E: call_url 필드가 없음.');
        } else {
            Utils.moveToCallTypeCode(event, isDetailGenre);
        }
    }

    render() {
        const {
            title,
            list,
            id,
            idx,
            setFm,
            type
        } = this.props;

        return (
            <G2AEDContentSlider
                id={id}
                idx={idx}
                setFm={setFm}
                type={type}
                title={title}
                anchor={r => this.anchor = r}
                content={r => this.content = r}
                onSlideFocus={this.onFocused}
                onSelectChild={this.onSelect}
            >
                {
                    list.map((item, itemIdx) => {
                        return (
                            <G2EventSlider
                                key={itemIdx}
                                idx={itemIdx}
                                title={item.title}
                                menuId={item.menu_id}
                                image={item.image}
                                expsRsluCd={item.expsRsluCd}
                            />
                        )
                    })
                }
            </G2AEDContentSlider>
        );
    }
}


export {
    BlockList as default,
    Banner
}