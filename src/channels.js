import { getData, setData} from './dataStore';
function channelsListV1 (authUserId) {
    
    return authUserId;

}

function channelsListallV1 (authUserId) {

    return authUserId;

}

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

export { channelsListV1, channelsListallV1, channelsCreateV1 };