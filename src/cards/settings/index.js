export default function SettingsCard() {
	const myParagraph = CardService.newTextParagraph().setText('Welcome to settings page!');

	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(myParagraph))
		.build();
	return updatedCard;
}
