import { getData, setData } from "./dataStore";

function userProfileV1(authUserId, uId) {
  const data = getData();
  const user = data.users.find(u => u.userId === uId);
  if (!user) { return { error: 'error' }};

  return {
    uId: uId, 
    email: user.emailAddress,
    nameFirst: user.name.split(' ')[0], 
    nameLast: user.name.split(' ')[1], 
    handleStr: user.handle,
  }
}

export { userProfileV1 }