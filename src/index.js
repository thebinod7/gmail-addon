const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;

import { HomepageCard, AuthCard, SaveContactCard, UpdateContactCard, MessageCard, AuthorizationCard } from './cards';
import {
	fetchMondayAccessToken,
	fetchMondayAccountDetails,
	fetchBoardColumnValues,
	createBoardItem,
	updateExtraColumns,
	fetchBoardSettingsStr,
	fetchUsersByBoard
} from './services/monday';
import { getBoardItemByEmail, fetchGmailSettings, upsertBoardItemByEmail } from './services/offsite';
import {
	extractEmailAddress,
	findEmailInBoardRow,
	extractCharactersBeforeSymbol,
	extractObjectKeysAndValues,
	sanitizInputPayload,
	createBoardQuery,
	sanitizePayloadValue,
	addSetingsStrToPayload,
	addValuesAndSettingsStr
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
	getItemId
} from './utils/localStorage';
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
	const messageId = e.messageMetadata.messageId;
	const thread = GmailApp.getMessageById(messageId).getThread();
	const messages = thread.getMessages();
	for (let i = 0; i < messages.length; i++) {
		let sender = messages[i].getFrom();
		itemName = extractCharactersBeforeSymbol(sender, '<');
		let emailAddr = extractEmailAddress(sender);
		email = emailAddr;
		let body = messages[i].getBody();
	}
	return { email, itemName };
}

function onGmailMessageOpen(e) {
	const accessToken = getToken();
	if (!accessToken) return AuthCard();

	const account = fetchMondayAccountDetails();
	const accountId = account.account_id.toString();
	console.log({ accountId });
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

	const { email, itemName } = fetchGmailSenderAndEmail(e);
	saveCurrentBoardAndItem({ group: group || 'topics', itemName, boardId });
	// Search in database
	const dbResponse = getBoardItemByEmail(email); // Search email inside our DB
	if (dbResponse && dbResponse.data) {
		const { id } = dbResponse.data.item;
		saveItemId(id);
		return UpdateContactCard({
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
		if (found) return UpdateContactCard({ allowedFields, strColumns, email, itemName, boardUsers });
	}

	return SaveContactCard({ allowedFields, strColumns, email, itemName, boardUsers });
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

function handleUpdateContact(e) {
	const { keys, values } = extractObjectKeysAndValues(e.formInput);
	const sanitizedData = sanitizInputPayload({ keys, values });
	const currentItem = getCurrentBoardAndItem();
	const allowedFields = getAllowedFields();
	if (!currentItem) return;
	const { itemName, boardId } = currentItem;
	const itemId = getItemId();
	const valueSanitized = sanitizePayloadValue(sanitizedData);
	const nameField = valueSanitized.find(f => f.columnType === NAME);
	const boardQuery = createBoardQuery({ itemName: nameField.value, itemId, boardId, boardPayload: valueSanitized });
	const updatedExtras = updateExtraColumns(boardQuery);
	console.log('UPDATED==>', updatedExtras);
	const strColumns = getColumStrSettings();
	const settingsStrAddedInputs = addSetingsStrToPayload(strColumns, valueSanitized);
	const boarItemColValues = addValuesAndSettingsStr(allowedFields, settingsStrAddedInputs);
	const item = { id: itemId, name: itemName, column_values: boarItemColValues };
	const emailField = valueSanitized.find(v => v.columnType === EMAIL);
	upsertBoardItemByEmail({ email: emailField.value, item });
	return MessageCard('Contact updated successfully!');
}

function handleSaveContact(e) {
	const { keys, values } = extractObjectKeysAndValues(e.formInput);
	const sanitizedData = sanitizInputPayload({ keys, values }); // columnId,columnTyp,value
	const currentItem = getCurrentBoardAndItem();
	const allowedFields = getAllowedFields();
	if (!currentItem) return;
	const { itemName, boardId, group } = currentItem;
	const res = createBoardItem({ boardId, group, itemName });
	if (res.error_message) return;
	const { id: itemId } = res.data.create_item;
	const valueSanitized = sanitizePayloadValue(sanitizedData);
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
	const itemUpserted = upsertBoardItemByEmail({ email: emailField.value, item });
	console.log('BoardItem Upserted!', itemUpserted);
	return MessageCard('Contact saved successfully!');
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
global.handleLoginClick = handleLoginClick;
global.authCallback = authCallback;
global.handleLogoutClick = handleLogoutClick;
global.getOAuthService = getOAuthService;
global.handleSaveContact = handleSaveContact;
global.handleUpdateContact = handleUpdateContact;
