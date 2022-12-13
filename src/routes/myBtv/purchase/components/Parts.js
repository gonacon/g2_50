import React, { Fragment } from 'react';
import appConfig from 'Config/app-config';


const TabMenu = (props) => {
    const { activeTab, listIdx, idx, tabText } = props;
    const activeTabClass = activeTab === idx ? 'sel' : '';
    const focusClass = (listIdx === 'tab' && activeTab === idx) ? 'focusOn' : '';
    let menuText = tabText;
    let classNames = `csFocus tabItem ${activeTabClass} ${focusClass}`;

    if ( tabText === 'oksusu' ) {
        menuText = <span className="wrapBtnImg"/>;
        classNames = `${classNames} ${tabText}`;
    }

    return (
        <li>
            <span className={classNames}>
                <span className="wrapBtnText">{menuText}</span>
            </span>
        </li>
    )
}

const BackgroundImage = (props) => {
    return (
        <div className="mainBg">
            <img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" />
        </div>
    )
}

const OksusuSettingGuide = (props) => (
    <Fragment>
        <span className="icOksusu">
            <img src="/assets/images/myBtv/logo-oksusu-app.png" alt="" />
        </span> 내 
        <span className="icMenu">
            <img src="/assets/images/myBtv/img-oksusu-menu.png" alt="" />
        </span>
        메뉴버튼 선택 후<br />[
        <span className="icSetting">
            <img src="/assets/images/myBtv/img-oksusu-setting.png" alt="" />
        </span>
        환경설정 &gt; B tv시청설정]을 통해<br />oksusu 구매내역 열람을 설정할 수 있습니다.
    </Fragment>
);

const GuideDescription = (props) => (
    <div className="bottomWrap nor">
        <div className="norWrap">
            <p className="info">{props.info}</p>
            <div className="subDetailInfo">{props.sub}</div>
        </div>
    </div>
);

export {
    TabMenu,
    BackgroundImage,
    OksusuSettingGuide,
    GuideDescription,
}