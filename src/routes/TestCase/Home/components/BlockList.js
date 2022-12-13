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

class BlockList extends Component {
    renderBlockList = (show, blockIdx) => {
        const {
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
            switch(slideType) {
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
                    return (
                        <BlockMenu
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
        const { innerRef } = this.props;
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

	render() {
		const {
			list,
			onSelect,
			onBlurSlider,
			onOapPlayState,
			setFm,
			isHome,
		} = this.props;

		return (list && list.length !== 0)? (
            <G2AEDBannerSlider 
                id="banner"
				autoPlay={true}
				duration={80}
				onSelect={onSelect}
				onFocusSlider={this.onFocused}
				onBlureSlider={onBlurSlider}
				onOapPlayState={onOapPlayState}
				dataList={list}
				setFm={setFm}
				isHome={isHome}
                ref={r=>this.slider=r}
			>
				{list.map((banner, idx) => (
					<G2NaviBanner key={idx}
						imgs={banner.imgs}
						link={banner.link}
						isSingle={banner.isSingle}
						isOAP={true} />
				))}
			</G2AEDBannerSlider>
		): null;
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
                anchor={r=>this.anchor=r}
                content={r=>this.content=r}
                onSlideFocus={this.onFocused}
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
                            onSelect={()=>{}}
                            
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
                anchor={r=>this.anchor=r}
                content={r=>this.content=r}
                onSlideFocus={this.onFocused}
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
                anchor={r=>this.anchor=r}
                content={r=>this.content=r}
                onSlideFocus={this.onFocused}
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
                type={SlideType.MENU_BLOCK}
                title={title}
                anchor={r=>this.anchor=r}
                content={r=>this.content=r}
                onSlideFocus={this.onFocused}
                // menuBlockClass={''}
            >
				{list.map((item, itemIdx) =>{
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
                anchor={r=>this.anchor=r}
                content={r=>this.content=r}
                onSlideFocus={this.onFocused}
            >
				{
                    list.map((item, itemIdx) =>{
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