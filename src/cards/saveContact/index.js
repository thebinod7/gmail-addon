export default function saveContactCard() {
	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Save Contact').addWidget(cardDivider);

	const itemInput = CardService.newTextInput().setFieldName('itemName').setTitle('Item Name');
	const emailInput = CardService.newTextInput().setFieldName('email').setTitle('Email');

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	const formAction = CardService.newAction().setFunctionName('handleSaveContact');
	const btnSubmit = CardService.newTextButton().setText('Submit').setOnClickAction(formAction);

	const card = CardService.newCardBuilder()
		.addSection(section.addWidget(itemInput).addWidget(emailInput).addWidget(btnSubmit).addWidget(btnLogout))
		.build();

	return card;
}
