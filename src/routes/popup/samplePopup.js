
import React, {Component} from 'react';
import './samplePopup.css';

class Popup extends React.Component {
  constructor() {
    super();

    this.state = {
        active: false,
    };
  }

  onBlur() {
    this.setState({active: false});
  }

  onFocus() {
    this.setState({active: true});
  }

  render() {
    return(
        <div className='popup'>
            <div className='popup_inner'>
                <h1>{this.props.text}</h1>
                <button onClick={this.props.closePopup}>close me</button>
            </div>
        </div>
    );
  }
}

export default class samplePopup extends React.Component {
    constructor(){
        super();
        this.state = {
            showPopup: true
        };
    }
    togglePopup() {
        this.setState({
            showPopup: !this.state.showPopup
        });
    }
    render() {
        return (
            <div className='samplePopup'>
                <h1>hihi</h1>
                <button onClick={this.togglePopup.bind(this)}>show popup</button>
                <button onClick={()=>{alert('wooooooooot?');}}>try me when popup is open</button>
                <p>daemang7 test ~~~~ <br /></p>
                {this.state.showPopup ? 
                    <Popup text='Close Me'
                        closePopup={this.togglePopup.bind(this)}
                    />
                    : null
                }
            </div>
        );
    }
}