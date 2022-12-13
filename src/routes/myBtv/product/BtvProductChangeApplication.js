import {React, fnScrolling, selectFn, radioFn, phoneNumFn } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/product/BtvProductChangeApplication.css';

import applicationData from '../../../assets/json/routes/myBtv/product/BtvProductChangeApplicationData.json';
import appConfig from 'Config/app-config';

class BtvProductChangeApplication extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            content: applicationData
        }

    }
	valueRequire(_this){
		let targetInput = _this.target.closest('.gridWrap').querySelector('#phoneNumber');

		if( phoneNumFn(targetInput.value) ){
			document.querySelector('.btnRequire').removeAttribute("disabled");
		} else {
			document.querySelector('.btnRequire').setAttribute('disabled',true);
		}
	}
    render() {
        return(
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="btvApplicationWrap">
					<div className="contsArea">
						<div className="titleArea">
							<p className="title">상품변경 신청하기</p>
							<p className="subTitle">B tv 프라임캐치온 지상파<br/>214채널 + 캐치온월정액 + 지상파월정액</p>
							<ul className="textInfoList">
								<li>상품을 변경하시려면 B tv 가입 명의자 정보를 <br/>정확하게 입력해 주세요.</li>
								<li>상품변경 신청 완료 시 현재 사용중인 상품이 신청한 <br/>상품으로 자동 변경됩니다.</li>
								<li>고객별 할인적용 금액에 따라 상기 표시된 금액과 <br/>청구금액이 다를 수 있습니다.</li>
								<li>다 셋톱박스 할인, 복지감면, 공동청약 할인 및 기타 <br/>할인 대상 고객님은 상품 변경 시 기존 할인이 <br/>변동될 수 있습니다.</li>
								<li>기타 상품관련 문의사항은 국번없이 106 또는 <br/>B tv 홈페이지(www.skbtv.co.kr)를 통해 <br/>확인해주세요.</li>
							</ul>
						</div>
						<div className="inputArea">
							<div className="nameWrap">
								<p className="title">B tv 가입 명의자</p>
								<p className="userName">홍길* 님</p>
							</div>
							<div className="inputCon">
								<div className="gridWrap">
									<div className="gender">
										<p className="inputTitle">성별</p>
										<div className="optionWrap">
											<span className="csFocus radioStyle select">남성</span>
											<span className="csFocus radioStyle">여성</span>
										</div>
									</div>
									<div className="birth">
										<p className="inputTitle">생년월일</p>
										<span className="gridStyleType2 birth">
											<input type="text" id="birthNumber" className="inputNumber csFocus" maxLength="11" placeholder="예)19921010" />
											<label htmlFor="birthNumber"></label>
										</span>
									</div>
								</div>
								<div className="gridWrap">
									<div className="agency">
										<p className="inputTitle">통신사</p>
										<div className="selectWrap">
											<select name="" id="telAgency">
												<option value="SKT">SKT</option>
												<option value="KT">KT</option>
												<option value="LGU+">LGU+</option>
											</select>
											<div className="selectStyle">
												<span className="csFocus selectBtn" tabIndex="-1">SKT</span>
												<ul className="selectList">
													{
														this.state.content.telAgency.map((data, i) => {
															return(
																<li key={i}><span tabIndex="-1" className="radioStyle">{data}</span></li>
															)
														})
													}
												</ul>
											</div>
										</div>
									</div>
									<div className="tel">
										<p className="inputTitle">휴대폰 번호</p>
										<span className="gridStyleType2">
											<input type="text" id="phoneNumber" className="inputNumber csFocus" maxLength="11" placeholder="숫자만 입력" onChange={this.valueRequire.bind(this)}/>
											<label htmlFor="phoneNumber"></label>
										</span>
									</div>
									<button type="button" className="csFocus btnRequire" disabled>요청</button>
								</div>
								<div className="inner valid disable">
									<p className="inputTitle">인증 번호</p>
									<span className="gridStyleType2">
										<input type="text" id="certificationNumber" className="inputNumber csFocus" placeholder="인증번호 입력" disabled/>
										<label htmlFor="certificationNumber"></label>
									</span>
								</div>
								<div className="btnWrap">
									<button className="csFocus btnStyleLight1 certificationEnd" disabled>
										<span>인증완료</span>
									</button>
									<span tabIndex="-1" className="csFocus btnStyleLight1">취소</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
    }

    componentDidMount() {
        document.querySelector('.topMenu').style.display = 'none';
        fnScrolling();
		selectFn();
		radioFn();
    }

}

export default BtvProductChangeApplication;

