// YOU SHOULD MODIFY THIS OBJECT BELOW

import { userTemplate } from './channel';
import { dmTemplate } from './dm';

interface dataTemplate {
  users: userTemplate[];
  channels: any[];
  usedNums: number[];
  usedTokenNums: number[];
  DMs: dmTemplate[];
}

let data: dataTemplate = {
  users: [],
  channels: [],
  usedNums: [],
  usedTokenNums: [],
  DMs: [],

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
