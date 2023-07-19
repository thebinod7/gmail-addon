export default function updateContactCard() {
	const card = CardService.newCardBuilder();
	const section = CardService.newCardSection();

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	card.addSection(section.addWidget(btnLogout));
	return card.build();
}
