export default function showMsgCard(myMessage = 'No message provided!') {
	const msg = CardService.newTextParagraph().setText(myMessage);
	const updatedCard = CardService.newCardBuilder().addSection(CardService.newCardSection().addWidget(msg)).build();
	return updatedCard;
}
