import {React, fnScrolling, createMarkup } from '../../../utils/common';

import '../../../assets/css/routes/myBtv/VOD/PossessionVODTotalList.css';
import PossessionVODTotalJson from '../../../assets/json/routes/myBtv/VOD/PossessionVODTotalList.json';

class PossessionVODTotalList extends React.Component {
	constructor(props) {
		super(props);

		let Json = PossessionVODTotalJson;
		
		this.state = {
			contents : Json,
			slideItem : Json.slideItem,
			activeList : 0
		}
	}

	focusOn() {
		let activeElement = document.activeElement;
		let list = activeElement.closest('.listTotalWrapper').querySelectorAll('.list');
		let wrapper = activeElement.closest('.listWrap').querySelectorAll('.listTotalWrapper');
		let rowIndex, colIndex, dataIndex = 0;

		for(let i = 0; i < wrapper.length; i++) {
			if(wrapper[i] === activeElement.closest('.listTotalWrapper')) rowIndex = i;
		}
		for(let j = 0; j < list.length; j++) {
			if(list[j] === activeElement.closest('.list')) colIndex = j;
		}
		dataIndex = 3 * rowIndex + colIndex;

		this.setState({
			activeList : dataIndex
		});
	}

	render() {
		let k = 0;
		let data = [];
	    data[0] = [];
	    data[1] = [];

		for(let i = 0; i < 2 ; i++) {
			for(let j = 0; j < 3; j++) {
				if(this.state.slideItem[k] !== undefined) {
					data[i][j] = this.state.slideItem[k];
				}else {
					data[i][j] = '';
					i++;
					break;
				}
				k++;
			}
		}
		return (
			<div className="wrap">
				<div className="mainBg"><img src={this.state.contents.bg} alt="" /></div>
				<div className="possessionTotalList">
					<p className="title">나의 소장용 VOD</p>
					<div className="possessionListWrap">
						<div className="listWrap">
							<div className="listTotalWrapper">
								{
									data[0].map((data, i) => {
										return(
											<div className='list' key={i}>
												<div className="csFocus" onFocus={this.focusOn.bind(this)}>
													<span className="imgWrap"><img src={data.imageS} alt=""/></span>
												</div>
											</div>
										)
									})
								}
							</div>
							<div className="listTotalWrapper">
								{
									data[1].map((data, i) => {
										return(
											<div className='list' key={i}>
												<div className="csFocus" onFocus={this.focusOn.bind(this)}>
													<span className="imgWrap"><img src={data.imageS} alt=""/></span>
												</div>
											</div>
										)
									})
								}
							</div>
							<span className="arrow"></span>
						</div>

							{	this.state.activeList < this.state.slideItem.length &&
								<div className="possessionInfo">
									<p className="vodTitle" dangerouslySetInnerHTML={createMarkup(this.state.slideItem[this.state.activeList].title)}></p>
									<div className="vodInfo">
										<span className="age">{this.state.slideItem[this.state.activeList].age}</span>
										<span className="resolution">{this.state.slideItem[this.state.activeList].resolution}</span>
										<span className="year">{this.state.slideItem[this.state.activeList].year}</span>
										<span className="time">{this.state.slideItem[this.state.activeList].time}</span>
										<span className="sound">{this.state.slideItem[this.state.activeList].sound}</span>
										<span className="language">{this.state.slideItem[this.state.activeList].language}</span>
									</div>
									<dl className="personInfo">
										<dt>감독</dt>
										<dd>{this.state.slideItem[this.state.activeList].supervisor}</dd>
										<dt>주연</dt>
										<dd>
											{
												this.state.slideItem[this.state.activeList].actor.map((data, i) => {
													return(
														data.concat(',')
													)
												})
											}
										</dd>
									</dl>
								</div>
							}
					</div>
 				</div>
			</div>
		)
	}

	componentDidMount() {
		document.querySelector('.topMenu').style.display = 'none';
		document.querySelector('.listTotalWrapper:first-child .list:first-child .csFocus').classList.add('loadFocus');
		if(this.state.slideItem.length < 3) {
			document.querySelector('.listTotalWrapper:first-child .list:last-child').classList.add('last');
		}else if(this.state.slideItem.length < 6) {
			document.querySelector('.listTotalWrapper +.listTotalWrapper .list:last-child').classList.add('last');
		}
		fnScrolling();
	}
}

export default PossessionVODTotalList;

