import React, { Component } from 'react';
import styled from 'styled-components';

const Slide = styled.div`
    width: 300px;
    height: 500px;
`;

class AEDSlideTest extends Component {
    constructor(props) {
        super(props);

        const random = () => Math.floor(Math.random() * 256 );
        this.state = {
            color: `rgb(${random()}, ${random()}, ${random()})`
        };
    }

    render() {
        const { title } = this.props;
        const { color } = this.state;
        return <Slide style={{backgroundColor: color}}>
            {title}
        </Slide>
    }
}

export default AEDSlideTest;