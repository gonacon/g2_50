import {React} from '../../../utils/common';
import '../../../assets/css/routes/myBtv/my/ListClientService.css';

class ListClientService extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slideTo:0,
            slideItem : this.props.slideInfo.slideItem
        }
    }
    focusOn(_this){
		let index = arguments[0];
        let slideIndex = this.state.slideTo;
        let activeSlide = document.activeElement;

        if(index === slideIndex || index === slideIndex + 1 || index === slideIndex - 1){
            activeSlide.closest('.contentGroup').classList.add('activeSlide');
        }else{
            activeSlide.closest('.contentGroup').classList.remove('activeSlide');
        }

        this.setState({
            slideTo: slideIndex
        });
    }

    render() {
        return(
			<div className="contentGroup">
				<div className="listClientService">
					<div className="title">{this.props.slideInfo.slideTitle}</div>
					<div className="listWrapper">
                        {
                            this.state.slideItem.map((data, i) => {
                                return(

									<div className="list" key={i}>
										<div className="csFocus inner" to={data.link} onFocus={this.focusOn.bind(this, i)}>
											<img src={data.imageS} alt=""/>
											<img src={data.imageB} alt=""/>
											<span className="text">{data.title}</span>
										</div>
                                        {(data.new !== undefined && <span className="new">N</span>)}
									</div>
                                )
                            })
                        }
					</div>
				</div>
			</div>
        );
    }
}

export default ListClientService;