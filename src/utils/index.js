export const saveToken = token => {
	var properties = PropertiesService.getUserProperties();
	properties.setProperty('access_token', token);
};

export const getToken = () => {
	var properties = PropertiesService.getUserProperties();
	var token = properties.getProperty('access_token');
	return token;
};

export const extractEmailAddress = text => {
	var regex = /[\w\.-]+@[\w\.-]+\.\w+/g;
	var matches = text.match(regex);
	return matches ? matches[0] : null;
};

export const findEmailInBoardRow = (row, email) => {
	var columns = row.column_values;
	var emailColumns = columns.filter(function (f) {
		return f.type === 'email';
	});
	if (emailColumns.length < 1) return null;

	var found;
	for (var i = 0; i < emailColumns.length; i++) {
		if (emailColumns[i].text == email) {
			found = emailColumns[i];
			break;
		}
	}
	return found;
};

export const createFormInputByType = input => {
	var title = input.title;
	var fieldName = input.id;
	switch (input.type) {
		case 'text': {
			var textInput = CardService.newTextInput().setFieldName(fieldName).setTitle(title);
			return textInput;
		}
		case 'dropdown': {
			var dropdown = CardService.newSelectionInput()
				.setType(CardService.SelectionInputType.DROPDOWN)
				.setTitle('A group of radio buttons.')
				.setFieldName(fieldName)
				.addItem('Option 1', 'option_1', true)
				.addItem('Option 2', 'option_2', false)
				.addItem('Option 3', 'option_3', false);

			return dropdown;
		}

		default:
			return '';
	}
};
