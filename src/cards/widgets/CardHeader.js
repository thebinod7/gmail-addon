export default function CardHeader({
	itemName = 'lorem ipsum',
	email = 'example@mail.com',
	imageUrl = 'https://source.unsplash.com/featured/320x180?nature&sig=8'
}) {
	const ICON_URL = 'https://app.addoffsite.com/img/icons/settings.png';
	let settingsAction = CardService.newAction().setFunctionName('handleSettingIconClick').setParameters({});

	let settingsBtn = CardService.newImageButton()
		.setIconUrl(ICON_URL)
		.setAltText('Settings')
		.setOnClickAction(settingsAction);

	let decoratedCard = CardService.newDecoratedText()
		.setText(itemName)
		.setBottomLabel(email)
		.setWrapText(true)
		.setButton(settingsBtn);

	return decoratedCard;
	return CardService.newCardHeader()
		.setTitle(itemName)
		.setSubtitle(email)
		.setImageUrl(imageUrl)
		.setImageStyle(CardService.ImageStyle.CIRCLE);
}
