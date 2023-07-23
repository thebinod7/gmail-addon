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
	addSetingsStrToPayload
} from './utils';
import {
	saveCurrentBoardAndItem,
	getCurrentBoardAndItem,
	saveColumStrSettings,
	getColumStrSettings,
	getToken,
	saveToken
} from './utils/localStorage';
import { SAMPLE_DATA } from './constants';
import updateContactCard from './cards/updateContact';

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
	const settings = fetchGmailSettings(accountId); // For allowed fields display
	if (!settings || !settings.data) return MessageCard('No settings found!');
	const { allowedFields, board, group } = settings.data;
	const boardId = board.value;
	const { data: settingsStrRes } = fetchBoardSettingsStr(boardId);
	const { data: boardUserData } = fetchUsersByBoard(boardId);
	const strColumns = settingsStrRes.boards[0].columns;
	saveColumStrSettings(strColumns);
	const boardUsers = boardUserData.boards[0].subscribers;

	const { email, itemName } = fetchGmailSenderAndEmail(e);
	saveCurrentBoardAndItem({ group: group || 'topics', itemName, boardId });
	// Search in database
	const dbResponse = getBoardItemByEmail(email); // Search email inside our DB
	console.log('DBRES=>', dbResponse);
	const boardIds = [boardId];
	const boardResponse = fetchBoardColumnValues(boardIds); // To search email inside Monday board
	const rows = boardResponse.data.boards[0].items; // Select rows from matching board(input_board) response
	const sample_columns = [...rows[0].column_values, { id: 'name', type: 'name', title: 'Item Name' }]; // Remove it
	console.log('SAMPLE_COLS=>', sample_columns);
	for (let i = 0; i < rows.length; i++) {
		let found = findEmailInBoardRow(rows[i], email);
		if (found) return updateContactCard({ allowedFields, strColumns, email, itemName, boardUsers });
	}

	return SaveContactCard({ allowedFields: sample_columns, strColumns, email, itemName, boardUsers });
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

// TODO:
// Save to DB (Remove sample data before save)
function handleSaveContact(e) {
	const { keys, values } = extractObjectKeysAndValues(e.formInput);
	const sanitizedData = sanitizInputPayload({ keys, values }); // columnId,columnTyp,value
	const currentItem = getCurrentBoardAndItem();
	if (!currentItem) return;
	const { itemName, boardId, group } = currentItem;
	const res = createBoardItem({ boardId, group, itemName });
	if (res.error_message) return;
	const { id: itemId } = res.data.create_item;
	const valueSanitized = sanitizePayloadValue(sanitizedData);
	console.log('valueSanitized=>', valueSanitized);
	const boardQuery = createBoardQuery({ itemId, boardId, boardPayload: valueSanitized });
	const updatedExtras = updateExtraColumns(boardQuery);
	console.log('Updated Extras=>', updatedExtras);
	// Append settingsStr and save to Database
	const strColumns = getColumStrSettings();
	const settingsStrAdded = addSetingsStrToPayload(strColumns, valueSanitized);
	console.log('SETTINGS_ADDED', settingsStrAdded);
	const item = { id: itemId, name: itemName, column_values: settingsStrAdded };
	const emailField = valueSanitized.find(v => v.columnType === 'email');
	const itemUpserted = upsertBoardItemByEmail({ email: emailField.value, item });
	console.log('BoardItem Upserted!', itemUpserted);
	return MessageCard('Contact saved successfully!');
	// const message = CardService.newTextParagraph().setText('Form submitted successfully!');
	// const updatedCard = CardService.newCardBuilder()
	// 	.addSection(CardService.newCardSection().addWidget(message))
	// 	.build();
	// return updatedCard;
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
global.handleLoginClick = handleLoginClick;
global.authCallback = authCallback;
global.handleLogoutClick = handleLogoutClick;
global.getOAuthService = getOAuthService;
global.handleSaveContact = handleSaveContact;
