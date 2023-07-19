import { BOARD_COLUMNS } from '../constants';

const { NAME, DATE, NUMBERS, EMAIL, COLOR, DROPDOWN, PHONE, LINK, TEXT, BOARD_RELATION, LOOKUP, PERSON } =
	BOARD_COLUMNS;

export const appendEmailAndItemName = ({ fields, itemName, email }) => {
	let result = [];
	for (let f of fields) {
		if (f.type === EMAIL) f.value = email;
		if (f.type === NAME) f.value = itemName;
		result.push(f);
	}
	return result;
};

export const extractCharactersBeforeSymbol = (inputString, symbol) => {
	const regex = new RegExp(`(.*?)\\s*${symbol}`);
	const match = inputString.match(regex);
	return match ? match[1].trim() : '';
};

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

export const checkAndAppendSettingsStr = (boardColumns, strColumns) => {
	const finalResult = [];
	for (let b of boardColumns) {
		if (b.type === PERSON || b.type === COLOR || b.type === DROPDOWN) {
			const found = strColumns.find(f => f.id === b.id);
			const settings_str = found?.settings_str || '';
			finalResult.push({ ...b, settings_str });
		} else finalResult.push(b);
	}
	return finalResult;
};

export const getDefaultValueByColumnType = columnsWithValue => {
	const result = [];
	for (let c of columnsWithValue) {
		var val = '';
		if (c.type === TEXT || c.type === EMAIL || c.type === NUMBERS || c.type === DATE || c.type === PHONE) {
			val = c.text;
		}
		if (c.type === LINK) {
			const jsonData = c.value ? JSON.parse(c.value) : null;
			val = jsonData ? jsonData.url : '';
		}
		if (c.type === COLOR) {
			const jsonData = c.value ? JSON.parse(c.value) : null;
			val = jsonData ? jsonData.index : '';
		}
		if (c.type === PERSON) {
			const jsonData = c.value ? JSON.parse(c.value) : null;
			const personValue =
				jsonData?.personsAndTeams.map(p => {
					return { ...p, value: p.id };
				}) || [];
			val = personValue;
		}
		result.push({ ...c, value: val });
	}
	return result;
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
			const textInput = CardService.newTextInput()
				.setFieldName(fieldName)
				.setTitle(title)
				.setValue(input.value || '');
			return textInput;
		}
		case NAME: {
			const textInput = CardService.newTextInput()
				.setFieldName(fieldName)
				.setTitle(title)
				.setValue(input.value || '');
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
