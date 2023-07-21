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
import { getBoardItemByEmail, fetchGmailSettings } from './services/offsite';
import {
	getToken,
	saveToken,
	extractEmailAddress,
	findEmailInBoardRow,
	extractCharactersBeforeSymbol,
	extractObjectKeysAndValues,
	sanitizInputPayload,
	createBoardQuery,
	saveCurrentBoardAndItem,
	getCurrentBoardAndItem
} from './utils';
import { SAMPLE_DATA } from './constants';

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
	const { data: settingsStrRes } = fetchBoardSettingsStr(board.value);
	const strColumns = settingsStrRes.boards[0].columns;
	const { data: boardUserData } = fetchUsersByBoard(board.value);
	const boardUsers = boardUserData.boards[0].subscribers;

	const { email, itemName } = fetchGmailSenderAndEmail(e);
	saveCurrentBoardAndItem({ group: group || 'topics', itemName, boardId: board.value });
	// Search in database
	const dbResponse = getBoardItemByEmail(email); // Search email inside our DB
	console.log('DBRES=>', dbResponse);
	const boardIds = [board.value];
	const boardResponse = fetchBoardColumnValues(boardIds); // Search email inside Monday board
	const rows = boardResponse.data.boards[0].items;
	console.log('ROWS:', rows);
	for (let i = 0; i < rows.length; i++) {
		let found = findEmailInBoardRow(rows[i], email);
		if (found) {
			return UpdateContactCard();
			// append values/sanitize forms and render;
		}
	}

	return SaveContactCard({ allowedFields: SAMPLE_DATA, strColumns, email, itemName, boardUsers });
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

// TODO: remove filter by multiple-person
// Save to DB (Remove sample data before save)
function handleSaveContact(e) {
	// Create board payload (columnType,columnId, value)
	const { keys, values } = extractObjectKeysAndValues(e.formInput);
	const sanitizedData = sanitizInputPayload({ keys, values }); // columnId,columnTyp,value
	const currentItem = getCurrentBoardAndItem();
	if (!currentItem) return;
	const { itemName, boardId, group } = currentItem;
	const res = createBoardItem({ boardId, group, itemName });
	if (res.error_message) return;
	const { id: itemId } = res.data.create_item;
	const filtered = sanitizedData.filter(f => f.columnType !== 'multiple-person');
	const boardQuery = createBoardQuery({ itemId, boardId, boardPayload: filtered });
	updateExtraColumns(boardQuery);
	// Save to DB (Remove sample data before save)
	const message = CardService.newTextParagraph().setText('Form submitted successfully!');
	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(message))
		.build();
	return updatedCard;
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
global.handleLoginClick = handleLoginClick;
global.authCallback = authCallback;
global.handleLogoutClick = handleLogoutClick;
global.getOAuthService = getOAuthService;
global.handleSaveContact = handleSaveContact;
