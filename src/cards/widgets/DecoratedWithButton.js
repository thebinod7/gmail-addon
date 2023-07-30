export default function DecoratedWithButton() {
	let btnAction = CardService.newAction().setFunctionName('handleAddConnectItemClick').setParameters({});

	let decoratedSection = CardService.newTextButton()
		.setText('Add')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(btnAction);

	let decoratedCard = CardService.newDecoratedText().setText('Associate Item').setButton(decoratedSection);

	return decoratedCard;
}
