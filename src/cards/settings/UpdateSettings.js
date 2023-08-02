import { fetchBoardItems } from '../../services/monday';
import { getCurrentAccount } from '../../utils/localStorage';
import { filterBoardByUser, mapGroupsByBoard, filterSubitemBoards, mapBoardColumnsAndSelectOptions } from '../../utils';

import createHeaderTxt from './HeaderText';
import createBoardSelector from './BoardSelector';
import { SELECT_NULL } from '../../constants';
import createColumnSelector from '../widgets/BoardColumnSelector';

export default function UpdateSettingsCard({ currentBoard }) {
	try {
		// Fetch boards by userID
		const { id } = getCurrentAccount();
		const { data } = fetchBoardItems();
		const { boards } = filterBoardByUser(id, data);
		const mappedGroups = mapGroupsByBoard(boards);
		const filteredBoards = filterSubitemBoards(boards);
		const { mappedColumns, boardOptions } = mapBoardColumnsAndSelectOptions(filteredBoards);
		console.log('COLUMNS=>', mappedColumns[0].columns);
		// Render board select DROPDOWN
		// Fetch settings by accountID
		// If settings exist => Render form  fields with selectors
		// If board selected => Render form fields with selectors
		return renderUI({ boardOptions, currentBoard });
	} catch (err) {
		console.log('UpdateSettingsCardErr=>', err);
	}
}

function renderUI({ boardOptions, currentBoard }) {
	console.log({ currentBoard });
	let cardDivider = CardService.newDivider();

	let selectInput = createBoardSelector();
	const formAction = CardService.newAction().setFunctionName('handleSaveSettings');
	const btnSubmit = CardService.newTextButton()
		.setText('Submit')
		.setOnClickAction(formAction)
		.setTextButtonStyle(CardService.TextButtonStyle.FILLED);

	if (boardOptions.length) {
		selectInput.addItem('--Select--', SELECT_NULL, false);
		for (let b of boardOptions) {
			const selected = b.value.toString() === currentBoard;
			selectInput.addItem(b.label, b.value.toString(), selected);
		}
	} else selectInput.addItem('--Select--', SELECT_NULL, true);

	const text = createHeaderTxt();
	const columnSelector = createColumnSelector();

	let cardSection = CardService.newCardSection()
		.addWidget(text)
		.addWidget(cardDivider)
		.addWidget(selectInput)
		.addWidget(columnSelector)
		.addWidget(columnSelector)
		.addWidget(columnSelector)
		.addWidget(btnSubmit);

	let card = CardService.newCardBuilder().addSection(cardSection).build();
	return card;
}
