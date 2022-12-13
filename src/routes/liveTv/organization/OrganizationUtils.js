import epgData from './epgData'
import epgData_dummy from './jsd.json';


//STATIC 변수
const TIMEUNIT = 1800 //30min
const TIME2PIXEL = 1425 / 5400 //time * (TIME2PIXEL) = width(px) 1425 = 편성표 화면에 보이는 크기
const TIMELINEVIEWBIG = 490 //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈
const TIMELINEVIEWMINI = 250 //시간 프로그래스 표시되는 컨텐츠 최소 가로사이즈
// const TIMEUNIT = 300; //5min
//width / (TIME2PIXEL) = time


export function fav_mapping(epgData_fav, epgData){
    /* 선호 채널 init settings 
    epgData_fav MeTv API 를 통해 가져온 선호채널 목록
    epgData chaneel 정보
    */
    for (let i=0; i < epgData.length; i++) {
        for (let j=0;j< epgData_fav.length; j++){
            if (epgData[i].svc_id === parseInt(epgData_fav[j].svc_id)) {
                epgData[i].favorite = true
            }
        }
    }
    return epgData
}

/// TODO : 예약 프로그램 개발
export function rvs_mapping(epgData_rvs, epgData, pageNo){
    /* 예약 프로그램 호출간 settings 
    epgData_rvs RVS-503 API 를 통해 가져온 예약 프로그램 목록
    epgData 프로그램 정보
    */
    for (let i=0; i < epgData.length; i++) {
        if (epgData[i].channelPage === pageNo) {
            for(let j=0; j < epgData[i].programs.length; j++) {
                for (let k=0; k < epgData_rvs.length; k++){
                    if (epgData[i].programs[j].channelNo === parseInt(epgData_rvs[k].channelNo)) {
                        epgData[i].programs[j].reservation = true
                    }
                }
            }
        }
    }
    return epgData
}

export function fav_sort(epgData){
    /* 선호 채널 정보만 셋팅 */
    let pageCount = 0
    let channelPage = 0
    let fav_channelIdx = 0
    let fav_epgData = []

    for (let i=0; i < epgData.length; i++){
        if (epgData[i].favorite === true) {
            if(pageCount === 6 ){
                channelPage +=1
                pageCount = 0
            }
            pageCount += 1
            epgData[i].channelIdx = fav_channelIdx
            epgData[i].channelPage = channelPage

            fav_channelIdx += 1
            fav_epgData.push(epgData[i])
        }
    }
    return fav_epgData

}

export function genre_sort(genereTypeCode, epgdummy) {
    /*장르 채널 정보만 셋팅 
    genereTypeCode(장르코드)
    */
    let pageCount = 0
    let channelPage = 0
    let genre_channelIdx = 0
    let genre_epgData = []
    
    for (let i=0; i < epgdummy.length; i++) {
        if ( epgdummy[i].genre === genereTypeCode) {
            if (pageCount === 6) {
                channelPage += 1
                pageCount = 0
            }
            pageCount += 1
            epgdummy[i].channelIdx = genre_channelIdx
            epgdummy[i].channelPage = channelPage

            genre_channelIdx += 1
            genre_epgData.push(epgdummy[i])
        }
    }
    return genre_epgData
}

export function getChannelsByPageNumber(epgData, pageNo) {
    /*페이지 번호에 해당하는 채널 데이터만 get */
    let epgDataLen = epgData.length
    let epgResultData = []

    for (let i = 0; i < epgDataLen; i++){
        if (epgData[i].channelPage === pageNo){
            epgResultData.push(epgData[i])
        }
    }
    return epgResultData
}

export function getMaxPage(epgLength) {
    /* 최대 페이지  */
    let chcountPerPage = 6
    let quotient = 0
    let remainder = 0
    quotient = parseInt(epgLength / chcountPerPage)
    remainder = parseInt(epgLength % chcountPerPage)
        
    if ( remainder !== 0) {
        quotient = quotient + 1
    }
    quotient = quotient - 1 // pageNo 0에서 시작함으로 -1 
    return quotient
}

export function getNextChByChNo(epgResult, channelNo) {
    for (let i = 0; i < epgResult.length; i++){  
        if (epgResult[i].channel === channelNo){
            if(i === (epgResult.length - 1))                /// 마지막 페이지
                return epgResult[0];                        /// 첫 페이지 리턴
            else
                return epgResult[i + 1];
        }
    }
    return null;
}

export function getPrevChByChNo(epgResult, channelNo) {
    for (let i = 0; i < epgResult.length; i++){  
        if (epgResult[i].channel === channelNo){
            if(i === 0)                                     /// 첫째 페이지
                return epgResult[epgResult.length - 1];     /// 마지막 페이지 리턴
            else
                return epgResult[i - 1];
        }
    }
    return null;
}

export function getChannelByPage(epgResult, type, channelNo) {
    /* 편성표 진입시 실시간 보고 있는 채널 번호를 가져와 
        페이지에 보여줄 채널들을 셋팅해준다. 
    */
    let PageNo = 0
    let focusChannelIdx = 0
    let epgData = []

    if (type === 'fav' || type === 'genre') {
        channelNo = 0 
    }
    // console.log('getChannelByPage :: ', channelNo);
    // console.log('epgResult~!   ', epgResult)
    // 해당 채널의 page 번호를 가져온다.
    for (let i = 0; i < epgResult.length; i++){  
        if (epgResult[i].channel === channelNo){
            PageNo = epgResult[i].channelPage
            break
        }
    }

    // 해당 채널 pageNo 의 모든 채널 정보를 가져옴
    for (let i=0; i < epgResult.length;i++){
        if (epgResult[i].channelPage === PageNo){
            epgData.push(epgResult[i])   
        }
    }
    
    //focus 할 채널 설정
    for ( let i = 0; i < epgData.length; i ++) {
        if ( channelNo === epgData[i].channel) {
            focusChannelIdx = i
        }
    }
    
    return {
        getChannelList: epgData, 
        PageNo : PageNo, 
        focusChannelIdx: focusChannelIdx
    }
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
    let max = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i].focusDuration > max.focusDuration) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

export function channelUpDownAdjacencyMove(itemsData, before_channel_idx, before_programs_idx, change_channel_idx, now) {
    let items =  []

    items = itemsData
    
    //change_channel_idx = before_channel_idx - 1
    //console.log('change_channel_idx :: ', change_channel_idx)
    //console.log('before_channel_idx :: ', before_channel_idx)
    let before_startTime = items[before_channel_idx].programs[before_programs_idx].startTime
    let before_endtTime  = items[before_channel_idx].programs[before_programs_idx].endTime
    let next_startTime
    let next_endTime
    let nextFoucsProgramIndex

    let scrollValue// = this.state.scrollLeft;
    let programsTime
    let currentTimeFocusable = false

    let change_channel_programs_length
    let programStartTime
    let programEndTime

    //현재 시간에 포함될 경우
    if ( before_startTime <= now && before_endtTime >= now ) { 
        change_channel_programs_length = items[change_channel_idx].programs.length
        for ( let i=0; i < change_channel_programs_length; i ++) {
            programStartTime = items[change_channel_idx].programs[i].startTime
            programEndTime = items[change_channel_idx].programs[i].endTime
            
            if ( now >= programStartTime && now <= programEndTime) {
                nextFoucsProgramIndex = i
                //break;
            }
        }
        currentTimeFocusable = true
        //console.log('items ', items)
    } 
    //현재시간에 포함이 안될경우
    else { 
        //items = items[change_channel_idx];
        let change_channel_program_length = items[change_channel_idx].programs.length

        let target_programs = []
        let duration = 0
        let focusDuration = 0
        let target_startTime
        let target_endTime

        // duration, i startTime, endTime
        for (let i=0; i < change_channel_program_length; i ++){
            next_startTime = items[change_channel_idx].programs[i].startTime
            next_endTime   = items[change_channel_idx].programs[i].endTime
            if (before_startTime === next_startTime) { 
                /*  --------
                    --------     */
                if (before_endtTime === next_endTime) { // before start === after start && before end  === after end (Start Equal, End Equal)
                    // nextFoucsProgramIndex = i
                    // break; 
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime,
                    })
                } 
                /*  -----
                    --------     */
                else if (before_endtTime < next_endTime) { // before start === after start && before end < after end (Start Equal, < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                } 
                /*  --------
                    -----     */
                else if (before_endtTime > next_endTime) { // before start === after start && before end > after end (Start Equal, > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime,
                    })
                }
            } 
            else if (before_startTime > next_startTime) {
                /*     ----
                    -------     */
                if (before_endtTime === next_endTime) {  // before start > after start && before end === after end ( > , End Equal )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - before_startTime
                    })
                } 
                /*     -------
                    -------     */
                else if (before_endtTime > next_endTime) { // before start > after start && before end > after end ( > , > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - before_startTime
                    })
                } 
                /*     ---
                    ---------     */
                else if (before_endtTime < next_endTime) { // before start > after start && before end < after end ( > , < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - before_startTime
                    })
                }
            } 
            else if (before_startTime < next_startTime) {
                /*  ---------
                        -----         */
                if (before_endtTime === next_endTime) {  // before start < after start && before end === after end ( > , End Equal )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                } 
                /*  ---------
                       ---         */ 
                else if (before_endtTime > next_endTime) { // before start < after start && before end > after end ( < , > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime
                    })
                }
                
                /*  ---------
                       ---------   */ 
                else if (before_endtTime < next_endTime) { // before start < after start && before end < after end ( < , < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                }
        
            }
        }
        
        // let max_focusDuration = 0
        // let nextFoucsProgramIndex = 0
        // for ( let i =0; i < target_programs.length; i ++){
        //     if (target_programs[i].focusDuration >=  max_focusDuration) {
        //         max_focusDuration = target_programs[i].focusDuration
        //         nextFoucsProgramIndex = target_programs[i].idx;
        //         if (target_programs[i].focusDuration ===  max_focusDuration) {
        //             if ( nextFoucsProgramIndex > target_programs[i].idx) {
        //                 nextFoucsProgramIndex = target_programs[i].idx
        //             }
        //         }
        //     }
        //     //console.log('max :: ', max_focusDuration_idx)
        // }
        nextFoucsProgramIndex = indexOfMax(target_programs)
        // console.log('max :: ', nextFoucsProgramIndex)

        //const DATA = now;           
        const STARTTIMELINE = TIMEUNIT * Math.floor(now / TIMEUNIT)
        let total_contentW = 0
        let change_contentW = 0
        let left_contentw = 0
        let maxRight = 1426

        let item_programs
        
        for (let j=0; j <= nextFoucsProgramIndex; j++) {
            //console.log(this.state.items[change_channel].programs[j]);
            item_programs = items[change_channel_idx].programs[j]
            if (j === nextFoucsProgramIndex) {
                change_contentW = (item_programs.endTime - item_programs.startTime) * TIME2PIXEL
                programsTime = item_programs.startTime
            } else {
                if (j === 0) {
                    left_contentw += (item_programs.endTime - STARTTIMELINE) * TIME2PIXEL
                }else{
                    left_contentw += (item_programs.endTime - item_programs.startTime) * TIME2PIXEL
                }   
            }
        }
        total_contentW = change_contentW + left_contentw

        if (left_contentw + change_contentW < maxRight) {
            scrollValue = 0
        } else if (left_contentw + change_contentW >= maxRight) {
            scrollValue = left_contentw
        } else {
            if (left_contentw >= maxRight)  {
                scrollValue = left_contentw
            }
        }
    }

    return {
        currentTimeFocusable : currentTimeFocusable,
        nextFoucsProgramIdx : nextFoucsProgramIndex,
        focusRow : change_channel_idx,
        scrollLeft : scrollValue,
        programsTime : programsTime
    }            
}


// 페이지 이동시, 인접위치 계산을 위해 새로 생성한 'channelUpDownAdjacencyMove' => 유사 함수 
export function __channelUpDownAdjacencyMove(epgResult, prevProgram, prevChannelNo, direction, now) {
    let prev =  []
    let next = []

    prev = prevProgram
    if (direction === 'DOWN')
        next = getNextChByChNo(epgResult, prevChannelNo);
    else
        next = getPrevChByChNo(epgResult, prevChannelNo);

    if(!next) return null
    
    let before_startTime = prev.startTime
    let before_endtTime  = prev.endTime
    let next_startTime
    let next_endTime
    let nextFoucsProgramIndex

    let scrollValue// = this.state.scrollLeft;
    let programsTime
    let currentTimeFocusable = false

    let change_channel_programs_length
    let programStartTime
    let programEndTime

    //현재 시간에 포함될 경우
    if ( before_startTime <= now && before_endtTime >= now ) { 
        change_channel_programs_length = next.programs.length
        for ( let i=0; i < change_channel_programs_length; i ++) {
            programStartTime = next.programs[i].startTime
            programEndTime = next.programs[i].endTime
            
            if ( now >= programStartTime && now <= programEndTime) {
                nextFoucsProgramIndex = i
                //break;
            }
        }
        currentTimeFocusable = true
    } 
    //현재시간에 포함이 안될경우
    else { 
        let change_channel_program_length = next.programs.length

        let target_programs = []
        let duration = 0
        let focusDuration = 0
        let target_startTime
        let target_endTime

        // duration, i startTime, endTime
        for (let i=0; i < change_channel_program_length; i ++){
            next_startTime = next.programs[i].startTime
            next_endTime   = next.programs[i].endTime
            if (before_startTime === next_startTime) { 
                /*  --------
                    --------     */
                if (before_endtTime === next_endTime) { // before start === after start && before end  === after end (Start Equal, End Equal)
                    // nextFoucsProgramIndex = i
                    // break; 
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime,
                    })
                } 
                /*  -----
                    --------     */
                else if (before_endtTime < next_endTime) { // before start === after start && before end < after end (Start Equal, < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                } 
                /*  --------
                    -----     */
                else if (before_endtTime > next_endTime) { // before start === after start && before end > after end (Start Equal, > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime': target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime,
                    })
                }
            } 
            else if (before_startTime > next_startTime) {
                /*     ----
                    -------     */
                if (before_endtTime === next_endTime) {  // before start > after start && before end === after end ( > , End Equal )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - before_startTime
                    })
                } 
                /*     -------
                    -------     */
                else if (before_endtTime > next_endTime) { // before start > after start && before end > after end ( > , > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - before_startTime
                    })
                } 
                /*     ---
                    ---------     */
                else if (before_endtTime < next_endTime) { // before start > after start && before end < after end ( > , < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - before_startTime
                    })
                }
            } 
            else if (before_startTime < next_startTime) {
                /*  ---------
                        -----         */
                if (before_endtTime === next_endTime) {  // before start < after start && before end === after end ( > , End Equal )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                } 
                /*  ---------
                       ---         */ 
                else if (before_endtTime > next_endTime) { // before start < after start && before end > after end ( < , > )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : target_endTime - target_startTime
                    })
                }
                
                /*  ---------
                       ---------   */ 
                else if (before_endtTime < next_endTime) { // before start < after start && before end < after end ( < , < )
                    target_endTime = next_endTime
                    target_startTime = next_startTime
                    target_programs.push({
                        'idx' : i,
                        'startTime' : target_startTime,
                        'endTime' : target_endTime,
                        'duration' : target_endTime - target_startTime,
                        'focusDuration' : before_endtTime - target_startTime
                    })
                }
        
            }
        }
        
        nextFoucsProgramIndex = indexOfMax(target_programs)
        // console.log('max :: ', nextFoucsProgramIndex)

        //const DATA = now;           
        const STARTTIMELINE = TIMEUNIT * Math.floor(now / TIMEUNIT)
        let total_contentW = 0
        let change_contentW = 0
        let left_contentw = 0
        let maxRight = 1426

        let item_programs
        
        for (let j=0; j <= nextFoucsProgramIndex; j++) {
            item_programs = next.programs[j]
            if (j === nextFoucsProgramIndex) {
                change_contentW = (item_programs.endTime - item_programs.startTime) * TIME2PIXEL
                programsTime = item_programs.startTime
            } else {
                if (j === 0) {
                    left_contentw += (item_programs.endTime - STARTTIMELINE) * TIME2PIXEL
                }else{
                    left_contentw += (item_programs.endTime - item_programs.startTime) * TIME2PIXEL
                }   
            }
        }
        total_contentW = change_contentW + left_contentw

        if (left_contentw + change_contentW < maxRight) {
            scrollValue = 0
        } else if (left_contentw + change_contentW >= maxRight) {
            scrollValue = left_contentw
        } else {
            if (left_contentw >= maxRight)  {
                scrollValue = left_contentw
            }
        }
    }

    return {
        currentTimeFocusable : currentTimeFocusable,
        nextFoucsProgramIdx : nextFoucsProgramIndex,
        // focusRow : change_channel_idx,
        scrollLeft : scrollValue,
        programsTime : programsTime
    }            
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
// export function shallowEqual(objA: mixed, objB: mixed): boolean {
    export function shallowEqual(objA, objB) {
    if (objA === objB) {
    return true;
    }

    if (typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null) {
    return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
    return false;
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = hasOwnProperty.bind(objB);
    for (var i = 0; i < keysA.length; i++) {
        if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
}

export function dummyDataMapping(nowTime, channelNo, focusChannelIdx){
// id   Number  아이디
// name String  이름
// description  String  설명
// imagePath    String  이미지 경로
// channelID    Number  채널 아이디
// contentNibble1   Number  Info 1(장르)
// contentNibble2   Number  Info 2
// contentUserNibble1   Number  User Info 1
// contentUserNibble2   Number  User Info 2
// director String  감독
// actors   String  배우
// startTime    Date    시작 시간
// endTime  Date    종료 시간
// duration Number  방영 시간
// runningStatus    Number  상태(0 : Hidden, 1 : Not Running, 3 : Pause, 4 : Running)
// rating   Number  시청 연령(0 : All, 3 / 7 / 12 / 15 / 18 / 19)
// audioType    Number  오디오 타입(0 : None, 1 : Mono, 2 : Stereo, 3 : AC3)
// price    String  가격
// freeCAMode   Number  Free CA Mode
// videoResolution  Number  화면 해상도(0 : SD, 1 : HD)
// isCaption    Boolean 캡션 여부
// isDolbyAudio Boolean 돌비 오디오 여부
// isDVS    Boolean DVS 여부

// id   Number  아이디
// name String  이름
// num  Number  번호
// uri  String  소스 경로
// imagePath    String  이미지 경로
// genre    Number  장르
// category Number  카테고리
// type Number  타입(0 : Reserved, 1 : DTV, 2 : Digit Radio, 128 : Audio)
// areaCode Number  지역 코드
// pcrPID   Number  PCR PID
// rating   Number  시청 연령(0 : All, 3/7/12/15/18/19)
// runningStatus    Number  상태(0 : Hidden, 1 : Not Running, 3 : Pause, 4 : Running)
// sampleTime   Number  미리보기 시간
// resolution   Number  화면 해상도(0 : SD, 1 : HD)
// isPay    Boolean 유료 채널 여부

    let epgData = []
    let epgDev = []
    let epgData_fav = []
    let devCount = 232
    let channelPage = 0
    let pageCount = 0

    var channelData

    // GET dummy channel info
    for (let i = 0; i < devCount; i++){ 
        channelData = epgData_dummy[i]

        if (pageCount === 6){
            channelPage += 1
            pageCount = 0
        }
        pageCount += 1

        epgDev.push({
            channelIdx: i,
            channelPage: channelPage,
            idx : i,
            svc_id: channelData.svc_id,
            channelName : channelData.channelName,
            channel : channelData.channel,
            uri: channelData.uri,
            logoImage: channelData.logoImage,
            genre : channelData.genre,
            category : channelData.category,
            type : channelData.type,
            areaCode : channelData.areaCode,
            pcrPID: channelData.pcrPID,
            rating : channelData.rating,
            runningStatus : channelData.runningStatus,
            sampleTime : channelData.sampleTime,
            resolution : channelData.resolution,
            isPay : channelData.isPay,
            favorite : false, //선호채널 등록 여부
            block : false // 차단채널 등록 여부
        });
    }
    // GET dummy programs per channel info
    const STARTTIMELINE = TIMEUNIT * Math.floor(nowTime / TIMEUNIT);
    const ENDTIMELINE = STARTTIMELINE + (1450 + TIME2PIXEL);
    let programsLength;

    for (let i = 0; i < devCount; i++) {
        if (epgDev[i].channel === 1 || epgDev[i].channel === 50) {
            epgDev[i].programs = []
            epgDev[i].programs.push({
                idx : 0,
                id: epgData_dummy[i].programs.id,
                title: 'B tv 전용채널',
                description: epgData_dummy[i].programs.description,
                imagePath: epgData_dummy[i].programs.imagePath,
                channelID: epgData_dummy[i].programs.channelID,
                director: epgData_dummy[i].programs.director,
                actors: epgData_dummy[i].programs.actors,
                startTime: STARTTIMELINE,
                endTime: ENDTIMELINE,
                duration: ENDTIMELINE-STARTTIMELINE,
                rating: 'ALL',
                price: '0',
            });
        } else {
            epgDev[i].programs = []
            programsLength = epgData_dummy[i].programs.length
            for (let j =0; j < programsLength; j++){
                epgDev[i].programs.push(
                    {
                        idx : j,
                        id: epgData_dummy[i].programs[j].id,
                        title: epgData_dummy[i].programs[j].title,
                        description: epgData_dummy[i].programs[j].description,
                        imagePath: epgData_dummy[i].programs[j].imagePath,
                        channelID: epgData_dummy[i].programs[j].channelID,
                        contentNibble1: epgData_dummy[i].programs[j].contentNibble1,
                        contentNibble2: epgData_dummy[i].programs[j].contentNibble2,
                        contentUserNibble1: epgData_dummy[i].programs[j].contentUserNibble1,
                        contentUserNibble2: epgData_dummy[i].programs[j].contentUserNibble2,
                        director: epgData_dummy[i].programs[j].director,
                        actors: epgData_dummy[i].programs[j].actors,
                        startTime: epgData_dummy[i].programs[j].startTime / 1000,
                        endTime: epgData_dummy[i].programs[j].endTime / 1000,
                        duration: epgData_dummy[i].programs[j].duration,
                        runningStatus: epgData_dummy[i].programs[j].runningStatus,
                        rating: epgData_dummy[i].programs[j].rating,
                        audioType: epgData_dummy[i].programs[j].audioType,
                        price: epgData_dummy[i].programs[j].price,
                        freeCAMode: epgData_dummy[i].programs[j].freeCAMode,
                        videoResolution: epgData_dummy[i].programs[j].videoResolution,
                        isCaption: epgData_dummy[i].programs[j].isCaption,
                        isDolby: epgData_dummy[i].programs[j].isDolby,
                        isDVS: epgData_dummy[i].programs[j].isDVS
                    }
                );
            }
        }
    }
    return epgDev
}