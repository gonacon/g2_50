import React, { Component, Fragment } from 'react';
import Moment from 'react-moment';
// import moment from 'moment';
import appConfig from './../../../../config/app-config';

const TIME2PIXEL = 1425 / 5400;

const PROGRAM_SIZE = {
    TINY: 0,
    SMALL: 1,
    BIG: 2,
};

// 한구간 타임라인의 픽셀 width
const TIMEWIDTH = 3800; // CHUNK * TOPIXEL

class ChannelScheduleList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            focusedRow: -1,

            scheduleList: null,
            reservations: [],
        }
    }

    static defaultProps = {
        list: [],
        allReservations: [],
        reservations: [],
        channelIdx: -1,
        programIdx: -1
    }

    componentDidMount() {
        const { allReservations, channels } = this.props;
        this.updateReservations(allReservations, channels);
    }

    componentWillReceiveProps(nextProps) {
        const { allReservations, channels } = nextProps;
        if (JSON.stringify(this.props.allReservations) !== JSON.stringify(nextProps.allReservations)) {
            this.updateReservations(allReservations, channels);
        }
    }

    updateReservations = (allReservations, channels) => {
        const reservations = [];
        if (allReservations) {
            for (let i=0; i<channels.length; i++) {
                reservations.push( allReservations.get(channels[i].num) );
            }
        }
        
        this.setState({
            reservations
        });
        console.error('예약정보 업데이트:', reservations);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) 
            || (JSON.stringify(this.state.reservations) !== JSON.stringify(nextState.reservations));
    }

    renderChannelScheduleList = () => {
        const {
            channels,
            programs,
            //reservations,
            channelIdx,
            programIdx,
            startTime,
            endTime,
            width,
            now,
            scrollLeft
        } = this.props;
        const { reservations } = this.state;
        const channelScheduleList = programs.map((programList, idx) => {
            if (!programList) {
                return null;
            }
            const reservationList = reservations[idx];
            return (
                <ChannelSchedule
                    key={idx}
                    programList={programList}
                    reservationList={reservationList}
                    channelInfo={channels[idx]}
                    focused={channelIdx === idx}
                    focusedIdx={channelIdx === idx? programIdx: -1}
                    startTime={startTime}
                    endTime={endTime}
                    width={width}
                    now={now}
                    scrollLeft={scrollLeft}
                />
            );
        });
        return channelScheduleList;
    }

    render () {
        const list = this.renderChannelScheduleList();
        return (
            <Fragment>
                {list}
            </Fragment>
        )
    }
}

class ChannelSchedule extends Component {
    static defaultProps = {
        channelInfo: null,
        programList: [],
        focusedIdx: -1,
        focused: false
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    renderProgramList = () => {
        const {
            channelInfo,
            programList,
            reservationList,
            now,
            focusedIdx,
            startTime: timeStart,
            endTime: timeEnd,
            width,
            focused,
            scrollLeft
        } = this.props;
        
        if (!programList) {
            return null;
        }
        let totalWidth = 0;
        const isAdultChannel = Number(channelInfo.rating) >= 19;
        
        const list = !channelInfo.exclusive? programList.filter((program,idx) => {
            // TODO: 필터링을 여기서 하면 안됨. 가공시에 해야지 선택시 idx오류가 안남
            if (program.startTime >= timeEnd) {
                return false;
            } else if (program.endTime <= timeStart) {
                return false;
            }
            return true;
        }).map((program, idx) => {
            if (!program) {
                return null;
            }

            
            if (!program.noInfo) { // 정보가 있는 경우
                // 시청 예약정보
                // const reservation = reservationList[idx];
                // console.log( '시청예약정보:', reservation);
                let reserved = false;
                if (reservationList) {
                    for(const reserveInfo of reservationList) {
                        if (program.startTime*1000 === parseInt(reserveInfo.startTime, 10)) {
                            reserved = true;
                            break;
                        }
                    }
                }

                const { startTime, endTime } = program;
                let start = startTime < timeStart? timeStart: startTime;
                let end = endTime > timeEnd? timeEnd: endTime;
                let programWidth = (end - start) * TIME2PIXEL;
                const left = totalWidth;
                totalWidth += programWidth;
                if (totalWidth > TIMEWIDTH) {
                    programWidth -= totalWidth - TIMEWIDTH;
                    totalWidth = TIMEWIDTH;
                }

                return (
                    <Program
                        isAdultChannel={isAdultChannel}
                        exclusive={false}
                        scrollLeft={scrollLeft}
                        reserved={reserved}
                        key={idx}
                        now={now}
                        info={program}
                        focused={focusedIdx === idx}
                        width={programWidth}
                        timeStart={timeStart}
                        channelFocused={focused}
                    />
                );
            } else {
                // 프로그램 정보 없음일 경우는 마지막이라 생각하고 처리
                const restWidth = TIMEWIDTH - totalWidth;
                return <ProgramNoInfo 
                            key={idx} 
                            width={restWidth} 
                            focused={focusedIdx === idx}
                            scrollLeft={scrollLeft}
                        />
            }
        }): <Program
                exclusive={true}
                info={{
                    name: `${channelInfo.name} 전용채널`
                }}
                width={width}
                focused={focused}
                scrollLeft={scrollLeft}
            />;
        if (channelInfo.exclusive) {
            totalWidth = TIMEWIDTH;
        }

        // if (Math.ceil(totalWidth) < TIMEWIDTH) {
        //     const restWidth = TIMEWIDTH - totalWidth;
        //     list.push(<ProgramNoInfo key={"noinfo"} width={restWidth}/>);
        // }
        return list;
    }

    render () {
        const { focused } = this.props;
        const focusClass = `orgProgramList${focused? ' active':''}`;
        const list = this.renderProgramList();
        return (
            <div className={focusClass}>
                {list}
            </div>
        )
    }
}

const ProgramNoInfo = (({width, focused}) => {
    return (
        <span className={`programInfoNone orgCsFocus${focused? ' focusOn':''}`} style={{width}}>
            <div className="title">
                <span>프로그램 정보 없음</span>
            </div>
        </span>
    )
});


class Program extends Component {
    static defaultProps ={
        title: '', // 성인 => '청소년 보호 프로그램'
        rating: 'ALL', // All, 7, 12, 15, 19
        dolby: false,
        isAdult: false, // 성인 => 이미지 표시 X

        focused: false,
        isLive: false,
        width: 0,
        reserved: false,

        info: null,

        exclusive: false,
        channelInfo: null

    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
    }

    render () {
        // const { startTime, endTime, now, focused } = this.props;
        // let start = startTime <= now? now: startTime;
        // const width = (endTime - start) * TIME2PIXEL;

        const { 
            info, 
            focused, 
            channelFocused,
            width, 
            now, 
            exclusive, 
            timeStart, 
            reserved: 
            isBooked, 
            isAdultChannel,
            scrollLeft
        } = this.props;

        const defaultInfo = {
            title: '',
            rating: 0,
            dolby: false,
            isAdult: false,
            startTime: 0,
            endTime: 0,
        }
        const programInfo = info? info: defaultInfo;
        const {
            name: title,
            rating,
            dolby,
            startTime,
            endTime,
            img
        } = programInfo;

        // console.error('title:', title, scrollLeft);

        // console.error('프로그램 정보', programInfo);
        const isAdult = rating === 19;

        if (!info) {
            console.error('랜더용 프로그램 정보가 없음');
            return null;
        }

        const isLive = now >= startTime && now <= endTime;
        const focusClass = `orgCsFocus${isLive?' live':''}${focused?' focusOn':''}`;
        const programTitle = (isAdult || isAdultChannel)? '청소년 보호 프로그램': title;
        const imgAge = rating !== undefined? `${appConfig.headEnd.LOCAL_URL}/liveTv/flag-dar-age-${rating===0?'all':rating}.png`: '';
        // console.error('title, rating', title, rating, imgAge);
        let paddingStyle = {};
        if (width < 51) {
            paddingStyle = {
                padding:0
            };
        }
        let size = PROGRAM_SIZE.TINY;
        if (width >= 490) {
            size = PROGRAM_SIZE.BIG;
        } else if ( width < 490 && width >= 250) {
            size = PROGRAM_SIZE.SMALL;
        }
        let watchingRate = 0;
        if (isLive) {
            watchingRate = Math.floor((now - startTime) / (endTime - startTime) * 100);
        }

        // 프로그램 정보 부분 마크업 변경, 가상채널 및 전용채널일시 타이틀 translate해야됨.
        return (
            <span className={focusClass} style={{width, ...paddingStyle}}>
                <div className="title" >
                    <span>{programTitle}</span>
                    
                </div>
                {(focused || channelFocused) && !exclusive && (size !== PROGRAM_SIZE.TINY) &&
                    <span className="rating">
                        <img src={imgAge} alt="" />
                    </span>
                }
                {((focused || channelFocused) && dolby) && <span className="dolby">DOLBY</span>}
                {/* {!isAdult && 
                    <div className="imgWrap">
                        <img src={img} alt="" />
                    </div>
                } */}
                {((focused || channelFocused) && (size === PROGRAM_SIZE.BIG) && !exclusive) && (
                    <div className="timeCon">
                        <Moment unix format="HH:mm">{startTime}</Moment>
                        {isLive? <span className="timeLine"><span style={{width:`${watchingRate}%`}}></span></span>: '~'}
                        <Moment unix format="HH:mm">{endTime}</Moment>
                        {isBooked && <span className="alarm"></span>}
                    </div>
                )}
                {((focused || channelFocused) && size === PROGRAM_SIZE.SMALL && !exclusive) && (
                    <div className="timeCon">
                        <Moment unix format="HH:mm">{startTime}</Moment>
                        ~
                        <Moment unix format="HH:mm">{endTime}</Moment>
                        {isBooked && <span className="alarm"></span>}
                    </div>
                )}
                {(size === PROGRAM_SIZE.TINY && !exclusive) && (
                    <div className="toolTip">
                        <span>{programTitle}</span>
                        <Moment unix format="HH:mm">{startTime}</Moment>
                        ~
                        <Moment unix format="HH:mm">{endTime}</Moment>
                        {isBooked && <span className="alarm"></span>}
                    </div>
                )}
            </span>
        );

    }
}

export default ChannelScheduleList;