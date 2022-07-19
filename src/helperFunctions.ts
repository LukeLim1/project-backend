import { getData } from './dataStore';

// checks for duplicates in arrays
export function containsDuplicates(array: number[]) {
  const result = array.some(element => {

    /* =============================================================================
    == TAM'S COMMENT ==
    ===================
    
    rather than
    
    ```
    if (condition) {
      return true;
    }
    return false;
    ```
    
    consider:
    
    ```
    return condition;
    ```

    ============================================================================= */
    if (array.indexOf(element) !== array.lastIndexOf(element)) {
      return true;
    }
    return false;
  });
  return result;

  /* =============================================================================
  == TAM'S COMMENT ==
  ===================
  
  A cool alternative implementation for this function, in one line, is
  
  ```
  return array.length !== new Set(array).size
  ```
  
  :).

  ============================================================================= */
}

// test for a valid token
export function checkToken(token: string): boolean {
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

  /* =============================================================================
  == TAM'S COMMENT ==
  ===================
  
  Is this if-statement necessary? I don't think you need the trigger variable
  at all and simply return false here.

  ============================================================================= */
  if (trigger === 0) {
    return false;
  }
}
