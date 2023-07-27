export default function SuccessNotify({ message = 'Default notification message.' }) {
	let card = CardService.newCardBuilder();
	card.setHeader(CardService.newCardHeader().setTitle('Success'));

	const notification = CardService.newNotification().setText(message);
	const actionResponse = CardService.newActionResponseBuilder()
		.setNotification(notification)
		.setStateChanged(true)
		.build();
	return actionResponse;
}
