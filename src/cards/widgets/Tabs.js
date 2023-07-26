import { MENU_TABS } from '../../constants';

export default function CardFooter({ activeTab = MENU_TABS.CONTACT }) {
	const contactTabAction = CardService.newAction().setFunctionName('handleContactTabClick').setParameters({});

	let btnContactTab = CardService.newTextButton()
		.setText('Contact')
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED)
		.setBackgroundColor(activeTab === MENU_TABS.CONTACT ? '#fbbc04' : '#F3D07E')
		.setOnClickAction(contactTabAction);

	const updateTabAction = CardService.newAction().setFunctionName('handleUpdateTabClick').setParameters({});

	let btnUpdatesTab = CardService.newTextButton()
		.setText('Updates')
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED)
		.setBackgroundColor(activeTab === MENU_TABS.UPDATES ? '#fbbc04' : '#F3D07E')
		.setOnClickAction(updateTabAction);

	return { BtnContactTab: btnContactTab, BtnUpdatesTab: btnUpdatesTab };
}
