import { getData } from './dataStore';

// checks for duplicates in arrays
export function containsDuplicates(array: number[]): boolean {
  const result = Array.from(new Set(array));
  if (array.length === result.length) {
    return false;
  } else {
    return true;
  }
}

// test for a valid token
export function checkToken(token: string): boolean | undefined {
  const data = getData();
  const tokenArray: string[] = [];
  Object.values(data.users).forEach(element => {
    tokenArray.push(...element.token);
  });

  let trigger = 0;
  for (const i of tokenArray) {
    if (token === i) {
      trigger = 1;
      return true;
    }
  }
  if (trigger === 0) {
    return false;
  }
}
