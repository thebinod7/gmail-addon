import { fieldOrderRealign, createFormInputByType, appendEmailAndItemName } from '../../utils';
import { BOARD_COLUMNS } from '../../constants';
import DecoratedWithButton from '../widgets/DecoratedWithButton';

const { COLOR, BOARD_RELATION } = BOARD_COLUMNS;

export default function saveContactCard({ email, itemName, allowedFields, boardUsers, strColumns }) {
	const selectCols = strColumns.filter(f => f.type === COLOR);
	const connectCols = strColumns.filter(f => f.type === BOARD_RELATION);

	const cardDivider = CardService.newDivider();
	const section = CardService.newCardSection().setHeader('Save Contact').addWidget(cardDivider);

	const ordered_fields = fieldOrderRealign(allowedFields);
	const appended = appendEmailAndItemName({ fields: ordered_fields, email, itemName });

	console.log('Appended_fields==>', appended);

	for (let f of appended) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		const currentConnectInput = selectCols.find(s => s.id === f.id);

		let _input = createFormInputByType({ input: f, boardUsers, currentSelectInput });
		if (_input) {
			if (f.type === BOARD_RELATION) {
				const divider = CardService.newDivider();
				const dc = DecoratedWithButton();
				section.addWidget(dc).addWidget(_input).addWidget(divider);
			} else section.addWidget(_input);
		}
	}

	const btnLogout = CardService.newTextButton()
		.setText('Logout')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLogoutClick'));

	const formAction = CardService.newAction().setFunctionName('handleSaveContact');
	const btnSubmit = CardService.newTextButton()
		.setText('Submit')
		.setOnClickAction(formAction)
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED);
	const card = CardService.newCardBuilder().addSection(section.addWidget(btnSubmit).addWidget(btnLogout)).build();

	return card;
}
