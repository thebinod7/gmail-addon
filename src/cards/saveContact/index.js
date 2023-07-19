export default function saveContactCard() {
	const card = CardService.newCardBuilder();
	const section = CardService.newCardSection();

	const formAction = CardService.newAction().setFunctionName('handleFormSubmit');

	const submitButton = CardService.newTextButton().setText('Submit').setOnClickAction(formAction);

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	card.addSection(section.addWidget(submitButton).addWidget(btnLogout));
	return card.build();
}
