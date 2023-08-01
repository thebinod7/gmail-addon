import createCardHeader from '../widgets/CardHeader';
import createCardFooterBtn from '../widgets/CardFooter';
import createTabs from '../widgets/Tabs';
import DecoratedWithButton from '../widgets/DecoratedWithButton';

import { fieldOrderRealign, createFormInputByType, getDefaultValueByColumnType } from '../../utils';
import { BOARD_COLUMNS, MENU_TABS } from '../../constants';

const { NAME, EMAIL, COLOR, DROPDOWN, BOARD_RELATION } = BOARD_COLUMNS;

export default function ViewContactCard({ boardItem = null, allowedFields, dbResponse, strColumns, boardUsers }) {
	let displayFields;

	if (boardItem) {
		const pickedFields = pickAllowedFieldsOnly(allowedFields, boardItem.column_values);
		let valueAdded = getDefaultValueByColumnType(pickedFields);
		const nameField = {
			id: NAME,
			type: NAME,
			title: 'Item Name',
			value: boardItem.name
		};
		displayFields = [...valueAdded, nameField];
	} else {
		const { item } = dbResponse;
		displayFields = item.column_values;
	}

	const selectCols = strColumns.filter(f => f.type === COLOR);
	const dropdownCols = strColumns.filter(f => f.type === DROPDOWN);

	const orderedFields = fieldOrderRealign(displayFields);
	return buildCard({ selectCols, dropdownCols, orderedFields, boardUsers });
}

function getEmailAndItemName(fields) {
	const nameField = fields.find(f => f.type === NAME);
	const emailFields = fields.filter(f => f.type === EMAIL);
	const itemName = nameField?.value || '';
	const email = emailFields.length ? emailFields[0].value : '';
	return { itemName, email };
}

function buildCard({ selectCols, dropdownCols, orderedFields, boardUsers }) {
	const { itemName, email } = getEmailAndItemName(orderedFields);

	const CardHeader = createCardHeader({ itemName, email });
	const CardFooterBtn = createCardFooterBtn();
	const { BtnContactTab, BtnUpdatesTab } = createTabs({ activeTab: MENU_TABS.CONTACT });

	let cardSection = CardService.newCardSection();
	const CardDivider = CardService.newDivider();
	const CardFooter = CardService.newFixedFooter().setPrimaryButton(CardFooterBtn);

	const sectionTabsList = CardService.newButtonSet().addButton(BtnContactTab).addButton(BtnUpdatesTab);
	const updateContactAction = CardService.newAction().setFunctionName('handleUpdateContact').setParameters({});

	const btnUpdateContact = CardService.newTextButton()
		.setText('Submit')
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED)
		.setOnClickAction(updateContactAction);

	const cardSectionUpdateBtn = CardService.newButtonSet().addButton(btnUpdateContact);
	cardSection.addWidget(CardHeader).addWidget(CardDivider).addWidget(sectionTabsList);

	console.log('orderedFields===>', orderedFields);

	for (let f of orderedFields) {
		const currentSelectInput = selectCols.find(s => s.id === f.id);
		const currentDropdowCols = dropdownCols.find(d => d.id === f.id);

		let _input = createFormInputByType({
			input: f,
			boardUsers,
			currentSelectInput,
			currentDropdowCols
		});
		if (_input) {
			if (f.type === BOARD_RELATION) {
				const divider = CardService.newDivider();
				const dc = DecoratedWithButton({ inputColumn: f });
				cardSection.addWidget(dc).addWidget(_input).addWidget(divider);
			} else cardSection.addWidget(_input);
		}
	}

	const card = CardService.newCardBuilder()
		.setFixedFooter(CardFooter)
		.addSection(cardSection.addWidget(cardSectionUpdateBtn))
		.build();
	return card;
}

function pickAllowedFieldsOnly(allowedFields, allFields) {
	const result = [];
	for (let field of allFields) {
		const found = allowedFields.find(f => f.id === field.id);
		if (found) result.push(field);
	}
	return result;
}
