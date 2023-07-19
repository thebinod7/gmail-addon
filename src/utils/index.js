export const saveToken = token => {
	var properties = PropertiesService.getUserProperties();
	properties.setProperty('access_token', token);
};

export const getToken = () => {
	var properties = PropertiesService.getUserProperties();
	var token = properties.getProperty('access_token');
	return token;
};
