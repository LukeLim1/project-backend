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

export interface dmTemplate {
    dmId: number;
    dmOwner: IUser;
    name: string;
    members: IUser[];
    messages: messageTemplate[];
}

export interface messageTemplate {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
    reacts: IReact[];
    isPinned: boolean;
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
    ownerMembers: IUser[];
    allMembers: IUser[];
    channelId: number;
    messages: messageTemplate[];
}

export interface dataTemplate {
    users: userTemplate[];
    channels: any[];
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
