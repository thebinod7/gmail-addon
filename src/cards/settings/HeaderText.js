export default function HeaderText() {
	let decoratedText = CardService.newDecoratedText()
		.setText('Now you can map your Contacts Board for saving contacts directly from Gmail.')
		.setWrapText(true);
	return decoratedText;
}
