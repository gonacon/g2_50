import React, { Component, Fragment } from 'react';

class ChannelInfoList extends Component {
    static defaultProps = {
        list: [],
        focusedIdx: -1
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    render () {
        const {
            list,
            focusedIdx,
            favoriteList,
            joinedList
        } = this.props;

        const infoList = list? list.map((info, idx) => {
            return (
                <ChannelInfo
                    key={idx}
                    info={info}
                    fav={favoriteList}
                    join={joinedList}
                    focused={focusedIdx === idx}
                />
            );
        }): null;
        return (
            <Fragment>
                {infoList}
            </Fragment>
        )
    }
}

class ChannelInfo extends Component {
    static defaultProps = {
        info: null,
        focused: false,
        fav: null
    };

    constructor(props) {
        super(props);

        this.state = {
            imageVisible: true
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps) || this.state.imageVisible !== nextState.imageVisible;
    }

    imageError = event => {
        this.setState({ imageVisible: false });
    }

    render () {
        const { info: channelInfo, focused, fav, join } = this.props;
        const info = channelInfo || {};
        
        let isAdult = info.rating? info.rating === '19': false;
        const chNum = info.num? info.num: 0;
        const isJoined = join? join.indexOf(chNum) !== -1: false;
        let isCharged = info.pay? info.pay: false;
        isCharged = isCharged && !isJoined;
        
        
        let isFavorite = fav? fav.indexOf(chNum) !== -1: false;
        // console.error('isFavorite', isFavorite, fav, chNum);
        const chTitle = info.name? info.name: '';
        const img = info.img? info.img.split('|')[0]: null;
        const imgPath = `file:///data/btv_home/DATA/epg/menu_image/update/${focused? 'white_': 'gray_'}${img}`;

        const focusClass = `channel${focused?' active':''}`;

        // ?????? ????????? ???????????? : ???????????? > ???????????? > ????????????
        if (isFavorite) {
            isAdult = false;
            isCharged = false;
        } else if(isAdult) {
            isCharged = false;
        }
        // console.log('%c this.state', 'display: block; padding: 10px; border: 1px solid #000; background: pink; color: red; font-size: 24px;', this.state);
        return (
            <div className={focusClass}>
                { isFavorite && <span className="fav"></span> }{/* ???????????? */}
                { isAdult && <span className="adult"></span> }{/* ???????????? */}
                { isCharged && <span className="charge"></span> }{/* ???????????? */}
                <span className="channelNum">{chNum}</span>{/* ???????????? */}

                {/* {!img && <span className="channelName">{chTitle}</span>} */}
                {/* ????????? ??????????????? ????????? ??????*/}
                {/* {img && <img src={imgPath} alt="" onError={this.imageError} /> } */}


                { !this.state.imageVisible && <span className="channelName">{chTitle}</span> }
                {/* ????????? ??????????????? ????????? ??????*/}
                { this.state.imageVisible && <img src={imgPath} alt="" onError={this.imageError} /> }
            </div>
        )
    }
}

export default ChannelInfoList;