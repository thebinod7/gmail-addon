import { BOARD_COLUMNS } from '../constants';
import { DateInput, EmailInput, FileInput, LinkInput, PhoneInput, StatusInput, TextInput } from '../formInputs';

const { NAME, DATE, NUMBERS, EMAIL, COLOR, DROPDOWN, PHONE, LINK, TEXT, BOARD_RELATION, LOOKUP, FILES, PERSON } =
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
	switch (input.type) {
		case NAME: {
			return TextInput(input);
		}
		case TEXT: {
			return TextInput(input);
		}
		case EMAIL: {
			return EmailInput(input);
		}
		case PHONE: {
			return PhoneInput(input);
		}
		case LINK: {
			return LinkInput(input);
		}
		case DATE: {
			return DateInput(input);
		}
		case FILES: {
			return FileInput(input);
		}
		case PERSON: {
			return StatusInput(input);
		}
		case COLOR: {
			return StatusInput(input);
		}

		default:
			return '';
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

export const extractObjectKeysAndValues = obj => {
	let keys = [];
	let values = [];
	if (!obj) return { keys, values };
	keys = Object.keys(obj);
	values = Object.values(obj);
	return { keys, values };
};

export const sanitizInputPayload = ({ keys, values }) => {
	let result = [];
	for (let i = 0; i < keys.length; i++) {
		let d = {
			columnType: getColumTypeByID(keys[i]),
			columnId: keys[i],
			value: values[i]
		};
		result.push(d);
	}
	return result;
};

const getColumTypeByID = id => {
	const hasName = id.includes(NAME);
	if (hasName) return NAME;

	const hasText = id.includes(TEXT);
	if (hasText) return TEXT;

	const hasEmail = id.includes(EMAIL);
	if (hasEmail) return EMAIL;

	const hasPhone = id.includes(PHONE);
	if (hasPhone) return PHONE;

	const hasLink = id.includes(LINK);
	if (hasLink) return LINK;

	const hasDate = id.includes(DATE);
	if (hasDate) return DATE;

	const hasPerson = id.includes(PERSON);
	if (hasPerson) return PERSON;

	const hasColor = id.includes(COLOR);
	if (hasColor) return COLOR;

	const hasNumber = id.includes(NUMBERS);
	if (hasNumber) return NUMBERS;

	const hasFiles = id.includes(FILES);
	if (hasFiles) return FILES;

	return TEXT;
};

export const createBoardQuery = ({ itemName = '', itemId, boardId, boardPayload }) => {
	let columnValues = `\\"name\\": \\"${itemName}\\"`;
	for (let t of boardPayload) {
		if (t.columnType === TEXT) columnValues += `,\\"${t.columnId}\\": \\"${t.value || ''}\\"`;
		if (t.columnType === DATE) columnValues += `,\\"${t.columnId}\\": \\"${t.value || ''}\\"`;
		if (t.columnType === LONG_TEXT) columnValues += `,\\"${t.columnId}\\": {\\"text\\" : \\"${t.value || ''}\\"}`;
		if (t.columnType === EMAIL)
			columnValues += `,\\"${t.columnId}\\": {\\"email\\" : \\"${t.value || ''}\\", \\"text\\": \\"${
				t.value || ''
			}\\"}`;
		if (t.columnType === LINK)
			columnValues += `,\\"${t.columnId}\\": {\\"url\\" : \\"${t.value || ''}\\", \\"text\\": \\"Open Link\\"}`;
		if (t.columnType === NUMBERS) columnValues += `,\\"${t.columnId}\\": \\"${t.value || ''}\\"`;
		if (t.columnType === PHONE) columnValues += `,\\"${t.columnId}\\": \\"${t.value || ''}\\"`;
		if (t.columnType === RATING) columnValues += `,\\"${t.columnId}\\": {\\"rating\\" : ${t.value || 0}}`;
		if (t.columnType === COLOR) columnValues += `,\\"${t.columnId}\\": \\"${t.value || []}\\"`;
		if (t.columnType === DROPDOWN) {
			const data = createDropdownPayload(t.value || []);
			columnValues += `,\\"${t.columnId}\\":{\\"labels\\": [${data}]}`;
		}
		if (t.columnType === PERSON && t.value && t.value.length) {
			let usersList = createPersonPayload(t.value);
			columnValues += `,\\"${t.columnId}\\": {\\"personsAndTeams\\" : [${usersList}]}`;
		}
	}
	return `mutation {
		change_multiple_column_values (item_id: ${itemId}, board_id: ${boardId}, column_values: "{${columnValues}}") {
		  id
		}
	  }`;
};
