import { getBoardItemsFromSettingStr } from '../../utils/misc';

export default function DecoratedWithButton({ inputColumn = null }) {
	let currentConnectBoard = null;
	const title = inputColumn?.title || 'Board';
	if (inputColumn) {
		const { boardId } = getBoardItemsFromSettingStr(inputColumn);
		currentConnectBoard = boardId.toString();
	}

	let btnAction = CardService.newAction()
		.setFunctionName('handleAddConnectItemClick')
		.setParameters({ currentConnectBoard });

	let decoratedSection = CardService.newTextButton()
		.setText('Add')
		.setTextButtonStyle(CardService.TextButtonStyle.TEXT)
		.setOnClickAction(btnAction);

	let decoratedCard = CardService.newDecoratedText().setText(`Associate ${title}`).setButton(decoratedSection);

	return decoratedCard;
}
