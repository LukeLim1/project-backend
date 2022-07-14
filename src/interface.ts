export interface dmTemplate {
    dmId: number;
    dmOwner: number;
    name: string[];
    messages: any[];
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

export interface dataTemplate {
    users: userTemplate[];
    channels: any[];
    usedNums: number[];
    usedTokenNums: number[];
    DMs: dmTemplate[];
}

export interface Error {
    error: 'error';
}

export interface Empty {}
    
export interface IChannelDetails {
    name: string;
    isPublic: boolean;
    ownerMembers: IUser[];
    allMembers: IUser[];
}

export interface IUser {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
}

export interface IDmMessages {
    messages: IMessages[];
    start: number;
    end: number;
}

export interface IMessages {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
}