import {React, fnScrolling, scrollUp, lastBlockFocus} from '../../../utils/common';
import '../../../assets/css/routes/monthly/DetailTop.css';
import DetailListJson from '../../../assets/json/routes/monthly/SlideVoucher.json';
import DetailTopjson from '../../../assets/json/routes/monthly/DetailTop.json';
import SlideTypeAjson from '../../../assets/json/routes/monthly/SlideTypeA.json';

import DetailTop from '../components/DetailTop';
import SlideVoucher from '../components/SlideVoucher';
import SlideTypeA from 'components/modules/SlideTypeA';
import appConfig from './../../../config/app-config';

class MonthlyDetail extends React.Component {
    constructor(props) {
        super(props);
        let JsonData = [DetailTopjson, SlideTypeAjson, SlideTypeAjson, SlideTypeAjson];
        this.state = {
            contentSlides : JsonData
        }
    }

    render() {
        return(
			<div className="wrap">
				<div className="mainBg">
					<img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt=""/>
				</div>
				<div className="scrollWrap detailWrapper">
					<div className="contentGroup">
						<DetailTop
							data={this.state.contentSlides[0]}
							listBtnItem = {this.state.contentSlides[0].listBtnItem}
						/>
					</div>
					{
						this.state.contentSlides.map((data,i) => {
							switch (data.slideType) {
								case 'SlideTypeA' :
									return(
										<SlideTypeA
											slideInfo={data}
											key={i}
										/>
									);
								case 'SlideVoucher' :
									return(
										<SlideVoucher
											slideInfo={data}
											key={i}
										/>
									);
								default :
									return(
										<div
											key={i}>
										</div>
									)
							}

						})
					}
					<div className="btnTopWrap">
						<span className="csFocus btnTop"><span>맨 위로</span></span>
					</div>
				</div>
			</div>
		)
    }

    componentDidMount() {
    	document.querySelector('.listBtnType .listItem:first-child .csFocus').classList.add('loadFocus');

		for(let i=0; i<document.querySelectorAll('.contentGroup .csFocus').length; i++){
			document.querySelectorAll('.contentGroup .csFocus')[i].addEventListener('keydown', function(event){
				if(event.target.closest('.contentGroup').getAttribute('data-csfocus') === '1'){
					if(event.keyCode === 38){
						document.querySelector('.listItem:first-child .csFocus').focus();
						document.querySelector('.detailWrapper').style.transform = "translate(0, 0)";
					}
				}
			})
		}

	    fnScrolling();
		scrollUp();
		lastBlockFocus();
    }
}

export default MonthlyDetail;