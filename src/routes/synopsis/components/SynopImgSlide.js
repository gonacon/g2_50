import {React} from '../../../utils/common';
import PropTypes from 'prop-types';
import appConfig from 'config/app-config.js';
import Utils from '../../../utils/utils';

const IMG_WIDTH = 248; // 이미지 가로
const IMG_HEIGHT = 140; // 이미지 세로
const ITEMS = 5; // 메뉴별 아이템 개수

class SynopImgSlide extends React.Component {
    constructor(props) {
        super(props);

        this.itemWidth = this.props.width; // 슬라이드 가로 폭
        this.itemHeight = this.props.height; // 슬라이드 세로 폭
        this.itemMargin = 40; // 슬라이드 간격
        this.items = ITEMS; // 한 화면의 슬라이드 개수

        this.state = {
            slideTo: 0,
            loadFocus: 0,
            focused: false,
            slideItem: this.props.item,
            type: this.props.type
        }
    }
 
    render() {        
        let slideList = this.state.slideItem.map((item, i) => {
            let style = {
                backgroundImage: "url(" + item.img_path + ")"
            };
            let title = null;
            switch(this.props.type) {
                case 'corner':
                    title = item.cnr_nm;
                break;
                case 'preview': case 'special':
                    title = item.title;
                break;
            }
            return (
                <SynopImgSlideList
                    image = {item.img_path}
                    title = {title}
                    style = {style}
                    key = {i}
                    index = {i}
                    maxLength = {this.state.slideItem.length}
                    slideTo = {this.state.slideTo}
                    focused = {this.state.focused}
                    loadFocus = {this.state.loadFocus}
                    onLoadFocus = {this.onLoadFocus}
                    items = {this.items}
                    width = {this.props.width}
                    height = {this.props.height}
                />
            )
        });

        const slideWrap = `slideWrap${this.state.focused ? " activeSlide": " "}`;
        let mainTitle = null;
        switch(this.state.type) {
            case 'preview': mainTitle = '예고편'; break;
            case 'corner': mainTitle = '코너별 영상'; break;
            case 'special': mainTitle = '스페셜 영상'; break;
        }
        return (
            <div className="contentGroup">
                <div className={this.props.slideType}>
                    <div className={this.props.titleStyle}>{mainTitle}</div>
                    <div className={slideWrap + this.props.slideWrap}>
                        <div className={"slideCon " + this.props.slideCon} id={this.props.id}>
                            <div className="slideWrapper" style={{'--page':this.state.slideTo,'width':(this.state.slideItem.length * this.itemWidth) + (this.state.slideItem.length * this.itemMargin)}}>
                                {slideList}
                            </div>
                        </div>
						<div className="slideCount"><span className="current">{this.state.loadFocus+1}</span> / {this.state.slideItem.length}</div>
                        <div className="slideLeft"></div>
                        <div className="slideRight"></div>
                    </div>
                </div>
            </div>
        )
    }
}

class SynopImgSlideList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            
        }
    }

    onFocus = (idx) => {
        this.props.onLoadFocus(idx);
    }
    
    render() {
        return (
            <div className={this.props.index < this.props.item || this.props.index >= this.props.maxLength - this.props.item ? "slide":"slide"}>
                <div className="csFocus">
                    <img src={Utils.getImageUrl(Utils.IMAGE_SIZE_VER) + this.props.image} width={this.props.width} height={this.props.height} alt="" />
                    <span className="videoText">{this.props.title}
                        <span className="blurImg" style={this.props.style} width={this.props.width} height={this.props.height}></span>
                    </span>
                </div>
            </div>
        )
    }
}

export default SynopImgSlide;