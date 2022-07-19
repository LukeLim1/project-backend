import { getData, setData } from './dataStore';

// Resets the internal data of the dataStore to it its inital state (empty)

// Parameters : none


/* =============================================================================
== TAM'S COMMENT ==
===================

The return type is an empty object.

============================================================================= */

// return type : none

function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  data.usedNums = [];
  data.usedTokenNums = [];
  data.usedChannelNums = [];
  data.DMs = [];
  setData(data);
  return {};
}

export { clearV1 };
