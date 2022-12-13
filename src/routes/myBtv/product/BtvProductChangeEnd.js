import {React} from '../../../utils/common';

import '../../../assets/css/routes/myBtv/product/BtvProductChangeEnd.css';

import ChangeEndData from '../../../assets/json/routes/myBtv/product/BtvProductChangeEndData.json';

class BtvProductChangeEnd extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
			changeEndContents : ChangeEndData
        }

    }
    render() {
        return(
			<div className="wrap">
				<div className="changeEndWrap">
					<p className="endTitle">상품변경 완료</p>
					<p className="endSubTitle">B tv 상품변경 신청이 완료되었습니다.</p>
					<div className="cancelInfoContent">
						<p className="prevProduct">{this.state.changeEndContents.prevProduct}</p>
						<span className="arrow"></span>
						<p className="selectProduct">{this.state.changeEndContents.selectProduct}</p>
					</div>
					<p className="mesChangeEnd">10초 후 셋톱박스가 자동으로 재부팅되며,<br/>
						재부팅 완료 후 변경하신 상품으로 서비스를 바로 이용하실 수 있습니다.</p>
					<div className="btnBottomWrap">
						<span tabIndex="-1" className="csFocus btnStyleDark1">
							<span className="wrapBtnText">재부팅하기</span>
						</span>
					</div>
				</div>
			</div>
		)
    }

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
	}

}

export default BtvProductChangeEnd;