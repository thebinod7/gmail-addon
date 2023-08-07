import {
	HomepageCard,
	ItemUpdatesCard,
	AuthCard,
	SaveContactCard,
	MessageCard,
	AuthorizationCard,
	ViewContactCard,
	SettingsCard,
	AddBoardItemCard,
	UpdateSettingsCard
} from './cards';
import {
	fetchMondayAccessToken,
	fetchMondayAccountDetails,
	fetchBoardColumnValues,
	createBoardItem,
	updateExtraColumns,
	fetchBoardSettingsStr,
	fetchUsersByBoard,
	createItemUpdate,
	listItemUpdates,
	updateConnectColumns
} from './services/monday';
import {
	getBoardItemByEmail,
	fetchGmailSettings,
	upsertBoardItemByEmail,
	saveCRMSettings,
	getCRMSettingsByAccountId
} from './services/offsite';
import {
	extractEmailAddress,
	findEmailInBoardRow,
	extractCharactersBeforeSymbol,
	extractObjectKeysAndValues,
	sanitizeColumnTypeByID,
	createBoardQuery,
	sanitizeSpecialFieldsValue,
	addSetingsStrToPayload,
	addValuesAndSettingsStr,
	sanitizeUpdateMsg
} from './utils';
import {
	saveCurrentBoardAndItem,
	getCurrentBoardAndItem,
	saveColumStrSettings,
	getColumStrSettings,
	getToken,
	saveToken,
	saveAllowedFIelds,
	getAllowedFields,
	saveItemId,
	getItemId,
	saveScrapedEmailData,
	getScrapedEmailData,
	getCurrentAccount,
	saveCurrentAccount
} from './utils/localStorage';

import { appendConnectColumn, getSelectedColumnsOnly } from './utils/misc';
import Notify from './cards/widgets/Notify';
import { BOARD_COLUMNS, GMAIL, DEFUALT_FIELDS } from './constants';

const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;

const { NAME, EMAIL, BOARD_RELATION } = BOARD_COLUMNS;
const FIRST_GROUP = 'topics';

const onDefaultHomePageOpen = () => HomepageCard();

function doGet(e) {
	var params = e.parameter;
	console.log('Params=>', params);
}

function authCallback(request) {
	var code = request.parameter.code;
	var access_token = fetchMondayAccessToken(code);
	if (!access_token) return HtmlService.createHtmlOutput('Fail! Internal server error!.');
	saveToken(access_token);
	return HtmlService.createHtmlOutput('Success! You can close this tab.');
}

function getOAuthService() {
	return OAuth2.createService('monday')
		.setAuthorizationBaseUrl(MONDAY_AUTH_URL)
		.setTokenUrl(MONDAT_ACCESS_TOKEN_URL)
		.setClientId(MONDAY_CLIENT_ID)
		.setClientSecret(MONDAY_CLIENT_SECRET)
		.setCallbackFunction('authCallback')
		.setCache(CacheService.getUserCache())
		.setPropertyStore(PropertiesService.getUserProperties());
}

function handleLogoutClick() {
	var service = getOAuthService();
	service.reset();
	saveToken('');
	return MessageCard('Logged out successfully!');
}

function fetchGmailSenderAndEmail(e) {
	let email = '';
	let itemName = '';
	let emailBody = '';
	const messageId = e.messageMetadata.messageId;
	const thread = GmailApp.getMessageById(messageId).getThread();
	const threadLink = thread.getPermalink();
	const messages = thread.getMessages();
	const lastMessage = messages[messages.length - 1];
	const lastSender = lastMessage.getFrom();
	console.log({ lastSender });
	itemName = extractCharactersBeforeSymbol(lastSender, '<');
	let emailAddr = extractEmailAddress(lastSender);
	email = emailAddr;
	emailBody = lastMessage.getPlainBody();
	let scapeDoubleQoutes = itemName.replace(/"/g, '');
	console.log({ itemName, email });
	const data = { email, itemName: scapeDoubleQoutes, emailBody, threadLink };

	saveScrapedEmailData(data);
	return data;
}

function initGmailHomeUI({ email, itemName }) {
	try {
		const accessToken = getToken();
		if (!accessToken) return AuthCard();

		const account = fetchMondayAccountDetails();
		const { me } = account.data;
		saveCurrentAccount(me);
		const accountId = account.account_id.toString();
		const settings = fetchGmailSettings(accountId); // For allowed fields display
		if (!settings || !settings.data) return MessageCard('No settings found!');
		const { allowedFields, board, group } = settings.data;

		const boardId = board.value;
		saveAllowedFIelds(allowedFields);
		const { data: settingsStrRes } = fetchBoardSettingsStr(boardId);
		const { data: boardUserData } = fetchUsersByBoard(boardId);
		const strColumns = settingsStrRes.boards[0].columns;
		saveColumStrSettings(strColumns);
		const boardUsers = boardUserData.boards[0].subscribers;

		saveCurrentBoardAndItem({ email, group: group || 'topics', itemName, boardId });
		// Search in database
		const dbResponse = getBoardItemByEmail(email); // Search email inside our DB
		if (dbResponse && dbResponse.data) {
			const { id } = dbResponse.data.item;
			saveItemId(id);
			return ViewContactCard({
				dbResponse: dbResponse.data,
				strColumns,
				boardUsers
			});
		}
		const boardIds = [boardId];
		const boardResponse = fetchBoardColumnValues(boardIds); // To search email inside Monday board
		const rows = boardResponse.data.boards[0].items; // Select rows from matching board(input_board) response
		for (let i = 0; i < rows.length; i++) {
			let found = findEmailInBoardRow(rows[i], email);
			if (found) {
				const row = rows[i];
				saveItemId(row.id);
				return ViewContactCard({ dbResponse: null, allowedFields, boardItem: row, strColumns, boardUsers });
			}
		}

		return SaveContactCard({ allowedFields, strColumns, email, itemName, boardUsers });
	} catch (err) {
		console.log('initHomeUIErr', err);
	}
}

function onGmailMessageOpen(e) {
	const { email = '', itemName = '' } = fetchGmailSenderAndEmail(e);
	return initGmailHomeUI({ email, itemName });
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

function handleUpdateContact(e) {
	try {
		const allowedFields = getAllowedFields();
		const { formInputs } = e.commonEventObject;
		const { keys, values } = extractObjectKeysAndValues(e.formInput);
		const sanitizedData = sanitizeColumnTypeByID({ keys, values, formInputs, allowedFields });
		const currentItem = getCurrentBoardAndItem();
		if (!currentItem) return;
		const { itemName, boardId } = currentItem;
		const itemId = getItemId();
		const valueSanitized = sanitizeSpecialFieldsValue(sanitizedData);
		const connectColumns = valueSanitized.filter(f => f.columnType === BOARD_RELATION);
		if (connectColumns.length) updateConnectColumnData({ connectColumns, boardId, itemId });

		const nameField = valueSanitized.find(f => f.columnType === NAME);
		const boardQuery = createBoardQuery({
			itemName: nameField.value,
			itemId,
			boardId,
			boardPayload: valueSanitized
		});
		updateExtraColumns(boardQuery);
		const strColumns = getColumStrSettings();
		const settingsStrAddedInputs = addSetingsStrToPayload(strColumns, valueSanitized);
		const boarItemColValues = addValuesAndSettingsStr(allowedFields, settingsStrAddedInputs);
		console.log('boarItemColValues==>', boarItemColValues);
		const item = { id: itemId, name: itemName, column_values: boarItemColValues };
		const emailField = valueSanitized.find(v => v.columnType === EMAIL);
		upsertBoardItemByEmail({ email: emailField.value, item });
		return Notify({ message: 'Contact updated successfully!' });
	} catch (err) {
		console.log('UpdateContactErr:', err);
	}
}

const updateConnectColumnData = async ({ connectColumns, boardId, itemId }) => {
	for (let c of connectColumns) {
		const query = `mutation {
			change_multiple_column_values(board_id:${boardId}, item_id:${itemId}, column_values: "{\\"${c.columnId}\\" : {\\"item_ids\\" : [${c.value}] }}"),  { id }
		  }`;
		await updateConnectColumns(query);
	}
};

function handleSaveContact(e) {
	try {
		const allowedFields = getAllowedFields();
		const { formInputs } = e.commonEventObject;
		const { keys, values } = extractObjectKeysAndValues(e.formInput);
		const sanitizedData = sanitizeColumnTypeByID({ keys, values, formInputs, allowedFields }); // columnId,columnTyp,value
		const currentItem = getCurrentBoardAndItem();
		if (!currentItem) return;
		const { itemName, boardId, group } = currentItem;
		const res = createBoardItem({ boardId, group, itemName });

		const { id: itemId } = res.data.create_item;
		const valueSanitized = sanitizeSpecialFieldsValue(sanitizedData);
		const connectColumns = valueSanitized.filter(f => f.columnType === BOARD_RELATION);
		if (connectColumns.length) updateConnectColumnData({ connectColumns, boardId, itemId });

		const boardQuery = createBoardQuery({ itemId, boardId, boardPayload: valueSanitized });
		const updatedExtras = updateExtraColumns(boardQuery);
		console.log('Updated Extras=>', updatedExtras);
		// Append settingsStr and save to Database
		const strColumns = getColumStrSettings();
		const settingsStrAddedInputs = addSetingsStrToPayload(strColumns, valueSanitized);
		// Add values & settingsStr to allowedFIelds from settingsStrAdded
		const boarItemColValues = addValuesAndSettingsStr(allowedFields, settingsStrAddedInputs);
		console.log('boarItemColValues===>', boarItemColValues);
		const item = { id: itemId, name: itemName, column_values: boarItemColValues };
		const emailField = valueSanitized.find(v => v.columnType === EMAIL);
		upsertBoardItemByEmail({ email: emailField.value, item });
		return Notify({ message: 'Contact saved successfully!' });
	} catch (err) {
		console.log('SaveContactErr:', err);
	}
}

function handleItemUpdateClick(e) {
	try {
		const itemId = getItemId();
		const { threadLink, emailBody } = getScrapedEmailData();
		const { updateText, selectEmailContent } = e.formInput;
		const msg = sanitizeUpdateMsg({ updateText, threadLink, emailBody, selectEmailContent });
		if (!msg) return;
		createItemUpdate({ itemId, updateText: msg });
		// Notify({ message: 'Item Update created successfully!' });
		Utilities.sleep(3000);
		const { itemName = '', email = '' } = getCurrentBoardAndItem();
		return initGmailHomeUI({ itemName, email });
	} catch (err) {
		console.log('ItemUpdateErr:', err);
	}
}

function handleUpdateTabClick() {
	let itemUpdatesList = [];
	const itemId = getItemId();
	const { itemName = '', email = '', boardId } = getCurrentBoardAndItem();
	const items = listItemUpdates({ itemId, boardId });
	const boards = items && items.data ? items.data.boards : [];
	if (boards.length) {
		const { updates } = boards[0];
		itemUpdatesList = updates.filter(f => f.item_id === itemId);
	}
	return ItemUpdatesCard({ itemName, email, itemUpdatesList });
}

function handleContactTabClick() {
	const { itemName = '', email = '' } = getCurrentBoardAndItem();
	return initGmailHomeUI({ itemName, email });
}

function handleSettingIconClick() {
	return SettingsCard();
}

function handleMondayBoardChange(e) {
	let existingAllowedFields = [];
	const obj = e.commonEventObject;
	const boardIds = obj.formInputs.selectedMondayBoard.stringInputs?.value || [];
	const boardId = boardIds.length ? boardIds[0] : null;
	// If settings exist send columns as well
	const exist = getCRMSettingsByAccountId();
	if (exist.data && boardId === exist.data.board.value) existingAllowedFields = exist.data.allowedFields;
	return UpdateSettingsCard({ currentBoard: boardId, existingAllowedFields });
}

function handleAddConnectItemClick(e) {
	const { currentConnectBoard } = e.commonEventObject.parameters;
	return AddBoardItemCard({ currentConnectBoard });
}

function handleSaveConnectBoardItem(e) {
	try {
		const { formInputs, parameters } = e.commonEventObject;
		const jsonObjectColumns = JSON.parse(parameters.columns);
		const { keys, values } = extractObjectKeysAndValues(e.formInput);
		const sanitizedData = sanitizeColumnTypeByID({ keys, values, formInputs, allowedFields: jsonObjectColumns });
		const nameField = sanitizedData.find(f => f.columnType === NAME);
		const itemName = nameField?.value || '';
		if (!itemName) return Notify({ message: 'Item name is required!' });
		const { boardId } = parameters;
		const res = createBoardItem({ boardId, group: FIRST_GROUP, itemName });

		const { id: itemId } = res.data.create_item;
		const valueSanitized = sanitizeSpecialFieldsValue(sanitizedData);
		const boardQuery = createBoardQuery({ itemId, boardId, boardPayload: valueSanitized });
		updateExtraColumns(boardQuery);
		const { itemName: currentBoardItem, email = '' } = getCurrentBoardAndItem();
		return initGmailHomeUI({ itemName: currentBoardItem, email });
	} catch (err) {
		console.log('SaveConnectBoardItemErr:', err);
	}
}

function handleSaveSettings(e) {
	try {
		const { account } = getCurrentAccount();
		const { formInputs, parameters } = e.commonEventObject;
		const { groups, columns, boardData } = parameters;

		const jsonGroups = JSON.parse(groups);
		const jsonBoardData = JSON.parse(boardData);
		const jsonColumns = JSON.parse(columns);

		const selectedCols = getSelectedColumnsOnly(jsonColumns, formInputs);
		const connectColumsAdded = appendConnectColumn(selectedCols, jsonColumns);
		const allColumns = [...connectColumsAdded, ...DEFUALT_FIELDS];
		const emailField = allColumns.find(f => f.type === EMAIL);
		if (!emailField) return Notify({ message: 'Email field is required!' });

		const currentGroup = jsonGroups.find(j => j.boardId === jsonBoardData.value);
		const payload = {
			serviceName: GMAIL.SERVICE_NAME,
			accountId: account.id,
			formName: GMAIL.FORM_NAME,
			board: jsonBoardData,
			group: currentGroup.groupId,
			allowedFields: allColumns // id,type,title,settings_str
		};
		saveCRMSettings(payload);
		return Notify({ message: 'Settings saved successfully!' });
	} catch (err) {
		console.log('SaveSettingsErrr:', err);
	}
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
global.handleLoginClick = handleLoginClick;
global.authCallback = authCallback;
global.handleLogoutClick = handleLogoutClick;
global.getOAuthService = getOAuthService;
global.handleSaveContact = handleSaveContact;
global.handleUpdateContact = handleUpdateContact;
global.handleUpdateTabClick = handleUpdateTabClick;
global.handleContactTabClick = handleContactTabClick;
global.handleItemUpdateClick = handleItemUpdateClick;
global.handleSettingIconClick = handleSettingIconClick;
global.handleMondayBoardChange = handleMondayBoardChange;
global.handleAddConnectItemClick = handleAddConnectItemClick;
global.handleSaveConnectBoardItem = handleSaveConnectBoardItem;
global.handleSaveSettings = handleSaveSettings;
