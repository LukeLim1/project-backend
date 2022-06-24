import { getData, setData } from './dataStore';
import validator from 'validator';


// Given user information from parameters, create a new account for them (as an object inside an array) 
// and return a new unique 'authUserId'
// Generate a handle as past of the object that will be the concatenation of nameFirst and nameLast
// The concatenation must be cut off at 20 chars if it exceeds this length
// If handle already exists append the handle with the smallest number (from 0) to create a new handle
// Appending this incremental number can exceed the 20 char limit

// Parameters: email: string - used to create the account, email can only be used once
//             password: string - along with email, will be used to log in for the next function
//             nameFirst: string - used to create userHandle 
//             nameLast: string - used to create userHandle

// Return type: { authUserId },
//              {error: 'error'} when any of the following:
//              - email is invalid
//              - email already been used to register
//              - password.length < 6
//              - nameFirst.length not between 1 - 50
//              - nameLast.length not between 1 - 50

function authRegisterV1 ( email, password, nameFirst, nameLast ) {
    const data = getData();
    const hasNumber = /\d/;
    // error cases //
    
    // case 1 : invalid email
    if (!(validator.isEmail(email))) {
        return {error: 'error'};
    }
    // case 2 : email used already
    const arrayOfEmails = [];
    Object.values(data.users).forEach(element => {
        let toPush = element.emailAddress;
        arrayOfEmails.push(toPush);
    });
    for (const i in arrayOfEmails) {
        if (arrayOfEmails[i] === email) {
            return {error: 'error'};
        }
    }
    // case 3 : password less than 6 chars
    if (password.length < 6) {
        return {error: 'error'};
    }
    // case 4 : length of nameFirst not between 1 - 50 inclusive
    else if (nameFirst <= 1 || nameFirst >= 50) {
        return {error: 'error'};
    }
    // case 5 : length of nameLast not between 1 - 50 inclusive
    else if (nameLast <= 1 || nameLast >= 50) {
        return {error: 'error'};
    }
    // End of error cases
    
    // No input errors//

    // case 1 : standard concatentation of nameFirst and nameLast
    let userHandle = (nameFirst + nameLast).toLowerCase();
    // case 2 : concatenation is longer than 20 characters
    if (userHandle.length >= 20) {
        const sliced = userHandle.slice(0, 20);
        userHandle = sliced;
    }
    // case 3 : concatenation has someone with the same handle
    const arrayOfHandles = [];
    const arrayToCount = [];
    // moving all handles in the list into arrayOfHandles
    // moving duplicate handles (and removing numbers) into arrayToCount
    Object.values(data.users).forEach(element => {
        let toPush = element.handle.replace(/[^a-z]/gi, '');
        arrayOfHandles.push(toPush);
    });
    for (const i in arrayOfHandles) {
        if (arrayOfHandles[i] == userHandle) {
            arrayToCount.push(arrayOfHandles[i]);
        }
    }
    if (arrayToCount.length > 1) userHandle += arrayToCount.length - 1;
    if (arrayToCount.length === 1) userHandle += 0;

    // ensuring id's that will never repeat
    let randomNumber = 1;
    if (data.usedNums.length !== 0) {
        randomNumber += data.usedNums[data.usedNums.length - 1]
    }
    data.usedNums.push(randomNumber);
    data.users.push({
        emailAddress: email,
        userId: randomNumber, 
        password: password,
        name: `${nameFirst} ${nameLast}`,
        handle: `${userHandle}`,
        permissions: 2,
    });
    setData(data);
    return {
        authUserId: randomNumber
        
    }
}

// Give as users email and password, return their authUserId if they have been used to 
// register/create an account

// Parameters: email: string - used to identify a user
//             password: string - used to login to a verified users account

// Return type: { authUserId },
//              {error: 'error'} when any of the following:
//              - email doesnt belong to a user
//              - password is incorrect for the corresponding email

function authLoginV1 (email, password) {
    const data = getData();
    // put every email into an array to check against
    const arrayOfEmails = [];
    Object.values(data.users).forEach(element => {
        let toPush = element.emailAddress;
        arrayOfEmails.push(toPush);
    });
    // put every password into an array to check against
    const arrayOfPasswords = [];
    Object.values(data.users).forEach(element => {
        let toPush = element.password;
        arrayOfPasswords.push(toPush);
    });
    if (arrayOfEmails.indexOf(email) === -1) {
        return {error: 'error'};
    }
    
    else {  
        if (arrayOfPasswords.indexOf(password) === -1) {
            return {error: 'error'};
        }
    } 
    return {authUserId: data.users[arrayOfEmails.indexOf(email)].userId};
}
export { authLoginV1, authRegisterV1 };
