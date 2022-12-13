import {React, fnScrolling, lastBlockFocus } from '../../../utils/common';

import '../../../assets/css/routes/monthly/HomeJoinAfter.css';

import PremierListJson from '../../../assets/json/routes/monthly/PremierList.json';
import wordListJson from '../../../assets/json/routes/home/wordList.json';
import monthlyAfterMenu from '../../../assets/json/routes/monthly/monthlyAfterMenu.json';

import SlideTypeA from 'components/modules/SlideTypeA';
import SearchContent from "components/modules/SearchContent";

class HomeJoinAfterDetailNoneBanner extends React.Component {
	constructor(props) {
		super(props);
        let JsonData = [PremierListJson, PremierListJson, wordListJson];

		this.state = {
			menuData : monthlyAfterMenu,
			contentSlides : JsonData,
            loadFocus : 2
		}

	}

	render() {
		return(
			<div className="wrap">
				<div className="mainBg"><img src="/assets/images/common/bg/bg.png" alt="" /></div>
				<div className="scrollWrap monthlyAfterNoneBanner">
					<div className="monthlyAfterTitleArea">
						<p className="preMenu">{this.state.menuData.preMenu} &gt;</p>
						<p className="currentMenu">{this.state.menuData.currentMenu}</p>
					</div>
					{this.state.contentSlides.map((data, i) => {
						switch (data.slideType) {
							case 'SlideTypeA' :
								return(
									<SlideTypeA
										slideInfo={data}
										key={i}
									/>
								);
							case 'WordList' :
								return(
									<SearchContent
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
		document.querySelector('.topMenu').setAttribute('style','');
		if(document.querySelectorAll('.topMenu .active').length){
			document.querySelector('.topMenu .active').classList.remove('active');
		}
		document.querySelector('.topMenu .monthlyMenu').classList.add('active');

        document.querySelector('.contentGroup:nth-child(' + this.state.loadFocus + ') .slide:first-child .csFocus').classList.add('loadFocus');
		fnScrolling();
		lastBlockFocus();
	}

}

export default HomeJoinAfterDetailNoneBanner;