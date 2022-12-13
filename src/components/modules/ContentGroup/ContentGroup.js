import React, { Component } from 'react';
import PropsTypes from 'prop-types';

class ContentGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: true
        };

        this.rect = null;
        this.content = null;
    }

    static contextTypes = {
        ContentContainer: PropsTypes.object
    }

    // 처음 한번 자기 자신의 RECT 를 업데이트 하고 groupContainer 에 업데이트한다.
    // width 값은 쓰지 않고 only top & height 값만 씀. 
    // width 값을 쓸려면 매번 업데이트 해야됨.
    addRect = () => {
        if (this.contentElement && !this.rect) {
            const contentRect = this.contentElement.getBoundingClientRect();
            const {
                left,
                top,
                right,
                bottom,
                width,
                height
            } = contentRect;
            
            this.rect = {
                left,
                top: this.contentElement.offsetTop, // getBoundingClientRect 가 부정확해서 offsetTop 사용.. 왜일까..
                right,
                bottom: this.contentElement.offsetTop + height,
                width,
                height,
                added: false
            };

            const { ContentContainer } = this.context;
            const { idx } = this.props;
            if (ContentContainer) {
                ContentContainer.addRect({content: this, rect: this.rect, idx});
            }
        }
    }

    getRect = () => {
        return this.rect;
    }

    getContentElement = () => {
        return this.contentElement;
    }

    show = () => {
        const { show } = this.state;
        if (show) {
            return;
        }
        this.setState({
            show: true
        });
    }

    hide = () => {
        const { show } = this.state;
        if (!show) {
            return;
        }
        this.setState({
            show: false
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(this.state) !== JSON.stringify(nextState) || this.children !== nextProps.children;
    }

    componentDidMount() {
        const { anchor } = this.props;
        if (anchor) {
            anchor(this.contentElement);
        }
        this.addRect();
    }

    componentDidUpdate() {
        // this.updateRect();
    }

    componentWillUnmount() {
        const { ContentContainer } = this.context;
        if (ContentContainer) {
            ContentContainer.deleteRect(this);
        }
    }

    render () {
        const {
            id,
            className,
            style,
            children
        } = this.props;

        const { show } = this.state;

        const addedStyle = Object.assign({}, style, {
            display: show? 'block': 'none'
        });

        return show?(
            <div id={id} className={className} style={addedStyle} ref={r=>this.contentElement=r}>
                { children }
            </div>
        ):null;
    }
}

export default ContentGroup;