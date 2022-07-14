import { getData, setData, dataTemplate } from './dataStore';
import { dmTemplate } from './dm';
import { userTemplate } from './channel';

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

interface messageId {
	messageId: number,
}
interface error {
	error: string,
}

export function messageSend (token: string, channelId: number, message: string): messageId | error{
	const data = getData();
	const channel = data.channels.find(c => c.channelId === channelId);
	const user = data.users.find (u => u.userId === channelId);

	// Check if token is valid
	/*checkToken(token);
	if (checkToken(token) === false) {
		return { error: 'error' };
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

	

	let messageId: number = message.length * 2 + 1531;

	return {messageId: messageId};
}




export function dmList (token: string) {

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