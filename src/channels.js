function channelsListV1 (authUserId) {
    
    return authUserId;

}

function channelsListallV1 (authUserId) {

    return authUserId;

}

function channelsCreateV1 ( authUserId, name, isPublic ) {

    return authUserId + name + isPublic;
  
}

export { channelsListV1, channelsListallV1, channelsCreateV1 };