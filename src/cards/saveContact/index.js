import { fieldOrderRealign, createFormInputByType } from '../../utils';
export default function saveContactCard({ allowedFields }) {
	// Render fields
	// Populate email and itemName fields (Append values)
	// Handle submit form
	let widgets;

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Save Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(allowedFields);
	for (let f of ordered_fields) {
		var _input = createFormInputByType(f);
		console.log('IN==>', _input);
		if (_input) widgets = section.addWidget(_input);
	}

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	const formAction = CardService.newAction().setFunctionName('handleSaveContact');
	const btnSubmit = CardService.newTextButton().setText('Submit').setOnClickAction(formAction);

	const card = CardService.newCardBuilder().addSection(section.addWidget(btnSubmit).addWidget(btnLogout)).build();

	return card;
}
