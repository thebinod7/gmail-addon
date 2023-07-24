import { fieldOrderRealign, createFormInputByType } from '../../utils';

export default function updateContactCard({ dbResponse, boardUsers, strColumns }) {
	let widgets;

	const { item } = dbResponse;

	const selectCols = strColumns.filter(f => f.type === 'color');

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Update Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(item.column_values);

	for (let f of ordered_fields) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		var _input = createFormInputByType({ input: f, boardUsers, currentSelectInput });
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
