import React from 'react';

import Sidebar from './Sidebar.js';
import List from './List.js';
import Search from './Search.js';

// import './Sample2.css';

import Navigation, { VerticalList, HorizontalList } from '../../supporters/navigation';

class Sample2 extends React.Component {
  constructor() {
    super();

    this.state = {
      active: null,
    }

    this.lists = ["Title 1", "Title 2", "Title 3", "Title 4"]
  }

  changeFocusTo(index) {
    console.log(`Sample2 -> changeFocusTo(${index})`);
    this.setState({active: index});
  }

  onBlurLists() {
    console.log(`Sample2 -> onBlurLists()`);
    this.setState({active: null});
  }

  render() {
    return (
      <Navigation>
        <div id="container">
          <HorizontalList>
            <Sidebar/>
            <div className="mainbox">
              <VerticalList navDefault>
                <Search/>
                <VerticalList id="content" onBlur={() => this.onBlurLists()}>
                  {this.lists.map((list, i) =>
                    <List title={list} onFocus={() => this.changeFocusTo(i)} visible={this.state.active !== null ? i >= this.state.active : true}/>
                    ///--<List title={list} onFocus={() => this.changeFocusTo(i)} />  
                  )}
                </VerticalList>
              </VerticalList>
            </div>
          </HorizontalList>
        </div>
      </Navigation>
    );
  }
}

export default Sample2;
