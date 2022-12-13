import React, { Component } from 'react';
import moment from 'moment';
import Moment from 'react-moment';

const TIME = {
    UNIT: 1800,
    MIN: 60,
    HOUR: 3600,
    CHUNK: 60 * 60 * 4, // 4시간
    TOPIXEL: 0.2638888888888889, // 1425 / 5400
};

// starttime, endtime, now, 전체 width를 동기화 해서 같이 쓸지 말지...
class Timeline extends Component {
    constructor(props) {
        super(props);

        this.state = {
            start: 0,
            end: 0,
            cnt: 0
        }
    }

    static defaultProps = {
        startTime: 0,
        now: 0
    }

    update = (props) => {
        const { startTime, now } = props;
        const endTime = startTime + TIME.CHUNK;
        let cnt = (endTime - startTime) / TIME.UNIT; // 나누어 떨어져야됨.
       
        if (cnt > 1000) {
            return;
        }
        const start = startTime;
        const end = endTime;
        this.setState({ start, end, cnt });
    }

    renderTimeline() {
        const { start, cnt } = this.state;
        const timeline = [];
        for (let i = 0; i < cnt; i++) {
            const time = start + TIME.UNIT * i;
            timeline.push(
                <Moment className="currentDate" unix format="HH:mm" key={i}>{time}</Moment>
            );
        }
        return timeline;
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps) !== JSON.stringify(this.props);
    }

    componentWillMount() {
        this.update(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            this.update(nextProps);
        }
    }

    render() {
        const timeline = this.renderTimeline();
        return (
            <span className="timeTop">
                {timeline}
            </span>
        )
    }
}

export default Timeline;