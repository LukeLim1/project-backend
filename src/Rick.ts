import { getData, setData } from './dataStore';
interface dm {
	dmId: number,
	name: string,
}

interface user {
	uId: number,
	email: string,
	nameFirst: string,
	nameLast: string,
	handleStr: string,
}

interface userData {
	users: user[],
}

let userStore: userData = {
	users: [],
}

interface dmData {
	dms: dm[],
}

let dmStore: dmData = {
	dms: [],
}

interface messageId {
	messageId: number,
}
interface error {
	error: 'error',
}

export function messageSend (token: string, channelId: number, message: string): messageId | error{
	const data = getData();
	const channel = data.channels.find(c => c.channelId === channelId);
	const user = data.users.find (u => u.userId === channelId);

	// Check if token is valid
	/*let trigger = 0;

	for (const tokens of usedTokenNums) {
		if (token === tokens){
			trigger = 1;
		}
	}

	if (trigger === 0) {
		return {error: 'error'};
	}
*/
	// Case 1: if length of message is less than 1 or greater than 1000
	if (message.length < 1 || message.length > 1000) {
		return {error: 'error'};
	}
	// Case 2: if channelId does not refer to a valid channel
	if (!channel) {
		return {error: 'error'};
	}
	// Case 3: if the user is not a member of channel
	if (!user) {
		return {error: 'error'};
	}

	

	let messageId: number = Math.floor(Math.random() * 1000);

	return {messageId: messageId};
}




export function dmList (token: string): dmData | error {

	// Check if token is valid




	// dms: Array of objects, where each object contains types { dmId, name }
	return {dms: 1};
}




export function dmRemove (token: string, dmId: number) {

	// Check if token is valid


	// Case 1: dmId does not refer to a valid DM


	// Case 2: dmId is valid and the authorised user is not the original DM creator


	// Case 3: dmId is valid and the authorised user is no longer in the DM



	return {};
}


export function dmDetails (token: string, dmId: number) {

	// Check if token is valid


	// Case 1: dmId does not refer to a valid DM


	// Case 2: authorised user is not a member of the DM



	return {
		name: 1,
		members: 1, // Array of objects, where each object contains types of user,
	};
}