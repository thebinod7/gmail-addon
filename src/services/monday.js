import { getToken } from '../utils/localStorage';

const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;
const MONDAY_API_ENDPOINT = process.env.MONDAY_API_ENDPOINT;

const BOARD_ITEMS_LIMIT = 10;
const BOARD_LIMIT = 20;

export const updateExtraColumns = query => {
	const accessToken = getToken();
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchBoardItems = () => {
	const accessToken = getToken();
	const query = `{ boards (limit:${BOARD_LIMIT}, order_by:used_at) { id name groups{id title} type subscribers{name,id} workspace{id,name} columns{id, type, title, settings_str} items(limit:10){parent_item{id} } }}`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const listItemUpdates = ({ boardId, itemId }) => {
	const accessToken = getToken();
	const query = `query { boards(ids:${boardId}, limit:${BOARD_ITEMS_LIMIT}) { items(ids:${itemId}) { id name } updates{id item_id body created_at creator{name id} } } }`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const createItemUpdate = ({ itemId, updateText }) => {
	const accessToken = getToken();
	const query = `mutation { create_update (item_id: ${itemId}, body: \"${updateText}\") { id }}`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const createBoardItem = ({ boardId, group = 'topics', itemName }) => {
	const accessToken = getToken();
	let query = `mutation { create_item (board_id: ${boardId}, group_id: \"${group}\", item_name: \"${itemName}\") { id }}`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchUsersByBoard = boardId => {
	const accessToken = getToken();
	let query = `query {
		boards (ids: ${boardId}) {
		  name
		  subscribers {id name created_at email photo_small id account { name id slug}}
		}
	  }`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchBoardSettingsStr = boardIds => {
	const accessToken = getToken();
	let query = `query { boards(ids:${boardIds}, limit:${BOARD_ITEMS_LIMIT}) {id columns{id,type, settings_str} }}`;
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchMondayAccessToken = code => {
	const service = getOAuthService();
	const redirect_uri = service.getRedirectUri();
	const data = {
		code: code,
		client_id: MONDAY_CLIENT_ID,
		client_secret: MONDAY_CLIENT_SECRET,
		redirect_uri: redirect_uri
	};
	const queryString = Object.keys(data)
		.map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
		})
		.join('&');

	const fullURL = MONDAT_ACCESS_TOKEN_URL + '?' + queryString;
	const options = {
		method: 'post',
		contentType: 'application/x-www-form-urlencoded',
		muteHttpExceptions: true
	};
	const response = UrlFetchApp.fetch(fullURL, options);
	if (!response) return null;
	const json = JSON.parse(response);
	return json.access_token;
};

export const fetchMondayAccountDetails = () => {
	const accessToken = getToken();
	const query = 'query { me {name id  account{id name slug}}}';
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchBoardColumnValues = boardIds => {
	const accessToken = getToken();
	const query =
		'query { boards(ids:' + boardIds + ') { items() {id name column_values {id title type value text} }} }';
	const headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	const options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	const res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};
