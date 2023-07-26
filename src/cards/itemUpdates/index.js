import createCardHeader from '../widgets/CardHeader';
import createCardFooterBtn from '../widgets/CardFooter';
import createTabs from '../widgets/Tabs';

export default function ItemUpdatesCard({ itemName, email }) {
	return buildCard({ itemName, email });
}

function buildCard({ itemName, email }) {
	const CardHeader = createCardHeader({ itemName, email });
	const CardFooterBtn = createCardFooterBtn();
	const { BtnContactTab, BtnUpdatesTab } = createTabs({ activeTab: 'Updates' });

	const CardFooter = CardService.newFixedFooter().setPrimaryButton(CardFooterBtn);
	const sectionTabsList = CardService.newButtonSet().addButton(BtnContactTab).addButton(BtnUpdatesTab);

	const UpdateInputBox = CardService.newTextInput()
		.setFieldName('updateText')
		.setTitle('New Update')
		.setMultiline(true);

	const MyCheckbox = CardService.newSelectionInput()
		.setFieldName('selectEmailContent')
		.setTitle('')
		.setType(CardService.SelectionInputType.CHECK_BOX)
		.addItem('Add email content & URL', 'add_email_content', false);

	const updateContactAction = CardService.newAction().setFunctionName('handleItemUpdateClick');

	const btnUpdateContact = CardService.newTextButton()
		.setText('Submit')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(updateContactAction);

	const itemListCardHeading = CardService.newTextParagraph().setText('All updates!');
	const decoratedText = CardService.newDecoratedText()
		.setText('John Doe')
		.setBottomLabel('Software engineer, July 26th 2023, 1:12:30 pm')
		.setWrapText(true);

	const cardSectionUpdateBtn = CardService.newButtonSet().addButton(btnUpdateContact);

	const cardSection = CardService.newCardSection()
		.addWidget(sectionTabsList)
		.addWidget(UpdateInputBox)
		.addWidget(MyCheckbox)
		.addWidget(cardSectionUpdateBtn);

	const cardSection2 = CardService.newCardSection()
		.addWidget(itemListCardHeading)
		.addWidget(decoratedText)
		.addWidget(decoratedText);

	const card = CardService.newCardBuilder()
		.setHeader(CardHeader)
		.setFixedFooter(CardFooter)
		.addSection(cardSection)
		.addSection(cardSection2)
		.build();
	return card;
}
