const OFFSITE_INSTALL_URL = process.env.MONDAY_SHARE_URL;

export default function authenticationCard() {
	const cardDivder = CardService.newDivider();

	const firstTimeMsg = CardService.newTextParagraph().setText('First time user?');

	const btnInstall = CardService.newTextButton()
		.setText('Install Monday')
		.setOpenLink(CardService.newOpenLink().setUrl(OFFSITE_INSTALL_URL).setOpenAs(CardService.OpenAs.FULL_SIZE))
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT);

	const btnAuth = CardService.newTextButton()
		.setText('Login to Monday')
		.setOnClickAction(CardService.newAction().setFunctionName('handleLoginClick'));

	const installedMsg = CardService.newTextParagraph().setText('Already installed?');

	const updatedCard = CardService.newCardBuilder()
		.addSection(
			CardService.newCardSection()
				.addWidget(firstTimeMsg)
				.addWidget(btnInstall)
				.addWidget(cardDivder)
				.addWidget(installedMsg)
				.addWidget(btnAuth)
		)
		.build();
	return updatedCard;
}
