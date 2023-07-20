const OFFSITE_API_SECRET = process.env.OFFSITE_API_SECRET;
const OFFSITE_API_ENDPOINT = process.env.OFFSITE_ENDPOINT;

export const getBoardItemByEmail = email => {
	var headers = {
		apisecret: OFFSITE_API_SECRET,
		'Content-Type': 'application/json'
	};
	var options = {
		method: 'get',
		contentType: 'application/json',
		muteHttpExceptions: true,
		headers: headers
	};
	var backendUrl = OFFSITE_API_ENDPOINT + '/api/v1/board-items/email/' + email;
	var res = UrlFetchApp.fetch(backendUrl, options);
	return JSON.parse(res);
};

export const fetchGmailSettings = accountId => {
	try {
		const headers = {
			apisecret: OFFSITE_API_SECRET,
			'Content-Type': 'application/json'
		};
		const options = {
			method: 'get',
			contentType: 'application/json',
			muteHttpExceptions: true,
			headers: headers
		};
		const backendUrl = OFFSITE_API_ENDPOINT + '/api/v1/crm-settings/' + accountId + '/account/Gmail Contact';
		const res = UrlFetchApp.fetch(backendUrl, options);
		return JSON.parse(res);
	} catch (err) {
		console.log('ERROR==>', err);
	}
};
