import createCardHeader from '../widgets/CardHeader';
import createCardFooterBtn from '../widgets/CardFooter';
import createTabs from '../widgets/Tabs';

import { fieldOrderRealign, createFormInputByType, getDefaultValueByColumnType } from '../../utils';
import { BOARD_COLUMNS, MENU_TABS } from '../../constants';

export default function ViewContactCard({ boardItem = null, dbResponse, strColumns, boardUsers }) {
	let displayFields;

	if (boardItem) {
		let valueAdded = getDefaultValueByColumnType(boardItem.column_values);
		const nameField = {
			id: BOARD_COLUMNS.NAME,
			type: BOARD_COLUMNS.NAME,
			title: 'Item Name',
			value: boardItem.name
		};
		displayFields = [...valueAdded, nameField];
	} else {
		const { item } = dbResponse;
		displayFields = item.column_values;
	}

	const selectCols = strColumns.filter(f => f.type === 'color');
	const orderedFields = fieldOrderRealign(displayFields);
	return buildCard({ selectCols, orderedFields, boardUsers });
}

function getEmailAndItemName(fields) {
	const nameField = fields.find(f => f.type === BOARD_COLUMNS.NAME);
	const emailFields = fields.filter(f => f.type === BOARD_COLUMNS.EMAIL);
	const itemName = nameField?.value || '';
	const email = emailFields.length ? emailFields[0].value : '';
	return { itemName, email };
}

function buildCard({ selectCols, orderedFields, boardUsers }) {
	console.log('Ordered=====>', orderedFields);
	let widgets;
	const { itemName, email } = getEmailAndItemName(orderedFields);

	const CardHeader = createCardHeader({ itemName, email });
	const CardFooterBtn = createCardFooterBtn();
	const { BtnContactTab, BtnUpdatesTab } = createTabs({ activeTab: MENU_TABS.CONTACT });

	let cardSection = CardService.newCardSection();

	const CardFooter = CardService.newFixedFooter().setPrimaryButton(CardFooterBtn);
	const sectionTabsList = CardService.newButtonSet().addButton(BtnContactTab).addButton(BtnUpdatesTab);

	const updateContactAction = CardService.newAction().setFunctionName('handleUpdateContact').setParameters({});

	const btnUpdateContact = CardService.newTextButton()
		.setText('Update Contact')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(updateContactAction);

	const cardSectionUpdateBtn = CardService.newButtonSet().addButton(btnUpdateContact);

	cardSection.addWidget(sectionTabsList);

	for (let f of orderedFields) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		let _input = createFormInputByType({ input: f, boardUsers, currentSelectInput });
		if (_input) widgets = cardSection.addWidget(_input);
	}

	const card = CardService.newCardBuilder()
		.setHeader(CardHeader)
		.setFixedFooter(CardFooter)
		.addSection(cardSection.addWidget(cardSectionUpdateBtn))
		.build();
	return card;
}
