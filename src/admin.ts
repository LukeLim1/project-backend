import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { removeItemAll } from './helperFunctions';

function userRemove (uId: number) {
    const data = getData();
    const user = data.users.find(u => u.userId === uId);
    if (!user) {
        throw HTTPError(400, "user not found");
    }

    for (const channel of data.channels) {
        if (channel.allMembers.includes(uId)) {
            channel.allMembers = removeItemAll(channel.allMembers, uId) as number[];
            user.numChannelsJoined--;
        }
    }

    const userHandle = user.handle;
    for (const dm of data.DMs) {
        for (const msg of dm.messages) {
            if (msg.uId === user.userId) {
                msg.message = 'Removed user';
            }
        }

        if (dm.name.includes(user.handle)) {
            dm.name = removeItemAll(dm.name, userHandle) as string[];
            user.numDmsJoined--;
        }
    }

    user.firstName = 'Removed';
    user.lastname = 'user';
    setData(data);
    return {};
}

function userPermissionChange(uId: number, permissionId: number) {
    const data = getData();
    const user = data.users.find(u => u.userId === uId);
    if (!user) {
        throw HTTPError(400, "user not found");
    }

    // uId refers to only global owner being demoted to user
    if (1) {
        throw HTTPError(400, "uId refers to only global owner being demoted to user");
    }

    // invalid permissionId
    if (1) {
        throw HTTPError(400, "invalid permission ID");
    }

    if (user.permissions === permissionId) {
        throw HTTPError(400, "user's permission is already set to given ID");
    }

    // authorised user is not a global owner
    if (1) {
        throw HTTPError(403, "user is not a global owner")
    }

    // notification?

    user.permissions = permissionId;
    setData(data);

    return {};
}

export { userRemove, userPermissionChange };
