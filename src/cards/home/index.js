export default function homepageCard() {
	const msg = CardService.newTextParagraph().setText('Welcome home! Please open gmail inbox item.');
	const updatedCard = CardService.newCardBuilder().addSection(CardService.newCardSection().addWidget(msg)).build();
	return updatedCard;
}
