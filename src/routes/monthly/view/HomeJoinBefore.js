import {React, fnScrolling} from '../../../utils/common';
import MainSlideJson from '../../../assets/json/routes/home/MainSlide.json';
import SlideVoucherJson from '../../../assets/json/routes/monthly/SlideVoucher.json';
import ListVoucherJson from '../../../assets/json/routes/monthly/ListVoucher.json';

import MainSlide from 'components/modules/MainSlide';
import ListVoucher from '../components/ListVoucher';
import SlideVoucher from '../components/SlideVoucher';
import appConfig from './../../../config/app-config';

class HomeJoinBefore extends React.Component {
	constructor(props) {
		super(props);
        let JsonData = [MainSlideJson, SlideVoucherJson, ListVoucherJson, ListVoucherJson , ListVoucherJson];
		this.state = {
			contentSlides : JsonData,
            loadFocus : 2
		}

	}

	render() {
		return(
			<div className="wrap">
				<div className="mainBg"><img src={`${appConfig.headEnd.LOCAL_URL}/common/bg/bg.png`} alt="" /></div>
				<div className="menuNav">
					<div className="navTop">메뉴보기</div>
				</div>

				<div className="home scrollWrap monthly">
					{this.state.contentSlides.map((data, i) => {
						switch (data.slideType) {
							case 'MainSlide' :
								return(
									<MainSlide
										slideInfo={data}
										key={i}
									/>
								);
							case 'ListVoucher' :
								return(
									<ListVoucher
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
										key={i}
									/>
								);
						}
					})}
				</div>
			</div>
		)
	}

	componentDidMount() {
        document.querySelector('.contentGroup:nth-child(' + this.state.loadFocus + ') .slide:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
	}

}
export default HomeJoinBefore;