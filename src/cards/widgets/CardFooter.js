import { getItemId, getCurrentBoardAndItem, getCurrentAccount } from '../../utils/localStorage';

export default function CardFooter() {
	const itemId = getItemId();
	const { boardId } = getCurrentBoardAndItem();
	const d = getCurrentAccount();
	const accountSlug = d && d.account ? d.account.slug : '404';
	const url = `https://${accountSlug}.monday.com/boards/${boardId}/pulses/${itemId}`;

	return CardService.newTextButton().setText('View Item').setOpenLink(CardService.newOpenLink().setUrl(url));
}
