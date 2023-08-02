import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';

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
	let cardDivider = CardService.newDivider();

	let selectInput = createBoardSelector();

	if (boardOptions.length) {
		for (let b of boardOptions) {
			selectInput.addItem(b.label, b.value.toString(), false);
		}
	}

	const text = createHeaderTxt();
	let cardSection = CardService.newCardSection().addWidget(text).addWidget(cardDivider).addWidget(selectInput);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
