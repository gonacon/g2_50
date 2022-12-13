import React, { Component } from 'react';
// import { HorizontalList } from 'Navigation';
import 'Css/myBtv/my/RecommendVOD.css';
import { G2SlideTop3VOD } from 'Module/G2Slider';
import FM from '../../../supporters/navi';

class Top3VODList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focused: false,
            bTitleUp: false
        };

        this.anchor = null;

        this.onFocusKeyDown = this.onFocusKeyDown.bind(this);
    }

    static defaultProps = {
        list: [],
        bShow: false
    }

    onFocused = () => {
        this.setState({ focused: true });
        const { scrollTo } = this.props;
        if (scrollTo && typeof scrollTo === 'function') {
            scrollTo(this.anchor);
        }
    }

    onBlured = () => {
        this.setState({ focused: false });
    }

    onSelectVOD = (idx) => {



    }

    onFocusChanged = (idx) => {
        let active = (idx === 0 || idx === 1);
        this.setState({ bTitleUp: active });
    }

    onFocusKeyDown = (event, childIdx) => {
        if (event.keyCode === 13) {
            const { onSelect } = this.props;
            if (typeof onSelect === 'function') {
                onSelect('recommendVod', childIdx);
            }
        }
    }

    componentWillUnmount() {
        const { setFm } = this.props;
        setFm('top3Vod', null);
    }

    componentDidMount() {
        const fm = new FM({
            id: "top3Vod",
            moveSelector: '.slideWrapper .slide',
            focusSelector: '.csFocus',
            row: 1,
            col: 3,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: 2,
            bRowRolling: false,
            onFocusContainer: this.onFocused,
            onBlurContainer: this.onBlured,
            onFocusChild: this.onFocusChanged,
            onFocusKeyDown: this.onFocusKeyDown
        });
        const { setFm } = this.props;
        setFm('top3Vod', fm);
    }

    componentWillReceiveProps(nextProps) {
        const { setFm } = this.props;
        if (nextProps.bShow) {
            const fm = new FM({
                id: "top3Vod",
                moveSelector: '.slideWrapper .slide',
                focusSelector: '.csFocus',
                row: 1,
                col: 3,
                focusIdx: 0,
                startIdx: 0,
                lastIdx: 2,
                bRowRolling: false,
                onFocusContainer: this.onFocused,
                onBlurContainer: this.onBlured,
                onFocusChild: this.onFocusChanged,
                onFocusKeyDown: this.onFocusKeyDown
            });
            setFm('top3Vod', fm);
        } else {
            setFm('top3Vod', null);
        }
    }

    render() {
        const { list, bShow, onSelect } = this.props;
        const { bTitleUp } = this.state;

        const vods = list.map((vod, idx) => {
            // const { title, imgURL, bAdult } = this.props;
            return <G2SlideTop3VOD title={vod.title} imgURL={vod.imgURL} idx={idx} key={idx} onSelect={onSelect} onFocusChanged={this.onFocusChanged} />
        });

        const groupClass = `contentGroup${bTitleUp ? ' activeSlide' : ''}`;

        return (
            bShow ?
                <div id="top3Vod" className={groupClass} ref={r => this.anchor = r}>
                    <div className="wrapRecommend">
                        <div className="recommendItem">
                            <div className="title">인기 VOD TOP 3</div>
                            <div className="slideWrap">
                                <div className="slideCon">
                                    <div className="slideWrapper">
                                        {vods}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="recommendCon">
                            <p className="contentTitle">고객님만의 VOD 콘텐츠를<br />쉽고 편하게 즐겨보세요.</p>
                            <p className="contentText">
                                마이 B tv에서는 고객님의 VOD 콘텐츠 서비스 이용에 따라<br />
                                <strong>최근시청 VOD / 나의 소장용 VOD / VOD 찜목록</strong>영역을 맞춤 제공하여<br />
                                고객님만의 VOD 콘텐츠를 쉽게 관리하고 편리하게 즐길 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
                : null
        );
    }
}

export default Top3VODList;
