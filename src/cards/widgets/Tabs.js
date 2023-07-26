export default function CardFooter({ activeTab = 'Contact' }) {
	const contactTabAction = CardService.newAction().setFunctionName('handleContactTabClick').setParameters({});

	let btnContactTab = CardService.newTextButton()
		.setText('Contact')
		.setTextButtonStyle(
			activeTab === 'Contact' ? CardService.TextButtonStyle.FILLED : CardService.TextButtonStyle.TEXT
		)
		.setOnClickAction(contactTabAction);

	const updateTabAction = CardService.newAction().setFunctionName('handleUpdateTabClick').setParameters({});

	let btnUpdatesTab = CardService.newTextButton()
		.setText('Updates')
		.setTextButtonStyle(
			activeTab === 'Updates' ? CardService.TextButtonStyle.FILLED : CardService.TextButtonStyle.TEXT
		)
		.setOnClickAction(updateTabAction);

	return { BtnContactTab: btnContactTab, BtnUpdatesTab: btnUpdatesTab };
}
