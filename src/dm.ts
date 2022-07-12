import { getData } from './dataStore';
export interface dmTemplate {

    dmId: number;
    dmOwner: number;
    name: string[];
    messages: any[];

}
function containsDuplicates(array: number[]) {
  const result = array.some(element => {
    if (array.indexOf(element) !== array.lastIndexOf(element)) {
      return true;
    }

    return false;
  });

  return result;
}

export function dmCreateV1 (token: number, uIds: number[]) {
  if (containsDuplicates(uIds) === true) {
    return { error: 'error' };
  }
  const data = getData();
  // create an array with everybodies userIds
  const arrayUserId: number[] = [];

  Object.values(data.users).forEach(element => {
    const toPush = element.userId;
    arrayUserId.push(toPush);
  });

  // check if uIds is a subset of arrayUserId
  const allFounded = uIds.every(ai => arrayUserId.includes(ai));
  if (allFounded === false) {
    return { error: 'error' };
  }
  // find owner
  const user = data.users.find(u => u.userId === token);

  // create an array of alphanumerically sorted handles of all users
  const handleArray: string[] = [];
  Object.values(data.users).forEach(element => {
    const toPush = element.handle;
    handleArray.push(toPush);
  });
  handleArray.sort();

  // getting dmId
  let identifier = 1;
  if (data.usedTokenNums.length !== 0) {
    identifier += data.usedTokenNums[data.usedTokenNums.length - 1];
  }

  data.DMs.push({
    dmId: identifier,
    dmOwner: user.userId,
    name: handleArray,
    messages: [],
  });
  return { identifier };
}
