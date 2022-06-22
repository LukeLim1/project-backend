import { getData, setData } from "./dataStore";

function userProfileV1(authUserId, uId) {
  const data = getData();
  const user = data.users.find(u => u.userId === uId);

  return {
    uId: uId, 
    email: user.emailAddress,
    nameFirst: user.name, 
    nameLast: user.name, 
    handleStr: user.handle,
  }
}

export { userProfileV1 }