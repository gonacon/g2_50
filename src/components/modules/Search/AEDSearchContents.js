import React, { Component } from 'react';
import 'ComponentCss/modules/SearchContent.css';
import FM from 'Supporters/navi';
import IME, { IME_MODE } from './IME';
import keyCodes from 'Supporters/keyCodes';
import Search from './Search';
import { CSS } from 'Network';
import { ContentGroup } from 'Module/ContentGroup';



const KEY = keyCodes.Keymap;

class AEDSearchContents extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active:  this.props.active,
            appKeyWord: this.props.appKeyWord
        }
        this.state = {
        recommendKeywords: []
        }
        // this.input = this.props;
        // const { input } = this.props;
    }

    static defaultProps = {
        alwaysActive: false
    }

    initFocus = () => {
        console.log("initFocus : ",this.props.active);
        if(this.props.active){
            this.updateRecommendKeywords();
        }


        // 이후 모든 포커스 처리는 '키'값으로 한다.
        const focusList = [
            { key: 'search', fm: null },
            { key: 'searchInput', fm: null },
            { key: 'autoCompletes', fm: null, link: { UP: 'searchInput', DOWN: null } },
            { key: 'searchHistory', fm: null, link: { UP: 'searchInput', DOWN: null } },
            { key: 'recommendKeywords', fm: null, link: { UP: 'searchInput', DOWN: null } },
            { key: 'keypad', fm: null, link: { UP: 'searchInput', DOWN: null } },
            { key: 'ImeModeSelect', fm: null, link: { UP: null, DOWN: null, LEFT: 'keypad', RIGHT: null }}
        ];
        const { addFocusList, setFm } = this.props;
        if (addFocusList) {
            addFocusList(focusList); // 포커스 리스트를 '추가' 한다.
        }

        // 포커스시 검색 활성화 / 비활성화만을 담당하는 포커스 객체
        const ioSensor = new FM({
            id: 'search',
            type: 'FAKE',
            onFocusContainer: this.onFocused,
            onFocusKeyDown: this.onSensorKeyDown
        });
        setFm('search', ioSensor);
    }

    preventDefault = (event) => {
        event.preventDefault();
    }

    activate = (bActive) => {
        const { setFocus, scrollTo,  alwaysActive, focusPrev, saveFocus } = this.props;
        if (bActive) { // 활성화시 처리 
            // IME 처리 
            IME.setEnableSoftKeyboard(false); // 가상키보드 off
            IME.setSearchMode(false);
            IME.setKeyboardMode(IME_MODE.HANGUL); // 초기값 한글모드
            IME.setChunjiinMode(2);

            this.search.setPreventEvent(true);

            // UI show
            this.setState({
                active: bActive
            }, () => {
                
                // 초기 포커스는 input 으로.
                setTimeout(() => {
                    setFocus('searchInput');
                    if (this.input) {
                        this.input.focus();
                    }
                    const wrapper = document.querySelector('#root > .wrapper');
                    if (wrapper) {
                        wrapper.scrollTop = 0;
                    }
                }, 1)

                if (!alwaysActive) {
                    let offset = 568;
                    scrollTo(this.anchor, offset);
                }
            });

            if (saveFocus) {
                saveFocus('search', 0);
            }
            this.updateRecommendKeywords();
        } else { // 비활성화시 처리
            // IME 처리 
            IME.setSearchMode(false);

            this.search.setPreventEvent(false);

            // UI hide
            this.setState({
                active: bActive
            }, () => {
                // setFocus('topButton'); // 페이지별로 지정할지 아니면 this.focusIndex 를 -1 할지...
                focusPrev();
                if (this.input) {
                    this.input.blur();
                }
            })
        }

        
    }

    // 추천 키워드 리스트 업데이트
    updateRecommendKeywords = async () => {
        if(!this.state.recommendKeywords[0]){
            const result = await CSS.request004({
                searchType: 2,
                doc_page: 10
            });
            let recommendKeywords = [];
            if (result.result === '0000') {
                const { results_keyword: list } = result;
                recommendKeywords = list.map((item, idx) => {
                    return item.keyword;
                });
            }
            this.setState({
                recommendKeywords
            });
        }
    }

    onFocused = () => {
        const { active } = this.state;
        this.activate(!active);
    }

    onInputKeyDown = (event) => {
        if (event.keyCode === KEY.UP || event.keyCode === KEY.DOWN) {
            return false;
        }
        return true;
    }

    componentWillUnmount() {
        IME.setSearchMode(false);
    }

    componentDidMount() {
        this.initFocus();
    }

    render() {
        const { 
            active,
            recommendKeywords
        } = this.state;
        const {
            setFm,
            setFocus,
            movePage,
            alwaysActive,
            appKeyWord,
            style
        } = this.props;

        const activeClass = `searchWrapper ${(alwaysActive)? '': 'searchMainWrap'}${(alwaysActive || active)? ' active': ''}`;
        return (
            <ContentGroup id="ioSensor" className="searchContent contentGroup" ref={r=>this.anchor=r} style={style}>
				<div className="contentGroup">
					<div className={activeClass}>
                        {!alwaysActive && 
						<em className="searchCharacter">
							<span className="wrapBtnText">리모컨의 <span className="icVoice"></span>혹은  ‘검색’ 키로 원하는 콘텐츠를 찾으세요</span>
						</em>
                        }
						<div id="searchInput"></div>
                        <Search
                            ref={r=>this.search=r}
                            setFm={setFm}
                            setFocus={setFocus}
                            movePage={movePage}
                            inputRef={r=>this.input=r}
                            recommendKeywords={recommendKeywords}
                            appKeyWord={appKeyWord}
                        />
					</div>
				</div>
			</ContentGroup>
        )
    }
}


export default AEDSearchContents;