import createCardHeader from '../widgets/CardHeader';
import createCardFooterBtn from '../widgets/CardFooter';
import createTabs from '../widgets/Tabs';

export default function ItemUpdatesCard({}) {
	return buildCard();
}

function buildCard() {
	const CardHeader = createCardHeader({ itemName: 'Item update', email: 'example@mail.com' });
	const CardFooterBtn = createCardFooterBtn();
	const { BtnContactTab, BtnUpdatesTab } = createTabs({ activeTab: 'Updates' });

	const CardFooter = CardService.newFixedFooter().setPrimaryButton(CardFooterBtn);
	const sectionTabsList = CardService.newButtonSet().addButton(BtnContactTab).addButton(BtnUpdatesTab);

	const TextInput1 = CardService.newTextInput().setFieldName('fieldName').setTitle('Item name').setMultiline(false);
	const TextInput2 = CardService.newTextInput().setFieldName('fieldName').setTitle('Item email').setMultiline(false);

	const updateContactAction = CardService.newAction().setFunctionName('TODO').setParameters({});

	const btnUpdateContact = CardService.newTextButton()
		.setText('Submit Updates')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(updateContactAction);

	const cardSectionUpdateBtn = CardService.newButtonSet().addButton(btnUpdateContact);

	const cardSection = CardService.newCardSection()
		.addWidget(sectionTabsList)
		.addWidget(TextInput1)
		.addWidget(TextInput2)
		.addWidget(cardSectionUpdateBtn);

	const card = CardService.newCardBuilder()
		.setHeader(CardHeader)
		.setFixedFooter(CardFooter)
		.addSection(cardSection)
		.build();
	return card;
}
