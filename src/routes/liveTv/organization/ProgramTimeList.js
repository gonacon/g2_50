import { React,  Moment } from '../../../utils/common';

class ProgramTimeList extends React.Component{
    render(){
        return (
            <span className="timeTop">
                <Moment className="currentDate" unix format="HH:mm">{this.props.value}</Moment>
            </span>
        )
    }
}

export default ProgramTimeList;