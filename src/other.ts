import { getData, setData } from './dataStore';

// Resets the internal data of the dataStore to it its inital state (empty)

// Parameters : none

// return type : none

function clearV1() {
  const data = getData();
  data.users = [];
  data.channels = [];
  setData(data);
  return {};
}

export { clearV1 };
