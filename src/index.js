const MONDAY_AUTH_URL = process.env.MONDAY_AUTH_URL;
const MONDAY_CLIENT_ID = process.env.APP_CLIENT_ID;
const MONDAY_CLIENT_SECRET = process.env.CLIENT_SECRET;
const MONDAT_ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_ENDPOINT;
const MONDAY_API_ENDPOINT = process.env.MONDAY_API_ENDPOINT;
const OFFSITE_API_ENDPOINT = process.env.OFFSITE_ENDPOINT;
const OFFSITE_API_SECRET = process.env.OFFSITE_API_SECRET;
const OFFSITE_INSTALL_URL = process.env.MONDAY_SHARE_URL;

console.log({MONDAY_CLIENT_ID});

function onDefaultHomePageOpen() {
  console.log("Homepage!!!");
  return homepageCard();
}

function homepageCard() {
  var msg = CardService.newTextParagraph().setText(
    "Open inbox item before gmail addon."
  );
  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(msg))
    .build();
  return updatedCard;
}

function createFormInputByType(input) {
  var title = input.title;
  var fieldName = input.id;
  switch (input.type) {
    case "text": {
      var textInput = CardService.newTextInput()
        .setFieldName(fieldName)
        .setTitle(title);
      return textInput;
    }
    case "dropdown": {
      var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle("A group of radio buttons.")
        .setFieldName(fieldName)
        .addItem("Option 1", "option_1", true)
        .addItem("Option 2", "option_2", false)
        .addItem("Option 3", "option_3", false);

      return dropdown;
    }

    default:
      return "";
  }
}

function renderSettingsForm() {

}

var sample_data = [
  { id: "name", name: "name", title: "Item Name", type: "text", value: "" },
  {
    id: "email",
    name: "email",
    title: "Email Address",
    type: "text",
    value: "",
  },
  {
    id: "phone",
    name: "phone",
    title: "Phone Number",
    type: "text",
    value: "",
  },
  {
    id: "dropdown",
    name: "dropdown",
    title: "Dropdown",
    type: "dropdown",
    value: "",
  },
  {
    id: "dropdown1",
    name: "dropdown1",
    title: "Dropdown 1",
    type: "dropdown",
    value: "",
  },
];

function getToken() {
  var properties = PropertiesService.getUserProperties();
  var token = properties.getProperty("access_token");
  return token;
}

function doGet(e) {
  var params = e.parameter;
  console.log("Params=>", params);
}

function saveToken(token) {
  var properties = PropertiesService.getUserProperties();
  properties.setProperty("access_token", token);
}

function fetchMondayAccessToken(code) {
  var service = getOAuthService();
  var redirect_uri = service.getRedirectUri();
  var data = {
    code: code,
    client_id: MONDAY_CLIENT_ID,
    client_secret: MONDAY_CLIENT_SECRET,
    redirect_uri: redirect_uri,
  };
  var queryString = Object.keys(data)
    .map(function (key) {
      return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
    })
    .join("&");

  var fullURL = MONDAT_ACCESS_TOKEN_URL + "?" + queryString;
  var options = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    muteHttpExceptions: true,
  };
  var response = UrlFetchApp.fetch(fullURL, options);
  if (!response) return null;
  var json = JSON.parse(response);
  return json.access_token;
}

function authCallback(request) {
  var code = request.parameter.code;
  var access_token = fetchMondayAccessToken(code);
  console.log("Access=>", access_token);
  if (!access_token)
    return HtmlService.createHtmlOutput("Fail! Internal server error!.");
  saveToken(access_token);
  return HtmlService.createHtmlOutput("Success! You can close this tab.");
}

function getOAuthService() {
  return OAuth2.createService("monday")
    .setAuthorizationBaseUrl(MONDAY_AUTH_URL)
    .setTokenUrl(MONDAT_ACCESS_TOKEN_URL)
    .setClientId(MONDAY_CLIENT_ID)
    .setClientSecret(MONDAY_CLIENT_SECRET)
    .setCallbackFunction("authCallback")
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties());
}

function handleLogoutClick() {
  var service = getOAuthService();
  service.reset();
  saveToken("");
  return logoutResponseCard();
}

function saveContactCard() {
  var msg = CardService.newTextParagraph().setText("Save contact!");
  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(msg))
    .build();
  return updatedCard;
}

function updateContactCard() {
  var msg = CardService.newTextParagraph().setText("Update contact!" + OFFSITE_API_ENDPOINT);
  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(msg))
    .build();
  return updatedCard;
}

function authenticationCard() {
  var btnInstall = CardService.newTextButton()
    .setText("Install Monday")
    .setOpenLink(
      CardService.newOpenLink()
        .setUrl(
          OFFSITE_INSTALL_URL
        )
        .setOpenAs(CardService.OpenAs.FULL_SIZE)
    )
    .setTextButtonStyle(CardService.TextButtonStyle.TEXT);

  var btnAuth = CardService.newTextButton()
    .setText("Login to Monday")
    .setOnClickAction(
      CardService.newAction().setFunctionName("handleLoginClick")
    );

  var msg = CardService.newTextParagraph().setText(
    "Install Monday app if you are a first time user."
  );

  var updatedCard = CardService.newCardBuilder()
    .addSection(
      CardService.newCardSection()
        .addWidget(msg)
        .addWidget(btnInstall)
        .addWidget(btnAuth)
    )
    .build();
  return updatedCard;
}

function fetchGmailSettings(accountId) {
  var headers = {
    apisecret: OFFSITE_API_SECRET,
    "Content-Type": "application/json",
  };
  var options = {
    method: "get",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: headers,
  };
  var backendUrl =
    OFFSITE_API_ENDPOINT +
    "/api/v1/crm-settings/" +
    accountId +
    "/account/Gmail Contact";
  console.log("Backend=>", backendUrl);
  var res = UrlFetchApp.fetch(backendUrl, options);
  return JSON.parse(res);
}

function fetchMondayAccountDetails(accessToken) {
  var query = "query { me {name id  account{id name slug}}}";
  var headers = {
    Authorization: accessToken,
    "Content-Type": "application/json",
  };
  var options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: headers,
    payload: JSON.stringify({ query: query }),
  };
  var res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
  return JSON.parse(res);
}

function fetchBoardColumnValues(accessToken, boardIds) {
  var query =
    "query { boards(ids:" +
    boardIds +
    ") { items() {id name column_values {id title type value text} }} }";
  var headers = {
    Authorization: accessToken,
    "Content-Type": "application/json",
  };
  var options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: headers,
    payload: JSON.stringify({ query: query }),
  };
  var res = UrlFetchApp.fetch(MONDAY_API_ENDPOINT, options);
  return JSON.parse(res);
}

function showBlankSettingsCard() {
  var msg = CardService.newTextParagraph().setText(
    "No settings found, Please save your settings first!"
  );
  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(msg))
    .build();

  return updatedCard;
}

function extractEmailAddress(text) {
  var regex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  var matches = text.match(regex);
  return matches ? matches[0] : null;
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
    console.log("Text==>", body);
  }
  return email;
}

function findEmailInBoardRow(row, email) {
  var columns = row.column_values;
  var emailColumns = columns.filter(function (f) {
    return f.type === "email";
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
}

function getBoardItemByEmail(email) {
  var headers = {
    apisecret: OFFSITE_API_SECRET,
    "Content-Type": "application/json",
  };
  var options = {
    method: "get",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: headers,
  };
  var backendUrl = OFFSITE_API_ENDPOINT + "/api/v1/board-items/email/" + email;
  console.log("URL=>", backendUrl);
  var res = UrlFetchApp.fetch(backendUrl, options);
  return JSON.parse(res);
}

function onGmailMessageOpen(e) {
  var currentCard = "save";
  var accessToken = getToken();

  if (!accessToken) return authenticationCard();

  var account = fetchMondayAccountDetails(accessToken);
  var accountId = account.account_id.toString();
  var settings = fetchGmailSettings(accountId);
  if (!settings || !settings.data) return showBlankSettingsCard();
  var allowedFields = settings.data.allowedFields;
  var senderEmail = fetchGmailSender(e);
  // Search in database
  var dbResponse = getBoardItemByEmail(senderEmail);
  console.log("DBRES=>", dbResponse);
  var boardIds = [settings.data.board.value];
  var boardResponse = fetchBoardColumnValues(accessToken, boardIds);
  var rows = boardResponse.data.boards[0].items;
  for (var i = 0; i < rows.length; i++) {
    var found = findEmailInBoardRow(rows[i], senderEmail);
    if (found) {
      return updateContactCard("save");
      // append values/sanitize forms and render;
    }
  }

  if (currentCard === "save") return saveContactCard("save");
  if (currentCard === "update") return updateContactCard("update");

  var card = CardService.newCardBuilder();
  var section = CardService.newCardSection();

  var formAction = CardService.newAction().setFunctionName("handleFormSubmit");

  var submitButton = CardService.newTextButton()
    .setText("Submit")
    .setOnClickAction(formAction);

  var btnLogout = CardService.newTextButton()
    .setText("Logout")
    .setOnClickAction(
      CardService.newAction().setFunctionName("handleLogoutClick")
    );

  var btnAuth = CardService.newTextButton()
    .setText("Connect to Monday")
    .setOnClickAction(
      CardService.newAction().setFunctionName("handleLoginClick")
    );

  var widgets;

  for (var i = 0; i < sample_data.length; i++) {
    var _input = createFormInputByType(sample_data[i]);
    widgets = section.addWidget(_input);
  }
  if (accessToken) widgets.addWidget(submitButton).addWidget(btnLogout);
  else widgets.addWidget(submitButton).addWidget(btnAuth);
  card.addSection(widgets);
  return card.build();
}

function handleLoginClick(e) {
  return createAuthorizationCard();
}

function createAuthorizationCard() {
  var service = getOAuthService();
  var authorizationUrl = service.getAuthorizationUrl();
  var redirect_uri = service.getRedirectUri();

  var card = CardService.newCardBuilder();
  var authorizationAction =
    CardService.newAuthorizationAction().setAuthorizationUrl(authorizationUrl);
  var button = CardService.newTextButton()
    .setText("Authorize to Monday")
    .setAuthorizationAction(authorizationAction);
  var cardSection = CardService.newCardSection().addWidget(button);
  card.addSection(cardSection);
  return card.build();
}

function handleFormSubmit(e) {
  // console.log("FORM=>", e.formInput);

  var message = CardService.newTextParagraph().setText(
    "Form submitted successfully!"
  );

  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(message))
    .build();

  return updatedCard;
}

function logoutResponseCard() {
  var msg = CardService.newTextParagraph().setText("Logged out successfully!");

  var updatedCard = CardService.newCardBuilder()
    .addSection(CardService.newCardSection().addWidget(msg))
    .build();

  return updatedCard;
}

function showHomeCard() {
    var msg = CardService.newTextParagraph().setText(
      "Welcome to homepage!"
    );
    var updatedCard = CardService.newCardBuilder()
      .addSection(CardService.newCardSection().addWidget(msg))
      .build();
    return updatedCard;
}

function showGmailCard() {
    var msg = CardService.newTextParagraph().setText(
      "You are inside gmail."
    );
    var updatedCard = CardService.newCardBuilder()
      .addSection(CardService.newCardSection().addWidget(msg))
      .build();
    return updatedCard;
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
global.handleLoginClick = handleLoginClick;
global.authCallback = authCallback;
