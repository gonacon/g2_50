import React, { Component } from 'react';
import { SlideInfo } from './SlideInfo';
import Utils from './../../../../../utils/utils';
import appConfig from './../../../../../config/app-config';

class G2SlidePlayList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            isTextOver: false
        }
    }

    setTextOver() {
		const { width } = SlideInfo[this.props.slideType];
		let { isTextOver } = this.state;
		if (!this.titBox) return;
	
		if (this.titBox.clientWidth > width && isTextOver !== true) {
		  this.setState({ isTextOver: true });
		}
    }

    componentDidMount() {
		this.setTextOver();
	}
	
	componentDidUpdate() {
		this.setTextOver();
	}
    
    render() {
        const { imgV, title, slideType } = this.props;
        const { width, height } = SlideInfo[slideType];
		const imgUrl = Utils.getImageUrl(Utils.IMAGE_KIDS.KIDS_IMAGE_SIZE_VER);
        
        const { isTextOver } = this.state;
        let textOver = isTextOver ? ' textOver' : '';
        
		const defaultImg = appConfig.headEnd.LOCAL_URL + '/common/img/thumbnail-default-land.png';
		let image = imgUrl + imgV;
		
        return (
            <div className={`slide csFocus${textOver}`}>
                <span className="imgWrap">
                    <img src={image} width={width} height={height} alt="" onError={e=>e.target.src=defaultImg}/>
                </span>
                <span className="slideTitle" ref={r => this.titBox = r}>{title}</span>
			</div>
        )
    }
}

export default G2SlidePlayList;