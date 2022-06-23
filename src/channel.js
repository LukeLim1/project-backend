import {getData, setData} from './dataStore';
import { userProfileV1 } from './users';

function channelInviteV1 (authUserId, channelId, uId) {
    return 'authUserId' + 'channelId' + 'uId';
}

function channelMessagesV1 (authUserId, channelId) {
    return 'authUserId' + 'channelId' + 'start';
}

export function channelDetailsV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);
    const ownerMembers = [];
    const allMembers = [];
    const owner = data.users.find(o => o.userId === channel.ownerMembers[0]);
    const userArr = [];

    if (!channel) {
        return { error: 'error' };
    }

    //check if user with authUserId belongs to channel with channelId
    if (!channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    }

    for (const member of channel.allMembers) {
        const user = userProfileV1(member.userId, member.userId);
        userArr.push(user);
    }
    

    return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: owner,
        allMembers: userArr,
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

export function channelJoinV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);
    const user = data.users.find(user => user.userId === authUserId);

    if (!channel) {
        return { error: 'error' };
    }   

    if (channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    } else if (channel.isPublic === false) {
        return { error: 'error' };
    }

    channel.allMembers.push(user);
    setData(data);
}