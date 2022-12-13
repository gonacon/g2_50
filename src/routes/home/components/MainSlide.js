// commons
import React, { Component } from 'react';
import { HorizontalList } from 'Navigation';

// utils
import PropTypes from 'prop-types';
import { scroll } from '../../../utils/utils';

// style
import '../../../assets/css/components/modules/MainSlide.css';
import { cloneDeep, isEmpty } from 'lodash';

// components
import MainSlideItem from './MainSlideItem';

class MainSlide extends Component {

	itemWidth = 1920; // 슬라이드 가로 폭
	timer = null;
	prevFocusIndex = 1;

	static propTypes = {
		slideInfo: PropTypes.array.isRequired
	}

	static defaultProps = {
		slideInfo: []
	}

	constructor(props) {
		super(props);
		
		this.state = {
			slideTo: 1,
			slideItem: this.props.slideInfo,
			interval: 3000,
			mainSlide: [],
			slideWrap: '',
			slideWrapper: ''
		};
	}

	transitionEnd = () => {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;

		if ( slideIndex === 0 || slideIndex === slideLength - 1 ) {
			this.setState({ slideWrapper: 'transitionNone' })
		}
	}
	
	focusOn = (idx) => {
		let slideIndex = this.state.slideTo;
		let slideLength = this.state.slideItem.length;
		let first = 1;
		let last = slideLength - 2;

		scroll(0);
		clearInterval(this.timer);
		this.setState({
			mainSlide: ['autoPlayStop', 'focus'],
			slideWrap: 'activeSlide',
		});
		console.log('### focus on 이전 index : ', this.prevFocusIndex);
		console.log('### focus on 현재 index : ', idx + 1);

		if ( slideIndex === first || slideIndex === last ) {
			this.setState({ slideWrapper: [] });
		}
		
		if ( this.prevFocusIndex < idx+1 ) {
			this.setState({ slideTo: slideIndex + 1 });
		} else if ( this.prevFocusIndex > idx+1 ) {
			this.setState({ slideTo: slideIndex - 1 });
		}

	}

	focusOut = (idx) => {
		this.prevFocusIndex = idx + 1;
		clearInterval(this.timer);
		this.setState({
			mainSlide: [],
			slideWrap: '',
		});
		this.autoPlay();
	}

	keyDown = (event) => {
	}
	
	autoPlay(){
		clearInterval(this.timer);
		let slideLength = this.state.slideItem.length;
		this.timer = setInterval(() => {
			let slideIndex = this.state.slideTo;
			if ( slideIndex === 1 || slideIndex === slideLength - 2 )
				this.setState({ slideWrapper: [] });
			this.setState({ slideTo: this.state.slideTo + 1 });
		}, this.state.interval);
	}

	renderSlideItem() {
		let { slideItem, slideTo } = this.state;
		return slideItem.map((data, i) => (
			<MainSlideItem
				key={i}
				index={i}
				imageS={data.imageS}
				activeClass={i === slideTo ? ['active', 'focusOn'] : []}
				maxLength={slideItem.length}
				focusOn={ this.focusOn }
				focusOut={ this.focusOut }
			/>
		));
	}

	renderPager() {
		let { slideItem, slideTo } = this.state;
		let iterator = new Array(slideItem.length -2).fill(0);
		return (
			<div className="slidePage">
				{iterator.map((item, i) => (
					<span key={i} className={i+1 === slideTo ? 'on' : ''} />
				))}
			</div>
		);
	}

	componentDidMount() {
		if ( this.state.mainSlide.indexOf('autoPlayStop') === -1 ) {
			this.autoPlay();
		}
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	componentWillUpdate(nextProps, nextState) {
		let { slideTo, slideItem } = this.state;
		
		if ( slideItem.length !== 0 ) {
			if ( slideTo < 1 )
				this.setState({ slideTo: slideItem.length -2 });
			else if ( slideTo > slideItem.length -2 )
				this.setState({ slideTo: 1 })
		} else {
			clearInterval(this.timer);
		}
	}

	componentWillReceiveProps(nextProps) {
		if ( JSON.stringify(this.props) === JSON.stringify(nextProps) ) {
			this.setState({ slideItem: nextProps.slideInfo });

			let { slideItem } = this.state;
			let first = 1;
			let last = slideItem.length-1;
			let data = cloneDeep(slideItem);

			if ( slideItem.length ) {
				data.unshift( cloneDeep(data[last]) );
				data.push( cloneDeep(data[first]) );
		
				this.setState({ slideItem: data });
			}
		}
	}

	render() {
		const { mainSlide, slideWrap, slideWrapper, slideTo, slideItem } = this.state;
		const length = slideItem.length;
		const slideWrapperStyle = {'--page': slideTo,'width': length * this.itemWidth};
		return (
			<HorizontalList>
				<div className="contentGroup">
					{!isEmpty(slideItem) ? (
					<div className={ `mainSlide ${mainSlide.join(' ')}` }>
						<div className={ `slideWrap ${slideWrap}` }>
							<div className="slideCon">
								<div className={ `slideWrapper ${slideWrapper}` }
									onTransitionEnd={ this.transitionEnd }
									style={slideWrapperStyle}>
									{ this.renderSlideItem() }
								</div>
							</div>
							<div className="slideLeft" /><div className="slideRight" />
							{ this.renderPager() }
						</div>
					</div>
					) : null}
				</div>
			</HorizontalList>
		)
	}

}

export default MainSlide;