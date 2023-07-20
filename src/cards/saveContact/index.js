import { fieldOrderRealign, createFormInputByType, appendEmailAndItemName } from '../../utils';

export default function saveContactCard({ email, itemName, allowedFields }) {
	// Render fields
	// Populate email and itemName fields (Append values)
	// Handle submit form
	let widgets;

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Save Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(allowedFields);
	const appended = appendEmailAndItemName({ fields: ordered_fields, email, itemName });
	console.log('appended result==>', appended);
	for (let f of appended) {
		var _input = createFormInputByType(f);
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
