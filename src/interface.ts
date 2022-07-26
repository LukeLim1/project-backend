export interface dmTemplate {
    dmId: number;
    dmOwner: number;
    name: any;
    messages: any[];
}

export interface messageTemplate {
    channelId: number;
    messageId: number;
    message: string;
    token: string;
}

export interface userTemplate {
    emailAddress: string;
    userId: number;
    password: string;
    firstName: string;
    lastname: string;
    handle: string;
    permissions: number;
    token: string[];
}

export interface channelTemplate {
    name: string;
    isPublic: boolean;
    ownerMembers: number[];
    allMembers: number[];
    channelId: number;
    messages: messageTemplate[];
}

export interface dataTemplate {
    users: userTemplate[];
    channels: channelTemplate[];
    usedNums: number[];
    usedTokenNums: number[];
    usedChannelNums: number[];
    DMs: dmTemplate[];
    messages: messageTemplate[];
}

export interface Error {
    error: 'error';
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Empty {}

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

export interface IChannelDetails {
    name: string;
    isPublic: boolean;
    ownerMembers: any;
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
