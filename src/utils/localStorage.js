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
