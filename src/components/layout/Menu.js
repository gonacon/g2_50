import { React } from '../../utils/common';
import PropTypes from 'prop-types';
// import '../../assets/css/components/layout/Menu.css';
import Core from './../../supporters/core';

class Menu extends React.Component {

	static propTypes = {
		menulist: PropTypes.array.isRequired
	}

	constructor(props) {
		super(props);
		this.state = {
			classlist: ['topMenu'],
			defaultFocus: 2,		// 홈
			firstCall: true
		}
	}

	focusOn = index => {
		let i = index + 1
		this.setState({ classlist: ['topMenu', 'active', 'bg' + i] });
	}

	focusOut = () => {
		this.setState({ classlist: ['topMenu'] });
	}

	goToGenreHome = (menuId, index, menuName, evt) => {
		if (evt.key === 'Enter') {
			this.setState({ defaultFocus: index });

			Core.inst().move("/kids/character/home");
			// this.props.setCurrentGnbMenuId(menuId);
		}
	}

	render() {

		let { classlist, defaultFocus } = this.state;
		let { menulist } = this.props;

		return (
			<div className={classlist.join(' ')}>
				<div className="menuWrap">
					<ul>
						{
							menulist.map((menu, index) => {
								if (menu.menu_id === 'A000001522') {		// 키즈
									return (
										<li key={index}>
											<em to=""
												className={defaultFocus === index ? "csFocus on" : "csFocus"}
												onFocus={this.focusOn.bind(this, index)}
												onBlur={this.focusOut}
												onKeyDown={this.goToGenreHome.bind(null, menu.menu_id, index, menu.menu_nm)}
												tabIndex="-1">
												{menu.menu_nm}
											</em>
										</li>
									);
								} else {
									return (
										<li key={index}>
											<em to=""
												className={defaultFocus === index ? "csFocus on" : "csFocus"}
												onFocus={this.focusOn.bind(this, index)}
												onBlur={this.focusOut}
												// onKeyDown={this.goToGenreHome.bind(null, menu.menu_id, index, menu.menu_nm)}
												tabIndex="-1">
												{menu.menu_nm}
											</em>
										</li>
									);
								}
							})
						}
					</ul>
					<em className="schBtn" tabIndex="-1"><span className="iconSch"></span></em>
				</div>
			</div>
		)
	}

    /**
     * Mount
     */
	componentWillMount() {
	}

	initialize() {
		let _target = document.querySelectorAll('.topMenu .csFocus');
		for (let i = 0; i < _target.length; i++) {
			_target[i].addEventListener('sn:navigatefailed', function (e) {
				if (e.detail.direction === 'down') {
					if (document.querySelector('.mainSlide') !== null) {
						// SpatialNavigation.focus('.content .active .csFocus');
					} else if (document.querySelector('.detailTop') !== null) {
						// SpatialNavigation.focus('.detailTop .csFocus');
					} else if (document.querySelector('.kidsMenu') !== null) {
						// SpatialNavigation.focus('.kidsMenu .csFocus.active');
					} else {
						document.querySelectorAll('.contentGroup .csFocus')[0].focus();
					}
				}

			});
		}
	}

	componentDidMount() {
		this.initialize();
	}

	componentDidUpdate(prevProps, prevState) {
		this.initialize();
	}

};

export default Menu;