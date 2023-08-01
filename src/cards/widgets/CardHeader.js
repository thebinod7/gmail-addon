export default function CardHeader({ itemName = 'lorem ipsum', email = '' }) {
	const ICON_URL = 'https://app.addoffsite.com/img/icons/settings.png';
	let settingsAction = CardService.newAction().setFunctionName('handleSettingIconClick').setParameters({});

	let settingsBtn = CardService.newImageButton()
		.setIconUrl(ICON_URL)
		.setAltText('Settings')
		.setOnClickAction(settingsAction);

	let decoratedCard = CardService.newDecoratedText().setText(itemName).setWrapText(true).setButton(settingsBtn);

	if (email) decoratedCard.setBottomLabel(email);

	return decoratedCard;
}
