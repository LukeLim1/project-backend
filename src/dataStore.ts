// YOU SHOULD MODIFY THIS OBJECT BELOW

import { dataTemplate } from './interface';

let data: dataTemplate = {
  users: [],
  channels: [],
  usedNums: [],
  usedTokenNums: [],
  usedChannelNums: [],
  usedDmNums: [],
  DMs: [],
  messages: [],
  numChannels: 0,
  numDms: 0,
  numMsgs: 0,
  passwordRequest: [],
  notifications: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: dataTemplate) {
  data = newData;
}

export { getData, setData };
