import {React, fnScrolling, scrollUp } from '../../utils/common';
import '../../assets/css/components/modules/SearchContent.css';
import SearchContentItem from 'Module/SearchContentItem';

class SearchContent extends React.Component {

	scrollActive(event){
		if(event.keyCode === 40){
			event.target.closest('.contentGroup').nextSibling.querySelector('.searchMainWrap').classList.add('active');
			fnScrolling();
		}
	}

	focusOn(_this){
		_this.target.closest('.contentGroup').nextSibling.querySelector('.searchMainWrap').classList.remove('active');
		fnScrolling();
	}

	render() {
		const { focusIdx } = this.props;
		return (
			<div className="searchContent contentGroup" style={this.props.style}>
				<div className="contentGroup">
					<div className="searchWrapper searchMainWrap">
						<em className="searchCharacter">
							<span className="wrapBtnText">리모컨의 <span className="icVoice"></span>혹은 문자검색으로 원하는 콘텐츠를 찾으세요</span>
						</em>
						<SearchContentItem slideInfo={this.props.slideInfo} setFm={this.props.setFm} setFocus={this.props.setFocus} focusIdx={focusIdx} />
					</div>
				</div>
			</div>
		)
	}

	componentDidMount() {
		scrollUp();
	}

};

export default SearchContent;