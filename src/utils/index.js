import { BOARD_COLUMNS } from '../constants';
import { DateInput, EmailInput, PersonInput, LinkInput, PhoneInput, SelectInput, TextInput } from '../formInputs';

const {
	NAME,
	DATE,
	NUMBERS,
	EMAIL,
	COLOR,
	DROPDOWN,
	PHONE,
	LINK,
	TEXT,
	BOARD_RELATION,
	LOOKUP,
	FILES,
	PERSON,
	LONG_TEXT,
	RATING
} = BOARD_COLUMNS;

const INBOX_CONTENT_LEN = 1000;

// ===================Utility Methods============================

export const mapBoardColumnsAndSelectOptions = data => {
	if (!data.length) return { mappedColumns: [], boardOptions: [] };
	const mappedColumns = data.map(d => {
		return {
			boardId: d.id,
			columns: d.columns
		};
	});
	const boardOptions = data.map(d => {
		return { label: d.name, value: d.id };
	});
	return { mappedColumns, boardOptions };
};

const checkParentItems = items => {
	let hasParent = false;
	for (let i of items) {
		if (i.parent_item) {
			hasParent = true;
			return hasParent;
		}
	}
	return hasParent;
};

export const filterSubitemBoards = boards => {
	let result = [];
	if (!boards || boards.length < 1) return result;
	for (let b of boards) {
		const hasParent = checkParentItems(b.items);
		if (!hasParent) result.push(b);
	}
	return result;
};

export const mapGroupsByBoard = boards => {
	let groups = [];
	if (!boards.length) return groups;
	for (let b of boards) {
		let d = {
			boardId: b.id,
			groupId: b.groups[0].id
		};
		groups.push(d);
	}
	return groups;
};

export const filterBoardByUser = (userId, boardData) => {
	const result = [];
	const { boards } = boardData;
	if (boards.length) {
		for (let b of boards) {
			const userExist = b.subscribers.find(f => f.id === userId);
			if (userExist) result.push(b);
		}
		const filteredBoards = result.filter(f => f.type === 'board');
		return { boards: filteredBoards };
	} else return { boards: [] };
};

export const addValuesAndSettingsStr = (allowedFields, settingsStrAddedInputs) => {
	let result = [];
	for (let f of allowedFields) {
		const found = settingsStrAddedInputs.find(v => v.columnId === f.id);
		if (found) {
			const { value, settings_str = '', columnId, columnType } = found;
			let newData = { ...f, value, settings_str, columnType, columnId };
			result.push(newData);
		}
	}
	console.log('TOTAL=>', result.length);
	return result;
};

export const selectMatchingColumns = (allColumns, allowedColumns) => {
	const result = [];
	for (let c of allColumns) {
		const found = allowedColumns.find(f => f.id === c.id);
		if (found) result.push(c);
	}
	return result;
};

export const appendEmailAndItemName = ({ fields, itemName, email }) => {
	let result = [];
	for (let f of fields) {
		if (f.type === EMAIL) f.value = email;
		if (f.type === NAME) f.value = itemName;
		result.push(f);
	}
	return result;
};

export const addSetingsStrToPayload = (settingsStr, payload) => {
	let result = [];
	for (let p of payload) {
		const found = settingsStr.find(s => s.id === p.columnId);
		if (found && found.settings_str) {
			let updatedData = { ...p, settings_str: found.settings_str };
			result.push(updatedData);
		}
		if (found && !found.settings_str) result.push(p);
	}
	return result;
};

export const extractCharactersBeforeSymbol = (inputString, symbol) => {
	const regex = new RegExp(`(.*?)\\s*${symbol}`);
	const match = inputString.match(regex);
	return match ? match[1].trim() : '';
};

export const extractEmailAddress = text => {
	const regex = /[\w\.-]+@[\w\.-]+\.\w+/g;
	const matches = text.match(regex);
	return matches ? matches[0] : null;
};

export const findEmailInBoardRow = (row, email) => {
	const columns = row.column_values;
	const emailColumns = columns.filter(function (f) {
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

export const createFormInputByType = ({ input, boardUsers, currentSelectInput }) => {
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
		case PERSON: {
			return PersonInput(input, boardUsers);
		}
		case COLOR: {
			return SelectInput(input, currentSelectInput);
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

export const sanitizeColumnTypeByID = ({ keys, values }) => {
	let result = [];
	for (let i = 0; i < keys.length; i++) {
		const id = keys[i];
		const val = values[i];
		let d = {
			columnType: getColumTypeByID(id),
			columnId: id,
			value: val
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

	const hasPerson = id.includes('person');
	if (hasPerson) return PERSON;

	const hasColor = id.includes(COLOR);
	if (hasColor) return COLOR;

	const hasStatus = id.includes('status');
	if (hasStatus) return COLOR;

	const hasNumber = id.includes(NUMBERS);
	if (hasNumber) return NUMBERS;

	const hasFiles = id.includes(FILES);
	if (hasFiles) return FILES;

	return TEXT;
};

const createPersonPayload = users => {
	let usersList = [];
	if (!users.length) return usersList;
	if (users.length) {
		for (let u of users) {
			let d = `{\\"id\\":${u.value},\\"kind\\":\\"person\\"}`;
			usersList.push(d);
		}
	}
	return usersList;
};

const createDropdownPayload = () => {};

function convertMSToNormalDate(msSinceEpoch) {
	const date = new Date(msSinceEpoch);
	const isoDateString = date.toISOString();
	const dateComponents = isoDateString.split('T')[0].split('-');
	const year = dateComponents[0];
	const month = dateComponents[1];
	const day = dateComponents[2];

	return `${year}-${month}-${day}`;
}

//Further sanitize Date, Color,Dropdwon values
export const sanitizeSpecialFieldsValue = payload => {
	let result = [];
	if (!payload.length) return result;
	for (let p of payload) {
		if (p.columnType === PERSON && p.value) {
			p.value = [{ value: p.value }];
		}
		if (p.columnType === COLOR && p.value) {
			p.value = p.value;
		}
		if (p.columnType === DATE && p.value) {
			const { msSinceEpoch } = p.value;
			p.value = convertMSToNormalDate(msSinceEpoch);
		}
		result.push(p);
	}
	return result;
};

export const getDefaultValueByColumnType = columnsWithValue => {
	const result = [];
	for (let c of columnsWithValue) {
		let val = '';
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

export const createBoardQuery = ({ itemName = '', itemId, boardId, boardPayload }) => {
	console.log('Payload==>', boardPayload);
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

export const sanitizeUpdateMsg = ({ threadLink, updateText, emailBody, selectEmailContent }) => {
	let msg = updateText;
	if (selectEmailContent) {
		const cleanText = emailBody.replace(/\s+/g, ' ');
		const sanitizedContent = concatenateDots(cleanText.trim(), INBOX_CONTENT_LEN);
		msg = `MESSAGE: ${
			updateText || 'No custom message!'
		} <br/> LINK: ${threadLink} <br/> INBOX: <br/> ${sanitizedContent} `;
	}
	return msg;
};

export const concatenateDots = (text, maxLength) => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
};

export const formatISODateString = isoString => {
	const date = new Date(isoString);

	// Extracting the date components
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // Months are zero-based, so add 1
	const day = date.getDate();

	// Extracting the time components
	let hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	// Determine AM or PM
	const amOrPm = hours >= 12 ? 'PM' : 'AM';
	// Convert to 12-hour format
	hours %= 12;
	hours = hours || 12; // Handle 0 (midnight) as 12 AM

	// Creating formatted strings for date and time
	const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
	const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
		.toString()
		.padStart(2, '0')} ${amOrPm}`;

	return {
		date: formattedDate,
		time: formattedTime
	};
};
