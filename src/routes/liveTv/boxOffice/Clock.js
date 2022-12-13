import { React, Moment, Component } from '../../../utils/common';

class Clock extends Component{
	constructor(props){
		super(props);
		const timeInfo = this.getTime();
		
		this.state = {
			nowTime : timeInfo.timeStamp,
			minute : timeInfo.nowMinute
		}
	}

	componentDidMount() {
		let intervalId = setInterval(e => {
			this.timeCheck()
		}, 1000);

		this.setState({
			intervalId: intervalId
		});
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	getTime() {
		let now = new Date();
		let current = now / 1000;
		const nowMinute = now.getMinutes();

		return {timeStamp: current, nowMinute : nowMinute}
	}

	timeCheck() {
		const timeInfo = this.getTime();
		
		if(this.state.minute !== timeInfo.nowMinute){
			this.setState({
				nowTime : timeInfo.timeStamp,
				minute : timeInfo.nowMinute
			});
		}
	}

	render(){
        const {nowTime} = this.state;
        
		return(
			<Moment className="currentDate" unix format="YYYY.M.D (dd) H:mm">{nowTime}</Moment>
		)
	}
}

export default Clock;