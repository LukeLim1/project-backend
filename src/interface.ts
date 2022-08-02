export interface IUser {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
}

export interface IMessages {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
}

export interface notification {
    channelId: number;
    dmId: number;
    notificationMessage: string;
}

export interface messageTemplate {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
}

export interface channelTemplate {
    name: string;
    isPublic: boolean;
    ownerMembers: IUser[];
    allMembers: IUser[];
    channelId: number;
    messages: messageTemplate[];
}

export interface dmTemplate {
    dmId: number;
    dmOwner: IUser;
    name: string;
    members: IUser[];
    messages: messageTemplate[];
}

export interface userTemplate {
    emailAddress: string;
    userId: number;
    password: string;
    firstName: string;
    lastname: string;
    handle: string;
    globalPermissionId: number;
    token: string[];
    numChannelsJoined: number;
    numDmsJoined: number;
    numMessagesSent: number;
}

export interface Error {
    error: 'error';
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Empty {}

export interface IChannelDetails {
    name: string;
    isPublic: boolean;
    ownerMembers: IUser[];
    allMembers: IUser[];
}

export interface IDmMessages {
    messages: IMessages[];
    start: number;
    end: number;
}

export interface messageId {
    messageId: number,
}

export interface passwordRequest {
    email: string,
    passReq: string
}

export interface dataTemplate {
    users: userTemplate[];
    channels: channelTemplate[];
    usedNums: number[];
    usedTokenNums: number[];
    usedChannelNums: number[];
    DMs: dmTemplate[];
    messages: messageTemplate[];
    numChannels: number;
    numDms: number;
    numMsgs: number;
    passwordRequest: passwordRequest[];
    notifications: notification[];
}
