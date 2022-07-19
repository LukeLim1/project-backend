import { getData, setData } from './dataStore';
// import { dmTemplate, dataTemplate, userTemplate } from './interface';
import { checkToken } from './helperFunctions'


interface members {
	uId: number,
	email: string,
	nameFirst: string,
	nameLast: string,
	handleStr: string,
}

interface userData {
	name: string,
	members: members[],
}

interface messageId {
	messageId: number,
}

interface empty {}

interface dms {
	dmId: number,
	name: string[],
}

interface error {
	error: string,
}

export function senddm (token: string, dmId: number, message: string): messageId | error {
	
	// Check if token is valid
	checkToken(token);
	if (checkToken(token) === false) {
		return { error: 'error' };
	}

	const data = getData();

	// Case 1: if length of message is less than 1 or greater than 1000
	if (message.length < 1 || message.length > 1000) {
		return {error: 'error'};
	}
	// Case 2 : dmId does not refer to a valid DM
	const id = data.DMs.find(i => i.dmId === dmId);
	if (!id) {
		return { error: 'error' };
	}

	// Case 3: authorised user is not a member of DM
	/*
	const user = data.users.find(u => u.token.includes(token));
	if (!(id.name.includes(user.handle))) {
		return { error: 'error' };
	}
	*/
	let random: number = Math.floor(Math.random() * 10000);
	if (data.usedNums.length !== 0) {
		random = random + data.usedNums[data.usedNums.length - 1];
	}

	data.usedNums.push(random);

	let timeSent: number = Date.now();

	for (const i in data.DMs) {
		data.DMs[i].messages.push({
			token: token,
			messages: message,
			time: timeSent,
			messageId: random,
		})
	}

	setData(data);
	return {messageId: random};
}

export function dmList (token: string) {

	// Check if token is valid
	checkToken(token);
	if (checkToken(token) === false) {
		return { error: 'error' };
	}

	const data = getData();

	// array to store all the return objects with dmId and name
	const array: dms[] = [];

	for (const i in data.users) {
		if (data.users.find(u => u.token.includes(token) === true)) {
			const dmObject = {
				dmId: data.DMs[i].dmId,
				name: data.DMs[i].name,
			}
		array.push(dmObject);
		}
	}
	// dms: Array of objects, where each object contains types { dmId, name }
	setData(data);
	return { dms: array };
}

export function dmRemove (token: string, dmId: number): empty | error {
	// Check if token is valid
	checkToken(token);
	if (checkToken(token) === false) {
		return { error: 'error' };
	}

	const data = getData();
	const id = data.DMs.find(i => i.dmId === dmId);

	// Case 1: dmId does not refer to a valid DM
	if (!id) {
		return { error: 'error' };
	}

	// Case 2: authorised user is not the original DM creator
	if (!data.users.find(u => u.token.includes(token) === true)) {
		return { error: 'error' };
	}

	// Case 3: authorised user is no longer in the DM
	/*
	let trigger = 0;
	for(const i in data.DMs){
		for (const j in data.users) {
			if (data.DMs[i].name.includes(data.users[j].handle)){
				trigger = 1;
			}
		}
	}
	if (trigger = 0) {
		return { error: 'error' };
	}
*/
	// check if this is owner
	if (data.users.find(dm => dm.token.includes(token) === true)) {
		data.DMs = [];
	}

	setData(data);
	return {};
}

export function dmDetails (token: string, dmId: number): userData | error {

// Check if token is valid
	checkToken(token);
	if (checkToken(token) === false) {
		return { error: 'error' };
	}

	const data = getData();

	const id = data.DMs.find(i => i.dmId === dmId);
	// Case 1: dmId does not refer to a valid DM
	if (!id) {
		return { error: 'error' };
	}

	// Case 2: authorised user is not a member of the DM
	if (!data.users.find(dm => dm.token.includes(token) === true)) {
		return { error: 'error' };
	}

	const dataArray: members[] = [];
	for (const i in id.name) {
		let handle: string = id.name[i];
		let user = data.users.find(user => user.handle === handle);
		if (!user) {
			return { error: 'error' };
		}
		let uId: number = user.userId;
		let email: string = user.emailAddress;
		let nameFirst: string = user.firstName;
		let nameLast: string = user.lastname;

		dataArray.push({
			uId: uId, 
			email: email, 
			nameFirst: nameFirst,
			nameLast: nameLast,
			handleStr: handle,
		});
	}

	setData(data);
	return {
		name: id.name.join(", "),
		members: dataArray, 
	};
}
