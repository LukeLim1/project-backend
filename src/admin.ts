import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { checkToken } from './helperFunctions';

// userRemove
// Removes user from channel/DM, change their messages to 'Removed user' and make user's name to 'Removed user' as well

// Parameters: token: string - token of a user to check if this user is authorised to call this function
//             uId: number - Id of a user being removed

// Return type: object {}
//              throws 403 error when token is invalid
//              throws 400 error when uId does not refer to a valid user (when user is not found)
//              throws 400 error when uId refers to only global owner
//              throws 403 error when authorised user is not a global owner

function userRemove (token: string, uId: number) {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  const data = getData();
  const caller = data.users.find(u => u.token.includes(token));
  const user = data.users.find(u => u.uId === uId);
  if (!user) {
    throw HTTPError(400, 'user not found');
  }

  if (caller.globalPermissionId !== 1) {
    throw HTTPError(403, 'authorised user is not a global owner');
  }

  // check if authorised user is the only global owner
  let globalOwnerCount = 0;
  for (const user of data.users) {
    if (user.globalPermissionId === 1) globalOwnerCount++;
  }

  if (globalOwnerCount === 1 && user.globalPermissionId === 1) throw HTTPError(400, 'uId refers to only global owner');

  // delete the user in channel.allMembers and channel.ownerMembers (if they are owner), as well as changing their messages to 'Removed user'
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === user.uId) {
        const index = channel.allMembers.indexOf(member);
        channel.allMembers.splice(index, 1);
        user.numChannelsJoined--;
      }
    }
    for (const owner of channel.ownerMembers) {
      if (owner.uId === user.uId) {
        const index = channel.ownerMembers.indexOf(owner);
        channel.ownerMembers.splice(index, 1);
      }
    }
    for (const msg of channel.messages) {
      if (msg.uId === user.uId) {
        msg.message = 'Removed user';
      }
    }
  }

  // delete the user in dm.members, as well as changing their messages to 'Removed user'
  for (const dm of data.DMs) {
    if (user.uId === dm.dmOwner.uId) {
      dm.dmOwner = null;
    }
    for (const member of dm.members) {
      if (member.uId === user.uId) {
        const index = dm.members.indexOf(member);
        dm.members.splice(index, 1);
        user.numDmsJoined--;
      }
    }
    for (const msg of dm.messages) {
      if (msg.uId === user.uId) {
        msg.message = 'Removed user';
      }
    }
  }

  user.firstName = 'Removed';
  user.lastname = 'user';
  setData(data);
  return {};
}

// userPermissionChange
// changes global permission ID to given permissionId from the user

// Parameters: token: string - token of a user to check if this user is authorised to call this function
//             uId: number - Id of a user being removed

// Return type: object {}
//              throws 403 error when token is invalid
//              throws 400 error when uId does not refer to a valid user (when user is not found)
//              throws 400 error when uId refers to only global owner
//              throws 403 error when authorised user is not a global owner

function userPermissionChange(token: string, uId: number, permissionId: number) {
  if (!checkToken(token)) {
    throw HTTPError(403, 'invalid token');
  }
  const data = getData();
  const caller = data.users.find(u => u.token.includes(token));
  const user = data.users.find(u => u.uId === uId);
  if (!user) {
    throw HTTPError(400, 'user not found');
  }

  // count number of global owners
  let count = 0;
  for (const user of data.users) {
    if (user.globalPermissionId === 1) count++;
  }

  // uId refers to only global owner being demoted to user
  if (count === 1 && user.globalPermissionId === 1 && permissionId === 2) {
    throw HTTPError(400, 'uId refers to only global owner being demoted to user');
  }

  // invalid permissionId
  if (!(permissionId === 1 || permissionId === 2)) {
    throw HTTPError(400, 'invalid permission ID');
  }

  if (user.globalPermissionId === permissionId) {
    throw HTTPError(400, "user's permission is already set to given ID");
  }

  // authorised user is not a global owner
  if (caller.globalPermissionId !== 1) {
    throw HTTPError(403, 'authorised user is not a global owner');
  }

  user.globalPermissionId = permissionId;
  setData(data);

  return {};
}

export { userRemove, userPermissionChange };
