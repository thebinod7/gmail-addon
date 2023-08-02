import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';
import { SELECT_NULL } from '../../constants';

export default function UpdateSettingsCard({ currentBoard }) {
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
		return renderUI({ boardOptions, currentBoard });
	} catch (err) {
		console.log('UpdateSettingsCardErr=>', err);
	}
}

function renderUI({ boardOptions, currentBoard }) {
	console.log({ currentBoard });
	let cardDivider = CardService.newDivider();

	let selectInput = createBoardSelector();

	if (boardOptions.length) {
		selectInput.addItem('--Select--', SELECT_NULL, false);
		for (let b of boardOptions) {
			const selected = b.value.toString() === currentBoard;
			selectInput.addItem(b.label, b.value.toString(), selected);
		}
	} else selectInput.addItem('--Select--', SELECT_NULL, true);

	const text = createHeaderTxt();
	let cardSection = CardService.newCardSection().addWidget(text).addWidget(cardDivider).addWidget(selectInput);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
