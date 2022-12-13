import React, { PureComponent, Fragment } from 'react';

class NumberInput extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            selectionStart: null
        };
    }

    static defaultProps = {
        maxLength: 4,
        id: null,
        className: 'inputText csFocusInput'
    };

    keyUp = ({nativeEvent: evt}) => {
        if ( evt.key === 'a' && this.input.selectionStart !== 0 ) {
            this.input.selectionStart = this.state.selectionStart - 1;
            this.input.selectionEnd = this.state.selectionStart - 1;
        }
    }

    keyDown = ({nativeEvent: evt}) => {
        const { onKeyDown } = this.props;
        const { value } = this.state;
        const selectionStart = this.input.selectionStart -1;
        let newValue = value.slice(0);

        if ( evt.key === 'a' && this.input.selectionStart !== 0 ) {
            let newValue1 = newValue.split('');
            newValue1.splice(selectionStart, 1)
            this.setState({
                value: newValue1.join(''),
                selectionStart: this.input.selectionStart
            }, () => {
                if (typeof onKeyDown === 'function') {
                    onKeyDown(evt, this.state.value);
                }
            });
        } else {
        }
    }

    keyInput = ({nativeEvent: evt}) => {
        if (!evt.data)
            return;
        evt.preventDefault();
        const { onKeyDown, maxLength } = this.props;
        const { value } = this.state;
        const selectionStart = this.input.selectionStart - 1;
        let newValue = value.split('');
        if ( value.length < maxLength && ( evt.data.charCodeAt() >= 48 && evt.data.charCodeAt() <= 57 ) ) {
            newValue.splice(selectionStart, 0, evt.data);
            this.setState({
                value: newValue.join('')
            }, () => {
                if (typeof onKeyDown === 'function') {
                    onKeyDown(evt, this.state.value);
                }
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        if ( nextProps.restoreInput ) {
            this.setState({ value: '' }, () => {
                this.props.restoreInputStateToggle();
            });
        }
    }

    render() {
        const { innerRef, id, maxLength, className, placeholder } = this.props;
        const { value } = this.state;
        let additionalProps = {};
        if (id) {
            additionalProps.id = id;
        }
        if (placeholder) {
            additionalProps.placeholder = placeholder;
        }
        return (
            <Fragment>
                <input 
                    {...additionalProps}
                    maxLength={maxLength}
                    type="text"
                    className={className}
                    onChange={this.keyInput}
                    onKeyDown={this.keyDown}
                    onKeyPress={this.keyPress}
                    onKeyUp={this.keyUp}
                    value={value}
                    ref={r => { innerRef(r); this.input = r; }}
                />
                <label htmlFor="label"/>
            </Fragment>
        );
    }
}

export default NumberInput;