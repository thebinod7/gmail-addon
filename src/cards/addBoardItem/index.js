export default function addBoardItemCard() {
	const firstTimeMsg = CardService.newTextParagraph().setText('Add board item');

	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(firstTimeMsg))
		.build();
	return updatedCard;
}
