import { React } from '../../../utils/common';


class TopMenuList extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            loadFocus : 0,
            focused : false,
            menuPage : 0
        }
    }
    onFocus(_this, idx){
        this.setState({
            loadFocus : idx,
            focused : true
        })
    }

    onBlur(_this, idx){
        this.setState({
            loadFocus : idx,
            focused : false
        })
    }

    render() {
        
        return (
            <span className={this.state.focused ? 'focusOn ' + this.props.classname:this.props.classname} key={this.props.idx} >
                {this.props.topMenuName}
            </span>
        )
    }
}

export default TopMenuList;