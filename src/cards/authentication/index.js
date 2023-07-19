const OFFSITE_INSTALL_URL = process.env.MONDAY_SHARE_URL;

export default function authenticationCard() {
	const btnInstall = CardService.newTextButton()
		.setText('Install Monday')
		.setOpenLink(CardService.newOpenLink().setUrl(OFFSITE_INSTALL_URL).setOpenAs(CardService.OpenAs.FULL_SIZE))
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT);

	const btnAuth = CardService.newTextButton()
		.setText('Login to Monday')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLoginClick'));

	const msg = CardService.newTextParagraph().setText('Install Monday app if you are a first time user.');

	const updatedCard = CardService.newCardBuilder()
		.addSection(CardService.newCardSection().addWidget(msg).addWidget(btnInstall).addWidget(btnAuth))
		.build();
	return updatedCard;
}
