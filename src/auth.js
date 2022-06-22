import { getData, setData } from './dataStore';

function authRegisterV1 ( email, password, nameFirst, nameLast ) {
    const data = getData();
    const hasNumber = /\d/;
    

    // case 1 : standard concatentation of nameFirst and nameLast
    let userHandle = (nameFirst + nameLast).toLowerCase();
    /*if (data.users.length > 1) {
        userHandle = data.users[data.users.length - 1].handle;
    } */
    // case 2 : concatenation is longer than 20 characters
    if (userHandle.length >= 20) {
        const sliced = userHandle.slice(0, 20);
        userHandle = sliced;
    }
    
    

    // case 3 : concatenation has someonebody with the same handle

    const arrayModified = [];
    const arrayToCount = [];
    // moving duplicate handles (and removing numbers from all handles) into arrayToCount
    Object.values(data.users).forEach(element => {
        let toPush = element.handle.replace(/[^a-z]/gi, '');
        arrayModified.push(toPush);
    });
    for (let i = 0; i < arrayModified.length; i++) {
        if (arrayModified[i] == userHandle) {
            arrayToCount.push(arrayModified[i]);
        }
    }
    if (arrayToCount.length > 1) userHandle += arrayToCount.length - 1;
    if (arrayToCount.length === 1) userHandle += 0;

    let randomNumber = Math.floor(Math.random() * 100);
    data.users.push({
        emailAddress: email,
        userId: randomNumber, 
        password: password,
        name: `${nameFirst} ${nameLast}`,
        handle: `${userHandle}`,
    });

    setData(data);
    
    return {
        authUserId: randomNumber
        
    }
}
function authLoginV1 (email, password) {
    const data = getData();
    if(!(email in data.users)) {
        return {error: 'error'};
    }
    else {
        if (data.users[email].password !== password) {
            return {error: 'error'};
        }
        else {
            return {authUserId: data.users[email].userId,};
        }    
    }
}
export { authLoginV1, authRegisterV1 };
