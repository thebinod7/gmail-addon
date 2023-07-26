export default function CardFooter() {
	let cardFooterAction = CardService.newAction().setFunctionName('handleViewItemClick').setParameters({});

	const cardFooterBtn = CardService.newTextButton().setText('View Item').setOnClickAction(cardFooterAction);

	return cardFooterBtn;
}
