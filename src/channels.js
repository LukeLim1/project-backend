import { getData, setData} from './dataStore';

function channelsCreateV1 ( authUserId, name, isPublic ) {
    const data = getData();
    let randomNumber = Math.floor(Math.random() * 1000);
    if (data.usedNums.length !== 0) {
        randomNumber += data.usedNums[data.usedNums.length - 1];
    }
    data.usedNums.push(randomNumber);

    // error case
    if (name.length < 1 || name.length > 20) {
        return {error: 'error'};
    }
    
    data.channels.push({
        name: `${name}`,
        isPublic: isPublic, 
        ownerMembers: [authUserId],
        allMembers: [authUserId],
        channelId: randomNumber,
    });
    setData(data);
    return {channelId: randomNumber};
}



function channelsListV1 (authUserId) {
    
    const data = getData();

    const obj_arr = [];

    for (const channel of data.channels) {
        if (channel.allMembers.includes(authUserId)) {
            const channels_obj = {
                channelId: channel.channelId,
                name: channel.name,
            }
        
            obj_arr.push(channels_obj);
        
        }

    }

//   const channels = {
//        channels: obj_arr,
//   }

    return obj_arr;

}

function channelsListallV1 (authUserId) {

    const data = getData();

    const obj_arr = [];

    for (const element of data.channels) {

        const channels_obj = {
            channelId: element.channelId,
            name: element.name,
        }
        
        obj_arr.push(channels_obj);
    
    }


    return obj_arr;

}



export { channelsListV1, channelsListallV1, channelsCreateV1 };