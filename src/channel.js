import {getData, setData} from './dataStore';
import { userProfileV1 } from './users';


export function channelInviteV1 (authUserId, channelId, uId) {
    const data = getData();
    //let channel, user;
    const user = data.users.find(user => user.userId === uId);
    const channel = data.channels.find(channel => channel.channelId === channelId);


    // Checking for invalid cases
    // Case 1: Not a valid user as indicated by invalid uID
    if (!user) {
        return { error: 'error' };
    }
    // Case 2: Not a valid channel as indicated by invalid channelID
    if (!channel) {
        return { error: 'error' };
    }
    // Case 3: Inviting a user who is already a channel member
    if (channel.allMembers.includes(uId)) {
        return { error: 'error' };
    }
    // Case 4: The authorised user is not a member of the valid channel
    if (!channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    }    
    

    // Otherwise, the invited member is added to the channel immediately
    channel.allMembers.push(uId);
    return {};
}

export function channelMessagesV1 (authUserId, channelId, start) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);
    // Setting a new index "end" to be the value of "start + 50"
    // and a new array to store the restructured messages
    let end = start + 50;
    let messagesRestructured;

    // Checking for invalid case
    // Case 1: Invalid channelId
    if (!channel) {
        return { error: 'error' };
    }
    let messagesCopy = channel.messages;

    // Case 2: Start is greater than the total number of messages in the channel
    if (start > messagesCopy.length) {
        return { error: 'error' };
    }
    // Case 3: The authorised user is not a member of the valid channel
    if (start > messagesCopy.length) {
        return { error: 'error' };
    }

    // Otherwise, it should be a "normal" case
    // If the end index belongs to the most recent message
    // returns -1 in "end"
    if (end >= messagesCopy.length - 1) {
        end = -1;   
        messagesRestructured = messagesCopy.slice(0, messagesCopy.length - start);  // We want the older messages
    } else {
        messagesRestructured = messagesCopy.slice(messagesCopy.length - end - 1, messagesCopy.length - start);  // We want the older messages       
    }
    
    // Now flip the messages back so index 0 would be the most recent message when we retrive the selected messages
    messagesRestructured.reverse();
    return { messages: messagesRestructured, start, end }; 
}

// channelDetailsV1
// Given 2 parameters, authUserId and channelId, where the user with authUserId should be a member of the channel with channelId,
// prints out the details of the channel. 

// Parameters: authUserId: integer - This is the Id of a user which is initially generated by authRegisterV1 function
//             channelId: integer - Id of a channel that this function is trying to print detail of, and it's created by channelCreateV1

// Return type: { name, isPublic, ownerMembers, allMembers }
//              { error: 'error' } when any of the following:
//                  channelId is not referring to a channel existing in datastore
//                  channelId is valid, but the authorised user is not a member of the channel (i.e. authUserId not in ownerMembers nor allMembers)

export function channelDetailsV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);

    if (!channel) {
        return { error: 'error' };
    }

    const owner = data.users.find(o => o.userId === channel.ownerMembers[0]);
    const ownerArr = [{
        uId: owner.userId,
        email: owner.emailAddress,
        nameFirst: owner.name.split(' ')[0],
        nameLast: owner.name.split(' ')[1],
        handleStr: owner.handle,
    }];
    const userArr = [];


    //check if user with authUserId belongs to channel with channelId
    if (!channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    }

    for (const member of channel.allMembers) {
        const user = data.users.find(u => u.userId === member)
        const userObj = {
            uId: user.userId,
            email: user.emailAddress,
            nameFirst: user.name.split(' ')[0],
            nameLast: user.name.split(' ')[1],
            handleStr: user.handle,
        }
        userArr.push(userObj);
    }


    return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: ownerArr,
        allMembers: userArr,
    }
}


//channelJoinV1
// Given 2 parameters, authUserId and channelId, joins a user with authUserId to the channel with channelId (in allMembers array)

// Parameters: authUserId: integer - Id of a user who wants to join channel, which is initially generated by authRegisterV1 function
//             channelId: integer - Id of a channel, and it's created by channelCreateV1

// Return type: none
//              { error: 'error' } when any of the following:
//                  channelId is not referring to a channel existing in datastore
//                  authorized user is already a member of the channel (i.e. authUserId is already existing in channel. 
//                                                                      In our case it's in allMembers array)
//                  channelId refers to a private channel, and the authrized user is not a channel member and not a global owner

export function channelJoinV1 (authUserId, channelId) {
    const data = getData();
    const channel = data.channels.find(channel => channel.channelId === channelId);
    const user = userProfileV1(authUserId, authUserId);

    if (!channel) {
        return { error: 'error' };
    }   
    
    if (channel.isPublic === false) {
        return { error: 'error' };
    } else if (channel.allMembers.includes(authUserId)) {
        return { error: 'error' };
    }

    channel.allMembers.push(user.uId);
    setData(data);
}