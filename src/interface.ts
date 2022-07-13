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
