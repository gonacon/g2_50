import React, { Component } from 'react';
import PropTypes from 'prop-types';

class GenreHeader extends Component {

    defaultProps = {
        title: {
            depth1Title: '',
            depth2Title: '',
        }
    }

    propTypes = {
        title: PropTypes.object.isRequired,
    }

    render() {
        const { depth1Title, depth2Title } = this.props.title;

        return (
            <div>
                <div className="genreHeader">
                    <h2 className="homeTitle">{depth1Title}</h2>
                    <p className="subTitle">{depth2Title}</p>
                </div>
            </div>
        )
    }
}

export default GenreHeader;
