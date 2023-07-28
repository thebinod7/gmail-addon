import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';
import { SELECT_NULL } from '../../constants';

export default function SettingsCard() {
	try {
		// Fetch boards by userID
		const { id } = getCurrentAccount();
		const { data } = fetchBoardItems();
		const { boards } = filterBoardByUser(id, data);
		const mappedGroups = mapGroupsByBoard(boards);
		const filteredBoards = filterSubitemBoards(boards);
		const { mappedColumns, boardOptions } = mapBoardColumnsAndSelectOptions(filteredBoards);
		console.log('MappedCols=>', mappedColumns);
		console.log('BoardOpts==>', boardOptions);
		// Render board select DROPDOWN
		// Fetch settings by accountID
		// If settings exist => Render form with selectors
		// If board selected => Render fields with selectors
		return newSettingsCard({ boardOptions });
	} catch (err) {
		console.log('SettingsCardErr=>', err);
	}
}

function newSettingsCard({ boardOptions }) {
	let decoratedText = CardService.newDecoratedText()
		.setText('Now you can map your Contacts Board for saving contacts directly from Gmail.')
		.setWrapText(true);

	let cardDivider = CardService.newDivider();

	const dropdownAction = CardService.newAction()
		.setFunctionName('handleMondayBoardChange')
		.setParameters({ msg: 'Hello' });

	let selectInput = CardService.newSelectionInput()
		.setFieldName('selectedMondayBoard')
		.setTitle('Monday Boards')
		.setOnChangeAction(dropdownAction)
		.setType(CardService.SelectionInputType.DROPDOWN)
		.addItem('--Select--', SELECT_NULL, true);

	if (boardOptions.length) {
		for (let b of boardOptions) {
			selectInput.addItem(b.label, b.id, false);
		}
	}

	let cardSection = CardService.newCardSection()
		.addWidget(decoratedText)
		.addWidget(cardDivider)
		.addWidget(selectInput);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
