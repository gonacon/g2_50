import {React, fnScrolling, lastBlockFocus } from '../../../utils/common';

import '../../../assets/css/routes/monthly/HomeJoinAfter.css';

import MonthlyListType from '../../../assets/json/routes/monthly/MonthlyListType.json';
import wordListJson from '../../../assets/json/routes/home/wordList.json';
import monthlyAfterMenu from '../../../assets/json/routes/monthly/monthlyAfterMenu2.json';

import SearchContent from "components/modules/SearchContent";
import ListItemType from '../components/ListItemType.js';

class MonthlyGenreList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			menuData : monthlyAfterMenu,
			listSlides : MonthlyListType,
			contentSlides : wordListJson,
            loadFocus : 1
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
					<ListItemType slideInfo={this.state.listSlides}/>
					<SearchContent slideInfo={this.state.contentSlides}/>
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

		let conGroup = document.querySelectorAll('.listItemType .contentGroup:last-child .slide .csFocus');
		for(let i = 0; i < conGroup.length ; i++) {
			conGroup[i].addEventListener('keydown',function(event) {
				if(event.keyCode === 40) {
					document.querySelector('.btnTopWrap .btnTop').focus();
				}
			})
		}

		fnScrolling();
		//lastBlockFocus();
	}

}

export default MonthlyGenreList;