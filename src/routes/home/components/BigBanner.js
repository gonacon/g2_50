import React, { Component } from 'react';
import { G2NaviBannerSlider, G2NaviBanner } from 'Module/G2Slider';

class BigBanner extends Component {
	shouldComponentUpdate(nextProps) {
		return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	}
	render() {
		const {
			list,
			onSelect,
			onFocusSlider,
			onBlurSlider,
			onOapPlayState,
			setFm,
			isHome,
			setBannerSlider
		} = this.props;

		return (
			<G2NaviBannerSlider id="banner"
				autoPlay={true}
				duration={80}
				onSelect={onSelect}
				onFocusSlider={onFocusSlider}
				onBlureSlider={onBlurSlider}
				onOapPlayState={onOapPlayState}
				dataList={list}
				setFm={setFm}
				isHome={isHome}
				ref={r => setBannerSlider(r)}
			>
				{list.map((banner, idx) => (
					<G2NaviBanner key={idx}
						imgs={banner.imgs}
						link={banner.link}
						isSingle={banner.isSingle}
						isOAP={true} />
				))}
			</G2NaviBannerSlider>
		)
	}
}

export default BigBanner;