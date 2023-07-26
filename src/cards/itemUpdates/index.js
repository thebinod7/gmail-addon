import createCardHeader from '../widgets/CardHeader';

export default function ViewContactCard() {
	return buildCard();
}

function buildCard() {
	const CardHeader = createCardHeader({ itemName: 'Item update' });

	let cardFooter1Button1Action1 = CardService.newAction().setFunctionName('TODO').setParameters({});

	let cardFooter1Button1 = CardService.newTextButton()
		.setText('VIew Item')
		.setOnClickAction(cardFooter1Button1Action1);

	let cardFooter1 = CardService.newFixedFooter().setPrimaryButton(cardFooter1Button1);

	let cardSection1ButtonList1 = CardService.newButtonSet();

	let cardSection1ButtonList2Button1Action1 = CardService.newAction().setFunctionName('TODO').setParameters({});

	let cardSection1ButtonList2Button1 = CardService.newTextButton()
		.setText('Contact')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(cardSection1ButtonList2Button1Action1);

	let updateTabAction = CardService.newAction().setFunctionName('handleUpdateTabClick').setParameters({});

	let cardSection1ButtonList2Button2 = CardService.newTextButton()
		.setText('Updates')
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED)
		.setOnClickAction(updateTabAction);

	let cardSection1ButtonList2 = CardService.newButtonSet()
		.addButton(cardSection1ButtonList2Button1)
		.addButton(cardSection1ButtonList2Button2);

	let cardSection1TextInput1 = CardService.newTextInput()
		.setFieldName('fieldName')
		.setTitle('Text input')
		.setMultiline(false);

	let cardSection1TextInput2 = CardService.newTextInput()
		.setFieldName('fieldName')
		.setTitle('Text input')
		.setMultiline(false);

	let cardSection1ButtonList3Button1Action1 = CardService.newAction().setFunctionName('TODO').setParameters({});

	let cardSection1ButtonList3Button1 = CardService.newTextButton()
		.setText('Save')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(cardSection1ButtonList3Button1Action1);

	let cardSection1ButtonList3 = CardService.newButtonSet().addButton(cardSection1ButtonList3Button1);

	let cardSection1 = CardService.newCardSection()
		.addWidget(cardSection1ButtonList1)
		.addWidget(cardSection1ButtonList2)
		.addWidget(cardSection1TextInput1)
		.addWidget(cardSection1TextInput2)
		.addWidget(cardSection1ButtonList3);

	let card = CardService.newCardBuilder()
		.setHeader(CardHeader)
		.setFixedFooter(cardFooter1)
		.addSection(cardSection1)
		.build();
	return card;
}
