import React from 'react';
import { Moment } from '../../../utils/common';
import '../../../assets/css/routes/liveTv/organization/Organization.css';

import { shallowEqual } from './OrganizationUtils'
import appConfig from './../../../config/app-config';

//STATIC 변수
//const TIMEUNIT = 1800; //30min
// const TIMEUNIT = 300; //5min
//const TIME2PIXEL = 1425 / 5400; //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기
//width / (TIME2PIXEL) = time
const TIMELINEVIEWBIG = 490; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈
const TIMELINEVIEWMINI = 250; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈

class ProgramsByChannel extends React.Component{  
    timerId = 0;
    constructor(props){
        super(props)
        this.state = {
            focused : false,
            idx : this.props.idx
        }
        //let paramData = this.paramData;
        this.counter = 0;
        this.pid = this.props.id + "_" + this.props.idx;
    }

    // onFocus(){
    //     this.setState({
    //         focused: true,
    //     });
    // }
    // onBlur() {
    //     this.setState({
    //         focused: false
    //     });
    // }

    shallowCompare(instance, nextProps, nextState) {
        return (
          !shallowEqual(instance.props, nextProps) ||
          !shallowEqual(instance.state, nextState)
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        // const result = this.shallowCompare(this, nextProps, nextState);
        // if(!result)
        //     console.log("ProgramsByChannel >>>>>>>>>>> shouldComponentUpdate is false ... ", ++this.counter);
        // return result;
        return this.shallowCompare(this, nextProps, nextState);
    }

    render () {
        let data = this.props.data
        let idx = this.props.idx
        let contentW = this.props.contentW
        let channelRating = this.props.channelInfo.rating
        let programTitle
        
        if (channelRating === 21) {
            programTitle = '청소년 보호 프로그램'
        }else{
            programTitle = data.title
        }

        //contentW <= TIMELINEVIEWMINI
        return (
            <span id={this.pid} className={ this.state.focused ? 'csFocus live focusOn' : 'csFocus'} style={{width:contentW + 'px'}} key={idx} >
                <div className="title"><span>{programTitle}</span></div>
                {this.state.focused && data.rating !== '' && contentW > TIMELINEVIEWMINI ?
                <span className="rating">
                    {data.rating === 0 ? 'All' : data.rating}
                </span> 
                : ''
                }
                {this.state.focused ? data.isDolby === 'true'  && contentW > TIMELINEVIEWMINI ? <span className="dolby">DOLBY</span> : '' : ''}
                {data.thumbImage !== '' ? <div className="imgWrap"><img src={data.thumbImage} alt="" /></div> : ''}
                {this.state.focused && contentW > TIMELINEVIEWBIG ?
                    <div className="timeCon">
                        <Moment unix format="HH:mm">{data.startTime}</Moment>
                        {data.startTime <= this.props.startTime ?
                            <span className="timeLine"><span style={{width:(this.props.nowTime - data.startTime)/(data.endTime - data.startTime) * 100 + '%'}}></span></span>
                            :
                            '~'
                        }
                        <Moment unix format="HH:mm">{data.endTime}</Moment>
                        {data.isAlarm === 'true' ? <span className="alarm"></span> : ''}
                    </div>
                    :
                    ''
                }
                {this.state.focused && contentW <= TIMELINEVIEWBIG && contentW > TIMELINEVIEWMINI ?
                    <div className="timeCon">
                        <span>
                            <Moment unix format="HH:mm">{data.startTime}</Moment>
                            ~
                            <Moment unix format="HH:mm">{data.endTime}</Moment>
                        </span>
                        {data.isAlarm === 'true' && contentW > TIMELINEVIEWMINI ? <span className="alarm"></span> : ''}
                    </div>
                    :
                    ''
                }
                {contentW <= TIMELINEVIEWMINI ?
                    <div className="toolTip" style={{}}>
                        <span>{data.title}</span>
                        <Moment unix format="HH:mm">{data.startTime}</Moment>
                        ~
                        <Moment unix format="HH:mm">{data.endTime}</Moment>
                        {data.isAlarm === 'true' && contentW > TIMELINEVIEWMINI ? <span className="alarm"></span> : ''}
                        <img src={`${appConfig.headEnd.LOCAL_URL}/liveTv/tooltip-arr.png`} style={{}}alt="" />
                    </div>
                    :
                    ''
                }
            </span>
        )
    }
}
export default ProgramsByChannel