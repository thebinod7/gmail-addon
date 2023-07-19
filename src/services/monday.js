const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;
const MONDAY_API_ENDPOINT = process.env.MONDAY_API_ENDPOINT;

export const fetchMondayAccessToken = code => {
	var service = getOAuthService();
	var redirect_uri = service.getRedirectUri();
	var data = {
		code: code,
		client_id: MONDAY_CLIENT_ID,
		client_secret: MONDAY_CLIENT_SECRET,
		redirect_uri: redirect_uri
	};
	var queryString = Object.keys(data)
		.map(function (key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
		})
		.join('&');

	var fullURL = MONDAT_ACCESS_TOKEN_URL + '?' + queryString;
	var options = {
		method: 'post',
		contentType: 'application/x-www-form-urlencoded',
		muteHttpExceptions: true
	};
	var response = UrlFetchApp.fetch(fullURL, options);
	if (!response) return null;
	var json = JSON.parse(response);
	return json.access_token;
};

export const fetchMondayAccountDetails = accessToken => {
	var query = 'query { me {name id  account{id name slug}}}';
	var headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	var options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	var res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};

export const fetchBoardColumnValues = (accessToken, boardIds) => {
	var query = 'query { boards(ids:' + boardIds + ') { items() {id name column_values {id title type value text} }} }';
	var headers = {
		Authorization: accessToken,
		'Content-Type': 'application/json'
	};
	var options = {
		method: 'post',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers,
		payload: JSON.stringify({ query: query })
	};
	var res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
	return JSON.parse(res);
};
