import {React} from '../../utils/common';
import '../../assets/css/components/modules/GenreTitle.css';

class GenreTitle extends React.Component {

	render() {
		return (
			<div className="menuBlockTitle">
				<p className="highRankTitle">{this.props.content.prevTitle} &gt;</p>
				<p className="title">{this.props.content.currentTitle}</p>
			</div>
		)
	}
}

export default GenreTitle;

