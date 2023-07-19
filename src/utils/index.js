import { BOARD_COLUMNS } from '../constants';

const { NAME, DATE, NUMBERS, EMAIL, COLOR, DROPDOWN, PHONE, LINK, TEXT, BOARD_RELATION, LOOKUP, PERSON } =
	BOARD_COLUMNS;

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
	const title = input.title;
	const fieldName = input.id;
	switch (input.type) {
		case TEXT: {
			const textInput = CardService.newTextInput().setFieldName(fieldName).setTitle(title);
			return textInput;
		}
		case EMAIL: {
			const textInput = CardService.newTextInput().setFieldName(fieldName).setTitle(title);
			return textInput;
		}
		case NAME: {
			const textInput = CardService.newTextInput().setFieldName(fieldName).setTitle(title);
			return textInput;
		}
		case PERSON: {
			const dropdown = CardService.newSelectionInput()
				.setType(CardService.SelectionInputType.DROPDOWN)
				.setTitle(title)
				.setFieldName(fieldName)
				.addItem('Nir Ofir', 'option_1', true)
				.addItem('Binod Chaudhary', 'option_2', false);

			return dropdown;
		}

		default:
			const textInput = CardService.newTextInput().setFieldName(fieldName).setTitle(title);
			return textInput;
	}
};

export const fieldOrderRealign = allowedFields => {
	const sortedEmailFields = [];
	const sortedConnectFields = [];

	const itemNameField = allowedFields.find(f => f.type === NAME);

	const emailFields = allowedFields.filter(f => f.type === EMAIL);
	if (!emailFields.length) return allowedFields;
	for (let field of emailFields) {
		sortedEmailFields.push(field);
	}

	const connectFields = allowedFields.filter(f => f.type === BOARD_RELATION);
	if (connectFields.length) {
		for (let field of connectFields) {
			sortedConnectFields.push(field);
		}
	}

	const filterNameField = allowedFields.filter(f => f.type !== NAME);
	const filterEmailField = filterNameField.filter(f => f.type !== EMAIL);
	const filterConnectFields = filterEmailField.filter(f => f.type !== BOARD_RELATION);

	return [itemNameField, ...sortedEmailFields, ...filterConnectFields, ...sortedConnectFields];
};
