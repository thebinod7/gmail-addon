export default function createAuthorizationCard() {
	const service = getOAuthService();
	const authorizationUrl = service.getAuthorizationUrl();
	// const redirect_uri = service.getRedirectUri();

	const card = CardService.newCardBuilder();
	const authorizationAction = CardService.newAuthorizationAction().setAuthorizationUrl(authorizationUrl);
	const button = CardService.newTextButton()
		.setText('Authorize to Monday')
		.setAuthorizationAction(authorizationAction);
	const cardSection = CardService.newCardSection().addWidget(button);
	card.addSection(cardSection);
	return card.build();
}
