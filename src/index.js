const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;

import { HomepageCard, AuthCard, SaveContactCard, UpdateContactCard, MessageCard, AuthorizationCard } from './cards';
import { fetchMondayAccessToken, fetchMondayAccountDetails, fetchBoardColumnValues } from './services/monday';
import { getBoardItemByEmail, fetchGmailSettings } from './services/offsite';
import { getToken, saveToken, extractEmailAddress, findEmailInBoardRow, createFormInputByType } from './utils';
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

function fetchGmailSender(e) {
	let email;
	const messageId = e.messageMetadata.messageId;
	//  const message = GmailApp.getMessageById(messageId);
	const thread = GmailApp.getMessageById(messageId).getThread();
	const messages = thread.getMessages();
	for (let i = 0; i < messages.length; i++) {
		let sender = messages[i].getFrom();
		let emailAddr = extractEmailAddress(sender);
		email = emailAddr;
		let body = messages[i].getBody();
		console.log('Text==>', body);
	}
	return email;
}

function onGmailMessageOpen(e) {
	const accessToken = getToken();
	if (!accessToken) return AuthCard();

	const account = fetchMondayAccountDetails();
	const accountId = account.account_id.toString();
	const settings = fetchGmailSettings(accountId); // For allowed fields display
	if (!settings || !settings.data) return MessageCard('No settings found!');
	const { allowedFields, board } = settings.data;
	const senderEmail = fetchGmailSender(e);
	// Search in database
	const dbResponse = getBoardItemByEmail(senderEmail); // Search email inside our DB
	console.log('DBRES=>', dbResponse);
	const boardIds = [board.value];
	const boardResponse = fetchBoardColumnValues(boardIds); // Search email inside Monday board
	const rows = boardResponse.data.boards[0].items;
	console.log('ROWS:', rows);
	for (let i = 0; i < rows.length; i++) {
		let found = findEmailInBoardRow(rows[i], senderEmail);
		if (found) {
			return UpdateContactCard();
			// append values/sanitize forms and render;
		}
	}

	return SaveContactCard({ allowedFields });

	var card = CardService.newCardBuilder();
	var section = CardService.newCardSection();

	var formAction = CardService.newAction().setFunctionName('handleFormSubmit');

	var submitButton = CardService.newTextButton().setText('Submit').setOnClickAction(formAction);

	var btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	var btnAuth = CardService.newTextButton()
		.setText('Connect to Monday')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLoginClick'));

	var widgets;

	for (var i = 0; i < SAMPLE_DATA.length; i++) {
		var _input = createFormInputByType(SAMPLE_DATA[i]);
		widgets = section.addWidget(_input);
	}
	if (accessToken) widgets.addWidget(submitButton).addWidget(btnLogout);
	else widgets.addWidget(submitButton).addWidget(btnAuth);
	card.addSection(widgets);
	return card.build();
}

function handleLoginClick(e) {
	return AuthorizationCard();
}

function handleSaveContact(e) {
	console.log('FORM_INPUT=>', e.formInput);
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
