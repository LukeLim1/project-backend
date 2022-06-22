import {getData, setData} from './dataStore';
import {channelsListV1, channelsListallV1} from './channels';
import {userProfileV1} from './users';

function channelInviteV1 (authUserId, channelId, uId) {
    return 'authUserId' + 'channelId' + 'uId';
}

function channelMessagesV1 (authUserId, channelId) {
    return 'authUserId' + 'channelId' + 'start';
}

function channelDetailsV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);

    if (!channel) {
        return { error: 'error' };
    }

    //check if user with authUserId belongs to channel with channelId
    if (!channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    }

    return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: [],   // needs modification
        allMembers: [],     // needs modification
    }

    /*
    for (const channel of channelsList) {
        if (channel.channelId === channelId) {
            details.name = channel.name;
            details.isPublic = true; // needs modification
            details.ownerMembers = [];
            details.allMembers = [];
        }
    }
    */
}

function channelJoinV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);
    const userDetails = userProfileV1(authUserId, authUserId);  // needs modification

    if (!channel) {
        return { error: 'error' };
    }   

    if (channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    } else if (channel.isPublic === false) {
        return { error: 'error' };
    }

    channel.allMembers.push(userDetails);
    setData(data);
}