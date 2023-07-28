import createCardHeader from '../widgets/CardHeader';
import createCardFooterBtn from '../widgets/CardFooter';
import createTabs from '../widgets/Tabs';
import ParagraphText from '../widgets/ParagraphText';
import DecoratedText from '../widgets/DecoratedText';

import { concatenateDots, formatISODateString } from '../../utils';
import { MENU_TABS } from '../../constants';

export default function ItemUpdatesCard({ itemName, email, itemUpdatesList }) {
	return buildCard({ itemName, email, itemUpdatesList });
}

function buildCard({ itemName, email, itemUpdatesList }) {
	const CardHeader = createCardHeader({ itemName, email });
	const CardFooterBtn = createCardFooterBtn();
	const { BtnContactTab, BtnUpdatesTab } = createTabs({ activeTab: MENU_TABS.UPDATES });

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

	const itemListCardHeading = CardService.newTextParagraph().setText('All Updates:');
	const cardDivider = CardService.newDivider();

	const cardSectionUpdateBtn = CardService.newButtonSet().addButton(btnUpdateContact);

	const cardSection = CardService.newCardSection()
		.addWidget(CardHeader)
		.addWidget(cardDivider)
		.addWidget(sectionTabsList)
		.addWidget(UpdateInputBox)
		.addWidget(MyCheckbox)
		.addWidget(cardSectionUpdateBtn)
		.addWidget(cardDivider)
		.addWidget(itemListCardHeading);

	if (itemUpdatesList.length) {
		for (let item of itemUpdatesList) {
			const topLabel = concatenateDots(item.body, 240); // 240 characters...
			const { date } = formatISODateString(item.created_at);
			const bottomLabel = `${item.creator.name},     ${date}`;
			const decorated = DecoratedText({ topLabel, bottomLabel });
			cardSection.addWidget(decorated);
		}
	} else {
		const para = ParagraphText('No item updates found!');
		cardSection.addWidget(para);
	}

	const card = CardService.newCardBuilder()
		// .setHeader(CardHeader)
		.setFixedFooter(CardFooter)
		.addSection(cardSection)
		.build();
	return card;
}
