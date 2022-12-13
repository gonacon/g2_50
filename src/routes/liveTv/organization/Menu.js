import { React } from '../../../utils/common';
import TopMenuList from './TopMenuList';

import FM from '../../../supporters/navi';

// const topMenuCnt = 2;

class Menu extends React.Component {
    focus = [];
    constructor(props) {
        super(props)
        this.state = {
            loadFocus: 0,
            focused: true,
            menuPage: 0,
            menuPrevIdx: 0,
            reservedfocus: 1,
            //keyCode : 0,
            onBlur: false
        }
    }

    componentWillUnMount() {
    }

    componentDidMount() {
        const { setFm, menus /*focusList*/ } = this.props;
        // console.log("menus -------------> ", menus);
        const fm = new FM({
            id: 'orgMenuWrapId',
            moveSelector: 'li',
            focusSelector: '.orgFocus',
            row: menus.length,
            col: 1,
            focusIdx: 0,
            startIdx: 0,
            lastIdx: menus.length - 1,
            onFocusContainer: this.onFocused,
            onFocusChild: this.onFocusChild,
            onFocusKeyDown: this.onKeyDown
        });
        setFm('orgMenuWrapId', fm);
        //focusList.push(fm);
    }

    onKeyDown(e) {
        // console.log(" onKeyDown >>>>>>>>>>>>>>>> ", e.KeyCode)
    }

    // onFocus(_this, idx) {
    //     this.setState({
    //         loadFocus: idx,
    //         focused : true,
    //         reservedfocus : 1
    //     })

    //     if (idx === 5){
    //         if (this.state.menuPrevIdx > idx) {//DOWN
    //             this.setState({
    //                 menuPage : 0,
    //                 reservedfocus : 1
    //             })
    //         }
    //     }
    //     if (idx === 6) {
    //         if(this.state.menuPrevIdx < idx){
    //             this.setState ({
    //                 menuPage : 1,
    //                 reservedfocus : 1
    //             })
    //         }

    //     }
    // }
    // onBlur (_this, idx) {
    //     this.setState({
    //         menuPrevIdx : idx,
    //         onBlur : true,
    //         focused : false,
    //     })

    // }

    render() {

        let menuList = []
        for (let i = 0; i < this.props.menus.length; i++) {
            let menuData = this.props.menus[i]
            menuList.push(
                <li key={i}>
                    <span className={this.state.focused && this.state.loadFocus === this.props.idx ? "orgFocus focusOn" : i === 5 ? "up orgFocus" : i === 6 ? "down orgFocus" : "orgFocus"} tabIndex="-1" >
                        {menuData.menu}
                    </span>
                </li>
            )
        }
        let topMenuList = []
        let topMenuNames = ['멀티뷰', '채널설정']
        for (let i = 0; i < 2; i++) {
            let csName;
            if (i === 0) {
                csName = 'orgFocus multi'
            } else {
                csName = 'orgFocus setting'
            }

            topMenuList.push(
                <TopMenuList
                    key={i}
                    idx={i}
                    classname={csName}
                    topMenuName={topMenuNames[i]}
                    onKeyDown={this.onKeyDown}
                />
            )
        }
        return (
            <div className="orgMenu next">

                <div className="orgMenuWrap" style={{ '--page': this.state.menuPage }}>
                    <ul id="orgMenuWrapId" >
                        <li className="orgMenuTop">
                            {/* <li>
                                    <span className="multi orgFocus" >멀티뷰</span>
                                    <span className="setting orgFocus">채널설정</span>
                                </li> */}
                            {topMenuList}

                        </li>
                        {menuList}
                    </ul>
                </div>

                <div className="orgMenuArr">메뉴보기</div>
            </div>
        )
    }
}

export default Menu;