<<<<<<< HEAD
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

export interface IReact {
    reactId: number;
    uIds: number[];
    isThisUserReacted: boolean;
}

export interface notifications {
    channelId: number;
    dmId: number;
    notificationMessage: string;
}

export interface messageTemplate {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
    reacts: IReact[];
    isPinned: boolean;
}

export interface standup {
    active: false;
    start: null;
    timeFinish: null;
    message: messageTemplate[];
}

export interface channelTemplate {
    name: string;
    isPublic: boolean;
    ownerMembers: IUser[];
    allMembers: IUser[];
    channelId: number;
    messages: messageTemplate[];
    standup: standup[];
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
    uId: number;
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
    notifications: notifications[];
    passwordRequest: passwordRequest[];
}
=======
export interface notifications {
	channelId: number;
	dmId: number;
	notificationMessage: string;
}

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

export interface IReact {
	reactId: number,
	uIds: number[],
	isThisUserReacted: boolean
}

export interface messageTemplate {
	messageId: number;
	uId: number;
	message: string;
	timeSent: number;
	reacts: IReact[],
	isPinned: boolean
}

export interface dmTemplate {
	dmId: number;
	dmOwner: IUser;
	name: string;
	members: IUser[];
	messages: messageTemplate[];
}

export interface passwordRequest {
	email: string,
	passReq: string
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
	usedChannelNums: number[];
	DMs: dmTemplate[];
	messages: messageTemplate[];
	passwordRequest: passwordRequest[]
}

export interface Error {
	error: 'error';
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Empty { }

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
>>>>>>> 878690456bafe4c5a7cdac37b9f80714a0bf0ec6
