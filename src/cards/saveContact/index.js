import { fieldOrderRealign, createFormInputByType, appendEmailAndItemName } from '../../utils';

export default function saveContactCard({ email, itemName, allowedFields, boardUsers, strColumns }) {
	let widgets;

	const selectCols = strColumns.filter(f => f.type === 'color');

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Save Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(allowedFields);
	const appended = appendEmailAndItemName({ fields: ordered_fields, email, itemName });

	for (let f of appended) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		let _input = createFormInputByType({ input: f, boardUsers, currentSelectInput });
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
