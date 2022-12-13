import {React, $, fnScrolling, Link, radioFn, selectFn, checkFn } from '../../utils/common';
import '../../assets/css/components/common/CommonLayout.css';

class Common extends React.Component {
	constructor(props) {
		super(props);

		this.state = {

		};
	}

	render() {
		return (
		    <div className="commonStyleArea">

                <div className="styleBox">

                    <p className="styleTitle">버튼스타일 btnTop [버튼이 들어간 상위 wrap에서 black 클래스 유무로 판단]</p>
					<div className="wrap">
                        <div className="btnTopWrap">
                            <Link to="/" className="csFocus btnTop" tabIndex="-1"><span>맨 위로</span></Link>
                        </div>
                    </div>
					<div className="wrap black">
                        <div className="btnTopWrap">
                            <Link to="/" className="csFocus btnTop" tabIndex="-1"><span>맨 위로</span></Link>
                        </div>
                    </div>

                </div>

                <div className="styleBox">
                    <p className="styleTitle">버튼스타일 btnStyle light & default theme (h:94)</p>
                    <div className="light lightTheme">
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle" data-disabled="true">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle2 (h:94)</p>
                    <div className="light lightTheme">
                        <span className="csFocus btnStyle2">
                            <span className="wrapBtnText">
                                <span className="purchase">
                                    <span className="purchaseTitle">일반구매</span>
                                    <span className="productionCost">35,000</span>
                                    <span className="dc">25,000</span>
                                    원
                                </span>
                            </span>
                        </span>
                        <span className="csFocus btnStyle2">
                            <span className="wrapBtnText">
                                <span className="purchase">
                                    <span className="purchaseTitle">소장구매</span>
                                    <span className="productionCost">35,000</span>
                                    <span className="dc">25,000</span>
                                    원
                                </span>
                            </span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle.type02 (h:80)</p>
                    <div className="light lightTheme">
                        <span className="csFocus btnStyle type02">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle type02">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle type02" data-disabled="true">
                            <span className="wrapBtnText">텍스트</span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle.type03 (h:64, bg:(15,23,72,0.35))</p>
                    <div className="light lightTheme">
                        <span className="csFocus btnStyle type03">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle type03">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle type03" data-disabled="true">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>


                        <span className="csFocus checkStyle2 btnStyle type03" select="true">
                            <span className="wrapBtnText">주 이용카드 설정</span>
                        </span>
                        <span className="csFocus checkStyle2 btnStyle type03">
                            <span className="wrapBtnText">사용함</span>
                        </span>
                    </div>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">버튼스타일 btnStyle dark theme (h:94)</p>
                    <div className="dark darkTheme">
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle" data-disabled="true">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle2 (h:94)</p>
                    <div className="dark darkTheme">
                        <span className="csFocus btnStyle2">
                            <span className="wrapBtnText">
                                <span className="purchase">
                                    <span className="purchaseTitle">일반구매</span>
                                    <span className="productionCost">35,000</span>
                                    <span className="dc">25,000</span>
                                    원
                                </span>
                            </span>
                        </span>
                        <span className="csFocus btnStyle2">
                            <span className="wrapBtnText">
                                <span className="purchase">
                                    <span className="purchaseTitle">소장구매</span>
                                    <span className="productionCost">35,000</span>
                                    <span className="dc">25,000</span>
                                    원
                                </span>
                            </span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle.type02 (h:80)</p>
                    <div className="dark darkTheme">
                        <span className="csFocus btnStyle type02">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle type02">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle type02" data-disabled="true">
                            <span className="wrapBtnText">텍스트</span>
                        </span>
                    </div>

                    <p className="styleTitle">버튼스타일 btnStyle.type03 (h:64, bg:(15,23,72,0.35))</p>
                    <div className="dark darkTheme">
                        <span className="csFocus btnStyle type03">
                            <span className="wrapBtnText">네자이하</span>
                        </span>
                        <span className="csFocus btnStyle type03">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>
                        <span className="btnStyle type03" data-disabled="true">
                            <span className="wrapBtnText">텍스트 길어진 경우</span>
                        </span>


                        <span className="csFocus checkStyle2 btnStyle type03" select="true">
                            <span className="wrapBtnText">주 이용카드 설정</span>
                        </span>
                        <span className="csFocus checkStyle2 btnStyle type03">
                            <span className="wrapBtnText">사용함</span>
                        </span>
                    </div>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">버튼스타일 btnStyleDark1_1</p>
                    <button type="button" className="csFocus btnRequire">요청</button>
                    <button type="button" className="csFocus btnRequire" disabled>요청</button>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">탭스타일 tabStyle light & default theme</p>
                    <div className="lightTheme">
                        <ul className="tabStyle">
                            <li>
                                <span className="csFocus tabItem">
                                    <span className="wrapBtnText">일반 VOD</span>
                                </span>
                            </li>
                            <li>
                                <span className="csFocus tabItem">
                                    <span className="wrapBtnText">소장용 VOD</span>
                                </span>
                            </li>
                            <li>
                                <span className="csFocus tabItem sel">
                                    <span className="wrapBtnText">월정액</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <p className="styleTitle">탭스타일 tabStyle2 light & default theme</p>
                    <div className="lightTheme">
                        <ul className="tabStyle2">
                            <li>
                                <div className="csFocus sel">공지사항</div>
                            </li>
                            <li>
                                <div className="csFocus">알림 보관함 <span className="new">N</span></div>
                            </li>
                            <li>
                                <div className="csFocus">진행중인 이벤트</div>
                            </li>
                        </ul>
                    </div>

                    <p className="styleTitle">탭스타일 tabStyle dark theme</p>
                    <div className="dark darkTheme">
                        <ul className="tabStyle">
                            <li>
                                <span className="csFocus tabItem">
                                    <span className="wrapBtnText">일반 VOD</span>
                                </span>
                            </li>
                            <li>
                                <span className="csFocus tabItem">
                                    <span className="wrapBtnText">소장용 VOD</span>
                                </span>
                            </li>
                            <li>
                                <span className="csFocus tabItem sel">
                                    <span className="wrapBtnText">월정액</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <p className="styleTitle">탭스타일 tabStyle2 dark theme</p>
                    <div className="dark darkTheme">
                        <ul className="tabStyle2">
                            <li>
                                <div className="csFocus sel">공지사항</div>
                            </li>
                            <li>
                                <div className="csFocus">알림 보관함 <span className="new">N</span></div>
                            </li>
                            <li>
                                <div className="csFocus">진행중인 이벤트</div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="styleBox">

                    <p className="styleTitle">input radio버튼 - light / default theme theme 기본형</p>
                    <div className="optionWrap lightTheme">
                        <span className="csFocus radioStyle select">남성</span>
                        <span className="csFocus radioStyle">여성</span>
                        <span className="radioStyle disable">여성</span>
                    </div>

                    <p className="styleTitle">input radio버튼 - light / default theme theme 리스트형</p>
                    <div className="optionWrap lightTheme">
                        <span className="csFocus radioStyle1 select">남성</span>
                        <span className="csFocus radioStyle1">여성</span>
                        <span className="radioStyle1 disable">여성</span>
                    </div>

                    <p className="styleTitle">input radio버튼 - light / default theme 리스트형</p>
                    <div className="optionWrap lightTheme" style={{paddingTop: "20px"}}>
                        <span className="csFocus radioStyle2 select">남성</span>
                        <span className="csFocus radioStyle2">여성</span>
                        <span className="radioStyle2 disable">여성</span>
                    </div>

                    <p className="styleTitle">input radio버튼 - dark theme 기본형</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap">
                            <span className="csFocus radioStyle select">남성</span>
                            <span className="csFocus radioStyle">여성</span>
                            <span className="radioStyle disable">여성</span>
                        </div>
                    </div>

                    <p className="styleTitle">input radio버튼 - dark theme 리스트형</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap mb20">
                            <span className="csFocus radioStyle1 select">남성</span>
                            <span className="csFocus radioStyle1">여성</span>
                            <span className="radioStyle1 disable">여성</span>
                        </div>
                    </div>

                    <p className="styleTitle">input radio버튼 - dark theme 리스트형</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap">
                            <span className="csFocus radioStyle2 select">남성</span>
                            <span className="csFocus radioStyle2">여성</span>
                            <span className="radioStyle2 disable">여성</span>
                        </div>
                    </div>

                </div>

                <div className="styleBox">

                    <p className="styleTitle">input check버튼 - light / default theme theme 기본형</p>
                    <div className="optionWrap lightTheme">
                        <span className="csFocus checkStyle select" select="true">남성</span>
                        <span className="csFocus checkStyle">여성</span>
                        <span className="checkStyle disable">여성</span>
                    </div>

                    <p className="styleTitle">input check버튼 - light / default theme theme 기본형 -34px</p>
                    <div className="optionWrap lightTheme">
                        <span className="csFocus checkStyle2 select" select="true">남성</span>
                        <span className="csFocus checkStyle2">여성</span>
                        <span className="checkStyle2 disable">여성</span>
                    </div>

                    <p className="styleTitle">input check버튼 - light / default theme theme 리스트형</p>
                    <div className="optionWrap lightTheme" style={{paddingLeft: "100px"}}>
                        <div className="discountWrap">
                            <span className="csFocus changeBtn">변경</span>
                            <span className="csFocus checkStyle1" select="true" onFocus={this.onFocus.bind(this)}>
                                <span className="title">쿠폰</span>
                                <span className="text">VIP라운지 특별할인</span>
                                <span className="discount">-300원</span>
                            </span>
                        </div>
                        <div className="discountWrap">
                            <span className="csFocus changeBtn">변경</span>
                            <span className="csFocus checkStyle1" onFocus={this.onFocus.bind(this)}>
                                <span className="title">쿠폰</span>
                                <span className="text">VIP라운지 특별할인</span>
                                <span className="discount">-300원</span>
                            </span>
                        </div>
                        <div className="discountWrap">
                            <span className="csFocus changeBtn">변경</span>
                            <span className="checkStyle1 disable" onFocus={this.onFocus.bind(this)}>
                                <span className="title">쿠폰</span>
                                <span className="text">3개월간 월정액<br/>2,500원 할인</span>
                                <span className="discount">-300원</span>
                            </span>
                        </div>
                    </div>

                    <p className="styleTitle">input check버튼 - dark theme 기본형</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap">
                            <span className="csFocus checkStyle select" select="true">남성</span>
                            <span className="csFocus checkStyle">여성</span>
                            <span className="checkStyle disable">여성</span>
                        </div>
                    </div>
                    <p className="styleTitle ">input check버튼 - dark theme 기본형 -34px</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap">
                            <span className="csFocus checkStyle2 select" select="true">남성</span>
                            <span className="csFocus checkStyle2">여성</span>
                            <span className="checkStyle2 disable">여성</span>
                        </div>
                    </div>

                    <p className="styleTitle">input check버튼 - dark theme 리스트형</p>
                    <div className="dark darkTheme">
                        <div className="optionWrap" style={{paddingLeft: "100px"}}>
                            <div className="discountWrap">
                                <span className="csFocus changeBtn">변경</span>
                                <span className="csFocus checkStyle1" select="true" onFocus={this.onFocus.bind(this)}>
                                    <span className="title">쿠폰</span>
                                    <span className="text">VIP라운지 특별할인</span>
                                    <span className="discount">-300원</span>
                                </span>
                            </div>
                            <div className="discountWrap">
                                <span className="csFocus changeBtn">변경</span>
                                <span className="csFocus checkStyle1" onFocus={this.onFocus.bind(this)}>
                                    <span className="title">쿠폰</span>
                                    <span className="text">VIP라운지 특별할인</span>
                                    <span className="discount">-300원</span>
                                </span>
                            </div>
                            <div className="discountWrap">
                                <span className="csFocus changeBtn">변경</span>
                                <span className="checkStyle1 disable" onFocus={this.onFocus.bind(this)}>
                                    <span className="title">쿠폰</span>
                                    <span className="text">3개월간 월정액<br/>2,500원 할인</span>
                                    <span className="discount">-300원</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">인풋스타일 gridStyle - light & default theme (h:94)</p>
                    <div className="lightTheme">
                        <div className="gridWrap mb20">
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트"/>
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                        <div className="gridWrap mb20">
                            <p>disable</p>
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트" disabled />
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                        <div className="gridWrap mb20">
                            <span className="gridStyle block">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트" value="홍길동"/>
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>


                        <div className="inputConfirm mb20">
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트"/>
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>

                        <div className="inputError mb20">
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트"/>
                                <label htmlFor="numberFirst"></label>
                                <p className="errorText">인증번호를 잘못 입력하셨습니다.</p>
                            </span>
                        </div>
                    </div>
                    <p className="styleTitle">인풋스타일 gridStyle - light & default theme (h:64)</p>
                    <div className="lightTheme">
                        <div className="gridWrap mb20">
                            <span className="gridStyle type02">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트"/>
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                        <div className="gridWrap mb20">
                            <p>disable</p>
                            <span className="gridStyle type02">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트" disabled />
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                    </div>

                    <p className="styleTitle">인풋스타일 gridStyle - light & default theme - password</p>
                    <div className="lightTheme">
                        <div className="passwordWrap">
                            <span className="gridStyle"><input type="password" id="numberFirst1" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst1"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst2" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst2"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst3" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst3"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst4" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst4"></label></span>
                        </div>
                    </div>

                </div>

                <div className="styleBox">
                    <p className="styleTitle">인풋스타일 gridStyle - dark theme </p>
                    <div className="dark darkTheme">
                        <div className="gridWrap mb20">
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트"/>
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>

                        <div className="gridWrap mb20">
                            <p>disable</p>
                            <span className="gridStyle">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트" disabled />
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                        <div>
                            <p>width 160px</p>
                            <div className="gridWrap" style={{marginBottom:"20px", width:"790px"}}>
                               <span className="gridStyle card">
                                    <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="" onKeyUp={this.isNumberKey.bind(this)}/>
                                    <label htmlFor="numberFirst"></label>
                               </span>
                                <span className="gridStyle card">
                                    <input type="text" id="numberSecond" className="inputText csFocus" maxLength="4" placeholder="" onKeyUp={this.isNumberKey.bind(this)} />
                                    <label htmlFor="numberSecond"></label>
                               </span>
                                <span className="gridStyle card">
                                    <input type="text" id="numberthird" className="inputText csFocus" maxLength="4" placeholder="" onKeyUp={this.isNumberKey.bind(this)} />
                                    <label htmlFor="numberthird"></label>
                                </span>
                                <span className="gridStyle card">
                                    <input type="text" id="numberFour" className="inputText csFocus" maxLength="4" placeholder="" onKeyUp={this.isNumberKey.bind(this)} />
                                    <label htmlFor="numberFour"></label>
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="styleTitle">인풋스타일 gridStyle - dark theme (h:64)</p>
                    <div className="dark darkTheme">
                        <p className="inputTitle">쿠폰번호</p>
                        <div className="gridWrap mb20">
                            <span className="gridStyle type02">
                                <input type="text" id="numberFirst" className="inputText csFocus" maxLength="4" placeholder="가이드텍스트" />
                                <label htmlFor="numberFirst"></label>
                            </span>
                        </div>
                    </div>

                    <p className="styleTitle">인풋스타일 gridStyle - dark theme - password</p>
                    <div className="dark darkTheme">
                        <div className="passwordWrap">
                            <span className="gridStyle"><input type="password" id="numberFirst1" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst1"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst2" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst2"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst3" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst3"></label></span>
                            <span className="gridStyle"><input type="password" id="numberFirst4" className="inputText csFocusPop" maxLength='1' /><label htmlFor="numberFirst4"></label></span>
                        </div>
                    </div>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">select - light / default theme </p>
                    <div className="gridWrap lightTheme">
                        <div className="selectWrap" style={{width:"200px", marginBottom:"20px"}}>
                            <select name="" id="telAgency">
                                <option value="SKT">SKT</option>
                                <option value="KT">KT</option>
                                <option value="LGU+">LGU+</option>
                                <option value="ETC">ETC</option>
                            </select>
                            <div className="selectStyle">
                                <span className="csFocus selectBtn">SKT</span>
                                <ul className="selectList">
                                    <li><span className="csFocus radioStyle select">SKT</span></li>
                                    <li><span className="csFocus radioStyle">KT</span></li>
                                    <li><span className="csFocus radioStyle">LGU+</span></li>
                                    <li><span className="csFocus radioStyle">ETC</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="selectWrap" style={{width:"200px"}}>
                            <select name="" id="telAgency">
                                <option value="SKT">SKT</option>
                                <option value="KT">KT</option>
                                <option value="LGU+">LGU+</option>
                                <option value="ETC">ETC</option>
                            </select>
                            <div className="selectStyle">
                                <span className="selectBtn">SKT</span>
                                <ul className="selectList">
                                    <li><span className="csFocus radioStyle select">SKT</span></li>
                                    <li><span className="csFocus radioStyle">KT</span></li>
                                    <li><span className="csFocus radioStyle">LGU+</span></li>
                                    <li><span className="csFocus radioStyle">ETC</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p className="styleTitle">select - dark theme </p>
                    <div className="dark darkTheme">
                        <div className="selectWrap" style={{width:"200px", marginBottom:"20px"}}>
                            <select name="" id="telAgency">
                                <option value="SKT">SKT</option>
                                <option value="KT">KT</option>
                                <option value="LGU+">LGU+</option>
                                <option value="ETC">ETC</option>
                            </select>
                            <div className="selectStyle">
                                <span className="csFocus selectBtn">SKT</span>
                                <ul className="selectList">
                                    <li><span className="csFocus radioStyle select">SKT</span></li>
                                    <li><span className="csFocus radioStyle">KT</span></li>
                                    <li><span className="csFocus radioStyle">LGU+</span></li>
                                    <li><span className="csFocus radioStyle">ETC</span></li>
                                </ul>
                            </div>
                        </div>
                        <div className="selectWrap" style={{width:"200px"}}>
                            <select name="" id="telAgency">
                                <option value="SKT">SKT</option>
                                <option value="KT">KT</option>
                                <option value="LGU+">LGU+</option>
                                <option value="ETC">ETC</option>
                            </select>
                            <div className="selectStyle">
                                <span className="selectBtn">SKT</span>
                                <ul className="selectList">
                                    <li><span className="csFocus radioStyle select">SKT</span></li>
                                    <li><span className="csFocus radioStyle">KT</span></li>
                                    <li><span className="csFocus radioStyle">LGU+</span></li>
                                    <li><span className="csFocus radioStyle">ETC</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="styleBox">
                    <p className="styleTitle">Spin Controll light & default theme</p>
                    <div className="lightTheme">
                        <ul className="spinControll">
                            <li>
                                <div className="csFocus leftBtn"></div>
                            </li>
                            <li>
                                <div className="centerBtn">
                                    <span className="text">50</span>
                                </div>
                            </li>
                            <li>
                                <div className="csFocus rightBtn"></div>
                            </li>
                        </ul>

                        <ul className="spinControll disabled">
                            <li>
                                <div className="leftBtn"></div>
                            </li>
                            <li>
                                <div className="centerBtn">
                                    <span className="text">1150</span>
                                </div>
                            </li>
                            <li>
                                <div className="rightBtn"></div>
                            </li>
                        </ul>
                    </div>

                    <p className="styleTitle">Spin Controll dark theme</p>
                    <div className="dark darkTheme">
                        <ul className="spinControll">
                            <li>
                                <div className="csFocus leftBtn"></div>
                            </li>
                            <li>
                                <div className="centerBtn">
                                    <span className="text">50</span>
                                </div>
                            </li>
                            <li>
                                <div className="csFocus rightBtn"></div>
                            </li>
                        </ul>

                        <ul className="spinControll disabled">
                            <li>
                                <div className="leftBtn"></div>
                            </li>
                            <li>
                                <div className="centerBtn">
                                    <span className="text">1150</span>
                                </div>
                            </li>
                            <li>
                                <div className="rightBtn"></div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="styleBox">

                    <p className="styleTitle">키고지 light & default theme</p>
                    <div className="lightTheme keyGuide">
                        <div className="keyWrap">
                            <span className="btnKeyPreference">선호채널</span>
                            <span className="btnKeyOK">채널이동 / 시청예약</span>
                            <span className="btnKeyPager">페이지 이동</span>
                            <span className="btnKeyOption">자막/음성 설정</span>
                            <span className="btnKeyPrev">취소</span>
                            <span className="btnKeyExit">시청종료</span>
                            <span className="btnKeyPlay">도움말</span>
                            <span className="btnKeyColor">옵션</span>
                        </div>
                    </div>

                    <div className="dark darkTheme keyGuide">
                        <div className="keyWrap">
                            <span className="btnKeyPreference">선호채널</span>
                            <span className="btnKeyOK">채널이동 / 시청예약</span>
                            <span className="btnKeyPager">페이지 이동</span>
                            <span className="btnKeyOption">자막/음성 설정</span>
                            <span className="btnKeyPrev">취소</span>
                            <span className="btnKeyExit">시청종료</span>
                            <span className="btnKeyPlay">도움말</span>
                            <span className="btnKeyColor">옵션</span>
                        </div>
                    </div>

                </div>

                <div className="styleBox">

                    <p className="styleTitle">상세페이지 가격 버튼</p>
                    <Link to="" className="csFocus btnPriceInfo">
                        <span className="selectType">월정액 가입</span>
                        <span className="price"><strong>12,800</strong>원/월</span>
                    </Link>

                </div>
            </div>


        )
	}

	onFocus(_this){
		if(document.querySelectorAll('.discountWrap.focus').length !== 0){
			document.querySelector('.discountWrap.focus').classList.remove('focus');
		}
		_this.target.closest('.discountWrap').classList.add('focus');
	}

    componentDidMount() {
        $('.topMenu').hide();
        // fnLoadFocus();
        fnScrolling();
        radioFn();
        checkFn();
        selectFn();
        document.querySelector('.wrap .commonStyleArea').scrollTop = 10700;
    }

    isNumberKey() {
        let target = document.querySelectorAll('.inputText');
        for(let i = 0; i < target.length; i++) {
            target[i].addEventListener('keyup',function() {
                this.value = this.value.replace(/[^0-9]/g,'');
            });
        }
    }
}

export default Common;