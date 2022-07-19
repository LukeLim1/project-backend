/* =============================================================================
== TAM'S COMMENT ==
===================

Good idea to have these in another file. Try naming them with a captital lteter
at the start though, e.g. UserTemplate.

============================================================================= */
export interface dmTemplate {
    dmId: number;
    dmOwner: number;
    name: any;
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
    usedChannelNums: number[];
    DMs: dmTemplate[];
}
