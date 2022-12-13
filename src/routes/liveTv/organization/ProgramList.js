import { React,  Moment } from '../../../utils/common';
import '../../../assets/css/routes/liveTv/organization/Organization.css';
import PageView from '../../../supporters/PageView';
import ProgramsByChannel from './ProgramsByChannel';

import { shallowEqual } from './OrganizationUtils'
import FM from '../../../supporters/navi';

import moment from 'moment';



//STATIC 변수
const TIMEUNIT = 1800; //30min
// const TIMEUNIT = 300; //5min
const TIME2PIXEL = 1425 / 5400; //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기
//width / (TIME2PIXEL) = time
const TIMELINEVIEWBIG = 490; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈
const TIMELINEVIEWMINI = 250; //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈

const PROGRAMOFFSET = 5400;     //90 minutes unixtime


class ProgramList extends React.Component {
    constructor(props){
        super(props)
        this.pid = "orgPWId" + this.props.num;
        this.counter = 0;
    }
    
    componentDidMount() {
        /// 포커스 리스트 생성
        const { setFm, num, programs, focusList } = this.props;
		const fm = new FM({
            id : this.pid,
            containerSelector : '.orgProgramList',
            focusSelector : '.csFocus',
            row : 1,
			col : programs.length,
			focusIdx : 0,
			startIdx : 0,
			lastIdx : programs.length - 1,
			onFocusContainer: this.onFocused,
			onFocusChild: this.onFocusChild,
			onFocusKeyDown: this.onKeyDown
		});
        setFm(this.pid, fm);
        focusList.push(fm);
    }

    shallowCompare(instance, nextProps, nextState) {
        return (
          !shallowEqual(instance.props, nextProps) ||
          !shallowEqual(instance.state, nextState)
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        // const result = this.shallowCompare(this, nextProps, nextState);
        // if(!result)
        //     console.log("programList >>>>>>>>>>> shouldComponentUpdate is false ... ", ++this.counter);
        // return result;
        return this.shallowCompare(this, nextProps, nextState);
    }

    onFocused = () => {
    }
    onFocusChild = () => {
    }
	onKeyDown = () => {
    }
    
    render() {
        var programsW = 0;
        let orgStartTime;
        let contentW;

        return (
            <div id={this.pid} className={this.props.focusRow === 'true' ? 'orgProgramList active' : 'orgProgramList'}>
            {
                this.props.programs.map((data, i) => {
                    if (i === 0 ){
                        data.startTime <= this.props.nowTime ? orgStartTime = this.props.startTime : orgStartTime = this.props.startTime;
                    }else{
                        orgStartTime = data.startTime;
                    }
                    
                    //TODO 추후 장르/카테고리 의 데이터로 B Tv 전용채널 / 가상채널의 경우 데이터 내려오면 코드값으로 변경 할것
                    //시나리오 문서 17P 
                    data.title === 'B tv 전용채널' ? contentW = this.props.totalWidth : contentW = (data.endTime - orgStartTime) * TIME2PIXEL;
                    programsW += contentW;

                    if (data.title === '집사부일체(11회)(재)') {
                        const s = moment(orgStartTime*1000).format('MMDD HH:mm');
                        const e = moment(data.endTime*1000).format('MMDD HH:mm');
                        console.log('orgStartTime', s, e, contentW );
                    }

                    {/* console.log("programsW =========> ", ++this.counter); */}
                    
                    return (
                        <ProgramsByChannel
                            key={i}
                            idx = {i}
                            data={data}
                            id={this.pid}
                            channelNo = {this.props.num}
                            channelInfo = {this.props.channel}
                            contentW = {contentW}
                            nowTime = {this.props.nowTime}
                            focusRow = {this.props.focusRow} 
                            focusRowIdx = {this.props.focusRowIdx}
                        /> 
                    );
                })  
            }
            {   
                Math.floor(this.props.totalWidth) > Math.floor(programsW) && 
                <div className="programNone" style={{width: (this.props.totalWidth - programsW) > 2300? (2000) : (this.props.totalWidth - programsW) + 'px' }}> 프로그램 정보 없음</div>
            }
            {/* `I should be rendered only 1 time. actual times rendered: ${++this.counter}` */}
            </div>
        )
    }
}

export default ProgramList;