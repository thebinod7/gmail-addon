export default function DecoratedText({ topLabel = 'No label', bottomLabel = 'No label' }) {
	const decoratedText = CardService.newDecoratedText()
		.setText(topLabel)
		.setBottomLabel(bottomLabel)
		.setWrapText(true);
	return decoratedText;
}
