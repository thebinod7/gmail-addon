const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;

import { HomepageCard, AuthCard, SaveContactCard, UpdateContactCard, MessageCard, AuthorizationCard } from './cards';
import { fetchMondayAccessToken, fetchMondayAccountDetails, fetchBoardColumnValues } from './services/monday';
import { getBoardItemByEmail, fetchGmailSettings } from './services/offsite';
import { getToken, saveToken, extractEmailAddress, findEmailInBoardRow, createFormInputByType } from './utils';
import { SAMPLE_DATA } from './constants';

function onDefaultHomePageOpen() {
	console.log('Homepage!!!');
	return HomepageCard();
}

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
	var email;
	var messageId = e.messageMetadata.messageId;
	//  var message = GmailApp.getMessageById(messageId);
	var thread = GmailApp.getMessageById(messageId).getThread();
	var messages = thread.getMessages();
	for (var i = 0; i < messages.length; i++) {
		var sender = messages[i].getFrom();
		var emailAddr = extractEmailAddress(sender);
		email = emailAddr;
		var body = messages[i].getBody();
		console.log('Text==>', body);
	}
	return email;
}

function onGmailMessageOpen(e) {
	const accessToken = getToken();
	console.log('MondayTOKEN==>>', accessToken);
	if (!accessToken) return AuthCard();

	const account = fetchMondayAccountDetails(accessToken);
	const accountId = account.account_id.toString();
	const settings = fetchGmailSettings(accountId);
	if (!settings || !settings.data) return MessageCard('No settings found!');
	const allowedFields = settings.data.allowedFields;
	const senderEmail = fetchGmailSender(e);
	// Search in database
	const dbResponse = getBoardItemByEmail(senderEmail);
	console.log('DBRES=>', dbResponse);
	const boardIds = [settings.data.board.value];
	const boardResponse = fetchBoardColumnValues(accessToken, boardIds);
	const rows = boardResponse.data.boards[0].items;
	for (let i = 0; i < rows.length; i++) {
		let found = findEmailInBoardRow(rows[i], senderEmail);
		if (found) {
			return UpdateContactCard();
			// append values/sanitize forms and render;
		}
	}

	return SaveContactCard();

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

function handleFormSubmit(e) {
	// console.log("FORM=>", e.formInput);
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
