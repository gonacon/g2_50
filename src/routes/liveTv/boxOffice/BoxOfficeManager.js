//import STB_IF from '../../../supporters/stbInterface.js';
import appConfig from '../../../config/app-config';

export function InsertMenuList (menuData) {
    const menuList = []
    menuList.push({
        category_id :  "1",
        category_name : '인기채널'
    })
    menuList.push({
        category_id :  "2",
        category_name : '선호채널'
    })
    //console.log('Promise.all ing.. : ', this.menuList)
    for (let i=0; i<menuData.channel.length; i++) {
        menuList.push({
            category_id : menuData.channel[i].category_id,
            category_name : menuData.channel[i].category_name
        })
    }
    return menuList;
}

export function channelDataMaaping (stbChannel, realtimeData, favorite, block, join) {
    let realtimeChannel = [];
    realtimeChannel = realtimeChannelMapping(stbChannel, realtimeData);    
    if(favorite) {
        realtimeChannel = favoritChannel(realtimeChannel, favorite);
    }
    if(block) {
        realtimeChannel = blockChannel(realtimeChannel, block);
    }
    if(join) {
        realtimeChannel = joinChannel(realtimeChannel, join)
    }
    return realtimeChannel
}

export function joinChannel (realtimeChannel, join) {
    
    for (const channelInfo of realtimeChannel) {
        const isJoin = join ? join.indexOf(channelInfo.channelNo) !== -1 : false;
        let isCharged = channelInfo.channelIsPay ? channelInfo.channelIsPay: false;
        isCharged = isCharged && !isJoin;
        channelInfo.channelIsPay = isCharged
    }   
    return realtimeChannel;
}

export function channelDataMaapingDev (channelInfo, realtimeData, favorite, block) {
    let realtimeChannel = [];
    
    realtimeChannel = realtimeChannelMappingDev(channelInfo, realtimeData)
    if(favorite) {
        realtimeChannel = favoritChannel(realtimeChannel, favorite)
    }
    if(block) {
        realtimeChannel = blockChannel(realtimeChannel, block)
    }
    // console.log('realtimeChannel : ', realtimeChannel)
    return realtimeChannel
}

export function realtimeChannelMapping(stbChannel, topChannels) {
    let bestChannels = [];
    for(let i=0; i < topChannels.length; i++){
        const channelNo = Number(topChannels[i].channel_no);
        const channelInfo = stbChannel.get(channelNo);
        //console.log('i : ', i , 'channelInfo :: ', channelInfo)
        bestChannels.push({
            channelIdx : i,
            channelOrder: topChannels[i].order,
            channelPrevOrder : topChannels[i].previous_order,
            channelNo : topChannels[i].channel_no,
            channelName : topChannels[i].channel_name,
            channelImg : channelInfo ? channelInfo.img : '',
            channelUri :  channelInfo ? channelInfo.uri : '',
            channelIsPay :  channelInfo ? channelInfo.pay : '',
            channelRating :  channelInfo ? channelInfo.rating : '',
            channelSvcID :  channelInfo ? channelInfo.id : '',
            channelResolution : channelInfo ? channelInfo.resolution : '',
            channelFavorite : false,
            channelBLock : false,
            channelVirtual :  channelInfo ? false : true,
        })        
    }
    //console.log('bestChannels : ',bestChannels)
    return bestChannels;
}

export function realtimeChannelMappingDev(channelInfo, channels) {
    let realtimeChannels = [];
    
    for (let i=0; i < channels.length; i++) {
        for (let j=0; j < channelInfo.length; j++) {
            if (Number(channels[i].channel_no) === channelInfo[j].channel) {
                realtimeChannels.push({
                    channelIdx : i,
                    channelOrder : channels[i].order,
                    channelPrevOrder : channels[i].previous_order,
                    channelNo : channels[i].channel_no,
                    channelName : channels[i].channel_name,
                    channelImg : channelInfo[j].logoImage,
                    channelUri : channelInfo[j].uri,
                    channelIsPay : channelInfo[j].isPay,
                    channelRating : channelInfo[j].rating,
                    channelSvcID : channelInfo[j].svc_id,
                    channelFavorite : channelInfo[j].favorite,
                    channelBLock : channelInfo[j].block
                })
            }
        }
    }
    return realtimeChannels;
}

export function favoritChannel(realtimeChannel, favoriteList){
    for(let i=0; i < realtimeChannel.length; i++) {
        for(let j=0; j < favoriteList.length; j++) {
            if(realtimeChannel[i].channelNo === favoriteList[j]) {
                realtimeChannel[i].channelFavorite = true;
            }
        }
    }
    return realtimeChannel;
}

export function blockChannel(realtimeChannel, blockList) {
    for(let i=0; i < realtimeChannel.length; i++) {
        for(let j=0; j < blockList.length; j++) {
            
            if(realtimeChannel[i].channelNo === blockList[j]) {
                realtimeChannel[i].channelBLock = true;
            }
        }
    }
    
    return realtimeChannel;
}

export function getChannelNoList (boxOfficeList) {
    let channelNoList = [];
    for (let i=0; i < boxOfficeList.length; i++) {
        channelNoList.push(boxOfficeList[i].channelNo);
    }
    return channelNoList;
}

export function realtimeProgramMapping(boxOfficeList, programByChannel) {
    for(const [i, boxOfficeInfo] of boxOfficeList.entries()){
        boxOfficeList[i].program = {};
        for(const [j, programByChInfo] of programByChannel.entries()) {
            if(!boxOfficeInfo.channelVirtual){
                if(boxOfficeInfo.channelNo === programByChInfo.channelNo) {
                    boxOfficeList[i].program = {
                        title : programByChannel[j].title,
                        imagePath : appConfig.headEnd.IGSIMAGE.url + programByChannel[j].channelID + '.png',
                        startTime : programByChannel[j].startTime,
                        endTime : programByChannel[j].endTime,
                        duration : programByChannel[j].duration,
                        rating : programByChannel[j].rating,
                        price : programByChannel[j].price,
                        isCaption : programByChannel[j].isCaption,
                        videoResolution : programByChannel[j].videoResolution,
                        isDolby: programByChannel[j].isDolby,
                        isDVS: programByChannel[j].isDVS
                    }
                }
            }else{
                boxOfficeList[i].program = {
                    title : '',
                    imagePath : '',
                    startTime : '',
                    endTime : '',
                    duration : '',
                    rating : boxOfficeList[i].channelRating,
                    price : boxOfficeList[i].channelIsPay,
                    isCaption : '',
                    videoResolution : '',
                    isDolby: '',
                    isDVS: ''
                }
            }
        }
    }
    //console.log('boxOfficeList after: ', boxOfficeList) 
    return boxOfficeList;
}

export function realtimeProgramMappingDev (boxOfficeList, programByChannel) {
    
    for(let i=0; i < boxOfficeList.length; i++) {
        boxOfficeList[i].program = [];
        for(let j=0; j < programByChannel.length; j++) {
            if (boxOfficeList[i].channelNo === programByChannel[j].channelNo) {
                boxOfficeList[i].program.push({
                    title : programByChannel[j].title,
                    imagePath : appConfig.headEnd.IGSIMAGE.url + programByChannel[j].channelID + '.png',
                    startTime : programByChannel[j].startTime,
                    endTime : programByChannel[j].endTime,
                    duration : programByChannel[j].duration,
                    rating : programByChannel[j].rating,
                    price : programByChannel[j].price,
                    isCaption : programByChannel[j].isCaption,
                    videoResolution : programByChannel[j].videoResolution,
                    isDolby: programByChannel[j].isDolby,
                    isDVS: programByChannel[j].isDVS
                })
            }
        }
    }
    return boxOfficeList;
}

