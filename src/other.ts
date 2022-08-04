import { getData, setData } from './dataStore';

// Resets the internal data of the dataStore to it its inital state (empty)

// Parameters : none

// return type : none

function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.usedNums = [];
  data.usedTokenNums = [];
  data.usedChannelNums = [];
  data.DMs = [];
  data.messages = [];
  data.passwordRequest = [];
  data.numChannels = 0;
  data.numDms = 0;
  data.numMsgs = 0;
  setData(data);
  return {};
}

export { clearV1 };
