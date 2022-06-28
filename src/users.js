import { getData } from "./dataStore.js";

// userProfileV1
// There are 2 parameters, authUserId and uId. userProfileV1 prints the details of a user with uId if found in datastore.
// Parameters: authUserId: integer - This is the Id of a user trying to view the details of the user with uId
//             uId: integer - Id of a user who is being viewed from the user with authUserId.

// Return type: { user } or {uId, email, nameFirst, nameLast, handleStr}
//              { error: 'error' } when any of the following:
//                  a user with uId is not found

function userProfileV1(authUserId, uId) {
  const data = getData();
  const user = data.users.find(u => u.userId === uId);
  if (!user) { 
    return { error: 'error' };
  } else {
    return {
      uId: uId, 
      email: user.emailAddress,
      nameFirst: user.name.split(' ')[0], 
      nameLast: user.name.split(' ')[1], 
      handleStr: user.handle,
    }
  }

}

export { userProfileV1 }
