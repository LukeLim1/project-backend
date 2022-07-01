import { getData, setData } from "./dataStore.js";

// Resets the internal data of the dataStore to it its inital state (empty)

// Parameters : none

// return type : none


function clearV1() {
  let data = getData();
  data.users = [];
  data.channels = [];

  /* =============================================================================
  == TAM'S COMMENT ==
  ===================

      May or may not be intentional, but you also have usedNums :)

  ============================================================================= */
  setData(data); 
  return {};
}

export { clearV1 };
