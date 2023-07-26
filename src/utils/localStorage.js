export const saveAllowedFIelds = data => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('allowedFields', JSON.stringify(data));
};

export const getAllowedFields = () => {
	const properties = PropertiesService.getUserProperties();
	const data = properties.getProperty('allowedFields');
	if (!data) return null;
	return JSON.parse(data);
};

export const saveColumStrSettings = data => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('columnStr', JSON.stringify(data));
};

export const getColumStrSettings = () => {
	const properties = PropertiesService.getUserProperties();
	const data = properties.getProperty('columnStr');
	if (!data) return null;
	return JSON.parse(data);
};

export const saveScrapedEmailData = data => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('emailData', JSON.stringify(data));
};

export const getScrapedEmailData = () => {
	const properties = PropertiesService.getUserProperties();
	const data = properties.getProperty('emailData');
	if (!data) return null;
	return JSON.parse(data);
};

export const saveCurrentBoardAndItem = data => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('currentBoardAndItem', JSON.stringify(data));
};

export const getCurrentBoardAndItem = () => {
	const properties = PropertiesService.getUserProperties();
	const data = properties.getProperty('currentBoardAndItem');
	if (!data) return null;
	return JSON.parse(data);
};

export const saveToken = token => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('access_token', token);
};

export const getToken = () => {
	const properties = PropertiesService.getUserProperties();
	const token = properties.getProperty('access_token');
	return token;
};

export const saveItemId = token => {
	const properties = PropertiesService.getUserProperties();
	properties.setProperty('itemId', token);
};

export const getItemId = () => {
	const properties = PropertiesService.getUserProperties();
	const token = properties.getProperty('itemId');
	return token;
};
