import { fieldOrderRealign, createFormInputByType, getDefaultValueByColumnType } from '../../utils';
import { BOARD_COLUMNS } from '../../constants';

export default function updateContactCard({ boardItem = null, dbResponse, boardUsers, strColumns }) {
	let widgets;
	let displayFields;

	const { item } = dbResponse;
	if (boardItem) {
		let valueAdded = getDefaultValueByColumnType(boardItem.column_values);
		const nameField = {
			id: BOARD_COLUMNS.NAME,
			type: BOARD_COLUMNS.NAME,
			title: 'Item Name',
			value: boardItem.name
		};
		displayFields = [...valueAdded, nameField];
	} else displayFields = item.column_values;

	const selectCols = strColumns.filter(f => f.type === 'color');

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Update Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(displayFields);
	console.log('OREDERED=>', ordered_fields);

	for (let f of ordered_fields) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		var _input = createFormInputByType({ input: f, boardUsers, currentSelectInput });
		if (_input) widgets = section.addWidget(_input);
	}

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	const formAction = CardService.newAction().setFunctionName('handleUpdateContact');
	const btnSubmit = CardService.newTextButton().setText('Submit').setOnClickAction(formAction);

	const card = CardService.newCardBuilder().addSection(section.addWidget(btnSubmit).addWidget(btnLogout)).build();

	return card;
}
