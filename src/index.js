const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;

import {
	HomepageCard,
	ItemUpdatesCard,
	AuthCard,
	SaveContactCard,
	MessageCard,
	AuthorizationCard,
	ViewContactCard
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
	listItemUpdates
} from './services/monday';
import { getBoardItemByEmail, fetchGmailSettings, upsertBoardItemByEmail } from './services/offsite';
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
	getScrapedEmailData
} from './utils/localStorage';
import Notify from './cards/widgets/Notify';

import { BOARD_COLUMNS } from './constants';

const { NAME, EMAIL } = BOARD_COLUMNS;

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
	for (let i = 0; i < messages.length; i++) {
		let sender = messages[i].getFrom();
		itemName = extractCharactersBeforeSymbol(sender, '<');
		let emailAddr = extractEmailAddress(sender);
		email = emailAddr;
		emailBody = messages[i].getPlainBody();
	}
	let scapeDoubleQoutes = itemName.replace(/"/g, '');
	const data = { email, itemName: scapeDoubleQoutes, emailBody, threadLink };

	saveScrapedEmailData(data);
	return data;
}

function initGmailHomeUI({ email, itemName }) {
	const accessToken = getToken();
	if (!accessToken) return AuthCard();

	const account = fetchMondayAccountDetails();
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
			return ViewContactCard({ dbResponse: null, boardItem: row, strColumns, boardUsers });
		}
	}

	return SaveContactCard({ allowedFields, strColumns, email, itemName, boardUsers });
}

function onGmailMessageOpen(e) {
	const { email = '', itemName = '' } = fetchGmailSenderAndEmail(e);
	return initGmailHomeUI({ email, itemName });
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

// Create payload(columnId,columnType,value) with formData
// Create boardItem and sanitize special fields value
// Update extra board columns
// Upsert boardItem with email and payload(with value and settings_str)
function handleUpdateContact(e) {
	try {
		const { keys, values } = extractObjectKeysAndValues(e.formInput);
		const sanitizedData = sanitizeColumnTypeByID({ keys, values });
		const currentItem = getCurrentBoardAndItem();
		const allowedFields = getAllowedFields();
		if (!currentItem) return;
		const { itemName, boardId } = currentItem;
		const itemId = getItemId();
		const valueSanitized = sanitizeSpecialFieldsValue(sanitizedData);
		console.log('VS==>', valueSanitized);
		const nameField = valueSanitized.find(f => f.columnType === NAME);
		const boardQuery = createBoardQuery({
			itemName: nameField.value,
			itemId,
			boardId,
			boardPayload: valueSanitized
		});
		const updatedExtras = updateExtraColumns(boardQuery);
		console.log('UPDATED==>', updatedExtras);
		const strColumns = getColumStrSettings();
		const settingsStrAddedInputs = addSetingsStrToPayload(strColumns, valueSanitized);
		const boarItemColValues = addValuesAndSettingsStr(allowedFields, settingsStrAddedInputs);
		console.log('boarItemColValues', boarItemColValues);
		const item = { id: itemId, name: itemName, column_values: boarItemColValues };
		const emailField = valueSanitized.find(v => v.columnType === EMAIL);
		console.log('EM==>', emailField);
		const upserted = upsertBoardItemByEmail({ email: emailField.value, item });
		console.log('Upserted=>', upserted);
		return Notify({ message: 'Contact updated successfully!' });
	} catch (err) {
		console.log('UpdateContactErr:', err);
	}
}

// Create payload(columnId,columnType,value) with formData
// Create boardItem and sanitize special fields value
// Update extra board columns
// Upsert boardItem with email and payload(with value and settings_str)
function handleSaveContact(e) {
	const { keys, values } = extractObjectKeysAndValues(e.formInput);
	const sanitizedData = sanitizeColumnTypeByID({ keys, values }); // columnId,columnTyp,value
	const currentItem = getCurrentBoardAndItem();
	const allowedFields = getAllowedFields();
	if (!currentItem) return;
	const { itemName, boardId, group } = currentItem;
	const res = createBoardItem({ boardId, group, itemName });
	if (res.error_message || res.errors) return console.log('error=>', res);
	const { id: itemId } = res.data.create_item;
	const valueSanitized = sanitizeSpecialFieldsValue(sanitizedData);
	console.log('Save Contact Payload=>', valueSanitized);
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

function handleViewItemClick() {
	const itemId = getItemId();
	const { boardId } = getCurrentBoardAndItem();
	console.log({ boardId });
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
global.handleViewItemClick = handleViewItemClick;
