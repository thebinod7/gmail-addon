export default function addBoardItemCard({ currentConnectBoard }) {
	// Fetch board columns
	// Display form
	// Save form data
	return renderUI();
}

function renderUI() {
	const firstTimeMsg = CardService.newTextParagraph().setText('Add board item');

	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(firstTimeMsg))
		.build();
	return updatedCard;
}
